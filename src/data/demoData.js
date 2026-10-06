import rameshPortrait from '../assets/faculty/ramesh.jpg'
import sunitaPortrait from '../assets/faculty/sunita.jpg'
import anilPortrait from '../assets/faculty/anil.jpg'
import kavitaPortrait from '../assets/faculty/kavita.jpg'
import deepakPortrait from '../assets/faculty/deepak.jpg'
import { ADMIN_ROLES } from '../lib/adminRoles.js'

export const DEMO_STUDENT = {
  id: 'stu-001', email: 'student@campusone.demo', role: 'student',
  name: 'Arjun Sharma', roll_no: 'CS2021047', department: 'Computer Science',
  branch: 'B.Tech CSE', section: 'A', gender: 'Male',
  year: 3, semester: 6, phone: '9876543210', hostel_block: 'A', room_number: '203',
  avatar_url: null,
}
export const DEMO_ADMIN = {
  id: 'adm-001', email: 'admin@campusone.demo', role: 'admin',
  name: 'Dr. Priya Mehta', designation: 'Campus Administrator',
}

export const DEMO_SUBJECTS = [
  { id: 's1', name: 'Programming in Python', code: 'CS301', total: 52, present: 45, faculty: 'Prof. Ramesh Kumar' },
  { id: 's2', name: 'Database Management', code: 'CS302', total: 50, present: 39, faculty: 'Prof. Sunita Rao' },
  { id: 's3', name: 'Computer Networks', code: 'CS303', total: 48, present: 40, faculty: 'Prof. Anil Verma' },
  { id: 's4', name: 'Mathematics III', code: 'MA301', total: 45, present: 41, faculty: 'Prof. Kavita Singh' },
  { id: 's5', name: 'Software Engineering', code: 'CS304', total: 40, present: 35, faculty: 'Prof. Deepak Joshi' },
]

export const INITIAL_FACULTY = [
  { id: 'faculty-001', name: 'Prof. Ramesh Kumar', qualification: 'M.Tech, Ph.D.', classes_taught: ['B.Tech CSE - Year 3'], subjects: ['Programming in Python'], avatar_url: rameshPortrait },
  { id: 'faculty-002', name: 'Prof. Sunita Rao', qualification: 'M.Tech', classes_taught: ['B.Tech CSE - Year 3'], subjects: ['Database Management'], avatar_url: sunitaPortrait },
  { id: 'faculty-003', name: 'Prof. Anil Verma', qualification: 'M.E.', classes_taught: ['B.Tech CSE - Year 3'], subjects: ['Computer Networks'], avatar_url: anilPortrait },
  { id: 'faculty-004', name: 'Prof. Kavita Singh', qualification: 'M.Sc., Ph.D.', classes_taught: ['B.Tech CSE - Year 3'], subjects: ['Mathematics III'], avatar_url: kavitaPortrait },
  { id: 'faculty-005', name: 'Prof. Deepak Joshi', qualification: 'M.Tech', classes_taught: ['B.Tech CSE - Year 3'], subjects: ['Software Engineering'], avatar_url: deepakPortrait },
]

export const DEMO_TIMETABLE = [
  { id: 't1', day: 'Monday', time: '09:00', subject: 'Programming in Python', room: 'CS-101', faculty: 'Prof. Ramesh Kumar' },
  { id: 't2', day: 'Monday', time: '11:00', subject: 'Database Management', room: 'CS-102', faculty: 'Prof. Sunita Rao' },
  { id: 't3', day: 'Monday', time: '14:00', subject: 'Computer Networks', room: 'CS-103', faculty: 'Prof. Anil Verma' },
  { id: 't4', day: 'Tuesday', time: '09:00', subject: 'Mathematics III', room: 'MA-201', faculty: 'Prof. Kavita Singh' },
  { id: 't5', day: 'Tuesday', time: '11:00', subject: 'Software Engineering', room: 'CS-104', faculty: 'Prof. Deepak Joshi' },
  { id: 't6', day: 'Tuesday', time: '14:00', subject: 'Programming in Python', room: 'CS-Lab1', faculty: 'Prof. Ramesh Kumar' },
  { id: 't7', day: 'Wednesday', time: '09:00', subject: 'Computer Networks', room: 'CS-103', faculty: 'Prof. Anil Verma' },
  { id: 't8', day: 'Wednesday', time: '11:00', subject: 'Database Management', room: 'CS-102', faculty: 'Prof. Sunita Rao' },
  { id: 't9', day: 'Thursday', time: '09:00', subject: 'Mathematics III', room: 'MA-201', faculty: 'Prof. Kavita Singh' },
  { id: 't10', day: 'Thursday', time: '14:00', subject: 'Software Engineering', room: 'CS-Lab2', faculty: 'Prof. Deepak Joshi' },
  { id: 't11', day: 'Friday', time: '09:00', subject: 'Programming in Python', room: 'CS-101', faculty: 'Prof. Ramesh Kumar' },
  { id: 't12', day: 'Friday', time: '11:00', subject: 'Computer Networks', room: 'CS-103', faculty: 'Prof. Anil Verma' },
]

