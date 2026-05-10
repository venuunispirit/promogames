require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
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

app.use('/api/auth',    require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/games',   require('./routes/games'));
app.use('/api/quiz',    require('./routes/quiz'));
app.use('/api/upload',  require('./routes/upload'));
app.use('/api/sounds',  require('./routes/sounds'));
app.use('/api/play',    require('./routes/player'));

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log(`📧 SMTP: ${process.env.SMTP_USER}`);
  console.log(`🔗 BACKEND_URL: ${process.env.BACKEND_URL}`);
});

module.exports = app;
