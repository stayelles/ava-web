import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cloudAvailability } from '../components/ops/cloud-availability.ts'

const expires_at = '2026-11-05T15:54:08Z'
const expiry = Date.parse(expires_at)
test('stored active status becomes visibly expired at its expiry, even on a ready machine', () => {
  const entitlement = { status: 'active', expires_at }
  assert.equal(cloudAvailability('ready', entitlement, expiry - 1).ready, true)
  for (const now of [expiry, Date.parse('2026-11-05T21:02:20Z')]) {
    const access = cloudAvailability('ready', entitlement, now)
    assert.equal(access.ready, false)
    assert.equal(access.status, 'expired')
    assert.equal(access.blockedBy, 'expired')
  }
  assert.equal(entitlement.status, 'active') // No mutation of billing records.
})
test('an absent or invalid expiry remains blocked and has a distinct explanation', () => {
  for (const value of [null, '', 'invalid']) {
    assert.equal(cloudAvailability('ready', { status: 'active', expires_at: value }, expiry - 1).blockedBy, 'unknown_expiry')
  }
})
test('inactive access and unready machines retain their existing restrictions', () => {
  assert.equal(cloudAvailability('ready', null, expiry - 1).blockedBy, 'inactive')
  assert.equal(cloudAvailability('ready', { status: 'suspended', expires_at }, expiry - 1).ready, false)
  for (const state of [undefined, 'provisioning', 'stopped', 'deleted']) {
    assert.equal(cloudAvailability(state, { status: 'active', expires_at }, expiry - 1).blockedBy, 'machine')
  }
  assert.equal(cloudAvailability('running', { status: 'active', expires_at }, expiry - 1).ready, true)
})
