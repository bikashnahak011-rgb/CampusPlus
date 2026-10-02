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
