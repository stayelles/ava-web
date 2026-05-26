'use client'

import { motion } from 'framer-motion'
import { 
  Crown, Check, Zap, Globe, Monitor, ImageIcon, Brain, Bell, 
  Layers, Key, Smartphone, Mic, MessageSquare, Star, Cpu, Lock,
  CreditCard, ExternalLink, HelpCircle, ShieldCheck, AlertCircle, ArrowRight
} from 'lucide-react'
import { PADDLE_PRICE_PRO_STARTER, PADDLE_PRICE_CUSTOM_PRO, PADDLE_PRICE_CUSTOM_SIMPLE } from '../constants'
import { isPro, isCustomPlan, voiceMinutesUsed, voiceMinutesRemaining, voiceQuotaMinutes } from '../types'
import type { UserData } from '../types'
import { usePaddle } from '../hooks/usePaddle'

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
    price: '22,90€',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_SIMPLE,
    popular: false,
    trial: null,
    accentColor: '#6366f1',
    bg: 'linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(99, 102, 241, 0.01) 100%)',
    border: 'rgba(99, 102, 241, 0.15)',
    glow: 'rgba(99, 102, 241, 0.05)',
    btnBg: 'rgba(99, 102, 241, 0.08)',
    btnHoverBg: 'rgba(99, 102, 241, 0.15)',
    btnColor: '#818cf8',
    description: 'Utilisez votre propre clé API Gemini. Idéal pour un usage personnel et intensif.',
    features: [
      'Voix & Texte Illimités',
      'Recherche Web Google Illimitée',
      'Analyse d\'images Illimitée',
      'Contrôle Mac/PC & Vision écran',
      'Module Ava Trading inclus',
      'Clé API Gemini personnelle',
    ]
  },
  {
    key: 'pro_starter',
    label: 'Pro Starter',
    price: '39,99€',
    per: '/mois',
    priceId: PADDLE_PRICE_PRO_STARTER,
    popular: false,
    trial: '3 jours gratuits',
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
    price: '99,99€',
    per: '/mois',
    priceId: PADDLE_PRICE_CUSTOM_PRO,
    popular: true,
    trial: '3 jours gratuits',
    badge: 'Recommandé',
    accentColor: '#e11d48',
    bg: 'linear-gradient(135deg, rgba(225, 29, 72, 0.05) 0%, rgba(225, 29, 72, 0.01) 100%)',
    border: 'rgba(225, 29, 72, 0.25)',
    glow: 'rgba(225, 29, 72, 0.15)',
    btnBg: 'linear-gradient(90deg, #f43f5e 0%, #e11d48 100%)',
    btnHoverBg: 'linear-gradient(90deg, #fb7185 0%, #f43f5e 100%)',
    btnColor: '#fff',
    description: 'La puissance absolue pour professionnels avec fonctionnalités de trading avancées.',
    features: [
      '∞ Voix & Texte Illimités',
      '∞ Recherche Web Illimitée',
      '∞ Analyse d\'images Illimitée',
      '∞ Contrôle Mac/PC & Vision',
      'Ava Trading Desktop inclus',
      'Clé API Gemini personnelle',
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
  { icon: Monitor, text: 'Ava Trading Desktop inclus', val: 'Inclus' },
  { icon: Bell, text: '∞ Rappels push illimités', val: 'Illimité' },
  { icon: Layers, text: '∞ Intégrations MCP illimitées', val: 'Illimité' },
  { icon: Key, text: 'Votre propre clé API Gemini (Google AI Studio)', val: 'Requis' },
  { icon: Lock, text: 'Clé chiffrée de bout en bout avec votre PIN', val: 'Chiffré' },
]

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
  const pro = isPro(user)
  const custom = isCustomPlan(user)
  const { openCheckout } = usePaddle(onRefresh ? () => setTimeout(onRefresh!, 5000) : undefined)

  const hasMobileSubscription = !!user.subscription_tier &&
    user.subscription_tier !== 'free' &&
    user.subscription_source !== 'gumroad' &&
    user.subscription_source !== 'paddle'

  const currentPlan = pro ? (user.subscription_plan ?? 'pro_starter') : null
  const activePlanLabel = currentPlan === 'custom_pro' || currentPlan === 'pro_plus'
    ? 'Custom Pro'
    : currentPlan === 'custom_simple' || currentPlan === 'custom' || currentPlan === 'custom_starter'
      ? 'Custom Simple'
      : currentPlan === 'pro_starter'
        ? 'Pro Starter'
        : null

  const isSubscribed = pro || custom

  // Define accent colors for current plan
  const planAccent = activePlanLabel === 'Custom Pro'
    ? '#e11d48'
    : activePlanLabel === 'Custom Simple'
      ? '#6366f1'
      : '#f43f5e'

  // Determine active plan key
  const activePlanKey = currentPlan === 'custom_pro' || currentPlan === 'pro_plus'
    ? 'custom_pro'
    : currentPlan === 'custom_simple' || currentPlan === 'custom' || currentPlan === 'custom_starter' || (custom && !activePlanLabel)
      ? 'custom_simple'
      : currentPlan === 'pro_starter'
        ? 'pro_starter'
        : null

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
            : 'Sélectionnez la formule adaptée à votre profil pour débloquer la voix, le chat et le trading sans restrictions.'
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
                        {user.subscription_source === 'paddle' ? 'Paddle Billing' : user.subscription_source === 'gumroad' ? 'Gumroad' : 'Mobile'}
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
                    <div className="flex-shrink-0">
                      <a
                        href="https://customer.paddle.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 shadow-xl"
                      >
                        <CreditCard size={14} />
                        Gérer la facturation
                        <ExternalLink size={12} className="opacity-60" />
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>

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

              {/* Paddle Subscription Detail / Info Panel */}
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
                  Notre plateforme utilise Paddle comme processeur de paiement sécurisé agréé. Toutes vos transactions sont protégées, conformes PCI-DSS et cryptées de bout en bout.
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto w-full">
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
                    
                    {plan.trial && plan.key !== activePlanKey && (
                      <span className="text-[10px] font-bold text-emerald-400 block mt-2 tracking-wide">
                        ⚡️ {plan.trial} · Annulation à tout moment
                      </span>
                    )}
                    
                    {/* Description */}
                    <p className="text-xs text-slate-400 mt-5 leading-relaxed font-medium">
                      {plan.description}
                    </p>

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
                        onClick={() => openCheckout(plan.priceId, user.email)}
                        className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
                        {plan.trial ? 'Commencer l\'essai' : 'Souscrire'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto w-full">
            {ALL_PLANS.filter(p => p.key !== 'pro_starter').map((plan, index) => (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * (index + 1) }}
                className="rounded-3xl overflow-hidden flex flex-col justify-between p-7 relative transition-all duration-300 group hover:translate-y-[-4px]"
                style={{
                  background: plan.bg,
                  border: `1px solid ${plan.border}`,
                  boxShadow: plan.glow !== 'none' ? `0 15px 40px -10px ${plan.glow}` : 'none',
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
                  
                  {plan.trial && (
                    <span className="text-[10px] font-bold text-emerald-400 block mt-2 tracking-wide">
                      ⚡️ {plan.trial} · Annulation à tout moment
                    </span>
                  )}
                  
                  {/* Description */}
                  <p className="text-xs text-slate-400 mt-5 leading-relaxed font-medium">
                    {plan.description}
                  </p>

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
                    onClick={() => openCheckout(plan.priceId, user.email)}
                    className="w-full py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
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
                    {plan.trial ? 'Commencer l\'essai' : 'Souscrire'}
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
    </div>
  )
}