export const DEMO_MESS_MENU = {
  Monday:    { breakfast: 'Idli + Sambar + Coconut Chutney', lunch: 'Rice + Dal + Paneer Butter Masala + Salad', snacks: 'Tea + Biscuits', dinner: 'Roti + Rice + Dal Tadka + Sabzi' },
  Tuesday:   { breakfast: 'Poha + Jalebi + Tea', lunch: 'Rice + Rajma + Jeera Aloo + Salad', snacks: 'Coffee + Samosa', dinner: 'Roti + Rice + Chole + Raita' },
  Wednesday: { breakfast: 'Paratha + Curd + Pickle', lunch: 'Rice + Dal + Egg Curry + Salad', snacks: 'Tea + Bread Pakora', dinner: 'Roti + Rice + Mixed Veg + Dal' },
  Thursday:  { breakfast: 'Upma + Coconut Chutney + Tea', lunch: 'Rice + Dal + Chicken Curry + Salad', snacks: 'Tea + Vada', dinner: 'Roti + Rice + Palak Paneer + Dal' },
  Friday:    { breakfast: 'Dosa + Sambar + Chutney', lunch: 'Rice + Dal + Fish Curry + Salad', snacks: 'Coffee + Pakora', dinner: 'Roti + Rice + Dal Makhani + Sabzi' },
  Saturday:  { breakfast: 'Puri + Aloo Sabzi + Tea', lunch: 'Biryani + Raita + Salad', snacks: 'Tea + Cake', dinner: 'Roti + Rice + Paneer Tikka Masala + Dal' },
  Sunday:    { breakfast: 'Chole Bhature + Tea', lunch: 'Special Thali (Rice + 3 Sabzi + Dal + Dessert)', snacks: 'Cold Drink + Snacks', dinner: 'Roti + Rice + Butter Chicken/Paneer + Kheer' },
}

export const DEMO_HOSTEL = {
  block: 'A', room: '203', floor: 2,
  warden: 'Mr. Suresh Nair', warden_phone: '9876500001',
  roommates: [
    { name: 'Vikram Singh', roll: 'CS2021052', phone: '9876543211' },
    { name: 'Karan Mehta', roll: 'CS2021063', phone: '9876543212' },
    { name: 'Dev Malhotra', roll: 'CS2021071', phone: '9876543213' },
  ],
}

export const DEMO_FEES = {
  total: 80000, paid: 65000, pending: 15000,
  transactions: [
    { id: 'TXN-001', description: 'Tuition Fee - Sem 5', amount: 35000, date: '2024-07-15', status: 'Paid' },
    { id: 'TXN-002', description: 'Hostel Fee - Sem 5', amount: 18000, date: '2024-07-15', status: 'Paid' },
    { id: 'TXN-003', description: 'Mess Fee - Sem 5', amount: 12000, date: '2024-07-20', status: 'Paid' },
    { id: 'TXN-004', description: 'Tuition Fee - Sem 6', amount: 35000, date: null, status: 'Pending' },
    { id: 'TXN-005', description: 'Exam Fee - Sem 6', amount: 5000, date: null, status: 'Pending' },
    { id: 'TXN-006', description: 'Library Fee', amount: 2000, date: null, status: 'Pending' },
  ],
}

export const DEMO_EVENTS = [
  { id: 'e1', title: 'Mid-Semester Exams Begin', date: new Date(Date.now() + 5*86400000).toISOString(), type: 'academic' },
  { id: 'e2', title: 'Annual Sports Day', date: new Date(Date.now() + 12*86400000).toISOString(), type: 'sports' },
  { id: 'e3', title: 'Tech Fest Registration Deadline', date: new Date(Date.now() + 8*86400000).toISOString(), type: 'cultural' },
  { id: 'e4', title: 'Fee Payment Deadline', date: new Date(Date.now() + 15*86400000).toISOString(), type: 'admin' },
]

export const DEMO_STUDENTS_ADMIN = [
  { id: 'stu-001', name: 'Arjun Sharma', roll: 'CS2021047', dept: 'Computer Science', year: 3, hostel: 'A-203', status: 'Active' },
  { id: 'stu-002', name: 'Priya Nair', roll: 'CS2021048', dept: 'Computer Science', year: 3, hostel: 'B-105', status: 'Active' },
  { id: 'stu-003', name: 'Rahul Gupta', roll: 'ME2021031', dept: 'Mechanical Engg', year: 3, hostel: 'A-301', status: 'Active' },
  { id: 'stu-004', name: 'Sneha Patel', roll: 'EC2021022', dept: 'Electronics', year: 3, hostel: 'A-105', status: 'Active' },
  { id: 'stu-005', name: 'Amit Kumar', roll: 'CS2022011', dept: 'Computer Science', year: 2, hostel: 'C-201', status: 'Active' },
  { id: 'stu-006', name: 'Divya Reddy', roll: 'CS2022015', dept: 'Computer Science', year: 2, hostel: 'B-202', status: 'Active' },
  { id: 'stu-007', name: 'Rohan Joshi', roll: 'ME2022008', dept: 'Mechanical Engg', year: 2, hostel: 'C-102', status: 'Active' },
  { id: 'stu-008', name: 'Ananya Das', roll: 'EC2022019', dept: 'Electronics', year: 2, hostel: 'B-301', status: 'Active' },
]

