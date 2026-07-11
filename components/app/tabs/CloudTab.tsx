'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  Coins,
  ExternalLink,
  LockKeyhole,
  Loader2,
  Monitor,
  Power,
  RefreshCcw,
  RotateCw,
  Settings2,
  ShieldCheck,
  Terminal,
} from 'lucide-react'
import { SUPABASE_HEADERS, SUPABASE_URL } from '../constants'
import type { UserData } from '../types'

type CloudState = 'inactive' | 'not_created' | 'provisioning' | 'configuring' | 'ready' | 'online' | 'attention' | 'suspended' | 'delayed'

type CloudEntitlement = {
  status?: string | null
  source?: string | null
  expires_at?: string | null
  amount?: number | null
  currency?: string | null
}

type CloudInstance = {
  id?: string | null
  user_id?: string | null
  created_at?: string | null
  updated_at?: string | null
  state?: string | null
  region?: string | null
  rdp_host?: string | null
  last_provision_attempt_at?: string | null
  last_heartbeat_at?: string | null
  ava_running?: boolean | null
  mt5_connected?: boolean | null
  bridge_connected?: boolean | null
  ava_version?: string | null
  bridge_version?: string | null
  agent_version?: string | null
  active_market?: string | null
  balance?: number | null
  equity?: number | null
  floating_profit?: number | null
  positions_count?: number | null
  last_error?: string | null
  metrics?: Record<string, unknown> | null
}

type CloudEvent = {
  level?: string | null
  type?: string | null
  message?: string | null
  created_at?: string | null
}

type CloudStatus = {
  ok: boolean
  state: CloudState
  price?: number
  currency?: string
  browser_access_ready?: boolean
  entitlement?: CloudEntitlement | null
  instance?: CloudInstance | null
  events?: CloudEvent[]
  cloud_config?: CloudConfig | null
  cloud_config_source?: string | null
  cloud_config_updated_at?: string | null
  cloud_presets?: CloudPreset[]
  plan_limits?: CloudPlanLimits | null
  runtime?: CloudRuntime | null
  agent_connected?: boolean
  error?: string
}

type CloudConfig = {
  market?: string
  execution?: string
  lot?: number
  minProfit?: number
  takeProfitPips?: number
  initialCapital?: number
  scalpWindow?: string
  maxHoldSeconds?: number
  sessionProfitTarget?: number
  maxProfitGiveback?: number
  maxOpenPositions?: number
  maxTradesPerHour?: number
  boomBurstEnabled?: boolean
  boomReboundBuyEnabled?: boolean
  boomReboundMaxOpen?: number
  boomReboundLot?: number
  boomReboundFirstCandles?: number
  boomReboundEveryCandles?: number
  boomReboundMinProfit?: number
  boomReboundLevelsEnabled?: boolean
  boomReboundLevels?: Array<{ afterBuys?: number; everyMinutes?: number }>
  boomReboundSessionLimitEnabled?: boolean
  boomReboundSessionMaxBuys?: number
  boomVertexTopGuardEnabled?: boolean
  dynamicLot?: boolean
  riskPerTradePct?: number
  minLot?: number
  maxLot?: number
  brokerTakeProfit?: boolean
  allowLive?: boolean
  autoEntry?: boolean
  manageManualPositions?: boolean
  preventSleep?: boolean
  autoRecalculateCapital?: boolean
  nightPauseEnabled?: boolean
}

type CloudPreset = {
  id?: string
  name?: string
  config?: CloudConfig
  updated_at?: string
}

type CloudPlanLimits = {
  key?: string
  label?: string
  lotMax?: number
  maxOpenPositions?: number
  maxTradesPerHour?: number
  sessionTargetMax?: number
  givebackMax?: number
  canUseBurstSell?: boolean
  canUseReboundBuy?: boolean
  canUseVertex?: boolean
  canUseDynamicLot?: boolean
  canUseManualPositions?: boolean
  maxPresets?: number
}

type CloudRuntime = {
  positions?: Array<Record<string, unknown>>
  recent_trades?: Array<Record<string, unknown>>
  journal?: string[]
  account?: Record<string, unknown> | null
  desktop?: Record<string, unknown> | null
  last_command?: Record<string, unknown> | null
  agent_connected?: boolean
  config_source?: string | null
  config_updated_at?: string | null
  config_pending?: boolean
  desktop_status?: Record<string, unknown> | null
}

type TradingGlobalControl = {
  block_all_entries?: boolean | null
  block_below_equity_enabled?: boolean | null
  min_equity_usd?: number | null
  public_reason?: string | null
  updated_at?: string | null
}

type SupportUser = {
  id?: string
  email?: string | null
  subscription_plan?: string | null
  subscription_source?: string | null
  instance?: CloudInstance & { id?: string; user_id?: string; desktop?: Record<string, unknown> | null; account?: Record<string, unknown> | null }
  entitlement?: CloudEntitlement | null
}

type SupportCommand = {
  id?: string
  type?: string
  status?: string
  result?: Record<string, unknown> | null
  error?: string | null
  created_at?: string | null
  updated_at?: string | null
}

