'use client'

import { motion } from 'framer-motion'
import { Crown, Check, Zap, Globe, Monitor, Infinity } from 'lucide-react'
import { GUMROAD_URL, GUMROAD_QUARTERLY_URL, GUMROAD_BIANNUAL_URL } from '../constants'
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

const PLANS = [
  {
    label: '1 mois',
    price: '39,90€',
    per: '/mois',
    note: null,
    href: GUMROAD_URL,
    popular: false,
  },
  {
    label: '3 mois',
    price: '99,99€',
    per: '/trimestre',
    note: '≈ 33,33€/mois — économisez 16%',
    href: GUMROAD_QUARTERLY_URL,
    popular: true,
  },
  {
    label: '6 mois',
    price: '189,99€',
    per: '/ 6 mois',
    note: '≈ 31,67€/mois — économisez 20%',
    href: GUMROAD_BIANNUAL_URL,
    popular: false,
  },
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

      {/* Plan cards */}
      {!pro && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-2"
        >
          <p className="text-[11px] font-bold uppercase tracking-widest px-1 mb-3" style={{ color: '#475569' }}>
            Choisissez votre plan
          </p>
          {PLANS.map((plan) => (
            <a
              key={plan.label}
              href={plan.href}
              data-gumroad-overlay-checkout="true"
              className="block rounded-2xl p-4 transition-all"
              style={{
                background: plan.popular ? 'rgba(225,29,72,0.08)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${plan.popular ? 'rgba(225,29,72,0.3)' : 'rgba(255,255,255,0.07)'}`,
                textDecoration: 'none',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider" style={{ color: plan.popular ? '#f43f5e' : '#64748b' }}>
                      {plan.label}
                    </span>
                    {plan.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(225,29,72,0.2)', color: '#f43f5e' }}>
                        Populaire
                      </span>
                    )}
                  </div>
                  {plan.note && (
                    <p className="text-[11px] mt-0.5" style={{ color: '#475569' }}>{plan.note}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">{plan.price}</span>
                  <span className="text-xs ml-1" style={{ color: '#64748b' }}>{plan.per}</span>
                </div>
              </div>
            </a>
          ))}
        </motion.div>
      )}

      {/* Manage subscription (Pro users) */}
      {pro && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <a
            href={GUMROAD_URL}
            data-gumroad-overlay-checkout="true"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm w-full"
            style={{ background: '#e11d48', color: '#fff', boxShadow: '0 0 24px rgba(225,29,72,0.35)', textDecoration: 'none' }}
          >
            Gérer mon abonnement
          </a>
        </motion.div>
      )}

      {!pro && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center text-xs pb-2"
          style={{ color: '#334155' }}
        >
          Après paiement sur Gumroad, revenez dans l&apos;app — votre statut Pro sera activé automatiquement.
        </motion.p>
      )}
    </div>
  )
}
