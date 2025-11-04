'use client';

import { useAuthStore } from '@/lib/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Custom hook for authentication
 * Provides convenient access to auth state and actions
 */
export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    store.initializeAuth();
  }, []);

  /**
   * Login with email and password
   */
  const loginWithEmail = async (email: string, password: string) => {
    await store.login(email, password);
    if (store.isAuthenticated) {
      router.push('/');
    }
  };

  /**
   * Login with OAuth provider
   */
  const loginWithProvider = async (provider: 'google' | 'github') => {
    await store.loginWithProvider(provider);
    if (store.isAuthenticated) {
      router.push('/');
    }
  };

  /**
   * Logout and redirect to landing page
   */
  const logout = () => {
    store.logout();
    router.push('/');
  };

  /**
   * Check if user is authenticated (for middleware/guards)
   */
  const requireAuth = () => {
    if (!store.isAuthenticated) {
      router.push('/login');
      return false;
    }
    return true;
  };

  return {
    // State
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    loginWithEmail,
    loginWithProvider,
    logout,
    requireAuth,
    clearError: store.clearError,
  };
}
