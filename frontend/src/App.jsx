import React, { useEffect, useState } from 'react';
import { useChatDispatch, A } from './store/chatStore.jsx';
import { useSessions, loadStoredSessionIds } from './hooks/useSessions.js';
import { getInfo } from './api/client.js';
import ChatPage from './pages/ChatPage.jsx';

/**
 * App — root component.
 *
 * Responsibilities:
 *  - Restore sessions from localStorage on mount
 *  - Fetch agent info and store in state
 *  - Subscribe to theme-change events so the component re-renders after toggle
 *  - Render ChatPage
 */
export default function App() {
  const dispatch = useChatDispatch();
  const { createNewSession, loadSession } = useSessions();

  // Force re-render when theme changes (toggled via useTheme hook)
  const [, setThemeTick] = useState(0);
  useEffect(() => {
    const handler = () => setThemeTick(t => t + 1);
    window.addEventListener('cortex-theme-change', handler);
    return () => window.removeEventListener('cortex-theme-change', handler);
  }, []);

  // Restore sessions from localStorage and load the first one
  useEffect(() => {
    const ids = loadStoredSessionIds();
    if (ids.length === 0) {
      // No saved sessions — create a fresh one automatically
      createNewSession();
      return;
    }
    // Re-hydrate session stubs (messages loaded lazily on activation)
    ids.forEach(id => dispatch({ type: A.ADD_SESSION, sessionId: id }));
    // Activate the most recent and load its history
    loadSession(ids[0]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run once on mount

  // Fetch agent info
  useEffect(() => {
    getInfo()
      .then(info => dispatch({ type: A.SET_AGENT_INFO, info }))
      .catch(() => { /* backend may not be running yet — silently ignore */ });
  }, [dispatch]);

  return <ChatPage />;
}
