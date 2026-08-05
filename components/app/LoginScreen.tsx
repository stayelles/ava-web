'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

type MfaPrompt = { required: boolean; qrCode?: string; secret?: string }

interface Props {
  loading: boolean
  error: string
  onOtpRequest: (email: string) => Promise<{ ok: boolean; error?: string }>
  onOtpVerify: (email: string, code: string) => Promise<{ ok: boolean; error?: string; mfa?: MfaPrompt }>
  onMfaVerify: (code: string) => Promise<{ ok: boolean; error?: string }>
}

type Step = 'email' | 'otp' | 'mfa'

export function LoginScreen({ loading, error, onOtpRequest, onOtpVerify, onMfaVerify }: Props) {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [localError, setLocalError] = useState('')
  const [mfa, setMfa] = useState<MfaPrompt | null>(null)

  const submit = async () => {
    setLocalError('')
    if (step === 'email') {
      if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setLocalError('Entrez une adresse e-mail valide.')
      const result = await onOtpRequest(email)
      if (result.ok) {
        setCode('')
        setStep('otp')
      } else setLocalError(result.error ?? '')
      return
    }
    if (!/^\d{6}$/.test(code)) return setLocalError('Le code doit contenir 6 chiffres.')
    if (step === 'otp') {
      const result = await onOtpVerify(email, code)
      if (result.mfa?.required) {
        setMfa(result.mfa)
        setCode('')
        setStep('mfa')
      } else if (!result.ok) setLocalError(result.error ?? '')
      return
    }
    const result = await onMfaVerify(code)
    if (!result.ok) setLocalError(result.error ?? '')
  }

  const title = step === 'email' ? 'Connexion sécurisée' : step === 'otp' ? 'Vérifiez votre e-mail' : 'Protection administrateur'
  const subtitle = step === 'email'
    ? 'Aucun mot de passe ni PIN permanent'
    : step === 'otp'
      ? `Code envoyé à ${email.trim()}`
      : 'Authentification TOTP obligatoire'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#020617]">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_35%,rgba(225,29,72,0.09),transparent_65%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-sm rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-9 backdrop-blur-2xl"
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 h-[88px] w-[88px] overflow-hidden rounded-full shadow-[0_0_60px_rgba(225,29,72,0.45)]">
            <Image src="/logo.png" alt="Ava" width={88} height={88} className="h-full w-full object-cover" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">{subtitle}</p>
        </div>

        {step === 'mfa' && mfa?.qrCode && (
          <div className="mb-5 rounded-2xl border border-rose-400/20 bg-rose-400/[0.06] p-4 text-center">
            <p className="mb-3 text-xs leading-relaxed text-slate-300">
              Scannez ce QR code avec votre application d’authentification, puis saisissez le code à six chiffres.
            </p>
            {/* Supabase returns a data URL for the enrollment QR code. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mfa.qrCode} alt="QR code TOTP Ava" className="mx-auto h-44 w-44 rounded-xl bg-white p-2" />
            {mfa.secret && <p className="mt-3 break-all font-mono text-[10px] text-slate-500">Clé manuelle : {mfa.secret}</p>}
          </div>
        )}

        <div className="space-y-3">
          {step === 'email' ? (
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-600">E-mail</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={17} />
                <input
                  type="email" value={email} onChange={event => setEmail(event.target.value)}
                  onKeyDown={event => event.key === 'Enter' && void submit()}
                  autoComplete="email" placeholder="votre@email.com"
                  className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.05] py-3.5 pl-11 pr-4 text-[15px] text-slate-50 outline-none transition focus:border-rose-500/50"
                />
              </div>
            </label>
          ) : (
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-600">
                {step === 'otp' ? 'Code e-mail' : 'Code TOTP'}
              </span>
              <div className="relative">
                {step === 'otp'
                  ? <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={17} />
                  : <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={17} />}
                <input
                  type="text" inputMode="numeric" autoComplete="one-time-code"
                  value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={event => event.key === 'Enter' && void submit()}
                  placeholder="000000"
                  className="w-full rounded-2xl border border-white/[0.09] bg-white/[0.05] py-3.5 pl-11 pr-4 font-mono text-lg tracking-[0.28em] text-slate-50 outline-none transition focus:border-rose-500/50"
                />
              </div>
            </label>
          )}

          {(localError || error) && <p className="text-sm text-rose-400">{localError || error}</p>}

          <button
            onClick={() => void submit()} disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-rose-600 py-3.5 text-sm font-bold text-white shadow-[0_4px_24px_rgba(225,29,72,0.35)] transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : <>{step === 'email' ? 'Recevoir le code' : 'Continuer'} <ArrowRight size={15} /></>}
          </button>

          {step !== 'email' && (
            <button
              onClick={() => { setStep('email'); setCode(''); setMfa(null); setLocalError('') }}
              className="w-full pt-2 text-xs font-semibold text-slate-500 hover:text-slate-300"
            >
              Utiliser une autre adresse
            </button>
          )}
        </div>

        <div className="mt-7 flex gap-3 rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-3.5">
          <ShieldCheck className="mt-0.5 shrink-0 text-emerald-400" size={17} />
          <p className="text-[11px] leading-relaxed text-slate-500">
            Les anciens PIN ont été retirés. Le code e-mail est temporaire et les comptes privilégiés exigent une seconde vérification TOTP.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
