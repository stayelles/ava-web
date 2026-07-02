'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Lock, Eye, EyeOff, Mail, Shield, UserPlus, Gift, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  onLogin: (identifier: string, pin: string) => Promise<void>
  loading: boolean
  error: string
  onRegisterRequest: (email: string, pin: string, lang?: string, referralCode?: string) => Promise<{ ok: boolean; error?: string }>
  onRegisterVerify: (email: string, code: string, pin: string) => Promise<{ ok: boolean; error?: string }>
  onPinResetRequest: (email: string) => Promise<{ ok: boolean; error?: string }>
  onPinResetConfirm: (email: string, token: string, pin: string) => Promise<{ ok: boolean; error?: string }>
}

type AuthMode = 'login' | 'signup' | 'otp' | 'reset-request' | 'reset-confirm'

export function LoginScreen({ onLogin, loading, error, onRegisterRequest, onRegisterVerify, onPinResetRequest, onPinResetConfirm }: Props) {
  const [mode, setMode] = useState<AuthMode>('login')
  const [identifier, setIdentifier] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)

  // Signup fields
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPin, setSignupPin] = useState('')
  const [showSignupPin, setShowSignupPin] = useState(false)
  const [referralCode, setReferralCode] = useState('')
  const [showReferralInput, setShowReferralInput] = useState(false)
  
  // OTP fields
  const [otpCode, setOtpCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  
  // Local loading/error states for registration
  const [localLoading, setLocalLoading] = useState(false)
  const [localError, setLocalError] = useState('')
  const [localSuccess, setLocalSuccess] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [resetPin, setResetPin] = useState('')
  const [resetPinConfirm, setResetPinConfirm] = useState('')
  const [showResetPin, setShowResetPin] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('pin_token')
    const email = params.get('email')
    if (token && email) {
      setResetToken(token)
      setResetEmail(email)
      setMode('reset-confirm')
      setLocalError('')
      setLocalSuccess('')
    }
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleLoginSubmit = () => {
    if (!loading) onLogin(identifier, pin)
  }

  const handleSignupSubmit = async () => {
    const email = signupEmail.trim()
    const pin = signupPin.trim()
    if (!email || !pin) return
    if (!/^\d{4,5}$/.test(pin)) {
      setLocalError('Le PIN doit contenir entre 4 et 5 chiffres')
      return
    }
    setLocalLoading(true)
    setLocalError('')
    try {
      const res = await onRegisterRequest(email, pin, 'fr', referralCode.trim() || undefined)
      if (!res.ok) {
        setLocalError(res.error || 'Erreur lors de la création du compte')
      } else {
        setOtpCode('')
        setResendCooldown(60)
        setMode('otp')
      }
    } catch {
      setLocalError('Erreur de connexion. Réessayez.')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleOtpSubmit = async () => {
    const code = otpCode.trim()
    if (code.length !== 6) return
    setLocalLoading(true)
    setLocalError('')
    try {
      const res = await onRegisterVerify(signupEmail.trim(), code, signupPin.trim())
      if (!res.ok) {
        setLocalError(res.error || 'Code incorrect ou expiré')
      }
      // Note: onRegisterVerify automatically logs user in via useUserData logic if successful
    } catch {
      setLocalError('Erreur de vérification. Réessayez.')
    } finally {
      setLocalLoading(false)
    }
  }

  const handlePinResetRequest = async () => {
    const email = resetEmail.trim()
    if (!email) return
    setLocalLoading(true)
    setLocalError('')
    setLocalSuccess('')
    try {
      const res = await onPinResetRequest(email)
      if (!res.ok) {
        setLocalError(res.error || 'Impossible d’envoyer le lien')
      } else {
        setLocalSuccess('Si ce compte existe, un lien sécurisé vient d’être envoyé par e-mail.')
      }
    } catch {
      setLocalError('Erreur de connexion. Réessayez.')
    } finally {
      setLocalLoading(false)
    }
  }

  const handlePinResetConfirm = async () => {
    const email = resetEmail.trim()
    const token = resetToken.trim()
    const newPin = resetPin.trim()
    if (!email || !token || !newPin) return
    if (newPin !== resetPinConfirm.trim()) {
      setLocalError('Les deux codes PIN ne correspondent pas')
      return
    }
    if (!/^\d{4,5}$/.test(newPin)) {
      setLocalError('Le PIN doit contenir entre 4 et 5 chiffres')
      return
    }
    setLocalLoading(true)
    setLocalError('')
    setLocalSuccess('')
    try {
      const res = await onPinResetConfirm(email, token, newPin)
      if (!res.ok) {
        setLocalError(res.error || 'Lien invalide ou expiré')
      } else {
        setIdentifier(email)
        setPin('')
        setLocalSuccess('PIN mis à jour. Vous pouvez vous connecter avec votre nouveau code.')
        setMode('login')
        window.history.replaceState({}, '', window.location.pathname)
      }
    } catch {
      setLocalError('Erreur de connexion. Réessayez.')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return
    setLocalLoading(true)
    setLocalError('')
    try {
      const res = await onRegisterRequest(signupEmail.trim(), signupPin.trim())
      if (!res.ok) {
        setLocalError(res.error || 'Impossible de renvoyer le code')
      } else {
        setResendCooldown(60)
      }
    } catch {
      setLocalError('Erreur de connexion. Réessayez.')
    } finally {
      setLocalLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (mode === 'login') handleLoginSubmit()
      else if (mode === 'signup') handleSignupSubmit()
      else if (mode === 'otp') handleOtpSubmit()
      else if (mode === 'reset-request') handlePinResetRequest()
      else if (mode === 'reset-confirm') handlePinResetConfirm()
    }
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setLocalError('')
    setLocalSuccess('')
    setOtpCode('')
  }

  const activeError = mode === 'login' ? error : localError
  const activeLoading = mode === 'login' ? loading : localLoading

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: '#020617' }}
    >
      {/* Background glows */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 35%, rgba(225,29,72,0.09) 0%, transparent 65%)',
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        {/* Card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            borderRadius: 28,
            padding: '40px 36px',
          }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="flex flex-col items-center mb-9"
          >
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                overflow: 'hidden',
                marginBottom: 16,
                boxShadow: '0 0 60px rgba(225,29,72,0.5), 0 0 120px rgba(225,29,72,0.15)',
              }}
            >
              <Image
                src="/logo.png"
                alt="Ava"
                width={88}
                height={88}
                className="object-cover w-full h-full"
              />
            </div>
            <h1
              className="text-2xl font-black tracking-tight"
              style={{ color: '#fff', letterSpacing: '-0.03em' }}
            >
              {mode === 'login' ? 'Connexion' : mode === 'signup' ? 'Créer un compte' : mode === 'otp' ? 'Vérification' : mode === 'reset-request' ? 'Réinitialiser le PIN' : 'Créer votre PIN'}
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#64748b' }}>
              {mode === 'login' ? 'Accédez à votre assistant vocal' : mode === 'signup' ? 'Rejoignez Ava en quelques secondes' : mode === 'otp' ? 'Entrez le code envoyé par e-mail' : mode === 'reset-request' ? 'Recevez un lien sécurisé par e-mail' : 'Choisissez un nouveau code sécurisé'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {/* Mode Connexion */}
            {mode === 'login' && (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                    Email
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="votre@email.com"
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: '#f8fafc',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                    Code PIN
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={handleKey}
                      placeholder="••••••"
                      inputMode="numeric"
                      style={{
                        width: '100%',
                        padding: '13px 44px 13px 16px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#f8fafc',
                        fontSize: 15,
                        outline: 'none',
                        letterSpacing: showPin ? '0.1em' : '0.3em',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(v => !v)}
                      style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: 'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      tabIndex={-1}
                    >
                      {showPin ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {activeError && (
                  <p className="text-sm pt-1" style={{ color: '#f43f5e' }}>
                    {activeError}
                  </p>
                )}

                {localSuccess && (
                  <p className="text-sm pt-1" style={{ color: '#34d399' }}>
                    {localSuccess}
                  </p>
                )}

                <button
                  onClick={handleLoginSubmit}
                  disabled={activeLoading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm mt-2"
                  style={{
                    background: activeLoading ? 'rgba(225,29,72,0.5)' : '#e11d48',
                    color: '#fff',
                    cursor: activeLoading ? 'not-allowed' : 'pointer',
                    boxShadow: activeLoading ? 'none' : '0 4px 24px rgba(225,29,72,0.4)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  {activeLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Se connecter <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/[0.04] mt-4 text-xs">
                  <span style={{ color: '#64748b' }}>Pas encore de compte ?</span>
                  <button
                    onClick={() => switchMode('signup')}
                    className="font-bold hover:underline"
                    style={{ color: '#e11d48' }}
                  >
                    Créer un compte
                  </button>
                </div>
                <button
                  onClick={() => {
                    setResetEmail(identifier.includes('@') ? identifier : '')
                    switchMode('reset-request')
                  }}
                  className="w-full text-xs font-semibold hover:underline"
                  style={{ color: '#64748b' }}
                >
                  PIN oublié ?
                </button>
              </motion.div>
            )}

            {/* Mode Inscription */}
            {mode === 'signup' && (
              <motion.div
                key="signup-form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="votre@email.com"
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: '#f8fafc',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                    Code PIN de sécurité (4-5 chiffres)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignupPin ? 'text' : 'password'}
                      value={signupPin}
                      onChange={(e) => setSignupPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      onKeyDown={handleKey}
                      placeholder="•••••"
                      inputMode="numeric"
                      style={{
                        width: '100%',
                        padding: '13px 44px 13px 16px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#f8fafc',
                        fontSize: 15,
                        outline: 'none',
                        letterSpacing: showSignupPin ? '0.1em' : '0.3em',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPin(v => !v)}
                      style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: 'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      tabIndex={-1}
                    >
                      {showSignupPin ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {!showReferralInput ? (
                  <button
                    onClick={() => setShowReferralInput(true)}
                    className="text-xs hover:underline flex items-center gap-1 font-semibold"
                    style={{ color: '#e11d48' }}
                  >
                    <Gift size={12} /> J&apos;ai un code de parrainage
                  </button>
                ) : (
                  <div>
                    <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                      Code de parrainage
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      onKeyDown={handleKey}
                      placeholder="CODE123"
                      style={{
                        width: '100%',
                        padding: '13px 16px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#f8fafc',
                        fontSize: 15,
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                    />
                  </div>
                )}

                {activeError && (
                  <p className="text-sm pt-1" style={{ color: '#f43f5e' }}>
                    {activeError}
                  </p>
                )}

                <button
                  onClick={handleSignupSubmit}
                  disabled={activeLoading || !signupEmail || !signupPin}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm mt-2"
                  style={{
                    background: activeLoading || !signupEmail || !signupPin ? 'rgba(225,29,72,0.5)' : '#e11d48',
                    color: '#fff',
                    cursor: activeLoading || !signupEmail || !signupPin ? 'not-allowed' : 'pointer',
                    boxShadow: activeLoading || !signupEmail || !signupPin ? 'none' : '0 4px 24px rgba(225,29,72,0.4)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  {activeLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Créer un compte <UserPlus size={15} />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/[0.04] mt-4 text-xs">
                  <span style={{ color: '#64748b' }}>Déjà inscrit ?</span>
                  <button
                    onClick={() => switchMode('login')}
                    className="font-bold hover:underline"
                    style={{ color: '#e11d48' }}
                  >
                    Se connecter
                  </button>
                </div>
              </motion.div>
            )}

            {/* Mode OTP */}
            {mode === 'otp' && (
              <motion.div
                key="otp-form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-xs text-slate-400 text-center leading-relaxed">
                  Un code de vérification à 6 chiffres a été envoyé par e-mail à :<br />
                  <strong className="text-white font-bold block mt-1">{signupEmail}</strong>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest text-center" style={{ color: '#475569' }}>
                    Code de validation
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    onKeyDown={handleKey}
                    placeholder="••••••"
                    maxLength={6}
                    inputMode="numeric"
                    className="text-center font-bold tracking-[0.25em]"
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: '#f8fafc',
                      fontSize: 24,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                {activeError && (
                  <p className="text-sm text-center pt-1" style={{ color: '#f43f5e' }}>
                    {activeError}
                  </p>
                )}

                <button
                  onClick={handleOtpSubmit}
                  disabled={activeLoading || otpCode.length !== 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm mt-2"
                  style={{
                    background: activeLoading || otpCode.length !== 6 ? 'rgba(225,29,72,0.5)' : '#e11d48',
                    color: '#fff',
                    cursor: activeLoading || otpCode.length !== 6 ? 'not-allowed' : 'pointer',
                    boxShadow: activeLoading || otpCode.length !== 6 ? 'none' : '0 4px 24px rgba(225,29,72,0.4)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  {activeLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Confirmer le code <ArrowRight size={15} />
                    </>
                  )}
                </button>

                <div className="flex flex-col items-center gap-3 pt-2">
                  <button
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0 || activeLoading}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: '#e11d48' }}
                  >
                    {resendCooldown > 0
                      ? `Renvoyer le code dans ${resendCooldown}s`
                      : 'Renvoyer le code par e-mail'}
                  </button>

                  <button
                    onClick={() => switchMode('signup')}
                    className="text-xs hover:underline flex items-center gap-1 mt-1 font-semibold"
                    style={{ color: '#64748b' }}
                  >
                    <ArrowLeft size={12} /> Modifier l&apos;adresse e-mail
                  </button>
                </div>
              </motion.div>
            )}

            {/* Mode demande reset PIN */}
            {mode === 'reset-request' && (
              <motion.div
                key="reset-request-form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                    E-mail du compte
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="votre@email.com"
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: '#f8fafc',
                      fontSize: 15,
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                {activeError && <p className="text-sm pt-1" style={{ color: '#f43f5e' }}>{activeError}</p>}
                {localSuccess && <p className="text-sm pt-1" style={{ color: '#34d399' }}>{localSuccess}</p>}

                <button
                  onClick={handlePinResetRequest}
                  disabled={activeLoading || !resetEmail}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm mt-2"
                  style={{
                    background: activeLoading || !resetEmail ? 'rgba(225,29,72,0.5)' : '#e11d48',
                    color: '#fff',
                    cursor: activeLoading || !resetEmail ? 'not-allowed' : 'pointer',
                    boxShadow: activeLoading || !resetEmail ? 'none' : '0 4px 24px rgba(225,29,72,0.4)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  {activeLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Envoyer le lien <Mail size={15} /></>}
                </button>

                <button
                  onClick={() => switchMode('login')}
                  className="w-full text-xs hover:underline flex items-center justify-center gap-1 mt-1 font-semibold"
                  style={{ color: '#64748b' }}
                >
                  <ArrowLeft size={12} /> Retour à la connexion
                </button>
              </motion.div>
            )}

            {/* Mode confirmation reset PIN */}
            {mode === 'reset-confirm' && (
              <motion.div
                key="reset-confirm-form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-2xl text-xs text-slate-400 text-center leading-relaxed">
                  Lien sécurisé détecté pour :<br />
                  <strong className="text-white font-bold block mt-1">{resetEmail}</strong>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                    Nouveau code PIN
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showResetPin ? 'text' : 'password'}
                      value={resetPin}
                      onChange={(e) => setResetPin(e.target.value.replace(/\D/g, '').slice(0, 5))}
                      onKeyDown={handleKey}
                      placeholder="•••••"
                      inputMode="numeric"
                      style={{
                        width: '100%',
                        padding: '13px 44px 13px 16px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        color: '#f8fafc',
                        fontSize: 15,
                        outline: 'none',
                        letterSpacing: showResetPin ? '0.1em' : '0.3em',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPin(v => !v)}
                      style={{
                        position: 'absolute',
                        right: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        color: 'rgba(255,255,255,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      tabIndex={-1}
                    >
                      {showResetPin ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest" style={{ color: '#475569' }}>
                    Confirmer le code PIN
                  </label>
                  <input
                    type={showResetPin ? 'text' : 'password'}
                    value={resetPinConfirm}
                    onChange={(e) => setResetPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    onKeyDown={handleKey}
                    placeholder="•••••"
                    inputMode="numeric"
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      color: '#f8fafc',
                      fontSize: 15,
                      outline: 'none',
                      letterSpacing: showResetPin ? '0.1em' : '0.3em',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                  />
                </div>

                {activeError && <p className="text-sm pt-1" style={{ color: '#f43f5e' }}>{activeError}</p>}

                <button
                  onClick={handlePinResetConfirm}
                  disabled={activeLoading || !resetPin || resetPin.length < 4 || resetPin !== resetPinConfirm}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm mt-2"
                  style={{
                    background: activeLoading || !resetPin || resetPin.length < 4 || resetPin !== resetPinConfirm ? 'rgba(225,29,72,0.5)' : '#e11d48',
                    color: '#fff',
                    cursor: activeLoading || !resetPin || resetPin.length < 4 || resetPin !== resetPinConfirm ? 'not-allowed' : 'pointer',
                    boxShadow: activeLoading || !resetPin || resetPin.length < 4 || resetPin !== resetPinConfirm ? 'none' : '0 4px 24px rgba(225,29,72,0.4)',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  {activeLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Mettre à jour le PIN <Shield size={15} /></>}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-1.5 mt-6 text-xs text-center justify-center"
            style={{ color: '#334155' }}
          >
            <Lock size={11} />
            <span>Sécurisé de bout en bout</span>
          </motion.div>
        </div>

        {/* Bottom links */}
        <div
          className="flex justify-center flex-wrap gap-5 mt-5 text-xs"
          style={{ color: '#334155' }}
        >
          <Link href="/" className="hover:text-slate-400 transition-colors">Accueil</Link>
          <Link href="/cgu" className="hover:text-slate-400 transition-colors">CGU</Link>
          <Link href="/confidentialite" className="hover:text-slate-400 transition-colors">Confidentialité</Link>
          <Link href="/support" className="hover:text-slate-400 transition-colors">Support</Link>
        </div>
      </motion.div>
    </div>
  )
}
