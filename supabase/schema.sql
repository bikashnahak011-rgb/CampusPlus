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
  employee_id TEXT,
  office TEXT,
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

CREATE TABLE IF NOT EXISTS bus_routes (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  stops TEXT[] NOT NULL DEFAULT '{}',
  departure TEXT NOT NULL DEFAULT 'Not scheduled',
  arrival TEXT NOT NULL DEFAULT 'Not scheduled',
  frequency TEXT NOT NULL DEFAULT 'See timetable',
  status TEXT NOT NULL DEFAULT 'Running today',
  notice TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campus_rooms (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  building TEXT NOT NULL,
  floor TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 0,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Available',
  note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

REVOKE UPDATE ON TABLE profiles FROM authenticated;
GRANT UPDATE (name, phone, avatar_url, roll_no, department, branch, section, gender, year, semester, hostel_block, room_number, designation, employee_id, office)
  ON TABLE profiles TO authenticated;
GRANT SELECT ON TABLE profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE subjects, timetable, attendance, fees TO authenticated;
GRANT SELECT, UPDATE ON TABLE notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE notices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE mess_menu TO authenticated;
GRANT SELECT, INSERT ON TABLE mess_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE bus_routes, campus_rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE hostels, rooms TO authenticated;

-- Profiles: own profile + admins see all
CREATE POLICY "own_profile_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_update" ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
CREATE POLICY "admin_profiles_select" ON profiles FOR SELECT USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "authenticated_read_subjects" ON subjects;
DROP POLICY IF EXISTS "admins_manage_subjects" ON subjects;
CREATE POLICY "authenticated_read_subjects" ON subjects FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_subjects" ON subjects FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "authenticated_read_timetable" ON timetable;
DROP POLICY IF EXISTS "admins_manage_timetable" ON timetable;
CREATE POLICY "authenticated_read_timetable" ON timetable FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_timetable" ON timetable FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Complaints: students own, admins all
CREATE POLICY "student_complaints" ON complaints FOR ALL USING (student_id = auth.uid());
CREATE POLICY "admin_complaints" ON complaints FOR ALL USING (
  public.is_admin()
);

-- Complaint updates: linked to complaint owner or admin
CREATE POLICY "complaint_updates_access" ON complaint_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM complaints WHERE id = complaint_id AND student_id = auth.uid())
  OR public.is_admin()
);

-- Requests: students own, admins all
DROP POLICY IF EXISTS "student_requests" ON requests;
DROP POLICY IF EXISTS "admin_requests" ON requests;
CREATE POLICY "student_requests_select" ON requests FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "student_requests_insert" ON requests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND status = 'Submitted');
CREATE POLICY "admin_requests_select" ON requests FOR SELECT TO authenticated USING (
  public.is_admin()
);
CREATE POLICY "admin_requests_update" ON requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Leave requests: students own, admins all
DROP POLICY IF EXISTS "student_leave" ON leave_requests;
DROP POLICY IF EXISTS "admin_leave" ON leave_requests;
CREATE POLICY "student_leave_select" ON leave_requests FOR SELECT TO authenticated USING (student_id = auth.uid());
CREATE POLICY "student_leave_insert" ON leave_requests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND status = 'Pending');
CREATE POLICY "admin_leave_select" ON leave_requests FOR SELECT TO authenticated USING (
  public.is_admin()
);
CREATE POLICY "admin_leave_update" ON leave_requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Notifications: own only
CREATE POLICY "own_notifications" ON notifications FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "authenticated_read_notices" ON notices;
DROP POLICY IF EXISTS "admins_manage_notices" ON notices;
CREATE POLICY "authenticated_read_notices" ON notices FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_notices" ON notices FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Attendance: students own, admins all
CREATE POLICY "student_attendance" ON attendance FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admin_attendance" ON attendance FOR ALL USING (
  public.is_admin()
);

-- Mess feedback: students own, admins read all
CREATE POLICY "student_feedback_insert" ON mess_feedback FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY "student_feedback_select" ON mess_feedback FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admin_feedback" ON mess_feedback FOR SELECT USING (
  public.is_admin()
);

-- Fees: students own, admins all
CREATE POLICY "student_fees" ON fees FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admin_fees" ON fees FOR ALL USING (
  public.is_admin()
);

DROP POLICY IF EXISTS "authenticated_read_mess_menu" ON mess_menu;
DROP POLICY IF EXISTS "admins_manage_mess_menu" ON mess_menu;
CREATE POLICY "authenticated_read_mess_menu" ON mess_menu FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_mess_menu" ON mess_menu FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "authenticated_read_events" ON events;
DROP POLICY IF EXISTS "admins_manage_events" ON events;
CREATE POLICY "authenticated_read_events" ON events FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_events" ON events FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "authenticated_read_bus_routes" ON bus_routes;
DROP POLICY IF EXISTS "admins_manage_bus_routes" ON bus_routes;
CREATE POLICY "authenticated_read_bus_routes" ON bus_routes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_bus_routes" ON bus_routes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "authenticated_read_campus_rooms" ON campus_rooms;
DROP POLICY IF EXISTS "admins_manage_campus_rooms" ON campus_rooms;
CREATE POLICY "authenticated_read_campus_rooms" ON campus_rooms FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_campus_rooms" ON campus_rooms FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "authenticated_read_hostels" ON hostels;
DROP POLICY IF EXISTS "admins_manage_hostels" ON hostels;
CREATE POLICY "authenticated_read_hostels" ON hostels FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_hostels" ON hostels FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "authenticated_read_rooms" ON rooms;
DROP POLICY IF EXISTS "admins_manage_rooms" ON rooms;
CREATE POLICY "authenticated_read_rooms" ON rooms FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_rooms" ON rooms FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

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
    'student',
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

-- Production tables intentionally start empty; demo records are only in local demo mode.
