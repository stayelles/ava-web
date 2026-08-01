'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  Coins,
  CreditCard,
  History,
  Loader2,
  RefreshCw,
  Repeat2,
  ShieldCheck,
  SlidersHorizontal,
  WalletCards,
  XCircle,
} from 'lucide-react'
import type { UserData } from '../types'
import { avaAiCreditsRequest } from '../services/avaAi'

type Wallet = {
  included_balance: number
  purchased_balance: number
  reserved_credits: number
  available_balance: number
  included_expires_at?: string | null
  next_included_grant_at?: string | null
  access_active: boolean
  unlimited: false
}

type LedgerEntry = {
  id: string
  event_type: string
  status: string
  credits: number
  created_at: string
  metadata?: Record<string, unknown>
}

type CreditLot = {
  id: string
  source: 'included' | 'purchased'
  remaining_credits: number
  granted_at: string
  expires_at: string
  status: string
}

type Pack = {
  key: string
  credits: number
  amount_minor: number
  currency: string
  enabled_card_paypal: boolean
  enabled_crypto: boolean
}

type Pricing = {
  currency: string
  unit_price_minor: number
  minimum_credits: number
  maximum_credits: number
  validity_days: number
  requires_active_subscription: boolean
}

type AutoReload = {
  enabled: boolean
  threshold_credits: number
  target_credits: number
  monthly_cap_minor: number | null
  monthly_spent_minor: number
  monthly_period_started_at?: string
  setup_status: 'disabled' | 'pending' | 'active' | 'failed'
  last_error?: string | null
}

type CreditStatus = {
  wallet: Wallet
  ledger: LedgerEntry[]
  lots: CreditLot[]
  packs: Pack[]
  pricing: Pricing
  auto_reload: AutoReload
}

