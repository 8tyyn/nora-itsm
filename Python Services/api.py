from __future__ import annotations

import re
import uuid
import datetime as dt
from pathlib import Path

import jwt
from flask import Blueprint, jsonify, request, send_file
from werkzeug.utils import secure_filename
from sqlalchemy import func

from auth import create_access_token, decode_account_type, decode_token, get_bearer_token, hash_password, verify_password
from db import db_session
from models import AssignmentRule, Client, Conversation, Incident, IncidentAttachment, IncidentNote, IncidentStatusHistory, KnowledgeDocument, Message, PendingAccount, User
from rag import RAGService

api = Blueprint("api", __name__)
rag_service = RAGService()
INCIDENT_UPLOAD_DIR = Path(__file__).resolve().parent / "rag_data" / "incident_attachments"
APPLICATION_LABEL_PATTERN = re.compile(
    r"(?im)^\s*(?:suggested\s+application(?:\s*/\s*service)?|application(?:\s*/\s*service)?|affected application(?:, service, or device)?)\s*:\s*(.+?)\s*$"
)


def _extract_application_names(contents: list[str]) -> list[str]:
    applications = []
    for content in contents:
        for match in APPLICATION_LABEL_PATTERN.finditer(content):
            application = match.group(1).strip().strip("`*_")
            if application and application.lower() not in {"not provided", "n/a", "none"}:
                applications.append(application)
    return applications


def _current_user_id() -> uuid.UUID:
    token = get_bearer_token(request)
    if not token:
        raise PermissionError("Missing token")
    return decode_token(token)


def _auth_error(message: str, status: int = 401):
    return jsonify({"error": message}), status


def _require_admin():
    try:
        admin_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return None, _auth_error("unauthorized")
    return admin_id, None


def _is_admin(session, user_id):
    admin = session.get(User, user_id)
    return admin if admin and admin.is_active and admin.role == "admin" else None


def _serialize_incident(incident: Incident) -> dict:
    creator_name = incident.user.name or incident.user.email
    caller_name = incident.caller.name if incident.caller else incident.caller_name
    assignee_name = incident.assignee.name or incident.assignee.email if incident.assignee else None
    return {
        "id": str(incident.id),
        "number": incident.external_id or f"INC-{str(incident.id)[:8].upper()}",
        "title": incident.title,
        "description": incident.description,
        "creator_id": str(incident.user_id),
        "creator_name": creator_name,
        "caller_user_id": str(incident.caller_user_id) if incident.caller_user_id else None,
        "caller_name": caller_name,
        "assigned_to_user_id": str(incident.assigned_to_user_id) if incident.assigned_to_user_id else None,
        "assigned_to_name": assignee_name,
        "application_service": incident.application_service,
        "category": incident.category,
        "subcategory": incident.subcategory,
        "impact": incident.impact,
        "urgency": incident.urgency,
        "priority": incident.priority,
        "status": incident.status,
        "assignment_group": incident.assignment_group,
        "resolution": incident.resolution,
        "created_at": incident.created_at.isoformat() if incident.created_at else None,
        "updated_at": incident.updated_at.isoformat() if incident.updated_at else None,
        "notes": [
            {
                "id": str(note.id),
                "content": note.content,
                "author_id": str(note.author_id),
                "author_name": note.author.name or note.author.email,
                "created_at": note.created_at.isoformat() if note.created_at else None,
            }
            for note in sorted(incident.notes, key=lambda item: item.created_at or dt.datetime.min)
        ],
        "status_history": [
            {
                "id": str(item.id),
                "previous_status": item.previous_status,
                "new_status": item.new_status,
                "changed_by_name": item.changer.name or item.changer.email,
                "created_at": item.created_at.isoformat() if item.created_at else None,
            }
            for item in sorted(incident.status_history, key=lambda item: item.created_at or dt.datetime.min)
        ],
        "attachments": [
            {"id": str(item.id), "file_name": item.file_name, "content_type": item.content_type, "file_size": item.file_size}
            for item in incident.attachments
        ],
    }


