'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as tus from 'tus-js-client'
import {
  ArrowLeft, CheckCircle2, Clock3, FileText, Headphones, Loader2,
  Paperclip, Send, Star, Trash2, Video, X,
} from 'lucide-react'
import type { UserData } from '../types'
import { avaSupportRequest } from '../services/avaAi'
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../constants'
import { playSupportMessageSound, TypingDots } from './supportFeedback'
import { SupportMessage } from './SupportMessage'

type PendingFile = {
  id: string
  file: File
  category: 'image' | 'video' | 'document'
  preview?: string
  progress: number
}

const RATING_LABELS = ['', 'Médiocre', 'Pas bon', 'Correct', 'Très bien', 'Parfait']
const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime'])
const DOCUMENT_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
])
const DIRECT_STORAGE_URL = SUPABASE_URL.replace('.supabase.co', '.storage.supabase.co')
const NEW_CONVERSATION_ID = '__new__'

function supportSendError(error: unknown, fallback: string) {
  const code = error instanceof Error ? error.message : ''
  if (code === 'CONVERSATION_CLOSED') return 'Cette conversation est terminée. Ouvrez une nouvelle demande.'
  if (code === 'UPLOAD_VERIFICATION_FAILED') return 'Le fichier reçu n’a pas pu être vérifié. Sélectionnez-le à nouveau.'
  if (code.includes('TOO_LARGE')) return 'Le fichier dépasse la taille autorisée.'
  if (code === 'ATTACHMENT_INVALID' || code === 'ATTACHMENT_LIMIT_EXCEEDED') {
    return 'Cette pièce jointe ne peut pas être envoyée. Vérifiez son format et sa taille.'
  }
  if (code === 'SESSION_EXPIRED') return 'Votre session a expiré. Reconnectez-vous avant de renvoyer le message.'
  if (code.toLowerCase().includes('upload') || code.toLowerCase().includes('tus')) {
    return 'La pièce jointe n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.'
  }
  return fallback
}

function formatWait(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 60) return 'moins d’une minute'
  if (seconds < 3600) return `environ ${Math.max(1, Math.round(seconds / 60))} min`
  return `environ ${Math.max(1, Math.round(seconds / 3600))} h`
}

function initials(name: string) {
  return name.trim().slice(0, 1).toUpperCase() || 'A'
}

