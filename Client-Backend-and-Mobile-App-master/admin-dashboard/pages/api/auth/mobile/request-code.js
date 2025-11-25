import { supabase } from '../../lib/supabase'

// Simple in-memory storage for demo - in production use Redis or similar
const loginCodes = new Map()

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  try {
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.status !== 'approved') {
      return res.status(403).json({ error: 'Account pending approval' })
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Store code temporarily (5 minutes expiry)
    loginCodes.set(email, {
      code,
      expires: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    })

    // In production, send email with code
    console.log(`Login code for ${email}: ${code}`)

    res.json({
      success: true,
      message: 'Login code sent',
      // Remove this in production - only for demo
      debug_code: code
    })

  } catch (error) {
    console.error('Request code error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Export for use in verify-code endpoint
export { loginCodes }
