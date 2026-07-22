import { SUPABASE_HEADERS, SUPABASE_URL } from '../constants'
import type { UserData } from '../types'

export async function avaAiRequest(user: UserData, payload: Record<string, unknown>, timeoutMs = 30000) {
  if (!user.ava_session_token) throw new Error('SESSION_EXPIRED')
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ava-ai`, {
      method: 'POST', headers: SUPABASE_HEADERS, signal: controller.signal,
      body: JSON.stringify({ ...payload, user_id: user.id, ava_session_token: user.ava_session_token, surface: 'web' }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`)
    return data
  } finally {
    window.clearTimeout(timer)
  }
}

export async function avaSupportRequest(user: UserData, payload: Record<string, unknown>, timeoutMs = 30000) {
  if (!user.ava_session_token) throw new Error('SESSION_EXPIRED')
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ava-support`, {
      method: 'POST', headers: SUPABASE_HEADERS, signal: controller.signal,
      body: JSON.stringify({ ...payload, user_id: user.id, ava_session_token: user.ava_session_token }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`)
    return data
  } finally {
    window.clearTimeout(timer)
  }
}

export async function avaAiMediaRequest(user: UserData, payload: Record<string, unknown>, timeoutMs = 60000) {
  if (!user.ava_session_token) throw new Error('SESSION_EXPIRED')
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ava-ai-media`, {
      method: 'POST', headers: SUPABASE_HEADERS, signal: controller.signal,
      body: JSON.stringify({ ...payload, user_id: user.id, ava_session_token: user.ava_session_token }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`)
    return data
  } finally {
    window.clearTimeout(timer)
  }
}
