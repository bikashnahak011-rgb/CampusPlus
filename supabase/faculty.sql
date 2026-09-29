CREATE TABLE IF NOT EXISTS public.faculty (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name TEXT NOT NULL,
  qualification TEXT NOT NULL,
  classes_taught TEXT[] NOT NULL DEFAULT '{}',
  subjects TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.faculty TO authenticated;

DROP POLICY IF EXISTS "authenticated_read_faculty" ON public.faculty;
CREATE POLICY "authenticated_read_faculty"
  ON public.faculty FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "admins_manage_faculty" ON public.faculty;
CREATE POLICY "admins_manage_faculty"
  ON public.faculty FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'faculty'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.faculty;
  END IF;
END;
$$;
