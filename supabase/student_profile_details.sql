-- Apply to existing Supabase projects to support the additional student profile fields.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS father_name TEXT,
  ADD COLUMN IF NOT EXISTS father_mobile TEXT,
  ADD COLUMN IF NOT EXISTS blood_group TEXT,
  ADD COLUMN IF NOT EXISTS tenth_result TEXT,
  ADD COLUMN IF NOT EXISTS twelfth_result TEXT;

GRANT UPDATE (father_name, father_mobile, blood_group, tenth_result, twelfth_result)
  ON TABLE public.profiles TO authenticated;
