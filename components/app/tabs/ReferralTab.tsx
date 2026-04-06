'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, Check, Gift } from 'lucide-react'
import type { UserData } from '../types'

interface Props {
  user: UserData
}

export function ReferralTab({ user }: Props) {
  const [copied, setCopied] = useState(false)

  const referralCode = user.referral_code ?? '—'
  const referralLink = user.referral_code
    ? `https://call-ava.com/?ref=${user.referral_code}`
    : null

  const copyCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-4"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Users size={28} style={{ color: '#818cf8' }} />
        </div>
        <h2 className="text-xl font-black text-white">Programme de parrainage</h2>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          Invitez vos amis et gagnez des crédits
        </p>
      </motion.div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <Gift size={13} style={{ color: '#475569' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Comment ça marche
            </p>
          </div>
        </div>
        {[
          { step: '1', text: 'Partagez votre code de parrainage à un ami' },
          { step: '2', text: "L'ami s'inscrit avec votre code sur l'app mobile" },
          { step: '3', text: 'Vous recevez tous les deux des crédits bonus' },
        ].map(({ step, text }) => (
          <div
            key={step}
            className="flex items-start gap-3 px-4 py-3"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
          >
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}
            >
              {step}
            </div>
            <p className="text-sm" style={{ color: '#94a3b8' }}>{text}</p>
          </div>
        ))}
      </motion.div>

      {/* Referral code */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Votre code de parrainage
          </p>
        </div>
        <div className="px-4 py-4 space-y-3">
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <span className="text-xl font-black tracking-widest" style={{ color: '#818cf8' }}>
              {referralCode}
            </span>
            {user.referral_code && (
              <motion.button
                onClick={() => copyCode(referralCode)}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg"
                style={{ background: 'rgba(99,102,241,0.15)' }}
              >
                {copied ? <Check size={16} style={{ color: '#34d399' }} /> : <Copy size={16} style={{ color: '#818cf8' }} />}
              </motion.button>
            )}
          </div>

          {referralLink && (
            <div>
              <p className="text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                Lien de parrainage
              </p>
              <div
                className="flex items-center justify-between px-3 py-2.5 rounded-xl gap-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span className="text-xs truncate" style={{ color: '#64748b' }}>{referralLink}</span>
                <motion.button
                  onClick={() => copyCode(referralLink)}
                  whileTap={{ scale: 0.9 }}
                  className="flex-shrink-0 p-1.5 rounded-lg"
                  style={{ background: 'rgba(255,255,255,0.07)' }}
                >
                  {copied ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} style={{ color: '#64748b' }} />}
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-center text-xs pb-2"
        style={{ color: '#334155' }}
      >
        Les crédits sont crédités automatiquement après inscription de votre filleul.
      </motion.p>
    </div>
  )
}
