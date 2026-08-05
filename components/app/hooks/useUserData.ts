'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants'
import { supabaseAuth } from '../services/supabaseAuth'
import type { AvaPermissions, UserData } from '../types'
import { resolvePermissions } from '../types'

const SESSION_KEY = 'ava_web_session'
const EMPTY_PERMISSIONS: AvaPermissions = {
  webSearch: false, imageUpload: false, unlimited: false, canUseCustomApiKey: false,
  dailyTextMessages: 10, voiceMonthlyMinutes: 3, dailyWebSearches: 0,
  memoryWordLimit: 150, agentDailyLimit: 0, mcpDailyLimit: 0,
  desktopDailyLimit: 0, canUseAvaTrading: false,
}

type Bootstrap = {
  user_id: string
  status: string
  profile?: { first_name?: string; last_name?: string; preferred_language?: string }
  contact?: { email?: string; phone_number?: string }
  roles?: string[]
  subscription?: Record<string, unknown>
  wallet?: Record<string, unknown>
  quotas?: Record<string, unknown>
}

type MfaPrompt = { required: boolean; qrCode?: string; secret?: string }

function asString(value: unknown): string | null {
  return value == null || value === '' ? null : String(value)
}

function bootstrapToUser(bootstrap: Bootstrap, avaSessionToken: string): UserData {
  const subscription = bootstrap.subscription ?? {}
  const wallet = bootstrap.wallet ?? {}
  const quotas = bootstrap.quotas ?? {}
  const roles = bootstrap.roles ?? []
  return {
    id: bootstrap.user_id,
    email: String(bootstrap.contact?.email ?? ''),
    is_admin: roles.includes('owner') || roles.includes('admin'),
    first_name: asString(bootstrap.profile?.first_name),
    last_name: asString(bootstrap.profile?.last_name),
    credits: Number(wallet.credits ?? 0),
    free_daily_credits: Number(wallet.free_daily_credits ?? 0),
    subscription_tier: asString(subscription.tier),
    subscription_source: asString(subscription.source),
    subscription_plan: asString(subscription.plan),
    subscription_expires_at: asString(subscription.expires_at),
    custom_plan_expires_at: asString(subscription.custom_plan_expires_at),
    billing_country_code: asString(subscription.billing_country_code),
    billing_country_name: asString(subscription.billing_country_name),
    billing_country_confirmed_at: asString(subscription.billing_country_confirmed_at),
    ava_trading_trial_used: subscription.trial_used === true,
    ava_trading_trial_started_at: asString(subscription.trial_started_at),
    ava_trading_trial_plan: asString(subscription.trial_plan),
    plan_switch_count: Number(subscription.plan_switch_count ?? 0),
    last_plan_change_at: asString(subscription.last_plan_change_at),
    subscription_abuse_flag: subscription.abuse_flag === true,
    voice_minutes_used: Number(quotas.voice_minutes_used ?? 0),
    voice_quota_reset_at: asString(quotas.voice_quota_reset_at),
    text_messages_used: Number(quotas.text_messages_used ?? 0),
    text_quota_reset_at: asString(quotas.text_quota_reset_at),
    referral_code: null,
    telegram_id: null,
    web_session_token: avaSessionToken,
    ava_session_token: avaSessionToken,
  }
}

async function edgeRequest(path: string, body: Record<string, unknown>, accessToken?: string) {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  const data = await response.json().catch(() => ({}))
  return { response, data }
}

async function loadMemory(user: UserData) {
  if (!user.ava_session_token) return ''
  const { response, data } = await edgeRequest('ava-voice', {
    action: 'get_memory',
    user_id: user.id,
    ava_session_token: user.ava_session_token,
  })
  return response.ok ? String(data.summary ?? '') : ''
}

