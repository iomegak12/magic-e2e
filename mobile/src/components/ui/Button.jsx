import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { radius, fontFamily, fontSize } from '../../theme/tokens.js';

/**
 * @param {{
 *   variant?: 'primary'|'secondary'|'ghost',
 *   size?: 'sm'|'md',
 *   disabled?: boolean,
 *   loading?: boolean,
 *   onPress?: () => void,
 *   style?: object,
 *   children: React.ReactNode
 * }} props
 */
export function Button({ variant = 'primary', size = 'md', disabled = false, loading = false, onPress, style, children }) {
  const { colors } = useTheme();
  const s = styles(colors);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={[s.base, s[variant], s[`size_${size}`], (disabled || loading) && s.disabled, style]}
    >
      {loading
        ? <ActivityIndicator size="small" color={variant === 'primary' ? colors.onPrimary : colors.primary} />
        : <Text style={[s.label, s[`label_${variant}`], s[`labelSize_${size}`]]}>{children}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = (colors) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  size_sm: { paddingHorizontal: 12, paddingVertical: 6 },
  size_md: { paddingHorizontal: 16, paddingVertical: 10 },
  disabled: { opacity: 0.4 },
  label: {
    fontFamily: fontFamily.medium,
  },
  label_primary:   { color: colors.onPrimary },
  label_secondary: { color: colors.onSurface },
  label_ghost:     { color: colors.onSurfaceVariant },
  labelSize_sm: { fontSize: fontSize.caption },
  labelSize_md: { fontSize: fontSize.labelMd },
});
