-- Run after schema.sql, production_hardening.sql, and admin_roles.sql.
-- All changes are additive; existing timetable data is retained and backfilled.

CREATE TABLE IF NOT EXISTS public.faculty_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  department TEXT NOT NULL,
  course TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 12),
  subject TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (faculty_id, department, course, semester, subject)
);

CREATE INDEX IF NOT EXISTS faculty_subjects_faculty_idx
  ON public.faculty_subjects (faculty_id, department, semester);

CREATE TABLE IF NOT EXISTS public.academic_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('syllabus', 'pyq', 'class_material')),
  department TEXT NOT NULL,
  course TEXT,
  semester INTEGER CHECK (semester BETWEEN 1 AND 12),
  subject TEXT,
  academic_year TEXT,
  faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  faculty_name TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  link_url TEXT CHECK (link_url IS NULL OR link_url ~* '^https?://'),
  question_year INTEGER CHECK (question_year IS NULL OR question_year BETWEEN 1900 AND 2200),
  examination_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  CONSTRAINT academic_resources_content_check CHECK (
    file_url IS NOT NULL
    OR link_url IS NOT NULL
    OR (resource_type = 'class_material' AND file_type = 'note')
  )
);

ALTER TABLE public.academic_resources
  DROP CONSTRAINT IF EXISTS academic_resources_resource_type_check,
  DROP CONSTRAINT IF EXISTS academic_resources_type_check;
ALTER TABLE public.academic_resources
  ADD CONSTRAINT academic_resources_type_check
  CHECK (resource_type IN ('syllabus', 'pyq', 'class_material', 'assignment'));
ALTER TABLE public.academic_resources
  DROP CONSTRAINT IF EXISTS academic_resources_assignment_pdf_check;
ALTER TABLE public.academic_resources
  ADD CONSTRAINT academic_resources_assignment_pdf_check CHECK (
    resource_type <> 'assignment'
    OR (
      file_url IS NOT NULL
      AND COALESCE(
        file_name ILIKE '%.pdf' AND lower(file_type) IN ('application/pdf', 'pdf'),
        FALSE
      )
    )
  );

CREATE INDEX IF NOT EXISTS academic_resources_catalog_idx
  ON public.academic_resources (resource_type, status, department, semester, subject, created_at DESC);
CREATE INDEX IF NOT EXISTS academic_resources_uploader_idx
  ON public.academic_resources (uploaded_by, faculty_id);

-- Extend the existing timetable table without replacing its legacy columns.
ALTER TABLE public.timetable
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS course TEXT,
  ADD COLUMN IF NOT EXISTS semester INTEGER CHECK (semester BETWEEN 1 AND 12),
  ADD COLUMN IF NOT EXISTS section TEXT,
  ADD COLUMN IF NOT EXISTS subject TEXT,
  ADD COLUMN IF NOT EXISTS faculty_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS faculty_name TEXT,
  ADD COLUMN IF NOT EXISTS room TEXT,
  ADD COLUMN IF NOT EXISTS day_of_week TEXT,
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME,
  ADD COLUMN IF NOT EXISTS academic_year TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'timetable' AND column_name = 'day'
  ) THEN
    EXECUTE 'UPDATE public.timetable SET day_of_week = day WHERE day_of_week IS NULL';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'timetable' AND column_name = 'time'
  ) THEN
    EXECUTE $sql$
      UPDATE public.timetable
      SET start_time = CASE
        WHEN substring(time FROM '^[0-9]{1,2}:[0-9]{2} ?[APap][Mm]') IS NOT NULL
          THEN to_timestamp(upper(substring(time FROM '^[0-9]{1,2}:[0-9]{2} ?[APap][Mm]')), 'HH12:MI AM')::time
        ELSE substring(time FROM '^[0-9]{1,2}:[0-9]{2}')::time
      END
      WHERE start_time IS NULL
        AND substring(time FROM '^[0-9]{1,2}:[0-9]{2}') IS NOT NULL
    $sql$;
  END IF;
END;
$$;

UPDATE public.timetable AS t
SET subject = s.name
FROM public.subjects AS s
WHERE t.subject IS NULL AND t.subject_id = s.id;

