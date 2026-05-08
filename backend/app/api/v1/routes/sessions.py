"""Session lifecycle + history retrieval."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException

from app.agent.factory import AgentBundle

from ..deps import get_agent_bundle, get_session_registry
from ..schemas import MessageOut, SessionCreateResponse
from ._session_utils import AgentSession, get_or_create_session

router = APIRouter()


@router.post("/sessions", response_model=SessionCreateResponse, status_code=201)
async def create_session(
    bundle: AgentBundle = Depends(get_agent_bundle),
    sessions: dict[str, AgentSession] = Depends(get_session_registry),
) -> SessionCreateResponse:
    sess = get_or_create_session(bundle, sessions, None)
    return SessionCreateResponse(session_id=sess.id)


@router.get("/sessions/{session_id}/messages", response_model=list[MessageOut])
async def get_messages(session_id: str) -> list[MessageOut]:
    try:
        from app.ticketing import ChatMessage, get_chat_session
    except ImportError as e:  # pragma: no cover
        raise HTTPException(status_code=500, detail=f"chat history backend unavailable: {e}") from e

    with get_chat_session() as db:
        rows = (
            db.query(ChatMessage)
            .filter(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.id.asc())
            .all()
        )
        return [
            MessageOut(
                role=r.role,
                content=r.content,
                created_at=getattr(r, "created_at", None),
            )
            for r in rows
        ]
