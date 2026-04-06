'use client'

import { useState, useCallback } from 'react'
import { Sidebar } from './Sidebar'
import { BottomTabs } from './BottomTabs'
import { VoiceTab } from './tabs/VoiceTab'
import { ProfileTab } from './tabs/ProfileTab'
import { SubscriptionTab } from './tabs/SubscriptionTab'
import { ReferralTab } from './tabs/ReferralTab'
import { SettingsTab } from './tabs/SettingsTab'
import type { AppTab, AppSettings, UserData } from './types'

interface Props {
  user: UserData
  onLogout: () => void
  onUpdatePin: (pin: string) => Promise<{ ok: boolean; error?: string }>
  onRefresh: () => void
}

const DEFAULT_SETTINGS: AppSettings = { language: 'fr', webSearch: false }

export function AppShell({ user, onLogout, onUpdatePin, onRefresh }: Props) {
  const [activeTab, setActiveTab] = useState<AppTab>('voice')
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  const handleSessionEnd = useCallback(() => {
    onRefresh()
  }, [onRefresh])

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
              onSessionEnd={handleSessionEnd}
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
            <SettingsTab settings={settings} onSettingsChange={setSettings} />
          )}
        </div>
      </div>

      {/* Mobile bottom tabs */}
      <BottomTabs activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