export const DEMO_MESS_FEEDBACK = [
  { id: 'mess-feedback-demo-1', student_id: 'stu-001', day: 'Monday', rating: 4, comment: 'Fresh breakfast and a good variety at lunch.', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'mess-feedback-demo-2', student_id: 'stu-002', day: 'Tuesday', rating: 3, comment: 'Lunch was good; please serve the snacks a little warmer.', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 'mess-feedback-demo-3', student_id: 'stu-003', day: 'Wednesday', rating: 5, comment: 'The dinner menu was excellent today.', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'mess-feedback-demo-4', student_id: 'stu-004', day: 'Thursday', rating: 2, comment: 'Please add more vegetarian options at dinner.', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]

const DEMO_STUDENT_USERS = DEMO_STUDENTS_ADMIN.map((student, index) => ({
  id: student.id,
  name: student.name,
  email: `${student.roll.toLowerCase()}@demo.campus`,
  role: 'student',
  admin_role: null,
  is_active: true,
  created_at: new Date(Date.now() - (index + 3) * 86400000).toISOString(),
}))

const DEMO_FACULTY_USERS = INITIAL_FACULTY.map((member, index) => ({
  id: `demo-user-${member.id}`,
  name: member.name,
  email: `${member.name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '')}@demo.campus`,
  role: 'admin',
  admin_role: ADMIN_ROLES.FACULTY,
  is_active: true,
  created_at: new Date(Date.now() - (index + 12) * 86400000).toISOString(),
}))

export const DEMO_ADMIN_USERS = [
  ...DEMO_STUDENT_USERS,
  ...DEMO_FACULTY_USERS,
  { id: 'demo-role-hostel', name: 'Demo Hostel Manager', email: 'hostel.manager@demo.campus', role: 'admin', admin_role: ADMIN_ROLES.HOSTEL_MANAGEMENT, is_active: true, created_at: new Date(Date.now() - 20 * 86400000).toISOString() },
  { id: 'demo-role-mess', name: 'Demo Mess Manager', email: 'mess.manager@demo.campus', role: 'admin', admin_role: ADMIN_ROLES.MESS_MANAGER, is_active: true, created_at: new Date(Date.now() - 21 * 86400000).toISOString() },
  { id: 'demo-role-accounts', name: 'Demo Accounts Manager', email: 'accounts.manager@demo.campus', role: 'admin', admin_role: ADMIN_ROLES.ACCOUNT_EXAMINATION, is_active: true, created_at: new Date(Date.now() - 22 * 86400000).toISOString() },
  { id: 'demo-role-main', name: 'Demo Main Administrator', email: 'main.admin@demo.campus', role: 'admin', admin_role: ADMIN_ROLES.MAIN_ADMINISTRATOR, is_active: true, created_at: new Date(Date.now() - 30 * 86400000).toISOString() },
]

export const DEMO_HOSTEL_BLOCKS = [
  { block: 'A', rooms: 120, occupied: 108 },
  { block: 'B', rooms: 100, occupied: 92 },
  { block: 'C', rooms: 80, occupied: 71 },
  { block: 'D', rooms: 90, occupied: 74 },
]

export const DEMO_EXAM_RESULTS = [
  { id: 'result-001', student_id: 'stu-001', result_type: 'SGPA', result_value: 8.6, academic_year: '2025-2026', semester: 6, published: true, published_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'result-002', student_id: 'stu-001', result_type: 'CGPA', result_value: 8.4, academic_year: '2025-2026', semester: 6, published: true, published_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'result-003', student_id: 'stu-002', result_type: 'SGPA', result_value: 9.1, academic_year: '2025-2026', semester: 6, published: true, published_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'result-004', student_id: 'stu-001', result_type: 'SGPA', result_value: 8.2, academic_year: '2024-2025', semester: 5, published: true, published_at: new Date(Date.now() - 120 * 86400000).toISOString() },
  { id: 'result-005', student_id: 'stu-001', result_type: 'SGPA', result_value: 8.0, academic_year: '2024-2025', semester: 4, published: true, published_at: new Date(Date.now() - 240 * 86400000).toISOString() },
]

export const DEMO_ADMIN_FEES = [
  { id: 'fee-demo-001', student_id: 'stu-001', description: 'Semester 6 Tuition Fee', amount: 35000, status: 'Pending', due_date: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10), paid_date: null },
  { id: 'fee-demo-002', student_id: 'stu-002', description: 'Hostel Fee - Semester 6', amount: 18000, status: 'Paid', due_date: new Date(Date.now() - 15 * 86400000).toISOString().slice(0, 10), paid_date: new Date(Date.now() - 18 * 86400000).toISOString().slice(0, 10) },
  { id: 'fee-demo-003', student_id: 'stu-003', description: 'Examination Fee', amount: 5000, status: 'Pending', due_date: new Date(Date.now() + 8 * 86400000).toISOString().slice(0, 10), paid_date: null },
  { id: 'fee-demo-004', student_id: 'stu-004', description: 'Library and Laboratory Fee', amount: 3500, status: 'Paid', due_date: new Date(Date.now() - 10 * 86400000).toISOString().slice(0, 10), paid_date: new Date(Date.now() - 12 * 86400000).toISOString().slice(0, 10) },
]

