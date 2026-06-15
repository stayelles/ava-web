'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, Check, Zap, Globe, Monitor, ImageIcon, Brain, Bell, 
  Layers, Key, Smartphone, Mic, MessageSquare, Star, Cpu, Lock,
  CreditCard, ExternalLink, HelpCircle, ShieldCheck, AlertCircle, ArrowRight, X
} from 'lucide-react'
import {
  PADDLE_PRICE_PRO_STARTER,
  PADDLE_PRICE_CUSTOM_MAX,
  PADDLE_PRICE_CUSTOM_PRO,
  PADDLE_PRICE_CUSTOM_SIMPLE,
  PADDLE_PRICE_CUSTOM_ULTRA,
  PAYPAL_CLIENT_ID,
  PAYPAL_PLAN_CUSTOM_MAX,
  PAYPAL_PLAN_CUSTOM_PRO,
  PAYPAL_PLAN_CUSTOM_PRO_TRIAL,
  PAYPAL_PLAN_CUSTOM_SIMPLE,
  PAYPAL_PLAN_CUSTOM_ULTRA,
  PAYPAL_PLAN_CUSTOM_ULTRA_TRIAL,
  SUPABASE_HEADERS,
  SUPABASE_URL,
} from '../constants'
import { isPro, isCustomPlan, voiceMinutesUsed, voiceMinutesRemaining, voiceQuotaMinutes } from '../types'
import type { UserData } from '../types'

declare global {
  interface Window {
    paypal?: {
      Buttons: (options: {
        style?: Record<string, unknown>
        createSubscription: (_data: unknown, actions: { subscription: { create: (payload: Record<string, unknown>) => Promise<string> } }) => Promise<string>
        onApprove: (data: Record<string, unknown>) => void
        onError: (error: unknown) => void
      }) => { render: (container: HTMLElement) => Promise<void> }
    }
  }
}

interface Props {
  user: UserData
  onRefresh?: () => void
  onGoToSettings?: () => void
}

// ── Plans definition ──
const ALL_PLANS = [
  {
    key: 'custom_simple',
    label: 'Custom Simple',
    price: '€39.99',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_SIMPLE,
    paypalPlanId: PAYPAL_PLAN_CUSTOM_SIMPLE,
    capital: 'Plage recommandée : 200€ à 500€',
    popular: false,
    accentColor: '#6366f1',
    bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(99, 102, 241, 0.01) 100%)',
    border: 'rgba(99, 102, 241, 0.15)',
    glow: 'rgba(99, 102, 241, 0.05)',
    btnBg: 'rgba(99, 102, 241, 0.08)',
    btnHoverBg: 'rgba(99, 102, 241, 0.15)',
    btnColor: '#818cf8',
    description: 'Pour démarrer avec Ava Desktop, une clé API personnelle et une configuration prudente.',
    features: [
      'Ava Desktop inclus',
      'Clé API Gemini personnelle',
      'Limites prudentes par défaut',
      'Automatisations essentielles',
      'Support standard',
      'Clé API Gemini personnelle',
      'Support standard',
    ]
  },
  {
    key: 'pro_starter',
    label: 'Pro Starter',
    price: '39,99€',
    per: '/mois',
    priceId: PADDLE_PRICE_PRO_STARTER,
    paypalPlanId: null,
    capital: null,
    popular: false,
    accentColor: '#f43f5e',
    bg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
    border: 'rgba(255, 255, 255, 0.08)',
    glow: 'none',
    btnBg: 'rgba(255, 255, 255, 0.05)',
    btnHoverBg: 'rgba(255, 255, 255, 0.1)',
    btnColor: '#f1f5f9',
    description: 'L\'expérience complète et sans tracas avec notre clé API partagée incluse.',
    features: [
      '200 min de voix / mois',
      '250 messages texte / jour',
      '50 recherches web / jour',
      'Analyse d\'images (6/appel)',
      '20 interactions Mac/PC / jour',
      'Mémoire conversationnelle',
    ]
  },
  {
    key: 'custom_pro',
    label: 'Custom Pro',
    price: '€99.99',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_PRO,
    paypalPlanId: PAYPAL_PLAN_CUSTOM_PRO,
    trialPaypalPlanId: PAYPAL_PLAN_CUSTOM_PRO_TRIAL,
    trialDays: 1,
    capital: 'Plage recommandée : 500€ à 3 000€',
    popular: true,
    badge: 'Recommandé',
    accentColor: '#e11d48',
    bg: 'linear-gradient(135deg, rgba(225, 29, 72, 0.05) 0%, rgba(225, 29, 72, 0.01) 100%)',
    border: 'rgba(225, 29, 72, 0.25)',
    glow: 'rgba(225, 29, 72, 0.15)',
    btnBg: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
    btnHoverBg: 'linear-gradient(90deg, #fb7185 0%, #f43f5e 100%)',
    btnColor: '#fff',
    description: 'Pour usage avancé, avec plus de liberté sur les objectifs et réglages.',
    features: [
      'Limites personnalisées',
      'Automatisations avancées',
      'Configuration plus flexible',
      'Support prioritaire',
      'Ava Desktop inclus',
      'Clé API Gemini personnelle',
      'Support prioritaire',
    ]
  },
  {
    key: 'custom_ultra',
    label: 'Custom Ultra',
    price: '€399.99',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_ULTRA,
    paypalPlanId: PAYPAL_PLAN_CUSTOM_ULTRA,
    trialPaypalPlanId: PAYPAL_PLAN_CUSTOM_ULTRA_TRIAL,
    trialDays: 1,
    capital: 'Plage recommandée : 3 000€ à 8 000€',
    popular: true,
    badge: 'Usage intensif',
    accentColor: '#e11d48',
    bg: 'linear-gradient(135deg, rgba(225, 29, 72, 0.06) 0%, rgba(99, 102, 241, 0.02) 100%)',
    border: 'rgba(225, 29, 72, 0.28)',
    glow: 'rgba(225, 29, 72, 0.18)',
    btnBg: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
    btnHoverBg: 'linear-gradient(90deg, #fb7185 0%, #f43f5e 100%)',
    btnColor: '#fff',
    description: 'Pour usage intensif, limites élevées et accompagnement plus poussé.',
    features: [
      'Tout Custom Pro inclus',
      'Limites élevées',
      'Automatisations étendues',
      'Configuration avancée',
      'Support renforcé',
      'Support très prioritaire',
    ]
  },
  {
    key: 'custom_max',
    label: 'Custom Max',
    price: '€999.99',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_MAX,
    paypalPlanId: PAYPAL_PLAN_CUSTOM_MAX,
    capital: 'Plage recommandée : 8 000€ à 20 000€+',
    popular: false,
    badge: 'Volume élevé',
    accentColor: '#f43f5e',
    bg: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(15, 23, 42, 0.18) 100%)',
    border: 'rgba(244, 63, 94, 0.35)',
    glow: 'rgba(244, 63, 94, 0.24)',
    btnBg: 'linear-gradient(90deg, #e11d48 0%, #be123c 100%)',
    btnHoverBg: 'linear-gradient(90deg, #fb7185 0%, #e11d48 100%)',
    btnColor: '#fff',
    description: 'Le plan maximal pour volumes élevés, accompagnement et limites sur mesure.',
    features: [
      'Tout Custom Ultra inclus',
      'Limites maximales',
      'Automatisations premium',
      'Configuration complète',
      'Accompagnement prioritaire',
      'Accompagnement direct',
      'Support maximal',
    ]
  }
]

