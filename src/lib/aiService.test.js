import test from 'node:test'
import assert from 'node:assert/strict'
import { analyzeComplaint, getCampusAssistantReply } from './aiService.js'

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
