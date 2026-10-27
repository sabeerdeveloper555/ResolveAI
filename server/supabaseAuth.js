// Supabase access-token verification for the Express backend.
//
// SECURITY MODEL
//   - A JWT is trusted ONLY after jose verifies its ES256 signature against
//     the project's public JWKS and validates issuer/audience/lifetime.
//   - Local/decode-only metadata (what the browser shows) is never proof here.
//   - Identity is derived exclusively from the verified payload; no request
//     body, query parameter or custom header is ever trusted as identity.
//
// jose v6 is ESM-only, so this CommonJS module loads it with dynamic import().
// The remote JWKS set is created once and reused for caching + key rotation.
// No network happens at construction; the first verification fetches the keys.

// Canonical RFC 4122 UUID (case-insensitive) — Supabase `sub` is always a UUID.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Fixed product decisions for this project (see Phase 2.3C3 approval).
const EXPECTED_AUDIENCE = 'authenticated';
const EXPECTED_ALGORITHMS = ['ES256'];

// A single dynamic import is memoized so jose is loaded at most once.
let josePromise = null;
function loadJose() {
  if (!josePromise) {
    josePromise = import('jose');
  }
  return josePromise;
}

// Classification error carrying the HTTP status the middleware should emit.
// The message is intentionally generic: it must never contain the token,
// Authorization header, JWKS internals or the underlying jose message.
class AuthError extends Error {
  constructor(status, code) {
    super(code);
    this.name = 'AuthError';
    this.status = status;
    this.code = code;
  }
}

// Map any thrown verification error to a safe AuthError.
// - Token-validation failures (signature, alg, iss, aud, exp, claims, and an
//   unknown signing key) are the caller's fault -> 401.
// - JWKS availability / unexpected internal failures must NOT grant access
//   -> 503 (fail closed), without revealing details.
function toAuthError(error) {
  if (error instanceof AuthError) {
    return error;
  }

  const code = error && error.code ? error.code : '';
  const JOSE_ERROR_PREFIX = 'ERR_';

  // 503 cases: the JWKS document could not be reached/loaded.
  if (
    code === 'ERR_JWKS_TIMEOUT' ||
    code === 'ERR_JWKS_INVALID' ||
    code === 'ERR_JWKS_MULTIPLE_MATCHING_KEYS' ||
    (error instanceof TypeError &&
      /fetch failed|failed to fetch/i.test(error.message || ''))
  ) {
    return new AuthError(503, 'verification_unavailable');
  }

  // 401 cases: any jose JWT/JWS/JWKS-no-match/alg error is an invalid token.
  if (
    code === 'ERR_JWKS_NO_MATCHING_KEY' ||
    code === 'ERR_JOSE_ALG_NOT_ALLOWED' ||
    (typeof code === 'string' && code.startsWith(JOSE_ERROR_PREFIX))
  ) {
    return new AuthError(401, 'invalid_token');
  }

  // Unexpected non-jose failure: fail closed, do not authenticate.
  return new AuthError(503, 'verification_unavailable');
}

// Builds a verifier from explicit configuration. Kept env-free so tests can
// run it against an isolated local JWKS server without touching production
// configuration.
async function createVerifier({ jwksUrl, issuer }) {
  const { createRemoteJWKSet, jwtVerify } = await loadJose();

  // Constructing the remote set performs no network request; it caches the
  // JWKS and transparently refreshes on an unknown kid (key rotation).
  const jwks = createRemoteJWKSet(new URL(jwksUrl));

  return async function verifyAccessToken(token) {
    let payload;
    try {
      ({ payload } = await jwtVerify(token, jwks, {
        issuer,
        audience: EXPECTED_AUDIENCE,
        algorithms: EXPECTED_ALGORITHMS,
        // exp is always enforced; nbf is enforced by jose when present.
      }));
    } catch (error) {
      throw toAuthError(error);
    }

    // Post-verification claim checks. The payload is only read here, after a
    // successful cryptographic verify, so these claims are trustworthy.
    if (typeof payload.sub !== 'string' || !UUID_RE.test(payload.sub)) {
      throw new AuthError(401, 'invalid_subject');
    }
    if (payload.role !== 'authenticated') {
      throw new AuthError(401, 'invalid_role');
    }

    // Minimal verified identity. Nothing else (email, session id, raw claims)
    // is retained or exposed.
    return {
      userId: payload.sub,
      role: 'authenticated',
    };
  };
}

// Validates the JWT configuration from the environment WITHOUT any network
// access, so a bad/missing setup fails at startup, not on the first request.
// Error text never echoes the offending value.
function validateConfig(env) {
  const jwksUrl = (env.SUPABASE_JWKS_URL || '').trim();
  const issuer = (env.SUPABASE_JWT_ISSUER || '').trim();

  if (!jwksUrl) {
    throw new Error('Missing required configuration: SUPABASE_JWKS_URL.');
  }
  if (!issuer) {
    throw new Error('Missing required configuration: SUPABASE_JWT_ISSUER.');
  }

  let parsedJwks;
  let parsedIssuer;
  try {
    parsedJwks = new URL(jwksUrl);
    parsedIssuer = new URL(issuer);
  } catch {
    throw new Error(
      'Invalid configuration: SUPABASE_JWKS_URL or SUPABASE_JWT_ISSUER is not a valid URL.',
    );
  }

  if (parsedJwks.protocol !== 'https:') {
    throw new Error('Invalid configuration: SUPABASE_JWKS_URL must use https.');
  }
  if (parsedIssuer.protocol !== 'https:') {
    throw new Error(
      'Invalid configuration: SUPABASE_JWT_ISSUER must use https.',
    );
  }
  // The project issuer is configured without a trailing slash; a slash here
  // would silently reject every token, so fail loudly instead.
  if (issuer.endsWith('/')) {
    throw new Error(
      'Invalid configuration: SUPABASE_JWT_ISSUER must not end with a slash.',
    );
  }

  return { jwksUrl, issuer };
}

// Production singleton: one verifier built lazily and reused for every
// request. Guarded by a single promise to avoid init races and repeated JWKS
// client construction.
let productionVerifier = null;

function getProductionVerifier(env = process.env) {
  if (!productionVerifier) {
    // Synchronous, network-free validation happens first.
    const config = validateConfig(env);
    productionVerifier = createVerifier(config);
  }
  return productionVerifier;
}

// Stable async entry point for the middleware. Awaiting the memoized verifier
// promise means jose + config init run at most once.
async function verifyRequestToken(token, env = process.env) {
  const verifier = await getProductionVerifier(env);
  return verifier(token);
}

module.exports = {
  AuthError,
  createVerifier,
  validateConfig,
  getProductionVerifier,
  verifyRequestToken,
  // Exposed for tests to reset the singleton between scenarios.
  resetProductionVerifier() {
    productionVerifier = null;
  },
};
