"""GET /info."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.agent.factory import AgentBundle
from app.core.config import Settings, get_settings

from ..deps import get_agent_bundle
from ..schemas import InfoResponse, ToolInfo

router = APIRouter()


@router.get("/info", response_model=InfoResponse)
async def info(
    bundle: AgentBundle = Depends(get_agent_bundle),
    settings: Settings = Depends(get_settings),
) -> InfoResponse:
    return InfoResponse(
        name=settings.server_name,
        version=settings.server_version,
        host=settings.host,
        port=settings.port,
        scheme=settings.scheme,
        tools=[ToolInfo(label=l, value=v) for l, v in bundle.tools_summary],
        features={
            "https": settings.https_enabled,
            "rate_limit": settings.rate_limit_enabled,
            "streaming": True,
        },
    )
