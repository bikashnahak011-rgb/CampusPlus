import {
  DEMO_MESS_MENU,
  DEMO_STUDENT,
  DEMO_SUBJECTS,
  getDemoAttendance,
  getDemoTimetable,
} from '../data/demoData.js'
import { requestBackend } from './backendApi.js'

const KEYWORDS = {
  Water: ['water', 'pipe', 'leak', 'tap', 'drain', 'flood', 'plumb', 'wet', 'drip', 'overflow', 'supply', 'geyser', 'hot water'],
  Electricity: ['electric', 'power', 'light', 'socket', 'switch', 'fan', 'ac', 'current', 'voltage', 'bulb', 'wire', 'short circuit', 'trip'],
  Cleaning: ['clean', 'dirty', 'garbage', 'waste', 'sweep', 'mop', 'hygiene', 'smell', 'odor', 'trash', 'dust', 'cockroach', 'pest'],
  Mess: ['food', 'meal', 'mess', 'breakfast', 'lunch', 'dinner', 'cook', 'taste', 'quality', 'canteen', 'stale', 'rotten'],
  Academic: ['class', 'teacher', 'faculty', 'exam', 'result', 'marks', 'attendance', 'lecture', 'lab', 'course', 'syllabus'],
  Transport: ['bus', 'vehicle', 'transport', 'driver', 'route', 'timing', 'cab', 'auto'],
  Hostel: ['hostel', 'room', 'bed', 'furniture', 'door', 'window', 'lock', 'key', 'warden', 'mattress', 'cupboard'],
}

const DEPT = {
  Water: 'Hostel Maintenance',
  Electricity: 'Electrical Maintenance',
  Cleaning: 'Housekeeping',
  Mess: 'Mess Committee',
  Academic: 'Academic Office',
  Transport: 'Transport Office',
  Hostel: 'Hostel Office',
  Other: 'Administration',
}

const HIGH_WORDS = ['urgent', 'emergency', 'immediately', 'danger', 'hazard', 'slippery', 'flood', 'fire', 'serious', 'critical', 'not working', 'broken', 'burst']
const LOW_WORDS = ['minor', 'small', 'little', 'sometimes', 'occasionally', 'slight']

function extractLocation(text) {
  const block = text.match(/block\s*([a-zA-Z])/i)
  const room = text.match(/room\s*(\d+)/i)
  const floor = text.match(/floor\s*(\d+)/i)
  let loc = 'Campus'

  if (block) loc = `Hostel Block ${block[1].toUpperCase()}`
  if (room) loc += `, Room ${room[1]}`
  else if (floor) loc += `, Floor ${floor[1]}`

  return loc
}

function normalizeResult(result) {
  if (!result) return null

  const category = String(result.category || 'Other')
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/^Water\s*\/\s*Plumbing$/i, 'Water')
    .split('/')[0]
    .trim()

  const priority = ['High', 'Medium', 'Low'].includes(result.priority) ? result.priority : 'Medium'
  const department = result.department || DEPT[category] || DEPT.Other
  const location = result.location || extractLocation(result.description || '') || 'Campus'

  return {
    category,
    priority,
    department,
    location,
    suggestedAction: result.suggestedAction || 'Schedule follow-up through the appropriate campus office.',
    source: result.source || 'mock',
  }
}

function mockAnalyze(description) {
  const lower = description.toLowerCase()
  let category = 'Other', maxScore = 0

  for (const [cat, words] of Object.entries(KEYWORDS)) {
    const score = words.filter(word => lower.includes(word)).length
    if (score > maxScore) {
      maxScore = score
      category = cat
    }
  }

  let priority = 'Medium'

  const isHighRiskCategory = ['Water', 'Electricity', 'Security'].includes(category)
  const infrastructureFailure =
    (category === 'Water' && (lower.includes('leak') || lower.includes('pipe') || lower.includes('overflow') || lower.includes('flood') || lower.includes('supply')))
    || (category === 'Electricity' && (lower.includes('not working') || lower.includes('short circuit') || lower.includes('spark') || lower.includes('trip') || lower.includes('socket')))
    || (category === 'Cleaning' && lower.includes('rodent'))

  if (HIGH_WORDS.some(word => lower.includes(word)) || isHighRiskCategory && infrastructureFailure) priority = 'High'
  else if (LOW_WORDS.some(word => lower.includes(word))) priority = 'Low'

  const location = extractLocation(description)
  const department = DEPT[category] || DEPT.Other
  const actions = {
    High: 'Dispatch team immediately and escalate to the department head.',
    Medium: 'Schedule repair within 24 hours.',
    Low: 'Schedule during the next maintenance cycle.',
  }

  return {
    category,
    priority,
    department,
    location,
    suggestedAction: actions[priority],
    confidence: maxScore > 0 ? Math.min(0.95, 0.6 + maxScore * 0.1) : 0.5,
    source: 'mock',
  }
}

