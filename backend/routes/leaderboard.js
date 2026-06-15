const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/leaderboard
// Uses actual PC from pc_transactions (earn) for logged-in players
// Optional query param: ?game_id=3
router.get('/', async (req, res) => {
  try {
    const { game_id } = req.query;

    let query = `
      SELECT 
        pp.id as player_id,
        pp.name as player_name,
        pp.email as player_email,
        COALESCE(SUM(pt.points), 0) as total_pc,
        COUNT(pt.id) as play_count,
        MAX(pt.created_at) as last_played
      FROM promo_players pp
      LEFT JOIN pc_transactions pt ON pt.player_id = pp.id AND pt.type = 'earn'
    `;

    const params = [];

    if (game_id) {
      query += ` AND pt.game_id = ?`;
      params.push(game_id);
    }

    query += `
      GROUP BY pp.id, pp.name, pp.email
      HAVING total_pc > 0
      ORDER BY total_pc DESC, last_played ASC
      LIMIT 100
    `;

    const [rows] = await db.query(query, params);

    const entries = rows.map((row, i) => ({
      rank: i + 1,
      player_name: row.player_name || 'Anonymous',
      player_email: row.player_email,
      total_plays: row.play_count,
      total_pc: row.total_pc,
      last_played: row.last_played,
    }));

    res.json({ success: true, entries });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
