# Changelog

All notable changes to this project will be documented in this file. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-08

### Added
- Initial release of the Consolidated MAF Agent backend.
- FastAPI service exposing `/api/v1/chat`, `/api/v1/chat/stream` (SSE), `/api/v1/sessions`, `/api/v1/sessions/{id}/messages`, `/api/v1/health`, `/api/v1/info`.
- Singleton agent (built at startup) wiring six ticket-management `@tool`s, three utility `@tool`s, MS Learn MCP, MAGIC v22 MCP (Bearer auth), and a hosted Foundry agent (`travel-support-agent` v2) exposed via `agent.as_tool()`.
- Inline `SqliteHistoryProvider` (hybrid in-memory cache + SQLite flush).
- Middleware stack: `InputGuardrailMiddleware`, `ExceptionHandlingAgentMiddleware`, `LoggingAgentMiddleware`.
- Configurable HTTPS via `HTTPS_ENABLED` + `SSL_CERTFILE` / `SSL_KEYFILE`.
- Configurable rate-limiting via `RATE_LIMIT_ENABLED` (slowapi, default `60/minute`).
- Permissive CORS by default; `CORS_ALLOW_ORIGINS` configurable.
- Colorful startup banner (rich) showing endpoints, feature flags, tool roster.
- Multi-stage Dockerfile (`python:3.12-slim`) and `docker-compose.yml`.
- MIT License, README, CONTRIBUTING, TROUBLESHOOTING.
