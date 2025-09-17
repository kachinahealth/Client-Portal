const express = require('express');
const app = express();
const PORT = 5000;

// Simple middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Server is running!'
  });
});

// Test endpoints
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/auth/test', (req, res) => {
  res.json({
    message: 'Auth endpoint accessible!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/leaderboard/test', (req, res) => {
  res.json({
    message: 'Leaderboard endpoint accessible!',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/news/test', (req, res) => {
  res.json({
    message: 'News endpoint accessible!',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📊 Health check: http://127.0.0.1:${PORT}/health`);
  console.log(`🔗 API base: http://127.0.0.1:${PORT}/api`);
  console.log(`📝 Test endpoints:`);
  console.log(`   - http://127.0.0.1:${PORT}/api/test`);
  console.log(`   - http://127.0.0.1:${PORT}/api/auth/test`);
  console.log(`   - http://127.0.0.1:${PORT}/api/leaderboard/test`);
  console.log(`   - http://127.0.0.1:${PORT}/api/news/test`);
  console.log('\n🎉 Server is ready for testing!');
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
