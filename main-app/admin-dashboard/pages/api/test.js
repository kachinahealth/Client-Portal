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

  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    service: 'Next.js API Routes',
    environment: config.app.env,
    version: config.app.version
  })
}
