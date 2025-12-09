const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// For deployment on Render, allow the server to start even without Supabase credentials
// The API will return mock data if Supabase is not available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Missing Supabase environment variables. API will return mock data.');
}

// Create client with anon key for regular operations (only if credentials are available)
let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Create admin client with service role key for admin operations
let supabaseAdmin = null;
if (supabaseServiceKey && supabaseUrl) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

module.exports = { supabase, supabaseAdmin };