export function SupportDock({ user }: { user: UserData }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agentAccount, setAgentAccount] = useState(false)
  const [availability, setAvailability] = useState<any>({ available_count: 0, estimated_response_seconds: 300, agents: [] })
  const [conversations, setConversations] = useState<any[]>([])
  const [activeId, setActiveId] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [firstName, setFirstName] = useState(user.first_name ?? '')
  const [message, setMessage] = useState('')
  const [files, setFiles] = useState<PendingFile[]>([])
  const [error, setError] = useState('')
  const [rating, setRating] = useState(0)
  const [ratingComment, setRatingComment] = useState('')
  const [ratingDone, setRatingDone] = useState(false)
  const [peerTyping, setPeerTyping] = useState(false)
  const [aiReplying, setAiReplying] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)
  const peerTypingRef = useRef(false)
  const lastIncomingRef = useRef('')
  const incomingConversationRef = useRef('')

  const active = useMemo(
    () => activeId === NEW_CONVERSATION_ID
      ? null
      : conversations.find(item => item.id === activeId)
        ?? conversations.find(item => item.status !== 'closed')
        ?? conversations[0]
        ?? null,
    [activeId, conversations],
  )

  const refresh = useCallback(async () => {
    try {
      const [list, available] = await Promise.all([
        avaSupportRequest(user, { action: 'list', view: 'customer' }),
        avaSupportRequest(user, { action: 'availability' }),
      ])
      setAgentAccount(Boolean(list.agent))
      const next = list.conversations ?? []
      setConversations(next)
      setAvailability(available)
      setActiveId(current => current || next.find((item: any) => item.status !== 'closed')?.id || next[0]?.id || '')
    } catch {
      // The dock stays available and retries on the next polling pass.
    }
  }, [user])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const directOpen = params.get('support') === '1'
    const directConversation = params.get('support_conversation')
    if (directConversation) setActiveId(directConversation)
    setOpen(directOpen || localStorage.getItem('ava_support_dock_open') === '1')
    void refresh()
    const openSupport = (event: Event) => {
      const conversationId = String((event as CustomEvent<{ conversationId?: string }>).detail?.conversationId ?? '')
      if (conversationId) setActiveId(conversationId)
      setOpen(true)
    }
    window.addEventListener('ava-open-support', openSupport)
    return () => window.removeEventListener('ava-open-support', openSupport)
  }, [refresh])

  useEffect(() => {
    localStorage.setItem('ava_support_dock_open', open ? '1' : '0')
    if (!open) return
    const timer = window.setInterval(() => void refresh(), 30_000)
    return () => window.clearInterval(timer)
  }, [open, refresh])

  useEffect(() => {
    if (!open || !active?.id || active.status === 'closed') {
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
            view: 'customer',
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
  }, [active?.id, active?.status, active?.updated_at, open, refresh, user])

  useEffect(() => {
    if (!active?.id || active.status === 'closed') return
    if (!message.trim()) {
      void avaSupportRequest(user, {
        action: 'typing', conversation_id: active.id, active: false,
      }).catch(() => null)
      return
    }
    const sendTyping = () => void avaSupportRequest(user, {
      action: 'typing', conversation_id: active.id, active: true,
    }).catch(() => null)
    sendTyping()
    const timer = window.setInterval(sendTyping, 2_500)
    return () => window.clearInterval(timer)
  }, [active?.id, active?.status, message, user])

  useEffect(() => {
    if (!active?.id) return
    const incoming = (active.ava_support_messages ?? [])
      .filter((item: any) => item.sender_type !== 'user')
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
    if (!open || !active?.id) return
    void avaSupportRequest(user, {
      action: 'mark-read',
      conversation_id: active.id,
      as_agent: false,
    }).catch(() => null)
  }, [active?.id, active?.ava_support_messages?.length, open, user])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [active?.ava_support_messages?.length, open])

  useEffect(() => {
    if (!active?.id || active.status !== 'ai') {
      setAiReplying(false)
      return
    }
    const latest = (active.ava_support_messages ?? [])
      .slice()
      .sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at)))
      .at(-1)
    if (latest?.sender_type !== 'user') setAiReplying(false)
  }, [active?.id, active?.status, active?.ava_support_messages])

  useEffect(() => {
    if (!aiReplying) return
    const refreshTimer = window.setTimeout(() => void refresh(), 2_000)
    const safetyTimer = window.setTimeout(() => {
      setAiReplying(false)
      void refresh()
    }, 35_000)
    return () => {
      window.clearTimeout(refreshTimer)
      window.clearTimeout(safetyTimer)
    }
  }, [aiReplying, refresh])

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
    setError(rejected.join(' · '))
    if (fileRef.current) fileRef.current.value = ''
  }

  async function uploadFiles(conversationId: string, pendingFiles = files) {
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
          endpoint: `${DIRECT_STORAGE_URL}/storage/v1/upload/resumable/sign`,
          retryDelays: [0, 3000, 5000, 10000, 20000],
          headers: {
            apikey: SUPABASE_ANON_KEY,
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
        action: 'attachment-finalize', upload_id: intent.upload.id,
      }, 60_000)
      uploaded.push(finalized.attachment)
    }
    return uploaded
  }

  async function startConversation() {
    if (!firstName.trim() || (!message.trim() && !files.length) || loading) return
    setLoading(true); setError('')
    try {
      const created = await avaSupportRequest(user, {
        action: 'create',
        first_name: firstName.trim(),
        subject: message.trim().slice(0, 90) || 'Assistance avec une capture',
      })
      const conversationId = created.conversation.id
      const attachments = await uploadFiles(conversationId)
      const sent = await avaSupportRequest(user, {
        action: 'message',
        conversation_id: conversationId,
        message: message.trim() || 'Je souhaite obtenir de l’aide avec ces fichiers.',
        attachments,
        as_customer: true,
      })
      files.forEach(item => item.preview && URL.revokeObjectURL(item.preview))
      setMessage(''); setFiles([]); setActiveId(conversationId); setHistoryOpen(false)
      setConversations(current => [{
        ...created.conversation,
        updated_at: sent.message.created_at,
        ava_support_messages: [sent.message],
        ava_support_ratings: [],
      }, ...current.filter(item => item.id !== conversationId)])
      setAiReplying(sent.ai_reply_scheduled === true)
      window.setTimeout(() => void refresh(), 1_500)
    } catch (exception) {
      setError(exception instanceof Error && exception.message === 'FIRST_NAME_REQUIRED'
        ? 'Ajoutez votre prénom pour personnaliser la conversation.'
        : supportSendError(exception, 'La demande n’a pas pu être envoyée. Réessayez dans un instant.'))
    } finally { setLoading(false) }
  }

  async function sendMessage() {
    if (!active || active.status === 'closed' || (!message.trim() && !files.length) || loading) return
    const content = message.trim() || 'Voici les fichiers demandés.'
    const optimisticId = `pending-${crypto.randomUUID()}`
    const optimisticAttachments = files.map(item => ({
      upload_id: item.id,
      file_name: item.file.name,
      mime_type: item.file.type,
      size_bytes: item.file.size,
      category: item.category,
      preview_url: item.preview,
    }))
    const optimisticMessage = {
      id: optimisticId,
      sender_type: 'user',
      sender_user_id: user.id,
      content,
      attachments: optimisticAttachments,
      created_at: new Date().toISOString(),
      pending: true,
    }
    const queuedFiles = files
    setConversations(current => current.map(item => item.id === active.id
      ? { ...item, ava_support_messages: [...(item.ava_support_messages ?? []), optimisticMessage] }
      : item))
    setMessage(''); setFiles([])
    setLoading(true); setError('')
    try {
      const attachments = await uploadFiles(active.id, queuedFiles)
      const sent = await avaSupportRequest(user, {
        action: 'message',
        conversation_id: active.id,
        message: content,
        attachments,
        as_customer: true,
      })
      setConversations(current => current.map(item => item.id === active.id
        ? {
            ...item,
            updated_at: sent.message.created_at,
            ava_support_messages: (item.ava_support_messages ?? []).map((entry: any) =>
              entry.id === optimisticId
                ? { ...sent.message, attachments: optimisticAttachments, pending: false }
                : entry),
          }
        : item))
      if (active.status === 'ai') {
        setAiReplying(sent.ai_reply_scheduled === true)
      }
      window.setTimeout(() => {
        queuedFiles.forEach(item => item.preview && URL.revokeObjectURL(item.preview))
        void refresh()
      }, 1_500)
    } catch (exception) {
      setConversations(current => current.map(item => item.id === active.id
        ? { ...item, ava_support_messages: (item.ava_support_messages ?? []).filter((entry: any) => entry.id !== optimisticId) }
        : item))
      setMessage(content)
      setFiles(queuedFiles)
      setError(supportSendError(exception, 'Le message n’a pas pu être envoyé.'))
    } finally { setLoading(false) }
  }

  async function submitRating() {
    if (!active || rating < 1 || loading) return
    setLoading(true); setError('')
    try {
      await avaSupportRequest(user, {
        action: 'rate-conversation',
        conversation_id: active.id,
        rating,
        comment: ratingComment.slice(0, 150),
      })
      setRatingDone(true)
      await refresh()
    } catch (exception) {
      setError(exception instanceof Error && exception.message === 'RATING_ALREADY_SUBMITTED'
        ? 'Cette assistance a déjà été notée.'
        : 'La note n’a pas pu être enregistrée.')
    } finally { setLoading(false) }
  }

  function newConversation() {
    files.forEach(item => item.preview && URL.revokeObjectURL(item.preview))
    setActiveId(NEW_CONVERSATION_ID)
    setOpen(true)
    setHistoryOpen(false)
    setMessage('')
    setFiles([])
    setRating(0)
    setRatingComment('')
    setRatingDone(false)
    setError('')
  }

  if (agentAccount && !user.is_admin) return null

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-4 lg:bottom-6 z-[70] flex items-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500 px-4 py-3 text-sm font-black text-white shadow-2xl shadow-rose-500/30 transition-transform hover:scale-[1.03]"
          aria-label="Ouvrir Ava Support"
        >
          <Headphones size={19} />
          <span className="hidden sm:inline">Ava Support</span>
          {active?.status === 'assigned' && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
        </button>
      )}

      {open && (
        <section className="fixed inset-0 z-[80] flex flex-col overflow-hidden border-white/10 bg-[#020617] shadow-2xl lg:inset-y-4 lg:left-auto lg:right-4 lg:w-[430px] lg:rounded-3xl lg:border">
          <div className="absolute inset-0 pointer-events-none opacity-30" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,.08) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
          <header className="relative flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-xl">
            {historyOpen && (
              <button type="button" onClick={() => setHistoryOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.05]" aria-label="Retour">
                <ArrowLeft size={18} />
              </button>
            )}
            {active?.agent_profile ? (
              active.agent_profile.avatar_url
                ? <img src={active.agent_profile.avatar_url} alt={active.agent_profile.first_name} className="h-11 w-11 rounded-2xl object-cover ring-2 ring-rose-400/30" />
                : <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 font-black text-rose-300">{initials(active.agent_profile.first_name)}</div>
            ) : (
              <img
                src="/logo.png"
                alt="Ava Support"
                className="h-11 w-11 rounded-2xl border border-rose-500/20 bg-rose-500/10 object-cover ring-2 ring-rose-400/20"
              />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-black text-white">
                {active?.agent_profile?.first_name || 'Ava Support'}
              </h2>
              <p className="truncate text-[11px] text-slate-500">
                {active?.status === 'assigned'
                  ? 'Un conseiller vous accompagne'
                  : active?.status === 'queued'
                    ? availability.available_count > 0
                      ? `En attente · réponse ${formatWait(availability.estimated_response_seconds)}`
                      : 'En attente · reprise dès la connexion d’un conseiller'
                    : active?.status === 'ai'
                      ? 'Ava répond immédiatement · transfert humain si nécessaire'
                    : active?.status === 'closed'
                      ? 'Conversation terminée'
                      : 'Ava répond immédiatement'}
              </p>
            </div>
            <button type="button" onClick={() => setHistoryOpen(value => !value)} className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.05]" aria-label="Historique">
              <Clock3 size={18} />
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.05]" aria-label="Fermer">
              <X size={19} />
            </button>
          </header>

          <main className="relative flex-1 overflow-y-auto p-4">
            {historyOpen ? (
              <div className="space-y-2">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-white">Vos conversations</h3>
                    <p className="text-xs text-slate-500">Les tickets terminés restent consultables, mais ne peuvent jamais être rouverts.</p>
                  </div>
                  {!conversations.some(item => item.status !== 'closed') && (
                    <button type="button" onClick={newConversation} className="rounded-xl bg-rose-500 px-3 py-2 text-xs font-bold text-white">Nouvelle</button>
                  )}
                </div>
                {conversations.map(item => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => { setActiveId(item.id); setHistoryOpen(false); setRatingDone(false) }}
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left hover:border-rose-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.status === 'assigned' ? 'bg-emerald-400' : item.status === 'queued' ? 'bg-amber-400' : 'bg-slate-600'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{item.subject || 'Assistance Ava'}</p>
                        <p className="text-xs text-slate-500">{item.status === 'closed' ? 'Terminée' : item.status === 'assigned' ? `Avec ${item.agent_profile?.first_name || 'un conseiller'}` : 'En attente'}</p>
                      </div>
                    </div>
                  </button>
                ))}
                {!conversations.length && <p className="py-12 text-center text-sm text-slate-500">Aucune conversation.</p>}
              </div>
            ) : !active ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-rose-500/20 bg-rose-500/[0.07] p-5">
                  <div className="flex -space-x-2">
                    {(availability.agents ?? []).slice(0, 4).map((item: any) => item.avatar_url
                      ? <img key={item.id} src={item.avatar_url} alt={item.first_name} className="h-9 w-9 rounded-xl border-2 border-[#020617] object-cover" />
                      : <div key={item.id} className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#020617] bg-rose-500/20 text-xs font-black text-rose-200">{initials(item.first_name)}</div>)}
                  </div>
                  <h3 className="mt-4 text-xl font-black text-white">Comment pouvons-nous vous aider ?</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Expliquez votre situation : Ava répond d’abord avec toute la documentation produit. Si une intervention humaine devient nécessaire, le contexte est transféré automatiquement à un conseiller disponible.
                  </p>
                </div>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-slate-400">Votre prénom</span>
                  <input
                    value={firstName}
                    onChange={event => setFirstName(event.target.value.slice(0, 60))}
                    placeholder="Comment devons-nous vous appeler ?"
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none focus:border-rose-500/40"
                  />
                </label>
                <Composer
                  message={message}
                  setMessage={setMessage}
                  files={files}
                  setFiles={setFiles}
                  fileRef={fileRef}
                  pickFiles={pickFiles}
                  send={startConversation}
                  loading={loading}
                  placeholder="Décrivez votre demande…"
                />
              </div>
            ) : (
              <div className="flex min-h-full flex-col">
                {active.status === 'queued' && (
                  <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-100"><Clock3 size={17} /> Demande dans la file</div>
                    <p className="mt-1 text-xs text-amber-100/65">Vous pouvez quitter Ava Web : cette conversation restera ici à votre retour.</p>
                  </div>
                )}
                {active.status === 'ai' && (
                  <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/[0.07] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-rose-100">
                      <img src="/logo.png" alt="" className="h-7 w-7 rounded-lg object-cover" />
                      Assistance intelligente Ava
                    </div>
                    <p className="mt-1 text-xs text-rose-100/65">Je réponds d’abord à vos questions. Si une vérification humaine devient nécessaire, je transfère automatiquement le contexte.</p>
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  {(active.ava_support_messages ?? [])
                    .slice()
                    .sort((a: any, b: any) => String(a.created_at).localeCompare(String(b.created_at)))
                    .map((item: any) => (
                      <SupportMessage
                        key={item.id}
                        message={item}
                        perspective="customer"
                        customerName={active.customer_first_name || firstName || 'Vous'}
                        agentName={active.agent_profile?.first_name || 'Conseiller Ava'}
                      />
                    ))}
                  {aiReplying && active.status === 'ai' && <TypingDots label="Ava prépare sa réponse…" />}
                  {peerTyping && <TypingDots label={`${active.agent_profile?.first_name || 'Votre conseiller'} écrit…`} />}
                  <div ref={endRef} />
                </div>

                {active.status === 'closed' ? (
                  <div className="mt-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-center">
                    <CheckCircle2 className="mx-auto text-emerald-400" size={34} />
                    <h3 className="mt-3 font-black text-white">Cette conversation est terminée</h3>
                    <p className="mt-1 text-xs text-slate-500">Elle ne peut plus être rouverte. Vous pouvez créer une nouvelle demande.</p>
                    {!active.ava_support_ratings?.length && !ratingDone ? (
                      <>
                        <p className="mt-5 text-sm font-bold text-white">Comment s’est passée votre assistance ?</p>
                        <div className="my-3 flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map(value => (
                            <button type="button" key={value} onClick={() => setRating(value)} aria-label={`${value} étoiles`}>
                              <Star size={28} className={value <= rating ? 'fill-rose-400 text-rose-400' : 'text-slate-700'} />
                            </button>
                          ))}
                        </div>
                        {rating > 0 && <p className="text-xs font-bold text-rose-300">{RATING_LABELS[rating]}</p>}
                        <textarea
                          value={ratingComment}
                          onChange={event => setRatingComment(event.target.value.slice(0, 150))}
                          maxLength={150}
                          rows={2}
                          placeholder="Commentaire facultatif · 150 caractères"
                          className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-xs text-white outline-none"
                        />
                        <p className="mt-1 text-right text-[10px] text-slate-600">{ratingComment.length}/150</p>
                        <button type="button" onClick={submitRating} disabled={rating < 1 || loading} className="mt-3 rounded-xl bg-rose-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-40">Envoyer mon avis</button>
                      </>
                    ) : (
                      <p className="mt-4 text-sm font-bold text-emerald-300">Merci pour votre avis.</p>
                    )}
                    <button type="button" onClick={newConversation} className="mt-4 block w-full rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-300">Nouvelle demande</button>
                  </div>
                ) : (
                  <div className="mt-5">
                    <Composer
                      message={message}
                      setMessage={setMessage}
                      files={files}
                      setFiles={setFiles}
                      fileRef={fileRef}
                      pickFiles={pickFiles}
                      send={sendMessage}
                      loading={loading}
                      placeholder="Écrivez votre message…"
                    />
                  </div>
                )}
              </div>
            )}
            {error && <p className="mt-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{error}</p>}
          </main>
        </section>
      )}
    </>
  )
}