def _incident_payload(data: dict) -> tuple[dict | None, str | None]:
    title = (data.get("title") or "").strip()
    if not title:
        return None, "title is required"
    allowed = {
        "title", "description", "caller_name", "caller_user_id", "assigned_to_user_id",
        "application_service", "category", "subcategory", "impact", "urgency", "priority",
        "assignment_group", "resolution",
    }
    payload = {key: (data.get(key) or "").strip() or None for key in allowed if key in data}
    payload["title"] = title
    for field, values in {
        "impact": {"single_user", "multiple_users", "site", "multiple_sites", "critical_service"},
        "urgency": {"low", "medium", "high", "critical"},
        "priority": {"low", "medium", "high", "critical"},
    }.items():
        if field in payload and payload[field] not in values:
            return None, f"invalid {field}"
    return payload, None


def _incident_for_user(session, incident_id: uuid.UUID, user_id: uuid.UUID, admin: bool = False):
    incident = session.get(Incident, incident_id)
    if incident and (admin or incident.user_id == user_id):
        return incident
    return None


def _validate_incident_users(session, payload: dict, creator_id: uuid.UUID) -> str | None:
    payload["caller_user_id"] = payload.get("caller_user_id") or creator_id
    for field in ("caller_user_id", "assigned_to_user_id"):
        value = payload.get(field)
        if not value:
            continue
        try:
            user_id = uuid.UUID(str(value))
        except ValueError:
            return f"invalid {field}"
        user = session.get(User, user_id)
        if not user or not user.is_active:
            return f"{field} must reference an active user"
        payload[field] = user_id
    caller = session.get(User, payload["caller_user_id"])
    payload["caller_name"] = caller.name or caller.email
    return None


@api.route("/api/auth/register", methods=["POST"])
def register():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    name = (data.get("name") or "").strip() or None
    account_type = (data.get("account_type") or "user").strip().lower()

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400
    if len(password) < 8:
        return jsonify({"error": "password must be at least 8 characters"}), 400
    if account_type not in {"user", "employee"}:
        return jsonify({"error": "account_type must be user or employee"}), 400

    with db_session() as session:
        existing = (
            session.query(User).filter(User.email == email).first()
            or session.query(Client).filter(Client.email == email).first()
            or session.query(PendingAccount).filter(PendingAccount.email == email).first()
        )
        if existing:
            return jsonify({"error": "email already exists"}), 409

        session.add(PendingAccount(
            email=email,
            name=name,
            password_hash=hash_password(password),
            account_type=account_type,
        ))
        return jsonify({
            "pending": True,
            "message": "Your account is awaiting administrator approval.",
        }), 202


@api.route("/api/auth/login", methods=["POST"])
def login():
    data = request.json or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "email and password are required"}), 400

    with db_session() as session:
        user = session.query(User).filter(User.email == email).first()
        client = session.query(Client).filter(Client.email == email).first() if not user else None
        account = user or client
        pending = session.query(PendingAccount).filter(PendingAccount.email == email).first() if not account else None
        if pending:
            return _auth_error("your account is awaiting administrator approval", 403)
        if not account or not account.password_hash or not account.is_active:
            return _auth_error("invalid credentials")

        if not verify_password(password, account.password_hash):
            return _auth_error("invalid credentials")

        account_type = "client" if client else "user"
        token = create_access_token(account.id, account_type)
        return jsonify({
            "token": token,
            "user": {
                "id": str(account.id),
                "email": account.email,
                "name": account.name,
                "role": "client" if client else account.role,
            },
        })


@api.route("/api/me", methods=["GET"])
def me():
    try:
        user_id = _current_user_id()
        token = get_bearer_token(request)
        account_type = decode_account_type(token) if token else "user"
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        account = session.get(Client if account_type == "client" else User, user_id)
        if not account:
            return _auth_error("unauthorized")
        if not account.is_active:
            return _auth_error("account is inactive")
        return jsonify({
            "id": str(account.id),
            "email": account.email,
            "name": account.name,
            "role": "client" if account_type == "client" else account.role,
        })


