'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity, CheckCircle2, Clock3, Copy, ExternalLink, FileText, Headphones,
  ImagePlus, Loader2, MessageCircleQuestion, Mic, MicOff, RefreshCw, Send,
  ShieldCheck, Star, Trash2, UserPlus, UserRoundCheck, UsersRound, X,
} from 'lucide-react'
import type { UserData } from '../types'
import { avaSupportRequest } from '../services/avaAi'
import { playSupportMessageSound, TypingDots } from './supportFeedback'

function formatDuration(seconds: number | null | undefined) {
  if (!Number.isFinite(seconds)) return '—'
  if (Number(seconds) < 60) return `${seconds} s`
  return `${Math.round(Number(seconds) / 60)} min`
}

function presenceOf(agent: any) {
  const presence = Array.isArray(agent?.ava_support_presence)
    ? agent.ava_support_presence[0]
    : agent?.ava_support_presence
  if (!presence || Date.parse(String(presence.last_seen_at)) < Date.now() - 90_000) return 'offline'
  return presence.status ?? 'offline'
}

function AgentAvatar({ profile, size = 'h-10 w-10' }: { profile?: any; size?: string }) {
  if (profile?.avatar_url) {
    return <img src={profile.avatar_url} alt={`Photo de ${profile.first_name}`} className={`${size} rounded-2xl object-cover border border-white/10`} />
  }
  return <div className={`${size} rounded-2xl bg-rose-500/15 border border-rose-400/25 grid place-items-center text-rose-200 font-black`}>{String(profile?.first_name ?? 'A').slice(0, 1).toUpperCase()}</div>
}

function SupportAttachment({ attachment }: { attachment: any }) {
  if (!attachment?.preview_url) return null
  const mimeType = String(attachment.mime_type ?? '')
  if (mimeType.startsWith('image/')) {
    return <img src={attachment.preview_url} alt={attachment.file_name || 'Image envoyée'} className="mt-2 max-h-52 rounded-xl object-contain" />
  }
  if (mimeType.startsWith('video/')) {
    return <video src={attachment.preview_url} controls preload="metadata" className="mt-2 max-h-56 w-full rounded-xl bg-black" />
  }
  return (
    <a href={attachment.preview_url} target="_blank" rel="noreferrer" className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/30 p-3 text-[11px] font-bold text-rose-100">
      <FileText size={17} />
      <span className="truncate">{attachment.file_name || 'Document joint'}</span>
    </a>
  )
}

function AgentOnboarding({ user, agent, onDone }: { user: UserData; agent: any; onDone: (agent: any) => void }) {
  const [firstName, setFirstName] = useState(agent?.first_name ?? user.first_name ?? '')
  const [avatar, setAvatar] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function chooseAvatar(file?: File) {
    if (!file || !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError('Choisissez une image PNG, JPG ou WebP de moins de 5 Mo.')
      return
    }
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })
    setAvatar(data)
    setError('')
  }

  async function save() {
    if (!firstName.trim() || (!avatar && !agent?.avatar_path)) {
      setError('Votre prénom et votre photo professionnelle sont obligatoires.')
      return
    }
    setBusy(true); setError('')
    try {
      const result = await avaSupportRequest(user, {
        action: 'agent-profile',
        first_name: firstName.trim(),
        avatar_data: avatar || undefined,
      }, 60_000)
      onDone(result.agent)
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Profil impossible à enregistrer.')
    } finally { setBusy(false) }
  }

  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-rose-400/25 bg-slate-950/90 p-5 sm:p-7 shadow-2xl shadow-rose-950/30">
      <div className="flex gap-3">
        <div className="h-11 w-11 shrink-0 rounded-2xl bg-rose-500/15 border border-rose-400/25 grid place-items-center"><UserRoundCheck className="text-rose-300" size={21} /></div>
        <div><h2 className="text-white font-black">Finaliser votre profil conseiller</h2><p className="mt-1 text-xs text-slate-400">Votre prénom et votre photo seront visibles par les clients que vous accompagnez.</p></div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-5">
        <label className="group relative h-28 w-28 shrink-0 cursor-pointer overflow-hidden rounded-3xl border border-dashed border-rose-400/35 bg-white/[0.03]">
          {avatar || agent?.profile?.avatar_url
            ? <img src={avatar || agent.profile.avatar_url} alt="Aperçu du profil" className="h-full w-full object-cover" />
            : <span className="h-full grid place-items-center text-center text-[11px] font-bold text-slate-400"><ImagePlus size={22} className="mx-auto mb-1 text-rose-300" />Ajouter<br />une photo</span>}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={event => void chooseAvatar(event.target.files?.[0])} />
        </label>
        <div className="flex-1 space-y-3">
          <label className="block text-xs font-bold text-slate-300">Prénom affiché
            <input value={firstName} onChange={event => setFirstName(event.target.value)} maxLength={60} placeholder="Votre prénom" className="mt-2 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-rose-400/40" />
          </label>
          <p className="text-[11px] leading-relaxed text-slate-500">Aucun mot de passe client ni accès global ne vous sera fourni. Les informations utiles sont accessibles uniquement pendant un ticket qui vous est attribué.</p>
        </div>
      </div>
      {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
      <button onClick={save} disabled={busy} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-500 px-4 py-3 text-sm font-black text-white disabled:opacity-50">
        {busy ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />} Activer ma console
      </button>
    </section>
  )
}