const PRO_FEATURES = [
  { icon: Mic, text: 'Minutes vocales par mois', val: '200 min' },
  { icon: MessageSquare, text: 'Messages texte par jour', val: '250 messages' },
  { icon: Globe, text: 'Recherche web Google en temps réel', val: '50 / jour' },
  { icon: ImageIcon, text: 'Analyse d\'images (jusqu\'à 6 par appel)', val: 'Inclus' },
  { icon: Monitor, text: 'Contrôle à distance Mac/PC', val: '20 actions / jour' },
  { icon: Brain, text: 'Vision écran en temps réel', val: 'Inclus' },
  { icon: Bell, text: 'Rappels push intelligents', val: 'Inclus' },
  { icon: Layers, text: 'Intégrations MCP (Notion, GitHub, Brave…)', val: 'Inclus' },
  { icon: Zap, text: 'Mémoire conversationnelle', val: 'Inclus' },
  { icon: Star, text: 'Support prioritaire', val: 'Prioritaire' },
]

const CUSTOM_FEATURES = [
  { icon: Mic, text: '∞ Voix vraiment illimitée — aucun compteur', val: 'Illimité' },
  { icon: MessageSquare, text: '∞ Messages texte illimités', val: 'Illimité' },
  { icon: Globe, text: '∞ Recherche web illimitée', val: 'Illimité' },
  { icon: ImageIcon, text: '∞ Analyse d\'images illimitée', val: 'Illimité' },
  { icon: Monitor, text: '∞ Contrôle à distance illimité', val: 'Illimité' },
  { icon: Brain, text: '∞ Vision écran illimitée', val: 'Illimité' },
  { icon: Cpu, text: '∞ Auto-amélioration IA — aucune limite d\'étapes', val: 'Illimité' },
  { icon: Monitor, text: 'Ava Desktop inclus', val: 'Inclus' },
  { icon: Bell, text: '∞ Rappels push illimités', val: 'Illimité' },
  { icon: Layers, text: '∞ Intégrations MCP illimitées', val: 'Illimité' },
  { icon: Key, text: 'Votre propre clé API Gemini (Google AI Studio)', val: 'Requis' },
  { icon: Lock, text: 'Clé chiffrée de bout en bout avec votre PIN', val: 'Chiffré' },
]

const planLabels: Record<string, string> = {
  pro_starter: 'Pro Starter',
  custom: 'Custom Simple',
  custom_starter: 'Custom Simple',
  custom_simple: 'Custom Simple',
  pro_plus: 'Custom Pro',
  custom_pro: 'Custom Pro',
  custom_ultra: 'Custom Ultra',
  custom_max: 'Custom Max',
}

const CUSTOM_PLAN_ORDER = ['custom_simple', 'custom_pro', 'custom_ultra', 'custom_max']
const CUSTOM_PLAN_CTA: Record<string, string> = {
  custom_simple: 'Profiter de Simple',
  custom_pro: 'Profiter de Pro',
  custom_ultra: 'Profiter de Ultra',
  custom_max: 'Profiter de Max',
}

function normalizePlanKey(plan: string | null | undefined, custom: boolean): string | null {
  if (plan === 'custom' || plan === 'custom_starter') return 'custom_simple'
  if (plan === 'pro_plus') return 'custom_pro'
  if (plan && planLabels[plan]) return plan
  if (custom) return 'custom_simple'
  return null
}

function customPlanRank(plan: string | null) {
  return plan ? CUSTOM_PLAN_ORDER.indexOf(plan) : -1
}

function nextCustomPlan(plan: string | null) {
  const rank = customPlanRank(plan)
  if (rank < 0 || rank >= CUSTOM_PLAN_ORDER.length - 1) return null
  return ALL_PLANS.find(item => item.key === CUSTOM_PLAN_ORDER[rank + 1]) ?? null
}

function isValidUpgradeTarget(currentPlan: string | null, targetPlan: string | null) {
  const currentRank = customPlanRank(currentPlan)
  const targetRank = customPlanRank(targetPlan)
  return currentRank >= 0 && targetRank > currentRank
}

