"""SQLite-backed HistoryProvider — hybrid in-memory cache + flush to chat_messages table."""

from __future__ import annotations

import json
from collections.abc import Sequence
from typing import Any

from agent_framework import HistoryProvider, Message


class SqliteHistoryProvider(HistoryProvider):
    """History provider that caches in state['messages'] and flushes to SQLite on save."""

    def __init__(self) -> None:
        super().__init__("sqlite-history")

    async def get_messages(
        self,
        session_id: str | None,
        *,
        state: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> list[Message]:
        if state is None:
            return []

        cached = state.get("messages")
        if cached:
            return list(cached)

        if not session_id:
            return []

        from app.ticketing import ChatMessage, get_chat_session

        with get_chat_session() as db:
            rows = (
                db.query(ChatMessage)
                .filter(ChatMessage.session_id == session_id)
                .order_by(ChatMessage.id.asc())
                .all()
            )
            hydrated: list[Message] = []
            for r in rows:
                try:
                    content_obj = json.loads(r.content)
                except (ValueError, TypeError):
                    content_obj = r.content
                hydrated.append(
                    Message(
                        role=r.role,
                        contents=[content_obj] if not isinstance(content_obj, list) else content_obj,
                    )
                )

        state["messages"] = hydrated
        return list(hydrated)

    async def save_messages(
        self,
        session_id: str | None,
        messages: Sequence[Message],
        *,
        state: dict[str, Any] | None = None,
        **kwargs: Any,
    ) -> None:
        if state is None:
            return

        existing = state.get("messages", [])
        state["messages"] = [*existing, *messages]

        if not session_id:
            return

        from app.ticketing import ChatMessage, get_chat_session

        with get_chat_session() as db:
            for m in messages:
                try:
                    content_text = json.dumps([
                        c if isinstance(c, (str, int, float, bool)) else getattr(c, "text", str(c))
                        for c in (m.contents or [])
                    ])
                except (TypeError, ValueError):
                    content_text = str(m.contents)
                db.add(ChatMessage(session_id=session_id, role=str(m.role), content=content_text))
