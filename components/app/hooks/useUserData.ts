'use client'

import { useState, useEffect, useCallback } from 'react'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_HEADERS } from '../constants'
import type { UserData } from '../types'

const SESSION_KEY = 'ava_web_session'
const SELECT_FIELDS = 'id,email,credits,free_daily_credits,subscription_source,subscription_expires_at,referral_code,telegram_id'

export function useUserData() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Load saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SESSION_KEY)
      if (saved) setUser(JSON.parse(saved))
    } catch {}
  }, [])

  const login = useCallback(async (identifier: string, pin: string) => {
    setLoginLoading(true)
    setLoginError('')
    try {
      const isNumeric = /^\d+$/.test(identifier.trim())
      const filter = isNumeric
        ? `telegram_id=eq.${identifier.trim()}`
        : `email=eq.${encodeURIComponent(identifier.trim())}`
      const url = `${SUPABASE_URL}/rest/v1/ava_users?${filter}&pin=eq.${pin}&select=${SELECT_FIELDS}`
      const res = await fetch(url, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const u = data[0] as UserData
        setUser(u)
        localStorage.setItem(SESSION_KEY, JSON.stringify(u))
      } else {
        setLoginError('Identifiant ou PIN incorrect')
      }
    } catch {
      setLoginError('Erreur de connexion. Réessayez.')
    } finally {
      setLoginLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
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
        const u = data[0] as UserData
        setUser(u)
        localStorage.setItem(SESSION_KEY, JSON.stringify(u))
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
        const updated = { ...user }
        setUser(updated)
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated))
        return { ok: true }
      }
      return { ok: false, error: 'Erreur lors de la mise à jour' }
    } catch {
      return { ok: false, error: 'Erreur réseau. Réessayez.' }
    }
  }, [user])

  return { user, setUser, loginLoading, loginError, login, logout, refreshUser, updatePin }
}
