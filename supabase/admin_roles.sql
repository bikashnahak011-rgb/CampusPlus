-- Run after schema.sql and the existing Supabase hardening/feature migrations.
-- Existing admins become main administrators so their current access is preserved.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_role TEXT,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

UPDATE public.profiles
SET admin_role = CASE
  WHEN role = 'admin' AND admin_role IN (
    'hostel_management',
    'mess_manager',
    'faculty',
    'account_examination',
    'main_administrator'
  ) THEN admin_role
  WHEN role = 'admin' THEN 'main_administrator'
  ELSE NULL
END,
is_active = COALESCE(is_active, TRUE);

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_admin_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_admin_role_check CHECK (
    (role = 'student' AND admin_role IS NULL)
    OR (role = 'admin' AND admin_role IN (
      'hostel_management',
      'mess_manager',
      'faculty',
      'account_examination',
      'main_administrator'
    ))
  );

CREATE INDEX IF NOT EXISTS profiles_admin_role_active_idx
  ON public.profiles (admin_role, is_active) WHERE role = 'admin';

CREATE OR REPLACE FUNCTION public.current_admin_role()
RETURNS TEXT
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p.admin_role
  FROM public.profiles AS p
  WHERE p.id = auth.uid()
    AND p.role = 'admin'
    AND p.is_active = TRUE
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_admin_role(allowed_roles TEXT[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(public.current_admin_role() = ANY(allowed_roles), FALSE);
$$;

-- Existing policies call is_admin(); narrowing it keeps those policies main-admin-only.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT public.has_admin_role(ARRAY['main_administrator']);
$$;

REVOKE ALL ON FUNCTION public.current_admin_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_admin_role(TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.current_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_role(TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Serialize changes to the last active main administrator.
CREATE OR REPLACE FUNCTION public.protect_last_main_administrator()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF OLD.role = 'admin'
    AND OLD.admin_role = 'main_administrator'
    AND OLD.is_active = TRUE
    AND (
      NEW.role <> 'admin'
      OR NEW.admin_role <> 'main_administrator'
      OR NEW.is_active = FALSE
    )
  THEN
    PERFORM pg_advisory_xact_lock(726154392);
    IF NOT EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.id <> OLD.id
        AND p.role = 'admin'
        AND p.admin_role = 'main_administrator'
        AND p.is_active = TRUE
    ) THEN
      RAISE EXCEPTION 'At least one active main administrator must remain';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_last_main_administrator ON public.profiles;
CREATE TRIGGER protect_last_main_administrator
  BEFORE UPDATE OF role, admin_role, is_active ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_last_main_administrator();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hostels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mess_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_rooms ENABLE ROW LEVEL SECURITY;

-- Profile reads are restricted by role. Only the main administrator can see all users.
DROP POLICY IF EXISTS "own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "admin_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "admin_scoped_profiles_select" ON public.profiles;
CREATE POLICY "own_profile_select" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own_profile_update" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "admin_scoped_profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    public.has_admin_role(ARRAY['main_administrator'])
    OR (
      role = 'student'
      AND public.has_admin_role(ARRAY['faculty', 'account_examination'])
    )
    OR (
      role = 'student'
      AND hostel_block IS NOT NULL
      AND public.has_admin_role(ARRAY['hostel_management'])
    )
  );

-- Never let a user self-assign an account role or change account activation.
REVOKE UPDATE ON TABLE public.profiles FROM authenticated;
REVOKE UPDATE (role, admin_role, is_active) ON TABLE public.profiles FROM authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT UPDATE (name, phone, avatar_url, roll_no, department, branch, section, gender, year, semester, hostel_block, room_number, designation, employee_id, office)
  ON TABLE public.profiles TO authenticated;

-- Hostel resources: public read remains available; writes are hostel-management/main-admin only.
DROP POLICY IF EXISTS "admins_manage_hostels" ON public.hostels;
DROP POLICY IF EXISTS "admins_manage_rooms" ON public.rooms;
DROP POLICY IF EXISTS "admin_role_manage_hostels" ON public.hostels;
DROP POLICY IF EXISTS "admin_role_manage_rooms" ON public.rooms;
CREATE POLICY "admin_role_manage_hostels" ON public.hostels
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['hostel_management', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['hostel_management', 'main_administrator']));
CREATE POLICY "admin_role_manage_rooms" ON public.rooms
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['hostel_management', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['hostel_management', 'main_administrator']));

