import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders a single chat message bubble.
 * User messages are displayed as plain pre-wrapped text.
 * Assistant messages are rendered as GitHub-flavored Markdown.
 *
 * @param {{ role: 'user'|'assistant', content: string, created_at?: string }} props
 */
export function MessageBubble({ role, content, created_at }) {
  const isUser = role === 'user';

  const time = created_at
    ? new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}>
      {/* Avatar */}
      <div
        className={
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold mt-0.5 ' +
          (isUser
            ? 'bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]'
            : 'bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]')
        }
      >
        {isUser
          ? <User size={15} strokeWidth={2} />
          : <Bot  size={15} strokeWidth={2} />
        }
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[min(42rem,82%)] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={
            'px-4 py-3 rounded-2xl text-sm leading-relaxed ' +
            (isUser
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] rounded-tr-sm'
              : 'bg-[var(--color-surface-container)] text-[var(--color-on-surface)] rounded-tl-sm border border-[var(--color-outline-variant)]')
          }
        >
          {isUser ? (
            <div className="whitespace-pre-wrap break-words">{content}</div>
          ) : (
            <div className="message-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {time && (
          <span className="text-[10px] text-[var(--color-outline)] px-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
