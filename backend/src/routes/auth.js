const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Investigator = require('../models/Investigator');
const { authenticateToken, sanitizeInput } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const loginSchema = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
];

const registerSchema = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().isLength({ min: 2 }),
  body('lastName').trim().isLength({ min: 2 }),
  body('site.siteId').notEmpty(),
  body('site.siteName').notEmpty()
];

// Login endpoint
router.post('/login', loginSchema, sanitizeInput, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;
    const tenantId = req.tenantId || req.body.tenantId || 'cerevasc';

    // Find investigator
    const investigator = await Investigator.findOne({
      email,
      tenantId,
      status: 'active'
    });

    if (!investigator) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await investigator.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Update login analytics
    await investigator.updateLoginAnalytics();

    // Generate JWT token
    const token = jwt.sign(
      {
        investigatorId: investigator._id,
        tenantId: investigator.tenantId,
        role: investigator.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return investigator data (without password)
    const investigatorData = {
      id: investigator._id,
      email: investigator.email,
      firstName: investigator.firstName,
      lastName: investigator.lastName,
      fullName: investigator.fullName,
      role: investigator.role,
      site: investigator.site,
      enrollmentStats: investigator.enrollmentStats,
      appUsage: {
        lastLogin: investigator.appUsage.lastLogin,
        totalLogins: investigator.appUsage.totalLogins,
        preferences: investigator.appUsage.preferences
      }
    };

    res.json({
      message: 'Login successful',
      token,
      investigator: investigatorData
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Internal server error'
    });
  }
});

// Register endpoint (admin only)
router.post('/register', registerSchema, authenticateToken, sanitizeInput, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: errors.array()[0].msg
      });
    }

    // Check if user is admin
    if (req.investigator.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only administrators can register new investigators'
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      role = 'principal_investigator',
      site,
      credentials
    } = req.body;

    // Check if email already exists
    const existingInvestigator = await Investigator.findOne({
      email,
      tenantId: req.tenantId
    });

    if (existingInvestigator) {
      return res.status(400).json({
        error: 'Registration failed',
        message: 'Email already registered'
      });
    }

    // Create new investigator
    const investigator = new Investigator({
      tenantId: req.tenantId,
      email,
      password,
      firstName,
      lastName,
      role,
      site,
      credentials,
      isVerified: false
    });

    await investigator.save();

    // Return investigator data (without password)
    const investigatorData = {
      id: investigator._id,
      email: investigator.email,
      firstName: investigator.firstName,
      lastName: investigator.lastName,
      fullName: investigator.fullName,
      role: investigator.role,
      site: investigator.site,
      isVerified: investigator.isVerified
    };

    res.status(201).json({
      message: 'Investigator registered successfully',
      investigator: investigatorData
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Internal server error'
    });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const investigator = await Investigator.findById(req.investigator._id)
      .select('-password');

    res.json({
      investigator
    });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Profile retrieval failed',
      message: 'Internal server error'
    });
  }
});

// Update profile
router.put('/profile', authenticateToken, sanitizeInput, async (req, res) => {
  try {
    const { firstName, lastName, credentials, appUsage } = req.body;

    const investigator = await Investigator.findById(req.investigator._id);

    if (firstName) investigator.firstName = firstName;
    if (lastName) investigator.lastName = lastName;
    if (credentials) investigator.credentials = { ...investigator.credentials, ...credentials };
    if (appUsage?.preferences) {
      investigator.appUsage.preferences = {
        ...investigator.appUsage.preferences,
        ...appUsage.preferences
      };
    }

    await investigator.save();

    res.json({
      message: 'Profile updated successfully',
      investigator: {
        id: investigator._id,
        email: investigator.email,
        firstName: investigator.firstName,
        lastName: investigator.lastName,
        fullName: investigator.fullName,
        role: investigator.role,
        site: investigator.site,
        credentials: investigator.credentials,
        appUsage: investigator.appUsage
      }
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Profile update failed',
      message: 'Internal server error'
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], sanitizeInput, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation error',
        message: errors.array()[0].msg
      });
    }

    const { currentPassword, newPassword } = req.body;

    const investigator = await Investigator.findById(req.investigator._id);

    // Verify current password
    const isValidPassword = await investigator.comparePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Password change failed',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    investigator.password = newPassword;
    await investigator.save();

    res.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'Internal server error'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a real application, you might want to blacklist the token
    // For now, we'll just return a success message
    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Internal server error'
    });
  }
});

module.exports = router;
