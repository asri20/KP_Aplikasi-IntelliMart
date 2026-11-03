import { useEffect } from 'react';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { STORAGE_KEYS } from '@shared/lib/constants/app';

/**
 * Theme store dengan Zustand
 * Persist ke localStorage
 */
const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'system', // 'light' | 'dark' | 'system'
      setTheme: (theme) => set({ theme }),
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: STORAGE_KEYS.THEME,
    }
  )
);

/**
 * Custom hook untuk theme management
 * Handle system preference dan localStorage persistence
 * 
 * @returns {Object} Theme state and handlers
 * @property {string} theme - Current theme ('light' | 'dark' | 'system')
 * @property {string} resolvedTheme - Actual applied theme ('light' | 'dark')
 * @property {function} setTheme - Set theme
 * @property {function} toggleTheme - Toggle between light and dark
 * 
 * @example
 * const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
 */
export function useTheme() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');

    // Determine actual theme to apply
    let resolvedTheme = theme;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';
      resolvedTheme = systemTheme;
    }

    // Apply theme class
    root.classList.add(resolvedTheme);

    // Listen to system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (theme === 'system') {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      return () =>
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
    } else {
      // Legacy browsers
      mediaQuery.addListener(handleSystemThemeChange);
      return () => mediaQuery.removeListener(handleSystemThemeChange);
    }
  }, [theme]);

  // Calculate resolved theme for return value
  const resolvedTheme =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  };
}
