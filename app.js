const express = require('express');
const path = require('path');
const { createUploadRouter } = require('./routes/upload-routes');

function createApp(mode, uploadModel) {
  const app = express();

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(createUploadRouter(mode, uploadModel));

  return app;
}

module.exports = { createApp };
