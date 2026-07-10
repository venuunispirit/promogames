const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function itAuth(req, res, next) {
  const token = (req.headers['authorization'] || '').split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'internal_team') return res.status(403).json({ success: false, message: 'Not authorized' });
    req.it = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
}

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
  try {
    const [rows] = await db.query('SELECT * FROM internal_team WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const member = rows[0];
    if (!member.password) return res.status(401).json({ success: false, message: 'Account not set up yet' });
    const isMatch = await bcrypt.compare(password, member.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: member.id, email: member.email, name: member.name, role: 'internal_team' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ success: true, token, member: { id: member.id, name: member.name, email: member.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/requests', itAuth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT r.*, b.name as bd_name, b.email as bd_email, b.phone as bd_phone,
              g.name as game_name, g.status as game_status, g.slug as game_slug,
              c.company_name as client_name, c.slug as client_slug
       FROM bd_requests r
       LEFT JOIN business_developers b ON r.bd_id = b.id
       LEFT JOIN games g ON r.game_id = g.id
       LEFT JOIN clients c ON r.client_id = c.id
       WHERE r.assigned_to = ? ORDER BY r.created_at DESC`,
      [req.it.id]
    );
    res.json({ success: true, requests: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/requests/:id/status', itAuth, async (req, res) => {
  const { status, client_id, game_id } = req.body;
  const allowed = ['pending','approved','started_working','game_creating','testing','live','rejected'];
  if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
  try {
    const [rows] = await db.query('SELECT id, game_id FROM bd_requests WHERE id = ? AND assigned_to = ?', [req.params.id, req.it.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Request not found or not assigned to you' });
    const fields = ['status=?'];
    const values = [status];
    if (client_id !== undefined) { fields.push('client_id=?'); values.push(client_id); }
    if (game_id !== undefined) { fields.push('game_id=?'); values.push(game_id); }
    values.push(req.params.id);
    await db.query(`UPDATE bd_requests SET ${fields.join(',')} WHERE id=?`, values);
    // Auto-sync game to live when request goes live
    if (status === 'live') {
      const gid = game_id || rows[0].game_id;
      if (gid) await db.query('UPDATE games SET status=?, is_active=1 WHERE id=? AND status!=?', ['live', gid, 'live']);
    }
    // Notify the BD about the status change
    const [reqInfo] = await db.query('SELECT bd_id, business_name FROM bd_requests WHERE id=?', [req.params.id]);
    if (reqInfo.length > 0) {
      const labels = { pending:'Pending', approved:'Approved', started_working:'Started Working',
                       game_creating:'Game Creating', testing:'Testing', live:'Live', rejected:'Rejected' };
      await db.query(
        'INSERT INTO notifications (user_id, user_type, type, title, message, link) VALUES (?,?,?,?,?,?)',
        [reqInfo[0].bd_id, 'bd', status==='live'?'success':status==='rejected'?'error':'info',
         `Request ${labels[status]||status}`,
         `Your request for "${reqInfo[0].business_name}" is now ${labels[status]||status}`,
         '/bd/requests']
      );
    }
    res.json({ success: true, message: 'Status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/list', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name, email, phone, role, permissions, created_at FROM internal_team ORDER BY created_at DESC');
    res.json({ success: true, members: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/create', auth, async (req, res) => {
  const { name, email, phone, permissions } = req.body;
  if (!name || !email || !phone) return res.status(400).json({ success: false, message: 'Name, email, and phone required' });
  try {
    const [existing] = await db.query('SELECT id FROM internal_team WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(409).json({ success: false, message: 'Member with this email already exists' });
    const hashedPw = await bcrypt.hash(phone, 10);
    const perms = Array.isArray(permissions) ? JSON.stringify(permissions) : null;
    const [result] = await db.query(
      'INSERT INTO internal_team (name, email, phone, password, permissions) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, hashedPw, perms]
    );
    res.status(201).json({ success: true, message: 'Internal team member created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name && !email && !phone) return res.status(400).json({ success: false, message: 'Nothing to update' });
  try {
    const fields = []; const values = [];
    if (name !== undefined) { fields.push('name=?'); values.push(name); }
    if (email !== undefined) { fields.push('email=?'); values.push(email); }
    if (phone !== undefined) { fields.push('phone=?'); values.push(phone); if (!req.body.skipPasswordReset) { const hashedPw = await bcrypt.hash(phone, 10); fields.push('password=?'); values.push(hashedPw); } }
    values.push(req.params.id);
    await db.query(`UPDATE internal_team SET ${fields.join(',')} WHERE id=?`, values);
    res.json({ success: true, message: 'Member updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM internal_team WHERE id=?', [req.params.id]);
    res.json({ success: true, message: 'Member deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/:id/permissions', auth, async (req, res) => {
  const { permissions } = req.body;
  if (!Array.isArray(permissions)) return res.status(400).json({ success: false, message: 'permissions must be an array' });
  try {
    await db.query('UPDATE internal_team SET permissions=? WHERE id=?', [JSON.stringify(permissions), req.params.id]);
    res.json({ success: true, message: 'Permissions updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /internal-team/redemption-logs — Admin view of all redemptions
router.get('/redemption-logs', auth, async (req, res) => {
  try {
    const { status, bo_id, game_id, start_date, end_date } = req.query;
    let where = ['1=1']
    let params = []
    if (status) { where.push('br.status = ?'); params.push(status) }
    if (bo_id) { where.push('br.business_owner_id = ?'); params.push(bo_id) }
    if (game_id) { where.push('br.game_id = ?'); params.push(game_id) }
    if (start_date) { where.push('br.created_at >= ?'); params.push(start_date) }
    if (end_date) { where.push('br.created_at <= ?'); params.push(end_date) }
    const [rows] = await db.query(
      `SELECT br.*, g.name as game_name, bo.business_name, bo.email as bo_email,
              a.business_name as accepted_by_name, r.business_name as rejected_by_name
       FROM business_redemptions br
       JOIN business_owners bo ON br.business_owner_id = bo.id
       JOIN games g ON br.game_id = g.id
       LEFT JOIN business_owners a ON br.accepted_by = a.id
       LEFT JOIN business_owners r ON br.rejected_by = r.id
       WHERE ${where.join(' AND ')}
       ORDER BY br.created_at DESC LIMIT 500`,
      params
    );
    res.json({ success: true, redemptions: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
module.exports.itAuth = itAuth;
