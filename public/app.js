'use strict';

const postsContainer = document.getElementById('posts-container');
const postForm = document.getElementById('post-form');
const messageInput = document.getElementById('message');
const charCount = document.getElementById('char-count');
const formError = document.getElementById('form-error');
const submitBtn = postForm.querySelector('button[type="submit"]');

// ── Character counter ──────────────────────────────────────────────────────
messageInput.addEventListener('input', () => {
  const len = messageInput.value.length;
  charCount.textContent = `${len} / 2000`;
  charCount.style.color = len > 1800 ? '#ff9800' : '';
});

// ── Load and render posts ──────────────────────────────────────────────────
async function loadPosts() {
  try {
    const res = await fetch('/api/posts');
    if (!res.ok) throw new Error('Failed to load posts');
    const posts = await res.json();
    renderPosts(posts);
  } catch (err) {
    postsContainer.innerHTML =
      '<p class="empty">Could not load posts. Please refresh.</p>';
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function renderPosts(posts) {
  if (!posts || posts.length === 0) {
    postsContainer.innerHTML =
      '<p class="empty">No posts yet. Be the first to post!</p>';
    return;
  }

  postsContainer.innerHTML = posts
    .map(
      (p) => `
      <article class="post-card">
        <div class="post-meta">
          <span class="post-id">${p.id}</span>
          <span class="post-time">${escapeHtml(formatDate(p.timestamp))}</span>
          <span>Anonymous</span>
        </div>
        <div class="post-message">${escapeHtml(p.message)}</div>
        <div class="post-hash" title="Chain hash">&#x1F517; ${escapeHtml(p.hash)}</div>
      </article>
    `
    )
    .join('');
}

// ── Submit a post ──────────────────────────────────────────────────────────
postForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  formError.hidden = true;

  const message = messageInput.value.trim();
  if (!message) {
    showError('Please enter a message before posting.');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Posting…';

  try {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Failed to post. Try again.');
      return;
    }

    messageInput.value = '';
    charCount.textContent = '0 / 2000';
    await loadPosts();
  } catch {
    showError('Network error. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post';
  }
});

function showError(msg) {
  formError.textContent = msg;
  formError.hidden = false;
}

// ── Initial load ───────────────────────────────────────────────────────────
loadPosts();

// Refresh every 30 seconds so new posts from other users appear
setInterval(loadPosts, 30_000);
