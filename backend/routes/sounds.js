const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

// GET all sounds for a game
router.get('/games/:gameId/sounds', auth, async (req, res) => {
  try {
    const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ? ORDER BY created_at DESC', [req.params.gameId]);
    res.json({ success: true, sounds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST upload sound for a game
router.post('/games/:gameId/sounds', auth, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  const { name, sound_type } = req.body;
  try {
    const url = `/uploads/sounds/${req.file.filename}`;
    const [result] = await db.query(
      'INSERT INTO sounds (game_id, name, url, sound_type) VALUES (?, ?, ?, ?)',
      [req.params.gameId, name || req.file.originalname, url, sound_type || 'custom']
    );
    const [s] = await db.query('SELECT * FROM sounds WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, sound: s[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE sound
router.delete('/sounds/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM sounds WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
