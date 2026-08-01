'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { GEMINI_MODEL } from '../constants'
import type { TranscriptItem, SessionState } from '../types'

function resampleTo16k(input: Float32Array, fromRate: number): Float32Array {
  if (fromRate === 16000) return input
  const ratio = fromRate / 16000
  const outputLength = Math.floor(input.length / ratio)
  const output = new Float32Array(outputLength)
  for (let i = 0; i < outputLength; i++) {
    const srcIdx = i * ratio
    const lo = Math.floor(srcIdx)
    const hi = Math.min(lo + 1, input.length - 1)
    const frac = srcIdx - lo
    output[i] = input[lo] * (1 - frac) + input[hi] * frac
  }
  return output
}

function float32ToBase64PCM16(samples: Float32Array): string {
  const int16 = new Int16Array(samples.length)
  for (let i = 0; i < samples.length; i++) {
    int16[i] = Math.max(-32768, Math.min(32767, samples[i] * 32767))
  }
  const uint8 = new Uint8Array(int16.buffer)
  let binary = ''
  for (let i = 0; i < uint8.length; i++) binary += String.fromCharCode(uint8[i])
  return btoa(binary)
}

export interface GeminiLiveOptions {
  language: string
  webSearch: boolean
  memorySummary?: string
  userName?: string
  userId?: string
  memoryWordLimit?: number
  onSessionEnd?: () => void
  onTurnComplete?: (authorizationId: string) => void | Promise<void>
  onMemoryUpdated?: (summary: string) => void
  apiKeyProvider?: () => Promise<{
    token: string
    authorizationId: string
    model: string
    apiVersion: string
    liveConfig: Record<string, any>
  } | null>
}

