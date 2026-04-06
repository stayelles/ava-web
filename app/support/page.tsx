'use client'

import type { Metadata } from 'next'
import { useState } from 'react'
import LegalLayout from '@/components/legal-layout'
import { Send, CheckCircle } from 'lucide-react'

const SUPABASE_URL = 'https://bmcvyvyjqxehwmkddtya.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtY3Z5dnlqcXhlaHdta2RkdHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTMwMDcsImV4cCI6MjA2MjUyOTAwN30.Q4OppbvjThogFPlldXjkx5WlbI7FkVvClClThEL6ejY'

export default function SupportPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/contact-support`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        // Fallback: mailto link
        window.location.href = `mailto:contact@call-ava.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Nom: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`
        setSuccess(true)
      }
    } catch {
      window.location.href = `mailto:contact@call-ava.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`Nom: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)}`
      setSuccess(true)
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#f8fafc',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <LegalLayout title="Support">
      {success ? (
        <div
          className="flex flex-col items-center gap-4 py-16 text-center"
          style={{ color: '#94a3b8' }}
        >
          <CheckCircle size={48} style={{ color: '#10b981' }} />
          <h2 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>
            Message envoyé !
          </h2>
          <p>Notre équipe vous répondra sous 24–48 heures à {form.email}.</p>
          <p>
            Vous pouvez aussi nous contacter directement :{' '}
            <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>
              contact@call-ava.com
            </a>
          </p>
        </div>
      ) : (
        <div className="max-w-xl">
          <p className="mb-8 text-base" style={{ color: '#94a3b8' }}>
            Une question, un problème technique ou une suggestion ? Notre équipe vous répond sous
            24–48 heures. Vous pouvez aussi nous écrire directement à{' '}
            <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>
              contact@call-ava.com
            </a>
            .
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>
                  Nom
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>
                Sujet
              </label>
              <input
                type="text"
                value={form.subject}
                onChange={e => setForm({ ...form, subject: e.target.value })}
                placeholder="Objet de votre message"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>
                Message
              </label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Décrivez votre problème ou question..."
                rows={6}
                style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(225,29,72,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: '#f43f5e' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: loading ? 'rgba(225,29,72,0.5)' : '#e11d48',
                color: '#fff',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Send size={16} />
              {loading ? 'Envoi...' : 'Envoyer le message'}
            </button>
          </form>
        </div>
      )}
    </LegalLayout>
  )
}
