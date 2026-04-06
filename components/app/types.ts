export interface UserData {
  id: string
  email: string
  credits: number
  free_daily_credits: number
  subscription_source: string | null
  subscription_expires_at: string | null
  referral_code: string | null
  telegram_id: string | null
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

export function isPro(user: UserData): boolean {
  if (user.subscription_source !== 'gumroad') return false
  if (!user.subscription_expires_at) return false
  return new Date(user.subscription_expires_at) > new Date()
}

export function totalCredits(user: UserData): number {
  return (user.credits ?? 0) + (user.free_daily_credits ?? 0)
}
