require('dotenv').config();

const config = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',

  // Supabase Configuration
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,

  // CORS Configuration
  CORS_ORIGINS: process.env.NODE_ENV === 'production'
    ? ['https://your-frontend-domain.onrender.com'] // Update with actual production domain
    : ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],

  // File Upload Configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['application/pdf'],

  // Database Configuration
  DB_CONNECTION_TIMEOUT: 30000, // 30 seconds
  DB_QUERY_TIMEOUT: 15000, // 15 seconds
};

module.exports = config;
