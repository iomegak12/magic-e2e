"""Agent factory: builds the singleton ConsolidatedAgent at startup."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from agent_framework.foundry import FoundryChatClient
from azure.identity.aio import AzureCliCredential

from app.agent.instructions import CONSOLIDATED_INSTRUCTIONS
from app.core.config import Settings
from app.core.paths import ResolvedPaths
from app.history import SqliteHistoryProvider
from app.middleware import (
    ExceptionHandlingAgentMiddleware,
    InputGuardrailMiddleware,
    LoggingAgentMiddleware,
)
from app.tools.mcp import build_magic_v22_tool, build_ms_learn_tool
from app.tools.ticket import get_ticket_tools
from app.tools.travel import build_travel_agent_tool
from app.tools.utility import get_current_location, get_current_time, get_weather


@dataclass
class AgentBundle:
    """Bag of singletons created at startup and stashed on app.state."""

    agent: Any
    history_provider: SqliteHistoryProvider
    credential: AzureCliCredential
    tools_summary: list[tuple[str, str]]


async def build_agent(settings: Settings, paths: ResolvedPaths) -> AgentBundle:
    credential = AzureCliCredential()

    client = FoundryChatClient(
        project_endpoint=settings.azure_ai_project_endpoint,
        model=settings.azure_openai_responses_deployment_name,
        credential=credential,
    )

    ticket_tools = get_ticket_tools()
    ms_learn_tool = build_ms_learn_tool(settings)
    magic_v22_tool = build_magic_v22_tool(settings)
    travel_agent_tool = build_travel_agent_tool(settings, credential)
    history_provider = SqliteHistoryProvider()

    agent = client.as_agent(
        name="ConsolidatedAgent",
        instructions=CONSOLIDATED_INSTRUCTIONS,
        tools=[
            *ticket_tools,
            ms_learn_tool,
            magic_v22_tool,
            travel_agent_tool,
            get_weather,
            get_current_time,
            get_current_location,
        ],
        context_providers=[history_provider],
        middleware=[
            InputGuardrailMiddleware(paths.blacklist_path),
            ExceptionHandlingAgentMiddleware(),
            LoggingAgentMiddleware(),
        ],
    )

    tools_summary: list[tuple[str, str]] = [
        ("Utility", "get_weather, get_current_time, get_current_location"),
        ("Tickets", f"{len(ticket_tools)} @tool functions"),
        ("MS Learn MCP", settings.ms_learn_mcp_url),
        ("MAGIC v22 MCP", settings.magic_v22_mcp_url),
        (
            "Travel agent",
            f"{settings.travel_agent_name} v{settings.travel_agent_version}",
        ),
    ]

    return AgentBundle(
        agent=agent,
        history_provider=history_provider,
        credential=credential,
        tools_summary=tools_summary,
    )
