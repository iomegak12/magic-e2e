import React from 'react';
import { Plus, MessageSquare, Trash2, Bot } from 'lucide-react';
import { IconButton } from '../ui/Button.jsx';
import { useChatState } from '../../store/chatStore.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { Sun, Moon } from 'lucide-react';

/**
 * Sidebar — session list + new-session button + theme toggle.
 *
 * @param {{
 *   onNewSession: () => void,
 *   onSelectSession: (id: string) => void,
 *   onRemoveSession: (id: string) => void,
 * }} props
 */
export function Sidebar({ onNewSession, onSelectSession, onRemoveSession }) {
  const { sessions, activeSessionId, agentInfo } = useChatState();
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <div className="flex flex-col h-full select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-outline-variant)]">
        <div className="flex items-center gap-2 min-w-0">
          <Bot size={18} strokeWidth={2} className="text-[var(--color-primary)] flex-shrink-0" />
          <span className="text-sm font-semibold text-[var(--color-on-surface)] truncate">
            {agentInfo?.name ?? 'Cortex'}
          </span>
          {agentInfo?.version && (
            <span className="text-[10px] text-[var(--color-outline)] font-mono flex-shrink-0">
              v{agentInfo.version}
            </span>
          )}
        </div>
        <IconButton label="Toggle theme" size="sm" onClick={toggleTheme}>
          {theme === 'dark'
            ? <Sun size={15} strokeWidth={2} />
            : <Moon size={15} strokeWidth={2} />
          }
        </IconButton>
      </div>

      {/* New session */}
      <div className="px-3 py-2">
        <button
          onClick={onNewSession}
          className={
            'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ' +
            'text-[var(--color-on-surface-variant)] ' +
            'hover:bg-[var(--color-surface-container)] transition-colors'
          }
        >
          <Plus size={15} strokeWidth={2} />
          New chat
        </button>
      </div>

      {/* Session list */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
        {sessions.length === 0 && (
          <p className="px-3 py-2 text-xs text-[var(--color-outline)]">No sessions yet</p>
        )}
        {sessions.map(session => {
          const isActive = session.id === activeSessionId;
          // Use first user message as label, fall back to truncated ID
          const label =
            session.messages.find(m => m.role === 'user')?.content?.slice(0, 40) ??
            session.id.slice(0, 16) + '…';

          return (
            <div
              key={session.id}
              className={
                'group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ' +
                (isActive
                  ? 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]'
                  : 'text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)]')
              }
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={14} strokeWidth={2} className="flex-shrink-0 opacity-60" />
              <span className="flex-1 text-sm truncate">{label}</span>
              <IconButton
                label="Remove session"
                size="sm"
                className={
                  'opacity-0 group-hover:opacity-100 transition-opacity ' +
                  (isActive ? 'text-[var(--color-on-primary-container)]' : '')
                }
                onClick={(e) => { e.stopPropagation(); onRemoveSession(session.id); }}
              >
                <Trash2 size={13} strokeWidth={2} />
              </IconButton>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