export function useGeminiLive({
  language, webSearch, memorySummary, userName, userId,
  memoryWordLimit = 800,
  onSessionEnd, onTurnComplete, onMemoryUpdated, apiKeyProvider,
}: GeminiLiveOptions) {
  const [sessionState, setSessionState] = useState<SessionState>('idle')
  const [transcript, setTranscript] = useState<TranscriptItem[]>([])
  const [statusText, setStatusText] = useState('Appuyez pour démarrer')
  const [isAvaSpeaking, setIsAvaSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(0)
  const [errorCode, setErrorCode] = useState('')

  const transcriptRef = useRef<TranscriptItem[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const silentGainRef = useRef<GainNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const nextPlayTimeRef = useRef(0)
  const idCounterRef = useRef(0)
  const isMutedRef = useRef(false)
  const isClosingRef = useRef(false)
  const authorizationIdRef = useRef('')
  const turnCompletedRef = useRef(false)
  const stopSessionRef = useRef<(() => void) | null>(null)

  useEffect(() => { isMutedRef.current = isMuted }, [isMuted])
  useEffect(() => { transcriptRef.current = transcript }, [transcript])

  // PCM playback from Gemini (24000 Hz output)
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

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((raw: string) => {
    let msg: any
    try { msg = JSON.parse(raw) } catch { return }

    if (msg.setupComplete !== undefined) {
      setSessionState('connected')
      setStatusText("J'écoute...")
      return
    }

    const sc = msg.serverContent
    if (!sc) return

    if (sc.interrupted) {
      nextPlayTimeRef.current = audioCtxRef.current?.currentTime ?? 0
      setIsAvaSpeaking(false)
      return
    }

    const audioData = sc.modelTurn?.parts?.[0]?.inlineData?.data ?? sc.audioChunks?.[0]?.data
    if (audioData) {
      setIsAvaSpeaking(true)
      playPCMChunk(audioData)
    }

    if (sc.outputTranscription?.text) {
      const txt = sc.outputTranscription.text
      setTranscript(prev => {
        const last = prev[prev.length - 1]
        if (last?.role === 'ava') return [...prev.slice(0, -1), { ...last, text: last.text + txt }]
        return [...prev, { id: ++idCounterRef.current, role: 'ava', text: txt }]
      })
    }

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
      if (!turnCompletedRef.current) {
        turnCompletedRef.current = true
        isMutedRef.current = true
        setIsMuted(true)
        setStatusText('Réponse terminée')
        void Promise.resolve(onTurnComplete?.(authorizationIdRef.current)).catch(() => {})
        const remainingAudioMs = audioCtxRef.current
          ? Math.max(0, (nextPlayTimeRef.current - audioCtxRef.current.currentTime) * 1000)
          : 0
        window.setTimeout(() => stopSessionRef.current?.(), Math.min(12000, remainingAudioMs + 350))
      }
    }
  }, [playPCMChunk, onTurnComplete])

  const stopSession = useCallback(() => {
    isClosingRef.current = true
    wsRef.current?.close()
    wsRef.current = null
    processorRef.current?.disconnect()
    processorRef.current = null
    sourceRef.current?.disconnect()
    sourceRef.current = null
    silentGainRef.current?.disconnect()
    silentGainRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    nextPlayTimeRef.current = 0
    setSessionState('idle')
    setIsAvaSpeaking(false)
    setIsMuted(false)
    setVolumeLevel(0)
    setStatusText('Appuyez pour démarrer')
    onSessionEnd?.()
    setTimeout(() => { isClosingRef.current = false }, 300)
  }, [onSessionEnd])

  useEffect(() => { stopSessionRef.current = stopSession }, [stopSession])

  // Send image(s) to Gemini during an active session
  const sendImage = useCallback((base64: string, mimeType: string) => {
    const ws = wsRef.current
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({
      realtimeInput: {
        mediaChunks: [{ mimeType, data: base64 }],
      },
    }))
  }, [])

  const apiKeyProviderRef = useRef(apiKeyProvider)
  useEffect(() => { apiKeyProviderRef.current = apiKeyProvider }, [apiKeyProvider])

  const startSession = useCallback(async () => {
    setErrorCode('')
    let authorization: Awaited<ReturnType<NonNullable<typeof apiKeyProvider>>> = null
    try {
      authorization = await apiKeyProviderRef.current?.() ?? null
    } catch (error) {
      const code = error instanceof Error ? error.message : 'AVA_AI_PROVIDER_UNAVAILABLE'
      setErrorCode(code)
      setStatusText(
        code === 'AVA_AI_GLOBAL_BUDGET_REACHED' ? 'Ava AI est temporairement indisponible — aucun achat nécessaire'
          : code === 'SUBSCRIPTION_REQUIRED' ? 'Un abonnement Ava actif est requis'
            : code === 'SESSION_EXPIRED' ? 'Session expirée — reconnectez-vous'
              : code === 'RATE_LIMITED' ? 'Trop de demandes — réessayez dans quelques secondes'
                : code === 'AI_CREDITS_EXHAUSTED' ? 'Crédits Ava AI épuisés'
                  : 'Connexion Ava AI indisponible — réessayez',
      )
      setSessionState('error')
      return
    }
    if (!authorization?.token || !authorization.authorizationId) {
      setStatusText('Jeton Ava AI indisponible — réessayez')
      setSessionState('error')
      return
    }
    authorizationIdRef.current = authorization.authorizationId
    turnCompletedRef.current = false

    setSessionState('connecting')
    setStatusText('Connexion...')
    setTranscript([])
    transcriptRef.current = []
    setIsAvaSpeaking(false)
    isClosingRef.current = false

    // AudioContext — do NOT force sampleRate, browser knows best
    let ctx: AudioContext
    try {
      ctx = new AudioContext()
      await ctx.resume() // critical: unblock audio processing
      audioCtxRef.current = ctx
      nextPlayTimeRef.current = 0
    } catch {
      setStatusText('Navigateur non supporté')
      setSessionState('error')
      return
    }

    // Microphone access
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

    const actualSampleRate = ctx.sampleRate

    // WebSocket — binaryType arraybuffer: browsers default to Blob which we can't handle inline
    const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.${authorization.apiVersion}.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(authorization.token)}`
    const ws = new WebSocket(wsUrl)
    ws.binaryType = 'arraybuffer'
    wsRef.current = ws

    ws.onopen = () => {
      const liveConfig = authorization.liveConfig ?? {}
      const setupPayload: any = {
        setup: {
          model: authorization.model || `models/${GEMINI_MODEL}`,
          generationConfig: {
            responseModalities: liveConfig.responseModalities ?? ['AUDIO'],
            speechConfig: liveConfig.speechConfig,
          },
          systemInstruction: liveConfig.systemInstruction,
          inputAudioTranscription: liveConfig.inputAudioTranscription ?? {},
          outputAudioTranscription: liveConfig.outputAudioTranscription ?? {},
          realtimeInputConfig: liveConfig.realtimeInputConfig,
          contextWindowCompression: liveConfig.contextWindowCompression,
          tools: liveConfig.tools,
        },
      }
      ws.send(JSON.stringify(setupPayload))

      // Audio recording with proper resampling
      const source = ctx.createMediaStreamSource(stream)
      sourceRef.current = source
      const silentGain = ctx.createGain()
      silentGain.gain.value = 0
      silentGainRef.current = silentGain
      const processor = ctx.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        const raw = e.inputBuffer.getChannelData(0)
        // Compute RMS for volume level
        let sum = 0
        for (let i = 0; i < raw.length; i++) sum += raw[i] * raw[i]
        const rms = Math.sqrt(sum / raw.length)
        setVolumeLevel(Math.min(rms * 6, 1))

        if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return
        const resampled = resampleTo16k(raw, actualSampleRate)
        const base64 = float32ToBase64PCM16(resampled)
        ws.send(JSON.stringify({
          realtimeInput: { mediaChunks: [{ mimeType: 'audio/pcm;rate=16000', data: base64 }] },
        }))
      }

      source.connect(processor)
      processor.connect(silentGain)
      silentGain.connect(ctx.destination)
    }

    ws.onmessage = (event) => {
      const d = event.data
      if (typeof d === 'string') {
        handleMessage(d)
      } else if (d instanceof ArrayBuffer) {
        try { handleMessage(new TextDecoder().decode(d)) } catch {}
      } else if (d instanceof Blob) {
        d.text().then(txt => { try { handleMessage(txt) } catch {} }).catch(() => {})
      }
    }

    ws.onerror = () => {
      if (!isClosingRef.current) {
        setStatusText('Erreur de connexion — réessayez')
        setSessionState('error')
      }
    }

    ws.onclose = () => {
      if (!isClosingRef.current) {
        setSessionState('idle')
        setIsAvaSpeaking(false)
        setStatusText('Session terminée — appuyez pour recommencer')
        onSessionEnd?.()
      }
    }
  }, [language, webSearch, memorySummary, userName, handleMessage, stopSession, onSessionEnd])

  return {
    sessionState, transcript, statusText, errorCode, isAvaSpeaking,
    isMuted, setIsMuted, startSession, stopSession, volumeLevel, sendImage,
  }
}
