const express = require('express');
const router = express.Router();
const db = require('../config/db');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

router.get('/:gameName/:companyName', async (req, res) => {
  try {
    // First check if game exists at all (ignore is_active)
    const [allRows] = await db.query(`
      SELECT g.*, c.company_name, c.slug as client_slug, c.logo_url as client_logo
      FROM games g JOIN clients c ON g.client_id = c.id
      WHERE g.slug = ? AND c.slug = ?
    `, [req.params.gameName, req.params.companyName]);

    if (allRows.length === 0) return res.status(404).json({ success: false, message: 'Game not found' });
    if (!allRows[0].is_active) return res.status(403).json({ success: false, message: 'This game is currently inactive' });

    const rows = allRows;

    const game = rows[0];
    const [settings] = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [game.id]);
    const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
    const [questions] = await db.query('SELECT * FROM questions WHERE game_id = ? ORDER BY question_order', [game.id]);
    const [sounds] = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

    for (let q of questions) {
      const [options] = await db.query('SELECT * FROM options WHERE question_id = ? ORDER BY option_order', [q.id]);
      q.options = options;
    }

    const safeSettings = settings[0] ? { ...settings[0] } : null;
    // Build sound lookup map
    const soundMap = {};
    for (const s of sounds) soundMap[s.id] = s.url;

    res.json({
      success: true,
      game: {
        id: game.id, name: game.name, category: game.category, description: game.description,
        redirect_url: game.redirect_url, client_logo: game.client_logo, company_name: game.company_name,
        settings: safeSettings, formFields, questions, soundMap
      }
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/session/start', async (req, res) => {
  const { game_id, player_data } = req.body;
  try {
    // ─── TEMPORARILY DISABLED: ALLOW MULTIPLE PLAYS ───────────
    /*
    // Extract key identifiers from player_data (case-insensitive field label matching)
    const normalize = (obj, keys) => {
      for (const k of Object.keys(obj || {})) {
        const lower = k.toLowerCase().replace(/\s+/g, '');
        for (const target of keys) {
          if (lower.includes(target)) return (obj[k] || '').toString().trim().toLowerCase();
        }
      }
      return null;
    };

    const email = normalize(player_data, ['email']);
    const phone = normalize(player_data, ['phone', 'mobile', 'contact']);
    const name  = normalize(player_data, ['name', 'fullname']);

    if (!email && !phone && !name) {
      return res.status(400).json({ success: false, message: 'Player identification data is required.' });
    }

    // Check if this exact combination already played this game
    const [existing] = await db.query(
      `SELECT id, player_data FROM player_sessions WHERE game_id = ? AND completed = 1`,
      [game_id]
    );

    for (const sess of existing) {
      let pd;
      try { pd = typeof sess.player_data === 'string' ? JSON.parse(sess.player_data) : sess.player_data; }
      catch { continue; }

      const existEmail = normalize(pd, ['email']);
      const existPhone = normalize(pd, ['phone', 'mobile', 'contact']);
      const existName  = normalize(pd, ['name', 'fullname']);

      // Match: same email OR same phone OR (same name + same email) OR (same name + same phone)
      const emailMatch = email && existEmail && email === existEmail;
      const phoneMatch = phone && existPhone && phone === existPhone;
      const nameEmailMatch = name && email && existName && existEmail && name === existName && email === existEmail;
      const namePhoneMatch = name && phone && existName && existPhone && name === existName && phone === existPhone;

      if (emailMatch || phoneMatch || nameEmailMatch || namePhoneMatch) {
        return res.status(409).json({
          success: false,
          message: 'You have already played this game. Each person can only play once.',
          already_played: true
        });
      }
    }
    */
    // ────────────────────────────────────────────────────────────

    const token = uuidv4();
    await db.query('INSERT INTO player_sessions (session_token, game_id, player_data) VALUES (?, ?, ?)', [token, game_id, JSON.stringify(player_data)]);
    res.json({ success: true, session_token: token });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/session/answer', async (req, res) => {
  const { session_token, question_id, option_id, is_correct, question_type } = req.body;
  try {
    const [sessions] = await db.query('SELECT * FROM player_sessions WHERE session_token = ?', [session_token]);
    if (sessions.length === 0) return res.status(404).json({ success: false, message: 'Session not found' });
    const session = sessions[0];
    await db.query('INSERT INTO player_answers (session_id, question_id, option_id, is_correct, question_type) VALUES (?, ?, ?, ?, ?)',
      [session.id, question_id, option_id, is_correct ? 1 : 0, question_type]);
    if (question_type === 'right_wrong') {
      if (is_correct) {
        await db.query('UPDATE player_sessions SET score = score + 1, total_scoreable = total_scoreable + 1 WHERE id = ?', [session.id]);
      } else {
        await db.query('UPDATE player_sessions SET total_scoreable = total_scoreable + 1 WHERE id = ?', [session.id]);
      }
    }
    res.json({ success: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

router.post('/session/complete', async (req, res) => {
  const { session_token } = req.body;
  try {
    const [sessions] = await db.query('SELECT * FROM player_sessions WHERE session_token = ?', [session_token]);
    if (sessions.length === 0) return res.status(404).json({ success: false, message: 'Session not found' });
    const session = sessions[0];
    if (session.completed) return res.json({ success: true, already_completed: true, session });

    await db.query('UPDATE player_sessions SET completed = 1, completed_at = NOW() WHERE id = ?', [session.id]);

    const [games] = await db.query('SELECT * FROM games WHERE id = ?', [session.game_id]);
    const [emailTemplates] = await db.query('SELECT * FROM email_templates WHERE game_id = ?', [session.game_id]);
    const [settingsRows] = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [session.game_id]);
    const gameSettings = settingsRows[0] || {};

    const playerData = typeof session.player_data === 'string' ? JSON.parse(session.player_data) : session.player_data;
    const playerEmail = playerData.email || playerData['Email Address'] || playerData['email'];
    const playerName = playerData.name || playerData['Full Name'] || playerData['full_name'] || 'Player';

    let emailSent = false;

    // Only send if send_email is enabled in settings
    if (gameSettings.send_email !== 0 && emailTemplates.length > 0 && emailTemplates[0].is_enabled && playerEmail) {
      const template = emailTemplates[0];
      let scoreText = '';
      if (session.total_scoreable > 0) {
        scoreText = `You scored <strong>${session.score} out of ${session.total_scoreable}</strong>.`;
      }
      const bodyContent = (template.body_html || '')
        .replace(/\{\{name\}\}/g, playerName)
        .replace(/\{\{score\}\}/g, session.score)
        .replace(/\{\{total\}\}/g, session.total_scoreable)
        .replace(/\{\{game_name\}\}/g, games[0]?.name || 'Game');

      const htmlEmail = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
      <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
              <tr><td style="background:${template.header_color || '#6366f1'};padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:24px;">${template.header_text || '🎉 Congratulations!'}</h1>
              </td></tr>
              <tr><td style="padding:32px 40px;">
                <p style="font-size:18px;color:#1a1a2e;margin:0 0 16px;">Hi <strong>${playerName}</strong>,</p>
                ${scoreText ? `<p style="font-size:16px;color:#333;">${scoreText}</p>` : ''}
                <p style="font-size:16px;color:#333;">You have completed the game!</p>
                ${bodyContent ? `<div style="margin-top:16px;color:#555;">${bodyContent}</div>` : ''}
              </td></tr>
              ${template.footer_text ? `<tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;color:#888;font-size:14px;">${template.footer_text}</td></tr>` : ''}
            </table>
          </td></tr>
        </table>
      </body></html>`;

      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        });
        await transporter.sendMail({
          from: `"${template.sender_name || 'Quiz Platform'}" <${template.sender_email || process.env.SMTP_USER}>`,
          to: playerEmail,
          subject: (template.subject || 'You completed the quiz! 🎉').replace(/\{\{name\}\}/g, playerName),
          html: htmlEmail
        });
        emailSent = true;
        await db.query('UPDATE player_sessions SET email_sent = 1 WHERE id = ?', [session.id]);
      } catch (emailErr) {
        console.error('Email send error:', emailErr.message);
      }
    }

    const [updatedSession] = await db.query('SELECT * FROM player_sessions WHERE id = ?', [session.id]);
    res.json({ success: true, session: updatedSession[0], email_sent: emailSent, redirect_url: games[0]?.redirect_url || null });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;