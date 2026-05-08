# Plan: Backend REST API for Consolidated MAF Agent

Wrap the consolidated agent (currently in `experiments/consolidated-agent-demo.ipynb`) as a FastAPI service exposed under `/api/v1/*`, with all notebook concerns ported into a modular `backend/app/` package. The agent is built once at FastAPI startup (singleton), shared across requests; sessions are addressable by `session_id` in the request body.

## Scope decisions (locked from your answers)
- Folder: `backend/` at workspace root.
- Layout: `app/` with submodules `core/`, `tools/`, `middleware/`, `history/`, `agent/`, `api/v1/`.
- Endpoints: `POST /chat`, `POST /chat/stream` (SSE), `GET /health`, `GET /info`, `POST /sessions`, `GET /sessions/{id}/messages`.
- Sessions: client passes `session_id` (optional); server creates if missing and echoes it back.
- Streaming: `text/event-stream` with `data: {json}` per chunk; final `data: [DONE]`.
- Auth: none.
- Rate limiting: `slowapi` in-memory, default `60/minute`, toggled via `RATE_LIMIT_ENABLED`.
- HTTPS: uvicorn SSL via `SSL_CERTFILE` / `SSL_KEYFILE` when `HTTPS_ENABLED=true`.
- Logging: `rich` for colorful console + tracebacks; existing file logger kept for `agent.log`.
- Docker: `python:3.12-slim` multi-stage, no HEALTHCHECK.
- Dependencies: extend root `pyproject.toml` with a `[project.optional-dependencies] backend = [...]` group.
- Env: `backend/.env.example` shipped + `backend/.env` runtime override (already created).
- License: MIT, Ramkumar 2026. Version `0.1.0`.

## Folder layout
```
backend/
├── .env.example          (already created)
├── .gitignore
├── .dockerignore
├── Dockerfile
├── docker-compose.yml
├── server.py             (minimal entry: load env → uvicorn.run)
├── README.md
├── CONTRIBUTING.md
├── TROUBLESHOOTING.md
├── CHANGELOG.md
├── LICENSE
└── app/
    ├── __init__.py
    ├── main.py           (FastAPI factory: middleware, CORS, lifespan, router include, openapi tags)
    ├── core/
    │   ├── __init__.py
    │   ├── config.py     (pydantic-settings Settings; reads backend/.env)
    │   ├── logging.py    (rich console handler + file handler reusing logs/agent.log)
    │   ├── banner.py     (colourful startup banner: server name, host:port, scheme, endpoints, feature flags)
    │   └── paths.py      (resolve TICKET_LIB_PATH, push to sys.path, ensure logs dir, blacklist path, db dirs)
    ├── tools/
    │   ├── __init__.py
    │   ├── utility.py    (@tool: get_weather, get_current_time, get_current_location)
    │   ├── mcp.py        (build_ms_learn_tool, build_magic_v22_tool, magic_v22_reachable)
    │   ├── travel.py     (build_travel_agent_tool — FoundryAgent + as_tool)
    │   └── ticket.py     (re-exports the 6 ticket @tools from ticket_management.tools)
    ├── middleware/
    │   ├── __init__.py
    │   ├── logging_mw.py (LoggingAgentMiddleware)
    │   ├── exception_mw.py (ExceptionHandlingAgentMiddleware)
    │   └── guardrail_mw.py (InputGuardrailMiddleware)
    ├── history/
    │   ├── __init__.py
    │   └── sqlite_provider.py (SqliteHistoryProvider)
    ├── agent/
    │   ├── __init__.py
    │   ├── instructions.py  (CONSOLIDATED_INSTRUCTIONS string)
    │   └── factory.py       (build_agent() → returns (agent, history_provider) singleton-built at startup)
    └── api/
        ├── __init__.py
        └── v1/
            ├── __init__.py
            ├── router.py     (APIRouter prefix="/api/v1")
            ├── schemas.py    (pydantic models: ChatRequest, ChatResponse, SessionCreateResponse, MessageOut, InfoResponse, HealthResponse)
            ├── deps.py       (get_agent, get_history_provider, get_session_registry)
            └── routes/
                ├── __init__.py
                ├── chat.py     (POST /chat, POST /chat/stream)
                ├── sessions.py (POST /sessions, GET /sessions/{id}/messages)
                ├── health.py   (GET /health)
                └── info.py     (GET /info)
```

