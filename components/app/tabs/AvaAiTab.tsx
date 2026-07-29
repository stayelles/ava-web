'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react'
import { Bot, Headphones, ImagePlus, RefreshCw, Send, ShieldCheck, SlidersHorizontal, Trash2 } from 'lucide-react'
import type { UserData } from '../types'
import { avaAiMediaRequest, avaAiRequest, avaSupportRequest } from '../services/avaAi'
import { SupportAdminPanel, SupportAgentConsole } from '../support/SupportOperations'

type Role = 'support' | 'account' | 'trading'
type Message = { role: 'user' | 'assistant'; content: string; images?: string[] }
type PendingImage = { name: string; mime_type: 'image/png' | 'image/jpeg' | 'image/webp'; data: string; preview: string }

const EDITABLE_SCHEMA = {
  // Le Desktop fournit le schéma complet au runtime. Ce registre Web n'autorise
  // que des paramètres non sensibles; le Desktop peut encore les refuser.
  cadence: { type: 'number', min: 1, max: 3600, ai_editable: true },
  minProfit: { type: 'number', min: 0, max: 100, ai_editable: true },
  maxOpenPositions: { type: 'integer', min: 0, max: 100, ai_editable: true },
  basketProfit: { type: 'number', min: 0, max: 10000, ai_editable: true },
  reboundCandles: { type: 'integer', min: 1, max: 500, ai_editable: true },
}

