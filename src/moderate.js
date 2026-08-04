'use strict';

/**
 * Simple keyword-based content moderation.
 * Returns { allowed: boolean, reason: string }
 *
 * This runs entirely locally with no external API calls so it is always free.
 * Add or remove terms in the BLOCKED list to tune moderation.
 */

const BLOCKED_PATTERNS = [
  // Slurs and hate speech (partial list — extend as needed)
  /\bn[i1!]gg[ae3]/i,
  /\bf[a@]gg[o0]t/i,
  /\bk[i1]ke/i,
  /\bsp[i1]c/i,
  /\bch[i1]nk/i,
  // Extreme violence / threats
  /\bkill\s+your?self\b/i,
  /\bi\s+will\s+kill\b/i,
  /\bbomb\s+threat\b/i,
  // Spam / flooding: message longer than 2000 chars is suspicious
];

const MAX_MESSAGE_LENGTH = 2000;
const MIN_MESSAGE_LENGTH = 1;

function moderate(message) {
  if (typeof message !== 'string') {
    return { allowed: false, reason: 'Message must be a string.' };
  }

  const trimmed = message.trim();

  if (trimmed.length < MIN_MESSAGE_LENGTH) {
    return { allowed: false, reason: 'Message is empty.' };
  }

  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      allowed: false,
      reason: `Message exceeds the ${MAX_MESSAGE_LENGTH}-character limit.`,
    };
  }

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { allowed: false, reason: 'Message contains prohibited content.' };
    }
  }

  return { allowed: true, reason: '' };
}

module.exports = { moderate };
