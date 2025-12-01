import { supabase, getUserFromToken, getUserOrganizationId } from './lib/supabase'

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    // Get user from token
    const token = req.headers.authorization?.replace('Bearer ', '')
    const user = token ? await getUserFromToken(token) : null

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    // Get user's organization
    const userOrgId = await getUserOrganizationId(user.id)
    if (!userOrgId) {
      return res.status(403).json({ error: 'No organization found' })
    }

    if (req.method === 'GET') {
      // Get all hospitals for user's organization
      const { data: hospitals, error } = await supabase
        .from('hospitals')
        .select('*')
        .eq('organization_id', userOrgId)
        .order('randomized_patients', { ascending: false })

      if (error) {
        console.error('Error fetching hospitals:', error)
        return res.status(500).json({ error: 'Failed to fetch hospitals' })
      }

      // Transform data to match frontend expectations
      const transformedHospitals = hospitals.map(hospital => ({
        id: hospital.id,
        name: hospital.hospital_name || hospital.name,
        location: hospital.location,
        principal_investigator: hospital.principal_investigator,
        consented_patients: hospital.consented_patients || 0,
        randomized_patients: hospital.randomized_patients || 0,
        consent_rate: hospital.consented_rate || 0,
        created_at: hospital.created_at
      }))

      // Calculate summary stats
      const totalConsented = transformedHospitals.reduce((sum, h) => sum + h.consented_patients, 0)
      const totalRandomized = transformedHospitals.reduce((sum, h) => sum + h.randomized_patients, 0)

      res.json({
        success: true,
        hospitals: transformedHospitals,
        summary: {
          totalConsented,
          totalRandomized,
          totalHospitals: transformedHospitals.length
        }
      })

    } else if (req.method === 'POST') {
      // Create new hospital
      const {
        name,
        location,
        principalInvestigator,
        consentedPatients,
        randomizedPatients,
        consentRate
      } = req.body

      if (!name || !location || !principalInvestigator) {
        return res.status(400).json({
          error: 'Name, location, and principal investigator are required'
        })
      }

      const insertData = {
        organization_id: userOrgId,
        hospital_name: name,
        location: location,
        principal_investigator: principalInvestigator,
        consented_patients: consentedPatients || 0,
        randomized_patients: randomizedPatients || 0,
        consented_rate: consentRate || 0,
        created_by: user.id
      }

      const { data, error } = await supabase
        .from('hospitals')
        .insert([insertData])
        .select('*')
        .single()

      if (error) {
        console.error('Error creating hospital:', error)
        return res.status(500).json({ error: 'Failed to create hospital' })
      }

      res.json({
        success: true,
        hospital: {
          id: data.id,
          name: data.hospital_name,
          location: data.location,
          principal_investigator: data.principal_investigator,
          consented_patients: data.consented_patients,
          randomized_patients: data.randomized_patients,
          consent_rate: data.consented_rate
        }
      })

    } else {
      res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('Hospitals API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
