const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const path = require('path');
const fs = require('fs');

// Helper: delete a file stored as a /uploads/... URL from disk
function deleteUploadFile(urlPath) {
  if (!urlPath) return;
  try {
    const abs = path.join(__dirname, '..', urlPath);
    if (fs.existsSync(abs)) {
      fs.unlinkSync(abs);
      console.log('🗑️  Deleted file:', urlPath);
    }
  } catch (e) {
    console.warn('⚠️  Could not delete file:', urlPath, e.message);
  }
}


function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
    .replace(/^-+/, '').replace(/-+$/, '');
}

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT g.*, c.company_name, c.slug as client_slug,
      (SELECT COUNT(*) FROM questions q WHERE q.game_id = g.id) as question_count,
      (SELECT COUNT(*) FROM player_sessions ps WHERE ps.game_id = g.id AND ps.completed = 1) as play_count
      FROM games g LEFT JOIN clients c ON g.client_id = c.id ORDER BY g.created_at DESC
    `);
    res.json({ success: true, games: rows });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const [games] = await db.query(`SELECT g.*, c.company_name, c.slug as client_slug FROM games g LEFT JOIN clients c ON g.client_id = c.id WHERE g.id = ?`, [req.params.id]);
    if (games.length === 0) return res.status(404).json({ success: false, message: 'Game not found' });
    const game = games[0];
    const [settings] = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [game.id]);
    const [emailTemplate] = await db.query('SELECT * FROM email_templates WHERE game_id = ?', [game.id]);
    const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
    const [questions] = await db.query('SELECT * FROM questions WHERE game_id = ? ORDER BY question_order', [game.id]);
    const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ? ORDER BY created_at DESC', [game.id]);
    for (let q of questions) {
      const [options] = await db.query('SELECT * FROM options WHERE question_id = ? ORDER BY option_order', [q.id]);
      q.options = options;
    }
    res.json({ success: true, game: { ...game, settings: settings[0] || null, emailTemplate: emailTemplate[0] || null, formFields, questions, sounds } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  const { client_id, name, category, description, redirect_url } = req.body;
  if (!client_id || !name) return res.status(400).json({ success: false, message: 'Client and game name required' });
  try {
    const [client] = await db.query('SELECT slug FROM clients WHERE id = ?', [client_id]);
    if (client.length === 0) return res.status(404).json({ success: false, message: 'Client not found' });
    let slug = slugify(name);
    const [existing] = await db.query('SELECT id FROM games WHERE slug = ? AND client_id = ?', [slug, client_id]);
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;
    const [result] = await db.query(
      `INSERT INTO games (client_id, name, slug, category, description, redirect_url, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [client_id, name, slug, category || 'quiz', description, redirect_url, req.user.id]
    );
    await db.query('INSERT INTO quiz_settings (game_id) VALUES (?)', [result.insertId]);
    const defaultFields = [['Full Name', 'text', 1, 0], ['Email Address', 'email', 1, 1], ['Phone Number', 'phone', 0, 2]];
    for (const [label, type, required, order] of defaultFields) {
      await db.query('INSERT INTO form_fields (game_id, field_label, field_type, is_required, field_order) VALUES (?, ?, ?, ?, ?)', [result.insertId, label, type, required, order]);
    }
    const [newGame] = await db.query('SELECT g.*, c.company_name, c.slug as client_slug FROM games g LEFT JOIN clients c ON g.client_id = c.id WHERE g.id = ?', [result.insertId]);
    res.status(201).json({ success: true, game: newGame[0] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const allowed = ['name','description','redirect_url','is_active','category','show_in_play_page','show_in_hero_page','meta_description'];
    const booleans = ['is_active','show_in_play_page','show_in_hero_page'];
    const fields = []; const values = [];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        fields.push(`${key}=?`);
        values.push(booleans.includes(key) ? (req.body[key] ? 1 : 0) : req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ success: false, message: 'No fields to update' });
    values.push(req.params.id);
    await db.query(`UPDATE games SET ${fields.join(', ')} WHERE id=?`, values);
    res.json({ success: true, message: 'Game updated' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const gameId = req.params.id;

    // ── Collect all file URLs associated with this game before deleting ──

    // 1. quiz_settings images
    const [settingsRows] = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [gameId]);
    if (settingsRows[0]) {
      const s = settingsRows[0];
      ['bg_image_url', 'thankyou_bg_image_url', 'game_logo_url', 'submit_confirm_gif_url'].forEach(f => deleteUploadFile(s[f]));
    }

    // 2. question images + option images
    const [questions] = await db.query('SELECT * FROM questions WHERE game_id = ?', [gameId]);
    for (const q of questions) {
      deleteUploadFile(q.question_image_url);
      deleteUploadFile(q.question_bg_image_url);
      const [options] = await db.query('SELECT * FROM options WHERE question_id = ?', [q.id]);
      for (const opt of options) {
        deleteUploadFile(opt.option_image_url);
        deleteUploadFile(opt.option_overlay_image_url);
      }
    }

    // 3. sound files
    const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ?', [gameId]);
    for (const s of sounds) {
      deleteUploadFile(s.url || s.file_url);
    }

    // ── Now delete the game (cascades to questions, options, settings, sounds, sessions) ──
    await db.query('DELETE FROM games WHERE id = ?', [gameId]);

    console.log(`🗑️  Game ${gameId} and all associated files deleted.`);
    res.json({ success: true, message: 'Game deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT settings - with image upload support
router.put('/:id/settings', auth, upload.fields([
  { name: 'bg_image', maxCount: 1 },
  { name: 'thankyou_bg_image', maxCount: 1 },
  { name: 'game_logo', maxCount: 1 },
  { name: 'submit_confirm_gif', maxCount: 1 }
]), async (req, res) => {
  const { bg_color, primary_color, show_progress, allow_back, time_per_question, intro_text, outro_text,
    win_sound_url, win_sound_id, lose_sound_id, sound_correct_id, sound_wrong_id,
    terms_enabled, terms_text, terms_url, send_email,
    bg_image_url, thankyou_bg_image_url, game_logo_url, font_family, submit_confirm_gif_url } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [req.params.id]);
    const bgImg   = req.files?.bg_image           ? `/uploads/images/${req.files.bg_image[0].filename}`           : (bg_image_url           || (existing[0]?.bg_image_url           || null));
    const tyImg   = req.files?.thankyou_bg_image  ? `/uploads/images/${req.files.thankyou_bg_image[0].filename}`  : (thankyou_bg_image_url  || (existing[0]?.thankyou_bg_image_url  || null));
    const logoImg = req.files?.game_logo          ? `/uploads/images/${req.files.game_logo[0].filename}`          : (game_logo_url !== undefined ? game_logo_url : (existing[0]?.game_logo_url || null));
    const gifImg  = req.files?.submit_confirm_gif ? `/uploads/images/${req.files.submit_confirm_gif[0].filename}` : (submit_confirm_gif_url || (existing[0]?.submit_confirm_gif_url  || null));

    await db.query(
      `INSERT INTO quiz_settings (game_id, bg_color, primary_color, show_progress, allow_back, time_per_question, intro_text, outro_text, win_sound_url, bg_image_url, thankyou_bg_image_url, terms_enabled, terms_text, terms_url, send_email, win_sound_id, lose_sound_id, sound_correct_id, sound_wrong_id, game_logo_url, font_family, submit_confirm_gif_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE bg_color=VALUES(bg_color), primary_color=VALUES(primary_color),
       show_progress=VALUES(show_progress), allow_back=VALUES(allow_back),
       time_per_question=VALUES(time_per_question), intro_text=VALUES(intro_text),
       outro_text=VALUES(outro_text), win_sound_url=VALUES(win_sound_url),
       bg_image_url=VALUES(bg_image_url), thankyou_bg_image_url=VALUES(thankyou_bg_image_url),
       terms_enabled=VALUES(terms_enabled), terms_text=VALUES(terms_text), terms_url=VALUES(terms_url),
       send_email=VALUES(send_email), win_sound_id=VALUES(win_sound_id), lose_sound_id=VALUES(lose_sound_id),
       sound_correct_id=VALUES(sound_correct_id), sound_wrong_id=VALUES(sound_wrong_id),
       game_logo_url=VALUES(game_logo_url), font_family=VALUES(font_family),
       submit_confirm_gif_url=VALUES(submit_confirm_gif_url)`,
      [req.params.id, bg_color, primary_color, show_progress, allow_back, time_per_question, intro_text, outro_text,
       win_sound_url, bgImg, tyImg, terms_enabled ? 1 : 0, terms_text, terms_url, send_email !== '0' ? 1 : 0,
       win_sound_id || null, lose_sound_id || null, sound_correct_id || null, sound_wrong_id || null,
       logoImg || null, font_family || 'DM Sans', gifImg || null]
    );
    res.json({ success: true, message: 'Settings saved' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT email template - NO SMTP fields
router.put('/:id/email-template', auth, async (req, res) => {
  const { sender_name, sender_email, subject, header_color, header_text, body_html, footer_text, is_enabled } = req.body;
  try {
    await db.query(
      `INSERT INTO email_templates (game_id, sender_name, sender_email, subject, header_color, header_text, body_html, footer_text, is_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE sender_name=VALUES(sender_name), sender_email=VALUES(sender_email),
       subject=VALUES(subject), header_color=VALUES(header_color), header_text=VALUES(header_text),
       body_html=VALUES(body_html), footer_text=VALUES(footer_text), is_enabled=VALUES(is_enabled)`,
      [req.params.id, sender_name, sender_email, subject, header_color, header_text, body_html, footer_text, is_enabled ? 1 : 0]
    );
    res.json({ success: true, message: 'Email template saved' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.put('/:id/form-fields', auth, async (req, res) => {
  const { fields } = req.body;
  try {
    await db.query('DELETE FROM form_fields WHERE game_id = ?', [req.params.id]);
    for (let i = 0; i < fields.length; i++) {
      const f = fields[i];
      await db.query(
        'INSERT INTO form_fields (game_id, field_label, field_type, field_options, is_required, field_order) VALUES (?, ?, ?, ?, ?, ?)',
        [req.params.id, f.field_label, f.field_type, JSON.stringify(f.field_options || []), f.is_required ? 1 : 0, i]
      );
    }
    res.json({ success: true, message: 'Form fields saved' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.get('/:id/stats', auth, async (req, res) => {
  try {
    const [sessions] = await db.query('SELECT COUNT(*) as total, SUM(completed) as completed, AVG(score) as avg_score FROM player_sessions WHERE game_id = ?', [req.params.id]);
    const [recent] = await db.query('SELECT player_data, score, total_scoreable, completed_at FROM player_sessions WHERE game_id = ? AND completed = 1 ORDER BY completed_at DESC LIMIT 20', [req.params.id]);
    res.json({ success: true, stats: sessions[0], recent });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});


// GET all completed sessions with answers for a game (for responses page)
router.get('/:id/responses', auth, async (req, res) => {
  try {
    const [sessions] = await db.query(
      `SELECT * FROM player_sessions WHERE game_id = ? AND completed = 1 ORDER BY completed_at DESC`,
      [req.params.id]
    );

    // For each session, fetch answers joined with option text and question text
    for (const session of sessions) {
      const [answers] = await db.query(
        `SELECT pa.question_id, pa.option_id, pa.is_correct, pa.question_type,
                o.option_text, q.question_text
         FROM player_answers pa
         LEFT JOIN options o ON pa.option_id = o.id
         LEFT JOIN questions q ON pa.question_id = q.id
         WHERE pa.session_id = ?
         ORDER BY q.question_order`,
        [session.id]
      );
      session.answers = answers;
    }

    res.json({ success: true, sessions });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;