export function SupportAgentConsole({ user, initialAgent }: { user: UserData; initialAgent?: any }) {
  const [agent, setAgent] = useState<any>(initialAgent ?? null)
  const [online, setOnline] = useState(false)
  const [conversations, setConversations] = useState<any[]>([])
  const [queue, setQueue] = useState<any[]>([])
  const [activeId, setActiveId] = useState('')
  const [customerContext, setCustomerContext] = useState<any>(null)
  const [draft, setDraft] = useState('')
  const [professionalDraft, setProfessionalDraft] = useState<any>(null)
  const [performance, setPerformance] = useState<any>(null)
  const [peerTyping, setPeerTyping] = useState(false)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [recording, setRecording] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const peerTypingRef = useRef(false)
  const lastIncomingRef = useRef('')
  const incomingConversationRef = useRef('')

  const active = useMemo(() => conversations.find(item => item.id === activeId) ?? null, [activeId, conversations])
  const assigned = useMemo(() => conversations.filter(item => item.status === 'assigned'), [conversations])

  const refresh = useCallback(async () => {
    let result = await avaSupportRequest(user, { action: 'list' })
    if (!result.agent && user.is_admin) {
      await avaSupportRequest(user, { action: 'bootstrap-owner' })
      result = await avaSupportRequest(user, { action: 'list' })
    }
    setAgent(result.agent ?? null)
    const ownConversations = result.agent
      ? (result.conversations ?? []).filter((item: any) => item.assigned_agent_id === result.agent.id)
      : []
    setConversations(ownConversations)
    setQueue(result.queue ?? [])
    setPerformance(result.performance ?? null)
    setActiveId(current => ownConversations.some((item: any) => item.id === current)
      ? current
      : ownConversations.find((item: any) => item.status === 'assigned')?.id || '')
  }, [user])

  useEffect(() => {
    void refresh().catch(() => setNotice('La console ne peut pas être chargée.'))
  }, [refresh])

  useEffect(() => {
    if (!online || !agent?.onboarding_completed_at) return
    const heartbeat = () => void avaSupportRequest(user, { action: 'presence', status: 'online' }).catch(() => null)
    heartbeat()
    const timer = window.setInterval(() => { heartbeat(); void refresh().catch(() => null) }, 8_000)
    return () => {
      window.clearInterval(timer)
      void avaSupportRequest(user, { action: 'presence', status: 'offline' }).catch(() => null)
    }
  }, [agent?.onboarding_completed_at, online, refresh, user])

  useEffect(() => {
    if (!online || !active?.id || active.status !== 'assigned') {
      setPeerTyping(false)
      peerTypingRef.current = false
      return
    }
    let cancelled = false
    const conversationId = active.id
    const updatedAt = String(active.updated_at ?? '')
    const watch = async () => {
      while (!cancelled) {
        try {
          const result = await avaSupportRequest(user, {
            action: 'watch',
            conversation_id: conversationId,
            view: 'agent',
            updated_at: updatedAt,
            peer_typing: peerTypingRef.current,
          }, 25_000)
          if (cancelled) break
          peerTypingRef.current = result.peer_typing === true
          setPeerTyping(peerTypingRef.current)
          if (result.changed) await refresh()
        } catch {
          if (!cancelled) await new Promise(resolve => window.setTimeout(resolve, 1_500))
        }
      }
    }
    void watch()
    return () => { cancelled = true }
  }, [active?.id, active?.status, active?.updated_at, online, refresh, user])

  useEffect(() => {
    if (!active?.id || active.status !== 'assigned' || professionalDraft || !draft.trim()) {
      if (active?.id) {
        void avaSupportRequest(user, {
          action: 'typing', conversation_id: active.id, active: false, as_agent: true,
        }).catch(() => null)
      }
      return
    }
    const sendTyping = () => void avaSupportRequest(user, {
      action: 'typing', conversation_id: active.id, active: true, as_agent: true,
    }).catch(() => null)
    sendTyping()
    const timer = window.setInterval(sendTyping, 2_500)
    return () => window.clearInterval(timer)
  }, [active?.id, active?.status, draft, professionalDraft, user])

  useEffect(() => {
    if (!active?.id) return
    const incoming = (active.ava_support_messages ?? [])
      .filter((item: any) => item.sender_type === 'user')
      .slice().sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at))).at(-1)
    const key = incoming?.id ? `${active.id}:${incoming.id}` : ''
    if (incomingConversationRef.current !== active.id) {
      incomingConversationRef.current = active.id
      lastIncomingRef.current = key
      return
    }
    if (key && lastIncomingRef.current && key !== lastIncomingRef.current) {
      playSupportMessageSound()
    }
    lastIncomingRef.current = key
  }, [active?.id, active?.ava_support_messages])

  useEffect(() => {
    setCustomerContext(null)
    setProfessionalDraft(null)
    setDraft('')
  }, [activeId])

  async function toggleOnline() {
    const next = !online
    setBusy(true); setNotice('')
    try {
      await avaSupportRequest(user, { action: 'presence', status: next ? 'online' : 'offline' })
      setOnline(next)
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Statut indisponible.')
    } finally { setBusy(false) }
  }

  async function claimConversation(conversationId?: string) {
    if (!online) { setNotice('Passez en ligne avant de prendre une demande.'); return }
    setBusy(true); setNotice('')
    try {
      const result = await avaSupportRequest(user, {
        action: 'claim',
        conversation_id: conversationId || undefined,
      })
      if (!result.conversation_id) setNotice('Aucune nouvelle demande en attente.')
      else setActiveId(result.conversation_id)
      await refresh()
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Attribution impossible.')
    } finally { setBusy(false) }
  }

  async function claimNext() {
    await claimConversation()
  }

  async function loadCustomerContext() {
    if (!active) return
    setBusy(true); setNotice('')
    try {
      setCustomerContext(await avaSupportRequest(user, { action: 'customer-context', conversation_id: active.id }))
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Contexte indisponible.')
    } finally { setBusy(false) }
  }

  async function rewrite(source: 'text' | 'voice' = 'text', text = draft) {
    if (!active || !text.trim()) return
    setBusy(true); setNotice('')
    try {
      const result = await avaSupportRequest(user, {
        action: 'rewrite', conversation_id: active.id, message: text.trim(), source,
      }, 45_000)
      setDraft(text.trim())
      setProfessionalDraft(result.draft)
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Reformulation indisponible.')
    } finally { setBusy(false) }
  }

  async function sendApproved() {
    if (!active || !professionalDraft?.rewritten_text) return
    setBusy(true); setNotice('')
    try {
      await avaSupportRequest(user, {
        action: 'message',
        conversation_id: active.id,
        message: professionalDraft.rewritten_text,
        draft_id: professionalDraft.id,
        as_agent: true,
      })
      setDraft(''); setProfessionalDraft(null)
      await refresh()
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Envoi impossible.')
    } finally { setBusy(false) }
  }

  async function startRecording() {
    setNotice('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      streamRef.current = stream
      recorderRef.current = recorder
      chunksRef.current = []
      recorder.ondataavailable = event => { if (event.data.size) chunksRef.current.push(event.data) }
      recorder.onstop = () => void transcribeRecording(recorder.mimeType || 'audio/webm')
      recorder.start()
      setRecording(true)
    } catch {
      setNotice('Autorisez le microphone pour dicter votre réponse.')
    }
  }

  function stopRecording() {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach(track => track.stop())
    setRecording(false)
  }

  async function transcribeRecording(mimeType: string) {
    const blob = new Blob(chunksRef.current, { type: mimeType })
    if (!blob.size) return
    setBusy(true); setNotice('Transcription du vocal…')
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const value = String(reader.result ?? '')
          resolve(value.includes(',') ? value.slice(value.indexOf(',') + 1) : value)
        }
        reader.onerror = () => reject(reader.error)
        reader.readAsDataURL(blob)
      })
      const result = await avaSupportRequest(user, {
        action: 'transcribe', data, mime_type: mimeType.split(';')[0],
      }, 60_000)
      setNotice('')
      await rewrite('voice', result.transcript)
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Transcription impossible.')
    } finally { setBusy(false) }
  }

  async function closeConversation() {
    if (!active || !window.confirm('Fermer définitivement ce ticket ? Il ne pourra jamais être rouvert.')) return
    setBusy(true); setNotice('')
    try {
      await avaSupportRequest(user, { action: 'close', conversation_id: active.id, reason: 'resolved_by_agent' })
      setActiveId(''); setCustomerContext(null); setProfessionalDraft(null)
      setNotice('Ticket fermé définitivement. La demande de notation a été envoyée.')
      await refresh()
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Fermeture impossible.')
    } finally { setBusy(false) }
  }

  async function sendResolutionCheck() {
    if (!active) return
    setBusy(true); setNotice('')
    try {
      await avaSupportRequest(user, {
        action: 'resolution-check', conversation_id: active.id,
      })
      setNotice('La question de fin d’assistance a été envoyée.')
      await refresh()
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Le raccourci n’a pas pu être envoyé.')
    } finally { setBusy(false) }
  }

  if (!agent) return null
  if (!agent.onboarding_completed_at || !agent.first_name || !agent.avatar_path) {
    return <AgentOnboarding user={user} agent={agent} onDone={setAgent} />
  }

  return (
    <section className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-slate-950/90 shadow-2xl shadow-black/30 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5 bg-white/[0.025]">
        <div className="flex items-center gap-3">
          <AgentAvatar profile={agent.profile} />
          <div><h2 className="font-black text-white">Console de {agent.first_name}</h2><p className="text-xs text-slate-500">{assigned.length}/{agent.max_active_conversations} conversation(s) active(s) · {queue.length} en attente</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={toggleOnline} disabled={busy} className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold ${online ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/[0.03] text-slate-400'}`}>
            <span className={`h-2 w-2 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} /> {online ? 'Disponible' : 'Hors ligne'}
          </button>
          <button onClick={claimNext} disabled={busy || !online || assigned.length >= Number(agent.max_active_conversations)} className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white disabled:opacity-40"><Headphones size={15} /> Prendre la prochaine</button>
        </div>
      </div>
      {notice && <p className="border-b border-white/10 px-5 py-2 text-xs text-amber-300">{notice}</p>}
      <div className="grid min-h-[560px] lg:grid-cols-[280px_minmax(0,1fr)_300px]">
        <aside className="border-b lg:border-b-0 lg:border-r border-white/10 p-3">
          <div className="flex items-center justify-between px-2 py-2"><p className="text-[11px] uppercase tracking-[.18em] font-black text-slate-500">Mes conversations</p><button onClick={() => void refresh()} className="text-slate-500 hover:text-white"><RefreshCw size={14} /></button></div>
          <div className="max-h-48 lg:max-h-[460px] overflow-auto space-y-2">
            {assigned.map(item => <button key={item.id} onClick={() => setActiveId(item.id)} className={`w-full rounded-2xl border p-3 text-left transition-colors ${activeId === item.id ? 'border-rose-400/35 bg-rose-500/10' : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.045]'}`}>
              <div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-bold text-white">{item.customer_first_name || 'Client Ava'}</p>{item.close_suggested && <Clock3 size={14} className="text-amber-300" />}</div>
              <p className="mt-1 truncate text-[11px] text-slate-500">{item.subject}</p>
            </button>)}
            {!assigned.length && <p className="p-3 text-xs text-slate-500">Aucune conversation attribuée.</p>}
          </div>
          {queue.length > 0 && <div className="mt-4 rounded-2xl border border-amber-400/15 bg-amber-500/[0.05] p-3">
            <p className="text-xs font-bold text-amber-200">{queue.length} client(s) attendent</p>
            <p className="mt-1 text-[11px] text-slate-500">Choisissez précisément la demande à prendre.</p>
            <div className="mt-3 max-h-60 space-y-2 overflow-auto">
              {queue.map(item => <div key={item.id} className={`rounded-xl border p-2.5 ${item.is_own_test ? 'border-rose-400/30 bg-rose-500/10' : 'border-white/10 bg-slate-950/70'}`}>
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-black text-white">{item.customer_first_name || 'Client Ava'}</p>
                    <p className="truncate text-[10px] text-slate-500">{item.subject || 'Assistance Ava'} · {formatDuration(item.waiting_seconds)}</p>
                  </div>
                  {item.is_own_test && <span className="rounded-full bg-rose-500/15 px-2 py-1 text-[9px] font-black text-rose-200">Votre test</span>}
                </div>
                <button onClick={() => void claimConversation(item.id)} disabled={busy || !online || assigned.length >= Number(agent.max_active_conversations)} className="mt-2 w-full rounded-lg bg-rose-500 px-2 py-1.5 text-[10px] font-black text-white disabled:opacity-35">
                  Prendre cette demande
                </button>
              </div>)}
            </div>
          </div>}
        </aside>

        <div className="flex min-w-0 flex-col border-b lg:border-b-0 lg:border-r border-white/10">
          {!active && <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><UsersRound className="text-slate-700" size={34} /><p className="mt-3 text-sm font-bold text-slate-300">Sélectionnez une conversation</p><p className="mt-1 max-w-xs text-xs text-slate-500">Passez disponible, puis prenez la prochaine demande dans l’ordre de priorité.</p></div>}
          {active && <>
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div><p className="text-sm font-black text-white">{active.customer_first_name || 'Client Ava'}</p><p className="text-[11px] text-slate-500">{active.subject}</p></div>
              <div className="flex flex-wrap justify-end gap-2">
                <button onClick={sendResolutionCheck} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-3 py-2 text-[11px] font-bold text-rose-200"><MessageCircleQuestion size={14} /> Tout est réglé ?</button>
                <button onClick={closeConversation} disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] px-3 py-2 text-[11px] font-bold text-emerald-200"><CheckCircle2 size={14} /> Fermer le ticket</button>
              </div>
            </div>
            {active.close_suggested && <div className="m-3 rounded-2xl border border-amber-400/25 bg-amber-500/[0.07] p-3 text-xs text-amber-100"><Clock3 size={15} className="mr-2 inline" />Le client n’a pas répondu depuis plus de 5 minutes. Si tout est réglé, vous pouvez fermer définitivement le ticket.</div>}
            {active.resolution_check_answered_at
              && active.resolution_check_sent_at
              && Date.parse(active.resolution_check_answered_at) >= Date.parse(active.resolution_check_sent_at)
              && <div className="m-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3 text-xs text-emerald-100">Le client a répondu à votre question de fin. Vérifiez sa réponse, poursuivez si nécessaire, sinon fermez le ticket pour déclencher la notation.</div>}
            <div className="flex-1 space-y-2 overflow-auto p-4 max-h-[360px]">
              {(active.ava_support_messages ?? []).slice().sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at))).map((message: any) => (
                <div key={message.id} className={`max-w-[88%] rounded-2xl p-3 text-xs leading-relaxed ${message.sender_type === 'agent' ? 'ml-auto bg-rose-500 text-white' : 'mr-auto border border-white/10 bg-white/[0.04] text-slate-200'}`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {(message.attachments ?? []).map((attachment: any, index: number) => <SupportAttachment key={attachment.upload_id ?? index} attachment={attachment} />)}
                </div>
              ))}
              {peerTyping && <TypingDots label={`${active.customer_first_name || 'Le client'} écrit…`} />}
            </div>
            <div className="border-t border-white/10 p-3">
              {professionalDraft ? <div className="rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] p-3">
                <div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.16em] font-black text-rose-300">Version professionnelle prête</p><button onClick={() => setProfessionalDraft(null)} className="text-slate-500"><X size={14} /></button></div>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-relaxed text-white">{professionalDraft.rewritten_text}</p>
                <div className="mt-3 flex flex-wrap gap-2"><button onClick={sendApproved} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white"><Send size={14} /> Valider et envoyer</button><button onClick={() => void rewrite(professionalDraft.source ?? 'text')} disabled={busy} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300">Reformuler à nouveau</button></div>
              </div> : <div className="flex gap-2">
                <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={3} placeholder="Écrivez votre brouillon. Ava le reformulera avant tout envoi…" className="min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-rose-400/40" />
                <div className="flex flex-col gap-2">
                  <button onClick={recording ? stopRecording : startRecording} disabled={busy} title={recording ? 'Arrêter la dictée' : 'Dicter la réponse'} className={`grid h-10 w-10 place-items-center rounded-xl border ${recording ? 'border-rose-400 bg-rose-500 text-white' : 'border-white/10 text-slate-300'}`}>{recording ? <MicOff size={16} /> : <Mic size={16} />}</button>
                  <button onClick={() => void rewrite('text')} disabled={busy || !draft.trim()} title="Reformuler professionnellement" className="grid h-10 w-10 place-items-center rounded-xl bg-rose-500 text-white disabled:opacity-40">{busy ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}</button>
                </div>
              </div>}
            </div>
          </>}
        </div>

        <aside className="p-4 bg-white/[0.018]">
          <p className="text-[11px] uppercase tracking-[.18em] font-black text-slate-500">Contexte autorisé</p>
          {performance && <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950 p-3">
            <p className="text-[10px] font-black uppercase tracking-[.15em] text-slate-500">Mes performances</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div><p className="text-sm font-black text-white">{performance.average_rating ? `${performance.average_rating}/5` : '—'}</p><p className="text-[9px] text-slate-600">Note</p></div>
              <div><p className="text-sm font-black text-white">{performance.ratings_count ?? 0}</p><p className="text-[9px] text-slate-600">Avis</p></div>
              <div><p className="text-sm font-black text-white">{formatDuration(performance.average_first_response_seconds)}</p><p className="text-[9px] text-slate-600">Réponse</p></div>
            </div>
            {(performance.latest_ratings ?? []).some((item: any) => item.comment) && <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
              {(performance.latest_ratings ?? []).filter((item: any) => item.comment).slice(0, 3).map((item: any) => <div key={item.id} className="text-[10px] leading-relaxed text-slate-400"><span className="font-black text-rose-300">{item.rating}/5</span> · {item.comment}</div>)}
            </div>}
          </div>}
          {!active && <p className="mt-4 text-xs text-slate-500">Sélectionnez un ticket attribué.</p>}
          {active && !customerContext && <button onClick={loadCustomerContext} disabled={busy} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-bold text-slate-200"><ShieldCheck size={15} /> Consulter le compte</button>}
          {customerContext && <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-3 text-xs"><p className="font-bold text-white">{customerContext.customer?.first_name || active.customer_first_name}</p><p className="mt-1 break-all text-slate-500">{customerContext.customer?.email}</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-3 text-xs"><p className="text-slate-500">Abonnement</p><p className="mt-1 font-bold text-white">{customerContext.customer?.subscription_plan || customerContext.customer?.subscription_tier || 'Non renseigné'}</p><p className="mt-1 text-slate-500">{customerContext.customer?.subscription_source || 'Source inconnue'}</p></div>
            <div className="rounded-2xl border border-white/10 bg-slate-950 p-3 text-xs"><p className="text-slate-500">Ava Cloud</p><p className="mt-1 font-bold text-white">{customerContext.cloud?.state || 'Aucune instance liée'}</p>{customerContext.cloud && <p className="mt-1 text-slate-500">{customerContext.cloud.region || 'Région inconnue'} · {customerContext.cloud.active_market || 'inactif'}</p>}</div>
            <div className="rounded-2xl border border-blue-400/15 bg-blue-500/[0.05] p-3 text-[11px] leading-relaxed text-blue-200">Accès temporaire, en lecture seule et journalisé. Aucun mot de passe, jeton, PIN ou action d’impersonation n’est exposé.</div>
          </div>}
        </aside>
      </div>
    </section>
  )
}

