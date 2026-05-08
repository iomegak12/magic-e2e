"""Sequential ticket ID generator."""

from sqlalchemy.orm import Session


def next_ticket_id(session: Session) -> str:
    """Return the next sequential ticket ID (e.g. DTKT10001, DTKT10002 ...).

    Must be called *inside* an active session/transaction so the MAX query
    reflects any rows already inserted in the same transaction.
    """
    from .models import Ticket

    last = (
        session.query(Ticket.ticket_id)
        .order_by(Ticket.ticket_id.desc())
        .first()
    )
    if last:
        suffix = int(last[0].replace("DTKT", ""))
        next_suffix = suffix + 1
    else:
        next_suffix = 10001

    return f"DTKT{next_suffix}"
