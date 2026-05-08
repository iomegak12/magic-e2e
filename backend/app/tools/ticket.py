"""Re-export the six ticket-management @tool functions as a single list."""

from __future__ import annotations

from app.ticketing import TICKET_TOOLS


def get_ticket_tools() -> list:
    return list(TICKET_TOOLS)