## Module responsibilities (1-line each)
- `core/config.py` — `Settings(BaseSettings)` reading `backend/.env`: `SERVER_NAME`, `SERVER_VERSION`, `HOST`, `PORT`, `CORS_ALLOW_ORIGINS`, `HTTPS_ENABLED`, `SSL_CERTFILE`, `SSL_KEYFILE`, `RATE_LIMIT_ENABLED`, `RATE_LIMIT_DEFAULT`, all Azure/MCP env vars, paths.
- `core/logging.py` — install `rich.logging.RichHandler` for console + reuse the file handler (`logs/agent.log`); install `rich.traceback.install()`.
- `core/banner.py` — at startup print a colourful panel listing: server name+version, host:port, scheme (HTTP/HTTPS), CORS origins, rate-limit on/off, registered tool count, MCP reachability, list of endpoints (`POST /api/v1/chat`, etc.).
- `core/paths.py` — `init_paths(settings)`: `sys.path.insert(0, settings.TICKET_LIB_PATH)`, `mkdir` logs dir, return resolved `BLACKLIST_PATH` and `LOG_FILE`.
- `tools/*` — port 1:1 from notebook §2–§4 cells; pure builder functions (no side effects on import).
- `middleware/*` — port 1:1 from notebook §6 cells.
- `history/sqlite_provider.py` — port 1:1 from notebook §5.
- `agent/factory.py` — `async def build_agent(settings) -> tuple[Agent, SqliteHistoryProvider]`: assembles `FoundryChatClient.as_agent(...)` exactly like notebook §7. Stores result on `app.state` via FastAPI lifespan.
- `api/v1/schemas.py`:
  - `ChatRequest { message: str, session_id: str | None = None }`
  - `ChatResponse { session_id: str, response: str }`
  - `SessionCreateResponse { session_id: str }`
  - `MessageOut { role: str, content: str, created_at: datetime }`
  - `InfoResponse { name, version, host, port, scheme, tools: list[str], features: dict[str, bool] }`
  - `HealthResponse { status: "ok", uptime_seconds: float }`
- `api/v1/deps.py` — `get_agent(request) -> Agent` reads from `request.app.state`.
- `api/v1/routes/chat.py`:
  - `POST /chat` — resolve/create session by id (registry kept on `app.state.sessions: dict[str, AgentSession]`), call `await agent.run(message, session=session)`, return `ChatResponse`.
  - `POST /chat/stream` — same but returns `EventSourceResponse` / `StreamingResponse(media_type="text/event-stream")` yielding `data: {"session_id":..., "delta": chunk.text}\n\n` then `data: [DONE]\n\n`.
- `api/v1/routes/sessions.py`:
  - `POST /sessions` — create new session via `agent.create_session()`, register, return id.
  - `GET /sessions/{id}/messages` — query `chat_messages` table for that `session_id` (read-only) and return list of `MessageOut`.
- `api/v1/routes/health.py` / `info.py` — straightforward.
- `app/main.py` — `create_app()`: instantiate FastAPI(title=SERVER_NAME, version=SERVER_VERSION, description=..., docs_url="/docs", redoc_url="/redoc", openapi_url="/openapi.json"); add CORSMiddleware(allow_origins=settings.cors_origins, allow_methods=["*"], allow_headers=["*"], allow_credentials=False); conditional `slowapi` Limiter wired to app state if `RATE_LIMIT_ENABLED`; `@asynccontextmanager` lifespan that calls `init_paths()`, `init_db()`, `init_chat_history_db()`, `build_agent()`, prints banner; include `api_v1_router`.
- `server.py` — minimal: `from app.main import create_app`; `if __name__ == "__main__": uvicorn.run("app.main:create_app", host=..., port=..., factory=True, ssl_certfile=..., ssl_keyfile=...)` with TLS args only if `HTTPS_ENABLED`.

## Service description (used in OpenAPI + README)
> **Consolidated MAF Agent** — a FastAPI-based REST service that exposes a single Microsoft Agent Framework agent combining local Python tools, public and authenticated MCP servers, a hosted Foundry agent (used as a tool), persistent SQLite chat history, and a guardrail/exception/logging middleware stack. Provides streaming and non-streaming chat endpoints, OpenAPI/Swagger docs, configurable HTTPS and rate limiting, and a permissive CORS policy by default.

## Dockerfile (multi-stage, slim, no HEALTHCHECK)
- Stage `builder`: `python:3.12-slim` → install build deps (`build-essential`, `libffi-dev`, `libssl-dev`) → create `/opt/venv` → `pip install --upgrade pip` → `pip install -r requirements.txt` (generated from pyproject extras) into `/opt/venv`.
- Stage `runtime`: `python:3.12-slim` → copy `/opt/venv` → `WORKDIR /app` → copy `backend/app` and `experiments/lib/ticket_management` (under `/app/lib/ticket_management`) → set `TICKET_LIB_PATH=/app/lib`, `PATH=/opt/venv/bin:$PATH` → `EXPOSE 9098` → `CMD ["python", "server.py"]`.
- No `HEALTHCHECK`.

