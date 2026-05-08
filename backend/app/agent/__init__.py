"""Agent factory + instructions."""

from .factory import AgentBundle, build_agent
from .instructions import CONSOLIDATED_INSTRUCTIONS

__all__ = ["AgentBundle", "build_agent", "CONSOLIDATED_INSTRUCTIONS"]
