import { DEMO_MESS_MENU, DEMO_SUBJECTS } from '../data/demoData.js'
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
    return 'Campus transport is available through the Bus Routes page.\n\n• Check the route timings and stops\n• View the live route list\n• Contact the transport office if your pickup point is missing\n\nIf you want, I can help you find a route for your hostel or department.'
  }

  if (/(hostel|room|warden|block|floor|accommodation)/.test(lower)) {
    return 'Your hostel details can be checked from the Hostel page.\n\n• Block and room assignment\n• Warden contact details\n• Room status and maintenance requests\n\nIf your room is missing, contact the hostel office or submit a complaint.'
  }

  if (/(timetable|class|lecture|lab|schedule|seminar|exam)/.test(lower)) {
    return 'Use the Timetable page to view your class schedule and room assignments.\n\n• Check this week’s timetable\n• See subject-wise room details\n• Review the latest exam or schedule updates\n\nYour department and profile must match the published timetable.'
  }

  if (/(faculty|teacher|mentor|professor|staff|department)/.test(lower)) {
    return 'Open the Faculty page to search faculty by name, subject, qualification, or department.\n\nIt helps you find the right teacher, subject lead, or staff contact for academic queries.'
  }

  if (/(notice|announcement|event|holiday|campus update|calendar)/.test(lower)) {
    return 'Campus notices and updates are shown in the Notifications and Notices sections.\n\nCheck there for academic notices, hostel updates, events, and important announcements from the admin team.'
  }

  if (/(mess|menu|food|meal|canteen|breakfast|lunch|dinner|snack)/.test(lower)) {
    return `Today is ${today}. Here's the menu:\n🌅 Breakfast: ${menu?.breakfast || 'Not available'}\n☀️ Lunch: ${menu?.lunch || 'Not available'}\n🌙 Dinner: ${menu?.dinner || 'Not available'}\n\nView the full weekly menu in the Mess section.`
  }

  if (/(attendance|present|absent|marks|grade|score|percentage)/.test(lower)) {
    const avg = Math.round(DEMO_SUBJECTS.reduce((sum, sub) => sum + (sub.present / sub.total) * 100, 0) / DEMO_SUBJECTS.length)
    const low = DEMO_SUBJECTS.filter(sub => (sub.present / sub.total) * 100 < 80)
    return `Your overall attendance is ~${avg}%. ${low.length > 0 ? `⚠️ ${low.map(s => s.name).join(', ')} ${low.length > 1 ? 'are' : 'is'} below 80%.` : 'All subjects are above 80%.'}\n\nGo to the Attendance page for details.`
  }

  if (/(gate pass|gatepass|pass)/.test(lower)) {
    return 'To apply for a Gate Pass:\n1. Open Leave & Gate Pass\n2. Click “New Request”\n3. Choose “Gate Pass”\n4. Fill in the destination, date, and time\n5. Submit for approval\n\nYou will receive a notification after approval.'
  }

  if (/(leave|outing|absence)/.test(lower)) {
    return 'To apply for leave:\n1. Go to Leave & Gate Pass\n2. Click “New Request”\n3. Choose “Leave”\n4. Fill in dates and reason\n5. Submit\n\nLeave requests require warden and admin approval.'
  }

  if (/(bonafide|certificate|document|transcript|record|request)/.test(lower)) {
    return 'To request a document or certificate:\n1. Go to Documents\n2. Click “New Request”\n3. Select the document type\n4. Enter the reason\n5. Submit\n\nThe admin will review it and notify you when ready.'
  }

  if (/(complaint|problem|issue|water|electric|leak|maintenance|cleaning|wifi|network)/.test(lower)) {
    return 'To report a problem:\n1. Open Complaints\n2. Click “Report a Problem”\n3. Describe the issue and location\n4. Let AI auto-detect the category and priority\n5. Submit\n\nYou will get a complaint ID and status updates.'
  }

  if (/(fee|payment|dues|fine|scholarship|invoice)/.test(lower)) {
    return 'View your fee details in the Fees section.\nPending amount: ₹15,000\n\nFor payment, use the online portal or visit the accounts office.'
  }

  if (/(hello|hi|hey|good morning|good afternoon|good evening)/.test(lower)) {
    return `Hello ${user?.name?.split(' ')[0] || 'there'}! I can help with mess menu, attendance, complaints, gate pass, hostel, bus routes, documents, and fees.\n\nWhat do you need?`
  }

  return 'I can help with campus services like mess menu, attendance, complaints, gate pass, hostel, bus routes, documents, faculty, and fees. Try asking something specific, such as “What is today’s mess menu?” or “How do I request a document?”'
}

