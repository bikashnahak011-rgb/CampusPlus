-- ============================================================
-- CampusOne Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student','admin')),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  roll_no TEXT,
  department TEXT,
  branch TEXT,
  section TEXT,
  gender TEXT,
  year INTEGER,
  semester INTEGER,
  hostel_block TEXT,
  room_number TEXT,
  designation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  faculty TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
  total_classes INTEGER DEFAULT 0,
  present_classes INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, subject_id)
);

-- ============================================================
-- TIMETABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS timetable (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id UUID REFERENCES subjects(id),
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  room TEXT,
  department TEXT
);

-- ============================================================
-- HOSTELS & ROOMS
-- ============================================================
CREATE TABLE IF NOT EXISTS hostels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  block TEXT NOT NULL,
  warden_name TEXT,
  warden_phone TEXT,
  total_rooms INTEGER
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  hostel_id UUID REFERENCES hostels(id),
  room_number TEXT NOT NULL,
  floor INTEGER,
  capacity INTEGER DEFAULT 3
);

-- ============================================================
-- COMPLAINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  student_name TEXT NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High')),
  status TEXT DEFAULT 'Submitted' CHECK (status IN ('Submitted','Assigned','In Progress','Resolved','Closed')),
  department TEXT,
  assigned_to TEXT,
  ai_category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  complaint_id TEXT REFERENCES complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENT REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  student_name TEXT NOT NULL,
  type TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'Submitted',
  admin_comment TEXT,
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- LEAVE REQUESTS & GATE PASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id TEXT PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  student_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Leave','Gate Pass')),
  reason TEXT NOT NULL,
  destination TEXT NOT NULL,
  from_date DATE NOT NULL,
  from_time TIME,
  to_date DATE NOT NULL,
  to_time TIME,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Approved','Rejected')),
  admin_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MESS
-- ============================================================
CREATE TABLE IF NOT EXISTS mess_menu (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day TEXT NOT NULL,
  breakfast TEXT,
  lunch TEXT,
  snacks TEXT,
  dinner TEXT,
  week_start DATE
);

CREATE TABLE IF NOT EXISTS mess_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  day TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FEES
-- ============================================================
CREATE TABLE IF NOT EXISTS fees (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id),
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending','Paid')),
  due_date DATE,
  paid_date DATE
);

-- ============================================================
-- NOTICES
-- ============================================================
CREATE TABLE IF NOT EXISTS notices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT 'All Students',
  important BOOLEAN DEFAULT FALSE,
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- AI INSIGHTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  count INTEGER,
  period TEXT,
  recommendation TEXT,
  category TEXT,
  trend TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: own profile + admins see all
CREATE POLICY "own_profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "admin_profiles_select" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
);

-- Complaints: students own, admins all
CREATE POLICY "student_complaints" ON complaints FOR ALL USING (student_id = auth.uid());
CREATE POLICY "admin_complaints" ON complaints FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Complaint updates: linked to complaint owner or admin
CREATE POLICY "complaint_updates_access" ON complaint_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM complaints WHERE id = complaint_id AND student_id = auth.uid())
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Requests: students own, admins all
CREATE POLICY "student_requests" ON requests FOR ALL USING (student_id = auth.uid());
CREATE POLICY "admin_requests" ON requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Leave: students own, admins all
CREATE POLICY "student_leave" ON leave_requests FOR ALL USING (student_id = auth.uid());
CREATE POLICY "admin_leave" ON leave_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications: own only
CREATE POLICY "own_notifications" ON notifications FOR ALL USING (user_id = auth.uid());

-- Attendance: students own, admins all
CREATE POLICY "student_attendance" ON attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admin_attendance" ON attendance FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Mess feedback: students own, admins read all
CREATE POLICY "student_feedback_insert" ON mess_feedback FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "student_feedback_select" ON mess_feedback FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admin_feedback" ON mess_feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Fees: students own, admins all
CREATE POLICY "student_fees" ON fees FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admin_fees" ON fees FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    COALESCE(NEW.raw_user_meta_data->>'role','student'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SAMPLE SEED DATA (optional - for testing with real Supabase)
-- ============================================================
-- Insert mess menu
INSERT INTO mess_menu (day, breakfast, lunch, snacks, dinner) VALUES
  ('Monday','Idli + Sambar + Coconut Chutney','Rice + Dal + Paneer Butter Masala + Salad','Tea + Biscuits','Roti + Rice + Dal Tadka + Sabzi'),
  ('Tuesday','Poha + Jalebi + Tea','Rice + Rajma + Jeera Aloo + Salad','Coffee + Samosa','Roti + Rice + Chole + Raita'),
  ('Wednesday','Paratha + Curd + Pickle','Rice + Dal + Egg Curry + Salad','Tea + Bread Pakora','Roti + Rice + Mixed Veg + Dal'),
  ('Thursday','Upma + Coconut Chutney + Tea','Rice + Dal + Chicken Curry + Salad','Tea + Vada','Roti + Rice + Palak Paneer + Dal'),
  ('Friday','Dosa + Sambar + Chutney','Rice + Dal + Fish Curry + Salad','Coffee + Pakora','Roti + Rice + Dal Makhani + Sabzi'),
  ('Saturday','Puri + Aloo Sabzi + Tea','Biryani + Raita + Salad','Tea + Cake','Roti + Rice + Paneer Tikka Masala + Dal'),
  ('Sunday','Chole Bhature + Tea','Special Thali (Rice + 3 Sabzi + Dal + Dessert)','Cold Drink + Snacks','Roti + Rice + Butter Chicken/Paneer + Kheer')
ON CONFLICT DO NOTHING;

-- Insert events
INSERT INTO events (title, event_date, type) VALUES
  ('Mid-Semester Exams Begin', NOW() + INTERVAL '5 days', 'academic'),
  ('Annual Sports Day', NOW() + INTERVAL '12 days', 'sports'),
  ('Tech Fest Registration Deadline', NOW() + INTERVAL '8 days', 'cultural'),
  ('Fee Payment Deadline', NOW() + INTERVAL '15 days', 'admin')
ON CONFLICT DO NOTHING;
