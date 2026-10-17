require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

const caPath = path.join(__dirname, 'supabase-ca-2021.crt');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set. Define it in server/.env');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  ssl: {
    ca: fs.readFileSync(caPath, 'utf8'),
    rejectUnauthorized: true,
  },
});

pool.on('error', (error) => {
  console.error(
    'Unexpected error on idle database client:',
    error.code || error.name || 'unknown error',
  );
});

module.exports = pool;
