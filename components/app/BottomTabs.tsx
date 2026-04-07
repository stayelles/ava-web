'use client'

import { Mic, MessageSquare, User, Crown, Settings } from 'lucide-react'
import type { AppTab } from './types'

const TABS: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: 'voice', label: 'Ava', icon: Mic },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'subscription', label: 'Pro', icon: Crown },
  { id: 'settings', label: 'Réglages', icon: Settings },
]

interface Props {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
}

export function BottomTabs({ activeTab, onTabChange }: Props) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex"
      style={{
        background: 'rgba(2,6,23,0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors"
            style={{ color: active ? '#f43f5e' : '#475569' }}
          >
            <Icon size={20} />
            <span className="text-[10px] font-semibold">{label}</span>
            {active && (
              <span
                className="absolute bottom-0 w-8 h-0.5 rounded-full"
                style={{ background: '#e11d48' }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
