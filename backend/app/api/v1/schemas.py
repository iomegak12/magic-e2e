"""Pydantic schemas for the v1 API."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="The user's natural language message.")
    session_id: str | None = Field(
        default=None,
        description="Optional client-supplied session id. Server creates one if omitted.",
    )


class ChatResponse(BaseModel):
    session_id: str
    response: str


class SessionCreateResponse(BaseModel):
    session_id: str


class MessageOut(BaseModel):
    role: str
    content: str
    created_at: datetime | None = None


class ToolInfo(BaseModel):
    label: str
    value: str


class InfoResponse(BaseModel):
    name: str
    version: str
    host: str
    port: int
    scheme: str
    base_path: str = "/api/v1"
    tools: list[ToolInfo]
    features: dict[str, bool]


class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    magic_v22_reachable: bool
