"""GET /health."""

from __future__ import annotations

import time

from fastapi import APIRouter, Depends

from app.core.config import Settings, get_settings
from app.tools.mcp import magic_v22_reachable

from ..deps import get_started_at
from ..schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(
    started_at: float = Depends(get_started_at),
    settings: Settings = Depends(get_settings),
) -> HealthResponse:
    return HealthResponse(
        status="ok",
        uptime_seconds=round(time.time() - started_at, 3),
        magic_v22_reachable=magic_v22_reachable(settings),
    )
