import { supabase, getUserFromToken, getUserOrganizationId, getUserRole, isUserAssignedToTrial } from '../../lib/supabase'

export default async function handler(req, res) {
  const { companyId } = req.query

  try {
    // Get user from token
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

    const userRole = await getUserRole(user.id)

    if (req.method === 'GET') {
      // Get news items
      let query = supabase
        .from('news_updates')
        .select('*')
        .eq('organization_id', companyId)
        .order('created_at', { ascending: false })

      // If not admin, only show published news or news from assigned trials
      if (userRole !== 'admin') {
        query = query.eq('published', true)
      }

      const { data: news, error } = await query

      if (error) {
        console.error('Error fetching news:', error)
        return res.status(500).json({ error: 'Failed to fetch news' })
      }

      res.json({
        success: true,
        news: news || []
      })

    } else if (req.method === 'POST') {
      // Create news item
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can create news' })
      }

      const { title, body, clinical_trial_id, published } = req.body

      if (!title || !body) {
        return res.status(400).json({ error: 'Title and body are required' })
      }

      const { data: newsItem, error } = await supabase
        .from('news_updates')
        .insert({
          organization_id: companyId,
          clinical_trial_id,
          title,
          body,
          published: published || false,
          created_by: user.id
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating news:', error)
        return res.status(500).json({ error: 'Failed to create news item' })
      }

      res.json({
        success: true,
        message: 'News item created successfully',
        news: newsItem
      })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('News API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
