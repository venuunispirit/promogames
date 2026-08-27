/* ⛠️  LEGACY ROUTE — OUT OF SERVICE (migrated)
 * Superseded by module: games/chess/route.js
 * This file is NO LONGER imported by apps/backend/server.js.
 * Kept temporarily for reference/rollback during migration testing.
 * TODO: DELETE this file once migrated-module testing is confirmed.
 * ---------------------------------------------------------------- */
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const { sendError } = require('../lib/apiError');

/* ── Helper: generate 6-char room code ─────────────────────────── */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) code += chars[bytes[i] % chars.length];
  return code;
}

/* ═══════════════ SETTINGS ═══════════════ */

// GET settings for a game
router.get('/settings/:gameId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM chess_settings WHERE game_id = ?', [req.params.gameId]);
    res.json({ success: true, settings: rows[0] || null });
  } catch (err) {
    sendError(res, err);
  }
});

// PUT (upsert) settings
router.put('/settings/:gameId', auth, async (req, res) => {
  try {
    const { difficulty, time_control, board_theme, primary_color, bg_color, intro_text, outro_text, show_coordinates, piece_style, sound_enabled } = req.body;
    const [existing] = await db.query('SELECT id FROM chess_settings WHERE game_id = ?', [req.params.gameId]);
    if (existing.length > 0) {
      await db.query(`UPDATE chess_settings SET difficulty=?, time_control=?, board_theme=?, primary_color=?, bg_color=?, intro_text=?, outro_text=?, show_coordinates=?, piece_style=?, sound_enabled=? WHERE game_id=?`,
        [difficulty, time_control, board_theme, primary_color, bg_color, intro_text, outro_text, show_coordinates, piece_style, sound_enabled, req.params.gameId]);
    } else {
      await db.query(`INSERT INTO chess_settings (game_id, difficulty, time_control, board_theme, primary_color, bg_color, intro_text, outro_text, show_coordinates, piece_style, sound_enabled) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [req.params.gameId, difficulty, time_control, board_theme, primary_color, bg_color, intro_text, outro_text, show_coordinates, piece_style, sound_enabled]);
    }
    res.json({ success: true });
  } catch (err) {
    sendError(res, err);
  }
});

/* ═══════════════ ROOMS (multiplayer) ═══════════════ */

// POST create room
router.post('/room', async (req, res) => {
  try {
    const { game_id, player_name, time_control } = req.body;
    let room_code;
    let attempts = 0;
    do {
      room_code = generateRoomCode();
      const [existing] = await db.query('SELECT id FROM chess_rooms WHERE room_code = ?', [room_code]);
      if (existing.length === 0) break;
      attempts++;
    } while (attempts < 10);

    const tc = time_control || 0;
    const [result] = await db.query(
      `INSERT INTO chess_rooms (room_code, game_id, player1_name, status, time_control, white_time_left, black_time_left) VALUES (?, ?, ?, 'waiting', ?, ?, ?)`,
      [room_code, game_id, player_name || 'Player 1', tc, tc, tc]
    );
    res.json({ success: true, room: { id: result.insertId, room_code, status: 'waiting' } });
  } catch (err) {
    sendError(res, err);
  }
});

// POST join room
router.post('/room/:code/join', async (req, res) => {
  try {
    const { player_name } = req.body;
    const [rooms] = await db.query('SELECT * FROM chess_rooms WHERE room_code = ?', [req.params.code.toUpperCase()]);
    if (rooms.length === 0) return res.status(404).json({ success: false, error: 'Room not found' });
    const room = rooms[0];
    if (room.status !== 'waiting') return res.status(400).json({ success: false, error: 'Game already in progress' });
    if (room.player2_id && room.player2_id !== null) return res.status(400).json({ success: false, error: 'Room is full' });

    await db.query(
      `UPDATE chess_rooms SET player2_name = ?, status = 'active', updated_at = NOW() WHERE id = ?`,
      [player_name || 'Player 2', room.id]
    );
    res.json({ success: true, room: { ...room, player2_name: player_name || 'Player 2', status: 'active' } });
  } catch (err) {
    sendError(res, err);
  }
});

// GET room by code
router.get('/room/:code', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM chess_rooms WHERE room_code = ?', [req.params.code.toUpperCase()]);
    if (rooms.length === 0) return res.status(404).json({ success: false, error: 'Room not found' });
    res.json({ success: true, room: rooms[0] });
  } catch (err) {
    sendError(res, err);
  }
});

// POST make move
router.post('/room/:code/move', async (req, res) => {
  try {
    const { notation, fen_after, player_color, time_spent } = req.body;
    const [rooms] = await db.query('SELECT * FROM chess_rooms WHERE room_code = ?', [req.params.code.toUpperCase()]);
    if (rooms.length === 0) return res.status(404).json({ success: false, error: 'Room not found' });
    const room = rooms[0];
    if (room.status !== 'active') return res.status(400).json({ success: false, error: 'Game not active' });
    if (room.current_turn !== player_color) return res.status(400).json({ success: false, error: 'Not your turn' });

    const [moveCount] = await db.query('SELECT COUNT(*) as cnt FROM chess_moves WHERE room_id = ?', [room.id]);
    const moveNumber = moveCount[0].cnt + 1;

    await db.query(
      `INSERT INTO chess_moves (room_id, move_number, notation, fen_before, fen_after, player_color, time_spent) VALUES (?,?,?,?,?,?,?)`,
      [room.id, moveNumber, notation, room.fen, fen_after, player_color, time_spent || 0]
    );

    const nextTurn = player_color === 'white' ? 'black' : 'white';
    const newWhiteTime = player_color === 'white' ? Math.max(0, room.white_time_left - (time_spent || 0) + (room.time_control || 0)) : room.white_time_left;
    const newBlackTime = player_color === 'black' ? Math.max(0, room.black_time_left - (time_spent || 0) + (room.time_control || 0)) : room.black_time_left;

    await db.query(
      `UPDATE chess_rooms SET fen = ?, current_turn = ?, white_time_left = ?, black_time_left = ?, updated_at = NOW() WHERE id = ?`,
      [fen_after, nextTurn, newWhiteTime, newBlackTime, room.id]
    );

    res.json({ success: true, move: { notation, move_number: moveNumber, player_color }, next_turn: nextTurn });
  } catch (err) {
    sendError(res, err);
  }
});

// GET moves after a certain move number (for polling)
router.get('/room/:code/moves', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM chess_rooms WHERE room_code = ?', [req.params.code.toUpperCase()]);
    if (rooms.length === 0) return res.status(404).json({ success: false, error: 'Room not found' });
    const after = parseInt(req.query.after) || 0;
    const [moves] = await db.query(
      'SELECT * FROM chess_moves WHERE room_id = ? AND move_number > ? ORDER BY move_number ASC',
      [rooms[0].id, after]
    );
    res.json({ success: true, moves, room: rooms[0] });
  } catch (err) {
    sendError(res, err);
  }
});

// POST end game
router.post('/room/:code/end', async (req, res) => {
  try {
    const { result, player_color } = req.body;
    const [rooms] = await db.query('SELECT * FROM chess_rooms WHERE room_code = ?', [req.params.code.toUpperCase()]);
    if (rooms.length === 0) return res.status(404).json({ success: false, error: 'Room not found' });
    await db.query(`UPDATE chess_rooms SET status = 'finished', result = ?, updated_at = NOW() WHERE id = ?`, [result, rooms[0].id]);
    res.json({ success: true });
  } catch (err) {
    sendError(res, err);
  }
});

// POST resign
router.post('/room/:code/resign', async (req, res) => {
  try {
    const { player_color } = req.body;
    const [rooms] = await db.query('SELECT * FROM chess_rooms WHERE room_code = ?', [req.params.code.toUpperCase()]);
    if (rooms.length === 0) return res.status(404).json({ success: false, error: 'Room not found' });
    const winner = player_color === 'white' ? 'black' : 'white';
    await db.query(`UPDATE chess_rooms SET status = 'finished', result = ?, updated_at = NOW() WHERE id = ?`, [winner, rooms[0].id]);
    res.json({ success: true, winner });
  } catch (err) {
    sendError(res, err);
  }
});

// POST offer/accept draw
router.post('/room/:code/draw', async (req, res) => {
  try {
    const { action, player_color } = req.body; // 'offer' or 'accept'
    const [rooms] = await db.query('SELECT * FROM chess_rooms WHERE room_code = ?', [req.params.code.toUpperCase()]);
    if (rooms.length === 0) return res.status(404).json({ success: false, error: 'Room not found' });
    if (action === 'accept') {
      await db.query(`UPDATE chess_rooms SET status = 'finished', result = 'draw', updated_at = NOW() WHERE id = ?`, [rooms[0].id]);
      return res.json({ success: true, result: 'draw' });
    }
    res.json({ success: true, draw_offered_by: player_color });
  } catch (err) {
    sendError(res, err);
  }
});

/* ═══════════════ MATCHMAKING QUEUE (in-memory) ═══════════════
   Simple queue with 60-second TTL per entry. No DB needed —
   restarting the server clears the queue, which is fine.
   ──────────────────────────────────────────────────────────── */

const matchQueue = []; // { queueId, player_name, rating, time_control, joinedAt, roomCode }
const QUEUE_TTL_MS = 60_000;  // entries expire after 60s

function pruneQueue() {
  const now = Date.now();
  for (let i = matchQueue.length - 1; i >= 0; i--) {
    if (now - matchQueue[i].joinedAt > QUEUE_TTL_MS) matchQueue.splice(i, 1);
  }
}

// POST /api/chess/queue/join  — enter the matchmaking queue
// Returns { queued: true, queueId, roomCode? } or { matched: true, roomCode, color }
router.post('/queue/join', async (req, res) => {
  try {
    pruneQueue();
    const { player_name, rating, time_control, game_id } = req.body;
    const tc = time_control || 600;
    const myRating = parseInt(rating) || 1200;

    // Look for a waiting opponent with similar time control & rating (±300)
    const matchIdx = matchQueue.findIndex(e =>
      e.time_control === tc &&
      Math.abs(e.rating - myRating) <= 300
    );

    if (matchIdx !== -1) {
      // Match found — create a real room, remove them from queue
      const opponent = matchQueue.splice(matchIdx, 1)[0];

      let room_code;
      let attempts = 0;
      do {
        room_code = generateRoomCode();
        const [ex] = await db.query('SELECT id FROM chess_rooms WHERE room_code=?', [room_code]);
        if (ex.length === 0) break;
      } while (++attempts < 10);

      await db.query(
        `INSERT INTO chess_rooms (room_code, game_id, player1_name, player2_name, status, time_control, white_time_left, black_time_left)
         VALUES (?,?,?,?,'active',?,?,?)`,
        [room_code, game_id || 0, opponent.player_name, player_name || 'Player 2', tc, tc, tc]
      );

      // Tell opponent their room via their queued entry's roomCode field
      opponent.roomCode = room_code;
      opponent.opponentName = player_name || 'Player 2';
      opponent.myColor = 'white'; // opponent (creator) gets white

      return res.json({
        matched: true,
        roomCode: room_code,
        color: 'black',          // joiner gets black
        opponentName: opponent.player_name,
      });
    }

    // No match yet — add to queue
    const queueId = crypto.randomBytes(8).toString('hex');
    matchQueue.push({ queueId, player_name: player_name || 'Player', rating: myRating, time_control: tc, game_id: game_id || 0, joinedAt: Date.now(), roomCode: null });
    return res.json({ queued: true, queueId });
  } catch (err) {
    sendError(res, err);
  }
});

// GET /api/chess/queue/poll?queueId=xxx  — check if a match was found
router.get('/queue/poll', (req, res) => {
  pruneQueue();
  const { queueId } = req.query;
  if (!queueId) return res.status(400).json({ success: false, error: 'queueId required' });

  const entry = matchQueue.find(e => e.queueId === queueId);
  if (!entry) {
    // Entry gone — either matched (has roomCode) or expired
    return res.json({ matched: false, expired: true });
  }
  if (entry.roomCode) {
    // Match was found by the other player's /join call
    const { roomCode, opponentName, myColor } = entry;
    // Remove from queue now
    const idx = matchQueue.indexOf(entry);
    if (idx !== -1) matchQueue.splice(idx, 1);
    return res.json({ matched: true, roomCode, color: myColor || 'white', opponentName });
  }
  return res.json({ matched: false, queued: true, position: matchQueue.indexOf(entry) + 1 });
});

// DELETE /api/chess/queue/leave  — cancel search
router.delete('/queue/leave', (req, res) => {
  const { queueId } = req.body;
  if (queueId) {
    const idx = matchQueue.findIndex(e => e.queueId === queueId);
    if (idx !== -1) matchQueue.splice(idx, 1);
  }
  res.json({ success: true });
});

module.exports = router;
