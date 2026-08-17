'use client'

import { useEffect, useState } from 'react'
import { Clock3, Eye, Loader2, Search, ShieldCheck, Square } from 'lucide-react'
import { SUPABASE_HEADERS, SUPABASE_URL } from '../constants'
import type { UserData } from '../types'

type AssistanceUser = {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  subscription_plan?: string | null
  subscription_expires_at?: string | null
  custom_plan_expires_at?: string | null
}

type AssistanceSnapshot = {
  user?: Record<string, unknown>
  runtime_sessions?: Array<Record<string, unknown>>
  preset_events?: Array<Record<string, unknown>>
}

const formatDate = (value: unknown) => {
  const date = new Date(String(value ?? ''))
  return Number.isFinite(date.getTime()) ? date.toLocaleString('fr-FR') : '—'
}

export function AdminAssistancePanel({ user, adminAccessToken }: { user: UserData; adminAccessToken: string }) {
  const [query, setQuery] = useState('')
  const [reason, setReason] = useState('Diagnostic demandé par le client')
  const [users, setUsers] = useState<AssistanceUser[]>([])
  const [selected, setSelected] = useState<AssistanceUser | null>(null)
  const [assistanceToken, setAssistanceToken] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [snapshot, setSnapshot] = useState<AssistanceSnapshot | null>(null)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [nowMs, setNowMs] = useState(() => Date.now())

  const remaining = Date.parse(expiresAt) - nowMs
  const expiresInMinutes = Number.isFinite(remaining) ? Math.max(0, Math.ceil(remaining / 60_000)) : 0

  useEffect(() => {
    if (!expiresAt) return
    setNowMs(Date.now())
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [expiresAt])

  const call = async (payload: Record<string, unknown>) => {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/admin-assistance`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({
        user_id: user.id,
        web_session_token: user.web_session_token,
        admin_access_token: adminAccessToken,
        ...payload,
      }),
    })
    const data = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok || data.ok === false) throw new Error(String(data.error ?? `HTTP ${response.status}`))
    return data
  }

  const search = async () => {
    setBusy('search')
    setMessage('')
    try {
      const data = await call({ action: 'search', query: query.trim() })
      setUsers(Array.isArray(data.users) ? data.users as AssistanceUser[] : [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Recherche indisponible.')
    } finally {
      setBusy('')
    }
  }

  const open = async () => {
    if (!selected) return
    setBusy('open')
    setMessage('')
    try {
      const opened = await call({ action: 'open', target_user_id: selected.id, reason })
      const token = String(opened.assistance_token ?? '')
      setAssistanceToken(token)
      setExpiresAt(String(opened.expires_at ?? ''))
      const data = await call({ action: 'snapshot', assistance_token: token })
      setSnapshot((data.snapshot ?? null) as AssistanceSnapshot | null)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Mode Assistance indisponible.')
    } finally {
      setBusy('')
    }
  }

  const close = async () => {
    if (assistanceToken) await call({ action: 'close', assistance_token: assistanceToken }).catch(() => undefined)
    setAssistanceToken('')
    setExpiresAt('')
    setSnapshot(null)
    setSelected(null)
  }

  useEffect(() => () => {
    if (!assistanceToken) return
    void fetch(`${SUPABASE_URL}/functions/v1/admin-assistance`, {
      method: 'POST', headers: SUPABASE_HEADERS, keepalive: true,
      body: JSON.stringify({
        action: 'close', user_id: user.id, web_session_token: user.web_session_token,
        admin_access_token: adminAccessToken, assistance_token: assistanceToken,
      }),
    })
  }, [adminAccessToken, assistanceToken, user.id, user.web_session_token])

  return (
    <section className="rounded-2xl border border-violet-400/20 bg-violet-400/[0.055] p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/10 text-violet-200">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-200">Mode Assistance</p>
          <h2 className="mt-1 text-lg font-black text-white">Consulter un dossier sans usurper le compte</h2>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
            Accès en lecture seule, limité à 15 minutes et journalisé. Aucun code OTP client, aucun jeton, mot de passe ou contrôle du compte n’est exposé.
          </p>
        </div>
      </div>

      {!snapshot ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && void search()} placeholder="Email ou nom utilisateur" className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-600" />
            <input value={reason} onChange={event => setReason(event.target.value.slice(0, 500))} placeholder="Motif précis de la consultation" className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-600" />
          </div>
          <button type="button" onClick={() => void search()} disabled={busy === 'search' || query.trim().length < 3} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-300 px-4 py-3 text-sm font-black text-slate-950 disabled:opacity-50">
            {busy === 'search' ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Rechercher
          </button>
          {users.length > 0 && (
            <div className="space-y-2 lg:col-span-2">
              {users.map(item => (
                <button key={item.id} type="button" onClick={() => setSelected(item)} className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${selected?.id === item.id ? 'border-violet-300/50 bg-violet-300/10' : 'border-white/10 bg-slate-950/45 hover:bg-white/[0.04]'}`}>
                  <div className="font-bold text-white">{item.email}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.subscription_plan ?? 'sans plan'} · échéance {formatDate(item.custom_plan_expires_at ?? item.subscription_expires_at)}</div>
                </button>
              ))}
              <button type="button" onClick={() => void open()} disabled={!selected || reason.trim().length < 10 || busy === 'open'} className="inline-flex items-center gap-2 rounded-xl border border-violet-300/25 bg-violet-300/15 px-4 py-3 text-sm font-black text-violet-100 disabled:opacity-50">
                {busy === 'open' ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Ouvrir en lecture seule
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.06] px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-100"><Clock3 size={16} /> Lecture seule · expire dans {expiresInMinutes} min</div>
            <button type="button" onClick={() => void close()} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-slate-300"><Square size={13} /> Fermer</button>
          </div>
          <div className="grid gap-3 xl:grid-cols-[0.85fr_1.4fr_1fr]">
            <SnapshotCard title="Compte" rows={Object.entries(snapshot.user ?? {}).slice(0, 12)} />
            <RuntimeSessionsCard sessions={(snapshot.runtime_sessions ?? []).slice(0, 8)} />
            <PresetEventsCard events={(snapshot.preset_events ?? []).slice(0, 10)} />
          </div>
        </div>
      )}
      {message && <p className="mt-3 text-xs font-bold text-rose-200">{message}</p>}
    </section>
  )
}

