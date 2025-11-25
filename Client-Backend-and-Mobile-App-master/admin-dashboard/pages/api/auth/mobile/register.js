import { supabase } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { firstName, lastName, email, site, role } = req.body

  if (!firstName || !lastName || !email || !site || !role) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  try {
    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // For now, we'll use a default organization (you might want to change this logic)
    const defaultOrgId = process.env.DEFAULT_ORGANIZATION_ID || 'your-default-org-id'

    // Create new user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        email,
        display_name: `${firstName} ${lastName}`,
        role,
        organization_id: defaultOrgId,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return res.status(500).json({ error: 'Failed to create user profile' })
    }

    res.json({
      success: true,
      message: 'Registration successful. Pending admin approval.'
    })

  } catch (error) {
    console.error('Mobile registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
