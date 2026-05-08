"""MCP tool builders (MS Learn public + MAGIC v22 Bearer-protected) and a reachability probe."""

from __future__ import annotations

import socket
from urllib.parse import urlparse

import httpx
from agent_framework import MCPStreamableHTTPTool

from app.core.config import Settings


def build_ms_learn_tool(settings: Settings) -> MCPStreamableHTTPTool:
    return MCPStreamableHTTPTool(
        name="Microsoft Learn MCP Tool",
        url=settings.ms_learn_mcp_url,
    )


def build_magic_v22_tool(settings: Settings) -> MCPStreamableHTTPTool:
    return MCPStreamableHTTPTool(
        name="MAGIC v22 Orders and Complaints Tool",
        url=settings.magic_v22_mcp_url,
        http_client=httpx.AsyncClient(
            headers={"Authorization": f"Bearer {settings.api_key}"},
            timeout=30.0,
        ),
    )


def magic_v22_reachable(settings: Settings, timeout: float = 1.0) -> bool:
    """Quick TCP probe so the API can report whether the MAGIC v22 server is up."""
    parsed = urlparse(settings.magic_v22_mcp_url)
    host = parsed.hostname or "localhost"
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False
