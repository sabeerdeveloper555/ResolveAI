require('dotenv').config();

const express = require('express');
const cors = require('cors');

// The pool reads DATABASE_URL and the SSL certificate from db.js.
// dotenv.config() above has already run, so env vars are loaded first.
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

// Basic API health check.
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'ResolveAI API' });
});

// Database health check.
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

app.listen(PORT, () => {
  console.log(`ResolveAI API listening on http://localhost:${PORT}`);
});
