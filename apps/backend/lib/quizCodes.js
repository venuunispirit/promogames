const db = require('../config/db');

// ── Sequential unique code generation helpers ────────────────────────────────
// Codes are drawn from the configured range in a SCRAMBLED order (a bijective,
// seed-based permutation), so players never see obvious 0001, 0002, 0003 …
// patterns while every code stays unique and is never reused. Allocation is
// race-condition safe: the allocation counter + shuffle seed live on the
// quiz_settings row and are read/advanced under a `SELECT ... FOR UPDATE` row
// lock inside a transaction.

const PLACEHOLDER = /\{\{\s*generated_code\s*\}\}/g;
const CODE_RE = /^([A-Za-z]+)(\d+)$/;

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

/**
 * Pick a permutation seed { k, salt } for a range of `total` positions.
 * `pos = (offset * k + salt) % total` is a bijection of [0, total) iff
 * gcd(k, total) === 1 — every position is hit exactly once, just out of order.
 */
function chooseSeed(total) {
  if (total < 1) total = 1;
  let k = 1;
  if (total > 1) {
    let attempts = 0;
    do {
      k = 1 + Math.floor(Math.random() * (total - 1));
      attempts++;
    } while (gcd(k, total) !== 1 && attempts < 1000);
    if (gcd(k, total) !== 1) k = total - 1; // last resort (works when total itself is coprime-friendly)
  }
  const salt = total > 1 ? Math.floor(Math.random() * total) : 0;
  return { k, salt };
}

/** Map a 0-based allocation offset to a scrambled position within [0, total). */
function permutePosition(offset, total, k, salt) {
  if (total < 1) return 0;
  return (((offset * k) % total) + salt) % total;
}

/**
 * Parse and validate a code range like "FL0001" -> "FL10000".
 * Returns { prefix, fromNum, toNum, width, total } or { error }.
 */
function parseCodeRange(codeFrom, codeTo) {
  if (codeFrom === undefined || codeFrom === null || String(codeFrom).trim() === '') {
    return { error: 'Code From is required when code generation is enabled.' };
  }
  if (codeTo === undefined || codeTo === null || String(codeTo).trim() === '') {
    return { error: 'Code To is required when code generation is enabled.' };
  }
  const fromStr = String(codeFrom).trim();
  const toStr = String(codeTo).trim();

  const fromMatch = fromStr.match(CODE_RE);
  const toMatch = toStr.match(CODE_RE);
  if (!fromMatch || !toMatch) {
    return { error: 'Code From and Code To must contain a valid prefix followed by a number. Example: FL0001.' };
  }
  if (fromMatch[1].toLowerCase() !== toMatch[1].toLowerCase()) {
    return { error: 'Code From and Code To must share the same prefix. Example: FL0001 → FL10000.' };
  }

  const fromNum = parseInt(fromMatch[2], 10);
  const toNum = parseInt(toMatch[2], 10);
  if (!Number.isFinite(fromNum) || !Number.isFinite(toNum)) {
    return { error: 'Invalid numeric portion in code range.' };
  }
  if (fromNum < 0 || toNum < 0) {
    return { error: 'Code range numbers must be zero or a positive integer.' };
  }
  if (fromNum > toNum) {
    return { error: 'Code From must not be greater than Code To.' };
  }

  const total = toNum - fromNum + 1;
  if (total > 2000000) {
    return { error: 'Code range is too large (max 2,000,000 codes).' };
  }

  return {
    prefix: fromMatch[1],
    fromNum,
    toNum,
    width: fromMatch[2].length,
    total,
  };
}

/**
 * Build the display code string, e.g. prefix "FL", num 1, width 4 -> "FL0001".
 * Wider numbers (>= 10^width) are emitted without truncation, e.g. 10000 -> "FL10000".
 */
function formatCode(prefix, num, width) {
  return prefix + String(num).padStart(width, '0');
}

/**
 * Number portion of a code string (falls back to NaN).
 */
function codeNumber(code) {
  const m = String(code || '').match(CODE_RE);
  return m ? parseInt(m[2], 10) : NaN;
}

/**
 * Load an already-allocated code for a submission (idempotent retries).
 */
async function getExistingCode(gameId, submissionId) {
  if (!submissionId) return null;
  const [rows] = await db.query(
    'SELECT * FROM quiz_generated_codes WHERE game_id = ? AND submission_id = ? LIMIT 1',
    [gameId, submissionId]
  );
  return rows[0] || null;
}

/**
 * Fetches the reward code that was recorded on an already-completed session
 * (used when a submission is completed more than once).
 */
async function getCodeForSession(sessionId) {
  if (!sessionId) return null;
  const [rows] = await db.query(
    'SELECT * FROM quiz_generated_codes WHERE submission_id = ? ORDER BY id DESC LIMIT 1',
    [sessionId]
  );
  return rows[0] || null;
}

