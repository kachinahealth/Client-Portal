import { supabase, getUserFromToken, getUserOrganizationId, getUserRole } from '../../lib/supabase'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { companyId } = req.query

  try {
    // Get user from token (if provided)
    const token = req.headers.authorization?.replace('Bearer ', '')
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Check if user belongs to the requested organization
    const userOrgId = await getUserOrganizationId(user.id)
    if (userOrgId !== companyId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Get enrollments for this organization
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        clinical_trials (
          name,
          is_active
        )
      `)
      .eq('organization_id', companyId)

    if (error) {
      console.error('Error fetching enrollments:', error)
      return res.status(500).json({ error: 'Failed to fetch leaderboard data' })
    }

    // Group enrollments by hospital/site for leaderboard
    const hospitalStats = {}
    enrollments.forEach(enrollment => {
      const site = enrollment.site || 'Unknown'
      if (!hospitalStats[site]) {
        hospitalStats[site] = {
          name: site,
          consentedPatients: 0,
          randomizedPatients: 0,
          consentRate: 0
        }
      }
      hospitalStats[site].consentedPatients++
      // In production, you'd have a field to track randomization
    })

    const hospitals = Object.values(hospitalStats)
    const totalConsented = hospitals.reduce((sum, h) => sum + h.consentedPatients, 0)

    res.json({
      success: true,
      hospitals,
      summary: {
        totalConsented,
        totalRandomized: 0, // Calculate based on your data model
        totalHospitals: hospitals.length
      }
    })

  } catch (error) {
    console.error('Leaderboard error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
