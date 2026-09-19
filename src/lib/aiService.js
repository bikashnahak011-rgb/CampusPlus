import { DEMO_MESS_MENU, DEMO_SUBJECTS } from '../data/demoData.js'

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {}

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
    confidence: Number(result.confidence) || 0.8,
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

async function openAIAnalyze(description) {
  const apiKey = env.VITE_OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a campus complaint routing AI. Return JSON only with fields: category, priority, department, location, suggestedAction.',
          },
          { role: 'user', content: `Analyze: "${description}"` },
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const raw = data?.choices?.[0]?.message?.content
    if (!raw) return null

    const parsed = JSON.parse(raw)
    return normalizeResult({ ...parsed, description, source: 'openai', confidence: 0.95 })
  } catch {
    return null
  }
}

export async function analyzeComplaint(description) {
  const ai = await openAIAnalyze(description)
  return normalizeResult(ai || { ...mockAnalyze(description), description })
}

export function getCampusAssistantReply(message, user = {}) {
  const text = String(message || '').trim()
  if (!text) return 'Please type a question and I will help you.'

  const lower = text.toLowerCase()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const menu = DEMO_MESS_MENU[today]

  if (lower.includes('mess') || lower.includes('menu') || lower.includes('food')) {
    return `Today is ${today}. Here's the menu:\n🌅 Breakfast: ${menu?.breakfast || 'Not available'}\n☀️ Lunch: ${menu?.lunch || 'Not available'}\n🌙 Dinner: ${menu?.dinner || 'Not available'}\n\nView the full weekly menu in the Mess section.`
  }

  if (lower.includes('attendance')) {
    const avg = Math.round(DEMO_SUBJECTS.reduce((sum, sub) => sum + (sub.present / sub.total) * 100, 0) / DEMO_SUBJECTS.length)
    const low = DEMO_SUBJECTS.filter(sub => (sub.present / sub.total) * 100 < 80)
    return `Your overall attendance is ~${avg}%. ${low.length > 0 ? `⚠️ ${low.map(s => s.name).join(', ')} ${low.length > 1 ? 'are' : 'is'} below 80%.` : 'All subjects are above 80%.'}\n\nGo to the Attendance page for details.`
  }

  if (lower.includes('gate pass') || lower.includes('gatepass')) {
    return 'To apply for a Gate Pass:\n1. Open Leave & Gate Pass\n2. Click “New Request”\n3. Choose “Gate Pass”\n4. Fill in the destination, date, and time\n5. Submit for approval\n\nYou will receive a notification after approval.'
  }

  if (lower.includes('bonafide') || lower.includes('certificate') || lower.includes('document')) {
    return 'To request a Bonafide Certificate:\n1. Go to Documents\n2. Click “New Request”\n3. Select “Bonafide Certificate”\n4. Enter the reason\n5. Submit\n\nThe admin will review it and notify you when ready.'
  }

  if (lower.includes('complaint') || lower.includes('problem') || lower.includes('issue') || lower.includes('water') || lower.includes('electric') || lower.includes('leak')) {
    return 'To report a problem:\n1. Open Complaints\n2. Click “Report a Problem”\n3. Describe the issue\n4. Let AI auto-detect the category and priority\n5. Submit\n\nYou will get a complaint ID and status updates.'
  }

  if (lower.includes('fee') || lower.includes('payment') || lower.includes('due')) {
    return 'View your fee details in the Fees section.\nPending amount: ₹15,000\n\nFor payment, use the online portal or visit the accounts office.'
  }

  if (lower.includes('hostel') || lower.includes('room') || lower.includes('warden')) {
    return 'You are in Hostel Block A, Room 203.\nWarden: Mr. Suresh Nair (📞 9876500001)\n\nUse the Complaints section for hostel issues or check the Hostel page for details.'
  }

  if (lower.includes('leave')) {
    return 'To apply for leave:\n1. Go to Leave & Gate Pass\n2. Click “New Request”\n3. Choose “Leave”\n4. Fill in dates and reason\n5. Submit\n\nLeave requests require warden and admin approval.'
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello ${user?.name?.split(' ')[0] || 'there'}! 👋 I can help with mess menu, attendance, complaints, gate pass, documents, and fees.\n\nWhat do you need?`
  }

  return 'I can help with campus services like mess menu, attendance, complaints, gate pass, documents, and fees. Try asking something specific or use the quick questions below.'
}

export async function askCampusAssistant(message, user = {}) {
  const baseUrl = env.VITE_AI_API_URL
  const prompt = String(message || '').trim()
  if (!prompt) return getCampusAssistantReply(prompt, user)

  if (baseUrl) {
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/assistant/student`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: prompt }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data?.answer) {
          return String(data.answer)
        }
      }
    } catch {
      // Fall back to the local campus assistant when the backend is unavailable.
    }
  }

  return getCampusAssistantReply(prompt, user)
}
