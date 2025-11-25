import { supabase } from '../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    // Attempt to sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return res.status(401).json({ error: error.message })
    }

    // Get user profile information
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return res.status(500).json({ error: 'Failed to fetch user profile' })
    }

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token: data.session.access_token,
      user: {
        id: profile.id,
        email: profile.email,
        display_name: profile.display_name,
        role: profile.role,
        organization_id: profile.organization_id,
        status: 'active'
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
