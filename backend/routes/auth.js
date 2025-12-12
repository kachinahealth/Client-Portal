const express = require('express');
const jwt = require('jsonwebtoken');
const { supabase } = require('../supabaseClient');
const { authenticateToken, requireSupabase } = require('../middleware/auth');
const config = require('../config');
const Logger = require('../utils/logger');

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    Logger.info('Login attempt', { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      Logger.warn('Login failed', { email, error: error.message });
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Get user profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, organization_id, display_name')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      Logger.error('Profile fetch failed', profileError);
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: data.user.id,
        email: data.user.email,
        role: profile?.role || 'user'
      },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    Logger.info('Login successful', { email, userId: data.user.id });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profile?.role || 'user',
        displayName: profile?.display_name,
        organizationId: profile?.organization_id
      }
    });
  } catch (error) {
    Logger.error('Login error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Register endpoint
router.post('/register', requireSupabase, async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and name are required'
      });
    }

    Logger.info('Registration attempt', { email, role });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Logger.warn('Registration failed', { email, error: error.message });
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        role: role,
        display_name: name,
      });

    if (profileError) {
      Logger.error('Profile creation failed', profileError);
      // Don't fail registration if profile creation fails
    }

    Logger.info('Registration successful', { email, userId: data.user.id });

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to confirm your account.',
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
  } catch (error) {
    Logger.error('Registration error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken, requireSupabase, async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      Logger.warn('Logout error', error);
    }

    Logger.info('Logout successful', { userId: req.user.userId });

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    Logger.error('Logout error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});

module.exports = router;
