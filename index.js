const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
});

// Create the notes table if it doesn't exist
pool.query(`
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL
  )
`);

// Homepage: show all notes
app.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM notes ORDER BY id DESC');
  const notesList = result.rows.map(n => `<li>${n.content}</li>`).join('');
  res.send(`
    <h1>My Notes</h1>
    <form method="POST" action="/notes">
      <input name="content" placeholder="Write a note..." required />
      <button type="submit">Add</button>
    </form>
    <ul>${notesList}</ul>
  `);
});

// Add a new note
app.post('/notes', express.urlencoded({ extended: true }), async (req, res) => {
  await pool.query('INSERT INTO notes (content) VALUES ($1)', [req.body.content]);
  res.redirect('/');
});

app.listen(3000, () => console.log('Server running on port 3000'));