import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useChatDispatch, useChatState, A } from '../store/chatStore.jsx';
import { createSession as apiCreateSession, getMessages } from '../api/client.js';

const STORAGE_KEY = 'cortex-sessions';

/** Read stored session IDs from AsyncStorage */
export async function loadStoredSessionIds() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function persistSessionIds(ids) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch { /* ignore */ }
}

export function useSessions() {
  const dispatch = useChatDispatch();
  const { sessions, activeSessionId } = useChatState();

  const createNewSession = useCallback(async () => {
    try {
      const { session_id } = await apiCreateSession();
      dispatch({ type: A.ADD_SESSION, sessionId: session_id });
      const ids = [session_id, ...sessions.map(s => s.id)];
      await persistSessionIds(ids);
      return session_id;
    } catch (err) {
      dispatch({ type: A.SET_ERROR, message: `Failed to create session: ${err.message}` });
      return null;
    }
  }, [dispatch, sessions]);

  const loadSession = useCallback(async (sessionId) => {
    dispatch({ type: A.SET_ACTIVE, sessionId });
    const existing = sessions.find(s => s.id === sessionId);
    if (existing && existing.messages.length > 0) return;
    try {
      const messages = await getMessages(sessionId);
      dispatch({ type: A.LOAD_HISTORY, sessionId, messages });
    } catch {
      // history unavailable — continue with empty
    }
  }, [dispatch, sessions]);

  const removeSession = useCallback(async (sessionId) => {
    dispatch({ type: A.REMOVE_SESSION, sessionId });
    const ids = sessions.filter(s => s.id !== sessionId).map(s => s.id);
    await persistSessionIds(ids);
  }, [dispatch, sessions]);

  return { sessions, activeSessionId, createNewSession, loadSession, removeSession };
}
