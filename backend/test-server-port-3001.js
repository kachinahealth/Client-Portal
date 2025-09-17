const express = require('express');
const app = express();
const PORT = 3001;

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Test server on port 3001 is running!'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API test endpoint working on port 3001!',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Test API: http://localhost:${PORT}/api/test`);
});

// Keep the process alive
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  process.exit(0);
});
