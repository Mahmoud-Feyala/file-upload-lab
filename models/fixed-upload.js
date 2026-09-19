const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const uploadDir = path.join(__dirname, '..', 'uploads');
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);
const allowedMime = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const maxSizeBytes = 2 * 1024 * 1024;

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function verifyPng(buffer) {
  return buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
}

function verifyJpeg(buffer) {
  return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
}

function verifyGif(buffer) {
  const header = buffer.slice(0, 6).toString('ascii');
  return buffer.length >= 6 && (header === 'GIF87a' || header === 'GIF89a');
}

function verifyWebp(buffer) {
  return buffer.length >= 12 && buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP';
}

function validateFile(file) {
  if (!file || !file.buffer) {
    throw new Error('No file buffer available.');
  }

  if (file.size > maxSizeBytes) {
    throw new Error('File exceeds 2 MB limit.');
  }

  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = file.mimetype || '';

  if (!allowedExtensions.has(ext)) {
    throw new Error('Only PNG, JPG, GIF, and WEBP files are allowed.');
  }

  if (!allowedMime.has(mime)) {
    throw new Error('Unexpected content type.');
  }

  const magicCheckers = {
    '.png': verifyPng,
    '.jpg': verifyJpeg,
    '.jpeg': verifyJpeg,
    '.gif': verifyGif,
    '.webp': verifyWebp
  };

  const checker = magicCheckers[ext];
  if (!checker || !checker(file.buffer)) {
    throw new Error('File content does not match the expected image type.');
  }

  return ext;
}

function handleUpload(file, mode, callback) {
  try {
    const ext = validateFile(file);
    const safeName = `${Date.now()}-${crypto.randomUUID()}${ext}`;
    const targetPath = path.join(uploadDir, safeName);

    fs.writeFileSync(targetPath, file.buffer);
    callback(null, {
      savedAs: safeName,
      originalName: file.originalname,
      message: 'File uploaded and validated securely.'
    });
  } catch (error) {
    callback(error, null);
  }
}

module.exports = { handleUpload };
