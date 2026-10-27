require('dotenv').config();

// The pool reads DATABASE_URL and the SSL certificate from db.js.
// dotenv.config() above has already run, so env vars are loaded first.
const pool = require('./db');

// JWT verification uses public Supabase configuration only (JWKS URL and
// issuer). Validating it here fails startup loudly when configuration is
// missing or malformed, without any network request or exposing values.
const supabaseAuth = require('./supabaseAuth');
const { createApp } = require('./app');

try {
  supabaseAuth.validateConfig(process.env);
} catch (error) {
  console.error('Backend authentication is not configured:', error.message);
  process.exit(1);
}

const app = createApp({
  pool,
  // Route-scoped verifier for /api/me; built and cached lazily on first use.
  verifyAccessToken: (token) => supabaseAuth.verifyRequestToken(token),
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ResolveAI API listening on http://localhost:${PORT}`);
});
