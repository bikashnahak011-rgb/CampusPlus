import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeComplaint, askCampusAssistant, getCampusAssistantReply, getCampusWebsiteHelp } from './aiService.js'

test('analyzeComplaint uses a rule-based fallback for noisy complaints', async () => {
  const result = await analyzeComplaint('Water leaking from pipe in hostel block A room 203')
  assert.equal(result.category, 'Water')
  assert.equal(result.priority, 'High')
  assert.ok(result.department)
})

test('getCampusAssistantReply answers common campus questions', () => {
  const reply = getCampusAssistantReply('What is today mess menu?')
  assert.match(reply.toLowerCase(), /mess|menu|breakfast|lunch|dinner/)
})

test('getCampusAssistantReply answers broader campus service questions', () => {
  const hostelReply = getCampusAssistantReply('Where is my hostel room and warden details?')
  const busReply = getCampusAssistantReply('When does the bus leave campus?')
  assert.match(hostelReply.toLowerCase(), /hostel|room|warden|block/)
  assert.match(busReply.toLowerCase(), /bus|route|transport|timing|pickup/)
})

test('website guidance gives role-specific admin and student workflows', () => {
  const adminReply = getCampusWebsiteHelp('How do I edit bus routes?', {
    role: 'admin',
    admin_role: 'main_administrator',
  })
  const studentReply = getCampusWebsiteHelp('How do I request a document?', { role: 'student' })
  assert.match(adminReply, /Admin.*Bus Routes/i)
  assert.match(studentReply, /Student.*Documents/i)
})

test('quick campus keywords give role-aware help for students and administrators', () => {
  const student = { role: 'student' }
  const admin = { role: 'admin', admin_role: 'main_administrator' }

  assert.match(getCampusWebsiteHelp('Leave', student), /Student.*Leave & Gate Pass/i)
  assert.match(getCampusWebsiteHelp('Gate Pass', student), /Student.*Leave & Gate Pass/i)
  assert.match(getCampusWebsiteHelp('Mess', student), /Student.*Mess/i)
  assert.match(getCampusWebsiteHelp('Leave', admin), /Admin.*Leave & Requests/i)
  assert.match(getCampusWebsiteHelp('Gate Pass', admin), /Admin.*Leave & Requests/i)
  assert.match(getCampusWebsiteHelp('Mess', admin), /Admin.*Mess/i)
})

test('demo assistant answers sample-data questions instead of requiring a live account', async () => {
  const reply = await askCampusAssistant("What is today's mess menu?", { id: 'demo-student', isDemo: true })
  assert.match(reply, /Breakfast|Lunch|Dinner/i)
  assert.doesNotMatch(reply, /sign in with your campus account/i)
})

test('demo assistant gives sample records for every admin role and students', async () => {
  const demo = { isDemo: true }
  const cases = [
    [{ ...demo, role: 'admin', admin_role: 'main_administrator' }, 'Show current campus issues', /Sample demo data.*C-2408/s],
    [{ ...demo, role: 'admin', admin_role: 'hostel_management' }, 'Show open maintenance requests', /Sample demo data.*H-204/s],
    [{ ...demo, role: 'admin', admin_role: 'mess_manager' }, 'Show meal feedback', /Sample demo data.*MF-038/s],
    [{ ...demo, role: 'admin', admin_role: 'faculty' }, 'Show pending assignments', /Sample demo data.*DSA Assignment/s],
    [{ ...demo, role: 'admin', admin_role: 'account_examination' }, 'Show pending fees and results', /Sample demo data.*CS2021047/s],
    [{ ...demo, role: 'student', id: 'stu-001' }, 'What is my attendance?', /Sample demo data.*Programming in Python/s],
    [{ ...demo, role: 'student', id: 'stu-001' }, 'Show my gate pass status', /Sample demo data.*GP-104/s],
  ]

  for (const [user, prompt, expected] of cases) {
    assert.match(await askCampusAssistant(prompt, user), expected)
  }
})

test('real-user assistant fallback does not invent demo attendance data', async () => {
  const reply = await askCampusAssistant(
    'What is my attendance?',
    { id: 'real-student', isDemo: false },
  )
  assert.match(reply, /unavailable/i)
  assert.doesNotMatch(reply, /85%|200 of 235/i)
})
