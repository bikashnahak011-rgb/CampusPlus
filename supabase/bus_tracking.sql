CREATE TABLE IF NOT EXISTS public.bus_routes (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  stops TEXT[] NOT NULL DEFAULT '{}',
  departure TEXT NOT NULL DEFAULT 'Not scheduled',
  arrival TEXT NOT NULL DEFAULT 'Not scheduled',
  frequency TEXT NOT NULL DEFAULT 'See timetable',
  status TEXT NOT NULL DEFAULT 'Running today',
  notice TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.bus_routes ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.bus_routes TO authenticated;

DROP POLICY IF EXISTS "authenticated_read_bus_routes" ON public.bus_routes;
CREATE POLICY "authenticated_read_bus_routes" ON public.bus_routes FOR SELECT TO authenticated USING (TRUE);
DROP POLICY IF EXISTS "admins_manage_bus_routes" ON public.bus_routes;
CREATE POLICY "admins_manage_bus_routes" ON public.bus_routes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE IF NOT EXISTS public.bus_locations (
  bus_id TEXT PRIMARY KEY,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  accuracy_m DOUBLE PRECISION CHECK (accuracy_m >= 0),
  is_sharing BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.bus_locations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.bus_locations TO authenticated;

DROP POLICY IF EXISTS "authenticated_read_bus_locations" ON public.bus_locations;
CREATE POLICY "authenticated_read_bus_locations"
  ON public.bus_locations FOR SELECT TO authenticated
  USING (TRUE);

DROP POLICY IF EXISTS "admins_manage_bus_locations" ON public.bus_locations;
CREATE POLICY "admins_manage_bus_locations"
  ON public.bus_locations FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'bus_routes'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_routes;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'campus_rooms'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.campus_rooms;
  END IF;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'bus_locations'
     ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.bus_locations;
  END IF;
END;
$$;