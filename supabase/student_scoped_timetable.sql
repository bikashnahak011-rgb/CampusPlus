-- Allows a timetable to contain personal rows without exposing them to every
-- student in the same department. Department-wide timetable rows keep
-- student_id NULL. Run academic_resources.sql first so day_of_week/start_time
-- columns exist before the index is created.
ALTER TABLE public.timetable
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS timetable_student_schedule_idx
  ON public.timetable (student_id, day_of_week, start_time);