## docker-compose.yml
- One service `consolidated-maf-agent`, build context = `..` so it can copy `experiments/lib/ticket_management/`; ports `"9098:9098"`; `env_file: ./.env`; volumes for `../logs` and `../db` so persistence outlives container; restart `unless-stopped`.

## .gitignore + .dockerignore
- Standard Python ignores (`__pycache__`, `.venv`, `*.pyc`, `*.egg-info`, `.pytest_cache`, `.mypy_cache`).
- `.env`, `*.db`, `*.log`, `logs/`, `dist/`, `build/`.
- `.dockerignore` adds: `*.md`, `Dockerfile`, `docker-compose.yml`, `tests/`, notebooks (`*.ipynb`), `.git`.

## pyproject.toml additions (root file)
Add a `[project.optional-dependencies]` table:
```
backend = [
  "fastapi>=0.115",
  "uvicorn[standard]>=0.32",
  "pydantic-settings>=2.5",
  "sse-starlette>=2.1",
  "slowapi>=0.1.9",
  "rich>=13.7",
  "python-dotenv>=1.0",
  "httpx>=0.27",
  "sqlalchemy>=2.0",
]
```
Install: `pip install -e ".[backend]"`. Docker uses an exported `requirements.txt` (or pip-installs the same list inline) — I'll generate a frozen `backend/requirements.txt` for Docker so it doesn't depend on the editable install.

## Console banner (rich)
On startup, render a `rich.panel.Panel` containing:
- Bold title: `Consolidated MAF Agent v0.1.0`
- Cyan rows: `Listening on http(s)://HOST:PORT`, `Docs: <scheme>://HOST:PORT/docs`, `OpenAPI: /openapi.json`.
- Green/red flags: `HTTPS: enabled/disabled`, `Rate-limit: enabled (60/minute) / disabled`, `CORS: *`.
- Yellow list of endpoints under `/api/v1`.
- Magenta tool roster: `ticket_tools(6)`, `MS Learn MCP`, `MAGIC v22 MCP (reachable/unreachable)`, `travel-support-agent v2`, `utility(3)`.

## Verification
1. `cd backend && cp .env.example .env`, fill `AZURE_AI_PROJECT_ENDPOINT` etc.
2. `pip install -e "..[backend]"` from `backend/` (or `pip install -e .[backend]` from workspace root).
3. `python backend/server.py` — banner appears; visit `http://localhost:9098/docs` to see Swagger.
4. `curl -X POST :9098/api/v1/sessions` → `{"session_id":"..."}`.
5. `curl -X POST :9098/api/v1/chat -H "Content-Type: application/json" -d '{"message":"what is the time in Bengaluru?","session_id":"..."}'` → text response.
6. `curl -N -X POST :9098/api/v1/chat/stream -H "Content-Type: application/json" -d '{"message":"hotels in Vegas by Margie?","session_id":"..."}'` → SSE chunks.
7. `curl :9098/api/v1/sessions/<id>/messages` → list of persisted messages.
8. `curl :9098/api/v1/health` → `{"status":"ok",...}`; `:9098/api/v1/info` → tool roster + flags.
9. Toggle `RATE_LIMIT_ENABLED=true` → 61st request in a minute returns HTTP 429.
10. Toggle `HTTPS_ENABLED=true` with self-signed cert → server boots on TLS.
11. `docker compose up --build` — same flow inside container.

## Decisions / scope
- INCLUDED: full feature parity with the notebook (tools + middleware + history + sessions); OpenAPI; CORS *; HTTPS toggle; rate limit toggle; SSE streaming; Docker.
- EXCLUDED: auth, persistent session registry across restarts (the in-memory `app.state.sessions` dict is rebuilt on boot — but message rows persist in SQLite so `/sessions/{id}/messages` still works after restart), tests, Redis, Kubernetes manifests, CI workflows.
- ASSUMPTION: `experiments/lib/ticket_management/` remains the canonical home of the ticket library and we import it via `TICKET_LIB_PATH`. We do **not** copy/duplicate it into `backend/`.

## Further considerations
1. **Workspace layout for `lib/`** — A) keep `experiments/lib/ticket_management` and add it via `sys.path` (recommended, no duplication). B) Move it to `backend/app/ticket_management/` for cleaner Docker context. C) Move it to a top-level `lib/` shared by both notebooks and backend.
2. **`/sessions/{id}/messages` storage view** — A) read directly from `chat_messages` table (recommended; same source of truth). B) Also include in-memory cache contents.
3. **Streaming protocol** — A) SSE with `data: {json}` (recommended, OpenAPI-friendly). B) Raw chunked text (`text/plain`). C) Both endpoints, client picks via header.
4. **README depth** — A) concise quickstart + endpoint table (recommended). B) Full architecture write-up with diagrams.
