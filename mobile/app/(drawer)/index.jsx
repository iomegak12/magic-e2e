import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar as RNStatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from 'expo-router';
import { Menu, X } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext.jsx';
import { useChatState, useChatDispatch, A } from '../../src/store/chatStore.jsx';
import { useSessions } from '../../src/hooks/useSessions.js';
import { loadStoredSessionIds } from '../../src/hooks/useSessions.js';
import { getInfo } from '../../src/api/client.js';
import { ChatThread } from '../../src/components/chat/ChatThread.jsx';
import { PromptBar } from '../../src/components/chat/PromptBar.jsx';
import { spacing, fontSize, fontFamily } from '../../src/theme/tokens.js';

export default function ChatScreen() {
  const { colors }     = useTheme();
  const navigation     = useNavigation();
  const dispatch       = useChatDispatch();
  const { error, activeSessionId, agentInfo } = useChatState();
  const { sessions, createNewSession, loadSession } = useSessions();

  // Bootstrap: restore sessions from AsyncStorage then ensure active session
  useEffect(() => {
    (async () => {
      // Load agent info
      try {
        const info = await getInfo();
        dispatch({ type: A.SET_AGENT_INFO, info });
      } catch { /* non-critical */ }

      // Restore persisted session IDs
      const ids = await loadStoredSessionIds();
      if (ids.length > 0) {
        for (const id of ids) {
          dispatch({ type: A.ADD_SESSION, sessionId: id });
        }
        await loadSession(ids[0]);
      } else {
        // First launch — create a new session
        await createNewSession();
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openDrawer = () => navigation.openDrawer?.();

  const headerTitle = agentInfo?.name ?? 'Cortex';

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.surface }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.outlineVariant }]}>
        <TouchableOpacity
          onPress={openDrawer}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Open menu"
          style={styles.headerBtn}
        >
          <Menu size={22} strokeWidth={2} color={colors.onSurface} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>{headerTitle}</Text>
        <View style={styles.headerBtn} />
      </View>

      {/* Error banner */}
      {error && (
        <View style={[styles.errorBanner, { backgroundColor: colors.errorContainer }]}>
          <Text style={[styles.errorText, { color: colors.onErrorContainer }]} numberOfLines={3}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => dispatch({ type: A.CLEAR_ERROR })}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={16} strokeWidth={2} color={colors.onErrorContainer} />
          </TouchableOpacity>
        </View>
      )}

      {/* Chat area */}
      <View style={styles.flex}>
        <ChatThread />
      </View>

      {/* Input */}
      <PromptBar sessionId={activeSessionId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:        { flex: 1 },
  flex:        { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerBtn:    { width: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { flex: 1, textAlign: 'center', fontFamily: fontFamily.semibold, fontSize: fontSize.bodyLg },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
  },
  errorText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.bodyMd - 1,
  },
});
