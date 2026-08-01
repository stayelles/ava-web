'use client'

import { useState, useEffect, useCallback } from 'react'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_HEADERS } from '../constants'
import type { UserData, AvaPermissions } from '../types'
import { resolvePermissions, isCustomPlan } from '../types'

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
const SELECT_FIELDS = 'id,email,is_admin,credits,free_daily_credits,subscription_source,subscription_expires_at,subscription_plan,subscription_tier,paddle_subscription_id,paddle_renewal_cancelled_at,paddle_scheduled_cancel_at,paypal_subscription_id,paypal_plan_id,geniuspay_subscription_uuid,geniuspay_stripe_subscription_id,geniuspay_customer_id,mollie_customer_id,mollie_subscription_id,mollie_first_payment_id,mollie_last_payment_id,airwallex_customer_id,airwallex_checkout_id,airwallex_subscription_id,airwallex_price_id,airwallex_last_event_type,whop_checkout_id,whop_plan_id,whop_payment_id,whop_membership_id,whop_user_id,whop_last_event_type,nowpayments_payment_id,nowpayments_invoice_id,nowpayments_subscription_id,nowpayments_subscription_plan_id,nowpayments_last_status,nowpayments_last_event_id,billing_country_code,billing_country_name,billing_country_confirmed_at,ava_trading_trial_used,ava_trading_trial_started_at,ava_trading_trial_plan,ava_trading_trial_subscription_id,plan_switch_count,last_plan_change_at,subscription_abuse_flag,referral_code,telegram_id,first_name,last_name,voice_minutes_used,voice_quota_reset_at,custom_plan_expires_at,text_messages_used,text_quota_reset_at'

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

async function fetchUserProfile(userId: string): Promise<UserData | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/ava_users?id=eq.${userId}&select=${SELECT_FIELDS}`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
    })
    const data = await res.json()
    return Array.isArray(data) && data[0] ? data[0] as UserData : null
  } catch {
    return null
  }
}

export function useUserData() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [permissions, setPermissions] = useState<AvaPermissions>({ webSearch: false, imageUpload: false, unlimited: false, canUseCustomApiKey: false, dailyTextMessages: 10, voiceMonthlyMinutes: 3, dailyWebSearches: 0, memoryWordLimit: 150, agentDailyLimit: 0, mcpDailyLimit: 0, desktopDailyLimit: 0, canUseAvaTrading: false })

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
        }
        fetchUserProfile(u.id).then(fresh => {
          if (!fresh) return
          const updated = applyVoiceReset({ ...fresh, web_session_token: u.web_session_token, ava_session_token: u.ava_session_token, memorySummary: u.memorySummary })
          setUser(updated)
          setPermissions(resolvePermissions(updated))
          const { memorySummary: _, ...toStore } = updated
          localStorage.setItem(SESSION_KEY, JSON.stringify(toStore))
        })
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
        body: JSON.stringify({ identifier: identifier.trim(), pin, surface: 'web' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setLoginError((err as { error?: string }).error ?? 'Identifiant ou PIN incorrect')
        return
      }
      const result = await res.json()
      if (result.user) {
        const u = applyVoiceReset({
          ...(result.user as UserData),
          web_session_token: result.web_session_token ?? result.ava_session_token ?? result.user.web_session_token ?? null,
          ava_session_token: result.ava_session_token ?? result.web_session_token ?? null,
        })
        const perms = resolvePermissions(u)
        setPermissions(perms)
        setUser(u)
        const { memorySummary: _ms, ...toStore } = u
        localStorage.setItem(SESSION_KEY, JSON.stringify(toStore))
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

  const registerRequest = useCallback(async (email: string, pin: string, lang = 'fr', referralCode?: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const body: Record<string, string> = { email: email.trim(), pin, lang }
      if (referralCode?.trim()) body.referral_code = referralCode.trim()
      const res = await fetch(`${SUPABASE_URL}/functions/v1/email-signup-request`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify(body),
      })
      const result = await res.json()
      if (!res.ok || result.error) {
        return { ok: false, error: result.error ?? 'Erreur lors de la création du compte' }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Erreur réseau' }
    }
  }, [])

  const registerVerify = useCallback(async (email: string, code: string, pin: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/email-signup-verify`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      })
      const result = await res.json()
      if (!res.ok || result.error) {
        return { ok: false, error: result.error ?? 'Code incorrect ou expiré' }
      }
      
      // Verification succeeded, now log in using the regular login flow to populate local state & storage
      await login(email, pin)
      return { ok: true }
    } catch {
      return { ok: false, error: 'Erreur réseau' }
    }
  }, [login])

  const requestPinReset = useCallback(async (email: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/pin-reset-request`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({ email: email.trim() }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error) {
        return { ok: false, error: result.error ?? 'Impossible d’envoyer le lien' }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Erreur réseau' }
    }
  }, [])

  const confirmPinReset = useCallback(async (email: string, token: string, newPin: string): Promise<{ ok: boolean; error?: string }> => {
    if (!/^\d{4,5}$/.test(newPin)) return { ok: false, error: 'Le PIN doit contenir 4 à 5 chiffres' }
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/pin-reset-confirm`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({ email: email.trim(), token: token.trim(), pin: newPin }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error) {
        return { ok: false, error: result.error ?? 'Lien invalide ou expiré' }
      }
      return { ok: true }
    } catch {
      return { ok: false, error: 'Erreur réseau' }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setPermissions({ webSearch: false, imageUpload: false, unlimited: false, canUseCustomApiKey: false, dailyTextMessages: 10, voiceMonthlyMinutes: 3, dailyWebSearches: 0, memoryWordLimit: 150, agentDailyLimit: 0, mcpDailyLimit: 0, desktopDailyLimit: 0, canUseAvaTrading: false })
    localStorage.removeItem(SESSION_KEY)
  }, [])

  const refreshUser = useCallback(async () => {
    if (!user) return
    try {
      const fresh = await fetchUserProfile(user.id)
      if (fresh) {
        const u = { ...fresh, web_session_token: user.web_session_token, ava_session_token: user.ava_session_token, memorySummary: user.memorySummary }
        setUser(u)
        setPermissions(resolvePermissions(u))
        const { memorySummary: _, ...toStore } = u
        localStorage.setItem(SESSION_KEY, JSON.stringify(toStore))
        // Re-fetch memory so the next session benefits from the updated summary
        fetchMemory(u.id).then(memorySummary => {
          if (memorySummary) setUser(prev => prev ? { ...prev, memorySummary } : prev)
        })
      }
    } catch {}
  }, [user])

  const updatePin = useCallback(async (currentPin: string, newPin: string): Promise<{ ok: boolean; error?: string }> => {
    if (!user) return { ok: false, error: 'Non connecté' }
    if (!/^\d{4,6}$/.test(currentPin)) return { ok: false, error: 'PIN actuel incorrect' }
    if (!/^\d{4,5}$/.test(newPin)) return { ok: false, error: 'Le PIN doit contenir 4 à 5 chiffres' }
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/update-pin`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({ user_id: user.id, current_pin: currentPin, new_pin: newPin }),
      })
      const result = await res.json().catch(() => ({}))
      if (res.ok && !result.error) {
        return { ok: true }
      }
      return { ok: false, error: result.error ?? 'Erreur lors de la mise à jour' }
    } catch {
      return { ok: false, error: 'Erreur réseau. Réessayez.' }
    }
  }, [user])

  return {
    user, setUser, permissions,
    loginLoading, loginError, login, logout,
    refreshUser, updatePin,
    registerRequest, registerVerify, requestPinReset, confirmPinReset,
  }
}
