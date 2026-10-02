import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeComplaint, getCampusAssistantReply, getCampusWebsiteHelp } from './aiService.js'

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
  const adminReply = getCampusWebsiteHelp('How do I edit bus routes?', { role: 'admin' })
  const studentReply = getCampusWebsiteHelp('How do I request a document?', { role: 'student' })
  assert.match(adminReply, /Admin.*Bus Routes/i)
  assert.match(studentReply, /Student.*Documents/i)
})

test('real-user assistant fallback does not invent demo attendance data', async () => {
  const reply = await (await import('./aiService.js')).askCampusAssistant(
    'What is my attendance?',
    { id: 'real-student', isDemo: false },
  )
  assert.match(reply, /unavailable/i)
  assert.doesNotMatch(reply, /85%|200 of 235/i)
})
