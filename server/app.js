// Express application factory.
//
// This module builds and returns the app WITHOUT binding a port or creating a
// database pool, so tests can compose it with an in-memory pool stub and an
// injected token verifier. index.js keeps the real startup behavior by passing
// the production pool and the production verifier. Existing route order,
// middleware and response shapes are preserved unchanged.

const express = require('express');
const cors = require('cors');

const { requireSupabaseAuth } = require('./middleware/requireSupabaseAuth');

// Creates the Express app.
//   pool              - object exposing .query(sql) (the pg.Pool in prod)
//   verifyAccessToken - async (token) => { userId, role } for /api/me
function createApp({ pool, verifyAccessToken }) {
  const app = express();

  app.use(express.json());
  app.use(cors({ origin: 'http://localhost:5173' }));

  // Basic API health check (public, unchanged).
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', service: 'ResolveAI API' });
  });

  // Database health check (public, unchanged).
  app.get('/api/health/db', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT NOW() AS current_time, current_database() AS database_name',
      );

      res.status(200).json({
        status: 'ok',
        database: result.rows[0].database_name,
        serverTime: result.rows[0].current_time,
      });
    } catch (error) {
      // Keep details in the server log only: no query string, credentials or
      // connection URL in the response.
      console.error('Database health check failed:', {
        code: error.code || error.name || 'unknown error',
        message: error.message,
      });

      res.status(503).json({
        status: 'error',
        message: 'Database connection unavailable',
      });
    }
  });

  // Protected identity endpoint. Middleware is scoped to this route only.
  // Identity comes exclusively from the verified JWT via req.auth.
  app.get('/api/me', requireSupabaseAuth(verifyAccessToken), (req, res) => {
    res.status(200).json({
      userId: req.auth.userId,
      role: req.auth.role,
    });
  });

  return app;
}

module.exports = { createApp };
