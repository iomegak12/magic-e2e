import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Bot, User } from 'lucide-react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { radius, spacing, fontSize, fontFamily } from '../../theme/tokens.js';

/**
 * @param {{ role: 'user'|'assistant', content: string, created_at?: string }} props
 */
export function MessageBubble({ role, content, created_at }) {
  const { colors, theme } = useTheme();
  const isUser = role === 'user';

  const time = created_at
    ? new Date(created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  // Markdown style rules for assistant bubbles
  const mdStyles = {
    body: {
      color: colors.onSurface,
      fontFamily: fontFamily.regular,
      fontSize: fontSize.bodyMd,
    },
    paragraph: {
      color: colors.onSurface,
      fontFamily: fontFamily.regular,
      fontSize: fontSize.bodyMd,
      lineHeight: fontSize.bodyMd * 1.5,
      marginTop: 0,
      marginBottom: 6,
    },
    heading1: { fontFamily: fontFamily.semibold, fontSize: fontSize.headlineMd, marginBottom: 6, marginTop: 10, color: colors.onSurface },
    heading2: { fontFamily: fontFamily.semibold, fontSize: fontSize.bodyLg,    marginBottom: 4, marginTop: 8,  color: colors.onSurface },
    heading3: { fontFamily: fontFamily.semibold, fontSize: fontSize.bodyMd,    marginBottom: 4, marginTop: 6,  color: colors.onSurface },
    strong:   { fontFamily: fontFamily.semibold, color: colors.onSurface },
    em:       { fontStyle: 'italic',             color: colors.onSurface },
    link:     { color: colors.primary, textDecorationLine: 'underline' },
    blockquote: {
      backgroundColor: colors.surfaceContainerHigh,
      borderLeftWidth: 3,
      borderLeftColor: colors.outlineVariant,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginVertical: 4,
    },
    code_inline: {
      fontFamily: 'monospace',
      fontSize: fontSize.caption,
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: 4,
      paddingHorizontal: 4,
      color: colors.onSurface,
    },
    fence: {
      backgroundColor: colors.surfaceContainerHigh,
      borderRadius: radius.md,
      padding: 10,
      marginVertical: 6,
    },
    code_block: {
      fontFamily: 'monospace',
      fontSize: fontSize.caption,
      color: colors.onSurface,
    },
    bullet_list: { marginBottom: 4 },
    ordered_list: { marginBottom: 4 },
    list_item: { marginBottom: 2 },
    hr: { backgroundColor: colors.outlineVariant, height: 1, marginVertical: 8 },
    table: { borderWidth: 1, borderColor: colors.outlineVariant, marginVertical: 6 },
    th:    { backgroundColor: colors.surfaceContainerHigh, fontFamily: fontFamily.semibold, padding: 6, borderWidth: 1, borderColor: colors.outlineVariant },
    td:    { padding: 6, borderWidth: 1, borderColor: colors.outlineVariant },
  };

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {/* Avatar */}
      <View style={[
        styles.avatar,
        isUser
          ? { backgroundColor: colors.secondaryContainer }
          : { backgroundColor: colors.primaryContainer },
      ]}>
        {isUser
          ? <User  size={15} strokeWidth={2} color={colors.onSecondaryContainer} />
          : <Bot   size={15} strokeWidth={2} color={colors.onPrimaryContainer}   />
        }
      </View>

      {/* Bubble */}
      <View style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapAssistant]}>
        <View style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.primary,              borderBottomRightRadius: radius.sm }
            : { backgroundColor: colors.surfaceContainerLow,  borderBottomLeftRadius: radius.sm,
                borderWidth: 1, borderColor: colors.outlineVariant },
        ]}>
          {isUser ? (
            <Text style={[styles.userText, { color: colors.onPrimary }]}>{content}</Text>
          ) : (
            <Markdown style={mdStyles}>{content}</Markdown>
          )}
        </View>
        {time && (
          <Text style={[styles.time, { color: colors.outline }]}>{time}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row:            { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  rowUser:        { flexDirection: 'row-reverse' },
  rowAssistant:   { flexDirection: 'row' },
  avatar: {
    width: 32, height: 32,
    borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  bubbleWrap:          { flexShrink: 1, maxWidth: '82%', gap: 2 },
  bubbleWrapUser:      { alignItems: 'flex-end' },
  bubbleWrapAssistant: { alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.xl,
  },
  userText: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyMd,
    lineHeight: fontSize.bodyMd * 1.5,
  },
  time: {
    fontSize: fontSize.caption - 1,
    paddingHorizontal: 4,
  },
});
