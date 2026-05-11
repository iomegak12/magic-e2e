import React from 'react';
import { Bot } from 'lucide-react';

/**
 * Animated "agent is thinking" indicator shown while loading.
 */
export function TypingIndicator() {
  return (
    <div className="flex gap-3 flex-row">
      {/* Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]">
        <Bot size={15} strokeWidth={2} />
      </div>

      {/* Dots */}
      <div className="flex items-center px-4 py-3 rounded-2xl rounded-tl-sm bg-[var(--color-surface-container)] border border-[var(--color-outline-variant)]">
        <span className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{ animationDelay: `${i * 0.15}s` }}
              className="w-2 h-2 rounded-full bg-[var(--color-outline)] animate-bounce"
            />
          ))}
        </span>
      </div>
    </div>
  );
}
