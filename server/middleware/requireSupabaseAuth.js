// Express middleware that authenticates a request from a Supabase access
// token. Mounted per-route (only on /api/me); it is never applied globally so
// existing public endpoints keep their behavior.
//
// It reads ONLY the Authorization header, verifies the bearer token through
// the injected verifier, and attaches the minimal verified identity to
// req.auth. It never trusts any other client-provided identity source.

// Strictly parse `Authorization: Bearer <token>`.
// Bearer is case-sensitive per RFC 6750, and the token must be a single
// non-empty, non-whitespace value.
const BEARER_RE = /^Bearer (\S+)$/;

// Builds the middleware around a verifyAccessToken(token) function so the
// HTTP layer is testable in isolation from jose/JWKS.
function requireSupabaseAuth(verifyAccessToken) {
  if (typeof verifyAccessToken !== 'function') {
    throw new TypeError(
      'requireSupabaseAuth requires a verifyAccessToken function.',
    );
  }

  return async function requireSupabaseAuthHandler(req, res, next) {
    const header = req.headers.authorization;

    if (typeof header !== 'string') {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const match = BEARER_RE.exec(header);
    // reject() never echoes the header/token back to the client or logs it.
    if (!match || match[1].length === 0) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const token = match[1];

    try {
      const identity = await verifyAccessToken(token);

      // Only cryptographically verified identity is attached.
      req.auth = {
        userId: identity.userId,
        role: identity.role,
      };

      return next();
    } catch (error) {
      // AuthError carries a safe, generic status + code. Anything else is an
      // unexpected internal failure: fail closed with 503 and reveal nothing.
      if (error && error.name === 'AuthError' && error.status === 401) {
        return res.status(401).json({ error: 'unauthorized' });
      }

      // Ordinary invalid-token cases are already 401 above; reaching here
      // means a verification-availability problem, which is worth a minimal,
      // credential-free log (code only — no token, header or raw message).
      console.error('Authentication verification unavailable:', {
        code: (error && error.code) || 'unknown',
      });

      return res.status(503).json({ error: 'service_unavailable' });
    }
  };
}

module.exports = { requireSupabaseAuth };
