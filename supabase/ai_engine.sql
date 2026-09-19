-- CampusPulse AI additive migration.
-- Run after supabase/schema.sql. This does not replace existing tables.

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

CREATE TABLE IF NOT EXISTS attendance_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attendance_percent NUMERIC(5,2) NOT NULL CHECK (attendance_percent BETWEEN 0 AND 100),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS attendance_history_student_date_idx
  ON attendance_history(student_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS complaint_ai_analysis (
  complaint_id TEXT PRIMARY KEY REFERENCES complaints(id) ON DELETE CASCADE,
  ai_category TEXT NOT NULL,
  summary TEXT NOT NULL,
  detected_location TEXT,
  urgency TEXT NOT NULL CHECK (urgency IN ('NORMAL', 'HIGH')),
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  similar_complaint_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  duplicate_of TEXT REFERENCES complaints(id),
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_clusters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  location TEXT,
  report_count INTEGER NOT NULL DEFAULT 0,
  affected_students INTEGER NOT NULL DEFAULT 0,
  severity TEXT NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
  complaint_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mess_demand_forecasts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  forecast_date DATE NOT NULL UNIQUE,
  breakfast INTEGER NOT NULL DEFAULT 0,
  lunch INTEGER NOT NULL DEFAULT 0,
  dinner INTEGER NOT NULL DEFAULT 0,
  confidence TEXT NOT NULL CHECK (confidence IN ('low', 'medium', 'high')),
  uncertainty TEXT,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE attendance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_ai_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE mess_demand_forecasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "students_own_attendance_history" ON attendance_history FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "admins_read_attendance_history" ON attendance_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admins_read_complaint_ai" ON complaint_ai_analysis FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  OR EXISTS (SELECT 1 FROM complaints c WHERE c.id = complaint_id AND c.student_id = auth.uid())
);
CREATE POLICY "admins_manage_clusters" ON complaint_clusters FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "admins_manage_forecasts" ON mess_demand_forecasts FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Optional demo data for the requested scenarios. Replace UUIDs with real profile IDs.
-- INSERT INTO attendance_history(student_id, attendance_percent) VALUES ('student-uuid', 72), ('student-uuid', 68);
-- INSERT INTO complaints(id, student_id, student_name, category, location, description, priority)
-- VALUES
-- ('CMP-205-1', 'student-uuid', 'Demo Student', 'Hostel', 'Room 205', 'No water in room 205', 'High'),
-- ('CMP-205-2', 'student-uuid-2', 'Demo Student 2', 'Hostel', 'Room 205', 'Water supply stopped in 205', 'Medium'),
-- ('CMP-205-3', 'student-uuid-3', 'Demo Student 3', 'Hostel', 'Room 205', 'Bathroom has no water in room 205', 'Medium');
