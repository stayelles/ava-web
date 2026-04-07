'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, Search, Info, Lock, Key } from 'lucide-react'
import type { AppSettings } from '../types'

interface Props {
  settings: AppSettings
  onSettingsChange: (s: AppSettings) => void
  isPro: boolean
  onGoToSubscription?: () => void
  canUseCustomApiKey?: boolean
  geminiKeyHint?: string | null
  customApiKey?: string | null
  onSaveApiKey?: (key: string, pin: string) => Promise<{ ok: boolean; error?: string }>
  onRemoveApiKey?: () => Promise<{ ok: boolean }>
}

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

export function SettingsTab({
  settings, onSettingsChange, isPro, onGoToSubscription,
  canUseCustomApiKey, geminiKeyHint, customApiKey, onSaveApiKey, onRemoveApiKey,
}: Props) {
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [pinInput, setPinInput]       = useState('')
  const [apiKeySaving, setApiKeySaving] = useState(false)
  const [apiKeyMsg, setApiKeyMsg]     = useState('')

  const handleSaveKey = async () => {
    if (!apiKeyInput.trim() || !pinInput.trim() || !onSaveApiKey) return
    setApiKeySaving(true)
    setApiKeyMsg('')
    const result = await onSaveApiKey(apiKeyInput.trim(), pinInput.trim())
    setApiKeySaving(false)
    if (result.ok) {
      setApiKeyInput('')
      setPinInput('')
      setApiKeyMsg('✓ Clé enregistrée et active pour cette session.')
    } else {
      setApiKeyMsg(result.error ?? 'Erreur lors de la sauvegarde.')
    }
  }

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
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-white">Recherche web</p>
                {!isPro && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer"
                    style={{ background: 'rgba(225,29,72,0.12)', color: '#f43f5e', border: '1px solid rgba(225,29,72,0.2)' }}
                    onClick={onGoToSubscription}
                  >
                    <Lock size={9} />Pro
                  </span>
                )}
              </div>
              <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                Google Search pour des informations en temps réel
              </p>
            </div>
            <button
              onClick={() => isPro && onSettingsChange({ ...settings, webSearch: !settings.webSearch })}
              disabled={!isPro}
              className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ml-3"
              style={{
                background: isPro && settings.webSearch ? '#e11d48' : 'rgba(255,255,255,0.1)',
                opacity: isPro ? 1 : 0.4,
                cursor: isPro ? 'pointer' : 'not-allowed',
              }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200"
                style={{ transform: isPro && settings.webSearch ? 'translateX(20px)' : 'translateX(0)' }}
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

      {/* Custom API Key (plan Custom only) */}
      {canUseCustomApiKey && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Key size={13} style={{ color: '#475569' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Clé API Gemini
            </p>
          </div>
          <div className="px-4 py-4 space-y-3">
            {geminiKeyHint ? (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}
                  >
                    ✓ Clé configurée ({geminiKeyHint})
                  </span>
                </div>
                {!customApiKey && (
                  <p className="text-xs" style={{ color: '#f59e0b' }}>
                    ⚠️ Reconnectez-vous pour activer votre clé personnelle.
                  </p>
                )}
                {customApiKey && (
                  <p className="text-xs" style={{ color: '#34d399' }}>
                    Clé active pour cette session.
                  </p>
                )}
                <button
                  onClick={async () => { if (onRemoveApiKey) await onRemoveApiKey() }}
                  className="w-full py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  Supprimer la clé
                </button>
              </>
            ) : (
              <>
                <p className="text-xs" style={{ color: '#64748b' }}>
                  Utilisez votre propre clé API Gemini à la place de la clé partagée de l&apos;app.
                </p>
                <input
                  type="password"
                  placeholder="Clé API Gemini (AIza…)"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                />
                <input
                  type="password"
                  placeholder="Confirmez votre PIN (pour chiffrer la clé)"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#f1f5f9' }}
                />
                <p className="text-[11px]" style={{ color: '#475569' }}>
                  🔒 Chiffrée avec votre PIN (AES-256). Indéchiffrable sans votre PIN, même par nos équipes.
                </p>
                <p className="text-[11px]" style={{ color: '#64748b' }}>
                  ⚠️ La sécurité de votre clé dépend de la robustesse de votre PIN.
                </p>
                {apiKeyMsg && (
                  <p className="text-xs font-medium" style={{ color: apiKeyMsg.startsWith('✓') ? '#34d399' : '#ef4444' }}>
                    {apiKeyMsg}
                  </p>
                )}
                <button
                  onClick={handleSaveKey}
                  disabled={apiKeySaving || !apiKeyInput.trim() || !pinInput.trim()}
                  className="w-full py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: '#e11d48', color: '#fff' }}
                >
                  {apiKeySaving ? 'Enregistrement...' : 'Enregistrer la clé'}
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}

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
