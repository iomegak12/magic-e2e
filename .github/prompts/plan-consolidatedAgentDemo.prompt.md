# Plan: Consolidated MAF Showcase Notebook

Build a single self-contained notebook `experiments/consolidated-agent-demo.ipynb` that demonstrates every Microsoft Agent Framework feature from the three existing notebooks — local `@tool` Python functions, public + auth-protected MCP servers, a hosted `FoundryAgent` exposed via `as_tool()`, an inline SQLite-backed `HistoryProvider`, and the three-layer middleware stack (guardrail → exception → logging) — driven through one shared session with mixed streaming/non-streaming runs.

## User decisions
- Domain: ticket management (reuse `lib/ticket_management` tools, DB, seed) PLUS travel support (via FoundryAgent-as-tool) PLUS common utilities (weather, current time, current location) as inline `@tool` functions.
- Agent init: `FoundryChatClient.as_agent()` (BYO model + tools).
- Tools: ticket-management `@tool`s, MS Learn MCP (public), MAGIC v22 MCP (Bearer), travel `FoundryAgent.as_tool()`, plus inline weather/time/location `@tool`s.
- Middlewares: all three (guardrail, exception handling, logging).
- History: reuse existing `SqliteHistoryProvider` (DB managed by `ticket_management.chat_history_models`).
- Session: single shared session, multi-turn scenarios that exercise each tool type.
- Streaming: mixed — both styles in different cells.
- Structure: linear build-up (imports → tools → history → middleware → agent → scenarios).
- Filename: `consolidated-agent-demo.ipynb`.
- Reuse vs inline: middleware + history provider defined INLINE in the notebook (self-contained read).

## Phases

### Phase 1 — Setup
1. **Markdown intro** — what the notebook demonstrates, prerequisites (`az login`, `.env` with `AZURE_AI_PROJECT_ENDPOINT`, `AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME`, `API_KEY`), and a feature checklist.
2. **Imports + env load** — `os`, `re`, `json`, `time`, `logging`, `datetime`, `pathlib.Path`, `typing.Annotated/Any/Sequence/Callable/Awaitable`, `random`, `httpx`, `dotenv.load_dotenv`, pydantic `Field`, sqlalchemy `SQLAlchemyError`, MAF: `tool`, `AgentContext`, `AgentMiddleware`, `AgentResponse`, `HistoryProvider`, `Message`, `MiddlewareTermination`; `agent_framework.foundry`: `FoundryChatClient`, `FoundryAgent`; `agent_framework.tools`: `MCPStreamableHTTPTool`; `azure.identity.aio.AzureCliCredential`; `sys.path` append for `lib/`; ticket_management imports (`tools.*`, `chat_history_models.*`, `init_chat_history_db`, `BlockedQuery`, `ChatMessage`, `get_chat_session`); `init_chat_history_db()` + ticket DB seed if needed.
3. **Markdown: Local @tool functions**.
4. **Cell: utility @tool functions** — inline `get_weather`, `get_current_time`, `get_current_location` (all `approval_mode="never_require"`, with `Annotated[..., Field(description=...)]` args).
5. **Cell: ticket tools roster** — collect the six imported ticket tools into a `ticket_tools` list (no redefinition).

### Phase 2 — MCP tools
6. **Markdown: MCP servers**.
7. **Cell: MS Learn MCP tool** — `MCPStreamableHTTPTool(name="Microsoft Learn MCP Tool", url="https://learn.microsoft.com/api/mcp")`.
8. **Cell: MAGIC v22 MCP tool** — `MCPStreamableHTTPTool` with `httpx.AsyncClient(headers={"Authorization": f"Bearer {os.environ['API_KEY']}"}, timeout=30.0)`, `url="http://localhost:9898/mcp"`.

### Phase 3 — FoundryAgent as a tool
9. **Markdown: hosted Foundry agent as a tool**.
10. **Cell: instantiate child `FoundryAgent`** — `FoundryAgent(project_endpoint=..., agent_name="travel-support-agent", agent_version="2", credential=AzureCliCredential())`.
11. **Cell: wrap as tool** — `travel_agent_tool = agent.as_tool(name="travel-support-agent-tool", description=..., arg_name="query", arg_description=...)` (verbatim instructions reused).

