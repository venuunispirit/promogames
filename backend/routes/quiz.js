const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/games/:gameId/questions', auth, async (req, res) => {
  try {
    const [questions] = await db.query('SELECT * FROM questions WHERE game_id = ? ORDER BY question_order', [req.params.gameId]);
    for (let q of questions) {
      const [options] = await db.query('SELECT * FROM options WHERE question_id = ? ORDER BY option_order', [q.id]);
      q.options = options;
    }
    res.json({ success: true, questions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/games/:gameId/questions', auth, upload.fields([
  { name: 'question_image', maxCount: 1 },
  { name: 'question_bg_image', maxCount: 1 }
]), async (req, res) => {
  const { question_text, question_type, question_color, question_order, num_options,
    sound_correct, sound_wrong, sound_neutral, sound_correct_id, sound_wrong_id, sound_neutral_id,
    overlay_duration, overlay_idle_time, overlay_animation_in, overlay_animation_out,
    question_image_animation } = req.body;
  try {
    const img_url = req.files?.question_image ? `/uploads/images/${req.files.question_image[0].filename}` : null;
    const bg_url = req.files?.question_bg_image ? `/uploads/images/${req.files.question_bg_image[0].filename}` : null;
    const [result] = await db.query(
      `INSERT INTO questions (game_id, question_text, question_image_url, question_bg_image_url, question_type, question_color, question_order, num_options, sound_correct, sound_wrong, sound_neutral, sound_correct_id, sound_wrong_id, sound_neutral_id, overlay_duration, overlay_idle_time, overlay_animation_in, overlay_animation_out, question_image_animation)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.gameId, question_text, img_url, bg_url, question_type || 'right_wrong', question_color || '#1a1a2e', question_order || 0, num_options || 4,
       sound_correct, sound_wrong, sound_neutral, sound_correct_id || null, sound_wrong_id || null, sound_neutral_id || null,
       overlay_duration || 3, overlay_idle_time || 3, overlay_animation_in || 'flyFromBottom', overlay_animation_out || 'flyToTop',
       question_image_animation || 'float']
    );
    const [q] = await db.query('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, question: { ...q[0], options: [] } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/questions/:id', auth, upload.fields([
  { name: 'question_image', maxCount: 1 },
  { name: 'question_bg_image', maxCount: 1 }
]), async (req, res) => {
  const { question_text, question_type, question_color, question_order, num_options,
    sound_correct, sound_wrong, sound_neutral, sound_correct_id, sound_wrong_id, sound_neutral_id,
    overlay_duration, overlay_idle_time, overlay_animation_in, overlay_animation_out,
    question_image_animation } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Question not found' });
    const img_url = req.files?.question_image ? `/uploads/images/${req.files.question_image[0].filename}` : existing[0].question_image_url;
    const bg_url = req.files?.question_bg_image ? `/uploads/images/${req.files.question_bg_image[0].filename}` : existing[0].question_bg_image_url;
    await db.query(
      `UPDATE questions SET question_text=?, question_image_url=?, question_bg_image_url=?, question_type=?, question_color=?, question_order=?, num_options=?,
       sound_correct=?, sound_wrong=?, sound_neutral=?, sound_correct_id=?, sound_wrong_id=?, sound_neutral_id=?,
       overlay_duration=?, overlay_idle_time=?, overlay_animation_in=?, overlay_animation_out=?,
       question_image_animation=? WHERE id=?`,
      [question_text, img_url, bg_url, question_type, question_color, question_order, num_options,
       sound_correct, sound_wrong, sound_neutral, sound_correct_id || null, sound_wrong_id || null, sound_neutral_id || null,
       overlay_duration || 3, overlay_idle_time || 3, overlay_animation_in || 'flyFromBottom', overlay_animation_out || 'flyToTop',
       question_image_animation || 'float',
       req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM questions WHERE id = ?', [req.params.id]);
    const [options] = await db.query('SELECT * FROM options WHERE question_id = ? ORDER BY option_order', [req.params.id]);
    res.json({ success: true, question: { ...updated[0], options } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/questions/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM questions WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/games/:gameId/questions/reorder', auth, async (req, res) => {
  const { order } = req.body;
  try {
    for (const item of order) {
      await db.query('UPDATE questions SET question_order = ? WHERE id = ?', [item.question_order, item.id]);
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/questions/:questionId/options', auth, upload.fields([
  { name: 'option_image', maxCount: 1 },
  { name: 'option_overlay_image', maxCount: 1 }
]), async (req, res) => {
  const { option_text, option_color, option_text_color, is_correct, option_order } = req.body;
  try {
    // FIX: Properly parse is_correct from string form data ("0", "1", "true", "false")
    const isCorrectBool = is_correct === 1 || is_correct === true || is_correct === '1' || is_correct === 'true';
    const img_url = req.files?.option_image ? `/uploads/images/${req.files.option_image[0].filename}` : null;
    const overlay_url = req.files?.option_overlay_image ? `/uploads/images/${req.files.option_overlay_image[0].filename}` : null;
    const [result] = await db.query(
      'INSERT INTO options (question_id, option_text, option_image_url, option_overlay_image_url, option_color, option_text_color, is_correct, option_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.params.questionId, option_text, img_url, overlay_url, option_color || '#1a1a2e', option_text_color || '#ffffff', isCorrectBool ? 1 : 0, option_order || 0]
    );
    const [opt] = await db.query('SELECT * FROM options WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, option: opt[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/options/:id', auth, upload.fields([
  { name: 'option_image', maxCount: 1 },
  { name: 'option_overlay_image', maxCount: 1 }
]), async (req, res) => {
  const { option_text, option_color, option_text_color, is_correct, option_order } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM options WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Option not found' });

    // FIX: Properly parse is_correct — req.body values are always strings when sent as form data.
    // A non-empty string like "0" or "false" is truthy in JS, which caused all options to be
    // saved as correct. We must explicitly check for truthy string/number values only.
    const isCorrectBool = is_correct === 1 || is_correct === true || is_correct === '1' || is_correct === 'true';

    // If marking this option as correct, unmark all other options in the same question
    if (isCorrectBool) {
      await db.query('UPDATE options SET is_correct = 0 WHERE question_id = ? AND id != ?', [existing[0].question_id, req.params.id]);
    }

    const img_url = req.files?.option_image ? `/uploads/images/${req.files.option_image[0].filename}` : existing[0].option_image_url;
    const overlay_url = req.files?.option_overlay_image ? `/uploads/images/${req.files.option_overlay_image[0].filename}` : existing[0].option_overlay_image_url;
    await db.query(
      'UPDATE options SET option_text=?, option_image_url=?, option_overlay_image_url=?, option_color=?, option_text_color=?, is_correct=?, option_order=? WHERE id=?',
      [option_text, img_url, overlay_url, option_color, option_text_color || existing[0].option_text_color || '#ffffff', isCorrectBool ? 1 : 0, option_order, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM options WHERE id = ?', [req.params.id]);
    res.json({ success: true, option: updated[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/options/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM options WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;