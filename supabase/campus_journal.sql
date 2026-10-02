CREATE TABLE IF NOT EXISTS public.campus_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 160),
  summary TEXT NOT NULL CHECK (char_length(summary) BETWEEN 10 AND 320),
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 20 AND 12000),
  category TEXT NOT NULL CHECK (category IN (
    'Campus News',
    'Student Achievements',
    'Placements & Internships',
    'Faculty Highlights',
    'Student Publications',
    'Faculty Publications'
  )),
  subcategory TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'rejected')),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (category = 'Student Publications' AND subcategory IN ('Books', 'Magazines', 'Articles', 'Poems', 'Stories'))
    OR (category = 'Faculty Publications' AND subcategory IN ('Books', 'Research', 'Articles', 'Magazines'))
    OR (category NOT IN ('Student Publications', 'Faculty Publications') AND subcategory IS NULL)
  ),
  CHECK (NOT is_featured OR status = 'published')
);

ALTER TABLE public.campus_journal ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.campus_journal TO authenticated;

DROP POLICY IF EXISTS "campus_journal_read_published_or_own" ON public.campus_journal;
CREATE POLICY "campus_journal_read_published_or_own"
  ON public.campus_journal FOR SELECT TO authenticated
  USING (status = 'published' OR student_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "students_submit_campus_journal" ON public.campus_journal;
CREATE POLICY "students_submit_campus_journal"
  ON public.campus_journal FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND status = 'pending'
    AND NOT is_featured
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
  );

DROP POLICY IF EXISTS "admins_manage_campus_journal" ON public.campus_journal;
CREATE POLICY "admins_manage_campus_journal"
  ON public.campus_journal FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS campus_journal_status_created_idx
  ON public.campus_journal(status, created_at DESC);
CREATE INDEX IF NOT EXISTS campus_journal_featured_created_idx
  ON public.campus_journal(is_featured, created_at DESC)
  WHERE status = 'published';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'campus_journal'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_journal;
  END IF;
END;
$$;