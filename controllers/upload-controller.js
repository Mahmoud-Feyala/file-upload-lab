const fs = require('fs');
const path = require('path');

function createUploadController(uploadModel, mode) {
  function upload(req, res) {
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded.');
    }

    uploadModel.handleUpload(file, mode, (error, result) => {
      if (error) {
        return res.status(400).send(error.message || 'Upload failed.');
      }

      return res.json({
        mode,
        status: 'ok',
        savedAs: result.savedAs,
        originalName: result.originalName,
        message: result.message
      });
    });
  }

  function listFiles(req, res) {
    const uploadDir = path.join(__dirname, '..', 'uploads');

    try {
      const files = fs.existsSync(uploadDir)
        ? fs.readdirSync(uploadDir).filter(name => !name.startsWith('.'))
        : [];

      return res.json({ files });
    } catch (error) {
      return res.status(500).json({ error: 'Unable to list uploaded files.' });
    }
  }

  return { upload, listFiles };
}

module.exports = { createUploadController };
