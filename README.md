# 4Chan – Anonymous Science & Robots Forum

A lightweight, anonymous discussion forum focused on science, robotics, AI, and technology. No sign-up required — all posts are made as guests.

## Features

- **Anonymous posting** – no accounts, no sign-up
- **Tamper-evident chain** – every post is HMAC-signed and linked to the previous post, forming a cryptographic chain stored in a local JSON file
- **Built-in moderation** – keyword-based content filtering blocks hate speech, threats, and spam entirely on-server (no external API needed)
- **Auto-refresh** – new posts from other users appear every 30 seconds without a page reload

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and set your secret
cp .env.example .env
# Edit .env and change CHAIN_SECRET to a long random string

# 3. Start the server
npm start
# → http://localhost:3000
```

## Environment Variables

| Variable       | Default | Description                                              |
|----------------|---------|----------------------------------------------------------|
| `PORT`         | `3000`  | Port the server listens on                               |
| `CHAIN_SECRET` | —       | **Required.** Secret key used to HMAC-sign every post.  |

## How the Chain Works

Each post is stored as a JSON entry in `posts/chain.json`:

```json
{
  "id": 1,
  "timestamp": "2026-08-04T04:00:00.000Z",
  "message": "Hello science!",
  "prevHash": "0",
  "hash": "<HMAC-SHA256 of id+timestamp+message+prevHash>"
}
```

- `prevHash` is the `hash` of the immediately preceding entry (`"0"` for the first post).
- `hash` is computed server-side using `HMAC-SHA256(canonical, CHAIN_SECRET)`.
- Tampering with any entry breaks the chain, which you can verify via `GET /api/verify`.

## API

| Method | Path          | Description                              |
|--------|---------------|------------------------------------------|
| GET    | `/api/posts`  | Return all posts (newest first)          |
| POST   | `/api/posts`  | Submit a new post `{ "message": "..." }` |
| GET    | `/api/verify` | Verify chain integrity                   |

## Moderation

Content is filtered locally by `src/moderate.js` before a post is accepted. Messages are rejected if they:

- Are empty or exceed 2 000 characters
- Contain hate-speech slurs or explicit threats

Edit `src/moderate.js` to add or remove patterns.
<script src="https://www-infinity4.github.io/Mint-For-Infinity/infinity-wallet-menu.js" defer></script>
