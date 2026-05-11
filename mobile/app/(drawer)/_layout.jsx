import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useTheme } from '../../src/theme/ThemeContext.jsx';
import { DrawerContent } from '../../src/components/layout/DrawerContent.jsx';
import { spacing } from '../../src/theme/tokens.js';

export default function DrawerLayout() {
  const { colors } = useTheme();

  return (
    <Drawer
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: spacing.sidebarWidth,
          backgroundColor: colors.surfaceContainerLow,
        },
        overlayColor: 'rgba(0,0,0,0.40)',
        swipeEdgeWidth: 40,
      }}
    />
  );
}
