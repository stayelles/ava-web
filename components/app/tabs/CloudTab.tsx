'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ArrowLeftRight,
  Bell,
  Cloud,
  Coins,
  Crosshair,
  ExternalLink,
  LockKeyhole,
  Loader2,
  Monitor,
  Plus,
  Power,
  RefreshCcw,
  RotateCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Terminal,
  Trash2,
  Users,
} from 'lucide-react'
import { SUPABASE_HEADERS, SUPABASE_URL } from '../constants'
import type { StopCyclePolicy, StopCycleRule } from '../stopCycleTypes'
import type { UserData } from '../types'
import { AdminAssistancePanel } from '../admin/AdminAssistancePanel'

const ADMIN_ACCESS_TOKEN_KEY = 'ava_admin_access_token'
const ADMIN_TRUSTED_DEVICE_KEY = 'ava_admin_trusted_device_token'

const fetchWithTransientRetry = async (
  url: string,
  init: RequestInit,
  attempts = 3,
): Promise<Response> => {
  let lastError: unknown = null
  for (let attempt = 0; attempt < Math.max(1, attempts); attempt += 1) {
    try {
      const response = await fetch(url, init)
      const transient = response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500
      if (!transient || attempt === attempts - 1) return response
    } catch (error) {
      lastError = error
      if (attempt === attempts - 1) throw error
    }
    await new Promise(resolve => window.setTimeout(resolve, 300 * (2 ** attempt)))
  }
  throw lastError instanceof Error ? lastError : new Error('Service Ava temporairement indisponible.')
}

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
  max_boom_buy_open_positions?: number | null
  max_boom_sell_open_positions?: number | null
  max_crash_buy_open_positions?: number | null
  max_crash_sell_open_positions?: number | null
  capital_position_limit_rules?: TradingCapitalPositionLimitRule[] | null
  volatility_recommendation_rules?: TradingVolatilityRecommendationRule[] | null
  bypass_min_net_equity_usd?: number | null
  bypass_boom_buy_entries?: boolean | null
  bypass_boom_sell_entries?: boolean | null
  bypass_crash_buy_entries?: boolean | null
  bypass_crash_sell_entries?: boolean | null
  block_below_equity_enabled?: boolean | null
  min_equity_usd?: number | null
  volatility_sell_min_profit_override_enabled?: boolean | null
  volatility_sell_min_profit_usd?: number | null
  volatility_default_config?: Record<string, unknown> | null
  price_guard_rules?: TradingPriceGuardRule[] | null
  dual_entry_zone_rules?: TradingDualEntryZoneRule[] | null
  stop_cycle_policy?: StopCyclePolicy | null
  public_reason?: string | null
  updated_at?: string | null
}

type TradingCapitalPositionLimitRule = {
  id: string
  enabled: boolean
  max_equity_usd: number
  max_total_open_positions: number
  max_stop_cycle_open_positions: number
}

type TradingVolatilityRecommendationRule = {
  id: string
  enabled: boolean
  min_equity_usd: number
  max_equity_usd: number | null
  max_total_open_positions: number
  max_boom_buy_open_positions: number
  max_boom_sell_open_positions: number
  max_crash_buy_open_positions: number
  max_crash_sell_open_positions: number
  configuration_guidance: string
}

type TradingPriceGuardRule = {
  id: string
  enabled: boolean
  market_key: string
  min_price: number | null
  max_price: number | null
  block_buy: boolean
  block_sell: boolean
  release_buffer_points: number
  starts_at?: string | null
  ends_at?: string | null
}

type TradingDualEntryZoneRule = {
  id: string
  enabled: boolean
  market_key: string
  min_price: number | null
  max_price: number | null
  starts_at?: string | null
  ends_at?: string | null
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
const PRICE_GUARD_MARKET_OPTIONS = [
  { key: 'BOOM1000', label: 'Boom 1000' },
  { key: 'CRASH1000', label: 'Crash 1000' },
  { key: 'BOOM900', label: 'Boom 900' },
  { key: 'CRASH900', label: 'Crash 900' },
  { key: 'BOOM600', label: 'Boom 600' },
  { key: 'CRASH600', label: 'Crash 600' },
  { key: 'BOOM500', label: 'Boom 500' },
  { key: 'CRASH500', label: 'Crash 500' },
  { key: 'BOOM300N', label: 'Boom 300' },
  { key: 'CRASH300N', label: 'Crash 300' },
  { key: 'BOOM100', label: 'Boom 100' },
  { key: 'CRASH100', label: 'Crash 100' },
  { key: 'BOOM50', label: 'Boom 50' },
  { key: 'CRASH50', label: 'Crash 50' },
]
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

const GLOBAL_CONTROL_HELP = {
  save:
    'Enregistre tous les réglages de ce bloc et les transmet à Ava Desktop.\nUne barrière valide reste affichée après l’enregistrement et arrive sur les moteurs actifs en environ 30 secondes.',
  blockAll:
    'Bloque toutes les nouvelles prises de position et tous les nouveaux renforts, BUY comme SELL, sur les marchés concernés.\nLes positions déjà ouvertes ne sont pas fermées.',
  blockBuy:
    'Bloque globalement toutes les nouvelles positions BUY.\nUtilise les blocages par marché ou les barrières de prix si tu veux cibler uniquement Boom, Crash ou une zone de prix.',
  blockSell:
    'Bloque globalement toutes les nouvelles positions SELL.\nUtilise les blocages par marché ou les barrières de prix si tu veux cibler uniquement Boom, Crash ou une zone de prix.',
  blockBelowEquity:
    'Quand cette option est active, Ava bloque les nouvelles entrées si l’equity du compte est inférieure au capital minimum défini à côté.',
  minEquity:
    'Equity minimale en USD exigée pour autoriser de nouvelles entrées.\nL’equity inclut le capital et le profit ou la perte flottante.',
  forceSellProfit:
    'Impose un seuil minimum de profit SELL commun à Ava Volatility.\nCela ne ferme pas une position en perte et ne remplace pas les autres protections.',
  forcedSellProfit:
    'Montant minimum en USD utilisé lorsque « Forcer profit SELL » est activé.\nExemple : 0,50 signifie qu’un encaissement SELL doit atteindre au moins +0,50 USD.',
  marketBlock:
    'Bloque cette direction uniquement sur ce marché, pour les nouvelles entrées et les nouveaux renforts.\nLes positions déjà ouvertes restent intactes.',
  maxOpen:
    'Plafond administrateur de positions ouvertes pour ce marché et cette direction.\n0 conserve la limite configurée par l’utilisateur. Une valeur positive ne peut que réduire cette limite.',
  capitalLimits:
    'Applique automatiquement des plafonds selon l’equity actuelle du compte.\nLe plafond total compte toutes les positions : directes, Burst, Rebond, manuelles suivies et Stop Cycle. Le plafond Stop Cycle ne compte que les positions issues des cycles.\nCes règles bloquent uniquement de nouvelles entrées et ne ferment jamais une position existante.',
  capitalThreshold:
    'La règle s’applique lorsque l’equity actuelle est strictement inférieure à cette valeur.\nExemple : 1000 applique la règle de 0 à 999,99 USD.',
  maxTotalPositions:
    'Nombre maximal de positions ouvertes au total, toutes origines et tous marchés confondus.\n0 désactive uniquement ce plafond.',
  maxStopCyclePositions:
    'Nombre maximal de positions Stop Cycle ouvertes au total, Boom et Crash confondus.\n0 désactive uniquement ce plafond.',
  recommendations:
    'Conseils consultatifs utilisés par Ava vocale lorsqu’elle dispose d’une equity Desktop récente.\nIls ne modifient aucun droit, aucune protection et aucune limite d’exécution. Ava demande toujours confirmation avant de proposer l’application d’une configuration.',
  barriers:
    'Une barrière bloque BUY, SELL ou les deux uniquement lorsque le prix du marché se trouve dans la zone définie.\nElle n’agit jamais sur les positions déjà ouvertes.',
  enabled:
    'Active ou désactive cette barrière sans la supprimer.\nUne barrière désactivée reste enregistrée mais n’empêche aucune entrée.',
  market:
    'Marché exact auquel cette barrière s’applique.\nUne règle Crash 1000 n’affecte ni Boom 1000 ni les autres indices.',
  minPrice:
    'Borne basse inclusive de la zone.\nAvec minimum 5500 et maximum 5900, la barrière agit seulement de 5500 à 5900 inclus : 5499 est autorisé, 5500 est bloqué.\nSi le maximum reste vide, elle agit à 5500 et au-dessus sans limite haute.',
  maxPrice:
    'Borne haute inclusive de la zone.\nAvec minimum 5500 et maximum 5900, la barrière agit seulement de 5500 à 5900 inclus : 5900 est bloqué, 5901 est autorisé.\nSi le minimum reste vide, elle agit à 5900 et en dessous sans limite basse.',
  releaseBuffer:
    'Distance supplémentaire à franchir avant de réautoriser la direction après être sorti de la zone.\nElle évite que le blocage s’active et se désactive sans cesse près de la limite.\nExemple : maximum 5000 + marge 20 réautorise seulement au-dessus de 5020.',
  blockDirection:
    'Choisis la ou les directions interdites dans cette zone.\nAu moins BUY ou SELL doit être sélectionné.',
  schedule:
    'Facultatif. « Active à partir de » retarde le début de la règle. « Expire à » l’arrête automatiquement.\nSans dates, la barrière reste active jusqu’à modification ou suppression.',
  bypassEquity:
    'Seuil d’equity nette à partir duquel les autorisations exceptionnelles ci-contre peuvent contourner certains blocages globaux.\nÀ utiliser avec prudence : les barrières de prix et les limites de sécurité restent prioritaires.',
  bypassDirection:
    'Autorisation exceptionnelle de cette direction lorsque l’equity nette atteint le seuil de bypass.\nElle ne supprime pas les protections locales ni les barrières de prix actives.',
  dualZones:
    'Dans une zone synchronisée, toute nouvelle entrée Ava déjà autorisée demande sa position opposée après confirmation de la première.\nExemple : Boom 1000 entre 5500 et 5900. Si Ava ouvre BUY à 5700, elle demande aussi SELL. Les deux restent soumises au plan, aux blocages, aux barrières et aux capacités.',
  dualEnabled:
    'Active ou désactive cette zone sans la supprimer.\nDésactivée, elle reste enregistrée mais Ava ne crée aucune paire BUY + SELL.',
  dualMarket:
    'Marché exact de la zone synchronisée.\nExemple : Boom 1000 ne s’applique pas à Boom 500 ni à Crash 1000.',
  dualMin:
    'Début inclusif obligatoire de la zone.\nExemple : 5500 signifie que la synchronisation commence à 5500, pas à 5499.',
  dualMax:
    'Fin inclusive obligatoire de la zone.\nExemple : 5900 signifie que la synchronisation fonctionne encore à 5900, mais plus à 5901.',
  instantSignal:
    'Envoie un signal de marché court à tous les moteurs connectés et éligibles.\nUn moteur l’exécute une seule fois seulement si le marché exact est connecté et si toutes ses protections l’autorisent. Le signal est automatiquement abandonné à son expiration.',
  instantMarket:
    'Marché exact du signal.\nExemple : Boom 1000 cible uniquement les moteurs dont le Bridge Boom 1000 est connecté.',
  instantDirection:
    'Direction de la nouvelle position demandée : BUY pour achat ou SELL pour vente.\nLe lot reste celui de la configuration autorisée de chaque utilisateur.',
  instantEquity:
    'Equity nette minimale après prise en compte du profit ou de la perte flottante.\nExemple : minimum 5000 USD exclut un compte avec balance 5500 USD mais equity actuelle 4800 USD.',
  instantTtl:
    'Durée de validité du signal : une ou deux minutes.\nAva attend la réception par Desktop puis la confirmation de la position par MT5. Si une protection bloque l’entrée, le motif exact est affiché au lieu d’annoncer seulement que le signal a été envoyé.',
  stopCycleFeature:
    'Interrupteur général, désactivé par défaut pour les comptes non-owner.\nDésactivé, Ava Desktop masque entièrement Ava Alpha et refuse toute nouvelle action STOP, LIMIT ou STOP-LIMIT. L’owner garde son accès. Les positions déjà déclenchées ne sont jamais liquidées; seuls les ordres encore en attente sont annulés.',
  stopCycle:
    'Ava Alpha propose trois familles indépendantes : STOP pour la cassure, LIMIT pour le rebond et STOP-LIMIT pour la cassure suivie d’un retest.\nUne famille est choisie par nouveau cycle. Pour chaque famille, BUY et SELL sont indépendants. L’administrateur configure les règles globales ou par tranche de capital; Custom Max 2 les consulte en lecture seule. À l’objectif, seuls les tickets individuellement positifs sont fermés.',
  stopCycleMode:
    'Bloqué : aucun nouveau cycle non-owner.\nAutorisé : l’owner et les comptes Custom Max 2 autorisés peuvent utiliser Ava Alpha.\nForcé : Desktop active Ava Alpha selon la règle effective, sans contourner les sécurités. L’owner reste visible quel que soit l’interrupteur global.',
  stopCycleForced:
    'Le mode forcé ne contourne jamais un blocage BUY/SELL, une autorisation de type, une zone, une capacité, le plan, le mode hedging, l’autorisation du compte réel ou AvaBridge 1.68.\nExemple : si BUY est autorisé et SELL bloqué pour une famille, Ava lance uniquement le côté BUY.',
  stopCycleMarket:
    'Marché exact de la règle Stop Cycle.\nLa première bêta accepte uniquement Boom 1000 ou Crash 1000.',
  stopCycleMin:
    'Borne basse inclusive.\nExemple : minimum 5500 autorise la règle à 5500 et au-dessus. Si le maximum est vide, il n’y a pas de limite haute.',
  stopCycleMax:
    'Borne haute inclusive.\nExemple : maximum 5900 autorise la règle à 5900 et en dessous. Si le minimum est vide, il n’y a pas de limite basse.',
  stopCycleEquity:
    'Equity MT5 minimale après prise en compte du flottant, sans double déduction.\nExemple : balance 5500 et flottant -700 donnent une equity de 4800 ; une règle à 5000 refuse le cycle.',
  stopCycleMaxOrders:
    'Plafond administrateur d’ordres par direction active, de 1 à 100.\nLe Desktop peut demander moins, mais jamais davantage que ce plafond. Exemple : Web 100 et Desktop 25 donnent 25 ordres sur chaque direction autorisée ; Web 20 et Desktop 100 restent limités à 20. Une direction bloquée reste à zéro sans empêcher l’autre.',
  stopCycleMaxConcurrent:
    'Nombre maximal de cycles indépendants encore ouverts sur ce marché, de 1 à 10.\nUn ancien panier négatif n’empêche plus un nouveau cycle tant que ce plafond n’est pas atteint. Chaque cycle conserve sa propre famille, son objectif et son expiration.',
  stopCycleBlockSide:
    'Bloque uniquement cette direction. Si BUY est autorisé et SELL bloqué, Ava crée un cycle BUY seul ; si SELL est autorisé et BUY bloqué, Ava crée un cycle SELL seul. La famille est refusée uniquement lorsque ses deux directions sont bloquées.',
  stopCycleSchedule:
    'Plage facultative de validité de cette règle.\nSans dates, la règle reste disponible. Avec début et fin, les deux bornes de temps doivent être cohérentes.',
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

function newPriceGuardRule(): TradingPriceGuardRule {
  const id = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `price-guard-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    enabled: true,
    market_key: 'CRASH1000',
    min_price: null,
    max_price: null,
    block_buy: false,
    block_sell: true,
    release_buffer_points: 0,
    starts_at: null,
    ends_at: null,
  }
}

function newCapitalPositionLimitRule(): TradingCapitalPositionLimitRule {
  const id = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `capital-limit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    enabled: true,
    max_equity_usd: 1000,
    max_total_open_positions: 14,
    max_stop_cycle_open_positions: 20,
  }
}

function newVolatilityRecommendationRule(): TradingVolatilityRecommendationRule {
  const id = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `volatility-advice-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    enabled: true,
    min_equity_usd: 0,
    max_equity_usd: 1000,
    max_total_open_positions: 10,
    max_boom_buy_open_positions: 0,
    max_boom_sell_open_positions: 0,
    max_crash_buy_open_positions: 0,
    max_crash_sell_open_positions: 0,
    configuration_guidance: '',
  }
}

function newDualEntryZoneRule(): TradingDualEntryZoneRule {
  const id = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `dual-zone-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    enabled: true,
    market_key: 'BOOM1000',
    min_price: null,
    max_price: null,
    starts_at: null,
    ends_at: null,
  }
}

