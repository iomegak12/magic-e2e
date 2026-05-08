"""Self-contained ticket management + chat history persistence.

Originally lived under `experiments/lib/ticket_management`; moved here so the
backend has zero dependencies on the experiments folder.
"""

from .chat_history_models import (
    BlockedQuery,
    ChatMessage,
    chat_engine,
    get_chat_session,
    init_chat_history_db,
)
from .database import get_session, init_db
from .enums import Priority, Status
from .models import Ticket
from .repository import (
    close_ticket as repo_close_ticket,
    get_tickets_by_registered_by as repo_get_tickets_by_registered_by,
    get_tickets_by_resolved_by as repo_get_tickets_by_resolved_by,
    register_ticket as repo_register_ticket,
    resolve_ticket as repo_resolve_ticket,
    search_tickets as repo_search_tickets,
)
from .tools import (
    close_ticket,
    get_tickets_by_registered_by,
    get_tickets_by_resolved_by,
    register_ticket,
    resolve_ticket,
    search_tickets,
)

TICKET_TOOLS = [
    register_ticket,
    get_tickets_by_registered_by,
    get_tickets_by_resolved_by,
    search_tickets,
    resolve_ticket,
    close_ticket,
]

__all__ = [
    "Priority",
    "Status",
    "Ticket",
    "init_db",
    "get_session",
    "ChatMessage",
    "BlockedQuery",
    "chat_engine",
    "get_chat_session",
    "init_chat_history_db",
    "register_ticket",
    "get_tickets_by_registered_by",
    "get_tickets_by_resolved_by",
    "search_tickets",
    "resolve_ticket",
    "close_ticket",
    "repo_register_ticket",
    "repo_get_tickets_by_registered_by",
    "repo_get_tickets_by_resolved_by",
    "repo_search_tickets",
    "repo_resolve_ticket",
    "repo_close_ticket",
    "TICKET_TOOLS",
]
