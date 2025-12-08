-- KachinaHealth Client Portal Database Setup
-- Run this complete script in your Supabase SQL editor
-- This creates all tables, policies, triggers, and sample data

-- ==================================================
-- EXTENSIONS
-- ==================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================================================
-- HELPER FUNCTIONS
-- ==================================================

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ==================================================
-- CORE APPLICATION TABLES
-- ==================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  site TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS policies for users
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert users" ON users
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update users" ON users
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete users" ON users
  FOR DELETE USING (auth.role() = 'authenticated');

-- News items table
CREATE TABLE IF NOT EXISTS news_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for news_items
CREATE TRIGGER update_news_items_updated_at
    BEFORE UPDATE ON news_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for news_items
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for news_items
CREATE POLICY "Users can view all news items" ON news_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert news items" ON news_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update news items" ON news_items
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete news items" ON news_items
  FOR DELETE USING (auth.role() = 'authenticated');

-- Hospitals table
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  consented INTEGER DEFAULT 0,
  randomized INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for hospitals
CREATE TRIGGER update_hospitals_updated_at
    BEFORE UPDATE ON hospitals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for hospitals
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;

-- RLS policies for hospitals
CREATE POLICY "Users can view all hospitals" ON hospitals
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert hospitals" ON hospitals
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update hospitals" ON hospitals
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete hospitals" ON hospitals
  FOR DELETE USING (auth.role() = 'authenticated');

-- Training Materials table
CREATE TABLE IF NOT EXISTS training_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'pdf', 'video')),
  content TEXT, -- For text content or file URL/path
  category TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for training_materials
CREATE TRIGGER update_training_materials_updated_at
    BEFORE UPDATE ON training_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for training_materials
ALTER TABLE training_materials ENABLE ROW LEVEL SECURITY;

-- RLS policies for training_materials
CREATE POLICY "Users can view all training materials" ON training_materials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert training materials" ON training_materials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update training materials" ON training_materials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete training materials" ON training_materials
  FOR DELETE USING (auth.role() = 'authenticated');

-- Study Protocols table
CREATE TABLE IF NOT EXISTS study_protocols (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('text', 'pdf')),
  content TEXT, -- For text content or file URL/path
  version TEXT DEFAULT '1.0',
  created_by UUID REFERENCES auth.users(id),
  created_by_name TEXT,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for study_protocols
CREATE TRIGGER update_study_protocols_updated_at
    BEFORE UPDATE ON study_protocols
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for study_protocols
ALTER TABLE study_protocols ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_protocols
CREATE POLICY "Users can view all study protocols" ON study_protocols
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert study protocols" ON study_protocols
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update study protocols" ON study_protocols
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete study protocols" ON study_protocols
  FOR DELETE USING (auth.role() = 'authenticated');

-- Clinical Trials table
CREATE TABLE IF NOT EXISTS clinical_trials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trial_name TEXT NOT NULL,
  sponsor TEXT,
  phase TEXT CHECK (phase IN ('Phase 1', 'Phase 2', 'Phase 3', 'Phase 4')),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Completed', 'Terminated', 'Recruiting', 'Suspended')),
  start_date DATE,
  end_date DATE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for clinical_trials
CREATE TRIGGER update_clinical_trials_updated_at
    BEFORE UPDATE ON clinical_trials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for clinical_trials
ALTER TABLE clinical_trials ENABLE ROW LEVEL SECURITY;

-- RLS policies for clinical_trials
CREATE POLICY "Users can view all clinical trials" ON clinical_trials
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert clinical trials" ON clinical_trials
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update clinical trials" ON clinical_trials
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete clinical trials" ON clinical_trials
  FOR DELETE USING (auth.role() = 'authenticated');


-- User Analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for user_analytics
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_analytics
CREATE POLICY "Users can view their own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON user_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- App Settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB,
  description TEXT,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for app_settings
CREATE TRIGGER update_app_settings_updated_at
    BEFORE UPDATE ON app_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for app_settings
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for app_settings
CREATE POLICY "Users can view all app settings" ON app_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify app settings" ON app_settings
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
-- Profiles table (for user display information)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for profiles
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Updated_at trigger for messages
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for messages
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages they send" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update messages they sent" ON messages
  FOR UPDATE USING (auth.uid() = sender_id);


-- ==================================================
-- COMPLETION MESSAGE
-- ==================================================

-- Display completion message
DO $$
BEGIN
    RAISE NOTICE '=========================================';
    RAISE NOTICE 'KachinaHealth Database Setup Complete!';
    RAISE NOTICE '=========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Created:';
    RAISE NOTICE '- users (% rows)', (SELECT COUNT(*) FROM users);
    RAISE NOTICE '- news_items (% rows)', (SELECT COUNT(*) FROM news_items);
    RAISE NOTICE '- hospitals (% rows)', (SELECT COUNT(*) FROM hospitals);
    RAISE NOTICE '- training_materials (% rows)', (SELECT COUNT(*) FROM training_materials);
    RAISE NOTICE '- study_protocols (% rows)', (SELECT COUNT(*) FROM study_protocols);
    RAISE NOTICE '- clinical_trials (% rows)', (SELECT COUNT(*) FROM clinical_trials);
    RAISE NOTICE '- pdf_documents (% rows)', (SELECT COUNT(*) FROM pdf_documents);
    RAISE NOTICE '- app_settings (% rows)', (SELECT COUNT(*) FROM app_settings);
    RAISE NOTICE '';
    RAISE NOTICE 'All tables have Row Level Security enabled.';
    RAISE NOTICE 'Sample data has been inserted for testing.';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Configure authentication in Supabase Dashboard';
    RAISE NOTICE '2. Test the application with admin@kachinahealth.com';
    RAISE NOTICE '3. Review and adjust RLS policies as needed';
    RAISE NOTICE '';
    RAISE NOTICE '=========================================';
END $$;
