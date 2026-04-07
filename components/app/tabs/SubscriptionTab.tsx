'use client'

import { motion } from 'framer-motion'
import { Crown, Check, Zap, Globe, Monitor, Infinity, ImageIcon, Brain, Bell, Layers } from 'lucide-react'
import { GUMROAD_URL, GUMROAD_QUARTERLY_URL, GUMROAD_BIANNUAL_URL } from '../constants'
import { isPro, voiceMinutesUsed, voiceMinutesRemaining, voiceQuotaMinutes } from '../types'
import type { UserData } from '../types'

interface Props {
  user: UserData
}

const FREE_FEATURES = [
  '3 crédits vocaux offerts par jour',
  'Voix ultra-réaliste (Gemini 2.5 Flash)',
  'Mémoire conversationnelle',
  '4 langues : FR, EN, DE, TR',
]

const PRO_FEATURES = [
  { icon: Infinity, text: 'Conversations vocales illimitées (sans limite de crédits)' },
  { icon: Globe, text: 'Recherche web Google en temps réel' },
  { icon: ImageIcon, text: 'Analyse d\'images pendant les appels (jusqu\'à 6)' },
  { icon: Monitor, text: 'Contrôle à distance Mac/PC (via Ava Mobile)' },
  { icon: Brain, text: 'Vision écran en temps réel (via Ava Mobile)' },
  { icon: Bell, text: 'Rappels intelligents avec notifications push (mobile)' },
  { icon: Layers, text: 'Intégrations MCP : Notion, GitHub, et plus (mobile)' },
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

function VoiceQuotaBar({ user, pro }: { user: UserData; pro: boolean }) {
  const used = voiceMinutesUsed(user)
  const quota = voiceQuotaMinutes(user)
  const remaining = voiceMinutesRemaining(user)
  const pct = Math.min(100, (used / quota) * 100)

  const resetAt = user.voice_quota_reset_at
    ? new Date(user.voice_quota_reset_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : null

  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : pro ? '#34d399' : '#f43f5e'

  const fmtMin = (m: number) => {
    const mins = Math.floor(m)
    const secs = Math.round((m - mins) * 60)
    if (mins === 0) return `${secs}s`
    if (secs === 0) return `${mins} min`
    return `${mins} min ${secs}s`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
          Temps vocal ce mois-ci
        </p>
      </div>
      <div className="px-4 py-4 space-y-3">
        {/* Labels */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-black text-white">{fmtMin(used)}</span>
            <span className="text-xs ml-2" style={{ color: '#475569' }}>/ {quota} min</span>
          </div>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: remaining <= 0 ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
              color: remaining <= 0 ? '#f87171' : '#64748b',
            }}
          >
            {remaining <= 0 ? 'Quota atteint' : `${fmtMin(remaining)} restantes`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: barColor, boxShadow: `0 0 8px ${barColor}60` }}
          />
        </div>

        {/* Segments */}
        <div className="flex justify-between text-[10px]" style={{ color: '#334155' }}>
          <span>0</span>
          <span>{Math.round(quota * 0.25)} min</span>
          <span>{Math.round(quota * 0.5)} min</span>
          <span>{Math.round(quota * 0.75)} min</span>
          <span>{quota} min</span>
        </div>

        {/* Reset date */}
        {resetAt && (
          <p className="text-[11px]" style={{ color: '#334155' }}>
            Remise à zéro le {resetAt} · Partagé entre web, mobile et desktop
          </p>
        )}
      </div>
    </motion.div>
  )
}

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
        {/* Free trial banner */}
        <div
          className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
          7 jours gratuits — aujourd&apos;hui 0€
        </div>
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

      {/* Voice quota progress bar */}
      <VoiceQuotaBar user={user} pro={pro} />

      {/* Free plan included */}
      {!pro && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Plan gratuit (inclus)
            </p>
          </div>
          <div className="px-4 py-2.5 flex flex-wrap gap-x-4 gap-y-1.5">
            {FREE_FEATURES.map(f => (
              <span key={f} className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
                <Check size={11} style={{ color: '#475569' }} />
                {f}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Pro features list */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
            {pro ? 'Votre plan Pro — actif' : 'Ce que vous débloquez avec Pro'}
          </p>
        </div>
        {PRO_FEATURES.map(({ icon: Icon, text }, i) => (
          <div
            key={text}
            className="flex items-center gap-3 px-4 py-2.5"
            style={{ borderBottom: i < PRO_FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
          >
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: pro ? 'rgba(52,211,153,0.1)' : 'rgba(225,29,72,0.1)' }}
            >
              <Icon size={12} style={{ color: pro ? '#34d399' : '#f43f5e' }} />
            </div>
            <span className="text-xs leading-snug" style={{ color: '#cbd5e1' }}>{text}</span>
            {pro && <Check size={12} className="ml-auto flex-shrink-0" style={{ color: '#34d399' }} />}
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
                  <p className="text-[10px] font-bold mt-0.5" style={{ color: '#34d399' }}>
                    Aujourd&apos;hui 0€ · puis {plan.price}{plan.per}
                  </p>
                  {plan.note && (
                    <p className="text-[10px] mt-0" style={{ color: '#334155' }}>{plan.note}</p>
                  )}
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <span className="text-lg font-black text-white">{plan.price}</span>
                  <span className="text-[10px] ml-0.5" style={{ color: '#64748b' }}>{plan.per}</span>
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
          7 jours gratuits · aucun débit avant le 8e jour · annulez avant et payez 0€
          <br />Après abonnement, revenez dans l&apos;app — votre statut Pro s&apos;active automatiquement.
        </motion.p>
      )}
    </div>
  )
}
