/**
 * API client for the Consolidated MAF Agent backend.
 * Base URL is injected by Vite at build time via VITE_API_BASE_URL.
 */

const BASE = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9098').replace(/\/$/, '');
const V1   = `${BASE}/api/v1`;

// ── Helpers ──────────────────────────────────────────────────────────────────

async function request(path, init = {}) {
  const res = await fetch(`${V1}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail ?? detail; } catch { /* ignore */ }
    throw new Error(`${res.status}: ${detail}`);
  }
  return res;
}

// ── Session ──────────────────────────────────────────────────────────────────

/**
 * Create a new chat session.
 * @returns {Promise<{ session_id: string }>}
 */
export async function createSession() {
  const res = await request('/sessions', { method: 'POST' });
  return res.json();
}

/**
 * Fetch message history for a session.
 * @param {string} sessionId
 * @returns {Promise<Array<{ role: string, content: string, created_at: string }>>}
 */
export async function getMessages(sessionId) {
  const res = await request(`/sessions/${encodeURIComponent(sessionId)}/messages`);
  return res.json();
}

// ── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Blocking chat — returns full response.
 * @param {{ session_id: string, message: string }} payload
 * @returns {Promise<{ session_id: string, response: string }>}
 */
export async function chat(payload) {
  const res = await request('/chat', { method: 'POST', body: JSON.stringify(payload) });
  return res.json();
}

/**
 * Streaming chat via SSE.
 * Calls `onDelta(delta: string)` for each chunk, then resolves when stream ends.
 *
 * @param {{ session_id: string, message: string }} payload
 * @param {(delta: string) => void} onDelta
 * @param {AbortSignal} [signal]
 */
export async function chatStream(payload, onDelta, signal) {
  const res = await fetch(`${V1}/chat/stream`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail ?? detail; } catch { /* ignore */ }
    throw new Error(`${res.status}: ${detail}`);
  }

  const reader  = res.body.getReader();
  const decoder = new TextDecoder();
  let   buffer  = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep incomplete last line

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') return;
      try {
        const obj = JSON.parse(raw);
        if (obj.delta) onDelta(obj.delta);
      } catch { /* malformed chunk — skip */ }
    }
  }
}

// ── Info / Health ─────────────────────────────────────────────────────────────

/**
 * @returns {Promise<import('./types').InfoResponse>}
 */
export async function getInfo() {
  const res = await request('/info');
  return res.json();
}

/**
 * @returns {Promise<{ status: string, uptime_seconds: number }>}
 */
export async function getHealth() {
  const res = await request('/health');
  return res.json();
}
