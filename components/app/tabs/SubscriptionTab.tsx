'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Crown, Check, Zap, Globe, Monitor, ImageIcon, Brain, Bell, 
  Layers, Key, Smartphone, Mic, MessageSquare, Star, Cpu, Lock,
  CreditCard, ExternalLink, HelpCircle, ShieldCheck, AlertCircle, ArrowRight, X, Ticket,
  ChevronDown, ChevronUp, Coins
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
  PAYPAL_PLAN_CUSTOM_SIMPLE,
  PAYPAL_PLAN_CUSTOM_ULTRA,
  SUPABASE_HEADERS,
  SUPABASE_URL,
} from '../constants'
import { isPro, isCustomPlan, voiceMinutesUsed, voiceMinutesRemaining, voiceQuotaMinutes } from '../types'
import type { UserData } from '../types'

type AirwallexPaymentMethod = 'apple_pay' | 'google_pay'
type WhopPaymentMethod = 'card'
type PaymentMethod = AirwallexPaymentMethod | WhopPaymentMethod | 'paypal'

type ReferralEntitlement = {
  id: string
  plan_key: string
  status: string
  starts_at: string
  expires_at: string
  source_coupon_id: string
}

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
      'Clé IA personnelle compatible Ava',
      'Limites prudentes par défaut',
      'Automatisations essentielles',
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
    capital: 'Plage recommandée : 1 000€ à 3 000€',
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
      'Clé IA personnelle compatible Ava',
    ]
  },
  {
    key: 'custom_ultra',
    label: 'Custom Ultra',
    price: '€399.99',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_ULTRA,
    paypalPlanId: PAYPAL_PLAN_CUSTOM_ULTRA,
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
    capital: 'Plage recommandée : 8 000€+',
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

const CUSTOM_PLAN_COMPARISON = [
  {
    section: 'Profil',
    rows: [
      { label: 'Capital recommandé', pro: '1 000€ à 3 000€', ultra: '3 000€ à 8 000€', max: '8 000€+', connectedOnly: true },
      { label: 'Modèles IA', pro: 'Ava 1.1.29 + 1.1.59', ultra: 'Pro + Objective 1h', max: 'Tous les modèles Ava' },
      { label: 'Superviseur Vertex/Cortex', pro: 'Automatique', ultra: 'Automatique + main libre', max: 'Main libre complète' },
      { label: 'Lot IA dynamique confiance/capital', pro: 'Réservé Dev', ultra: 'Réservé Dev', max: 'Réservé Dev' },
      { label: 'SELL Volatility / Burst SELL', pro: 'Verrouillé', ultra: 'Verrouillé', max: 'Activable' },
    ],
  },
  {
    section: 'Volatility',
    rows: [
      { label: 'Objectif session Volatility', pro: '$15 max', ultra: '$35 max', max: 'Illimité' },
      { label: 'Boom Rebond BUY par session', pro: '15 BUY max', ultra: '35 BUY max', max: 'Illimité' },
      { label: 'Boom Rebond BUY ouverts', pro: '4 ouverts max', ultra: '8 ouverts max', max: 'Illimité' },
      { label: 'Quota Volatility journalier', pro: '4h/jour + pause 4h', ultra: '10h/jour + pause 2h', max: 'Illimité' },
      { label: 'Renforts contrôlés', pro: '2 niveaux', ultra: '3 niveaux', max: 'Sans limite commerciale' },
    ],
  },
  {
    section: 'Contrôle',
    rows: [
      { label: 'Positions manuelles', pro: 'Non inclus', ultra: '25 / 7 jours', max: 'Illimité' },
      { label: 'Pause nuit 19h-04h', pro: 'Arrêt à 20h', ultra: 'Disponible', max: 'Disponible' },
      { label: 'Support', pro: 'Prioritaire', ultra: 'Renforcé', max: 'Direct / maximal' },
    ],
  },
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
  { icon: Key, text: 'Votre propre clé IA compatible Ava', val: 'Requis' },
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
const CHECKOUT_PLAN_KEYS = ['custom_pro', 'custom_ultra', 'custom_max']
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

function checkoutPayPalPlanId(plan: typeof ALL_PLANS[number], user: UserData) {
  void user
  return plan.paypalPlanId
}

function isPlanCheckoutReady(plan: typeof ALL_PLANS[number]) {
  return CHECKOUT_PLAN_KEYS.includes(plan.key)
}

function isNowPaymentsPlan(plan: typeof ALL_PLANS[number] | null) {
  return plan?.key === 'custom_pro' || plan?.key === 'custom_ultra' || plan?.key === 'custom_max'
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

const FALLBACK_COUNTRY_CODES = [
  'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ',
  'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR',
  'IO', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'CA', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC',
  'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO',
  'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF',
  'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY',
  'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM',
  'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY',
  'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX',
  'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI',
  'NE', 'NG', 'NU', 'NF', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH',
  'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC',
  'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS',
  'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK',
  'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU',
  'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW',
]

function cleanCountryCode(raw: unknown) {
  const value = String(raw ?? '').trim().toUpperCase()
  return /^[A-Z]{2}$/.test(value) && value !== 'ZZ' ? value : ''
}

function countryDisplayName(code: string) {
  try {
    return new Intl.DisplayNames(['fr'], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

function countryOptions() {
  let supported: string[] = []
  try {
    supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('region') ?? []
  } catch {
    supported = []
  }
  const codes = supported.length ? supported : FALLBACK_COUNTRY_CODES
  return Array.from(new Set(codes.map(cleanCountryCode).filter(Boolean)))
    .map(code => ({ code, name: countryDisplayName(code) }))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
}

function browserSuggestedCountry() {
  return cleanCountryCode(browserCountryHints().locale_country)
}

function storedBillingCountry() {
  if (typeof window === 'undefined') return ''
  try {
    const saved = JSON.parse(localStorage.getItem('ava_billing_country') ?? '{}') as { code?: string }
    return cleanCountryCode(saved.code)
  } catch {
    return ''
  }
}

function suggestedBillingCountry() {
  return storedBillingCountry() || browserSuggestedCountry()
}

function isCheckoutVisiblePlan(plan: typeof ALL_PLANS[number]) {
  return CHECKOUT_PLAN_KEYS.includes(plan.key)
}

function isVisibleCheckoutPlanKey(plan: string | null) {
  return !!plan && CHECKOUT_PLAN_KEYS.includes(plan)
}

function isLegacyRenewalSource(source: string | null | undefined) {
  return source === 'wise' || source === 'paddle' || source === 'gumroad'
}

function paymentMethodFromEvent(raw: unknown): PaymentMethod | null {
  const value = String(raw ?? '').toLowerCase()
  if (value.includes('google_pay')) return 'google_pay'
  if (value.includes('apple_pay')) return 'apple_pay'
  if (value.includes('card')) return 'card'
  return null
}

function subscriptionPaymentLabel(user: UserData) {
  if (user.subscription_source === 'paypal') return 'PayPal'
  if (user.subscription_source === 'whop') return 'Carte bancaire'
  if (user.subscription_source === 'airwallex') {
    const method = paymentMethodFromEvent(user.airwallex_last_event_type)
    if (method === 'apple_pay') return 'Apple Pay'
    if (method === 'google_pay') return 'Google Pay'
    return 'Apple Pay / Google Pay'
  }
  if (user.subscription_source === 'geniuspay' || user.subscription_source === 'mollie') return 'Carte bancaire'
  if (user.subscription_source === 'paddle') return 'Ancien paiement'
  if (user.subscription_source === 'gumroad') return 'Ancien paiement'
  if (user.subscription_source === 'wise') return 'Wise'
  return 'Mobile'
}

function subscriptionManagementLabel(user: UserData) {
  if (user.subscription_source === 'paypal') return 'Gérez cet abonnement depuis PayPal.'
  if (user.subscription_source === 'whop') return 'Gérez cet abonnement depuis votre espace de paiement carte.'
  if (user.subscription_source === 'airwallex') return 'Gérez cet abonnement depuis le même moyen de paiement.'
  return ''
}

function daysUntil(raw: string | null | undefined) {
  if (!raw) return null
  const parsed = Date.parse(raw)
  if (!Number.isFinite(parsed)) return null
  return Math.ceil((parsed - Date.now()) / (24 * 3600 * 1000))
}

function isPastDate(raw: string | null | undefined) {
  if (!raw) return false
  const parsed = Date.parse(raw)
  return Number.isFinite(parsed) && parsed <= Date.now()
}

function legacyRenewalPlanKey(user: UserData, currentPlan: string | null) {
  if (currentPlan && CUSTOM_PLAN_ORDER.includes(currentPlan)) return currentPlan
  const normalized = normalizePlanKey(user.subscription_plan, true)
  if (normalized && CUSTOM_PLAN_ORDER.includes(normalized)) return normalized
  return 'custom_simple'
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
  const [countryPromptPlan, setCountryPromptPlan] = useState<typeof ALL_PLANS[number] | null>(null)
  const [countryPromptMethod, setCountryPromptMethod] = useState<AirwallexPaymentMethod | undefined>(undefined)
  const [billingCountryCode, setBillingCountryCode] = useState(() => cleanCountryCode(user.billing_country_code))
  const [referralEntitlements, setReferralEntitlements] = useState<ReferralEntitlement[]>([])
  const [showPlanComparison, setShowPlanComparison] = useState(false)
  const paypalButtonRef = useRef<HTMLDivElement | null>(null)

  const pro = isPro(user)
  const custom = isCustomPlan(user)
  const activeReferralEntitlement = referralEntitlements.find(entitlement =>
    entitlement.status === 'active' && new Date(entitlement.expires_at) > new Date()
  ) ?? null
  const referralPlanKey = normalizePlanKey(activeReferralEntitlement?.plan_key ?? null, true)
  const referralPlanLabel = referralPlanKey ? planLabels[referralPlanKey] ?? 'Accès Affiliation' : null

  useEffect(() => {
    if (refreshedOnce) return
    setRefreshedOnce(true)
    onRefresh?.()
  }, [onRefresh, refreshedOnce])

  useEffect(() => {
    let cancelled = false
    async function loadReferralEntitlements() {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/referral-rewards`, {
          method: 'POST',
          headers: SUPABASE_HEADERS,
          body: JSON.stringify({ user_id: user.id }),
        })
        const data = await res.json()
        if (!res.ok || data.error) return
        if (!cancelled) setReferralEntitlements(Array.isArray(data.entitlements) ? data.entitlements : [])
      } catch {}
    }
    loadReferralEntitlements()
    return () => {
      cancelled = true
    }
  }, [user.id])

  const hasMobileSubscription = !!user.subscription_tier &&
    user.subscription_tier !== 'free' &&
    user.subscription_source !== 'gumroad' &&
    user.subscription_source !== 'paddle' &&
    user.subscription_source !== 'paypal' &&
    user.subscription_source !== 'geniuspay' &&
    user.subscription_source !== 'mollie' &&
    user.subscription_source !== 'airwallex' &&
    user.subscription_source !== 'whop' &&
    user.subscription_source !== 'nowpayments' &&
    user.subscription_source !== 'wise'

  const isSubscribed = pro || custom || !!activeReferralEntitlement
  const lastPlanKey = normalizePlanKey(user.subscription_plan, false)
  const paidAccessPlanKey = (pro || custom) ? normalizePlanKey(user.subscription_plan, custom) : null
  const activePlanKey = paidAccessPlanKey ?? referralPlanKey
  const displayPlanKey = activePlanKey ?? lastPlanKey
  const activePlanLabel = activePlanKey ? planLabels[activePlanKey] ?? null : null
  const lastPlanLabel = lastPlanKey ? planLabels[lastPlanKey] ?? null : null
  const expiryDate = user.custom_plan_expires_at ?? user.subscription_expires_at
  const subscriptionExpired = !isSubscribed && !!lastPlanKey && isPastDate(expiryDate)
  const hasCustomLikeAccess = custom || !!activeReferralEntitlement
  // Define accent colors for current plan
  const planAccent = displayPlanKey === 'custom_pro'
    ? '#e11d48'
    : displayPlanKey === 'custom_ultra'
      ? '#e11d48'
      : displayPlanKey === 'custom_max'
        ? '#f43f5e'
    : displayPlanKey === 'custom_simple'
      ? '#6366f1'
      : '#f43f5e'

  const nextPlan = nextCustomPlan(activePlanKey)
  const paddleRenewalStopped = user.subscription_source === 'paddle' && !!user.paddle_renewal_cancelled_at
  const paddleAccessEndsAt = user.paddle_scheduled_cancel_at ?? user.subscription_expires_at
  const countries = countryOptions()
  const suggestedCountryCode = !cleanCountryCode(user.billing_country_code) ? suggestedBillingCountry() : ''
  const legacyRenewalSource = isLegacyRenewalSource(user.subscription_source) && isSubscribed
  const legacyRenewalDaysLeft = daysUntil(user.custom_plan_expires_at ?? user.subscription_expires_at)
  const legacyRenewalUrgent = legacyRenewalDaysLeft !== null && legacyRenewalDaysLeft <= 7
  const legacyRenewalPlanKeyValue = legacyRenewalPlanKey(user, activePlanKey ?? lastPlanKey)
  const legacyRenewalTargetKey = legacyRenewalPlanKeyValue === 'custom_simple' ? 'custom_pro' : legacyRenewalPlanKeyValue
  const legacyRenewalPlan = ALL_PLANS.find(plan => plan.key === legacyRenewalTargetKey) ?? ALL_PLANS.find(plan => plan.key === 'custom_pro')!
  const legacyRenewalSourceLabel = user.subscription_source === 'wise'
    ? 'Wise'
    : user.subscription_source === 'paddle'
      ? 'Paddle'
      : user.subscription_source === 'gumroad'
        ? 'Gumroad'
        : 'ancien moyen de paiement'

  useEffect(() => {
    setBillingCountryCode(cleanCountryCode(user.billing_country_code))
  }, [user.billing_country_code])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const requestedUpgrade = params.get('upgrade')
    const requestedPlan = params.get('plan')
    if (isVisibleCheckoutPlanKey(requestedPlan)) {
      setSelectedPlanKey(requestedPlan)
    }
    const payment = params.get('payment')
    if (payment === 'nowpayments_return') {
      setBillingMessage('Paiement crypto reçu par NOWPayments. Ava active votre accès dès que la confirmation blockchain est terminée.')
      setTimeout(() => onRefresh?.(), 3500)
    } else if (payment === 'nowpayments_partial') {
      setBillingError('Paiement crypto partiel détecté. Ava n’active pas automatiquement les paiements incomplets; contactez le support avec votre email.')
    } else if (payment === 'nowpayments_cancel') {
      setBillingMessage('Paiement crypto annulé. Aucun accès n’a été modifié.')
    } else if (payment === 'nowpayments_error') {
      setBillingError('Le lien de renouvellement crypto est invalide ou expiré. Relancez le paiement depuis Ava.')
    }
    if (isVisibleCheckoutPlanKey(requestedUpgrade) && isValidUpgradeTarget(activePlanKey, requestedUpgrade)) {
      const plan = ALL_PLANS.find(p => p.key === requestedUpgrade)
      if (plan) {
        setTargetPlan(plan)
        setShowUpgradeModal(true)
      }
    }
  }, [activePlanKey])

  const checkoutLabel = (plan: typeof ALL_PLANS[number]) => {
    if (!isPlanCheckoutReady(plan)) return 'Paiement en attente'
    if (isNowPaymentsPlan(plan)) return `Choisir le paiement`
    if (subscriptionExpired && plan.key === lastPlanKey) {
      return `Renouveler ${plan.label.replace(/^Custom\s+/i, '')}`
    }
    if (user.subscription_source === 'airwallex' && user.airwallex_subscription_id && activePlanKey && activePlanKey !== plan.key) {
      return customPlanRank(plan.key) > customPlanRank(activePlanKey)
        ? `Upgrade vers ${plan.label.replace(/^Custom\s+/i, '')}`
        : 'Downgrade indisponible'
    }
    return CUSTOM_PLAN_CTA[plan.key] ?? 'S’abonner'
  }

  const renderPlanCard = (plan: typeof ALL_PLANS[number], index: number) => {
    const isActive = plan.key === activePlanKey
    const isExpiredPreviousPlan = subscriptionExpired && plan.key === lastPlanKey
    const isSelected = plan.key === selectedPlanKey
    const isRecommended = plan.key === 'custom_pro'
    const features = Array.from(new Set(plan.features)).slice(0, 5)
    const extraFeatures = Math.max(0, Array.from(new Set(plan.features)).length - features.length)
    const cardBorder = isActive
      ? 'border-emerald-400/35'
      : isSelected
        ? 'border-rose-300/55'
      : isRecommended
        ? 'border-rose-400/45'
        : 'border-white/10'

    return (
      <motion.div
        key={plan.key}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 * (index + 1), duration: 0.35 }}
        className={`relative flex min-h-[410px] flex-col rounded-2xl border ${cardBorder} bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-rose-400/35`}
      >
        {(plan.badge || isActive || isExpiredPreviousPlan || isRecommended) && (
          <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-2">
            {isActive ? (
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-[10px] font-bold uppercase text-emerald-300">
                Actif
              </span>
            ) : isExpiredPreviousPlan ? (
              <span className="rounded-full border border-amber-400/30 bg-amber-500/15 px-3 py-1 text-[10px] font-bold uppercase text-amber-200">
                Expiré
              </span>
            ) : (
              <span className="rounded-full border border-rose-400/30 bg-rose-500 px-3 py-1 text-[10px] font-bold uppercase text-white shadow-lg shadow-rose-500/25">
                {isRecommended ? 'Populaire' : plan.badge}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-1 flex-col">
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-black text-white">{plan.label.replace(/^Custom\s+/i, '')}</h3>
              <p className="mt-1 text-xs font-medium text-slate-500">{plan.description}</p>
            </div>

            <div className="flex items-end justify-center gap-1 pt-2">
              <span className="text-4xl font-black text-white">{plan.price}</span>
              <span className="pb-1 text-xs font-semibold text-slate-500">{plan.per}</span>
            </div>

            <div className="flex min-h-[58px] flex-col items-center justify-center gap-2">
              {plan.capital && (
                <span className="rounded-full border border-white/10 bg-slate-950/50 px-3 py-1 text-center text-[10px] font-bold uppercase text-slate-400">
                  {plan.capital.replace('Plage recommandée : ', '')}
                </span>
              )}
            </div>
          </div>

          <div className="my-5 h-px w-full bg-white/[0.08]" />

          <div className="flex-1 space-y-3">
            {features.map((feat) => (
              <div key={feat} className="flex items-start gap-3">
                <Check size={15} className="mt-0.5 shrink-0 text-rose-400" />
                <span className="text-sm font-medium leading-snug text-slate-300">{feat}</span>
              </div>
            ))}
            {extraFeatures > 0 && (
              <p className="pl-7 text-xs font-semibold text-slate-500">+{extraFeatures} autres avantages</p>
            )}
          </div>

          <div className="mt-6">
            {isActive ? (
              <div className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 text-center text-sm font-bold text-slate-400">
                Votre formule active
              </div>
            ) : (
              <button
                onClick={() => startCheckout(plan)}
                disabled={!isPlanCheckoutReady(plan) || billingLoading}
                className={`w-full rounded-xl py-3 text-sm font-black transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-45 disabled:hover:scale-100 ${
                  isRecommended || plan.key === 'custom_ultra' || plan.key === 'custom_max'
                    ? 'bg-rose-500 text-white shadow-xl shadow-rose-500/25 hover:bg-rose-400'
                    : 'border border-white/10 bg-slate-950/60 text-white hover:border-rose-400/35 hover:bg-white/[0.06]'
                }`}
              >
                {billingLoading ? 'Activation...' : checkoutLabel(plan)}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  const renderPlanComparison = (includeCapital: boolean) => (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <button
        type="button"
        onClick={() => setShowPlanComparison(value => !value)}
        className="mx-auto flex items-center gap-2 rounded-2xl border border-rose-400/35 bg-slate-950/70 px-5 py-3 text-sm font-black text-white shadow-lg shadow-black/20 transition-colors hover:border-rose-300/60 hover:bg-rose-500/10"
      >
        Voir le comparatif complet
        {showPlanComparison ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence initial={false}>
        {showPlanComparison && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/70 shadow-2xl shadow-black/30 backdrop-blur-xl"
          >
            <div className="overflow-x-auto">
              <div className="min-w-[820px]">
                <div className="grid grid-cols-[1.35fr_repeat(3,1fr)] border-b border-white/10 bg-white/[0.035] text-sm">
                  <div className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500">Comparatif</div>
                  {['Pro', 'Ultra', 'Max'].map(plan => (
                    <div
                      key={plan}
                      className={`px-5 py-4 text-center font-black text-white ${plan === 'Pro' ? 'bg-rose-500/10' : ''}`}
                    >
                      {plan}
                    </div>
                  ))}
                </div>
                {CUSTOM_PLAN_COMPARISON.map(section => (
                  <div key={section.section}>
                    <div className="bg-white/[0.055] px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-300">
                      {section.section}
                    </div>
                    {section.rows
                      .filter(row => includeCapital || !row.connectedOnly)
                      .map(row => (
                        <div key={row.label} className="grid grid-cols-[1.35fr_repeat(3,1fr)] border-t border-white/[0.06] text-sm">
                          <div className="px-5 py-4 font-semibold text-slate-400">{row.label}</div>
                          <div className="bg-rose-500/[0.045] px-5 py-4 text-center font-bold text-slate-200">{row.pro}</div>
                          <div className="px-5 py-4 text-center font-bold text-slate-200">{row.ultra}</div>
                          <div className="px-5 py-4 text-center font-bold text-rose-100">{row.max}</div>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 px-5 py-4 text-center text-xs leading-relaxed text-slate-500">
              Les plages de capital sont des recommandations. Ava Desktop applique séparément les protections de risque et les limites du plan actif.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )

  const startCheckout = (plan: typeof ALL_PLANS[number]) => {
    const source = String(user.subscription_source ?? '')
    if (user.subscription_source === 'airwallex' && user.airwallex_subscription_id && activePlanKey && activePlanKey !== plan.key) {
      if (customPlanRank(plan.key) <= customPlanRank(activePlanKey)) {
        setBillingError('Le passage à une formule inférieure est désactivé pour éviter une erreur de facturation.')
        return
      }
    }

    if (isPlanCheckoutReady(plan)) {
      if (source === 'whop' && activePlanKey && activePlanKey !== plan.key) {
        if (!user.whop_membership_id) {
          setBillingMessage('Votre abonnement carte bancaire est actif, mais le lien de gestion n’est pas encore complet. Contactez le support Ava pour modifier la formule sans doublon.')
          return
        }
      }
      if (source === 'paypal' && activePlanKey && activePlanKey !== plan.key) {
        if (!user.paypal_subscription_id) {
          setBillingMessage('Votre abonnement PayPal est actif, mais le lien PayPal n’est pas encore complet. Contactez le support Ava pour modifier la formule sans doublon.')
          return
        }
      }
      if (activePlanKey && activePlanKey !== plan.key && ['wise', 'gumroad'].includes(source)) {
        setBillingMessage(`Votre abonnement actuel vient de ${subscriptionPaymentLabel(user)}. Pour renouveler ou changer de formule avec ce même moyen de paiement, contactez le support Ava afin d’éviter un double abonnement.`)
        return
      }
      if (activePlanKey && activePlanKey !== plan.key && source === 'paddle' && !paddleRenewalStopped) {
        setBillingMessage('Paddle est un ancien moyen de paiement. Arrêtez d’abord le renouvellement Paddle, puis choisissez une nouvelle formule par carte bancaire.')
        return
      }
      setBillingError('')
      setBillingMessage('')
      setPaymentChoicePlan(plan)
      return
    }

    setBillingError('Le paiement est indisponible pour cette formule.')
  }

  const startWhopCheckout = async (
    preferredPaymentMethod: WhopPaymentMethod = 'card',
    planOverride?: typeof ALL_PLANS[number],
  ) => {
    const plan = planOverride ?? paymentChoicePlan
    if (!plan) return
    setBillingLoading(true)
    setBillingError('')
    setBillingMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/whop-subscription`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({
          user_id: user.id,
          target_plan: plan.key,
          preferred_payment_method: preferredPaymentMethod,
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error || !result.ok) {
        setBillingError(result.error ?? 'Paiement par carte indisponible pour le moment.')
        return
      }
      if (result.redirect_url) {
        window.location.href = String(result.redirect_url)
        return
      }
      if (result.unchanged) {
        setBillingMessage(String(result.message ?? 'Cette formule est déjà liée à votre compte.'))
        setTimeout(() => onRefresh?.(), 2000)
        return
      }
      setBillingError('Le paiement par carte n’a pas renvoyé de lien.')
    } catch {
      setBillingError('Erreur réseau. Réessayez dans un instant.')
    } finally {
      setBillingLoading(false)
    }
  }

  const startAirwallexCheckout = async (
    plan: typeof ALL_PLANS[number],
    countryCodeOverride?: string,
    preferredPaymentMethod?: AirwallexPaymentMethod,
  ) => {
    const countryCode = cleanCountryCode(countryCodeOverride) || cleanCountryCode(user.billing_country_code)
    if (!countryCode) {
      setBillingCountryCode('')
      setCountryPromptPlan(plan)
      setCountryPromptMethod(preferredPaymentMethod)
      return
    }

    setBillingLoading(true)
    setBillingError('')
    setBillingMessage('')
    try {
      localStorage.setItem('ava_billing_country', JSON.stringify({
        code: countryCode,
        name: countryDisplayName(countryCode),
      }))
    } catch {}
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/airwallex-subscription`, {
          method: 'POST',
          headers: SUPABASE_HEADERS,
          body: JSON.stringify({
            user_id: user.id,
            target_plan: plan.key,
            country_code: countryCode,
            country_name: countryDisplayName(countryCode),
            country_hints: browserCountryHints(),
            ...(preferredPaymentMethod ? { preferred_payment_method: preferredPaymentMethod } : {}),
          }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error || !result.ok) {
        setBillingError(result.error ?? 'Paiement indisponible pour le moment.')
        if (result.code === 'country_required') setCountryPromptPlan(plan)
        return
      }
      if (result.redirect_url) {
        window.location.href = String(result.redirect_url)
        return
      }
      if (result.unchanged) {
        setBillingMessage(String(result.message ?? 'Cette formule est déjà liée à votre compte.'))
        setTimeout(() => onRefresh?.(), 2000)
        return
      }
      if (result.updated) {
        setBillingMessage(`Upgrade vers ${plan.label} confirmé. Ava met à jour vos accès.`)
        setTimeout(() => onRefresh?.(), 2500)
        return
      }
      setBillingError('Le moyen de paiement n’a pas renvoyé de lien.')
    } catch {
      setBillingError('Erreur réseau. Réessayez dans un instant.')
    } finally {
      setBillingLoading(false)
    }
  }

  const startNowPaymentsCheckout = async (planOverride?: typeof ALL_PLANS[number]) => {
    const plan = planOverride ?? paymentChoicePlan
    if (!plan || !isNowPaymentsPlan(plan)) {
      setBillingError('Le paiement crypto est disponible uniquement pour Custom Pro, Ultra et Max.')
      return
    }
    setBillingLoading(true)
    setBillingError('')
    setBillingMessage('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/nowpayments-invoice`, {
        method: 'POST',
        headers: SUPABASE_HEADERS,
        body: JSON.stringify({
          user_id: user.id,
          target_plan: plan.key,
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok || result.error || !result.ok) {
        setBillingError(result.error ?? 'Paiement crypto indisponible pour le moment.')
        return
      }
      if (result.invoice_url) {
        window.location.href = String(result.invoice_url)
        return
      }
      setBillingError('NOWPayments n’a pas renvoyé de lien de paiement.')
    } catch {
      setBillingError('Erreur réseau NOWPayments. Réessayez dans un instant.')
    } finally {
      setBillingLoading(false)
    }
  }

  const confirmBillingCountry = () => {
    if (!countryPromptPlan) return
    const code = cleanCountryCode(billingCountryCode)
    if (!code) {
      setBillingError('Sélectionnez votre pays pour continuer.')
      return
    }
    const plan = countryPromptPlan
    const method = countryPromptMethod
    setCountryPromptPlan(null)
    startAirwallexCheckout(plan, code, method)
  }

  const handleManageSubscription = () => {
    if (user.subscription_source === 'paddle') {
      if (paddleRenewalStopped) {
        openPaddlePortal()
      } else {
        cancelPaddleRenewal()
      }
      return
    }
    if (user.subscription_source === 'paypal') {
      window.open('https://www.paypal.com/myaccount/autopay/', '_blank', 'noopener,noreferrer')
      return
    }
    if (user.subscription_source === 'whop') {
      window.open('https://whop.com/hub/', '_blank', 'noopener,noreferrer')
      return
    }
    if (user.subscription_source === 'airwallex') {
      setBillingMessage('Pour gérer cet abonnement, utilisez le lien reçu par e-mail après paiement ou contactez le support Ava.')
      return
    }
    setBillingMessage('Contactez le support Ava pour gérer cet abonnement.')
  }

  const handleLegacyRenewal = () => {
    setBillingError('')
    setBillingMessage(`Votre accès ${legacyRenewalSourceLabel} reste actif jusqu’à sa date actuelle. Pour renouveler ou modifier la formule avec ce même moyen de paiement, contactez le support Ava afin d’éviter un double abonnement.`)
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

  const callPaddleSubscription = async (action: 'portal' | 'upgrade' | 'cancel_renewal', plan?: string) => {
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

  const cancelPaddleRenewal = async () => {
    const result = await callPaddleSubscription('cancel_renewal')
    if (result?.ok) {
      const endDate = result.scheduled_cancel_at || result.subscription_expires_at
      const label = endDate
        ? new Date(String(endDate)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'la fin de la période payée'
      setBillingMessage(`Renouvellement Paddle arrêté. Votre accès reste actif jusqu’au ${label}.`)
      setTimeout(() => onRefresh?.(), 1200)
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

      {legacyRenewalSource && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl px-5 py-4 flex flex-col gap-4 border backdrop-blur-md md:flex-row md:items-center md:justify-between ${
            legacyRenewalUrgent
              ? 'border-amber-400/25 bg-amber-500/10'
              : 'border-orange-400/15 bg-orange-500/5'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle size={17} className={legacyRenewalUrgent ? 'text-amber-300 mt-0.5 flex-shrink-0' : 'text-orange-300 mt-0.5 flex-shrink-0'} />
            <div>
              <p className={`text-sm font-black ${legacyRenewalUrgent ? 'text-amber-200' : 'text-orange-200'}`}>
                Renouvellement à préparer
              </p>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                Votre accès {legacyRenewalSourceLabel} reste actif jusqu’à sa date actuelle. Pour éviter une coupure, renouvelez sur {legacyRenewalPlan.label}; le paiement direct sera utilisé.
                {legacyRenewalDaysLeft !== null && legacyRenewalDaysLeft >= 0 ? ` Il reste environ ${legacyRenewalDaysLeft} jour${legacyRenewalDaysLeft > 1 ? 's' : ''}.` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLegacyRenewal}
            disabled={billingLoading}
            className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-orange-400 px-5 text-sm font-black text-slate-950 transition-all hover:bg-orange-300 disabled:opacity-60"
          >
            Contacter le support
          </button>
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
                        {activeReferralEntitlement ? 'Accès Affiliation actif' : 'Abonnement Actif'}
                      </span>
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400">
                        {activeReferralEntitlement ? 'Coupon parrainage' : subscriptionPaymentLabel(user)}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
                        {activePlanLabel ?? 'Abonnement Custom'}
                        <Crown size={22} style={{ color: planAccent }} />
                      </h2>
                      {activeReferralEntitlement ? (
                        <p className="text-sm text-slate-400 mt-2">
                          Accès offert jusqu’au{' '}
                          <span className="text-white font-bold">
                            {new Date(activeReferralEntitlement.expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </p>
                      ) : user.subscription_expires_at && (
                        <p className="text-sm text-slate-400 mt-2">
                          {paddleRenewalStopped
                            ? 'Accès Paddle actif jusqu’au '
                            : 'Prochain renouvellement automatique le '}
                          <span className="text-white font-bold">
                            {new Date(paddleAccessEndsAt ?? user.subscription_expires_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {['paddle', 'paypal', 'airwallex', 'whop'].includes(String(user.subscription_source ?? '')) && (
                    <div className="flex flex-col sm:flex-row flex-shrink-0 gap-3">
                      {nextPlan && !paddleRenewalStopped && (
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
                        onClick={handleManageSubscription}
                        disabled={billingLoading}
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 shadow-xl"
                      >
                        {paddleRenewalStopped ? <CreditCard size={14} /> : user.subscription_source === 'paddle' ? <AlertCircle size={14} /> : <CreditCard size={14} />}
                        {billingLoading
                          ? 'Traitement...'
                          : user.subscription_source === 'paddle'
                            ? paddleRenewalStopped
                              ? 'Voir les anciennes factures'
                              : 'Arrêter le renouvellement'
                            : 'Gérer l’abonnement'}
                        {user.subscription_source !== 'airwallex' && <ExternalLink size={12} className="opacity-60" />}
                      </button>
                    </div>
                  )}
                </div>
                {activeReferralEntitlement && (
                  <div
                    className="relative z-10 mt-5 flex items-start gap-3 rounded-2xl px-4 py-3"
                    style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.18)' }}
                  >
                    <Ticket size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#fbbf24' }} />
                    <p className="text-xs leading-relaxed text-slate-300">
                      Cet accès vient d’un coupon d’affiliation. Il donne les droits Ava Trading / Ava Volatility du plan {referralPlanLabel ?? activePlanLabel}, sans renouvellement automatique. Vous pouvez passer à un abonnement payant ou upgrader à tout moment depuis les formules ci-dessous.
                    </p>
                  </div>
                )}
                {user.subscription_source === 'paddle' && (
                  <p className="relative z-10 mt-5 text-[11px] leading-relaxed text-slate-400">
                    {paddleRenewalStopped
                      ? 'Renouvellement Paddle arrêté. Aucun nouveau prélèvement Paddle ne sera tenté; votre accès reste actif jusqu’à la date indiquée, puis vous pourrez renouveler avec les nouveaux moyens de paiement.'
                      : 'Paddle est conservé seulement pour les anciens abonnements. Vous pouvez arrêter le prochain prélèvement ici; pour changer de formule, contactez le support Ava afin d’éviter un double abonnement.'}
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
                      <h3 className="text-sm font-bold text-white">Clé IA personnelle</h3>
                      {user.gemini_key_hint ? (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Votre clé API ({user.gemini_key_hint}) est configurée et active. Toutes vos conversations sont traitées via vos propres quotas Google.
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          <span className="text-amber-400 font-semibold">Action requise :</span> Aucune clé API configurée. Vous devez entrer votre clé IA personnelle compatible Ava dans vos paramètres pour le chat général.
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
                  {(hasCustomLikeAccess ? CUSTOM_FEATURES : PRO_FEATURES).map(({ icon: Icon, text, val }) => (
                    <div key={text} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/[0.01]">
                      <div className="flex items-center gap-3.5 min-w-0 pr-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: hasCustomLikeAccess ? 'rgba(99,102,241,0.06)' : 'rgba(244,63,94,0.06)' }}>
                          <Icon size={14} style={{ color: hasCustomLikeAccess ? '#818cf8' : '#f43f5e' }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 truncate">{text}</span>
                      </div>
                      <span 
                        className="text-xs font-black flex-shrink-0 uppercase tracking-wider"
                        style={{ color: hasCustomLikeAccess ? '#818cf8' : '#f43f5e' }}
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
                  Les nouveaux paiements passent temporairement par crypto via NOWPayments. Ava active automatiquement l&apos;abonnement après confirmation blockchain, et les anciens abonnements restent reconnus jusqu&apos;à leur date actuelle.
                  {subscriptionManagementLabel(user) ? ` ${subscriptionManagementLabel(user)}` : ''}
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
            <div className="mx-auto max-w-2xl space-y-2 text-center">
              <h3 className="text-2xl font-black text-white">Toutes les formules disponibles</h3>
              <p className="text-sm text-slate-400">
                Choisissez une formule Custom, puis payez par banque/carte ou crypto-monnaie.
              </p>
            </div>
            
            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
              {ALL_PLANS.filter(isCheckoutVisiblePlan).map((plan, index) => renderPlanCard(plan, index))}
            </div>

            {renderPlanComparison(true)}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {subscriptionExpired && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 px-5 py-4 backdrop-blur-md md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={17} className="mt-0.5 flex-shrink-0 text-amber-300" />
                <div>
                  <p className="text-sm font-black text-amber-200">
                    Abonnement expiré
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    Votre ancien accès {lastPlanLabel ?? 'Ava Custom'} n’est plus actif. Vous pouvez relancer le paiement maintenant pour réactiver les avantages Pro.
                  </p>
                </div>
              </div>
              {lastPlanKey && CHECKOUT_PLAN_KEYS.includes(lastPlanKey) && (
                <button
                  type="button"
                  onClick={() => {
                    const plan = ALL_PLANS.find(item => item.key === lastPlanKey)
                    if (plan) startCheckout(plan)
                  }}
                  disabled={billingLoading}
                  className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-2xl bg-amber-300 px-5 text-sm font-black text-slate-950 transition-all hover:bg-amber-200 disabled:opacity-60"
                >
                  Renouveler {lastPlanLabel?.replace(/^Custom\s+/i, '') ?? 'Pro'}
                  <ArrowRight size={14} />
                </button>
              )}
            </motion.div>
          )}

          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase text-rose-400">Plans Ava Custom</p>
            <h3 className="mt-3 text-3xl font-black text-white">Tarifs simples et transparents</h3>
            <p className="mt-3 text-sm text-slate-400">
              Choisissez le niveau adapté à votre capital et à votre rythme d&apos;utilisation.
            </p>
          </div>

          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-5 md:grid-cols-3">
            {ALL_PLANS.filter(isCheckoutVisiblePlan).map((plan, index) => renderPlanCard(plan, index))}
          </div>

          {renderPlanComparison(true)}

          <p className="text-center text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed mt-4">
            Pour les plans Custom, vous pourrez configurer votre propre clé IA compatible Ava directement dans vos paramètres après souscription.
          </p>
        </div>
      )}

      {/* Billing country modal */}
      <AnimatePresence>
        {countryPromptPlan && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-6"
            >
              <button
                type="button"
                onClick={() => setCountryPromptPlan(null)}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>

              <div className="space-y-2 pr-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pays de facturation</p>
                <h3 className="text-2xl font-black text-white tracking-tight">{countryPromptPlan.label}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Sélectionnez votre pays pour finaliser le paiement et éviter les comptes sans adresse de facturation.
                </p>
              </div>

              {billingError && (
                <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-200">
                  {billingError}
                </div>
              )}

              <label className="block space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pays</span>
                <select
                  value={billingCountryCode}
                  onChange={(event) => setBillingCountryCode(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 text-sm font-semibold text-white outline-none transition-colors focus:border-orange-300/60"
                >
                  <option value="">Choisir un pays</option>
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </label>

              {suggestedCountryCode && (
                <button
                  type="button"
                  onClick={() => setBillingCountryCode(suggestedCountryCode)}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300 transition-colors hover:border-orange-300/40 hover:bg-orange-300/10 hover:text-white"
                >
                  Utiliser la suggestion : {countryDisplayName(suggestedCountryCode)}
                </button>
              )}

              <button
                type="button"
                onClick={confirmBillingCountry}
                disabled={billingLoading || !cleanCountryCode(billingCountryCode)}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-400 px-5 text-sm font-black text-slate-950 transition-all hover:bg-orange-300 disabled:opacity-50"
              >
                {billingLoading ? 'Ouverture...' : 'Continuer'}
                <ExternalLink size={14} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment method modal */}
      <AnimatePresence>
        {paymentChoicePlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#070b16] p-5 shadow-2xl shadow-black/40"
            >
              <button
                type="button"
                onClick={() => setPaymentChoicePlan(null)}
                className="absolute right-5 top-5 inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 transition-colors hover:text-white"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>

              <div className="pr-10">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-rose-300">Paiement</p>
                <h3 className="mt-1 text-lg font-black text-white">{paymentChoicePlan.label}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {paymentChoicePlan.price} {paymentChoicePlan.per}
                </p>
              </div>

              {(billingError || billingMessage) && (
                <div className={`mt-5 rounded-2xl border px-4 py-3 text-xs font-semibold ${
                  billingError
                    ? 'border-rose-500/20 bg-rose-500/10 text-rose-200'
                    : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
                }`}>
                  {billingError || billingMessage}
                </div>
              )}

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => startWhopCheckout('card')}
                  disabled={billingLoading}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-left transition-colors hover:border-rose-400/35 hover:bg-white/[0.06] disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-rose-300">
                    <CreditCard size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">Banque et carte</p>
                    <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">
                      Carte, PayPal, banque et renouvellement mensuel sécurisé.
                    </p>
                  </div>
                  {billingLoading ? (
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-500 border-t-white animate-spin" />
                  ) : (
                    <ExternalLink size={15} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => startNowPaymentsCheckout()}
                  disabled={billingLoading || !isNowPaymentsPlan(paymentChoicePlan)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-left transition-colors hover:border-rose-400/35 hover:bg-white/[0.06] disabled:opacity-60"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-rose-300">
                    <Coins size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-white">Crypto-monnaie</span>
                    <span className="block truncate text-xs font-semibold text-slate-500">
                      Paiement direct NOWPayments, activation après confirmation blockchain.
                    </span>
                  </span>
                  {billingLoading ? (
                    <span className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-500 border-t-white animate-spin" />
                  ) : (
                    <ExternalLink size={15} className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                  )}
                </button>

                <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-4 py-3 text-[11px] font-semibold leading-relaxed text-slate-500">
                  <ShieldCheck size={14} className="shrink-0 text-rose-300" />
                  Banque et carte passe par Whop. Crypto-monnaie passe par NOWPayments.
                </div>
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
                  PayPal confirmera l’abonnement automatiquement. Ava activera ensuite votre accès sur le compte {user.email}.
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
