import { supabase } from '../../lib/supabase'
import { loginCodes } from './request-code'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and code are required' })
  }

  try {
    if (!loginCodes.has(email)) {
      return res.status(400).json({ error: 'No code requested or code expired' })
    }

    const codeData = loginCodes.get(email)

    // Check expiration
    if (Date.now() > codeData.expires) {
      loginCodes.delete(email)
      return res.status(400).json({ error: 'Code expired' })
    }

    // Check code
    if (codeData.code !== code) {
      codeData.attempts++
      if (codeData.attempts >= 3) {
        loginCodes.delete(email)
        return res.status(400).json({ error: 'Too many attempts. Please request a new code.' })
      }
      return res.status(400).json({ error: 'Invalid code' })
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()

    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Clean up used code
    loginCodes.delete(email)

    // Create a session token (in production, use proper JWT)
    const sessionToken = `mobile-session-${user.id}-${Date.now()}`

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        organization_id: user.organization_id
      },
      token: sessionToken
    })

  } catch (error) {
    console.error('Verify code error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
