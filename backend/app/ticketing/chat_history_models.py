"""Chat history & blocked-query persistence (separate SQLite database).

This module defines its OWN SQLAlchemy Base and engine pointed at
`db/chat_history.db` so it stays decoupled from the tickets database
defined in `database.py`.

Tables
------
- chat_messages      one row per message persisted by SqliteHistoryProvider
- blocked_queries    one row per query rejected by the input guardrail
"""

from __future__ import annotations

import os
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import DateTime, Integer, String, Text, create_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker

_CHAT_DB_URL = os.getenv("CHAT_HISTORY_DATABASE_URL", "sqlite:///./db/chat_history.db")

# Ensure the db/ directory exists for a local SQLite file path.
if _CHAT_DB_URL.startswith("sqlite:///"):
    _db_file = Path(_CHAT_DB_URL.replace("sqlite:///", ""))
    _db_file.parent.mkdir(parents=True, exist_ok=True)

chat_engine = create_engine(_CHAT_DB_URL, echo=False)
ChatSessionLocal = sessionmaker(bind=chat_engine)


class ChatBase(DeclarativeBase):
    pass


class ChatMessage(ChatBase):
    __tablename__ = "chat_messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )


class BlockedQuery(ChatBase):
    __tablename__ = "blocked_queries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(String(128), index=True, nullable=True)
    query: Mapped[str] = mapped_column(Text, nullable=False)
    matched_word: Mapped[str] = mapped_column(String(128), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )


def init_chat_history_db() -> None:
    """Create chat-history tables if they don't already exist."""
    ChatBase.metadata.create_all(bind=chat_engine)


@contextmanager
def get_chat_session():
    """Context-manager that yields a session and commits/rolls back automatically."""
    session: Session = ChatSessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
