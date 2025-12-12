const jwt = require('jsonwebtoken');
const { supabase, supabaseAdmin } = require('../supabaseClient');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Middleware to check if Supabase client is available
const requireSupabase = (req, res, next) => {
  if (!supabase) {
    console.error('Supabase client not configured - missing environment variables');
    return res.status(503).json({
      success: false,
      message: 'Database service unavailable. Please check server configuration.',
      error: 'SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required'
    });
  }
  next();
};

// Middleware to check if Supabase Admin is configured
const requireSupabaseAdmin = (req, res, next) => {
  if (!supabaseAdmin) {
    console.error('Supabase Admin client not configured - missing SUPABASE_SERVICE_ROLE_KEY');
    return res.status(503).json({
      success: false,
      message: 'Admin operations not available. Please check server configuration.',
      error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is required'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireSupabase,
  requireSupabaseAdmin
};
