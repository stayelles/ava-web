'use client'

import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Phone, PhoneOff } from 'lucide-react'
import Image from 'next/image'
import { useGeminiLive } from '../hooks/useGeminiLive'
import { totalCredits } from '../types'
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
    isMuted, setIsMuted, startSession, stopSession,
  } = useGeminiLive({ language, webSearch, onSessionEnd })

  const transcriptEndRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  const credits = totalCredits(user)

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Credits badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className="text-xs font-semibold px-3 py-1 rounded-full"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#64748b' }}
        >
          {credits} crédit{credits !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Main voice area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{
            background: isAvaSpeaking
              ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 70%)'
              : sessionState === 'connected'
              ? 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(16,185,129,0.07) 0%, transparent 70%)'
              : 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(225,29,72,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Orb */}
        <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
          {(sessionState === 'connected' || sessionState === 'connecting') && (
            <>
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 200, height: 200,
                  border: `1px solid ${isAvaSpeaking ? 'rgba(99,102,241,0.25)' : 'rgba(16,185,129,0.2)'}`,
                  background: isAvaSpeaking ? 'rgba(99,102,241,0.05)' : 'rgba(16,185,129,0.05)',
                }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: isAvaSpeaking ? 1.1 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{
                  width: 155, height: 155,
                  border: `1px solid ${isAvaSpeaking ? 'rgba(99,102,241,0.35)' : 'rgba(16,185,129,0.3)'}`,
                }}
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: isAvaSpeaking ? 0.85 : 2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              />
            </>
          )}

          {sessionState === 'idle' && (
            <>
              <motion.div
                className="absolute rounded-full"
                style={{ width: 200, height: 200, border: '1px solid rgba(225,29,72,0.12)' }}
                animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute rounded-full"
                style={{ width: 155, height: 155, border: '1px solid rgba(225,29,72,0.2)' }}
                animate={{ scale: [1, 1.04, 1], opacity: [0.5, 0.9, 0.5] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              />
            </>
          )}

          {/* Core */}
          <motion.div
            className="relative rounded-full overflow-hidden"
            style={{
              width: 110, height: 110,
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
                ? '0 0 50px rgba(99,102,241,0.6)'
                : sessionState === 'connected'
                ? '0 0 50px rgba(16,185,129,0.5)'
                : '0 0 50px rgba(225,29,72,0.5)',
              transition: 'background 0.8s, box-shadow 0.8s',
            }}
            animate={
              isAvaSpeaking
                ? { scale: [1, 1.1, 1.05, 1.12, 1], transition: { duration: 0.7, repeat: Infinity } }
                : sessionState === 'connecting'
                ? { scale: [1, 1.06, 1], transition: { duration: 0.6, repeat: Infinity } }
                : { scale: [1, 1.02, 1], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' } }
            }
          >
            <Image src="/logo.png" alt="Ava" width={110} height={110} className="object-cover opacity-90" style={{ borderRadius: '50%' }} />
          </motion.div>
        </div>

        {/* Status */}
        <div className="text-center">
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
            <p className="text-xs mt-1" style={{ color: '#f59e0b' }}>Microphone coupé</p>
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
              style={{ background: '#e11d48', color: '#fff', boxShadow: '0 0 30px rgba(225,29,72,0.4)' }}
            >
              <Phone size={17} /> Démarrer
            </motion.button>
          ) : (
            <>
              <motion.button
                onClick={() => setIsMuted(!isMuted)}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: isMuted ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.07)',
                  border: isMuted ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  color: isMuted ? '#f59e0b' : '#94a3b8',
                }}
              >
                {isMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>

              <motion.button
                onClick={stopSession}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}
              >
                <PhoneOff size={16} /> Terminer
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {transcript.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-y-auto"
            style={{
              maxHeight: '32vh',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(10,18,38,0.8)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="max-w-2xl mx-auto px-4 py-4 space-y-2.5">
              {transcript.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-xs sm:max-w-md rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
                    style={
                      item.role === 'user'
                        ? { background: 'rgba(225,29,72,0.18)', color: '#fda4af', borderBottomRightRadius: 4 }
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
