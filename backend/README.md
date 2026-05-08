# Consolidated MAF Agent

A FastAPI-based REST service that exposes a single Microsoft Agent Framework agent combining local Python tools, public and authenticated MCP servers, a hosted Foundry agent (used as a tool), persistent SQLite chat history, and a guardrail/exception/logging middleware stack. Provides streaming and non-streaming chat endpoints, OpenAPI/Swagger docs, configurable HTTPS and rate limiting, and a permissive CORS policy by default.

## Quickstart

```powershell
# from workspace root
pip install -e ".[backend]"

cd backend
copy .env.example .env   # then fill AZURE_AI_PROJECT_ENDPOINT, API_KEY, ...

python server.py
```

Open <http://localhost:9098/docs> for Swagger UI.

## Endpoints (base: `/api/v1`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/chat` | Non-streaming chat. Returns full response JSON. |
| POST | `/chat/stream` | Streaming chat as Server-Sent Events. |
| POST | `/sessions` | Create a new chat session and return its id. |
| GET  | `/sessions/{id}/messages` | List persisted messages for a session. |
| GET  | `/health` | Liveness probe. |
| GET  | `/info` | Server metadata, registered tools, feature flags. |

### Examples

```bash
# create a session
curl -X POST http://localhost:9098/api/v1/sessions

# non-streaming chat
curl -X POST http://localhost:9098/api/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is the time in Bengaluru?","session_id":"<id>"}'

# streaming chat (SSE)
curl -N -X POST http://localhost:9098/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"hotels in Las Vegas by Margie?","session_id":"<id>"}'
```

## Configuration

All settings are read from `backend/.env` (see `.env.example`).

| Variable | Default | Notes |
|---|---|---|
| `SERVER_NAME` | Consolidated MAF Agent | OpenAPI title |
| `SERVER_VERSION` | 0.1.0 | |
| `HOST` | 0.0.0.0 | |
| `PORT` | 9098 | |
| `CORS_ALLOW_ORIGINS` | `*` | Comma-separated list |
| `HTTPS_ENABLED` | false | If true, requires `SSL_CERTFILE` + `SSL_KEYFILE` |
| `RATE_LIMIT_ENABLED` | false | Toggles `slowapi` |
| `RATE_LIMIT_DEFAULT` | 60/minute | Used when rate-limit is enabled |
| `AZURE_AI_PROJECT_ENDPOINT` | _required_ | |
| `AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME` | gpt-4o | |
| `API_KEY` | _required_ | Bearer for MAGIC v22 MCP |
| `TRAVEL_AGENT_NAME` | travel-support-agent | |
| `TRAVEL_AGENT_VERSION` | 2 | |
| `MS_LEARN_MCP_URL` | https://learn.microsoft.com/api/mcp | |
| `MAGIC_V22_MCP_URL` | http://localhost:9898/mcp | |
| `LOGS_DIR` | ../logs | |
| `BLACKLIST_PATH` | ../db/blacklist.txt | |
| `CHAT_HISTORY_DATABASE_URL` | sqlite:///../db/chat_history.db | |
| `DATABASE_URL` | sqlite:///../db/tickets.db | |

## Run with Docker

```bash
docker compose up --build
```

The compose file mounts `../logs` and `../db` so chat history and the agent log persist across restarts.

## Project layout

```
backend/
├── app/
│   ├── core/         # config, logging, banner, paths
│   ├── tools/        # utility @tools, MCP tools, travel FoundryAgent-as-tool, ticket tool re-exports
│   ├── middleware/   # InputGuardrail, ExceptionHandling, Logging
│   ├── history/      # SqliteHistoryProvider
│   ├── agent/        # instructions + factory (singleton built at startup)
│   ├── api/v1/       # routes + schemas + DI
│   └── main.py       # FastAPI app factory
└── server.py         # uvicorn entry
```

## License

[MIT](LICENSE)
