'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, Trash2, MessageSquare } from 'lucide-react'
import type { UserData, AvaPermissions } from '../types'
import { SYSTEM_INSTRUCTION } from '../constants'

interface ChatMessage {
  id: string
  role: 'user' | 'model'
  text: string
  ts: number
}

type GeminiContent = { role: 'user' | 'model'; parts: { text: string }[] }

interface Props {
  user: UserData
  permissions: AvaPermissions
  language: string
  webSearch: boolean
  onIncrementTextMessages: () => Promise<{ blocked: boolean }>
  sharedApiKey?: string | null
}

const GEMINI_TEXT_MODEL = 'gemini-2.0-flash'

export function ChatTab({ user, permissions, language, webSearch, onIncrementTextMessages, sharedApiKey }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quotaBlocked, setQuotaBlocked] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const storageKey = `ava_chat_web_${user.id}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) setMessages(JSON.parse(saved))
    } catch {}
  }, [storageKey])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }, [input])

  const clearHistory = useCallback(() => {
    setMessages([])
    localStorage.removeItem(storageKey)
  }, [storageKey])

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return

    const { blocked } = await onIncrementTextMessages()
    if (blocked) {
      setQuotaBlocked(true)
      return
    }
    setQuotaBlocked(false)

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text, ts: Date.now() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setLoading(true)
    localStorage.setItem(storageKey, JSON.stringify(updated.slice(-60)))

    const systemInstruction = SYSTEM_INSTRUCTION(
      language,
      webSearch,
      user.memorySummary,
      user.user_name ?? undefined,
    )

    try {
      const contents: GeminiContent[] = updated.map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }))

      const apiTools: any[] = []
      if (webSearch) apiTools.push({ googleSearch: {} })

      const body: any = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents,
      }
      if (apiTools.length > 0) body.tools = apiTools

      for (let step = 0; step < 10; step++) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent?key=${sharedApiKey ?? process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
        )
        const data = await res.json()
        if (!res.ok) throw new Error(data.error?.message ?? `HTTP ${res.status}`)

        const parts: any[] = data.candidates?.[0]?.content?.parts ?? []

        // Handle tool calls (googleSearch grounding — no function call needed, just text)
        const responseText = parts.find((p: any) => p.text)?.text ?? '...'
        const avaMsg: ChatMessage = { id: `${Date.now()}-a`, role: 'model', text: responseText, ts: Date.now() }
        const final = [...updated, avaMsg]
        setMessages(final)
        localStorage.setItem(storageKey, JSON.stringify(final.slice(-60)))
        break
      }
    } catch (e: any) {
      const errMsg: ChatMessage = {
        id: `${Date.now()}-e`,
        role: 'model',
        text: `❌ ${e?.message ?? 'Erreur réseau'}`,
        ts: Date.now(),
      }
      const final = [...updated, errMsg]
      setMessages(final)
      localStorage.setItem(storageKey, JSON.stringify(final.slice(-60)))
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, storageKey, language, webSearch, user, onIncrementTextMessages])

  const limit = permissions.dailyTextMessages
  const nowTs = new Date()
  const resetAt = user.text_quota_reset_at ? new Date(user.text_quota_reset_at) : null
  const needsReset = !resetAt || resetAt <= nowTs
  const usedToday = needsReset ? 0 : (user.text_messages_used ?? 0)
  const remaining = limit === -1 ? null : Math.max(0, limit - usedToday)

  return (
    <div className="flex flex-col h-full" style={{ background: '#020617' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={16} style={{ color: '#f43f5e' }} />
          <span className="font-bold text-white text-sm">Chat · Ava</span>
        </div>
        <div className="flex items-center gap-3">
          {remaining !== null && (
            <span
              className="text-xs font-semibold"
              style={{ color: remaining <= 2 ? '#f43f5e' : 'rgba(255,255,255,0.25)' }}
            >
              {remaining} msg restants
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={clearHistory}
              className="p-1.5 rounded-lg transition-opacity hover:opacity-100"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full gap-3" style={{ opacity: 0.3 }}>
            <MessageSquare size={32} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <p className="text-sm text-center leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Écris un message pour parler à Ava<br />sans lancer d&apos;appel vocal.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {messages.map(msg => {
            const isUser = msg.role === 'user'
            const time = new Date(msg.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className="max-w-[82%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={{
                    borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: isUser ? '#e11d48' : 'rgba(255,255,255,0.06)',
                    border: isUser ? 'none' : '1px solid rgba(255,255,255,0.10)',
                    color: '#fff',
                  }}
                >
                  {msg.text}
                </div>
                <span
                  className="text-[10px] mt-1 px-1 font-semibold uppercase tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.20)' }}
                >
                  {isUser ? 'Moi' : 'Ava'} · {time}
                </span>
              </div>
            )
          })}

          {loading && (
            <div className="flex items-start">
              <div
                className="px-4 py-2.5"
                style={{
                  borderRadius: '16px 16px 16px 4px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.10)',
                }}
              >
                <span className="text-sm animate-pulse" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Ava écrit...
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quota blocked banner */}
      {quotaBlocked && (
        <div
          className="px-4 py-2 flex-shrink-0 text-center"
          style={{ background: 'rgba(225,29,72,0.08)', borderTop: '1px solid rgba(225,29,72,0.15)' }}
        >
          <p className="text-xs font-semibold" style={{ color: '#f43f5e' }}>
            Limite journalière atteinte ({limit} messages). Revenez demain ou passez en Pro.
          </p>
        </div>
      )}

      {/* Input */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-end gap-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="Écris un message..."
          disabled={loading}
          rows={1}
          maxLength={1500}
          className="flex-1 resize-none rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#fff',
            caretColor: '#f43f5e',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-opacity flex-none"
          style={{ background: '#e11d48', opacity: !input.trim() || loading ? 0.4 : 1 }}
        >
          <Send size={16} color="#fff" />
        </button>
      </div>
    </div>
  )
}
