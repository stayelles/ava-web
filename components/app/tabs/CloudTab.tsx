'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Bell,
  Cloud,
  Coins,
  Crosshair,
  ExternalLink,
  LockKeyhole,
  Loader2,
  Monitor,
  Power,
  RefreshCcw,
  RotateCw,
  Search,
  Settings2,
  ShieldCheck,
  Terminal,
  Users,
} from 'lucide-react'
import { SUPABASE_HEADERS, SUPABASE_URL } from '../constants'
import type { UserData } from '../types'

const ADMIN_ACCESS_TOKEN_KEY = 'ava_admin_access_token'
const ADMIN_TRUSTED_DEVICE_KEY = 'ava_admin_trusted_device_token'

type CloudState = 'inactive' | 'not_created' | 'provisioning' | 'configuring' | 'ready' | 'online' | 'attention' | 'suspended' | 'delayed' | 'deleted' | 'terminated'

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
  block_buy_entries?: boolean | null
  block_sell_entries?: boolean | null
  block_boom_buy_entries?: boolean | null
  block_boom_sell_entries?: boolean | null
  block_crash_buy_entries?: boolean | null
  block_crash_sell_entries?: boolean | null
  bypass_min_net_equity_usd?: number | null
  bypass_boom_buy_entries?: boolean | null
  bypass_boom_sell_entries?: boolean | null
  bypass_crash_buy_entries?: boolean | null
  bypass_crash_sell_entries?: boolean | null
  block_below_equity_enabled?: boolean | null
  min_equity_usd?: number | null
  volatility_sell_min_profit_override_enabled?: boolean | null
  volatility_sell_min_profit_usd?: number | null
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

type AdminConsoleCriteria = {
  email?: string
  plans?: string[]
  equityMin?: number | null
  floatingLossMin?: number | null
  positionsMin?: number | null
  positionsMax?: number | null
  agentConnected?: boolean
  requiredSymbol?: string
}

type ConnectedMarket = {
  symbol?: string | null
  symbol_key?: string | null
  bridge_version?: string | null
  connected?: boolean | null
  updated_at?: number | null
  price?: number | null
  bid?: number | null
  ask?: number | null
}

type AdminConsoleTarget = {
  user_id: string
  email?: string | null
  plan?: string | null
  source?: string | null
  instance_id?: string | null
  agent_connected?: boolean
  equity?: number | null
  floating_profit?: number | null
  positions_count?: number | null
  active_market?: string | null
  connected_markets?: ConnectedMarket[]
  selected_market?: ConnectedMarket | null
  exclusion_reason?: string | null
  order_payload?: Record<string, unknown> | null
}

type AdminVertexOrderInput = {
  symbol: string
  direction: 'BUY' | 'SELL'
  orderType: 'MARKET' | 'BUY_LIMIT' | 'SELL_LIMIT' | 'BUY_STOP' | 'SELL_STOP'
  lotMode: 'user_config' | 'fixed'
  lot: number
  entryPrice?: number | null
  sl?: number | null
  tp?: number | null
  expirySeconds?: number
  maxSignalAgeSeconds?: number
  maxSlippagePoints?: number
  minProfit?: number | null
  takeProfitPoints?: number | null
  equityTiers?: Array<Record<string, unknown>>
  reason?: string
}

type AdminVertexDispatchStatus = {
  orderId?: string
  dispatched: number
  errors: number
  count: number
  excluded: number
  message: string
}

