// Typed authentication provider built directly on official Supabase Auth.
//
// Responsibilities:
//   - Restore the persisted session on load (authoritative getUser() check,
//     never a locally decoded JWT or raw storage read).
//   - Subscribe to onAuthStateChange exactly once and clean up correctly
//     (React StrictMode double-mount safe).
//   - Expose login / signup / logout without ever handling tokens manually:
//     refresh and persistence stay inside the Supabase SDK.
//   - Clear the TanStack Query cache whenever the identity changes so no
//     user-scoped cached data can leak between accounts.
//
// SECURITY: no tokens, session objects or credentials are logged or stored
// outside the SDK's own managed storage. Frontend state here is UX only —
// real authorization is enforced server-side (Phase 2.3C3).

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, SupabaseConfigError } from '@/lib/supabase/client';
import { logNonSecretJwtMetadata } from '@/lib/supabase/auth-utils';
import { queryClient } from '@/lib/query-client';
import {
  AuthContext,
  type AuthContextValue,
  type AuthResult,
  type SignupResult,
} from '@/contexts/auth-context';

// Supabase messages are safe to show, with two exceptions: "Invalid login
// credentials" is reworded to a friendly generic phrase, and anything
// unexpected is replaced by a generic sentence so no internals leak.
function toFriendlyAuthError(rawMessage: string | undefined): string {
  const message = (rawMessage ?? '').toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Could not reach the authentication service. Check your connection and try again.';
  }

  return 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  // Last identity applied to the UI, used to detect real account switches.
  const lastUserIdRef = useRef<string | null>(null);

  // Replaces cached identity only when it actually changes, and clears the
  // shared query cache on every identity change (sign-in, sign-out, switch).
  const applyIdentity = useCallback((nextUser: User | null) => {
    const nextId = nextUser?.id ?? null;

    if (nextId !== lastUserIdRef.current) {
      lastUserIdRef.current = nextId;
      queryClient.clear();
    }

    setUser(nextUser);
  }, []);

  useEffect(() => {
    let disposed = false;

    async function restoreSession() {
      try {
        const supabase = getSupabaseClient();

        // getSession() is a local persistence read used only to decide
        // whether an authoritative server-side check is worth doing; the
        // identity itself comes from getUser(), which validates the token
        // with Supabase. A stored object alone is never treated as proof.
        const { data: local } = await supabase.auth.getSession();

        if (local.session) {
          const { data, error } = await supabase.auth.getUser();

          if (!disposed && !error && data.user) {
            applyIdentity(data.user);
            // Dev JWT metadata logging happens in the onAuthStateChange
            // handler (INITIAL_SESSION / TOKEN_REFRESHED) so each session is
            // reported exactly once, always with the current token.
          }
        }
      } catch (error) {
        // Missing configuration surfaces via AuthProvider below; expired or
        // invalid sessions simply resolve to "signed out", never a hang.
        if (!(error instanceof SupabaseConfigError)) {
          console.warn('[auth] Session restore failed; continuing signed out.');
        }
      } finally {
        if (!disposed) setInitializing(false);
      }
    }

    void restoreSession();

    // One subscription per mount; unsubscribe runs in cleanup so StrictMode
    // remounts cannot leave duplicate listeners behind.
    let subscription: {
      data: { subscription: { unsubscribe: () => void } };
    } | null = null;

    try {
      subscription = getSupabaseClient().auth.onAuthStateChange(
        (_event, session: Session | null) => {
          if (disposed) return;
          applyIdentity(session?.user ?? null);

          if (import.meta.env.DEV) {
            // Covers sign-in, token refresh and confirmation returns.
            // Logs alg/aud/iss/role only — never the token itself.
            logNonSecretJwtMetadata(session);
          }

          // The initial restore may still be pending when the SDK's URL
          // detection (email confirmation / OAuth return) resolves a session.
          if (!disposed) setInitializing(false);
        },
      );
    } catch (error) {
      if (!(error instanceof SupabaseConfigError)) throw error;
      // Config error: leave initializing to finish via restoreSession's finally.
      void error;
    }

    return () => {
      disposed = true;
      subscription?.data.subscription.unsubscribe();
    };
  }, [applyIdentity]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) return { error: toFriendlyAuthError(error.message) };
        // Identity state arrives via onAuthStateChange.
        return { error: null };
      } catch {
        return { error: 'Could not sign in right now. Please try again.' };
      }
    },
    [],
  );

  const signup = useCallback(
    async (email: string, password: string): Promise<SignupResult> => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            // Path-only redirect, resolved against the configured Site URL
            // (http://localhost:5173) and matched by the allow-listed
            // Redirect URL (http://localhost:5173/**). Sends the confirmation
            // link through the app's minimal callback route instead of the
            // site root, so the outcome is surfaced explicitly.
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/signup`,
          },
        });

        if (error) {
          return {
            requiresEmailConfirmation: false,
            error: toFriendlyAuthError(error.message),
          };
        }

        // Confirm Email is enabled: a user WITHOUT a session means the
        // verification email was sent. A user WITH a session (e.g.
        // confirmation disabled later) is already authenticated.
        return {
          requiresEmailConfirmation: !data.session,
          error: null,
        };
      } catch {
        return {
          requiresEmailConfirmation: false,
          error: 'Could not create the account right now. Please try again.',
        };
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<AuthResult> => {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) return { error: toFriendlyAuthError(error.message) };
      // onAuthStateChange clears identity and the query cache.
      return { error: null };
    } catch {
      return { error: 'Could not sign out right now. Please try again.' };
    }
  }, []);

  const value: AuthContextValue = {
    user,
    initializing,
    isAuthenticated: user !== null,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
