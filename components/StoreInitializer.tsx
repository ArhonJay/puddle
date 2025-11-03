'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/authStore';
import { useThemeStore } from '@/lib/store/themeStore';

/**
 * Store Initializer Component
 * Initializes Zustand stores on app mount
 * Place this in the root layout
 */
export function StoreInitializer() {
  const initAuth = useAuthStore((state) => state.initializeAuth);
  const initTheme = useThemeStore((state) => state.initializeTheme);

  useEffect(() => {
    // Initialize stores from localStorage
    initAuth();
    initTheme();
  }, [initAuth, initTheme]);

  // This component doesn't render anything
  return null;
}