const STATUS_COPY: Record<CloudState, { label: string; detail: string; color: string }> = {
  inactive: { label: 'Non activé', detail: 'Activez votre accès 24/7 pour créer votre ordinateur Ava Cloud.', color: '#94a3b8' },
  not_created: { label: 'Prêt à configurer', detail: 'Votre accès est actif. Lancez la configuration automatique.', color: '#38bdf8' },
  deleted: { label: 'Prêt à configurer', detail: 'L’ancien ordinateur Ava Cloud a été supprimé. Lancez une nouvelle configuration.', color: '#38bdf8' },
  terminated: { label: 'Prêt à configurer', detail: 'L’ancien ordinateur Ava Cloud a été supprimé. Lancez une nouvelle configuration.', color: '#38bdf8' },
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

const MARKET_OPTIONS = ['Boom 1000 Index', 'Crash 1000 Index', 'Boom 500 Index', 'Crash 500 Index', 'Boom 300 Index', 'Crash 300 Index', 'Boom 900 Index', 'Crash 900 Index', 'Volatility 75 Index']
const ADMIN_VERTEX_MARKET_OPTIONS = ['Boom 1000 Index', 'Crash 1000 Index', 'Boom 500 Index', 'Crash 500 Index', 'Boom 300 Index', 'Crash 300 Index', 'Boom 900 Index', 'Crash 900 Index', 'Boom 600 Index', 'Crash 600 Index', 'Boom 100 Index', 'Crash 100 Index', 'Boom 50 Index', 'Crash 50 Index']
const SCALP_WINDOWS = ['1s', '5s', '15s', '1m', '5m']
const EXECUTION_OPTIONS = [
  { value: 'bridge', label: 'EA Bridge' },
  { value: 'deriv-demo', label: 'Deriv Demo' },
]

const CLOUD_PRICE = 499.99
const CLOUD_CURRENCY = 'EUR'

const ADMIN_HELP = {
  console:
    'Console admin avancee.\nElle sert a cibler des comptes Ava Cloud, appliquer des policies, envoyer des ordres Ava Vertex et notifier les utilisateurs.\nToujours previsualiser avant d envoyer, surtout quand plusieurs comptes sont cibles.\nExemple: filtrer custom_max + equity >= 3000, verifier les cibles, puis envoyer.',
  preview:
    'Previsualisation des cibles.\nAucun ordre n est envoye a cette etape.\nAva calcule seulement qui correspond aux filtres, quel agent est connecte et pourquoi un compte est exclu.\nExemple: verifier que seul le compte test est cible avant un ordre Vertex.',
  email:
    'Filtre par email utilisateur.\nRenseigne un email pour cibler un compte precis, ou laisse vide pour travailler par segment.\nC est le filtre le plus sur pour tester une action admin.\nExemple: dennyden805@gmail.com cible uniquement ce compte.',
  equityMin:
    'Equity minimale du compte MT5.\nL equity correspond au capital actuel avec le flottant deja inclus.\nLe compte est cible seulement si son equity est superieure ou egale a cette valeur.\nExemple: 5000 cible les comptes avec au moins 5000 USD d equity.',
  floatingLossMin:
    'Perte flottante minimale.\nUtilise la perte ouverte actuelle pour cibler les comptes en drawdown.\nEntre une valeur positive pour dire: au moins cette perte flottante.\nExemple: 300 cible les comptes qui perdent environ 300 USD ou plus en positions ouvertes.',
  positionsMin:
    'Nombre minimal de positions ouvertes.\nLe compte est cible seulement s il a au moins ce nombre de positions.\nUtile pour agir sur les comptes deja exposes.\nExemple: 10 cible les comptes avec 10 positions ou plus.',
  positionsMax:
    'Nombre maximal de positions ouvertes.\nLe compte est cible seulement s il ne depasse pas ce nombre.\nUtile pour eviter d envoyer un ordre a un compte deja trop charge.\nExemple: 30 exclut les comptes avec plus de 30 positions.',
  plans:
    'Filtre par plan Ava.\nSelectionne un ou plusieurs plans pour limiter les actions aux clients concernes.\nSi aucun plan n est selectionne, le filtre plan est plus large.\nExemple: Custom max uniquement pour une action reservee aux comptes Max.',
  agentConnected:
    'Agent connecte seulement.\nQuand actif, Ava cible uniquement les machines qui envoient un heartbeat recent.\nCela evite d envoyer une commande a une machine hors ligne.\nExemple: garde cette option activee pour les ordres Ava Vertex.',
  targets:
    'Liste des comptes previsualises.\nElle montre le plan, l equity, le flottant, les positions et les marches connectes.\nUn compte exclu affiche la raison au lieu de recevoir l action.\nExemple: Crash 1000 non connecte exclut un compte pour un ordre Crash.',
  policy:
    'Policy Volatility.\nUne policy est un override admin de configuration Ava Volatility.\nElle ne supprime pas la config locale utilisateur: elle s applique au-dessus, puis les limites du plan restent le garde-fou.\nExemple: forcer boomReboundMaxOpen a 5 pour les comptes equity >= 3000.',
  policyName:
    'Nom interne de la policy.\nChoisis un nom clair pour reconnaitre la regle dans l audit et les listes admin.\nCe nom n est pas le parametre lui-meme.\nExemple: Max BUY equity >= 3000.',
  policyJson:
    'Configuration JSON de la policy.\nChaque cle correspond a un reglage Ava Volatility compris par Desktop/Agent.\nGarde un JSON valide, avec guillemets doubles et valeurs numeriques propres.\nExemple: {"boomReboundMaxOpen":5,"boomReboundMode":"strict"}.',
  applyPolicy:
    'Appliquer la policy aux cibles previsualisees.\nAva envoie l override aux agents concernes et garde une trace audit.\nA utiliser apres verification de la liste Cibles.\nExemple: appliquer une cadence stricte seulement aux comptes connectes.',
  vertex:
    'Ordre Ava Vertex.\nC est un ordre admin envoye vers les comptes cibles, affiche comme Ava Vertex dans l historique.\nIl est route par marche: Boom 1000, Crash 1000, etc.\nExemple: SELL MARKET sur Crash 1000 seulement si le bridge Crash est connecte.',
  direction:
    'Direction de l ordre.\nBUY ouvre une position d achat, SELL ouvre une position de vente.\nChoisis selon le scenario du marche et le symbole cible.\nExemple: SELL sur Crash 1000, BUY sur Boom 1000.',
  orderType:
    'Type d ordre.\nMARKET execute maintenant au prix disponible.\nBUY_LIMIT achete plus bas; SELL_LIMIT vend plus haut.\nBUY_STOP achete apres cassure vers le haut; SELL_STOP vend apres cassure vers le bas.',
  symbol:
    'Marche/symbole vise.\nLe nom doit correspondre au marche connecte par AvaBridge sur MT5.\nSi ce bridge n est pas connecte, l ordre est refuse clairement.\nExemple: Boom 1000 Index ou Crash 1000 Index.',
  lot:
    'Lot fixe de l ordre.\nCette valeur peut etre remplacee par les paliers equity si les paliers sont remplis.\nReste prudent: les limites du plan et du compte s appliquent encore.\nExemple: 0.2 ouvre un ordre de 0.20 lot.',
  entryPrice:
    'Prix d entree pour les ordres pending.\nUtilise ce champ pour BUY_LIMIT, SELL_LIMIT, BUY_STOP ou SELL_STOP.\nPour MARKET, ce champ peut rester vide.\nExemple: BUY_LIMIT sous le prix actuel, SELL_STOP sous le prix actuel.',
  tp:
    'Take Profit en prix exact.\nLe bot ferme ou place la sortie autour de ce niveau si le bridge le supporte.\nSi tu utilises TP points ou profit min, ce champ peut rester vide.\nExemple: 14480 sur Boom 1000.',
  minProfit:
    'Profit minimum en dollars.\nAva peut utiliser ce seuil pour fermer un panier/ordre quand le gain atteint la valeur.\nUtile quand tu raisonnes par gain net plutot que par points.\nExemple: 1.5 signifie viser environ +1.50 USD.',
  takeProfitPoints:
    'Take Profit en points.\nAva calcule la sortie en distance de points depuis l entree.\nUtile pour scalping rapide quand le prix exact change vite.\nExemple: 25 points de TP.',
  maxSignalAge:
    'Age maximal du signal en secondes.\nSi la commande arrive trop tard, Ava refuse l execution.\nC est une protection importante pour le scalping.\nExemple: 10 refuse un signal vieux de plus de 10 secondes.',
  slippage:
    'Slippage maximal autorise en points.\nSi le prix a trop bouge entre l envoi et l execution, Ava refuse.\nCela evite d entrer trop loin du prix voulu.\nExemple: 25 points maximum.',
  tiers:
    'Paliers par equity nette.\nAva choisit le lot/profit selon l equity du compte cible.\nChaque palier peut definir minEquity, maxEquity, lot et minProfit.\nExemple: 0-2000 lot 0.1, 2000-5000 lot 0.2.',
  vertexPreview:
    'Previsualiser l ordre Vertex.\nAucun trade n est envoye.\nAva calcule les cibles, les marches connectes, les lots et les exclusions.\nExemple: verifier que Crash 1000 est connecte avant d envoyer.',
  vertexDispatch:
    'Envoyer Ava Vertex.\nCette action envoie vraiment l ordre aux comptes cibles previsualises.\nA utiliser seulement apres verification des cibles et des paliers.\nExemple: envoyer un SELL MARKET a un compte test connecte.',
  notification:
    'Notification mobile admin.\nPermet d envoyer un message push aux utilisateurs cibles ayant un token mobile.\nLa notification suit les memes filtres que la previsualisation.\nExemple: prevenir les clients Max d une intervention.',
  notificationTitle:
    'Titre de notification.\nTexte court visible en haut de la notification mobile.\nReste clair et direct.\nExemple: Mise a jour Ava Cloud.',
  notificationBody:
    'Message de notification.\nTexte principal envoye au telephone de l utilisateur.\nEvite les messages trop longs.\nExemple: Votre Ava Cloud sera redemarre dans quelques minutes.',
  notificationSend:
    'Envoyer la notification mobile.\nL action cible les comptes previsualises avec token push disponible.\nAucune position trading n est modifiee.\nExemple: envoyer une annonce aux comptes Custom max connectes.',
} satisfies Record<string, string>

function formatCloudPrice(value: number | null | undefined) {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(Number(value)) ? Number(value) : CLOUD_PRICE)
}

