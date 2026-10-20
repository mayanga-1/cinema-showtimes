CREATE TABLE IF NOT EXISTS showtimes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  movie_title TEXT NOT NULL,
  genre TEXT,
  cinema_hall TEXT,
  show_date TEXT,
  show_time TEXT,
  ticket_price REAL DEFAULT 0,
  available_seats INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);