const EVENT_LABELS: Record<string, string> = {
  grant_included: 'Crédits inclus',
  expire_included: 'Crédits expirés',
  expire_credits: 'Expiration à 90 jours',
  forfeit_subscription: 'Solde perdu — abonnement arrêté',
  reserve: 'Réservation',
  settle: 'Utilisation Ava AI',
  cancel: 'Réservation annulée',
  purchase: 'Recharge achetée',
  refund: 'Recharge remboursée',
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function money(minor: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(minor / 100)
}

export function AiCreditsTab({ user, onGoToSubscription }: { user: UserData; onGoToSubscription: () => void }) {
  const [status, setStatus] = useState<CreditStatus | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [customCredits, setCustomCredits] = useState(150)
  const [threshold, setThreshold] = useState(25)
  const [target, setTarget] = useState(150)
  const [monthlyCap, setMonthlyCap] = useState<number | ''>(10000)

  const eligible = user.is_admin === true || user.subscription_plan === 'custom_max'

  const refresh = useCallback(async () => {
    if (!eligible) return
    setError('')
    try {
      const result = await avaAiCreditsRequest(user, { action: 'status' })
      const next = result as CreditStatus
      setStatus(next)
      setThreshold(next.auto_reload?.threshold_credits ?? 25)
      setTarget(next.auto_reload?.target_credits ?? 150)
      setMonthlyCap(next.auto_reload?.monthly_cap_minor ?? '')
      if (next.pricing) {
        setCustomCredits(current => Math.max(next.pricing.minimum_credits, Math.min(next.pricing.maximum_credits, current)))
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Crédits IA indisponibles.')
    }
  }, [eligible, user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!eligible) return
    const params = new URLSearchParams(window.location.search)
    const orderId = params.get('credit_order')
    const returnedAutoReload = params.get('auto_reload') === 'return'
    if ((!orderId || params.get('payment') !== 'return') && !returnedAutoReload) return
    const paymentId = params.get('payment_id') ?? params.get('paymentId') ?? ''
    let cancelled = false
    const verify = async () => {
      setBusy(returnedAutoReload ? 'auto-verify' : `verify:${orderId}`)
      try {
        const result = await avaAiCreditsRequest(user, returnedAutoReload
          ? { action: 'auto-reload-verify' }
          : {
              action: 'verify-payment',
              order_id: orderId,
              provider_payment_id: paymentId,
            }, 45000)
        if (cancelled) return
        if (returnedAutoReload && result.status === 'active') {
          setNotice('Recharge automatique activée. Vous pouvez l’arrêter à tout moment.')
        } else if (result.status === 'paid') {
          setNotice('Paiement vérifié. Vos crédits Ava AI sont disponibles pendant 90 jours.')
        } else {
          setNotice('Confirmation en cours. Utilisez « Actualiser » dans quelques instants.')
        }
        const clean = new URL(window.location.href)
        for (const key of ['payment', 'payment_id', 'paymentId', 'auto_reload']) clean.searchParams.delete(key)
        window.history.replaceState({}, '', clean.toString())
        await refresh()
      } catch (requestError) {
        if (!cancelled) setError(requestError instanceof Error ? requestError.message : 'Vérification impossible.')
      } finally {
        if (!cancelled) setBusy(null)
      }
    }
    void verify()
    return () => { cancelled = true }
  }, [eligible, refresh, user])

  const available = Number(status?.wallet.available_balance ?? 0)
  const earliestExpiry = useMemo(() => status?.lots
    .filter(lot => lot.remaining_credits > 0)
    .sort((a, b) => a.expires_at.localeCompare(b.expires_at))[0]?.expires_at, [status])
  const customAmount = customCredits * Number(status?.pricing.unit_price_minor ?? 25)
  const customValid = !!status?.pricing
    && customCredits >= status.pricing.minimum_credits
    && customCredits <= status.pricing.maximum_credits

  const checkout = async (pack: Pick<Pack, 'key' | 'credits'>, paymentMethod: 'card_paypal' | 'crypto') => {
    setBusy(`${pack.key}:${paymentMethod}`)
    setError('')
    setNotice('')
    try {
      const result = await avaAiCreditsRequest(user, {
        action: 'checkout',
        pack_key: pack.key,
        credits: pack.credits,
        payment_method: paymentMethod,
      }, 45000)
      if (!result.payment_url) throw new Error('Lien de paiement indisponible.')
      window.location.assign(String(result.payment_url))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Paiement indisponible.')
      setBusy(null)
    }
  }

  const saveAutoReload = async () => {
    setBusy('auto-save')
    setError('')
    setNotice('')
    try {
      const isActive = status?.auto_reload.setup_status === 'active'
      const result = await avaAiCreditsRequest(user, {
        action: isActive ? 'auto-reload-update' : 'auto-reload-setup',
        enabled: true,
        threshold_credits: threshold,
        target_credits: target,
        monthly_cap_minor: monthlyCap === '' ? null : monthlyCap,
      }, 45000)
      if (result.payment_url) {
        window.location.assign(String(result.payment_url))
        return
      }
      setNotice('Paramètres de recharge automatique enregistrés.')
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Recharge automatique indisponible.')
    } finally {
      setBusy(null)
    }
  }

  const disableAutoReload = async () => {
    setBusy('auto-disable')
    setError('')
    try {
      await avaAiCreditsRequest(user, { action: 'auto-reload-disable' })
      setNotice('Recharge automatique désactivée. Aucun nouveau débit automatique ne sera lancé.')
      await refresh()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Désactivation impossible.')
    } finally {
      setBusy(null)
    }
  }

  if (!eligible) {
    return (
      <div className="h-full overflow-y-auto px-4 py-8 md:px-8">
        <div className="mx-auto max-w-3xl rounded-3xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
          <Coins className="mx-auto text-rose-400" size={38} />
          <h1 className="mt-4 text-2xl font-black text-white">Crédits Ava AI</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Le portefeuille Ava AI et les 115 crédits inclus tous les 30 jours sont disponibles avec Custom Max.
            Les crédits restent utilisables 90 jours maximum tant que l’abonnement demeure actif.
          </p>
          <button onClick={onGoToSubscription} className="mt-6 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white hover:bg-rose-500">
            Découvrir Custom Max
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.09),transparent_34%)] px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-rose-400">
              <ShieldCheck size={15} /> Portefeuille sécurisé
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white">Crédits Ava AI</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              115 crédits sont ajoutés tous les 30 jours avec Custom Max. Chaque crédit expire 90 jours après son octroi
              et tout solde restant est perdu si l’abonnement s’arrête. Aucun volume ne bénéficie d’une remise.
            </p>
          </div>
          <button onClick={() => void refresh()} disabled={busy !== null} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:opacity-50">
            <RefreshCw size={16} className={busy?.includes('verify') ? 'animate-spin' : ''} /> Actualiser
          </button>
        </header>

        {notice && <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200"><CheckCircle2 size={17} />{notice}</div>}
        {error && <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">{error}</div>}
        {status && !status.wallet.access_active && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            <XCircle size={18} className="mt-0.5 shrink-0" />
            <span>L’abonnement Custom Max n’est plus actif. Le portefeuille a été remis à zéro et aucun ancien crédit ne sera restauré.</span>
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <BalanceCard icon={Coins} label="Solde disponible" value={status ? String(available) : '—'} accent />
          <BalanceCard icon={WalletCards} label="Crédits inclus" value={String(status?.wallet.included_balance ?? '—')} detail={`Prochain octroi : ${formatDate(status?.wallet.next_included_grant_at)}`} />
          <BalanceCard icon={CreditCard} label="Crédits achetés" value={String(status?.wallet.purchased_balance ?? '—')} detail={`Première échéance : ${formatDate(earliestExpiry)}`} />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-xl font-black text-white">Acheter des crédits</h2>
            <p className="mt-1 text-sm text-slate-500">
              Tarif fixe : {money(status?.pricing.unit_price_minor ?? 25)} par crédit, sans remise. Carte, PayPal ou crypto.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {(status?.packs ?? []).map((pack) => (
              <CreditPackCard key={pack.key} pack={pack} busy={busy} checkout={checkout} />
            ))}
          </div>

          <article className="mt-4 rounded-3xl border border-rose-500/20 bg-gradient-to-br from-rose-500/10 to-slate-950/70 p-5 backdrop-blur-xl">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-rose-300">
                  <SlidersHorizontal size={15} /> Quantité personnalisée
                </div>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <label className="flex-1">
                    <span className="mb-1 block text-xs font-bold text-slate-400">Nombre de crédits</span>
                    <input
                      type="number"
                      min={status?.pricing.minimum_credits ?? 30}
                      max={status?.pricing.maximum_credits ?? 10000}
                      step={1}
                      value={customCredits}
                      onChange={event => setCustomCredits(Math.floor(Number(event.target.value)))}
                      className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-lg font-black text-white outline-none focus:border-rose-500/60"
                    />
                  </label>
                  <div className="rounded-xl border border-white/8 bg-white/5 px-5 py-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Total</div>
                    <div className="text-xl font-black text-white">{money(customAmount)}</div>
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Entre {status?.pricing.minimum_credits ?? 30} et {status?.pricing.maximum_credits ?? 10000} crédits.
                </p>
              </div>
              <div className="grid min-w-56 gap-2">
                <button
                  onClick={() => void checkout({ key: 'custom', credits: customCredits }, 'card_paypal')}
                  disabled={!customValid || busy !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-500 disabled:opacity-40"
                >
                  {busy === 'custom:card_paypal' ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                  Carte ou PayPal
                </button>
                <button
                  onClick={() => void checkout({ key: 'custom', credits: customCredits }, 'crypto')}
                  disabled={!customValid || busy !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:opacity-40"
                >
                  {busy === 'custom:crypto' ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
                  Crypto
                </button>
              </div>
            </div>
          </article>
        </section>

        <section className="rounded-3xl border border-cyan-500/15 bg-cyan-500/[0.04] p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
                <Repeat2 size={16} /> Recharge automatique
              </div>
              <h2 className="mt-2 text-xl font-black text-white">Recharger quand le solde devient faible</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Une carte ou un compte PayPal est autorisé une fois, puis débité uniquement quand le seuil est atteint.
                La crypto reste manuelle. Vous pouvez désactiver cette autorisation à tout moment.
              </p>
            </div>
            <StatusPill status={status?.auto_reload.setup_status ?? 'disabled'} enabled={status?.auto_reload.enabled ?? false} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <NumberField label="Recharger sous" value={threshold} suffix="crédits" onChange={value => setThreshold(Number(value || 0))} min={0} />
            <NumberField label="Ramener le solde à" value={target} suffix="crédits" onChange={value => setTarget(Number(value || 0))} min={30} />
            <NumberField
              label="Plafond sur 30 jours"
              value={monthlyCap === '' ? '' : monthlyCap / 100}
              suffix="€"
              onChange={value => setMonthlyCap(value === '' ? '' : Math.round(Number(value) * 100))}
              min={7.5}
              allowEmpty
            />
          </div>
          <div className="mt-3 text-xs text-slate-500">
            Dépensé sur la période actuelle : {money(status?.auto_reload.monthly_spent_minor ?? 0)}.
            Le montant de chaque recharge suit le tarif fixe de {money(status?.pricing.unit_price_minor ?? 25)} par crédit.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => void saveAutoReload()}
              disabled={busy !== null || target - threshold < (status?.pricing.minimum_credits ?? 30)}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-black text-slate-950 hover:bg-cyan-400 disabled:opacity-40"
            >
              {busy === 'auto-save' ? <Loader2 size={16} className="animate-spin" /> : <Repeat2 size={16} />}
              {status?.auto_reload.setup_status === 'active' ? 'Enregistrer' : 'Activer avec carte ou PayPal'}
            </button>
            {(status?.auto_reload.enabled || status?.auto_reload.setup_status === 'pending') && (
              <button
                onClick={() => void disableAutoReload()}
                disabled={busy !== null}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-300 hover:bg-white/10 disabled:opacity-40"
              >
                Désactiver
              </button>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-white/8 bg-slate-950/55 backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
            <History size={18} className="text-rose-400" />
            <h2 className="font-black text-white">Historique récent</h2>
          </div>
          <div className="divide-y divide-white/5">
            {(status?.ledger ?? []).length === 0 && <p className="px-5 py-8 text-center text-sm text-slate-500">Aucun mouvement pour le moment.</p>}
            {(status?.ledger ?? []).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div>
                  <div className="text-sm font-bold text-slate-200">{EVENT_LABELS[entry.event_type] ?? entry.event_type}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{formatDate(entry.created_at)}</div>
                </div>
                <div className={`text-sm font-black ${['grant_included', 'purchase', 'cancel'].includes(entry.event_type) ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {['grant_included', 'purchase'].includes(entry.event_type) ? '+' : entry.event_type === 'cancel' ? '' : '−'}{entry.credits}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function CreditPackCard({ pack, busy, checkout }: {
  pack: Pack
  busy: string | null
  checkout: (pack: Pick<Pack, 'key' | 'credits'>, method: 'card_paypal' | 'crypto') => Promise<void>
}) {
  return (
    <article className="rounded-3xl border border-white/8 bg-slate-950/65 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-black text-white">{pack.credits}</div>
          <div className="text-xs font-black uppercase tracking-[0.16em] text-rose-400">crédits</div>
        </div>
        <div className="rounded-xl bg-white/5 px-3 py-2 text-lg font-black text-white">{money(pack.amount_minor, pack.currency)}</div>
      </div>
      <div className="mt-5 grid gap-2">
        <button
          onClick={() => void checkout(pack, 'card_paypal')}
          disabled={!pack.enabled_card_paypal || busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-black text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === `${pack.key}:card_paypal` ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
          Carte ou PayPal
        </button>
        <button
          onClick={() => void checkout(pack, 'crypto')}
          disabled={!pack.enabled_crypto || busy !== null}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy === `${pack.key}:crypto` ? <Loader2 size={16} className="animate-spin" /> : <ArrowUpRight size={16} />}
          Crypto
        </button>
      </div>
    </article>
  )
}

function NumberField({ label, value, suffix, onChange, min, allowEmpty = false }: {
  label: string
  value: number | ''
  suffix: string
  onChange: (value: number | '') => void
  min: number
  allowEmpty?: boolean
}) {
  return (
    <label className="rounded-2xl border border-white/8 bg-slate-950/55 p-3">
      <span className="block text-xs font-bold text-slate-400">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          min={min}
          value={value}
          placeholder={allowEmpty ? 'Sans limite' : undefined}
          onChange={event => {
            if (allowEmpty && event.target.value === '') onChange('')
            else onChange(Number(event.target.value))
          }}
          className="min-w-0 flex-1 bg-transparent text-lg font-black text-white outline-none"
        />
        <span className="text-xs font-bold text-slate-500">{suffix}</span>
      </div>
    </label>
  )
}

function StatusPill({ status, enabled }: { status: AutoReload['setup_status']; enabled: boolean }) {
  const active = status === 'active' && enabled
  return (
    <div className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-black ${
      active ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' : 'border-white/10 bg-white/5 text-slate-400'
    }`}>
      <span className={`h-2 w-2 rounded-full ${active ? 'bg-emerald-400' : 'bg-slate-600'}`} />
      {active ? 'Active' : status === 'pending' ? 'Autorisation en attente' : 'Désactivée'}
    </div>
  )
}

function BalanceCard({ icon: Icon, label, value, detail, accent = false }: {
  icon: typeof Coins
  label: string
  value: string
  detail?: string
  accent?: boolean
}) {
  return (
    <div className={`rounded-3xl border p-5 ${accent ? 'border-rose-500/25 bg-rose-500/10' : 'border-white/8 bg-slate-950/55'}`}>
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-500"><Icon size={16} className={accent ? 'text-rose-400' : 'text-slate-500'} />{label}</div>
      <div className="mt-3 text-3xl font-black text-white">{value}</div>
      {detail && <div className="mt-1 text-xs text-slate-500">{detail}</div>}
    </div>
  )
}
