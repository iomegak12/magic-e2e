"""Blocks queries that match a blacklist of words; persists hits to blocked_queries."""

from __future__ import annotations

import re
from collections.abc import Awaitable, Callable
from pathlib import Path

from agent_framework import (
    AgentContext,
    AgentMiddleware,
    AgentResponse,
    Message,
    MiddlewareTermination,
)

from app.core.logging import get_agent_logger


class InputGuardrailMiddleware(AgentMiddleware):
    """Blocks queries containing blacklisted words (whole-word, case-insensitive)."""

    def __init__(self, blacklist_path: Path) -> None:
        self.logger = get_agent_logger()
        self.words = self._load_words(blacklist_path)
        if self.words:
            pattern = r"\b(" + "|".join(re.escape(w) for w in self.words) + r")\b"
            self.regex = re.compile(pattern, re.IGNORECASE)
        else:
            self.regex = None

    @staticmethod
    def _load_words(path: Path) -> list[str]:
        if not path.exists():
            return []
        out: list[str] = []
        for line in path.read_text(encoding="utf-8").splitlines():
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            out.append(stripped.lower())
        return out

    async def process(
        self,
        context: AgentContext,
        call_next: Callable[[], Awaitable[None]],
    ) -> None:
        if self.regex is None:
            await call_next()
            return

        last = context.messages[-1] if context.messages else None
        text = last.text if last and last.text else ""
        m = self.regex.search(text)

        if m:
            matched = m.group(1)
            session_id = getattr(context.session, "id", None) if context.session else None
            self.logger.warning(f"[guardrail] BLOCKED matched={matched!r} session={session_id}")

            try:
                from app.ticketing import BlockedQuery, get_chat_session

                with get_chat_session() as db:
                    db.add(BlockedQuery(
                        session_id=session_id,
                        query=text,
                        matched_word=matched,
                    ))
            except Exception as e:  # noqa: BLE001
                self.logger.error(f"[guardrail] failed to persist blocked query: {e}")

            refusal = (
                f"I'm sorry, I can't help with that request. Your message contained the word "
                f"'{matched}', which is on our blocked list (offensive / inappropriate / unsafe "
                "content). Please rephrase your question without that term and I'll be happy to assist."
            )
            context.result = AgentResponse(messages=[Message("assistant", [refusal])])
            raise MiddlewareTermination(result=context.result)

        await call_next()