export function SupportAdminPanel({ user }: { user: UserData }) {
  const [data, setData] = useState<any>({ agents: [], conversations: [], ratings: [], invites: [] })
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'agent' | 'admin'>('agent')
  const [localSupportLink, setLocalSupportLink] = useState('/app?support=1')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')

  const refresh = useCallback(async () => {
    await avaSupportRequest(user, { action: 'bootstrap-owner' })
    setData(await avaSupportRequest(user, { action: 'admin' }))
  }, [user])

  useEffect(() => { void refresh().catch(() => setNotice('Administration support indisponible.')) }, [refresh])
  useEffect(() => { setLocalSupportLink(`${window.location.origin}/app?support=1`) }, [])

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link)
      setNotice('Lien du service client copié.')
    } catch {
      setNotice('Copie impossible dans ce navigateur.')
    }
  }

  async function invite() {
    if (!email.trim()) return
    setBusy(true); setNotice('')
    try {
      const result = await avaSupportRequest(user, { action: 'invite', email: email.trim(), role })
      setEmail('')
      setNotice(result.email_sent
        ? 'Invitation envoyée par email. Le code est valable 10 minutes.'
        : 'Invitation créée, mais l’email n’a pas été envoyé. Vérifiez la configuration Resend.')
      await refresh()
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Invitation impossible.')
    } finally { setBusy(false) }
  }

  async function updateAgent(agent: any, patch: Record<string, unknown>) {
    setBusy(true); setNotice('')
    try {
      await avaSupportRequest(user, { action: 'agent-update', agent_id: agent.id, ...patch })
      await refresh()
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Modification impossible.')
    } finally { setBusy(false) }
  }

  async function deleteConversation(conversation: any) {
    const label = conversation.customer_first_name || conversation.subject || 'cette conversation'
    if (!window.confirm(`Supprimer définitivement ${label} et ses pièces jointes ? Cette action est réservée à l’administrateur et ne peut pas être annulée.`)) return
    setBusy(true); setNotice('')
    try {
      await avaSupportRequest(user, { action: 'delete-conversation', conversation_id: conversation.id })
      setNotice('Conversation supprimée définitivement.')
      await refresh()
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Suppression impossible.')
    } finally { setBusy(false) }
  }

  const queued = data.conversations.filter((item: any) => item.status === 'queued').length
  const assigned = data.conversations.filter((item: any) => item.status === 'assigned').length
  const ratingAverage = data.ratings.length
    ? data.ratings.reduce((sum: number, item: any) => sum + Number(item.rating), 0) / data.ratings.length
    : null

  return (
    <section className="mx-auto max-w-6xl rounded-3xl border border-rose-400/20 bg-slate-950/90 p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-black text-white">Équipe Ava Support</h2><p className="mt-1 text-xs text-slate-500">Invitations, disponibilité, rapidité et satisfaction client.</p></div>
        <button onClick={() => void refresh()} disabled={busy} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300"><RefreshCw size={16} className={busy ? 'animate-spin' : ''} /></button>
      </div>
      {notice && <p className="mt-3 text-xs text-amber-300">{notice}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ['Agents actifs', data.agents.filter((item: any) => item.active).length, UsersRound],
          ['Clients en attente', queued, Clock3],
          ['Conversations actives', assigned, Activity],
          ['Satisfaction', ratingAverage ? `${ratingAverage.toFixed(1)}/5` : '—', Star],
        ].map(([label, value, Icon]: any[]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"><Icon size={16} className="text-rose-300" /><p className="mt-3 text-lg font-black text-white">{value}</p><p className="text-[11px] text-slate-500">{label}</p></div>)}
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white"><UserPlus size={16} className="text-rose-300" /> Inviter un conseiller</h3>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">Ajoutez son adresse email. Il recevra un code valable 10 minutes, puis devra renseigner son prénom et une photo avant de prendre une conversation.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px_auto]">
          <input value={email} onChange={event => setEmail(event.target.value)} type="email" placeholder="email@exemple.com" className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white outline-none focus:border-rose-400/40" />
          <select value={role} onChange={event => setRole(event.target.value as 'agent' | 'admin')} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2.5 text-xs text-white"><option value="agent">Conseiller</option><option value="admin">Responsable</option></select>
          <button onClick={invite} disabled={busy || !email.trim()} className="rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-black text-white disabled:opacity-40">Envoyer l’invitation</button>
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.055] p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white"><Headphones size={16} className="text-rose-300" /> Tester avec votre compte administrateur</h3>
          <ol className="mt-3 space-y-2 text-[11px] leading-relaxed text-slate-400">
            <li><span className="font-black text-rose-300">1.</span> Ouvrez le panneau client et envoyez votre demande.</li>
            <li><span className="font-black text-rose-300">2.</span> Dans votre console ci-dessous, passez « Disponible » puis prenez la prochaine demande.</li>
            <li><span className="font-black text-rose-300">3.</span> Rédigez, laissez Ava reformuler, puis validez l’envoi.</li>
          </ol>
          <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('ava-open-support'))} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-xs font-black text-white">
            <ExternalLink size={15} /> Ouvrir le panneau client
          </button>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <h3 className="text-sm font-bold text-white">Liens directs Ava Support</h3>
          <p className="mt-1 text-[11px] text-slate-500">Après connexion, le panneau s’ouvre automatiquement. Utilisez le lien local pour vos tests et le lien public pour vos clients.</p>
          {[
            ['Test local', localSupportLink],
            ['Lien public', 'https://call-ava.com/app?support=1'],
          ].map(([label, link]) => (
            <div key={label} className="mt-3 flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950 px-3 py-2">
              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">{label}</p>
                <p className="truncate text-[11px] text-slate-300">{link}</p>
              </div>
              <button type="button" onClick={() => void copyLink(link)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 hover:bg-white/[0.05] hover:text-white" aria-label={`Copier ${label}`}>
                <Copy size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {data.agents.map((item: any) => <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-start gap-3">
            <AgentAvatar profile={item.profile} />
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="truncate text-sm font-black text-white">{item.first_name || item.email}</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${presenceOf(item) === 'online' ? 'bg-emerald-500/10 text-emerald-300' : presenceOf(item) === 'busy' ? 'bg-amber-500/10 text-amber-300' : 'bg-white/[0.04] text-slate-500'}`}>{presenceOf(item)}</span>{!item.onboarding_completed_at && <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-300">profil incomplet</span>}</div><p className="mt-1 truncate text-[11px] text-slate-500">{item.email} · {item.role}</p></div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[['Actives', item.metrics?.active_conversations ?? 0], ['Prise', formatDuration(item.metrics?.average_claim_seconds)], ['Réponse', formatDuration(item.metrics?.average_first_response_seconds)], ['Note', item.metrics?.average_rating ? `${item.metrics.average_rating}/5` : '—']].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-950 p-2"><p className="text-xs font-bold text-white">{value}</p><p className="mt-1 text-[9px] text-slate-600">{label}</p></div>)}
          </div>
          {data.ratings.filter((ratingItem: any) => ratingItem.agent_id === item.id && ratingItem.comment).slice(0, 3).length > 0 && <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
            {data.ratings.filter((ratingItem: any) => ratingItem.agent_id === item.id && ratingItem.comment).slice(0, 3).map((ratingItem: any) => <div key={ratingItem.id} className="rounded-xl bg-slate-950 p-2 text-[10px] leading-relaxed text-slate-400"><span className="font-black text-rose-300">{ratingItem.rating}/5</span> · {ratingItem.comment}</div>)}
          </div>}
          {item.role !== 'owner' && <div className="mt-3 flex items-center gap-2">
            <label className="flex-1 text-[10px] text-slate-500">Capacité
              <select value={item.max_active_conversations} onChange={event => void updateAgent(item, { max_active_conversations: Number(event.target.value) })} className="ml-2 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-white">{[1, 2, 3, 4, 5].map(value => <option key={value}>{value}</option>)}</select>
            </label>
            <button onClick={() => void updateAgent(item, { active: !item.active })} disabled={busy} className={`rounded-xl border px-3 py-2 text-[10px] font-bold ${item.active ? 'border-rose-400/20 text-rose-300' : 'border-emerald-400/20 text-emerald-300'}`}>{item.active ? 'Suspendre' : 'Réactiver'}</button>
          </div>}
        </div>)}
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center justify-between gap-3">
          <div><h3 className="text-sm font-bold text-white">Historique des conversations</h3><p className="mt-1 text-[11px] text-slate-500">Seul un administrateur peut supprimer un ticket et ses fichiers.</p></div>
          <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-400">{data.conversations.length}</span>
        </div>
        <div className="mt-3 max-h-80 space-y-2 overflow-auto pr-1">
          {data.conversations.map((conversation: any) => <div key={conversation.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950 p-3">
            <span className={`h-2 w-2 shrink-0 rounded-full ${conversation.status === 'queued' ? 'bg-amber-400' : conversation.status === 'assigned' ? 'bg-emerald-400' : conversation.status === 'closed' ? 'bg-slate-600' : 'bg-rose-400'}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-white">{conversation.customer_first_name || 'Client Ava'} · {conversation.subject || 'Assistance Ava'}</p>
              <p className="mt-1 text-[10px] text-slate-600">{conversation.status} · {new Date(conversation.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <button type="button" onClick={() => void deleteConversation(conversation)} disabled={busy} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-rose-400/15 text-rose-300 hover:bg-rose-500/10 disabled:opacity-40" aria-label="Supprimer cette conversation"><Trash2 size={15} /></button>
          </div>)}
          {!data.conversations.length && <p className="py-8 text-center text-xs text-slate-500">Aucune conversation.</p>}
        </div>
      </div>
      {data.invites.some((item: any) => item.status === 'pending') && <div className="mt-5 rounded-2xl border border-white/10 p-4"><p className="text-xs font-bold text-white">Invitations en attente</p><div className="mt-2 space-y-2">{data.invites.filter((item: any) => item.status === 'pending').map((item: any) => <div key={item.id} className="flex items-center justify-between gap-3 text-[11px]"><span className="truncate text-slate-300">{item.email} · {item.role}</span><span className="text-slate-600">expire {new Date(item.expires_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>)}</div></div>}
    </section>
  )
}
