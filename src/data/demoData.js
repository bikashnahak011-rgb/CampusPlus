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

export const INITIAL_COMPLAINTS = [
  { id: 'CMP-2028', student_id: 'stu-001', student_name: 'Arjun Sharma', category: 'Electricity', location: 'Hostel Block A, Room 203', description: 'Power socket near study table is not working.', priority: 'Medium', status: 'Resolved', department: 'Electrical Maintenance', assigned_to: 'Electrical Team', created_at: new Date(Date.now()-5*86400000).toISOString(), updated_at: new Date(Date.now()-3*86400000).toISOString(), ai_category: 'Electricity', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-5*86400000).toISOString() }, { status: 'Assigned', note: 'Assigned to Electrical Team', time: new Date(Date.now()-4*86400000).toISOString() }, { status: 'Resolved', note: 'Socket replaced and tested', time: new Date(Date.now()-3*86400000).toISOString() }] },
  { id: 'CMP-2019', student_id: 'stu-002', student_name: 'Priya Nair', category: 'Cleaning', location: 'Hostel Block B, Common Area', description: 'Common bathroom not cleaned for 2 days.', priority: 'Medium', status: 'Submitted', department: 'Housekeeping', assigned_to: null, created_at: new Date(Date.now()-1*86400000).toISOString(), updated_at: new Date(Date.now()-1*86400000).toISOString(), ai_category: 'Cleaning', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-1*86400000).toISOString() }] },
  { id: 'CMP-2015', student_id: 'stu-003', student_name: 'Rahul Gupta', category: 'Water', location: 'Hostel Block A, Floor 2', description: 'No hot water in morning for past 3 days.', priority: 'High', status: 'Assigned', department: 'Hostel Maintenance', assigned_to: 'Ravi Plumbing Team', created_at: new Date(Date.now()-3*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString(), ai_category: 'Water / Plumbing', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-3*86400000).toISOString() }, { status: 'Assigned', note: 'Assigned to Ravi Plumbing Team', time: new Date(Date.now()-2*86400000).toISOString() }] },
  { id: 'CMP-2010', student_id: 'stu-004', student_name: 'Sneha Patel', category: 'Water', location: 'Hostel Block A, Room 105', description: 'Water supply cuts off every evening.', priority: 'High', status: 'In Progress', department: 'Hostel Maintenance', assigned_to: 'Ravi Plumbing Team', created_at: new Date(Date.now()-4*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString(), ai_category: 'Water / Plumbing', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-4*86400000).toISOString() }, { status: 'In Progress', note: 'Team investigating', time: new Date(Date.now()-2*86400000).toISOString() }] },
  { id: 'CMP-2005', student_id: 'stu-003', student_name: 'Rahul Gupta', category: 'Water', location: 'Hostel Block A, Room 301', description: 'Tap dripping continuously wasting water.', priority: 'Low', status: 'Submitted', department: 'Hostel Maintenance', assigned_to: null, created_at: new Date(Date.now()-6*86400000).toISOString(), updated_at: new Date(Date.now()-6*86400000).toISOString(), ai_category: 'Water / Plumbing', updates: [{ status: 'Submitted', note: 'Complaint submitted', time: new Date(Date.now()-6*86400000).toISOString() }] },
]

export const INITIAL_REQUESTS = [
  { id: 'REQ-1038', student_id: 'stu-001', student_name: 'Arjun Sharma', type: 'Fee Receipt', reason: 'Scholarship application', status: 'Approved', admin_comment: 'Receipt generated and ready.', file_url: '#', created_at: new Date(Date.now()-7*86400000).toISOString(), updated_at: new Date(Date.now()-5*86400000).toISOString() },
  { id: 'REQ-1022', student_id: 'stu-002', student_name: 'Priya Nair', type: 'Character Certificate', reason: 'Job application', status: 'Submitted', admin_comment: '', file_url: null, created_at: new Date(Date.now()-2*86400000).toISOString(), updated_at: new Date(Date.now()-2*86400000).toISOString() },
]

export const INITIAL_LEAVE = [
  { id: 'GP-189', student_id: 'stu-001', student_name: 'Arjun Sharma', type: 'Gate Pass', reason: 'Medical appointment', destination: 'City Hospital', from_date: new Date().toISOString().split('T')[0], to_date: new Date().toISOString().split('T')[0], from_time: '10:00', to_time: '14:00', status: 'Approved', admin_comment: 'Approved. Carry your ID card.', created_at: new Date(Date.now()-2*86400000).toISOString() },
  { id: 'LV-290', student_id: 'stu-002', student_name: 'Priya Nair', type: 'Leave', reason: 'Family function', destination: 'Chennai', from_date: new Date(Date.now()+3*86400000).toISOString().split('T')[0], to_date: new Date(Date.now()+5*86400000).toISOString().split('T')[0], from_time: '08:00', to_time: '20:00', status: 'Pending', admin_comment: '', created_at: new Date(Date.now()-1*86400000).toISOString() },
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

export const DEMO_AI_INSIGHTS = [
  { id: 'ai1', severity: 'critical', title: 'Recurring Water Issues - Block A', description: '18 water-related complaints from Hostel Block A this week.', location: 'Hostel Block A', count: 18, period: 'This Week', recommendation: 'Conduct full inspection of Block A plumbing infrastructure. Consider replacing aging pipes on floors 1-3.', category: 'Water', trend: 'increasing' },
  { id: 'ai2', severity: 'high', title: 'Electricity Complaints Spike', description: '9 electricity complaints across campus in last 3 days.', location: 'Multiple Blocks', count: 9, period: 'Last 3 Days', recommendation: 'Schedule preventive electrical maintenance. Check main distribution boards.', category: 'Electricity', trend: 'stable' },
  { id: 'ai3', severity: 'medium', title: 'Mess Quality Complaints - Dinner', description: 'Average dinner rating dropped to 2.1/5 this week.', location: 'Main Mess', count: 24, period: 'This Week', recommendation: 'Review dinner menu quality. Consider feedback session with mess contractor.', category: 'Mess', trend: 'decreasing' },
]