const STATUS_COPY: Record<CloudState, { label: string; detail: string; color: string }> = {
  inactive: { label: 'Non activé', detail: 'Activez votre accès 24/7 pour créer votre ordinateur Ava Cloud.', color: '#94a3b8' },
  not_created: { label: 'Prêt à configurer', detail: 'Votre accès est actif. Lancez la configuration automatique.', color: '#38bdf8' },
  provisioning: { label: 'Configuration', detail: 'Ava prépare votre environnement Ava sécurisé. Cette étape peut prendre jusqu’à 10 minutes.', color: '#f59e0b' },
  configuring: { label: 'Configuration', detail: 'Ava prépare votre environnement Ava sécurisé. Cette étape peut prendre jusqu’à 10 minutes.', color: '#f59e0b' },
  ready: { label: 'Prêt', detail: 'Votre ordinateur Ava Cloud est disponible.', color: '#22c55e' },
  online: { label: 'En ligne', detail: 'Ava tourne dans votre environnement 24/7.', color: '#22c55e' },
  attention: { label: 'Attention requise', detail: 'Ava ne reçoit plus de signal récent. Ouvrez l’accès ou relancez les services.', color: '#fb7185' },
  suspended: { label: 'Suspendu', detail: 'Votre accès 24/7 est suspendu ou expiré.', color: '#f43f5e' },
  delayed: { label: 'Configuration retardée', detail: 'La préparation automatique demande une intervention support.', color: '#f59e0b' },
}

const ACTIONS = [
  { type: 'start_ava', label: 'Démarrer Ava', icon: Power },
  { type: 'stop_ava', label: 'Arrêter Ava', icon: Power },
  { type: 'restart_mt5', label: 'Redémarrer MT5', icon: RotateCw },
  { type: 'restart_ava', label: 'Redémarrer Ava', icon: RefreshCcw },
  { type: 'apply_config', label: 'Appliquer configuration', icon: Settings2 },
  { type: 'update_ava', label: 'Mettre à jour Ava', icon: RefreshCcw },
]

const MARKET_OPTIONS = ['Boom 1000 Index', 'Boom 500 Index', 'Boom 300 Index', 'Volatility 75 Index', 'Crash 1000 Index']
const SCALP_WINDOWS = ['1s', '5s', '15s', '1m', '5m']
const EXECUTION_OPTIONS = [
  { value: 'bridge', label: 'EA Bridge' },
  { value: 'deriv-demo', label: 'Deriv Demo' },
]

const CLOUD_PRICE = 390
const CLOUD_CURRENCY = 'EUR'

function defaultConfig(): CloudConfig {
  return {
    market: 'Boom 1000 Index',
    execution: 'bridge',
    lot: 0.2,
    minProfit: 0.2,
    takeProfitPips: 10,
    scalpWindow: '1s',
    maxHoldSeconds: 4500,
    sessionProfitTarget: 25,
    maxProfitGiveback: 25,
    maxOpenPositions: 10,
    maxTradesPerHour: 300,
    boomBurstEnabled: false,
    boomReboundBuyEnabled: true,
    boomReboundMaxOpen: 10,
    boomReboundLot: 0.2,
    boomReboundFirstCandles: 2,
    boomReboundEveryCandles: 3,
    boomReboundMinProfit: 0.01,
    boomReboundLevelsEnabled: true,
    boomReboundSessionLimitEnabled: false,
    boomReboundSessionMaxBuys: 25,
    boomVertexTopGuardEnabled: false,
    dynamicLot: false,
    riskPerTradePct: 0.35,
    minLot: 0.2,
    maxLot: 0.2,
    brokerTakeProfit: true,
    allowLive: false,
    autoEntry: true,
    manageManualPositions: false,
    preventSleep: true,
    autoRecalculateCapital: false,
    nightPauseEnabled: false,
  }
}

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function formatCell(value: unknown) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 4 })
  return String(value)
}

function isCloudEligible(user: UserData) {
  const plan = String(user.subscription_plan ?? '').toLowerCase()
  const customActive = user.custom_plan_expires_at && new Date(user.custom_plan_expires_at) > new Date()
  const subscriptionActive = user.subscription_expires_at && new Date(user.subscription_expires_at) > new Date()
  return ['custom_pro', 'custom_ultra', 'custom_max'].includes(plan) && (customActive || subscriptionActive)
}

function formatDate(value?: string | null) {
  if (!value) return 'Non disponible'
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function metric(value?: number | null, prefix = '') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return `${prefix}${Number(value).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}`
}

function latestEventDate(events: CloudEvent[] | undefined, type: string) {
  const dates = (events ?? [])
    .filter((event) => event.type === type && event.created_at)
    .map((event) => new Date(String(event.created_at)).getTime())
    .filter(Number.isFinite)
  return dates.length ? Math.max(...dates) : 0
}

function setupStartedAt(instance: CloudInstance | null | undefined, events: CloudEvent[] | undefined) {
  return latestEventDate(events, 'provision_started')
    || (instance?.last_provision_attempt_at ? new Date(instance.last_provision_attempt_at).getTime() : 0)
    || (instance?.created_at ? new Date(instance.created_at).getTime() : 0)
    || Date.now()
}

function setupProgress(startedAt: number, now: number) {
  const tenMinutes = 10 * 60 * 1000
  const elapsed = Math.max(0, now - startedAt)
  return Math.max(8, Math.min(96, Math.round((elapsed / tenMinutes) * 100)))
}

function Pill({ active, label }: { active?: boolean | null; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold"
      style={{
        color: active ? '#86efac' : '#fda4af',
        background: active ? 'rgba(34,197,94,0.1)' : 'rgba(244,63,94,0.1)',
        borderColor: active ? 'rgba(34,197,94,0.18)' : 'rgba(244,63,94,0.18)',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: active ? '#22c55e' : '#f43f5e' }} />
      {label}
    </span>
  )
}

