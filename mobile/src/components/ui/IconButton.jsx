import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { radius } from '../../theme/tokens.js';

const SIZES = { sm: 32, md: 40, lg: 48 };

/**
 * @param {{
 *   size?: 'sm'|'md'|'lg',
 *   variant?: 'ghost'|'primary',
 *   active?: boolean,
 *   disabled?: boolean,
 *   onPress?: () => void,
 *   style?: object,
 *   children: React.ReactNode,
 *   accessibilityLabel: string,
 * }} props
 */
export function IconButton({ size = 'md', variant = 'ghost', active = false, disabled = false, onPress, style, children, accessibilityLabel }) {
  const { colors } = useTheme();
  const dim = SIZES[size];

  const bg = variant === 'primary'
    ? colors.primary
    : active
      ? colors.surfaceContainerHigh
      : 'transparent';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={[
        styles.base,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bg, opacity: disabled ? 0.4 : 1 },
        style,
      ]}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
