'use client'

import { useState, useEffect, useCallback } from 'react'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_HEADERS } from '../constants'
import type { UserData, AvaPermissions } from '../types'
import { resolvePermissions, isPro, isCustomPlan, voiceQuotaMinutes } from '../types'
import { encryptApiKey, decryptApiKey } from '../../../utils/cryptoApiKey'

function nextMonthReset(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
}

// Check if monthly reset is needed and return corrected user object
function applyVoiceReset(u: UserData): UserData {
  const resetAt = u.voice_quota_reset_at ? new Date(u.voice_quota_reset_at) : null
  if (!resetAt || resetAt <= new Date()) {
    return { ...u, voice_minutes_used: 0, voice_quota_reset_at: nextMonthReset() }
  }
  return u
}

const SESSION_KEY = 'ava_web_session'
const SELECT_FIELDS = 'id,email,credits,free_daily_credits,subscription_source,subscription_expires_at,subscription_tier,referral_code,telegram_id,first_name,last_name,voice_minutes_used,voice_quota_reset_at,custom_plan_expires_at,gemini_api_key_enc,gemini_api_key_iv,gemini_key_hint,text_messages_used,text_quota_reset_at'

async function fetchMemory(userId: string): Promise<string> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/ava_user_memory?user_id=eq.${userId}&select=summary&limit=1`,
      { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
    )
    const data = await res.json()
    return Array.isArray(data) && data[0]?.summary ? data[0].summary : ''
  } catch {
    return ''
  }
}

export function useUserData() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [permissions, setPermissions] = useState<AvaPermissions>({ webSearch: false, imageUpload: false, unlimited: false, canUseCustomApiKey: false, dailyTextMessages: 10, voiceMonthlyMinutes: 3, dailyWebSearches: 0, memoryWordLimit: 150, agentDailyLimit: 0, mcpDailyLimit: 0, desktopDailyLimit: 0 })
  const [customApiKey, setCustomApiKey] = useState<string | null>(null)

  // Load saved session on mount + refresh memory + apply voice reset
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) {
        const raw = JSON.parse(saved) as UserData
        const u = applyVoiceReset(raw)
        setUser(u)
        setPermissions(resolvePermissions(u))
        // Persist reset if it happened
        if (u.voice_minutes_used !== raw.voice_minutes_used) {
          const { memorySummary: _, ...toStore } = u
          localStorage.setItem(SESSION_KEY, JSON.stringify(toStore))
          fetch(`${SUPABASE_URL}/rest/v1/ava_users?id=eq.${u.id}`, {
            method: 'PATCH',
            headers: { ...SUPABASE_HEADERS, Prefer: 'return=minimal' },
            body: JSON.stringify({ voice_minutes_used: 0, voice_quota_reset_at: u.voice_quota_reset_at }),
          }).catch(() => {})
        }
        // Refresh memory in background
        fetchMemory(u.id).then(memorySummary => {
          if (memorySummary) setUser(prev => prev ? { ...prev, memorySummary } : prev)
        })
      }
    } catch {}
  }, [])

  const login = useCallback(async (identifier: string, pin: string) => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ identifier: identifier.trim(), pin }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setLoginError((err as any).error ?? 'Identifiant ou PIN incorrect')
        return
      }
      const result = await res.json()
      if (result.user) {
        const u = applyVoiceReset(result.user as UserData)
        const perms = resolvePermissions(u)
        setPermissions(perms)
        setUser(u)
        const { memorySummary: _ms, ...toStore } = u
        localStorage.setItem(SESSION_KEY, JSON.stringify(toStore))
        // Déchiffrer la clé API Gemini si plan Custom actif
        if (perms.canUseCustomApiKey && u.gemini_api_key_enc && u.gemini_api_key_iv) {
          try {
            const decrypted = await decryptApiKey(u.gemini_api_key_enc, u.gemini_api_key_iv, pin, u.id)
            setCustomApiKey(decrypted)
          } catch {}
        }
        // Fetch memory async — inject into user state without blocking login
        fetchMemory(u.id).then(memorySummary => {
          if (memorySummary) setUser(prev => prev ? { ...prev, memorySummary } : prev)
        })
      }
    } catch {
      setLoginError('Erreur de connexion. Réessayez.')
    } finally {
      setLoginLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setPermissions({ webSearch: false, imageUpload: false, unlimited: false, canUseCustomApiKey: false, dailyTextMessages: 10, voiceMonthlyMinutes: 3, dailyWebSearches: 0, memoryWordLimit: 150, agentDailyLimit: 0, mcpDailyLimit: 0, desktopDailyLimit: 0 })
    setCustomApiKey(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!user) return
    try {
      const url = `${SUPABASE_URL}/rest/v1/ava_users?id=eq.${user.id}&select=${SELECT_FIELDS}`
      const res = await fetch(url, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const u = { ...data[0] as UserData, memorySummary: user.memorySummary }
        setUser(u)
        setPermissions(resolvePermissions(u))
        localStorage.setItem(SESSION_KEY, JSON.stringify(data[0]))
        // Re-fetch memory so the next session benefits from the updated summary
        fetchMemory(u.id).then(memorySummary => {
          if (memorySummary) setUser(prev => prev ? { ...prev, memorySummary } : prev)
        })
      }
    } catch {}
  }, [user])

  const updatePin = useCallback(async (newPin: string): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Non connecté' }
    if (!/^\d{4,6}$/.test(newPin)) return { ok: false, error: 'Le PIN doit contenir 4 à 6 chiffres' }
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ava_users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: { ...SUPABASE_HEADERS, Prefer: 'return=minimal' },
        body: JSON.stringify({ pin: newPin }),
      })
      if (res.ok || res.status === 204) {
        return { ok: true }
      }
      return { ok: false, error: 'Erreur lors de la mise à jour' }
    } catch {
      return { ok: false, error: 'Erreur réseau. Réessayez.' }
    }
  }, [user])

  // Decrement 1 credit per completed turn (free users only)
  const decrementCredits = useCallback(async () => {
    if (!user || isPro(user)) return
    // Decrement free_daily_credits first, then credits
    const newFree = Math.max(0, (user.free_daily_credits ?? 0) - 1)
    const newPaid = (user.free_daily_credits ?? 0) > 0
      ? (user.credits ?? 0)
      : Math.max(0, (user.credits ?? 0) - 1)

    const updated: UserData = { ...user, free_daily_credits: newFree, credits: newPaid }
    setUser(updated)
    // Don't save memorySummary to localStorage
    const { memorySummary: _, ...toStore } = updated
    localStorage.setItem(SESSION_KEY, JSON.stringify(toStore))

    // Persist to Supabase (best-effort, non-blocking)
    fetch(`${SUPABASE_URL}/rest/v1/ava_users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...SUPABASE_HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify({ free_daily_credits: newFree, credits: newPaid }),
    }).catch(() => {})
  }, [user])

  // Add voice session duration (seconds) to monthly counter
  const trackVoiceTime = useCallback(async (durationSeconds: number) => {
    if (!user || durationSeconds < 1) return
    // Check if a monthly reset is needed before adding
    const u = applyVoiceReset(user)
    const minutesToAdd = durationSeconds / 60
    const newUsed = (u.voice_minutes_used ?? 0) + minutesToAdd
    const newQuota = voiceQuotaMinutes(u)
    const updated: UserData = {
      ...u,
      voice_minutes_used: Math.min(newUsed, newQuota), // cap at quota
      voice_quota_reset_at: u.voice_quota_reset_at,
    }
    setUser(updated)
    const { memorySummary: _, ...toStore } = updated
    localStorage.setItem(SESSION_KEY, JSON.stringify(toStore))
    fetch(`${SUPABASE_URL}/rest/v1/ava_users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...SUPABASE_HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify({
        voice_minutes_used: updated.voice_minutes_used,
        voice_quota_reset_at: updated.voice_quota_reset_at,
      }),
    }).catch(() => {})
  }, [user])

  const saveApiKey = useCallback(async (apiKey: string, pin: string): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Non connecté' }
    try {
      const { enc, iv, hint } = await encryptApiKey(apiKey, pin, user.id)
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ava_users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: { ...SUPABASE_HEADERS, Prefer: 'return=minimal' },
        body: JSON.stringify({ gemini_api_key_enc: enc, gemini_api_key_iv: iv, gemini_key_hint: hint }),
      })
      if (res.ok || res.status === 204) {
        // Déchiffrer immédiatement pour activer la session courante
        try {
          const decrypted = await decryptApiKey(enc, iv, pin, user.id)
          setCustomApiKey(decrypted)
        } catch {}
        setUser(u => u ? { ...u, gemini_key_hint: hint, gemini_api_key_enc: enc, gemini_api_key_iv: iv } : u)
        return { ok: true }
      }
      return { ok: false, error: 'Erreur serveur' }
    } catch {
      return { ok: false, error: 'Erreur de chiffrement' }
    }
  }, [user])

  const removeApiKey = useCallback(async (): Promise<{ ok: boolean }> => {
    if (!user) return { ok: false }
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/ava_users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: { ...SUPABASE_HEADERS, Prefer: 'return=minimal' },
        body: JSON.stringify({ gemini_api_key_enc: null, gemini_api_key_iv: null, gemini_key_hint: null }),
      })
      setCustomApiKey(null)
      setUser(u => u ? { ...u, gemini_key_hint: null, gemini_api_key_enc: null, gemini_api_key_iv: null } : u)
      return { ok: true }
    } catch {
      return { ok: false }
    }
  }, [user])

  const incrementTextMessages = useCallback(async (): Promise<{ blocked: boolean }> => {
    if (!user) return { blocked: true }
    const limit = permissions.dailyTextMessages
    const now = new Date()
    const resetAt = user.text_quota_reset_at ? new Date(user.text_quota_reset_at) : null
    const needsReset = !resetAt || resetAt <= now
    const currentUsed = needsReset ? 0 : (user.text_messages_used ?? 0)
    if (limit !== -1 && currentUsed >= limit) return { blocked: true }
    const newUsed = currentUsed + 1
    const nextReset = needsReset
      ? new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()
      : user.text_quota_reset_at!
    setUser(u => u ? { ...u, text_messages_used: newUsed, text_quota_reset_at: nextReset } : u)
    fetch(`${SUPABASE_URL}/rest/v1/ava_users?id=eq.${user.id}`, {
      method: 'PATCH',
      headers: { ...SUPABASE_HEADERS, Prefer: 'return=minimal' },
      body: JSON.stringify({ text_messages_used: newUsed, text_quota_reset_at: nextReset }),
    }).catch(() => {})
    return { blocked: false }
  }, [user, permissions])

  return {
    user, setUser, permissions,
    loginLoading, loginError, login, logout,
    refreshUser, updatePin, decrementCredits, trackVoiceTime,
    customApiKey, saveApiKey, removeApiKey,
    incrementTextMessages,
  }
}
