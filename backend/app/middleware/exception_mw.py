"""Catches exceptions during agent runs and converts them into friendly responses."""

from __future__ import annotations

from collections.abc import Awaitable, Callable

from agent_framework import AgentContext, AgentMiddleware, AgentResponse, Message
from sqlalchemy.exc import SQLAlchemyError

from app.core.logging import get_agent_logger


class ExceptionHandlingAgentMiddleware(AgentMiddleware):
    """Catches TimeoutError / ValueError / SQLAlchemyError / Exception and degrades gracefully."""

    def __init__(self) -> None:
        self.logger = get_agent_logger()

    async def process(
        self,
        context: AgentContext,
        call_next: Callable[[], Awaitable[None]],
    ) -> None:
        try:
            await call_next()
        except TimeoutError as e:
            self.logger.error(f"[exception] TimeoutError: {e}")
            context.result = AgentResponse(
                messages=[Message("assistant", [
                    "The request timed out while contacting a downstream service. "
                    "Please try again in a moment."
                ])]
            )
        except ValueError as e:
            self.logger.error(f"[exception] ValueError: {e}")
            context.result = AgentResponse(
                messages=[Message("assistant", [
                    f"I couldn't process that request because of invalid input: {e}"
                ])]
            )
        except SQLAlchemyError as e:
            self.logger.error(f"[exception] SQLAlchemyError: {e}")
            context.result = AgentResponse(
                messages=[Message("assistant", [
                    "A database error occurred while processing your request. "
                    "Our team has been notified \u2014 please try again shortly."
                ])]
            )
        except Exception as e:  # noqa: BLE001
            self.logger.exception(f"[exception] Unhandled: {e}")
            context.result = AgentResponse(
                messages=[Message("assistant", [
                    "Sorry, something went wrong while handling your request. "
                    "Please try again or contact support."
                ])]
            )