export function getCampusWebsiteHelp(message, user = {}) {
  const text = String(message || '').trim().toLowerCase()
  const asksHowTo = /\b(how|where|which page|navigate|find|open|use|add|edit|update|submit|apply)\b/.test(text)
  if (!text) return 'Ask me how to use any student or admin page, or ask about your live campus records.'
  if (/\b(hello+|h+i+|hey+)\b/.test(text)) {
    return `Hello ${user?.name?.split(' ')[0] || 'there'}! I can guide you around NexCampus or look up information available to your account.`
  }
  if (!asksHowTo) return null

  if (user.role === 'admin') {
    if (/bus|route|gps|transport/.test(text)) return 'Open Admin → Bus Routes. Use Add route to publish a route, Edit route to change its details, or Start GPS sharing on the driver device to transmit its location.'
    if (/room|classroom|library|lab|availability/.test(text)) return 'Open Admin → Room Directory. Use Add room to publish a campus space, then Update live status to change its availability or visitor note.'
    if (/faculty|teacher|qualification|subject/.test(text)) return 'Open Admin → Faculty. Add or edit a faculty member’s name, qualification, classes, and subjects there.'
    if (/mess|menu|meal|feedback|food/.test(text)) return 'Open Admin → Mess. Choose a weekday, select Edit menu, and save the meal details. Student ratings appear under Feedback.'
    if (/notice|announcement/.test(text)) return 'Open Admin → Notices and choose Publish Notice. Published notices appear to students under Notifications → Notices.'
    if (/leave|gate pass|gatepass|document|request|approve/.test(text)) return 'Open Admin → Requests. Choose Documents or Leave & Gate Pass, then review and approve or reject a request.'
    if (/attendance|timetable|class schedule/.test(text)) return 'Open Admin → Attendance to review published attendance. Timetables are filtered by each student’s department; maintain subject and timetable records in Supabase.'
    if (/student|profile|account/.test(text)) return 'Open Admin → Students to search student profiles. Assign administrator access only to trusted accounts from Supabase.'
    return 'Use the Admin sidebar to manage students, faculty, transport, campus rooms, notices, requests, mess menus, attendance, and analytics.'
  }

  if (/complaint|problem|issue/.test(text)) return 'Open Student → Complaints, choose Report a Problem, describe the issue and location, then submit it to receive a tracking ID.'
  if (/leave|gate pass|gatepass/.test(text)) return 'Open Student → Leave & Gate Pass, choose Leave or Gate Pass, fill in the reason, destination, and dates, then submit for approval.'
  if (/document|certificate|request/.test(text)) return 'Open Student → Documents, choose New Request, select the document type, add the reason, and submit. Track its status on the same page.'
  if (/attendance/.test(text)) return 'Open Student → Attendance for subject-wise records and your current attendance percentage. Your profile must be assigned to the correct account.'
  if (/timetable|class schedule|classes/.test(text)) return 'Open Student → Timetable and select a weekday. Your profile department must match the published timetable.'
  if (/mess|menu|meal|food/.test(text)) return 'Open Student → Mess to view the published weekly menu and leave a rating for today’s meal.'
  if (/fee|payment|due/.test(text)) return 'Open Student → Fees & Dues to view posted fee records. Online payment is not connected yet; use your campus’s official payment channel.'
  if (/hostel|room|warden/.test(text)) return 'Open Student → Hostel for your assigned block, room, and published warden details. Contact the hostel office if your assignment is missing.'
  if (/notification|notice|announcement/.test(text)) return 'Use the header bell or Student → Notifications. Campus announcements are under the Notices tab.'
  if (/faculty|teacher|qualification|subject/.test(text)) return 'Open Student → Faculty to search faculty by name, qualification, class, or subject.'
  if (/bus|route|gps|transport/.test(text)) return 'Open Student → Bus Routes to view published routes and any location shared by campus transport.'
  if (/profile|account|department/.test(text)) return 'Open Student → Profile to review your details. Keep your department, year, hostel, and room assignment accurate so related pages can show the right records.'
  return 'Use My Services or the sidebar to open campus features. I can guide you through attendance, timetable, hostel, mess, fees, requests, complaints, notices, faculty, and bus routes.'
}

export async function askCampusAssistant(message, user = {}, { signal, history = [] } = {}) {
  const prompt = String(message || '').trim()
  if (!prompt) return 'Type a question about using NexCampus or your campus records.'

  if (user.isDemo) {
    return 'Sign in with your campus account to use Campus AI.'
  }

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

    const websiteHelp = getCampusWebsiteHelp(prompt, user)
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
