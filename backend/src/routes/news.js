const express = require('express');
const News = require('../models/News');
const { authenticateToken, trackActivity, requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all published news
router.get('/', authenticateToken, trackActivity, async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      category,
      priority,
      search
    } = req.query;

    let query = {
      tenantId: req.tenantId,
      'publishing.isPublished': true,
      $or: [
        { 'publishing.expiresAt': { $exists: false } },
        { 'publishing.expiresAt': { $gt: new Date() } }
      ]
    };

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add priority filter
    if (priority) {
      query.priority = priority;
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const news = await News.find(query)
      .sort({ 'publishing.publishedAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content'); // Don't send full content in list

    const total = await News.countDocuments(query);

    res.json({
      news,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('News retrieval error:', error);
    res.status(500).json({
      error: 'News retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Get single news article
router.get('/:id', authenticateToken, trackActivity, async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findOne({
      _id: id,
      tenantId: req.tenantId,
      'publishing.isPublished': true
    });

    if (!news) {
      return res.status(404).json({
        error: 'News not found',
        message: 'The requested news article was not found'
      });
    }

    // Track view
    await news.trackView();

    res.json({ news });

  } catch (error) {
    console.error('News detail error:', error);
    res.status(500).json({
      error: 'News detail retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Get trending news
router.get('/trending/list', authenticateToken, trackActivity, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const trendingNews = await News.find({
      tenantId: req.tenantId,
      'publishing.isPublished': true,
      $or: [
        { 'publishing.expiresAt': { $exists: false } },
        { 'publishing.expiresAt': { $gt: new Date() } }
      ]
    })
    .sort({ 'engagement.views': -1 })
    .limit(parseInt(limit))
    .select('-content');

    res.json({ trendingNews });

  } catch (error) {
    console.error('Trending news error:', error);
    res.status(500).json({
      error: 'Trending news retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Get news by category
router.get('/category/:category', authenticateToken, trackActivity, async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10 } = req.query;

    const news = await News.find({
      tenantId: req.tenantId,
      category,
      'publishing.isPublished': true,
      $or: [
        { 'publishing.expiresAt': { $exists: false } },
        { 'publishing.expiresAt': { $gt: new Date() } }
      ]
    })
    .sort({ 'publishing.publishedAt': -1 })
    .limit(parseInt(limit))
    .select('-content');

    res.json({ news, category });

  } catch (error) {
    console.error('Category news error:', error);
    res.status(500).json({
      error: 'Category news retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Create news article (admin only)
router.post('/', authenticateToken, requireAdmin, [
  body('title').trim().isLength({ min: 5, max: 200 }),
  body('content').trim().isLength({ min: 10 }),
  body('category').isIn(['press_release', 'fda_update', 'publication', 'trial_update', 'general', 'training']),
  body('priority').isIn(['low', 'medium', 'high', 'urgent'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: errors.array()[0].msg
      });
    }

    const {
      title,
      content,
      category,
      priority,
      media,
      targeting,
      seo,
      tags
    } = req.body;

    const news = new News({
      tenantId: req.tenantId,
      title,
      content,
      category,
      priority,
      media,
      targeting,
      seo,
      tags,
      author: {
        name: `${req.investigator.firstName} ${req.investigator.lastName}`,
        email: req.investigator.email,
        role: req.investigator.role
      }
    });

    await news.save();

    res.status(201).json({
      message: 'News article created successfully',
      news: {
        id: news._id,
        title: news.title,
        category: news.category,
        priority: news.priority,
        isPublished: news.publishing.isPublished
      }
    });

  } catch (error) {
    console.error('News creation error:', error);
    res.status(500).json({
      error: 'News creation failed',
      message: 'Internal server error'
    });
  }
});

// Update news article (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const news = await News.findOne({
      _id: id,
      tenantId: req.tenantId
    });

    if (!news) {
      return res.status(404).json({
        error: 'News not found',
        message: 'The requested news article was not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== '_id' && key !== 'tenantId') {
        news[key] = updateData[key];
      }
    });

    await news.save();

    res.json({
      message: 'News article updated successfully',
      news: {
        id: news._id,
        title: news.title,
        category: news.category,
        priority: news.priority,
        isPublished: news.publishing.isPublished
      }
    });

  } catch (error) {
    console.error('News update error:', error);
    res.status(500).json({
      error: 'News update failed',
      message: 'Internal server error'
    });
  }
});

// Publish news article (admin only)
router.post('/:id/publish', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findOne({
      _id: id,
      tenantId: req.tenantId
    });

    if (!news) {
      return res.status(404).json({
        error: 'News not found',
        message: 'The requested news article was not found'
      });
    }

    await news.publish(req.investigator._id);

    res.json({
      message: 'News article published successfully',
      news: {
        id: news._id,
        title: news.title,
        isPublished: news.publishing.isPublished,
        publishedAt: news.publishing.publishedAt
      }
    });

  } catch (error) {
    console.error('News publish error:', error);
    res.status(500).json({
      error: 'News publish failed',
      message: 'Internal server error'
    });
  }
});

// Track news share
router.post('/:id/share', authenticateToken, trackActivity, async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findOne({
      _id: id,
      tenantId: req.tenantId,
      'publishing.isPublished': true
    });

    if (!news) {
      return res.status(404).json({
        error: 'News not found',
        message: 'The requested news article was not found'
      });
    }

    await news.trackShare();

    res.json({
      message: 'Share tracked successfully',
      shares: news.engagement.shares
    });

  } catch (error) {
    console.error('News share error:', error);
    res.status(500).json({
      error: 'Share tracking failed',
      message: 'Internal server error'
    });
  }
});

// Add comment to news (if enabled)
router.post('/:id/comments', authenticateToken, trackActivity, [
  body('text').trim().isLength({ min: 1, max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: errors.array()[0].msg
      });
    }

    const { id } = req.params;
    const { text } = req.body;

    const news = await News.findOne({
      _id: id,
      tenantId: req.tenantId,
      'publishing.isPublished': true
    });

    if (!news) {
      return res.status(404).json({
        error: 'News not found',
        message: 'The requested news article was not found'
      });
    }

    await news.addComment(req.investigator._id, text);

    res.json({
      message: 'Comment added successfully',
      comments: news.engagement.comments
    });

  } catch (error) {
    console.error('News comment error:', error);
    res.status(500).json({
      error: 'Comment addition failed',
      message: 'Internal server error'
    });
  }
});

// Delete news article (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const news = await News.findOneAndDelete({
      _id: id,
      tenantId: req.tenantId
    });

    if (!news) {
      return res.status(404).json({
        error: 'News not found',
        message: 'The requested news article was not found'
      });
    }

    res.json({
      message: 'News article deleted successfully'
    });

  } catch (error) {
    console.error('News deletion error:', error);
    res.status(500).json({
      error: 'News deletion failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
