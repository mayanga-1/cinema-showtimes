// Where the API lives
const API = 'https://cinema-showtimes-api.onrender.com/api/showtimes';

// Grab the page elements we need
const form = document.getElementById('showForm');
const idInput = document.getElementById('id');
const rows = document.getElementById('rows');
const message = document.getElementById('message');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');

const FIELDS = ['movie_title', 'genre', 'cinema_hall', 'show_date',
                'show_time', 'ticket_price', 'available_seats'];

let showtimes = []; // the latest list from the API

// Show a short message under the form
function showMessage(text, isError = false) {
  message.textContent = text;
  message.style.color = isError ? '#c00' : '#0a6';
}

// READ: get all showtimes and draw the table
async function loadShowtimes() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error();
    showtimes = await res.json();
  } catch {
    showMessage('Could not load showtimes. Is the API running?', true);
    return;
  }

  rows.innerHTML = '';
  showtimes.forEach(s => {
    const tr = document.createElement('tr');
    const values = [s.id, s.movie_title, s.genre, s.cinema_hall, s.show_date,
                    s.show_time, 'K' + Number(s.ticket_price).toFixed(2), s.available_seats];
    values.forEach(v => {
      const td = document.createElement('td');
      td.textContent = v ?? '';   // textContent = safe, never runs as code
      tr.appendChild(td);
    });

    const actions = document.createElement('td');
    actions.innerHTML = `<button class="edit">Edit</button> <button class="delete">Delete</button>`;
    actions.querySelectorAll('button').forEach(b => (b.dataset.id = s.id));
    tr.appendChild(actions);
    rows.appendChild(tr);
  });
}

// Put the form back to "Add" mode
function resetForm() {
  form.reset();
  idInput.value = '';
  saveBtn.textContent = 'Add showtime';
  cancelBtn.hidden = true;
}

// CREATE or UPDATE: when the form is submitted
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // stop the page from reloading

  const text = id => document.getElementById(id).value.trim() || null;
  const body = {
    movie_title: text('movie_title'),
    genre: text('genre'),
    cinema_hall: text('cinema_hall'),
    show_date: text('show_date'),
    show_time: text('show_time'),
    ticket_price: Number(document.getElementById('ticket_price').value) || 0,
    available_seats: parseInt(document.getElementById('available_seats').value) || 0,
  };

  const id = idInput.value;
  const res = await fetch(id ? `${API}/${id}` : API, {
    method: id ? 'PUT' : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (res.ok) {
    showMessage(id ? 'Showtime updated' : 'Showtime added');
    resetForm();
    loadShowtimes();
  } else {
    const err = await res.json().catch(() => ({}));
    showMessage(err.error || 'Something went wrong', true);
  }
});

// EDIT and DELETE buttons in the table
rows.addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return; // the click wasn't on a button

  if (e.target.classList.contains('edit')) {
    const s = showtimes.find(x => String(x.id) === id);
    FIELDS.forEach(f => (document.getElementById(f).value = s[f] ?? ''));
    idInput.value = s.id;
    saveBtn.textContent = 'Save changes';
    cancelBtn.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (e.target.classList.contains('delete')) {
    if (!confirm('Delete this showtime?')) return;
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showMessage('Showtime deleted');
      if (idInput.value === id) resetForm();
      loadShowtimes();
    } else {
      showMessage('Delete failed', true);
    }
  }
});

cancelBtn.addEventListener('click', resetForm);

// Load the table when the page opens
loadShowtimes();