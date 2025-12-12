const express = require('express');
const { supabase, supabaseAdmin } = require('../supabaseClient');
const { authenticateToken, requireSupabase } = require('../middleware/auth');
const config = require('../config');
const Logger = require('../utils/logger');

const router = express.Router();

// Get clinical trials for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    Logger.info('Clinical trials fetch request', { userId: req.user.userId });

    let formattedTrials = [];

    // Check if Supabase is available (has environment variables)
    if (supabase && supabaseAdmin && config.SUPABASE_URL && config.SUPABASE_ANON_KEY && config.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        // Get user's organization
        const userId = req.user.userId;
        const { data: userProfile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('organization_id')
          .eq('id', userId)
          .single();

        if (profileError || !userProfile) {
          Logger.error('User profile fetch failed', profileError);
          return res.status(400).json({
            success: false,
            message: 'Failed to get user profile'
          });
        }

        // Query the clinical_trials table
        Logger.debug('Executing clinical trials query');
        const { data, error } = await supabase
          .from('clinical_trials')
          .select('id, trial_name, description, status, start_date, end_date, created_at')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          Logger.error('Clinical trials query error', error);
        } else if (data && data.length > 0) {
          Logger.info('Clinical trials query successful', { count: data.length });

          // Map database columns to frontend expected format
          formattedTrials = data.map(trial => ({
            id: trial.id,
            trial_name: trial.trial_name,
            description: trial.description,
            status: trial.status || 'Active',
            start_date: trial.start_date,
            end_date: trial.end_date,
            created_at: trial.created_at
          }));
        } else {
          Logger.info('No clinical trials found in database');
        }
      } catch (dbError) {
        Logger.error('Database operation failed', dbError);
        Logger.info('Continuing with empty trials array');
      }
    } else {
      Logger.warn('Supabase not configured for clinical trials', {
        supabase: !!supabase,
        supabaseAdmin: !!supabaseAdmin,
        hasUrl: !!config.SUPABASE_URL,
        hasAnonKey: !!config.SUPABASE_ANON_KEY,
        hasServiceKey: !!config.SUPABASE_SERVICE_ROLE_KEY
      });
    }

    res.json({
      success: true,
      trials: formattedTrials
    });
  } catch (err) {
    Logger.error('Clinical trials fetch error', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Create clinical trial (Admin only)
router.post('/', authenticateToken, requireSupabase, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Trial name is required'
      });
    }

    Logger.info('Creating clinical trial', { name, userId });

    // Get user role information
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single();

    if (profileError) {
      Logger.error('User profile fetch failed', profileError);
      return res.status(400).json({
        success: false,
        message: 'User profile not found. Please contact an administrator.'
      });
    }

    // Allow admins and users to create trials
    if (!['admin', 'user'].includes(userProfile.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create clinical trials'
      });
    }

    // Create clinical trial
    const { data, error } = await supabase
      .from('clinical_trials')
      .insert({
        trial_name: name,
        description: description || '',
        status: 'Active',
        is_active: isActive !== undefined ? isActive : true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      Logger.error('Clinical trial creation failed', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create clinical trial',
        error: error.message
      });
    }

    Logger.info('Clinical trial created successfully', { id: data.id, name });

    res.status(201).json({
      success: true,
      message: 'Clinical trial created successfully',
      trial: data
    });
  } catch (error) {
    Logger.error('Clinical trial creation error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Update clinical trial
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, startDate, endDate, isActive } = req.body;

    Logger.info('Updating clinical trial', { id, userId: req.user.userId });

    // Check permissions (allow creators and admins)
    const { data: trial, error: fetchError } = await supabase
      .from('clinical_trials')
      .select('id, trial_name')
      .eq('id', id)
      .single();

    if (fetchError || !trial) {
      return res.status(404).json({
        success: false,
        message: 'Clinical trial not found'
      });
    }

    // Update trial
    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (name !== undefined) updateData.trial_name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (startDate !== undefined) updateData.start_date = startDate;
    if (endDate !== undefined) updateData.end_date = endDate;
    if (isActive !== undefined) updateData.is_active = isActive;

    const { data, error } = await supabase
      .from('clinical_trials')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      Logger.error('Clinical trial update failed', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update clinical trial'
      });
    }

    Logger.info('Clinical trial updated successfully', { id });

    res.json({
      success: true,
      message: 'Clinical trial updated successfully',
      trial: data
    });
  } catch (error) {
    Logger.error('Clinical trial update error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Delete clinical trial
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    Logger.info('Deleting clinical trial', { id });

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from('clinical_trials')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      Logger.error('Clinical trial deletion failed', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete clinical trial'
      });
    }

    Logger.info('Clinical trial deleted successfully', { id });

    res.json({
      success: true,
      message: 'Clinical trial deleted successfully'
    });
  } catch (error) {
    Logger.error('Clinical trial deletion error', error);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

module.exports = router;
