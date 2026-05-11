import React, { useState, useCallback } from 'react';
import { View, TextInput, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { Send, Square, Zap } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { useChatState, useChatDispatch, A } from '../../store/chatStore.jsx';
import { useChat } from '../../hooks/useChat.js';
import { IconButton } from '../ui/IconButton.jsx';
import { spacing, radius, fontSize, fontFamily } from '../../theme/tokens.js';

export function PromptBar({ sessionId }) {
  const { colors }             = useTheme();
  const { loading, streamingEnabled } = useChatState();
  const dispatch               = useChatDispatch();
  const { sendMessage, cancelStream } = useChat();
  const [text, setText]        = useState('');

  const handleSend = useCallback(() => {
    if (!text.trim() || loading) return;
    sendMessage(sessionId, text);
    setText('');
  }, [text, loading, sendMessage, sessionId]);

  const handleStop = useCallback(() => {
    cancelStream();
  }, [cancelStream]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <View style={[styles.container, { backgroundColor: colors.surfaceContainer, borderTopColor: colors.outlineVariant }]}>
        <View style={[styles.inputRow, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
          <TextInput
            style={[styles.input, { color: colors.onSurface, fontFamily: fontFamily.regular }]}
            placeholder="Message Cortex…"
            placeholderTextColor={colors.outline}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={4000}
            returnKeyType="default"
            blurOnSubmit={false}
            editable={!loading}
          />

          {/* Streaming toggle */}
          <IconButton
            size="sm"
            active={streamingEnabled}
            onPress={() => dispatch({ type: A.TOGGLE_STREAMING })}
            accessibilityLabel={streamingEnabled ? 'Disable streaming' : 'Enable streaming'}
            style={{ marginRight: 2 }}
          >
            <Zap
              size={16}
              strokeWidth={2}
              color={streamingEnabled ? colors.primary : colors.outline}
              fill={streamingEnabled ? colors.primary : 'none'}
            />
          </IconButton>

          {/* Send / Stop */}
          {loading ? (
            <IconButton
              size="sm"
              variant="primary"
              onPress={handleStop}
              accessibilityLabel="Stop response"
            >
              <Square size={14} strokeWidth={2} color={colors.onPrimary} fill={colors.onPrimary} />
            </IconButton>
          ) : (
            <IconButton
              size="sm"
              variant="primary"
              disabled={!text.trim()}
              onPress={handleSend}
              accessibilityLabel="Send message"
            >
              <Send size={15} strokeWidth={2} color={colors.onPrimary} />
            </IconButton>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius['2xl'],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: fontSize.bodyMd,
    maxHeight: 120,
    paddingTop: Platform.OS === 'ios' ? 8 : 4,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
    lineHeight: fontSize.bodyMd * 1.4,
  },
});
