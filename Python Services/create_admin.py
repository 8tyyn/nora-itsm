from __future__ import annotations

import os

from dotenv import load_dotenv

from auth import hash_password
from db import db_session, ensure_database_schema
from models import Admin, User


def main() -> None:
    load_dotenv()
    email = (os.getenv("ADMIN_EMAIL") or "").strip().lower()
    password = os.getenv("ADMIN_PASSWORD") or ""
    name = (os.getenv("ADMIN_NAME") or "NORA Administrator").strip()

    if not email or not password:
        raise RuntimeError("Set ADMIN_EMAIL and ADMIN_PASSWORD before creating an admin.")
    if len(password) < 8:
        raise RuntimeError("ADMIN_PASSWORD must contain at least 8 characters.")

    ensure_database_schema()
    with db_session() as session:
        user = session.query(User).filter(User.email == email).first()
        if user:
            if user.role != "admin":
                user.role = "admin"
            user.name = name
            user.password_hash = hash_password(password)
            user.is_active = True
        else:
            user = User(
                email=email,
                name=name,
                password_hash=hash_password(password),
                role="admin",
                is_active=True,
            )
            session.add(user)
            session.flush()

        admin = session.query(Admin).filter(Admin.user_id == user.id).first()
        if not admin:
            session.add(Admin(user_id=user.id, display_name=name))

    print(f"NORA admin ready: {email}")


if __name__ == "__main__":
    main()
