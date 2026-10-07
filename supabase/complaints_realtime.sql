-- Secure and enable the live complaint workflow after schema.sql has been applied.

ALTER TABLE public.complaints
  ADD COLUMN IF NOT EXISTS student_identifier TEXT,
  ADD COLUMN IF NOT EXISTS submission_method TEXT NOT NULL DEFAULT 'Student App';
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
ALTER TABLE public.complaints
  ADD CONSTRAINT complaints_status_check
  CHECK (status IN ('Pending', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed'));

DROP POLICY IF EXISTS "student_complaints" ON public.complaints;
DROP POLICY IF EXISTS "admin_complaints" ON public.complaints;
DROP POLICY IF EXISTS "admin_complaints_insert" ON public.complaints;
CREATE POLICY "student_complaints_select" ON public.complaints
  FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "student_complaints_insert" ON public.complaints
  FOR INSERT WITH CHECK (student_id = auth.uid() AND status = 'Submitted');
CREATE POLICY "admin_complaints_select" ON public.complaints
  FOR SELECT USING (public.is_admin());
CREATE POLICY "admin_complaints_insert" ON public.complaints
  FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "admin_complaints_update" ON public.complaints
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "complaint_updates_access" ON public.complaint_updates;
CREATE POLICY "complaint_updates_select" ON public.complaint_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.complaints
      WHERE id = complaint_id AND student_id = auth.uid()
    )
    OR public.is_admin()
  );
CREATE POLICY "admin_complaint_updates_insert" ON public.complaint_updates
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

CREATE OR REPLACE FUNCTION public.on_complaint_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.complaint_updates (complaint_id, status, note, updated_by)
    VALUES (
      NEW.id,
      NEW.status,
      CASE WHEN NEW.submission_method = 'Help Desk Assisted'
        THEN 'Help Desk Assisted request submitted by campus staff'
        ELSE 'Complaint submitted by student'
      END,
      NEW.student_id
    );

    IF NEW.student_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        NEW.student_id,
        CASE WHEN NEW.submission_method = 'Help Desk Assisted' THEN 'Help Desk Request Received' ELSE 'Complaint Submitted' END,
        CASE WHEN NEW.submission_method = 'Help Desk Assisted'
          THEN 'Your Help Desk request ' || NEW.id || ' has been submitted.'
          ELSE 'Your complaint ' || NEW.id || ' has been submitted.'
        END,
        'success',
        '/student/complaints'
      );
    END IF;
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.student_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type, link)
      VALUES (
        NEW.student_id,
        'Complaint ' || NEW.status,
        'Your complaint ' || NEW.id || ' is now: ' || NEW.status,
        CASE WHEN NEW.status IN ('Resolved', 'Closed') THEN 'success' ELSE 'info' END,
        '/student/complaints'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS complaint_event ON public.complaints;
CREATE TRIGGER complaint_event
  AFTER INSERT OR UPDATE OF status ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.on_complaint_event();

CREATE OR REPLACE FUNCTION public.update_complaint_status(
  p_complaint_id text,
  p_status text,
  p_note text,
  p_assigned_to text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only campus administrators can update complaints.'
      USING ERRCODE = '42501';
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('Pending', 'Submitted', 'Assigned', 'In Progress', 'Resolved', 'Closed') THEN
    RAISE EXCEPTION 'Invalid complaint status.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.complaints
  SET status = p_status,
      assigned_to = COALESCE(p_assigned_to, assigned_to),
      updated_at = now()
  WHERE id = p_complaint_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Complaint not found.' USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.complaint_updates (complaint_id, status, note, updated_by)
  VALUES (p_complaint_id, p_status, NULLIF(BTRIM(p_note), ''), auth.uid());
END;
$$;

REVOKE ALL ON FUNCTION public.update_complaint_status(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_complaint_status(text, text, text, text) TO authenticated;

ALTER TABLE public.complaints REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'complaints'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;
  END IF;
END;
$$;
