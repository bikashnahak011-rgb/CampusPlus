-- Run after schema.sql and admin_roles.sql.
-- Students can save their meal reservations; Mess Management can review and update them.

CREATE TABLE IF NOT EXISTS public.mess_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL DEFAULT 'Student',
  student_roll_no TEXT,
  service_date DATE NOT NULL,
  meal_slot TEXT NOT NULL CHECK (meal_slot IN ('breakfast', 'lunch', 'snacks', 'dinner')),
  meal_description TEXT NOT NULL,
  quantity SMALLINT NOT NULL DEFAULT 1 CHECK (quantity BETWEEN 1 AND 10),
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mess_orders_service_date_idx
  ON public.mess_orders (service_date, meal_slot, created_at DESC);
CREATE INDEX IF NOT EXISTS mess_orders_student_idx
  ON public.mess_orders (student_id, created_at DESC);

ALTER TABLE public.mess_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students_read_own_mess_orders" ON public.mess_orders;
CREATE POLICY "students_read_own_mess_orders" ON public.mess_orders
  FOR SELECT TO authenticated
  USING (
    student_id = auth.uid()
    OR public.has_admin_role(ARRAY['mess_manager', 'main_administrator'])
  );

DROP POLICY IF EXISTS "students_create_own_mess_orders" ON public.mess_orders;
CREATE POLICY "students_create_own_mess_orders" ON public.mess_orders
  FOR INSERT TO authenticated
  WITH CHECK (
    student_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid()
        AND p.role = 'student'
        AND p.is_active = TRUE
    )
  );

DROP POLICY IF EXISTS "mess_staff_update_orders" ON public.mess_orders;
CREATE POLICY "mess_staff_update_orders" ON public.mess_orders
  FOR UPDATE TO authenticated
  USING (public.has_admin_role(ARRAY['mess_manager', 'main_administrator']))
  WITH CHECK (public.has_admin_role(ARRAY['mess_manager', 'main_administrator']));

GRANT SELECT, INSERT, UPDATE ON TABLE public.mess_orders TO authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
    AND NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'mess_orders'
    )
  THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mess_orders;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_mess_order_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_mess_order_updated_at ON public.mess_orders;
CREATE TRIGGER set_mess_order_updated_at
  BEFORE UPDATE ON public.mess_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_mess_order_updated_at();
