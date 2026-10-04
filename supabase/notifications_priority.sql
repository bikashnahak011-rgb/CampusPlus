ALTER TABLE public.profiles
  DROP COLUMN IF EXISTS phone_verified_at;

GRANT UPDATE (phone) ON TABLE public.profiles TO authenticated;

ALTER TABLE public.notices
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';

UPDATE public.notices
SET priority = 'important'
WHERE important IS TRUE
  AND priority = 'normal';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'notices_priority_check'
      AND conrelid = 'public.notices'::regclass
  ) THEN
    ALTER TABLE public.notices
      ADD CONSTRAINT notices_priority_check
      CHECK (priority IN ('critical', 'important', 'normal'));
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END
$$;
