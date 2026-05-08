"""FastAPI dependency helpers."""

from __future__ import annotations

from fastapi import HTTPException, Request

from app.agent.factory import AgentBundle


def get_agent_bundle(request: Request) -> AgentBundle:
    bundle: AgentBundle | None = getattr(request.app.state, "agent_bundle", None)
    if bundle is None:
        raise HTTPException(status_code=503, detail="Agent is not ready.")
    return bundle


def get_session_registry(request: Request) -> dict:
    return request.app.state.sessions  # type: ignore[no-any-return]


def get_started_at(request: Request) -> float:
    return float(request.app.state.started_at)
