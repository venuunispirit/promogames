const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function boAuth(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'business_owner') return res.status(403).json({ success: false, message: 'Not authorized' });
    req.bo = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

// POST /api/business/login — Business Owner login (email + phone as password)
router.post('/login', async (req, res) => {
  const { business_name, password } = req.body;
  if (!business_name || !password) return res.status(400).json({ success: false, message: 'Business name and password required' });
  try {
    const [rows] = await db.query('SELECT * FROM business_owners WHERE business_name = ? AND is_active = 1', [business_name]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const bo = rows[0];
    const isMatch = await bcrypt.compare(password, bo.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: bo.id, business_name: bo.business_name, email: bo.email, role: 'business_owner', parent_id: bo.parent_id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, bo: { id: bo.id, business_name: bo.business_name, email: bo.email, parent_id: bo.parent_id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/create — Admin creates a Business Owner (password = phone)
router.post('/create', async (req, res) => {
  const { business_name, email, phone, parent_id } = req.body;
  if (!business_name || !email) return res.status(400).json({ success: false, message: 'Business name and email required' });
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number required (used as login password)' });
  try {
    const [existing] = await db.query('SELECT id FROM business_owners WHERE business_name = ?', [business_name]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Business name already exists' });
    const hashedPw = await bcrypt.hash(phone, 10);
    const [result] = await db.query(
      'INSERT INTO business_owners (business_name, email, password, phone, parent_id) VALUES (?, ?, ?, ?, ?)',
      [business_name, email, hashedPw, phone, parent_id || null]
    );
    res.status(201).json({ success: true, message: 'Business Owner created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/business/list — Admin lists all Business Owners
router.get('/list', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.id, b.business_name, b.email, b.phone, b.is_active, b.parent_id, b.created_at,
              p.business_name as parent_name
       FROM business_owners b
       LEFT JOIN business_owners p ON b.parent_id = p.id
       ORDER BY b.created_at DESC`
    );
    res.json({ success: true, owners: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/business/:id/toggle-active — toggle active status
router.put('/:id/toggle-active', async (req, res) => {
  const { is_active } = req.body;
  try {
    await db.query('UPDATE business_owners SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/business/games — BO's linked games
router.get('/games', boAuth, async (req, res) => {
  try {
    let ids = [req.bo.id]
    if (!req.bo.parent_id) {
      const [children] = await db.query('SELECT id FROM business_owners WHERE parent_id = ?', [req.bo.id])
      ids = ids.concat(children.map(c => c.id))
    }
    const [rows] = await db.query(
      `SELECT bog.*, g.name as game_name, g.slug as game_slug, g.status as game_status,
              g.game_logo_url
       FROM business_owner_games bog
       JOIN games g ON bog.game_id = g.id
       WHERE bog.business_owner_id IN (?)
       ORDER BY bog.created_at DESC`,
      [ids]
    );
    res.json({ success: true, games: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/games/link — Link a game to a BO (admin/IT)
router.post('/games/link', async (req, res) => {
  const { business_owner_id, game_id, location_name, reward_text } = req.body;
  if (!business_owner_id || !game_id) return res.status(400).json({ success: false, message: 'business_owner_id and game_id required' });
  try {
    const [existing] = await db.query('SELECT id FROM business_owner_games WHERE business_owner_id = ? AND game_id = ?', [business_owner_id, game_id]);
    if (existing.length > 0) {
      await db.query('UPDATE business_owner_games SET location_name = ?, reward_text = ? WHERE id = ?', [location_name || '', reward_text || '', existing[0].id]);
      return res.json({ success: true, message: 'Game link updated' });
    }
    const [result] = await db.query(
      'INSERT INTO business_owner_games (business_owner_id, game_id, location_name, reward_text) VALUES (?, ?, ?, ?)',
      [business_owner_id, game_id, location_name || '', reward_text || '']
    );
    res.status(201).json({ success: true, message: 'Game linked', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/business/games/:gameId/locations — Get all locations for a game
router.get('/games/:gameId/locations', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM business_owner_games WHERE game_id = ? ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END, created_at',
      [req.params.gameId]
    );
    res.json({ success: true, locations: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/games/locations — Add a location for a game
router.post('/games/locations', async (req, res) => {
  const { game_id, business_owner_id, location_name, reward_text, parent_id } = req.body;
  if (!game_id || !location_name) return res.status(400).json({ success: false, message: 'game_id and location_name required' });
  try {
    const [result] = await db.query(
      'INSERT INTO business_owner_games (business_owner_id, game_id, location_name, reward_text, parent_id) VALUES (?, ?, ?, ?, ?)',
      [business_owner_id || 1, game_id, location_name, reward_text || '', parent_id || null]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/business/games/locations/:id — Update a location
router.put('/games/locations/:id', async (req, res) => {
  const { location_name, reward_text } = req.body;
  try {
    const updates = [];
    const values = [];
    if (location_name !== undefined) { updates.push('location_name = ?'); values.push(location_name); }
    if (reward_text !== undefined) { updates.push('reward_text = ?'); values.push(reward_text); }
    if (updates.length === 0) return res.json({ success: true });
    values.push(req.params.id);
    await db.query(`UPDATE business_owner_games SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/business/games/locations/:id — Delete a location
router.delete('/games/locations/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM business_owner_games WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/business/notifications — BO's notifications (recent plays)
router.get('/notifications', boAuth, async (req, res) => {
  try {
    let ids = [req.bo.id]
    if (!req.bo.parent_id) {
      const [children] = await db.query('SELECT id FROM business_owners WHERE parent_id = ?', [req.bo.id])
      ids = ids.concat(children.map(c => c.id))
    }
    const [rows] = await db.query(
      `SELECT br.*, g.name as game_name, bog.location_name, ps.player_data
       FROM business_redemptions br
       JOIN business_owner_games bog ON br.game_id = bog.game_id AND bog.business_owner_id = br.business_owner_id
       JOIN games g ON br.game_id = g.id
       LEFT JOIN player_sessions ps ON br.session_id = ps.id
       WHERE br.business_owner_id IN (?)
       ORDER BY br.created_at DESC LIMIT 100`,
      [ids]
    );
    // Data privacy: hide email, hide code, hide phone when table_number is present
    const sanitized = rows.map(r => {
      const { player_email, code, ...rest } = r
      let playerData = null
      if (r.player_data) {
        try {
          playerData = typeof r.player_data === 'string' ? JSON.parse(r.player_data) : r.player_data
        } catch {}
      }
      return {
        ...rest,
        player_phone: r.table_number ? '' : r.player_phone,
        player_data: playerData,
      }
    })
    res.json({ success: true, notifications: sanitized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/business/unread-count — count of pending redemptions
router.get('/unread-count', boAuth, async (req, res) => {
  try {
    let ids = [req.bo.id]
    if (!req.bo.parent_id) {
      const [children] = await db.query('SELECT id FROM business_owners WHERE parent_id = ?', [req.bo.id])
      ids = ids.concat(children.map(c => c.id))
    }
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM business_redemptions WHERE business_owner_id IN (?) AND status = 'pending'",
      [ids]
    );
    res.json({ success: true, count: rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/verify-code — BO enters 6-digit passkey (finds player for accept/reject)
router.post('/verify-code', boAuth, async (req, res) => {
  const { code } = req.body;
  if (!code || code.length !== 6) return res.status(400).json({ success: false, message: '6-digit code required' });
  try {
    let ids = [req.bo.id]
    if (!req.bo.parent_id) {
      const [children] = await db.query('SELECT id FROM business_owners WHERE parent_id = ?', [req.bo.id])
      ids = ids.concat(children.map(c => c.id))
    }
    const [rows] = await db.query(
      "SELECT * FROM business_redemptions WHERE code = ? AND business_owner_id IN (?) AND status IN ('pending','code_revealed')",
      [code, ids]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invalid or already redeemed code' });
    const redemption = rows[0];

    // Code found — mark as code_entered so BO can now Accept or Reject
    await db.query("UPDATE business_redemptions SET status = 'code_entered' WHERE id = ?", [redemption.id]);

    // Re-fetch so the response has the updated status
    const [updatedRows] = await db.query("SELECT * FROM business_redemptions WHERE id = ?", [redemption.id]);
    const updated = updatedRows[0] || redemption;
    const { player_email, ...safe } = updated
    res.json({
      success: true,
      status: 'code_entered',
      message: 'Code verified. Accept or reject this redemption.',
      redemption: {
        ...safe,
        player_phone: safe.table_number ? '' : safe.player_phone,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/accept-redemption — BO accepts a redemption
router.post('/accept-redemption', boAuth, async (req, res) => {
  const { redemption_id } = req.body;
  if (!redemption_id) return res.status(400).json({ success: false, message: 'redemption_id required' });
  try {
    const [rows] = await db.query(
      "SELECT * FROM business_redemptions WHERE id = ? AND status IN ('code_revealed','code_entered')",
      [redemption_id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Redemption not found or already processed' });
    const redemption = rows[0];
    await db.query(
      'UPDATE business_redemptions SET status = ?, accepted_by = ?, accepted_at = NOW() WHERE id = ?',
      [redemption.is_player ? 'player_confirmed' : 'completed', req.bo.id, redemption.id]
    );

    // ── Deduct 50 PC from registered player on successful redemption ──
    if (redemption.is_player && redemption.promo_player_id) {
      try {
        await db.query('UPDATE promo_players SET pc_balance = pc_balance - 50 WHERE id = ?', [redemption.promo_player_id]);
        await db.query(
          'INSERT INTO pc_transactions (player_id, type, points, game_id, note) VALUES (?, ?, ?, ?, ?)',
          [redemption.promo_player_id, 'spend', -50, redemption.game_id, `Redemption at location`]
        );
        console.log(`✅ Deducted 50 PC from player ${redemption.promo_player_id} for redemption`);
      } catch (e) { console.error('PC deduction error:', e.message); }
    }

    if (!redemption.is_player) {
      // Send completion email to guest if email is enabled for this game
      try {
        const [gameRows] = await db.query('SELECT email_settings FROM games WHERE id = ?', [redemption.game_id]);
        const settings = gameRows[0]?.email_settings || {};
        if (settings.redemption_complete?.enabled !== false && redemption.player_email) {
          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            tls: { rejectUnauthorized: false },
          });
          await transporter.sendMail({
            from: `"PromoGames" <${process.env.SMTP_USER}>`,
            to: redemption.player_email,
            subject: settings.redemption_complete?.subject || 'Your redemption is complete!',
            html: settings.redemption_complete?.body || `
              <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8f8ff;border-radius:12px;">
                <h2 style="color:#8b5cf6;">Redemption Complete!</h2>
                <p style="font-size:15px;color:#333;">Your offer has been redeemed successfully.</p>
                <p style="font-size:14px;color:#666;">Login at <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="color:#8b5cf6;">PromoGames</a> to check your rewards history.</p>
              </div>
            `,
          });
          console.log(`✅ Completion email sent to ${redemption.player_email}`);
        }
      } catch (e) { console.error('Redemption complete email error:', e.message); }
    }
    const { player_email, ...safe } = redemption
    res.json({
      success: true,
      message: 'Redemption accepted',
      redemption: {
        ...safe,
        player_phone: safe.table_number ? '' : safe.player_phone,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/accept-with-code — BO accepts a redemption (code optional for verification)
router.post('/accept-with-code', boAuth, async (req, res) => {
  const { redemption_id, code } = req.body;
  if (!redemption_id) return res.status(400).json({ success: false, message: 'redemption_id required' });
  try {
    let ids = [req.bo.id]
    if (!req.bo.parent_id) {
      const [children] = await db.query('SELECT id FROM business_owners WHERE parent_id = ?', [req.bo.id])
      ids = ids.concat(children.map(c => c.id))
    }
    const [rows] = await db.query(
      "SELECT * FROM business_redemptions WHERE id = ? AND business_owner_id IN (?) AND status IN ('pending','code_revealed','code_entered')",
      [redemption_id, ids]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Redemption not found or already processed' });
    const redemption = rows[0];
    // Verify code if provided (optional)
    if (code) {
      if (code.length !== 6) return res.status(400).json({ success: false, message: 'Code must be 6 digits' });
      if (redemption.code !== code) return res.status(400).json({ success: false, message: 'Invalid code' });
    }

    await db.query(
      'UPDATE business_redemptions SET status = ?, accepted_by = ?, accepted_at = NOW() WHERE id = ?',
      [redemption.is_player ? 'player_confirmed' : 'completed', req.bo.id, redemption.id]
    );

    // ── Deduct 50 PC from registered player on successful redemption ──
    if (redemption.is_player && redemption.promo_player_id) {
      try {
        await db.query('UPDATE promo_players SET pc_balance = pc_balance - 50 WHERE id = ?', [redemption.promo_player_id]);
        await db.query(
          'INSERT INTO pc_transactions (player_id, type, points, game_id, note) VALUES (?, ?, ?, ?, ?)',
          [redemption.promo_player_id, 'spend', -50, redemption.game_id, `Redemption at location`]
        );
      } catch (e) { console.error('PC deduction error:', e.message); }
    }

    // Send completion email to guest only
    if (!redemption.is_player && redemption.player_email) {
      try {
        const [gameRows] = await db.query('SELECT email_settings FROM games WHERE id = ?', [redemption.game_id]);
        const settings = gameRows[0]?.email_settings || {};
        if (settings.redemption_complete?.enabled !== false) {
          const nodemailer = require('nodemailer');
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587', 10),
            secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_SECURE === '1',
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
            tls: { rejectUnauthorized: false },
          });
          const html = (settings.redemption_complete?.body || '')
            .replace(/\{\{name\}\}/g, redemption.player_name)
            .replace(/\{\{game_name\}\}/g, '')
            .replace(/\{\{code\}\}/g, redemption.code);
          await transporter.sendMail({
            from: `"PromoGames" <${process.env.SMTP_USER}>`,
            to: redemption.player_email,
            subject: settings.redemption_complete?.subject || 'Your redemption is complete!',
            html,
          });
          console.log(`✅ Completion email sent to ${redemption.player_email}`);
        }
      } catch (e) { console.error('❌ Completion email error:', e.message, e.response?.data || ''); }
    }

    res.json({ success: true, message: 'Redemption accepted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/reject-redemption — BO rejects a redemption
router.post('/reject-redemption', boAuth, async (req, res) => {
  const { redemption_id, reason } = req.body;
  if (!redemption_id) return res.status(400).json({ success: false, message: 'redemption_id required' });
  try {
    const [rows] = await db.query(
      "SELECT * FROM business_redemptions WHERE id = ? AND status IN ('pending','code_revealed','code_entered')",
      [redemption_id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Redemption not found or already processed' });
    const redemption = rows[0];
    await db.query(
      'UPDATE business_redemptions SET status = ?, rejected_by = ?, rejected_at = NOW(), reject_reason = ? WHERE id = ?',
      ['rejected', req.bo.id, reason || null, redemption.id]
    );
    res.json({ success: true, message: 'Redemption rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/confirm-redemption — Player confirms they got the surprise
router.post('/confirm-redemption', async (req, res) => {
  const { code } = req.body;
  if (!code || code.length !== 6) return res.status(400).json({ success: false, message: '6-digit code required' });
  try {
    const [rows] = await db.query(
      "SELECT * FROM business_redemptions WHERE code = ? AND status = 'code_entered'",
      [code]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'No pending redemption for this code' });
    const redemption = rows[0];
    await db.query("UPDATE business_redemptions SET status = 'player_confirmed' WHERE id = ?", [redemption.id]);
    res.json({ success: true, message: 'Redemption confirmed! Enjoy your surprise.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/business/redemptions/:code — Get redemption info by code (player side)
router.get('/redemptions/:code', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, status, player_name, created_at FROM business_redemptions WHERE code = ?',
      [req.params.code]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Invalid code' });
    res.json({ success: true, redemption: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/business/player-redemptions — Player's own redemptions (by their email/session)
// Hide code until player clicks "Redeem" (status becomes 'code_revealed')
router.get('/player-redemptions', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });
  try {
    const [rows] = await db.query(
      `SELECT br.id, br.business_owner_id, br.game_id, br.session_id,
              br.code, br.player_name, br.player_phone, br.player_email,
              br.is_player, br.status, br.offer_details, br.created_at, br.updated_at,
              g.name as game_name, g.game_logo_url, bog.location_name, bog.reward_text
       FROM business_redemptions br
       JOIN games g ON br.game_id = g.id
       JOIN business_owner_games bog ON br.game_id = bog.game_id AND bog.business_owner_id = br.business_owner_id
       WHERE br.player_email = ?
       ORDER BY br.created_at DESC`,
      [email]
    );
    // Hide code unless status is revealed or further
    const safeStatuses = ['code_revealed', 'code_entered', 'player_confirmed', 'completed'];
    const sanitized = rows.map(r => ({
      ...r,
      code: safeStatuses.includes(r.status) ? r.code : null,
    }));
    res.json({ success: true, redemptions: sanitized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/business/reveal-code — Player clicks "Redeem" to reveal their pre-generated code
router.post('/reveal-code', async (req, res) => {
  const { redemption_id, email } = req.body;
  if (!redemption_id || !email) return res.status(400).json({ success: false, message: 'redemption_id and email required' });
  try {
    const [rows] = await db.query(
      "SELECT * FROM business_redemptions WHERE id = ? AND player_email = ? AND status = 'pending'",
      [redemption_id, email]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'No pending redemption found' });
    const redemption = rows[0];

    const code = redemption.code || String(Math.floor(100000 + Math.random() * 900000));
    if (!redemption.code) {
      await db.query("UPDATE business_redemptions SET code = ? WHERE id = ?", [code, redemption.id]);
    }
    await db.query("UPDATE business_redemptions SET status = 'code_revealed' WHERE id = ?", [redemption.id]);

    const transporter = require('nodemailer').createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Always send code email to the BO
    try {
      const [boRows] = await db.query('SELECT email FROM business_owners WHERE id = ?', [redemption.business_owner_id]);
      if (boRows.length > 0 && boRows[0].email) {
        await transporter.sendMail({
          from: `"PromoGames" <${process.env.SMTP_USER}>`,
          to: boRows[0].email,
          subject: `New redemption code: ${code} — ${redemption.player_name}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8f8ff;border-radius:12px;">
              <h2 style="color:#8b5cf6;">New Redemption 🎁</h2>
              <p style="font-size:15px;color:#333;"><strong>${redemption.player_name}</strong> has revealed their code.</p>
              <div style="text-align:center;margin:24px 0;">
                <span style="font-size:48px;font-weight:bold;letter-spacing:8px;color:#8b5cf6;">${code}</span>
              </div>
              <p style="font-size:13px;color:#888;">Enter this code in your dashboard to verify the redemption.</p>
            </div>
          `,
        });
      }
    } catch (e) { console.error('BO email error:', e.message); }

    // Send code email to guest players only (registered players see it in rewards page)
    if (!redemption.is_player && redemption.player_email) {
      try {
        await transporter.sendMail({
          from: `"PromoGames" <${process.env.SMTP_USER}>`,
          to: redemption.player_email,
          subject: `Your redemption code: ${code}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8f8ff;border-radius:12px;">
              <h2 style="color:#8b5cf6;">Your Redemption Code 🎁</h2>
              <p style="font-size:15px;color:#333;">Show this code to the business to claim your reward:</p>
              <div style="text-align:center;margin:24px 0;">
                <span style="font-size:48px;font-weight:bold;letter-spacing:8px;color:#8b5cf6;">${code}</span>
              </div>
              <p style="font-size:13px;color:#888;">Present this code at the location to claim your reward.</p>
            </div>
          `,
        });
      } catch (e) { console.error('Guest email error:', e.message); }
    }

    res.json({ success: true, code, message: 'Show this code to the business!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