function normalizeAdminMarketKey(value: unknown) {
  const raw = String(value ?? '').trim().toUpperCase()
  if (!raw) return ''
  const key = raw.replace(/[^A-Z0-9]+/g, '')
  if (key.includes('BOOM300N') || key.includes('BOOM300')) return 'BOOM300N'
  if (key.includes('BOOM1000')) return 'BOOM1000'
  if (key.includes('BOOM900')) return 'BOOM900'
  if (key.includes('BOOM600')) return 'BOOM600'
  if (key.includes('BOOM500')) return 'BOOM500'
  if (key.includes('BOOM100')) return 'BOOM100'
  if (key.includes('BOOM50')) return 'BOOM50'
  if (key.includes('CRASH1000')) return 'CRASH1000'
  if (key.includes('CRASH900')) return 'CRASH900'
  if (key.includes('CRASH600')) return 'CRASH600'
  if (key.includes('CRASH500')) return 'CRASH500'
  if (key.includes('CRASH300')) return 'CRASH300'
  if (key.includes('CRASH100')) return 'CRASH100'
  if (key.includes('CRASH50')) return 'CRASH50'
  if (key === 'GOLD') return 'XAUUSD'
  return key || raw
}

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

function HelpHint({ text }: { text: string }) {
  return (
    <span
      title={text}
      aria-label={text}
      className="inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-black leading-none text-slate-400"
    >
      ?
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
  const [adminCriteria, setAdminCriteria] = useState<AdminConsoleCriteria>({ agentConnected: true })
  const [adminTargets, setAdminTargets] = useState<AdminConsoleTarget[]>([])
  const [adminConsoleMessage, setAdminConsoleMessage] = useState('')
  const [adminPolicyName, setAdminPolicyName] = useState('Max BUY equity >= 5000')
  const [adminPolicyJson, setAdminPolicyJson] = useState('{\n  "boomReboundMaxOpen": 5,\n  "boomReboundMode": "strict"\n}')
  const [adminAccessChecked, setAdminAccessChecked] = useState(false)
  const [adminAccessGranted, setAdminAccessGranted] = useState(false)
  const [adminAccessToken, setAdminAccessToken] = useState('')
  const [adminAccessMessage, setAdminAccessMessage] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [adminCodeSent, setAdminCodeSent] = useState(false)
  const [adminRememberDevice, setAdminRememberDevice] = useState(true)
  const [adminCodeDeadline, setAdminCodeDeadline] = useState<number | null>(null)
  const [adminVertexOrder, setAdminVertexOrder] = useState<AdminVertexOrderInput>({
    symbol: 'Boom 1000 Index',
    direction: 'BUY',
    orderType: 'MARKET',
    lotMode: 'user_config',
    lot: 0.2,
    expirySeconds: 300,
    maxSignalAgeSeconds: 10,
    maxSlippagePoints: 25,
    minProfit: 0.5,
    reason: 'Ava Vertex',
  })
  const [adminVertexDispatchStatus, setAdminVertexDispatchStatus] = useState<AdminVertexDispatchStatus | null>(null)
  const [adminVertexTiersJson, setAdminVertexTiersJson] = useState('[\n  { "name": "0-2000", "minEquity": 0, "maxEquity": 2000, "lot": 0.1, "minProfit": 0.5 },\n  { "name": "2000-5000", "minEquity": 2000, "maxEquity": 5000, "lot": 0.2, "minProfit": 1 },\n  { "name": "5000+", "minEquity": 5000, "lot": 0.3, "minProfit": 1.5 }\n]')
  const [adminNotificationTitle, setAdminNotificationTitle] = useState('Message Ava')
  const [adminNotificationBody, setAdminNotificationBody] = useState('')
  const canUseAdminConsole = useMemo(() => {
    if (user.is_admin !== true) return false
    if (typeof window === 'undefined') return false
    const hostname = window.location.hostname
    return ['localhost', '127.0.0.1'].includes(hostname) || hostname === 'call-ava.com' || hostname.endsWith('.call-ava.com')
  }, [user.is_admin])
  const adminVertexMarketOptions = useMemo(() => {
    const labels: string[] = []
    const seen = new Set<string>()
    const add = (value: unknown) => {
      const label = String(value ?? '').trim()
      const key = normalizeAdminMarketKey(label)
      if (!label || !key || seen.has(key)) return
      seen.add(key)
      labels.push(label)
    }
    for (const target of adminTargets) {
      for (const market of target.connected_markets ?? []) add(market.symbol || market.symbol_key)
      add(target.active_market)
      add(target.selected_market?.symbol || target.selected_market?.symbol_key)
    }
    ADMIN_VERTEX_MARKET_OPTIONS.forEach(add)
    return labels
  }, [adminTargets])
  const selectedVertexMarket = useMemo(() => {
    const wanted = normalizeAdminMarketKey(adminVertexOrder.symbol)
    if (!wanted) return null
    for (const target of adminTargets) {
      const selected = target.selected_market
      if (selected && normalizeAdminMarketKey(selected.symbol_key || selected.symbol) === wanted) return selected
      const found = target.connected_markets?.find(market => market.connected !== false && normalizeAdminMarketKey(market.symbol_key || market.symbol) === wanted)
      if (found) return found
    }
    return null
  }, [adminTargets, adminVertexOrder.symbol])
  const selectedVertexEligibleTargets = useMemo(() => {
    const wanted = normalizeAdminMarketKey(adminVertexOrder.symbol)
    if (!wanted) return []
    return adminTargets.filter(target => {
      if (target.exclusion_reason || target.user_id === 'empty') return false
      if (target.selected_market && normalizeAdminMarketKey(target.selected_market.symbol_key || target.selected_market.symbol) === wanted) return true
      return target.connected_markets?.some(market => market.connected !== false && normalizeAdminMarketKey(market.symbol_key || market.symbol) === wanted) === true
    })
  }, [adminTargets, adminVertexOrder.symbol])
  const adminEligibleTargetCount = useMemo(
    () => adminTargets.filter(target => target.user_id !== 'empty' && !target.exclusion_reason).length,
    [adminTargets],
  )
  const adminExcludedTargetCount = useMemo(
    () => adminTargets.filter(target => target.user_id !== 'empty' && !!target.exclusion_reason).length,
    [adminTargets],
  )

  const callAdminAccess = useCallback(async (payload: Record<string, unknown>) => {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/admin-access`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ user_id: user.id, web_session_token: user.web_session_token, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Verification admin indisponible.')
    if (res.status === 401 || message.toLowerCase().includes('session ava web expiree') || message.toLowerCase().includes('session ava web expirée')) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [onSessionExpired, user.id, user.web_session_token])

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
    const token = adminAccessToken || (typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) ?? '' : '')
    const res = await fetch(`${SUPABASE_URL}/functions/v1/trading-admin-control`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ user_id: user.id, web_session_token: user.web_session_token, admin_access_token: token || undefined, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Controle admin indisponible.')
    if (res.status === 401 || message.toLowerCase().includes('session ava web expiree') || message.toLowerCase().includes('session ava web expirée')) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [adminAccessToken, onSessionExpired, user.id, user.web_session_token])

  const callAdminConsole = useCallback(async (payload: Record<string, unknown>) => {
    const token = adminAccessToken || (typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) ?? '' : '')
    const res = await fetch(`${SUPABASE_URL}/functions/v1/trading-admin-console`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ user_id: user.id, web_session_token: user.web_session_token, admin_access_token: token || undefined, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Console admin indisponible.')
    if (res.status === 401 || message.toLowerCase().includes('session ava web expiree') || message.toLowerCase().includes('session ava web expirée')) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [adminAccessToken, onSessionExpired, user.id, user.web_session_token])

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
    if (!canUseAdminConsole) {
      setAdminAccessChecked(true)
      setAdminAccessGranted(false)
      return undefined
    }
    let active = true
    setAdminAccessChecked(false)
    setAdminAccessMessage('')
    const trustedDeviceToken = typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_TRUSTED_DEVICE_KEY) ?? '' : ''
    callAdminAccess({ action: 'status', trusted_device_token: trustedDeviceToken || undefined })
      .then((result) => {
        if (!active) return
        if (result.adminAccess === true) {
          const token = String(result.admin_access_token ?? '')
          setAdminAccessGranted(true)
          setAdminAccessMessage(result.method === 'ip' ? 'Acces admin autorise par IP.' : 'Appareil admin reconnu.')
          if (token) {
            setAdminAccessToken(token)
            window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token)
          }
          return
        }
        setAdminAccessGranted(false)
        setAdminAccessToken('')
        window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY)
        setAdminAccessMessage(`Verification email requise${result.email ? ` pour ${result.email}` : ''}.`)
      })
      .catch((err) => {
        if (!active) return
        setAdminAccessGranted(false)
        setAdminAccessMessage(err instanceof Error ? err.message : 'Verification admin indisponible.')
      })
      .finally(() => {
        if (active) setAdminAccessChecked(true)
      })
    return () => {
      active = false
    }
  }, [callAdminAccess, canUseAdminConsole])

  const requestAdminCode = useCallback(async () => {
    try {
      setBusy('admin_access_code')
      setError(null)
      const result = await callAdminAccess({ action: 'request_code' })
      if (result.adminAccess === true) {
        setAdminAccessGranted(true)
        setAdminAccessMessage('Acces admin autorise par IP.')
        return
      }
      setAdminCodeSent(true)
      setAdminCode('')
      const expiresIn = Number(result.expiresInSeconds ?? 600)
      setAdminCodeDeadline(Date.now() + expiresIn * 1000)
      setAdminAccessMessage(`Code envoye${result.email ? ` a ${result.email}` : ''}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible d’envoyer le code admin.')
    } finally {
      setBusy(null)
    }
  }, [callAdminAccess])

  const verifyAdminCode = useCallback(async () => {
    try {
      setBusy('admin_access_verify')
      setError(null)
      const result = await callAdminAccess({
        action: 'verify_code',
        code: adminCode.trim(),
        remember_device: adminRememberDevice,
      })
      const accessToken = String(result.admin_access_token ?? '')
      const trustedDeviceToken = String(result.trusted_device_token ?? '')
      if (accessToken) {
        setAdminAccessToken(accessToken)
        window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken)
      }
      if (trustedDeviceToken) window.localStorage.setItem(ADMIN_TRUSTED_DEVICE_KEY, trustedDeviceToken)
      setAdminAccessGranted(true)
      setAdminCodeSent(false)
      setAdminCodeDeadline(null)
      setAdminCode('')
      setAdminAccessMessage(adminRememberDevice ? 'Appareil reconnu pour les acces admin.' : 'Acces admin valide pour cette session.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code admin invalide.')
    } finally {
      setBusy(null)
    }
  }, [adminCode, adminRememberDevice, callAdminAccess])

  useEffect(() => {
    if (!adminCodeDeadline || adminAccessGranted) return undefined
    const timer = window.setInterval(() => {
      if (Date.now() <= adminCodeDeadline) return
      window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY)
      setAdminCodeDeadline(null)
      setAdminAccessMessage('Code admin expire. Session fermee pour securite.')
      onSessionExpired?.()
    }, 1000)
    return () => window.clearInterval(timer)
  }, [adminAccessGranted, adminCodeDeadline, onSessionExpired])

  useEffect(() => {
    if (!canUseAdminConsole || !adminAccessGranted) {
      setAdminLoaded(false)
      return
    }
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
  }, [adminAccessGranted, callAdminControl, canUseAdminConsole])

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
  const bridgeOutdated = agentConnected && instance?.bridge_version && Number.isFinite(bridgeVersionNumber) && bridgeVersionNumber < 1.45
  const canRunCommands = agentConnected && (state === 'ready' || state === 'online' || state === 'attention')
  const canOpen = browserAccessReady && (state === 'ready' || state === 'online' || state === 'attention')
  const canProvision = state === 'not_created' || state === 'delayed' || state === 'deleted' || state === 'terminated'
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
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      ...patch,
    }))
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
  const adminCriteriaPayload = useCallback(() => ({
    email: adminCriteria.email?.trim() || undefined,
    plans: adminCriteria.plans?.length ? adminCriteria.plans : undefined,
    min_equity: adminCriteria.equityMin ?? undefined,
    min_floating_loss: adminCriteria.floatingLossMin ?? undefined,
    min_positions: adminCriteria.positionsMin ?? undefined,
    max_positions: adminCriteria.positionsMax ?? undefined,
    agent_connected: adminCriteria.agentConnected === true ? true : undefined,
    required_symbol: adminCriteria.requiredSymbol?.trim() || undefined,
  }), [adminCriteria])
  const adminVertexOrderPayload = useCallback(() => {
    let equityTiers: Array<Record<string, unknown>> = []
    if (adminVertexTiersJson.trim()) {
      const parsed = JSON.parse(adminVertexTiersJson)
      if (!Array.isArray(parsed)) throw new Error('Les paliers equity doivent être un tableau JSON.')
      equityTiers = parsed
    }
    return {
      ...adminVertexOrder,
      symbol: adminVertexOrder.symbol.trim(),
      equityTiers,
    }
  }, [adminVertexOrder, adminVertexTiersJson])
  const runAdminPreview = useCallback(async () => {
    try {
      setBusy('admin_preview')
      setError(null)
      setAdminConsoleMessage('')
      const result = await callAdminConsole({ action: 'targets.preview', criteria: adminCriteriaPayload() })
      const targets = Array.isArray(result.targets) ? result.targets as AdminConsoleTarget[] : []
      setAdminTargets(targets)
      setAdminConsoleMessage(`${targets.length} compte(s) ciblé(s).`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prévisualisation admin impossible.')
    } finally {
      setBusy(null)
    }
  }, [adminCriteriaPayload, callAdminConsole])
  const applyAdminPolicy = useCallback(async () => {
    try {
      setBusy('admin_policy')
      setError(null)
      const overrides = JSON.parse(adminPolicyJson || '{}')
      const result = await callAdminConsole({
        action: 'policy.upsert',
        name: adminPolicyName,
        criteria: adminCriteriaPayload(),
        config_overrides: overrides,
        dispatch: true,
      })
      setAdminTargets(Array.isArray(result.targets) ? result.targets as AdminConsoleTarget[] : adminTargets)
      setAdminConsoleMessage(`Policy envoyée à ${Number(result.dispatched ?? 0)} machine(s).`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Policy admin impossible.')
    } finally {
      setBusy(null)
    }
  }, [adminCriteriaPayload, adminPolicyJson, adminPolicyName, adminTargets, callAdminConsole])
  const previewVertexOrder = useCallback(async () => {
    try {
      setBusy('admin_vertex_preview')
      setError(null)
      const order = adminVertexOrderPayload()
      const result = await callAdminConsole({
        action: 'vertex_order.preview',
        criteria: { ...adminCriteriaPayload(), required_symbol: order.symbol },
        order,
      })
      const targets = [
        ...(Array.isArray(result.targets) ? result.targets as AdminConsoleTarget[] : []),
        ...(Array.isArray(result.excluded) ? result.excluded as AdminConsoleTarget[] : []),
      ]
      setAdminTargets(targets)
      setAdminVertexDispatchStatus(null)
      const targetCount = Number(result.target_count ?? result.count ?? 0)
      const excludedCount = Number(result.excluded_count ?? 0)
      setAdminConsoleMessage(targetCount > 0 ? `${targetCount} cible(s), ${excludedCount} exclue(s).` : `Aucune cible eligible pour ${order.symbol}. ${excludedCount} exclue(s).`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prévisualisation Ava Vertex impossible.')
    } finally {
      setBusy(null)
    }
  }, [adminCriteriaPayload, adminVertexOrderPayload, callAdminConsole])
  const dispatchVertexOrder = useCallback(async () => {
    try {
      setBusy('admin_vertex')
      setError(null)
      const order = adminVertexOrderPayload()
      const result = await callAdminConsole({
        action: 'vertex_order.dispatch',
        criteria: { ...adminCriteriaPayload(), required_symbol: order.symbol },
        order,
        idempotency_key: `vertex-${Date.now()}`,
      })
      const mergedTargets = [
        ...(Array.isArray(result.targets) ? result.targets as AdminConsoleTarget[] : []),
        ...(Array.isArray(result.excluded) ? result.excluded as AdminConsoleTarget[] : []),
      ]
      if (mergedTargets.length) setAdminTargets(mergedTargets)
      const dispatched = Number(result.dispatched ?? 0)
      const errors = Number(result.errors ?? 0)
      const count = Number(result.count ?? dispatched)
      const excluded = Number(result.excluded_count ?? 0)
      const message = dispatched > 0
        ? `Ordre ${String(result.order_id ?? '').slice(0, 8) || 'Vertex'} cree: ${dispatched} machine(s) cible(s), ${errors} erreur(s).`
        : `Aucun ordre envoye: 0 machine cible pour ${order.symbol}. Previsualise et verifie le marche connecte.`
      setAdminVertexDispatchStatus({ orderId: String(result.order_id ?? ''), dispatched, errors, count, excluded, message })
      setAdminConsoleMessage(message)
      if (dispatched <= 0) setError(`Ava Vertex non envoye: aucune machine eligible pour ${order.symbol}.`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ordre Ava Vertex impossible.')
    } finally {
      setBusy(null)
    }
  }, [adminCriteriaPayload, adminTargets, adminVertexOrderPayload, callAdminConsole])
  const sendAdminNotification = useCallback(async () => {
    try {
      setBusy('admin_notification')
      setError(null)
      const result = await callAdminConsole({
        action: 'notification.send',
        criteria: adminCriteriaPayload(),
        title: adminNotificationTitle,
        body: adminNotificationBody,
      })
      setAdminTargets(Array.isArray(result.targets) ? result.targets as AdminConsoleTarget[] : adminTargets)
      setAdminConsoleMessage(`Notification envoyée à ${Number(result.sent ?? 0)} appareil(s).`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Notification admin impossible.')
    } finally {
      setBusy(null)
    }
  }, [adminCriteriaPayload, adminNotificationBody, adminNotificationTitle, adminTargets, callAdminConsole])
  const planLimits = data?.plan_limits
  const presets = data?.cloud_presets ?? []

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
            <p className="mt-1 text-2xl font-black text-white">{formatCloudPrice(data?.price)} €<span className="text-sm text-slate-500">/mois</span></p>
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
                  AvaBridge {instance?.bridge_version} est détecté. La version recommandée est 1.45 ou plus pour une synchronisation fiable des positions multi-marchés.
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
                : 'Activez Ava Cloud par carte, PayPal ou crypto pour lancer la configuration automatique.'}
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
                  {busy === 'whop' ? (
                    <Loader2 className="animate-spin" size={17} />
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <img src="/payment/visa.png" alt="" className="h-4 w-auto rounded-sm bg-white/90 px-1" />
                      <img src="/payment/mastercard.png" alt="" className="h-4 w-auto rounded-sm bg-white/90 px-1" />
                      <img src="/payment/paypal.png" alt="" className="h-4 w-auto rounded-sm bg-white/90 px-1" />
                    </span>
                  )}
                  Payer par carte ou PayPal
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
                  Paiement en crypto
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

        {canUseAdminConsole && !adminAccessGranted && (
          <section className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 text-rose-200">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-rose-200">Verification admin</p>
                  <h2 className="mt-1 text-lg font-black text-white">Confirmer cet acces administrateur</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Hors IP autorisee, Ava envoie un code par email. Sans validation, les fonctions administrateur restent verrouillees.
                  </p>
                  {adminAccessMessage && <p className="mt-2 text-xs font-bold text-rose-100">{adminAccessMessage}</p>}
                </div>
              </div>
              {!adminAccessChecked && (
                <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-slate-200">
                  <Loader2 className="animate-spin" size={14} />
                  Verification...
                </span>
              )}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[0.8fr_1fr_auto]">
              <button
                type="button"
                disabled={!adminAccessChecked || busy === 'admin_access_code'}
                onClick={requestAdminCode}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-300 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === 'admin_access_code' ? <Loader2 className="animate-spin" size={16} /> : <Bell size={16} />}
                Envoyer le code
              </button>
              <input
                value={adminCode}
                onChange={event => setAdminCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                disabled={!adminCodeSent}
                placeholder="Code 6 chiffres"
                className="rounded-xl border border-white/10 bg-slate-950/60 px-4 py-3 text-center text-lg font-black tracking-[0.3em] text-white outline-none placeholder:text-sm placeholder:tracking-normal placeholder:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="button"
                disabled={!adminCodeSent || adminCode.trim().length !== 6 || busy === 'admin_access_verify'}
                onClick={verifyAdminCode}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-3 text-sm font-black text-emerald-100 transition-colors hover:bg-emerald-300/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === 'admin_access_verify' ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                Valider
              </button>
            </div>
            <label className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-xs font-black text-slate-200">
              <input
                type="checkbox"
                checked={adminRememberDevice}
                onChange={event => setAdminRememberDevice(event.target.checked)}
                className="h-4 w-4 accent-rose-300"
              />
              Reconnaitre cet appareil pendant 30 jours
            </label>
            {adminCodeSent && adminCodeDeadline && (
              <p className="mt-3 text-xs font-bold text-slate-500">
                Le code expire dans {Math.max(0, Math.ceil((adminCodeDeadline - Date.now()) / 60000))} minute(s). Sans validation, cette session admin sera fermee.
              </p>
            )}
          </section>
        )}

        {canUseAdminConsole && adminAccessGranted && (
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

        {canUseAdminConsole && adminAccessGranted && (
          <section className="rounded-2xl border border-sky-400/20 bg-sky-400/[0.05] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-sky-400/20 bg-sky-400/10 text-sky-200">
                  <Users size={20} />
                </div>
                <div title={ADMIN_HELP.console}>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-200">Admin console</p>
                  <h2 className="mt-1 inline-flex items-center gap-2 text-lg font-black text-white">
                    Policies, Ava Vertex et notifications
                    <HelpHint text={ADMIN_HELP.console} />
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Les actions ciblent uniquement les machines Ava Cloud connectées par agent. Prévisualise toujours les comptes avant d’envoyer.
                  </p>
                </div>
              </div>
              <button
                type="button"
                title={ADMIN_HELP.preview}
                disabled={busy === 'admin_preview'}
                onClick={runAdminPreview}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-300 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy === 'admin_preview' ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                Prévisualiser
              </button>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-6">
              <label title={ADMIN_HELP.email} className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 lg:col-span-2">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Email utilisateur
                  <HelpHint text={ADMIN_HELP.email} />
                </span>
                <input
                  title={ADMIN_HELP.email}
                  value={adminCriteria.email ?? ''}
                  onChange={event => setAdminCriteria(current => ({ ...current, email: event.target.value }))}
                  placeholder="email ou vide"
                  className="mt-2 w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-600"
                />
              </label>
              <label title={ADMIN_HELP.equityMin} className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Equity min
                  <HelpHint text={ADMIN_HELP.equityMin} />
                </span>
                <input
                  title={ADMIN_HELP.equityMin}
                  type="number"
                  value={adminCriteria.equityMin ?? ''}
                  onChange={event => setAdminCriteria(current => ({ ...current, equityMin: event.target.value ? toNumber(event.target.value) : null }))}
                  className="mt-2 w-full bg-transparent text-sm font-black text-white outline-none"
                />
              </label>
              <label title={ADMIN_HELP.floatingLossMin} className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Perte flottante min
                  <HelpHint text={ADMIN_HELP.floatingLossMin} />
                </span>
                <input
                  title={ADMIN_HELP.floatingLossMin}
                  type="number"
                  value={adminCriteria.floatingLossMin ?? ''}
                  onChange={event => setAdminCriteria(current => ({ ...current, floatingLossMin: event.target.value ? toNumber(event.target.value) : null }))}
                  className="mt-2 w-full bg-transparent text-sm font-black text-white outline-none"
                />
              </label>
              <label title={ADMIN_HELP.positionsMin} className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Positions min
                  <HelpHint text={ADMIN_HELP.positionsMin} />
                </span>
                <input
                  title={ADMIN_HELP.positionsMin}
                  type="number"
                  value={adminCriteria.positionsMin ?? ''}
                  onChange={event => setAdminCriteria(current => ({ ...current, positionsMin: event.target.value ? toNumber(event.target.value) : null }))}
                  className="mt-2 w-full bg-transparent text-sm font-black text-white outline-none"
                />
              </label>
              <label title={ADMIN_HELP.positionsMax} className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Positions max
                  <HelpHint text={ADMIN_HELP.positionsMax} />
                </span>
                <input
                  title={ADMIN_HELP.positionsMax}
                  type="number"
                  value={adminCriteria.positionsMax ?? ''}
                  onChange={event => setAdminCriteria(current => ({ ...current, positionsMax: event.target.value ? toNumber(event.target.value) : null }))}
                  className="mt-2 w-full bg-transparent text-sm font-black text-white outline-none"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {['custom_pro', 'custom_ultra', 'custom_max'].map(plan => {
                const selected = adminCriteria.plans?.includes(plan) === true
                return (
                  <button
                    key={plan}
                    type="button"
                    title={ADMIN_HELP.plans}
                    onClick={() => setAdminCriteria(current => {
                      const plans = current.plans ?? []
                      return { ...current, plans: selected ? plans.filter(item => item !== plan) : [...plans, plan] }
                    })}
                    className={`rounded-xl border px-3 py-2 text-xs font-black ${selected ? 'border-sky-300 bg-sky-300/15 text-sky-100' : 'border-white/10 bg-slate-950/35 text-slate-400'}`}
                  >
                    {plan.replace('custom_', 'Custom ')}
                  </button>
                )
              })}
              <label title={ADMIN_HELP.agentConnected} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/35 px-3 py-2 text-xs font-black text-slate-200">
                <input
                  title={ADMIN_HELP.agentConnected}
                  type="checkbox"
                  checked={adminCriteria.agentConnected === true}
                  onChange={event => setAdminCriteria(current => ({ ...current, agentConnected: event.target.checked }))}
                  className="h-4 w-4 accent-sky-300"
                />
                Agent connecté seulement
                <HelpHint text={ADMIN_HELP.agentConnected} />
              </label>
              {adminConsoleMessage && <span className="inline-flex items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-black text-emerald-200">{adminConsoleMessage}</span>}
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <div title={ADMIN_HELP.targets} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                    Cibles
                    <HelpHint text={ADMIN_HELP.targets} />
                  </p>
                  <span className="text-xs font-black text-slate-400">
                    {adminEligibleTargetCount} cible(s)
                    {adminExcludedTargetCount ? ` · ${adminExcludedTargetCount} exclue(s)` : ''}
                  </span>
                </div>
                <div className="mt-3 max-h-72 space-y-2 overflow-auto pr-1">
                  {(adminTargets.length ? adminTargets : [{ user_id: 'empty', email: 'Aucune cible prévisualisée.' }]).slice(0, 30).map(target => (
                    <div key={`${target.user_id}-${target.instance_id ?? ''}`} className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-black text-white">{target.email ?? target.user_id}</p>
                        <span className={`text-[10px] font-black uppercase tracking-[0.14em] ${target.agent_connected ? 'text-emerald-300' : 'text-slate-500'}`}>
                          {target.exclusion_reason ? 'exclu' : target.agent_connected ? 'agent ok' : 'hors ligne'}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {target.plan ?? 'plan —'} · equity {metric(target.equity, '$')} · float {metric(target.floating_profit, '$')} · pos {target.positions_count ?? '—'}
                      </p>
                      {target.connected_markets?.length ? (
                        <p className="mt-1 text-[11px] font-bold text-sky-200">
                          Marchés: {target.connected_markets.map(item => item.symbol ?? item.symbol_key).filter(Boolean).join(', ')}
                        </p>
                      ) : null}
                      {target.order_payload ? (
                        <p className="mt-1 text-[11px] font-bold text-emerald-200">
                          Lot {(target.order_payload as any).lot ?? '—'} · palier {(target.order_payload as any).equity_tier ?? 'defaut'}
                        </p>
                      ) : null}
                      {target.exclusion_reason ? (
                        <p className="mt-1 text-[11px] font-bold text-rose-200">{target.exclusion_reason}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <div title={ADMIN_HELP.policy} className="flex items-center gap-2 text-sky-100">
                    <Settings2 size={16} />
                    <p className="text-sm font-black">Policy Volatility</p>
                    <HelpHint text={ADMIN_HELP.policy} />
                  </div>
                  <input
                    title={ADMIN_HELP.policyName}
                    value={adminPolicyName}
                    onChange={event => setAdminPolicyName(event.target.value)}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-bold text-white outline-none"
                  />
                  <textarea
                    title={ADMIN_HELP.policyJson}
                    value={adminPolicyJson}
                    onChange={event => setAdminPolicyJson(event.target.value)}
                    rows={5}
                    className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    title={ADMIN_HELP.applyPolicy}
                    disabled={busy === 'admin_policy'}
                    onClick={applyAdminPolicy}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-300 px-3 py-2 text-xs font-black text-slate-950 hover:bg-sky-200 disabled:opacity-50"
                  >
                    {busy === 'admin_policy' ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                    Appliquer policy
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <div title={ADMIN_HELP.vertex} className="flex items-center gap-2 text-rose-100">
                    <Crosshair size={16} />
                    <p className="text-sm font-black">Ordre Ava Vertex</p>
                    <HelpHint text={ADMIN_HELP.vertex} />
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <select
                      title={ADMIN_HELP.direction}
                      value={adminVertexOrder.direction}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, direction: event.target.value as 'BUY' | 'SELL' }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none"
                    >
                      <option value="BUY">BUY</option>
                      <option value="SELL">SELL</option>
                    </select>
                    <select
                      title={ADMIN_HELP.orderType}
                      value={adminVertexOrder.orderType}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, orderType: event.target.value as AdminVertexOrderInput['orderType'] }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none"
                    >
                      {['MARKET', 'BUY_LIMIT', 'SELL_LIMIT', 'BUY_STOP', 'SELL_STOP'].map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select
                      title={ADMIN_HELP.symbol}
                      value={adminVertexOrder.symbol}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, symbol: event.target.value }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none"
                    >
                      {adminVertexMarketOptions.map(symbol => <option key={normalizeAdminMarketKey(symbol)} value={symbol}>{symbol}</option>)}
                    </select>
                    <input
                      title={ADMIN_HELP.lot}
                      type="number"
                      step="0.01"
                      value={adminVertexOrder.lot}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, lot: toNumber(event.target.value, 0.2), lotMode: 'fixed' }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none"
                    />
                    <input
                      title={ADMIN_HELP.entryPrice}
                      type="number"
                      placeholder="Entrée pending"
                      value={adminVertexOrder.entryPrice ?? ''}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, entryPrice: event.target.value ? toNumber(event.target.value) : null }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                    />
                    <input
                      title={ADMIN_HELP.tp}
                      type="number"
                      placeholder="TP prix"
                      value={adminVertexOrder.tp ?? ''}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, tp: event.target.value ? toNumber(event.target.value) : null }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                    />
                    <input
                      title={ADMIN_HELP.minProfit}
                      type="number"
                      placeholder="Profit min $"
                      value={adminVertexOrder.minProfit ?? ''}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, minProfit: event.target.value ? toNumber(event.target.value) : null }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                    />
                    <input
                      title={ADMIN_HELP.takeProfitPoints}
                      type="number"
                      placeholder="TP points"
                      value={adminVertexOrder.takeProfitPoints ?? ''}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, takeProfitPoints: event.target.value ? toNumber(event.target.value) : null }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                    />
                    <input
                      title={ADMIN_HELP.maxSignalAge}
                      type="number"
                      placeholder="Age max signal s"
                      value={adminVertexOrder.maxSignalAgeSeconds ?? ''}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, maxSignalAgeSeconds: event.target.value ? toNumber(event.target.value, 10) : undefined }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                    />
                    <input
                      title={ADMIN_HELP.slippage}
                      type="number"
                      placeholder="Slippage max pts"
                      value={adminVertexOrder.maxSlippagePoints ?? ''}
                      onChange={event => setAdminVertexOrder(current => ({ ...current, maxSlippagePoints: event.target.value ? toNumber(event.target.value, 25) : undefined }))}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                    />
                  </div>
                  <div className={`mt-3 rounded-xl border px-3 py-2 text-xs font-bold ${selectedVertexEligibleTargets.length ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-amber-300/20 bg-amber-300/10 text-amber-100'}`}>
                    {selectedVertexEligibleTargets.length ? (
                      <>
                        {adminVertexOrder.symbol} prêt sur {selectedVertexEligibleTargets.length} compte(s).
                        {selectedVertexMarket?.price || selectedVertexMarket?.bid || selectedVertexMarket?.ask ? (
                          <span className="ml-1 text-slate-200">
                            Prix live {metric(selectedVertexMarket.price ?? selectedVertexMarket.bid ?? selectedVertexMarket.ask, '')}
                            {selectedVertexMarket.bid ? ` · bid ${metric(selectedVertexMarket.bid, '')}` : ''}
                            {selectedVertexMarket.ask ? ` · ask ${metric(selectedVertexMarket.ask, '')}` : ''}
                          </span>
                        ) : (
                          <span className="ml-1 text-slate-300">Prix live non remonte par cet agent.</span>
                        )}
                      </>
                    ) : (
                      <>
                        Aucun compte eligible previsualise pour {adminVertexOrder.symbol}. Clique d abord Previsualiser et verifie que le bridge de ce marche est connecte.
                      </>
                    )}
                  </div>
                  {adminVertexDispatchStatus ? (
                    <div className={`mt-2 rounded-xl border px-3 py-2 text-xs font-bold ${adminVertexDispatchStatus.dispatched > 0 ? 'border-sky-300/20 bg-sky-300/10 text-sky-100' : 'border-rose-300/20 bg-rose-300/10 text-rose-100'}`}>
                      {adminVertexDispatchStatus.message}
                      {adminVertexDispatchStatus.orderId ? <span className="ml-1 text-slate-300">ID {adminVertexDispatchStatus.orderId.slice(0, 8)}</span> : null}
                    </div>
                  ) : null}
                  <textarea
                    title={ADMIN_HELP.tiers}
                    value={adminVertexTiersJson}
                    onChange={event => setAdminVertexTiersJson(event.target.value)}
                    rows={5}
                    className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-slate-100 outline-none"
                  />
                  <button
                    type="button"
                    title={ADMIN_HELP.vertexPreview}
                    disabled={busy === 'admin_vertex_preview'}
                    onClick={previewVertexOrder}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-rose-300/30 bg-rose-300/10 px-3 py-2 text-xs font-black text-rose-100 hover:bg-rose-300/15 disabled:opacity-50"
                  >
                    {busy === 'admin_vertex_preview' ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
                    Prévisualiser Ava Vertex
                  </button>
                  <button
                    type="button"
                    title={ADMIN_HELP.vertexDispatch}
                    disabled={busy === 'admin_vertex'}
                    onClick={dispatchVertexOrder}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-400 px-3 py-2 text-xs font-black text-slate-950 hover:bg-rose-300 disabled:opacity-50"
                  >
                    {busy === 'admin_vertex' ? <Loader2 className="animate-spin" size={14} /> : <Crosshair size={14} />}
                    Envoyer Ava Vertex
                  </button>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 lg:col-span-2">
                  <div title={ADMIN_HELP.notification} className="flex items-center gap-2 text-emerald-100">
                    <Bell size={16} />
                    <p className="text-sm font-black">Notification mobile</p>
                    <HelpHint text={ADMIN_HELP.notification} />
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-[0.35fr_1fr_auto]">
                    <input
                      title={ADMIN_HELP.notificationTitle}
                      value={adminNotificationTitle}
                      onChange={event => setAdminNotificationTitle(event.target.value)}
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none"
                    />
                    <input
                      title={ADMIN_HELP.notificationBody}
                      value={adminNotificationBody}
                      onChange={event => setAdminNotificationBody(event.target.value)}
                      placeholder="Message à envoyer"
                      className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      title={ADMIN_HELP.notificationSend}
                      disabled={busy === 'admin_notification' || !adminNotificationBody.trim()}
                      onClick={sendAdminNotification}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950 hover:bg-emerald-200 disabled:opacity-50"
                    >
                      {busy === 'admin_notification' ? <Loader2 className="animate-spin" size={14} /> : <Bell size={14} />}
                      Envoyer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {canUseAdminConsole && adminAccessGranted && (
          <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-200">
                  <LockKeyhole size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-200">Admin</p>
                  <h2 className="mt-1 text-lg font-black text-white">Controle global des prises de position</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Disponible uniquement pour ton compte admin et ton IP autorisée. Le journal utilisateur affichera: bloqué par l’IA principale.
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
                      block_buy_entries: adminControl?.block_buy_entries === true,
                      block_sell_entries: adminControl?.block_sell_entries === true,
                      block_boom_buy_entries: adminControl?.block_boom_buy_entries === true,
                      block_boom_sell_entries: adminControl?.block_boom_sell_entries === true,
                      block_crash_buy_entries: adminControl?.block_crash_buy_entries === true,
                      block_crash_sell_entries: adminControl?.block_crash_sell_entries === true,
                      bypass_min_net_equity_usd: Number(adminControl?.bypass_min_net_equity_usd ?? 1000),
                      bypass_boom_buy_entries: adminControl?.bypass_boom_buy_entries === true,
                      bypass_boom_sell_entries: adminControl?.bypass_boom_sell_entries === true,
                      bypass_crash_buy_entries: adminControl?.bypass_crash_buy_entries === true,
                      bypass_crash_sell_entries: adminControl?.bypass_crash_sell_entries === true,
                      block_below_equity_enabled: adminControl?.block_below_equity_enabled === true,
                      min_equity_usd: Number(adminControl?.min_equity_usd ?? 10000),
                      volatility_sell_min_profit_override_enabled: adminControl?.volatility_sell_min_profit_override_enabled === true,
                      volatility_sell_min_profit_usd: Number(adminControl?.volatility_sell_min_profit_usd ?? 0.5),
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
            <div className="mt-4 grid gap-3 lg:grid-cols-3 2xl:grid-cols-6">
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
                  checked={adminControl?.block_buy_entries === true}
                  onChange={event => updateAdminControl({ block_buy_entries: event.target.checked })}
                  className="h-4 w-4 accent-emerald-300"
                />
                Bloquer BUY
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-100">
                <input
                  type="checkbox"
                  checked={adminControl?.block_sell_entries === true}
                  onChange={event => updateAdminControl({ block_sell_entries: event.target.checked })}
                  className="h-4 w-4 accent-rose-300"
                />
                Bloquer SELL
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
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-100">
                <input
                  type="checkbox"
                  checked={adminControl?.volatility_sell_min_profit_override_enabled === true}
                  onChange={event => updateAdminControl({ volatility_sell_min_profit_override_enabled: event.target.checked })}
                  className="h-4 w-4 accent-rose-300"
                />
                Forcer profit SELL
              </label>
              <label className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Profit SELL force USD</span>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={Number(adminControl?.volatility_sell_min_profit_usd ?? 0.5)}
                  onChange={event => updateAdminControl({ volatility_sell_min_profit_usd: toNumber(event.target.value, 0.5) })}
                  className="mt-2 w-full bg-transparent text-sm font-black text-white outline-none"
                />
              </label>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-200">Boom 1000</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.block_boom_buy_entries === true}
                      onChange={event => updateAdminControl({ block_boom_buy_entries: event.target.checked })}
                      className="h-4 w-4 accent-emerald-300"
                    />
                    Bloquer BUY Boom
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.block_boom_sell_entries === true}
                      onChange={event => updateAdminControl({ block_boom_sell_entries: event.target.checked })}
                      className="h-4 w-4 accent-rose-300"
                    />
                    Bloquer SELL Boom
                  </label>
                </div>
              </div>
              <div className="rounded-2xl border border-rose-400/15 bg-rose-400/[0.05] p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-200">Crash 1000</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.block_crash_buy_entries === true}
                      onChange={event => updateAdminControl({ block_crash_buy_entries: event.target.checked })}
                      className="h-4 w-4 accent-emerald-300"
                    />
                    Bloquer BUY Crash
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.block_crash_sell_entries === true}
                      onChange={event => updateAdminControl({ block_crash_sell_entries: event.target.checked })}
                      className="h-4 w-4 accent-rose-300"
                    />
                    Bloquer SELL Crash
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(180px,260px)_1fr]">
                <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Bypass capital net USD</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={Number(adminControl?.bypass_min_net_equity_usd ?? 1000)}
                    onChange={event => updateAdminControl({ bypass_min_net_equity_usd: toNumber(event.target.value, 1000) })}
                    className="mt-2 w-full bg-transparent text-sm font-black text-white outline-none"
                  />
                </label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.bypass_boom_buy_entries === true}
                      onChange={event => updateAdminControl({ bypass_boom_buy_entries: event.target.checked })}
                      className="h-4 w-4 accent-emerald-300"
                    />
                    Autoriser BUY Boom
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.bypass_boom_sell_entries === true}
                      onChange={event => updateAdminControl({ bypass_boom_sell_entries: event.target.checked })}
                      className="h-4 w-4 accent-rose-300"
                    />
                    Autoriser SELL Boom
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.bypass_crash_buy_entries === true}
                      onChange={event => updateAdminControl({ bypass_crash_buy_entries: event.target.checked })}
                      className="h-4 w-4 accent-emerald-300"
                    />
                    Autoriser BUY Crash
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.bypass_crash_sell_entries === true}
                      onChange={event => updateAdminControl({ bypass_crash_sell_entries: event.target.checked })}
                      className="h-4 w-4 accent-rose-300"
                    />
                    Autoriser SELL Crash
                  </label>
                </div>
              </div>
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
                  ['Rebond Volatility', 'boomReboundBuyEnabled'],
                  ['Burst SELL', 'boomBurstEnabled'],
                  ['Paliers Rebond', 'boomReboundLevelsEnabled'],
                  ['Limiter Rebond session', 'boomReboundSessionLimitEnabled'],
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
              placeholder="Ex: Mets le lot à 0.2 et active Rebond Volatility"
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
