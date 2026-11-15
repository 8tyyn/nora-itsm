from __future__ import annotations

from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from config import get_database_url
from models import AssignmentRule, Base

engine = create_engine(
    get_database_url(),
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)


@contextmanager
def db_session():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


def ensure_pgcrypto_extension() -> None:
    # Needed for gen_random_uuid() defaults
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto;"))


def ensure_database_schema() -> None:
    ensure_pgcrypto_extension()
    Base.metadata.create_all(bind=engine)
    seed_assignment_rules()


def seed_assignment_rules() -> None:
    defaults = (
        {
            "title": "NORA disabled account on PUR",
            "issue_description": "The issue concerns a disabled account in PUR and the caller needs access restored or a password change.",
            "assignment_group": "TI.DMI",
            "instructions": "Confirm the PUR disabled-account issue, ask about access, error message, start time, and impact, then recommend TI.DMI. Do not claim the account was reactivated or the password changed.",
        },
        {
            "title": "Arbza defective or damaged item",
            "issue_description": "The reported issue concerns a defective or damaged item associated with Arbza.",
            "assignment_group": "TI.ISC.OB",
            "instructions": "Clarify the item, what is wrong, when it was discovered, scope of impact, and any supporting details. Do not assume the technical cause.",
        },
        {
            "title": "Printer redirection issue",
            "issue_description": "The issue concerns printer redirection.",
            "assignment_group": "TI.DEP",
            "instructions": "Ask which application or remote environment and printer are affected, whether it is visible/selectable, scope of impact, previous success, and any error message.",
        },
    )
    with db_session() as session:
        if session.query(AssignmentRule).count() > 0:
            return
        session.add_all(AssignmentRule(**rule) for rule in defaults)
