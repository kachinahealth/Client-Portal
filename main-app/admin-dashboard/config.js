// Environment configuration for the application
const config = {
  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Application
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'KachinaHealth Client Portal',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    env: process.env.NODE_ENV || 'development',
  },

  // API
  api: {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:5000',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },

  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    nextAuthSecret: process.env.NEXTAUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },

  // Security
  security: {
    encryptionKey: process.env.ENCRYPTION_KEY,
  },

  // Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
      'jpg', 'jpeg', 'png', 'gif'
    ],
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  },

  // Analytics (optional)
  analytics: {
    gaTrackingId: process.env.NEXT_PUBLIC_GA_TRACKING_ID,
    mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
    sentryDsn: process.env.SENTRY_DSN,
  },

  // Email (optional)
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  // Database (for local development)
  database: {
    url: process.env.DATABASE_URL,
  },

  // Default organization
  organization: {
    defaultId: process.env.DEFAULT_ORGANIZATION_ID,
  },
}

// Validation for required environment variables
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

if (config.app.env === 'production') {
  requiredVars.push('SUPABASE_SERVICE_ROLE_KEY', 'JWT_SECRET')
}

const missingVars = requiredVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:')
  missingVars.forEach(varName => console.error(`   - ${varName}`))
  if (config.app.env === 'production') {
    throw new Error('Missing required environment variables for production')
  } else {
    console.warn('⚠️  Some environment variables are missing. Using default values.')
  }
}

module.exports = config
