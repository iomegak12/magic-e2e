"""Logging setup: rich console handler + file handler reusing logs/agent.log."""

from __future__ import annotations

import logging
from pathlib import Path

from rich.logging import RichHandler
from rich.traceback import install as install_rich_traceback


_AGENT_LOGGER_NAME = "consolidated_agent"


def configure_logging(level: str, log_file: Path) -> logging.Logger:
    """Configure root + agent loggers with a rich console handler and a shared file handler.

    Returns the dedicated agent logger (used by middleware classes).
    """
    install_rich_traceback(show_locals=False)

    log_file.parent.mkdir(parents=True, exist_ok=True)
    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setFormatter(logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s"))

    rich_handler = RichHandler(rich_tracebacks=True, show_path=False, markup=True)

    root = logging.getLogger()
    root.setLevel(level.upper())
    # Avoid duplicate handlers on reloads
    root.handlers = [h for h in root.handlers if not isinstance(h, (RichHandler, logging.FileHandler))]
    root.addHandler(rich_handler)
    root.addHandler(file_handler)

    # Dedicated agent logger (middleware writes here)
    agent_logger = logging.getLogger(_AGENT_LOGGER_NAME)
    agent_logger.setLevel(logging.INFO)
    if not any(isinstance(h, logging.FileHandler) for h in agent_logger.handlers):
        agent_logger.addHandler(file_handler)
    agent_logger.propagate = True

    # Quieter third-party loggers
    for noisy in ("uvicorn.access", "httpx", "httpcore", "azure"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    return agent_logger


def get_agent_logger() -> logging.Logger:
    return logging.getLogger(_AGENT_LOGGER_NAME)
