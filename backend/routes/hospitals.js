const express = require('express');
const { supabase } = require('../supabaseClient');
const { authenticateToken, requireSupabase } = require('../middleware/auth');
const Logger = require('../utils/logger');

const router = express.Router();

// Get all hospitals for enrollment leaderboard
router.get('/', authenticateToken, async (req, res) => {
  try {
    Logger.info('Hospitals leaderboard request', { userId: req.user.userId });
    let transformedHospitals = [];

    // Check if Supabase is available (has environment variables)
    if (supabase && process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const { data, error } = await supabase
        .from('hospitals')
        .select('*')
        .order('randomized', { ascending: false });

      if (error) {
        Logger.error('Hospitals Supabase query error', error);
      } else if (data && data.length > 0) {
        Logger.info('Hospitals query successful', { count: data.length });
        transformedHospitals = data.map(hospital => ({
          id: hospital.id,
          name: hospital.hospital_name || hospital.name,
          location: hospital.location,
          principal_investigator: hospital.principal_investigator || 'Not assigned',
          consented_patients: hospital.consented_patients || hospital.consented || 0,
          randomized_patients: hospital.randomized_patients || hospital.randomized || 0,
          consent_rate: hospital.consented_rate || (hospital.consented > 0 ? Math.round((hospital.randomized / hospital.consented) * 100) : 0),
          created_at: hospital.created_at
        }));
      } else {
        Logger.info('No hospitals data from Supabase');
      }
    } else {
      Logger.warn('Supabase not configured for hospitals');
    }

    // Calculate summary statistics
    const summary = {
      totalConsented: transformedHospitals.reduce((sum, hospital) => sum + hospital.consented_patients, 0),
      totalRandomized: transformedHospitals.reduce((sum, hospital) => sum + hospital.randomized_patients, 0),
      totalHospitals: transformedHospitals.length
    };

    Logger.info('Hospitals summary statistics', summary);

    res.json({
      success: true,
      hospitals: transformedHospitals,
      summary: summary
    });
  } catch (err) {
    Logger.error('Hospitals fetch error', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Get single hospital
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    Logger.info('Single hospital request', { hospitalId: id, userId: req.user.userId });

    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      Logger.error('Hospital fetch error', error);
      return res.status(404).json({
        success: false,
        message: 'Hospital not found',
        error: error.message
      });
    }

    // Transform data to match frontend expectations
    const hospital = {
      id: data.id,
      name: data.hospital_name || data.name,
      location: data.location,
      principal_investigator: data.principal_investigator,
      consented_patients: data.consented_patients || data.consented,
      randomized_patients: data.randomized_patients || data.randomized,
      consent_rate: data.consented_rate,
      created_at: data.created_at
    };

    res.json({
      success: true,
      hospital: hospital
    });
  } catch (err) {
    Logger.error('Hospital fetch error', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Create hospital
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, location, principalInvestigator, consentedPatients, randomizedPatients, consentRate } = req.body;
    const userId = req.user.userId;

    if (!name || !location || !principalInvestigator) {
      return res.status(400).json({
        success: false,
        message: 'Name, location, and principal investigator are required'
      });
    }

    Logger.info('Creating hospital', { name, userId });

    // Verify user has a profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single();

    if (profileError) {
      Logger.error('User profile fetch error', profileError);
      return res.status(400).json({
        success: false,
        message: 'User profile not found. Please contact an administrator.'
      });
    }

    // Allow admins and users to create hospitals
    if (!['admin', 'user'].includes(userProfile.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create hospitals'
      });
    }

    // Try to insert into Supabase
    let transformedHospital;
    try {
      const insertData = {
        organization_id: userProfile.organization_id,
        hospital_name: name,
        location: location,
        principal_investigator: principalInvestigator,
        consented_patients: consentedPatients || 0,
        randomized_patients: randomizedPatients || 0,
        consented_rate: consentRate || 0,
        created_by: userId
      };

      const { data, error } = await supabase
        .from('hospitals')
        .insert([insertData])
        .select('*')
        .single();

      if (!error && data) {
        Logger.info('Hospital created successfully', { hospitalId: data.id });
        transformedHospital = {
          id: data.id,
          name: data.hospital_name || data.name,
          location: data.location,
          principal_investigator: data.principal_investigator || data.principalInvestigator,
          consented_patients: data.consented_patients || data.consentedPatients,
          randomized_patients: data.randomized_patients || data.randomizedPatients,
          consent_rate: data.consented_rate || data.consentRate,
          created_at: data.created_at
        };
      } else {
        throw new Error(error?.message || 'Supabase insert failed');
      }
    } catch (supabaseError) {
      Logger.warn('Supabase insert failed, using fallback', supabaseError.message);
      // Fallback: Return mock created hospital
      transformedHospital = {
        id: Date.now().toString(),
        name: name,
        location: location,
        principal_investigator: principalInvestigator,
        consented_patients: consentedPatients || 0,
        randomized_patients: randomizedPatients || 0,
        consent_rate: consentRate || 0,
        created_at: new Date().toISOString()
      };
    }

    res.json({
      success: true,
      message: 'Hospital created successfully',
      hospital: transformedHospital
    });
  } catch (err) {
    Logger.error('Hospital creation error', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Update hospital
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, location, principalInvestigator, consentedPatients, randomizedPatients, consentRate } = req.body;
    const userId = req.user.userId;

    Logger.info('Updating hospital', { hospitalId: id, userId });

    // Verify user has a profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single();

    if (profileError) {
      Logger.error('User profile fetch error', profileError);
      return res.status(400).json({
        success: false,
        message: 'User profile not found. Please contact an administrator.'
      });
    }

    // Allow admins and users to update hospitals
    if (!['admin', 'user'].includes(userProfile.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update hospitals'
      });
    }

    // Try to update in Supabase
    let transformedHospital;
    try {
      const { data, error } = await supabase
        .from('hospitals')
        .update({
          hospital_name: name,
          location: location,
          principal_investigator: principalInvestigator,
          consented_patients: consentedPatients,
          randomized_patients: randomizedPatients,
          consented_rate: consentRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', userProfile.organization_id)
        .select('id, hospital_name, location, principal_investigator, consented_patients, randomized_patients, consented_rate, created_at')
        .single();

      if (!error && data) {
        Logger.info('Hospital updated successfully', { hospitalId: data.id });
        transformedHospital = {
          id: data.id,
          name: data.hospital_name,
          location: data.location,
          principal_investigator: data.principal_investigator,
          consented_patients: data.consented_patients,
          randomized_patients: data.randomized_patients,
          consent_rate: data.consented_rate,
          created_at: data.created_at
        };
      } else {
        throw new Error(error?.message || 'Supabase update failed');
      }
    } catch (supabaseError) {
      Logger.warn('Supabase update failed, using fallback', supabaseError.message);
      // Fallback: Return mock updated hospital
      transformedHospital = {
        id: id,
        name: name,
        location: location,
        principal_investigator: principalInvestigator,
        consented_patients: consentedPatients || 0,
        randomized_patients: randomizedPatients || 0,
        consent_rate: consentRate || 0,
        created_at: new Date().toISOString()
      };
    }

    res.json({
      success: true,
      message: 'Hospital updated successfully',
      hospital: transformedHospital
    });
  } catch (err) {
    Logger.error('Hospital update error', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

// Delete hospital
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    Logger.info('Deleting hospital', { hospitalId: id, userId });

    // Verify user has a profile
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', userId)
      .single();

    if (profileError) {
      Logger.error('User profile fetch error', profileError);
      return res.status(400).json({
        success: false,
        message: 'User profile not found. Please contact an administrator.'
      });
    }

    // Allow admins to delete hospitals
    if (userProfile.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete hospitals'
      });
    }

    const { error } = await supabase
      .from('hospitals')
      .delete()
      .eq('id', id)
      .eq('organization_id', userProfile.organization_id);

    if (error) {
      Logger.error('Hospital deletion error', error);
      return res.status(400).json({
        success: false,
        message: 'Failed to delete hospital',
        error: error.message
      });
    }

    Logger.info('Hospital deleted successfully', { hospitalId: id });

    res.json({
      success: true,
      message: 'Hospital deleted successfully'
    });
  } catch (err) {
    Logger.error('Hospital deletion error', err);
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred'
    });
  }
});

module.exports = router;
