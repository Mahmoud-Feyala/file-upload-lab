const { createApp } = require('./app');
const uploadModel = require('./models/vulnerable-upload');
const PORT = 3002;

const app = createApp('vulnerable', uploadModel);

app.listen(PORT, () => {
  console.log(`VULNERABLE upload server running at http://localhost:${PORT}`);
  console.log(`Open the UI: http://localhost:${PORT}`);
  console.log('Upload a .php, .jsp, or .svg file to see the issue.');
});
