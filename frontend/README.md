# Cortex Interface

Chat UI for the **Consolidated MAF Agent** — built with React 18 + Vite + Tailwind CSS.

## Features

- Streaming (SSE) and non-streaming chat modes with a user-facing toggle
- Session sidebar with history (localStorage for session list, backend for message history)
- Dark / light theme toggle with system preference detection and persistence
- Minimal, design-token-driven UI (Inter font, lavender primary, glassmorphism prompt bar)

## Requirements

- Node.js 20+
- npm 10+
- Consolidated MAF Agent backend running (see `backend/`)

## Quick Start

```bash
cp .env.example .env          # set VITE_API_BASE_URL if backend is not on localhost:9098
npm install
npm run dev                   # http://localhost:5173
```

## Build

```bash
npm run build                 # outputs to dist/
npm run preview               # preview built output locally
```

## Run with Docker

```bash
cp .env.example .env
docker compose up --build     # http://localhost:8080
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:9098` | Backend API base URL (no trailing slash) |

## License

MIT — see [LICENSE](LICENSE).