function newStopCycleRule(marketKey: StopCycleRule['market_key'] = 'BOOM1000'): StopCycleRule {
  const id = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `stop-cycle-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  return {
    id,
    enabled: true,
    market_key: marketKey,
    scope: 'global',
    block_buy_stop: false,
    block_sell_stop: false,
    allow_buy_limit: false,
    allow_sell_limit: false,
    allow_buy_stop_limit: false,
    allow_sell_stop_limit: false,
    min_price: null,
    max_price: null,
    min_net_equity_usd: 0,
    max_net_equity_usd: null,
    max_orders_per_side: 2,
    max_concurrent_cycles: 1,
    basket_target_usd: 3,
    distance_mode: 'broker_minimum',
    distance_points: 0,
    expiration_seconds: 300,
    rearm_seconds: 30,
    starts_at: null,
    ends_at: null,
  }
}

function optionalInputNumber(value: string): number | null {
  if (!value.trim()) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null
}

function localDateTimeValue(value: string | null | undefined): string {
  if (!value) return ''
  const parsed = new Date(value)
  if (!Number.isFinite(parsed.getTime())) return ''
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
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

function toPositionLimit(value: unknown) {
  return Math.max(0, Math.min(1000, Math.floor(toNumber(value, 0))))
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
  return ['custom_pro', 'custom_ultra', 'custom_max', 'custom_max_2'].includes(plan) && (customActive || subscriptionActive)
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
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex flex-shrink-0">
      <button
        type="button"
        title="Afficher l’explication"
        aria-label="Afficher l’explication"
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setOpen(current => !current)
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[11px] font-black leading-none text-slate-300 transition-colors hover:border-sky-300/40 hover:bg-sky-300/10 hover:text-sky-200"
      >
        ?
      </button>
      {open ? (
        <span
          role="note"
          className="absolute left-1/2 top-7 z-50 w-[min(19rem,calc(100vw-2rem))] -translate-x-1/2 whitespace-pre-line rounded-xl border border-sky-300/20 bg-slate-950 p-3 text-left text-xs font-medium normal-case leading-5 tracking-normal text-slate-200 shadow-2xl shadow-black/60"
        >
          {text}
        </span>
      ) : null}
    </span>
  )
}

function validatePriceGuardRules(rules: TradingPriceGuardRule[]) {
  const errors: Record<string, string> = {}
  rules.forEach((rule, index) => {
    const messages: string[] = []
    if (rule.min_price === null && rule.max_price === null) {
      messages.push('Renseigne au moins un prix minimum ou maximum.')
    }
    if (rule.min_price !== null && rule.max_price !== null && rule.min_price > rule.max_price) {
      messages.push('Le prix minimum ne peut pas dépasser le prix maximum.')
    }
    if (!rule.block_buy && !rule.block_sell) {
      messages.push('Sélectionne au moins Bloquer BUY ou Bloquer SELL.')
    }
    if (rule.starts_at && rule.ends_at && Date.parse(rule.starts_at) >= Date.parse(rule.ends_at)) {
      messages.push('La date de fin doit être postérieure à la date de début.')
    }
    if (messages.length) errors[rule.id] = `Barrière ${index + 1} : ${messages.join(' ')}`
  })
  return errors
}

function validateDualEntryZoneRules(rules: TradingDualEntryZoneRule[]) {
  const errors: Record<string, string> = {}
  rules.forEach((rule, index) => {
    const messages: string[] = []
    if (rule.min_price === null || rule.max_price === null) {
      messages.push('Renseigne obligatoirement le prix minimum et le prix maximum.')
    }
    if (rule.min_price !== null && rule.max_price !== null && rule.min_price > rule.max_price) {
      messages.push('Le prix minimum ne peut pas dépasser le prix maximum.')
    }
    if (rule.starts_at && rule.ends_at && Date.parse(rule.starts_at) >= Date.parse(rule.ends_at)) {
      messages.push('La date de fin doit être postérieure à la date de début.')
    }
    if (messages.length) errors[rule.id] = `Zone ${index + 1} : ${messages.join(' ')}`
  })
  return errors
}

function validateStopCycleRules(rules: StopCycleRule[]) {
  const errors: Record<string, string> = {}
  rules.forEach((rule, index) => {
    const messages: string[] = []
    if (!['BOOM1000', 'CRASH1000'].includes(rule.market_key)) {
      messages.push('Le marché doit être Boom 1000 ou Crash 1000.')
    }
    if (rule.min_price !== null && rule.max_price !== null && rule.min_price > rule.max_price) {
      messages.push('Le prix minimum ne peut pas dépasser le prix maximum.')
    }
    if (!Number.isInteger(rule.max_orders_per_side) || rule.max_orders_per_side < 1 || rule.max_orders_per_side > 100) {
      messages.push('Le plafond doit contenir entre 1 et 100 ordres par côté.')
    }
    const maxConcurrentCycles = rule.max_concurrent_cycles ?? 1
    if (!Number.isInteger(maxConcurrentCycles) || maxConcurrentCycles < 1 || maxConcurrentCycles > 10) {
      messages.push('Le nombre de cycles simultanés doit être compris entre 1 et 10.')
    }
    if (!Number.isFinite(rule.min_net_equity_usd) || rule.min_net_equity_usd < 0) {
      messages.push('L’equity minimale doit être positive ou nulle.')
    }
    if (
      rule.scope === 'equity_range'
      && (rule.max_net_equity_usd === null || rule.max_net_equity_usd <= rule.min_net_equity_usd)
    ) {
      messages.push('Une tranche de capital exige un maximum strictement supérieur au minimum.')
    }
    if (!Number.isFinite(rule.basket_target_usd) || rule.basket_target_usd <= 0) {
      messages.push('Le panier cible doit être strictement positif.')
    }
    if (rule.distance_mode === 'custom' && (!Number.isFinite(rule.distance_points) || rule.distance_points <= 0)) {
      messages.push('La distance personnalisée doit être strictement positive.')
    }
    if (rule.starts_at && rule.ends_at && Date.parse(rule.starts_at) >= Date.parse(rule.ends_at)) {
      messages.push('La date de fin doit être postérieure à la date de début.')
    }
    if (messages.length) errors[rule.id] = `Règle Ava Alpha ${index + 1} : ${messages.join(' ')}`
  })
  rules.filter(rule => rule.enabled !== false && rule.scope === 'equity_range').forEach((rule, index, rangedRules) => {
    const overlaps = rangedRules.some((other, otherIndex) => (
      otherIndex !== index
      && other.market_key === rule.market_key
      && rule.min_net_equity_usd < Number(other.max_net_equity_usd ?? Number.POSITIVE_INFINITY)
      && other.min_net_equity_usd < Number(rule.max_net_equity_usd ?? Number.POSITIVE_INFINITY)
    ))
    if (overlaps) errors[rule.id] = `Règle Ava Alpha : cette tranche de capital chevauche une autre tranche ${rule.market_key}.`
  })
  return errors
}

function isAvaWebSessionExpired(payload: Record<string, unknown>, message: string): boolean {
  const code = String(payload.code ?? payload.error_code ?? '').trim().toUpperCase()
  if (['AVA_SESSION_EXPIRED', 'WEB_SESSION_EXPIRED', 'SESSION_EXPIRED'].includes(code)) return true
  const normalized = message.toLowerCase()
  return normalized.includes('session ava web expiree') || normalized.includes('session ava web expirée')
}

export function CloudTab({ user, language = 'fr', onGoToSubscription, onSessionExpired }: { user: UserData; language?: string; onGoToSubscription?: () => void; onSessionExpired?: () => void }) {
  const tr = useCallback((fr: string, en: string) => language === 'en' ? en : fr, [language])
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
  const [adminControlMessage, setAdminControlMessage] = useState('')
  const [adminVolatilityDefaultJson, setAdminVolatilityDefaultJson] = useState('{}')
  const [priceGuardErrors, setPriceGuardErrors] = useState<Record<string, string>>({})
  const [dualEntryZoneErrors, setDualEntryZoneErrors] = useState<Record<string, string>>({})
  const [stopCycleErrors, setStopCycleErrors] = useState<Record<string, string>>({})
  const [instantSignal, setInstantSignal] = useState({
    marketKey: 'BOOM1000',
    direction: 'BUY' as 'BUY' | 'SELL',
    minNetEquityUsd: 5000,
    maxNetEquityUsd: 0,
    minFreeMarginUsd: 0,
    maxPriceDeviationPoints: 15,
    maxPriceDeviationPct: 0.1,
    maxSpreadPoints: 0,
    lotPolicy: 'local' as 'local' | 'master' | 'proportional',
    proportionalBaseEquityUsd: 5000,
    targetScope: 'all' as 'all' | 'devices' | 'groups',
    targetDeviceIds: [] as string[],
    targetGroupIds: [] as string[],
    targetPlanKeys: ['custom_max', 'custom_max_2'] as string[],
    ttlSeconds: 120,
  })
  const [instantSignalMessage, setInstantSignalMessage] = useState('')
  const [copyDevices, setCopyDevices] = useState<Array<Record<string, any>>>([])
  const [copyGroups, setCopyGroups] = useState<Array<Record<string, any>>>([])
  const [copyMasterConfig, setCopyMasterConfig] = useState<Record<string, any> | null>(null)
  const [copySimulation, setCopySimulation] = useState<Record<string, any> | null>(null)
  const [copyNetworkMessage, setCopyNetworkMessage] = useState('')
  const [copyGroupName, setCopyGroupName] = useState('')
  const [copyGroupDeviceIds, setCopyGroupDeviceIds] = useState<string[]>([])
  const [supportQuery, setSupportQuery] = useState('')
  const [supportUsers, setSupportUsers] = useState<SupportUser[]>([])
  const [supportSelected, setSupportSelected] = useState<SupportUser | null>(null)
  const [supportCommands, setSupportCommands] = useState<SupportCommand[]>([])
  const [supportShell, setSupportShell] = useState('Get-Process -Name Ava,terminal64 -ErrorAction SilentlyContinue | Select-Object ProcessName,Id,StartTime | ConvertTo-Json')
  const [supportRdpPassword, setSupportRdpPassword] = useState('')
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
    if (isAvaWebSessionExpired(json, message)) {
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
    if (isAvaWebSessionExpired(json, message)) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [onSessionExpired, user.id, user.web_session_token])

  const callAdminControl = useCallback(async (payload: Record<string, unknown>) => {
    const token = adminAccessToken || (typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) ?? '' : '')
    const res = await fetchWithTransientRetry(`${SUPABASE_URL}/functions/v1/trading-admin-control`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ user_id: user.id, web_session_token: user.web_session_token, admin_access_token: token || undefined, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Controle admin indisponible.')
    if (isAvaWebSessionExpired(json, message)) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [adminAccessToken, onSessionExpired, user.id, user.web_session_token])

  const callAdminSignal = useCallback(async (payload: Record<string, unknown>) => {
    const token = adminAccessToken || (typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) ?? '' : '')
    const res = await fetchWithTransientRetry(`${SUPABASE_URL}/functions/v1/trading-admin-signal`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({
        user_id: user.id,
        web_session_token: user.web_session_token,
        admin_access_token: token || undefined,
        ...payload,
      }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Signal Ava indisponible.')
    if (isAvaWebSessionExpired(json, message)) {
      onSessionExpired?.()
      throw new Error('Session Ava Web expirée. Reconnectez-vous.')
    }
    if (!res.ok || json.ok === false) throw new Error(message)
    return json
  }, [adminAccessToken, onSessionExpired, user.id, user.web_session_token])

  const loadCopyNetwork = useCallback(async () => {
    if (!adminAccessGranted) return
    try {
      const [devicesResult, groupsResult, configResult] = await Promise.all([
        callAdminSignal({ action: 'devices' }),
        callAdminSignal({ action: 'groups_get' }),
        callAdminSignal({ action: 'master_config_get' }),
      ])
      const devices = Array.isArray(devicesResult.devices) ? devicesResult.devices as Array<Record<string, any>> : []
      setCopyDevices(devices)
      setCopyGroups(Array.isArray(groupsResult.groups) ? groupsResult.groups as Array<Record<string, any>> : [])
      setCopyMasterConfig(configResult.config && typeof configResult.config === 'object'
        ? configResult.config as Record<string, any>
        : {
            enabled: false,
            master_device_id: String(devices[0]?.device_id ?? ''),
            target_scope: 'devices',
            target_device_ids: [],
            target_group_ids: [],
            target_plan_keys: ['custom_max', 'custom_max_2'],
            require_opt_in: true,
            min_net_equity_usd: 0,
            max_net_equity_usd: null,
            min_free_margin_usd: 0,
            max_price_deviation_points: 15,
            max_price_deviation_pct: 0.1,
            max_spread_points: null,
            ttl_seconds: 3,
            lot_policy: 'local',
            proportional_base_equity_usd: null,
            sync_modifications: true,
            sync_closes: true,
          })
    } catch (err) {
      setCopyNetworkMessage(err instanceof Error ? err.message : tr('Réseau Ava S indisponible.', 'Ava S network is unavailable.'))
    }
  }, [adminAccessGranted, callAdminSignal, tr])

  useEffect(() => {
    if (!adminAccessGranted) return
    void loadCopyNetwork()
  }, [adminAccessGranted, loadCopyNetwork])

  const saveCopyMasterConfig = useCallback(async () => {
    if (!copyMasterConfig) return
    try {
      setBusy('copy_master_save')
      setCopyNetworkMessage('')
      const result = await callAdminSignal({
        action: 'master_config_set',
        ...copyMasterConfig,
        max_net_equity_usd: Number(copyMasterConfig.max_net_equity_usd ?? 0) > 0 ? Number(copyMasterConfig.max_net_equity_usd) : null,
        max_spread_points: Number(copyMasterConfig.max_spread_points ?? 0) > 0 ? Number(copyMasterConfig.max_spread_points) : null,
      })
      setCopyMasterConfig(result.config as Record<string, any>)
      setCopyNetworkMessage(tr('Configuration maître Ava S enregistrée.', 'Ava S master configuration saved.'))
    } catch (err) {
      setCopyNetworkMessage(err instanceof Error ? err.message : tr('Enregistrement impossible.', 'Unable to save.'))
    } finally {
      setBusy(null)
    }
  }, [callAdminSignal, copyMasterConfig, tr])

  const simulateCopySignal = useCallback(async () => {
    try {
      setBusy('copy_simulate')
      const result = await callAdminSignal({
        action: 'simulate',
        event_type: 'open',
        market_key: instantSignal.marketKey,
        direction: instantSignal.direction,
        min_net_equity_usd: instantSignal.minNetEquityUsd,
        max_net_equity_usd: instantSignal.maxNetEquityUsd > 0 ? instantSignal.maxNetEquityUsd : null,
        min_free_margin_usd: instantSignal.minFreeMarginUsd,
        target_scope: instantSignal.targetScope,
        target_device_ids: instantSignal.targetDeviceIds.length ? instantSignal.targetDeviceIds : (copyMasterConfig?.target_device_ids ?? []),
        target_group_ids: instantSignal.targetGroupIds.length ? instantSignal.targetGroupIds : (copyMasterConfig?.target_group_ids ?? []),
        target_plan_keys: instantSignal.targetPlanKeys,
        require_opt_in: true,
      })
      setCopySimulation(result)
      setCopyNetworkMessage(tr(
        `Simulation : ${Number(result.eligible ?? 0)} ordinateur(s) éligible(s) sur ${Number(result.total ?? 0)}.`,
        `Simulation: ${Number(result.eligible ?? 0)} eligible computer(s) out of ${Number(result.total ?? 0)}.`,
      ))
    } catch (err) {
      setCopyNetworkMessage(err instanceof Error ? err.message : tr('Simulation impossible.', 'Simulation failed.'))
    } finally {
      setBusy(null)
    }
  }, [callAdminSignal, copyMasterConfig, instantSignal, tr])

  const emergencyStopCopyNetwork = useCallback(async () => {
    if (!window.confirm(tr(
      'Arrêter immédiatement toute nouvelle diffusion Ava S ? Les positions déjà ouvertes seront conservées.',
      'Immediately stop all new Ava S broadcasts? Existing positions will be preserved.',
    ))) return
    try {
      setBusy('copy_emergency')
      await callAdminSignal({
        action: 'emergency_stop',
        idempotency_key: `emergency:${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        ttl_seconds: 120,
        target_scope: 'all',
      })
      setCopyMasterConfig(current => current ? { ...current, enabled: false } : current)
      setCopyNetworkMessage(tr('Diffusion Ava S arrêtée. Positions existantes conservées.', 'Ava S broadcasting stopped. Existing positions were preserved.'))
    } catch (err) {
      setCopyNetworkMessage(err instanceof Error ? err.message : tr('Arrêt impossible.', 'Unable to stop.'))
    } finally {
      setBusy(null)
    }
  }, [callAdminSignal, tr])

  const saveCopyGroup = useCallback(async () => {
    if (!copyGroupName.trim()) return
    try {
      setBusy('copy_group_save')
      await callAdminSignal({
        action: 'group_save',
        name: copyGroupName.trim(),
        member_device_ids: copyGroupDeviceIds,
      })
      setCopyGroupName('')
      setCopyGroupDeviceIds([])
      await loadCopyNetwork()
      setCopyNetworkMessage(tr('Groupe Ava S créé.', 'Ava S group created.'))
    } catch (err) {
      setCopyNetworkMessage(err instanceof Error ? err.message : tr('Création du groupe impossible.', 'Unable to create group.'))
    } finally {
      setBusy(null)
    }
  }, [callAdminSignal, copyGroupDeviceIds, copyGroupName, loadCopyNetwork, tr])

  const deleteCopyGroup = useCallback(async (groupId: string) => {
    try {
      setBusy(`copy_group_delete:${groupId}`)
      await callAdminSignal({ action: 'group_delete', group_id: groupId })
      await loadCopyNetwork()
      setCopyNetworkMessage(tr('Groupe supprimé.', 'Group deleted.'))
    } catch (err) {
      setCopyNetworkMessage(err instanceof Error ? err.message : tr('Suppression impossible.', 'Unable to delete group.'))
    } finally {
      setBusy(null)
    }
  }, [callAdminSignal, loadCopyNetwork, tr])

  const callAdminConsole = useCallback(async (payload: Record<string, unknown>) => {
    const token = adminAccessToken || (typeof window !== 'undefined' ? window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY) ?? '' : '')
    const res = await fetch(`${SUPABASE_URL}/functions/v1/trading-admin-console`, {
      method: 'POST',
      headers: SUPABASE_HEADERS,
      body: JSON.stringify({ user_id: user.id, web_session_token: user.web_session_token, admin_access_token: token || undefined, ...payload }),
    })
    const json = await res.json().catch(() => ({}))
    const message = String(json.error ?? 'Console admin indisponible.')
    if (isAvaWebSessionExpired(json, message)) {
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
    if (isAvaWebSessionExpired(json, message)) {
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
        const token = String(result.admin_access_token ?? '')
        if (token) {
          setAdminAccessToken(token)
          window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token)
        }
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
      setAdminCodeSent(false)
      setAdminCode('')
      setAdminAccessMessage('Code admin expire. Demandez un nouveau code pour continuer.')
    }, 1000)
    return () => window.clearInterval(timer)
  }, [adminAccessGranted, adminCodeDeadline])

  useEffect(() => {
    if (!canUseAdminConsole || !adminAccessGranted) {
      setAdminLoaded(false)
      return
    }
    let active = true
    callAdminControl({ action: 'status' })
      .then((result) => {
        if (!active) return
        const control = result.control as TradingGlobalControl | null | undefined
        setAdminControl(control ?? null)
        setAdminVolatilityDefaultJson(JSON.stringify(control?.volatility_default_config ?? {}, null, 2))
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
  const bridgeOutdated = agentConnected && instance?.bridge_version && Number.isFinite(bridgeVersionNumber) && bridgeVersionNumber < 1.68
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
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      ...patch,
    }))
  }, [])
  const saveAdminVolatilityDefault = useCallback(async () => {
    try {
      setBusy('admin_volatility_default')
      setError(null)
      setAdminControlMessage('')
      const parsed = JSON.parse(adminVolatilityDefaultJson || '{}')
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('La configuration par défaut doit être un objet JSON.')
      }
      const result = await callAdminControl({
        action: 'update-volatility-default',
        volatility_default_config: parsed,
      })
      const savedControl = result.control as TradingGlobalControl | null | undefined
      if (!savedControl) throw new Error('Le serveur n’a pas confirmé la configuration Volatility.')
      setAdminControl(savedControl)
      setAdminVolatilityDefaultJson(JSON.stringify(savedControl.volatility_default_config ?? {}, null, 2))
      setAdminControlMessage('Configuration Volatility globale enregistrée. Elle sera appliquée à tous les prochains démarrages Desktop, puis bornée par le plan et les protections administrateur.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Configuration Volatility impossible.'
      setError(message)
      setAdminControlMessage(`Enregistrement impossible : ${message}`)
    } finally {
      setBusy(null)
    }
  }, [adminVolatilityDefaultJson, callAdminControl])
  const addCapitalPositionLimitRule = useCallback(() => {
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      capital_position_limit_rules: [
        ...(Array.isArray(current?.capital_position_limit_rules) ? current.capital_position_limit_rules : []),
        newCapitalPositionLimitRule(),
      ],
    }))
  }, [])
  const updateCapitalPositionLimitRule = useCallback((
    id: string,
    patch: Partial<TradingCapitalPositionLimitRule>,
  ) => {
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      capital_position_limit_rules: (
        Array.isArray(current?.capital_position_limit_rules) ? current.capital_position_limit_rules : []
      ).map(rule => rule.id === id ? { ...rule, ...patch } : rule),
    }))
  }, [])
  const removeCapitalPositionLimitRule = useCallback((id: string) => {
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      capital_position_limit_rules: (
        Array.isArray(current?.capital_position_limit_rules) ? current.capital_position_limit_rules : []
      ).filter(rule => rule.id !== id),
    }))
  }, [])
  const addVolatilityRecommendationRule = useCallback(() => {
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      volatility_recommendation_rules: [
        ...(Array.isArray(current?.volatility_recommendation_rules) ? current.volatility_recommendation_rules : []),
        newVolatilityRecommendationRule(),
      ],
    }))
  }, [])
  const updateVolatilityRecommendationRule = useCallback((
    id: string,
    patch: Partial<TradingVolatilityRecommendationRule>,
  ) => {
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      volatility_recommendation_rules: (
        Array.isArray(current?.volatility_recommendation_rules) ? current.volatility_recommendation_rules : []
      ).map(rule => rule.id === id ? { ...rule, ...patch } : rule),
    }))
  }, [])
  const removeVolatilityRecommendationRule = useCallback((id: string) => {
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      volatility_recommendation_rules: (
        Array.isArray(current?.volatility_recommendation_rules) ? current.volatility_recommendation_rules : []
      ).filter(rule => rule.id !== id),
    }))
  }, [])
  const addPriceGuardRule = useCallback(() => {
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      price_guard_rules: [...(Array.isArray(current?.price_guard_rules) ? current.price_guard_rules : []), newPriceGuardRule()],
    }))
  }, [])
  const updatePriceGuardRule = useCallback((id: string, patch: Partial<TradingPriceGuardRule>) => {
    setAdminControlMessage('')
    setPriceGuardErrors(current => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      price_guard_rules: (Array.isArray(current?.price_guard_rules) ? current.price_guard_rules : []).map(rule =>
        rule.id === id ? { ...rule, ...patch } : rule,
      ),
    }))
  }, [])
  const removePriceGuardRule = useCallback((id: string) => {
    setAdminControlMessage('')
    setPriceGuardErrors(current => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      price_guard_rules: (Array.isArray(current?.price_guard_rules) ? current.price_guard_rules : []).filter(rule => rule.id !== id),
    }))
  }, [])
  const addDualEntryZoneRule = useCallback(() => {
    setAdminControlMessage('')
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      dual_entry_zone_rules: [
        ...(Array.isArray(current?.dual_entry_zone_rules) ? current.dual_entry_zone_rules : []),
        newDualEntryZoneRule(),
      ],
    }))
  }, [])
  const updateDualEntryZoneRule = useCallback((id: string, patch: Partial<TradingDualEntryZoneRule>) => {
    setAdminControlMessage('')
    setDualEntryZoneErrors(current => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      dual_entry_zone_rules: (
        Array.isArray(current?.dual_entry_zone_rules) ? current.dual_entry_zone_rules : []
      ).map(rule => rule.id === id ? { ...rule, ...patch } : rule),
    }))
  }, [])
  const removeDualEntryZoneRule = useCallback((id: string) => {
    setAdminControlMessage('')
    setDualEntryZoneErrors(current => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
    setAdminControl(current => ({
      ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
      dual_entry_zone_rules: (
        Array.isArray(current?.dual_entry_zone_rules) ? current.dual_entry_zone_rules : []
      ).filter(rule => rule.id !== id),
    }))
  }, [])
  const updateStopCyclePolicy = useCallback((patch: Partial<StopCyclePolicy>) => {
    setAdminControlMessage('')
    setAdminControl(current => {
      const currentPolicy = current?.stop_cycle_policy
      return {
        ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
        stop_cycle_policy: {
          version: 5,
          feature_enabled: currentPolicy?.feature_enabled === true,
          mode: currentPolicy?.mode ?? 'blocked',
          owner_override: true,
          eligible_plans: ['custom_max_2'],
          user_controls: 'read_only',
          rules: Array.isArray(currentPolicy?.rules) ? currentPolicy.rules : [],
          ...patch,
        },
      }
    })
  }, [])
  const addStopCycleRule = useCallback(() => {
    setAdminControlMessage('')
    setAdminControl(current => {
      const currentPolicy = current?.stop_cycle_policy
      return {
        ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
        stop_cycle_policy: {
          version: 5,
          feature_enabled: currentPolicy?.feature_enabled === true,
          mode: currentPolicy?.mode ?? 'blocked',
          owner_override: true,
          eligible_plans: ['custom_max_2'],
          user_controls: 'read_only',
          rules: [...(Array.isArray(currentPolicy?.rules) ? currentPolicy.rules : []), newStopCycleRule()],
        },
      }
    })
  }, [])
  const updateStopCycleRule = useCallback((id: string, patch: Partial<StopCycleRule>) => {
    setAdminControlMessage('')
    setStopCycleErrors(current => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
    setAdminControl(current => {
      const currentPolicy = current?.stop_cycle_policy
      return {
        ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
        stop_cycle_policy: {
          version: 5,
          feature_enabled: currentPolicy?.feature_enabled === true,
          mode: currentPolicy?.mode ?? 'blocked',
          owner_override: true,
          eligible_plans: ['custom_max_2'],
          user_controls: 'read_only',
          rules: (Array.isArray(currentPolicy?.rules) ? currentPolicy.rules : []).map(rule =>
            rule.id === id ? { ...rule, ...patch } : rule,
          ),
        },
      }
    })
  }, [])
  const removeStopCycleRule = useCallback((id: string) => {
    setAdminControlMessage('')
    setStopCycleErrors(current => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
    setAdminControl(current => {
      const currentPolicy = current?.stop_cycle_policy
      return {
        ...(current ?? { min_equity_usd: 10000, volatility_sell_min_profit_usd: 0.5 }),
        stop_cycle_policy: {
          version: 5,
          feature_enabled: currentPolicy?.feature_enabled === true,
          mode: currentPolicy?.mode ?? 'blocked',
          owner_override: true,
          eligible_plans: ['custom_max_2'],
          user_controls: 'read_only',
          rules: (Array.isArray(currentPolicy?.rules) ? currentPolicy.rules : []).filter(rule => rule.id !== id),
        },
      }
    })
  }, [])
  const dispatchInstantSignal = useCallback(async () => {
    const confirmation = window.confirm(
      tr(
        `Envoyer maintenant un signal ${instantSignal.direction} ${instantSignal.marketKey} aux moteurs éligibles pendant ${instantSignal.ttlSeconds} secondes ?`,
        `Send a ${instantSignal.direction} ${instantSignal.marketKey} signal to eligible engines for ${instantSignal.ttlSeconds} seconds?`,
      ),
    )
    if (!confirmation) return
    try {
      setBusy('instant_signal')
      setError(null)
      setInstantSignalMessage('')
      const idempotencyKey = typeof globalThis.crypto?.randomUUID === 'function'
        ? `main-ai:${globalThis.crypto.randomUUID()}`
        : `main-ai:${Date.now()}:${Math.random().toString(36).slice(2, 12)}`
      const result = await callAdminSignal({
        action: 'dispatch',
        event_type: 'open',
        market_key: instantSignal.marketKey,
        direction: instantSignal.direction,
        min_net_equity_usd: instantSignal.minNetEquityUsd,
        max_net_equity_usd: instantSignal.maxNetEquityUsd > 0 ? instantSignal.maxNetEquityUsd : null,
        min_free_margin_usd: instantSignal.minFreeMarginUsd,
        max_price_deviation_points: instantSignal.maxPriceDeviationPoints,
        max_price_deviation_pct: instantSignal.maxPriceDeviationPct,
        max_spread_points: instantSignal.maxSpreadPoints > 0 ? instantSignal.maxSpreadPoints : null,
        lot_policy: instantSignal.lotPolicy,
        proportional_base_equity_usd: instantSignal.lotPolicy === 'proportional' ? instantSignal.proportionalBaseEquityUsd : null,
        target_scope: instantSignal.targetScope,
        target_device_ids: instantSignal.targetDeviceIds.length ? instantSignal.targetDeviceIds : (copyMasterConfig?.target_device_ids ?? []),
        target_group_ids: instantSignal.targetGroupIds.length ? instantSignal.targetGroupIds : (copyMasterConfig?.target_group_ids ?? []),
        target_plan_keys: instantSignal.targetPlanKeys,
        require_opt_in: true,
        ttl_seconds: instantSignal.ttlSeconds,
        idempotency_key: idempotencyKey,
      })
      const expiresAt = String((result.signal as { expires_at?: string } | undefined)?.expires_at ?? '')
      const signalId = String((result.signal as { id?: string } | undefined)?.id ?? '')
      setInstantSignalMessage(
        tr(
          `Signal envoyé, en attente de confirmation Desktop/MT5. Validité : ${expiresAt ? formatDate(expiresAt) : `${instantSignal.ttlSeconds} secondes`}.`,
          `Signal sent; waiting for Desktop/MT5 confirmation. Valid until: ${expiresAt ? formatDate(expiresAt) : `${instantSignal.ttlSeconds} seconds`}.`,
        ),
      )
      if (signalId) {
        const statusDeadline = Date.now() + Math.min(20_000, Math.max(8_000, instantSignal.ttlSeconds * 1000))
        while (Date.now() < statusDeadline) {
          await new Promise(resolve => window.setTimeout(resolve, 2_000))
          const statusResult = await callAdminSignal({ action: 'status' })
          const signals = Array.isArray(statusResult.signals) ? statusResult.signals as Array<Record<string, any>> : []
          const current = signals.find(item => String(item.id ?? '') === signalId)
          const details = Array.isArray(current?.receipt_details) ? current.receipt_details as Array<Record<string, any>> : []
          const ownDetails = details.filter(item => String(item.user_id ?? '') === user.id)
          const terminal = (ownDetails.length ? ownDetails : details)
            .find(item => ['done', 'blocked', 'error', 'expired'].includes(String(item.status ?? '').toLowerCase()))
          if (!terminal) continue
          const terminalStatus = String(terminal.status ?? '').toLowerCase()
          const terminalResult = terminal.result && typeof terminal.result === 'object'
            ? terminal.result as Record<string, any>
            : {}
          const reason = String(terminalResult.error ?? terminalResult.reason ?? '').trim()
          setInstantSignalMessage(
            terminalStatus === 'done'
              ? tr(`Position ${instantSignal.direction} ${instantSignal.marketKey} confirmée par Desktop et MT5.`, `${instantSignal.direction} ${instantSignal.marketKey} position confirmed by Desktop and MT5.`)
              : tr(`Signal non exécuté (${terminalStatus})${reason ? ` : ${reason}` : '.'}`, `Signal not executed (${terminalStatus})${reason ? `: ${reason}` : '.'}`),
          )
          break
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : tr('Signal impossible.', 'Signal failed.')
      setError(message)
      setInstantSignalMessage(tr(`Envoi impossible : ${message}`, `Unable to send: ${message}`))
    } finally {
      setBusy(null)
    }
  }, [callAdminSignal, copyMasterConfig, instantSignal, tr, user.id])
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
  const syncSupportRdpCredentials = useCallback(async () => {
    const instanceId = supportSelected?.instance?.id
    if (!instanceId || !supportRdpPassword) return
    try {
      setBusy('support_rdp_credentials')
      setError(null)
      await callCloudSupport({
        action: 'sync_rdp_credentials',
        instance_id: instanceId,
        rdp_username: 'Administrator',
        rdp_password: supportRdpPassword,
      })
      setSupportRdpPassword('')
      await refreshSupportStatus(supportSelected)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Synchronisation des accès Windows impossible.')
    } finally {
      setBusy(null)
    }
  }, [callCloudSupport, refreshSupportStatus, supportRdpPassword, supportSelected])
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
              L’accès 24/7 est réservé aux plans Custom Pro, Custom Ultra, Custom Max et Custom Max 2. Passez sur un plan compatible pour préparer votre ordinateur Ava Cloud.
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
                  AvaBridge {instance?.bridge_version} est détecté. AvaBridge 1.68 est requis pour protéger les Take Profit après swap, synchroniser Ava S et conserver les protections Stop Cycle. Réinstalle AvaBridge depuis Ava Desktop avant de relancer le moteur.
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

        {canUseAdminConsole && adminAccessGranted && adminAccessToken && (
          <AdminAssistancePanel user={user} adminAccessToken={adminAccessToken} />
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
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Accès Windows sécurisé</p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Après une rotation chez Kamatera, saisissez ici le même mot de passe. Il est chiffré côté serveur et n’est jamais affiché dans Ava Web.
                  </p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <input
                      type="password"
                      value={supportRdpPassword}
                      onChange={event => setSupportRdpPassword(event.target.value)}
                      minLength={14}
                      maxLength={32}
                      autoComplete="new-password"
                      placeholder="Nouveau mot de passe Windows"
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-sm font-bold text-white outline-none placeholder:text-slate-600"
                    />
                    <button
                      type="button"
                      disabled={!supportSelected?.instance?.id || !!busy || supportRdpPassword.length < 14}
                      onClick={syncSupportRdpCredentials}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {busy === 'support_rdp_credentials' ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                      Chiffrer et synchroniser
                    </button>
                  </div>
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
              {['custom_pro', 'custom_ultra', 'custom_max', 'custom_max_2'].map(plan => {
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
                          Lot {String(target.order_payload.lot ?? '—')} · palier {String(target.order_payload.equity_tier ?? 'defaut')}
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!adminLoaded || busy === 'admin_control'}
                  onClick={async () => {
                  const rules = Array.isArray(adminControl?.price_guard_rules) ? adminControl.price_guard_rules : []
                  const capitalRules = Array.isArray(adminControl?.capital_position_limit_rules)
                    ? adminControl.capital_position_limit_rules
                    : []
                  const recommendationRules = Array.isArray(adminControl?.volatility_recommendation_rules)
                    ? adminControl.volatility_recommendation_rules
                    : []
                  const validationErrors = validatePriceGuardRules(rules)
                  const dualRules = Array.isArray(adminControl?.dual_entry_zone_rules) ? adminControl.dual_entry_zone_rules : []
                  const dualValidationErrors = validateDualEntryZoneRules(dualRules)
                  const stopCyclePolicy: StopCyclePolicy = adminControl?.stop_cycle_policy ?? {
                    version: 5,
                    feature_enabled: false,
                    mode: 'blocked',
                    owner_override: true,
                    eligible_plans: ['custom_max_2'],
                    user_controls: 'read_only',
                    rules: [],
                  }
                  const stopRules = Array.isArray(stopCyclePolicy.rules) ? stopCyclePolicy.rules : []
                  const stopValidationErrors = validateStopCycleRules(stopRules)
                  if (
                    Object.keys(validationErrors).length > 0
                    || Object.keys(dualValidationErrors).length > 0
                    || Object.keys(stopValidationErrors).length > 0
                  ) {
                    setPriceGuardErrors(validationErrors)
                    setDualEntryZoneErrors(dualValidationErrors)
                    setStopCycleErrors(stopValidationErrors)
                    setAdminControlMessage('Enregistrement suspendu : complète la règle signalée ci-dessous. Elle reste affichée et aucune autre valeur n’est perdue.')
                    return
                  }
                  const forcedConfirmed = stopCyclePolicy.feature_enabled !== true
                    || stopCyclePolicy.mode !== 'forced'
                    || window.confirm(
                    'Confirmer le mode forcé des cycles conditionnels ? Il restera limité à l’owner, aux comptes MT5 hedging, à AvaBridge 1.68 et à toutes les protections administrateur. Un compte réel exige aussi son autorisation explicite.',
                  )
                  if (!forcedConfirmed) {
                    setAdminControlMessage('Mode forcé non confirmé. Aucune configuration n’a été envoyée.')
                    return
                  }
                  try {
                    setBusy('admin_control')
                    setError(null)
                    setAdminControlMessage('')
                    const result = await callAdminControl({
                      action: 'update',
                      block_all_entries: adminControl?.block_all_entries === true,
                      block_buy_entries: adminControl?.block_buy_entries === true,
                      block_sell_entries: adminControl?.block_sell_entries === true,
                      block_boom_buy_entries: adminControl?.block_boom_buy_entries === true,
                      block_boom_sell_entries: adminControl?.block_boom_sell_entries === true,
                      block_crash_buy_entries: adminControl?.block_crash_buy_entries === true,
                      block_crash_sell_entries: adminControl?.block_crash_sell_entries === true,
                      max_boom_buy_open_positions: toPositionLimit(adminControl?.max_boom_buy_open_positions),
                      max_boom_sell_open_positions: toPositionLimit(adminControl?.max_boom_sell_open_positions),
                      max_crash_buy_open_positions: toPositionLimit(adminControl?.max_crash_buy_open_positions),
                      max_crash_sell_open_positions: toPositionLimit(adminControl?.max_crash_sell_open_positions),
                      capital_position_limit_rules: capitalRules,
                      volatility_recommendation_rules: recommendationRules,
                      bypass_min_net_equity_usd: Number(adminControl?.bypass_min_net_equity_usd ?? 1000),
                      bypass_boom_buy_entries: adminControl?.bypass_boom_buy_entries === true,
                      bypass_boom_sell_entries: adminControl?.bypass_boom_sell_entries === true,
                      bypass_crash_buy_entries: adminControl?.bypass_crash_buy_entries === true,
                      bypass_crash_sell_entries: adminControl?.bypass_crash_sell_entries === true,
                      block_below_equity_enabled: adminControl?.block_below_equity_enabled === true,
                      min_equity_usd: Number(adminControl?.min_equity_usd ?? 10000),
                      volatility_sell_min_profit_override_enabled: adminControl?.volatility_sell_min_profit_override_enabled === true,
                      volatility_sell_min_profit_usd: Number(adminControl?.volatility_sell_min_profit_usd ?? 0.5),
                      volatility_default_config: adminControl?.volatility_default_config ?? {},
                      price_guard_rules: rules,
                      dual_entry_zone_rules: dualRules,
                      stop_cycle_policy: {
                        ...stopCyclePolicy,
                        version: 5,
                        feature_enabled: stopCyclePolicy.feature_enabled === true,
                        owner_override: true,
                        eligible_plans: ['custom_max_2'],
                        user_controls: 'read_only',
                        rules: stopRules,
                      },
                      stop_cycle_force_confirmed: stopCyclePolicy.feature_enabled === true && stopCyclePolicy.mode === 'forced',
                    })
                    const savedControl = result.control as TradingGlobalControl | null | undefined
                    const savedCapitalRules = Array.isArray(savedControl?.capital_position_limit_rules)
                      ? savedControl.capital_position_limit_rules
                      : null
                    const savedRecommendationRules = Array.isArray(savedControl?.volatility_recommendation_rules)
                      ? savedControl.volatility_recommendation_rules
                      : null
                    const savedRules = Array.isArray(savedControl?.price_guard_rules) ? savedControl.price_guard_rules : null
                    const savedDualRules = Array.isArray(savedControl?.dual_entry_zone_rules) ? savedControl.dual_entry_zone_rules : null
                    const savedStopPolicy = savedControl?.stop_cycle_policy ?? null
                    const savedStopRules = Array.isArray(savedStopPolicy?.rules) ? savedStopPolicy.rules : null
                    const savedRuleIds = new Set(savedRules?.map(rule => rule.id) ?? [])
                    const savedCapitalRuleIds = new Set(savedCapitalRules?.map(rule => rule.id) ?? [])
                    const savedRecommendationRuleIds = new Set(savedRecommendationRules?.map(rule => rule.id) ?? [])
                    const savedDualRuleIds = new Set(savedDualRules?.map(rule => rule.id) ?? [])
                    const savedStopRuleIds = new Set(savedStopRules?.map(rule => rule.id) ?? [])
                    const barriersConfirmed = savedRules !== null
                      && savedRules.length === rules.length
                      && rules.every(rule => savedRuleIds.has(rule.id))
                    const capitalLimitsConfirmed = savedCapitalRules !== null
                      && savedCapitalRules.length === capitalRules.length
                      && capitalRules.every(rule => savedCapitalRuleIds.has(rule.id))
                    const recommendationsConfirmed = savedRecommendationRules !== null
                      && savedRecommendationRules.length === recommendationRules.length
                      && recommendationRules.every(rule => savedRecommendationRuleIds.has(rule.id))
                    const dualZonesConfirmed = savedDualRules !== null
                      && savedDualRules.length === dualRules.length
                      && dualRules.every(rule => savedDualRuleIds.has(rule.id))
                    const stopCycleConfirmed = savedStopPolicy !== null
                      && savedStopPolicy.feature_enabled === (stopCyclePolicy.feature_enabled === true)
                      && savedStopPolicy.mode === stopCyclePolicy.mode
                      && savedStopRules !== null
                      && savedStopRules.length === stopRules.length
                      && stopRules.every(rule => savedStopRuleIds.has(rule.id))
                    if (!savedControl || !capitalLimitsConfirmed || !recommendationsConfirmed || !barriersConfirmed || !dualZonesConfirmed || !stopCycleConfirmed) {
                      throw new Error('Le serveur n’a pas confirmé tous les plafonds, conseils Ava, barrières, zones synchronisées et règles Ava Alpha. La saisie reste affichée.')
                    }
                    setAdminControl(savedControl)
                    setPriceGuardErrors({})
                    setDualEntryZoneErrors({})
                    setStopCycleErrors({})
                    setAdminControlMessage('Configuration enregistrée. Les protections seront propagées aux moteurs actifs et les conseils par capital seront disponibles pour Ava vocale sans modifier les règles d’exécution.')
                  } catch (err) {
                    const message = err instanceof Error ? err.message : 'Controle admin impossible.'
                    setError(message)
                    setAdminControlMessage(`Enregistrement impossible : ${message}`)
                  } finally {
                    setBusy(null)
                  }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-300 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'admin_control' ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  Enregistrer
                </button>
                <HelpHint text={GLOBAL_CONTROL_HELP.save} />
              </div>
            </div>
            {adminControlMessage ? (
              <div
                role="status"
                className={`mt-4 rounded-xl border px-4 py-3 text-xs font-bold leading-5 ${
                  Object.keys(priceGuardErrors).length > 0 || Object.keys(dualEntryZoneErrors).length > 0 || Object.keys(stopCycleErrors).length > 0 || adminControlMessage.startsWith('Enregistrement impossible')
                    ? 'border-amber-300/25 bg-amber-300/10 text-amber-100'
                    : 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100'
                }`}
              >
                {adminControlMessage}
              </div>
            ) : null}
            <div className="mt-4 grid gap-3 lg:grid-cols-3 2xl:grid-cols-6">
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-100">
                <input
                  type="checkbox"
                  checked={adminControl?.block_all_entries === true}
                  onChange={event => updateAdminControl({ block_all_entries: event.target.checked })}
                  className="h-4 w-4 accent-amber-300"
                />
                Bloquer toutes les positions
                <HelpHint text={GLOBAL_CONTROL_HELP.blockAll} />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-100">
                <input
                  type="checkbox"
                  checked={adminControl?.block_buy_entries === true}
                  onChange={event => updateAdminControl({ block_buy_entries: event.target.checked })}
                  className="h-4 w-4 accent-emerald-300"
                />
                Bloquer BUY
                <HelpHint text={GLOBAL_CONTROL_HELP.blockBuy} />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-100">
                <input
                  type="checkbox"
                  checked={adminControl?.block_sell_entries === true}
                  onChange={event => updateAdminControl({ block_sell_entries: event.target.checked })}
                  className="h-4 w-4 accent-rose-300"
                />
                Bloquer SELL
                <HelpHint text={GLOBAL_CONTROL_HELP.blockSell} />
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3 text-sm font-bold text-slate-100">
                <input
                  type="checkbox"
                  checked={adminControl?.block_below_equity_enabled === true}
                  onChange={event => updateAdminControl({ block_below_equity_enabled: event.target.checked })}
                  className="h-4 w-4 accent-amber-300"
                />
                Bloquer sous capital minimum
                <HelpHint text={GLOBAL_CONTROL_HELP.blockBelowEquity} />
              </label>
              <label className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Capital minimum USD
                  <HelpHint text={GLOBAL_CONTROL_HELP.minEquity} />
                </span>
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
                <HelpHint text={GLOBAL_CONTROL_HELP.forceSellProfit} />
              </label>
              <label className="block rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  Profit SELL forcé USD
                  <HelpHint text={GLOBAL_CONTROL_HELP.forcedSellProfit} />
                </span>
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
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-300">Défaut Volatility global</p>
                  <p className="mt-1 text-sm font-black text-white">Distribuer la même configuration Burst et cadence</p>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
                    Les valeurs indiquées remplacent les réglages locaux au prochain démarrage du moteur. Les limites du plan, les directions Boom/Crash et les plafonds par capital gardent toujours la priorité. Utilise <span className="font-mono text-slate-300">symbolConfigs.BOOM1000</span> et <span className="font-mono text-slate-300">symbolConfigs.CRASH1000</span> pour régler les deux marchés séparément.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={!adminLoaded || busy === 'admin_volatility_default'}
                  onClick={saveAdminVolatilityDefault}
                  className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-rose-500/20 transition-colors hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy === 'admin_volatility_default' ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  Publier le défaut
                </button>
              </div>
              <textarea
                value={adminVolatilityDefaultJson}
                onChange={event => setAdminVolatilityDefaultJson(event.target.value)}
                rows={12}
                spellCheck={false}
                aria-label="Configuration Volatility globale au format JSON"
                placeholder={'{\n  "symbolConfigs": {\n    "BOOM1000": { "boomBurstEnabled": true, "boomReboundMode": "strict" },\n    "CRASH1000": { "boomBurstEnabled": true, "boomReboundMode": "strict" }\n  }\n}'}
                className="mt-4 w-full resize-y rounded-2xl border border-white/10 bg-slate-950/65 px-4 py-3 font-mono text-xs leading-5 text-slate-100 outline-none transition-colors focus:border-rose-300/40"
              />
              <p className="mt-2 text-[11px] leading-5 text-slate-500">
                Pour Crash, les noms internes <span className="font-mono">boomBurst*</span> et <span className="font-mono">boomSell*</span> décrivent le moteur générique : la direction réelle reste Crash BUY. Pour Boom, elle reste Boom SELL.
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-300">Plafonds par capital</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-black text-white">
                    Limiter toutes les positions selon l’equity
                    <HelpHint text={GLOBAL_CONTROL_HELP.capitalLimits} />
                  </p>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
                    Ava bloque uniquement les nouvelles entrées quand un plafond est atteint. Aucune position déjà ouverte n’est fermée.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addCapitalPositionLimitRule}
                  disabled={(adminControl?.capital_position_limit_rules?.length ?? 0) >= 20}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs font-black text-rose-100 hover:bg-rose-300/15 disabled:opacity-40"
                >
                  <Plus size={14} />
                  Ajouter un palier
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                {(adminControl?.capital_position_limit_rules ?? []).map((rule, index) => (
                  <div
                    key={rule.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/55 p-3"
                  >
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
                      <label className="flex min-h-[44px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-bold text-slate-100 xl:w-40">
                        <input
                          type="checkbox"
                          checked={rule.enabled !== false}
                          onChange={event => updateCapitalPositionLimitRule(rule.id, { enabled: event.target.checked })}
                          className="h-4 w-4 accent-rose-300"
                        />
                        Palier {index + 1}
                      </label>
                      <label className="block flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                          Capital inférieur à
                          <HelpHint text={GLOBAL_CONTROL_HELP.capitalThreshold} />
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="100000000"
                            step="100"
                            value={Number(rule.max_equity_usd ?? 1000)}
                            onChange={event => updateCapitalPositionLimitRule(rule.id, {
                              max_equity_usd: Math.max(1, toNumber(event.target.value, 1000)),
                            })}
                            className="w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                          <span className="text-xs font-black text-slate-500">USD</span>
                        </div>
                      </label>
                      <label className="block flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                          Max positions totales
                          <HelpHint text={GLOBAL_CONTROL_HELP.maxTotalPositions} />
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          step="1"
                          value={Number(rule.max_total_open_positions ?? 0)}
                          onChange={event => updateCapitalPositionLimitRule(rule.id, {
                            max_total_open_positions: toPositionLimit(event.target.value),
                          })}
                          className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                        />
                        <span className="text-[10px] text-slate-500">0 = aucun plafond total</span>
                      </label>
                      <label className="block flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                          Max Stop Cycle
                          <HelpHint text={GLOBAL_CONTROL_HELP.maxStopCyclePositions} />
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="1000"
                          step="1"
                          value={Number(rule.max_stop_cycle_open_positions ?? 0)}
                          onChange={event => updateCapitalPositionLimitRule(rule.id, {
                            max_stop_cycle_open_positions: toPositionLimit(event.target.value),
                          })}
                          className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                        />
                        <span className="text-[10px] text-slate-500">0 = aucun plafond cycle</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => removeCapitalPositionLimitRule(rule.id)}
                        aria-label={`Supprimer le palier ${index + 1}`}
                        className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-300/[0.07] text-rose-200 hover:bg-rose-300/15"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
                {(adminControl?.capital_position_limit_rules?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-slate-500">
                    Aucun plafond par capital. Ajoute un palier, par exemple moins de 1 000 USD : 14 positions totales.
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300">Conseils Ava vocale</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-black text-white">
                    Recommandations par capital — consultatif
                    <HelpHint text={GLOBAL_CONTROL_HELP.recommendations} />
                  </p>
                  <p className="mt-1 max-w-4xl text-xs leading-5 text-slate-400">
                    Ces tranches n’autorisent, ne bloquent et n’exécutent aucune position. Ava utilise seulement une equity Desktop récente, propose une tranche et demande une confirmation avant toute configuration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addVolatilityRecommendationRule}
                  disabled={(adminControl?.volatility_recommendation_rules?.length ?? 0) >= 20}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-300/25 bg-violet-300/10 px-3 py-2 text-xs font-black text-violet-100 hover:bg-violet-300/15 disabled:opacity-40"
                >
                  <Plus size={14} />
                  Ajouter une tranche
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                {(adminControl?.volatility_recommendation_rules ?? []).map((rule, index) => (
                  <div key={rule.id} className="rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="flex min-h-[42px] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-bold text-slate-100">
                        <input
                          type="checkbox"
                          checked={rule.enabled !== false}
                          onChange={event => updateVolatilityRecommendationRule(rule.id, { enabled: event.target.checked })}
                          className="h-4 w-4 accent-violet-300"
                        />
                        Tranche {index + 1}
                      </label>
                      <button
                        type="button"
                        onClick={() => removeVolatilityRecommendationRule(rule.id)}
                        aria-label={`Supprimer la recommandation ${index + 1}`}
                        className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-rose-300/20 bg-rose-300/[0.07] text-rose-200 hover:bg-rose-300/15"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      <label className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Equity minimum incluse</span>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100000000"
                            step="100"
                            value={Number(rule.min_equity_usd ?? 0)}
                            onChange={event => updateVolatilityRecommendationRule(rule.id, {
                              min_equity_usd: Math.max(0, toNumber(event.target.value, 0)),
                            })}
                            className="w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                          <span className="text-xs font-black text-slate-500">USD</span>
                        </div>
                      </label>
                      <label className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Equity maximum exclue</span>
                        <div className="mt-1 flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100000000"
                            step="100"
                            value={rule.max_equity_usd ?? ''}
                            placeholder="Sans maximum"
                            onChange={event => updateVolatilityRecommendationRule(rule.id, {
                              max_equity_usd: event.target.value === '' ? null : Math.max(0, toNumber(event.target.value, 0)),
                            })}
                            className="w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-600"
                          />
                          <span className="text-xs font-black text-slate-500">USD</span>
                        </div>
                      </label>
                      <label className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Maximum total conseillé</span>
                        <input
                          type="number"
                          min="1"
                          max="1000"
                          step="1"
                          value={Number(rule.max_total_open_positions ?? 1)}
                          onChange={event => updateVolatilityRecommendationRule(rule.id, {
                            max_total_open_positions: Math.max(1, toPositionLimit(event.target.value)),
                          })}
                          className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                        />
                      </label>
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {([
                        ['max_boom_buy_open_positions', 'Boom BUY'],
                        ['max_boom_sell_open_positions', 'Boom SELL'],
                        ['max_crash_buy_open_positions', 'Crash BUY'],
                        ['max_crash_sell_open_positions', 'Crash SELL'],
                      ] as const).map(([field, label]) => (
                        <label key={field} className="block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">{label} conseillé</span>
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            step="1"
                            value={Number(rule[field] ?? 0)}
                            onChange={event => updateVolatilityRecommendationRule(rule.id, {
                              [field]: toPositionLimit(event.target.value),
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                        </label>
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] leading-4 text-slate-500">0 = aucune recommandation publiée pour cette direction, et non une interdiction.</p>
                    <label className="mt-2 block rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">Conseil de configuration facultatif</span>
                      <textarea
                        rows={2}
                        maxLength={800}
                        value={rule.configuration_guidance ?? ''}
                        onChange={event => updateVolatilityRecommendationRule(rule.id, { configuration_guidance: event.target.value })}
                        placeholder="Exemple : privilégier un lot prudent et conserver les protections du plan."
                        className="mt-1 w-full resize-y bg-transparent text-xs leading-5 text-slate-100 outline-none placeholder:text-slate-600"
                      />
                    </label>
                  </div>
                ))}
                {(adminControl?.volatility_recommendation_rules?.length ?? 0) === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 px-4 py-5 text-center text-xs text-slate-500">
                    Aucune recommandation publiée. Ava n’inventera pas de tranche de capital.
                  </div>
                ) : null}
              </div>
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
                    <HelpHint text={GLOBAL_CONTROL_HELP.marketBlock} />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.block_boom_sell_entries === true}
                      onChange={event => updateAdminControl({ block_boom_sell_entries: event.target.checked })}
                      className="h-4 w-4 accent-rose-300"
                    />
                    Bloquer SELL Boom
                    <HelpHint text={GLOBAL_CONTROL_HELP.marketBlock} />
                  </label>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Max BUY ouverts
                      <HelpHint text={GLOBAL_CONTROL_HELP.maxOpen} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="1"
                      value={Number(adminControl?.max_boom_buy_open_positions ?? 0)}
                      onChange={event => updateAdminControl({ max_boom_buy_open_positions: toPositionLimit(event.target.value) })}
                      className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                    />
                    <span className="text-[10px] text-slate-500">0 = limite utilisateur</span>
                  </label>
                  <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Max SELL ouverts
                      <HelpHint text={GLOBAL_CONTROL_HELP.maxOpen} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="1"
                      value={Number(adminControl?.max_boom_sell_open_positions ?? 0)}
                      onChange={event => updateAdminControl({ max_boom_sell_open_positions: toPositionLimit(event.target.value) })}
                      className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                    />
                    <span className="text-[10px] text-slate-500">0 = limite utilisateur</span>
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
                    <HelpHint text={GLOBAL_CONTROL_HELP.marketBlock} />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.block_crash_sell_entries === true}
                      onChange={event => updateAdminControl({ block_crash_sell_entries: event.target.checked })}
                      className="h-4 w-4 accent-rose-300"
                    />
                    Bloquer SELL Crash
                    <HelpHint text={GLOBAL_CONTROL_HELP.marketBlock} />
                  </label>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Max BUY ouverts
                      <HelpHint text={GLOBAL_CONTROL_HELP.maxOpen} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="1"
                      value={Number(adminControl?.max_crash_buy_open_positions ?? 0)}
                      onChange={event => updateAdminControl({ max_crash_buy_open_positions: toPositionLimit(event.target.value) })}
                      className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                    />
                    <span className="text-[10px] text-slate-500">0 = limite utilisateur</span>
                  </label>
                  <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                      Max SELL ouverts
                      <HelpHint text={GLOBAL_CONTROL_HELP.maxOpen} />
                    </span>
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step="1"
                      value={Number(adminControl?.max_crash_sell_open_positions ?? 0)}
                      onChange={event => updateAdminControl({ max_crash_sell_open_positions: toPositionLimit(event.target.value) })}
                      className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                    />
                    <span className="text-[10px] text-slate-500">0 = limite utilisateur</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-rose-300">Barrières de prix globales</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-black text-white">
                    Bloquer BUY ou SELL dans une zone précise
                    <HelpHint text={GLOBAL_CONTROL_HELP.barriers} />
                  </p>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
                    Ces règles sont envoyées à tous les moteurs Ava Desktop. Elles bloquent uniquement les nouvelles entrées et les nouveaux renforts; les positions déjà ouvertes restent intactes.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={(adminControl?.price_guard_rules?.length ?? 0) >= 50}
                  onClick={addPriceGuardRule}
                  className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-rose-500/20 transition-colors hover:bg-rose-400 disabled:opacity-40"
                >
                  <Plus size={14} />
                  Ajouter une barrière
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {(adminControl?.price_guard_rules ?? []).map((rule, index) => {
                  const zone = rule.min_price !== null && rule.max_price !== null
                    ? `${rule.min_price} à ${rule.max_price}`
                    : rule.min_price !== null
                      ? `≥ ${rule.min_price}`
                      : rule.max_price !== null
                        ? `≤ ${rule.max_price}`
                        : 'zone à compléter'
                  const ruleError = priceGuardErrors[rule.id]
                  return (
                    <div
                      key={rule.id}
                      className={`rounded-2xl border bg-slate-950/55 p-4 ${
                        ruleError ? 'border-amber-300/40 ring-1 ring-amber-300/10' : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={rule.enabled !== false}
                            onChange={event => updatePriceGuardRule(rule.id, { enabled: event.target.checked })}
                            className="h-4 w-4 accent-rose-500"
                          />
                          <div>
                            <p className="flex items-center gap-2 text-xs font-black text-white">
                              Barrière {index + 1} · {zone}
                              <HelpHint text={GLOBAL_CONTROL_HELP.enabled} />
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {rule.block_buy ? 'BUY bloqué' : 'BUY autorisé'} · {rule.block_sell ? 'SELL bloqué' : 'SELL autorisé'}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePriceGuardRule(rule.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition-colors hover:border-rose-500/30 hover:text-rose-300"
                          title="Supprimer cette barrière"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {ruleError ? (
                        <p role="alert" className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-bold leading-5 text-amber-100">
                          {ruleError}
                        </p>
                      ) : null}
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Marché
                            <HelpHint text={GLOBAL_CONTROL_HELP.market} />
                          </span>
                          <select
                            value={rule.market_key}
                            onChange={event => updatePriceGuardRule(rule.id, { market_key: event.target.value })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          >
                            {PRICE_GUARD_MARKET_OPTIONS.map(option => (
                              <option key={option.key} value={option.key} className="bg-slate-950">{option.label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Prix minimum
                            <HelpHint text={GLOBAL_CONTROL_HELP.minPrice} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.min_price ?? ''}
                            onChange={event => updatePriceGuardRule(rule.id, { min_price: optionalInputNumber(event.target.value) })}
                            placeholder="Sans minimum"
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-700"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Prix maximum
                            <HelpHint text={GLOBAL_CONTROL_HELP.maxPrice} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.max_price ?? ''}
                            onChange={event => updatePriceGuardRule(rule.id, { max_price: optionalInputNumber(event.target.value) })}
                            placeholder="Sans maximum"
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-700"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Marge réactivation
                            <HelpHint text={GLOBAL_CONTROL_HELP.releaseBuffer} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.release_buffer_points ?? 0}
                            onChange={event => updatePriceGuardRule(rule.id, { release_buffer_points: optionalInputNumber(event.target.value) ?? 0 })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${rule.block_buy ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-black/25 text-slate-500'}`}>
                            <input
                              type="checkbox"
                              checked={rule.block_buy}
                              onChange={event => updatePriceGuardRule(rule.id, { block_buy: event.target.checked })}
                              className="h-4 w-4 accent-emerald-400"
                            />
                            Bloquer BUY
                            <HelpHint text={GLOBAL_CONTROL_HELP.blockDirection} />
                          </label>
                          <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${rule.block_sell ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-white/10 bg-black/25 text-slate-500'}`}>
                            <input
                              type="checkbox"
                              checked={rule.block_sell}
                              onChange={event => updatePriceGuardRule(rule.id, { block_sell: event.target.checked })}
                              className="h-4 w-4 accent-rose-400"
                            />
                            Bloquer SELL
                            <HelpHint text={GLOBAL_CONTROL_HELP.blockDirection} />
                          </label>
                        </div>
                      </div>
                      <details className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                          Planification facultative
                          <span className="ml-2 inline-flex align-middle">
                            <HelpHint text={GLOBAL_CONTROL_HELP.schedule} />
                          </span>
                        </summary>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-[10px] font-bold text-slate-500">Active à partir de</span>
                            <input
                              type="datetime-local"
                              value={localDateTimeValue(rule.starts_at)}
                              onChange={event => updatePriceGuardRule(rule.id, { starts_at: event.target.value ? new Date(event.target.value).toISOString() : null })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-bold text-slate-500">Expire à</span>
                            <input
                              type="datetime-local"
                              value={localDateTimeValue(rule.ends_at)}
                              onChange={event => updatePriceGuardRule(rule.id, { ends_at: event.target.value ? new Date(event.target.value).toISOString() : null })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                            />
                          </label>
                        </div>
                      </details>
                    </div>
                  )
                })}
                {(adminControl?.price_guard_rules?.length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-slate-500">
                    Aucune barrière de prix. Exemple : Crash 1000, prix maximum 5000, bloquer SELL.
                  </div>
                ) : null}
              </div>
              <p className="mt-3 text-[10px] leading-4 text-slate-500">
                Une borne vide représente l’infini. Les bornes sont inclusives. Si plusieurs barrières correspondent, chaque direction bloquée reste bloquée. La propagation vers les moteurs actifs prend au maximum environ 30 secondes, puis le contrôle du prix est local et immédiat.
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-violet-400/20 bg-violet-400/[0.06] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-violet-300">Zones synchronisées</p>
                  <p className="mt-1 flex items-center gap-2 text-sm font-black text-white">
                    Achat + vente dans une zone précise
                    <HelpHint text={GLOBAL_CONTROL_HELP.dualZones} />
                  </p>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
                    Quand Ava ouvre une position autorisée dans la zone, Desktop attend sa confirmation puis demande la direction opposée. Aucune règle de plan, barrière ou capacité n’est contournée.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={(adminControl?.dual_entry_zone_rules?.length ?? 0) >= 50}
                  onClick={addDualEntryZoneRule}
                  className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-500 px-3 py-2 text-xs font-black text-white shadow-lg shadow-violet-500/20 transition-colors hover:bg-violet-400 disabled:opacity-40"
                >
                  <Plus size={14} />
                  Ajouter une zone
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {(adminControl?.dual_entry_zone_rules ?? []).map((rule, index) => {
                  const ruleError = dualEntryZoneErrors[rule.id]
                  const zone = rule.min_price !== null && rule.max_price !== null
                    ? `${rule.min_price} ≤ prix ≤ ${rule.max_price}`
                    : 'zone à compléter'
                  return (
                    <div
                      key={rule.id}
                      className={`rounded-2xl border bg-slate-950/55 p-4 ${
                        ruleError ? 'border-amber-300/40 ring-1 ring-amber-300/10' : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={rule.enabled !== false}
                            onChange={event => updateDualEntryZoneRule(rule.id, { enabled: event.target.checked })}
                            className="h-4 w-4 accent-violet-400"
                          />
                          <div>
                            <p className="flex items-center gap-2 text-xs font-black text-white">
                              Zone {index + 1} · {zone}
                              <HelpHint text={GLOBAL_CONTROL_HELP.dualEnabled} />
                            </p>
                            <p className="flex items-center gap-1 text-[10px] text-violet-300">
                              <ArrowLeftRight size={12} />
                              Toute entrée Ava autorisée demande BUY + SELL
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDualEntryZoneRule(rule.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition-colors hover:border-rose-500/30 hover:text-rose-300"
                          title="Supprimer cette zone"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {ruleError ? (
                        <p role="alert" className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-bold leading-5 text-amber-100">
                          {ruleError}
                        </p>
                      ) : null}
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Marché
                            <HelpHint text={GLOBAL_CONTROL_HELP.dualMarket} />
                          </span>
                          <select
                            value={rule.market_key}
                            onChange={event => updateDualEntryZoneRule(rule.id, { market_key: event.target.value })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          >
                            {PRICE_GUARD_MARKET_OPTIONS.map(option => (
                              <option key={option.key} value={option.key} className="bg-slate-950">{option.label}</option>
                            ))}
                          </select>
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Prix minimum inclus
                            <HelpHint text={GLOBAL_CONTROL_HELP.dualMin} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.min_price ?? ''}
                            onChange={event => updateDualEntryZoneRule(rule.id, { min_price: optionalInputNumber(event.target.value) })}
                            placeholder="Ex. 5500"
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-700"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Prix maximum inclus
                            <HelpHint text={GLOBAL_CONTROL_HELP.dualMax} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.max_price ?? ''}
                            onChange={event => updateDualEntryZoneRule(rule.id, { max_price: optionalInputNumber(event.target.value) })}
                            placeholder="Ex. 5900"
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-700"
                          />
                        </label>
                      </div>
                      <details className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                          Planification facultative
                          <span className="ml-2 inline-flex align-middle">
                            <HelpHint text={GLOBAL_CONTROL_HELP.schedule} />
                          </span>
                        </summary>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-[10px] font-bold text-slate-500">Active à partir de</span>
                            <input
                              type="datetime-local"
                              value={localDateTimeValue(rule.starts_at)}
                              onChange={event => updateDualEntryZoneRule(rule.id, { starts_at: event.target.value ? new Date(event.target.value).toISOString() : null })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-bold text-slate-500">Expire à</span>
                            <input
                              type="datetime-local"
                              value={localDateTimeValue(rule.ends_at)}
                              onChange={event => updateDualEntryZoneRule(rule.id, { ends_at: event.target.value ? new Date(event.target.value).toISOString() : null })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                            />
                          </label>
                        </div>
                      </details>
                    </div>
                  )
                })}
                {(adminControl?.dual_entry_zone_rules?.length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-slate-500">
                    Aucune zone synchronisée. Exemple : Boom 1000 de 5500 à 5900 inclus.
                  </div>
                ) : null}
              </div>
            </div>
            <div id="ava-admin-stop-cycle" className="mt-4 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.06] p-4">
              <label className="mb-4 flex cursor-pointer flex-col gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  <span className="flex items-center gap-2 text-sm font-black text-white">
                    Accès global Ava Alpha
                    <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleFeature} />
                  </span>
                  <span className="mt-1 block max-w-3xl text-xs leading-5 text-slate-400">
                    Désactivé, Ava Alpha disparaît pour les comptes non-owner et aucun nouveau cycle ne peut être créé. Les positions déjà ouvertes restent suivies; seuls les ordres conditionnels non déclenchés sont annulés. L’owner conserve son accès.
                  </span>
                </span>
                <span className="inline-flex flex-shrink-0 items-center gap-3">
                  <span className={`text-xs font-black uppercase tracking-[0.12em] ${
                    adminControl?.stop_cycle_policy?.feature_enabled === true ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {adminControl?.stop_cycle_policy?.feature_enabled === true ? 'Custom Max 2 autorisé' : 'Non-owner masqué'}
                  </span>
                  <input
                    type="checkbox"
                    checked={adminControl?.stop_cycle_policy?.feature_enabled === true}
                    onChange={event => updateStopCyclePolicy({ feature_enabled: event.target.checked })}
                    className="h-5 w-5 accent-rose-500"
                  />
                </span>
              </label>
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-cyan-200">Ava Alpha</p>
                    <span className="rounded-full border border-cyan-200/25 bg-cyan-200/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.12em] text-cyan-100">
                      Custom Max 2 · lecture seule
                    </span>
                  </div>
                  <p className="mt-1 flex items-center gap-2 text-sm font-black text-white">
                    Cycles STOP, LIMIT et STOP-LIMIT par capital
                    <HelpHint text={GLOBAL_CONTROL_HELP.stopCycle} />
                  </p>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
                    Une tranche de capital prime sur la règle globale du même marché. Les utilisateurs Custom Max 2 voient uniquement leur règle effective et l’état de leurs cycles. Un compte réel exige toujours son autorisation explicite.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={(adminControl?.stop_cycle_policy?.rules?.length ?? 0) >= 50}
                  onClick={addStopCycleRule}
                  className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950 shadow-lg shadow-cyan-300/10 transition-colors hover:bg-cyan-200 disabled:opacity-40"
                >
                  <Plus size={14} />
                  Ajouter une règle
                </button>
              </div>

              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,20rem)_1fr]">
                <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    Mode global
                    <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleMode} />
                  </span>
                  <select
                    value={adminControl?.stop_cycle_policy?.mode ?? 'blocked'}
                    onChange={event => updateStopCyclePolicy({ mode: event.target.value as StopCyclePolicy['mode'] })}
                    className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                  >
                    <option value="blocked" className="bg-slate-950">Bloqué</option>
                    <option value="allowed" className="bg-slate-950">Autorisé selon les règles</option>
                    <option value="forced" className="bg-slate-950">Forcé selon la règle effective</option>
                  </select>
                </label>
                <div className="rounded-xl border border-amber-300/20 bg-amber-300/[0.07] px-4 py-3 text-xs leading-5 text-amber-100">
                  <span className="flex items-center gap-2 font-black">
                    <ShieldCheck size={15} />
                    Aucune règle ne contourne la sécurité
                    <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleForced} />
                  </span>
                  <p className="mt-1 text-amber-100/75">
                    Chaque côté est indépendant : une direction autorisée peut fonctionner seule. Seules les directions actives doivent tenir dans leurs capacités globales et directionnelles.
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {(adminControl?.stop_cycle_policy?.rules ?? []).map((rule, index) => {
                  const ruleError = stopCycleErrors[rule.id]
                  const zone = rule.min_price !== null && rule.max_price !== null
                    ? `${rule.min_price} ≤ prix ≤ ${rule.max_price}`
                    : rule.min_price !== null
                      ? `prix ≥ ${rule.min_price}`
                      : rule.max_price !== null
                        ? `prix ≤ ${rule.max_price}`
                        : 'tous les prix'
                  return (
                    <div
                      key={rule.id}
                      className={`rounded-2xl border bg-slate-950/55 p-4 ${
                        ruleError ? 'border-amber-300/40 ring-1 ring-amber-300/10' : 'border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={rule.enabled !== false}
                            onChange={event => updateStopCycleRule(rule.id, { enabled: event.target.checked })}
                            className="h-4 w-4 accent-cyan-300"
                          />
                          <div>
                            <p className="text-xs font-black text-white">Règle {index + 1} · {zone}</p>
                            <p className="mt-0.5 text-[10px] text-cyan-200">
                              {rule.scope === 'equity_range' ? 'Tranche de capital' : 'Règle globale'} · {rule.max_orders_per_side} ordre(s) par côté · {rule.max_concurrent_cycles ?? 1} cycle(s) · panier {rule.basket_target_usd} USD
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStopCycleRule(rule.id)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-slate-500 transition-colors hover:border-rose-500/30 hover:text-rose-300"
                          title="Supprimer cette règle Ava Alpha"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {ruleError ? (
                        <p role="alert" className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs font-bold leading-5 text-amber-100">
                          {ruleError}
                        </p>
                      ) : null}

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Marché
                            <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleMarket} />
                          </span>
                          <select
                            value={rule.market_key}
                            onChange={event => updateStopCycleRule(rule.id, { market_key: event.target.value as StopCycleRule['market_key'] })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          >
                            <option value="BOOM1000" className="bg-slate-950">Boom 1000</option>
                            <option value="CRASH1000" className="bg-slate-950">Crash 1000</option>
                          </select>
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Application
                          </span>
                          <select
                            value={rule.scope ?? 'global'}
                            onChange={event => updateStopCycleRule(rule.id, {
                              scope: event.target.value as StopCycleRule['scope'],
                              max_net_equity_usd: event.target.value === 'global' ? null : rule.max_net_equity_usd,
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          >
                            <option value="global" className="bg-slate-950">Règle globale de repli</option>
                            <option value="equity_range" className="bg-slate-950">Tranche de capital</option>
                          </select>
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Prix minimum inclus
                            <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleMin} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.min_price ?? ''}
                            onChange={event => updateStopCycleRule(rule.id, { min_price: optionalInputNumber(event.target.value) })}
                            placeholder="Sans minimum"
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-700"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Equity nette maximum
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            disabled={rule.scope !== 'equity_range'}
                            value={rule.max_net_equity_usd ?? ''}
                            onChange={event => updateStopCycleRule(rule.id, { max_net_equity_usd: optionalInputNumber(event.target.value) })}
                            placeholder={rule.scope === 'equity_range' ? 'Obligatoire' : 'Sans maximum'}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-700 disabled:opacity-40"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Prix maximum inclus
                            <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleMax} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rule.max_price ?? ''}
                            onChange={event => updateStopCycleRule(rule.id, { max_price: optionalInputNumber(event.target.value) })}
                            placeholder="Sans maximum"
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none placeholder:text-slate-700"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Equity nette minimum
                            <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleEquity} />
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={rule.min_net_equity_usd}
                            onChange={event => updateStopCycleRule(rule.id, { min_net_equity_usd: Math.max(0, toNumber(event.target.value, 0)) })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Max ordres / côté
                            <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleMaxOrders} />
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            step="1"
                            value={rule.max_orders_per_side}
                            onChange={event => updateStopCycleRule(rule.id, {
                              max_orders_per_side: Math.max(1, Math.min(100, Math.floor(toNumber(event.target.value, 1)))),
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Cycles simultanés
                            <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleMaxConcurrent} />
                          </span>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            step="1"
                            value={rule.max_concurrent_cycles ?? 1}
                            onChange={event => updateStopCycleRule(rule.id, {
                              max_concurrent_cycles: Math.max(1, Math.min(10, Math.floor(toNumber(event.target.value, 1)))),
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Panier cible USD
                          </span>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={rule.basket_target_usd ?? 3}
                            onChange={event => updateStopCycleRule(rule.id, {
                              basket_target_usd: Math.max(0.01, toNumber(event.target.value, 3)),
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Distance
                          </span>
                          <select
                            value={rule.distance_mode ?? 'broker_minimum'}
                            onChange={event => updateStopCycleRule(rule.id, {
                              distance_mode: event.target.value as StopCycleRule['distance_mode'],
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          >
                            <option value="broker_minimum" className="bg-slate-950">Minimum broker</option>
                            <option value="custom" className="bg-slate-950">Personnalisée</option>
                          </select>
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Distance personnalisée
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            disabled={rule.distance_mode !== 'custom'}
                            value={rule.distance_points ?? 0}
                            onChange={event => updateStopCycleRule(rule.id, {
                              distance_points: Math.max(0, toNumber(event.target.value, 0)),
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none disabled:opacity-40"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Expiration (secondes)
                          </span>
                          <input
                            type="number"
                            min="30"
                            max="86400"
                            step="30"
                            value={rule.expiration_seconds ?? 300}
                            onChange={event => updateStopCycleRule(rule.id, {
                              expiration_seconds: Math.max(30, Math.min(86400, Math.floor(toNumber(event.target.value, 300)))),
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                        </label>
                        <label className="block rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                            Recentrage (secondes)
                          </span>
                          <input
                            type="number"
                            min="0"
                            max="86400"
                            step="5"
                            value={rule.rearm_seconds ?? 30}
                            onChange={event => updateStopCycleRule(rule.id, {
                              rearm_seconds: Math.max(0, Math.min(86400, Math.floor(toNumber(event.target.value, 30)))),
                            })}
                            className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                          />
                        </label>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${rule.block_buy_stop ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-white/10 bg-black/25 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={rule.block_buy_stop}
                            onChange={event => updateStopCycleRule(rule.id, { block_buy_stop: event.target.checked })}
                            className="h-4 w-4 accent-rose-400"
                          />
                          Bloquer BUY STOP
                          <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleBlockSide} />
                        </label>
                        <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${rule.block_sell_stop ? 'border-rose-400/25 bg-rose-400/10 text-rose-100' : 'border-white/10 bg-black/25 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={rule.block_sell_stop}
                            onChange={event => updateStopCycleRule(rule.id, { block_sell_stop: event.target.checked })}
                            className="h-4 w-4 accent-rose-400"
                          />
                          Bloquer SELL STOP
                          <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleBlockSide} />
                        </label>
                        <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${rule.allow_buy_limit ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-black/25 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={rule.allow_buy_limit === true}
                            onChange={event => updateStopCycleRule(rule.id, { allow_buy_limit: event.target.checked })}
                            className="h-4 w-4 accent-emerald-400"
                          />
                          Autoriser BUY LIMIT
                          <HelpHint text="Ordre d’achat sous le marché, conçu pour entrer sur repli puis profiter d’un rebond." />
                        </label>
                        <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${rule.allow_sell_limit ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' : 'border-white/10 bg-black/25 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={rule.allow_sell_limit === true}
                            onChange={event => updateStopCycleRule(rule.id, { allow_sell_limit: event.target.checked })}
                            className="h-4 w-4 accent-emerald-400"
                          />
                          Autoriser SELL LIMIT
                          <HelpHint text="Ordre de vente au-dessus du marché, conçu pour entrer sur sommet puis profiter d’un repli." />
                        </label>
                        <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${rule.allow_buy_stop_limit ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-black/25 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={rule.allow_buy_stop_limit === true}
                            onChange={event => updateStopCycleRule(rule.id, { allow_buy_stop_limit: event.target.checked })}
                            className="h-4 w-4 accent-cyan-400"
                          />
                          Autoriser BUY STOP-LIMIT
                          <HelpHint text="Après une cassure haussière, prépare un BUY LIMIT de retest au lieu d’acheter immédiatement le sommet." />
                        </label>
                        <label className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black ${rule.allow_sell_stop_limit ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100' : 'border-white/10 bg-black/25 text-slate-400'}`}>
                          <input
                            type="checkbox"
                            checked={rule.allow_sell_stop_limit === true}
                            onChange={event => updateStopCycleRule(rule.id, { allow_sell_stop_limit: event.target.checked })}
                            className="h-4 w-4 accent-cyan-400"
                          />
                          Autoriser SELL STOP-LIMIT
                          <HelpHint text="Après une cassure baissière, prépare un SELL LIMIT de retest au lieu de vendre immédiatement le creux." />
                        </label>
                      </div>

                      <details className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <summary className="cursor-pointer text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                          Planification facultative
                          <span className="ml-2 inline-flex align-middle">
                            <HelpHint text={GLOBAL_CONTROL_HELP.stopCycleSchedule} />
                          </span>
                        </summary>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="text-[10px] font-bold text-slate-500">Active à partir de</span>
                            <input
                              type="datetime-local"
                              value={localDateTimeValue(rule.starts_at)}
                              onChange={event => updateStopCycleRule(rule.id, { starts_at: event.target.value ? new Date(event.target.value).toISOString() : null })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                            />
                          </label>
                          <label className="block">
                            <span className="text-[10px] font-bold text-slate-500">Expire à</span>
                            <input
                              type="datetime-local"
                              value={localDateTimeValue(rule.ends_at)}
                              onChange={event => updateStopCycleRule(rule.id, { ends_at: event.target.value ? new Date(event.target.value).toISOString() : null })}
                              className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                            />
                          </label>
                        </div>
                      </details>
                    </div>
                  )
                })}

                {(adminControl?.stop_cycle_policy?.rules?.length ?? 0) === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-center text-xs text-slate-500">
                    Aucune règle Ava Alpha. Le mode bloqué reste la valeur sûre par défaut.
                  </div>
                ) : null}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="#ava-admin-instant-signal"
                  className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-300/20 bg-fuchsia-300/[0.07] px-3 py-2 text-xs font-black text-fuchsia-100 hover:bg-fuchsia-300/10"
                >
                  <Send size={14} />
                  {tr('Signal immédiat', 'Instant signal')}
                  <span className="rounded-full bg-fuchsia-300/15 px-2 py-0.5 text-[9px] uppercase">Nouveau · 72 h</span>
                </a>
                <a
                  href="?tab=ava-ai#ava-market-library"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/[0.07] px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-300/10"
                >
                  <ExternalLink size={14} />
                  Bibliothèque marché
                  <span className="rounded-full bg-emerald-300/15 px-2 py-0.5 text-[9px] uppercase">Nouveau · 72 h</span>
                </a>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-rose-300/20 bg-gradient-to-br from-rose-400/[0.08] to-slate-950/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-rose-300/25 bg-rose-300/10 text-rose-100">
                    <ArrowLeftRight size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{tr('Réseau maître → suiveurs Ava S', 'Ava S master → follower network')}</p>
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
                      {tr(
                        'Les utilisateurs doivent autoriser Ava S sur leur ordinateur. Les filtres serveur et toutes les protections locales restent obligatoires.',
                        'Users must explicitly enable Ava S on their computer. Server filters and all local safeguards remain mandatory.',
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={busy === 'copy_emergency'}
                  onClick={() => void emergencyStopCopyNetwork()}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-300/35 bg-red-400/15 px-3 py-2 text-xs font-black text-red-100 hover:bg-red-400/25 disabled:opacity-50"
                >
                  {busy === 'copy_emergency' ? <Loader2 className="animate-spin" size={14} /> : <Power size={14} />}
                  {tr('Arrêt d’urgence', 'Emergency stop')}
                </button>
              </div>

              {copyMasterConfig ? (
                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                  <label className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Ordinateur maître', 'Master computer')}</span>
                    <select
                      value={String(copyMasterConfig.master_device_id ?? '')}
                      onChange={event => setCopyMasterConfig(current => ({ ...(current ?? {}), master_device_id: event.target.value }))}
                      className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none"
                    >
                      <option value="" className="bg-slate-950">{tr('Sélectionner…', 'Select…')}</option>
                      {copyDevices.map(device => (
                        <option key={String(device.device_id)} value={String(device.device_id)} className="bg-slate-950">
                          {String(device.email || device.user_id)} · {String(device.device_id).slice(0, 18)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Ciblage', 'Targeting')}</span>
                    <select
                      value={String(copyMasterConfig.target_scope ?? 'devices')}
                      onChange={event => setCopyMasterConfig(current => ({ ...(current ?? {}), target_scope: event.target.value }))}
                      className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none"
                    >
                      <option value="devices" className="bg-slate-950">{tr('Ordinateurs choisis', 'Selected computers')}</option>
                      <option value="groups" className="bg-slate-950">{tr('Groupes', 'Groups')}</option>
                      <option value="all" className="bg-slate-950">{tr('Tous les consentants', 'All opted-in users')}</option>
                    </select>
                  </label>
                  <label className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Politique de lot', 'Lot policy')}</span>
                    <select
                      value={String(copyMasterConfig.lot_policy ?? 'local')}
                      onChange={event => setCopyMasterConfig(current => ({ ...(current ?? {}), lot_policy: event.target.value }))}
                      className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none"
                    >
                      <option value="local" className="bg-slate-950">{tr('Limites locales', 'Local limits')}</option>
                      <option value="master" className="bg-slate-950">{tr('Lot maître plafonné', 'Capped master lot')}</option>
                      <option value="proportional" className="bg-slate-950">{tr('Proportionnel à l’équity', 'Equity proportional')}</option>
                    </select>
                  </label>
                  {[
                    ['min_net_equity_usd', tr('Equity minimum', 'Minimum equity'), 0],
                    ['max_net_equity_usd', tr('Equity maximum (0 = aucune)', 'Maximum equity (0 = none)'), 0],
                    ['min_free_margin_usd', tr('Marge libre minimum', 'Minimum free margin'), 0],
                    ['max_price_deviation_points', tr('Écart prix max (points)', 'Max price deviation (points)'), 15],
                    ['max_price_deviation_pct', tr('Écart prix max (%)', 'Max price deviation (%)'), 0.1],
                    ['max_spread_points', tr('Spread max (0 = aucun)', 'Max spread (0 = none)'), 0],
                    ['ttl_seconds', tr('Validité événement (2–10 s)', 'Event lifetime (2–10 s)'), 3],
                  ].map(([key, label, fallback]) => (
                    <label key={String(key)} className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{String(label)}</span>
                      <input
                        type="number"
                        min="0"
                        step={key === 'max_price_deviation_pct' ? '0.01' : '1'}
                        value={Number(copyMasterConfig[String(key)] ?? fallback)}
                        onChange={event => setCopyMasterConfig(current => ({ ...(current ?? {}), [String(key)]: Number(event.target.value) }))}
                        className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none"
                      />
                    </label>
                  ))}
                  <div className="rounded-xl border border-white/10 bg-slate-950/45 p-3 xl:col-span-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Ordinateurs suiveurs', 'Follower computers')}</p>
                    <div className="mt-2 grid max-h-36 gap-2 overflow-y-auto sm:grid-cols-2">
                      {copyDevices.filter(device => String(device.device_id) !== String(copyMasterConfig.master_device_id ?? '')).map(device => {
                        const id = String(device.device_id)
                        const selected = (copyMasterConfig.target_device_ids ?? []).includes(id)
                        return (
                          <label key={id} className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-2 text-xs text-slate-300">
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => setCopyMasterConfig(current => {
                                const ids = Array.isArray(current?.target_device_ids) ? current.target_device_ids as string[] : []
                                return { ...(current ?? {}), target_device_ids: selected ? ids.filter(value => value !== id) : [...ids, id] }
                              })}
                            />
                            <span className="min-w-0 truncate">{String(device.email || device.user_id)} · {device.opted_in ? tr('autorisé', 'enabled') : tr('désactivé', 'disabled')}</span>
                          </label>
                        )
                      })}
                    </div>
                    <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Plans autorisés', 'Allowed plans')}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        ['custom_pro', 'Custom Pro'],
                        ['custom_ultra', 'Custom Ultra'],
                        ['custom_max', 'Custom Max'],
                        ['custom_max_2', tr('Spécial', 'Special')],
                      ].map(([key, label]) => {
                        const plans = Array.isArray(copyMasterConfig.target_plan_keys) ? copyMasterConfig.target_plan_keys as string[] : []
                        const selected = plans.includes(key)
                        return (
                          <label key={key} className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1.5 text-xs text-slate-300">
                            <input type="checkbox" checked={selected} onChange={() => setCopyMasterConfig(current => ({ ...(current ?? {}), target_plan_keys: selected ? plans.filter(value => value !== key) : [...plans, key] }))} />
                            {label}
                          </label>
                        )
                      })}
                    </div>
                    {copyMasterConfig.target_scope === 'groups' ? (
                      <>
                        <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Groupes ciblés', 'Target groups')}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {copyGroups.map(group => {
                            const id = String(group.id)
                            const ids = Array.isArray(copyMasterConfig.target_group_ids) ? copyMasterConfig.target_group_ids as string[] : []
                            const selected = ids.includes(id)
                            return (
                              <label key={id} className="flex items-center gap-2 rounded-lg border border-white/10 px-2 py-1.5 text-xs text-slate-300">
                                <input type="checkbox" checked={selected} onChange={() => setCopyMasterConfig(current => ({ ...(current ?? {}), target_group_ids: selected ? ids.filter(value => value !== id) : [...ids, id] }))} />
                                {String(group.name)}
                              </label>
                            )
                          })}
                        </div>
                      </>
                    ) : null}
                    {copyMasterConfig.lot_policy === 'proportional' ? (
                      <label className="mt-3 block rounded-lg border border-white/10 px-2 py-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Equity de base du maître', 'Master base equity')}</span>
                        <input type="number" min="1" value={Number(copyMasterConfig.proportional_base_equity_usd ?? 5000)} onChange={event => setCopyMasterConfig(current => ({ ...(current ?? {}), proportional_base_equity_usd: Math.max(1, Number(event.target.value) || 1) }))} className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none" />
                      </label>
                    ) : null}
                  </div>
                  <div className="flex flex-col justify-between gap-2 rounded-xl border border-white/10 bg-slate-950/45 p-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <input type="checkbox" checked={copyMasterConfig.enabled === true} onChange={event => setCopyMasterConfig(current => ({ ...(current ?? {}), enabled: event.target.checked }))} />
                      {tr('Diffusion maître active', 'Master broadcasting enabled')}
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <input type="checkbox" checked={copyMasterConfig.sync_modifications !== false} onChange={event => setCopyMasterConfig(current => ({ ...(current ?? {}), sync_modifications: event.target.checked }))} />
                      {tr('Synchroniser les modifications', 'Synchronize modifications')}
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-200">
                      <input type="checkbox" checked={copyMasterConfig.sync_closes !== false} onChange={event => setCopyMasterConfig(current => ({ ...(current ?? {}), sync_closes: event.target.checked }))} />
                      {tr('Synchroniser les fermetures', 'Synchronize closes')}
                    </label>
                    <button type="button" disabled={busy === 'copy_master_save'} onClick={() => void saveCopyMasterConfig()} className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white hover:bg-rose-400 disabled:opacity-50">
                      {busy === 'copy_master_save' ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                      {tr('Enregistrer', 'Save')}
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950/35 p-3">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Groupes de diffusion', 'Broadcast groups')}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {copyGroups.map(group => (
                    <span key={String(group.id)} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-slate-300">
                      {String(group.name)} · {Array.isArray(group.member_device_ids) ? group.member_device_ids.length : 0}
                      <button type="button" onClick={() => void deleteCopyGroup(String(group.id))} className="text-rose-300"><Trash2 size={12} /></button>
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <input value={copyGroupName} onChange={event => setCopyGroupName(event.target.value)} placeholder={tr('Nom du groupe', 'Group name')} className="min-w-48 flex-1 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-white outline-none" />
                  <select multiple value={copyGroupDeviceIds} onChange={event => setCopyGroupDeviceIds(Array.from(event.target.selectedOptions).map(option => option.value))} className="min-h-10 min-w-60 rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none">
                    {copyDevices.map(device => <option key={String(device.device_id)} value={String(device.device_id)}>{String(device.email || device.user_id)}</option>)}
                  </select>
                  <button type="button" disabled={!copyGroupName.trim() || busy === 'copy_group_save'} onClick={() => void saveCopyGroup()} className="inline-flex items-center gap-2 rounded-xl border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-xs font-black text-rose-100 disabled:opacity-40"><Plus size={14} />{tr('Créer', 'Create')}</button>
                </div>
              </div>
              {copyNetworkMessage ? <p className="mt-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-xs font-bold text-slate-200">{copyNetworkMessage}</p> : null}
            </div>

            <div id="ava-admin-instant-signal" className="mt-4 scroll-mt-6 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/[0.06] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl border border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-200">
                  <Send size={18} />
                </div>
                <div>
                  <p className="flex items-center gap-2 text-sm font-black text-white">
                    {tr('Signal immédiat de l’IA principale', 'Main AI instant signal')}
                    <HelpHint text={GLOBAL_CONTROL_HELP.instantSignal} />
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {tr(
                      'Un clic demande une seule position par moteur connecté et éligible. Le lot utilisateur et toutes les protections restent appliqués.',
                      'One click requests one position per connected, eligible engine. The user lot and every safeguard remain enforced.',
                    )}
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    {tr('Marché', 'Market')}
                    <HelpHint text={GLOBAL_CONTROL_HELP.instantMarket} />
                  </span>
                  <select
                    value={instantSignal.marketKey}
                    onChange={event => setInstantSignal(current => ({ ...current, marketKey: event.target.value }))}
                    className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                  >
                    {PRICE_GUARD_MARKET_OPTIONS.map(option => (
                      <option key={option.key} value={option.key} className="bg-slate-950">{option.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    {tr('Direction', 'Direction')}
                    <HelpHint text={GLOBAL_CONTROL_HELP.instantDirection} />
                  </span>
                  <select
                    value={instantSignal.direction}
                    onChange={event => setInstantSignal(current => ({ ...current, direction: event.target.value as 'BUY' | 'SELL' }))}
                    className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                  >
                    <option value="BUY" className="bg-slate-950">BUY · {tr('Achat', 'Buy')}</option>
                    <option value="SELL" className="bg-slate-950">SELL · {tr('Vente', 'Sell')}</option>
                  </select>
                </label>
                <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    {tr('Equity nette minimum', 'Minimum net equity')}
                    <HelpHint text={GLOBAL_CONTROL_HELP.instantEquity} />
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={instantSignal.minNetEquityUsd}
                    onChange={event => setInstantSignal(current => ({ ...current, minNetEquityUsd: Math.max(0, toNumber(event.target.value, 0)) }))}
                    className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                  />
                </label>
                <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500">
                    {tr('Expiration', 'Expiration')}
                    <HelpHint text={GLOBAL_CONTROL_HELP.instantTtl} />
                  </span>
                  <select
                    value={instantSignal.ttlSeconds}
                    onChange={event => setInstantSignal(current => ({ ...current, ttlSeconds: Number(event.target.value) }))}
                    className="mt-1 w-full bg-transparent text-sm font-black text-white outline-none"
                  >
                    <option value={60} className="bg-slate-950">1 {tr('minute', 'minute')}</option>
                    <option value={120} className="bg-slate-950">2 {tr('minutes', 'minutes')}</option>
                  </select>
                </label>
                <button
                  type="button"
                  disabled={busy === 'instant_signal'}
                  onClick={dispatchInstantSignal}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-3 text-sm font-black text-white shadow-lg shadow-fuchsia-500/20 transition-colors hover:bg-fuchsia-400 disabled:opacity-50"
                >
                  {busy === 'instant_signal' ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  {tr('Envoyer le signal', 'Send signal')}
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Ciblage', 'Targeting')}</span>
                  <select value={instantSignal.targetScope} onChange={event => setInstantSignal(current => ({ ...current, targetScope: event.target.value as 'all' | 'devices' | 'groups' }))} className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none">
                    <option value="all" className="bg-slate-950">{tr('Tous les consentants', 'All opted-in users')}</option>
                    <option value="devices" className="bg-slate-950">{tr('Ordinateurs du profil maître', 'Master-profile computers')}</option>
                    <option value="groups" className="bg-slate-950">{tr('Groupes du profil maître', 'Master-profile groups')}</option>
                  </select>
                </label>
                <label className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Politique de lot', 'Lot policy')}</span>
                  <select value={instantSignal.lotPolicy} onChange={event => setInstantSignal(current => ({ ...current, lotPolicy: event.target.value as 'local' | 'master' | 'proportional' }))} className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none">
                    <option value="local" className="bg-slate-950">{tr('Limites locales', 'Local limits')}</option>
                    <option value="master" className="bg-slate-950">{tr('Lot maître plafonné', 'Capped master lot')}</option>
                    <option value="proportional" className="bg-slate-950">{tr('Proportionnel', 'Proportional')}</option>
                  </select>
                </label>
                <label className="rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{tr('Marge libre minimum', 'Minimum free margin')}</span>
                  <input type="number" min="0" value={instantSignal.minFreeMarginUsd} onChange={event => setInstantSignal(current => ({ ...current, minFreeMarginUsd: Math.max(0, Number(event.target.value) || 0) }))} className="mt-1 w-full bg-transparent text-sm font-bold text-white outline-none" />
                </label>
                <div className="flex items-end gap-2">
                  <button type="button" disabled={busy === 'copy_simulate'} onClick={() => void simulateCopySignal()} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-2 text-xs font-black text-fuchsia-100 disabled:opacity-50">
                    {busy === 'copy_simulate' ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
                    {tr('Simuler', 'Simulate')}
                  </button>
                  {copySimulation ? <span className="rounded-xl border border-white/10 px-3 py-3 text-xs font-black text-white">{Number(copySimulation.eligible ?? 0)}/{Number(copySimulation.total ?? 0)}</span> : null}
                </div>
              </div>
              {instantSignalMessage ? (
                <p className={`mt-3 rounded-xl border px-3 py-2 text-xs font-bold ${
                  instantSignalMessage.startsWith('Envoi impossible') || instantSignalMessage.startsWith('Unable to send')
                    ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
                    : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                }`}>
                  {instantSignalMessage}
                </p>
              ) : null}
            </div>
            <div className="mt-4 rounded-2xl border border-sky-400/15 bg-sky-400/[0.05] p-4">
              <div className="grid gap-3 lg:grid-cols-[minmax(180px,260px)_1fr]">
                <label className="block rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2">
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                    Bypass capital net USD
                    <HelpHint text={GLOBAL_CONTROL_HELP.bypassEquity} />
                  </span>
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
                    <HelpHint text={GLOBAL_CONTROL_HELP.bypassDirection} />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.bypass_boom_sell_entries === true}
                      onChange={event => updateAdminControl({ bypass_boom_sell_entries: event.target.checked })}
                      className="h-4 w-4 accent-rose-300"
                    />
                    Autoriser SELL Boom
                    <HelpHint text={GLOBAL_CONTROL_HELP.bypassDirection} />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.bypass_crash_buy_entries === true}
                      onChange={event => updateAdminControl({ bypass_crash_buy_entries: event.target.checked })}
                      className="h-4 w-4 accent-emerald-300"
                    />
                    Autoriser BUY Crash
                    <HelpHint text={GLOBAL_CONTROL_HELP.bypassDirection} />
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/45 px-3 py-2 text-sm font-bold text-slate-100">
                    <input
                      type="checkbox"
                      checked={adminControl?.bypass_crash_sell_entries === true}
                      onChange={event => updateAdminControl({ bypass_crash_sell_entries: event.target.checked })}
                      className="h-4 w-4 accent-rose-300"
                    />
                    Autoriser SELL Crash
                    <HelpHint text={GLOBAL_CONTROL_HELP.bypassDirection} />
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
