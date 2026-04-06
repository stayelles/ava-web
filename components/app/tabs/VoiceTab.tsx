'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Phone, Square, MessageCircle, X } from 'lucide-react'
import { useGeminiLive } from '../hooks/useGeminiLive'
import { totalCredits } from '../types'
import { BackgroundParticles } from '../BackgroundParticles'
import { FrequencyVisualizer } from '../FrequencyVisualizer'
import { AvaAvatar } from '../AvaAvatar'
import type { UserData } from '../types'

interface Props {
  user: UserData
  language: string
  webSearch: boolean
  onSessionEnd?: () => void
}

export function VoiceTab({ user, language, webSearch, onSessionEnd }: Props) {
  const {
    sessionState, transcript, statusText, isAvaSpeaking,
    isMuted, setIsMuted, startSession, stopSession, volumeLevel,
  } = useGeminiLive({ language, webSearch, onSessionEnd })

  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const transcriptEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (transcriptOpen) transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript, transcriptOpen])

  const credits = totalCredits(user)
  const isActive = sessionState === 'connected'
  const isConnecting = sessionState === 'connecting'
  const isError = sessionState === 'error'

  // Volume shown: when user is speaking (mic active) show mic volume, when Ava speaks use simulated
  const displayVolume = isAvaSpeaking
    ? volumeLevel * 0.5 + Math.random() * 0.15  // Ava speaking: simulate some movement
    : volumeLevel

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  const [callDuration, setCallDuration] = useState(0)
  useEffect(() => {
    if (!isActive) { setCallDuration(0); return }
    const t = setInterval(() => setCallDuration(p => p + 1), 1000)
    return () => clearInterval(t)
  }, [isActive])

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden" style={{ background: '#020617' }}>
      {/* Background particles */}
      <BackgroundParticles isActive={isActive} volume={displayVolume} />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-950 pointer-events-none z-0" />

      {/* Top bar */}
      <div className="relative z-50 px-5 py-3 flex items-center justify-between flex-shrink-0">
        {/* Credits */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{ background: 'rgba(10,18,38,0.7)', border: '1px solid rgba(255,255,255,0.08)', color: credits <= 2 ? '#f87171' : '#94a3b8' }}
        >
          <span className="uppercase tracking-wider text-[10px]" style={{ color: '#475569' }}>Énergie</span>
          <span>{credits}</span>
        </div>

        {/* Timer (shown when active) */}
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

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center pb-8 min-h-0">
        {/* Name + role — fade out when active */}
        <motion.div
          animate={{ opacity: isActive ? 0 : 1, y: isActive ? 12 : 0, scale: isActive ? 0.9 : 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white tracking-tight">Ava</h1>
          <p className="text-xs mt-1 uppercase tracking-widest font-medium" style={{ color: '#f43f5e' }}>
            Assistante vocale IA
          </p>
        </motion.div>

        {/* Avatar */}
        <div className="w-52 h-52 sm:w-64 sm:h-64 flex-shrink-0">
          <AvaAvatar isActive={isActive || isConnecting} volume={displayVolume} />
        </div>

        {/* Status + visualizer */}
        <div className="mt-8 flex flex-col items-center gap-3">
          {isActive ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <FrequencyVisualizer volumeLevel={displayVolume} isActive={isActive} />
              <p className="text-xs uppercase font-semibold tracking-widest animate-pulse" style={{ color: 'rgba(225,29,72,0.7)' }}>
                {isAvaSpeaking ? 'Ava vous répond...' : "J'écoute..."}
              </p>
            </motion.div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-1.5 px-4">
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: '#f87171' }}>Connexion échouée</p>
            </div>
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
        {/* Mute — only when active */}
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
          disabled={isConnecting}
          whileHover={isConnecting ? {} : { scale: 1.05 }}
          whileTap={isConnecting ? {} : { scale: 0.95 }}
          className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-colors"
          style={{
            background: isActive ? '#ef4444' : isError ? '#ea580c' : '#e11d48',
            boxShadow: isActive
              ? '0 0 40px rgba(239,68,68,0.4)'
              : '0 0 40px rgba(225,29,72,0.45), 0 0 80px rgba(225,29,72,0.15)',
          }}
        >
          {isActive
            ? <Square size={28} className="text-white fill-white" />
            : <Phone size={28} className="text-white fill-white" />}
        </motion.button>

        {/* Spacer to balance mute button */}
        <div className="w-14 h-14" />
      </div>

      {/* Transcript panel (slide in from right) */}
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
