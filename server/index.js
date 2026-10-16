require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

async function testDatabaseConnection() {
  const caPath = path.join(__dirname, 'supabase-ca-2021.crt');

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 10000,
    ssl: {
      ca: fs.readFileSync(caPath, 'utf8'),
      rejectUnauthorized: true,
    },
  });

  try {
    await client.connect();

    const result = await client.query(
      'SELECT NOW() AS current_time, current_database() AS database_name',
    );

    console.log('Supabase database connected successfully!');
    console.log('Database:', result.rows[0].database_name);
    console.log('Server time:', result.rows[0].current_time);
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

testDatabaseConnection();
