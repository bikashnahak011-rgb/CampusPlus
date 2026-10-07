export const ADMIN_ROLES = {
  HOSTEL_MANAGEMENT: 'hostel_management',
  MESS_MANAGER: 'mess_manager',
  FACULTY: 'faculty',
  ACCOUNT_EXAMINATION: 'account_examination',
  MAIN_ADMINISTRATOR: 'main_administrator',
}

export const HOSTEL_MANAGEMENT_EMAIL = 'dragonfire0222@gmail.com'
export const MAIN_ADMINISTRATOR_EMAIL = 'bikashnahak023@gmail.com'

export function isMainAdministratorEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase() === MAIN_ADMINISTRATOR_EMAIL
}

export function isHostelManagementEmail(email) {
  return typeof email === 'string' && email.trim().toLowerCase() === HOSTEL_MANAGEMENT_EMAIL
}

export const ADMIN_ROLE_LABELS = {
  [ADMIN_ROLES.HOSTEL_MANAGEMENT]: 'Hostel Management',
  [ADMIN_ROLES.MESS_MANAGER]: 'Mess Manager',
  [ADMIN_ROLES.FACULTY]: 'Faculty',
  [ADMIN_ROLES.ACCOUNT_EXAMINATION]: 'Account & Examination',
  [ADMIN_ROLES.MAIN_ADMINISTRATOR]: 'Main Administrator',
}

const ALL_ADMIN_ROLES = Object.values(ADMIN_ROLES)

export const ADMIN_ROLE_HOME = {
  [ADMIN_ROLES.HOSTEL_MANAGEMENT]: '/admin/hostel',
  [ADMIN_ROLES.MESS_MANAGER]: '/admin/mess',
  [ADMIN_ROLES.FACULTY]: '/admin/faculty',
  [ADMIN_ROLES.ACCOUNT_EXAMINATION]: '/admin/dashboard',
  [ADMIN_ROLES.MAIN_ADMINISTRATOR]: '/admin/main',
}

