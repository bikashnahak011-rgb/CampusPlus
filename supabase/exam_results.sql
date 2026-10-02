CREATE TABLE IF NOT EXISTS public.exam_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  result_type TEXT NOT NULL CHECK (result_type IN ('SGPA', 'CGPA')),
  result_value NUMERIC(3,2) NOT NULL CHECK (result_value BETWEEN 0 AND 10),
  academic_year TEXT NOT NULL,
  semester INTEGER NOT NULL CHECK (semester BETWEEN 1 AND 12),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS result_type TEXT;
ALTER TABLE public.exam_results ADD COLUMN IF NOT EXISTS result_value NUMERIC(3,2);

DO $$
DECLARE
  legacy_column TEXT;
BEGIN
  FOREACH legacy_column IN ARRAY ARRAY['exam_name', 'subject', 'marks_obtained', 'max_marks'] LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'exam_results'
        AND column_name = legacy_column
    ) THEN
      EXECUTE format('ALTER TABLE public.exam_results ALTER COLUMN %I DROP NOT NULL', legacy_column);
    END IF;
  END LOOP;
END;
$$;

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.exam_results TO authenticated;
DROP POLICY IF EXISTS "student_published_exam_results" ON public.exam_results;
DROP POLICY IF EXISTS "admin_manage_exam_results" ON public.exam_results;
CREATE POLICY "student_published_exam_results" ON public.exam_results FOR SELECT TO authenticated
  USING (student_id = auth.uid() AND published = TRUE);
CREATE POLICY "admin_manage_exam_results" ON public.exam_results FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE OR REPLACE FUNCTION public.notify_exam_result_published()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.published AND (TG_OP = 'INSERT' OR OLD.published IS DISTINCT FROM NEW.published) THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.student_id,
      'Exam result published',
      'Your ' || NEW.result_type || ' (' || to_char(NEW.result_value, 'FM990.00') || ') is published for semester ' || NEW.semester || '.',
      'exam_result',
      '/student/results'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS exam_results_notification_event ON public.exam_results;
CREATE TRIGGER exam_results_notification_event
  AFTER INSERT OR UPDATE OF published ON public.exam_results
  FOR EACH ROW EXECUTE FUNCTION public.notify_exam_result_published();

NOTIFY pgrst, 'reload schema';