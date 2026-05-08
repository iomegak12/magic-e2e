"""Pure repository functions — no agent decorators.

All functions return JSON-serialisable dicts or lists of dicts so they
can safely be handed back to the LLM via the tools layer.
"""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import func

from .database import get_session
from .enums import Status
from .id_generator import next_ticket_id
from .models import Ticket


def register_ticket(
    description: str,
    registered_by: str,
    priority: str,
) -> dict:
    """Create a new ticket and return it as a dict."""
    with get_session() as session:
        ticket_id = next_ticket_id(session)
        ticket = Ticket(
            ticket_id=ticket_id,
            ticket_description=description,
            registered_date=datetime.now(timezone.utc),
            registered_by=registered_by,
            priority=priority,
            status=Status.OPEN.value,
        )
        session.add(ticket)
        session.flush()
        return ticket.to_dict()


def get_tickets_by_registered_by(name: str) -> list[dict]:
    """Return all tickets whose registered_by partially matches name (case-insensitive)."""
    with get_session() as session:
        rows = (
            session.query(Ticket)
            .filter(func.lower(Ticket.registered_by).like(f"%{name.lower()}%"))
            .order_by(Ticket.registered_date.desc())
            .all()
        )
        return [r.to_dict() for r in rows]


def get_tickets_by_resolved_by(name: str) -> list[dict]:
    """Return all tickets whose resolved_by partially matches name (case-insensitive)."""
    with get_session() as session:
        rows = (
            session.query(Ticket)
            .filter(func.lower(Ticket.resolved_by).like(f"%{name.lower()}%"))
            .order_by(Ticket.resolved_date.desc())
            .all()
        )
        return [r.to_dict() for r in rows]


def search_tickets(
    description: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
) -> list[dict]:
    """Search tickets with optional filters (all AND-combined)."""
    with get_session() as session:
        query = session.query(Ticket)
        if description:
            query = query.filter(
                func.lower(Ticket.ticket_description).like(f"%{description.lower()}%")
            )
        if status:
            query = query.filter(Ticket.status == status)
        if priority:
            query = query.filter(Ticket.priority == priority)
        rows = query.order_by(Ticket.registered_date.desc()).all()
        return [r.to_dict() for r in rows]


def resolve_ticket(
    ticket_id: str,
    resolved_by: str,
    resolution_remarks: str,
) -> dict:
    """Mark a ticket as Resolved."""
    with get_session() as session:
        ticket = session.get(Ticket, ticket_id)
        if not ticket:
            raise ValueError(f"Ticket '{ticket_id}' not found.")
        if ticket.status in (Status.CLOSED.value, Status.CANCELLED.value):
            raise ValueError(
                f"Ticket '{ticket_id}' is already {ticket.status} and cannot be resolved."
            )
        ticket.status = Status.RESOLVED.value
        ticket.resolved_by = resolved_by
        ticket.resolution_remarks = resolution_remarks
        ticket.resolved_date = datetime.now(timezone.utc)
        return ticket.to_dict()


def close_ticket(ticket_id: str) -> dict:
    """Close a ticket. Allowed from: Resolved, Open, Cancelled."""
    with get_session() as session:
        ticket = session.get(Ticket, ticket_id)
        if not ticket:
            raise ValueError(f"Ticket '{ticket_id}' not found.")
        if ticket.status == Status.CLOSED.value:
            raise ValueError(f"Ticket '{ticket_id}' is already Closed.")
        ticket.status = Status.CLOSED.value
        return ticket.to_dict()
