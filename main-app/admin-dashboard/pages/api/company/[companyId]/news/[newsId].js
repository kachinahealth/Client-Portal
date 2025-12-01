import { supabase, getUserFromToken, getUserOrganizationId, getUserRole } from '../../../lib/supabase'

export default async function handler(req, res) {
  const { companyId, newsId } = req.query

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

    if (req.method === 'PUT') {
      // Update news item
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can update news' })
      }

      const { title, body, published } = req.body

      const { data: newsItem, error } = await supabase
        .from('news_updates')
        .update({
          title,
          body,
          published,
          updated_at: new Date().toISOString()
        })
        .eq('id', newsId)
        .eq('organization_id', companyId)
        .select()
        .single()

      if (error) {
        console.error('Error updating news:', error)
        return res.status(500).json({ error: 'Failed to update news item' })
      }

      res.json({
        success: true,
        message: 'News item updated successfully',
        news: newsItem
      })

    } else if (req.method === 'DELETE') {
      // Delete news item
      if (userRole !== 'admin') {
        return res.status(403).json({ error: 'Only admins can delete news' })
      }

      const { error } = await supabase
        .from('news_updates')
        .delete()
        .eq('id', newsId)
        .eq('organization_id', companyId)

      if (error) {
        console.error('Error deleting news:', error)
        return res.status(500).json({ error: 'Failed to delete news item' })
      }

      res.json({
        success: true,
        message: 'News item deleted successfully'
      })

    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }

  } catch (error) {
    console.error('News item API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}
