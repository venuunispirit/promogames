const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const imagesDir = path.join(__dirname, '../uploads/images');
const soundsDir = path.join(__dirname, '../uploads/sounds');
const modelsDir = path.join(__dirname, '../uploads/models');
[imagesDir, soundsDir, modelsDir].forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, imagesDir);
    else if (file.mimetype.startsWith('audio/')) cb(null, soundsDir);
    else if (file.mimetype === 'model/gltf-binary' || file.mimetype === 'model/gltf+json' || file.originalname.match(/\.(glb|gltf)$/i)) cb(null, modelsDir);
    else cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedImages = ['image/jpeg','image/jpg','image/png','image/gif','image/webp'];
  const allowedAudio  = ['audio/mpeg','audio/mp3','audio/wav','audio/ogg','audio/x-wav','audio/wave','audio/x-m4a','audio/mp4'];
  const allowedModels = ['model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
  const isModel = file.originalname.match(/\.(glb|gltf)$/i);
  if (allowedImages.includes(file.mimetype) || allowedAudio.includes(file.mimetype) || allowedModels.includes(file.mimetype) || isModel) cb(null, true);
  else cb(new Error(`File type not allowed: ${file.mimetype}`), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
module.exports = upload;
