'use client'

import { motion } from 'framer-motion'
import { Crown, Check, ExternalLink, Zap, Globe, Monitor, Infinity } from 'lucide-react'
import { GUMROAD_URL } from '../constants'
import { isPro } from '../types'
import type { UserData } from '../types'

interface Props {
  user: UserData
}

const PRO_FEATURES = [
  { icon: Infinity, text: 'Crédits illimités' },
  { icon: Globe, text: 'Recherche web Google' },
  { icon: Monitor, text: 'Contrôle à distance (Desktop)' },
  { icon: Zap, text: 'Accès prioritaire aux nouvelles fonctionnalités' },
]

export function SubscriptionTab({ user }: Props) {
  const pro = isPro(user)

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
          style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)' }}
        >
          <Crown size={28} style={{ color: '#f43f5e' }} />
        </div>
        <h2 className="text-xl font-black text-white">Ava Pro</h2>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          L&apos;expérience complète sans limites
        </p>
      </motion.div>

      {/* Current status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{
          background: pro ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${pro ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.07)'}`,
        }}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: pro ? '#34d399' : '#475569' }}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: pro ? '#34d399' : '#94a3b8' }}>
            {pro ? 'Abonnement Pro actif' : 'Plan gratuit'}
          </p>
          {pro && user.subscription_expires_at && (
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              Expire le {new Date(user.subscription_expires_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          )}
          {!pro && (
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              Passez à Pro pour débloquer toutes les fonctionnalités
            </p>
          )}
        </div>
      </motion.div>

      {/* Features list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            Fonctionnalités Pro
          </p>
        </div>
        {PRO_FEATURES.map(({ icon: Icon, text }, i) => (
          <div
            key={text}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: i < PRO_FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(225,29,72,0.1)' }}
            >
              <Icon size={14} style={{ color: '#f43f5e' }} />
            </div>
            <span className="text-sm" style={{ color: '#cbd5e1' }}>{text}</span>
            {pro && <Check size={14} className="ml-auto flex-shrink-0" style={{ color: '#34d399' }} />}
          </div>
        ))}
      </motion.div>

      {/* Pricing card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.18)' }}
      >
        <div className="px-5 py-5">
          <div className="flex items-end gap-2 mb-1">
            <span className="text-3xl font-black text-white">9,99€</span>
            <span className="text-sm mb-1.5" style={{ color: '#64748b' }}>/mois</span>
          </div>
          <p className="text-xs" style={{ color: '#64748b' }}>
            Via Gumroad — paiement sécurisé, annulation à tout moment
          </p>
        </div>

        <motion.a
          href={GUMROAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center justify-center gap-2 mx-5 mb-5 py-3.5 rounded-xl font-bold text-sm"
          style={{
            background: '#e11d48', color: '#fff',
            boxShadow: '0 0 24px rgba(225,29,72,0.35)',
          }}
        >
          {pro ? 'Gérer mon abonnement' : 'Passer à Ava Pro'}
          <ExternalLink size={14} />
        </motion.a>
      </motion.div>

      {!pro && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs pb-2"
          style={{ color: '#334155' }}
        >
          Après paiement sur Gumroad, revenez dans l&apos;app — votre statut Pro sera activé automatiquement.
        </motion.p>
      )}
    </div>
  )
}
