import test from 'node:test'
import assert from 'node:assert/strict'
import { isPdfAssignmentFile } from './academicResources.js'

test('assignment files must be PDFs', () => {
  assert.equal(isPdfAssignmentFile({ name: 'homework.pdf', type: 'application/pdf' }), true)
  assert.equal(isPdfAssignmentFile({ name: 'homework.pdf', type: '' }), true)
  assert.equal(isPdfAssignmentFile({ name: 'homework.docx', type: 'application/pdf' }), false)
  assert.equal(isPdfAssignmentFile({ name: 'homework.pdf', type: 'image/png' }), false)
  assert.equal(isPdfAssignmentFile(null), false)
})