@api.route("/api/me", methods=["PUT"])
def update_me():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    data = request.json or {}
    name = (data.get("name") or "").strip() or None
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "email is required"}), 400

    with db_session() as session:
        user = session.get(User, user_id)
        if not user or not user.is_active:
            return _auth_error("unauthorized")
        duplicate = session.query(User).filter(User.email == email, User.id != user_id).first()
        if duplicate:
            return jsonify({"error": "email already exists"}), 409
        user.name = name
        user.email = email
        return jsonify({"user": {"id": str(user.id), "email": user.email, "name": user.name, "role": user.role}})


@api.route("/api/me/password", methods=["POST"])
def change_password():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    data = request.json or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""
    if not current_password or not new_password:
        return jsonify({"error": "current_password and new_password are required"}), 400
    if len(new_password) < 8:
        return jsonify({"error": "password must be at least 8 characters"}), 400

    with db_session() as session:
        user = session.get(User, user_id)
        if not user or not user.password_hash or not verify_password(current_password, user.password_hash):
            return _auth_error("current password is incorrect", 400)
        user.password_hash = hash_password(new_password)
        return jsonify({"ok": True})


@api.route("/api/client/request-assistant", methods=["POST", "OPTIONS"])
def client_request_assistant():
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        token = get_bearer_token(request)
        account_type = decode_account_type(token) if token else None
        account_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    if account_type not in {"client", "user"}:
        return _auth_error("request assistant access required", 403)

    with db_session() as session:
        account = session.get(Client if account_type == "client" else User, account_id)
        if not account or not account.is_active:
            return _auth_error("unauthorized")
        if account_type == "user" and account.role != "admin":
            return _auth_error("request assistant access required", 403)

    data = request.json or {}
    question = (data.get("question") or "").strip()
    requester = (data.get("requester") or "").strip()
    request_type = (data.get("request_type") or "").strip()
    if not question:
        return jsonify({"error": "question is required"}), 400

    from app import create_chat_completion

    system_prompt = """You are the client Request Assistant. Answer only questions about adding,
deleting, or removing a person from a distribution list.

Tell the client to submit the request through Free-Service at https://google.com.
Give clear numbered steps. Always state that the distribution list name is required
in the request description. They must include the person's full name and email address.

For every other topic, reply exactly:
For now, I can only help with adding or deleting someone from a distribution list.

Never mention assignment groups, incident priorities, ServiceNow routing, internal
knowledge, troubleshooting, or any other assistant capability. Do not invent Free-Service
options that were not provided. Keep the response concise and professional."""

    try:
        completion = create_chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": (
                        f"Request type: {request_type or 'not specified'}\n"
                        f"Request for: {requester or 'not specified'}\n"
                        f"Client question: {question}"
                    ),
                },
            ],
            temperature=0.2,
            max_tokens=350,
        )
        reply = (completion.choices[0].message.content or "").strip()
        if not reply:
            raise RuntimeError("The request assistant returned an empty response")
        return jsonify({"reply": reply})
    except Exception as exc:
        print(f"[Client Request Assistant Error]: {exc}")
        return jsonify({"error": "The request assistant is temporarily unavailable"}), 502


@api.route("/api/admin/users", methods=["GET"])
def admin_users():
    admin_id, error = _require_admin()
    if error:
        return error

    with db_session() as session:
        if not _is_admin(session, admin_id):
            return _auth_error("admin access required", 403)
        users = session.query(User).order_by(User.created_at.desc()).all()
        return jsonify([
            {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
            }
            for user in users
        ])


@api.route("/api/admin/pending-accounts", methods=["GET"])
def admin_pending_accounts():
    admin_id, error = _require_admin()
    if error:
        return error

    with db_session() as session:
        if not _is_admin(session, admin_id):
            return _auth_error("admin access required", 403)
        pending = session.query(PendingAccount).order_by(PendingAccount.created_at.asc()).all()
        return jsonify([
            {
                "id": str(account.id),
                "name": account.name,
                "email": account.email,
                "account_type": account.account_type,
                "created_at": account.created_at.isoformat() if account.created_at else None,
            }
            for account in pending
        ])