export function useUserData() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [permissions, setPermissions] = useState<AvaPermissions>(EMPTY_PERMISSIONS)
  const pendingMfaFactorId = useRef('')

  const commitBootstrap = useCallback(async (data: Record<string, unknown>) => {
    const bootstrap = data.bootstrap as Bootstrap | undefined
    const avaSessionToken = String(data.ava_session_token ?? '')
    if (!bootstrap?.user_id || !avaSessionToken) throw new Error('SESSION_BOOTSTRAP_INVALID')
    const nextUser = bootstrapToUser(bootstrap, avaSessionToken)
    setUser(nextUser)
    setPermissions(resolvePermissions(nextUser))
    const { memorySummary: _memory, ...safeCache } = nextUser
    localStorage.setItem(SESSION_KEY, JSON.stringify(safeCache))
    loadMemory(nextUser).then(memorySummary => {
      if (memorySummary) setUser(current => current ? { ...current, memorySummary } : current)
    }).catch(() => {})
  }, [])

  const bootstrapSession = useCallback(async (session: Session) => {
    const { response, data } = await edgeRequest(
      'ava-session-bootstrap', { surface: 'web' }, session.access_token,
    )
    if (!response.ok) throw new Error(String(data.error ?? 'SESSION_BOOTSTRAP_FAILED'))
    await commitBootstrap(data)
  }, [commitBootstrap])

  useEffect(() => {
    let active = true
    supabaseAuth.auth.getSession().then(async ({ data }) => {
      if (!active || !data.session) return
      try { await bootstrapSession(data.session) } catch { await supabaseAuth.auth.signOut() }
    })
    const { data: listener } = supabaseAuth.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setPermissions(EMPTY_PERMISSIONS)
        localStorage.removeItem(SESSION_KEY)
      }
    })
    return () => {
      active = false
      listener.subscription.unsubscribe()
    }
  }, [bootstrapSession])

  const requestOtp = useCallback(async (email: string): Promise<{ ok: boolean; error?: string }> => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const { response, data } = await edgeRequest('ava-auth-migrate', {
        action: 'request_otp', email: email.trim(), surface: 'web',
      })
      if (!response.ok) throw new Error(String(data.error ?? 'OTP_REQUEST_FAILED'))
      return { ok: true }
    } catch {
      const message = 'Impossible d’envoyer le code pour le moment.'
      setLoginError(message)
      return { ok: false, error: message }
    } finally {
      setLoginLoading(false)
    }
  }, [])

  const linkAuthenticatedSession = useCallback(async (session: Session) => {
    return edgeRequest('ava-auth-migrate', { action: 'link', surface: 'web' }, session.access_token)
  }, [])

  const verifyOtp = useCallback(async (
    email: string,
    code: string,
  ): Promise<{ ok: boolean; error?: string; mfa?: MfaPrompt }> => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const { data: verified, error } = await supabaseAuth.auth.verifyOtp({
        email: email.trim().toLowerCase(), token: code.trim(), type: 'email',
      })
      if (error || !verified.session) throw new Error('OTP_INVALID')
      const linked = await linkAuthenticatedSession(verified.session)
      if (linked.response.ok) {
        await commitBootstrap(linked.data)
        return { ok: true }
      }
      if (linked.data.error !== 'MFA_REQUIRED') throw new Error(String(linked.data.error ?? 'ACCOUNT_LINK_FAILED'))

      const { data: factors } = await supabaseAuth.auth.mfa.listFactors()
      const existing = factors?.totp?.find(factor => factor.status === 'verified')
      if (existing) {
        pendingMfaFactorId.current = existing.id
        return { ok: false, mfa: { required: true } }
      }
      const { data: enrolled, error: enrollError } = await supabaseAuth.auth.mfa.enroll({
        factorType: 'totp', friendlyName: 'Ava Owner',
      })
      if (enrollError || !enrolled) throw new Error('MFA_ENROLL_FAILED')
      pendingMfaFactorId.current = enrolled.id
      return {
        ok: false,
        mfa: { required: true, qrCode: enrolled.totp.qr_code, secret: enrolled.totp.secret },
      }
    } catch (error) {
      const codeValue = error instanceof Error ? error.message : ''
      const message = codeValue === 'OTP_INVALID'
        ? 'Code incorrect ou expiré.'
        : codeValue === 'DUPLICATE_EMAIL_REVIEW_REQUIRED'
          ? 'Ce compte nécessite une vérification manuelle du support.'
          : 'Connexion sécurisée indisponible. Réessayez.'
      setLoginError(message)
      return { ok: false, error: message }
    } finally {
      setLoginLoading(false)
    }
  }, [commitBootstrap, linkAuthenticatedSession])

  const verifyMfa = useCallback(async (code: string): Promise<{ ok: boolean; error?: string }> => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const factorId = pendingMfaFactorId.current
      if (!factorId) throw new Error('MFA_FACTOR_MISSING')
      const { error } = await supabaseAuth.auth.mfa.challengeAndVerify({ factorId, code: code.trim() })
      if (error) throw error
      const { data } = await supabaseAuth.auth.getSession()
      if (!data.session) throw new Error('AUTH_SESSION_INVALID')
      const linked = await linkAuthenticatedSession(data.session)
      if (!linked.response.ok) throw new Error(String(linked.data.error ?? 'ACCOUNT_LINK_FAILED'))
      await commitBootstrap(linked.data)
      pendingMfaFactorId.current = ''
      return { ok: true }
    } catch {
      const message = 'Code d’authentification incorrect ou expiré.'
      setLoginError(message)
      return { ok: false, error: message }
    } finally {
      setLoginLoading(false)
    }
  }, [commitBootstrap, linkAuthenticatedSession])

  const logout = useCallback(async () => {
    await supabaseAuth.auth.signOut()
    setUser(null)
    setPermissions(EMPTY_PERMISSIONS)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await supabaseAuth.auth.getSession()
    if (data.session) await bootstrapSession(data.session)
  }, [bootstrapSession])

  const updatePin = useCallback(async (): Promise<{ ok: boolean; error?: string }> => ({
    ok: false,
    error: 'Le PIN permanent a été supprimé. La connexion utilise désormais un code e-mail.',
  }), [])

  return {
    user, setUser, permissions, loginLoading, loginError,
    requestOtp, verifyOtp, verifyMfa, logout, refreshUser, updatePin,
  }
}
