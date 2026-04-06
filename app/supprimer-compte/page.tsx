'use client'

import { useState } from 'react'
import LegalLayout from '@/components/legal-layout'
import { Trash2, CheckCircle, AlertTriangle } from 'lucide-react'

const SUPABASE_URL = 'https://bmcvyvyjqxehwmkddtya.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtY3Z5dnlqcXhlaHdta2RkdHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5NTMwMDcsImV4cCI6MjA2MjUyOTAwN30.Q4OppbvjThogFPlldXjkx5WlbI7FkVvClClThEL6ejY'

export default function DeleteAccountPage() {
  const [form, setForm] = useState({ identifier: '', reason: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.identifier) {
      setError('Veuillez entrer votre identifiant ou email.')
      return
    }
    if (!confirmed) {
      setError('Veuillez confirmer que vous comprenez que cette action est irréversible.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/request-account-deletion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ identifier: form.identifier, reason: form.reason }),
      })
      if (res.ok) {
        setSuccess(true)
      } else {
        const fallbackSubject = 'Demande de suppression de compte Ava'
        const fallbackBody = `Identifiant/Email: ${form.identifier}\n\nRaison: ${form.reason || 'Non précisée'}`
        window.location.href = `mailto:contact@call-ava.com?subject=${encodeURIComponent(fallbackSubject)}&body=${encodeURIComponent(fallbackBody)}`
        setSuccess(true)
      }
    } catch {
      const fallbackSubject = 'Demande de suppression de compte Ava'
      const fallbackBody = `Identifiant/Email: ${form.identifier}\n\nRaison: ${form.reason || 'Non précisée'}`
      window.location.href = `mailto:contact@call-ava.com?subject=${encodeURIComponent(fallbackSubject)}&body=${encodeURIComponent(fallbackBody)}`
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
    <LegalLayout title="Supprimer mon compte">
      {success ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center" style={{ color: '#94a3b8' }}>
          <CheckCircle size={48} style={{ color: '#10b981' }} />
          <h2 className="text-xl font-bold" style={{ color: '#f1f5f9' }}>Demande reçue</h2>
          <p>
            Votre demande de suppression a été transmise. Toutes vos données seront effacées sous 48 heures.
          </p>
          <p className="text-sm">Cette action est irréversible.</p>
        </div>
      ) : (
        <div className="max-w-xl">
          {/* Warning */}
          <div
            className="flex gap-3 p-4 rounded-xl mb-8"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
            <div>
              <p className="font-semibold text-sm mb-1" style={{ color: '#fca5a5' }}>
                Action irréversible
              </p>
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                La suppression de votre compte entraîne la perte définitive de toutes vos données :
                historique de conversations, mémoire, crédits, parrainage. Cette action ne peut pas
                être annulée.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>
                Identifiant ou email du compte
              </label>
              <input
                type="text"
                value={form.identifier}
                onChange={e => setForm({ ...form, identifier: e.target.value })}
                placeholder="Votre email ou identifiant Ava"
                style={inputStyle}
                onFocus={e => (e.target.style.borderColor = 'rgba(239,68,68,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: '#64748b' }}>
                Raison (optionnel)
              </label>
              <textarea
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="Pourquoi souhaitez-vous supprimer votre compte ?"
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
                onFocus={e => (e.target.style.borderColor = 'rgba(239,68,68,0.5)')}
                onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="mt-1 flex-shrink-0"
                style={{ accentColor: '#e11d48' }}
              />
              <span className="text-sm" style={{ color: '#94a3b8' }}>
                Je comprends que la suppression de mon compte est définitive et irréversible, et
                que toutes mes données seront effacées.
              </span>
            </label>

            {error && (
              <p className="text-sm" style={{ color: '#f43f5e' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || !confirmed}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: loading || !confirmed ? 'rgba(239,68,68,0.3)' : '#ef4444',
                color: '#fff',
                cursor: loading || !confirmed ? 'not-allowed' : 'pointer',
              }}
            >
              <Trash2 size={16} />
              {loading ? 'Envoi en cours...' : 'Supprimer mon compte'}
            </button>
          </form>
        </div>
      )}
    </LegalLayout>
  )
}
