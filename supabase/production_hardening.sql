-- Apply after schema.sql on existing Supabase projects.
-- Prevent users from changing their own role and align profile columns with the UI.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS roll_no TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS branch TEXT,
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS year INTEGER,
  ADD COLUMN IF NOT EXISTS semester INTEGER,
  ADD COLUMN IF NOT EXISTS hostel_block TEXT,
  ADD COLUMN IF NOT EXISTS room_number TEXT,
  ADD COLUMN IF NOT EXISTS designation TEXT,
  ADD COLUMN IF NOT EXISTS employee_id TEXT,
  ADD COLUMN IF NOT EXISTS office TEXT;

CREATE TABLE IF NOT EXISTS public.bus_routes (
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

CREATE TABLE IF NOT EXISTS public.campus_rooms (
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

DROP POLICY IF EXISTS "admin_profiles_select" ON public.profiles;
CREATE POLICY "admin_profiles_select" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_admin());

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_subjects" ON public.subjects;
DROP POLICY IF EXISTS "admins_manage_subjects" ON public.subjects;
CREATE POLICY "authenticated_read_subjects" ON public.subjects FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_subjects" ON public.subjects FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_timetable" ON public.timetable;
DROP POLICY IF EXISTS "admins_manage_timetable" ON public.timetable;
CREATE POLICY "authenticated_read_timetable" ON public.timetable FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_timetable" ON public.timetable FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
REVOKE UPDATE (role) ON TABLE public.profiles FROM authenticated;
GRANT UPDATE (name, phone, avatar_url, roll_no, department, branch, section, gender, year, semester, hostel_block, room_number, designation, employee_id, office)
  ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subjects, public.timetable, public.attendance, public.fees TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.notifications TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.requests, public.leave_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notices TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.mess_menu TO authenticated;
GRANT SELECT, INSERT ON TABLE public.mess_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bus_routes, public.campus_rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hostels, public.rooms TO authenticated;

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_notices" ON public.notices;
DROP POLICY IF EXISTS "admins_manage_notices" ON public.notices;
CREATE POLICY "authenticated_read_notices" ON public.notices FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_notices" ON public.notices FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.mess_menu ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_mess_menu" ON public.mess_menu;
DROP POLICY IF EXISTS "admins_manage_mess_menu" ON public.mess_menu;
CREATE POLICY "authenticated_read_mess_menu" ON public.mess_menu FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_mess_menu" ON public.mess_menu FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_events" ON public.events;
DROP POLICY IF EXISTS "admins_manage_events" ON public.events;
CREATE POLICY "authenticated_read_events" ON public.events FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_events" ON public.events FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_bus_routes" ON public.bus_routes;
DROP POLICY IF EXISTS "admins_manage_bus_routes" ON public.bus_routes;
CREATE POLICY "authenticated_read_bus_routes" ON public.bus_routes FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_bus_routes" ON public.bus_routes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.campus_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_campus_rooms" ON public.campus_rooms;
DROP POLICY IF EXISTS "admins_manage_campus_rooms" ON public.campus_rooms;
CREATE POLICY "authenticated_read_campus_rooms" ON public.campus_rooms FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_campus_rooms" ON public.campus_rooms FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_hostels" ON public.hostels;
DROP POLICY IF EXISTS "admins_manage_hostels" ON public.hostels;
CREATE POLICY "authenticated_read_hostels" ON public.hostels FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_hostels" ON public.hostels FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_read_rooms" ON public.rooms;
DROP POLICY IF EXISTS "admins_manage_rooms" ON public.rooms;
CREATE POLICY "authenticated_read_rooms" ON public.rooms FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "admins_manage_rooms" ON public.rooms FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "student_requests" ON public.requests;
DROP POLICY IF EXISTS "admin_requests" ON public.requests;
DROP POLICY IF EXISTS "student_requests_select" ON public.requests;
DROP POLICY IF EXISTS "student_requests_insert" ON public.requests;
DROP POLICY IF EXISTS "admin_requests_select" ON public.requests;
DROP POLICY IF EXISTS "admin_requests_update" ON public.requests;
CREATE POLICY "student_requests_select" ON public.requests FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "student_requests_insert" ON public.requests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND status = 'Submitted');
CREATE POLICY "admin_requests_select" ON public.requests FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "admin_requests_update" ON public.requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "student_leave" ON public.leave_requests;
DROP POLICY IF EXISTS "admin_leave" ON public.leave_requests;
DROP POLICY IF EXISTS "student_leave_select" ON public.leave_requests;
DROP POLICY IF EXISTS "student_leave_insert" ON public.leave_requests;
DROP POLICY IF EXISTS "admin_leave_select" ON public.leave_requests;
DROP POLICY IF EXISTS "admin_leave_update" ON public.leave_requests;
CREATE POLICY "student_leave_select" ON public.leave_requests FOR SELECT TO authenticated
  USING (student_id = auth.uid());
CREATE POLICY "student_leave_insert" ON public.leave_requests FOR INSERT TO authenticated
  WITH CHECK (student_id = auth.uid() AND status = 'Pending');
CREATE POLICY "admin_leave_select" ON public.leave_requests FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "admin_leave_update" ON public.leave_requests FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_complaints" ON public.complaints;
DROP POLICY IF EXISTS "admin_complaints_select" ON public.complaints;
DROP POLICY IF EXISTS "admin_complaints_update" ON public.complaints;
CREATE POLICY "admin_complaints_select" ON public.complaints FOR SELECT TO authenticated
  USING (public.is_admin());
CREATE POLICY "admin_complaints_update" ON public.complaints FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_profiles_attendance" ON public.attendance;
DROP POLICY IF EXISTS "admin_attendance" ON public.attendance;
CREATE POLICY "admin_attendance" ON public.attendance FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_feedback" ON public.mess_feedback;
CREATE POLICY "admin_feedback" ON public.mess_feedback FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "admin_fees" ON public.fees;
CREATE POLICY "admin_fees" ON public.fees FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "own_profile_update" ON public.profiles;
CREATE POLICY "own_profile_update" ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'student',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, public.profiles.name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_request_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  request_label TEXT;
BEGIN
  request_label := CASE WHEN TG_TABLE_NAME = 'requests' THEN 'Document' ELSE NEW.type END;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (NEW.student_id, request_label || ' Request Submitted', 'Your request ' || NEW.id || ' has been submitted.', 'info',
      CASE WHEN TG_TABLE_NAME = 'requests' THEN '/student/documents' ELSE '/student/leave' END);
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (NEW.student_id, request_label || ' ' || NEW.status,
      'Your request ' || NEW.id || ' has been ' || lower(NEW.status) || '.',
      CASE WHEN NEW.status = 'Approved' THEN 'success' ELSE 'warning' END,
      CASE WHEN TG_TABLE_NAME = 'requests' THEN '/student/documents' ELSE '/student/leave' END);
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS requests_notification_event ON public.requests;
CREATE TRIGGER requests_notification_event
  AFTER INSERT OR UPDATE OF status ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_request_changes();

DROP TRIGGER IF EXISTS leave_requests_notification_event ON public.leave_requests;
CREATE TRIGGER leave_requests_notification_event
  AFTER INSERT OR UPDATE OF status ON public.leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.notify_request_changes();

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'requests') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'leave_requests') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notices') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'mess_menu') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mess_menu;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'mess_feedback') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.mess_feedback;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'bus_routes') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_routes;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'campus_rooms') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_rooms;
    END IF;
  END IF;
END;
$$;
