import test from 'node:test'
import assert from 'node:assert/strict'

import { buildDynamicInsights } from './insightFallback.js'

test('buildDynamicInsights groups repeated campus issues into recurring alerts', () => {
  const complaints = [
    { status: 'Open', category: 'Water', location: 'Block A' },
    { status: 'Open', category: 'Water', location: 'Block A' },
    { status: 'Open', category: 'Water', location: 'Block B' },
    { status: 'Resolved', category: 'Water', location: 'Block C' },
    { status: 'Open', category: 'Power', location: 'Block D' },
  ]

  const insights = buildDynamicInsights(complaints)

  assert.equal(insights.length, 1)
  assert.equal(insights[0].title, 'Recurring Water Issues')
  assert.equal(insights[0].count, 3)
  assert.equal(insights[0].location, 'Block A')
})