function RuntimeSessionsCard({ sessions }: { sessions: Array<Record<string, unknown>> }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/55 p-4">
      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-300">Sessions Desktop</h3>
      <div className="mt-3 space-y-2">
        {sessions.length ? sessions.map((item, index) => (
          <details key={`${String(item.session_id ?? item.started_at)}-${index}`} className="group rounded-lg border border-white/[0.07] bg-white/[0.025] p-3">
            <summary className="cursor-pointer list-none text-xs font-bold text-slate-300 marker:hidden">
              <span className="block text-violet-200">{formatDate(item.started_at)}</span>
              <span className="mt-1 block font-medium text-slate-500">
                {String(item.market ?? '—')} · {String(item.stop_reason ?? (item.stopped_at ? 'arrêté' : 'en cours'))}
              </span>
            </summary>
            <dl className="mt-3 grid gap-2 border-t border-white/[0.06] pt-3 sm:grid-cols-2">
              <AuditValue label="Plan" value={item.plan_tier} />
              <AuditValue label="Preset signé" value={item.preset_id ? `${String(item.preset_id)} · r${String(item.preset_revision ?? '—')}` : 'Aucun'} />
              <AuditValue label="Equity au départ" value={item.initial_equity_usd} />
              <AuditValue label="Equity à l’arrêt" value={item.final_equity_usd} />
              <AuditValue label="Profit réalisé final" value={item.final_realized_profit_usd} />
              <AuditValue label="Profit flottant final" value={item.final_floating_profit_usd} />
              <AuditValue label="Positions à l’arrêt" value={item.open_positions_at_stop} />
              <AuditValue label="Arrêt" value={formatDate(item.stopped_at)} />
            </dl>
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600">Configuration exacte au lancement</p>
            <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3 text-[10px] leading-5 text-slate-400">{safeJson(item.config_snapshot)}</pre>
          </details>
        )) : <div className="text-xs text-slate-600">Aucune session enregistrée.</div>}
      </div>
    </div>
  )
}

function PresetEventsCard({ events }: { events: Array<Record<string, unknown>> }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/55 p-4">
      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-300">Utilisation des presets</h3>
      <div className="mt-3 space-y-2">
        {events.length ? events.map((item, index) => (
          <div key={`${String(item.id ?? item.created_at)}-${index}`} className="rounded-lg border border-white/[0.07] px-3 py-2">
            <div className="text-xs font-bold text-slate-300">{String(item.event_type ?? '—')} · révision {String(item.revision ?? '—')}</div>
            <div className="mt-1 text-[10px] text-slate-600">{formatDate(item.created_at)} · capital {String(item.reported_equity_usd ?? 'non disponible')}</div>
            {item.refusal_code ? <div className="mt-1 text-[10px] font-bold text-rose-300">Refus : {String(item.refusal_code)}</div> : null}
          </div>
        )) : <div className="text-xs text-slate-600">Aucun événement preset.</div>}
      </div>
    </div>
  )
}

function AuditValue({ label, value }: { label: string; value: unknown }) {
  return (
    <div>
      <dt className="text-[9px] font-black uppercase tracking-[0.1em] text-slate-600">{label}</dt>
      <dd className="mt-0.5 break-all text-[11px] text-slate-300">{String(value ?? '—')}</dd>
    </div>
  )
}

function safeJson(value: unknown) {
  try {
    return JSON.stringify(value ?? {}, null, 2)
  } catch {
    return '{}'
  }
}

function SnapshotCard({ title, rows }: { title: string; rows: Array<[string, unknown]> }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/55 p-4">
      <h3 className="text-xs font-black uppercase tracking-[0.15em] text-slate-300">{title}</h3>
      <dl className="mt-3 space-y-2">
        {rows.length ? rows.map(([label, value], index) => (
          <div key={`${label}-${index}`} className="border-b border-white/[0.06] pb-2 last:border-0">
            <dt className="truncate text-[10px] font-bold text-slate-600">{String(label).replaceAll('_', ' ')}</dt>
            <dd className="mt-0.5 break-words text-xs text-slate-300">{typeof value === 'object' ? JSON.stringify(value) : String(value ?? '—')}</dd>
          </div>
        )) : <div className="text-xs text-slate-600">Aucune donnée.</div>}
      </dl>
    </div>
  )
}
