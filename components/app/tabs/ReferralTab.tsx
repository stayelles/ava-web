'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Copy, Check, Gift, Ticket, Loader2, ShieldCheck, ArrowRight, Clock } from 'lucide-react'
import type { UserData } from '../types'
import { SUPABASE_HEADERS, SUPABASE_URL } from '../constants'

interface Props {
  user: UserData
}

type RewardPlan = {
  plan_key: string
  label: string
  threshold: number
  qualified_count: number
  remaining: number
  cycle_status: string
  cycle_starts_at: string | null
  cycle_ends_at: string | null
}

type RewardCoupon = {
  id: string
  code: string
  plan_key: string
  status: string
  created_at: string
  expires_at: string
  redeemed_at?: string | null
  redeemed_by_user_id?: string | null
}

type RewardDashboard = {
  plans: RewardPlan[]
  coupons: RewardCoupon[]
}

const PLAN_COLORS: Record<string, string> = {
  custom_simple: '#38bdf8',
  custom_pro: '#818cf8',
  custom_ultra: '#c084fc',
  custom_max: '#fbbf24',
}

const DEFAULT_REWARD_PLANS: RewardPlan[] = [
  { plan_key: 'custom_simple', label: 'Custom Simple', threshold: 10, qualified_count: 0, remaining: 10, cycle_status: 'not_started', cycle_starts_at: null, cycle_ends_at: null },
  { plan_key: 'custom_pro', label: 'Custom Pro', threshold: 8, qualified_count: 0, remaining: 8, cycle_status: 'not_started', cycle_starts_at: null, cycle_ends_at: null },
  { plan_key: 'custom_ultra', label: 'Custom Ultra', threshold: 7, qualified_count: 0, remaining: 7, cycle_status: 'not_started', cycle_starts_at: null, cycle_ends_at: null },
  { plan_key: 'custom_max', label: 'Custom Max', threshold: 5, qualified_count: 0, remaining: 5, cycle_status: 'not_started', cycle_starts_at: null, cycle_ends_at: null },
]

const BENEFITS = [
  '1 mois gratuit Ava Trading + Ava Volatility sur le plan débloqué.',
  'Coupon transférable: vous pouvez l’utiliser ou l’envoyer à quelqu’un.',
  'Les filleuls comptent seulement après un paiement réel, hors essai gratuit.',
  'Un cycle dure 32 jours et le coupon reste utilisable pendant 30 jours.',
]

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function planLabel(planKey: string) {
  if (planKey === 'custom_simple') return 'Custom Simple'
  if (planKey === 'custom_pro') return 'Custom Pro'
  if (planKey === 'custom_ultra') return 'Custom Ultra'
  if (planKey === 'custom_max') return 'Custom Max'
  return planKey
}

