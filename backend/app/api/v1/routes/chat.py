"""POST /chat (non-streaming) and POST /chat/stream (SSE)."""

from __future__ import annotations

import json
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends
from sse_starlette.sse import EventSourceResponse

from app.agent.factory import AgentBundle

from ..deps import get_agent_bundle, get_session_registry
from ..schemas import ChatRequest, ChatResponse
from ._session_utils import AgentSession, get_or_create_session

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    payload: ChatRequest,
    bundle: AgentBundle = Depends(get_agent_bundle),
    sessions: dict[str, AgentSession] = Depends(get_session_registry),
) -> ChatResponse:
    sess = get_or_create_session(bundle, sessions, payload.session_id)
    response = await bundle.agent.run(payload.message, session=sess.session)
    return ChatResponse(session_id=sess.id, response=str(response))


@router.post("/chat/stream")
async def chat_stream(
    payload: ChatRequest,
    bundle: AgentBundle = Depends(get_agent_bundle),
    sessions: dict[str, AgentSession] = Depends(get_session_registry),
) -> EventSourceResponse:
    sess = get_or_create_session(bundle, sessions, payload.session_id)

    async def event_iter() -> AsyncIterator[dict]:
        try:
            async for chunk in bundle.agent.run(
                payload.message, session=sess.session, stream=True
            ):
                if getattr(chunk, "text", None):
                    yield {
                        "event": "message",
                        "data": json.dumps(
                            {"session_id": sess.id, "delta": chunk.text}
                        ),
                    }
        finally:
            yield {"event": "done", "data": "[DONE]"}

    return EventSourceResponse(event_iter())
