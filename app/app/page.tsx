'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, PhoneOff, LogOut, Phone } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// ─── Constants ────────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://bmcvyvyjqxehwmkddtya.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtY3Z5dnlqcXhlaHdta2RkdHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTMwMDcsImV4cCI6MjA2MjUyOTAwN30.Q4OppbvjThogFPlldXjkx5WlbI7FkVvClClThEL6ejY'

const GEMINI_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'
const GEMINI_VOICE = 'Kore'
const WS_BASE = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent'

const SYSTEM_INSTRUCTION = `Tu es Ava, une assistante IA vocale disponible directement depuis le navigateur. Tu es chaleureuse, intelligente et très utile. Tu réponds de manière concise et naturelle, comme dans une vraie conversation. Tu peux aider avec toutes sortes de questions : conseils, rédaction, traduction, explication, brainstorming, et bien plus. Tu n'as pas accès à l'ordinateur ou au téléphone de l'utilisateur. Parle en français par défaut, mais adapte-toi immédiatement à la langue de l'utilisateur. PRIORITÉ ABSOLUE : sois rapide, naturelle et chaleureuse.`

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string
  email: string
  credits: number
  free_daily_credits: number
}

interface TranscriptItem {
  id: number
  role: 'user' | 'ava'
  text: string
}

