'use client'

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

import { Bot, Download, FileText, UserRound } from 'lucide-react'

const URL_PATTERN = /(https?:\/\/[^\s<]+|www\.[^\s<]+)/giu

export function formatSupportTimestamp(value: unknown) {
  const date = new Date(String(value ?? ''))
  if (!Number.isFinite(date.getTime())) return ''
  const today = new Date()
  const sameDay = date.toDateString() === today.toDateString()
  return sameDay
    ? date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
}

function MessageText({ value }: { value: string }) {
  return (
    <p className="whitespace-pre-wrap break-words">
      {value.split(URL_PATTERN).map((part, index) => {
        if (!part.match(URL_PATTERN)) return part
        const href = part.startsWith('www.') ? `https://${part}` : part
        return (
          <a
            key={`${part}-${index}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold underline decoration-current/40 underline-offset-2 hover:decoration-current"
          >
            {part}
          </a>
        )
      })}
    </p>
  )
}

export function SupportAttachment({ attachment }: { attachment: any }) {
  if (!attachment?.preview_url) return null
  const mimeType = String(attachment.mime_type ?? '')
  const fileName = String(attachment.file_name || 'Fichier joint')
  const downloadButton = (
    <span className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg border border-white/15 bg-slate-950/85 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
      <Download size={15} />
    </span>
  )
  if (mimeType.startsWith('image/')) {
    return (
      <a href={attachment.preview_url} download={fileName} target="_blank" rel="noopener noreferrer" className="group relative mt-2 block overflow-hidden rounded-xl border border-white/10 bg-slate-950/50">
        <img src={attachment.preview_url} alt={fileName} className="max-h-64 w-full object-contain" />
        {downloadButton}
      </a>
    )
  }
  if (mimeType.startsWith('video/')) {
    return (
      <div className="group relative mt-2 overflow-hidden rounded-xl border border-white/10 bg-black">
        <video src={attachment.preview_url} controls preload="metadata" className="max-h-64 w-full" />
        <a href={attachment.preview_url} download={fileName} target="_blank" rel="noopener noreferrer" aria-label={`Télécharger ${fileName}`}>
          {downloadButton}
        </a>
      </div>
    )
  }
  return (
    <a
      href={attachment.preview_url}
      download={fileName}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 text-[11px] font-bold text-rose-100 hover:border-rose-400/30"
    >
      <FileText size={18} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate">{fileName}</span>
      <Download size={15} className="shrink-0 text-slate-400" />
    </a>
  )
}

export function SupportMessage({
  message,
  customerName,
  agentName,
  perspective,
}: {
  message: any
  customerName?: string
  agentName?: string
  perspective: 'customer' | 'agent' | 'admin'
}) {
  const sender = String(message.sender_type ?? 'system')
  const own = perspective === 'customer' ? sender === 'user' : sender === 'agent'
  const label = sender === 'ai'
    ? 'Ava · assistance IA'
    : sender === 'agent'
      ? agentName || 'Conseiller Ava'
      : sender === 'user'
        ? customerName || (perspective === 'customer' ? 'Vous' : 'Client')
        : 'Système Ava'
  const tone = sender === 'ai'
    ? 'border-violet-400/25 bg-violet-500/[0.10] text-violet-50'
    : sender === 'agent'
      ? own
        ? 'border-rose-300/20 bg-rose-500 text-white'
        : 'border-rose-400/25 bg-rose-500/[0.10] text-rose-50'
      : sender === 'user'
        ? own
          ? 'border-rose-300/20 bg-rose-500 text-white'
          : 'border-sky-400/20 bg-sky-500/[0.09] text-sky-50'
        : 'border-white/10 bg-white/[0.04] text-slate-300'
  const labelTone = sender === 'ai'
    ? 'text-violet-200'
    : sender === 'user' && !own
      ? 'text-sky-200'
      : own
        ? 'text-white/80'
        : 'text-rose-200'

  return (
    <div className={`max-w-[88%] ${own ? 'ml-auto' : 'mr-auto'}`}>
      <div className={`rounded-2xl border px-3.5 py-3 text-xs leading-relaxed shadow-sm ${tone} ${message.pending ? 'opacity-70' : ''}`}>
        <div className={`mb-2 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[.14em] ${labelTone}`}>
          {sender === 'ai' ? <Bot size={12} /> : <UserRound size={12} />}
          {label}
        </div>
        <MessageText value={String(message.content ?? '')} />
        {(message.attachments ?? []).map((attachment: any, index: number) => (
          <SupportAttachment key={attachment.upload_id ?? attachment.preview_url ?? index} attachment={attachment} />
        ))}
      </div>
      <p className={`mt-1 px-1 text-[9px] text-slate-600 ${own ? 'text-right' : 'text-left'}`}>
        {message.pending ? 'Envoi…' : formatSupportTimestamp(message.created_at)}
      </p>
    </div>
  )
}