@api.route("/api/admin/pending-accounts/<uuid:pending_id>/approve", methods=["POST"])
def approve_pending_account(pending_id: uuid.UUID):
    try:
        admin_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        admin = session.get(User, admin_id)
        if not admin or not admin.is_active or admin.role != "admin":
            return _auth_error("admin access required", 403)

        pending = session.get(PendingAccount, pending_id)
        if not pending:
            return jsonify({"error": "pending account not found"}), 404
        if session.query(User).filter(User.email == pending.email).first() or session.query(Client).filter(Client.email == pending.email).first():
            return jsonify({"error": "an account with this email already exists"}), 409

        if pending.account_type == "employee":
            account = Client(
                email=pending.email,
                name=pending.name,
                password_hash=pending.password_hash,
                is_active=True,
            )
        else:
            account = User(
                email=pending.email,
                name=pending.name,
                password_hash=pending.password_hash,
                role="user",
                is_active=True,
            )
        session.add(account)
        session.delete(pending)
        return jsonify({"message": "Account approved"})


@api.route("/api/admin/pending-accounts/<uuid:pending_id>/reject", methods=["POST"])
def reject_pending_account(pending_id: uuid.UUID):
    try:
        admin_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        admin = session.get(User, admin_id)
        if not admin or not admin.is_active or admin.role != "admin":
            return _auth_error("admin access required", 403)
        pending = session.get(PendingAccount, pending_id)
        if not pending:
            return jsonify({"error": "pending account not found"}), 404
        session.delete(pending)
        return jsonify({"message": "Account rejected"})


@api.route("/api/admin/overview", methods=["GET"])
def admin_overview():
    admin_id, error = _require_admin()
    if error:
        return error

    with db_session() as session:
        if not _is_admin(session, admin_id):
            return _auth_error("admin access required", 403)

        assignment_group_stats = []
        assignment_groups = [group for group, in session.query(AssignmentRule.assignment_group).filter(AssignmentRule.is_active.is_(True)).distinct().all()]
        for assignment_group in assignment_groups:
            matching_messages = (
                session.query(Message.content)
                .filter(
                    Message.role == "assistant",
                    func.lower(Message.content).like(f"%{assignment_group.lower()}%"),
                )
                .all()
            )
            application_counts: dict[str, int] = {}
            for content, in matching_messages:
                for application in _extract_application_names([content]):
                    application_counts[application] = application_counts.get(application, 0) + 1

            assignment_group_stats.append({
                "group": assignment_group,
                "count": len(matching_messages),
                "applications": [
                    {"name": name, "count": count}
                    for name, count in sorted(
                        application_counts.items(),
                        key=lambda item: (-item[1], item[0].lower()),
                    )
                ],
            })

        return jsonify({
            "users": session.query(func.count(User.id)).scalar() or 0,
            "conversations": session.query(func.count(Conversation.id)).scalar() or 0,
            "messages": session.query(func.count(Message.id)).scalar() or 0,
            "knowledge_documents": session.query(func.count(KnowledgeDocument.id)).scalar() or 0,
            "assignment_group_stats": assignment_group_stats,
        })


def _serialize_assignment_rule(rule: AssignmentRule) -> dict:
    return {
        "id": str(rule.id),
        "title": rule.title,
        "issue_description": rule.issue_description,
        "assignment_group": rule.assignment_group,
        "instructions": rule.instructions,
        "is_active": rule.is_active,
        "created_at": rule.created_at.isoformat() if rule.created_at else None,
        "updated_at": rule.updated_at.isoformat() if rule.updated_at else None,
    }


