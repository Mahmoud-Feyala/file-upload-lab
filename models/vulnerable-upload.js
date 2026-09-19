const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

function handleUpload(file, mode, callback) {
  const targetPath = path.join(uploadDir, file.originalname || 'upload.bin');

  try {
    fs.writeFileSync(targetPath, file.buffer || Buffer.alloc(0));
    callback(null, {
      savedAs: path.basename(targetPath),
      originalName: file.originalname,
      message: 'File uploaded without validation.'
    });
  } catch (error) {
    callback(error, null);
  }
}

module.exports = { handleUpload };
