'use client'

import { useState } from 'react'
import { Workflow, MoreHorizontal, Bot, Cloud, Mic, MessageSquare, Crown, Settings } from 'lucide-react'
import type { AppTab } from './types'

const TABS: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: 'voice', label: 'Ava', icon: Mic },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'ai', label: 'Ava AI', icon: Bot },
  { id: 'cloud', label: 'Cloud', icon: Cloud },
  { id: 'subscription', label: 'Pro', icon: Crown },
  { id: 'defi', label: 'DeFi', icon: Workflow },
]

interface Props {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  language?: string
}

export function BottomTabs({ activeTab, onTabChange, language = 'fr' }: Props) {
  const [more, setMore] = useState(false)
  const labelFor = (id: AppTab, label: string) => id === 'settings' && language === 'en' ? 'Settings' : label
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
      {more && <div className="absolute bottom-full right-2 mb-2 rounded-2xl border border-white/10 bg-slate-950 p-2 shadow-xl"><button className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-slate-200" onClick={() => { onTabChange('settings'); setMore(false) }}><Settings size={16}/>{language === 'en' ? 'Settings' : 'Réglages'}</button></div>}
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
            <span className="text-[10px] font-semibold">{labelFor(id, label)}</span>
            {active && (
              <span
                className="absolute bottom-0 w-8 h-0.5 rounded-full"
                style={{ background: '#e11d48' }}
              />
            )}
          </button>
        )
      })}
      <button aria-label={language === 'en' ? 'More' : 'Plus'} aria-expanded={more} onClick={() => setMore(!more)} className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-slate-400"><MoreHorizontal size={20}/><span className="text-[10px]">{language === 'en' ? 'More' : 'Plus'}</span></button>
    </nav>
  )
}
