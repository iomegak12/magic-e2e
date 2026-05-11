import { useCallback } from 'react';
import { useChatDispatch, useChatState, A } from '../store/chatStore.jsx';
import { createSession as apiCreateSession, getMessages } from '../api/client.js';

const STORAGE_KEY = 'cortex-sessions';

/** Persist the ordered list of session IDs to localStorage */
function persistSessionIds(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions.map(s => s.id)));
  } catch { /* ignore */ }
}

/** Read stored session IDs (no messages — those come from backend) */
export function loadStoredSessionIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Session management hook.
 */
export function useSessions() {
  const dispatch = useChatDispatch();
  const { sessions, activeSessionId } = useChatState();

  /** Create a new session via backend, then set it as active */
  const createNewSession = useCallback(async () => {
    try {
      const { session_id } = await apiCreateSession();
      dispatch({ type: A.ADD_SESSION, sessionId: session_id });
      // Persist after state update
      setTimeout(() => persistSessionIds([{ id: session_id }, ...sessions]), 0);
      return session_id;
    } catch (err) {
      dispatch({ type: A.SET_ERROR, message: `Failed to create session: ${err.message}` });
      return null;
    }
  }, [dispatch, sessions]);

  /** Switch to an existing session, loading its history from backend if empty */
  const loadSession = useCallback(async (sessionId) => {
    dispatch({ type: A.SET_ACTIVE, sessionId });

    const existing = sessions.find(s => s.id === sessionId);
    if (existing && existing.messages.length > 0) return; // already loaded

    try {
      const messages = await getMessages(sessionId);
      dispatch({ type: A.LOAD_HISTORY, sessionId, messages });
    } catch {
      // History unavailable — continue with empty
    }
  }, [dispatch, sessions]);

  /** Remove a session from local state and localStorage */
  const removeSession = useCallback((sessionId) => {
    dispatch({ type: A.REMOVE_SESSION, sessionId });
    try {
      const ids = loadStoredSessionIds().filter(id => id !== sessionId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch { /* ignore */ }
  }, [dispatch]);

  return {
    sessions,
    activeSessionId,
    createNewSession,
    loadSession,
    removeSession,
  };
}