function isPayPalPlanConfigured(planId: string | null | undefined): planId is string {
  return !!planId && planId.startsWith('P-')
}

function hasAnyPriorSubscription(user: UserData) {
  const source = String(user.subscription_source ?? '')
  const tier = String(user.subscription_tier ?? '')
  return !!user.ava_trading_trial_used ||
    !!user.ava_trading_trial_subscription_id ||
    !!user.subscription_plan ||
    !!user.paddle_subscription_id ||
    !!user.paypal_subscription_id ||
    !!user.geniuspay_subscription_uuid ||
    !!user.mollie_subscription_id ||
    !!user.airwallex_subscription_id ||
    (!!source && source !== 'none') ||
    (!!tier && tier !== 'free')
}

function canUsePlanTrial(plan: typeof ALL_PLANS[number], user: UserData) {
  return 'trialDays' in plan && !!plan.trialDays && !hasAnyPriorSubscription(user)
}

function planTrialDays(plan: typeof ALL_PLANS[number]) {
  return 'trialDays' in plan ? plan.trialDays : null
}

function checkoutPayPalPlanId(plan: typeof ALL_PLANS[number], user: UserData) {
  if (canUsePlanTrial(plan, user) && 'trialPaypalPlanId' in plan) return plan.trialPaypalPlanId
  return plan.paypalPlanId
}

function isPlanCheckoutReady(plan: typeof ALL_PLANS[number]) {
  return CUSTOM_PLAN_ORDER.includes(plan.key)
}

