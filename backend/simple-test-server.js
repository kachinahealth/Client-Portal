const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Basic middleware
app.use(cors());
app.use(express.json());

// Serve static files from admin-dashboard
app.use(express.static(path.join(__dirname, '../admin-dashboard')));

// Root route - serve the admin dashboard
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-dashboard/simple-dashboard.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../admin-dashboard/simple-dashboard.html'));
});

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

// Logo health check endpoint
app.get('/logos-health', (req, res) => {
  const fs = require('fs');
  const logosPath = path.join(__dirname, '../admin-dashboard/logos');
  
  try {
    const files = fs.readdirSync(logosPath);
    const cerevascLogoExists = files.includes('cerevasc-logo.png');
    
    res.json({
      status: 'OK',
      logosPath: logosPath,
      availableLogos: files,
      cerevascLogoExists: cerevascLogoExists,
      cerevascLogoPath: cerevascLogoExists ? '/logos/cerevasc-logo.png' : null
    });
  } catch (error) {
    res.json({
      status: 'ERROR',
      error: error.message,
      logosPath: logosPath,
      availableLogos: [],
      cerevascLogoExists: false,
      cerevascLogoPath: null
    });
  }
});

// Company dashboard data endpoint
app.get('/api/company/:companyId/dashboard', (req, res) => {
  console.log(`📊 Dashboard data request for company: ${req.params.companyId}`);
  
  // Mock data for demo
  const mockData = {
    stats: {
      totalUsers: 156,
      pendingApprovals: 8,
      activeUsers: 142,
      newsItems: 5
    },
    users: [
      {
        id: 1,
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1 (555) 123-4567',
        status: 'pending',
        registeredDate: '2024-08-15'
      },
      {
        id: 2,
        name: 'Dr. Michael Chen',
        email: 'michael.chen@example.com',
        phone: '+1 (555) 234-5678',
        status: 'approved',
        registeredDate: '2024-08-10'
      },
      {
        id: 3,
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        phone: '+1 (555) 345-6789',
        status: 'approved',
        registeredDate: '2024-08-08'
      }
    ],
    news: [
      {
        id: 1,
        title: 'Welcome to STRIDE Trial',
        content: 'We are excited to launch the STRIDE clinical trial platform.',
        date: '2024-08-15',
        author: 'Admin'
      },
      {
        id: 2,
        title: 'New Safety Guidelines',
        content: 'Please review the updated safety protocols for the trial.',
        date: '2024-08-12',
        author: 'Safety Team'
      }
    ]
  };
  
  res.json(mockData);
});

// User approval endpoint
app.post('/api/company/:companyId/users/:userId/approve', (req, res) => {
  console.log(`👤 User approval request: Company ${req.params.companyId}, User ${req.params.userId}, Approved: ${req.body.approved}`);
  
  res.json({
    success: true,
    message: req.body.approved ? 'User approved successfully' : 'User rejected successfully'
  });
});

// Add news endpoint
app.post('/api/company/:companyId/news', (req, res) => {
  console.log(`📰 Add news request for company: ${req.params.companyId}`, req.body);
  
  res.json({
    success: true,
    message: 'News added successfully',
    newsId: Date.now()
  });
});

// Client login endpoint for admin dashboard
app.post('/api/auth/client-login', (req, res) => {
  console.log('🔑 Client login attempt:', req.body);
  const { username, password } = req.body;
  
  // Demo credentials
  const validCredentials = {
    'cerevasc_admin': {
      password: 'CereVasc2024!',
      company: {
        id: 'cerevasc',
        name: 'CereVasc',
        logo: '/logos/cerevasc-logo.png'
      }
    },
    'medtronic_admin': {
      password: 'Medtronic2024!',
      company: {
        id: 'medtronic',
        name: 'Medtronic',
        logo: '/logos/medtronic-logo.png'
      }
    }
  };
  
  const user = validCredentials[username];
  if (user && user.password === password) {
    res.json({
      success: true,
      message: 'Login successful',
      company: user.company,
      token: 'demo-jwt-token'
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid username or password'
    });
  }
});

// Registration endpoint for mobile app testing
app.post('/api/auth/register', (req, res) => {
  console.log('📝 Registration attempt:', req.body);
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

// Login endpoint for mobile app testing
app.post('/api/auth/login', (req, res) => {
  console.log('🔑 Login attempt:', req.body);
  res.json({
    success: true,
    message: 'Login successful (test endpoint)',
    token: 'test-jwt-token',
    user: {
      id: 'test-user-id',
      email: req.body.email,
      status: 'active'
    }
  });
});

// Start server without MongoDB
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API test: http://localhost:${PORT}/api/test`);
  console.log(`📱 Mobile app can connect to: http://localhost:${PORT}/api/auth/register`);
  console.log(`🔑 Login endpoint: http://localhost:${PORT}/api/auth/login`);
  console.log('\n📱 Now try registering a user from your mobile app!');
  console.log('\nPress Ctrl+C to stop the server');
});

// Keep the server running
process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});
