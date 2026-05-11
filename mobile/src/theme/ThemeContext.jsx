import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors } from './tokens.js';

const STORAGE_KEY = 'cortex-theme';

const ThemeContext = createContext({
  theme:       'light',
  colors:      lightColors,
  toggleTheme: () => {},
});

/**
 * Wraps the app tree. Reads system color scheme as default,
 * then allows manual override persisted in AsyncStorage.
 */
export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme(); // 'dark' | 'light' | null
  const [theme, setTheme] = useState(systemScheme === 'dark' ? 'dark' : 'light');

  // On mount — load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(stored => {
        if (stored === 'dark' || stored === 'light') setTheme(stored);
      })
      .catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** @returns {{ theme: 'dark'|'light', colors: typeof import('./tokens').lightColors, toggleTheme: () => void }} */
export function useTheme() {
  return useContext(ThemeContext);
}
