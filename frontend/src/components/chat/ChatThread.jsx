import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';
import { useChatState, useActiveSession } from '../../store/chatStore.jsx';
import { Bot } from 'lucide-react';

/**
 * Scrollable message thread.
 * Auto-scrolls to bottom on new messages and while streaming.
 */
export function ChatThread() {
  const { loading, streamState } = useChatState();
  const session = useActiveSession();
  const bottomRef = useRef(null);

  const messages = session?.messages ?? [];

  // Auto-scroll when messages change or streaming
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, streamState]);

  // Empty state
  if (messages.length === 0 && !loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
          <Bot size={28} strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-base font-semibold text-[var(--color-on-surface)]">
            How can I help you today?
          </p>
          <p className="text-sm text-[var(--color-outline)] mt-1">
            Ask me anything — I can help with tickets, travel, time, weather, and more.
          </p>
        </div>
      </div>
    );
  }

  // Show TypingIndicator only when loading in blocking (non-streaming) mode,
  // or while waiting for the first streaming chunk (stream started but last msg is still empty).
  const showTyping = loading && (
    streamState === false ||
    (streamState === 'streaming' && messages[messages.length - 1]?.content === '')
  );

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-[48rem] flex flex-col gap-5">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            role={msg.role}
            content={msg.content}
            created_at={msg.created_at}
          />
        ))}
        {showTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
