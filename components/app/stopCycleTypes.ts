export type StopCycleMode = 'blocked' | 'allowed' | 'forced'

export type StopCycleRule = {
  id: string
  enabled: boolean
  market_key: 'BOOM1000' | 'CRASH1000'
  block_buy_stop: boolean
  block_sell_stop: boolean
  allow_buy_limit: boolean
  allow_sell_limit: boolean
  allow_buy_stop_limit: boolean
  allow_sell_stop_limit: boolean
  min_price: number | null
  max_price: number | null
  min_net_equity_usd: number
  max_orders_per_side: number
  max_concurrent_cycles: number
  starts_at?: string | null
  ends_at?: string | null
}

export type StopCyclePolicy = {
  version: 1 | 2 | 3 | 4
  feature_enabled: boolean
  mode: StopCycleMode
  owner_only: true
  rules: StopCycleRule[]
}

export type StopCycleConfig = {
  enabled: boolean
  ordersPerSide: number
  distanceMode: 'broker_minimum' | 'custom'
  customDistancePoints: number
  basketTargetUsd: number
  expirationSeconds: number
  recenterDelaySeconds: number
}

export type StopCycleStatus = {
  cycleId: string | null
  marketKey: 'BOOM1000' | 'CRASH1000'
  phase: 'idle' | 'placing' | 'waiting' | 'triggered' | 'closing' | 'rearming' | 'blocked' | 'error'
  buyStopPrice: number | null
  sellStopPrice: number | null
  effectiveDistancePoints: number | null
  brokerMinimumPoints: number | null
  spreadPoints: number | null
  buyTickets: number[]
  sellTickets: number[]
  triggeredSide: 'BUY' | 'SELL' | null
  profitUsd: number
  targetUsd: number
  expiresAt: string | null
  reason?: string | null
}

export type BridgeStopCycleCommand = {
  action: 'PLACE_STOP_CYCLE' | 'CANCEL_STOP_CYCLE' | 'CLOSE_STOP_CYCLE'
  cycle_id: string
  symbol: string
  market_key: 'BOOM1000' | 'CRASH1000'
  orders_per_side?: number
  buy_lot?: number
  sell_lot?: number
  distance_mode?: 'broker_minimum' | 'custom'
  custom_distance_points?: number
  basket_target_usd?: number
  expiration_seconds?: number
}
