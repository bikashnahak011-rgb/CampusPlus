import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ADMIN_ROLES,
  canAccessAdminPath,
  getAdminHomePath,
  isHostelManagementEmail,
} from './adminRoles.js'

test('only the designated address is a Hostel Management identity', () => {
  assert.equal(isHostelManagementEmail('dragonfire0222@gmail.com'), true)
  assert.equal(isHostelManagementEmail(' DragonFire0222@Gmail.com '), true)
  assert.equal(isHostelManagementEmail('other@example.com'), false)
})

test('hostel access is tied to the designated email', () => {
  assert.equal(getAdminHomePath(ADMIN_ROLES.HOSTEL_MANAGEMENT, 'dragonfire0222@gmail.com'), '/admin/hostel')
  assert.equal(getAdminHomePath(ADMIN_ROLES.HOSTEL_MANAGEMENT, 'other@example.com'), '/unauthorized')
  assert.equal(canAccessAdminPath(ADMIN_ROLES.HOSTEL_MANAGEMENT, '/admin/hostel', 'other@example.com'), false)
  assert.equal(canAccessAdminPath(ADMIN_ROLES.HOSTEL_MANAGEMENT, '/admin/hostel', 'dragonfire0222@gmail.com'), true)
})

test('Main Administrator can access every admin route', () => {
  assert.equal(canAccessAdminPath(ADMIN_ROLES.MAIN_ADMINISTRATOR, '/admin/users'), true)
  assert.equal(canAccessAdminPath(ADMIN_ROLES.MAIN_ADMINISTRATOR, '/admin/settings'), true)
  assert.equal(canAccessAdminPath(ADMIN_ROLES.MAIN_ADMINISTRATOR, '/admin/hostel'), true)
})

test('accounts without an assigned admin role are not promoted to Main Administrator', () => {
  assert.equal(getAdminHomePath(null), '/unauthorized')
  assert.equal(canAccessAdminPath(null, '/admin/users'), false)
})

test('specialized administrators remain limited to their assigned modules', () => {
  assert.equal(canAccessAdminPath(ADMIN_ROLES.MESS_MANAGER, '/admin/mess'), true)
  assert.equal(canAccessAdminPath(ADMIN_ROLES.MESS_MANAGER, '/admin/users'), false)
  assert.equal(canAccessAdminPath(ADMIN_ROLES.FACULTY, '/admin/assignments'), true)
  assert.equal(canAccessAdminPath(ADMIN_ROLES.ACCOUNT_EXAMINATION, '/admin/assignments'), false)
  assert.equal(canAccessAdminPath(ADMIN_ROLES.MAIN_ADMINISTRATOR, '/admin/assignments'), true)
})
