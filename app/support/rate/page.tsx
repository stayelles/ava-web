'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Star } from 'lucide-react'
import LegalLayout from '@/components/legal-layout'
import { SUPABASE_HEADERS, SUPABASE_URL } from '@/components/app/constants'

export default function SupportRatingPage() {
  const labels = ['', 'Médiocre', 'Pas bon', 'Correct', 'Très bien', 'Parfait']
  const [token, setToken] = useState('')
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => setToken(new URLSearchParams(window.location.search).get('token') ?? ''), [])

  async function submit() {
    if (!token || rating < 1) return
    setLoading(true); setError('')
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ava-support`, {
        method: 'POST', headers: SUPABASE_HEADERS,
        body: JSON.stringify({ action: 'rate', token, rating, comment }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error ?? 'NOTATION_IMPOSSIBLE')
      setDone(true)
    } catch (exception) {
      const code = exception instanceof Error ? exception.message : ''
      setError(code === 'RATING_ALREADY_SUBMITTED' ? 'Cette assistance a déjà été notée.' : code === 'RATING_LINK_EXPIRED' ? 'Ce lien de notation a expiré.' : 'Ce lien est invalide ou la notation est indisponible.')
    } finally { setLoading(false) }
  }

  return <LegalLayout title="Noter Ava Support">
    <div className="max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-6 text-center">
      {done ? <><CheckCircle size={46} className="mx-auto text-emerald-400" /><h2 className="text-white text-xl font-black mt-4">Merci pour votre avis</h2><p className="text-slate-400 mt-2">Votre note aidera Bromuxe à améliorer Ava Support.</p></> : <>
        <p className="text-slate-400">Comment évaluez-vous l’assistance reçue ?</p>
        <div className="flex justify-center gap-2 mt-6">{[1,2,3,4,5].map(value => <button key={value} onClick={() => setRating(value)} aria-label={`${value} étoile${value > 1 ? 's' : ''}`}><Star size={34} className={value <= rating ? 'text-rose-400 fill-rose-400' : 'text-slate-700'} /></button>)}</div>
        <p className="h-6 mt-2 text-sm font-bold text-rose-300">{rating ? labels[rating] : ''}</p>
        <textarea value={comment} onChange={event => setComment(event.target.value.slice(0, 150))} maxLength={150} rows={2} placeholder="Commentaire facultatif · 150 caractères" className="mt-3 w-full resize-none rounded-2xl bg-slate-950 border border-white/10 p-4 text-white outline-none focus:border-rose-500/40" />
        <p className="mt-1 text-right text-xs text-slate-600">{comment.length}/150</p>
        {error && <p className="text-rose-400 text-sm mt-3">{error}</p>}
        <button disabled={loading || !token || rating < 1} onClick={submit} className="mt-4 rounded-xl bg-rose-500 px-6 py-3 text-white font-bold disabled:opacity-40">{loading ? 'Envoi…' : 'Envoyer ma note'}</button>
      </>}
    </div>
  </LegalLayout>
}