export async function analyzeComplaint(description, user = {}) {
  if (user.isDemo || !user.id) {
    return normalizeResult({ ...mockAnalyze(description), source: 'demo-rules' })
  }

  try {
    const result = await requestBackend('complaints/classify', {
      method: 'POST',
      body: { description },
    })
    return normalizeResult(result)
  } catch {
    return normalizeResult({ ...mockAnalyze(description), source: 'local-rules' })
  }
}

export function getCampusAssistantReply(message, user = {}) {
  const text = String(message || '').trim()
  if (!text) return 'Please type a question and I will help you.'

  const lower = text.toLowerCase()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const menu = DEMO_MESS_MENU[today]

  if (/(bus|route|transport|pickup|stop|timing|driver|shuttle|travel)/.test(lower)) {
    return 'Campus transport is available through the Bus Routes page.\n\nâ€¢ Check the route timings and stops\nâ€¢ View the live route list\nâ€¢ Contact the transport office if your pickup point is missing\n\nIf you want, I can help you find a route for your hostel or department.'
  }

  if (/(hostel|room|warden|block|floor|accommodation)/.test(lower)) {
    return 'Your hostel details can be checked from the Hostel page.\n\nâ€¢ Block and room assignment\nâ€¢ Warden contact details\nâ€¢ Room status and maintenance requests\n\nIf your room is missing, contact the hostel office or submit a complaint.'
  }

  if (/(timetable|class|lecture|lab|schedule|seminar|exam)/.test(lower)) {
    return 'Use the Timetable page to view your class schedule and room assignments.\n\nâ€¢ Check this weekâ€™s timetable\nâ€¢ See subject-wise room details\nâ€¢ Review the latest exam or schedule updates\n\nYour department and profile must match the published timetable.'
  }

  if (/(faculty|teacher|mentor|professor|staff|department)/.test(lower)) {
    return 'Open the Faculty page to search faculty by name, subject, qualification, or department.\n\nIt helps you find the right teacher, subject lead, or staff contact for academic queries.'
  }

  if (/(notice|announcement|event|holiday|campus update|calendar)/.test(lower)) {
    return 'Campus notices and updates are shown in the Notifications and Notices sections.\n\nCheck there for academic notices, hostel updates, events, and important announcements from the admin team.'
  }

  if (/(mess|menu|food|meal|canteen|breakfast|lunch|dinner|snack)/.test(lower)) {
    return `Today is ${today}. Here's the menu:\nðŸŒ… Breakfast: ${menu?.breakfast || 'Not available'}\nâ˜€ï¸ Lunch: ${menu?.lunch || 'Not available'}\nðŸŒ™ Dinner: ${menu?.dinner || 'Not available'}\n\nView the full weekly menu in the Mess section.`
  }

  if (/(attendance|present|absent|marks|grade|score|percentage)/.test(lower)) {
    const avg = Math.round(DEMO_SUBJECTS.reduce((sum, sub) => sum + (sub.present / sub.total) * 100, 0) / DEMO_SUBJECTS.length)
    const low = DEMO_SUBJECTS.filter(sub => (sub.present / sub.total) * 100 < 80)
    return `Your overall attendance is ~${avg}%. ${low.length > 0 ? `âš ï¸ ${low.map(s => s.name).join(', ')} ${low.length > 1 ? 'are' : 'is'} below 80%.` : 'All subjects are above 80%.'}\n\nGo to the Attendance page for details.`
  }

  if (/(gate pass|gatepass|pass)/.test(lower)) {
    return 'To apply for a Gate Pass:\n1. Open Leave & Gate Pass\n2. Click â€œNew Requestâ€\n3. Choose â€œGate Passâ€\n4. Fill in the destination, date, and time\n5. Submit for approval\n\nYou will receive a notification after approval.'
  }

  if (/(leave|outing|absence)/.test(lower)) {
    return 'To apply for leave:\n1. Go to Leave & Gate Pass\n2. Click â€œNew Requestâ€\n3. Choose â€œLeaveâ€\n4. Fill in dates and reason\n5. Submit\n\nLeave requests require warden and admin approval.'
  }

  if (/(bonafide|certificate|document|transcript|record|request)/.test(lower)) {
    return 'To request a document or certificate:\n1. Go to Documents\n2. Click â€œNew Requestâ€\n3. Select the document type\n4. Enter the reason\n5. Submit\n\nThe admin will review it and notify you when ready.'
  }

  if (/(complaint|problem|issue|water|electric|leak|maintenance|cleaning|wifi|network)/.test(lower)) {
    return 'To report a problem:\n1. Open Complaints\n2. Click â€œReport a Problemâ€\n3. Describe the issue and location\n4. Let AI auto-detect the category and priority\n5. Submit\n\nYou will get a complaint ID and status updates.'
  }

  if (/(fee|payment|dues|fine|scholarship|invoice)/.test(lower)) {
    return 'View your fee details in the Fees section.\nPending amount: â‚¹15,000\n\nFor payment, use the online portal or visit the accounts office.'
  }

  if (/(hello|hi|hey|good morning|good afternoon|good evening)/.test(lower)) {
    return `Hello ${user?.name?.split(' ')[0] || 'there'}! I can help with mess menu, attendance, complaints, gate pass, hostel, bus routes, documents, and fees.\n\nWhat do you need?`
  }

  return 'I can help with campus services like mess menu, attendance, complaints, gate pass, hostel, bus routes, documents, faculty, and fees. Try asking something specific, such as â€œWhat is todayâ€™s mess menu?â€ or â€œHow do I request a document?â€'
}

