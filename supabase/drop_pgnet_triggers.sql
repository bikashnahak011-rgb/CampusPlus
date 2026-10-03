-- ============================================================
-- PERMANENT FIX: Drop all pg_net / http_post triggers
-- Run this once in Supabase SQL Editor
-- ============================================================

-- Drop triggers on notices table
DROP TRIGGER IF EXISTS on_notice_insert ON public.notices;
DROP TRIGGER IF EXISTS notices_http_trigger ON public.notices;

-- Drop triggers on exam_results table  
DROP TRIGGER IF EXISTS on_exam_result_insert ON public.exam_results;
DROP TRIGGER IF EXISTS exam_results_notification_event ON public.exam_results;
DROP TRIGGER IF EXISTS on_exam_result_published ON public.exam_results;

-- Drop any pg_net trigger functions
DROP FUNCTION IF EXISTS public.notify_via_http() CASCADE;
DROP FUNCTION IF EXISTS extensions.notify_via_http() CASCADE;
DROP FUNCTION IF EXISTS public.http_post_on_insert() CASCADE;

-- Recreate the exam_results notification trigger using plain SQL (no pg_net)
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
