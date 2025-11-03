'use client';

import { useThemeStore } from '@/lib/store/themeStore';
import { useEffect } from 'react';

/**
 * Custom hook for theme management
 * Provides convenient access to theme state and actions
 */
export function useTheme() {
  const store = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    store.initializeTheme();
  }, []);

  /**
   * Toggle between light and dark mode
   */
  const toggle = () => {
    store.toggleTheme();
  };

  /**
   * Set specific theme
   */
  const setTheme = (theme: 'light' | 'dark') => {
    store.setTheme(theme);
  };

  /**
   * Check if current theme is dark
   */
  const isDark = store.theme === 'dark';

  return {
    theme: store.theme,
    isDark,
    toggle,
    setTheme,
  };
}
