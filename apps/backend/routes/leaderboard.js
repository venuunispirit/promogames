const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/leaderboard
// Uses actual PC from pc_transactions (earn) for logged-in players
// Optional query param: ?game_id=3
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        ps.id as serial_number,
        ps.score as total_pc,
        JSON_UNQUOTE(JSON_EXTRACT(ps.player_data, '$."Full Name"')) as player_name,
        JSON_UNQUOTE(JSON_EXTRACT(ps.player_data, '$."Email Address"')) as player_email,
        u.id IS NOT NULL as has_account
      FROM player_sessions ps
      LEFT JOIN users u ON u.email = JSON_UNQUOTE(JSON_EXTRACT(ps.player_data, '$."Email Address"'))
      WHERE ps.completed = 1
      ORDER BY ps.score DESC, ps.created_at DESC
    `;

    const [rows] = await db.query(query);

    // Logic: Top 3 by score, then 5 most recent from the rest.
    const top3 = rows.slice(0, 3);
    const remainder = rows.slice(3);
    const last5 = remainder.slice(-5).reverse();

    const entries = [...top3, ...last5].map((row, i) => ({
      ...row,
      rank: i + 1,
      player_name: row.player_name || 'Anonymous',
    }));

    res.json({ success: true, entries });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leaderboard/all - Get ALL completed player sessions (for landing page)
router.get('/all', async (req, res) => {
  try {
    const query = `
      SELECT 
        ps.id as serial_number,
        ps.score as total_pc,
        JSON_UNQUOTE(JSON_EXTRACT(ps.player_data, '$."Full Name"')) as player_name,
        JSON_UNQUOTE(JSON_EXTRACT(ps.player_data, '$."Email Address"')) as player_email,
        ps.started_at,
        ps.completed_at,
        u.id IS NOT NULL as has_account
      FROM player_sessions ps
      LEFT JOIN users u ON u.email = JSON_UNQUOTE(JSON_EXTRACT(ps.player_data, '$."Email Address"'))
      WHERE ps.completed = 1
      ORDER BY ps.score DESC, ps.started_at DESC
    `;

    const [rows] = await db.query(query);

    const entries = rows.map((row, i) => ({
      ...row,
      rank: i + 1,
      player_name: row.player_name || 'Anonymous',
    }));

    res.json({ success: true, entries });
  } catch (err) {
    console.error('Leaderboard all error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
