// Test-only helpers: an isolated local JWKS server and ES256 token signing.
// Nothing here touches Supabase, the database, or any real credential.
// Keys are generated in memory per test and never persisted.

const http = require('node:http');

// jose is ESM-only; load it through dynamic import from this CJS helper.
async function jose() {
  return import('jose');
}

// Generates an ES256 key pair and returns the private CryptoKey plus its
// public JWK tagged with kid/alg for serving in a JWKS document.
async function generateEs256Key(kid) {
  const { generateKeyPair, exportJWK } = await jose();
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const jwk = await exportJWK(publicKey);
  return {
    kid,
    privateKey,
    publicJwk: { ...jwk, kid, alg: 'ES256', use: 'sig', key_ops: ['verify'] },
  };
}

// Signs a compact JWT with an explicit payload (full control for negative
// tests) using the given key. Defaults to ES256 with the key's kid.
async function signToken(key, payload, alg = 'ES256') {
  const { SignJWT } = await jose();
  return new SignJWT(payload)
    .setProtectedHeader({ alg, kid: key.kid })
    .sign(key.privateKey);
}

// Signs an HS256 token from a shared secret — used to prove the ES256-only
// allowlist rejects asymmetric/symmetric algorithm confusion.
async function signHs256Token(payload) {
  const { SignJWT } = await jose();
  const secret = new TextEncoder().encode(
    'test-only-hs256-secret-not-a-real-key-32chars',
  );
  return new SignJWT(payload).setProtectedHeader({ alg: 'HS256' }).sign(secret);
}

// Starts a local HTTP server that serves a mutable JWKS document. Returns the
// base URL, a setter to rotate the served keys, and a close() function.
async function startJwksServer(keys) {
  const state = { keys };

  const server = http.createServer((req, res) => {
    if (req.url === '/.well-known/jwks.json') {
      res.setHeader('content-type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ keys: state.keys }));
      return;
    }
    res.statusCode = 404;
    res.end('{}');
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  return {
    jwksUrl: `http://127.0.0.1:${port}/.well-known/jwks.json`,
    issuer: `http://127.0.0.1:${port}`,
    setKeys(nextKeys) {
      state.keys = nextKeys;
    },
    close() {
      return new Promise((resolve) => server.close(resolve));
    },
  };
}

// A valid UUID-shaped subject used across tests.
const TEST_USER_ID = '11111111-1111-1111-1111-111111111111';

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

module.exports = {
  jose,
  generateEs256Key,
  signToken,
  signHs256Token,
  startJwksServer,
  TEST_USER_ID,
  nowSeconds,
};
