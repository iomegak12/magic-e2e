import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { spacing, radius } from '../../theme/tokens.js';

const DOT_SIZE    = 8;
const DURATION    = 400;
const STAGGER     = 150;
const MIN_OPACITY = 0.25;

function Dot({ delay, color }) {
  const opacity = useRef(new Animated.Value(MIN_OPACITY)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(opacity, { toValue: 1,           duration: DURATION, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: MIN_OPACITY, duration: DURATION, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [delay, opacity]);

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: color, borderRadius: DOT_SIZE / 2, opacity },
      ]}
    />
  );
}

export function TypingIndicator() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceContainerLow, borderColor: colors.outlineVariant }]}>
      <Dot delay={0 * STAGGER}  color={colors.primary} />
      <Dot delay={1 * STAGGER}  color={colors.primary} />
      <Dot delay={2 * STAGGER}  color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.xl,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
  },
});
