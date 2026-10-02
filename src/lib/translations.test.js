import test from 'node:test'
import assert from 'node:assert/strict'

import { normalizeLanguage, translateText } from './translations.js'

test('default language falls back to English', () => {
  assert.equal(normalizeLanguage(undefined), 'en')
  assert.equal(normalizeLanguage('fr'), 'en')
})

test('translations switch between English, Hindi, and Odia', () => {
  assert.equal(translateText('en', 'appName'), 'NexCampus')
  assert.equal(translateText('hi', 'appName'), 'नेककैम्पस')
  assert.equal(translateText('or', 'appName'), 'ନେକ୍କାମ୍ପସ୍')
  assert.equal(translateText('hi', 'features'), 'सुविधाएँ')
  assert.equal(translateText('or', 'settings'), 'ସେଟିଂସମୂହ')
})
