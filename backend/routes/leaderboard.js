const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/leaderboard
// Optional query param: ?game_id=3
router.get('/', async (req, res) => {
  try {
    const { game_id } = req.query;

    let query = `
      SELECT 
        ps.id,
        ps.score,
        ps.total_scoreable,
        ps.completed_at,
        ps.game_id,
        g.name as game_name,
        JSON_UNQUOTE(
          COALESCE(
            JSON_EXTRACT(ps.player_data, '$.Name'),
            JSON_EXTRACT(ps.player_data, '$.name'),
            JSON_EXTRACT(ps.player_data, '$."Full Name"'),
            JSON_EXTRACT(ps.player_data, '$."full name"'),
            JSON_EXTRACT(ps.player_data, '$.FullName'),
            JSON_EXTRACT(ps.player_data, '$.fullname')
          )
        ) as player_name,
        JSON_UNQUOTE(
          COALESCE(
            JSON_EXTRACT(ps.player_data, '$.Email'),
            JSON_EXTRACT(ps.player_data, '$.email'),
            JSON_EXTRACT(ps.player_data, '$."Email Address"'),
            JSON_EXTRACT(ps.player_data, '$."email address"')
          )
        ) as player_email
      FROM player_sessions ps
      JOIN games g ON ps.game_id = g.id
      WHERE ps.completed = 1
    `;

    const params = [];
    if (game_id) {
      query += ` AND ps.game_id = ?`;
      params.push(game_id);
    }

    const [rows] = await db.query(query, params);

    // Group by player email — one entry per player, 50 PP per completed play
    const playerMap = new Map();
    for (const row of rows) {
      const key = (row.player_email && row.player_email !== 'null')
        ? row.player_email
        : `anon_${row.player_name || row.id}`;

      if (!playerMap.has(key)) {
        playerMap.set(key, {
          player_name: (row.player_name && row.player_name !== 'null') ? row.player_name : 'Anonymous',
          player_email: (row.player_email && row.player_email !== 'null') ? row.player_email : null,
          total_plays: 0,
          promo_points: 0,
          last_played: row.completed_at,
        });
      }

      const p = playerMap.get(key);
      p.total_plays += 1;
      p.promo_points += 50; // 50 PP per completed play
      if (row.completed_at && row.completed_at > p.last_played) {
        p.last_played = row.completed_at;
      }
    }

    // Sort by PP descending, then by last played ascending (earlier = better tiebreak)
    const entries = Array.from(playerMap.values())
      .sort((a, b) => b.promo_points - a.promo_points || new Date(a.last_played) - new Date(b.last_played))
      .slice(0, 100)
      .map((e, i) => ({ rank: i + 1, ...e }));

    res.json({ success: true, entries });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;