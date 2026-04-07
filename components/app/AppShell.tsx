'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from './Sidebar'
import { BottomTabs } from './BottomTabs'
import { VoiceTab } from './tabs/VoiceTab'
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
  onSaveApiKey?: (key: string, pin: string) => Promise<{ ok: boolean; error?: string }>
  onRemoveApiKey?: () => Promise<{ ok: boolean }>
}

const DEFAULT_SETTINGS: AppSettings = { language: 'fr', webSearch: false }

export function AppShell({ user, permissions, onLogout, onUpdatePin, onRefresh, onDecrementCredits, onTrackVoiceTime, customApiKey, onSaveApiKey, onRemoveApiKey }: Props) {
  const [activeTab, setActiveTab] = useState<AppTab>('voice')
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

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
              onSettingsChange={setSettings}
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
