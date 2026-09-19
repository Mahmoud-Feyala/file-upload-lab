const express = require('express');
const multer = require('multer');
const { getMode } = require('../controllers/mode-controller');
const { createUploadController } = require('../controllers/upload-controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  }
});

function createUploadRouter(mode, uploadModel) {
  const router = express.Router();
  const uploadController = createUploadController(uploadModel, mode);

  router.get('/mode', getMode(mode));
  router.post('/upload', upload.single('uploadFile'), uploadController.upload);
  router.get('/files', uploadController.listFiles);

  return router;
}

module.exports = { createUploadRouter };
