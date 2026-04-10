'use client'

import { motion } from 'framer-motion'
import { Crown, Check, Zap, Globe, Monitor, ImageIcon, Brain, Bell, Layers, Key, Smartphone, Mic, MessageSquare, Star, Cpu, Lock } from 'lucide-react'
import { GUMROAD_CUSTOM_URL, GUMROAD_CUSTOM_QUARTERLY_URL, PADDLE_PRICE_PRO_STARTER, PADDLE_PRICE_PRO_PLUS, PADDLE_PRICE_CUSTOM_STARTER, PADDLE_PRICE_CUSTOM_PRO } from '../constants'
import { isPro, isCustomPlan, voiceMinutesUsed, voiceMinutesRemaining, voiceQuotaMinutes } from '../types'
import type { UserData } from '../types'
import { usePaddle } from '../hooks/usePaddle'

interface Props {
  user: UserData
  onRefresh?: () => void
}

// ── Plans Pro ─────────────────────────────────────────────────────────────────
const PRO_PLANS = [
  {
    key: 'starter',
    label: 'Pro Starter',
    price: '39,99€',
    per: '/mois',
    priceId: PADDLE_PRICE_PRO_STARTER,
    popular: false,
    limits: {
      voice: '200 min/mois',
      text: '250 messages/jour',
      search: '50 recherches/jour',
      mcp: '30 appels MCP/jour',
      desktop: '20 interactions/jour',
    },
  },
  {
    key: 'plus',
    label: 'Pro Plus',
    price: '99,99€',
    per: '/mois',
    priceId: PADDLE_PRICE_PRO_PLUS,
    popular: true,
    limits: {
      voice: '450 min/mois',
      text: '600 messages/jour',
      search: 'Illimitée',
      mcp: '50 appels MCP/jour',
      desktop: '30 interactions/jour',
    },
  },
]

// ── Plans Custom ──────────────────────────────────────────────────────────────
const CUSTOM_PLANS = [
  {
    key: 'custom_starter',
    label: 'Custom Starter',
    price: '14,99€',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_STARTER,
    popular: false,
  },
  {
    key: 'custom_pro',
    label: 'Custom Pro',
    price: '29,99€',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_PRO,
    popular: true,
  },
]

const PRO_FEATURES = [
  { icon: Mic, text: 'Minutes vocales par mois' },
  { icon: MessageSquare, text: 'Messages texte par jour' },
  { icon: Globe, text: 'Recherche web Google en temps réel' },
  { icon: ImageIcon, text: 'Analyse d\'images (jusqu\'à 6 par appel)' },
  { icon: Monitor, text: 'Contrôle à distance Mac/PC' },
  { icon: Brain, text: 'Vision écran en temps réel' },
  { icon: Bell, text: 'Rappels push intelligents' },
  { icon: Layers, text: 'Intégrations MCP (Notion, GitHub, Brave…)' },
  { icon: Zap, text: 'Mémoire conversationnelle' },
  { icon: Star, text: 'Support prioritaire' },
]

const CUSTOM_FEATURES = [
  { icon: Mic, text: '∞ Voix vraiment illimitée — aucun compteur' },
  { icon: MessageSquare, text: '∞ Messages texte illimités' },
  { icon: Globe, text: '∞ Recherche web illimitée' },
  { icon: ImageIcon, text: '∞ Analyse d\'images illimitée' },
  { icon: Monitor, text: '∞ Contrôle à distance illimité' },
  { icon: Brain, text: '∞ Vision écran illimitée' },
  { icon: Cpu, text: '∞ Auto-amélioration IA — aucune limite d\'étapes' },
  { icon: Bell, text: '∞ Rappels push illimités' },
  { icon: Layers, text: '∞ Intégrations MCP illimitées' },
  { icon: Key, text: 'Votre propre clé API Gemini (Google AI Studio)' },
  { icon: Lock, text: 'Clé chiffrée de bout en bout avec votre PIN' },
  { icon: Star, text: 'Support prioritaire' },
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
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-black text-white">{fmtMin(used)}</span>
            <span className="text-xs ml-2" style={{ color: '#475569' }}>/ {quota === 999 ? '∞' : quota} min</span>
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
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: barColor, boxShadow: `0 0 8px ${barColor}60` }}
          />
        </div>
        {resetAt && (
          <p className="text-[11px]" style={{ color: '#334155' }}>
            Remise à zéro le {resetAt} · Partagé entre web, mobile et desktop
          </p>
        )}
      </div>
    </motion.div>
  )
}

