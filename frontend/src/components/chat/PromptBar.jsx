import React, { useRef, useState, useCallback } from 'react';
import { Send, Square, Zap, ZapOff } from 'lucide-react';
import { IconButton } from '../ui/Button.jsx';
import { useChatState, useChatDispatch, A } from '../../store/chatStore.jsx';
import { useChat } from '../../hooks/useChat.js';

const MAX_ROWS = 8;

/**
 * Floating glassmorphism prompt bar at the bottom of the chat.
 *
 * @param {{ sessionId: string|null }} props
 */
export function PromptBar({ sessionId }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const { loading, streamingEnabled } = useChatState();
  const dispatch = useChatDispatch();
  const { sendMessage, cancelStream } = useChat();

  // Auto-resize textarea
  const handleChange = useCallback((e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    const lineH   = parseInt(getComputedStyle(el).lineHeight, 10) || 20;
    const maxH    = lineH * MAX_ROWS;
    el.style.height = Math.min(el.scrollHeight, maxH) + 'px';
  }, []);

  const handleSubmit = useCallback(() => {
    if (!text.trim() || !sessionId || loading) return;
    sendMessage(sessionId, text);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, sessionId, loading, sendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const toggleStreaming = () => dispatch({ type: A.TOGGLE_STREAMING });

  const canSend = !!text.trim() && !!sessionId && !loading;

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="mx-auto max-w-[48rem]">
        {/* Glassmorphism container */}
        <div
          className={
            'flex items-end gap-2 px-4 py-3 rounded-2xl ' +
            'bg-[var(--color-surface-container)]/80 backdrop-blur-[16px] ' +
            'border border-[var(--color-outline-variant)] ' +
            'shadow-[0_8px_32px_rgba(129,39,207,0.08)]'
          }
        >
          {/* Streaming toggle */}
          <IconButton
            label={streamingEnabled ? 'Streaming on — click to disable' : 'Streaming off — click to enable'}
            size="sm"
            active={streamingEnabled}
            onClick={toggleStreaming}
            className="flex-shrink-0 mb-0.5"
            title={streamingEnabled ? 'Streaming enabled' : 'Streaming disabled'}
          >
            {streamingEnabled
              ? <Zap size={15} strokeWidth={2} className="text-[var(--color-primary)]" />
              : <ZapOff size={15} strokeWidth={2} />
            }
          </IconButton>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message Cortex… (Enter to send, Shift+Enter for newline)"
            rows={1}
            disabled={!sessionId}
            className={
              'flex-1 resize-none bg-transparent text-sm text-[var(--color-on-surface)] ' +
              'placeholder:text-[var(--color-outline)] outline-none ' +
              'leading-relaxed min-h-[1.5rem] max-h-[12rem] overflow-y-auto ' +
              'disabled:opacity-50'
            }
          />

          {/* Send / Stop */}
          {loading ? (
            <IconButton
              label="Stop generation"
              size="sm"
              variant="primary"
              className="flex-shrink-0 mb-0.5"
              onClick={cancelStream}
            >
              <Square size={14} strokeWidth={2} fill="currentColor" />
            </IconButton>
          ) : (
            <IconButton
              label="Send message"
              size="sm"
              variant={canSend ? 'primary' : 'ghost'}
              disabled={!canSend}
              className="flex-shrink-0 mb-0.5"
              onClick={handleSubmit}
            >
              <Send size={14} strokeWidth={2} />
            </IconButton>
          )}
        </div>

        <p className="text-center text-[10px] text-[var(--color-outline)] mt-1.5">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
