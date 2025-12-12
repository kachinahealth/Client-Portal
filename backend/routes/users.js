const express = require('express');
const { supabase, supabaseAdmin } = require('../supabaseClient');
const { authenticateToken, requireSupabase } = require('../middleware/auth');
const config = require('../config');
const Logger = require('../utils/logger');

const router = express.Router();

// Get all users
router.get('/', authenticateToken, requireSupabase, async (req, res) => {
  try {
    Logger.info('Fetching users', { requestedBy: req.user.userId });

    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        role,
        site,
        is_active,
        last_login,
        created_at,
        profiles (
          organization_id,
          display_name,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      Logger.error('Users fetch error', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch users',
        error: error.message
      });
    }

    Logger.info('Users fetched successfully', { count: users?.length });

    res.json({
      success: true,
      users: users || []
    });
  } catch (error) {
    Logger.error('Users fetch error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Create new user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, role = 'user', site, organizationId } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      });
    }

    Logger.info('Creating user', { email, role, requestedBy: req.user.userId });

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        name: name,
        role: role,
        site: site
      }
    });

    if (authError) {
      Logger.error('User creation failed', authError);
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    // Create user profile
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          role: role,
          organization_id: organizationId,
          display_name: name,
        });

      if (profileError) {
        Logger.warn('Profile creation failed', profileError);
        // Don't fail user creation if profile creation fails
      }

      // Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: name,
          email: email,
          role: role,
          site: site,
          created_by: req.user.userId
        });

      if (userError) {
        Logger.warn('User record creation failed', userError);
      }
    }

    Logger.info('User created successfully', { email, userId: authData.user?.id });

    res.status(201).json({
      success: true,
      message: 'User created successfully. An invitation email has been sent.',
      user: {
        id: authData.user?.id,
        email: email,
        name: name,
        role: role
      }
    });
  } catch (error) {
    Logger.error('User creation error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Update user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, site, isActive, organizationId } = req.body;

    Logger.info('Updating user', { userId: id, requestedBy: req.user.userId });

    // Check permissions
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update user record
    const { data, error } = await supabase
      .from('users')
      .update({
        name: name,
        email: email,
        role: role,
        site: site,
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      Logger.error('User update failed', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    // Update profile if provided
    if (role || organizationId) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: role,
          organization_id: organizationId,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (profileError) {
        Logger.warn('Profile update failed', profileError);
      }
    }

    Logger.info('User updated successfully', { userId: id });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: data
    });
  } catch (error) {
    Logger.error('User update error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Delete user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    Logger.info('Deleting user', { userId: id, requestedBy: req.user.userId });

    // Check permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Delete user (this will cascade to profiles due to foreign key)
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      Logger.error('User deletion failed', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    Logger.info('User deleted successfully', { userId: id });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    Logger.error('User deletion error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Get user's clinical trial assignment
router.get('/:userId/clinical-assignment', authenticateToken, requireSupabase, async (req, res) => {
  try {
    const { userId } = req.params;

    // Check permissions
    if (req.user.role !== 'admin' && req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get clinical trial assignment
    const { data: assignment, error } = await supabase
      .from('user_clinical_assignments')
      .select(`
        id,
        clinical_trial_id,
        assigned_at,
        clinical_trials (
          id,
          trial_name,
          description,
          status,
          start_date,
          end_date
        )
      `)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      Logger.error('Clinical assignment fetch failed', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch clinical assignment'
      });
    }

    res.json({
      success: true,
      assignment: assignment || null
    });
  } catch (error) {
    Logger.error('Clinical assignment fetch error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Update user's clinical trial assignment
router.put('/:userId/clinical-assignment', authenticateToken, requireSupabase, async (req, res) => {
  try {
    const { userId } = req.params;
    const { clinical_trial_id } = req.body;

    // Check permissions
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    if (clinical_trial_id) {
      // Validate clinical_trial_id exists
      const { data: trial, error: trialError } = await supabase
        .from('clinical_trials')
        .select('id, trial_name')
        .eq('id', clinical_trial_id)
        .single();

      if (trialError || !trial) {
        return res.status(400).json({
          success: false,
          message: 'Invalid clinical trial ID'
        });
      }

      // Create or update assignment
      const { data, error } = await supabase
        .from('user_clinical_assignments')
        .upsert({
          user_id: userId,
          clinical_trial_id: clinical_trial_id,
          assigned_at: new Date().toISOString()
        })
        .select(`
          id,
          clinical_trial_id,
          assigned_at,
          clinical_trials (
            id,
            trial_name,
            description
          )
        `)
        .single();

      if (error) {
        Logger.error('Assignment update failed', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to update clinical trial assignment'
        });
      }

      res.json({
        success: true,
        message: 'Clinical trial assignment updated successfully',
        assignment: data
      });
    } else {
      // Remove assignment
      const { error } = await supabase
        .from('user_clinical_assignments')
        .delete()
        .eq('user_id', userId);

      if (error) {
        Logger.error('Assignment removal failed', error);
        return res.status(500).json({
          success: false,
          message: 'Failed to remove clinical trial assignment'
        });
      }

      res.json({
        success: true,
        message: 'Clinical trial assignment removed successfully'
      });
    }
  } catch (error) {
    Logger.error('Clinical assignment update error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

module.exports = router;
