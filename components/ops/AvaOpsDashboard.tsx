'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity, AlertTriangle, Check, CheckCircle2, ClipboardList, Clock3,
  FileClock, Loader2, LockKeyhole, LogOut, Plus, RefreshCw,
  ShieldCheck, UserPlus, Users, X, XCircle,
} from 'lucide-react'
import type { UserData } from '@/components/app/types'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '@/components/app/constants'
import { supabaseAuth } from '@/components/app/services/supabaseAuth'

type Operator = {
  user_id: string
  display_name: string
  ops_role: 'owner' | 'admin' | 'operator' | 'auditor'
  permissions: string[]
  active: boolean
  mfa_required: boolean
  granted_at?: string
  revoked_at?: string | null
}

type OpsRequest = {
  id: string
  request_type: string
  title: string
  reason: string
  target_user_id?: string | null
  target_email_normalized?: string | null
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  status: string
  requires_approval: boolean
  requested_by: string
  requested_at: string
  approved_by?: string | null
  executed_by?: string | null
  executed_by_label?: string | null
  execution_finished_at?: string | null
  result?: Record<string, unknown>
  error_code?: string | null
}

type AuditEvent = {
  id: number
  request_id?: string | null
  actor_user_id?: string | null
  actor_role?: string | null
  event_type: string
  previous_status?: string | null
  new_status?: string | null
  target_user_id?: string | null
  details?: Record<string, unknown>
  occurred_at: string
}

type Bootstrap = {
  operator: Operator
  requests: OpsRequest[]
  audit_events: AuditEvent[]
  operators: Operator[]
}

const requestTypes = [
  ['user_access_diagnosis', 'Diagnostic accès utilisateur'],
  ['subscription_extension', 'Prolongation abonnement'],
  ['account_reactivation', 'Réactivation de compte'],
  ['incident_review', 'Investigation sécurité'],
  ['deployment', 'Demande de déploiement'],
  ['other', 'Autre intervention'],
] as const

const rolePermissions: Record<string, string[]> = {
  admin: ['requests.read', 'requests.create', 'requests.approve', 'users.read', 'audit.read', 'deployments.request'],
  operator: ['requests.read', 'requests.create', 'users.read'],
  auditor: ['requests.read', 'audit.read'],
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('fr-FR') : '—'
}

const statusLabel: Record<string, string> = {
  pending: 'En attente', needs_approval: 'À approuver', approved: 'Approuvée',
  running: 'En cours', succeeded: 'Terminée', failed: 'Échec', rejected: 'Rejetée',
  cancelled: 'Annulée',
}

