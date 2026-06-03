import { SUPABASE_HEADERS, SUPABASE_URL } from '../constants'

export const AVA_TRADING_STOP_COMMAND = '__AVA_TRADING_STOP__'

type RemoteCommandResponse = {
  ok?: boolean
  id?: string
  status?: string
  result?: string
  error?: string
}

const REMOTE_COMMAND_URL = `${SUPABASE_URL}/functions/v1/remote-command`

async function postRemoteCommand(body: Record<string, unknown>): Promise<RemoteCommandResponse> {
  const res = await fetch(REMOTE_COMMAND_URL, {
    method: 'POST',
    headers: SUPABASE_HEADERS,
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { ok: false, error: data?.error ?? 'Commande distante indisponible.' }
  }
  return data
}

export async function sendAvaTradingStop(userId: string): Promise<{ id?: string; error?: string }> {
  const data = await postRemoteCommand({
    action: 'send',
    user_id: userId,
    command: AVA_TRADING_STOP_COMMAND,
  })
  return data.id ? { id: data.id } : { error: data.error ?? 'Commande non envoyee.' }
}

export async function getRemoteCommandStatus(userId: string, id: string): Promise<{ status?: string; result?: string; error?: string }> {
  const data = await postRemoteCommand({
    action: 'status',
    user_id: userId,
    id,
  })
  return { status: data.status, result: data.result, error: data.error }
}

export async function waitForRemoteCommand(userId: string, id: string, timeoutMs = 30000): Promise<{ status: string; result?: string; error?: string }> {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    const status = await getRemoteCommandStatus(userId, id)
    if (status.status === 'done' || status.status === 'error') {
      return { status: status.status, result: status.result, error: status.error }
    }
    await new Promise(resolve => setTimeout(resolve, 1200))
  }
  return { status: 'pending', error: 'Commande envoyee, en attente du Desktop lie.' }
}