@api.route("/api/admin/assignment-rules", methods=["GET", "POST"])
def admin_assignment_rules():
    admin_id, error = _require_admin()
    if error:
        return error

    with db_session() as session:
        if not _is_admin(session, admin_id):
            return _auth_error("admin access required", 403)
        if request.method == "GET":
            rules = session.query(AssignmentRule).order_by(AssignmentRule.created_at.asc()).all()
            return jsonify([_serialize_assignment_rule(rule) for rule in rules])

        data = request.json or {}
        title = (data.get("title") or "").strip()
        issue_description = (data.get("issue_description") or "").strip()
        assignment_group = (data.get("assignment_group") or "").strip()
        instructions = (data.get("instructions") or "").strip() or None
        if not title or not issue_description or not assignment_group:
            return jsonify({"error": "title, issue_description and assignment_group are required"}), 400
        rule = AssignmentRule(
            title=title,
            issue_description=issue_description,
            assignment_group=assignment_group,
            instructions=instructions,
            is_active=bool(data.get("is_active", True)),
        )
        session.add(rule)
        session.flush()
        return jsonify(_serialize_assignment_rule(rule)), 201


@api.route("/api/assignment-groups", methods=["GET"])
def assignment_groups():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")
    with db_session() as session:
        user = session.get(User, user_id)
        if not user or not user.is_active:
            return _auth_error("unauthorized")
        groups = (
            session.query(AssignmentRule.assignment_group)
            .filter(AssignmentRule.is_active.is_(True))
            .distinct()
            .order_by(AssignmentRule.assignment_group.asc())
            .all()
        )
        return jsonify([group for group, in groups])


@api.route("/api/incident-users", methods=["GET"])
def incident_users():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")
    with db_session() as session:
        current_user = session.get(User, user_id)
        if not current_user or not current_user.is_active:
            return _auth_error("unauthorized")
        users = session.query(User).filter(User.is_active.is_(True)).order_by(User.name.asc(), User.email.asc()).all()
        return jsonify([
            {"id": str(user.id), "name": user.name or user.email, "email": user.email, "role": user.role}
            for user in users
        ])


@api.route("/api/admin/assignment-rules/<uuid:rule_id>", methods=["PUT", "DELETE"])
def admin_assignment_rule(rule_id: uuid.UUID):
    admin_id, error = _require_admin()
    if error:
        return error

    with db_session() as session:
        if not _is_admin(session, admin_id):
            return _auth_error("admin access required", 403)
        rule = session.get(AssignmentRule, rule_id)
        if not rule:
            return jsonify({"error": "assignment rule not found"}), 404
        if request.method == "DELETE":
            session.delete(rule)
            return jsonify({"ok": True})

        data = request.json or {}
        title = (data.get("title") or "").strip()
        issue_description = (data.get("issue_description") or "").strip()
        assignment_group = (data.get("assignment_group") or "").strip()
        if not title or not issue_description or not assignment_group:
            return jsonify({"error": "title, issue_description and assignment_group are required"}), 400
        rule.title = title
        rule.issue_description = issue_description
        rule.assignment_group = assignment_group
        rule.instructions = (data.get("instructions") or "").strip() or None
        rule.is_active = bool(data.get("is_active", True))
        session.flush()
        return jsonify(_serialize_assignment_rule(rule))


@api.route("/api/incidents", methods=["GET", "POST"])
def incidents():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        user = session.get(User, user_id)
        if not user or not user.is_active:
            return _auth_error("unauthorized")
        if request.method == "GET":
            query = session.query(Incident)
            if user.role != "admin":
                query = query.filter(Incident.user_id == user_id)
            rows = query.order_by(Incident.updated_at.desc(), Incident.created_at.desc()).all()
            return jsonify([_serialize_incident(row) for row in rows])

        payload, error = _incident_payload(request.json or {})
        if error:
            return jsonify({"error": error}), 400
        error = _validate_incident_users(session, payload, user_id)
        if error:
            return jsonify({"error": error}), 400
        incident = Incident(user_id=user_id, **payload)
        session.add(incident)
        session.flush()
        session.add(IncidentStatusHistory(incident_id=incident.id, changed_by=user_id, previous_status=None, new_status=incident.status))
        return jsonify(_serialize_incident(incident)), 201


