'use client'

import { motion } from 'framer-motion'
import { Globe, Search, Info } from 'lucide-react'
import type { AppSettings } from '../types'

interface Props {
  settings: AppSettings
  onSettingsChange: (s: AppSettings) => void
}

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

export function SettingsTab({ settings, onSettingsChange }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-4">
      {/* Language */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Globe size={13} style={{ color: '#475569' }} />
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Langue de conversation
          </p>
        </div>
        <div className="p-3 grid grid-cols-2 gap-2">
          {LANGUAGES.map(({ code, label, flag }) => {
            const active = settings.language === code
            return (
              <motion.button
                key={code}
                onClick={() => onSettingsChange({ ...settings, language: code as AppSettings['language'] })}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? 'rgba(225,29,72,0.12)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${active ? 'rgba(225,29,72,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  color: active ? '#f43f5e' : '#64748b',
                }}
              >
                <span className="text-lg leading-none">{flag}</span>
                <span className="text-sm font-semibold">{label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Web search */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Search size={13} style={{ color: '#475569' }} />
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Fonctionnalités
          </p>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Recherche web</p>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                Google Search pour des informations en temps réel
              </p>
            </div>
            <button
              onClick={() => onSettingsChange({ ...settings, webSearch: !settings.webSearch })}
              className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200"
              style={{ background: settings.webSearch ? '#e11d48' : 'rgba(255,255,255,0.1)' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: settings.webSearch ? 'translateX(20px)' : 'translateX(0)' }}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info MCP */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl px-4 py-3 flex items-start gap-3"
        style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
      >
        <Info size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#818cf8' }} />
        <div>
          <p className="text-xs font-semibold" style={{ color: '#818cf8' }}>Serveurs MCP</p>
          <p className="text-xs mt-1" style={{ color: '#64748b' }}>
            Les serveurs MCP (Notion, GitHub, etc.) ne sont disponibles que dans l&apos;application mobile Ava.
            Téléchargez Ava sur iOS ou Android pour y accéder.
          </p>
        </div>
      </motion.div>

      {/* App info */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            À propos
          </p>
        </div>
        {[
          { label: 'Version', value: 'Web 1.0' },
          { label: 'Modèle IA', value: 'Gemini 2.5 Flash' },
          { label: 'Support', value: 'call-ava.com/support' },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <span className="text-xs" style={{ color: '#64748b' }}>{label}</span>
            <span className="text-xs font-semibold" style={{ color: '#475569' }}>{value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
