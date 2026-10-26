// Auth-related frontend helpers.
//
// SECURITY: nothing here verifies a JWT. A locally decoded token is treated
// as display metadata only — never as proof of identity. Authoritative checks
// go through supabase.auth.getUser(), and backend enforcement is Phase 2.3C3.

import type { Session } from '@supabase/supabase-js';

// Returns true only for safe internal application paths. Rejects protocol-
// relative URLs (`//evil.com`), absolute URLs, backslash tricks and control
// characters, so a stored return-to value can never become an open redirect.
export function isSafeInternalPath(
  path: string | null | undefined,
): path is string {
  if (!path) return false;
  if (!path.startsWith('/') || path.startsWith('//')) return false;
  if (path.includes('\\')) return false;
  // eslint-disable-next-line no-control-regex
  return !/[\u0000-\u001f\u007f\s]/.test(path);
}

interface DecodedJwtParts {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
}

// Decode-only (signature NOT verified) — used exclusively to print the small
// non-secret claim set required for manual JWT config testing (alg/aud/iss/
// role). The token itself is never logged, returned or transmitted here.
function decodeJwtParts(token: string): DecodedJwtParts | null {
  const segments = token.split('.');
  if (segments.length !== 3 || !segments[0] || !segments[1]) return null;

  const decode = (segment: string): Record<string, unknown> | null => {
    try {
      const json = JSON.parse(
        atob(segment.replace(/-/g, '+').replace(/_/g, '/')) as string,
      ) as unknown;
      return typeof json === 'object' && json !== null
        ? (json as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  };

  const header = decode(segments[0]);
  const payload = decode(segments[1]);
  if (!header || !payload) return null;
  return { header, payload };
}

// Dev-only console helper for the Phase 2.3C2 manual test checklist.
// Logs ONLY the four non-secret metadata fields requested (alg, aud, iss,
// role) plus kid/exp. Never logs the token, signature or full payload.
export function logNonSecretJwtMetadata(session: Session | null): void {
  if (!session) return;

  const parts = decodeJwtParts(session.access_token);
  if (!parts) {
    console.warn(
      '[auth] Could not decode JWT header/claims for metadata check.',
    );
    return;
  }

  console.info('[auth] Non-secret JWT metadata (unverified, display only):', {
    alg: parts.header.alg,
    kid: parts.header.kid,
    aud: parts.payload.aud,
    iss: parts.payload.iss,
    role: parts.payload.role,
    exp: parts.payload.exp,
  });
}
