const express = require('express');
const router = express.Router();
const db = require('../config/db');
const crypto = require('crypto');
const auth = require('../middleware/auth');

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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET room by code
router.get('/room/:code', async (req, res) => {
  try {
    const [rooms] = await db.query('SELECT * FROM chess_rooms WHERE room_code = ?', [req.params.code.toUpperCase()]);
    if (rooms.length === 0) return res.status(404).json({ success: false, error: 'Room not found' });
    res.json({ success: true, room: rooms[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