export function getCampusWebsiteHelp(message, user = {}) {
  const text = String(message || '').trim().toLowerCase()
  const isKeywordPrompt = /^(leave|mess|gate ?pass)$/.test(text)
  const asksHowTo = /\b(how\s+(?:do|can|should|to|does\s+(?:this|the portal|the website)|is\s+(?:this|the portal|the website) used)|where\s+(?:do|can|is|are|should)|which\s+(?:page|menu|section)|navigate|find|open|use|add|edit|update|submit|apply|show me|help me|can i|what page|what is the page for)\b/.test(text)
  if (!text) return 'Ask me how to use any student or admin page, or ask about your live campus records.'
  if (/\b(hello+|h+i+|hey+|good morning|good afternoon|good evening)\b/.test(text)) {
    return `Hello ${user?.name?.split(' ')[0] || 'there'}! I can guide you around NexCampus or look up information available to your account.`
  }
  // Answer short feature keywords locally. Personal-record questions still use
  // the authenticated backend so replies can use current campus data.
  const campusFeature = /\b(attendance|attendence|present|absent|class|classes|timetable|time table|schedule|lecture|complaint|complaints|issue|maintenance|request|requests|document|certificate|leave|outing|gate ?pass|hostel|warden|room|mess|menu|meal|food|breakfast|lunch|dinner|fee|fees|payment|dues|scholarship|result|results|exam|grade|marks?|notice|notification|announcement|faculty|teacher|bus|route|transport|syllabus|pyq|assignment|career|internship|job|placement|journal|profile|password|settings|support|help)\b/.test(text)
  const asksForLiveRecord = /\b(my|mine|today'?s|today|this week|current|latest)\b/.test(text) && campusFeature
  if (asksForLiveRecord && !asksHowTo) return null
  const isWebsiteQuestion = asksHowTo || campusFeature || /\b(website|web site|portal|app|screen|page|feature|button|dashboard|sign ?in|log ?in|register|sign ?up|account)\b/.test(text)
  if (!isWebsiteQuestion) return null

  if (user.role === 'admin') {
    const rolePages = {
      main_administrator: 'Requests, Complaints, Attendance, Students, Faculty, Hostel, Mess, Fees, Results, Timetable, Academic Resources, Notices, Bus Routes, Room Directory, User Management, and Reports',
      faculty: 'Classes, Student Attendance, Students, Assignments, Academic Resources, Timetable, and Results',
      hostel_management: 'Hostel Management, Room Allocation, Hostel Students, Hostel Complaints, Maintenance, and Hostel Reports',
      mess_manager: 'Mess Management, Todayâ€™s Menu, Meal Feedback, Food Complaints, and Mess Reports',
      account_examination: 'Fees, Payments, Exam Results, and Reports',
    }
    const pages = rolePages[user.admin_role] || 'the pages assigned to your administrator role'
    if (/bus|route|gps|transport/.test(text)) return user.admin_role === 'main_administrator'
      ? 'Open Admin â†’ Bus Routes. Add or edit a route there. To share a live location, open the route on the driverâ€™s device and start GPS sharing; the device must allow location access.'
      : `Bus Routes is available to the Main Administrator. Your role can access ${pages}.`
    if (/room|classroom|library|lab|availability|map/.test(text)) return /main_administrator|hostel_management/.test(user.admin_role || '')
      ? 'Open Admin â†’ Room Directory to add a room or update its live status and visitor note.'
      : `Room Directory is not included in your current role. Your role can access ${pages}.`
    if (/faculty|teacher|qualification/.test(text)) return user.admin_role === 'main_administrator'
      ? 'Open Admin â†’ Faculty to add or edit faculty names, qualifications, classes, and subjects.'
      : user.admin_role === 'faculty'
        ? 'Open Admin â†’ Faculty to review your faculty profile and teaching assignments. The Main Administrator manages the directory.'
        : `Faculty management is available to the Main Administrator. Your role can access ${pages}.`
    if (/food complaint/.test(text)) return ['main_administrator', 'mess_manager'].includes(user.admin_role)
      ? 'Open Admin â†’ Food Complaints to review food-related issues. The Mess Manager sees food complaints; the Main Administrator can review all complaints.'
      : `Food complaints are available to the Mess Manager and Main Administrator. Your role can access ${pages}.`
    if (/mess|menu|meal|feedback|food/.test(text)) {
      if (!asksHowTo && !isKeywordPrompt && !/edit|update|publish|manage|feedback/.test(text)) return null
      return ['main_administrator', 'mess_manager'].includes(user.admin_role)
        ? 'Open Admin â†’ Mess to edit the weekly menu and review feedback. Todayâ€™s Menu opens the menu view; Meal Feedback shows student ratings.'
        : `Mess management is available to the Mess Manager and Main Administrator. Your role can access ${pages}.`
    }
    if (/notice|announcement/.test(text)) return user.admin_role === 'main_administrator'
      ? 'Open Admin â†’ Notices, choose Publish Notice, set its audience and priority, then publish it. Students see published notices under Notifications â†’ Notices.'
      : `Notice publishing is available to the Main Administrator. Your role can access ${pages}.`
    if (/leave|gate pass|gatepass|document|request|approve/.test(text)) return user.admin_role === 'main_administrator'
      ? 'Open Admin â†’ Leave & Requests. Select Documents or Leave & Gate Pass, open a request, then approve or reject it and add a note if needed.'
      : `Request review is available to the Main Administrator. Your role can access ${pages}.`
    if (/fee|payment|dues|accounts/.test(text)) return ['account_examination', 'main_administrator'].includes(user.admin_role)
      ? 'Open Admin â†’ Fees or Accounts & Fees to review student charges and payment records. Use Reports for summaries.'
      : `Fees and payment records are available to Account & Examination and the Main Administrator. Your role can access ${pages}.`
    if (/result|exam|grade|marks?/.test(text)) return ['faculty', 'account_examination', 'main_administrator'].includes(user.admin_role)
      ? 'Open Admin â†’ Results or Exam Results to view and publish academic results. Faculty access is limited to assigned subjects.'
      : `Exam results are available to Faculty, Account & Examination, and the Main Administrator. Your role can access ${pages}.`
    if (/report|analytics|statistics|insight/.test(text)) return ['hostel_management', 'mess_manager', 'account_examination', 'main_administrator'].includes(user.admin_role)
      ? 'Open Admin â†’ Reports to review role-scoped analytics. The Main Administrator can also open AI Insights for campus-wide summaries.'
      : `Reports are not included in your current role. Your role can access ${pages}.`
    if (/attendance|timetable|class|schedule|assignment|syllabus|pyq|material|resource/.test(text)) {
      if (['faculty', 'main_administrator'].includes(user.admin_role)) {
        if (/assignment/.test(text)) return 'Open Admin â†’ Assignments to review assignment PDFs. Faculty can upload resources for their assigned subjects under Academic Resource.'
        if (/timetable|schedule/.test(text)) return 'Open Admin â†’ Academic Resource â†’ Timetable to view or manage the class schedule. Student matches depend on department, semester, and section.'
        if (/attendance/.test(text)) return 'Open Admin â†’ Student Attendance to review attendance records. Faculty access is limited to assigned subjects.'
        return 'Open Admin â†’ Classes to see todayâ€™s schedule. Use Academic Resource â†’ Timetable to manage the schedule; faculty edits are limited to assigned subjects.'
      }
      return `Academic pages are available to Faculty and the Main Administrator. Your role can access ${pages}.`
    }
    if (/complaint|problem|issue|maintenance/.test(text)) return user.admin_role === 'main_administrator'
      ? 'Open Admin â†’ Complaints to review and update campus issues. Hostel and Mess roles see complaints scoped to their work areas.'
      : ['hostel_management', 'mess_manager'].includes(user.admin_role)
        ? 'Open Admin â†’ Complaints to review issues assigned to your area. Hostel staff see maintenance-related issues; Mess staff see food-related issues.'
        : `Complaint management is not included in your current role. Your role can access ${pages}.`
    if (/student|profile|account|role|permission/.test(text)) return user.admin_role === 'main_administrator'
      ? 'Open Admin â†’ Students to find student profiles. Use Admin â†’ User Management to assign administrator roles; role changes are restricted to the Main Administrator.'
      : `Open Admin â†’ Profile to review your account. Your role can access ${pages}; the Main Administrator manages account roles.`
    if (/career|internship|job|placement/.test(text)) return user.admin_role === 'main_administrator'
      ? 'Open Admin â†’ Career Management to publish career paths, opportunities, and workshops for students.'
      : `Career Management is available to the Main Administrator. Your role can access ${pages}.`
    if (/dashboard|overview|home/.test(text)) return 'Open Admin â†’ Dashboard to see the summary available to your administrator role.'
    if (/login|sign in|register|sign up|password/.test(text)) return 'Use the Login page to sign in with your campus account. New students should register with their campus email and verify it. For access or role problems, contact the Main Administrator.'
    return `Use the Admin sidebar to open your roleâ€™s pages: ${pages}. If you tell me the feature name, I can give the exact steps.`
  }

  if (/complaint|problem|issue|report|broken|leak|repair|maintenance|not working/.test(text)) return 'Open Student â†’ Complaints, choose Report a Problem, add the location and a clear description, then submit. Youâ€™ll get a tracking ID and can follow status updates on the same page.'
  if (/leave|gate ?pass|gatepass|outing|permission to leave|early leave/.test(text)) return 'Open Student â†’ Leave & Gate Pass, choose Leave or Gate Pass, enter the reason, destination, and dates/times, then submit for approval. Check the same page for status.'
  if (/document|certificate|transcript|bonafide|study certificate|character certificate|request/.test(text)) return 'Open Student â†’ Documents â†’ New Request, select the document type, enter why you need it, and submit. Track its status on the Documents page.'
  if (/attendance|attendence|present|absent|percentage|shortage|proxy/.test(text)) return 'Open Student â†’ Attendance for subject-wise records. If it says â€œNo data,â€ ask your faculty to publish attendance and check that your student profile is linked to the correct account.'
  if (/timetable|time table|class|classes|lecture|schedule|period|classroom|room for class/.test(text)) return 'Open Student â†’ Timetable and select a weekday. Classes appear when your profileâ€™s department, semester, and section match the published timetable.'
  if (/mess|menu|meal|food|breakfast|lunch|dinner/.test(text)) return asksHowTo || isKeywordPrompt || /page|section|feature/.test(text) ? 'Open Student â†’ Mess to view the weekly menu and submit meal feedback. Menu details are live campus data, so ask me â€œWhat is todayâ€™s menu?â€ to check the published menu.' : null
  if (/fee|fees|payment|due|dues|scholarship|tuition|fine|receipt/.test(text)) return 'Open Student â†’ Fees & Dues to view posted charges and payment status. Online payment is not connected in this portal yet; use your campusâ€™s official payment channel.'
  if (/hostel|room|warden|block|accommodation|dorm|residence/.test(text)) return 'Open Student â†’ Hostel for your assigned block, room, and published warden details. If an assignment is missing, check Student â†’ Profile and contact the hostel office.'
  if (/notification|notice|announcement|event|circular|alert/.test(text)) return 'Open the bell in the top header or Student â†’ Notifications. Published campus notices are in the Notices tab.'
  if (/faculty|teacher|qualification|professor|subject/.test(text)) return 'Open Student â†’ Faculty to search faculty by name, qualification, class, or subject.'
  if (/bus|route|gps|transport|shuttle/.test(text)) return 'Open Student â†’ Bus Routes to see published stops and timings. A live location appears only when the driver is sharing GPS.'
  if (/syllabus|previous year|\bpyq\b|study material|class material|assignment|homework|notes|question paper|past paper/.test(text)) return 'Open Student â†’ Academic Resources, then choose Syllabus, Timetable, PYQ, Class Material, or Assignments. Only faculty-approved resources appear there.'
  if (/career|internship|job|placement|workshop/.test(text)) return 'Open Student â†’ Career Hub to browse published opportunities, career paths, and workshops, then follow the application instructions on each item.'
  if (/journal|publish|article|poem|story/.test(text)) return 'Open Student â†’ Campus Journal to browse campus stories or submit your own writing for review.'
  if (/faculty|department|profile|account|personal details/.test(text)) return 'Open Student â†’ Profile to review your account and academic details. Correct department, semester, and section values help attendance and timetable records match your account.'
  if (/login|sign in|register|sign up|password|verify email/.test(text)) return 'Use the Login page with your campus email. New students should register, verify their email, then sign in. Use Forgot Password if you cannot access your account.'
  if (/service|feature|page|website|portal|app|dashboard|navigate|menu|section/.test(text)) return 'The student portal includes Dashboard, Services, Attendance, Timetable, Complaints, Leave & Gate Pass, Documents, Hostel, Mess, Fees, Results, Notifications, Faculty, Bus Routes, Academic Resources, Career Hub, and Campus Journal. Open Services or the sidebar to navigate.'
  if (asksHowTo) return 'Use Student â†’ Services or the sidebar to find the feature. I can give steps for Attendance, Timetable, Complaints, Leave & Gate Pass, Documents, Hostel, Mess, Fees, Results, Notices, Faculty, Bus Routes, Academic Resources, Career Hub, or Campus Journal.'
  if (/not working|not showing|missing|cannot|can't|doesn't work|error|broken|stuck/.test(text)) return 'I can help troubleshoot that. Tell me which page and what you expected to happen. If records are missing, check Student â†’ Profile for the correct department, semester, and section, then ask the relevant office to publish the records.'
  return null
}

function getDemoCampusDataReply(message, user) {
  const text = String(message || '').trim().toLowerCase()
  const role = user.role === 'admin' ? user.admin_role : 'student'
  const sampleNote = 'Sample demo data — these examples are not live campus records.'
  const respond = details => `${sampleNote}\n\n${details}`

  if (role === 'main_administrator' && /\b(overview|summary|dashboard|campus status|how many students|student count)\b/.test(text)) {
    return respond('Campus overview: 428 students across 6 departments, 24 faculty members, 12 open complaints (3 high priority), 7 requests awaiting review, 86% average attendance, and 18 fee items pending.')
  }

  if (role === 'hostel_management' && /\b(overview|summary|dashboard|hostel status|occupancy|rooms|maintenance summary)\b/.test(text)) {
    return respond('Hostel overview: 186 of 210 beds are occupied, 24 beds are available, and 6 maintenance tasks are open (2 urgent). Sample cases: H-204, Block A Room 203 — washbasin leak (High); H-198, Block B Room 116 — cupboard hinge repair (Medium); H-193, Block A Room 108 — corridor light (Low).')
  }

  if (role === 'mess_manager' && /\b(overview|summary|dashboard|mess status|feedback summary|meal ratings)\b/.test(text)) {
    return respond('Mess overview: 312 meals served in the sample day, 4.2/5 average feedback from 38 ratings, and 3 food-related complaints to review. Sample feedback: breakfast variety 4/5, lunch quality 4/5, dinner temperature 3/5.')
  }

  if (role === 'faculty' && /\b(overview|summary|dashboard|class status|attendance summary|my students)\b/.test(text)) {
    const subjects = getDemoAttendance(user)
    const average = Math.round(subjects.reduce((sum, subject) => sum + subject.present / subject.total * 100, 0) / subjects.length)
    return respond(`Academic snapshot: ${subjects.length} sample subjects, ${average}% average attendance, and 2 assignments awaiting review. Sample attendance: ${subjects.map(subject => `${subject.name} ${Math.round(subject.present / subject.total * 100)}% (${subject.present}/${subject.total})`).join('; ')}.`)
  }

  if (role === 'account_examination' && /\b(overview|summary|dashboard|finance summary|fees summary|payment status|examination summary)\b/.test(text)) {
    return respond('Accounts & Examination overview: 18 sample fee items need follow-up, 42 payments were recorded this week, and 6 examination result groups are ready for review. Example fee records: CS2021047 — ₹15,000 pending; ME2022031 — paid; EC2021118 — ₹4,500 pending.')
  }

  if (role === 'student' && /\b(attendance|attendence|present|absent|percentage|shortage)\b/.test(text)) {
    const subjects = getDemoAttendance(user)
    const average = Math.round(subjects.reduce((sum, subject) => sum + subject.present / subject.total * 100, 0) / subjects.length)
    const belowThreshold = subjects.filter(subject => subject.present / subject.total < 0.75)
    const name = user.name || DEMO_STUDENT.name
    return respond(`${name}'s sample attendance is ${average}% overall. ${subjects.map(subject => `${subject.name}: ${Math.round(subject.present / subject.total * 100)}% (${subject.present}/${subject.total})`).join('; ')}.${belowThreshold.length ? ` Check with your faculty about ${belowThreshold.map(subject => subject.name).join(' and ')}.` : ''}`)
  }

  if (role === 'student' && /\b(timetable|time table|class schedule|today'?s classes|next class)\b/.test(text)) {
    const timetable = getDemoTimetable(user)
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const todaysClasses = timetable.filter(entry => entry.day.toLowerCase() === today.toLowerCase())
    const entries = todaysClasses.length ? todaysClasses : timetable.slice(0, 3)
    return respond(`${todaysClasses.length ? `Sample classes for ${today}` : 'Sample timetable entries'}: ${entries.map(entry => `${entry.time} ${entry.subject} in ${entry.room} (${entry.faculty})`).join('; ')}.`)
  }

  if (role === 'student' && /\b(my )?(hostel|room|warden|block|accommodation)\b/.test(text)) {
    return respond(`${user.name || DEMO_STUDENT.name}'s sample room assignment is Hostel Block ${user.hostel_block || DEMO_STUDENT.hostel_block}, Room ${user.room_number || DEMO_STUDENT.room_number}. The sample warden desk is open 9:00 AM–5:00 PM; contact the hostel office for urgent maintenance.`)
  }

  if (role === 'student' && /\b(my )?(fee|fees|payment|dues|invoice)\b/.test(text)) {
    return respond('Sample fee account: ₹15,000 pending for the current term; last sample payment ₹25,000 recorded on 12 August. This is a demonstration only—check Fees in the portal for your actual account.')
  }

  if (role === 'student' && /\b(gate pass|gatepass|leave|outing|request status|my request)\b/.test(text)) {
    return respond('Sample requests: GP-104, Saturday outing — Approved; LV-087, one-day leave — Pending warden review; GP-099, evening pass — Returned for a destination update. For a real request, open Student → Leave & Gate Pass.')
  }

  if (role === 'main_administrator' && /\b(complaint|complaints|issues|maintenance)\b/.test(text) && /\b(show|list|open|pending|summary|many|status|current|urgent|high)\b/.test(text)) {
    return respond('Open sample complaints: C-2408, Block A Room 203 — water leak (High, Hostel Maintenance); C-2405, dining hall — meal temperature (Medium, Mess Committee); C-2399, Library 2F — lights flickering (High, Electrical Maintenance). 9 additional sample complaints are marked In Progress or Pending.')
  }

  if (role === 'main_administrator' && /\b(request|requests|approval|approvals|leave|gate pass)\b/.test(text) && /\b(show|list|open|pending|summary|many|status|current|queue)\b/.test(text)) {
    return respond('Sample approval queue: 4 leave requests, 2 gate passes, and 1 document request await review. Example: LV-087 — one-day leave (Warden Review); GP-104 — Saturday outing (Approved); DOC-061 — bonafide certificate (Pending Admin Review).')
  }

  if (role === 'mess_manager' && /\b(feedback|rating|food complaint|food issue)\b/.test(text) && /\b(show|list|open|pending|summary|many|status|current|review)\b/.test(text)) {
    return respond('Sample mess feedback: MF-038, dinner served warm — 3/5; MF-037, good lunch variety — 4/5; MF-036, breakfast on time — 5/5. Sample food complaints: MC-014 stale bread (High) and MC-012 limited vegan option (Medium).')
  }

  if (role === 'hostel_management' && /\b(maintenance|complaint|repair|work order)\b/.test(text) && /\b(show|list|open|pending|summary|many|status|current|urgent)\b/.test(text)) {
    return respond('Sample maintenance queue: H-204 Block A Room 203 washbasin leak (High); H-198 Block B Room 116 cupboard hinge (Medium); H-193 Block A corridor light (Low); H-188 Block C Room 302 window latch (Medium).')
  }

  if (role === 'faculty' && /\b(assignment|assignments|submission|submissions|class|classes)\b/.test(text) && /\b(show|list|open|pending|summary|many|status|current|review|today)\b/.test(text)) {
    return respond('Sample academic queue: DSA Assignment 1 — 28 submissions, 6 awaiting review (due 20 Oct); DBMS SQL Lab — 24 submissions, 3 awaiting review (due 23 Oct); Networks Routing — 19 submissions, due 27 Oct. Sample classes include Programming in Python at 09:00 in CS-101.')
  }

  if (role === 'account_examination' && /\b(fee|fees|payment|payments|dues|result|results|exam|examination)\b/.test(text) && /\b(show|list|pending|summary|many|status|current|records|review)\b/.test(text)) {
    return respond('Sample account queue: CS2021047 — ₹15,000 pending; ME2022031 — paid; EC2021118 — ₹4,500 pending. Sample examination queue: 6 result groups ready for review, with 2 awaiting final verification.')
  }

  if (role === 'student' && /\b(mess|menu|meal|food|breakfast|lunch|dinner)\b/.test(text) && /\b(today|menu|what|show|week|breakfast|lunch|dinner)\b/.test(text)) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
    const menu = DEMO_MESS_MENU[today]
    const weekly = /\b(week|weekly)\b/.test(text)
    const menuText = weekly
      ? Object.entries(DEMO_MESS_MENU).map(([day, meals]) => `${day}: breakfast ${meals.breakfast}; lunch ${meals.lunch}; dinner ${meals.dinner}`).join('\n')
      : `${today}'s sample menu: Breakfast — ${menu?.breakfast || 'Not available'}; Lunch — ${menu?.lunch || 'Not available'}; Dinner — ${menu?.dinner || 'Not available'}.`
    return respond(`${menuText}\n\nCheck the Mess page for the published menu.`)
  }

  return null
}

export async function askCampusAssistant(message, user = {}, { signal, history = [] } = {}) {
  const prompt = String(message || '').trim()
  if (!prompt) return 'Type a question about using NexCampus or your campus records.'

  if (user.isDemo) {
    const demoDataReply = getDemoCampusDataReply(prompt, user)
    if (demoDataReply) return demoDataReply
  }

  const websiteHelp = getCampusWebsiteHelp(prompt, user)
  if (websiteHelp) return websiteHelp
  if (user.isDemo) return getCampusAssistantReply(prompt, user)

  try {
    const result = await requestBackend('ai/ask', {
      method: 'POST',
      body: {
        question: prompt,
        history: history.slice(-10).map(({ role, content }) => ({ role, content })),
      },
      signal,
    })
    return String(result.answer || 'The campus assistant returned no answer.')
  } catch (error) {
    if (signal?.aborted) throw error

    if (error.status === 401) {
      return 'Your campus sign-in has expired. Sign out and sign in again, then retry your question.'
    }
    if (error.status === 403) {
      return 'Your campus account does not have an active student or administrator role. Ask the Main Administrator to check your profile.'
    }

    if (websiteHelp) return websiteHelp

    const fallbackPath = user.role === 'admin'
      ? 'assistant/admin'
      : user.role === 'student'
        ? 'assistant/student'
        : null

    if (fallbackPath) {
      try {
        const fallback = await requestBackend(fallbackPath, {
          method: 'POST',
          body: { question: prompt },
          signal,
        })
        if (fallback?.answer) return String(fallback.answer)
      } catch (fallbackError) {
        if (signal?.aborted) throw fallbackError
        if (fallbackError.status === 401) {
          return 'Your campus sign-in has expired. Sign out and sign in again, then retry your question.'
        }
        if (fallbackError.status === 403) {
          return 'Your campus account does not have an active student or administrator role. Ask the Main Administrator to check your profile.'
        }
      }
    }

    return 'Campus AI is unavailable right now. The live campus assistant needs its Poe API key configured in the backend hosting settings.'
  }
}
