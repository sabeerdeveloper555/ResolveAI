// Authentication-aware route guards.
//
// SECURITY BOUNDARY: these guards shape frontend navigation and UX. They
// are NOT backend authorization — Express endpoint enforcement is
// implemented separately in Phase 2.3C3.

import { type ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { getSupabaseClient, SupabaseConfigError } from '@/lib/supabase/client';
import { isSafeInternalPath } from '@/lib/supabase/auth-utils';
import { Button } from '@/components/ui/button';

const RETURN_TO_STORAGE_KEY = 'resolveai.auth.return-to';

// Session restore in flight: render nothing instead of redirecting
// prematurely and bouncing a signed-in user out of the app.
function AuthSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
      <div
        role="status"
        aria-label="Loading session"
        className="flex items-center gap-3 text-sm text-slate-500"
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
        Loading session…
      </div>
    </div>
  );
}

// Controlled development configuration error — shown when client/.env is
// missing so the app never silently connects to an unintended project.
export function AuthConfigGate({ children }: { children: ReactNode }) {
  try {
    // Lazy singleton: throws only when configuration is missing/placeholder.
    getSupabaseClient();
  } catch (error) {
    if (error instanceof SupabaseConfigError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] p-6">
          <div className="max-w-md rounded-xl border border-amber-200 bg-white p-6 shadow-sm">
            <h1 className="text-lg font-semibold text-slate-900">
              Supabase configuration missing
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {error.message}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This is a local development setup error. Authentication is
              disabled until the two{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                VITE_SUPABASE_*
              </code>{' '}
              variables are configured.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry after configuring
            </Button>
          </div>
        </div>
      );
    }

    throw error;
  }

  return <>{children}</>;
}

// Renders children only for authenticated users. Unauthenticated visitors
// are sent to /login with their intended internal path remembered.
export function RequireAuth() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <AuthSplash />;

  if (!isAuthenticated) {
    if (isSafeInternalPath(location.pathname + location.search)) {
      try {
        sessionStorage.setItem(
          RETURN_TO_STORAGE_KEY,
          location.pathname + location.search,
        );
      } catch {
        // Storage unavailable (private mode etc.) — fall back to /dashboard.
      }
    }

    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

// Auth-only pages (login/signup): signed-in users go straight to their
// remembered destination or the dashboard.
export function RedirectIfAuthenticated() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) return <AuthSplash />;

  if (isAuthenticated) {
    let target = '/dashboard';

    try {
      const stored = sessionStorage.getItem(RETURN_TO_STORAGE_KEY);
      sessionStorage.removeItem(RETURN_TO_STORAGE_KEY);

      if (isSafeInternalPath(stored)) {
        target = stored;
      }
    } catch {
      // Ignore storage failures; default target is safe.
    }

    return <Navigate to={target} replace />;
  }

  return <Outlet />;
}