### Phase 4 — History provider (inline)
12. **Markdown: persistent chat history** — explain hybrid cache + SQLite design.
13. **Cell: `SqliteHistoryProvider(HistoryProvider)`** — defined inline; uses `get_chat_session()` and `ChatMessage` from `ticket_management.chat_history_models` for storage; `provider_id="sqlite-history"`; `get_messages` / `save_messages` with hybrid cache strategy.
14. **Cell: instantiate** `history_provider = SqliteHistoryProvider()`.

### Phase 5 — Middlewares (inline)
15. **Markdown: middleware stack** — explain onion order: Guardrail → Exception → Logging.
16. **Cell: configure logger** — file handler at `../logs/agent.log` for `enterprise_ticket_agent`.
17. **Cell: `InputGuardrailMiddleware`** — loads `../db/blacklist.txt`, regex whole-word case-insensitive match against last user message, persists `BlockedQuery`, raises `MiddlewareTermination` with friendly result.
18. **Cell: `ExceptionHandlingAgentMiddleware`** — try/except around `await call_next()`, catches `TimeoutError`, `ValueError`, `SQLAlchemyError`, `Exception`; sets `context.result` to a friendly `AgentResponse`.
19. **Cell: `LoggingAgentMiddleware`** — log run-start (msg count + last user snippet), measure duration, log run-end (duration + response snippet).

### Phase 6 — Assemble parent agent
20. **Markdown: assemble agent**.
21. **Cell: credential + chat client** — `credential = AzureCliCredential()`, `client = FoundryChatClient(project_endpoint=..., model=..., credential=credential)`.
22. **Cell: consolidated agent** — `agent = client.as_agent(name="ConsolidatedAgent", instructions=<combined policy>, tools=[*ticket_tools, ms_learn_tool, magic_v22_tool, travel_agent_tool, get_weather, get_current_time, get_current_location], context_providers=[history_provider], middleware=[InputGuardrailMiddleware(BLACKLIST_PATH), ExceptionHandlingAgentMiddleware(), LoggingAgentMiddleware()])`.
23. **Cell: shared session** — `session = agent.create_session()` (single instance reused throughout scenarios).

### Phase 7 — Scenario runs (single shared session, mixed streaming)
Helper cell defines two thin printers: `run_streaming(query)` and `run_blocking(query)` that both use the same `session`.

24. **Scenario A — local @tool (utility)** *(streaming)*: "I'm at my desk in Bengaluru. What's the time and weather there right now?" — exercises `get_current_time`, `get_current_location`, `get_weather`.
25. **Scenario B — ticket management @tools** *(non-streaming)*: "Hi, I'm Ramkumar. Please raise a High priority ticket: my VPN keeps dropping every 10 minutes." Then follow-up: "Show me my open tickets." — exercises `register_ticket`, `get_tickets_by_registered_by`.
26. **Scenario C — public MCP (MS Learn)** *(streaming)*: "Use Microsoft Learn to find the latest guidance on configuring private endpoints for Azure OpenAI."
27. **Scenario D — auth MCP (MAGIC v22)** *(non-streaming)*: "Create an order in MAGIC v22 for 5 units of SKU MAG-100 for customer Acme; then list my open complaints." (matches existing demo pattern).
28. **Scenario E — FoundryAgent-as-tool (travel)** *(streaming)*: "What hotels does Margie's Travels offer in Las Vegas?" — should route through `travel-support-agent-tool`.
29. **Scenario F — guardrail trip** *(non-streaming)*: send a query containing a blacklisted word to demonstrate `InputGuardrailMiddleware` short-circuit and `BlockedQuery` row.
30. **Scenario G — exception path** *(non-streaming)*: provoke a failure (e.g., resolve a non-existent ticket id) to show `ExceptionHandlingAgentMiddleware` returning a friendly response instead of raising.
31. **Scenario H — history rehydration** *(non-streaming)*: ask "What was the ticket id you registered for me earlier?" — proves `SqliteHistoryProvider` carries context across cells.

