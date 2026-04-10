export interface UserData {
  id: string
  email: string
  credits: number
  free_daily_credits: number
  subscription_source: string | null
  subscription_expires_at: string | null
  subscription_plan?: string | null    // 'pro_starter' | 'pro_plus' | 'custom_starter' | 'custom_pro'
  subscription_tier?: string | null   // RevenueCat: 'free' | 'starter' | 'pro' | 'ultra'
  text_messages_used?: number
  text_quota_reset_at?: string | null
  referral_code: string | null
  telegram_id: string | null
  first_name?: string | null
  last_name?: string | null
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
  language: 'fr' | 'en' | 'tr' | 'de' | 'es'
  webSearch: boolean
}

export interface AvaPermissions {
  webSearch: boolean
  imageUpload: boolean
  unlimited: boolean
  canUseCustomApiKey: boolean
  dailyTextMessages: number    // -1 = illimité
  voiceMonthlyMinutes: number  // -1 = illimité
  dailyWebSearches: number     // -1 = illimité
  memoryWordLimit: number      // -1 = illimité (mots max dans le résumé mémoire)
  agentDailyLimit: number      // -1 = illimité, 0 = bloqué (tâches agent IA/jour)
  mcpDailyLimit: number        // -1 = illimité, 0 = bloqué (appels MCP/jour)
  desktopDailyLimit: number    // -1 = illimité, 0 = bloqué (contrôles desktop/jour)
}

export const FREE_PERMISSIONS: AvaPermissions = {
  webSearch: false,
  imageUpload: false,
  unlimited: false,
  canUseCustomApiKey: false,
  dailyTextMessages: 10,
  voiceMonthlyMinutes: 3,
  dailyWebSearches: 0,
  memoryWordLimit: 150,
  agentDailyLimit: 0,
  mcpDailyLimit: 0,
  desktopDailyLimit: 0,
}

export const PRO_STARTER_PERMISSIONS: AvaPermissions = {
  webSearch: true,
  imageUpload: true,
  unlimited: true,
  canUseCustomApiKey: false,
  dailyTextMessages: 250,
  voiceMonthlyMinutes: 200,
  dailyWebSearches: 50,
  memoryWordLimit: 350,
  agentDailyLimit: 3,
  mcpDailyLimit: 30,
  desktopDailyLimit: 5,
}

export const PRO_PLUS_PERMISSIONS: AvaPermissions = {
  webSearch: true,
  imageUpload: true,
  unlimited: true,
  canUseCustomApiKey: false,
  dailyTextMessages: 600,
  voiceMonthlyMinutes: 450,
  dailyWebSearches: -1,
  memoryWordLimit: 650,
  agentDailyLimit: 10,
  mcpDailyLimit: 60,
  desktopDailyLimit: 15,
}

export const CUSTOM_PERMISSIONS: AvaPermissions = {
  webSearch: true,
  imageUpload: true,
  unlimited: true,
  canUseCustomApiKey: true,
  dailyTextMessages: -1,
  voiceMonthlyMinutes: -1,
  dailyWebSearches: -1,
  memoryWordLimit: -1,
  agentDailyLimit: -1,
  mcpDailyLimit: -1,
  desktopDailyLimit: -1,
}

/** subscription_plan → permissions */
function paddlePlanPermissions(plan: string | null | undefined): AvaPermissions {
  if (plan === 'pro_plus') return PRO_PLUS_PERMISSIONS
  if (plan === 'custom_starter' || plan === 'custom_pro') return CUSTOM_PERMISSIONS
  return PRO_STARTER_PERMISSIONS // pro_starter ou inconnu
}

export function isPro(user: UserData): boolean {
  const source = user.subscription_source
  if (source !== 'gumroad' && source !== 'paddle') return false
  if (!user.subscription_expires_at) return false
  if (new Date(user.subscription_expires_at) <= new Date()) return false
  // Les plans Custom Paddle ne sont pas des plans Pro (ont leur propre section)
  const plan = user.subscription_plan
  if (plan === 'custom_starter' || plan === 'custom_pro') return false
  return true
}

export function isCustomPlan(user: UserData): boolean {
  // Gumroad custom
  if (user.custom_plan_expires_at && new Date(user.custom_plan_expires_at) > new Date()) return true
  // Paddle custom
  if (user.subscription_source === 'paddle' &&
      user.subscription_expires_at &&
      new Date(user.subscription_expires_at) > new Date() &&
      (user.subscription_plan === 'custom_starter' || user.subscription_plan === 'custom_pro')) return true
  return false
}

export function resolvePermissions(user: UserData): AvaPermissions {
  if (isCustomPlan(user)) return CUSTOM_PERMISSIONS
  if (isPro(user)) {
    if (user.subscription_source === 'paddle') return paddlePlanPermissions(user.subscription_plan)
    return PRO_PLUS_PERMISSIONS // Gumroad = accès max
  }
  return FREE_PERMISSIONS
}

export function totalCredits(user: UserData): number {
  return (user.credits ?? 0) + (user.free_daily_credits ?? 0)
}

import { VOICE_QUOTA_FREE_MINUTES } from './constants'

export function voiceQuotaMinutes(user: UserData): number {
  const perms = resolvePermissions(user)
  if (perms.voiceMonthlyMinutes === -1) return 999 // illimité → on affiche 999
  if (perms.voiceMonthlyMinutes > 0) return perms.voiceMonthlyMinutes
  return VOICE_QUOTA_FREE_MINUTES
}

export function voiceMinutesUsed(user: UserData): number {
  return user.voice_minutes_used ?? 0
}

export function voiceMinutesRemaining(user: UserData): number {
  return Math.max(0, voiceQuotaMinutes(user) - voiceMinutesUsed(user))
}
