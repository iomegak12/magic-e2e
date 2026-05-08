"""Wrap a hosted Foundry agent as a tool the consolidated agent can delegate to."""

from __future__ import annotations

from agent_framework.foundry import FoundryAgent
from azure.identity.aio import AzureCliCredential

from app.core.config import Settings


def build_travel_agent_tool(settings: Settings, credential: AzureCliCredential):
    """Instantiate the hosted travel-support FoundryAgent and expose it via as_tool()."""
    travel_agent = FoundryAgent(
        project_endpoint=settings.azure_ai_project_endpoint,
        agent_name=settings.travel_agent_name,
        agent_version=settings.travel_agent_version,
        credential=credential,
    )

    return travel_agent.as_tool(
        name="travel-support-agent-tool",
        description=(
            "Authoritative travel knowledge base. MUST be called for ANY question about "
            "hotels, flights, travel packages, destinations, itineraries, tour operators, "
            "or travel agencies (e.g. Margie's Travels). Returns grounded data."
        ),
        arg_name="query",
        arg_description="The user's full travel-related question, passed verbatim.",
    )
