const KEYWORDS = {
  Water: ['water','pipe','leak','tap','drain','flood','plumb','wet','drip','overflow','supply','geyser','hot water'],
  Electricity: ['electric','power','light','socket','switch','fan','ac','current','voltage','bulb','wire','short circuit','trip'],
  Cleaning: ['clean','dirty','garbage','waste','sweep','mop','hygiene','smell','odor','trash','dust','cockroach','pest'],
  Mess: ['food','meal','mess','breakfast','lunch','dinner','cook','taste','quality','canteen','stale','rotten'],
  Academic: ['class','teacher','faculty','exam','result','marks','attendance','lecture','lab','course','syllabus'],
  Transport: ['bus','vehicle','transport','driver','route','timing','cab','auto'],
  Hostel: ['hostel','room','bed','furniture','door','window','lock','key','warden','mattress','cupboard'],
}

const DEPT = {
  Water: 'Hostel Maintenance', Electricity: 'Electrical Maintenance',
  Cleaning: 'Housekeeping', Mess: 'Mess Committee',
  Academic: 'Academic Office', Transport: 'Transport Office',
  Hostel: 'Hostel Office', Other: 'Administration',
}

const HIGH_WORDS = ['urgent','emergency','immediately','danger','hazard','slippery','flood','fire','serious','critical','not working','broken','burst']
const LOW_WORDS = ['minor','small','little','sometimes','occasionally','slight']

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

function mockAnalyze(description) {
  const lower = description.toLowerCase()
  let category = 'Other', maxScore = 0
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    const score = words.filter(w => lower.includes(w)).length
    if (score > maxScore) { maxScore = score; category = cat }
  }
  let priority = 'Medium'
  if (HIGH_WORDS.some(w => lower.includes(w))) priority = 'High'
  else if (LOW_WORDS.some(w => lower.includes(w))) priority = 'Low'
  const location = extractLocation(description)
  const department = DEPT[category] || DEPT.Other
  const actions = { High: 'Dispatch team immediately and escalate to department head.', Medium: 'Schedule repair within 24 hours.', Low: 'Schedule during next maintenance cycle.' }
  return { category: category === 'Water' ? 'Water / Plumbing' : category, priority, department, location, suggestedAction: actions[priority], confidence: maxScore > 0 ? Math.min(0.95, 0.6 + maxScore * 0.1) : 0.5, source: 'mock' }
}

async function openAIAnalyze(description) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey) return null
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a campus complaint routing AI. Return JSON only with fields: category, priority (High/Medium/Low), department, location, suggestedAction.' },
          { role: 'user', content: `Analyze: "${description}"` }
        ],
        max_tokens: 200, temperature: 0.3,
      }),
    })
    const data = await res.json()
    return { ...JSON.parse(data.choices[0].message.content), source: 'openai', confidence: 0.95 }
  } catch { return null }
}

export async function analyzeComplaint(description) {
  const ai = await openAIAnalyze(description)
  return ai || mockAnalyze(description)
}
