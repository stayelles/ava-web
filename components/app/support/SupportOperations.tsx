'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as tus from 'tus-js-client'
import {
  Activity, CheckCircle2, Clock3, Copy, ExternalLink, FileText, Headphones,
  Eye, ImagePlus, Loader2, MessageCircleQuestion, Mic, MicOff, RefreshCw, Send,
  ShieldCheck, Star, Trash2, UserPlus, UserRoundCheck, UsersRound, Video, X,
  Paperclip, WandSparkles,
} from 'lucide-react'
import type { UserData } from '../types'
import { avaSupportRequest } from '../services/avaAi'
import { playSupportMessageSound, TypingDots } from './supportFeedback'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants'
import { SupportMessage } from './SupportMessage'

type PendingFile = {
  id: string
  file: File
  category: 'image' | 'video' | 'document'
  preview?: string
  progress: number
}

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
])
const DIRECT_STORAGE_URL = SUPABASE_URL.replace('.supabase.co', '.storage.supabase.co')

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
  const [rewriting, setRewriting] = useState(false)
  const [sending, setSending] = useState(false)
  const [notice, setNotice] = useState('')
  const [recording, setRecording] = useState(false)
  const [files, setFiles] = useState<PendingFile[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const peerTypingRef = useRef(false)
  const lastIncomingRef = useRef('')
  const incomingConversationRef = useRef('')
  const knownQueueIdsRef = useRef<Set<string> | null>(null)

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
    const nextIds = new Set<string>(queue.map((item: any) => String(item.id)))
    const knownIds = knownQueueIdsRef.current
    if (online && knownIds && [...nextIds].some(id => !knownIds.has(id))) {
      playSupportMessageSound()
    }
    knownQueueIdsRef.current = nextIds
  }, [online, queue])

  useEffect(() => {
    setCustomerContext(null)
    setProfessionalDraft(null)
    setDraft('')
    setFiles(current => {
      current.forEach(item => item.preview && URL.revokeObjectURL(item.preview))
      return []
    })
  }, [activeId])

  useEffect(() => {
    if (!online || !active?.id) return
    void avaSupportRequest(user, {
      action: 'mark-read',
      conversation_id: active.id,
      as_agent: true,
    }).catch(() => null)
  }, [active?.id, active?.ava_support_messages?.length, online, user])

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

  async function pickFiles(selectedFiles: FileList | null) {
    const selected = Array.from(selectedFiles ?? [])
    const currentImages = files.filter(item => item.category === 'image').length
    const currentVideos = files.filter(item => item.category === 'video').length
    const currentDocuments = files.filter(item => item.category === 'document').length
    let addedImages = 0
    let addedVideos = 0
    let addedDocuments = 0
    const rejected: string[] = []
    const next = selected.flatMap(file => {
      let category: PendingFile['category'] | null = null
      if (IMAGE_TYPES.has(file.type)) category = 'image'
      if (VIDEO_TYPES.has(file.type)) category = 'video'
      if (DOCUMENT_TYPES.has(file.type)) category = 'document'
      if (!category) { rejected.push(`${file.name} : format refusé`); return [] }
      if (category === 'image' && (file.size > 15 * 1024 * 1024 || currentImages + addedImages >= 10)) {
        rejected.push(`${file.name} : maximum 10 images de 15 Mo`); return []
      }
      if (category === 'video' && (file.size > 300 * 1024 * 1024 || currentVideos + addedVideos >= 1)) {
        rejected.push(`${file.name} : une seule vidéo de 300 Mo maximum`); return []
      }
      if (category === 'document' && (file.size > 25 * 1024 * 1024 || currentDocuments + addedDocuments >= 5)) {
        rejected.push(`${file.name} : maximum 5 documents de 25 Mo`); return []
      }
      if (category === 'image') addedImages += 1
      if (category === 'video') addedVideos += 1
      if (category === 'document') addedDocuments += 1
      return [{
        id: crypto.randomUUID(),
        file,
        category,
        preview: category === 'image' ? URL.createObjectURL(file) : undefined,
        progress: 0,
      }]
    })
    setFiles(current => [...current, ...next])
    setNotice(rejected.join(' · '))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function uploadFiles(conversationId: string, pendingFiles: PendingFile[]) {
    const uploaded = []
    for (const item of pendingFiles) {
      const intent = await avaSupportRequest(user, {
        action: 'attachment-intent',
        conversation_id: conversationId,
        file_name: item.file.name,
        mime_type: item.file.type,
        size_bytes: item.file.size,
      })
      await new Promise<void>((resolve, reject) => {
        const upload = new tus.Upload(item.file, {
          endpoint: `${DIRECT_STORAGE_URL}/storage/v1/upload/resumable`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            apikey: SUPABASE_ANON_KEY,
            authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'x-signature': intent.upload.token,
          },
          uploadDataDuringCreation: true,
          removeFingerprintOnSuccess: true,
          metadata: {
            bucketName: 'ava-support-attachments',
            objectName: intent.upload.path,
            contentType: item.file.type,
            cacheControl: '3600',
          },
          chunkSize: 6 * 1024 * 1024,
          onProgress: (bytesUploaded, bytesTotal) => setFiles(current => current.map(entry =>
            entry.id === item.id ? { ...entry, progress: Math.round(bytesUploaded / bytesTotal * 100) } : entry)),
          onError: reject,
          onSuccess: () => resolve(),
        })
        upload.start()
      })
      const finalized = await avaSupportRequest(user, {
        action: 'attachment-finalize',
        upload_id: intent.upload.id,
      }, 60_000)
      uploaded.push(finalized.attachment)
    }
    return uploaded
  }

  async function rewrite(source: 'text' | 'voice' = 'text', text = draft) {
    if (!active || !text.trim()) return
    setRewriting(true); setNotice('')
    try {
      const result = await avaSupportRequest(user, {
        action: 'rewrite', conversation_id: active.id, message: text.trim(), source,
      }, 45_000)
      setDraft(text.trim())
      setProfessionalDraft({
        ...result.draft,
        ai_rewritten_text: result.draft.rewritten_text,
      })
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Reformulation indisponible.')
    } finally { setRewriting(false) }
  }

  async function sendAgentMessage(
    content: string,
    deliveryMode: 'direct' | 'rewritten' | 'edited',
    approvedDraft: any = null,
  ) {
    if (!active || !content.trim()) return
    const messageContent = content.trim()
    const optimisticId = `pending-${crypto.randomUUID()}`
    const pendingFiles = files
    const optimisticAttachments = pendingFiles.map(item => ({
      upload_id: item.id,
      file_name: item.file.name,
      mime_type: item.file.type,
      size_bytes: item.file.size,
      category: item.category,
      preview_url: item.preview,
    }))
    const optimisticMessage = {
      id: optimisticId,
      sender_type: 'agent',
      sender_user_id: user.id,
      content: messageContent,
      attachments: optimisticAttachments,
      created_at: new Date().toISOString(),
      pending: true,
    }
    setConversations(current => current.map(item => item.id === active.id
      ? { ...item, ava_support_messages: [...(item.ava_support_messages ?? []), optimisticMessage] }
      : item))
    setDraft(''); setProfessionalDraft(null); setFiles([])
    setSending(true); setNotice('')
    try {
      const attachments = await uploadFiles(active.id, pendingFiles)
      const result = await avaSupportRequest(user, {
        action: 'message',
        conversation_id: active.id,
        message: messageContent,
        delivery_mode: deliveryMode,
        draft_id: approvedDraft?.id,
        as_agent: true,
        attachments,
      })
      setConversations(current => current.map(item => item.id === active.id
        ? {
            ...item,
            updated_at: result.message.created_at,
            ava_support_messages: (item.ava_support_messages ?? []).map((entry: any) =>
              entry.id === optimisticId
                ? { ...result.message, attachments: optimisticAttachments, pending: false }
                : entry),
          }
        : item))
      window.setTimeout(() => {
        pendingFiles.forEach(item => item.preview && URL.revokeObjectURL(item.preview))
        void refresh()
      }, 1_500)
    } catch (exception) {
      setConversations(current => current.map(item => item.id === active.id
        ? { ...item, ava_support_messages: (item.ava_support_messages ?? []).filter((entry: any) => entry.id !== optimisticId) }
        : item))
      setDraft(deliveryMode !== 'direct' ? String(approvedDraft?.original_text ?? messageContent) : messageContent)
      setProfessionalDraft(deliveryMode !== 'direct'
        ? { ...approvedDraft, rewritten_text: messageContent }
        : null)
      setFiles(pendingFiles)
      setNotice(exception instanceof Error ? exception.message : 'Envoi impossible.')
    } finally { setSending(false) }
  }

  async function sendApproved() {
    if (!professionalDraft?.rewritten_text) return
    const deliveryMode = professionalDraft.rewritten_text === professionalDraft.ai_rewritten_text
      ? 'rewritten'
      : 'edited'
    await sendAgentMessage(professionalDraft.rewritten_text, deliveryMode, professionalDraft)
  }

  async function sendDirect() {
    await sendAgentMessage(draft, 'direct')
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
                <SupportMessage
                  key={message.id}
                  message={message}
                  perspective="agent"
                  customerName={active.customer_first_name || 'Client Ava'}
                  agentName={agent.first_name || 'Conseiller Ava'}
                />
              ))}
              {peerTyping && <TypingDots label={`${active.customer_first_name || 'Le client'} écrit…`} />}
            </div>
            <div className="border-t border-white/10 p-3">
              {files.length > 0 && <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
                {files.map(item => <div key={item.id} className="relative min-w-[150px] max-w-[190px] rounded-xl border border-white/10 bg-white/[0.035] p-2">
                  <button
                    type="button"
                    onClick={() => setFiles(current => {
                      const removed = current.find(entry => entry.id === item.id)
                      if (removed?.preview) URL.revokeObjectURL(removed.preview)
                      return current.filter(entry => entry.id !== item.id)
                    })}
                    className="absolute right-1 top-1 z-10 grid h-6 w-6 place-items-center rounded-full bg-slate-950/85 text-slate-300"
                    aria-label={`Retirer ${item.file.name}`}
                  ><X size={12} /></button>
                  {item.preview
                    ? <img src={item.preview} alt="" className="h-16 w-full rounded-lg object-cover" />
                    : <div className="grid h-16 place-items-center rounded-lg bg-slate-950 text-slate-500">{item.category === 'video' ? <Video size={20} /> : <FileText size={20} />}</div>}
                  <p className="mt-1 truncate text-[10px] text-slate-300">{item.file.name}</p>
                  {item.progress > 0 && <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-rose-400" style={{ width: `${item.progress}%` }} /></div>}
                </div>)}
              </div>}
              {professionalDraft ? <div className="rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] p-3">
                <div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.16em] font-black text-rose-300">Correction Ava prête</p><button onClick={() => setProfessionalDraft(null)} className="text-slate-500"><X size={14} /></button></div>
                <textarea
                  value={professionalDraft.rewritten_text}
                  onChange={event => setProfessionalDraft((current: any) => ({
                    ...current,
                    rewritten_text: event.target.value,
                  }))}
                  rows={4}
                  aria-label="Correction Ava modifiable"
                  className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs leading-relaxed text-white outline-none focus:border-rose-400/40"
                />
                <p className="mt-2 text-[10px] leading-relaxed text-slate-500">Cette proposition reste entièrement modifiable. Ava corrige la langue sans imposer sa formulation.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={sendApproved} disabled={sending || !professionalDraft.rewritten_text.trim()} className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-xs font-black text-white disabled:opacity-45">{sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Envoyer ce texte</button>
                  <button onClick={() => void sendAgentMessage(draft, 'direct')} disabled={sending || !draft.trim()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-200 disabled:opacity-45"><Send size={13} /> Envoyer mon texte</button>
                  <button onClick={() => void rewrite(professionalDraft.source ?? 'text')} disabled={rewriting || sending} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 disabled:opacity-45">{rewriting ? <Loader2 size={13} className="animate-spin" /> : <WandSparkles size={13} />} Corriger à nouveau</button>
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={sending} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 disabled:opacity-45"><Paperclip size={14} /> Joindre</button>
                </div>
              </div> : <div className="space-y-2">
                <div className="flex gap-2">
                  <textarea value={draft} onChange={event => setDraft(event.target.value)} rows={3} placeholder="Écrivez votre réponse…" className="min-w-0 flex-1 resize-none rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-rose-400/40" />
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => fileRef.current?.click()} disabled={sending} title="Joindre des images, vidéos ou documents" className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-slate-300 disabled:opacity-40"><Paperclip size={16} /></button>
                    <button onClick={recording ? stopRecording : startRecording} disabled={busy || rewriting || sending} title={recording ? 'Arrêter la dictée' : 'Dicter la réponse'} className={`grid h-10 w-10 place-items-center rounded-xl border ${recording ? 'border-rose-400 bg-rose-500 text-white' : 'border-white/10 text-slate-300'} disabled:opacity-40`}>{recording ? <MicOff size={16} /> : <Mic size={16} />}</button>
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button onClick={() => void rewrite('text')} disabled={rewriting || sending || !draft.trim()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-400/25 bg-rose-500/[0.06] px-3 py-2.5 text-xs font-black text-rose-200 disabled:opacity-40">
                    {rewriting ? <Loader2 size={15} className="animate-spin" /> : <WandSparkles size={15} />} Corriger avec Ava
                  </button>
                  <button onClick={() => void sendDirect()} disabled={rewriting || sending || !draft.trim()} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 px-3 py-2.5 text-xs font-black text-white disabled:opacity-40">
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Envoyer directement
                  </button>
                </div>
              </div>}
              <input
                ref={fileRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                onChange={event => void pickFiles(event.target.files)}
              />
              <p className="mt-2 text-[10px] text-slate-600">Vous choisissez l’envoi direct ou une correction légère par Ava. 10 images · 1 vidéo (300 Mo) · 5 documents.</p>
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
  const [reviewConversation, setReviewConversation] = useState<any>(null)
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
  useEffect(() => {
    setLocalSupportLink(`${window.location.origin}/app?support=1`)
    const conversationId = new URLSearchParams(window.location.search).get('support_review')
    if (conversationId) {
      void openConversation(conversationId)
    }
  // Le lien d’audit doit être résolu une seule fois à l’ouverture de la page.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function openConversation(conversationOrId: any) {
    const conversationId = typeof conversationOrId === 'string' ? conversationOrId : conversationOrId?.id
    if (!conversationId) return
    setBusy(true); setNotice('')
    try {
      const result = await avaSupportRequest(user, {
        action: 'admin-conversation',
        conversation_id: conversationId,
      })
      setReviewConversation(result.conversation)
    } catch (exception) {
      setNotice(exception instanceof Error ? exception.message : 'Conversation impossible à consulter.')
    } finally { setBusy(false) }
  }

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
    <section id="ava-support-admin" className="mx-auto max-w-6xl rounded-3xl border border-rose-400/20 bg-slate-950/90 p-4 sm:p-5">
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
            <li><span className="font-black text-rose-300">3.</span> Envoyez directement ou demandez une correction Ava, toujours modifiable.</li>
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
            <button type="button" onClick={() => void openConversation(conversation)} disabled={busy} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 hover:bg-white/[0.05] hover:text-white disabled:opacity-40" aria-label="Consulter cette conversation"><Eye size={15} /></button>
            <button type="button" onClick={() => void deleteConversation(conversation)} disabled={busy} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-rose-400/15 text-rose-300 hover:bg-rose-500/10 disabled:opacity-40" aria-label="Supprimer cette conversation"><Trash2 size={15} /></button>
          </div>)}
          {!data.conversations.length && <p className="py-8 text-center text-xs text-slate-500">Aucune conversation.</p>}
        </div>
      </div>
      {data.invites.some((item: any) => item.status === 'pending') && <div className="mt-5 rounded-2xl border border-white/10 p-4"><p className="text-xs font-bold text-white">Invitations en attente</p><div className="mt-2 space-y-2">{data.invites.filter((item: any) => item.status === 'pending').map((item: any) => <div key={item.id} className="flex items-center justify-between gap-3 text-[11px]"><span className="truncate text-slate-300">{item.email} · {item.role}</span><span className="text-slate-600">expire {new Date(item.expires_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span></div>)}</div></div>}
      {reviewConversation && <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/75 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label="Audit de la conversation">
        <div className="flex h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-slate-950 shadow-2xl sm:h-[82vh] sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 p-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-rose-300">Audit administrateur</p>
              <h3 className="mt-1 text-sm font-black text-white">{reviewConversation.customer_first_name || 'Client Ava'} · {reviewConversation.subject || 'Assistance Ava'}</h3>
              <p className="mt-1 text-[10px] text-slate-500">{reviewConversation.status} · ouverte le {new Date(reviewConversation.created_at).toLocaleString('fr-FR')}</p>
            </div>
            <button type="button" onClick={() => setReviewConversation(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300" aria-label="Fermer l’audit"><X size={16} /></button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {(reviewConversation.ava_support_messages ?? []).slice().sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at))).map((message: any) => {
              const assignedAgent = data.agents.find((item: any) => item.id === reviewConversation.assigned_agent_id)
              return <SupportMessage
                key={message.id}
                message={message}
                perspective="admin"
                customerName={reviewConversation.customer_first_name || 'Client Ava'}
                agentName={assignedAgent?.first_name || 'Conseiller Ava'}
              />
            })}
          </div>
          <div className="border-t border-white/10 bg-white/[0.02] px-4 py-3 text-[10px] leading-relaxed text-slate-500">Consultation en lecture seule et journalisée. Les pièces jointes restent privées et leurs liens expirent automatiquement.</div>
        </div>
      </div>}
    </section>
  )
}
