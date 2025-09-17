const jwt = require('jsonwebtoken');
const Investigator = require('../models/Investigator');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access token required',
        message: 'Please provide a valid authentication token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get investigator data
    const investigator = await Investigator.findById(decoded.investigatorId);
    if (!investigator || investigator.status !== 'active') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Investigator not found or inactive'
      });
    }

    // Add investigator to request
    req.investigator = investigator;
    req.tenantId = investigator.tenantId;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Authentication token has expired'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Invalid authentication token'
      });
    }
    return res.status(500).json({
      error: 'Authentication error',
      message: 'Internal server error during authentication'
    });
  }
};

// Require admin role
const requireAdmin = (req, res, next) => {
  if (req.investigator.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required'
    });
  }
  next();
};

// Require principal investigator role
const requirePrincipalInvestigator = (req, res, next) => {
  if (req.investigator.role !== 'principal_investigator' && req.investigator.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Principal investigator privileges required'
    });
  }
  next();
};

// Require site access (for site-specific data)
const requireSiteAccess = (req, res, next) => {
  const requestedSiteId = req.params.siteId || req.body.siteId;

  if (req.investigator.role === 'admin') {
    return next(); // Admins can access all sites
  }

  if (req.investigator.site.siteId !== requestedSiteId) {
    return res.status(403).json({
      error: 'Access denied',
      message: 'You can only access data from your assigned site'
    });
  }
  next();
};

// Track user activity
const trackActivity = async (req, res, next) => {
  try {
    if (req.investigator) {
      await req.investigator.updateLoginAnalytics();
    }
    next();
  } catch (error) {
    next(); // Don't block request if tracking fails
  }
};

// Rate limiting by user
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const userId = req.investigator?._id || req.ip;
    const now = Date.now();

    if (!requests.has(userId)) {
      requests.set(userId, { count: 0, resetTime: now + windowMs });
    }

    const userRequests = requests.get(userId);

    if (now > userRequests.resetTime) {
      userRequests.count = 0;
      userRequests.resetTime = now + windowMs;
    }

    userRequests.count++;

    if (userRequests.count > maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later'
      });
    }

    next();
  };
};

// Validate request data
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message
      });
    }
    next();
  };
};

// Sanitize input
const sanitizeInput = (req, res, next) => {
  // Basic XSS protection
  const sanitize = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+=/gi, '');
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  };

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requirePrincipalInvestigator,
  requireSiteAccess,
  trackActivity,
  rateLimitByUser,
  validateRequest,
  sanitizeInput
};
