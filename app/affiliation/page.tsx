import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Clock, Gift, ShieldCheck, Ticket, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Affiliation Ava Trading — Gagnez des mois gratuits',
  description: 'Programme d’affiliation Ava Trading: parrainez des utilisateurs Custom et débloquez des coupons gratuits Ava Trading et Ava Volatility.',
}

const plans = [
  { label: 'Custom Simple', threshold: 10, color: '#38bdf8' },
  { label: 'Custom Pro', threshold: 8, color: '#818cf8' },
  { label: 'Custom Ultra', threshold: 7, color: '#c084fc' },
  { label: 'Custom Max', threshold: 5, color: '#fbbf24' },
]

const rules = [
  'Les filleuls doivent s’inscrire avec votre code de parrainage.',
  'Un filleul compte uniquement après un paiement confirmé, hors essai gratuit.',
  'Les plans ne se mélangent pas: chaque plan a son propre compteur.',
  'Le cycle dure 32 jours à partir du premier paiement qualifié du plan.',
  'Un coupon donne 1 mois gratuit du plan correspondant et expire après 30 jours.',
  'Un seul coupon disponible par plan peut rester en attente avant de démarrer un nouveau cycle.',
]

export default function AffiliationPage() {
  return (
    <main className="min-h-screen bg-[#020617] text-white">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-black tracking-tight">Ava</Link>
        <div className="flex items-center gap-3">
          <Link href="/cgu" className="hidden text-xs font-semibold text-slate-400 transition-colors hover:text-white sm:block">
            Règles
          </Link>
          <Link
            href="/app?tab=referral"
            className="rounded-xl bg-rose-500 px-4 py-2 text-xs font-black text-white transition-colors hover:bg-rose-400"
          >
            Ouvrir mon dashboard
          </Link>
        </div>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-rose-300">
            <Users size={13} />
            Affiliation Ava Trading
          </div>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Invitez des traders, gagnez des mois gratuits.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
            Partagez votre code Ava. Quand vos filleuls activent un plan Custom payant, vous progressez vers un coupon gratuit Ava Trading / Ava Volatility du même niveau.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/app?tab=referral"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-5 text-sm font-black text-slate-950 transition-transform hover:scale-[1.02]"
            >
              Voir mon code
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/app?tab=subscription"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/10 px-5 text-sm font-black text-slate-200 transition-colors hover:bg-white/10"
            >
              Voir les plans Custom
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30">
          <div className="grid gap-3">
            {plans.map(plan => (
              <div key={plan.label} className="rounded-2xl border border-white/10 bg-slate-950/50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black">{plan.label}</p>
                    <p className="mt-1 text-xs text-slate-500">Même plan requis pour débloquer le coupon</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black" style={{ color: plan.color }}>{plan.threshold}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">paiements</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-6xl gap-4 px-6 py-10 md:grid-cols-4">
          {[
            { icon: Gift, title: '1 mois gratuit', text: 'Chaque coupon donne un mois du plan Custom débloqué.' },
            { icon: Ticket, title: 'Coupon transférable', text: 'Utilisez-le vous-même ou envoyez-le à quelqu’un.' },
            { icon: ShieldCheck, title: 'Paiement réel', text: 'Les essais, remboursements et abus ne comptent pas.' },
            { icon: Clock, title: 'Cycles clairs', text: '32 jours pour atteindre le seuil, 30 jours pour utiliser le coupon.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-5">
              <Icon size={19} className="text-rose-300" />
              <p className="mt-4 text-sm font-black">{title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-rose-300">Règles essentielles</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight">Simple à comprendre, contrôlé côté serveur.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-400">
              Les récompenses ne remplacent pas les abonnements payants. Elles créent un accès gratuit temporaire séparé, reconnu par Ava Desktop comme un droit Ava Trading du plan concerné.
            </p>
          </div>
          <div className="grid gap-3">
            {rules.map(rule => (
              <div key={rule} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <Check size={15} className="mt-1 flex-shrink-0 text-emerald-300" />
                <p className="text-sm leading-6 text-slate-300">{rule}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