export function AvaOpsDashboard({ user, onLogout }: { user: UserData; onLogout: () => Promise<void> }) {
  const [data, setData] = useState<Bootstrap | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'requests' | 'audit' | 'team'>('requests')
  const [requestType, setRequestType] = useState('user_access_diagnosis')
  const [targetEmail, setTargetEmail] = useState('')
  const [title, setTitle] = useState('Diagnostic d’accès utilisateur')
  const [reason, setReason] = useState('Diagnostic demandé par le service client Ava.')
  const [showCreate, setShowCreate] = useState(false)
  const [operatorEmail, setOperatorEmail] = useState('')
  const [operatorName, setOperatorName] = useState('')
  const [operatorRole, setOperatorRole] = useState<'admin' | 'operator' | 'auditor'>('operator')

  const call = useCallback(async (payload: Record<string, unknown>) => {
    const { data: sessionData } = await supabaseAuth.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (!accessToken) throw new Error('Session Supabase expirée. Reconnectez-vous.')
    const response = await fetch(`${SUPABASE_URL}/functions/v1/ava-ops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ ...payload, web_session_token: user.web_session_token }),
    })
    const result = await response.json().catch(() => ({})) as Record<string, unknown>
    if (!response.ok || result.ok === false) {
      const code = String(result.error ?? `HTTP ${response.status}`)
      if (code === 'MFA_AAL2_REQUIRED') throw new Error('Une reconnexion avec le code TOTP est obligatoire pour Ava OPS.')
      if (code === 'OPS_ACCESS_DENIED') throw new Error('Ce compte ne possède pas d’accès Ava OPS.')
      if (code === 'SELF_APPROVAL_FORBIDDEN') throw new Error('Une autre personne doit approuver cette action sensible.')
      throw new Error(code)
    }
    return result
  }, [user.web_session_token])

  const refresh = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await call({ action: 'bootstrap' })
      setData({
        operator: result.operator as Operator,
        requests: (result.requests as OpsRequest[]) ?? [],
        audit_events: (result.audit_events as AuditEvent[]) ?? [],
        operators: (result.operators as Operator[]) ?? [],
      })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Ava OPS indisponible.')
    } finally {
      setLoading(false)
    }
  }, [call])

  useEffect(() => { void refresh() }, [refresh])

  const counts = useMemo(() => ({
    approval: data?.requests.filter(item => item.status === 'needs_approval').length ?? 0,
    running: data?.requests.filter(item => ['approved', 'running'].includes(item.status)).length ?? 0,
    completed: data?.requests.filter(item => item.status === 'succeeded').length ?? 0,
    operators: data?.operators.filter(item => item.active).length ?? 0,
  }), [data])

  const mutate = async (key: string, payload: Record<string, unknown>) => {
    setBusy(key)
    setError('')
    try {
      await call(payload)
      await refresh()
      return true
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Action indisponible.')
      return false
    } finally {
      setBusy('')
    }
  }

  const createRequest = async () => {
    const ok = await mutate('create', {
      action: 'create_request', request_type: requestType, target_email: targetEmail,
      title, reason,
    })
    if (ok) {
      setShowCreate(false)
      setTargetEmail('')
    }
  }

  const addOperator = async () => {
    const ok = await mutate('add-operator', {
      action: 'add_operator', email: operatorEmail, display_name: operatorName,
      ops_role: operatorRole, permissions: rolePermissions[operatorRole],
    })
    if (ok) {
      setOperatorEmail('')
      setOperatorName('')
    }
  }

  if (loading && !data) {
    return <div className="flex min-h-screen items-center justify-center bg-[#020617] text-slate-300"><Loader2 className="animate-spin" /></div>
  }

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#020617] px-4">
        <div className="max-w-lg rounded-3xl border border-rose-400/20 bg-white/[0.035] p-8 text-center">
          <LockKeyhole className="mx-auto text-rose-300" size={28} />
          <h1 className="mt-4 text-2xl font-black text-white">Ava OPS verrouillé</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">{error || 'Accès indisponible.'}</p>
          <button onClick={() => void onLogout()} className="mt-6 rounded-xl bg-rose-600 px-5 py-3 text-sm font-black text-white">Se reconnecter</button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-5%,rgba(244,63,94,0.13),transparent_70%)]" />
      <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#020617]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-300/20"><ShieldCheck size={23} /></div>
            <div><h1 className="text-xl font-black tracking-tight">Ava OPS</h1><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Operations & audit</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden rounded-xl border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-right sm:block">
              <div className="text-xs font-black text-white">{data.operator.display_name}</div>
              <div className="text-[10px] uppercase tracking-wider text-emerald-300">{data.operator.ops_role} · MFA</div>
            </div>
            <button onClick={() => void refresh()} aria-label="Actualiser" className="rounded-xl border border-white/[0.08] p-3 text-slate-400 hover:text-white"><RefreshCw size={17} className={loading ? 'animate-spin' : ''} /></button>
            <button onClick={() => void onLogout()} aria-label="Se déconnecter" className="rounded-xl border border-white/[0.08] p-3 text-slate-400 hover:text-rose-300"><LogOut size={17} /></button>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
        {error && <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/[0.07] px-4 py-3 text-sm font-bold text-rose-100"><AlertTriangle size={18} />{error}</div>}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric icon={Clock3} label="À approuver" value={counts.approval} tone="amber" />
          <Metric icon={Activity} label="En cours" value={counts.running} tone="violet" />
          <Metric icon={CheckCircle2} label="Terminées" value={counts.completed} tone="emerald" />
          <Metric icon={Users} label="Opérateurs actifs" value={counts.operators || (data.operator ? 1 : 0)} tone="rose" />
        </section>

        <nav className="mt-6 flex flex-wrap items-center gap-2 border-b border-white/[0.07] pb-3">
          <Tab active={tab === 'requests'} onClick={() => setTab('requests')} icon={ClipboardList} label="Demandes" />
          {data.operator.permissions.includes('audit.read') || data.operator.ops_role === 'owner' ? <Tab active={tab === 'audit'} onClick={() => setTab('audit')} icon={FileClock} label="Journal d’audit" /> : null}
          {data.operator.ops_role === 'owner' ? <Tab active={tab === 'team'} onClick={() => setTab('team')} icon={Users} label="Équipe" /> : null}
          {tab === 'requests' && data.operator.permissions.includes('requests.create') ? (
            <button onClick={() => setShowCreate(value => !value)} className="ml-auto inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-black text-white shadow-[0_8px_30px_rgba(225,29,72,.2)]"><Plus size={15} /> Nouvelle demande</button>
          ) : null}
        </nav>

        {tab === 'requests' && (
          <section className="mt-5 space-y-4">
            {showCreate && (
              <div className="rounded-3xl border border-rose-300/15 bg-white/[0.035] p-5 lg:p-6">
                <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-black">Nouvelle intervention</h2><p className="mt-1 text-xs text-slate-500">Les actions sensibles attendent l’approbation d’une autre personne.</p></div><button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-white"><X size={18} /></button></div>
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  <Field label="Type"><select value={requestType} onChange={event => { setRequestType(event.target.value); setTitle(requestTypes.find(item => item[0] === event.target.value)?.[1] ?? '') }} className="ops-input">{requestTypes.map(item => <option key={item[0]} value={item[0]}>{item[1]}</option>)}</select></Field>
                  <Field label="Utilisateur ciblé"><input value={targetEmail} onChange={event => setTargetEmail(event.target.value)} type="email" placeholder="utilisateur@email.com" className="ops-input" /></Field>
                  <Field label="Titre"><input value={title} onChange={event => setTitle(event.target.value)} maxLength={160} className="ops-input" /></Field>
                  <Field label="Motif précis"><input value={reason} onChange={event => setReason(event.target.value)} maxLength={2000} className="ops-input" /></Field>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4"><p className="text-[11px] text-slate-500">Diagnostic : lecture seule immédiate. Réactivation, prolongation et déploiement : approbation obligatoire.</p><button onClick={() => void createRequest()} disabled={busy === 'create' || title.length < 3 || reason.length < 10} className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-xs font-black disabled:opacity-40">{busy === 'create' ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Enregistrer</button></div>
              </div>
            )}

            <div className="grid gap-3">
              {data.requests.length ? data.requests.map(request => (
                <article key={request.id} className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4 transition hover:bg-white/[0.04] lg:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={request.status} /><RiskBadge risk={request.risk_level} /><span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">{request.request_type.replaceAll('_', ' ')}</span></div><h3 className="mt-2 font-black text-white">{request.title}</h3><p className="mt-1 break-all text-xs text-slate-500">{request.target_email_normalized || 'Aucune cible'} · demandé le {formatDate(request.requested_at)}</p></div>
                    {request.status === 'needs_approval' && data.operator.permissions.includes('requests.approve') && (
                      <div className="flex gap-2"><button onClick={() => void mutate(`approve-${request.id}`, { action: 'approve_request', request_id: request.id })} disabled={busy === `approve-${request.id}`} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400/12 px-3 py-2 text-xs font-black text-emerald-200 ring-1 ring-emerald-300/20"><Check size={14} /> Approuver</button><button onClick={() => void mutate(`reject-${request.id}`, { action: 'reject_request', request_id: request.id })} className="inline-flex items-center gap-1.5 rounded-xl bg-rose-400/10 px-3 py-2 text-xs font-black text-rose-200 ring-1 ring-rose-300/15"><X size={14} /> Rejeter</button></div>
                    )}
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{request.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-slate-600"><span>Demandeur : {shortId(request.requested_by)}</span><span>Approbateur : {shortId(request.approved_by)}</span><span>Exécutant : {request.executed_by_label || shortId(request.executed_by)}</span></div>
                  {(request.result && Object.keys(request.result).length > 0) || request.error_code ? <details className="mt-3 rounded-xl border border-white/[0.06] bg-slate-950/55 p-3"><summary className="cursor-pointer text-xs font-bold text-slate-300">Résultat détaillé</summary><pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-5 text-slate-400">{request.error_code || JSON.stringify(request.result, null, 2)}</pre></details> : null}
                </article>
              )) : <Empty icon={ClipboardList} text="Aucune demande OPS pour le moment." />}
            </div>
          </section>
        )}

        {tab === 'audit' && (
          <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.075] bg-white/[0.025]">
            <div className="border-b border-white/[0.06] px-5 py-4"><h2 className="font-black">Journal immuable</h2><p className="mt-1 text-xs text-slate-500">Qui a demandé, approuvé, exécuté ou révoqué une action.</p></div>
            <div className="divide-y divide-white/[0.055]">{data.audit_events.length ? data.audit_events.map(event => <div key={event.id} className="grid gap-2 px-5 py-4 text-xs md:grid-cols-[190px_1fr_150px]"><div className="text-slate-500">{formatDate(event.occurred_at)}</div><div><span className="font-black text-slate-200">{event.event_type.replaceAll('_', ' ')}</span><span className="ml-2 text-slate-600">{event.previous_status || '—'} → {event.new_status || '—'}</span></div><div className="text-slate-500">{event.actor_role || 'système'} · {shortId(event.actor_user_id)}</div></div>) : <Empty icon={FileClock} text="Aucun événement d’audit." />}</div>
          </section>
        )}

        {tab === 'team' && data.operator.ops_role === 'owner' && (
          <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.7fr]">
            <div className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-5"><div className="flex items-center gap-3"><UserPlus className="text-rose-300" size={20} /><div><h2 className="font-black">Ajouter une personne</h2><p className="text-xs text-slate-500">Compte individuel et TOTP obligatoires.</p></div></div><div className="mt-5 space-y-3"><Field label="E-mail du compte Ava"><input className="ops-input" type="email" value={operatorEmail} onChange={event => setOperatorEmail(event.target.value)} /></Field><Field label="Nom affiché"><input className="ops-input" value={operatorName} onChange={event => setOperatorName(event.target.value)} /></Field><Field label="Rôle"><select className="ops-input" value={operatorRole} onChange={event => setOperatorRole(event.target.value as typeof operatorRole)}><option value="operator">Opérateur</option><option value="auditor">Auditeur</option><option value="admin">Administrateur</option></select></Field><button onClick={() => void addOperator()} disabled={busy === 'add-operator' || !operatorEmail.includes('@')} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-xs font-black disabled:opacity-40">{busy === 'add-operator' ? <Loader2 size={15} className="animate-spin" /> : <UserPlus size={15} />} Accorder l’accès</button></div></div>
            <div className="space-y-3">{data.operators.map(item => <div key={item.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4"><div><div className="font-black text-white">{item.display_name}</div><div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">{item.ops_role} · {item.active ? 'actif' : 'révoqué'} · MFA obligatoire</div><div className="mt-2 text-[10px] text-slate-600">{item.permissions.join(' · ')}</div></div>{item.ops_role !== 'owner' ? <button onClick={() => void mutate(`operator-${item.user_id}`, { action: 'set_operator_active', target_user_id: item.user_id, active: !item.active })} className={`rounded-xl px-3 py-2 text-xs font-black ring-1 ${item.active ? 'bg-rose-400/10 text-rose-200 ring-rose-300/15' : 'bg-emerald-400/10 text-emerald-200 ring-emerald-300/15'}`}>{item.active ? 'Révoquer' : 'Réactiver'}</button> : <span className="rounded-lg bg-amber-400/10 px-3 py-2 text-[10px] font-black uppercase text-amber-200">Propriétaire</span>}</div>)}</div>
          </section>
        )}
      </div>
    </main>
  )
}

function Metric({ icon: Icon, label, value, tone }: { icon: typeof Activity; label: string; value: number; tone: 'amber' | 'violet' | 'emerald' | 'rose' }) {
  const tones = { amber: 'text-amber-200 bg-amber-300/10 ring-amber-300/15', violet: 'text-violet-200 bg-violet-300/10 ring-violet-300/15', emerald: 'text-emerald-200 bg-emerald-300/10 ring-emerald-300/15', rose: 'text-rose-200 bg-rose-300/10 ring-rose-300/15' }
  return <div className="rounded-2xl border border-white/[0.075] bg-white/[0.025] p-4"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${tones[tone]}`}><Icon size={17} /></div><div className="mt-4 text-3xl font-black tracking-tight text-white">{value}</div><div className="mt-1 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">{label}</div></div>
}

function Tab({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof Activity; label: string }) {
  return <button onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-xs font-black transition ${active ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-slate-200'}`}><Icon size={15} />{label}</button>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">{label}</span>{children}</label>
}

function StatusBadge({ status }: { status: string }) {
  const success = status === 'succeeded'; const failure = ['failed', 'rejected', 'cancelled'].includes(status); const approval = status === 'needs_approval'
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${success ? 'bg-emerald-300/10 text-emerald-200' : failure ? 'bg-rose-300/10 text-rose-200' : approval ? 'bg-amber-300/10 text-amber-200' : 'bg-violet-300/10 text-violet-200'}`}>{success ? <CheckCircle2 size={11} /> : failure ? <XCircle size={11} /> : <Clock3 size={11} />}{statusLabel[status] ?? status}</span>
}

function RiskBadge({ risk }: { risk: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${risk === 'critical' ? 'bg-red-500/15 text-red-200' : risk === 'high' ? 'bg-orange-400/10 text-orange-200' : risk === 'medium' ? 'bg-amber-300/10 text-amber-200' : 'bg-slate-300/10 text-slate-400'}`}>Risque {risk}</span>
}

function Empty({ icon: Icon, text }: { icon: typeof Activity; text: string }) {
  return <div className="flex flex-col items-center justify-center p-12 text-center text-slate-600"><Icon size={28} /><p className="mt-3 text-sm font-bold">{text}</p></div>
}

function shortId(value?: string | null) { return value ? `${value.slice(0, 8)}…` : '—' }