UPDATE public.timetable
SET end_time = start_time + INTERVAL '1 hour'
WHERE start_time IS NOT NULL AND end_time IS NULL;

ALTER TABLE public.timetable
  DROP CONSTRAINT IF EXISTS timetable_time_range_check;
ALTER TABLE public.timetable
  ADD CONSTRAINT timetable_time_range_check
  CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time);

CREATE OR REPLACE FUNCTION public.academic_faculty_can_manage(
  p_department TEXT,
  p_course TEXT,
  p_semester INTEGER,
  p_subject TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.faculty_subjects AS fs
    WHERE fs.faculty_id = auth.uid()
      AND fs.department = p_department
      AND fs.course IS NOT DISTINCT FROM p_course
      AND fs.semester = p_semester
      AND lower(fs.subject) = lower(p_subject)
  );
$$;

REVOKE ALL ON FUNCTION public.academic_faculty_can_manage(TEXT, TEXT, INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.academic_faculty_can_manage(TEXT, TEXT, INTEGER, TEXT) TO authenticated;

ALTER TABLE public.faculty_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faculty_subjects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academic_resources TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.timetable TO authenticated;

DROP POLICY IF EXISTS "academic_faculty_subjects_read" ON public.faculty_subjects;
DROP POLICY IF EXISTS "academic_main_admin_manage_faculty_subjects" ON public.faculty_subjects;
CREATE POLICY "academic_faculty_subjects_read" ON public.faculty_subjects
  FOR SELECT TO authenticated
  USING (
    faculty_id = auth.uid()
    OR public.has_admin_role(ARRAY['main_administrator'])
  );
CREATE POLICY "academic_main_admin_manage_faculty_subjects" ON public.faculty_subjects
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));

DROP POLICY IF EXISTS "academic_resources_read" ON public.academic_resources;
DROP POLICY IF EXISTS "academic_resources_faculty_insert" ON public.academic_resources;
DROP POLICY IF EXISTS "academic_resources_faculty_update" ON public.academic_resources;
DROP POLICY IF EXISTS "academic_resources_faculty_delete" ON public.academic_resources;
DROP POLICY IF EXISTS "academic_resources_main_admin_manage" ON public.academic_resources;
CREATE POLICY "academic_resources_read" ON public.academic_resources
  FOR SELECT TO authenticated
  USING (
    status = 'approved'
    OR uploaded_by = auth.uid()
    OR public.has_admin_role(ARRAY['main_administrator'])
  );
CREATE POLICY "academic_resources_faculty_insert" ON public.academic_resources
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_admin_role(ARRAY['faculty'])
    AND uploaded_by = auth.uid()
    AND faculty_id = auth.uid()
    AND status = 'pending'
    AND public.academic_faculty_can_manage(department, course, semester, subject)
  );
CREATE POLICY "academic_resources_faculty_update" ON public.academic_resources
  FOR UPDATE TO authenticated
  USING (
    public.has_admin_role(ARRAY['faculty'])
    AND uploaded_by = auth.uid()
    AND faculty_id = auth.uid()
    AND public.academic_faculty_can_manage(department, course, semester, subject)
  )
  WITH CHECK (
    public.has_admin_role(ARRAY['faculty'])
    AND uploaded_by = auth.uid()
    AND faculty_id = auth.uid()
    AND status = 'pending'
    AND public.academic_faculty_can_manage(department, course, semester, subject)
  );
CREATE POLICY "academic_resources_faculty_delete" ON public.academic_resources
  FOR DELETE TO authenticated
  USING (
    public.has_admin_role(ARRAY['faculty'])
    AND uploaded_by = auth.uid()
    AND faculty_id = auth.uid()
    AND public.academic_faculty_can_manage(department, course, semester, subject)
  );
CREATE POLICY "academic_resources_main_admin_manage" ON public.academic_resources
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));