export function AvaAiTab({ user }: { user: UserData }) {
  const [role, setRole] = useState<Role>('support')
  const [canAdvanced, setCanAdvanced] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [images, setImages] = useState<PendingImage[]>([])
  const [loading, setLoading] = useState(false)
  const [proposal, setProposal] = useState<Record<string, any> | null>(null)
  const [pendingAction, setPendingAction] = useState<Record<string, any> | null>(null)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [adminOpen, setAdminOpen] = useState(false)
  const [agentConsoleOpen, setAgentConsoleOpen] = useState(false)
  const [supportAgent, setSupportAgent] = useState<any>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [inviteId] = useState(() => typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('support_invite') ?? '')
  const endRef = useRef<HTMLDivElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    avaAiRequest(user, { action: 'usage' }).then(data => setCanAdvanced(data.can_use_advanced_ai === true)).catch(() => setCanAdvanced(false))
    const loadSupportRole = async () => {
      if (user.is_admin) await avaSupportRequest(user, { action: 'bootstrap-owner' })
      const data = await avaSupportRequest(user, { action: 'list' })
      setSupportAgent(data.agent ?? null)
    }
    void loadSupportRole().catch(() => null)
  }, [user])
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, proposal])

  async function pickImages(files: FileList | null) {
    const selected = Array.from(files ?? []).slice(0, Math.max(0, 5 - images.length))
      .filter(file => ['image/png', 'image/jpeg', 'image/webp'].includes(file.type) && file.size <= 10 * 1024 * 1024)
    const next = await Promise.all(selected.map(file => new Promise<PendingImage>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const preview = String(reader.result ?? '')
        const data = preview.includes(',') ? preview.slice(preview.indexOf(',') + 1) : preview
        resolve({ name: file.name, mime_type: file.type as PendingImage['mime_type'], data, preview })
      }
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })))
    setImages(current => [...current, ...next].slice(0, 5))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function waitCommand(commandId: string) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await new Promise(resolve => window.setTimeout(resolve, 2000))
      const data = await avaAiRequest(user, { action: 'command-status', command_id: commandId })
      if (['done', 'partial'].includes(data.command?.status)) return data.command.result ?? {}
      if (['error', 'expired'].includes(data.command?.status)) throw new Error(data.command?.result?.error ?? 'DESKTOP_COMMAND_FAILED')
    }
    throw new Error('DESKTOP_OFFLINE')
  }

  async function readDesktopConfig() {
    const data = await avaAiRequest(user, {
      action: 'command', command: 'READ_CONFIG', device_id: 'primary', parameters: {},
      idempotency_key: `READ_CONFIG:${user.id}:${Math.floor(Date.now() / 10000)}`,
    })
    if (!data.command?.id) throw new Error('DESKTOP_OFFLINE')
    return waitCommand(data.command.id)
  }

  async function readDesktopStatus() {
    const data = await avaAiRequest(user, {
      action: 'command', command: 'READ_STATUS', device_id: 'primary', parameters: {},
      idempotency_key: `READ_STATUS:${user.id}:${Math.floor(Date.now() / 10000)}`,
    })
    if (!data.command?.id) throw new Error('DESKTOP_OFFLINE')
    return waitCommand(data.command.id)
  }

  async function send() {
    const text = input.trim()
    if ((!text && !images.length) || loading) return
    setInput('')
    const message = text || 'Analyse ces images.'
    const selectedImages = [...images]
    setImages([])
    setMessages(prev => [...prev, { role: 'user', content: message, images: selectedImages.map(item => item.preview) }])
    setLoading(true)
    try {
      const desktopConfig = role === 'trading' ? await readDesktopConfig() : null
      const desktopStatus = role === 'account' ? await readDesktopStatus() : null
      const result = await avaAiRequest(user, {
        action: 'chat', role, message, thread_id: threadId,
        attachments: selectedImages.map(({ mime_type, data }) => ({ mime_type, data })),
        history: messages.slice(-20),
        propose_config: role === 'trading',
        current_config: desktopConfig?.config ?? {}, editable_schema: role === 'trading' ? (desktopConfig?.schema ?? EDITABLE_SCHEMA) : undefined,
        device_id: 'primary', market: 'BOOM_CRASH_1000', symbol: desktopConfig?.symbol ?? 'BOOM_CRASH_1000', timeframe: desktopConfig?.timeframe ?? 'M1',
        compact_indicators: desktopConfig?.compact_indicators,
        desktop_status: desktopStatus,
      })
      setThreadId(result.thread_id ?? threadId)
      setMessages(prev => [...prev, { role: 'assistant', content: result.message ?? 'Je n’ai pas assez de données pour répondre.' }])
      setProposal(result.proposal ?? null)
      setPendingAction(result.action ?? null)
      if (result.escalate_to_human === true) {
        await requestHuman(message, selectedImages, result.message ?? '')
      }
    } catch (error) {
      const code = error instanceof Error ? error.message : 'AVA_AI_ERROR'
      setMessages(prev => [...prev, { role: 'assistant', content: code === 'CUSTOM_MAX_REQUIRED' ? 'Cette fonction avancée est réservée au plan Custom Max.' : 'Ava AI est momentanément indisponible.' }])
    } finally { setLoading(false) }
  }

  async function decide(action: 'confirm' | 'cancel') {
    if (!pendingAction?.id || loading) return
    setLoading(true)
    try {
      const result = await avaAiRequest(user, { action, action_id: pendingAction.id })
      const desktopResult = action === 'confirm' && result.command?.id ? await waitCommand(result.command.id) : null
      setMessages(prev => [...prev, { role: 'assistant', content: action === 'confirm'
        ? desktopResult?.queued
          ? 'Proposition confirmée et mise en attente. Elle sera revalidée au prochain lancement du moteur.'
          : `Modification revalidée par Desktop : ${Object.keys(desktopResult?.accepted ?? {}).length} champ(s) accepté(s), ${Object.keys(desktopResult?.clamped ?? {}).length} plafonné(s), ${Object.keys(desktopResult?.refused ?? {}).length} refusé(s).`
        : 'Proposition annulée. Aucun paramètre n’a été modifié.' }])
      setProposal(null); setPendingAction(null)
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Cette proposition a expiré ou a déjà été traitée.' }])
    } finally { setLoading(false) }
  }

  async function requestHuman(message: string, selectedImages: PendingImage[], assistantReply: string) {
    if (!user.first_name?.trim()) {
      window.dispatchEvent(new CustomEvent('ava-open-support'))
      setMessages(prev => [...prev, { role: 'assistant', content: 'Indiquez votre prénom dans le panneau Ava Support pour terminer le transfert.' }])
      return
    }
    try {
      const created = await avaSupportRequest(user, {
        action: 'create',
        first_name: user.first_name.trim(),
        subject: 'Escalade depuis Ava AI',
      })
      const conversationId = created.conversation.id
      const summary = [
        ...messages.slice(-8).map(item => `${item.role}: ${item.content}`),
        `user: ${message}`,
        `assistant: ${assistantReply}`,
      ].join('\n')
      const uploaded = await Promise.all(selectedImages.map(item => avaSupportRequest(user, { action: 'attachment', data: item.data, mime_type: item.mime_type })))
      await avaSupportRequest(user, {
        action: 'message', conversation_id: conversationId,
        message,
        attachments: uploaded.map(item => item.attachment).filter(Boolean),
        as_customer: true,
      })
      await avaSupportRequest(user, { action: 'escalate', conversation_id: conversationId, priority: 10, summary: { problem: summary, attempts: [] } })
      setMessages(prev => [...prev, { role: 'assistant', content: 'Votre demande est dans la file Ava Support. Un conseiller reprendra le contexte.' }])
      window.dispatchEvent(new CustomEvent('ava-open-support', { detail: { conversationId } }))
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Je n’ai pas pu ouvrir la file humaine. Réessayez dans un instant.' }])
    }
  }

  async function acceptSupportInvite() {
    if (!/^\d{6}$/.test(inviteCode)) return
    setLoading(true)
    try {
      const result = await avaSupportRequest(user, { action: 'accept-invite', invite_id: inviteId || undefined, code: inviteCode })
      setSupportAgent(result.agent ?? null); setInviteCode('')
      setMessages(prev => [...prev, { role: 'assistant', content: 'Accès conseiller validé. La console Ava Support est maintenant disponible.' }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: error instanceof Error ? `Invitation non validée : ${error.message}` : 'Invitation non validée.' }])
    } finally { setLoading(false) }
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden bg-[#020617]">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <header className="relative px-4 sm:px-6 py-4 border-b border-white/10 bg-white/[0.03] backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center"><Bot className="text-rose-400" size={22} /></div>
            <div><h1 className="font-black text-white">Ava AI</h1><p className="text-xs text-slate-500">Intelligence artificielle développée par Bromuxe · réponses courtes et contrôlées</p></div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(user.is_admin || supportAgent) && <button onClick={() => { setAgentConsoleOpen(value => !value); setAdminOpen(false) }} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold ${agentConsoleOpen ? 'border-rose-500/35 bg-rose-500 text-white' : 'border-rose-500/25 bg-rose-500/10 text-rose-300'}`}><Headphones size={16} /> Console conseiller</button>}
            {user.is_admin && <button onClick={() => { setAdminOpen(value => !value); setAgentConsoleOpen(false) }} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-500/25 bg-rose-500/10 text-rose-300 text-xs font-bold"><ShieldCheck size={16} /> Gérer Ava Support</button>}
          </div>
        </div>
        {!agentConsoleOpen && <div className="flex gap-2 mt-4 overflow-x-auto">
          {([
            ['support', 'Assistance IA', ShieldCheck],
            ['account', 'Compte', Bot],
            ['trading', 'Diagnostic Desktop', SlidersHorizontal],
          ] as const).map(([id, label, Icon]) => {
            const locked = id !== 'support' && !canAdvanced
            return <button key={id} disabled={locked} onClick={() => setRole(id)} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${role === id ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-white/[0.03] text-slate-500 border-white/10'} disabled:opacity-40`}>
              <Icon size={15} /> {label}{locked ? ' · Max' : ''}
            </button>
          })}
        </div>}
      </header>

      <main className="relative flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
        {agentConsoleOpen ? (
          <SupportAgentConsole user={user} initialAgent={supportAgent} />
        ) : <>
        {adminOpen && user.is_admin && <AdminAvaAiPanel user={user} />}
        {!user.is_admin && !supportAgent && (inviteId || role === 'support') && <details className="max-w-xl mx-auto rounded-2xl border border-white/10 bg-white/[0.03] p-4"><summary className="cursor-pointer text-xs font-bold text-slate-400">J’ai reçu une invitation conseiller</summary><div className="mt-3 flex gap-2"><input value={inviteCode} onChange={event => setInviteCode(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="Code à 6 chiffres" className="flex-1 rounded-xl bg-slate-900 border border-white/10 p-2 text-sm text-white" /><button onClick={acceptSupportInvite} className="rounded-xl bg-rose-500 px-4 text-xs text-white font-bold">Valider</button></div></details>}
        {messages.length === 0 && <div className="max-w-xl mx-auto mt-12 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-xl p-6 text-center">
          <Bot className="mx-auto text-rose-400 mb-3" size={28} /><p className="text-white font-bold">Que puis-je vérifier pour vous ?</p><p className="text-sm text-slate-400 mt-2">Le support est disponible pour tous. Les outils de compte et de configuration sont réservés à Custom Max.</p>
        </div>}
        {messages.map((message, index) => <div key={index} className={`max-w-2xl rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap ${message.role === 'user' ? 'ml-auto bg-rose-500 text-white' : 'mr-auto bg-white/[0.04] border border-white/10 text-slate-200'}`}>{message.images?.length ? <div className="mb-2 flex flex-wrap gap-2">{message.images.map((src, imageIndex) => <img key={imageIndex} src={src} alt="Pièce jointe" className="max-h-36 rounded-xl" />)}</div> : null}{message.content}</div>)}
        {proposal && <div className="max-w-2xl mr-auto rounded-2xl bg-white/[0.04] border border-rose-500/30 p-4">
          <p className="text-xs uppercase tracking-widest text-rose-400 font-bold">Comparatif avant / après</p>
          <div className="mt-3 space-y-2">{Object.entries(proposal.patch ?? {}).map(([key, value]) => <div key={key} className="grid grid-cols-3 gap-2 text-xs"><span className="text-slate-400">{key}</span><span className="text-slate-500">{String(proposal.previous_values?.[key] ?? 'actuel')}</span><span className="text-white">{String(value)}</span></div>)}</div>
          <p className="text-xs text-slate-400 mt-3">Risque : {proposal.risk} · Confiance : {Math.round(Number(proposal.confidence ?? 0) * 100)} %. Le Desktop peut plafonner ou refuser chaque valeur.</p>
          <div className="flex gap-2 mt-4"><button onClick={() => decide('confirm')} className="px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-bold">Confirmer</button><button onClick={() => decide('cancel')} className="px-4 py-2 rounded-xl border border-white/10 text-slate-400 text-xs font-bold">Annuler</button></div>
        </div>}
        {loading && <div className="text-xs text-slate-500">Ava analyse…</div>}
        <div ref={endRef} />
        </>}
      </main>

      {!agentConsoleOpen && <footer className="relative p-4 border-t border-white/10 bg-[#020617]/95 backdrop-blur-xl">
        {images.length > 0 && <div className="max-w-3xl mx-auto mb-2 flex flex-wrap gap-2">{images.map((item, index) => <button key={`${item.name}-${index}`} onClick={() => setImages(current => current.filter((_, position) => position !== index))} className="relative group"><img src={item.preview} alt={item.name} className="h-14 w-14 object-cover rounded-xl border border-white/10" /><span className="absolute inset-0 rounded-xl bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Trash2 size={14} /></span></button>)}</div>}
        <div className="max-w-3xl mx-auto flex gap-2"><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={event => void pickImages(event.target.files)} /><button onClick={() => fileRef.current?.click()} className="w-12 rounded-2xl border border-white/10 bg-white/[0.04] text-slate-300 flex items-center justify-center" title="Ajouter des images"><ImagePlus size={18} /></button><textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} rows={2} placeholder={role === 'trading' ? 'Décrivez le diagnostic ou l’optimisation souhaitée…' : 'Écrivez votre question…'} className="flex-1 resize-none rounded-2xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white outline-none focus:border-rose-500/40" /><button onClick={send} disabled={loading || (!input.trim() && !images.length)} className="w-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center disabled:opacity-40"><Send size={18} /></button></div>
      </footer>}
    </div>
  )
}

function AdminAvaAiPanel({ user }: { user: UserData }) {
  const [images, setImages] = useState<any[]>([])
  const [symbol, setSymbol] = useState('Boom 1000 Index')
  const [timeframe, setTimeframe] = useState('M1')
  const [source, setSource] = useState('MT5')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  async function processQueuedAnalyses(maxJobs = 20) {
    let processed = 0
    while (processed < maxJobs) {
      const result = await avaAiMediaRequest(user, { action: 'process-next' }, 120000)
      if (!result.job_id) break
      processed += 1
    }
    return processed
  }

  async function refresh() {
    setBusy(true)
    try {
      const media = await avaAiMediaRequest(user, { action: 'list', symbol: symbol || undefined, timeframe: timeframe || undefined })
      setImages(media.images ?? [])
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Chargement impossible') }
    finally { setBusy(false) }
  }

  useEffect(() => {
    void (async () => {
      await processQueuedAnalyses().catch(() => 0)
      await refresh()
    })()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  async function upload(files: FileList | null) {
    if (!files?.length) return
    if (files.length > 20) { setNotice('Maximum 20 images par lot.'); return }
    setBusy(true); setNotice('Nettoyage des métadonnées et masquage des identifiants…')
    try {
      const payload = await Promise.all(Array.from(files).map(async file => {
        if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error('Format invalide ou image supérieure à 10 Mo.')
        const data = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file) })
        return { data, market: 'BOOM_CRASH_1000', symbol, timeframe, source, captured_at: new Date(file.lastModified || Date.now()).toISOString() }
      }))
      await avaAiMediaRequest(user, { action: 'upload', files: payload }, 120000)
      setNotice('Images privées ajoutées. Analyse Ava AI en arrière-plan…')
      await refresh()
      void (async () => {
        const processed = await processQueuedAnalyses(payload.length).catch(() => 0)
        setNotice(processed ? `${processed} image(s) analysée(s).` : 'Les images restent dans la file d’analyse.')
        await refresh()
      })()
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Upload impossible') }
    finally { setBusy(false) }
  }

  async function removeImage(id: string) { setBusy(true); try { await avaAiMediaRequest(user, { action: 'delete', image_id: id }); await refresh() } finally { setBusy(false) } }
  async function reanalyze(id: string) { setBusy(true); try { await avaAiMediaRequest(user, { action: 'reanalyze', image_id: id }); setNotice('Nouvelle analyse programmée.'); await refresh(); void processQueuedAnalyses(1).then(async processed => { if (processed) setNotice('Analyse mise à jour.'); await refresh() }).catch(() => null) } finally { setBusy(false) } }
  return <section className="max-w-5xl mx-auto rounded-3xl border border-rose-500/25 bg-slate-950/80 p-5 space-y-5">
    <div className="flex items-center justify-between"><div><h2 className="text-white font-black">Administration Ava AI</h2><p className="text-xs text-slate-500">Images marché privées, conseillers et qualité du support.</p></div><button onClick={refresh} disabled={busy} className="p-2 rounded-xl border border-white/10 text-slate-300"><RefreshCw size={16} className={busy ? 'animate-spin' : ''} /></button></div>
    {notice && <p className="text-xs text-amber-300">{notice}</p>}
    <SupportAdminPanel user={user} />
    <div id="ava-market-library" className="scroll-mt-6 rounded-2xl bg-white/[0.03] border border-white/10 p-4 space-y-3"><h3 className="text-sm text-white font-bold flex gap-2"><ImagePlus size={17} /> Bibliothèque marché</h3><div className="grid grid-cols-3 gap-2"><input value={symbol} onChange={e => setSymbol(e.target.value)} className="rounded-xl bg-slate-900 border border-white/10 p-2 text-xs text-white" /><input value={timeframe} onChange={e => setTimeframe(e.target.value)} className="rounded-xl bg-slate-900 border border-white/10 p-2 text-xs text-white" /><select value={source} onChange={e => setSource(e.target.value)} className="rounded-xl bg-slate-900 border border-white/10 p-2 text-xs text-white"><option>MT5</option><option>TradingView</option><option>other</option></select></div><label className="block cursor-pointer rounded-xl bg-rose-500 text-white text-center text-xs font-bold p-3"><input type="file" accept="image/png,image/jpeg,image/webp" multiple className="hidden" onChange={e => void upload(e.target.files)} />Ajouter jusqu’à 20 images</label><div className="grid grid-cols-2 gap-2 max-h-80 overflow-auto">{images.map(image => <div key={image.id} className="rounded-xl border border-white/10 overflow-hidden"><img src={image.preview_url} alt="Graphique marché privé" className="w-full h-24 object-cover" /><div className="p-2 text-[10px] text-slate-400"><p>{image.symbol} · {image.timeframe}</p><p>{image.ava_market_image_analyses?.[0]?.status ?? 'queued'} · {image.privacy_redactions ?? 0} masquage(s)</p><div className="flex gap-2 mt-2"><button onClick={() => reanalyze(image.id)} aria-label="Réanalyser"><RefreshCw size={13} /></button><button onClick={() => removeImage(image.id)} aria-label="Supprimer"><Trash2 size={13} /></button></div></div></div>)}</div></div>
  </section>
}
