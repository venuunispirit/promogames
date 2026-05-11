const express = require('express');
const router = express.Router();
const db = require('../config/db');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');

router.get('/:gameName/:companyName', async (req, res) => {
  try {
    const [allRows] = await db.query(`
      SELECT g.*, c.company_name, c.slug as client_slug, c.logo_url as client_logo
      FROM games g JOIN clients c ON g.client_id = c.id
      WHERE g.slug = ? AND c.slug = ?
    `, [req.params.gameName, req.params.companyName]);

    if (allRows.length === 0) return res.status(404).json({ success: false, message: 'Game not found' });
    if (!allRows[0].is_active) return res.status(403).json({ success: false, message: 'This game is currently inactive' });

    const game = allRows[0];
    const [settings]   = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [game.id]);
    const [formFields] = await db.query('SELECT * FROM form_fields WHERE game_id = ? ORDER BY field_order', [game.id]);
    const [questions]  = await db.query('SELECT * FROM questions WHERE game_id = ? ORDER BY question_order', [game.id]);
    const [sounds]     = await db.query('SELECT * FROM sounds WHERE game_id = ?', [game.id]);

    for (let q of questions) {
      const [options] = await db.query('SELECT * FROM options WHERE question_id = ? ORDER BY option_order', [q.id]);
      q.options = options;
    }

    // backendBase not needed - Nginx proxies /uploads/ correctly
    const toAbs = (url) => url || null;

    const soundMap = {};
    for (const s of sounds) soundMap[s.id] = toAbs(s.url);

    const safeSettings = settings[0] ? { ...settings[0] } : null;
    if (safeSettings) {
      for (const f of ['bg_image_url','thankyou_bg_image_url','game_logo_url','submit_confirm_gif_url']) {
        safeSettings[f] = toAbs(safeSettings[f]);
      }
    }

    for (const q of questions) {
      for (const f of ['question_image_url','question_bg_image_url']) q[f] = toAbs(q[f]);
      for (const opt of (q.options || [])) {
        for (const f of ['option_image_url','option_overlay_image_url']) opt[f] = toAbs(opt[f]);
      }
    }

    res.json({
      success: true,
      game: {
        id: game.id, name: game.name, category: game.category,
        description: game.description, redirect_url: game.redirect_url,
        client_logo: toAbs(game.client_logo),
        company_name: game.company_name,
        settings: safeSettings, formFields, questions, soundMap,
      },
    });
  } catch (err) {
    console.error('GET game error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/session/start', async (req, res) => {
  const { game_id, player_data } = req.body;
  try {
    const token = uuidv4();
    const [result] = await db.query(
      'INSERT INTO player_sessions (game_id, session_token, player_data) VALUES (?, ?, ?)',
      [game_id, token, JSON.stringify(player_data)]
    );
    res.json({ success: true, session_token: token, session_id: result.insertId });
  } catch (err) {
    console.error('Session start error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/session/answer', async (req, res) => {
  const { session_token, question_id, option_id, is_correct, question_type } = req.body;
  try {
    const [sessions] = await db.query('SELECT * FROM player_sessions WHERE session_token = ?', [session_token]);
    if (sessions.length === 0) return res.status(404).json({ success: false, message: 'Session not found' });
    const session = sessions[0];
    await db.query(
      'INSERT INTO player_answers (session_id, question_id, option_id, is_correct) VALUES (?, ?, ?, ?)',
      [session.id, question_id, option_id, is_correct === true ? 1 : 0]
    );
    if (question_type === 'right_wrong' && is_correct) {
      await db.query('UPDATE player_sessions SET score = score + 1 WHERE id = ?', [session.id]);
    }
    if (question_type === 'right_wrong') {
      await db.query('UPDATE player_sessions SET total_scoreable = total_scoreable + 1 WHERE id = ?', [session.id]);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Answer error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/session/complete', async (req, res) => {
  const { session_token } = req.body;
  try {
    const [sessions] = await db.query('SELECT * FROM player_sessions WHERE session_token = ?', [session_token]);
    if (sessions.length === 0) return res.status(404).json({ success: false, message: 'Session not found' });

    const session = sessions[0];
    await db.query('UPDATE player_sessions SET completed = 1, completed_at = NOW() WHERE id = ?', [session.id]);

    const [games]          = await db.query('SELECT * FROM games WHERE id = ?', [session.game_id]);
    const [emailTemplates] = await db.query('SELECT * FROM email_templates WHERE game_id = ?', [session.game_id]);
    const [settingsRows]   = await db.query('SELECT * FROM quiz_settings WHERE game_id = ?', [session.game_id]);
    const gameSettings     = settingsRows[0] || {};

    const playerData  = typeof session.player_data === 'string' ? JSON.parse(session.player_data) : session.player_data;

    const normalize = (obj, keys) => {
      for (const k of keys) {
        for (const [label, val] of Object.entries(obj || {})) {
          if (label.toLowerCase().replace(/\s+/g, '') === k.toLowerCase().replace(/\s+/g, '') && val) {
            return String(val).trim();
          }
        }
      }
      return null;
    };
    const playerEmail = normalize(playerData, ['email','emailaddress','e-mail']);
    const playerName  = normalize(playerData, ['name','fullname','full name']) || 'Player';

    let emailSent = false;
    const emailEnabled = gameSettings.send_email === 1 || gameSettings.send_email === '1' || gameSettings.send_email === true;
    const templateOk   = emailTemplates.length > 0 && (emailTemplates[0].is_enabled === 1 || emailTemplates[0].is_enabled === true);

    if (emailEnabled && templateOk && playerEmail) {
      const template = emailTemplates[0];
      const scoreText = session.total_scoreable > 0
        ? `You scored <strong>${session.score} out of ${session.total_scoreable}</strong>.` : '';
      // Strip markdown code fences if present
      const rawBody = (template.body_html || '').replace(/^```html[\s\S]*?\n/, '').replace(/^```[\s\S]*?\n/, '').replace(/```\s*$/, '').trim();

      // Calculate performance message
      const pct = session.total_scoreable > 0 ? (session.score / session.total_scoreable) * 100 : 0;
      const perfMsg = pct === 100 ? 'Perfect score! You nailed every single one. You truly know your desserts! 🏆'
        : pct >= 70 ? 'Great job! You got most of them right. A true dessert enthusiast! 🎉'
        : pct >= 40 ? 'Good effort! Keep exploring and you will master them all. 🍰'
        : 'Thanks for playing! Every expert starts somewhere. Come back and try again! 😊';

      const bodyContent = rawBody
        .replace(/\{\{player_name\}\}/g, playerName)
        .replace(/\{\{name\}\}/g, playerName)
        .replace(/\{\{score\}\}/g, session.score)
        .replace(/\{\{total\}\}/g, session.total_scoreable)
        .replace(/\{\{total_questions\}\}/g, session.total_scoreable)
        .replace(/\{\{game_name\}\}/g, games[0]?.name || 'Game')
        .replace(/\{\{time_taken\}\}/g, 'N/A')
        .replace(/\{\{performance_message\}\}/g, perfMsg)
        .replace(/\{\{website_link\}\}/g, 'https://www.thirdwavecoffeeroasters.com/');

      const htmlEmail = `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
        <body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
          <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0"
              style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
              <tr><td style="background:${template.header_color||'#6366f1'};padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:24px;">${template.header_text||'🎉 Congratulations!'}</h1>
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
        </table></body></html>`;

      try {
        const smtpSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1';
        const smtpPort   = parseInt(process.env.SMTP_PORT || '587', 10);
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          tls: { rejectUnauthorized: false },
        });
        await transporter.sendMail({
          from: `"${template.sender_name||'Quiz Platform'}" <${template.sender_email||process.env.SMTP_USER}>`,
          to: playerEmail,
          subject: (template.subject||'You completed the quiz! 🎉').replace(/\{\{name\}\}/g, playerName),
          html: htmlEmail,
        });
        emailSent = true;
        await db.query('UPDATE player_sessions SET email_sent = 1 WHERE id = ?', [session.id]);
        console.log(`✅ Email sent to ${playerEmail}`);
      } catch (emailErr) {
        console.error('❌ Email error:', emailErr.message);
        console.error('   SMTP:', process.env.SMTP_HOST, process.env.SMTP_PORT, process.env.SMTP_USER);
      }
    } else if (emailEnabled && !playerEmail) {
      console.warn('⚠️  Email enabled but no email found in player data:', JSON.stringify(playerData));
    }

    const [updatedSession] = await db.query('SELECT * FROM player_sessions WHERE id = ?', [session.id]);
    res.json({ success: true, session: updatedSession[0], email_sent: emailSent, redirect_url: games[0]?.redirect_url || null });
  } catch (err) {
    console.error('Complete session error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
