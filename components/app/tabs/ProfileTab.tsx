'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Check, AlertCircle, Mail, Hash, Star } from 'lucide-react'
import type { UserData } from '../types'
import { isPro, totalCredits } from '../types'

interface Props {
  user: UserData
  onUpdatePin: (newPin: string) => Promise<{ ok: boolean; error?: string }>
  onRefresh: () => void
}

export function ProfileTab({ user, onUpdatePin, onRefresh }: Props) {
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [pinStatus, setPinStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [saving, setSaving] = useState(false)

  const pro = isPro(user)
  const credits = totalCredits(user)

  const handlePinSave = async () => {
    if (newPin !== confirmPin) {
      setPinStatus({ ok: false, msg: 'Les PIN ne correspondent pas' })
      return
    }
    if (!/^\d{4,6}$/.test(newPin)) {
      setPinStatus({ ok: false, msg: 'Le PIN doit contenir 4 à 6 chiffres' })
      return
    }
    setSaving(true)
    const result = await onUpdatePin(newPin)
    setSaving(false)
    setPinStatus({ ok: result.ok, msg: result.ok ? 'PIN mis à jour !' : (result.error ?? 'Erreur') })
    if (result.ok) {
      setNewPin('')
      setConfirmPin('')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-4">
      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-3 py-4"
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black"
          style={{ background: 'rgba(225,29,72,0.15)', color: '#f43f5e', border: '2px solid rgba(225,29,72,0.25)' }}
        >
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="text-center">
          <p className="font-bold text-white">{user.email}</p>
          {pro ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1"
              style={{ background: 'rgba(225,29,72,0.15)', color: '#f43f5e' }}>
              <Star size={10} fill="currentColor" /> Ava Pro
            </span>
          ) : (
            <span className="text-xs mt-1" style={{ color: '#64748b' }}>Compte gratuit</span>
          )}
        </div>
      </motion.div>

      {/* Info cards */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Informations du compte
          </p>
        </div>
        {[
          { icon: Mail, label: 'Email', value: user.email },
          { icon: Hash, label: 'Identifiant Telegram', value: user.telegram_id ?? '—' },
          { icon: User, label: 'Crédits disponibles', value: `${credits} crédit${credits !== 1 ? 's' : ''}` },
        ].map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <Icon size={15} style={{ color: '#475569', flexShrink: 0 }} />
            <span className="text-xs flex-1" style={{ color: '#64748b' }}>{label}</span>
            <span className="text-xs font-semibold text-right" style={{ color: '#94a3b8', maxWidth: '60%', wordBreak: 'break-all' }}>
              {value}
            </span>
          </div>
        ))}
      </motion.div>

      {/* PIN update */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <Lock size={13} style={{ color: '#475569' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Modifier le PIN
            </p>
          </div>
        </div>
        <div className="px-4 py-4 space-y-3">
          {[
            { label: 'Nouveau PIN', value: newPin, setter: setNewPin, placeholder: '••••' },
            { label: 'Confirmer le PIN', value: confirmPin, setter: setConfirmPin, placeholder: '••••' },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                {f.label}
              </label>
              <input
                type="password"
                value={f.value}
                onChange={(e) => f.setter(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={f.placeholder}
                inputMode="numeric"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
                  color: '#f8fafc', fontSize: 14, outline: 'none', letterSpacing: '0.25em',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
              />
            </div>
          ))}

          {pinStatus && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs"
              style={{ color: pinStatus.ok ? '#34d399' : '#f43f5e' }}
            >
              {pinStatus.ok ? <Check size={13} /> : <AlertCircle size={13} />}
              {pinStatus.msg}
            </motion.div>
          )}

          <motion.button
            onClick={handlePinSave}
            disabled={saving || !newPin || !confirmPin}
            whileHover={saving ? {} : { scale: 1.02 }}
            whileTap={saving ? {} : { scale: 0.98 }}
            className="w-full py-3 rounded-xl font-bold text-sm"
            style={{
              background: saving || !newPin || !confirmPin ? 'rgba(225,29,72,0.3)' : '#e11d48',
              color: '#fff',
              cursor: saving || !newPin || !confirmPin ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Enregistrer le PIN'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
