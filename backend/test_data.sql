-- CampusPulse AI demo data.
-- Replace the UUID placeholders with real profile IDs before running.

-- Attendance trend: 78 -> 72 -> 68 should produce a HIGH warning.
INSERT INTO attendance_history (student_id, attendance_percent, recorded_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 78, NOW() - INTERVAL '14 days'),
  ('00000000-0000-0000-0000-000000000001', 72, NOW() - INTERVAL '7 days'),
  ('00000000-0000-0000-0000-000000000001', 68, NOW());

-- Related complaints should produce one Room 205 water incident cluster.
INSERT INTO complaints (id, student_id, student_name, category, location, description, priority, status)
VALUES
  ('CMP-DEMO-205-01', '00000000-0000-0000-0000-000000000001', 'Demo Student', 'Hostel', 'Room 205', 'No water in room 205', 'High', 'Submitted'),
  ('CMP-DEMO-205-02', '00000000-0000-0000-0000-000000000002', 'Demo Student 2', 'Hostel', 'Room 205', 'Water supply stopped in 205', 'Medium', 'Submitted'),
  ('CMP-DEMO-205-03', '00000000-0000-0000-0000-000000000003', 'Demo Student 3', 'Hostel', 'Room 205', 'Bathroom has no water in room 205', 'Medium', 'Submitted')
ON CONFLICT (id) DO NOTHING;
