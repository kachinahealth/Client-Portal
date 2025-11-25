import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for user authentication
export const getUserFromToken = async (token) => {
  if (!token) return null

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting user from token:', error)
    return null
  }
}

// Helper functions for organization and role checking
export const getUserOrganizationId = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data.organization_id
  } catch (error) {
    console.error('Error getting user organization:', error)
    return null
  }
}

export const getUserRole = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data.role
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

export const isUserAssignedToTrial = async (userId, trialId) => {
  try {
    const { data, error } = await supabase
      .from('user_clinical_assignments')
      .select('id')
      .eq('user_id', userId)
      .eq('clinical_trial_id', trialId)
      .single()

    return !error && !!data
  } catch (error) {
    console.error('Error checking trial assignment:', error)
    return false
  }
}
