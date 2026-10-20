require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Wraps async routes so any database error goes to the error handler below
const handle = fn => (req, res, next) => fn(req, res).catch(next);

// Read the :id from the URL; returns null if it isn't a whole number
const getId = req => {
  const id = Number(req.params.id);
  return Number.isInteger(id) ? id : null;
};

// Pull the fields we accept out of a request body
function fields(body) {
  return [
    body.movie_title,
    body.genre ?? null,
    body.cinema_hall ?? null,
    body.show_date || null,
    body.show_time || null,
    body.ticket_price ?? 0,
    body.available_seats ?? 0,
  ];
}

// GET all
app.get('/api/showtimes', handle(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM showtimes ORDER BY id ASC');
  res.json(rows);
}));

// GET one
app.get('/api/showtimes/:id', handle(async (req, res) => {
  const id = getId(req);
  if (id === null) return res.status(404).json({ error: 'Showtime not found' });
  const { rows } = await pool.query('SELECT * FROM showtimes WHERE id = $1', [id]);
  if (!rows[0]) return res.status(404).json({ error: 'Showtime not found' });
  res.json(rows[0]);
}));

// POST create
app.post('/api/showtimes', handle(async (req, res) => {
  if (!req.body.movie_title) {
    return res.status(400).json({ error: 'movie_title is required' });
  }
  const { rows } = await pool.query(
    `INSERT INTO showtimes
     (movie_title, genre, cinema_hall, show_date, show_time, ticket_price, available_seats)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    fields(req.body)
  );
  res.status(201).json(rows[0]);
}));

// PUT update
app.put('/api/showtimes/:id', handle(async (req, res) => {
  const id = getId(req);
  if (id === null) return res.status(404).json({ error: 'Showtime not found' });
  if (!req.body.movie_title) {
    return res.status(400).json({ error: 'movie_title is required' });
  }
  const { rows } = await pool.query(
    `UPDATE showtimes SET
       movie_title = $1, genre = $2, cinema_hall = $3, show_date = $4,
       show_time = $5, ticket_price = $6, available_seats = $7,
       updated_at = NOW()
     WHERE id = $8
     RETURNING *`,
    [...fields(req.body), id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Showtime not found' });
  res.json(rows[0]);
}));

// DELETE
app.delete('/api/showtimes/:id', handle(async (req, res) => {
  const id = getId(req);
  if (id === null) return res.status(404).json({ error: 'Showtime not found' });
  const { rowCount } = await pool.query('DELETE FROM showtimes WHERE id = $1', [id]);
  if (rowCount === 0) return res.status(404).json({ error: 'Showtime not found' });
  res.json({ message: 'Showtime deleted' });
}));

// If anything above throws (e.g. database unreachable), reply with 500
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));