### Phase 8 — Wrap-up
32. **Markdown: tail of agent log + chat-history row count** — tiny inspection cell that reads `../logs/agent.log` last 20 lines and counts rows in `chat_messages` and `blocked_queries`.

## Combined agent instructions (high level)
Single system prompt that merges the IT-support guidance with the strict travel/MCP tool-use policy:
- Use ticket tools for all ticket CRUD; never fabricate IDs/statuses.
- For travel-agency / hotels / itineraries questions → MUST call `travel-support-agent-tool`.
- For Microsoft / Azure / Microsoft Learn doc questions → MUST call MS Learn MCP tool.
- For order / complaint operations → MUST call MAGIC v22 MCP tool.
- For weather / time / location → call the corresponding utility tool.
- Address the user by name when known; valid ticket priorities Low/Medium/High/Critical; valid statuses Open/In Progress/On Hold/Resolved/Closed/Cancelled.

## Relevant files
- `experiments/consolidated-agent-demo.ipynb` — NEW notebook to be created.
- `experiments/lib/ticket_management/tools.py` — source of the six `@tool` ticket functions (imported, not redefined).
- `experiments/lib/ticket_management/chat_history_models.py` — `ChatMessage`, `BlockedQuery`, `get_chat_session`, `init_chat_history_db` used by inline history provider + guardrail.
- `experiments/lib/ticket_management/database.py` / `seed.py` — ticket DB init/seed if needed at top of notebook.
- `experiments/mcp-demo.ipynb` — reference for MCP tool construction (MS Learn + MAGIC v22).
- `experiments/ticket-management-agent-enterprise.ipynb` — reference for inline middleware/history provider class bodies.
- `experiments/use-foundry-agent-as-tool-in-another-agent.ipynb` — reference for `FoundryAgent` + `as_tool` parameters.
- `.env` (existing) — must already contain `AZURE_AI_PROJECT_ENDPOINT`, `AZURE_OPENAI_RESPONSES_DEPLOYMENT_NAME`, `API_KEY`.
- `db/blacklist.txt`, `db/chat_history.db`, `db/tickets.db`, `logs/agent.log` — existing artifacts reused.

## Verification
1. Open the notebook and run all cells top-to-bottom on a kernel where `az login` has been performed and the MAGIC v22 server is reachable on `localhost:9898`.
2. Phase 1–6 cells should execute without errors; the agent variable should be created.
3. Each scenario cell (A–H) prints a sensible response and, where streaming, prints incrementally.
4. After running, inspect: `logs/agent.log` shows `[run-start]`/`[run-end]` lines per scenario; `db/chat_history.db` has new rows in `chat_messages`; scenario F adds a row to `blocked_queries`; scenario G surfaces a friendly error message (no traceback in the cell output).
5. Re-run scenario H in isolation after kernel restart (without re-running A–G) to confirm history rehydration from SQLite via `SqliteHistoryProvider.get_messages`.

## Decisions / Scope
- INCLUDED: all features from the three source notebooks, in one shared session, ticket + travel + utilities domains.
- EXCLUDED: refactoring `lib/ticket_management`; new persistence schemas; auth flows beyond the existing Bearer header for MAGIC v22; production-grade error retry/backoff; unit tests.
- ASSUMPTION: existing `.env`, `lib/ticket_management` package, blacklist file, and MAGIC v22 server are all available as in the source notebooks; we reuse the same DB files.

## Further considerations
1. **Blacklist trigger for Scenario F** — A) read `db/blacklist.txt` at runtime and pick a word dynamically (recommended), B) hardcode a single word, C) append a guaranteed demo word at notebook start.
2. **MAGIC v22 reachability** — A) add a tiny TCP/HTTP probe before Scenario D and skip with a notice if down (recommended), B) let it raise and rely on the exception middleware, C) skip the scenario unconditionally if env flag set.
3. **Second agent-as-tool** — A) keep just the travel FoundryAgent-as-tool to avoid bloat (recommended), B) also wrap a local `FoundryChatClient.as_agent` as a tool to show that variant.
