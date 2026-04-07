export interface UserData {
  id: string
  email: string
  credits: number
  free_daily_credits: number
  subscription_source: string | null
  subscription_expires_at: string | null
  subscription_tier?: string | null   // RevenueCat: 'free' | 'starter' | 'pro' | 'ultra'
  text_messages_used?: number
  text_quota_reset_at?: string | null
  referral_code: string | null
  telegram_id: string | null
  user_name?: string | null
  voice_minutes_used?: number
  voice_quota_reset_at?: string | null
  // Plan Custom
  custom_plan_expires_at?: string | null
  gemini_api_key_enc?: string | null
  gemini_api_key_iv?: string | null
  gemini_key_hint?: string | null
  // Fetched separately after login (not stored in localStorage)
  memorySummary?: string
}

export interface TranscriptItem {
  id: number
  role: 'user' | 'ava'
  text: string
}

export type SessionState = 'idle' | 'connecting' | 'connected' | 'error'

export type AppTab = 'voice' | 'chat' | 'profile' | 'subscription' | 'referral' | 'settings'

export interface AppSettings {
  language: 'fr' | 'en' | 'tr' | 'de'
  webSearch: boolean
}

export interface AvaPermissions {
  webSearch: boolean     // Google Search toggle available
  imageUpload: boolean   // Can send images during call
  unlimited: boolean     // No credit deduction
  canUseCustomApiKey: boolean  // Plan Custom — clé API Gemini personnelle
  /** Messages texte par jour. -1 = illimité. */
  dailyTextMessages: number
}

export const FREE_PERMISSIONS: AvaPermissions = {
  webSearch: false,
  imageUpload: false,
  unlimited: false,
  canUseCustomApiKey: false,
  dailyTextMessages: 10,
}

export const PRO_PERMISSIONS: AvaPermissions = {
  webSearch: true,
  imageUpload: true,
  unlimited: true,
  canUseCustomApiKey: false,
  dailyTextMessages: 300,
}

export function isPro(user: UserData): boolean {
  if (user.subscription_source !== 'gumroad') return false
  if (!user.subscription_expires_at) return false
  return new Date(user.subscription_expires_at) > new Date()
}

export function isCustomPlan(user: UserData): boolean {
  if (!user.custom_plan_expires_at) return false
  return new Date(user.custom_plan_expires_at) > new Date()
}

export function resolvePermissions(user: UserData): AvaPermissions {
  const base = isPro(user) ? PRO_PERMISSIONS : FREE_PERMISSIONS
  const custom = isCustomPlan(user)
  return {
    ...base,
    canUseCustomApiKey: custom,
    dailyTextMessages: custom ? -1 : base.dailyTextMessages,
  }
}

export function totalCredits(user: UserData): number {
  return (user.credits ?? 0) + (user.free_daily_credits ?? 0)
}

import { VOICE_QUOTA_PRO_MINUTES, VOICE_QUOTA_FREE_MINUTES } from './constants'

export function voiceQuotaMinutes(user: UserData): number {
  return isPro(user) ? VOICE_QUOTA_PRO_MINUTES : VOICE_QUOTA_FREE_MINUTES
}

export function voiceMinutesUsed(user: UserData): number {
  return user.voice_minutes_used ?? 0
}

export function voiceMinutesRemaining(user: UserData): number {
  return Math.max(0, voiceQuotaMinutes(user) - voiceMinutesUsed(user))
}
