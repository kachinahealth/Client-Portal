import { supabase } from '../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { email, firstName, lastName, site, role, organization_id } = req.body

  if (!email || !firstName || !lastName || !site || !role || !organization_id) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // For mobile app registration, we'll create a profile with pending status
    // In production, you'd want to send an email verification first
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email,
        display_name: `${firstName} ${lastName}`,
        role,
        organization_id,
        status: 'pending'
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return res.status(500).json({ error: 'Failed to create user profile' })
    }

    res.json({
      success: true,
      message: 'User registered successfully. Awaiting approval.',
      user: {
        id: profile.id,
        email: profile.email,
        status: profile.status
      }
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