type SessionState = 'idle' | 'connecting' | 'connected' | 'error'

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AvaWebApp() {
  // Auth state
  const [user, setUser] = useState<UserData | null>(null)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  // Session state
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [transcript, setTranscript] = useState<TranscriptItem[]>([])
  const [statusText, setStatusText] = useState("Appuyez pour démarrer")
  const [isAvaSpeaking, setIsAvaSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Refs
  const wsRef = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const nextPlayTimeRef = useRef(0)
  const idCounterRef = useRef(0)
  const isMutedRef = useRef(false)
  const isClosingRef = useRef(false)
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)

  // Sync muted ref
  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  // Load saved session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ava_web_session')
      if (saved) setUser(JSON.parse(saved))
    } catch {}
  }, [])

  // ── Auth ────────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    const identifier = loginEmail.trim()
    if (!identifier || loginPin.length < 4) {
      setLoginError('Identifiant et code PIN requis')
      return
    }
    setLoginLoading(true)
    setLoginError('')
    try {
      // Support email OR numeric telegram_id
      const isNumeric = /^\d+$/.test(identifier)
      const filter = isNumeric
        ? `telegram_id=eq.${identifier}`
        : `email=eq.${encodeURIComponent(identifier)}`
      const url = `${SUPABASE_URL}/rest/v1/ava_users?${filter}&pin=eq.${loginPin}&select=id,email,credits,free_daily_credits`
      const res = await fetch(url, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      })
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const u = data[0] as UserData
        setUser(u)
        localStorage.setItem('ava_web_session', JSON.stringify(u))
      } else {
        setLoginError('Identifiant ou PIN incorrect')
      }
    } catch {
      setLoginError('Erreur de connexion. Réessayez.')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = useCallback(() => {
    stopSession()
    setUser(null)
    localStorage.removeItem('ava_web_session')
  }, []) // eslint-disable-line

  // ── Audio playback ──────────────────────────────────────────────────────────

  const playPCMChunk = useCallback((base64: string) => {
    const ctx = audioCtxRef.current
    if (!ctx) return
    try {
      const binary = atob(base64)
      const bytes = new Uint8Array(binary.length)
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
      const int16 = new Int16Array(bytes.buffer)
      const float32 = new Float32Array(int16.length)
      for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768.0
      const buffer = ctx.createBuffer(1, float32.length, 24000)
      buffer.getChannelData(0).set(float32)
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.connect(ctx.destination)
      const now = ctx.currentTime
      if (nextPlayTimeRef.current < now) nextPlayTimeRef.current = now
      src.start(nextPlayTimeRef.current)
      nextPlayTimeRef.current += buffer.duration
    } catch {}
  }, [])

  // ── WebSocket message handler ───────────────────────────────────────────────

  const handleMessage = useCallback((raw: string) => {
    let msg: any
    try { msg = JSON.parse(raw) } catch { return }

    // Setup complete → ready to talk
    if (msg.setupComplete !== undefined) {
      setSessionState('connected')
      setStatusText("J'écoute...")
      return
    }

    const sc = msg.serverContent
    if (!sc) return

    // Ava interrupted (user spoke while she was talking)
    if (sc.interrupted) {
      nextPlayTimeRef.current = audioCtxRef.current?.currentTime ?? 0
      setIsAvaSpeaking(false)
      return
    }

    // Audio from Ava
    const audioData = sc.modelTurn?.parts?.[0]?.inlineData?.data ?? sc.audioChunks?.[0]?.data
    if (audioData) {
      setIsAvaSpeaking(true)
      playPCMChunk(audioData)
    }

    // Ava's text transcription
    if (sc.outputTranscription?.text) {
      const txt = sc.outputTranscription.text
      setTranscript(prev => {
        const last = prev[prev.length - 1]
        if (last?.role === 'ava') return [...prev.slice(0, -1), { ...last, text: last.text + txt }]
        return [...prev, { id: ++idCounterRef.current, role: 'ava', text: txt }]
      })
    }

    // User's voice transcription
    if (sc.inputTranscription?.text) {
      const txt = sc.inputTranscription.text
      setTranscript(prev => {
        const last = prev[prev.length - 1]
        if (last?.role === 'user') return [...prev.slice(0, -1), { ...last, text: last.text + txt }]
        return [...prev, { id: ++idCounterRef.current, role: 'user', text: txt }]
      })
    }

    if (sc.turnComplete) {
      setIsAvaSpeaking(false)
      setStatusText("J'écoute...")
    }
  }, [playPCMChunk])

  // ── Stop session ────────────────────────────────────────────────────────────

  const stopSession = useCallback(() => {
    isClosingRef.current = true
    wsRef.current?.close()
    wsRef.current = null
    processorRef.current?.disconnect()
    processorRef.current = null
    sourceNodeRef.current?.disconnect()
    sourceNodeRef.current = null
    gainRef.current?.disconnect()
    gainRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    nextPlayTimeRef.current = 0
    setSessionState('idle')
    setIsAvaSpeaking(false)
    setIsMuted(false)
    setStatusText("Appuyez pour démarrer")
    setTimeout(() => { isClosingRef.current = false }, 200)
  }, [])

  // ── Start session ───────────────────────────────────────────────────────────

  const startSession = useCallback(async () => {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (!apiKey) {
      setStatusText("Clé API manquante — contactez le support")
      setSessionState('error')
      return
    }

    setSessionState('connecting')
    setStatusText('Connexion...')
    setTranscript([])
    setIsAvaSpeaking(false)
    isClosingRef.current = false

    // AudioContext at 16kHz for recording input
    let ctx: AudioContext
    try {
      ctx = new AudioContext({ sampleRate: 16000 })
      audioCtxRef.current = ctx
      nextPlayTimeRef.current = 0
    } catch {
      setStatusText("Navigateur non supporté")
      setSessionState('error')
      return
    }

    // Get microphone
    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      streamRef.current = stream
    } catch {
      setStatusText("Microphone requis — autorisez l'accès dans votre navigateur")
      setSessionState('error')
      ctx.close()
      audioCtxRef.current = null
      return
    }

    // WebSocket to Gemini Live
    const ws = new WebSocket(`${WS_BASE}?key=${apiKey}`)
    wsRef.current = ws

    ws.onopen = () => {
      // Send setup
      ws.send(JSON.stringify({
        setup: {
          model: `models/${GEMINI_MODEL}`,
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: GEMINI_VOICE } } },
          },
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
      }))

      // Start streaming mic audio
      const source = ctx.createMediaStreamSource(stream)
      sourceNodeRef.current = source

      // Silent gain to avoid echo feedback
      const silentGain = ctx.createGain()
      silentGain.gain.value = 0
      gainRef.current = silentGain

      // ScriptProcessor for PCM extraction
      const processor = ctx.createScriptProcessor(2048, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current) return
        if (ws.readyState !== WebSocket.OPEN) return
        const float32 = e.inputBuffer.getChannelData(0)
        const int16 = new Int16Array(float32.length)
        for (let i = 0; i < float32.length; i++) {
          int16[i] = Math.max(-32768, Math.min(32767, float32[i] * 32767))
        }
        const uint8 = new Uint8Array(int16.buffer)
        let binary = ''
        for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i])
        ws.send(JSON.stringify({
          realtimeInput: {
            mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: btoa(binary) }],
          },
        }))
      }

      source.connect(processor)
      processor.connect(silentGain)
      silentGain.connect(ctx.destination)
    }

    ws.onmessage = (event) => {
      const d = event.data
      if (typeof d === 'string') handleMessage(d)
      else if (d instanceof ArrayBuffer) {
        try { handleMessage(new TextDecoder().decode(d)) } catch {}
      }
    }

    ws.onerror = () => {
      if (!isClosingRef.current) {
        setStatusText("Erreur de connexion — réessayez")
        setSessionState('error')
      }
    }

    ws.onclose = () => {
      if (!isClosingRef.current) {
        setSessionState('idle')
        setIsAvaSpeaking(false)
        setStatusText("Session terminée — appuyez pour recommencer")
      }
    }
  }, [handleMessage])

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!user) {
    return <LoginScreen
      email={loginEmail}
      pin={loginPin}
      error={loginError}
      loading={loginLoading}
      onEmailChange={setLoginEmail}
      onPinChange={setLoginPin}
      onSubmit={handleLogin}
    />
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: '#020617' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Ava" width={28} height={28} className="rounded-full" />
          <span className="font-bold text-sm" style={{ color: '#f1f5f9' }}>Ava</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(225,29,72,0.15)', color: '#f43f5e' }}>Web</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs hidden sm:block" style={{ color: '#475569' }}>{user.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: '#64748b', background: 'rgba(255,255,255,0.04)' }}
          >
            <LogOut size={13} />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isAvaSpeaking
              ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)'
              : sessionState === 'connected'
              ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(225,29,72,0.06) 0%, transparent 70%)',
            transition: 'background 1s ease',
          }}
        />

        {/* Orb */}
        <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
          {/* Outer glow rings */}
          {(sessionState === 'connected' || sessionState === 'connecting') && (
            <>
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 180, height: 180,
                  background: isAvaSpeaking
                    ? 'rgba(99,102,241,0.08)'
                    : 'rgba(16,185,129,0.08)',
                  border: `1px solid ${isAvaSpeaking ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`,
                }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: isAvaSpeaking ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 140, height: 140,
                  background: isAvaSpeaking
                    ? 'rgba(99,102,241,0.12)'
                    : 'rgba(16,185,129,0.12)',
                  border: `1px solid ${isAvaSpeaking ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.3)'}`,
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: isAvaSpeaking ? 0.9 : 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              />
            </>
          )}

          {/* Idle rings */}
          {sessionState === 'idle' && (
            <>
              <motion.div
                className="absolute rounded-full"
                style={{ width: 180, height: 180, border: '1px solid rgba(225,29,72,0.15)' }}
                animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{ width: 140, height: 140, border: '1px solid rgba(225,29,72,0.2)' }}
                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              />
            </>
          )}

          {/* Core orb */}
          <motion.div
            className="relative rounded-full overflow-hidden flex items-center justify-center"
            style={{
              width: 100,
              height: 100,
              background: isAvaSpeaking
                ? 'radial-gradient(circle at 35% 35%, #818cf8, #4f46e5)'
                : sessionState === 'connected'
                ? 'radial-gradient(circle at 35% 35%, #34d399, #059669)'
                : sessionState === 'connecting'
                ? 'radial-gradient(circle at 35% 35%, #fb923c, #ea580c)'
                : sessionState === 'error'
                ? 'radial-gradient(circle at 35% 35%, #f87171, #dc2626)'
                : 'radial-gradient(circle at 35% 35%, #fb7185, #e11d48)',
              boxShadow: isAvaSpeaking
                ? '0 0 40px rgba(99,102,241,0.5), 0 0 80px rgba(99,102,241,0.2)'
                : sessionState === 'connected'
                ? '0 0 40px rgba(16,185,129,0.4), 0 0 80px rgba(16,185,129,0.15)'
                : '0 0 40px rgba(225,29,72,0.4), 0 0 80px rgba(225,29,72,0.15)',
              transition: 'background 0.8s ease, box-shadow 0.8s ease',
            }}
            animate={
              isAvaSpeaking
                ? { scale: [1, 1.08, 1.04, 1.1, 1], transition: { duration: 0.8, repeat: Infinity } }
                : sessionState === 'connecting'
                ? { scale: [1, 1.05, 1], transition: { duration: 0.7, repeat: Infinity } }
                : { scale: [1, 1.02, 1], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }
            }
          >
            <Image
              src="/logo.png"
              alt="Ava"
              width={80}
              height={80}
              className="object-cover opacity-90"
              style={{ borderRadius: '50%' }}
            />
          </motion.div>
        </div>

        {/* Status */}
        <div className="text-center space-y-1">
          <motion.p
            key={statusText}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-base font-medium"
            style={{ color: '#cbd5e1' }}
          >
            {statusText}
          </motion.p>
          {isMuted && sessionState === 'connected' && (
            <p className="text-xs" style={{ color: '#f59e0b' }}>Microphone coupé</p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {sessionState === 'idle' || sessionState === 'error' ? (
            <motion.button
              onClick={startSession}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm"
              style={{ background: '#e11d48', color: '#fff', boxShadow: '0 0 30px rgba(225,29,72,0.35)' }}
            >
              <Phone size={18} />
              Démarrer la conversation
            </motion.button>
          ) : (
            <>
              {/* Mute toggle */}
              <motion.button
                onClick={() => setIsMuted(m => !m)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: isMuted ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.08)',
                  border: isMuted ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.12)',
                  color: isMuted ? '#f59e0b' : '#94a3b8',
                }}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>

              {/* Hang up */}
              <motion.button
                onClick={stopSession}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
              >
                <PhoneOff size={16} />
                Terminer
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Transcript panel */}
      <AnimatePresence>
        {transcript.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-y-auto"
            style={{
              maxHeight: '35vh',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(15,23,42,0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
              {transcript.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={
                      item.role === 'user'
                        ? { background: 'rgba(225,29,72,0.2)', color: '#fda4af', borderBottomRightRadius: 4 }
                        : { background: 'rgba(255,255,255,0.07)', color: '#cbd5e1', borderBottomLeftRadius: 4 }
                    }
                  >
                    {item.text}
                  </div>
                </motion.div>
              ))}
              <div ref={transcriptEndRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({
  email, pin, error, loading,
  onEmailChange, onPinChange, onSubmit
}: {
  email: string; pin: string; error: string; loading: boolean
  onEmailChange: (v: string) => void; onPinChange: (v: string) => void; onSubmit: () => void
}) {
  const handleKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') onSubmit() }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '14px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f8fafc',
    fontSize: '15px',
    outline: 'none',
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: '#020617' }}>
      {/* Ambient glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(225,29,72,0.07) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-8"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-20 h-20 rounded-full mb-4 overflow-hidden"
              style={{ boxShadow: '0 0 40px rgba(225,29,72,0.4)' }}
            >
              <Image src="/logo.png" alt="Ava" width={80} height={80} className="object-cover" />
            </div>
            <h1 className="text-2xl font-black tracking-tight" style={{ color: '#fff' }}>Ava</h1>
            <p className="text-sm mt-1" style={{ color: '#64748b' }}>Assistante vocale IA</p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>
                Email ou identifiant
              </label>
              <input
                type="text"
                value={email}
                onChange={e => onEmailChange(e.target.value)}
                onKeyDown={handleKey}
                placeholder="votre@email.com ou 62402485"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>
                Code PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={e => onPinChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={handleKey}
                placeholder="••••••"
                inputMode="numeric"
                style={{ ...inputStyle, letterSpacing: '0.3em', fontSize: '18px' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: '#f43f5e' }}>{error}</p>
            )}

            <motion.button
              onClick={onSubmit}
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              className="w-full py-3.5 rounded-2xl font-bold text-sm mt-2"
              style={{
                background: loading ? 'rgba(225,29,72,0.5)' : '#e11d48',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 0 30px rgba(225,29,72,0.3)',
              }}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </motion.button>
          </div>

          <p className="text-xs text-center mt-6" style={{ color: '#475569' }}>
            Utilisez votre email ou identifiant + PIN de l&apos;appli Ava
          </p>
        </div>

        {/* Bottom links */}
        <div className="flex justify-center gap-6 mt-6 text-xs" style={{ color: '#334155' }}>
          <Link href="/" className="hover:text-slate-400 transition-colors">Accueil</Link>
          <Link href="/cgu" className="hover:text-slate-400 transition-colors">CGU</Link>
          <Link href="/confidentialite" className="hover:text-slate-400 transition-colors">Confidentialité</Link>
          <Link href="/support" className="hover:text-slate-400 transition-colors">Support</Link>
        </div>
      </motion.div>
    </div>
  )
}
