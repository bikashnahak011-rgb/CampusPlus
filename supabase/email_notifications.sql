CREATE TABLE IF NOT EXISTS public.notification_email_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL UNIQUE REFERENCES public.notifications(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'skipped')),
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS notification_email_queue_pending_idx
  ON public.notification_email_queue(status, created_at)
  WHERE status IN ('pending', 'sending');

ALTER TABLE public.notification_email_queue ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.notification_email_queue FROM anon, authenticated;
GRANT ALL ON TABLE public.notification_email_queue TO service_role;

CREATE OR REPLACE FUNCTION public.enqueue_notification_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_email_queue (notification_id)
  VALUES (NEW.id)
  ON CONFLICT (notification_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notifications_email_queue_event ON public.notifications;
CREATE TRIGGER notifications_email_queue_event
  AFTER INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.enqueue_notification_email();

CREATE OR REPLACE FUNCTION public.notify_students_of_notice()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, priority, link)
  SELECT
    profiles.id,
    NEW.title,
    NEW.content,
    'notice',
    CASE WHEN NEW.important THEN 'high' ELSE 'normal' END,
    '/student/notifications'
  FROM public.profiles AS profiles
  WHERE profiles.role = 'student'
    AND CASE
      WHEN NEW.target = 'All Students' THEN TRUE
      WHEN NEW.target = 'Computer Science' THEN
        concat_ws(' ', profiles.department, profiles.branch) ~* '(computer|(^|[^a-z])cse([^a-z]|$)|(^|[^a-z])cs([^a-z]|$)|information technology)'
      WHEN NEW.target = 'Mechanical Engg' THEN
        concat_ws(' ', profiles.department, profiles.branch) ~* '(mechanical|(^|[^a-z])mech([^a-z]|$))'
      WHEN NEW.target = 'Electronics' THEN
        concat_ws(' ', profiles.department, profiles.branch) ~* '(electronics|(^|[^a-z])ece([^a-z]|$)|electrical)'
      WHEN NEW.target ~ '^Year [0-9]+$' THEN
        profiles.year = substring(NEW.target FROM '^Year ([0-9]+)$')::INTEGER
      WHEN NEW.target = 'Hostel' THEN
        NULLIF(profiles.hostel_block, '') IS NOT NULL
      WHEN NEW.target = 'Day Scholars' THEN
        NULLIF(profiles.hostel_block, '') IS NULL
      ELSE FALSE
    END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notices_notification_event ON public.notices;
CREATE TRIGGER notices_notification_event
  AFTER INSERT ON public.notices
  FOR EACH ROW EXECUTE FUNCTION public.notify_students_of_notice();

CREATE OR REPLACE FUNCTION public.notify_campus_journal_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('published', 'rejected') THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    VALUES (
      NEW.student_id,
      CASE WHEN NEW.status = 'published' THEN 'Journal submission published' ELSE 'Journal submission reviewed' END,
      CASE WHEN NEW.status = 'published'
        THEN 'Your journal submission "' || NEW.title || '" has been published.'
        ELSE 'Your journal submission "' || NEW.title || '" was not approved for publication.'
      END,
      CASE WHEN NEW.status = 'published' THEN 'success' ELSE 'warning' END,
      '/student/notifications'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS campus_journal_review_notification_event ON public.campus_journal;
CREATE TRIGGER campus_journal_review_notification_event
  AFTER UPDATE OF status ON public.campus_journal
  FOR EACH ROW EXECUTE FUNCTION public.notify_campus_journal_review();
