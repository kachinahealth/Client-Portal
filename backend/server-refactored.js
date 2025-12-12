require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');

// Import modular components
const config = require('./config');
const Logger = require('./utils/logger');
const { handleError } = require('./utils/errorHandler');
const { authenticateToken } = require('./middleware/auth');

// Import route modules
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clinicalTrialRoutes = require('./routes/clinicalTrials');
const hospitalRoutes = require('./routes/hospitals');
const trainingMaterialRoutes = require('./routes/trainingMaterials');
const studyProtocolRoutes = require('./routes/studyProtocols');
const pdfRoutes = require('./routes/pdfs');
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settings');

const app = express();

// Trust proxy (important for Render deployment)
app.set('trust proxy', 1);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, file:// protocol, etc.)
    if (!origin || config.CORS_ORIGINS.some(allowed => origin.includes(allowed))) {
      return callback(null, true);
    }
    // Allow all origins for now
    return callback(null, true);
  },
  credentials: true
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development only)
app.use(Logger.requestLogger);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (config.ALLOWED_FILE_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only ${config.ALLOWED_FILE_TYPES.join(', ')} files are allowed`), false);
    }
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    database: {
      supabase: !!(global.supabase || require('./supabaseClient').supabase),
      supabaseAdmin: !!(global.supabaseAdmin || require('./supabaseClient').supabaseAdmin)
    },
    version: '1.0.0'
  };

  res.json(health);
});

// API information endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'KachinaHealth Client Portal API (Modular Architecture)',
    version: '2.0.0',
    status: 'running',
    environment: config.NODE_ENV,
    architecture: 'modular',
    endpoints: {
      auth: '/api/auth/* - Authentication routes',
      users: '/api/users/* - User management',
      clinicalTrials: '/api/clinical-trials/* - Clinical trials',
      hospitals: '/api/hospitals/* - Hospital leaderboard',
      training: '/api/training-materials/* - Training content',
      protocols: '/api/study-protocols/* - Study protocols',
      documents: '/api/pdfs/* - PDF document management',
      analytics: '/api/analytics/* - Analytics and tracking',
      settings: '/api/settings/* - Application settings',
      health: '/health - Health check',
      debug: '/api/debug/connection - Debug info (dev only)'
    }
  });
});

// Debug connection endpoint (development only)
app.get('/api/debug/connection', (req, res) => {
  if (config.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Debug endpoint not available in production' });
  }

  res.json({
    environment: config.NODE_ENV,
    supabaseConfigured: !!(global.supabase || require('./supabaseClient').supabase),
    supabaseAdminConfigured: !!(global.supabaseAdmin || require('./supabaseClient').supabaseAdmin),
    config: {
      hasSupabaseUrl: !!config.SUPABASE_URL,
      hasSupabaseAnonKey: !!config.SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!config.SUPABASE_SERVICE_ROLE_KEY,
      hasJwtSecret: !!config.JWT_SECRET
    }
  });
});

// Mount route modules
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clinical-trials', clinicalTrialRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/training-materials', trainingMaterialRoutes);
app.use('/api/study-protocols', studyProtocolRoutes);
app.use('/api/pdfs', pdfRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);

// User profile endpoint
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { supabase } = require('./supabaseClient');

    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database service unavailable'
      });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        role,
        organization_id,
        display_name,
        avatar_url,
        bio,
        users (
          name,
          email,
          role,
          site
        )
      `)
      .eq('id', req.user.userId)
      .single();

    if (error) {
      Logger.error('Profile fetch error', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch profile'
      });
    }

    res.json({
      success: true,
      profile: data
    });
  } catch (error) {
    Logger.error('Profile fetch error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Global error handling middleware (must be last)
app.use(handleError);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const server = app.listen(config.PORT, () => {
  Logger.info(`🚀 KachinaHealth API Server running`, {
    port: config.PORT,
    environment: config.NODE_ENV,
    nodeVersion: process.version
  });

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                KachinaHealth API Server                ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║ Port: ${config.PORT.toString().padEnd(50)} ║`);
  console.log(`║ Environment: ${config.NODE_ENV.padEnd(42)} ║`);
  console.log(`║ Node Version: ${process.version.padEnd(41)} ║`);
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║ Health Check: http://localhost:${config.PORT}/health${' '.repeat(23)} ║`);
  console.log(`║ API Docs: http://localhost:${config.PORT}/${' '.repeat(32)} ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');

  // Check database configuration
  const { supabase, supabaseAdmin } = require('./supabaseClient');
  if (!supabase) {
    console.log('⚠️  WARNING: Database not configured!');
    console.log('   Set these environment variables:');
    console.log('   - SUPABASE_URL');
    console.log('   - SUPABASE_ANON_KEY');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    console.log('   - JWT_SECRET');
    console.log('');
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  Logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    Logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  Logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    Logger.info('Process terminated');
    process.exit(0);
  });
});

module.exports = app;
