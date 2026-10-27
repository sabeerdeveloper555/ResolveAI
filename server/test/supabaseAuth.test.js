// Unit tests for the JWT verification module.
// Runs entirely against a local JWKS server and in-memory ES256 keys.

const test = require('node:test');
const assert = require('node:assert/strict');

const { createVerifier, validateConfig } = require('../supabaseAuth');
const {
  jose,
  generateEs256Key,
  signToken,
  signHs256Token,
  startJwksServer,
  TEST_USER_ID,
  nowSeconds,
} = require('./helpers');

// Builds a valid payload for the given issuer.
function validPayload(issuer, overrides = {}) {
  const iat = nowSeconds();
  return {
    iss: issuer,
    aud: 'authenticated',
    sub: TEST_USER_ID,
    role: 'authenticated',
    iat,
    exp: iat + 3600,
    ...overrides,
  };
}

test('validateConfig rejects missing variables without echoing values', () => {
  assert.throws(() => validateConfig({}), /SUPABASE_JWKS_URL/);
  assert.throws(
    () => validateConfig({ SUPABASE_JWKS_URL: 'https://x.example/jwks.json' }),
    /SUPABASE_JWT_ISSUER/,
  );
});

test('validateConfig rejects non-https and trailing-slash issuer', () => {
  assert.throws(
    () =>
      validateConfig({
        SUPABASE_JWKS_URL: 'http://insecure.example/jwks.json',
        SUPABASE_JWT_ISSUER: 'https://ok.example/auth/v1',
      }),
    /must use https/,
  );
  assert.throws(
    () =>
      validateConfig({
        SUPABASE_JWKS_URL: 'https://ok.example/jwks.json',
        SUPABASE_JWT_ISSUER: 'https://ok.example/auth/v1/',
      }),
    /must not end with a slash/,
  );
});

test('validateConfig accepts a correct https configuration', () => {
  const cfg = validateConfig({
    SUPABASE_JWKS_URL: 'https://p.supabase.co/auth/v1/.well-known/jwks.json',
    SUPABASE_JWT_ISSUER: 'https://p.supabase.co/auth/v1',
  });
  assert.equal(cfg.issuer, 'https://p.supabase.co/auth/v1');
});

test('valid ES256 token yields only { userId, role }', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(
      key,
      validPayload(srv.issuer, { email: 'leak@example.com' }),
    );
    const identity = await verify(token);

    assert.deepEqual(identity, { userId: TEST_USER_ID, role: 'authenticated' });
    // No email/session/raw claims leak through the identity object.
    assert.equal(Object.keys(identity).length, 2);
  } finally {
    await srv.close();
  }
});

test('rejects wrong issuer with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(key, validPayload('https://evil.example'));
    await assert.rejects(verify(token), (e) => e.status === 401);
  } finally {
    await srv.close();
  }
});

test('rejects wrong audience with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(
      key,
      validPayload(srv.issuer, { aud: 'anon' }),
    );
    await assert.rejects(verify(token), (e) => e.status === 401);
  } finally {
    await srv.close();
  }
});

test('rejects expired token with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const iat = nowSeconds();
    const token = await signToken(
      key,
      validPayload(srv.issuer, { iat: iat - 7200, exp: iat - 3600 }),
    );
    await assert.rejects(verify(token), (e) => e.status === 401);
  } finally {
    await srv.close();
  }
});

test('rejects future nbf with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(
      key,
      validPayload(srv.issuer, { nbf: nowSeconds() + 3600 }),
    );
    await assert.rejects(verify(token), (e) => e.status === 401);
  } finally {
    await srv.close();
  }
});

test('rejects tampered signature with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(key, validPayload(srv.issuer));
    const [h, p, s] = token.split('.');

    // Deterministic tamper: decode the signature to its real bytes, flip one
    // actual byte with XOR, then re-encode. Mutating only the final Base64URL
    // character is unreliable because that character can carry unused padding
    // bits, so it may decode to identical bytes and leave the signature valid.
    const { base64url } = await jose();
    const sigBytes = base64url.decode(s);
    const tamperedBytes = new Uint8Array(sigBytes);
    tamperedBytes[0] ^= 0x01;
    const tamperedSig = base64url.encode(tamperedBytes);

    // Prove the tamper changed the signature at the byte level before asserting.
    assert.notEqual(tamperedSig, s, 're-encoded signature must differ');
    assert.ok(
      tamperedBytes.some((byte, i) => byte !== sigBytes[i]),
      'tampered bytes must differ from the original signature',
    );

    await assert.rejects(
      verify(`${h}.${p}.${tamperedSig}`),
      (e) => e.status === 401,
    );
  } finally {
    await srv.close();
  }
});

test('rejects unsupported algorithm (HS256) with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signHs256Token(validPayload(srv.issuer));
    await assert.rejects(verify(token), (e) => e.status === 401);
  } finally {
    await srv.close();
  }
});

test('rejects missing subject with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const payload = validPayload(srv.issuer);
    delete payload.sub;
    const token = await signToken(key, payload);
    await assert.rejects(
      verify(token),
      (e) => e.status === 401 && e.code === 'invalid_subject',
    );
  } finally {
    await srv.close();
  }
});

test('rejects non-UUID subject with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(
      key,
      validPayload(srv.issuer, { sub: 'not-a-uuid' }),
    );
    await assert.rejects(
      verify(token),
      (e) => e.status === 401 && e.code === 'invalid_subject',
    );
  } finally {
    await srv.close();
  }
});

test('rejects incorrect role with 401', async () => {
  const key = await generateEs256Key('key-1');
  const srv = await startJwksServer([key.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(
      key,
      validPayload(srv.issuer, { role: 'anon' }),
    );
    await assert.rejects(
      verify(token),
      (e) => e.status === 401 && e.code === 'invalid_role',
    );
  } finally {
    await srv.close();
  }
});

test('rejects token signed by an unknown key (kid not in JWKS) with 401', async () => {
  const served = await generateEs256Key('key-1');
  const other = await generateEs256Key('unknown-kid');
  const srv = await startJwksServer([served.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(other, validPayload(srv.issuer));
    await assert.rejects(verify(token), (e) => e.status === 401);
  } finally {
    await srv.close();
  }
});

test('supports key rotation: token signed by a second served key verifies', async () => {
  const keyA = await generateEs256Key('key-A');
  const keyB = await generateEs256Key('key-B');
  const srv = await startJwksServer([keyA.publicJwk, keyB.publicJwk]);
  try {
    const verify = await createVerifier({
      jwksUrl: srv.jwksUrl,
      issuer: srv.issuer,
    });
    const token = await signToken(keyB, validPayload(srv.issuer));
    const identity = await verify(token);
    assert.equal(identity.userId, TEST_USER_ID);
  } finally {
    await srv.close();
  }
});

test('fails closed with 503 when the JWKS endpoint is unreachable', async () => {
  const key = await generateEs256Key('key-1');
  // Port 1 is not listening: the remote fetch fails.
  const verify = await createVerifier({
    jwksUrl: 'http://127.0.0.1:1/.well-known/jwks.json',
    issuer: 'http://127.0.0.1:1',
  });
  const token = await signToken(key, validPayload('http://127.0.0.1:1'));
  await assert.rejects(
    verify(token),
    (e) => e.status === 503 && e.code === 'verification_unavailable',
  );
});