export function CloudTab({ user, onGoToSubscription, onSessionExpired }: { user: UserData; onGoToSubscription?: () => void; onSessionExpired?: () => void }) {
  const eligible = useMemo(() => isCloudEligible(user), [user])
  const [data, setData] = useState<CloudStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [cloudConfig, setCloudConfig] = useState<CloudConfig>(() => defaultConfig())
  const [presetName, setPresetName] = useState('Preset 1')
  const [naturalCommand, setNaturalCommand] = useState('')
  const [adminControl, setAdminControl] = useState<TradingGlobalControl | null>(null)
  const [adminLoaded, setAdminLoaded] = useState(false)
  const [supportQuery, setSupportQuery] = useState('')
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([])
  const [supportSelected, setSupportSelected] = useState<SupportUser | null>(null)
  const [supportCommands, setSupportCommands] = useState<SupportCommand[]>([])
  const [supportShell, setSupportShell] = useState('Get-Process -Name Ava,terminal64 -ErrorAction SilentlyContinue | Select-Object ProcessName,Id,StartTime | ConvertTo-Json')
  const autoProvisionStartedRef = useRef(false)
  const isLocalDevAdmin = useMemo(() => {
    if (process.env.NODE_ENV !== 'development' || user.is_admin !== true) return false
    if (typeof window === 'undefined') return false
    return ['localhost', '127.0.0.1'].includes(window.location.hostname)
  }, [user.is_admin])

  const callCloud = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ava-cloud`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ user_id: user.id, web_session_token: user.web_session_token, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Action indisponible.')
    if (res.status === 401 || message.toLowerCase().includes('session ava web expiree') || message.toLowerCase().includes('session ava web expirée')) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [onSessionExpired, user.id, user.web_session_token])

  const callAdminControl = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/trading-admin-control`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ user_id: user.id, web_session_token: user.web_session_token, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Controle admin indisponible.')
    if (res.status === 401 || message.toLowerCase().includes('session ava web expiree') || message.toLowerCase().includes('session ava web expirée')) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [onSessionExpired, user.id, user.web_session_token])

  const callCloudSupport = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/ava-cloud-support`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ user_id: user.id, web_session_token: user.web_session_token, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Support Ava Cloud indisponible.')
    if (res.status === 401 || message.toLowerCase().includes('session ava web expiree') || message.toLowerCase().includes('session ava web expirée')) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [onSessionExpired, user.id, user.web_session_token])

  const load = useCallback(async (showBusy = false) => {
    if (!eligible) {
      setLoading(false)
      return
    }
    try {
      if (showBusy) setBusy('refresh')
      setError(null)
      const status = await callCloud({ action: 'status' })
      setData(status as CloudStatus)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Statut indisponible.')
    } finally {
      setLoading(false)
      if (showBusy) setBusy(null)
    }
  }, [callCloud, eligible])

  useEffect(() => {
    load()
    if (!eligible) return undefined
    const timer = window.setInterval(load, 15000)
    return () => window.clearInterval(timer)
  }, [eligible, load])

  useEffect(() => {
    if (!isLocalDevAdmin) return
    let active = true
    callAdminControl({ action: 'status' })
      .then((result) => {
        if (!active) return
        setAdminControl(result.control ?? null)
      })
      .catch((err) => {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Controle admin indisponible.')
      })
      .finally(() => {
        if (active) setAdminLoaded(true)
      })
    return () => {
      active = false
    }
  }, [callAdminControl, isLocalDevAdmin])

  const run = useCallback(async (name: string, payload: Record<string, unknown>, after?: (result: Record<string, unknown>) => void) => {
    try {
      setBusy(name)
      setError(null)
      const result = await callCloud(payload)
      after?.(result)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action impossible.')
    } finally {
      setBusy(null)
    }
  }, [callCloud, load])

  const state = data?.state ?? 'inactive'
  const status = STATUS_COPY[state] ?? STATUS_COPY.inactive
  const instance = data?.instance
  const runtime = data?.runtime
  const entitlement = data?.entitlement
  const browserAccessReady = data?.browser_access_ready === true
  const heartbeatTime = instance?.last_heartbeat_at ? Date.parse(instance.last_heartbeat_at) : Number.NaN
  const hasHeartbeat = Number.isFinite(heartbeatTime)
  const heartbeatRecent = hasHeartbeat && now - heartbeatTime <= 4 * 60 * 1000
  const agentConnected = Boolean(data?.agent_connected ?? runtime?.agent_connected ?? heartbeatRecent)
  const agentStale = hasHeartbeat && !agentConnected
  const configSource = data?.cloud_config_source ?? runtime?.config_source ?? null
  const configUpdatedAt = data?.cloud_config_updated_at ?? runtime?.config_updated_at ?? null
  const configPending = Boolean(runtime?.config_pending || instance?.metrics?.cloud_config_pending)
  const livePositions = agentConnected && Array.isArray(runtime?.positions) ? runtime.positions : []
  const recentTrades = agentConnected && Array.isArray(runtime?.recent_trades) ? runtime.recent_trades : []
  const journalLines = agentConnected && Array.isArray(runtime?.journal) ? runtime.journal : []
  const bridgeVersion = String(instance?.bridge_version ?? '').replace(/^v/i, '')
  const bridgeVersionNumber = Number.parseFloat(bridgeVersion)
  const bridgeOutdated = agentConnected && instance?.bridge_version && Number.isFinite(bridgeVersionNumber) && bridgeVersionNumber < 1.42
  const canRunCommands = agentConnected && (state === 'ready' || state === 'online' || state === 'attention')
  const canOpen = browserAccessReady && (state === 'ready' || state === 'online' || state === 'attention')
  const canProvision = state === 'not_created' || state === 'delayed'
  const isConfiguring = state === 'provisioning' || state === 'configuring'
  const progressStartedAt = setupStartedAt(instance, data?.events)
  const progress = isConfiguring ? setupProgress(progressStartedAt, now) : 0
  const provisionStartedAt = latestEventDate(data?.events, 'provision_started')
  const visibleEvents = useMemo(() => {
    const events = data?.events ?? []
    if (!provisionStartedAt) return events
    const recent = events.filter((event) => {
      const eventTime = event.created_at ? new Date(event.created_at).getTime() : 0
      return eventTime >= provisionStartedAt || event.type !== 'provision_delayed'
    })
    return recent.length ? recent : events
  }, [data?.events, provisionStartedAt])
  const updateConfig = useCallback((patch: Partial<CloudConfig>) => {
    setCloudConfig(current => ({ ...current, ...patch }))
  }, [])
  const updateAdminControl = useCallback((patch: Partial<TradingGlobalControl>) => {
    setAdminControl(current => ({ ...(current ?? { min_equity_usd: 10000 }), ...patch }))
  }, [])
  const runSupportSearch = useCallback(async () => {
    try {
      setBusy('support_search')
      setError(null)
      const result = await callCloudSupport({ action: 'search', email: supportQuery })
      const users = Array.isArray(result.users) ? result.users as SupportUser[] : []
      setSupportUsers(users)
      setSupportSelected(users[0] ?? null)
      setSupportCommands([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recherche support impossible.')
    } finally {
      setBusy(null)
    }
  }, [callCloudSupport, supportQuery])
  const refreshSupportStatus = useCallback(async (selected = supportSelected) => {
    const instanceId = selected?.instance?.id
    if (!instanceId) return
    try {
      setBusy('support_status')
      setError(null)
      const result = await callCloudSupport({ action: 'status', instance_id: instanceId })
      setSupportSelected(current => current ? { ...current, instance: result.instance ?? current.instance } : current)
      setSupportCommands(Array.isArray(result.commands) ? result.commands as SupportCommand[] : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Statut support impossible.')
    } finally {
      setBusy(null)
    }
  }, [callCloudSupport, supportSelected])
  const runSupportCommand = useCallback(async (type: string, payload: Record<string, unknown> = {}) => {
    const instanceId = supportSelected?.instance?.id
    if (!instanceId) return
    try {
      setBusy(`support_${type}`)
      setError(null)
      await callCloudSupport({ action: 'command', instance_id: instanceId, type, payload })
      await refreshSupportStatus(supportSelected)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commande support impossible.')
    } finally {
      setBusy(null)
    }
  }, [callCloudSupport, refreshSupportStatus, supportSelected])
  const planLimits = data?.plan_limits
  const presets = data?.cloud_presets ?? []

  useEffect(() => {
    if (!eligible || state !== 'not_created' || entitlement?.status !== 'active' || autoProvisionStartedRef.current) return
    autoProvisionStartedRef.current = true
    run('provision', { action: 'provision', region: 'auto' })
  }, [eligible, entitlement?.status, run, state])

  useEffect(() => {
    if (!isConfiguring) return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [isConfiguring])

  useEffect(() => {
    if (data?.cloud_config) setCloudConfig({ ...defaultConfig(), ...data.cloud_config })
  }, [data?.cloud_config])

  if (!eligible) {
    return (
      <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8">
        <div className="mx-auto flex min-h-full w-full max-w-5xl items-center justify-center">
          <section className="w-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 lg:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
              <ShieldCheck size={24} />
            </div>
            <h1 className="mt-5 text-2xl font-black text-white">Ava Cloud</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              L’accès 24/7 est réservé aux plans Custom Pro, Custom Ultra et Custom Max. Passez sur un plan compatible pour préparer votre ordinateur Ava Cloud.
            </p>
            <button
              type="button"
              onClick={onGoToSubscription}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-rose-400"
            >
              Voir les plans
            </button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-8 lg:py-7">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300">
                <Cloud size={23} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-300">Accès 24/7</p>
                <h1 className="text-2xl font-black text-white">Ava Cloud</h1>
              </div>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
              Un ordinateur Ava Cloud isolé, préparé pour Ava Desktop, MT5 et AvaBridge. Vous connectez votre compte MT5 une seule fois, puis vous pilotez Ava depuis ce tableau de bord.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Option séparée</p>
            <p className="mt-1 text-2xl font-black text-white">{data?.price ?? CLOUD_PRICE} €<span className="text-sm text-slate-500">/mois</span></p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">{data?.currency?.toUpperCase() ?? CLOUD_CURRENCY}</p>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
            <AlertCircle className="mt-0.5 flex-shrink-0" size={18} />
            <span>{error}</span>
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Statut</p>
                <div className="mt-2 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: status.color, boxShadow: `0 0 18px ${status.color}` }} />
                  <h2 className="text-xl font-black text-white">{loading ? 'Chargement' : status.label}</h2>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-400">{status.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => load(true)}
                disabled={busy === 'refresh'}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-white/[0.08] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
              >
                {busy === 'refresh' ? <Loader2 className="animate-spin" size={15} /> : <RefreshCcw size={15} />}
                {busy === 'refresh' ? 'Actualisation...' : 'Actualiser'}
              </button>
            </div>

            {isConfiguring && (
              <div className="mt-5 overflow-hidden rounded-2xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-black text-amber-100">Préparation de votre ordinateur Ava Cloud</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Création de la machine, démarrage Windows, installation des services Ava. Cela peut prendre jusqu’à 10 minutes, parfois moins.
                    </p>
                  </div>
                  <span className="text-2xl font-black text-white">{progress}%</span>
                </div>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-950/80">
                  <div
                    className="relative h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-emerald-400 transition-all duration-700"
                    style={{ width: `${progress}%` }}
                  >
                    <span className="absolute inset-0 animate-pulse bg-white/25" />
                  </div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    ['1', 'Machine demandée'],
                    ['2', 'Windows démarre'],
                    ['3', 'Ava se connecte'],
                  ].map(([step, label], index) => {
                    const active = progress >= [12, 45, 78][index]
                    return (
                      <div key={label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-black ${active ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-slate-400'}`}>
                          {step}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Pill active={instance?.ava_running} label="Ava connecté" />
              <Pill active={instance?.mt5_connected} label="MT5 connecté" />
              <Pill active={instance?.bridge_connected} label="AvaBridge connecté" />
            </div>

            {state === 'ready' && !hasHeartbeat && (
              <div className="mt-5 rounded-2xl border border-sky-400/15 bg-sky-400/[0.06] p-4">
                <p className="text-sm font-black text-sky-100">Agent en attente</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  L’ordinateur Ava Cloud est créé. Windows termine le démarrage et l’agent Ava va envoyer son premier signal ; les données réelles s’afficheront ensuite.
                </p>
              </div>
            )}

            {state === 'ready' && agentStale && (
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-4">
                <p className="text-sm font-black text-amber-100">Agent non connecté</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Dernier signal reçu le {formatDate(instance?.last_heartbeat_at)}. Les positions, trades, versions et configurations affichés peuvent être incomplets tant que l’agent ne répond pas.
                </p>
              </div>
            )}

            {bridgeOutdated && (
              <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/[0.08] p-4">
                <p className="text-sm font-black text-amber-100">AvaBridge version ancienne</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  AvaBridge {instance?.bridge_version} est détecté. La version recommandée est 1.42 ou plus pour une synchronisation fiable des positions.
                </p>
              </div>
            )}

            {configPending && (
              <div className="mt-5 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/[0.08] p-4">
                <p className="text-sm font-black text-fuchsia-100">Configuration envoyée à Ava Desktop</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Ava Web attend la confirmation de l’agent. La configuration sera marquée synchronisée au prochain heartbeat Desktop.
                </p>
              </div>
            )}

            {agentConnected && !configPending && configSource && (
              <div className="mt-5 rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
                <p className="text-sm font-black text-emerald-100">
                  Configuration synchronisée depuis {configSource === 'desktop' ? 'Ava Desktop' : 'Ava Web'}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Dernière mise à jour: {formatDate(configUpdatedAt)}.
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Marché actif', agentConnected ? instance?.active_market || '—' : 'Agent non connecté'],
                ['Balance', agentConnected ? metric(instance?.balance, '$') : '—'],
                ['Equity', agentConnected ? metric(instance?.equity, '$') : '—'],
                ['Profit flottant', agentConnected ? metric(instance?.floating_profit, '$') : '—'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <p className="mt-2 text-lg font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Activation</p>
            <h2 className="mt-2 text-xl font-black text-white">Votre accès Ava Cloud</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {entitlement?.status === 'active'
                ? `Actif jusqu’au ${formatDate(entitlement.expires_at)}`
                : 'Activez Ava Cloud via Whop ou crypto pour lancer la configuration automatique.'}
            </p>

            {entitlement?.status !== 'active' ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => run('whop', { action: 'checkout_whop' }, (result) => {
                    const url = String(result.redirect_url ?? '')
                    if (url) window.location.href = url
                  })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-rose-400 disabled:opacity-60"
                >
                  {busy === 'whop' ? <Loader2 className="animate-spin" size={17} /> : <CheckCircle2 size={17} />}
                  Payer par carte avec Whop
                </button>
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={() => run('crypto', { action: 'checkout_crypto' }, (result) => {
                    const url = String(result.invoice_url ?? '')
                    if (url) window.location.href = url
                  })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-white/[0.08] disabled:opacity-60"
                >
                  {busy === 'crypto' ? <Loader2 className="animate-spin" size={17} /> : <Coins size={17} />}
                  Payer en crypto
                </button>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {canProvision && (
                  <button
                    type="button"
                    disabled={!!busy}
                    onClick={() => run('provision', { action: 'provision', region: 'auto' })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-black text-white transition-all hover:bg-rose-400 active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
                  >
                    {busy === 'provision' ? <Loader2 className="animate-spin" size={17} /> : <Monitor size={17} />}
                    Configurer mon Ava Cloud
                  </button>
                )}
                <button
                  type="button"
                  disabled={!canOpen || !!busy}
                  onClick={() => run('browser', { action: 'browser_session' }, (result) => {
                    const url = String(result.url ?? '')
                    if (url) window.open(url, '_blank', 'noopener,noreferrer')
                  })}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-black text-emerald-100 transition-all hover:bg-emerald-400/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === 'browser' ? <Loader2 className="animate-spin" size={17} /> : <ExternalLink size={17} />}
                  {browserAccessReady ? 'Ouvrir mon Ava Cloud' : 'Accès navigateur en préparation'}
                </button>
                {!browserAccessReady && state === 'ready' && (
                  <p className="text-xs leading-5 text-slate-500">
                    Votre ordinateur Ava Cloud est créé. L’ouverture depuis le navigateur est en cours d’activation côté Ava ; aucune action n’est nécessaire de votre côté.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {isLocalDevAdmin && (
          <section className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.06] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
                  <Terminal size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">Support local</p>
                  <h2 className="mt-1 text-lg font-black text-white">Diagnostic machines Ava Cloud</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Recherche par email, diagnostic agent, redémarrages et mises à jour sans ouvrir la session Cloud utilisateur.
                  </p>
                </div>
              </div>
              <div className="flex w-full gap-2 lg:w-[420px]">
                <input
                  value={supportQuery}
                  onChange={event => setSupportQuery(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Enter') runSupportSearch()
                  }}
                  placeholder="email utilisateur"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  disabled={busy === 'support_search' || supportQuery.trim().length < 3}
                  onClick={runSupportSearch}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-300 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'support_search' ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                  Chercher
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
              <div className="space-y-2">
                {(supportUsers.length ? supportUsers : [{ email: 'Aucun utilisateur chargé.' }]).map((item, index) => {
                  const active = item.id && item.id === supportSelected?.id
                  return (
                    <button
                      key={item.id ?? index}
                      type="button"
                      disabled={!item.id}
                      onClick={() => {
                        setSupportSelected(item)
                        setSupportCommands([])
                      }}
                      className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${active ? 'border-sky-300/40 bg-sky-300/10' : 'border-white/10 bg-slate-950/45 hover:bg-white/[0.06]'} disabled:cursor-default disabled:opacity-60`}
                    >
                      <p className="text-sm font-black text-white">{item.email}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {item.subscription_plan ?? '—'} · {item.instance?.state ?? 'sans machine'} · agent {item.instance?.agent_version ?? '—'}
                      </p>
                    </button>
                  )
                })}
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Machine sélectionnée</p>
                    <p className="mt-2 text-sm font-black text-white">{supportSelected?.email ?? '—'}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {supportSelected?.instance?.rdp_host ?? 'IP inconnue'} · dernier signal {formatDate(supportSelected?.instance?.last_heartbeat_at)}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={!supportSelected?.instance?.id || busy === 'support_status'}
                    onClick={() => refreshSupportStatus()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-slate-100 hover:bg-white/[0.08] disabled:opacity-50"
                  >
                    {busy === 'support_status' ? <Loader2 className="animate-spin" size={14} /> : <RefreshCcw size={14} />}
                    Actualiser
                  </button>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  {[
                    ['Ava', supportSelected?.instance?.ava_version ?? '—'],
                    ['Bridge', supportSelected?.instance?.bridge_version ?? '—'],
                    ['Equity', metric(supportSelected?.instance?.equity, '$')],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
                      <p className="mt-1 text-sm font-black text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ['check_versions', 'Versions'],
                    ['collect_logs', 'Logs'],
                    ['restart_ava', 'Relancer Ava'],
                    ['restart_mt5', 'Relancer MT5'],
                    ['update_all', 'Update tout'],
                    ['update_ava', 'Update Ava'],
                    ['update_bridge', 'Update Bridge'],
                    ['update_agent', 'Update Agent'],
                    ['diagnose', 'Diagnostic UI'],
                  ].map(([type, label]) => (
                    <button
                      key={type}
                      type="button"
                      disabled={!supportSelected?.instance?.id || !!busy}
                      onClick={() => runSupportCommand(type)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-black text-slate-100 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy === `support_${type}` ? <Loader2 className="animate-spin" size={14} /> : <Terminal size={14} />}
                      {label}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">PowerShell diagnostic</p>
                  <textarea
                    value={supportShell}
                    onChange={event => setSupportShell(event.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 font-mono text-xs text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    disabled={!supportSelected?.instance?.id || !!busy || !supportShell.trim()}
                    onClick={() => runSupportCommand('support_shell', { command: supportShell })}
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy === 'support_support_shell' ? <Loader2 className="animate-spin" size={14} /> : <Terminal size={14} />}
                    Exécuter diagnostic
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {(supportCommands.length ? supportCommands : [{ type: 'Aucune commande récente.' }]).slice(0, 5).map((command, index) => (
                    <div key={command.id ?? index} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black text-slate-100">{command.type}</p>
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{command.status ?? '—'}</span>
                      </div>
                      {command.error && <p className="mt-2 text-xs text-rose-300">{command.error}</p>}
                      {command.result && (
                        <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950/80 p-2 font-mono text-[11px] leading-5 text-slate-300">
                          {JSON.stringify(command.result, null, 2).slice(0, 4000)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {isLocalDevAdmin && (
          <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-200">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">Admin local</p>
                  <h2 className="mt-1 text-lg font-black text-white">Controle global des prises de position</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Visible uniquement en local. Le journal utilisateur affichera: bloqué par l’IA principale.
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={!adminLoaded || busy === 'admin_control'}
                onClick={async () => {
                  try {
                    setBusy('admin_control')
                    setError(null)
                    const result = await callAdminControl({
                      action: 'update',
                      block_all_entries: adminControl?.block_all_entries === true,
                      block_below_equity_enabled: adminControl?.block_below_equity_enabled === true,
                      min_equity_usd: Number(adminControl?.min_equity_usd ?? 10000),
                    })
                    setAdminControl(result.control ?? adminControl)
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Controle admin impossible.')
                  } finally {
                    setBusy(null)
                  }
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === 'admin_control' ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                Enregistrer
              </button>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-100">
                <input
                  type="checkbox"
                  checked={adminControl?.block_all_entries === true}
                  onChange={event => updateAdminControl({ block_all_entries: event.target.checked })}
                  className="h-4 w-4 accent-amber-300"
                />
                Bloquer toutes les positions
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-100">
                <input
                  type="checkbox"
                  checked={adminControl?.block_below_equity_enabled === true}
                  onChange={event => updateAdminControl({ block_below_equity_enabled: event.target.checked })}
                  className="h-4 w-4 accent-amber-300"
                />
                Bloquer sous capital minimum
              </label>
              <label className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Capital minimum USD</span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={Number(adminControl?.min_equity_usd ?? 10000)}
                  onChange={event => updateAdminControl({ min_equity_usd: toNumber(event.target.value, 10000) })}
                  className="mt-2 w-full bg-transparent text-sm font-black text-white outline-none"
                />
              </label>
            </div>
            {adminControl?.updated_at && (
              <p className="mt-3 text-xs font-bold text-slate-500">Derniere mise a jour: {formatDate(adminControl.updated_at)}</p>
            )}
          </section>
        )}

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Actions</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ACTIONS.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  type="button"
                  disabled={!instance || !canRunCommands || isConfiguring || !!busy}
                  onClick={() => run(type, { action: 'command', type })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-slate-100 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === type ? <Loader2 className="animate-spin" size={16} /> : <Icon size={16} />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Dernières alertes</p>
              <span className="text-xs font-bold text-slate-500">{instance?.positions_count ?? 0} position(s)</span>
            </div>
            <div className="mt-4 space-y-3">
              {(visibleEvents.length ? visibleEvents : [{ message: 'Aucune alerte récente.', created_at: null }]).map((event, index) => (
                <div key={`${event.created_at ?? 'empty'}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-slate-500" />
                    <div>
                      <p className="text-sm font-bold text-slate-100">{event.message}</p>
                      {event.created_at && <p className="mt-1 text-xs text-slate-500">{formatDate(event.created_at)}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Configuration Ava</p>
                <h2 className="mt-2 text-xl font-black text-white">Pilotage trading depuis Ava Web</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Ava applique ces valeurs dans l’ordinateur Ava Cloud selon les limites de votre plan.
                </p>
                {!data?.cloud_config && !agentConnected && (
                  <p className="mt-2 text-xs font-bold text-amber-200">
                    En attente de la configuration réelle d’Ava Desktop. Les champs restent modifiables, mais ils ne sont pas encore confirmés par l’agent.
                  </p>
                )}
              </div>
              <div className="grid gap-2 sm:min-w-[230px]">
                <button
                  type="button"
                  disabled={!instance || !canRunCommands || !!busy}
                  onClick={() => run('apply_config', { action: 'command', type: 'apply_config', payload: { config: cloudConfig } })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === 'apply_config' ? <Loader2 className="animate-spin" size={16} /> : <Settings2 size={16} />}
                  {configPending ? 'En attente' : 'Appliquer'}
                </button>
                <button
                  type="button"
                  disabled={!instance || !canRunCommands || !!busy}
                  onClick={() => run('sync_desktop', { action: 'command', type: 'diagnose', payload: { sync_config: true } })}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-400/25 bg-sky-400/10 px-4 py-3 text-sm font-black text-sky-100 transition-colors hover:bg-sky-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy === 'sync_desktop' ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
                  Synchroniser depuis Ava Desktop
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="block rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Marché</span>
                <select
                  value={cloudConfig.market ?? ''}
                  onChange={event => updateConfig({ market: event.target.value })}
                  className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none"
                >
                  {MARKET_OPTIONS.map(item => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
                </select>
              </label>
              <label className="block rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Exécution</span>
                <select
                  value={cloudConfig.execution ?? 'bridge'}
                  onChange={event => updateConfig({ execution: event.target.value })}
                  className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none"
                >
                  {EXECUTION_OPTIONS.map(item => <option key={item.value} value={item.value} className="bg-slate-950">{item.label}</option>)}
                </select>
              </label>
              <label className="block rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Fenêtre</span>
                <select
                  value={cloudConfig.scalpWindow ?? '1s'}
                  onChange={event => updateConfig({ scalpWindow: event.target.value })}
                  className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none"
                >
                  {SCALP_WINDOWS.map(item => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
                </select>
              </label>
              <label className="block rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Lot</span>
                <input
                  type="number"
                  step="0.01"
                  value={cloudConfig.lot ?? 0}
                  onChange={event => updateConfig({ lot: toNumber(event.target.value, 0) })}
                  className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none"
                />
              </label>
              {[
                ['Profit min $', 'minProfit', 0.01],
                ['TP pips', 'takeProfitPips', 1],
                ['Objectif $', 'sessionProfitTarget', 0.1],
                ['Giveback $', 'maxProfitGiveback', 0.1],
                ['Positions max', 'maxOpenPositions', 1],
                ['Max/h', 'maxTradesPerHour', 1],
                ['Lot min', 'minLot', 0.01],
                ['Lot max', 'maxLot', 0.01],
              ].map(([label, key, step]) => (
                <label key={String(key)} className="block rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
                  <input
                    type="number"
                    step={Number(step)}
                    value={Number(cloudConfig[key as keyof CloudConfig] ?? 0)}
                    onChange={event => updateConfig({ [key as string]: toNumber(event.target.value, 0) } as Partial<CloudConfig>)}
                    className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none"
                  />
                </label>
              ))}
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Autoriser Ava à ouvrir', 'autoEntry'],
                ['Compte réel autorisé', 'allowLive'],
                ['Surveiller manuel', 'manageManualPositions'],
                ['TP broker', 'brokerTakeProfit'],
                ['Lot dynamique', 'dynamicLot'],
                ['Empêcher la veille', 'preventSleep'],
              ].map(([label, key]) => (
                <label key={String(key)} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3 text-sm font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={Boolean(cloudConfig[key as keyof CloudConfig])}
                    onChange={event => updateConfig({ [key as string]: event.target.checked } as Partial<CloudConfig>)}
                    className="h-4 w-4 accent-rose-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Volatility avancé</p>
              <div className="mt-4 grid gap-2">
                {[
                  ['Rebond BUY', 'boomReboundBuyEnabled'],
                  ['Burst SELL', 'boomBurstEnabled'],
                  ['Paliers Rebond BUY', 'boomReboundLevelsEnabled'],
                  ['Limiter BUY session', 'boomReboundSessionLimitEnabled'],
                  ['Protection sommet H1/H4', 'boomVertexTopGuardEnabled'],
                ].map(([label, key]) => (
                  <label key={String(key)} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-3 py-3 text-sm font-bold text-slate-200">
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={Boolean(cloudConfig[key as keyof CloudConfig])}
                      onChange={event => updateConfig({ [key as string]: event.target.checked } as Partial<CloudConfig>)}
                      className="h-4 w-4 accent-rose-500"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {[
                  ['Max BUY ouverts', 'boomReboundMaxOpen'],
                  ['Lot BUY', 'boomReboundLot'],
                  ['1er BUY après', 'boomReboundFirstCandles'],
                  ['BUY chaque', 'boomReboundEveryCandles'],
                  ['Profit BUY', 'boomReboundMinProfit'],
                  ['Max BUY session', 'boomReboundSessionMaxBuys'],
                ].map(([label, key]) => (
                  <label key={String(key)} className="block rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={Number(cloudConfig[key as keyof CloudConfig] ?? 0)}
                      onChange={event => updateConfig({ [key as string]: toNumber(event.target.value, 0) } as Partial<CloudConfig>)}
                      className="mt-2 w-full bg-transparent text-sm font-bold text-white outline-none"
                    />
                  </label>
                ))}
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Limites serveur: {planLimits?.label ?? 'plan'} · lot max {planLimits?.lotMax ?? '—'} · positions max {planLimits?.maxOpenPositions ?? '—'}.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Presets</p>
              <div className="mt-3 flex gap-2">
                <input
                  value={presetName}
                  onChange={event => setPresetName(event.target.value)}
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm font-bold text-white outline-none"
                />
                <button
                  type="button"
                  disabled={!instance || !!busy}
                  onClick={() => run('save_preset', { action: 'command', type: 'save_preset', payload: { name: presetName, config: cloudConfig } })}
                  className="rounded-xl bg-white/[0.08] px-3 py-2 text-xs font-black text-white hover:bg-white/[0.12] disabled:opacity-50"
                >
                  Sauver
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {(presets.length ? presets : [{ name: 'Aucun preset enregistré.' }]).map((preset, index) => (
                  <div key={preset.id ?? index} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    <span className="text-sm font-bold text-slate-200">{preset.name}</span>
                    {preset.config && (
                      <button
                        type="button"
                        onClick={() => setCloudConfig({ ...defaultConfig(), ...preset.config })}
                        className="rounded-lg border border-white/10 px-2 py-1 text-xs font-bold text-slate-300 hover:bg-white/[0.08]"
                      >
                        Charger
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Commande Ava</p>
            <textarea
              value={naturalCommand}
              onChange={event => setNaturalCommand(event.target.value)}
              rows={4}
              placeholder="Ex: Mets le lot à 0.2 et active Rebond BUY"
              className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 text-sm font-bold text-white outline-none placeholder:text-slate-600"
            />
            <button
              type="button"
              disabled={!instance || !canRunCommands || !naturalCommand.trim() || !!busy}
              onClick={() => run('natural_command', { action: 'command', type: 'natural_command', payload: { prompt: naturalCommand } }, () => setNaturalCommand(''))}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-black text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Envoyer à Ava
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Positions et trades</p>
              <span className="text-xs font-bold text-slate-500">{livePositions.length} ouverte(s)</span>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Positions</p>
                <div className="mt-3 space-y-2">
                  {(!agentConnected ? [{ symbol: 'Agent non connecté.' }] : livePositions.length ? livePositions : [{ symbol: 'Aucune position ouverte.' }]).slice(0, 6).map((row, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                      <span className="font-bold text-slate-200">{formatCell(row.symbol ?? row.market ?? row.type)}</span>
                      <span className="text-slate-400">{formatCell(row.lot ?? row.volume)}</span>
                      <span className="text-right font-black text-emerald-300">{formatCell(row.profit ?? row.floating_profit)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Trades récents</p>
                <div className="mt-3 space-y-2">
                  {(!agentConnected ? [{ symbol: 'Agent non connecté.' }] : recentTrades.length ? recentTrades : [{ symbol: 'Aucun trade récent.' }]).slice(0, 6).map((row, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs">
                      <span className="font-bold text-slate-200">{formatCell(row.symbol ?? row.type ?? row.direction)}</span>
                      <span className="text-slate-400">{formatCell(row.lot ?? row.volume)}</span>
                      <span className="text-right font-black text-emerald-300">{formatCell(row.profit ?? row.pnl)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/45 p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Journal</p>
              <div className="mt-3 space-y-1 font-mono text-xs text-slate-400">
                {(!agentConnected ? ['Agent non connecté.'] : journalLines.length ? journalLines : ['Aucun journal récent.']).slice(0, 6).map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 pb-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Version Ava</p>
            <p className="mt-2 text-sm font-black text-white">{instance?.ava_version || '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Version AvaBridge</p>
            <p className="mt-2 text-sm font-black text-white">{instance?.bridge_version || '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Version Agent</p>
            <p className="mt-2 text-sm font-black text-white">{instance?.agent_version || '—'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Dernier signal</p>
            <p className="mt-2 text-sm font-black text-white">{formatDate(instance?.last_heartbeat_at)}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
