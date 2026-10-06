import test from 'node:test'
import assert from 'node:assert/strict'
import { DEMO_LOGIN_ACCOUNTS } from './demoAccounts.js'
import { ADMIN_ROLES } from '../lib/adminRoles.js'

test('demo account picker has one account for every portal role', () => {
  assert.deepEqual(
    DEMO_LOGIN_ACCOUNTS.map(({ role, admin_role }) => role === 'student' ? 'student' : admin_role),
    [
      'student',
      ADMIN_ROLES.HOSTEL_MANAGEMENT,
      ADMIN_ROLES.MESS_MANAGER,
      ADMIN_ROLES.FACULTY,
      ADMIN_ROLES.ACCOUNT_EXAMINATION,
      ADMIN_ROLES.MAIN_ADMINISTRATOR,
    ],
  )
})

test('the Hostel Management preview uses the designated email and unique demo identity', () => {
  const hostelAccount = DEMO_LOGIN_ACCOUNTS.find(({ admin_role }) => admin_role === ADMIN_ROLES.HOSTEL_MANAGEMENT)
  assert.equal(hostelAccount.email, 'dragonfire0222@gmail.com')
  assert.equal(hostelAccount.isDemo, true)
  assert.notEqual(hostelAccount.id, DEMO_LOGIN_ACCOUNTS.find(({ admin_role }) => admin_role === ADMIN_ROLES.MAIN_ADMINISTRATOR).id)
})
