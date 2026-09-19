const { createApp } = require('./app');
const uploadModel = require('./models/fixed-upload');
const PORT = 3003;

const app = createApp('fixed', uploadModel);

app.listen(PORT, () => {
  console.log(`[SECURED] upload server running at http://localhost:${PORT}`);
  console.log('Only validated image files are accepted.');
});
