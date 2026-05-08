"""Aggregated v1 API router."""

from __future__ import annotations

from fastapi import APIRouter

from .routes import chat, health, info, sessions

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(chat.router, tags=["chat"])
api_router.include_router(sessions.router, tags=["sessions"])
api_router.include_router(health.router, tags=["health"])
api_router.include_router(info.router, tags=["info"])