export function SubscriptionTab({ user, onRefresh }: Props) {
  const pro = isPro(user)
  const custom = isCustomPlan(user)
  const { openCheckout } = usePaddle(onRefresh ? () => setTimeout(onRefresh!, 5000) : undefined)

  const hasMobileSubscription = !!user.subscription_tier &&
    user.subscription_tier !== 'free' &&
    user.subscription_source !== 'gumroad' &&
    user.subscription_source !== 'paddle'

  const currentPlan = pro ? (user.subscription_plan ?? 'pro_starter') : null
  const activePlanLabel = currentPlan === 'pro_plus' ? 'Pro Plus' : currentPlan === 'pro_starter' ? 'Pro Starter' : null

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-lg mx-auto w-full space-y-4">

      {/* Mobile subscriber note */}
      {hasMobileSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl px-4 py-3 flex items-start gap-3"
          style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}
        >
          <Smartphone size={15} style={{ color: '#818cf8', marginTop: 2 }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: '#a5b4fc' }}>Abonné via App Store ou Google Play ?</p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: '#64748b' }}>
              Votre abonnement mobile est géré dans l&apos;application Ava Mobile.
            </p>
          </div>
        </motion.div>
      )}

      {/* Status actif */}
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
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: pro ? '#34d399' : '#475569' }} />
        <div className="flex-1">
          <p className="text-sm font-semibold" style={{ color: pro ? '#34d399' : '#94a3b8' }}>
            {pro ? `Abonnement ${activePlanLabel ?? 'Pro'} actif` : 'Plan gratuit'}
          </p>
          {pro && user.subscription_expires_at && (
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
              Expire le {new Date(user.subscription_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          {!pro && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>Passez à Pro pour débloquer toutes les fonctionnalités</p>}
        </div>
      </motion.div>

      {/* Barre quota vocal */}
      <VoiceQuotaBar user={user} pro={pro} />

      {/* ── SECTION PRO ──────────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center py-3">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(225,29,72,0.1)', border: '1px solid rgba(225,29,72,0.2)' }}>
          <Crown size={24} style={{ color: '#f43f5e' }} />
        </div>
        <h2 className="text-lg font-black text-white">Ava Pro</h2>
        <p className="text-xs mt-1" style={{ color: '#64748b' }}>L&apos;expérience complète sans limites</p>
        {!pro && (
          <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', color: '#34d399' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            3 jours gratuits — aujourd&apos;hui 0€
          </div>
        )}
      </motion.div>

      {/* Plans Pro — cards */}
      {!pro ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }} className="space-y-3">
          {PRO_PLANS.map((plan) => (
            <div
              key={plan.key}
              className="rounded-2xl overflow-hidden"
              style={{
                background: plan.popular ? 'rgba(225,29,72,0.06)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${plan.popular ? 'rgba(225,29,72,0.25)' : 'rgba(255,255,255,0.07)'}`,
              }}
            >
              {/* Header plan */}
              <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{plan.label}</span>
                    {plan.popular && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(225,29,72,0.2)', color: '#f43f5e' }}>Populaire</span>
                    )}
                  </div>
                  <p className="text-[10px] mt-0.5" style={{ color: '#34d399' }}>3 jours gratuits · puis {plan.price}{plan.per}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-white">{plan.price}</span>
                  <span className="text-[10px] ml-0.5" style={{ color: '#64748b' }}>{plan.per}</span>
                </div>
              </div>
              {/* Limites */}
              <div className="px-4 pb-3 space-y-1.5">
                {[
                  { icon: Mic, label: plan.limits.voice },
                  { icon: MessageSquare, label: plan.limits.text },
                  { icon: Globe, label: plan.limits.search },
                  { icon: Layers, label: plan.limits.mcp },
                  { icon: Monitor, label: plan.limits.desktop },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={11} style={{ color: plan.popular ? '#f43f5e' : '#475569' }} />
                    <span className="text-[11px]" style={{ color: '#94a3b8' }}>{label}</span>
                  </div>
                ))}
              </div>
              {/* CTA */}
              <div className="px-4 pb-4">
                <button
                  onClick={() => openCheckout(plan.priceId, user.email)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm"
                  style={{
                    background: plan.popular ? '#e11d48' : 'rgba(225,29,72,0.15)',
                    color: plan.popular ? '#fff' : '#f43f5e',
                    boxShadow: plan.popular ? '0 0 20px rgba(225,29,72,0.3)' : 'none',
                  }}
                >
                  Commencer l&apos;essai gratuit
                </button>
              </div>
            </div>
          ))}
          <p className="text-center text-xs pb-1" style={{ color: '#334155' }}>
            3 jours gratuits · aucun débit avant le 4e jour · annulez avant et payez 0€
          </p>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
          {/* Features avec checkmarks */}
          <div className="rounded-2xl overflow-hidden mb-3"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Votre plan {activePlanLabel} — actif</p>
            </div>
            {PRO_FEATURES.map(({ icon: Icon, text }, i) => (
              <div key={text} className="flex items-center gap-3 px-4 py-2.5"
                style={{ borderBottom: i < PRO_FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(52,211,153,0.1)' }}>
                  <Icon size={12} style={{ color: '#34d399' }} />
                </div>
                <span className="text-xs leading-snug flex-1" style={{ color: '#cbd5e1' }}>{text}</span>
                <Check size={12} style={{ color: '#34d399' }} />
              </div>
            ))}
          </div>
          <a href="https://customer.paddle.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm w-full"
            style={{ background: '#e11d48', color: '#fff', boxShadow: '0 0 24px rgba(225,29,72,0.35)', textDecoration: 'none' }}>
            Gérer mon abonnement Pro
          </a>
        </motion.div>
      )}

      {/* ── SECTION CUSTOM ───────────────────────────────────────────────────── */}
      <div className="pt-2">
        <div className="flex items-center gap-2 px-1 mb-3">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>Ava Custom</p>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="text-center py-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Key size={20} style={{ color: '#818cf8' }} />
          </div>
          <h3 className="text-base font-black text-white">Clé API Gemini personnelle</h3>
          <p className="text-xs mt-1 max-w-xs mx-auto" style={{ color: '#64748b' }}>
            Votre propre quota Gemini · tout est radicalement illimité · aucun compteur de minutes
          </p>
        </motion.div>

        {custom ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.25)' }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#818cf8' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#a5b4fc' }}>Plan Custom actif</p>
                {user.custom_plan_expires_at && (
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    Expire le {new Date(user.custom_plan_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <Check size={14} style={{ color: '#818cf8' }} />
            </div>
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              {CUSTOM_FEATURES.map(({ icon: Icon, text }, i) => (
                <div key={text} className="flex items-center gap-3 px-4 py-2.5"
                  style={{ borderBottom: i < CUSTOM_FEATURES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.12)' }}>
                    <Icon size={12} style={{ color: '#818cf8' }} />
                  </div>
                  <span className="text-xs leading-snug flex-1" style={{ color: '#cbd5e1' }}>{text}</span>
                  <Check size={12} style={{ color: '#818cf8' }} />
                </div>
              ))}
            </div>
            <a href="https://customer.paddle.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm w-full"
              style={{ background: 'rgba(99,102,241,0.8)', color: '#fff', textDecoration: 'none' }}>
              Gérer mon plan Custom
            </a>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-2">
            {CUSTOM_PLANS.map((plan) => (
              <button
                key={plan.key}
                onClick={() => openCheckout(plan.priceId, user.email)}
                className="w-full rounded-2xl p-4 text-left transition-all"
                style={{
                  background: plan.popular ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${plan.popular ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: plan.popular ? '#818cf8' : '#64748b' }}>{plan.label}</span>
                      {plan.popular && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                          Meilleure valeur
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] mt-0.5" style={{ color: '#475569' }}>Tout illimité · clé API Gemini personnelle</p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <span className="text-lg font-black text-white">{plan.price}</span>
                    <span className="text-[10px] ml-0.5" style={{ color: '#64748b' }}>{plan.per}</span>
                  </div>
                </div>
              </button>
            ))}
            <p className="text-center text-[10px] pt-1" style={{ color: '#334155' }}>
              Configurez votre clé dans Paramètres après souscription.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
