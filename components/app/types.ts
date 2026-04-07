export interface UserData {
  id: string
  email: string
  credits: number
  free_daily_credits: number
  subscription_source: string | null
  subscription_expires_at: string | null
  referral_code: string | null
  telegram_id: string | null
  user_name?: string | null
  voice_minutes_used?: number
  voice_quota_reset_at?: string | null
  // Fetched separately after login (not stored in localStorage)
  memorySummary?: string
}

export interface TranscriptItem {
  id: number
  role: 'user' | 'ava'
  text: string
}

export type SessionState = 'idle' | 'connecting' | 'connected' | 'error'

export type AppTab = 'voice' | 'profile' | 'subscription' | 'referral' | 'settings'

export interface AppSettings {
  language: 'fr' | 'en' | 'tr' | 'de'
  webSearch: boolean
}

export interface AvaPermissions {
  webSearch: boolean     // Google Search toggle available
  imageUpload: boolean   // Can send images during call
  unlimited: boolean     // No credit deduction
}

export const FREE_PERMISSIONS: AvaPermissions = {
  webSearch: false,
  imageUpload: false,
  unlimited: false,
}

export const PRO_PERMISSIONS: AvaPermissions = {
  webSearch: true,
  imageUpload: true,
  unlimited: true,
}

export function isPro(user: UserData): boolean {
  if (user.subscription_source !== 'gumroad') return false
  if (!user.subscription_expires_at) return false
  return new Date(user.subscription_expires_at) > new Date()
}

export function resolvePermissions(user: UserData): AvaPermissions {
  return isPro(user) ? PRO_PERMISSIONS : FREE_PERMISSIONS
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
