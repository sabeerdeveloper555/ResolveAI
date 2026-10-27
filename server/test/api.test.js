// HTTP integration tests for the protected /api/me endpoint and regression
// coverage for the public health endpoints and CORS. Uses createApp with an
// in-memory pool stub and a verifier backed by a local JWKS server, so no
// database or Supabase credential is involved.

const test = require('node:test');
const assert = require('node:assert/strict');

const { createApp } = require('../app');
const { createVerifier } = require('../supabaseAuth');
const {
  generateEs256Key,
  signToken,
  startJwksServer,
  TEST_USER_ID,
  nowSeconds,
} = require('./helpers');

// A pool stub is enough for the health/db route and proves no real DB use.
function fakePool() {
  return {
    query: async () => ({
      rows: [
        { current_time: '2026-01-01T00:00:00Z', database_name: 'postgres' },
      ],
    }),
  };
}

// Starts the app on an ephemeral port and returns a base URL + close().
async function startServer(verifyAccessToken) {
  const app = createApp({ pool: fakePool(), verifyAccessToken });
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

function validPayload(issuer) {
  const iat = nowSeconds();
  return {
    iss: issuer,
    aud: 'authenticated',
    sub: TEST_USER_ID,
    role: 'authenticated',
    iat,
    exp: iat + 3600,
  };
}

// Creates a local JWKS server + matching verifier for happy-path requests.
async function makeTrustedContext() {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  const verify = await createVerifier({
    jwksUrl: srv.jwksUrl,
    issuer: srv.issuer,
  });
  return { key, srv, verify };
}

test('GET /api/me returns 200 with only userId and role for a valid token', async () => {
  const ctx = await makeTrustedContext();
  const server = await startServer(ctx.verify);
  try {
    const token = await signToken(ctx.key, validPayload(ctx.srv.issuer));
    const res = await fetch(`${server.baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body, { userId: TEST_USER_ID, role: 'authenticated' });
  } finally {
    await server.close();
    await ctx.srv.close();
  }
});

test('GET /api/me returns 401 for a missing Authorization header', async () => {
  const ctx = await makeTrustedContext();
  const server = await startServer(ctx.verify);
  try {
    const res = await fetch(`${server.baseUrl}/api/me`);
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: 'unauthorized' });
  } finally {
    await server.close();
    await ctx.srv.close();
  }
});

test('GET /api/me rejects wrong scheme, empty token and malformed JWT with 401', async () => {
  const ctx = await makeTrustedContext();
  const server = await startServer(ctx.verify);
  try {
    const cases = ['Basic abc', 'bearer abc', 'Bearer ', 'Bearer not.a.jwt'];
    for (const value of cases) {
      const res = await fetch(`${server.baseUrl}/api/me`, {
        headers: { Authorization: value },
      });
      assert.equal(
        res.status,
        401,
        `expected 401 for header: ${JSON.stringify(value)}`,
      );
    }
  } finally {
    await server.close();
    await ctx.srv.close();
  }
});

test('GET /api/me returns 401 for an invalid signature and never echoes the token', async () => {
  const ctx = await makeTrustedContext();
  const server = await startServer(ctx.verify);
  try {
    const token = await signToken(ctx.key, validPayload(ctx.srv.issuer));
    const tampered = `${token}XYZ`;
    const res = await fetch(`${server.baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${tampered}` },
    });
    assert.equal(res.status, 401);
    const text = await res.text();
    assert.ok(!text.includes(token), 'response must not leak the token');
    assert.ok(!text.includes('Bearer'), 'response must not leak the scheme');
  } finally {
    await server.close();
    await ctx.srv.close();
  }
});

test('GET /api/me returns 503 (fail closed) when verification is unavailable', async () => {
  // Verifier pointed at a non-listening JWKS endpoint.
  const verify = await createVerifier({
    jwksUrl: 'http://127.0.0.1:1/.well-known/jwks.json',
    issuer: 'http://127.0.0.1:1',
  });
  const key = await generateEs256Key('key-1');
  const server = await startServer(verify);
  try {
    const token = await signToken(key, validPayload('http://127.0.0.1:1'));
    const res = await fetch(`${server.baseUrl}/api/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 503);
    assert.deepEqual(await res.json(), { error: 'service_unavailable' });
  } finally {
    await server.close();
  }
});

test('GET /api/health stays public and unchanged', async () => {
  const verify = async () => {
    throw new Error('should not be called');
  };
  const server = await startServer(verify);
  try {
    const res = await fetch(`${server.baseUrl}/api/health`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), {
      status: 'ok',
      service: 'ResolveAI API',
    });
  } finally {
    await server.close();
  }
});

test('GET /api/health/db stays public and preserves its response shape', async () => {
  const server = await startServer(async () => {
    throw new Error('should not be called');
  });
  try {
    const res = await fetch(`${server.baseUrl}/api/health/db`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'ok');
    assert.equal(body.database, 'postgres');
    assert.ok('serverTime' in body);
  } finally {
    await server.close();
  }
});

test('CORS: 401 on /api/me still carries the allow-origin header', async () => {
  const ctx = await makeTrustedContext();
  const server = await startServer(ctx.verify);
  try {
    const res = await fetch(`${server.baseUrl}/api/me`, {
      headers: { Origin: 'http://localhost:5173' },
    });
    assert.equal(res.status, 401);
    assert.equal(
      res.headers.get('access-control-allow-origin'),
      'http://localhost:5173',
    );
  } finally {
    await server.close();
    await ctx.srv.close();
  }
});

test('CORS: preflight allows the Authorization header from the dev origin', async () => {
  const server = await startServer(async () => {
    throw new Error('should not be called');
  });
  try {
    const res = await fetch(`${server.baseUrl}/api/me`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization',
      },
    });
    assert.ok(
      res.status === 204 || res.status === 200,
      `unexpected preflight status ${res.status}`,
    );
    assert.equal(
      res.headers.get('access-control-allow-origin'),
      'http://localhost:5173',
    );
    assert.match(
      res.headers.get('access-control-allow-headers') || '',
      /authorization/i,
    );
  } finally {
    await server.close();
  }
});
