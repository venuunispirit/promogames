const express = require('express')
const router  = express.Router()
const db      = require('../config/db')
const authMiddleware = require('../middleware/auth')  // your existing JWT middleware

// All routes require admin JWT
router.use(authMiddleware)

// ── GET /api/players-admin ─────────────────────────────────────────────────
// Returns all promo players + summary stats
router.get('/', async (req, res) => {
  try {
    // All players
    const [players] = await db.query(`
      SELECT
        id, name, username, email, whatsapp, city, pincode,
        pc_balance, dob, created_at
      FROM promo_players
      ORDER BY created_at DESC
    `)

    // Stats
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*)                                         AS total,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS new_month,
        SUM(pc_balance)                                  AS total_pc,
        ROUND(AVG(pc_balance))                           AS avg_pc
      FROM promo_players
    `)

    res.json({ success: true, players, stats })
  } catch (err) {
    console.error('players-admin GET /', err)
    res.status(500).json({ success: false, message: 'Failed to load players' })
  }
})

// ── GET /api/players-admin/:id/transactions ───────────────────────────────
// Returns full transaction history for one player
router.get('/:id/transactions', async (req, res) => {
  try {
    const { id } = req.params

    // Verify player exists
    const [[player]] = await db.query(
      'SELECT id, name, email, pc_balance FROM promo_players WHERE id = ?',
      [id]
    )
    if (!player) return res.status(404).json({ success: false, message: 'Player not found' })

    const [transactions] = await db.query(`
      SELECT id, type, points, note, created_at
      FROM pc_transactions
      WHERE player_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `, [id])

    res.json({ success: true, player, transactions })
  } catch (err) {
    console.error('players-admin GET /:id/transactions', err)
    res.status(500).json({ success: false, message: 'Failed to load transactions' })
  }
})

module.exports = router