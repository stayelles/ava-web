'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CircleDollarSign, Download, Filter, Layers3, Loader2, ShieldCheck, Sparkles } from 'lucide-react'

const PRESETS_ENDPOINT = 'https://bmcvyvyjqxehwmkddtya.supabase.co/functions/v1/ava-presets'

type Preset = {
  id: string
  slug: string
  title: string
  description: string
  compatible_plans: Array<'custom_pro' | 'custom_ultra' | 'custom_max'>
  minimum_equity_usd: number
  recommended_equity_min_usd: number | null
  recommended_equity_max_usd: number | null
  application_version: string
  revision: number
  published_at: string | null
  updated_at: string
}

const PLAN_LABELS = {
  custom_pro: 'Custom Pro',
  custom_ultra: 'Custom Ultra',
  custom_max: 'Custom Max / Spécial',
} as const

export default function PresetsPage() {
  const [presets, setPresets] = useState<Preset[]>([])
  const [filter, setFilter] = useState<'all' | keyof typeof PLAN_LABELS>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(PRESETS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list' }),
    })
      .then(async response => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok || data.ok === false) throw new Error(data.error ?? 'Bibliothèque indisponible.')
        setPresets(Array.isArray(data.presets) ? data.presets : [])
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Bibliothèque indisponible.'))
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(() => filter === 'all'
    ? presets
    : presets.filter(preset => preset.compatible_plans.includes(filter)), [filter, presets])

  return (
    <main className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(244,63,94,0.16),transparent_34%),radial-gradient(circle_at_82%_72%,rgba(56,189,248,0.10),transparent_38%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

      <section className="relative mx-auto max-w-7xl px-5 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition-colors hover:text-white"><ArrowLeft size={16} /> Ava</Link>
          <div className="flex gap-2">
            <Link href="/downloads" className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-slate-200 hover:bg-white/[0.08]">Télécharger Desktop</Link>
            <Link href="/app" className="rounded-2xl bg-white px-4 py-2 text-sm font-black text-slate-950">Mon compte</Link>
          </div>
        </div>

        <div className="mx-auto max-w-3xl pt-16 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl border border-rose-400/20 bg-rose-500/10 text-rose-300"><Layers3 size={25} /></div>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-rose-300">Bibliothèque officielle</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-6xl">Presets Ava Volatility</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400">
            Des configurations publiées et signées par Ava. L’application vérifie le plan, la signature et le capital minimum avant de proposer l’installation.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          <Filter size={15} className="mr-1 text-slate-500" />
          {(['all', 'custom_pro', 'custom_ultra', 'custom_max'] as const).map(item => (
            <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-xs font-black transition-colors ${filter === item ? 'border-rose-300/45 bg-rose-400/15 text-rose-100' : 'border-white/10 bg-white/[0.03] text-slate-500 hover:text-white'}`}>
              {item === 'all' ? 'Tous' : PLAN_LABELS[item]}
            </button>
          ))}
        </div>

        {loading && <div className="mt-16 flex items-center justify-center gap-3 text-sm font-bold text-slate-500"><Loader2 size={18} className="animate-spin" /> Chargement des presets…</div>}
        {error && <div className="mx-auto mt-12 max-w-xl rounded-3xl border border-rose-400/25 bg-rose-400/10 p-5 text-center text-sm font-bold text-rose-100">{error}</div>}

        {!loading && !error && (
          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visible.map(preset => (
              <article key={preset.id} className="group flex min-h-[330px] flex-col rounded-[28px] border border-white/10 bg-white/[0.035] p-6 transition-colors hover:border-rose-300/30 hover:bg-white/[0.055]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-rose-300"><Sparkles size={19} /></div>
                  <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-200">Signé · r{preset.revision}</div>
                </div>
                <h2 className="mt-6 text-xl font-black">{preset.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-6 text-slate-400">{preset.description || 'Configuration Ava Volatility vérifiée.'}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {preset.compatible_plans.map(plan => <span key={plan} className="rounded-full border border-white/10 bg-slate-950/60 px-2.5 py-1 text-[10px] font-bold text-slate-400">{PLAN_LABELS[plan]}</span>)}
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2"><CircleDollarSign size={14} className="text-amber-300" /> Minimum obligatoire : <strong className="text-white">{Number(preset.minimum_equity_usd || 0).toLocaleString('fr-FR')} $</strong></div>
                  {(preset.recommended_equity_min_usd != null || preset.recommended_equity_max_usd != null) && <div className="mt-2 text-[11px] text-slate-500">Conseillé : {preset.recommended_equity_min_usd == null ? '—' : Number(preset.recommended_equity_min_usd).toLocaleString('fr-FR')} à {preset.recommended_equity_max_usd == null ? 'illimité' : `${Number(preset.recommended_equity_max_usd).toLocaleString('fr-FR')} $`}</div>}
                </div>
                <a href={`ava://preset/${preset.id}?revision=${preset.revision}`} className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-rose-400"><Download size={16} /> Installer dans Ava Desktop</a>
                <p className="mt-2 text-center text-[10px] text-slate-600">Publié le {new Date(preset.published_at ?? preset.updated_at).toLocaleDateString('fr-FR')} · Desktop {preset.application_version}</p>
              </article>
            ))}
          </div>
        )}

        {!loading && !error && visible.length === 0 && <div className="mx-auto mt-14 max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-slate-500">Aucun preset publié pour ce filtre.</div>}

        <div className="mx-auto mt-10 flex max-w-3xl items-start gap-3 rounded-3xl border border-white/10 bg-slate-950/70 p-5 text-sm leading-relaxed text-slate-400">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-300" />
          <p>Un preset ne contient ni compte, ni mot de passe, ni jeton. Il ne peut jamais augmenter les droits de ton abonnement : les limites signées du plan Ava restent prioritaires.</p>
        </div>
      </section>
    </main>
  )
}
