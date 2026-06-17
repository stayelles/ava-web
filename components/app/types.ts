export interface UserData {
  id: string
  email: string
  credits: number
  free_daily_credits: number
  subscription_source: string | null
  subscription_expires_at: string | null
  paddle_subscription_id?: string | null
  paddle_renewal_cancelled_at?: string | null
  paddle_scheduled_cancel_at?: string | null
  paypal_subscription_id?: string | null
  paypal_plan_id?: string | null
  geniuspay_subscription_uuid?: string | null
  geniuspay_stripe_subscription_id?: string | null
  geniuspay_customer_id?: string | null
  mollie_customer_id?: string | null
  mollie_subscription_id?: string | null
  mollie_first_payment_id?: string | null
  mollie_last_payment_id?: string | null
  airwallex_customer_id?: string | null
  airwallex_checkout_id?: string | null
  airwallex_subscription_id?: string | null
  airwallex_price_id?: string | null
  airwallex_last_event_type?: string | null
  whop_checkout_id?: string | null
  whop_plan_id?: string | null
  whop_payment_id?: string | null
  whop_membership_id?: string | null
  whop_user_id?: string | null
  whop_last_event_type?: string | null
  billing_country_code?: string | null
  billing_country_name?: string | null
  billing_country_confirmed_at?: string | null
  subscription_plan?: string | null    // 'pro_starter' | 'custom_simple' | 'custom_pro' | 'custom_ultra' | 'custom_max' | legacy 'pro_plus' | 'custom'
  subscription_tier?: string | null   // RevenueCat: 'free' | 'starter' | 'pro' | 'ultra'
  ava_trading_trial_used?: boolean | null
  ava_trading_trial_started_at?: string | null
  ava_trading_trial_plan?: string | null
  ava_trading_trial_subscription_id?: string | null
  plan_switch_count?: number | null
  last_plan_change_at?: string | null
  subscription_abuse_flag?: boolean | null
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
  canUseAvaTrading: boolean    // accès au module Ava Trading Desktop
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
  canUseAvaTrading: false,
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
  canUseAvaTrading: false,
}

export const CUSTOM_PRO_PERMISSIONS: AvaPermissions = {
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
  canUseAvaTrading: true,
}

export const CUSTOM_ULTRA_PERMISSIONS: AvaPermissions = CUSTOM_PRO_PERMISSIONS
export const CUSTOM_MAX_PERMISSIONS: AvaPermissions = CUSTOM_PRO_PERMISSIONS
export const PRO_PLUS_PERMISSIONS = CUSTOM_PRO_PERMISSIONS

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
  canUseAvaTrading: true,
}

/** subscription_plan → permissions */
function paddlePlanPermissions(plan: string | null | undefined): AvaPermissions {
  if (plan === 'custom_max') return CUSTOM_MAX_PERMISSIONS
  if (plan === 'custom_ultra') return CUSTOM_ULTRA_PERMISSIONS
  if (plan === 'pro_plus' || plan === 'custom_pro') return CUSTOM_PRO_PERMISSIONS
  if (plan === 'custom' || plan === 'custom_simple' || plan === 'custom_starter') return CUSTOM_PERMISSIONS
  return PRO_STARTER_PERMISSIONS // pro_starter ou inconnu
}

export function isPro(user: UserData): boolean {
  const source = user.subscription_source
  if (source !== 'gumroad' && source !== 'paddle' && source !== 'paypal' && source !== 'geniuspay' && source !== 'mollie' && source !== 'airwallex' && source !== 'whop' && source !== 'wise') return false
  if (!user.subscription_expires_at) return false
  if (new Date(user.subscription_expires_at) <= new Date()) return false
  // Les plans Custom Paddle ne sont pas des plans Pro (ont leur propre section)
  const plan = user.subscription_plan
  if (plan === 'custom' || plan === 'custom_simple' || plan === 'custom_starter' || plan === 'custom_pro' || plan === 'custom_ultra' || plan === 'custom_max') return false
  return true
}

export function isCustomPlan(user: UserData): boolean {
  // Gumroad custom
  if (user.custom_plan_expires_at && new Date(user.custom_plan_expires_at) > new Date()) return true
  // Paddle/PayPal/GeniusPay/Mollie/Airwallex/Whop custom
  if ((user.subscription_source === 'paddle' || user.subscription_source === 'paypal' || user.subscription_source === 'geniuspay' || user.subscription_source === 'mollie' || user.subscription_source === 'airwallex' || user.subscription_source === 'whop' || user.subscription_source === 'wise') &&
      user.subscription_expires_at &&
      new Date(user.subscription_expires_at) > new Date() &&
      (user.subscription_plan === 'custom' || user.subscription_plan === 'custom_simple' || user.subscription_plan === 'custom_starter' || user.subscription_plan === 'custom_pro' || user.subscription_plan === 'custom_ultra' || user.subscription_plan === 'custom_max')) return true
  return false
}

export function resolvePermissions(user: UserData): AvaPermissions {
  if (isCustomPlan(user)) return CUSTOM_PERMISSIONS
  if (isPro(user)) {
    if (user.subscription_source === 'paddle' || user.subscription_source === 'paypal' || user.subscription_source === 'geniuspay' || user.subscription_source === 'mollie' || user.subscription_source === 'airwallex' || user.subscription_source === 'whop' || user.subscription_source === 'wise') return paddlePlanPermissions(user.subscription_plan)
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
