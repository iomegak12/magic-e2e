import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { radius, fontSize, fontFamily } from '../../theme/tokens.js';

/**
 * @param {{ color?: 'default'|'primary'|'success'|'warning'|'error', style?: object }} props
 */
export function Badge({ color = 'default', style, children }) {
  const { colors } = useTheme();

  const colorMap = {
    default: { bg: colors.surfaceContainerHigh, text: colors.onSurfaceVariant },
    primary: { bg: colors.primaryContainer,     text: colors.onPrimaryContainer },
    success: { bg: '#d1fae5',                   text: '#065f46' },
    warning: { bg: '#fef3c7',                   text: '#92400e' },
    error:   { bg: colors.errorContainer,       text: colors.onErrorContainer },
  };

  const { bg, text } = colorMap[color] ?? colorMap.default;

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.caption,
  },
});
