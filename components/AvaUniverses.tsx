'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowUpRight, ChartNoAxesCombined, Gamepad2 } from 'lucide-react'

const COPY = {
  fr: {
    label: 'L’univers Ava', title: 'Deux nouveaux horizons.',
    intro: 'Le jeu et les marchés, chacun dans son espace. Choisissez votre prochaine expérience.',
    atlasLabel: 'Ava Game · Jeu de cartes', atlasTitle: 'Le monde devient votre arène.',
    atlasText: 'Collectionnez des villes, composez votre deck et défiez vos rivaux. Faites évoluer vos cartes et donnez-leur votre style.',
    atlasCta: 'Jouer à Ava Atlas', atlasStatus: 'Disponible',
    marketLabel: 'Ava Market · Marchés', marketTitle: 'Un autre regard sur les marchés.',
    marketText: 'Découvrez l’univers Ava Market et suivez la préparation de sa plateforme de trading. Rejoignez la communauté avant son ouverture.',
    marketCta: 'Découvrir Ava Market', marketStatus: 'Pré-lancement',
    atlasAlt: 'Une cité fantastique et des cartes de collection dans l’univers Ava Atlas',
    marketAlt: 'Une illustration de marchés numériques et de graphiques de trading',
    note: 'Chaque espace s’ouvre dans un nouvel onglet.',
  },
  en: {
    label: 'The Ava universe', title: 'Two new horizons.',
    intro: 'Games and markets, each with a space of its own. Choose your next experience.',
    atlasLabel: 'Ava Game · Card game', atlasTitle: 'The world becomes your arena.',
    atlasText: 'Collect cities, build your deck and challenge your rivals. Evolve your cards and make them your own.',
    atlasCta: 'Play Ava Atlas', atlasStatus: 'Available',
    marketLabel: 'Ava Market · Markets', marketTitle: 'A fresh perspective on markets.',
    marketText: 'Explore Ava Market and follow the preparation of its trading platform. Join the community ahead of launch.',
    marketCta: 'Explore Ava Market', marketStatus: 'Prelaunch',
    atlasAlt: 'A fantasy city and collectible cards in the Ava Atlas universe',
    marketAlt: 'An illustration of digital markets and trading charts',
    note: 'Each experience opens in a new tab.',
  },
  de: {
    label: 'Das Ava Universum', title: 'Zwei neue Horizonte.',
    intro: 'Spiele und Märkte, jeweils in ihrem eigenen Bereich. Entdecken Sie Ihr nächstes Erlebnis.',
    atlasLabel: 'Ava Game · Kartenspiel', atlasTitle: 'Die Welt wird zu Ihrer Arena.',
    atlasText: 'Sammeln Sie Städte, bauen Sie Ihr Deck und fordern Sie Ihre Rivalen heraus. Entwickeln Sie Ihre Karten weiter und gestalten Sie sie individuell.',
    atlasCta: 'Ava Atlas spielen', atlasStatus: 'Verfügbar',
    marketLabel: 'Ava Market · Märkte', marketTitle: 'Ein neuer Blick auf die Märkte.',
    marketText: 'Entdecken Sie Ava Market und verfolgen Sie die Vorbereitung der Trading-Plattform. Werden Sie vor dem Start Teil der Community.',
    marketCta: 'Ava Market entdecken', marketStatus: 'Vor dem Start',
    atlasAlt: 'Eine fantastische Stadt und Sammelkarten im Ava Atlas Universum',
    marketAlt: 'Eine Illustration digitaler Märkte und Trading-Charts',
    note: 'Jeder Bereich wird in einem neuen Tab geöffnet.',
  },
  es: {
    label: 'El universo Ava', title: 'Dos nuevos horizontes.',
    intro: 'Juegos y mercados, cada uno en su propio espacio. Elige tu próxima experiencia.',
    atlasLabel: 'Ava Game · Juego de cartas', atlasTitle: 'El mundo se convierte en tu arena.',
    atlasText: 'Colecciona ciudades, crea tu mazo y desafía a tus rivales. Evoluciona tus cartas y dales tu propio estilo.',
    atlasCta: 'Jugar a Ava Atlas', atlasStatus: 'Disponible',
    marketLabel: 'Ava Market · Mercados', marketTitle: 'Otra mirada a los mercados.',
    marketText: 'Descubre Ava Market y sigue la preparación de su plataforma de trading. Únete a la comunidad antes del lanzamiento.',
    marketCta: 'Descubrir Ava Market', marketStatus: 'Prelanzamiento',
    atlasAlt: 'Una ciudad fantástica y cartas coleccionables en el universo Ava Atlas',
    marketAlt: 'Una ilustración de mercados digitales y gráficos de trading',
    note: 'Cada espacio se abre en una nueva pestaña.',
  },
  tr: {
    label: 'Ava evreni', title: 'İki yeni ufuk.',
    intro: 'Oyunlar ve piyasalar, her biri kendi alanında. Bir sonraki deneyiminizi seçin.',
    atlasLabel: 'Ava Game · Kart oyunu', atlasTitle: 'Dünya sizin arenanız oluyor.',
    atlasText: 'Şehirleri toplayın, destenizi oluşturun ve rakiplerinize meydan okuyun. Kartlarınızı geliştirin ve kendi tarzınızı yansıtın.',
    atlasCta: 'Ava Atlas oyna', atlasStatus: 'Kullanıma açık',
    marketLabel: 'Ava Market · Piyasalar', marketTitle: 'Piyasalara yeni bir bakış.',
    marketText: 'Ava Market’i keşfedin ve trading platformunun hazırlıklarını takip edin. Açılıştan önce topluluğa katılın.',
    marketCta: 'Ava Market’i keşfet', marketStatus: 'Lansman öncesi',
    atlasAlt: 'Ava Atlas evreninde fantastik bir şehir ve koleksiyon kartları',
    marketAlt: 'Dijital piyasalar ve trading grafiklerinin illüstrasyonu',
    note: 'Her alan yeni bir sekmede açılır.',
  },
}

