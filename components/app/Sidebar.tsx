'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Apple, Mic, MessageSquare, User, Crown, Users, Settings, LogOut, Download, Terminal, X } from 'lucide-react'
import { FaWindows } from 'react-icons/fa'
import Image from 'next/image'
import type { AppTab } from './types'

const TABS: { id: AppTab; label: string; icon: React.ElementType }[] = [
  { id: 'voice', label: 'Conversation', icon: Mic },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'profile', label: 'Profil', icon: User },
  { id: 'subscription', label: 'Abonnement', icon: Crown },
  { id: 'referral', label: 'Affiliation', icon: Users },
  { id: 'settings', label: 'Paramètres', icon: Settings },
]

const AVA_DESKTOP_MAC_VERSION = '1.2.36'
const AVA_DESKTOP_WINDOWS_VERSION = '1.2.36'
const AVA_BRIDGE_EA_VERSION = '1.41'
const DOWNLOAD_BASE_URL = 'https://call-ava.com/downloads'
const DESKTOP_DOWNLOADS = [
  {
    title: 'Mac Apple Silicon',
    subtitle: `Ava Desktop v${AVA_DESKTOP_MAC_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/Ava-${AVA_DESKTOP_MAC_VERSION}-arm64.dmg`,
    icon: Apple,
  },
  {
    title: 'Mac Intel',
    subtitle: `Ava Desktop v${AVA_DESKTOP_MAC_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/Ava-${AVA_DESKTOP_MAC_VERSION}-x64.dmg`,
    icon: Apple,
  },
  {
    title: 'Windows',
    subtitle: `Installateur v${AVA_DESKTOP_WINDOWS_VERSION}`,
    href: `${DOWNLOAD_BASE_URL}/AvaSetup-${AVA_DESKTOP_WINDOWS_VERSION}.exe`,
    icon: FaWindows,
  },
]
const BRIDGE_DOWNLOADS = [
  {
    title: 'AvaBridgeEA 1.41',
    badge: 'Recommandé',
    subtitle: 'Ava Volatility Boom/Crash et Ava Trading moderne',
    href: `${DOWNLOAD_BASE_URL}/AvaBridgeEA-1.41.ex5`,
  },
  {
    title: 'AvaBridgeEA 1.34',
    badge: 'Classic',
    subtitle: 'Compatibilité Gold Classic 1.2.5',
    href: `${DOWNLOAD_BASE_URL}/AvaBridgeEA-1.34.ex5`,
  },
]

interface Props {
  activeTab: AppTab
  onTabChange: (tab: AppTab) => void
  userEmail: string
  onLogout: () => void
}

export function Sidebar({ activeTab, onTabChange, userEmail, onLogout }: Props) {
  const [showDownloads, setShowDownloads] = useState(false)
  const [showBridgeDownloads, setShowBridgeDownloads] = useState(false)

  return (
    <>
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
        <div className="pt-3 mt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setShowDownloads(true)}
              className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group"
              style={{
                background: 'rgba(244,63,94,0.08)',
                color: '#f43f5e',
                border: '1px solid rgba(244,63,94,0.14)',
              }}
            >
              <Download size={17} style={{ color: '#f43f5e', flexShrink: 0 }} />
              <span className="text-sm font-semibold">Télécharger Ava</span>
            </button>
            <button
              type="button"
              onClick={() => setShowBridgeDownloads(true)}
              className="relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group"
              style={{
                background: 'rgba(59,130,246,0.08)',
                color: '#93c5fd',
                border: '1px solid rgba(59,130,246,0.16)',
              }}
            >
              <Terminal size={17} style={{ color: '#93c5fd', flexShrink: 0 }} />
              <span className="text-sm font-semibold">Connecteur Desktop</span>
            </button>
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Compatibilité</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500">
                Ava Desktop Windows {AVA_DESKTOP_WINDOWS_VERSION} / Mac {AVA_DESKTOP_MAC_VERSION} recommande AvaBridgeEA {AVA_BRIDGE_EA_VERSION}. Gold Classic 1.2.5 peut utiliser 1.34.
              </p>
            </div>
          </div>
        </div>
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

      {showDownloads && (
        <div
          className="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/75 px-6 backdrop-blur-sm lg:flex"
          onClick={() => setShowDownloads(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#070b16] p-5 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-300">Desktop</p>
                <h2 className="mt-1 text-lg font-black text-white">Télécharger Ava</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowDownloads(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:text-white"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {DESKTOP_DOWNLOADS.map(({ title, subtitle, href, icon: Icon }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 transition-colors hover:border-rose-400/35 hover:bg-white/[0.06]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-rose-300">
                    <Icon size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-white">{title}</span>
                    <span className="block truncate text-xs font-semibold text-slate-500">{subtitle}</span>
                  </span>
                  <Download size={15} className="text-slate-500" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {showBridgeDownloads && (
        <div
          className="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/75 px-6 backdrop-blur-sm lg:flex"
          onClick={() => setShowBridgeDownloads(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#070b16] p-5 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-sky-300">MT5 Bridge</p>
                <h2 className="mt-1 text-lg font-black text-white">Télécharger AvaBridgeEA</h2>
                <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-500">
                  Choisissez la version à installer manuellement dans MetaTrader 5 si l'installation automatique ne suffit pas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBridgeDownloads(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:text-white"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {BRIDGE_DOWNLOADS.map(({ title, badge, subtitle, href }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 transition-colors hover:border-sky-300/35 hover:bg-white/[0.06]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-sky-300">
                    <Terminal size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="block text-sm font-black text-white">{title}</span>
                      <span className="rounded-full border border-sky-300/20 bg-sky-300/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-sky-200">
                        {badge}
                      </span>
                    </span>
                    <span className="block truncate text-xs font-semibold text-slate-500">{subtitle}</span>
                  </span>
                  <Download size={15} className="text-slate-500" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
