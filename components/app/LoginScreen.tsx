'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Props {
  onLogin: (identifier: string, pin: string) => Promise<void>
  loading: boolean
  error: string
}

export function LoginScreen({ onLogin, loading, error }: Props) {
  const [identifier, setIdentifier] = useState('')
  const [pin, setPin] = useState('')

  const handleSubmit = () => {
    if (!loading) onLogin(identifier, pin)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
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
          {/* Avatar */}
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
              Ava
            </h1>
            <p className="text-sm mt-1 font-medium" style={{ color: '#64748b' }}>
              Assistante vocale IA
            </p>
          </motion.div>

          {/* Form */}
          <div className="space-y-3">
            {[
              {
                label: 'Email ou identifiant',
                value: identifier,
                setter: setIdentifier,
                type: 'text',
                placeholder: 'votre@email.com ou 62402485',
                delay: 0.15,
              },
              {
                label: 'Code PIN',
                value: pin,
                setter: setPin,
                type: 'password',
                placeholder: '••••••',
                delay: 0.2,
                inputMode: 'numeric' as const,
                maxLen: 6,
                letterSpacing: '0.3em',
              },
            ].map((field) => (
              <motion.div
                key={field.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: field.delay, duration: 0.4 }}
              >
                <label
                  className="block text-[11px] font-bold mb-1.5 uppercase tracking-widest"
                  style={{ color: '#475569' }}
                >
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => {
                    let val = e.target.value
                    if (field.maxLen) val = val.replace(/\D/g, '').slice(0, field.maxLen)
                    field.setter(val)
                  }}
                  onKeyDown={handleKey}
                  placeholder={field.placeholder}
                  inputMode={field.inputMode}
                  style={{
                    width: '100%',
                    padding: '13px 16px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: '#f8fafc',
                    fontSize: 15,
                    outline: 'none',
                    letterSpacing: field.letterSpacing,
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                  onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')}
                />
              </motion.div>
            ))}

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm"
                style={{ color: '#f43f5e' }}
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              onClick={handleSubmit}
              disabled={loading}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm mt-1"
              style={{
                background: loading ? 'rgba(225,29,72,0.5)' : '#e11d48',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 24px rgba(225,29,72,0.4)',
                transition: 'background 0.2s, box-shadow 0.2s',
              }}
            >
              {loading ? (
                <span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                />
              ) : (
                <>
                  Se connecter <ArrowRight size={15} />
                </>
              )}
            </motion.button>
          </div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-1.5 mt-6 text-xs"
            style={{ color: '#334155' }}
          >
            <Lock size={11} />
            <span>Utilisez vos identifiants de l&apos;appli Ava mobile</span>
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
