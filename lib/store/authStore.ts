import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStore, User, AuthProvider } from '@/types/auth.types';
import { mapSupabaseUser } from '@/types/auth.types';
import { createClient } from '@/lib/supabase/client';
import type { Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'puddle-auth';

// Keep track of the auth listener subscription
let authSubscription: { unsubscribe: () => void } | null = null;

/**
 * Authentication Store
 * Manages user authentication state with Supabase
 * Session is automatically persisted by Supabase in localStorage
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true, // Start with loading true to prevent flash
      error: null,

      // Actions
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setSession: (session: Session | null) => {
        set({ session });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { error: error.message };
          }

          if (data.user) {
            const user = mapSupabaseUser(data.user);
            set({
              user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }

          return {};
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          return { error: message };
        }
      },

      signup: async (email: string, password: string, name?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const supabase = createClient();
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name || email.split('@')[0],
              },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return { error: error.message };
          }

          // If email confirmation is required, user will be null
          if (data.user && data.session) {
            const user = mapSupabaseUser(data.user);
            set({
              user,
              session: data.session,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Email confirmation required
            set({ isLoading: false });
          }

          return {};
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Signup failed';
          set({ error: message, isLoading: false });
          return { error: message };
        }
      },

      loginWithProvider: async (provider: Exclude<AuthProvider, 'email'>) => {
        set({ isLoading: true, error: null });
        
        try {
          const supabase = createClient();
          const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) {
            set({ error: error.message, isLoading: false });
            return;
          }

          // OAuth will redirect, so we don't need to update state here
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : `${provider} login failed`,
            isLoading: false,
          });
        }
      },

      logout: async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
          
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: async () => {
        // Prevent multiple initializations
        if (authSubscription) {
          set({ isLoading: false });
          return;
        }

        set({ isLoading: true });
        
        try {
          const supabase = createClient();
          
          // Get current session from Supabase (it stores in localStorage automatically)
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session error:', error);
            set({ 
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false 
            });
            return;
          }

          if (session?.user) {
            const user = mapSupabaseUser(session.user);
            set({
              user,
              session,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            // No session found, clear any stale data
            set({ 
              user: null,
              session: null,
              isAuthenticated: false,
              isLoading: false 
            });
          }

          // Listen for auth changes (login, logout, token refresh)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log('Auth event:', event);
              
              if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                if (session?.user) {
                  const user = mapSupabaseUser(session.user);
                  set({
                    user,
                    session,
                    isAuthenticated: true,
                    isLoading: false,
                  });
                }
              } else if (event === 'SIGNED_OUT') {
                set({
                  user: null,
                  session: null,
                  isAuthenticated: false,
                  isLoading: false,
                });
              }
            }
          );

          // Store the subscription for cleanup
          authSubscription = subscription;
        } catch (error) {
          console.error('Auth initialization error:', error);
          set({ 
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false 
          });
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
      // Rehydrate but don't trust the persisted state - validate with Supabase
      onRehydrateStorage: () => (state) => {
        // After rehydration, we'll validate with Supabase in initializeAuth
        // Keep isLoading true until validation completes
      },
    }
  )
);
