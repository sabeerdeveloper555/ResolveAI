// Minimal email-confirmation callback page (§9).
//
// The Supabase SDK's built-in URL detection (detectSessionInUrl + PKCE)
// performs the actual token/code exchange during AuthProvider mount — no
// custom token verification exists here. This page only presents the
// outcome: a loading state while the exchange settles, success navigation,
// or a friendly error for invalid/expired links.
//
// SECURITY: the callback URL itself can contain sensitive one-time
// parameters, so it is never logged, and its raw params are never placed
// into navigable URLs. Only whitelisted internal `next` paths are used.

import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import AuthLayout from '@/components/auth/AuthLayout';
import { isSafeInternalPath } from '@/lib/supabase/auth-utils';

// Allowed post-confirmation landing pages. Anything else falls back to the
// dashboard, so `?next=` can never become an open redirect.
const ALLOWED_NEXT_PATHS = ['/dashboard', '/signup', '/login'];

function readNextParam(): string {
  const next = new URLSearchParams(window.location.search).get('next');
  return next && ALLOWED_NEXT_PATHS.includes(next) && isSafeInternalPath(next)
    ? next
    : '/dashboard';
}

// True when the current URL still carries auth callback parameters —
// existence is checked without logging or copying any value.
function hasCallbackParams(): boolean {
  const query = new URLSearchParams(window.location.search);
  const hash = window.location.hash;

  return (
    query.has('code') ||
    query.has('token_hash') ||
    query.has('type') ||
    hash.includes('access_token') ||
    hash.includes('error=')
  );
}

export default function AuthCallback() {
  const { isAuthenticated, initializing } = useAuth();
  const [timedOut, setTimedOut] = useState(false);
  // Captured once on mount, before the SDK strips callback params from the
  // URL. A lazy state initializer (not a ref) keeps this render-safe.
  const [arrival] = useState(() => ({
    next: readNextParam(),
    hadCallbackParams: hasCallbackParams(),
  }));

  useEffect(() => {
    // Bounded wait so an invalid/expired link can never leave the user on a
    // spinner indefinitely (SDK exchange failing or producing no session).
    const timer = window.setTimeout(() => setTimedOut(true), 10_000);
    return () => window.clearTimeout(timer);
  }, []);

  if (isAuthenticated) {
    // Confirmation succeeded and the SDK established a session from the
    // link. `/signup` can't host a signed-in user, so RedirectIfAuthenticated
    // sends them into the app from there.
    const next = arrival.next === '/login' ? '/dashboard' : arrival.next;
    return <Navigate to={next} replace />;
  }

  // Nothing to exchange (stale or hand-pasted link): report immediately
  // instead of waiting out the timeout.
  if (!initializing && !arrival.hadCallbackParams) {
    return <CallbackError />;
  }

  // Exchange produced no session, or is still settling when the bounded
  // wait expires: invalid / expired confirmation link.
  if (timedOut) {
    return <CallbackError />;
  }

  return (
    <AuthLayout>
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <div
          role="status"
          className="flex items-center justify-center gap-3 text-sm text-slate-500"
        >
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          Verifying your email confirmation…
        </div>
      </div>
    </AuthLayout>
  );
}

function CallbackError() {
  return (
    <AuthLayout>
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">
          Link invalid or expired
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This confirmation link is invalid, has already been used, or has
          expired. Request a new signup email or sign in if your account is
          already confirmed.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex h-10 w-full items-center justify-center rounded-lg bg-slate-900 px-3.5 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400"
        >
          Go to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
