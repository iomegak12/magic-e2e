# Troubleshooting

## Blank page after `npm run dev`

- Confirm the `.env` file exists and `VITE_API_BASE_URL` points to the running backend.
- Check the browser console for CORS errors; ensure the backend has `CORS_ALLOW_ORIGINS=*` or includes the dev origin.

## "Failed to fetch" on first message

- The backend is likely not running. Start it: `cd ../backend && python server.py`
- Verify it is healthy: `curl http://localhost:9098/api/v1/health`

## Streaming produces no output

- Confirm the backend exposes `POST /api/v1/chat/stream` (present since v0.1.0).
- Check for browser extensions (e.g. ad-blockers) that may interrupt SSE connections.

## Docker: port already in use

```bash
docker compose down
docker compose up --build
```

If port 8080 is occupied, change the host port in `docker-compose.yml`:
```yaml
ports:
  - "3000:8080"
```

## Theme flickers on load

The `index.html` inline script reads `localStorage` and applies the `dark` class before paint. If you see a flash, ensure your browser is not blocking `localStorage` (private/incognito mode may restrict it).
