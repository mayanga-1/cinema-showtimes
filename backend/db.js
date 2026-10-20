require('dotenv').config();
const { Pool, types } = require('pg');

// Make Postgres values come back in friendly formats
types.setTypeParser(1082, v => v);               // DATE    -> "2026-10-25"
types.setTypeParser(1083, v => v.slice(0, 5));   // TIME    -> "14:00"
types.setTypeParser(1700, v => parseFloat(v));   // NUMERIC -> 60 (a number)

// A pool keeps a few connections open and reuses them
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

module.exports = pool;