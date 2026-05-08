const express = require('express');
const router = express.Router();
const db = require('../config/db');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// GET all clients
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT c.*, u.name as created_by_name,
       (SELECT COUNT(*) FROM games g WHERE g.client_id = c.id) as game_count
       FROM clients c
       LEFT JOIN users u ON c.created_by = u.id
       ORDER BY c.created_at DESC`
    );
    res.json({ success: true, clients: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET single client
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, client: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST create client
router.post('/', auth, upload.single('logo'), async (req, res) => {
  const { company_name, contact_name, email, phone, address, notes } = req.body;
  if (!company_name) return res.status(400).json({ success: false, message: 'Company name required' });

  try {
    let slug = slugify(company_name);
    const [existing] = await db.query('SELECT id FROM clients WHERE slug = ?', [slug]);
    if (existing.length > 0) slug = `${slug}-${Date.now()}`;

    const logo_url = req.file ? `/uploads/images/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO clients (company_name, contact_name, email, phone, address, notes, slug, logo_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, contact_name, email, phone, address, notes, slug, logo_url, req.user.id]
    );
    const [newClient] = await db.query('SELECT * FROM clients WHERE id = ?', [result.insertId]);
    res.status(201).json({ success: true, client: newClient[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT update client
router.put('/:id', auth, upload.single('logo'), async (req, res) => {
  const { company_name, contact_name, email, phone, address, notes } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ success: false, message: 'Client not found' });

    const logo_url = req.file ? `/uploads/images/${req.file.filename}` : existing[0].logo_url;

    await db.query(
      `UPDATE clients SET company_name=?, contact_name=?, email=?, phone=?, address=?, notes=?, logo_url=? WHERE id=?`,
      [company_name, contact_name, email, phone, address, notes, logo_url, req.params.id]
    );
    const [updated] = await db.query('SELECT * FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true, client: updated[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE client
router.delete('/:id', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
