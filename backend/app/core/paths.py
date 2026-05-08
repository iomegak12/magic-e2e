"""Path resolution: ensures required directories exist and DB env vars are bridged."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from .config import Settings


@dataclass(frozen=True)
class ResolvedPaths:
    logs_dir: Path
    log_file: Path
    blacklist_path: Path


def init_paths(settings: Settings) -> ResolvedPaths:
    """Resolve env-relative paths, ensure dirs exist, bridge DB URLs to os.environ.

    pydantic-settings reads `.env` into the Settings object but does NOT populate
    os.environ. The `app.ticketing` package, however, reads DATABASE_URL and
    CHAT_HISTORY_DATABASE_URL from os.environ at import time. We bridge them here
    so a single `.env` is the source of truth.
    """
    logs_dir = settings.resolve_path(settings.logs_dir)
    blacklist = settings.resolve_path(settings.blacklist_path)

    logs_dir.mkdir(parents=True, exist_ok=True)
    log_file = logs_dir / "agent.log"

    os.environ.setdefault("DATABASE_URL", settings.database_url)
    os.environ.setdefault("CHAT_HISTORY_DATABASE_URL", settings.chat_history_database_url)

    return ResolvedPaths(
        logs_dir=logs_dir,
        log_file=log_file,
        blacklist_path=blacklist,
    )
