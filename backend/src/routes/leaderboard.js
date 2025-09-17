const express = require('express');
const Investigator = require('../models/Investigator');
const Enrollment = require('../models/Enrollment');
const { authenticateToken, trackActivity } = require('../middleware/auth');

const router = express.Router();

// Get overall leaderboard
router.get('/overall', authenticateToken, trackActivity, async (req, res) => {
  try {
    const { limit = 20, period = 'all' } = req.query;

    let dateFilter = {};
    if (period === 'month') {
      dateFilter = {
        'enrollmentStats.lastEnrollment': {
          $gte: new Date(new Date().setDate(1)) // First day of current month
        }
      };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = {
        'enrollmentStats.lastEnrollment': { $gte: weekAgo }
      };
    }

    const leaderboard = await Investigator.find({
      tenantId: req.tenantId,
      status: 'active',
      ...dateFilter
    })
    .select('firstName lastName site enrollmentStats')
    .sort({ 'enrollmentStats.totalRandomized': -1 })
    .limit(parseInt(limit));

    // Add rank to each investigator
    const leaderboardWithRank = leaderboard.map((investigator, index) => ({
      rank: index + 1,
      investigator: {
        id: investigator._id,
        name: `${investigator.firstName} ${investigator.lastName}`,
        site: investigator.site.siteName,
        siteId: investigator.site.siteId
      },
      stats: {
        totalConsented: investigator.enrollmentStats.totalConsented,
        totalRandomized: investigator.enrollmentStats.totalRandomized,
        totalScreened: investigator.enrollmentStats.totalScreened,
        totalFailed: investigator.enrollmentStats.totalFailed,
        enrollmentRate: investigator.enrollmentRate,
        lastEnrollment: investigator.enrollmentStats.lastEnrollment
      }
    }));

    res.json({
      leaderboard: leaderboardWithRank,
      period,
      totalParticipants: leaderboard.length
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      error: 'Leaderboard retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Get leaderboard by country/region
router.get('/by-country', authenticateToken, trackActivity, async (req, res) => {
  try {
    const { country, limit = 10 } = req.query;

    if (!country) {
      return res.status(400).json({
        error: 'Country parameter required',
        message: 'Please specify a country'
      });
    }

    const leaderboard = await Investigator.find({
      tenantId: req.tenantId,
      status: 'active',
      'site.siteAddress.country': country
    })
    .select('firstName lastName site enrollmentStats')
    .sort({ 'enrollmentStats.totalRandomized': -1 })
    .limit(parseInt(limit));

    const leaderboardWithRank = leaderboard.map((investigator, index) => ({
      rank: index + 1,
      investigator: {
        id: investigator._id,
        name: `${investigator.firstName} ${investigator.lastName}`,
        site: investigator.site.siteName,
        siteId: investigator.site.siteId
      },
      stats: {
        totalConsented: investigator.enrollmentStats.totalConsented,
        totalRandomized: investigator.enrollmentStats.totalRandomized,
        enrollmentRate: investigator.enrollmentRate
      }
    }));

    res.json({
      leaderboard: leaderboardWithRank,
      country,
      totalParticipants: leaderboard.length
    });

  } catch (error) {
    console.error('Country leaderboard error:', error);
    res.status(500).json({
      error: 'Country leaderboard retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Get site-specific leaderboard
router.get('/site/:siteId', authenticateToken, trackActivity, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { limit = 10 } = req.query;

    const leaderboard = await Investigator.find({
      tenantId: req.tenantId,
      'site.siteId': siteId,
      status: 'active'
    })
    .select('firstName lastName role enrollmentStats')
    .sort({ 'enrollmentStats.totalRandomized': -1 })
    .limit(parseInt(limit));

    const leaderboardWithRank = leaderboard.map((investigator, index) => ({
      rank: index + 1,
      investigator: {
        id: investigator._id,
        name: `${investigator.firstName} ${investigator.lastName}`,
        role: investigator.role
      },
      stats: {
        totalConsented: investigator.enrollmentStats.totalConsented,
        totalRandomized: investigator.enrollmentStats.totalRandomized,
        enrollmentRate: investigator.enrollmentRate
      }
    }));

    res.json({
      leaderboard: leaderboardWithRank,
      siteId,
      totalParticipants: leaderboard.length
    });

  } catch (error) {
    console.error('Site leaderboard error:', error);
    res.status(500).json({
      error: 'Site leaderboard retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Get user's rank
router.get('/my-rank', authenticateToken, trackActivity, async (req, res) => {
  try {
    const investigator = await Investigator.findById(req.investigator._id);

    // Get total count of investigators with more randomizations
    const rank = await Investigator.countDocuments({
      tenantId: req.tenantId,
      status: 'active',
      'enrollmentStats.totalRandomized': { $gt: investigator.enrollmentStats.totalRandomized }
    });

    const totalParticipants = await Investigator.countDocuments({
      tenantId: req.tenantId,
      status: 'active'
    });

    res.json({
      rank: rank + 1,
      totalParticipants,
      stats: {
        totalConsented: investigator.enrollmentStats.totalConsented,
        totalRandomized: investigator.enrollmentStats.totalRandomized,
        totalScreened: investigator.enrollmentStats.totalScreened,
        totalFailed: investigator.enrollmentStats.totalFailed,
        enrollmentRate: investigator.enrollmentRate
      }
    });

  } catch (error) {
    console.error('My rank error:', error);
    res.status(500).json({
      error: 'Rank retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Get enrollment progress trends
router.get('/trends', authenticateToken, trackActivity, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const trends = await Enrollment.aggregate([
      {
        $match: {
          tenantId: req.tenantId,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          statuses: {
            $push: {
              status: '$_id.status',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      trends,
      period: `${days} days`
    });

  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({
      error: 'Trends retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Get achievement badges
router.get('/achievements', authenticateToken, trackActivity, async (req, res) => {
  try {
    const investigator = await Investigator.findById(req.investigator._id);
    const achievements = [];

    // Enrollment milestones
    if (investigator.enrollmentStats.totalRandomized >= 10) {
      achievements.push({
        id: 'enrollment_milestone_10',
        name: 'Enrollment Champion',
        description: 'Randomized 10+ patients',
        icon: '🏆',
        earned: true,
        earnedDate: investigator.enrollmentStats.lastEnrollment
      });
    } else if (investigator.enrollmentStats.totalRandomized >= 5) {
      achievements.push({
        id: 'enrollment_milestone_5',
        name: 'Enrollment Leader',
        description: 'Randomized 5+ patients',
        icon: '🥇',
        earned: true,
        earnedDate: investigator.enrollmentStats.lastEnrollment
      });
    }

    // Consistency badges
    if (investigator.appUsage.totalLogins >= 50) {
      achievements.push({
        id: 'consistency_50',
        name: 'Dedicated Investigator',
        description: 'Logged in 50+ times',
        icon: '📱',
        earned: true
      });
    }

    // High enrollment rate
    if (investigator.enrollmentRate >= 80) {
      achievements.push({
        id: 'high_rate',
        name: 'Efficiency Expert',
        description: '80%+ enrollment rate',
        icon: '⚡',
        earned: true
      });
    }

    // Recent activity
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    if (investigator.enrollmentStats.lastEnrollment >= lastWeek) {
      achievements.push({
        id: 'recent_activity',
        name: 'Active This Week',
        description: 'Recent enrollment activity',
        icon: '🆕',
        earned: true,
        earnedDate: investigator.enrollmentStats.lastEnrollment
      });
    }

    res.json({
      achievements,
      totalEarned: achievements.filter(a => a.earned).length
    });

  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({
      error: 'Achievements retrieval failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
