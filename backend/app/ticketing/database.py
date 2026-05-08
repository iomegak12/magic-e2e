"""Database engine, session factory, and lifecycle helpers (tickets DB)."""

from __future__ import annotations

import os
from contextlib import contextmanager
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./db/tickets.db")

# Ensure the db/ directory exists for a local SQLite file path.
if _DATABASE_URL.startswith("sqlite:///"):
    _db_file = Path(_DATABASE_URL.replace("sqlite:///", ""))
    _db_file.parent.mkdir(parents=True, exist_ok=True)

engine = create_engine(_DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    """Create all tables if they don't already exist."""
    from . import models as _models  # noqa: F401  # registers Ticket with Base

    Base.metadata.create_all(bind=engine)


@contextmanager
def get_session():
    """Context-manager that yields a session and commits/rolls back automatically."""
    session: Session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