-- Complaints are limited by category/location for specialist administrators.
DROP POLICY IF EXISTS "student_complaints" ON public.complaints;
DROP POLICY IF EXISTS "admin_complaints" ON public.complaints;
DROP POLICY IF EXISTS "role_scoped_complaints" ON public.complaints;
CREATE POLICY "student_complaints" ON public.complaints
  FOR ALL TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());
CREATE POLICY "role_scoped_complaints" ON public.complaints
  FOR ALL TO authenticated
  USING (
    public.has_admin_role(ARRAY['main_administrator'])
    OR (
      public.has_admin_role(ARRAY['hostel_management'])
      AND (
        COALESCE(category, '') ILIKE '%hostel%'
        OR COALESCE(location, '') ILIKE '%hostel%'
        OR COALESCE(department, '') ILIKE '%hostel%'
      )
    )
    OR (
      public.has_admin_role(ARRAY['mess_manager'])
      AND (
        COALESCE(category, '') ILIKE '%mess%'
        OR COALESCE(category, '') ILIKE '%food%'
        OR COALESCE(location, '') ILIKE '%mess%'
        OR COALESCE(department, '') ILIKE '%mess%'
      )
    )
  )
  WITH CHECK (
    public.has_admin_role(ARRAY['main_administrator'])
    OR (
      public.has_admin_role(ARRAY['hostel_management'])
      AND (
        COALESCE(category, '') ILIKE '%hostel%'
        OR COALESCE(location, '') ILIKE '%hostel%'
        OR COALESCE(department, '') ILIKE '%hostel%'
      )
    )
    OR (
      public.has_admin_role(ARRAY['mess_manager'])
      AND (
        COALESCE(category, '') ILIKE '%mess%'
        OR COALESCE(category, '') ILIKE '%food%'
        OR COALESCE(location, '') ILIKE '%mess%'
        OR COALESCE(department, '') ILIKE '%mess%'
      )
    )
  );

DROP POLICY IF EXISTS "complaint_updates_access" ON public.complaint_updates;
DROP POLICY IF EXISTS "role_scoped_complaint_updates" ON public.complaint_updates;
CREATE POLICY "role_scoped_complaint_updates" ON public.complaint_updates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.complaints AS c
      WHERE c.id = complaint_id
        AND (
          c.student_id = auth.uid()
          OR public.has_admin_role(ARRAY['main_administrator'])
          OR (
            public.has_admin_role(ARRAY['hostel_management'])
            AND (
              COALESCE(c.category, '') ILIKE '%hostel%'
              OR COALESCE(c.location, '') ILIKE '%hostel%'
              OR COALESCE(c.department, '') ILIKE '%hostel%'
            )
          )
          OR (
            public.has_admin_role(ARRAY['mess_manager'])
            AND (
              COALESCE(c.category, '') ILIKE '%mess%'
              OR COALESCE(c.category, '') ILIKE '%food%'
              OR COALESCE(c.location, '') ILIKE '%mess%'
              OR COALESCE(c.department, '') ILIKE '%mess%'
            )
          )
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.complaints AS c
      WHERE c.id = complaint_id
        AND (
          c.student_id = auth.uid()
          OR public.has_admin_role(ARRAY['main_administrator'])
          OR (
            public.has_admin_role(ARRAY['hostel_management'])
            AND (
              COALESCE(c.category, '') ILIKE '%hostel%'
              OR COALESCE(c.location, '') ILIKE '%hostel%'
              OR COALESCE(c.department, '') ILIKE '%hostel%'
            )
          )
          OR (
            public.has_admin_role(ARRAY['mess_manager'])
            AND (
              COALESCE(c.category, '') ILIKE '%mess%'
              OR COALESCE(c.category, '') ILIKE '%food%'
              OR COALESCE(c.location, '') ILIKE '%mess%'
              OR COALESCE(c.department, '') ILIKE '%mess%'
            )
          )
        )
    )
  );

