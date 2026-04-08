import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog — AI Insights & Comparisons',
  description: 'Compare Ava with other AI tools, discover tips for voice AI productivity, and stay updated on the future of AI assistants.',
  openGraph: {
    title: 'Ava Blog — AI Insights & Comparisons',
    description: 'In-depth comparisons and guides about AI voice assistants.',
    url: 'https://call-ava.com/blog',
    images: [{ url: '/og-image.png', width: 1280, height: 720, alt: 'Ava Blog' }],
  },
}

const POSTS = [
  {
    slug: 'ava-vs-claude-code',
    category: 'Comparison',
    title: 'Ava vs Claude Code: Which AI Assistant Is Right for You?',
    excerpt:
      'Claude Code is powerful for developers. But if you want an AI that works with your voice, controls your Mac, and fits in your pocket — Ava is in a different league entirely.',
    date: 'April 2026',
    readTime: '6 min read',
    accent: '#f43f5e',
  },
  {
    slug: 'ava-vs-openclaw',
    category: 'Comparison',
    title: 'Ava vs OpenClaw: Why Voice-First Wins for Desktop Automation',
    excerpt:
      'Desktop automation tools are impressive, but they still require you to type commands and stay at your desk. Ava lets you control your Mac from anywhere — with just your voice.',
    date: 'April 2026',
    readTime: '5 min read',
    accent: '#818cf8',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen" style={{ background: '#020617' }}>
      {/* Nav */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Ava" className="w-7 h-7 rounded-full object-cover" style={{ objectPosition: 'center 45%' }} />
            <span className="font-black text-white text-sm">Ava</span>
          </Link>
          <span className="text-slate-600 text-xs">/ Blog</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-14">
          <span
            className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest mb-4"
            style={{ background: 'rgba(225,29,72,0.12)', color: '#f43f5e', border: '1px solid rgba(225,29,72,0.2)' }}
          >
            Blog
          </span>
          <h1 className="text-4xl font-black text-white tracking-tight mb-3">AI Insights & Comparisons</h1>
          <p className="text-slate-400 text-lg">
            In-depth guides to help you choose the right AI tools for your workflow.
          </p>
        </div>

        {/* Posts grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          {POSTS.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group rounded-2xl p-6 transition-all hover:scale-[1.01]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
                  style={{ background: `${post.accent}18`, color: post.accent, border: `1px solid ${post.accent}30` }}
                >
                  {post.category}
                </span>
                <span className="text-slate-600 text-xs">{post.readTime}</span>
              </div>
              <h2 className="text-white font-bold text-lg leading-snug mb-3 group-hover:text-rose-400 transition-colors">
                {post.title}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
              <span className="text-xs text-slate-600">{post.date}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] py-8 mt-16">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-slate-600 text-xs text-center">© 2026 Ava — Woonix LTD · 71-75 Shelton Street, London, WC2H 9JQ, UK</p>
        </div>
      </div>
    </div>
  )
}
