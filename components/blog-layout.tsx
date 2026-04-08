import Link from 'next/link'

interface Props {
  title: string
  subtitle: string
  date: string
  readTime: string
  category: string
  children: React.ReactNode
}

export default function BlogLayout({ title, subtitle, date, readTime, category, children }: Props) {
  return (
    <div className="min-h-screen" style={{ background: '#020617' }}>
      {/* Nav */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Ava" className="w-7 h-7 rounded-full object-cover" style={{ objectPosition: 'center 45%' }} />
            <span className="font-black text-white text-sm">Ava</span>
          </Link>
          <Link href="/blog" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
            ← All articles
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-6 py-16">
        {/* Meta */}
        <div className="flex items-center gap-3 mb-6">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest"
            style={{ background: 'rgba(225,29,72,0.12)', color: '#f43f5e', border: '1px solid rgba(225,29,72,0.2)' }}
          >
            {category}
          </span>
          <span className="text-slate-500 text-xs">{date}</span>
          <span className="text-slate-600 text-xs">·</span>
          <span className="text-slate-500 text-xs">{readTime}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight mb-4">
          {title}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed mb-12 border-b border-white/[0.06] pb-12">
          {subtitle}
        </p>

        {/* Content */}
        <div className="prose-blog">
          {children}
        </div>

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center"
          style={{ background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.15)' }}
        >
          <p className="text-white font-bold text-xl mb-2">Try Ava for free</p>
          <p className="text-slate-400 text-sm mb-6">No credit card required. 7-day free trial included.</p>
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white transition-all hover:scale-105"
            style={{ background: '#e11d48' }}
          >
            Start for free →
          </Link>
        </div>
      </article>

      {/* Footer */}
      <div className="border-t border-white/[0.06] py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">© 2026 Ava — Woonix LTD</p>
          <div className="flex gap-4">
            {[['Terms', '/cgu'], ['Privacy', '/confidentialite'], ['Refund', '/remboursement']].map(([l, h]) => (
              <Link key={l} href={h} className="text-slate-600 hover:text-slate-400 text-xs transition-colors">{l}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Reusable blog content components ─────────────────────────────────────────

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl font-black text-white mt-12 mb-4">{children}</h2>
}

export function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-bold text-white mt-8 mb-3">{children}</h3>
}

export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 leading-relaxed mb-4">{children}</p>
}

export function Ul({ children }: { children: React.ReactNode }) {
  return <ul className="space-y-2 mb-6">{children}</ul>
}

export function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-slate-400">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#e11d48' }} />
      <span>{children}</span>
    </li>
  )
}

export function Highlight({ children }: { children: React.ReactNode }) {
  return <strong className="text-white font-semibold">{children}</strong>
}

interface CompareRow {
  feature: string
  ava: string | boolean
  other: string | boolean
  avaGood?: boolean
}

export function CompareTable({ rows, otherName }: { rows: CompareRow[]; otherName: string }) {
  return (
    <div className="rounded-2xl overflow-hidden my-8" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      <div
        className="grid grid-cols-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest"
        style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span className="text-slate-500">Feature</span>
        <span style={{ color: '#f43f5e' }}>Ava</span>
        <span className="text-slate-500">{otherName}</span>
      </div>
      {rows.map((row, i) => (
        <div
          key={i}
          className="grid grid-cols-3 px-4 py-3 text-sm"
          style={{ borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
        >
          <span className="text-slate-400">{row.feature}</span>
          <span style={{ color: row.avaGood !== false ? '#34d399' : '#94a3b8' }}>
            {typeof row.ava === 'boolean' ? (row.ava ? '✓ Yes' : '✗ No') : row.ava}
          </span>
          <span className="text-slate-500">
            {typeof row.other === 'boolean' ? (row.other ? '✓ Yes' : '✗ No') : row.other}
          </span>
        </div>
      ))}
    </div>
  )
}
