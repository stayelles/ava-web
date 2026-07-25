'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowUpRight,
  CheckCircle2,
  Coins,
  CreditCard,
  History,
  Infinity as InfinityIcon,
  Loader2,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import type { UserData } from '../types'
import { avaAiCreditsRequest } from '../services/avaAi'

type Wallet = {
  included_balance: number
  purchased_balance: number
  reserved_credits: number
  available_balance: number | null
  included_expires_at?: string | null
  unlimited: boolean
}

type LedgerEntry = {
  id: string
  event_type: string
  status: string
  credits: number
  created_at: string
  metadata?: Record<string, unknown>
}

type Pack = {
  key: string
  credits: number
  amount_minor: number
  currency: string
  enabled_card_paypal: boolean
  enabled_crypto: boolean
}

type CreditStatus = {
  wallet: Wallet
  ledger: LedgerEntry[]
  packs: Pack[]
}

const EVENT_LABELS: Record<string, string> = {
  grant_included: 'Crédits mensuels inclus',
  expire_included: 'Fin de période',
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

  const eligible = user.is_admin === true || user.subscription_plan === 'custom_max'

  const refresh = useCallback(async () => {
    if (!eligible) return
    setError('')
    try {
      const result = await avaAiCreditsRequest(user, { action: 'status' })
      setStatus(result as CreditStatus)
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
    if (!orderId || params.get('payment') !== 'return') return
    const paymentId = params.get('payment_id') ?? params.get('paymentId') ?? ''
    let cancelled = false
    const verify = async () => {
      setBusy(`verify:${orderId}`)
      try {
        const result = await avaAiCreditsRequest(user, {
          action: 'verify-payment',
          order_id: orderId,
          provider_payment_id: paymentId,
        }, 45000)
        if (cancelled) return
        if (result.status === 'paid') {
          setNotice('Paiement vérifié. Vos crédits Ava AI sont disponibles.')
          const clean = new URL(window.location.href)
          clean.searchParams.delete('payment')
          clean.searchParams.delete('payment_id')
          clean.searchParams.delete('paymentId')
          window.history.replaceState({}, '', clean.toString())
        } else {
          setNotice('Paiement en cours de confirmation. Utilisez « Actualiser » dans quelques instants.')
        }
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

  const available = useMemo(() => {
    if (!status?.wallet) return 0
    return status.wallet.unlimited ? null : Number(status.wallet.available_balance ?? 0)
  }, [status])

  const checkout = async (pack: Pack, paymentMethod: 'card_paypal' | 'crypto') => {
    setBusy(`${pack.key}:${paymentMethod}`)
    setError('')
    setNotice('')
    try {
      const result = await avaAiCreditsRequest(user, {
        action: 'checkout',
        pack_key: pack.key,
        payment_method: paymentMethod,
      }, 45000)
      if (!result.payment_url) throw new Error('Lien de paiement indisponible.')
      window.location.assign(String(result.payment_url))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Paiement indisponible.')
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
            Le portefeuille Ava AI et les 150 crédits inclus par période de 30 jours sont disponibles avec Custom Max.
            Vos crédits Mobile actuels restent séparés et inchangés.
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
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              150 crédits inclus tous les 30 jours avec Custom Max. Les recharges achetées n’expirent pas.
              Ava débite une minute vocale commencée, une réponse texte terminée ou une modification confirmée et appliquée.
            </p>
          </div>
          <button onClick={() => void refresh()} disabled={busy !== null} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-slate-200 hover:bg-white/10 disabled:opacity-50">
            <RefreshCw size={16} className={busy?.startsWith('verify:') ? 'animate-spin' : ''} /> Actualiser
          </button>
        </header>

        {notice && <div className="flex items-center gap-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200"><CheckCircle2 size={17} />{notice}</div>}
        {error && <div className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-200">{error}</div>}

        <section className="grid gap-4 md:grid-cols-3">
          <BalanceCard icon={status?.wallet.unlimited ? InfinityIcon : Coins} label="Solde disponible" value={status ? (available === null ? 'Illimité' : String(available)) : '—'} accent />
          <BalanceCard icon={WalletCards} label="Crédits inclus" value={status?.wallet.unlimited ? 'Illimité' : String(status?.wallet.included_balance ?? '—')} detail={status?.wallet.unlimited ? 'Compte owner' : `Renouvellement : ${formatDate(status?.wallet.included_expires_at)}`} />
          <BalanceCard icon={CreditCard} label="Crédits achetés" value={status?.wallet.unlimited ? 'Illimité' : String(status?.wallet.purchased_balance ?? '—')} detail="Sans date d’expiration" />
        </section>

        <section>
          <div className="mb-3">
            <h2 className="text-xl font-black text-white">Acheter des crédits</h2>
            <p className="mt-1 text-sm text-slate-500">Paiement par carte, PayPal ou crypto. L’octroi est effectué uniquement après vérification serveur.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {(status?.packs ?? []).map((pack) => (
              <article key={pack.key} className="rounded-3xl border border-white/8 bg-slate-950/65 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl">
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
            ))}
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
