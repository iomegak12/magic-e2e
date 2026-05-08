"""Agent tool wrappers for ticket management.

Each function is a thin @tool-decorated wrapper around the repository layer.
All tools use approval_mode="never_require" — the agent auto-executes them.
"""

import json
from typing import Annotated, Optional

from agent_framework import tool
from pydantic import Field

from . import repository


@tool(approval_mode="never_require")
def register_ticket(
    description: Annotated[str, Field(description="A clear description of the IT issue or request.")],
    registered_by: Annotated[str, Field(description="Full name of the person raising the ticket.")],
    priority: Annotated[
        str,
        Field(description="Ticket priority. Must be one of: Low, Medium, High, Critical."),
    ],
) -> str:
    """Register a new IT support ticket and return its details including the assigned ticket ID."""
    try:
        result = repository.register_ticket(description, registered_by, priority)
        return f"Ticket created successfully: {json.dumps(result, indent=2)}"
    except Exception as exc:
        return f"Error creating ticket: {exc}"


@tool(approval_mode="never_require")
def get_tickets_by_registered_by(
    name: Annotated[
        str,
        Field(description="Partial or full name of the person who registered (raised) the tickets."),
    ],
) -> str:
    """Retrieve all IT support tickets raised by a specific person (partial, case-insensitive name match)."""
    try:
        results = repository.get_tickets_by_registered_by(name)
        if not results:
            return f"No tickets found registered by '{name}'."
        return f"Found {len(results)} ticket(s) registered by '{name}': {json.dumps(results, indent=2)}"
    except Exception as exc:
        return f"Error retrieving tickets: {exc}"


@tool(approval_mode="never_require")
def get_tickets_by_resolved_by(
    name: Annotated[
        str,
        Field(description="Partial or full name of the person who resolved the tickets."),
    ],
) -> str:
    """Retrieve all IT support tickets resolved by a specific person (partial, case-insensitive name match)."""
    try:
        results = repository.get_tickets_by_resolved_by(name)
        if not results:
            return f"No tickets found resolved by '{name}'."
        return f"Found {len(results)} ticket(s) resolved by '{name}': {json.dumps(results, indent=2)}"
    except Exception as exc:
        return f"Error retrieving tickets: {exc}"


@tool(approval_mode="never_require")
def search_tickets(
    description: Annotated[
        Optional[str],
        Field(
            default=None,
            description="Optional keyword to search in ticket descriptions (partial, case-insensitive).",
        ),
    ] = None,
    status: Annotated[
        Optional[str],
        Field(
            default=None,
            description=(
                "Optional status to filter by. Must be one of: "
                "Open, In Progress, On Hold, Resolved, Closed, Cancelled."
            ),
        ),
    ] = None,
    priority: Annotated[
        Optional[str],
        Field(
            default=None,
            description="Optional priority to filter by. Must be one of: Low, Medium, High, Critical.",
        ),
    ] = None,
) -> str:
    """Search and filter IT support tickets. All parameters are optional and combined with AND logic."""
    try:
        results = repository.search_tickets(description=description, status=status, priority=priority)
        if not results:
            return "No tickets found matching the given criteria."
        return f"Found {len(results)} ticket(s): {json.dumps(results, indent=2)}"
    except Exception as exc:
        return f"Error searching tickets: {exc}"


@tool(approval_mode="never_require")
def resolve_ticket(
    ticket_id: Annotated[str, Field(description="The ticket ID to resolve, e.g. DTKT10001.")],
    resolved_by: Annotated[str, Field(description="Full name of the IT staff member resolving the ticket.")],
    resolution_remarks: Annotated[str, Field(description="A clear description of how the issue was resolved.")],
) -> str:
    """Resolve an IT support ticket by recording who resolved it and the resolution details."""
    try:
        result = repository.resolve_ticket(ticket_id, resolved_by, resolution_remarks)
        return f"Ticket resolved successfully: {json.dumps(result, indent=2)}"
    except ValueError as exc:
        return f"Cannot resolve ticket: {exc}"
    except Exception as exc:
        return f"Error resolving ticket: {exc}"


@tool(approval_mode="never_require")
def close_ticket(
    ticket_id: Annotated[str, Field(description="The ticket ID to close, e.g. DTKT10001.")],
) -> str:
    """Close an IT support ticket. Allowed from Resolved, Open, or Cancelled status."""
    try:
        result = repository.close_ticket(ticket_id)
        return f"Ticket closed successfully: {json.dumps(result, indent=2)}"
    except ValueError as exc:
        return f"Cannot close ticket: {exc}"
    except Exception as exc:
        return f"Error closing ticket: {exc}"
