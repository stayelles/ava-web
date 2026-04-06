'use client'

import { motion } from 'framer-motion'
import { Mic, User, Crown, Users, Settings, LogOut } from 'lucide-react'
import Image from 'next/image'
import type { AppTab } from './types'

const TABS: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: 'voice', label: 'Conversation', icon: Mic },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'subscription', label: 'Abonnement', icon: Crown },
  { id: 'referral', label: 'Parrainage', icon: Users },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

interface Props {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  userEmail: string
  onLogout: () => void
}

export function Sidebar({ activeTab, onTabChange, userEmail, onLogout }: Props) {
  return (
    <aside
      className="hidden lg:flex flex-col flex-shrink-0"
      style={{
        width: 240,
        background: 'rgba(255,255,255,0.02)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            overflow: 'hidden',
            boxShadow: '0 0 16px rgba(225,29,72,0.35)',
          }}
        >
          <Image src="/logo.png" alt="Ava" width={32} height={32} className="object-cover" />
        </div>
        <span className="font-black text-white text-base tracking-tight">Ava</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto"
          style={{ background: 'rgba(225,29,72,0.15)', color: '#f43f5e' }}
        >
          Web
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group"
              style={{
                background: active ? 'rgba(225,29,72,0.12)' : 'transparent',
                color: active ? '#f43f5e' : '#64748b',
              }}
            >
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full"
                  style={{ width: 3, height: '60%', background: '#e11d48' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <Icon
                size={17}
                style={{ color: active ? '#f43f5e' : '#475569', flexShrink: 0 }}
              />
              <span className="text-sm font-semibold">{label}</span>
            </button>
          )
        })}
      </nav>

      {/* User + logout */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'rgba(225,29,72,0.2)', color: '#f43f5e' }}
          >
            {userEmail.charAt(0).toUpperCase()}
          </div>
          <span className="text-xs truncate" style={{ color: '#64748b' }}>
            {userEmail}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
          style={{ color: '#475569', background: 'rgba(255,255,255,0.03)' }}
        >
          <LogOut size={13} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
