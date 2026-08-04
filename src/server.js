'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const { appendPost, verifyChain, getPosts } = require('./chain');
const { moderate } = require('./moderate');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// GET /api/posts — return all posts (newest first for display)
app.get('/api/posts', (req, res) => {
  const posts = getPosts();
  res.json(posts.slice().reverse());
});

// POST /api/posts — submit a new post
app.post('/api/posts', (req, res) => {
  const message = (req.body.message || '').trim();

  const { allowed, reason } = moderate(message);
  if (!allowed) {
    return res.status(400).json({ error: reason });
  }

  try {
    const entry = appendPost(message);
    res.status(201).json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
});

// GET /api/verify — verify chain integrity (admin use)
app.get('/api/verify', (req, res) => {
  try {
    const result = verifyChain();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`4Chan forum running at http://localhost:${PORT}`);
});

module.exports = app;
