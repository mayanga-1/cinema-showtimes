require('dotenv').config();
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

// Open (or create) the database file
const db = new DatabaseSync(path.join(__dirname, process.env.DB_FILE || 'cinema.db'));

// Create the table if it doesn't exist yet
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// If the table is empty, load the sample records
const { n } = db.prepare('SELECT COUNT(*) AS n FROM showtimes').get();
if (n === 0) {
  db.exec(fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8'));
  console.log('Sample data inserted');
}

module.exports = db;