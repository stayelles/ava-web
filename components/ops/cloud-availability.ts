type CloudEntitlement = { status?: string | null; expires_at?: string | null } | null | undefined

/** Presentation of the same state + expiry checks enforced by Ava OPS server-side. */
export function cloudAvailability(machineState: string | null | undefined, entitlement: CloudEntitlement, nowMs: number) {
  const expiresAtMs = Date.parse(entitlement?.expires_at ?? '')
  const expiryKnown = Number.isFinite(expiresAtMs)
  const expired = expiryKnown && expiresAtMs <= nowMs
  const active = entitlement?.status === 'active' && expiryKnown && !expired
  const machineReady = machineState === 'ready' || machineState === 'running'
  const status = expired ? 'expired' : entitlement?.status === 'active' && !expiryKnown ? 'unverified' : entitlement?.status || 'inactive'
  const blockedBy = expired ? 'expired' : entitlement?.status !== 'active' ? 'inactive' : !expiryKnown ? 'unknown_expiry' : !machineReady ? 'machine' : null
  return { ready: active && machineReady, status, blockedBy, expiresAtMs }
}