@api.route("/api/incidents/<uuid:incident_id>", methods=["GET", "PUT", "DELETE"])
def incident_detail(incident_id: uuid.UUID):
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        user = session.get(User, user_id)
        if not user or not user.is_active:
            return _auth_error("unauthorized")
        incident = _incident_for_user(session, incident_id, user_id, user.role == "admin")
        if not incident:
            return jsonify({"error": "incident not found"}), 404
        if request.method == "GET":
            return jsonify(_serialize_incident(incident))
        if request.method == "DELETE":
            if user.role != "admin" and incident.user_id != user_id:
                return _auth_error("admin access required", 403)
            session.delete(incident)
            return jsonify({"ok": True})

        update_data = dict(request.json or {})
        update_data.setdefault("title", incident.title)
        payload, error = _incident_payload(update_data)
        if error:
            return jsonify({"error": error}), 400
        if "caller_user_id" in payload or "assigned_to_user_id" in payload:
            error = _validate_incident_users(session, payload, incident.user_id)
            if error:
                return jsonify({"error": error}), 400
        if user.role != "admin" and "assigned_to_user_id" in payload:
            assignee_id = payload.get("assigned_to_user_id")
            if assignee_id and assignee_id != user_id:
                return jsonify({"error": "users may assign incidents only to themselves"}), 403
        if user.role != "admin" and "status" in (request.json or {}) and incident.assigned_to_user_id != user_id:
            return jsonify({"error": "assign the incident to yourself before changing its status"}), 403
        previous_status = incident.status
        for key, value in payload.items():
            setattr(incident, key, value)
        if "status" in (request.json or {}):
            new_status = (request.json.get("status") or "").strip()
            if new_status not in {"open", "in_progress", "resolved", "closed"}:
                return jsonify({"error": "invalid status"}), 400
            incident.status = new_status
        if incident.status != previous_status:
            session.add(IncidentStatusHistory(
                incident_id=incident.id,
                changed_by=user_id,
                previous_status=previous_status,
                new_status=incident.status,
            ))
        session.flush()
        return jsonify(_serialize_incident(incident))


@api.route("/api/incidents/<uuid:incident_id>/notes", methods=["POST"])
def add_incident_note(incident_id: uuid.UUID):
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        user = session.get(User, user_id)
        incident = _incident_for_user(session, incident_id, user_id, bool(user and user.role == "admin"))
        if not incident:
            return jsonify({"error": "incident not found"}), 404
        content = (request.json or {}).get("content", "").strip()
        if not content:
            return jsonify({"error": "content is required"}), 400
        note = IncidentNote(incident_id=incident.id, author_id=user_id, content=content)
        session.add(note)
        session.flush()
        return jsonify({"id": str(note.id), "content": note.content, "created_at": note.created_at.isoformat()}), 201


@api.route("/api/incidents/<uuid:incident_id>/attachments", methods=["POST"])
def upload_incident_attachment(incident_id: uuid.UUID):
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        user = session.get(User, user_id)
        incident = _incident_for_user(session, incident_id, user_id, bool(user and user.role == "admin"))
        if not incident:
            return jsonify({"error": "incident not found"}), 404
        uploaded_file = request.files.get("file")
        if not uploaded_file or not uploaded_file.filename:
            return jsonify({"error": "file is required"}), 400
        file_name = secure_filename(uploaded_file.filename)
        if not file_name:
            return jsonify({"error": "invalid file name"}), 400
        INCIDENT_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        stored_name = f"{uuid.uuid4()}-{file_name}"
        storage_path = INCIDENT_UPLOAD_DIR / stored_name
        uploaded_file.save(storage_path)
        attachment = IncidentAttachment(
            incident_id=incident.id,
            uploaded_by=user_id,
            file_name=file_name,
            storage_path=str(storage_path),
            content_type=uploaded_file.content_type,
            file_size=storage_path.stat().st_size,
        )
        session.add(attachment)
        session.flush()
        return jsonify({"id": str(attachment.id), "file_name": attachment.file_name, "file_size": attachment.file_size}), 201


