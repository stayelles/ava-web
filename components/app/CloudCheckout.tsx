'use client'

import { useRef, useState } from 'react'
import { Coins, ExternalLink, Loader2 } from 'lucide-react'
import { requestCloudCheckout, type CloudCheckoutRequest, type CloudPaymentMethod } from './cloud-checkout'

export function CloudCheckout({ request, disabled = false, language = 'fr' }: {
  request: CloudCheckoutRequest; disabled?: boolean; language?: string
}) {
  const [busy, setBusy] = useState<CloudPaymentMethod | null>(null)
  const [error, setError] = useState('')
  const [link, setLink] = useState<{ method: CloudPaymentMethod; url: string } | null>(null)
  const pending = useRef(false)
  const tr = (fr: string, en: string) => language === 'en' ? en : fr
  const checkout = async (method: CloudPaymentMethod) => {
    if (pending.current || disabled) return
    pending.current = true
    setBusy(method)
    setError('')
    try {
      const url = link?.method === method ? link.url : await requestCloudCheckout(request, method)
      setLink({ method, url })
      // Same-tab navigation works without a popup gesture on mobile browsers.
      window.location.assign(url)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(message === 'CHECKOUT_TIMEOUT'
        ? tr('La préparation du paiement prend trop de temps. Vérifiez votre connexion, puis réessayez.', 'Payment preparation is taking too long. Check your connection, then try again.')
        : message === 'CHECKOUT_LINK_MISSING'
          ? tr('Le service de paiement n’a pas renvoyé de lien valide. Réessayez ou contactez Ava Support.', 'The payment service did not return a valid link. Try again or contact Ava Support.')
          : message === 'Failed to fetch' || !message
            ? tr('Impossible de joindre le paiement. Vérifiez votre connexion, puis réessayez.', 'Unable to reach the payment service. Check your connection, then try again.')
            : message)
    } finally {
      pending.current = false
      setBusy(null)
    }
  }
  return <div className="mt-5 space-y-3" aria-busy={busy !== null}>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
      <button type="button" disabled={disabled || busy !== null} onClick={() => void checkout('card')}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-rose-400 disabled:opacity-60">
        {busy === 'card' ? <Loader2 className="animate-spin" size={17} /> : <span className="flex items-center gap-1.5">
          <img src="/payment/visa.png" alt="" className="h-4 w-auto rounded-sm bg-white/90 px-1" />
          <img src="/payment/mastercard.png" alt="" className="h-4 w-auto rounded-sm bg-white/90 px-1" />
          <img src="/payment/paypal.png" alt="" className="h-4 w-auto rounded-sm bg-white/90 px-1" />
        </span>}
        {tr('Payer par carte ou PayPal', 'Pay by card or PayPal')}
      </button>
      <button type="button" disabled={disabled || busy !== null} onClick={() => void checkout('crypto')}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-white/[0.08] disabled:opacity-60">
        {busy === 'crypto' ? <Loader2 className="animate-spin" size={17} /> : <Coins size={17} />}
        {tr('Paiement en crypto', 'Pay with crypto')}
      </button>
    </div>
    {busy && <p role="status" className="text-sm text-slate-300">{tr('Préparation du lien de paiement…', 'Preparing your payment link…')}</p>}
    {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</p>}
    {link && <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-slate-300">
      <p>{tr('Si la page ne s’ouvre pas automatiquement :', 'If the page does not open automatically:')}</p>
      <a href={link.url} className="mt-2 inline-flex items-center gap-2 font-bold text-rose-400"><ExternalLink size={16} />{tr('Ouvrir la page de paiement', 'Open payment page')}</a>
    </div>}
  </div>
}