export const DEMO_ADMIN_NOTIFICATIONS = [
  { id: 'admin-note-001', title: 'New document requests', message: 'Three student document requests are ready for review.', type: 'info', link: '/admin/requests', read: false, created_at: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 'admin-note-002', title: 'Hostel maintenance update', message: 'A water maintenance task in Block A has been assigned to the hostel team.', type: 'success', link: '/admin/hostel', read: false, created_at: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'admin-note-003', title: 'Attendance review', message: 'Review the current semester attendance summary for all departments.', type: 'warning', link: '/admin/attendance', read: true, created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'admin-note-004', title: 'Campus notice published', message: 'The examination schedule notice is now visible to students.', type: 'success', link: '/admin/notices', read: true, created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]

export const DEMO_ACADEMIC_RESOURCES = [
  { id: 'resource-demo-assignment', title: 'Data Structures and Algorithms Assignment 1', description: 'Practice problems on arrays, linked lists, and complexity analysis.', resource_type: 'assignment', department: 'Computer Science', course: 'B.Tech CSE', semester: 6, subject: 'Data Structures and Algorithms', academic_year: '2025-2026', faculty_name: 'Prof. Ramesh Kumar', file_name: 'data-structures-assignment-1.pdf', file_type: 'application/pdf', file_url: null, link_url: null, demo_sample: true, status: 'approved', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 'resource-demo-assignment-dbms', title: 'Database Management Systems — SQL Lab', description: 'Write and test SQL queries using joins, grouping, constraints, and transactions. Submit query output with your answers.', resource_type: 'assignment', department: 'Computer Science', course: 'B.Tech CSE', semester: 6, subject: 'Database Management', academic_year: '2025-2026', faculty_name: 'Prof. Sunita Rao', file_name: 'dbms-sql-lab-assignment.pdf', file_type: 'application/pdf', file_url: null, link_url: null, demo_sample: true, status: 'approved', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 'resource-demo-assignment-networks', title: 'Computer Networks — Routing and Subnetting', description: 'Solve IPv4 subnetting exercises and compare distance-vector with link-state routing.', resource_type: 'assignment', department: 'Computer Science', course: 'B.Tech CSE', semester: 6, subject: 'Computer Networks', academic_year: '2025-2026', faculty_name: 'Prof. Anil Verma', file_name: 'networks-routing-assignment.pdf', file_type: 'application/pdf', file_url: null, link_url: null, demo_sample: true, status: 'approved', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 'resource-demo-assignment-se', title: 'Software Engineering — Requirements and Design', description: 'Prepare a concise requirements specification, use-case diagram, and test plan for a campus service.', resource_type: 'assignment', department: 'Computer Science', course: 'B.Tech CSE', semester: 6, subject: 'Software Engineering', academic_year: '2025-2026', faculty_name: 'Prof. Deepak Joshi', file_name: 'software-engineering-design-assignment.pdf', file_type: 'application/pdf', file_url: null, link_url: null, demo_sample: true, status: 'approved', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 'resource-demo-syllabus', title: 'Data Structures and Algorithms Syllabus', description: 'Course outline, learning objectives, and semester assessment plan.', resource_type: 'syllabus', department: 'Computer Science', course: 'B.Tech CSE', semester: 6, subject: 'Data Structures and Algorithms', academic_year: '2025-2026', faculty_name: 'Prof. Ramesh Kumar', file_name: 'data-structures-syllabus.pdf', file_type: 'application/pdf', file_url: null, link_url: null, demo_sample: true, status: 'approved', created_at: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 'resource-demo-pyq', title: 'Database Management Previous Paper', description: 'Practice paper for the previous semester examination.', resource_type: 'pyq', department: 'Computer Science', course: 'B.Tech CSE', semester: 6, subject: 'Database Management', academic_year: '2024-2025', question_year: 2025, examination_type: 'End Semester', faculty_name: 'Prof. Sunita Rao', file_name: 'database-management-paper.pdf', file_type: 'application/pdf', file_url: null, link_url: null, demo_sample: true, status: 'approved', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 'resource-demo-notes', title: 'Computer Networks: Routing Notes', description: 'Lecture notes covering routing protocols and network layers.', resource_type: 'class_material', department: 'Computer Science', course: 'B.Tech CSE', semester: 6, subject: 'Computer Networks', academic_year: '2025-2026', faculty_name: 'Prof. Anil Verma', file_name: '', file_type: 'note', file_url: null, link_url: null, demo_sample: true, status: 'approved', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 'resource-demo-material', title: 'Software Engineering Project Guide', description: 'A guide to requirements, design reviews, and project documentation.', resource_type: 'class_material', department: 'Computer Science', course: 'B.Tech CSE', semester: 6, subject: 'Software Engineering', academic_year: '2025-2026', faculty_name: 'Prof. Deepak Joshi', file_name: '', file_type: 'note', file_url: null, link_url: null, demo_sample: true, status: 'approved', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
]

export const INITIAL_COMPLAINTS = [
  { id: 'CMP-2041', student_id: 'stu-001', student_name: 'Demo Student', category: 'Water', location: 'Hostel Block A, Room 203', description: 'The bathroom tap is dripping and needs repair.', priority: 'Medium', status: 'Submitted', department: 'Hostel Maintenance', assigned_to: null, created_at: new Date(Date.now()-2*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString(), ai_category: 'Water', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-2*86400000).toISOString() }] },
  { id: 'CMP-2042', student_id: 'stu-001', student_name: 'Demo Student', category: 'Cleaning', location: 'Hostel Block A, Common Area', description: 'The study lounge needs cleaning after the evening session.', priority: 'Low', status: 'In Progress', department: 'Housekeeping', assigned_to: 'Campus Cleaning Team', created_at: new Date(Date.now()-4*86400000).toISOString(), updated_at: new Date(Date.now()-1*86400000).toISOString(), ai_category: 'Cleaning', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-4*86400000).toISOString() }, { status: 'In Progress', note: 'Added to the daily cleaning round', time: new Date(Date.now()-1*86400000).toISOString() }] },
  { id: 'CMP-2043', student_id: 'stu-001', student_name: 'Demo Student', category: 'Internet', location: 'Computer Science Block, Lab 2', description: 'Wi-Fi disconnects during online lab sessions.', priority: 'High', status: 'Assigned', department: 'IT Support', assigned_to: 'Network Support Team', created_at: new Date(Date.now()-3*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString(), ai_category: 'Internet', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-3*86400000).toISOString() }, { status: 'Assigned', note: 'Assigned to network support', time: new Date(Date.now()-2*86400000).toISOString() }] },
  { id: 'CMP-2028', student_id: 'stu-001', student_name: 'Arjun Sharma', category: 'Electricity', location: 'Hostel Block A, Room 203', description: 'Power socket near study table is not working.', priority: 'Medium', status: 'Resolved', department: 'Electrical Maintenance', assigned_to: 'Electrical Team', created_at: new Date(Date.now()-5*86400000).toISOString(), updated_at: new Date(Date.now()-3*86400000).toISOString(), ai_category: 'Electricity', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-5*86400000).toISOString() }, { status: 'Assigned', note: 'Assigned to Electrical Team', time: new Date(Date.now()-4*86400000).toISOString() }, { status: 'Resolved', note: 'Socket replaced and tested', time: new Date(Date.now()-3*86400000).toISOString() }] },
  { id: 'CMP-2019', student_id: 'stu-002', student_name: 'Priya Nair', category: 'Cleaning', location: 'Hostel Block B, Common Area', description: 'Common bathroom not cleaned for 2 days.', priority: 'Medium', status: 'Submitted', department: 'Housekeeping', assigned_to: null, created_at: new Date(Date.now()-1*86400000).toISOString(), updated_at: new Date(Date.now()-1*86400000).toISOString(), ai_category: 'Cleaning', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-1*86400000).toISOString() }] },
  { id: 'CMP-2015', student_id: 'stu-003', student_name: 'Rahul Gupta', category: 'Water', location: 'Hostel Block A, Floor 2', description: 'No hot water in morning for past 3 days.', priority: 'High', status: 'Assigned', department: 'Hostel Maintenance', assigned_to: 'Ravi Plumbing Team', created_at: new Date(Date.now()-3*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString(), ai_category: 'Water / Plumbing', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-3*86400000).toISOString() }, { status: 'Assigned', note: 'Assigned to Ravi Plumbing Team', time: new Date(Date.now()-2*86400000).toISOString() }] },
  { id: 'CMP-2010', student_id: 'stu-004', student_name: 'Sneha Patel', category: 'Water', location: 'Hostel Block A, Room 105', description: 'Water supply cuts off every evening.', priority: 'High', status: 'In Progress', department: 'Hostel Maintenance', assigned_to: 'Ravi Plumbing Team', created_at: new Date(Date.now()-4*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString(), ai_category: 'Water / Plumbing', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-4*86400000).toISOString() }, { status: 'In Progress', note: 'Team investigating', time: new Date(Date.now()-2*86400000).toISOString() }] },
  { id: 'CMP-2005', student_id: 'stu-003', student_name: 'Rahul Gupta', category: 'Water', location: 'Hostel Block A, Room 301', description: 'Tap dripping continuously wasting water.', priority: 'Low', status: 'Submitted', department: 'Hostel Maintenance', assigned_to: null, created_at: new Date(Date.now()-6*86400000).toISOString(), updated_at: new Date(Date.now()-6*86400000).toISOString(), ai_category: 'Water / Plumbing', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-6*86400000).toISOString() }] },
]

