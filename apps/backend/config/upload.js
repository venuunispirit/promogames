const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const imagesDir = path.join(__dirname, '../uploads/images');
const soundsDir = path.join(__dirname, '../uploads/sounds');
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
if (!fs.existsSync(soundsDir)) fs.mkdirSync(soundsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, imagesDir);
    else if (file.mimetype.startsWith('video/')) cb(null, imagesDir);
    else if (file.mimetype.startsWith('audio/')) cb(null, soundsDir);
    else cb(new Error('Unsupported file category'), false);
  },
  filename: (req, file, cb) => {
    // UUID + validated extension only — never trust original filename
    const ext = (path.extname(file.originalname) || '').toLowerCase();
    const safeExt = ['.jpg','.jpeg','.png','.gif','.webp','.mp4','.webm','.mov','.wav','.mp3','.m4a','.ogg'].includes(ext) ? ext : '';
    cb(null, `${uuidv4()}${safeExt}`);
  },
});

// MIME + extension must agree and both be on the allowlist. octet-stream is
// explicitly rejected so mislabeled executables can't be stored as "video".
const MIME_EXT = {
  'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/gif': ['.gif'],
  'image/webp': ['.webp'], 'video/mp4': ['.mp4'], 'video/webm': ['.webm'],
  'video/quicktime': ['.mov'], 'audio/mpeg': ['.mp3'], 'audio/mp3': ['.mp3'],
  'audio/wav': ['.wav'], 'audio/x-wav': ['.wav'], 'audio/wave': ['.wav'],
  'audio/ogg': ['.ogg'], 'audio/x-m4a': ['.m4a'], 'audio/mp4': ['.m4a'],
};
const fileFilter = (req, file, cb) => {
  const ext = (path.extname(file.originalname) || '').toLowerCase();
  const allowed = MIME_EXT[file.mimetype];
  if (allowed && allowed.includes(ext)) cb(null, true);
  else cb(new Error(`File type not allowed: ${file.mimetype || 'unknown'}`), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 25 * 1024 * 1024 } });
module.exports = upload;
