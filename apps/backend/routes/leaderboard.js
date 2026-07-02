const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/leaderboard
// Shows real PC balance from promo_players
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT
        pp.id,
        pp.name   as player_name,
        pp.username as player_username,
        pp.email,
        pp.avatar_id,
        pp.pc_balance as total_pc,
        pp.created_at
      FROM promo_players pp
      ORDER BY pp.pc_balance DESC
      LIMIT 50
    `;

    const [rows] = await db.query(query);

    const entries = rows.map((row, i) => ({
      ...row,
      rank: i + 1,
      games_played: 0,
      last_played_at: null,
      player_name: row.player_username || row.player_name || 'Anonymous',
    }));

    res.json({ success: true, entries });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/leaderboard/all - All promo players by PC balance (for landing page)
router.get('/all', async (req, res) => {
  try {
    const query = `
      SELECT
        pp.id,
        pp.name   as player_name,
        pp.username as player_username,
        pp.email,
        pp.avatar_id,
        pp.pc_balance as total_pc,
        pp.created_at
      FROM promo_players pp
      ORDER BY pp.pc_balance DESC
    `;

    const [rows] = await db.query(query);

    const entries = rows.map((row, i) => ({
      ...row,
      rank: i + 1,
      games_played: 0,
      last_played_at: null,
      player_name: row.player_username || row.player_name || 'Anonymous',
    }));

    res.json({ success: true, entries });
  } catch (err) {
    console.error('Leaderboard all error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