function Composer({
  message, setMessage, files, setFiles, fileRef, pickFiles, send, loading, placeholder,
}: {
  message: string
  setMessage: (value: string) => void
  files: PendingFile[]
  setFiles: React.Dispatch<React.SetStateAction<PendingFile[]>>
  fileRef: React.RefObject<HTMLInputElement | null>
  pickFiles: (files: FileList | null) => Promise<void>
  send: () => Promise<void>
  loading: boolean
  placeholder: string
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-3">
      {files.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto">
          {files.map(item => (
            <button type="button" key={item.id} onClick={() => {
              if (item.preview) URL.revokeObjectURL(item.preview)
              setFiles(current => current.filter(entry => entry.id !== item.id))
            }} className="group relative h-16 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950">
              {item.preview
                ? <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                : <span className="grid h-full place-items-center text-slate-400">{item.category === 'video' ? <Video size={22} /> : <FileText size={22} />}</span>}
              <span className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/70 opacity-0 group-hover:opacity-100"><Trash2 size={15} /></span>
              {item.progress > 0 && <span className="absolute inset-x-1 bottom-1 h-1 overflow-hidden rounded-full bg-white/20"><span className="block h-full bg-rose-400" style={{ width: `${item.progress}%` }} /></span>}
            </button>
          ))}
        </div>
      )}
      <textarea
        value={message}
        onChange={event => setMessage(event.target.value)}
        onKeyDown={event => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            void send()
          }
        }}
        rows={3}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent px-1 text-sm text-white outline-none placeholder:text-slate-600"
      />
      <div className="mt-2 flex items-center justify-between">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" multiple className="hidden" onChange={event => void pickFiles(event.target.files)} />
        <button type="button" onClick={() => fileRef.current?.click()} className="rounded-xl p-2 text-slate-400 hover:bg-white/[0.05] hover:text-rose-300" aria-label="Ajouter des fichiers">
          <Paperclip size={19} />
        </button>
        <p className="mr-auto text-[9px] text-slate-600">10 images · 1 vidéo 300 Mo · PDF/DOCX/TXT</p>
        <button type="button" onClick={() => void send()} disabled={loading || (!message.trim() && !files.length)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500 text-white disabled:opacity-40">
          {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />}
        </button>
      </div>
    </div>
  )
}