function loadPayPalSdk(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.paypal) return Promise.resolve()

  const existing = document.getElementById('paypal-subscriptions-sdk') as HTMLScriptElement | null
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error('PayPal SDK indisponible')), { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = 'paypal-subscriptions-sdk'
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(PAYPAL_CLIENT_ID)}&vault=true&intent=subscription&components=buttons&currency=EUR`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('PayPal SDK indisponible'))
    document.body.appendChild(script)
  })
}

function countryFromLocale(locale: string | undefined) {
  if (!locale) return null
  try {
    const parsed = new Intl.Locale(locale)
    if (parsed.region && /^[A-Za-z]{2}$/.test(parsed.region)) return parsed.region.toUpperCase()
  } catch {
    const match = locale.match(/[-_]([A-Za-z]{2})(?:$|[-_])/)
    if (match?.[1]) return match[1].toUpperCase()
  }
  return null
}

function browserCountryHints() {
  if (typeof window === 'undefined') return {}
  const locales = Array.from(new Set([
    ...(navigator.languages ?? []),
    navigator.language,
  ].filter(Boolean)))
  const localeCountry = locales.map(countryFromLocale).find(Boolean) ?? null
  return {
    locale_country: localeCountry,
    locales,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
  }
}

function isKnownPlan(plan: string | null) {
  return !!plan && ALL_PLANS.some(item => item.key === plan)
}

function VoiceQuotaBar({ user, pro }: { user: UserData; pro: boolean }) {
  const used = voiceMinutesUsed(user)
  const quota = voiceQuotaMinutes(user)
  const remaining = voiceMinutesRemaining(user)
  const pct = Math.min(100, (used / quota) * 100)

  const resetAt = user.voice_quota_reset_at
    ? new Date(user.voice_quota_reset_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
    : null

  const barColor = pct >= 90 ? '#ef4444' : pct >= 70 ? '#f59e0b' : pro ? '#10b981' : '#f43f5e'

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
      className="rounded-3xl overflow-hidden border border-white/5 bg-slate-950/40 backdrop-blur-md"
    >
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
        <Mic size={14} className="text-slate-400" />
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Temps vocal ce mois-ci
        </p>
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-3xl font-black text-white tracking-tight">{fmtMin(used)}</span>
            <span className="text-xs ml-2 text-slate-500">/ {quota === 999 ? '∞' : quota} min</span>
          </div>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: remaining <= 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              color: remaining <= 0 ? '#f87171' : '#94a3b8',
              border: remaining <= 0 ? '1px solid rgba(239, 68, 68, 0.15)' : '1px solid rgba(255,255,255,0.05)'
            }}
          >
            {remaining <= 0 ? 'Quota atteint' : `${fmtMin(remaining)} restantes`}
          </span>
        </div>
        
        <div className="h-2.5 rounded-full bg-white/5 overflow-hidden relative">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ 
              background: barColor, 
              boxShadow: `0 0 10px ${barColor}50` 
            }}
          />
        </div>
        
        {resetAt && (
          <div className="flex items-center gap-1.5 pt-1">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <p className="text-[11px] text-slate-500">
              Remise à zéro le {resetAt} (Partagé web, mobile, desktop)
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export function SubscriptionTab({ user, onRefresh, onGoToSettings }: Props) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [targetPlan, setTargetPlan] = useState<typeof ALL_PLANS[number] | null>(null)
  const [billingLoading, setBillingLoading] = useState(false)
  const [billingError, setBillingError] = useState('')
  const [billingMessage, setBillingMessage] = useState('')
  const [refreshedOnce, setRefreshedOnce] = useState(false)
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null)
  const [paymentChoicePlan, setPaymentChoicePlan] = useState<typeof ALL_PLANS[number] | null>(null)
  const [paypalPlan, setPaypalPlan] = useState<typeof ALL_PLANS[number] | null>(null)
  const paypalButtonRef = useRef<HTMLDivElement | null>(null)

  const pro = isPro(user)
  const custom = isCustomPlan(user)
  useEffect(() => {
    if (refreshedOnce) return
    setRefreshedOnce(true)
    onRefresh?.()
  }, [onRefresh, refreshedOnce])

  const hasMobileSubscription = !!user.subscription_tier &&
    user.subscription_tier !== 'free' &&
    user.subscription_source !== 'gumroad' &&
    user.subscription_source !== 'paddle' &&
    user.subscription_source !== 'paypal' &&
    user.subscription_source !== 'geniuspay' &&
    user.subscription_source !== 'mollie' &&
    user.subscription_source !== 'airwallex' &&
    user.subscription_source !== 'wise'

  const currentPlan = normalizePlanKey(user.subscription_plan, custom)
  const activePlanLabel = currentPlan ? planLabels[currentPlan] ?? null : null

  const isSubscribed = pro || custom
  // Define accent colors for current plan
  const planAccent = activePlanLabel === 'Custom Pro'
    ? '#e11d48'
    : activePlanLabel === 'Custom Ultra'
      ? '#e11d48'
      : activePlanLabel === 'Custom Max'
        ? '#f43f5e'
    : activePlanLabel === 'Custom Simple'
      ? '#6366f1'
      : '#f43f5e'

  // Determine active plan key
  const activePlanKey = currentPlan
  const nextPlan = nextCustomPlan(activePlanKey)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedUpgrade = params.get('upgrade')
    const requestedPlan = params.get('plan')
    if (isKnownPlan(requestedPlan)) {
      setSelectedPlanKey(requestedPlan)
    }
    if (isValidUpgradeTarget(activePlanKey, requestedUpgrade)) {
      const plan = ALL_PLANS.find(p => p.key === requestedUpgrade)
      if (plan) {
        setTargetPlan(plan)
        setShowUpgradeModal(true)
      }
    }
  }, [activePlanKey])

  const checkoutLabel = (plan: typeof ALL_PLANS[number]) => {
    if (!isPlanCheckoutReady(plan)) return 'Paiement en attente'
    if (user.subscription_source === 'airwallex' && user.airwallex_subscription_id && activePlanKey && activePlanKey !== plan.key) {
      return customPlanRank(plan.key) > customPlanRank(activePlanKey)
        ? `Upgrade vers ${plan.label.replace(/^Custom\s+/i, '')}`
        : 'Downgrade indisponible'
    }
    return canUsePlanTrial(plan, user)
      ? `Essai gratuit ${planTrialDays(plan)} jour`
      : CUSTOM_PLAN_CTA[plan.key] ?? 'S’abonner'
  }

  const startCheckout = (plan: typeof ALL_PLANS[number]) => {
    if (user.subscription_source === 'airwallex' && user.airwallex_subscription_id && activePlanKey && activePlanKey !== plan.key) {
      if (customPlanRank(plan.key) <= customPlanRank(activePlanKey)) {
        setBillingError('Le passage à une formule inférieure est désactivé pour éviter une erreur de facturation.')
        return
      }
    }

    if (isPlanCheckoutReady(plan)) {
      startAirwallexCheckout(plan)
      return
    }

    setBillingError('Le paiement est indisponible pour cette formule.')
  }

  const startPayPalCheckout = () => {
    if (!paymentChoicePlan) return
    setPaypalPlan(paymentChoicePlan)
    setPaymentChoicePlan(null)
  }

  const startMollieCheckout = async () => {
    if (!paymentChoicePlan) return
    setBillingLoading(true)
    setBillingError('')
    setBillingMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/mollie-subscription`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({
          user_id: user.id,
          target_plan: paymentChoicePlan.key,
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error || !result.ok) {
        setBillingError(result.error ?? 'Paiement carte indisponible pour le moment.')
        return
      }
      if (result.redirect_url) {
        window.location.href = String(result.redirect_url)
        return
      }
      setBillingError('Mollie n’a pas renvoyé de lien de paiement.')
    } catch {
      setBillingError('Erreur réseau Mollie. Réessayez dans un instant.')
    } finally {
      setBillingLoading(false)
    }
  }

  const startAirwallexCheckout = async (plan: typeof ALL_PLANS[number]) => {
    setBillingLoading(true)
    setBillingError('')
    setBillingMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/airwallex-subscription`, {
          method: 'POST',
          headers: SUPABASE_HEADERS,
          body: JSON.stringify({
            user_id: user.id,
            target_plan: plan.key,
            country_hints: browserCountryHints(),
          }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error || !result.ok) {
        setBillingError(result.error ?? 'Paiement Airwallex indisponible pour le moment.')
        return
      }
      if (result.redirect_url) {
        window.location.href = String(result.redirect_url)
        return
      }
      if (result.updated) {
        setBillingMessage(`Upgrade vers ${plan.label} confirmé. Ava met à jour vos accès.`)
        setTimeout(() => onRefresh?.(), 2500)
        return
      }
      setBillingError('Airwallex n’a pas renvoyé de lien de paiement.')
    } catch {
      setBillingError('Erreur réseau Airwallex. Réessayez dans un instant.')
    } finally {
      setBillingLoading(false)
    }
  }

  useEffect(() => {
    const paypalPlanId = paypalPlan ? checkoutPayPalPlanId(paypalPlan, user) : null
    if (!paypalPlan || !paypalButtonRef.current || !isPayPalPlanConfigured(paypalPlanId)) return

    let cancelled = false
    paypalButtonRef.current.innerHTML = ''
    setBillingError('')

    loadPayPalSdk()
      .then(() => {
        if (cancelled || !paypalButtonRef.current || !window.paypal || !isPayPalPlanConfigured(paypalPlanId)) return
        return window.paypal.Buttons({
          style: {
            layout: 'vertical',
            shape: 'pill',
            label: 'subscribe',
          },
          createSubscription: (_data, actions) => actions.subscription.create({
            plan_id: paypalPlanId,
            custom_id: user.email,
          }),
          onApprove: () => {
            setBillingMessage(`Abonnement PayPal ${paypalPlan.label} confirmé. Ava active votre accès dès que PayPal envoie la confirmation.`)
            setPaypalPlan(null)
            setTimeout(() => onRefresh?.(), 5000)
          },
          onError: (error) => {
            console.error('[PayPal]', error)
            setBillingError('PayPal a refuse ou interrompu le paiement. Reessayez dans quelques instants.')
          },
        }).render(paypalButtonRef.current)
      })
      .catch(() => {
        if (!cancelled) setBillingError('Chargement PayPal impossible pour le moment. Reessayez dans quelques instants.')
      })

    return () => {
      cancelled = true
    }
  }, [onRefresh, paypalPlan, user])

  const callPaddleSubscription = async (action: 'portal' | 'upgrade', plan?: string) => {
    setBillingLoading(true)
    setBillingError('')
    setBillingMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/paddle-subscription`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({ action, user_id: user.id, target_plan: plan }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error || !result.ok) {
        if (result.code === 'subscription_past_due') {
          setBillingError(result.error ?? 'Paiement en retard : régularisez votre abonnement dans Paddle, puis relancez l’upgrade.')
        } else if (result.code === 'subscription_not_active') {
          setBillingError(result.error ?? 'Cet abonnement n’est plus actif. Souscrivez directement au nouveau plan depuis la page des offres.')
        } else {
          setBillingError(result.error ?? 'Action Paddle impossible pour le moment.')
        }
        if (result.url) {
          setBillingMessage(String(result.url))
        }
        return null
      }
      return result
    } catch {
      setBillingError('Erreur réseau. Réessayez dans un instant.')
      return null
    } finally {
      setBillingLoading(false)
    }
  }

  const openPaddlePortal = async () => {
    const result = await callPaddleSubscription('portal')
    if (result?.url) {
      window.open(result.url, '_blank', 'noopener,noreferrer')
    }
  }

  const changePaddlePlan = async () => {
    if (!targetPlan?.key) return
    const result = await callPaddleSubscription('upgrade', targetPlan.key)
    if (result?.ok) {
      setBillingMessage(result.unchanged ? 'Cette formule est déjà active.' : `Formule mise à jour vers ${targetPlan.label}.`)
      setShowUpgradeModal(false)
      setTimeout(() => onRefresh?.(), 1000)
    }
  }

  const changePayPalPlan = async (plan: typeof ALL_PLANS[number]) => {
    setBillingLoading(true)
    setBillingError('')
    setBillingMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/paypal-subscription`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({ action: 'revise', user_id: user.id, target_plan: plan.key }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error || !result.ok) {
        setBillingError(result.error ?? 'Changement PayPal impossible pour le moment.')
        return
      }
      if (result.approval_url) {
        setBillingMessage('PayPal doit confirmer ce changement de formule. Une fenêtre va s’ouvrir.')
        window.open(String(result.approval_url), '_blank', 'noopener,noreferrer')
      } else {
        setBillingMessage(`Demande de changement vers ${plan.label} envoyée à PayPal.`)
      }
      setTimeout(() => onRefresh?.(), 5000)
    } catch {
      setBillingError('Erreur réseau PayPal. Réessayez dans un instant.')
    } finally {
      setBillingLoading(false)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 md:py-14 max-w-6xl mx-auto w-full space-y-10">
      
      {/* Page Title Bar */}
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          Facturation & Abonnement
          {isSubscribed && <ShieldCheck size={26} style={{ color: planAccent }} />}
        </h1>
        <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
          {isSubscribed 
            ? 'Suivez vos quotas de consommation, configurez vos clés API et gérez votre facturation sécurisée.' 
            : 'Sélectionnez la formule adaptée à votre profil pour débloquer la voix, le chat et les automatisations avancées.'
          }
        </p>
      </div>

      {/* Mobile subscriber note */}
      {hasMobileSubscription && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl px-4 py-3.5 flex items-start gap-3 border border-indigo-500/15 bg-indigo-500/5 backdrop-blur-md"
        >
          <Smartphone size={16} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-indigo-300">Abonnement mobile détecté</p>
            <p className="text-xs mt-0.5 leading-relaxed text-slate-400">
              Votre facturation est gérée sur l&apos;App Store ou Google Play Store. Vos quotas vocaux sont synchronisés en temps réel sur le Web et le Desktop.
            </p>
          </div>
        </motion.div>
      )}

      {isSubscribed ? (
        // Subscribed Active Dashboard View (Gorgeous 2 Column Layout with high-end cards)
        <div className="space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Main Dashboard Details (Left Side, 2 Columns) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Active Plan Hero Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl p-6 md:p-8 border bg-gradient-to-br from-slate-900/60 via-slate-950/80 to-slate-900/60 backdrop-blur-xl"
                style={{
                  borderColor: `${planAccent}30`,
                  boxShadow: `0 10px 40px -10px ${planAccent}15`
                }}
              >
                {/* Decorative background glow */}
                <div 
                  className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
                  style={{ background: planAccent }}
                />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Abonnement Actif
                      </span>
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400">
                        {user.subscription_source === 'paddle' ? 'Paddle Billing' : user.subscription_source === 'paypal' ? 'PayPal' : user.subscription_source === 'geniuspay' ? 'Carte bancaire' : user.subscription_source === 'mollie' ? 'Carte bancaire' : user.subscription_source === 'airwallex' ? 'Airwallex' : user.subscription_source === 'gumroad' ? 'Gumroad' : user.subscription_source === 'wise' ? 'Wise' : 'Mobile'}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                        {activePlanLabel ?? 'Abonnement Custom'}
                        <Crown size={22} style={{ color: planAccent }} />
                      </h2>
                      {user.subscription_expires_at && (
                        <p className="text-sm text-slate-400 mt-2">
                          Prochain renouvellement automatique le <span className="text-white font-bold">{new Date(user.subscription_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {user.subscription_source === 'paddle' && (
                    <div className="flex flex-col sm:flex-row flex-shrink-0 gap-3">
                      {nextPlan && (
                        <button
                          type="button"
                          onClick={() => {
                            startCheckout(nextPlan)
                          }}
                          disabled={billingLoading}
                          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-rose-500/20 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 disabled:opacity-60"
                        >
                          Passer à {nextPlan.label}
                          <ArrowRight size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={openPaddlePortal}
                        disabled={billingLoading}
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 shadow-xl"
                      >
                        <CreditCard size={14} />
                        {billingLoading ? 'Ouverture...' : 'Gérer la facturation'}
                        <ExternalLink size={12} className="opacity-60" />
                      </button>
                    </div>
                  )}
                </div>
                {user.subscription_source === 'paddle' && nextPlan && (
                  <p className="relative z-10 mt-5 text-[11px] leading-relaxed text-slate-400">
                    Pour changer de plan, utilisez PayPal ou Carte bancaire. Le portail Paddle reste disponible pour consulter les anciennes factures ou gerer un abonnement Paddle existant.
                  </p>
                )}
              </motion.div>

              {(billingError || billingMessage) && (
                <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
                  billingError
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-200'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                }`}>
                  {billingError || billingMessage}
                </div>
              )}

              {/* Custom Key Integration (Show alert if on custom plan) */}
              {custom && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="rounded-3xl p-6 border bg-slate-950/20 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6"
                  style={{
                    borderColor: user.gemini_key_hint ? 'rgba(99, 102, 241, 0.15)' : 'rgba(245, 158, 11, 0.2)',
                    background: user.gemini_key_hint 
                      ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.02) 0%, rgba(99, 102, 241, 0.01) 100%)' 
                      : 'linear-gradient(135deg, rgba(245, 158, 11, 0.02) 0%, rgba(245, 158, 11, 0.01) 100%)'
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: user.gemini_key_hint ? 'rgba(99,102,241,0.08)' : 'rgba(245,158,11,0.08)' }}>
                      <Key size={18} style={{ color: user.gemini_key_hint ? '#818cf8' : '#f59e0b' }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Clé API Gemini personnelle</h3>
                      {user.gemini_key_hint ? (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Votre clé API ({user.gemini_key_hint}) est configurée et active. Toutes vos conversations sont traitées via vos propres quotas Google.
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          <span className="text-amber-400 font-semibold">Action requise :</span> Aucune clé API configurée. Vous devez entrer votre clé Gemini personnelle dans vos paramètres pour interagir avec Ava.
                        </p>
                      )}
                    </div>
                  </div>

                  {onGoToSettings && (
                    <button
                      onClick={onGoToSettings}
                      className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all hover:scale-[1.02]"
                      style={{
                        background: user.gemini_key_hint ? 'rgba(99,102,241,0.1)' : 'rgba(245,158,11,0.1)',
                        color: user.gemini_key_hint ? '#818cf8' : '#f59e0b',
                        border: `1px solid ${user.gemini_key_hint ? 'rgba(99,102,241,0.2)' : 'rgba(245,158,11,0.2)'}`
                      }}
                    >
                      {user.gemini_key_hint ? 'Gérer la clé API' : 'Configurer ma clé API'}
                      <ArrowRight size={12} />
                    </button>
                  )}
                </motion.div>
              )}

              {/* Unlocked Features Table */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-white/5 bg-slate-950/40 backdrop-blur-md overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-bold text-white text-base">Fonctionnalités & capacités incluses</h3>
                  <span 
                    className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border"
                    style={{
                      borderColor: `${planAccent}30`,
                      color: planAccent,
                      background: `${planAccent}10`
                    }}
                  >
                    {activePlanLabel ?? 'Actif'}
                  </span>
                </div>
                
                <div className="divide-y divide-white/5">
                  {(custom ? CUSTOM_FEATURES : PRO_FEATURES).map(({ icon: Icon, text, val }) => (
                    <div key={text} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.01]">
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: custom ? 'rgba(99,102,241,0.06)' : 'rgba(244,63,94,0.06)' }}>
                          <Icon size={14} style={{ color: custom ? '#818cf8' : '#f43f5e' }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 truncate">{text}</span>
                      </div>
                      <span 
                        className="text-xs font-black flex-shrink-0 uppercase tracking-wider"
                        style={{ color: custom ? '#818cf8' : '#f43f5e' }}
                      >
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar Widgets (Right Side, 1 Column) */}
            <div className="space-y-8">
              
              {/* Quota Usage Meter */}
              <VoiceQuotaBar user={user} pro={pro} />

              {/* Billing Detail / Info Panel */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="rounded-3xl p-6 border border-white/5 bg-slate-950/40 backdrop-blur-md space-y-4"
              >
                <div className="flex items-center gap-2 text-slate-400">
                  <HelpCircle size={15} />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Aide & Facturation</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Les nouveaux paiements sont traités via PayPal, Mollie ou Airwallex. Ava active automatiquement l&apos;abonnement après confirmation, et Paddle reste disponible pour les abonnements déjà existants.
                </p>
                <div className="pt-2">
                  <a 
                    href="https://call-ava.com/support" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
                  >
                    Contacter le support d&apos;aide
                    <ArrowRight size={10} />
                  </a>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/5 my-12" />

          {/* Pricing Plans Grid for Subscribed Users */}
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight">Toutes les formules disponibles</h3>
              <p className="text-sm text-slate-400">
                Découvrez nos formules et changez d&apos;offre ou abonnez-vous à tout moment.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch max-w-7xl mx-auto w-full">
              {ALL_PLANS.filter(p => p.key !== 'pro_starter').map((plan, index) => (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * (index + 1) }}
                  className="rounded-3xl overflow-hidden flex flex-col justify-between p-7 relative transition-all duration-300 group hover:translate-y-[-4px]"
                  style={{
                    background: plan.bg,
                    border: plan.key === activePlanKey 
                      ? `2px solid ${plan.accentColor}` 
                      : `1px solid ${plan.border}`,
                    boxShadow: plan.key === activePlanKey
                      ? `0 0 25px -5px ${plan.accentColor}30`
                      : plan.glow !== 'none' ? `0 15px 40px -10px ${plan.glow}` : 'none',
                  }}
                >
                  {/* Popular/Active badge */}
                  <div className="absolute top-5 right-5 flex gap-2">
                    {plan.key === activePlanKey && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                        Actif
                      </span>
                    )}
                    {plan.badge && plan.key !== activePlanKey && (
                      <span 
                        className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                        style={{
                          background: `${plan.accentColor}15`,
                          borderColor: `${plan.accentColor}30`,
                          color: '#f43f5e'
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    {/* Plan Name */}
                    <span 
                      className="text-xs font-black uppercase tracking-widest"
                      style={{ color: plan.accentColor }}
                    >
                      {plan.label}
                    </span>
                    
                    {/* Pricing Display */}
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                      <span className="text-xs text-slate-500 font-semibold">{plan.per}</span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-xs text-slate-400 mt-5 leading-relaxed font-medium">
                      {plan.description}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {plan.capital && (
                        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                          {plan.capital}
                        </span>
                      )}
                      {canUsePlanTrial(plan, user) && (
                        <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                          {planTrialDays(plan)} jour gratuit
                        </span>
                      )}
                    </div>

                    <div className="w-full h-px bg-white/5 my-6" />

                    {/* List of features */}
                    <div className="space-y-4">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-3">
                          <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: plan.accentColor }} />
                          <span className="text-xs text-slate-300 leading-normal font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Subscribing CTA Button */}
                  <div className="mt-8 pt-4">
                    {plan.key === activePlanKey ? (
                      <div className="w-full py-3.5 rounded-2xl font-bold text-sm text-center border border-white/5 bg-white/5 text-slate-500">
                        Votre formule active
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          startCheckout(plan)
                        }}
                        disabled={!isPlanCheckoutReady(plan) || billingLoading}
                        className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-45 disabled:hover:scale-100 cursor-pointer"
                        style={{
                          background: plan.btnBg,
                          color: plan.btnColor,
                          boxShadow: plan.popular ? '0 5px 25px rgba(225,29,72,0.3)' : 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = plan.btnHoverBg as string
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = plan.btnBg as string
                        }}
                      >
                        {checkoutLabel(plan)}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Unsubscribed Pricing Cards view (Gorgeous spacious 3-column layout)
        <div className="space-y-12">
          
          {/* Main Grid of Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-stretch max-w-7xl mx-auto w-full">
            {ALL_PLANS.filter(p => p.key !== 'pro_starter').map((plan, index) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * (index + 1) }}
                className="rounded-3xl overflow-hidden flex flex-col justify-between p-7 relative transition-all duration-300 group hover:translate-y-[-4px]"
                style={{
                  background: plan.bg,
                  border: plan.key === selectedPlanKey ? `2px solid ${plan.accentColor}` : `1px solid ${plan.border}`,
                  boxShadow: plan.key === selectedPlanKey
                    ? `0 0 28px -5px ${plan.accentColor}45`
                    : plan.glow !== 'none' ? `0 15px 40px -10px ${plan.glow}` : 'none',
                }}
              >
                {/* Popular badge */}
                {plan.badge && (
                  <div className="absolute top-5 right-5">
                    <span 
                      className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border"
                      style={{
                        background: `${plan.accentColor}15`,
                        borderColor: `${plan.accentColor}30`,
                        color: '#f43f5e'
                      }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  {/* Plan Name */}
                  <span 
                    className="text-xs font-black uppercase tracking-widest"
                    style={{ color: plan.accentColor }}
                  >
                    {plan.label}
                  </span>
                  
                  {/* Pricing Display */}
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-black text-white tracking-tight">{plan.price}</span>
                    <span className="text-xs text-slate-500 font-semibold">{plan.per}</span>
                  </div>
                  
                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-5 leading-relaxed font-medium">
                    {plan.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {plan.capital && (
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-300">
                        {plan.capital}
                      </span>
                    )}
                    {canUsePlanTrial(plan, user) && (
                      <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                        {planTrialDays(plan)} jour gratuit
                      </span>
                    )}
                  </div>

                  <div className="w-full h-px bg-white/5 my-6" />

                  {/* List of features */}
                  <div className="space-y-4">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-3">
                        <Check size={14} className="mt-0.5 flex-shrink-0" style={{ color: plan.accentColor }} />
                        <span className="text-xs text-slate-300 leading-normal font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subscribing CTA Button */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => startCheckout(plan)}
                    disabled={!isPlanCheckoutReady(plan) || billingLoading}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-45 disabled:hover:scale-100 cursor-pointer"
                    style={{
                      background: plan.btnBg,
                      color: plan.btnColor,
                      boxShadow: plan.popular ? '0 5px 25px rgba(225,29,72,0.3)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (plan.popular) {
                        e.currentTarget.style.background = plan.btnHoverBg as string
                      } else {
                        e.currentTarget.style.background = plan.btnHoverBg as string
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = plan.btnBg as string
                    }}
                  >
                    {billingLoading
                      ? 'Activation...'
                      : checkoutLabel(plan)}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="text-center text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed mt-4">
            Pour les plans Custom, vous pourrez configurer votre propre clé API Gemini (Google AI Studio) directement dans vos paramètres après souscription.
          </p>
        </div>
      )}

      {/* Payment method modal */}
      <AnimatePresence>
        {paymentChoicePlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6"
            >
              <button
                type="button"
                onClick={() => setPaymentChoicePlan(null)}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>

              <div className="space-y-3 pr-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Choix du paiement</p>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-2xl font-black text-white tracking-tight">{paymentChoicePlan.label}</h3>
                    <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                      Choisissez votre moyen de paiement sécurisé.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-right">
                    <p className="text-lg font-black text-white">{paymentChoicePlan.price}</p>
                    <p className="text-[11px] font-semibold text-slate-500">{paymentChoicePlan.per}</p>
                  </div>
                </div>
              </div>

              {(billingError || billingMessage) && (
                <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${
                  billingError
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-200'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                }`}>
                  {billingError || billingMessage}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={startPayPalCheckout}
                  disabled={billingLoading}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-all hover:border-[#0070ba]/45 hover:bg-[#0070ba]/10 disabled:opacity-60"
                >
                  <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Image src="/payment/paypal.png" alt="PayPal" width={42} height={42} className="h-10 w-10 object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">PayPal</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Abonnement récurrent via PayPal. Confirmation automatique après validation.
                    </p>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </button>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-emerald-400/30">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    <div className="flex shrink-0 items-center gap-2">
                      <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                        <Image src="/payment/visa.png" alt="Visa" width={64} height={40} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
                        <Image src="/payment/mastercard.png" alt="Mastercard" width={64} height={40} className="h-full w-full object-cover" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-white">Carte bancaire</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">
                        Paiement sécurisé par Mollie, avec 3D Secure si nécessaire.
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={startMollieCheckout}
                      disabled={billingLoading}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 text-sm font-black text-slate-950 transition-all hover:bg-emerald-300 disabled:opacity-60"
                    >
                      {billingLoading ? 'Ouverture...' : 'Continuer par carte'}
                      <ExternalLink size={14} />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <ShieldCheck size={14} className="text-emerald-300" />
                    Paiement initial sécurisé, puis renouvellement mensuel automatique.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => startAirwallexCheckout(paymentChoicePlan)}
                  disabled={billingLoading}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left transition-all hover:border-orange-400/35 hover:bg-orange-500/10 disabled:opacity-60"
                >
                  <div className="flex h-14 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-500/10 text-orange-200 shadow-sm">
                    <CreditCard size={26} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">Airwallex</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      Paiement carte international via Airwallex Billing Checkout.
                    </p>
                  </div>
                  <ExternalLink size={16} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PayPal subscription modal */}
      <AnimatePresence>
        {paypalPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6"
            >
              <button
                type="button"
                onClick={() => setPaypalPlan(null)}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>

              <div className="space-y-2 pr-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Paiement sécurisé PayPal</p>
                <h3 className="text-2xl font-black text-white tracking-tight">{paypalPlan.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {canUsePlanTrial(paypalPlan, user)
                    ? `Votre essai gratuit de ${planTrialDays(paypalPlan)} jour est géré par PayPal. Ava activera ensuite votre accès sur le compte ${user.email}.`
                    : `PayPal confirmera l’abonnement automatiquement. Ava activera ensuite votre accès sur le compte ${user.email}.`
                  }
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div ref={paypalButtonRef} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Upgrade / subscription change warning modal */}
      <AnimatePresence>
        {showUpgradeModal && targetPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6"
              style={{
                boxShadow: `0 20px 50px -12px ${targetPlan.accentColor}30`,
                borderColor: `${targetPlan.accentColor}40`
              }}
            >
              {/* Top accent glow line */}
              <div 
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ background: `linear-gradient(90deg, transparent, ${targetPlan.accentColor}, transparent)` }}
              />
              <button
                type="button"
                onClick={() => setShowUpgradeModal(false)}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>

              <div className="flex items-start gap-4 pr-10">
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${targetPlan.accentColor}15` }}
                >
                  <AlertCircle size={24} style={{ color: targetPlan.accentColor }} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Changer de formule ({targetPlan.label})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Abonnement actif : <span className="text-white font-bold">{activePlanLabel}</span>
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-2.5">
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  Ava va ouvrir le paiement correspondant à cette formule.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  La transition vers <strong>{targetPlan.label}</strong> sera activée automatiquement après confirmation. Paddle reste conservé en arrière-plan pour les abonnements existants.
                </p>
                {billingError && (
                  <div className="rounded-xl border border-rose-400/15 bg-rose-500/10 px-3 py-2">
                    <p className="text-xs text-rose-200 leading-relaxed font-semibold">
                      {billingError}
                    </p>
                    {billingMessage?.startsWith('http') && (
                      <button
                        type="button"
                        onClick={() => window.open(billingMessage, '_blank', 'noopener,noreferrer')}
                        className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-100 hover:text-white"
                      >
                        Régulariser dans Paddle
                        <ExternalLink size={10} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={billingLoading}
                  onClick={() => {
                    setShowUpgradeModal(false)
                    startCheckout(targetPlan)
                  }}
                  className="min-h-12 whitespace-nowrap flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-center disabled:opacity-60"
                  style={{ background: `linear-gradient(90deg, ${targetPlan.accentColor}dd, ${targetPlan.accentColor})` }}
                >
                  <CreditCard size={14} />
                  {billingLoading ? 'Ouverture...' : `Obtenir ${targetPlan.label.replace(/^Custom\s+/i, '')}`}
                </button>
                <button
                  type="button"
                  disabled={billingLoading}
                  onClick={openPaddlePortal}
                  className="min-h-12 whitespace-nowrap flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm text-slate-200 transition-colors border border-white/5 bg-white/5 hover:bg-white/10 disabled:opacity-60"
                >
                  Portail Paddle
                  <ExternalLink size={10} className="opacity-80" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
