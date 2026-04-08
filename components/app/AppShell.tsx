'use client'

import { useState, useCallback, useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { BottomTabs } from './BottomTabs'
import { VoiceTab } from './tabs/VoiceTab'
import { ChatTab } from './tabs/ChatTab'
import { ProfileTab } from './tabs/ProfileTab'
import { SubscriptionTab } from './tabs/SubscriptionTab'
import { ReferralTab } from './tabs/ReferralTab'
import { SettingsTab } from './tabs/SettingsTab'
import type { AppTab, AppSettings, UserData, AvaPermissions } from './types'
import { isPro } from './types'

interface Props {
  user: UserData
  permissions: AvaPermissions
  onLogout: () => void
  onUpdatePin: (pin: string) => Promise<{ ok: boolean; error?: string }>
  onRefresh: () => void
  onDecrementCredits: () => Promise<void>
  onTrackVoiceTime: (seconds: number) => Promise<void>
  customApiKey?: string | null
  sharedGeminiKey?: string | null
  onSaveApiKey?: (key: string, pin: string) => Promise<{ ok: boolean; error?: string }>
  onRemoveApiKey?: () => Promise<{ ok: boolean }>
  onIncrementTextMessages: () => Promise<{ blocked: boolean }>
}

const SUPPORTED_LANGUAGES: AppSettings['language'][] = ['fr', 'en', 'tr', 'de', 'es']
const LANG_STORAGE_KEY = 'ava_language'

const DEFAULT_SETTINGS: AppSettings = { language: 'en', webSearch: false }

export function AppShell({ user, permissions, onLogout, onUpdatePin, onRefresh, onDecrementCredits, onTrackVoiceTime, customApiKey, sharedGeminiKey, onSaveApiKey, onRemoveApiKey, onIncrementTextMessages }: Props) {
  const [activeTab, setActiveTab] = useState<AppTab>('voice')
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  // Detect browser language on mount (after hydration to avoid SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as AppSettings['language'] | null
    if (saved && SUPPORTED_LANGUAGES.includes(saved)) {
      setSettings(s => ({ ...s, language: saved }))
      return
    }
    const browserLang = navigator.language.slice(0, 2).toLowerCase() as AppSettings['language']
    const detected = SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en'
    setSettings(s => ({ ...s, language: detected }))
  }, [])

  const handleSettingsChange = useCallback((s: AppSettings) => {
    setSettings(s)
    localStorage.setItem(LANG_STORAGE_KEY, s.language)
  }, [])

  const handleSessionEnd = useCallback(() => {
    onRefresh()
  }, [onRefresh])

  const handleGoToSubscription = useCallback(() => {
    setActiveTab('subscription')
  }, [])

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#020617' }}
    >
      {/* Desktop sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userEmail={user.email}
        onLogout={onLogout}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {/* Page title bar (mobile) */}
        <div
          className="lg:hidden flex-shrink-0 px-4 py-3 flex items-center"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        >
          <span className="font-black text-white text-base tracking-tight">Ava</span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2"
            style={{ background: 'rgba(225,29,72,0.15)', color: '#f43f5e' }}
          >
            Web
          </span>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col pb-16 lg:pb-0">
          {activeTab === 'voice' && (
            <VoiceTab
              user={user}
              language={settings.language}
              webSearch={settings.webSearch}
              permissions={permissions}
              onSessionEnd={handleSessionEnd}
              onTurnComplete={onDecrementCredits}
              onGoToSubscription={handleGoToSubscription}
              onVoiceDone={onTrackVoiceTime}
              customApiKey={customApiKey}
              sharedApiKey={sharedGeminiKey}
            />
          )}
          {activeTab === 'chat' && (
            <ChatTab
              user={user}
              permissions={permissions}
              language={settings.language}
              webSearch={settings.webSearch}
              onIncrementTextMessages={onIncrementTextMessages}
              sharedApiKey={sharedGeminiKey}
            />
          )}
          {activeTab === 'profile' && (
            <ProfileTab user={user} onUpdatePin={onUpdatePin} onRefresh={onRefresh} />
          )}
          {activeTab === 'subscription' && (
            <SubscriptionTab user={user} />
          )}
          {activeTab === 'referral' && (
            <ReferralTab user={user} />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onSettingsChange={handleSettingsChange}
              isPro={isPro(user)}
              onGoToSubscription={handleGoToSubscription}
              canUseCustomApiKey={permissions.canUseCustomApiKey}
              geminiKeyHint={user.gemini_key_hint}
              customApiKey={customApiKey}
              onSaveApiKey={onSaveApiKey}
              onRemoveApiKey={onRemoveApiKey}
            />
          )}
        </div>
      </div>

      {/* Mobile bottom tabs */}
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
