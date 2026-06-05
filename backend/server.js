require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const fs      = require('fs');

const app  = express();
const PORT = process.env.PORT || 5051;

const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/images'),
  path.join(__dirname, 'uploads/sounds'),
];
for (const dir of uploadDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
}

const allowedOrigins = [
  'http://localhost:5173',
  'https://promogames.in',
  'https://www.promogames.in',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// ── Existing routes (unchanged) ──────────────────────────────────────────────
app.use('/api/auth',    require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/games',   require('./routes/games'));
app.use('/api/quiz',    require('./routes/quiz'));
app.use('/api/upload',  require('./routes/upload'));
app.use('/api/sounds',  require('./routes/sounds'));
app.use('/api/play',    require('./routes/player'));
app.use('/api/pauth',       require('./routes/Pauth'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/players-admin', require('./routes/players-admin'));
app.use('/api/crossword', require('./routes/crossword'));
app.use('/api/spin',      require('./routes/spin'));

// ── NEW: PromoPlayer auth routes ─────────────────────────────────────────────
// app.use('/api/pauth',   require('../routes/pauth'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: '🎮 Quiz Platform API is running', timestamp: new Date() });
});

app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'File too large. Max 10MB allowed.' });
  }
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
  });
});


// ── OG meta tag injection for social sharing ─────────────────────────────────
const db = require('./config/db');
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist/index.html');

app.get('/play/:gameName/:companyName', async (req, res) => {
  try {
    const [rows] = await db.query(
  'SELECT g.name, g.meta_description, qs.game_logo_url, c.logo_url as client_logo FROM games g JOIN clients c ON g.client_id = c.id LEFT JOIN quiz_settings qs ON qs.game_id = g.id WHERE g.slug = ? AND c.slug = ? LIMIT 1',
  [req.params.gameName, req.params.companyName]
);
    const game = rows[0];
    const BACKEND_URL = process.env.BACKEND_URL || 'https://promogames.in';
    const toAbs = (u) => (u && u.indexOf('http') !== 0) ? BACKEND_URL + u : u;
    const logo = toAbs(game && game.game_logo_url) || toAbs(game && game.client_logo) || 'https://promogames.in/favicon.png';
    const title = (game && game.name) || 'Play Now on PromoGames';
    const desc = (game && game.meta_description) || 'Play this game and win exciting rewards!';
    let html = fs.readFileSync(FRONTEND_DIST, 'utf8');
    const metaTags = '<meta property="og:title" content="' + title + '" /><meta property="og:description" content="' + desc + '" /><meta property="og:image" content="' + logo + '" /><meta property="og:type" content="website" /><meta name="twitter:card" content="summary_large_image" /><meta name="twitter:image" content="' + logo + '" />';
    html = html.replace('</head>', metaTags + '</head>');
    res.send(html);
  } catch (e) {
    console.error('OG ROUTE ERROR:', e.message);
    res.sendFile(FRONTEND_DIST);
  }
});

app.use(express.static(FRONTEND_DIST));
app.get('*', (req, res) => res.sendFile(path.join(FRONTEND_DIST, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log(`📧 SMTP: ${process.env.SMTP_USER}`);
  console.log(`🔗 BACKEND_URL: ${process.env.BACKEND_URL}`);
});

module.exports = app;