const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = 5000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    message: 'Server is running!'
  });
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Registration endpoint for mobile app testing
app.post('/api/auth/register', (req, res) => {
  console.log('Registration attempt:', req.body);
  res.json({
    success: true,
    message: 'User registered successfully (test endpoint)',
    user: {
      id: 'test-user-id',
      email: req.body.email,
      status: 'pending'
    }
  });
});

// Connect to MongoDB and start server
const MONGODB_URI = 'mongodb+srv://wildabeastteam:SAXxTCoV7KRVNVzO@cerevasc-stride-investi.fb7upaq.mongodb.net/stride-trial?retryWrites=true&w=majority&appName=cerevasc-stride-investigator-app';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB Atlas');
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
    console.log(`📱 Mobile app can connect to: http://localhost:${PORT}/api/auth/register`);
  });
})
.catch((error) => {
  console.error('❌ MongoDB connection failed:', error.message);
  process.exit(1);
});

// Keep the server running
process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});
