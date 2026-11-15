from __future__ import annotations

import datetime as dt
import uuid

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    name: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    password_hash: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), nullable=False, server_default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")

    conversations: Mapped[list[Conversation]] = relationship(back_populates="user", cascade="all, delete-orphan")  # type: ignore[name-defined]
    incidents: Mapped[list[Incident]] = relationship(back_populates="user", foreign_keys="Incident.user_id", cascade="all, delete-orphan")  # type: ignore[name-defined]
    caller_incidents: Mapped[list[Incident]] = relationship(back_populates="caller", foreign_keys="Incident.caller_user_id")  # type: ignore[name-defined]
    assigned_incidents: Mapped[list[Incident]] = relationship(back_populates="assignee", foreign_keys="Incident.assigned_to_user_id")  # type: ignore[name-defined]
    admin_profile: Mapped[Admin | None] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan")  # type: ignore[name-defined]

    __table_args__ = (
        CheckConstraint("role in ('user','admin')", name="users_role_check"),
    )


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    display_name: Mapped[str | None] = mapped_column(String(255))
    permissions: Mapped[str] = mapped_column(String(1000), nullable=False, server_default="manage_users,manage_knowledge,view_audit_logs")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    user: Mapped[User] = relationship(back_populates="admin_profile")


class Client(Base):
    __tablename__ = "clients"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    name: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    password_hash: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")


class PendingAccount(Base):
    __tablename__ = "pending_accounts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    name: Mapped[str | None] = mapped_column(String(255))
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    account_type: Mapped[str] = mapped_column(String(20), nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        CheckConstraint("account_type in ('user','employee')", name="pending_accounts_type_check"),
    )


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    caller_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    assigned_to_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    external_id: Mapped[str | None] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    caller_name: Mapped[str | None] = mapped_column(String(255))
    application_service: Mapped[str | None] = mapped_column(String(255))
    category: Mapped[str | None] = mapped_column(String(100))
    subcategory: Mapped[str | None] = mapped_column(String(100))
    impact: Mapped[str] = mapped_column(String(30), nullable=False, server_default="single_user")
    urgency: Mapped[str] = mapped_column(String(30), nullable=False, server_default="medium")
    status: Mapped[str] = mapped_column(String(30), nullable=False, server_default="open")
    priority: Mapped[str] = mapped_column(String(20), nullable=False, server_default="medium")
    assignment_group: Mapped[str | None] = mapped_column(String(255))
    resolution: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship(back_populates="incidents", foreign_keys=[user_id])
    caller: Mapped[User | None] = relationship(back_populates="caller_incidents", foreign_keys=[caller_user_id])
    assignee: Mapped[User | None] = relationship(back_populates="assigned_incidents", foreign_keys=[assigned_to_user_id])
    conversations: Mapped[list[Conversation]] = relationship(back_populates="incident")
    notes: Mapped[list[IncidentNote]] = relationship(back_populates="incident", cascade="all, delete-orphan")  # type: ignore[name-defined]
    status_history: Mapped[list[IncidentStatusHistory]] = relationship(back_populates="incident", cascade="all, delete-orphan")  # type: ignore[name-defined]
    attachments: Mapped[list[IncidentAttachment]] = relationship(back_populates="incident", cascade="all, delete-orphan")  # type: ignore[name-defined]

    __table_args__ = (
        CheckConstraint("status in ('open','in_progress','resolved','closed')", name="incidents_status_check"),
        CheckConstraint("priority in ('low','medium','high','critical')", name="incidents_priority_check"),
        CheckConstraint("impact in ('single_user','multiple_users','site','multiple_sites','critical_service')", name="incidents_impact_check"),
        CheckConstraint("urgency in ('low','medium','high','critical')", name="incidents_urgency_check"),
        Index("ix_incidents_user_created_at", "user_id", "created_at"),
    )


class IncidentNote(Base):
    __tablename__ = "incident_notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    incident_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    author_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    incident: Mapped[Incident] = relationship(back_populates="notes")
    author: Mapped[User] = relationship(foreign_keys=[author_id])


class IncidentStatusHistory(Base):
    __tablename__ = "incident_status_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    incident_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    changed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    previous_status: Mapped[str | None] = mapped_column(String(30))
    new_status: Mapped[str] = mapped_column(String(30), nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    incident: Mapped[Incident] = relationship(back_populates="status_history")
    changer: Mapped[User] = relationship(foreign_keys=[changed_by])


class IncidentAttachment(Base):
    __tablename__ = "incident_attachments"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    incident_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=False)
    content_type: Mapped[str | None] = mapped_column(String(150))
    file_size: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    incident: Mapped[Incident] = relationship(back_populates="attachments")


class Conversation(Base):
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    incident_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("incidents.id", ondelete="SET NULL"))
    title: Mapped[str | None] = mapped_column(String(255), server_default="Nouvelle conversation")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    user: Mapped[User] = relationship(back_populates="conversations")
    incident: Mapped[Incident | None] = relationship(back_populates="conversations")
    messages: Mapped[list[Message]] = relationship(back_populates="conversation", cascade="all, delete-orphan")  # type: ignore[name-defined]

    __table_args__ = (
        Index("ix_conversations_user_updated_at", "user_id", "updated_at"),
    )


class Message(Base):
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"))
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    conversation: Mapped[Conversation] = relationship(back_populates="messages")

    __table_args__ = (
        CheckConstraint("role in ('user','assistant')", name="messages_role_check"),
        Index("ix_messages_conversation_created_at", "conversation_id", "created_at"),
    )


class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    source: Mapped[str | None] = mapped_column(String(255))
    storage_path: Mapped[str | None] = mapped_column(String(1000))
    chunk_count: Mapped[int] = mapped_column(Integer, nullable=False, server_default="0")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())


class AssignmentRule(Base):
    __tablename__ = "assignment_rules"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    issue_description: Mapped[str] = mapped_column(Text, nullable=False)
    assignment_group: Mapped[str] = mapped_column(String(255), nullable=False)
    instructions: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index("ix_assignment_rules_active", "is_active"),
    )


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    resource_type: Mapped[str | None] = mapped_column(String(100))
    resource_id: Mapped[str | None] = mapped_column(String(100))
    details: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[dt.datetime] = mapped_column(DateTime, server_default=func.now())

    __table_args__ = (
        Index("ix_audit_logs_actor_created_at", "actor_user_id", "created_at"),
    )
