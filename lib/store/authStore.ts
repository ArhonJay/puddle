import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, User, AuthProvider } from '@/types/auth.types';

const STORAGE_KEY = 'puddle-auth';

/**
 * Authentication Store
 * Manages user authentication state with localStorage persistence
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 800));

          // Mock user creation - In real app, this would be an API call
          const mockUser: User = {
            id: crypto.randomUUID(),
            email,
            name: email.split('@')[0],
            provider: 'email',
            createdAt: new Date(),
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
          });
        }
      },

      loginWithProvider: async (provider: Exclude<AuthProvider, 'email'>) => {
        set({ isLoading: true, error: null });
        
        try {
          // Simulate OAuth flow delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock user creation - In real app, this would handle OAuth callback
          const mockUser: User = {
            id: crypto.randomUUID(),
            email: `user@${provider}.com`,
            name: `${provider} User`,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
            provider,
            createdAt: new Date(),
          };

          set({
            user: mockUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : `${provider} login failed`,
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        // Called on app mount to check if user is already logged in
        const state = get();
        if (state.user && state.isAuthenticated) {
          // User session exists in localStorage
          console.log('User session restored:', state.user.email);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
