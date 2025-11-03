/**
 * Authentication Types
 */

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
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: Exclude<AuthProvider, 'email'>) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export type AuthStore = AuthState & AuthActions;
