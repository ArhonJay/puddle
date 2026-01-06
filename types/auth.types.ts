/**
 * Authentication Types
 */

import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type AuthProvider = 'email' | 'google' | 'github';

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider: AuthProvider;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  loginWithProvider: (provider: Exclude<AuthProvider, 'email'>) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
}

export type AuthStore = AuthState & AuthActions;

/**
 * Helper function to convert Supabase user to our User type
 */
export function mapSupabaseUser(supabaseUser: SupabaseUser): User {
  const provider = (supabaseUser.app_metadata?.provider as AuthProvider) || 'email';
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.full_name || 
          supabaseUser.user_metadata?.name || 
          supabaseUser.email?.split('@')[0],
    avatar: supabaseUser.user_metadata?.avatar_url || 
            supabaseUser.user_metadata?.picture,
    provider,
    createdAt: new Date(supabaseUser.created_at),
  };
}
