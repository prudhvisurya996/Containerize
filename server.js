require('dotenv').config(); // Load environment variables from .env

const express = require('express');
const app = express();
const mysql = require('mysql');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Exit the app on connection failure
  }
  console.log('Connected to MySQL database');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Static Files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: path.join(__dirname, 'public') });
});

app.get('/register', (req, res) => {
  res.sendFile('register.html', { root: path.join(__dirname, 'public') });
});

app.get('/login', (req, res) => {
  res.sendFile('login.html', { root: path.join(__dirname, 'public') });
});

app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const query = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`;
  db.query(query, [username, email, password], (err, results) => {
    if (err) {
      console.error('Registration error:', err);
      return res.status(400).json({ success: false, message: 'Registration failed' });
    }
    res.json({ success: true, message: 'Registration successful! Redirecting to login...' });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email = ? AND password = ?`;
  db.query(query, [email, password], (err, results) => {
    if (err || results.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    req.session.user = results[0];
    res.json({ success: true, message: 'Login successful! Redirecting to homepage...' });
  });
});

app.get('/protected-page', (req, res) => {
  if (req.session.user) {
    res.send(`Welcome, ${req.session.user.username}!`);
  } else {
    res.status(401).send('Unauthorized access');
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
