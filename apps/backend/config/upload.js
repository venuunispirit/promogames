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
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) cb(null, imagesDir);
    else if (file.mimetype.startsWith('audio/')) cb(null, soundsDir);
    else cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg','image/jpg','image/png','image/gif','image/webp'];
  const allowedVideo  = ['video/mp4','video/webm','video/quicktime','video/x-m4v','application/octet-stream'];
  const allowedAudio  = ['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/x-wav','audio/wave','audio/x-m4a','audio/mp4'];
  const allowedExt = ['.jpg','.jpeg','.png','.gif','.webp','.mp4','.webm','.mov','.m4v','.ogg','.wav','.mp3','.m4a'];
  const ext = (file.originalname || '').toLowerCase().split('.').pop();
  const extOk = allowedExt.includes('.' + ext);
  if (allowedImages.includes(file.mimetype) || allowedVideo.includes(file.mimetype) || allowedAudio.includes(file.mimetype) || extOk) cb(null, true);
  else cb(new Error(`File type not allowed: ${file.mimetype}`), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 100 * 1024 * 1024 } });
module.exports = upload;
