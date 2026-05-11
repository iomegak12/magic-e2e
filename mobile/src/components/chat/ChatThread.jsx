import React, { useEffect, useRef } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Bot } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { useActiveSession, useChatState } from '../../store/chatStore.jsx';
import { spacing, fontSize, fontFamily } from '../../theme/tokens.js';
import { MessageBubble } from './MessageBubble.jsx';
import { TypingIndicator } from './TypingIndicator.jsx';

export function ChatThread() {
  const { colors }  = useTheme();
  const session     = useActiveSession();
  const { loading, streamState } = useChatState();
  const listRef     = useRef(null);
  const messages    = session?.messages ?? [];

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  // Show typing indicator when loading and not yet streaming content
  const showTyping = loading && (
    streamState !== 'streaming' ||
    (messages.length > 0 && messages[messages.length - 1]?.content === '')
  );

  if (!session) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <Bot size={40} strokeWidth={1.5} color={colors.outlineVariant} />
        <Text style={[styles.emptyTitle, { color: colors.onSurfaceVariant }]}>
          No active session
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.outline }]}>
          Create a new chat to get started.
        </Text>
      </View>
    );
  }

  if (messages.length === 0 && !loading) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.surface }]}>
        <Bot size={40} strokeWidth={1.5} color={colors.outlineVariant} />
        <Text style={[styles.emptyTitle, { color: colors.onSurfaceVariant }]}>
          How can I help you today?
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.outline }]}>
          Ask anything — I'm ready.
        </Text>
      </View>
    );
  }

  const data = showTyping ? [...messages, { _typing: true, role: '__typing__' }] : messages;

  return (
    <FlatList
      ref={listRef}
      data={data}
      keyExtractor={(item, idx) => item._typing ? '__typing__' : `${item.role}-${idx}`}
      contentContainerStyle={[styles.list, { backgroundColor: colors.surface }]}
      style={{ backgroundColor: colors.surface }}
      renderItem={({ item }) => {
        if (item._typing) return <TypingIndicator />;
        return <MessageBubble role={item.role} content={item.content} created_at={item.created_at} />;
      }}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing['2xl'],
  },
  emptyTitle: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.bodyLg,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyMd,
    textAlign: 'center',
  },
});
