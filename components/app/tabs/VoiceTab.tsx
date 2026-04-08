'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Phone, Square, MessageCircle, X, ImageIcon, Crown } from 'lucide-react'
import { useGeminiLive } from '../hooks/useGeminiLive'
import { totalCredits, isPro, voiceMinutesRemaining, voiceQuotaMinutes } from '../types'
import { BackgroundParticles } from '../BackgroundParticles'
import { FrequencyVisualizer } from '../FrequencyVisualizer'
import { AvaAvatar } from '../AvaAvatar'
import type { UserData, AvaPermissions } from '../types'

interface Props {
  user: UserData
  language: string
  webSearch: boolean
  permissions: AvaPermissions
  onSessionEnd?: () => void
  onTurnComplete?: () => void
  onGoToSubscription?: () => void
  onVoiceDone?: (durationSeconds: number) => void
  customApiKey?: string | null
  sharedApiKey?: string | null
}

const MAX_IMAGES = 6

export function VoiceTab({
  user, language, webSearch, permissions,
  onSessionEnd, onTurnComplete, onGoToSubscription, onVoiceDone,
  customApiKey, sharedApiKey,
}: Props) {
  const callDurationRef = useRef(0)

  const handleSessionEnd = useCallback(() => {
    onVoiceDone?.(callDurationRef.current)
    onSessionEnd?.()
  }, [onSessionEnd, onVoiceDone])

  const {
    sessionState, transcript, statusText, isAvaSpeaking,
    isMuted, setIsMuted, startSession, stopSession, volumeLevel, sendImage,
  } = useGeminiLive({
    language,
    webSearch: webSearch && permissions.webSearch,
    memorySummary: user.memorySummary,
    userName: user.first_name ?? undefined,
    userId: user.id,
    onSessionEnd: handleSessionEnd,
    onTurnComplete,
    onMemoryUpdated: () => { /* memory saved — refreshUser re-fetches it via onSessionEnd */ },
    apiKey: customApiKey ?? sharedApiKey ?? undefined,
  })

  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [sendingImages, setSendingImages] = useState(false)

  useEffect(() => {
    if (transcriptOpen) transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, transcriptOpen])

  const credits = totalCredits(user)
  const pro = isPro(user)
  const isActive = sessionState === 'connected'
  const isConnecting = sessionState === 'connecting'
  const isError = sessionState === 'error'
  const noCredits = !pro && credits <= 0
  const voiceRemaining = voiceMinutesRemaining(user)
  const voiceQuota = voiceQuotaMinutes(user)
  const voiceExhausted = voiceRemaining <= 0
  const cannotStart = noCredits || voiceExhausted

  const displayVolume = isAvaSpeaking
    ? volumeLevel * 0.5 + Math.random() * 0.12
    : volumeLevel

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const [callDuration, setCallDuration] = useState(0)
  useEffect(() => {
    if (!isActive) { setCallDuration(0); callDurationRef.current = 0; return }
    const t = setInterval(() => setCallDuration(p => {
      const next = p + 1
      callDurationRef.current = next
      return next
    }), 1000)
    return () => clearInterval(t)
  }, [isActive])

  const handleImageFiles = useCallback((files: FileList | null) => {
    if (!files || !isActive) return
    const toSend = Array.from(files).slice(0, MAX_IMAGES)
    setSendingImages(true)
    let done = 0
    toSend.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1]
        sendImage(base64, file.type || 'image/jpeg')
        done++
        if (done === toSend.length) setSendingImages(false)
      }
      reader.readAsDataURL(file)
    })
  }, [isActive, sendImage])

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden" style={{ background: '#020617' }}>
      <BackgroundParticles isActive={isActive} volume={displayVolume} />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-950 pointer-events-none z-0" />

      {/* Top bar */}
      <div className="relative z-50 px-5 py-3 flex items-center justify-between flex-shrink-0">
        {/* Credits */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            background: 'rgba(10,18,38,0.7)',
            border: `1px solid ${noCredits ? 'rgba(239,68,68,0.4)' : credits <= 3 ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)'}`,
            color: noCredits ? '#f87171' : credits <= 3 ? '#f59e0b' : '#94a3b8',
          }}
        >
          <span className="uppercase tracking-wider text-[10px]" style={{ color: '#475569' }}>
            {pro ? '∞' : 'Énergie'}
          </span>
          {!pro && <span>{credits}</span>}
          {pro && <Crown size={11} style={{ color: '#f43f5e' }} />}
        </div>

        {/* Timer */}
        <motion.div
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -8 }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{ background: 'rgba(10,18,38,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono text-white/90 font-medium tracking-widest text-sm">{formatTime(callDuration)}</span>
        </motion.div>

        {/* Transcript button */}
        <button
          onClick={() => setTranscriptOpen(true)}
          className="p-2.5 rounded-2xl transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          <MessageCircle size={18} style={{ color: '#94a3b8' }} />
        </button>
      </div>

      {/* Voice quota exhausted warning */}
      <AnimatePresence>
        {voiceExhausted && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-50 mx-4 mb-1 px-4 py-3 rounded-2xl flex items-center justify-between gap-3"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#fca5a5' }}>
              Quota vocal mensuel atteint ({voiceQuota} min) — revenez le mois prochain{!pro ? ' ou passez à Pro' : ''}
            </p>
            {!pro && onGoToSubscription && (
              <button
                onClick={onGoToSubscription}
                className="text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
                style={{ background: '#e11d48', color: '#fff' }}
              >
                Pro
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No credits warning (free only, quota not exhausted) */}
      <AnimatePresence>
        {noCredits && !voiceExhausted && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-50 mx-4 mb-1 px-4 py-3 rounded-2xl flex items-center justify-between gap-3"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <p className="text-xs font-semibold" style={{ color: '#fca5a5' }}>
              Plus de crédits — revenez demain ou passez à Pro
            </p>
            {onGoToSubscription && (
              <button
                onClick={onGoToSubscription}
                className="text-xs font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
                style={{ background: '#e11d48', color: '#fff' }}
              >
                Pro
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low credits warning */}
      <AnimatePresence>
        {!noCredits && credits <= 3 && !pro && !isActive && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative z-50 mx-4 mb-1 px-4 py-2.5 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <p className="text-xs" style={{ color: '#fcd34d' }}>
              Plus que {credits} crédit{credits > 1 ? 's' : ''} — les crédits gratuits se rechargent chaque jour à minuit.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-8 min-h-0">
        <motion.div
          animate={{ opacity: isActive ? 0 : 1, y: isActive ? 12 : 0, scale: isActive ? 0.9 : 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">Ava</h1>
          <p className="text-xs mt-1 uppercase tracking-widest font-medium" style={{ color: '#f43f5e' }}>
            Meilleure amie & confidente
          </p>
        </motion.div>

        <div className="w-52 h-52 sm:w-64 sm:h-64 flex-shrink-0">
          <AvaAvatar isActive={isActive || isConnecting} volume={displayVolume} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          {isActive ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <FrequencyVisualizer volumeLevel={displayVolume} isActive={isActive} />
              <p className="text-xs uppercase font-semibold tracking-widest animate-pulse" style={{ color: 'rgba(225,29,72,0.7)' }}>
                {isAvaSpeaking ? 'Ava est avec toi...' : "J'écoute..."}
              </p>
            </motion.div>
          ) : isError ? (
            <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#f87171' }}>Connexion échouée</p>
          ) : (
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm"
              style={{ color: isConnecting ? '#94a3b8' : 'rgba(255,255,255,0.3)' }}
            >
              {statusText}
            </motion.p>
          )}
          {isMuted && isActive && (
            <p className="text-xs font-medium" style={{ color: '#f59e0b' }}>Microphone coupé</p>
          )}
        </div>
      </div>

      {/* Bottom controls */}
      <div
        className="relative z-50 flex-shrink-0 w-full flex justify-center items-center gap-5 pb-6 pt-4"
        style={{ background: 'linear-gradient(to top, #020617 60%, transparent)' }}
      >
        {/* Mute */}
        <motion.button
          animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.75 }}
          transition={{ duration: 0.2 }}
          onClick={() => setIsMuted(!isMuted)}
          disabled={!isActive}
          className="p-4 rounded-full transition-all"
          style={{
            background: isMuted ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
            border: isMuted ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: isMuted ? '#f59e0b' : 'rgba(255,255,255,0.7)',
            pointerEvents: isActive ? 'auto' : 'none',
          }}
        >
          {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
        </motion.button>

        {/* Main call button */}
        <motion.button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting || cannotStart}
          whileHover={isConnecting || cannotStart ? {} : { scale: 1.05 }}
          whileTap={isConnecting || cannotStart ? {} : { scale: 0.95 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-colors"
          style={{
            background: cannotStart && !isActive ? 'rgba(255,255,255,0.08)' : isActive ? '#ef4444' : isError ? '#ea580c' : '#e11d48',
            boxShadow: isActive
              ? '0 0 40px rgba(239,68,68,0.4)'
              : cannotStart ? 'none'
              : '0 0 40px rgba(225,29,72,0.45), 0 0 80px rgba(225,29,72,0.15)',
            opacity: cannotStart && !isActive ? 0.5 : 1,
          }}
        >
          {isActive
            ? <Square size={28} className="text-white fill-white" />
            : <Phone size={28} className="text-white fill-white" style={{ opacity: cannotStart ? 0.5 : 1 }} />}
        </motion.button>

        {/* Image upload (Pro only, shown when active) */}
        <motion.div
          animate={{ opacity: isActive && permissions.imageUpload ? 1 : 0, scale: isActive && permissions.imageUpload ? 1 : 0.75 }}
          transition={{ duration: 0.2 }}
          style={{ pointerEvents: isActive && permissions.imageUpload ? 'auto' : 'none' }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => { handleImageFiles(e.target.files); e.target.value = '' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={sendingImages}
            className="p-4 rounded-full transition-all"
            style={{
              background: sendingImages ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: sendingImages ? '#818cf8' : 'rgba(255,255,255,0.7)',
            }}
          >
            <ImageIcon size={22} />
          </button>
        </motion.div>

        {/* Spacer when image button hidden */}
        {(!isActive || !permissions.imageUpload) && <div className="w-14 h-14" />}
      </div>

      {/* Transcript panel */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-96 z-[100] flex flex-col transition-transform duration-500 ease-out ${transcriptOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'rgba(10,15,30,0.97)', backdropFilter: 'blur(24px)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2">
            <MessageCircle size={16} style={{ color: '#f43f5e' }} />
            <span className="font-bold text-white">Conversation</span>
          </div>
          <button onClick={() => setTranscriptOpen(false)} className="p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <X size={18} style={{ color: 'rgba(255,255,255,0.5)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {transcript.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 gap-3">
              <MessageCircle size={40} style={{ color: '#fff' }} />
              <p className="text-sm text-white">La transcription apparaîtra ici pendant la conversation.</p>
            </div>
          ) : (
            transcript.map(item => (
              <div key={item.id} className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={
                    item.role === 'user'
                      ? { background: '#e11d48', color: '#fff', borderTopRightRadius: 4 }
                      : { background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.9)', borderTopLeftRadius: 4 }
                  }
                >
                  {item.text}
                </div>
                <span className="text-[10px] mt-1 px-1 uppercase font-bold tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  {item.role === 'user' ? 'Moi' : 'Ava'}
                </span>
              </div>
            ))
          )}
          <div ref={transcriptEndRef} />
        </div>

        <div className="px-6 py-3 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-[10px] text-center uppercase font-black tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Fin de la conversation
          </p>
        </div>
      </div>
    </div>
  )
}
