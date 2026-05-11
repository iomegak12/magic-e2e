import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import { Plus, Sun, Moon, MessageSquare, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { useChatState } from '../../store/chatStore.jsx';
import { useSessions } from '../../hooks/useSessions.js';
import { spacing, radius, fontSize, fontFamily } from '../../theme/tokens.js';

export function DrawerContent(props) {
  const { colors, theme, toggleTheme } = useTheme();
  const { agentInfo }                  = useChatState();
  const { sessions, activeSessionId, createNewSession, loadSession, removeSession } = useSessions();
  const router = useRouter();

  const handleNewChat = async () => {
    const id = await createNewSession();
    if (id) {
      props.navigation.closeDrawer();
      router.replace('/(drawer)/');
    }
  };

  const handleSession = async (sessionId) => {
    await loadSession(sessionId);
    props.navigation.closeDrawer();
    router.replace('/(drawer)/');
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.container, { backgroundColor: colors.surfaceContainerLow }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.appName, { color: colors.onSurface }]}>Cortex</Text>
        {agentInfo && (
          <Text style={[styles.agentVersion, { color: colors.outline }]}>
            v{agentInfo.version}
          </Text>
        )}
      </View>

      {/* New Chat */}
      <TouchableOpacity
        onPress={handleNewChat}
        activeOpacity={0.8}
        style={[styles.newChatBtn, { backgroundColor: colors.primary }]}
      >
        <Plus size={16} strokeWidth={2} color={colors.onPrimary} />
        <Text style={[styles.newChatLabel, { color: colors.onPrimary }]}>New Chat</Text>
      </TouchableOpacity>

      {/* Session list */}
      <Text style={[styles.sectionLabel, { color: colors.outline }]}>RECENT</Text>
      <FlatList
        data={sessions}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const isActive = item.id === activeSessionId;
          const preview  = item.messages.findLast(m => m.role === 'user')?.content ?? 'Empty session';
          return (
            <TouchableOpacity
              onPress={() => handleSession(item.id)}
              activeOpacity={0.75}
              style={[
                styles.sessionRow,
                isActive && { backgroundColor: colors.primaryContainer },
                { borderRadius: radius.lg },
              ]}
            >
              <MessageSquare
                size={15}
                strokeWidth={2}
                color={isActive ? colors.onPrimaryContainer : colors.onSurfaceVariant}
                style={styles.sessionIcon}
              />
              <Text
                style={[
                  styles.sessionText,
                  { color: isActive ? colors.onPrimaryContainer : colors.onSurface },
                ]}
                numberOfLines={2}
              >
                {preview}
              </Text>
              <TouchableOpacity
                onPress={() => removeSession(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.deleteBtn}
                accessibilityLabel="Delete session"
              >
                <Trash2 size={13} strokeWidth={2} color={colors.outline} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.outline }]}>No sessions yet</Text>
        }
      />

      {/* Footer: theme toggle + agent tools */}
      <View style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeRow} activeOpacity={0.7}>
          {theme === 'dark'
            ? <Sun  size={16} strokeWidth={2} color={colors.onSurfaceVariant} />
            : <Moon size={16} strokeWidth={2} color={colors.onSurfaceVariant} />
          }
          <Text style={[styles.themeLabel, { color: colors.onSurfaceVariant }]}>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </Text>
        </TouchableOpacity>

        {agentInfo && (
          <Text style={[styles.agentName, { color: colors.outline }]}>
            {agentInfo.name} · {(agentInfo.tools ?? []).length} tools
          </Text>
        )}
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container:     { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  header:        { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm, marginBottom: spacing.xl },
  appName:       { fontFamily: fontFamily.semibold, fontSize: fontSize.headlineMd },
  agentVersion:  { fontFamily: fontFamily.regular,  fontSize: fontSize.caption },
  newChatBtn:    { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderRadius: radius.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.xl },
  newChatLabel:  { fontFamily: fontFamily.medium, fontSize: fontSize.labelMd },
  sectionLabel:  { fontFamily: fontFamily.semibold, fontSize: fontSize.caption, letterSpacing: 0.8, marginBottom: spacing.sm },
  sessionRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.sm, marginBottom: 2 },
  sessionIcon:   { marginTop: 2, flexShrink: 0 },
  sessionText:   { flex: 1, fontFamily: fontFamily.regular, fontSize: fontSize.bodyMd - 1 },
  deleteBtn:     { padding: 2, flexShrink: 0 },
  emptyText:     { fontFamily: fontFamily.regular, fontSize: fontSize.bodyMd, marginTop: spacing.sm },
  footer:        { marginTop: 'auto', paddingTop: spacing.lg, borderTopWidth: 1, paddingBottom: spacing.lg, gap: spacing.sm },
  themeRow:      { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  themeLabel:    { fontFamily: fontFamily.medium, fontSize: fontSize.bodyMd - 1 },
  agentName:     { fontFamily: fontFamily.regular, fontSize: fontSize.caption },
});
