# Troubleshooting

## Server fails to start

**`ModuleNotFoundError: ticket_management`**
The `TICKET_LIB_PATH` env var must point to the folder that contains `ticket_management/`. Default is `../experiments/lib`. Verify the path resolves correctly relative to where you run `server.py`.

**`KeyError: 'AZURE_AI_PROJECT_ENDPOINT'`**
You haven't created `backend/.env` (or it's missing required variables). Copy `.env.example` and fill in Azure credentials.

**`DefaultAzureCredential failed` / `AzureCliCredential failed`**
Run `az login` in the same shell before starting the server.

## Chat returns "A database error occurred"

The exception middleware caught a `SQLAlchemyError`. Check the tail of `logs/agent.log`. Most often:
- `db/` directory not writable.
- `CHAT_HISTORY_DATABASE_URL` points to a non-existent path.

## MAGIC v22 tool calls fail

The agent will report a downstream timeout or 401. Make sure:
- `localhost:9898` is reachable (run the MAGIC v22 MCP server first).
- `API_KEY` in `.env` matches the server's expected token.

## Streaming endpoint hangs in the browser

Browsers buffer SSE behind some proxies. Use `curl -N` or an SSE-aware client (e.g. `EventSource` in JS, `httpx` with `stream=True` in Python).

## Rate-limit returns 429 unexpectedly

Confirm `RATE_LIMIT_ENABLED=false` in `.env`, or raise `RATE_LIMIT_DEFAULT` (e.g. `120/minute`). Restart the server after changes.

## HTTPS won't enable

`HTTPS_ENABLED=true` requires both `SSL_CERTFILE` and `SSL_KEYFILE` to point at readable PEM files. Without them the server falls back to HTTP and prints a warning.

## Docker build fails on `pip install`

The slim base image lacks build toolchain. Build deps are added in the `builder` stage; if you've stripped them, restore `build-essential libffi-dev libssl-dev`.

## "Session not found" on `/chat`

Sessions live in-memory (`app.state.sessions`) and do not survive a restart. Persisted *messages* do — re-send any `session_id` and the agent will rehydrate context from SQLite via `SqliteHistoryProvider`.
