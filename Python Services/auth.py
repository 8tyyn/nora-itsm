from __future__ import annotations

import datetime as dt
import uuid

import bcrypt
import jwt
from flask import Request

from config import get_jwt_exp_minutes, get_jwt_secret


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def create_access_token(account_id: uuid.UUID, account_type: str = "user") -> str:
    now = dt.datetime.utcnow()
    exp = now + dt.timedelta(minutes=get_jwt_exp_minutes())
    payload = {
        "sub": str(account_id),
        "account_type": account_type,
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, get_jwt_secret(), algorithm="HS256")


def get_bearer_token(request: Request) -> str | None:
    auth = request.headers.get("Authorization", "")
    if not auth:
        return None
    parts = auth.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip() or None


def decode_token(token: str) -> uuid.UUID:
    payload = jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])
    sub = payload.get("sub")
    if not sub:
        raise jwt.InvalidTokenError("Missing sub")
    return uuid.UUID(sub)


def decode_account_type(token: str) -> str:
    payload = jwt.decode(token, get_jwt_secret(), algorithms=["HS256"])
    account_type = payload.get("account_type", "user")
    if account_type not in {"user", "client"}:
        raise jwt.InvalidTokenError("Invalid account type")
    return account_type
