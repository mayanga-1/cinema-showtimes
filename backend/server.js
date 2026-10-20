require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());          // lets your web page call this API
app.use(express.json());  // lets the API read JSON sent in request bodies

// Pull the fields we accept out of a request body
function fields(body) {
  return [
    body.movie_title,
    body.genre ?? null,
    body.cinema_hall ?? null,
    body.show_date ?? null,
    body.show_time ?? null,
    body.ticket_price ?? 0,
    body.available_seats ?? 0,
  ];
}

// GET all
app.get('/api/showtimes', (req, res) => {
  const rows = db.prepare('SELECT * FROM showtimes ORDER BY id ASC').all();
  res.json(rows);
});

// GET one
app.get('/api/showtimes/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM showtimes WHERE id = ?').get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Showtime not found' });
  res.json(row);
});

// POST create
app.post('/api/showtimes', (req, res) => {
  if (!req.body.movie_title) {
    return res.status(400).json({ error: 'movie_title is required' });
  }
  const result = db.prepare(
    `INSERT INTO showtimes
     (movie_title, genre, cinema_hall, show_date, show_time, ticket_price, available_seats)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(...fields(req.body));
  const created = db.prepare('SELECT * FROM showtimes WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// PUT update
app.put('/api/showtimes/:id', (req, res) => {
  if (!req.body.movie_title) {
    return res.status(400).json({ error: 'movie_title is required' });
  }
  const id = Number(req.params.id);
  const result = db.prepare(
    `UPDATE showtimes SET
       movie_title = ?, genre = ?, cinema_hall = ?, show_date = ?,
       show_time = ?, ticket_price = ?, available_seats = ?,
       updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`
  ).run(...fields(req.body), id);
  if (result.changes === 0) return res.status(404).json({ error: 'Showtime not found' });
  res.json(db.prepare('SELECT * FROM showtimes WHERE id = ?').get(id));
});

// DELETE
app.delete('/api/showtimes/:id', (req, res) => {
  const result = db.prepare('DELETE FROM showtimes WHERE id = ?').run(Number(req.params.id));
  if (result.changes === 0) return res.status(404).json({ error: 'Showtime not found' });
  res.json({ message: 'Showtime deleted' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));