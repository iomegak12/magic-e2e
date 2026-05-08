"""Minimal uvicorn entrypoint. Configuration is read from backend/.env via Settings."""

from __future__ import annotations

import uvicorn

from app.core.config import get_settings


def main() -> None:
    settings = get_settings()
    ssl_certfile = settings.ssl_certfile if settings.https_enabled else None
    ssl_keyfile = settings.ssl_keyfile if settings.https_enabled else None

    uvicorn.run(
        "app.main:create_app",
        host=settings.host,
        port=settings.port,
        factory=True,
        reload=False,
        log_level="info",
        ssl_certfile=ssl_certfile,
        ssl_keyfile=ssl_keyfile,
    )


if __name__ == "__main__":
    main()