const PATH_ACCESS = {
  dashboard: ALL_ADMIN_ROLES,
  main: [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  users: [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  students: [ADMIN_ROLES.FACULTY, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'hostel-students': [ADMIN_ROLES.HOSTEL_MANAGEMENT, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  results: [ADMIN_ROLES.FACULTY, ADMIN_ROLES.ACCOUNT_EXAMINATION, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  examination: [ADMIN_ROLES.ACCOUNT_EXAMINATION, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  marks: [ADMIN_ROLES.FACULTY, ADMIN_ROLES.ACCOUNT_EXAMINATION, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  faculty: [ADMIN_ROLES.FACULTY, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  classes: [ADMIN_ROLES.FACULTY, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  assignments: [ADMIN_ROLES.FACULTY, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'academic-performance': [ADMIN_ROLES.FACULTY, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  complaints: [ADMIN_ROLES.HOSTEL_MANAGEMENT, ADMIN_ROLES.MESS_MANAGER, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  requests: [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'help-desk': [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  hostel: [ADMIN_ROLES.HOSTEL_MANAGEMENT, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'room-allocation': [ADMIN_ROLES.HOSTEL_MANAGEMENT, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  maintenance: [ADMIN_ROLES.HOSTEL_MANAGEMENT, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'room-finder': [ADMIN_ROLES.HOSTEL_MANAGEMENT, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  mess: [ADMIN_ROLES.MESS_MANAGER, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'todays-menu': [ADMIN_ROLES.MESS_MANAGER, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'mess-attendance': [ADMIN_ROLES.MESS_MANAGER, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  fees: [ADMIN_ROLES.ACCOUNT_EXAMINATION, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  payments: [ADMIN_ROLES.ACCOUNT_EXAMINATION, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  accounts: [ADMIN_ROLES.ACCOUNT_EXAMINATION, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'accounts-examination': [ADMIN_ROLES.ACCOUNT_EXAMINATION, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  reports: [
    ADMIN_ROLES.HOSTEL_MANAGEMENT,
    ADMIN_ROLES.MESS_MANAGER,
    ADMIN_ROLES.ACCOUNT_EXAMINATION,
    ADMIN_ROLES.MAIN_ADMINISTRATOR,
  ],
  analytics: [
    ADMIN_ROLES.HOSTEL_MANAGEMENT,
    ADMIN_ROLES.MESS_MANAGER,
    ADMIN_ROLES.ACCOUNT_EXAMINATION,
    ADMIN_ROLES.MAIN_ADMINISTRATOR,
  ],
  attendance: [ADMIN_ROLES.FACULTY, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  notifications: ALL_ADMIN_ROLES,
  profile: ALL_ADMIN_ROLES,
  settings: [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'bus-routes': [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  notices: [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'campus-journal': [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'career-management': [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'ai-insights': [ADMIN_ROLES.MAIN_ADMINISTRATOR],
  'academic-resources': [ADMIN_ROLES.FACULTY, ADMIN_ROLES.MAIN_ADMINISTRATOR],
  timetable: [ADMIN_ROLES.FACULTY, ADMIN_ROLES.MAIN_ADMINISTRATOR],
}

export const ADMIN_NAVIGATION = {
  [ADMIN_ROLES.HOSTEL_MANAGEMENT]: [
    ['dashboard', 'Dashboard'],
    ['hostel', 'Hostel Management'],
    ['room-allocation', 'Room Allocation'],
    ['hostel-students', 'Hostel Students'],
    ['complaints', 'Hostel Complaints'],
    ['maintenance', 'Maintenance'],
    ['reports', 'Hostel Reports'],
    ['notifications', 'Notifications'],
    ['profile', 'Profile'],
  ],
  [ADMIN_ROLES.MESS_MANAGER]: [
    ['dashboard', 'Dashboard'],
    ['mess', 'Mess Management'],
    ['todays-menu', "Today's Menu"],
    ['mess-attendance', 'Meal Feedback'],
    ['complaints', 'Food Complaints'],
    ['reports', 'Mess Reports'],
    ['notifications', 'Notifications'],
    ['profile', 'Profile'],
  ],
  [ADMIN_ROLES.FACULTY]: [
    ['dashboard', 'Dashboard'],
    ['classes', 'Classes'],
    ['attendance', 'Student Attendance'],
    ['students', 'Students'],
    ['assignments', 'Assignments'],
    ['academic-performance', 'Academic Performance'],
    ['academic-resources', 'Academic Resource', [
      ['academic-resources/syllabus', 'Syllabus'],
      ['timetable', 'Timetable'],
      ['academic-resources/pyq', 'PYQ'],
      ['academic-resources/class-material', 'Class Material'],
    ]],
    ['results', 'Results'],
    ['notifications', 'Notifications'],
    ['profile', 'Profile'],
  ],
  [ADMIN_ROLES.ACCOUNT_EXAMINATION]: [
    ['dashboard', 'Dashboard'],
    ['fees', 'Fees'],
    ['payments', 'Payments'],
    ['results', 'Exam Results'],
    ['reports', 'Reports'],
    ['notifications', 'Notifications'],
    ['profile', 'Profile'],
  ],
  [ADMIN_ROLES.MAIN_ADMINISTRATOR]: [
    ['dashboard', 'Dashboard'],
    ['ai-insights', 'AI Insights'],
    ['notices', 'Notices'],
    ['bus-routes', 'Bus Routes'],
    ['users', 'User Management'],
    ['campus-journal', 'News / Journal'],
    ['requests', 'Leave & Requests'],
    ['help-desk', 'Campus Help Desk'],
    ['students', 'Students'],
    ['faculty', 'Faculty'],
    ['hostel', 'Hostel'],
    ['mess', 'Mess'],
    ['attendance', 'Attendance'],
    ['complaints', 'Complaints'],
    ['accounts', 'Accounts & Fees'],
    ['results', 'Examination'],
    ['assignments', 'Assignments'],
    ['notifications', 'Notifications'],
    ['reports', 'Reports'],
    ['settings', 'Settings'],
    ['profile', 'Profile'],
    ['room-finder', 'Room Directory'],
    ['career-management', 'Career Management'],
    ['academic-resources', 'Academic Resource', [
      ['academic-resources/syllabus', 'Syllabus'],
      ['timetable', 'Timetable'],
      ['academic-resources/pyq', 'PYQ'],
      ['academic-resources/class-material', 'Class Material'],
    ]],
  ],
}

export function getAdminHomePath(adminRole, email) {
  if (adminRole === ADMIN_ROLES.HOSTEL_MANAGEMENT && !isHostelManagementEmail(email)) {
    return '/unauthorized'
  }
  return ADMIN_ROLE_HOME[adminRole] || '/unauthorized'
}

export function canAccessAdminPath(adminRole, pathname, email) {
  if (adminRole === ADMIN_ROLES.MAIN_ADMINISTRATOR) return true
  if (adminRole === ADMIN_ROLES.HOSTEL_MANAGEMENT && !isHostelManagementEmail(email)) return false
  const segment = pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'dashboard'
  return Boolean(PATH_ACCESS[segment]?.includes(adminRole))
}

export function getAdminNavigation(adminRole) {
  const links = ADMIN_NAVIGATION[adminRole] || []
  return links.map(([path, label, children]) => ({
    to: `/admin/${path}`,
    label,
    children: Array.isArray(children) ? children.map(([childPath, childLabel]) => ({
      to: `/admin/${childPath}`,
      label: childLabel,
    })) : null,
  }))
}