export const INITIAL_REQUESTS = [
  { id: 'REQ-1038', student_id: 'stu-001', student_name: 'Arjun Sharma', type: 'Fee Receipt', reason: 'Scholarship application', status: 'Approved', admin_comment: 'Approved. Document PDF is being prepared.', file_url: null, created_at: new Date(Date.now()-7*86400000).toISOString(), updated_at: new Date(Date.now()-5*86400000).toISOString() },
  { id: 'REQ-1022', student_id: 'stu-002', student_name: 'Priya Nair', type: 'Character Certificate', reason: 'Job application', status: 'Submitted', admin_comment: '', file_url: null, created_at: new Date(Date.now()-2*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString() },
  { id: 'REQ-1041', student_id: 'stu-001', student_name: 'Demo Student', type: 'Bonafide Certificate', reason: 'Internship verification', status: 'Under Review', admin_comment: '', file_url: null, created_at: new Date(Date.now()-1*86400000).toISOString(), updated_at: new Date(Date.now()-1*86400000).toISOString() },
  { id: 'REQ-1042', student_id: 'stu-001', student_name: 'Demo Student', type: 'Transcript', reason: 'Graduate programme application', status: 'Ready', admin_comment: 'Your transcript is ready for collection.', file_url: null, created_at: new Date(Date.now()-10*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString() },
]

export const INITIAL_LEAVE = [
  { id: 'GP-189', student_id: 'stu-001', student_name: 'Arjun Sharma', type: 'Gate Pass', reason: 'Medical appointment', destination: 'City Hospital', from_date: new Date().toISOString().split('T')[0], to_date: new Date().toISOString().split('T')[0], from_time: '10:00', to_time: '14:00', status: 'Approved', admin_comment: 'Approved. Carry your ID card.', created_at: new Date(Date.now()-2*86400000).toISOString() },
  { id: 'LV-290', student_id: 'stu-002', student_name: 'Priya Nair', type: 'Leave', reason: 'Family function', destination: 'Chennai', from_date: new Date(Date.now()+3*86400000).toISOString().split('T')[0], to_date: new Date(Date.now()+5*86400000).toISOString().split('T')[0], from_time: '08:00', to_time: '20:00', status: 'Pending', admin_comment: '', created_at: new Date(Date.now()-1*86400000).toISOString() },
  { id: 'GP-204', student_id: 'stu-001', student_name: 'Demo Student', type: 'Gate Pass', reason: 'Visit to campus bookstore', destination: 'City Centre', from_date: new Date(Date.now()+1*86400000).toISOString().split('T')[0], to_date: new Date(Date.now()+1*86400000).toISOString().split('T')[0], from_time: '15:00', to_time: '18:00', status: 'Pending', admin_comment: '', created_at: new Date(Date.now()-3600000).toISOString() },
  { id: 'LV-318', student_id: 'stu-001', student_name: 'Demo Student', type: 'Leave', reason: 'Family visit', destination: 'Bhubaneswar', from_date: new Date(Date.now()+7*86400000).toISOString().split('T')[0], to_date: new Date(Date.now()+9*86400000).toISOString().split('T')[0], from_time: '09:00', to_time: '19:00', status: 'Approved', admin_comment: 'Approved. Please return by the stated time.', created_at: new Date(Date.now()-3*86400000).toISOString() },
]

export const INITIAL_NOTIFICATIONS = [
  { id: 'n1', user_id: 'stu-001', title: 'Gate Pass Approved', message: 'Your gate pass GP-189 has been approved. Carry your ID card.', type: 'success', read: false, created_at: new Date(Date.now()-2*3600000).toISOString(), link: '/student/leave' },
  { id: 'n2', user_id: 'stu-001', title: 'Class Cancelled', message: "Tomorrow's Database Management class has been cancelled.", type: 'warning', read: false, created_at: new Date(Date.now()-5*3600000).toISOString(), link: '/student/timetable' },
  { id: 'n3', user_id: 'stu-001', title: 'Fee Reminder', message: 'Semester fee payment due in 15 days. Pending: ₹15,000', type: 'warning', read: true, created_at: new Date(Date.now()-1*86400000).toISOString(), link: '/student/fees' },
  { id: 'n4', user_id: 'stu-001', title: 'Document Ready', message: 'Your Fee Receipt REQ-1038 is approved and ready.', type: 'success', read: true, created_at: new Date(Date.now()-5*86400000).toISOString(), link: '/student/documents' },
]

export const INITIAL_NOTICES = [
  { id: 'nc1', title: 'Mid-Semester Examination Schedule', content: 'Mid-semester examinations will be held from October 15-22. Timetable posted on the notice board. All students must carry their ID cards.', target: 'All Students', created_by: 'Academic Office', created_at: new Date(Date.now()-1*86400000).toISOString(), important: true },
  { id: 'nc2', title: 'Hostel Maintenance - Block A Water Supply', content: 'Water supply in Block A will be interrupted on Sunday 6 AM - 10 AM for maintenance work. Please store water in advance.', target: 'Hostel', created_by: 'Hostel Office', created_at: new Date(Date.now()-2*86400000).toISOString(), important: true },
  { id: 'nc3', title: 'Annual Sports Day Registration', content: 'Register for Annual Sports Day events by October 10. Contact Sports Secretary or visit the sports office.', target: 'All Students', created_by: 'Sports Committee', created_at: new Date(Date.now()-3*86400000).toISOString(), important: false },
  { id: 'nc4', title: 'Library Timing Change', content: 'Library will remain open till 11 PM during examination period starting October 14.', target: 'All Students', created_by: 'Library', created_at: new Date(Date.now()-4*86400000).toISOString(), important: false },
  { id: 'nc5', title: 'Mess Menu Update - October', content: 'Updated mess menu for October has been published. Special Sunday meals included. Feedback welcome.', target: 'Hostel', created_by: 'Mess Committee', created_at: new Date(Date.now()-5*86400000).toISOString(), important: false },
]


export const INITIAL_CAMPUS_JOURNAL = [
  {
    id: 'journal-demo-featured',
    student_id: 'stu-001',
    author_name: 'Demo Student',
    title: 'A Smarter Campus Starts with Small Ideas',
    summary: 'A student perspective on practical ways to make campus life more connected and sustainable.',
    content: 'Small changes can make campus life easier for everyone. Shared study resources, clearer event updates, and everyday sustainability habits are a good place to begin.',
    category: 'Student Publications',
    subcategory: 'Articles',
    status: 'published',
    is_featured: true,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'journal-demo-pending',
    student_id: 'stu-001',
    author_name: 'Demo Student',
    title: 'Campus Through a Poet’s Eyes',
    summary: 'A short poem about the friendships and discoveries that make college memorable.',
    content: 'Morning light finds the courtyard,\nnew ideas gather in every room.\nBetween the classes and conversations,\nwe find the place where futures bloom.',
    category: 'Student Publications',
    subcategory: 'Poems',
    status: 'pending',
    is_featured: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'journal-demo-published-2',
    student_id: 'stu-001',
    author_name: 'Demo Student',
    title: 'A Greener Walk Across Campus',
    summary: 'Simple student-led ideas for cleaner shared spaces and more sustainable daily routines.',
    content: 'A greener campus can begin with small habits: refill a bottle, sort waste, and leave shared study spaces ready for the next person. When many students take part, those small actions add up.',
    category: 'Campus Life',
    subcategory: 'Articles',
    status: 'published',
    is_featured: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'journal-demo-pending-2',
    student_id: 'stu-001',
    author_name: 'Demo Student',
    title: 'The Library at Closing Time',
    summary: 'A short campus-life story about the people and ideas that stay with us after class.',
    content: 'The last pages turn quietly as evening settles over the library. A friend saves a seat, a classmate shares one more idea, and the walk home feels a little less ordinary.',
    category: 'Student Publications',
    subcategory: 'Stories',
    status: 'pending',
    is_featured: false,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
]
export const DEMO_AI_INSIGHTS = [
  { id: 'ai1', severity: 'critical', title: 'Recurring Water Issues - Block A', description: '18 water-related complaints from Hostel Block A this week.', location: 'Hostel Block A', count: 18, period: 'This Week', recommendation: 'Conduct full inspection of Block A plumbing infrastructure. Consider replacing aging pipes on floors 1-3.', category: 'Water', trend: 'increasing' },
  { id: 'ai2', severity: 'high', title: 'Electricity Complaints Spike', description: '9 electricity complaints across campus in last 3 days.', location: 'Multiple Blocks', count: 9, period: 'Last 3 Days', recommendation: 'Schedule preventive electrical maintenance. Check main distribution boards.', category: 'Electricity', trend: 'stable' },
  { id: 'ai3', severity: 'medium', title: 'Mess Quality Complaints - Dinner', description: 'Average dinner rating dropped to 2.1/5 this week.', location: 'Main Mess', count: 24, period: 'This Week', recommendation: 'Review dinner menu quality. Consider feedback session with mess contractor.', category: 'Mess', trend: 'decreasing' },
  { id: 'ai4', severity: 'medium', title: 'Attendance Follow-up Needed', description: 'Several subject groups are trending close to the attendance threshold.', location: 'Academic Blocks', count: 6, period: 'This Month', recommendation: 'Review attendance reports and send early reminders to affected students.', category: 'Attendance', trend: 'decreasing' },
]

// ==================== BUS ROUTES ====================

export const INITIAL_BUS_ROUTES = [
  {
    id: 'bus-01',
    bus_number: 'BUS-01',
    route_name: 'Main Gate → Hostel → Academic Block',
    driver: 'Ramesh Kumar',
    phone: '9876501001',
    status: 'Running',
    current_location: 'Hostel Block A',
    next_stop: 'Academic Block',
    eta: '5 min',
    capacity: 40,
    occupied: 24,
    latitude: 20.2961,
    longitude: 85.8245,
  },
  {
    id: 'bus-02',
    bus_number: 'BUS-02',
    route_name: 'Main Gate → Library → Canteen',
    driver: 'Suresh Das',
    phone: '9876501002',
    status: 'Running',
    current_location: 'Central Library',
    next_stop: 'Main Canteen',
    eta: '3 min',
    capacity: 40,
    occupied: 18,
    latitude: 20.2970,
    longitude: 85.8252,
  },
  {
    id: 'bus-03',
    bus_number: 'BUS-03',
    route_name: 'Hostel → Sports Complex → Main Gate',
    driver: 'Manoj Singh',
    phone: '9876501003',
    status: 'Stopped',
    current_location: 'Sports Complex',
    next_stop: 'Main Gate',
    eta: '10 min',
    capacity: 40,
    occupied: 12,
    latitude: 20.2955,
    longitude: 85.8238,
  },
  {
    id: 'bus-04',
    bus_number: 'BUS-04',
    route_name: 'Academic Block → Hostel → Sports Complex',
    driver: 'Anita Das',
    phone: '9876501004',
    status: 'Running',
    current_location: 'Academic Block',
    next_stop: 'Hostel Block B',
    eta: '7 min',
    capacity: 32,
    occupied: 16,
    latitude: 20.2965,
    longitude: 85.8241,
  },
];


// ==================== CAMPUS CLASSROOMS ====================

export const INITIAL_CAMPUS_ROOMS = [
  {
    id: 'room-101',
    room_number: 'CS-101',
    building: 'Computer Science Block',
    floor: 1,
    capacity: 60,
    status: 'Occupied',
    current_subject: 'Programming in Python',
    faculty: 'Prof. Ramesh Kumar',
    current_class: true,
    available_from: '11:00',
  },
  {
    id: 'room-102',
    room_number: 'CS-102',
    building: 'Computer Science Block',
    floor: 1,
    capacity: 60,
    status: 'Available',
    current_subject: null,
    faculty: null,
    current_class: false,
    available_from: 'Now',
  },
  {
    id: 'room-103',
    room_number: 'CS-103',
    building: 'Computer Science Block',
    floor: 1,
    capacity: 60,
    status: 'Occupied',
    current_subject: 'Computer Networks',
    faculty: 'Prof. Anil Verma',
    current_class: true,
    available_from: '14:00',
  },
  {
    id: 'room-104',
    room_number: 'CS-104',
    building: 'Computer Science Block',
    floor: 1,
    capacity: 50,
    status: 'Available',
    current_subject: null,
    faculty: null,
    current_class: false,
    available_from: 'Now',
  },
  {
    id: 'room-lab1',
    room_number: 'CS-Lab1',
    building: 'Computer Science Block',
    floor: 2,
    capacity: 40,
    status: 'Occupied',
    current_subject: 'Programming in Python',
    faculty: 'Prof. Ramesh Kumar',
    current_class: true,
    available_from: '16:00',
  },
  {
    id: 'room-lab2',
    room_number: 'CS-Lab2',
    building: 'Computer Science Block',
    floor: 2,
    capacity: 40,
    status: 'Available',
    current_subject: null,
    faculty: null,
    current_class: false,
    available_from: 'Now',
  },
  {
    id: 'room-ma201',
    room_number: 'MA-201',
    building: 'Mathematics Block',
    floor: 2,
    capacity: 70,
    status: 'Available',
    current_subject: null,
    faculty: null,
    current_class: false,
    available_from: 'Now',
  },
  {
    id: 'room-lib204',
    room_number: 'LIB-204',
    building: 'Central Library',
    floor: 2,
    capacity: 36,
    status: 'Available',
    current_subject: null,
    faculty: null,
    current_class: false,
    available_from: 'Now',
  },
];
