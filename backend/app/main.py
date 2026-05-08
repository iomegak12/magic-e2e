"""FastAPI application factory."""

from __future__ import annotations

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.agent.factory import build_agent
from app.api.v1 import api_router
from app.core import (
    Settings,
    configure_logging,
    get_settings,
    init_paths,
    print_banner,
)
from app.core.logging import get_agent_logger
from app.tools.mcp import magic_v22_reachable


def _install_rate_limiter(app: FastAPI, settings: Settings) -> None:
    if not settings.rate_limit_enabled:
        return
    from slowapi import Limiter
    from slowapi.errors import RateLimitExceeded
    from slowapi.middleware import SlowAPIMiddleware
    from slowapi.util import get_remote_address

    limiter = Limiter(
        key_func=get_remote_address,
        default_limits=[settings.rate_limit_default],
    )
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    @app.exception_handler(RateLimitExceeded)
    async def _rate_limit_exceeded(_: Request, exc: RateLimitExceeded) -> JSONResponse:
        return JSONResponse(
            status_code=429,
            content={"detail": f"Rate limit exceeded: {exc.detail}"},
        )


def create_app() -> FastAPI:
    settings = get_settings()
    paths = init_paths(settings)
    configure_logging(level="INFO", log_file=paths.log_file)
    logger = get_agent_logger()

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        logger.info("Initialising databases...")
        from app.ticketing import init_chat_history_db, init_db

        init_db()
        init_chat_history_db()

        logger.info("Building consolidated agent...")
        bundle = await build_agent(settings, paths)

        app.state.settings = settings
        app.state.paths = paths
        app.state.agent_bundle = bundle
        app.state.sessions = {}
        app.state.started_at = time.time()

        print_banner(
            settings,
            tools_summary=bundle.tools_summary,
            magic_v22_reachable=magic_v22_reachable(settings),
        )

        try:
            yield
        finally:
            logger.info("Shutting down agent...")
            try:
                await bundle.credential.close()
            except Exception:  # noqa: BLE001
                pass

    app = FastAPI(
        title=settings.server_name,
        version=settings.server_version,
        description=(
            "Consolidated Microsoft Agent Framework agent exposed as a REST API. "
            "Combines local @tools, ticket management, MS Learn MCP, MAGIC v22 MCP, "
            "a hosted Foundry travel agent, SQLite chat-history, and a 3-stage "
            "middleware pipeline (guardrail \u2192 exception \u2192 logging)."
        ),
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    _install_rate_limiter(app, settings)
    app.include_router(api_router)

    @app.get("/", include_in_schema=False)
    async def root() -> dict[str, str]:
        return {
            "name": settings.server_name,
            "version": settings.server_version,
            "docs": "/docs",
            "api": "/api/v1",
        }

    return app