-- Remove the legacy unrestricted timetable read policy before installing scoped access.
DROP POLICY IF EXISTS "authenticated_read_timetable" ON public.timetable;
DROP POLICY IF EXISTS "admins_manage_timetable" ON public.timetable;
DROP POLICY IF EXISTS "admin_role_manage_timetable" ON public.timetable;
DROP POLICY IF EXISTS "academic_timetable_read" ON public.timetable;
DROP POLICY IF EXISTS "academic_timetable_faculty_insert" ON public.timetable;
DROP POLICY IF EXISTS "academic_timetable_faculty_update" ON public.timetable;
DROP POLICY IF EXISTS "academic_timetable_faculty_delete" ON public.timetable;
DROP POLICY IF EXISTS "academic_timetable_main_admin_manage" ON public.timetable;
CREATE POLICY "academic_timetable_read" ON public.timetable
  FOR SELECT TO authenticated
  USING (
    public.has_admin_role(ARRAY['main_administrator'])
    OR (
      public.has_admin_role(ARRAY['faculty'])
      AND (
        faculty_id = auth.uid()
        OR public.academic_faculty_can_manage(department, course, semester, subject)
      )
    )
    OR EXISTS (
      SELECT 1
      FROM public.profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'student'
        AND p.is_active = TRUE
        AND p.department = timetable.department
        AND (timetable.semester IS NULL OR timetable.semester = p.semester)
        AND (timetable.section IS NULL OR timetable.section = p.section)
    )
  );
CREATE POLICY "academic_timetable_faculty_insert" ON public.timetable
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_admin_role(ARRAY['faculty'])
    AND faculty_id = auth.uid()
    AND public.academic_faculty_can_manage(department, course, semester, subject)
  );
CREATE POLICY "academic_timetable_faculty_update" ON public.timetable
  FOR UPDATE TO authenticated
  USING (
    public.has_admin_role(ARRAY['faculty'])
    AND faculty_id = auth.uid()
    AND public.academic_faculty_can_manage(department, course, semester, subject)
  )
  WITH CHECK (
    public.has_admin_role(ARRAY['faculty'])
    AND faculty_id = auth.uid()
    AND public.academic_faculty_can_manage(department, course, semester, subject)
  );
CREATE POLICY "academic_timetable_faculty_delete" ON public.timetable
  FOR DELETE TO authenticated
  USING (
    public.has_admin_role(ARRAY['faculty'])
    AND faculty_id = auth.uid()
    AND public.academic_faculty_can_manage(department, course, semester, subject)
  );
CREATE POLICY "academic_timetable_main_admin_manage" ON public.timetable
  FOR ALL TO authenticated
  USING (public.has_admin_role(ARRAY['main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['main_administrator']));

-- Private bucket: users can only download approved resources; upload paths are
-- academic-resources/<resource-type>/<uploader-id>/<file-name>.
INSERT INTO storage.buckets (id, name, public)
VALUES ('academic-resources', 'academic-resources', FALSE)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "academic_storage_read" ON storage.objects;
DROP POLICY IF EXISTS "academic_storage_upload" ON storage.objects;
DROP POLICY IF EXISTS "academic_storage_delete" ON storage.objects;
CREATE POLICY "academic_storage_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'academic-resources'
    AND (
      public.has_admin_role(ARRAY['main_administrator'])
      OR (
        public.has_admin_role(ARRAY['faculty'])
        AND (storage.foldername(name))[2] = auth.uid()::text
      )
      OR EXISTS (
        SELECT 1 FROM public.academic_resources AS r
        WHERE r.file_url = storage.objects.name
          AND r.status = 'approved'
      )
    )
  );
CREATE POLICY "academic_storage_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'academic-resources'
    AND (
      public.has_admin_role(ARRAY['main_administrator'])
      OR (
        public.has_admin_role(ARRAY['faculty'])
        AND (storage.foldername(name))[1] IN ('syllabus', 'pyq', 'class_material', 'assignment')
        AND (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );
CREATE POLICY "academic_storage_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'academic-resources'
    AND (
      public.has_admin_role(ARRAY['main_administrator'])
      OR (
        public.has_admin_role(ARRAY['faculty'])
        AND (storage.foldername(name))[2] = auth.uid()::text
      )
    )
  );
