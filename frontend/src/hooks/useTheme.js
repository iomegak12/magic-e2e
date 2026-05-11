import { useEffect, useCallback } from 'react';

const STORAGE_KEY = 'cortex-theme';

/**
 * Reads the current theme from <html> class list.
 * @returns {'dark'|'light'}
 */
function readTheme() {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Applies a theme and persists it.
 * @param {'dark'|'light'} theme
 */
function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  try { localStorage.setItem(STORAGE_KEY, theme); } catch { /* private mode */ }
}

/**
 * Hook that returns the current theme and a toggle function.
 * The initial theme is already applied by the inline script in index.html,
 * so this hook is purely a control surface.
 */
export function useTheme() {
  // Sync on mount in case the inline script ran before React hydrated
  useEffect(() => {
    const stored = (() => { try { return localStorage.getItem(STORAGE_KEY); } catch { return null; } })();
    if (stored === 'dark' || stored === 'light') {
      applyTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      applyTheme('dark');
    }
  }, []);

  const theme = readTheme();

  const toggle = useCallback(() => {
    applyTheme(readTheme() === 'dark' ? 'light' : 'dark');
    // Force a re-render by dispatching a custom event that App.jsx listens to
    window.dispatchEvent(new Event('cortex-theme-change'));
  }, []);

  return { theme, toggle };
}
