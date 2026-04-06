import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface Props {
  title: string
  children: React.ReactNode
  updatedAt?: string
}

export default function LegalLayout({ title, children, updatedAt }: Props) {
  return (
    <div className="min-h-screen" style={{ background: '#020617', color: '#f8fafc' }}>
      {/* Top nav */}
      <nav
        className="fixed top-0 inset-x-0 z-50 flex items-center gap-3 px-6 h-14"
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-sm transition-colors hover:text-white"
          style={{ color: '#94a3b8' }}
        >
          <ArrowLeft size={15} />
          <span>call-ava.com</span>
        </Link>
        <span style={{ color: '#334155' }}>|</span>
        <span className="text-sm font-medium" style={{ color: '#f8fafc' }}>{title}</span>
      </nav>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 pt-24 pb-24">
        <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: '#fff' }}>{title}</h1>
        {updatedAt && (
          <p className="text-sm mb-10" style={{ color: '#64748b' }}>Dernière mise à jour : {updatedAt}</p>
        )}
        <div className="space-y-10">{children}</div>
      </main>

      {/* Footer */}
      <footer
        className="py-8 px-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap gap-6 text-xs" style={{ color: '#475569' }}>
          <span>© {new Date().getFullYear()} Ava — Woonix LTD</span>
          <Link href="/cgu" className="hover:text-slate-300 transition-colors">Conditions d&apos;utilisation</Link>
          <Link href="/confidentialite" className="hover:text-slate-300 transition-colors">Confidentialité</Link>
          <Link href="/support" className="hover:text-slate-300 transition-colors">Support</Link>
          <Link href="/supprimer-compte" className="hover:text-slate-300 transition-colors">Supprimer mon compte</Link>
        </div>
      </footer>
    </div>
  )
}

export function LegalSection({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold mb-3" style={{ color: '#f1f5f9' }}>
        <span style={{ color: '#e11d48' }} className="mr-2">{n}.</span>{title}
      </h2>
      <div className="text-base leading-relaxed space-y-2" style={{ color: '#94a3b8' }}>
        {children}
      </div>
    </section>
  )
}