@api.route("/api/incidents/<uuid:incident_id>/attachments/<uuid:attachment_id>", methods=["GET"])
def download_incident_attachment(incident_id: uuid.UUID, attachment_id: uuid.UUID):
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        user = session.get(User, user_id)
        incident = _incident_for_user(session, incident_id, user_id, bool(user and user.role == "admin"))
        attachment = session.get(IncidentAttachment, attachment_id)
        if not incident or not attachment or attachment.incident_id != incident.id:
            return jsonify({"error": "attachment not found"}), 404
        return send_file(attachment.storage_path, as_attachment=True, download_name=attachment.file_name)


@api.route("/api/conversations", methods=["GET"])
def list_conversations():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        rows = (
            session.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc(), Conversation.created_at.desc())
            .all()
        )
        return jsonify([
            {
                "id": str(c.id),
                "title": c.title,
                "created_at": c.created_at.isoformat() if c.created_at else None,
                "updated_at": c.updated_at.isoformat() if c.updated_at else None,
            }
            for c in rows
        ])


@api.route("/api/conversations", methods=["POST"])
def create_conversation():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    data = request.json or {}
    title = (data.get("title") or "Nouvelle conversation").strip() or "Nouvelle conversation"

    with db_session() as session:
        conv = Conversation(user_id=user_id, title=title)
        session.add(conv)
        session.flush()
        return jsonify({"id": str(conv.id), "title": conv.title}), 201


def _load_conversation_for_user(session, conversation_id: uuid.UUID, user_id: uuid.UUID) -> Conversation | None:
    return (
        session.query(Conversation)
        .filter(Conversation.id == conversation_id, Conversation.user_id == user_id)
        .first()
    )


@api.route("/api/conversations/<conversation_id>/messages", methods=["GET"])
def get_messages(conversation_id: str):
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    try:
        cid = uuid.UUID(conversation_id)
    except ValueError:
        return jsonify({"error": "invalid conversation id"}), 400

    with db_session() as session:
        conv = _load_conversation_for_user(session, cid, user_id)
        if not conv:
            return jsonify({"error": "not found"}), 404

        msgs = (
            session.query(Message)
            .filter(Message.conversation_id == cid)
            .order_by(Message.created_at.asc())
            .all()
        )
        return jsonify([
            {
                "id": str(m.id),
                "role": m.role,
                "content": m.content,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in msgs
        ])


@api.route("/api/conversations/<conversation_id>", methods=["DELETE"])
def delete_conversation(conversation_id: str):
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    try:
        cid = uuid.UUID(conversation_id)
    except ValueError:
        return jsonify({"error": "invalid conversation id"}), 400

    with db_session() as session:
        conv = _load_conversation_for_user(session, cid, user_id)
        if not conv:
            return jsonify({"error": "not found"}), 404
        session.delete(conv)
        return jsonify({"ok": True})


@api.route("/api/rag/upload", methods=["POST"])
def upload_rag_document():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    uploaded_file = request.files.get("file")
    if not uploaded_file:
        return jsonify({"error": "file is required"}), 400

    try:
        result = rag_service.ingest_document(
            filename=uploaded_file.filename or "document.txt",
            content=uploaded_file.read(),
            owner_user_id=str(user_id),
            source_label=request.form.get("source") or uploaded_file.filename or "document",
        )
        with db_session() as session:
            session.add(KnowledgeDocument(
                uploaded_by=user_id,
                name=uploaded_file.filename or "document",
                source=request.form.get("source") or uploaded_file.filename or "document",
                storage_path=result["document"],
                chunk_count=result["chunks"],
            ))
        return jsonify({"ok": True, "result": result})
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@api.route("/api/rag/status", methods=["GET"])
def rag_status():
    try:
        user_id = _current_user_id()
    except (PermissionError, jwt.InvalidTokenError):
        return _auth_error("unauthorized")

    with db_session() as session:
        documents = session.query(KnowledgeDocument).filter(
            KnowledgeDocument.uploaded_by == user_id,
            KnowledgeDocument.is_active.is_(True),
        ).count()
    return jsonify({
        "ok": True,
        "total_chunks": rag_service.document_count(owner_user_id=str(user_id)),
        "documents": documents,
        "owner": str(user_id),
    })