export function AvaUniverses({ language = 'en', compact = false }: { language?: string; compact?: boolean }) {
  const t = COPY[language as keyof typeof COPY] ?? COPY.en
  const reducedMotion = useReducedMotion()
  const products = [
    { name: 'Ava Atlas', label: t.atlasLabel, title: t.atlasTitle, text: t.atlasText, cta: t.atlasCta, status: t.atlasStatus, image: '/images/univers/atlas.webp', alt: t.atlasAlt, href: 'https://atlas.call-ava.com', icon: Gamepad2 },
    { name: 'Ava Market', label: t.marketLabel, title: t.marketTitle, text: t.marketText, cta: t.marketCta, status: t.marketStatus, image: '/images/univers/market.webp', alt: t.marketAlt, href: 'https://market.call-ava.com', icon: ChartNoAxesCombined },
  ]
  return (
    <section id="univers" aria-labelledby="univers-title" className={`relative overflow-hidden ${compact ? 'px-4 py-8 sm:px-8 sm:py-10' : 'py-24 sm:py-32'}`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
      <div className={`relative mx-auto max-w-6xl ${compact ? '' : 'px-6'}`}>
        <motion.div initial={reducedMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-rose-400">{t.label}</p>
          <h2 id="univers-title" className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">{t.intro}</p>
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-2">
          {products.map((product, index) => (
            <motion.a key={product.name} href={product.href} target="_blank" rel="noopener noreferrer" aria-label={`${product.cta} — ${t.note}`} initial={reducedMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * .08 }} className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl transition-colors hover:border-rose-400/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-400">
              <div className="relative aspect-[16/9] overflow-hidden bg-slate-900">
                <Image src={product.image} alt={product.alt} fill sizes="(min-width: 1024px) 550px, (min-width: 640px) 90vw, 100vw" className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.035]" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <span className="absolute left-5 top-5 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">{product.status}</span>
                <div className="absolute bottom-5 left-5 flex items-center gap-2.5 text-white sm:left-7"><product.icon size={23} /><span className="text-2xl font-black tracking-tight">{product.name}</span></div>
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-7">
                <p className="text-[10px] font-bold uppercase tracking-[.18em] text-rose-400">{product.label}</p>
                <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">{product.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">{product.text}</p>
                <div className="mt-auto pt-7"><span className="inline-flex items-center gap-2 text-sm font-bold text-white">{product.cta}<ArrowUpRight size={18} className="text-rose-400 transition-transform motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" /></span></div>
              </div>
            </motion.a>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">{t.note}</p>
      </div>
    </section>
  )
}
