// Auth context object and consumer hook, kept in a non-component module so
// AuthContext.tsx exports only components (required by the react-refresh
// rule, matching the existing button-variants.ts convention).

import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

export interface AuthResult {
  error: string | null;
}

export interface SignupResult {
  /** True only when Supabase returned an authenticated session. */
  requiresEmailConfirmation: boolean;
  error: string | null;
}

export interface AuthContextValue {
  user: User | null;
  /** True until the initial session restore attempt has finished. */
  initializing: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (email: string, password: string) => Promise<SignupResult>;
  logout: () => Promise<AuthResult>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>.');
  }

  return context;
}