export function ReferralTab({ user }: Props) {
  const [copied, setCopied] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<RewardDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)
  const [redeemCode, setRedeemCode] = useState('')
  const [message, setMessage] = useState('')

  const referralCode = user.referral_code ?? '—'
  const referralLink = user.referral_code
    ? `https://call-ava.com/?ref=${user.referral_code}`
    : null

  const availableCoupons = useMemo(
    () => (dashboard?.coupons ?? []).filter(coupon => coupon.status === 'available' && new Date(coupon.expires_at) > new Date()),
    [dashboard?.coupons],
  )

  const loadRewards = async () => {
    setLoading(true)
    setMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/referral-rewards`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({ user_id: user.id }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Chargement impossible')
      setDashboard({ plans: data.plans ?? [], coupons: data.coupons ?? [] })
    } catch (error) {
      setDashboard({ plans: DEFAULT_REWARD_PLANS, coupons: [] })
      setMessage('Les règles sont affichées. Les statistiques seront disponibles dès que le service de récompenses sera déployé.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRewards()
  }, [user.id])

  const copyCode = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch {}
  }

  const redeemCoupon = async (code: string) => {
    const cleanCode = code.trim().toUpperCase()
    if (!cleanCode) return
    setRedeeming(cleanCode)
    setMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/referral-redeem`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({ user_id: user.id, code: cleanCode }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? 'Activation impossible')
      setMessage(`Coupon activé jusqu’au ${formatDate(data.expires_at)}.`)
      setRedeemCode('')
      await loadRewards()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Impossible d’activer ce coupon.')
    } finally {
      setRedeeming(null)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 max-w-3xl mx-auto w-full space-y-4">
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
        <h2 className="text-xl font-black text-white">Affiliation Ava Trading</h2>
        <p className="text-sm mt-1" style={{ color: '#64748b' }}>
          Partagez Ava, faites grandir votre réseau et débloquez des accès Trading gratuits.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-4 grid gap-3 md:grid-cols-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          {BENEFITS.map((benefit, index) => {
            const icons = [Gift, Ticket, ShieldCheck, Clock]
            const Icon = icons[index] ?? Gift
            return (
              <div key={benefit} className="flex items-start gap-3 rounded-xl px-3 py-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}>
                <Icon size={15} className="mt-0.5 flex-shrink-0" style={{ color: '#818cf8' }} />
                <p className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>{benefit}</p>
              </div>
            )
          })}
        </div>
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <Gift size={13} style={{ color: '#475569' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Comment ça marche
            </p>
          </div>
        </div>
        {[
          { step: '1', text: 'Partagez votre code de parrainage.' },
          { step: '2', text: 'Le filleul s’inscrit avec ce code puis active un plan Custom payant.' },
          { step: '3', text: 'Quand le seuil du même plan est atteint, un coupon Ava Trading de 1 mois est créé.' },
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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="rounded-2xl p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
        style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.16)' }}
      >
        <div>
          <p className="text-sm font-black text-white">Règles complètes du programme</p>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
            Seuils, durée des coupons, exclusions des essais gratuits et règles anti-abus.
          </p>
        </div>
        <a
          href="/affiliation"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black"
          style={{ color: '#020617', background: '#fbbf24' }}
        >
          Voir la page publique
          <ArrowRight size={14} />
        </a>
      </motion.div>

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
        <div className="px-4 py-4 grid gap-3 md:grid-cols-[1fr_1.5fr]">
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <span className="text-xl font-black tracking-widest" style={{ color: '#818cf8' }}>
              {referralCode}
            </span>
            {user.referral_code && (
              <motion.button
                onClick={() => copyCode(referralCode, 'code')}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg"
                style={{ background: 'rgba(99,102,241,0.15)' }}
              >
                {copied === 'code' ? <Check size={16} style={{ color: '#34d399' }} /> : <Copy size={16} style={{ color: '#818cf8' }} />}
              </motion.button>
            )}
          </div>

          {referralLink && (
            <div
              className="flex items-center justify-between px-3 py-2.5 rounded-xl gap-2"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-xs truncate" style={{ color: '#64748b' }}>{referralLink}</span>
              <motion.button
                onClick={() => copyCode(referralLink, 'link')}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 p-1.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                {copied === 'link' ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} style={{ color: '#64748b' }} />}
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2">
            <Ticket size={13} style={{ color: '#475569' }} />
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Récompenses Ava Trading
            </p>
          </div>
          {loading && <Loader2 size={14} className="animate-spin" style={{ color: '#64748b' }} />}
        </div>

        <div className="p-4 space-y-3">
          {message && (
            <div
              className="px-3 py-2 rounded-xl text-xs font-semibold"
              style={{ color: '#cbd5e1', background: 'rgba(15,23,42,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {message}
            </div>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            {(dashboard?.plans ?? DEFAULT_REWARD_PLANS).map(plan => {
              const color = PLAN_COLORS[plan.plan_key] ?? '#818cf8'
              const progress = Math.min(100, Math.round((plan.qualified_count / plan.threshold) * 100))
              return (
                <div
                  key={plan.plan_key}
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(2,6,23,0.45)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-black text-white">{plan.label}</p>
                      <p className="text-[11px]" style={{ color: '#64748b' }}>
                        Cycle: {plan.cycle_ends_at ? `jusqu’au ${formatDate(plan.cycle_ends_at)}` : 'pas encore démarré'}
                      </p>
                    </div>
                    <span className="text-sm font-black" style={{ color }}>
                      {plan.qualified_count}/{plan.threshold}
                    </span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${progress}%`, background: color }} />
                  </div>
                  <p className="text-xs mt-3 leading-relaxed" style={{ color: '#94a3b8' }}>
                    {plan.remaining === 0
                      ? 'Seuil atteint: un coupon est généré ou déjà en attente.'
                      : `${plan.remaining} paiement(s) confirmé(s) restant(s) sur ce même plan.`}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Activer un code reçu
            </p>
            <div className="flex flex-col gap-2 md:flex-row">
              <input
                value={redeemCode}
                onChange={event => setRedeemCode(event.target.value.toUpperCase())}
                placeholder="AVA-XXXXXXXXXX"
                className="min-w-0 flex-1 rounded-xl px-3 py-2 text-sm font-bold outline-none"
                style={{ color: '#e2e8f0', background: 'rgba(2,6,23,0.65)', border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <button
                onClick={() => redeemCoupon(redeemCode)}
                disabled={!redeemCode.trim() || redeeming === redeemCode.trim().toUpperCase()}
                className="rounded-xl px-4 py-2 text-sm font-black disabled:opacity-60"
                style={{ color: '#020617', background: '#e2e8f0' }}
              >
                {redeeming === redeemCode.trim().toUpperCase() ? 'Activation...' : 'Activer'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: '#475569' }}>
              Coupons disponibles
            </p>
            {availableCoupons.length === 0 ? (
              <p className="text-sm" style={{ color: '#64748b' }}>
                Aucun coupon disponible pour le moment.
              </p>
            ) : availableCoupons.map(coupon => (
              <div
                key={coupon.id}
                className="flex flex-col gap-3 rounded-xl p-3 md:flex-row md:items-center md:justify-between"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)' }}
              >
                <div>
                  <p className="text-sm font-black text-white">{planLabel(coupon.plan_key)} · 1 mois gratuit</p>
                  <p className="text-xs" style={{ color: '#86efac' }}>
                    {coupon.code} · expire le {formatDate(coupon.expires_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyCode(coupon.code, coupon.id)}
                    className="px-3 py-2 rounded-lg text-xs font-bold"
                    style={{ color: '#d1fae5', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.22)' }}
                  >
                    {copied === coupon.id ? 'Copié' : 'Copier'}
                  </button>
                  <button
                    onClick={() => redeemCoupon(coupon.code)}
                    disabled={redeeming === coupon.code}
                    className="px-3 py-2 rounded-lg text-xs font-bold disabled:opacity-60"
                    style={{ color: '#020617', background: '#86efac' }}
                  >
                    {redeeming === coupon.code ? 'Activation...' : 'Utiliser'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <p className="text-center text-xs pb-2" style={{ color: '#334155' }}>
        Les essais gratuits, remboursements et paiements non confirmés ne comptent pas dans les récompenses Trading.
      </p>
    </div>
  )
}
