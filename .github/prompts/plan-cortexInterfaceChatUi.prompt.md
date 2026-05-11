# Plan: Cortex Interface — React Chat UI

The DESIGN.md describes a "Digital Sanctuary" aesthetic (lavender primary, glassmorphism, soft-tech shapes, Inter font). We'll build a minimal single-page chat UI with a session sidebar and streaming toggle, implementing those design tokens faithfully via Tailwind v3 + CSS custom properties. Sessions are tracked in `localStorage` (the backend has no `GET /sessions` list endpoint), with message history loaded on demand from the backend.

---

## Phase 1 — Scaffold & Project Files

1. `frontend/package.json` — react 18, react-dom, vite, @vitejs/plugin-react, tailwindcss, postcss, autoprefixer, lucide-react (icons)
2. `frontend/vite.config.js` — React plugin, define `VITE_API_BASE_URL`
3. `frontend/tailwind.config.js` — extend theme with all DESIGN.md tokens (colors, typography scale, border-radius, spacing), `darkMode: 'class'`
4. `frontend/postcss.config.js`
5. `frontend/index.html` — Inter font from Google Fonts, `<div id="root">`
6. `frontend/.env.example` — `VITE_API_BASE_URL=http://localhost:9098`
7. Standard files: `.gitignore`, `.dockerignore`, `LICENSE` (MIT), `README.md`, `CONTRIBUTING.md`, `TROUBLESHOOTING.md`, `CHANGELOG.md`
8. `frontend/nginx.conf` — serve static on port 8080, SPA fallback (`try_files $uri /index.html`)
9. `frontend/Dockerfile` — **stage 1** `node:20-alpine`: `npm ci` + `npm run build`; **stage 2** `nginx:alpine`: copy `dist/` + `nginx.conf`, `EXPOSE 8080`, no HEALTHCHECK
10. `frontend/docker-compose.yml` — service `cortex-ui`, build context `.`, port `8080:8080`, `env_file ./.env`

---

## Phase 2 — Core State & API

11. `src/index.css` — CSS custom properties for all DESIGN.md color tokens (both `:root` light and `.dark` dark overrides), Inter font-face, global resets
12. `src/main.jsx` — mount, theme init (`<html class="dark/light">` from localStorage before paint)
13. `src/store/chatStore.jsx` — `useReducer` + React Context; state: `{ sessions[], activeSessionId, messages[], streaming: true, loading: false, agentInfo: null }`; actions: SET_SESSIONS, UPSERT_SESSION, SET_ACTIVE, SET_MESSAGES, ADD_MESSAGE, APPEND_DELTA, SET_STREAMING, SET_LOADING, SET_INFO
14. `src/api/client.js` — `chat(payload)`, `chatStream(payload, onDelta, onDone)` (reads SSE via `fetch` + `ReadableStream`), `createSession()`, `getMessages(sessionId)`, `getInfo()`, `getHealth()`
15. `src/hooks/useTheme.js` — toggle `dark` class on `<html>`, persist to `localStorage`
16. `src/hooks/useChat.js` — `sendMessage(text)`: branches on `store.streaming`; calls `client.chat` or `client.chatStream`; dispatches ADD_MESSAGE / APPEND_DELTA
17. `src/hooks/useSessions.js` — `createNewSession()`, `loadSession(id)` (fetch messages), `persistSessions(sessions)` (localStorage), `listSessions()` (localStorage read)
18. `src/App.jsx` — wraps everything in `ChatStoreProvider`, renders `ChatPage`

---

## Phase 3 — UI Components

19. `src/components/ui/Button.jsx` — primary / ghost / icon variants, lavender ring focus
20. `src/components/ui/IconButton.jsx` — icon-only round button
21. `src/components/ui/Badge.jsx` — pill chip (status / category)
22. `src/components/layout/AppShell.jsx` — flex container: fixed sidebar + scrollable main stage
23. `src/components/layout/Sidebar.jsx` — "New Chat" button, scrollable session list (name = first message preview truncated, timestamp), theme toggle at bottom, agent info footer (tool count, version)
24. `src/components/chat/MessageBubble.jsx` — AI: unbordered, icon left, `body-lg` type; User: lavender-tinted bubble, right-aligned; supports `isStreaming` prop to show cursor blink
25. `src/components/chat/TypingIndicator.jsx` — 3-dot bounce animation, shown while `loading && streaming`
26. `src/components/chat/ChatThread.jsx` — scrollable list, auto-scrolls to bottom, renders `MessageBubble` list + `TypingIndicator`, centered `max-w-3xl`
27. `src/components/chat/PromptBar.jsx` — **floating**, glassmorphism background, multi-line textarea (auto-resize), Send button, streaming toggle inline, Enter = send / Shift+Enter = newline

---

## Phase 4 — Page Assembly

28. `src/pages/ChatPage.jsx` — assembles `AppShell` (Sidebar + ChatThread + PromptBar), shows empty-state when no session active ("Start a new conversation")

---

## Phase 5 — Validate

29. `get_errors` across all `src/` files; fix any issues

---

## API Contract Reference

| Method | Endpoint | Used by |
|--------|----------|---------|
| POST | `/api/v1/sessions` | `useSessions.createNewSession()` |
| GET | `/api/v1/sessions/{id}/messages` | `useSessions.loadSession()` |
| POST | `/api/v1/chat` | `client.chat()` — non-streaming |
| POST | `/api/v1/chat/stream` | `client.chatStream()` — SSE |
| GET | `/api/v1/info` | sidebar footer (tool count, version) |

SSE format from backend: `data: {"session_id": "...", "delta": "..."}` per chunk, `data: [DONE]` to signal end.

---

## Decisions

- Session list: stored in `localStorage` (not backend) since `/api/v1/sessions` is create-only
- State management: `useReducer` + Context (no Zustand — minimal app, no extra lib)
- Icons: `lucide-react` (matches the 2px-stroke rounded icon style from DESIGN.md)
- No TypeScript per requirement; JSDoc comments on exported functions only
- Streaming: `fetch` + `ReadableStream` (not `EventSource`) — more control over error handling with POST
- Dark mode: `darkMode: 'class'` in Tailwind; CSS custom properties mapped per theme; toggled on `<html>`

---

## Excluded

- No auth, no file uploads, no markdown rendering library (plain text only, matching "minimal" requirement)
- No health endpoint display in UI
