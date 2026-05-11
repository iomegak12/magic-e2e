/**
 * API client — React Native port of the web client.
 * Base URL read from EXPO_PUBLIC_API_BASE_URL (set in .env).
 * Default is 10.0.2.2:9098 — Android emulator alias for host localhost.
 */

const BASE = (process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://10.0.2.2:9098').replace(/\/$/, '');
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

/** @returns {Promise<{ session_id: string }>} */
export async function createSession() {
  const res = await request('/sessions', { method: 'POST' });
  return res.json();
}

/**
 * @param {string} sessionId
 * @returns {Promise<Array<{ role: string, content: string, created_at: string }>>}
 */
export async function getMessages(sessionId) {
  const res = await request(`/sessions/${encodeURIComponent(sessionId)}/messages`);
  return res.json();
}

// ── Chat ─────────────────────────────────────────────────────────────────────

/**
 * Blocking chat.
 * @param {{ session_id: string, message: string }} payload
 * @returns {Promise<{ session_id: string, response: string }>}
 */
export async function chat(payload) {
  const res = await request('/chat', { method: 'POST', body: JSON.stringify(payload) });
  return res.json();
}

/**
 * Streaming chat via SSE.
 * React Native (Hermes, RN 0.76+) supports fetch + ReadableStream.
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
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith('data:')) continue;
      const raw = line.slice(5).trim();
      if (raw === '[DONE]') return;
      try {
        const obj = JSON.parse(raw);
        if (obj.delta) onDelta(obj.delta);
      } catch { /* malformed chunk */ }
    }
  }
}

// ── Info / Health ─────────────────────────────────────────────────────────────

export async function getInfo() {
  const res = await request('/info');
  return res.json();
}

export async function getHealth() {
  const res = await request('/health');
  return res.json();
}
