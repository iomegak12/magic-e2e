"""Logs each agent run start/end with duration and message snippets."""

from __future__ import annotations

import time
from collections.abc import Awaitable, Callable

from agent_framework import AgentContext, AgentMiddleware

from app.core.logging import get_agent_logger


class LoggingAgentMiddleware(AgentMiddleware):
    """Logs each agent run: inbound query, message count, duration, response snippet."""

    def __init__(self) -> None:
        self.logger = get_agent_logger()

    async def process(
        self,
        context: AgentContext,
        call_next: Callable[[], Awaitable[None]],
    ) -> None:
        last = context.messages[-1] if context.messages else None
        last_text = (last.text if last and last.text else "").replace("\n", " ")[:200]
        self.logger.info(
            f"[run-start] msgs={len(context.messages or [])} last_user={last_text!r}"
        )

        start = time.perf_counter()
        try:
            await call_next()
        finally:
            duration = time.perf_counter() - start
            response_snippet = ""
            if context.result is not None:
                try:
                    response_snippet = str(getattr(context.result, "text", context.result))[:200]
                except Exception:  # noqa: BLE001
                    response_snippet = "<unserializable>"
            self.logger.info(
                f"[run-end] duration={duration:.3f}s response={response_snippet!r}"
            )
