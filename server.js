const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    db.run(`CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        role TEXT
    )`);

    db.run(`CREATE TABLE late_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        date TEXT,
        reason TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

// API Endpoints

// Register user
app.post('/register', (req, res) => {
    const { username, role } = req.body;
    db.run('INSERT INTO users (username, role) VALUES (?, ?)', [username, role], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Add late entry
app.post('/late-entry', (req, res) => {
    const { user_id, date, reason } = req.body;
    db.run('INSERT INTO late_entries (user_id, date, reason) VALUES (?, ?, ?)', [user_id, date, reason], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Get all late entries
app.get('/late-entries', (req, res) => {
    db.all('SELECT * FROM late_entries', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
