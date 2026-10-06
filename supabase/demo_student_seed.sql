-- Seed student-scoped demo records for the existing Bikash Nahak profile.
-- Run in the Supabase SQL Editor after schema.sql, production_hardening.sql,
-- academic_resources.sql, and student_scoped_timetable.sql.
-- This does not create an Auth account or seed campus-wide notices/events.

DO $$
DECLARE
  target_email TEXT := 'bikashnahak011@gmail.com';
  v_student_id UUID;
  v_student_name TEXT;
  v_student_department TEXT;
  v_student_branch TEXT;
  v_student_semester INTEGER;
  v_student_section TEXT;
  available_student_emails TEXT;
  demo_day TEXT;
  demo_day_index INTEGER;
  class_index INTEGER;
  demo_subject_id UUID;
  demo_subject_name TEXT;
  demo_faculty TEXT;
  demo_start TIME;
  demo_timetable_id UUID;
BEGIN
  SELECT id, name, department, branch, semester, section
    INTO v_student_id, v_student_name, v_student_department, v_student_branch, v_student_semester, v_student_section
  FROM public.profiles
  WHERE lower(email) = lower(target_email)
    AND role = 'student'
  LIMIT 1;

  IF v_student_id IS NULL THEN
    SELECT string_agg(
      format('%s <%s> [roll: %s]', name, email, COALESCE(roll_no, 'not set')),
      E'\n' ORDER BY name, email
    )
      INTO available_student_emails
    FROM public.profiles
    WHERE role = 'student';

    RAISE EXCEPTION 'No Supabase student profile found for %. Existing student profile emails: %. Set target_email near the top of this script to the account that should receive demo records.',
      target_email, COALESCE(available_student_emails, '(none found)');
  END IF;

  INSERT INTO public.subjects (id, code, name, faculty, department) VALUES
    ('d0000000-0000-4000-8000-000000000001', 'DEMO-CS301', 'Programming in Python', 'Prof. Ramesh Kumar', COALESCE(v_student_department, 'Computer Science')),
    ('d0000000-0000-4000-8000-000000000002', 'DEMO-CS302', 'Database Management', 'Prof. Sunita Rao', COALESCE(v_student_department, 'Computer Science')),
    ('d0000000-0000-4000-8000-000000000003', 'DEMO-CS303', 'Computer Networks', 'Prof. Anil Verma', COALESCE(v_student_department, 'Computer Science')),
    ('d0000000-0000-4000-8000-000000000004', 'DEMO-MA301', 'Mathematics III', 'Prof. Kavita Singh', COALESCE(v_student_department, 'Computer Science')),
    ('d0000000-0000-4000-8000-000000000005', 'DEMO-CS304', 'Software Engineering', 'Prof. Deepak Joshi', COALESCE(v_student_department, 'Computer Science'))
  ON CONFLICT (id) DO UPDATE SET
    code = EXCLUDED.code, name = EXCLUDED.name, faculty = EXCLUDED.faculty,
    department = EXCLUDED.department;

  INSERT INTO public.attendance (student_id, subject_id, total_classes, present_classes) VALUES
    (v_student_id, 'd0000000-0000-4000-8000-000000000001', 52, 45),
    (v_student_id, 'd0000000-0000-4000-8000-000000000002', 50, 39),
    (v_student_id, 'd0000000-0000-4000-8000-000000000003', 48, 40),
    (v_student_id, 'd0000000-0000-4000-8000-000000000004', 45, 41),
    (v_student_id, 'd0000000-0000-4000-8000-000000000005', 40, 35)
  ON CONFLICT (student_id, subject_id) DO UPDATE SET
    total_classes = EXCLUDED.total_classes,
    present_classes = EXCLUDED.present_classes,
    updated_at = NOW();

  -- Personal timetable rows are scoped to this student, so they do not affect
  -- anyone else in the department. Two classes are seeded for every weekday.
  FOREACH demo_day IN ARRAY ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] LOOP
    demo_day_index := array_position(ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], demo_day);
    FOR class_index IN 1..2 LOOP
      demo_subject_id := CASE ((demo_day_index + class_index - 2) % 5)
        WHEN 0 THEN 'd0000000-0000-4000-8000-000000000001'::UUID
        WHEN 1 THEN 'd0000000-0000-4000-8000-000000000002'::UUID
        WHEN 2 THEN 'd0000000-0000-4000-8000-000000000003'::UUID
        WHEN 3 THEN 'd0000000-0000-4000-8000-000000000004'::UUID
        ELSE 'd0000000-0000-4000-8000-000000000005'::UUID
      END;
      SELECT name, faculty INTO demo_subject_name, demo_faculty
        FROM public.subjects WHERE id = demo_subject_id;
      demo_start := CASE class_index WHEN 1 THEN '09:00'::TIME ELSE '11:00'::TIME END;
      demo_timetable_id := uuid_generate_v5(uuid_ns_url(), v_student_id::TEXT || ':demo-timetable:' || demo_day || ':' || class_index::TEXT);

      INSERT INTO public.timetable
        (id, student_id, subject_id, day, time, room, department, course, semester, section,
         subject, faculty_name, day_of_week, start_time, end_time)
      VALUES
        (demo_timetable_id, v_student_id, demo_subject_id, demo_day,
         to_char(demo_start, 'HH24:MI'), 'CS-' || (100 + class_index),
         COALESCE(v_student_department, 'Computer Science'), COALESCE(v_student_branch, 'B.Tech CSE'),
         COALESCE(v_student_semester, 6), v_student_section, demo_subject_name, demo_faculty,
         demo_day, demo_start, demo_start + INTERVAL '1 hour')
      ON CONFLICT (id) DO UPDATE SET
        student_id = EXCLUDED.student_id, subject_id = EXCLUDED.subject_id,
        day = EXCLUDED.day, time = EXCLUDED.time, room = EXCLUDED.room,
        department = EXCLUDED.department, course = EXCLUDED.course,
        semester = EXCLUDED.semester, section = EXCLUDED.section,
        subject = EXCLUDED.subject, faculty_name = EXCLUDED.faculty_name,
        day_of_week = EXCLUDED.day_of_week, start_time = EXCLUDED.start_time,
        end_time = EXCLUDED.end_time;
    END LOOP;
  END LOOP;

  INSERT INTO public.complaints
    (id, student_id, student_name, category, location, description, priority, status, department, assigned_to)
  VALUES
    ('DEMO-CMP-001', v_student_id, v_student_name, 'Water', 'Hostel Block A, Room 203', 'Bathroom tap is dripping and needs repair.', 'Medium', 'Submitted', 'Hostel Maintenance', NULL),
    ('DEMO-CMP-002', v_student_id, v_student_name, 'Internet', 'Computer Science Block, Lab 2', 'Wi-Fi disconnects during online lab sessions.', 'High', 'Assigned', 'IT Support', 'Network Support Team'),
    ('DEMO-CMP-003', v_student_id, v_student_name, 'Cleaning', 'Hostel Block A, Common Area', 'Study lounge needs cleaning after the evening session.', 'Low', 'In Progress', 'Housekeeping', 'Campus Cleaning Team')
  ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id, student_name = EXCLUDED.student_name,
    category = EXCLUDED.category, location = EXCLUDED.location,
    description = EXCLUDED.description, priority = EXCLUDED.priority,
    status = EXCLUDED.status, department = EXCLUDED.department,
    assigned_to = EXCLUDED.assigned_to, updated_at = NOW();

  INSERT INTO public.requests
    (id, student_id, student_name, type, reason, status, admin_comment)
  VALUES
    ('DEMO-REQ-001', v_student_id, v_student_name, 'Bonafide Certificate', 'Internship verification', 'Submitted', ''),
    ('DEMO-REQ-002', v_student_id, v_student_name, 'Fee Receipt', 'Scholarship application', 'Under Review', '')
  ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id, student_name = EXCLUDED.student_name,
    type = EXCLUDED.type, reason = EXCLUDED.reason,
    status = EXCLUDED.status, admin_comment = EXCLUDED.admin_comment,
    updated_at = NOW();

  INSERT INTO public.leave_requests
    (id, student_id, student_name, type, reason, destination, from_date, from_time, to_date, to_time, status, admin_comment)
  VALUES
    ('DEMO-LV-001', v_student_id, v_student_name, 'Gate Pass', 'Visit to campus bookstore', 'City Centre', CURRENT_DATE + 1, '15:00', CURRENT_DATE + 1, '18:00', 'Pending', ''),
    ('DEMO-LV-002', v_student_id, v_student_name, 'Leave', 'Family visit', 'Bhubaneswar', CURRENT_DATE + 7, '09:00', CURRENT_DATE + 9, '19:00', 'Approved', 'Approved. Return by the stated time.')
  ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id, student_name = EXCLUDED.student_name,
    type = EXCLUDED.type, reason = EXCLUDED.reason, destination = EXCLUDED.destination,
    from_date = EXCLUDED.from_date, from_time = EXCLUDED.from_time,
    to_date = EXCLUDED.to_date, to_time = EXCLUDED.to_time,
    status = EXCLUDED.status, admin_comment = EXCLUDED.admin_comment;

  INSERT INTO public.exam_results
    (id, student_id, result_type, result_value, academic_year, semester, published, published_at)
  VALUES
    ('d0000000-0000-4000-8000-000000000101', v_student_id, 'SGPA', 8.60, '2025-2026', 6, TRUE, NOW()),
    ('d0000000-0000-4000-8000-000000000102', v_student_id, 'CGPA', 8.40, '2025-2026', 6, TRUE, NOW()),
    ('d0000000-0000-4000-8000-000000000103', v_student_id, 'SGPA', 8.20, '2024-2025', 5, TRUE, NOW() - INTERVAL '120 days')
  ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id, result_type = EXCLUDED.result_type,
    result_value = EXCLUDED.result_value, academic_year = EXCLUDED.academic_year,
    semester = EXCLUDED.semester, published = EXCLUDED.published,
    published_at = EXCLUDED.published_at;

  INSERT INTO public.fees (id, student_id, description, amount, status, due_date, paid_date) VALUES
    ('d0000000-0000-4000-8000-000000000201', v_student_id, 'Semester 6 Tuition Fee', 35000, 'Pending', CURRENT_DATE + 15, NULL),
    ('d0000000-0000-4000-8000-000000000202', v_student_id, 'Hostel Fee - Semester 6', 18000, 'Paid', CURRENT_DATE - 15, CURRENT_DATE - 18),
    ('d0000000-0000-4000-8000-000000000203', v_student_id, 'Examination Fee', 5000, 'Pending', CURRENT_DATE + 8, NULL)
  ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id, description = EXCLUDED.description,
    amount = EXCLUDED.amount, status = EXCLUDED.status,
    due_date = EXCLUDED.due_date, paid_date = EXCLUDED.paid_date;

  INSERT INTO public.notifications (id, user_id, title, message, type, priority, read, link) VALUES
    ('d0000000-0000-4000-8000-000000000301', v_student_id, 'Demo notice: exam schedule', 'Mid-semester exams begin soon. Check the timetable before exam week.', 'notice', 'important', FALSE, '/student/notifications'),
    ('d0000000-0000-4000-8000-000000000302', v_student_id, 'Demo reminder: fee due', 'Semester 6 tuition fee is due in 15 days.', 'warning', 'normal', FALSE, '/student/fees')
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id, title = EXCLUDED.title,
    message = EXCLUDED.message, type = EXCLUDED.type,
    priority = EXCLUDED.priority, read = EXCLUDED.read, link = EXCLUDED.link;

  INSERT INTO public.mess_feedback (id, student_id, day, rating, comment) VALUES
    ('d0000000-0000-4000-8000-000000000401', v_student_id, 'Monday', 4, 'Fresh breakfast and a good variety at lunch.'),
    ('d0000000-0000-4000-8000-000000000402', v_student_id, 'Tuesday', 5, 'Dinner was excellent today.')
  ON CONFLICT (id) DO UPDATE SET
    student_id = EXCLUDED.student_id, day = EXCLUDED.day,
    rating = EXCLUDED.rating, comment = EXCLUDED.comment;

  RAISE NOTICE 'Demo student records seeded for % (%) in department % / branch %.', v_student_name, target_email, v_student_department, v_student_branch;
END $$;
