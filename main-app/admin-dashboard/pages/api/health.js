import config from '../../config'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', config.api.allowedOrigins.join(','))
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Basic health check
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.app.env,
      version: config.app.version,
      services: {
        supabase: config.supabase.url ? 'configured' : 'not configured',
      }
    }

    // Check Supabase connection if in development
    if (config.app.env === 'development') {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const supabase = createClient(config.supabase.url, config.supabase.anonKey)

        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1)

        healthData.services.supabase = error ? 'error' : 'connected'
      } catch (err) {
        healthData.services.supabase = 'error'
      }
    }

    res.json(healthData)
  } catch (error) {
    console.error('Health check error:', error)
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: config.app.env === 'development' ? error.message : 'Internal server error'
    })
  }
}