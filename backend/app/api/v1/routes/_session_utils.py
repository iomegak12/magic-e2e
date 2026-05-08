"""Helpers shared by chat + session routes."""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Any

from app.agent.factory import AgentBundle


@dataclass
class AgentSession:
    """Wraps the framework session object so we can carry the id around."""

    id: str
    session: Any


def get_or_create_session(
    bundle: AgentBundle,
    sessions: dict[str, AgentSession],
    session_id: str | None,
) -> AgentSession:
    if session_id and session_id in sessions:
        return sessions[session_id]

    fresh = bundle.agent.create_session()
    fid = (
        session_id
        or getattr(fresh, "session_id", None)
        or getattr(fresh, "id", None)
        or str(uuid.uuid4())
    )
    if hasattr(fresh, "session_id"):
        try:
            fresh.session_id = fid  # type: ignore[attr-defined]
        except Exception:  # noqa: BLE001
            pass
    if hasattr(fresh, "id"):
        try:
            fresh.id = fid  # type: ignore[attr-defined]
        except Exception:  # noqa: BLE001
            pass

    wrapper = AgentSession(id=fid, session=fresh)
    sessions[fid] = wrapper
    return wrapper