-- Mess operations.
DROP POLICY IF EXISTS "admins_manage_mess_menu" ON public.mess_menu;
DROP POLICY IF EXISTS "admin_role_manage_mess_menu" ON public.mess_menu;
CREATE POLICY "admin_role_manage_mess_menu" ON public.mess_menu
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['mess_manager', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['mess_manager', 'main_administrator']));
DROP POLICY IF EXISTS "admin_feedback" ON public.mess_feedback;
DROP POLICY IF EXISTS "admin_role_read_mess_feedback" ON public.mess_feedback;
CREATE POLICY "admin_role_read_mess_feedback" ON public.mess_feedback
  FOR SELECT TO authenticated
  USING (public.has_admin_role(ARRAY['mess_manager', 'main_administrator']));

-- Faculty operations.
DROP POLICY IF EXISTS "admins_manage_subjects" ON public.subjects;
DROP POLICY IF EXISTS "admins_manage_timetable" ON public.timetable;
DROP POLICY IF EXISTS "admin_role_manage_subjects" ON public.subjects;
DROP POLICY IF EXISTS "admin_role_manage_timetable" ON public.timetable;
CREATE POLICY "admin_role_manage_subjects" ON public.subjects
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['faculty', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['faculty', 'main_administrator']));
CREATE POLICY "admin_role_manage_timetable" ON public.timetable
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['faculty', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['faculty', 'main_administrator']));
DROP POLICY IF EXISTS "admin_attendance" ON public.attendance;
DROP POLICY IF EXISTS "admin_role_manage_attendance" ON public.attendance;
CREATE POLICY "admin_role_manage_attendance" ON public.attendance
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['faculty', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['faculty', 'main_administrator']));

-- Examination and finance data.
DROP POLICY IF EXISTS "admin_manage_exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "admin_role_manage_exam_results" ON public.exam_results;
CREATE POLICY "admin_role_manage_exam_results" ON public.exam_results
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['faculty', 'account_examination', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['faculty', 'account_examination', 'main_administrator']));
DROP POLICY IF EXISTS "admin_fees" ON public.fees;
DROP POLICY IF EXISTS "admin_role_manage_fees" ON public.fees;
CREATE POLICY "admin_role_manage_fees" ON public.fees
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['account_examination', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['account_examination', 'main_administrator']));

-- Document, leave, notice, event and transport administration remains main-admin only.
DROP POLICY IF EXISTS "admin_requests_select" ON public.requests;
DROP POLICY IF EXISTS "admin_requests_update" ON public.requests;
DROP POLICY IF EXISTS "admin_leave_select" ON public.leave_requests;
DROP POLICY IF EXISTS "admin_leave_update" ON public.leave_requests;
DROP POLICY IF EXISTS "admins_manage_notices" ON public.notices;
DROP POLICY IF EXISTS "admins_manage_events" ON public.events;
DROP POLICY IF EXISTS "admins_manage_bus_routes" ON public.bus_routes;
DROP POLICY IF EXISTS "admins_manage_campus_rooms" ON public.campus_rooms;
DROP POLICY IF EXISTS "admin_role_manage_notices" ON public.notices;
DROP POLICY IF EXISTS "admin_role_manage_events" ON public.events;
DROP POLICY IF EXISTS "admin_role_manage_bus_routes" ON public.bus_routes;
DROP POLICY IF EXISTS "admin_role_manage_campus_rooms" ON public.campus_rooms;
CREATE POLICY "admin_role_manage_notices" ON public.notices
  FOR ALL TO authenticated USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));
CREATE POLICY "admin_role_manage_events" ON public.events
  FOR ALL TO authenticated USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));
CREATE POLICY "admin_role_manage_bus_routes" ON public.bus_routes
  FOR ALL TO authenticated USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));
CREATE POLICY "admin_role_manage_campus_rooms" ON public.campus_rooms
  FOR ALL TO authenticated USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));
DROP POLICY IF EXISTS "admin_role_manage_requests" ON public.requests;
DROP POLICY IF EXISTS "admin_role_manage_leave" ON public.leave_requests;
CREATE POLICY "admin_role_manage_requests" ON public.requests
  FOR ALL TO authenticated USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));
CREATE POLICY "admin_role_manage_leave" ON public.leave_requests
  FOR ALL TO authenticated USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.hostels, public.rooms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.complaints, public.complaint_updates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mess_menu TO authenticated;
GRANT SELECT, INSERT ON TABLE public.mess_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subjects, public.timetable, public.attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.exam_results, public.fees TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.notices, public.events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bus_routes, public.campus_rooms TO authenticated;
