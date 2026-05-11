import React, { useState, useCallback, useEffect } from 'react';
import { PanelLeftOpen, PanelLeftClose, AlertCircle, X } from 'lucide-react';
import { AppShell } from '../components/layout/AppShell.jsx';
import { Sidebar }  from '../components/layout/Sidebar.jsx';
import { ChatThread } from '../components/chat/ChatThread.jsx';
import { PromptBar }  from '../components/chat/PromptBar.jsx';
import { IconButton } from '../components/ui/Button.jsx';
import { useChatState, useChatDispatch, A } from '../store/chatStore.jsx';
import { useSessions } from '../hooks/useSessions.js';

/**
 * Main chat page — composes AppShell, Sidebar, ChatThread, PromptBar.
 */
export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { activeSessionId, error } = useChatState();
  const dispatch = useChatDispatch();
  const { createNewSession, loadSession, removeSession } = useSessions();

  // Close sidebar on small screens by default
  useEffect(() => {
    if (window.innerWidth < 640) setSidebarOpen(false);
  }, []);

  const handleNewSession  = useCallback(async () => { await createNewSession(); }, [createNewSession]);
  const handleSelectSession = useCallback(async (id) => { await loadSession(id); }, [loadSession]);
  const handleRemoveSession = useCallback((id) => { removeSession(id); }, [removeSession]);
  const dismissError = useCallback(() => dispatch({ type: A.CLEAR_ERROR }), [dispatch]);

  return (
    <AppShell
      sidebarOpen={sidebarOpen}
      sidebar={
        <Sidebar
          onNewSession={handleNewSession}
          onSelectSession={handleSelectSession}
          onRemoveSession={handleRemoveSession}
        />
      }
    >
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)] flex-shrink-0">
        <IconButton
          label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          size="md"
          onClick={() => setSidebarOpen(o => !o)}
        >
          {sidebarOpen
            ? <PanelLeftClose size={18} strokeWidth={2} />
            : <PanelLeftOpen  size={18} strokeWidth={2} />
          }
        </IconButton>

        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold text-[var(--color-on-surface)] truncate">
            {activeSessionId
              ? <span className="font-mono text-xs text-[var(--color-outline)]">{activeSessionId}</span>
              : 'Cortex Interface'
            }
          </h1>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className={
            'flex items-center gap-3 px-4 py-2.5 text-sm flex-shrink-0 ' +
            'bg-[var(--color-error-container)] text-[var(--color-on-error-container)]'
          }
        >
          <AlertCircle size={15} strokeWidth={2} className="flex-shrink-0" />
          <span className="flex-1 truncate">{error}</span>
          <IconButton label="Dismiss error" size="sm" onClick={dismissError}>
            <X size={14} strokeWidth={2} />
          </IconButton>
        </div>
      )}

      {/* Thread */}
      <ChatThread />

      {/* Prompt bar */}
      <PromptBar sessionId={activeSessionId} />
    </AppShell>
  );
}
