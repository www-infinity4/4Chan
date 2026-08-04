'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const POSTS_DIR = path.join(__dirname, '..', 'posts');
const CHAIN_FILE = path.join(POSTS_DIR, 'chain.json');

// Ensure posts directory exists
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

function getSecret() {
  const secret = process.env.CHAIN_SECRET;
  if (!secret || secret === 'change_me_to_a_long_random_string') {
    throw new Error('CHAIN_SECRET environment variable is not set');
  }
  return secret;
}

function hmac(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function loadChain() {
  if (!fs.existsSync(CHAIN_FILE)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(CHAIN_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveChain(chain) {
  fs.writeFileSync(CHAIN_FILE, JSON.stringify(chain, null, 2), 'utf8');
}

/**
 * Append a new post to the chain.
 * Each post includes:
 *   - id: sequential number
 *   - timestamp
 *   - message
 *   - prevHash: hash of previous entry (genesis uses '0')
 *   - hash: HMAC of this entry's canonical data
 */
function appendPost(message) {
  const secret = getSecret();
  const chain = loadChain();

  const id = chain.length + 1;
  const timestamp = new Date().toISOString();
  const prevHash = chain.length === 0 ? '0' : chain[chain.length - 1].hash;

  const canonical = JSON.stringify({ id, timestamp, message, prevHash });
  const hash = hmac(canonical, secret);

  const entry = { id, timestamp, message, prevHash, hash };
  chain.push(entry);
  saveChain(chain);
  return entry;
}

/**
 * Verify the integrity of the full chain.
 * Returns { valid: boolean, brokenAt: number|null }
 */
function verifyChain() {
  const secret = getSecret();
  const chain = loadChain();

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    const expectedPrev = i === 0 ? '0' : chain[i - 1].hash;

    if (entry.prevHash !== expectedPrev) {
      return { valid: false, brokenAt: entry.id };
    }

    const { id, timestamp, message, prevHash } = entry;
    const canonical = JSON.stringify({ id, timestamp, message, prevHash });
    const expectedHash = hmac(canonical, secret);

    if (entry.hash !== expectedHash) {
      return { valid: false, brokenAt: entry.id };
    }
  }

  return { valid: true, brokenAt: null };
}

function getPosts() {
  return loadChain();
}

module.exports = { appendPost, verifyChain, getPosts };
