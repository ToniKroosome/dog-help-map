-- ============================================
-- Stray Dog Help Map - Database Schema
-- ============================================

-- Dog reports table
CREATE TABLE dog_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'hungry',
  description TEXT,
  photo_url TEXT,
  dog_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Status update history
CREATE TABLE status_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID REFERENCES dog_reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  status TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User profiles (auto-created on signup)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES auth.users(id) NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_reports_location ON dog_reports(latitude, longitude);
CREATE INDEX idx_reports_status ON dog_reports(status);
CREATE INDEX idx_reports_created ON dog_reports(created_at DESC);
CREATE INDEX idx_status_updates_report ON status_updates(report_id);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE dog_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read reports" ON dog_reports FOR SELECT USING (true);
CREATE POLICY "Public read updates" ON status_updates FOR SELECT USING (true);
CREATE POLICY "Public read profiles" ON profiles FOR SELECT USING (true);

-- Authenticated write
-- Rate limit: max 5 reports per hour per user
CREATE POLICY "Auth insert reports" ON dog_reports FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND (
    SELECT COUNT(*) FROM dog_reports
    WHERE user_id = auth.uid()
    AND created_at > now() - interval '1 hour'
  ) < 5
);
CREATE POLICY "Auth update own reports" ON dog_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Auth delete own reports" ON dog_reports FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Auth insert updates" ON status_updates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Auth manage own profile" ON profiles FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- Triggers
-- ============================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dog_reports_updated_at
  BEFORE UPDATE ON dog_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- Storage bucket for dog photos
-- ============================================
-- Run in Supabase dashboard > Storage:
-- Create bucket: "dog-photos" (public)