/**
 * Allocate the next scrambled-but-unique code for a quiz.
 *
 * Codes never look sequential: offset -> position = (offset * k + salt) % total,
 * a bijection over the range, so every position is hit exactly once while the
 * values that players see are shuffled. Collisions (only possible after an
 * admin changes the range/seed) are resolved by probing forward to the next
 * free position — uniqueness is still guaranteed.
 *
 * Concurrency strategy (MySQL/InnoDB):
 *   BEGIN
 *   SELECT ... FROM quiz_settings WHERE game_id = ? FOR UPDATE  -- serialises allocators
 *   pos = permute(code_current_number) ->  code = from + pos
 *   INSERT INTO quiz_generated_codes ...  (UNIQUE(game_id, code) guard)
 *   UPDATE quiz_settings SET code_current_number = code_current_number + 1
 *   COMMIT
 *
 * Two concurrent submissions therefore always receive different, non-sequential codes.
 * Returns { code, seq } or { exhausted: true } or { error }.
 */
async function allocateNextCode(gameId, settings) {
  const parsed = parseCodeRange(settings.code_from, settings.code_to);
  if (parsed.error) return { error: parsed.error };

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [settingsRows] = await conn.query(
      'SELECT code_from, code_to, code_current_number, code_shuffle_k, code_shuffle_salt FROM quiz_settings WHERE game_id = ? ORDER BY id DESC LIMIT 1 FOR UPDATE',
      [gameId]
    );
    if (settingsRows.length === 0) {
      await conn.rollback();
      return { error: 'Quiz settings not found for code generation.' };
    }

    const row = settingsRows[0];
    const current = parseInt(row.code_current_number, 10) || 0;
    const total = parsed.total;

    if (current >= total) {
      await conn.rollback();
      return { exhausted: true };
    }

    // Seed the shuffle — should always be set by the settings save path; fall
    // back to a deterministic seed derived from the game id if it ever isn't.
    let k = parseInt(row.code_shuffle_k, 10);
    let salt = parseInt(row.code_shuffle_salt, 10);
    if (!Number.isFinite(k) || !Number.isFinite(salt)) {
      k = (gameId * 2654435761) % 1000000007;
      salt = (gameId * 40503) % total;
    }

    // Probe forward for a free position (normally the very first try is free).
    let seq = null;
    let code = null;
    for (let probe = 0; probe < total; probe++) {
      const pos = permutePosition(current + probe, total, k, salt);
      const candidate = parsed.fromNum + pos;
      if (candidate > parsed.toNum) continue; // defensive; pos is already in [0,total)
      const candidateCode = formatCode(parsed.prefix, candidate, parsed.width);
      const [existing] = await conn.query(
        'SELECT id FROM quiz_generated_codes WHERE game_id = ? AND generated_code = ? LIMIT 1',
        [gameId, candidateCode]
      );
      if (existing.length === 0) {
        seq = candidate;
        code = candidateCode;
        break;
      }
    }

    if (seq === null) {
      await conn.rollback();
      return { exhausted: true };
    }

    await conn.query(
      'INSERT INTO quiz_generated_codes (game_id, submission_id, user_id, generated_code, seq_number) VALUES (?, ?, ?, ?, ?)',
      [gameId, (settings.submission_id || null), (settings.user_id || null), code, seq]
    );

    await conn.query(
      'UPDATE quiz_settings SET code_current_number = ? WHERE game_id = ?',
      [current + 1, gameId]
    );

    await conn.commit();
    return { code, seq };
  } catch (err) {
    try { await conn.rollback(); } catch {}
    // Duplicate key — something inserted the same code concurrently; treat as exhausted/error.
    if (err && (err.code === 'ER_DUP_ENTRY')) {
      return { error: 'Duplicate code detected during allocation.' };
    }
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Count already-allocated codes that fall inside a configured range.
 */
async function countCodesInRange(gameId, parsed) {
  if (!parsed || parsed.error) return 0;
  const [rows] = await db.query(
    'SELECT COUNT(*) AS c FROM quiz_generated_codes WHERE game_id = ? AND seq_number BETWEEN ? AND ?',
    [gameId, parsed.fromNum, parsed.toNum]
  );
  return parseInt(rows[0]?.c, 10) || 0;
}

/**
 * Apply the {{generated_code}} placeholder to HTML (email templates).
 *
 * enabled + code  -> replace placeholder with the real code.
 * enabled, no code -> drop the placeholder (keep the surrounding text).
 * disabled        -> drop the placeholder AND strip now-empty wrapper tags so a
 *                    "Your code:" label without a value is not left dangling.
 */
function applyEmailPlaceholder(html, code, enabled) {
  if (typeof html !== 'string' || !html) return html || '';
  const hasPlaceholder = PLACEHOLDER.test(html);
  if (!hasPlaceholder) return html;

  if (enabled && code) {
    return html.replace(PLACEHOLDER, code);
  }

  // Remove the placeholder, then repeatedly strip empty wrapper elements so the
  // code block completely disappears when code sending is disabled.
  let out = html.replace(PLACEHOLDER, '').trim();
  const EMPTY_TAG = /<(\w+)[^>]*>\s*<\/\1>/g;
  let prev = out;
  for (let i = 0; i < 20; i++) {
    out = out.replace(EMPTY_TAG, '');
    if (out === prev) break;
    prev = out;
  }
  // Collapse any leftover repeated <br>/whitespace blocks
  out = out.replace(/(<br\s*\/?>\s*){2,}/gi, '<br />');
  return out.trim();
}

module.exports = {
  parseCodeRange,
  formatCode,
  codeNumber,
  chooseSeed,
  getExistingCode,
  getCodeForSession,
  allocateNextCode,
  countCodesInRange,
  applyEmailPlaceholder,
};