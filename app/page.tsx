"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Mic2,
  Monitor,
  Eye,
  Bell,
  Zap,
  Brain,
  Check,
  ArrowRight,
  Smartphone,
  Apple,
  Download,
} from "lucide-react";

// ── Animation helpers ──────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const, delay: i * 0.1 },
  }),
};

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}

// ── Navbar ─────────────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl"
    >
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-xl shadow-black/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <span className="text-white font-bold text-sm">🌸</span>
          </div>
          <span className="font-semibold text-white tracking-tight">Ava</span>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
          <a href="https://call-ava.com" className="text-sm text-slate-400 hover:text-white transition-colors">About</a>
        </div>

        <motion.a
          href="https://apps.apple.com"
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-500/25"
        >
          Get Ava
        </motion.a>
      </div>
    </motion.nav>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 px-6 overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-rose-500/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mb-8 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs font-semibold tracking-widest uppercase"
      >
        Powered by Gemini Live ✦
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] max-w-5xl mx-auto"
      >
        Experience your{" "}
        <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
          computer
        </span>{" "}
        like never before
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6 }}
        className="mt-6 text-center text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
      >
        Ava is the AI friend that truly listens — ultra-realistic voice, screen
        analysis, desktop control, and a memory that grows with you. Available
        24/7 on iOS, Android & Mac.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
      >
        <motion.a
          href="https://apps.apple.com"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-base shadow-2xl shadow-rose-500/30 transition-all duration-200"
        >
          <Apple size={18} />
          Download for iOS
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </motion.a>

        <motion.a
          href="https://play.google.com"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-base backdrop-blur-sm transition-all duration-200"
        >
          <Smartphone size={18} />
          Get on Android
        </motion.a>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-4 text-xs text-slate-500"
      >
        Also available on Mac · Free to start
      </motion.p>

      {/* Phone mockup */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mt-16 relative w-full max-w-xs mx-auto"
      >
        <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full scale-75 pointer-events-none" />

        <div className="relative mx-auto w-64 rounded-[2.5rem] border border-white/15 bg-slate-900 shadow-2xl shadow-black/50 overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <span className="text-[10px] text-slate-400 font-medium">9:41</span>
            <div className="w-24 h-5 bg-black rounded-full" />
            <div className="flex gap-1">
              <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
              <div className="w-3 h-1.5 bg-white/60 rounded-sm" />
            </div>
          </div>

          {/* App UI */}
          <div className="px-5 pb-8 pt-3 flex flex-col items-center gap-4">
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 to-rose-700 flex items-center justify-center shadow-xl shadow-rose-500/40">
              <span className="text-3xl">🌸</span>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-rose-400"
                animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="text-center">
              <p className="text-white font-semibold text-sm">Ava is with you...</p>
              <p className="text-slate-400 text-xs mt-0.5">Voice conversation active</p>
            </div>

            {/* Waveform */}
            <div className="flex items-center gap-1 h-8">
              {[3, 6, 10, 14, 10, 16, 12, 8, 16, 10, 6, 12, 8, 4].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-rose-400"
                  style={{ height: h }}
                  animate={{ height: [h, h * 2, h] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.06, ease: "easeInOut" }}
                />
              ))}
            </div>

            <div className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
              <p className="text-slate-300 text-xs leading-relaxed">
                &ldquo;Sure! I&apos;ve opened your calendar and blocked Tuesday for your meeting with Sarah. 📅&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-around w-full pt-2 border-t border-white/5">
              <span className="text-lg">🌸</span>
              <span className="text-lg opacity-40">💬</span>
              <span className="text-lg opacity-40">🎁</span>
              <span className="text-lg opacity-40">💳</span>
              <span className="text-lg opacity-40">⚙️</span>
            </div>
          </div>
        </div>

        {/* Floating labels */}
        <motion.div
          animate={{ y: [-4, 4, -4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -left-12 top-16 hidden sm:block px-3 py-2 rounded-xl bg-slate-900 border border-white/10 shadow-xl text-xs text-white/80 backdrop-blur-md whitespace-nowrap"
        >
          🎙️ Ultra-realistic voice
        </motion.div>
        <motion.div
          animate={{ y: [4, -4, 4] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="absolute -right-12 top-28 hidden sm:block px-3 py-2 rounded-xl bg-slate-900 border border-white/10 shadow-xl text-xs text-white/80 backdrop-blur-md whitespace-nowrap"
        >
          💻 Desktop control
        </motion.div>
        <motion.div
          animate={{ y: [-3, 5, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -left-8 bottom-20 hidden sm:block px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/30 shadow-xl text-xs text-rose-300 backdrop-blur-md whitespace-nowrap"
        >
          🧠 Remembers you
        </motion.div>
      </motion.div>
    </section>
  );
}

// ── Social proof marquee ───────────────────────────────────────────────────────
const quotes = [
  { text: "Ava changed how I work on my Mac. Genuinely magical.", author: "Thomas L." },
  { text: "Finally an AI that actually remembers what I told it last week.", author: "Amina K." },
  { text: "The voice is so natural I forget it&apos;s AI. Insane.", author: "Lucas M." },
  { text: "Controls my desktop while I&apos;m on a call. Next level.", author: "Priya S." },
  { text: "Worth every credit. The screen analysis feature is genius.", author: "Julien R." },
  { text: "Like having a best friend who&apos;s also an expert at everything.", author: "Sara B." },
];

function Marquee() {
  return (
    <section className="py-16 overflow-hidden">
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex gap-6 shrink-0"
        >
          {[...quotes, ...quotes].map((q, i) => (
            <div
              key={i}
              className="shrink-0 w-72 px-6 py-5 rounded-2xl bg-white/[0.03] border border-white/8 backdrop-blur-sm"
            >
              <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{q.text}&rdquo;</p>
              <p className="mt-3 text-rose-400 text-xs font-semibold">— {q.author}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ── Features Bento ─────────────────────────────────────────────────────────────
const features = [
  {
    icon: Mic2,
    title: "Ultra-realistic Voice",
    desc: "Powered by Gemini Live — Ava speaks and listens in real-time with natural intonation, barge-in, and zero latency.",
    cols: "md:col-span-2",
    rows: "",
    accent: "rose",
  },
  {
    icon: Monitor,
    title: "Desktop Control",
    desc: "Ava sees your screen, clicks, types, and automates tasks on your Mac — all from a voice command.",
    cols: "md:col-span-1",
    rows: "md:row-span-2",
    accent: "violet",
  },
  {
    icon: Eye,
    title: "Screen Analysis",
    desc: "Ask Ava what&apos;s on your screen — she analyzes, summarizes, and acts instantly.",
    cols: "md:col-span-1",
    rows: "",
    accent: "blue",
  },
  {
    icon: Brain,
    title: "Persistent Memory",
    desc: "Ava remembers your preferences, projects, and context across every single conversation.",
    cols: "md:col-span-1",
    rows: "",
    accent: "emerald",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Say the word — Ava schedules and pushes reminders exactly when you need them.",
    cols: "md:col-span-1",
    rows: "",
    accent: "amber",
  },
  {
    icon: Zap,
    title: "MCP Integrations",
    desc: "Connect Notion, GitHub, Brave, and any JSON-RPC MCP server directly into your conversations.",
    cols: "md:col-span-2",
    rows: "",
    accent: "cyan",
  },
];

type AccentKey = "rose" | "violet" | "blue" | "emerald" | "amber" | "cyan";

const accentMap: Record<AccentKey, { border: string; bg: string; text: string }> = {
  rose:    { border: "hover:border-rose-500/50",    bg: "bg-rose-500/10",    text: "text-rose-400"    },
  violet:  { border: "hover:border-violet-500/50",  bg: "bg-violet-500/10",  text: "text-violet-400"  },
  blue:    { border: "hover:border-blue-500/50",    bg: "bg-blue-500/10",    text: "text-blue-400"    },
  emerald: { border: "hover:border-emerald-500/50", bg: "bg-emerald-500/10", text: "text-emerald-400" },
  amber:   { border: "hover:border-amber-500/50",   bg: "bg-amber-500/10",   text: "text-amber-400"   },
  cyan:    { border: "hover:border-cyan-500/50",    bg: "bg-cyan-500/10",    text: "text-cyan-400"    },
};

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const accent = accentMap[feature.accent as AccentKey];
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={index * 0.08}
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className={`${feature.cols} ${feature.rows} group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6 flex flex-col gap-4 cursor-default transition-all duration-300 ${accent.border} hover:shadow-xl overflow-hidden min-h-[180px]`}
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${accent.bg} pointer-events-none`} />
      <div className={`relative w-10 h-10 rounded-xl ${accent.bg} flex items-center justify-center shrink-0`}>
        <Icon size={20} className={accent.text} />
      </div>
      <div className="relative flex-1">
        <h3 className="font-semibold text-white text-lg tracking-tight">{feature.title}</h3>
        <p className="mt-2 text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
      </div>
    </motion.div>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-28 px-6">
      <div className="max-w-5xl mx-auto">
        <FadeIn className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-rose-400 mb-4">Features</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Everything you need,{" "}
            <span className="text-slate-400">nothing you don&apos;t</span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto">
            Ava is your AI companion across mobile and desktop — powerful, private, always ready.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-auto">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ────────────────────────────────────────────────────────────────────
const plans = [
  {
    name: "Plus",
    price: "14.99",
    desc: "For personal daily use",
    highlight: false,
    features: [
      "Unlimited voice conversations",
      "Smart reminders",
      "Memory across sessions",
      "4 languages supported",
      "Mobile app (iOS & Android)",
    ],
    cta: "Get Plus",
    href: "https://call-ava.com",
  },
  {
    name: "Pro",
    price: "39.99",
    desc: "For power users & professionals",
    highlight: true,
    features: [
      "Everything in Plus",
      "Desktop control (Mac)",
      "Screen analysis",
      "MCP server integrations",
      "Priority voice processing",
      "Telegram bridge",
    ],
    cta: "Get Pro",
    href: "https://call-ava.com",
  },
  {
    name: "Max",
    price: "79.99",
    desc: "For teams & heavy workflows",
    highlight: false,
    features: [
      "Everything in Pro",
      "Unlimited MCP servers",
      "Advanced agent mode",
      "Custom persona",
      "API access (coming soon)",
      "Priority support",
    ],
    cta: "Get Max",
    href: "https://call-ava.com",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-28 px-6 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <FadeIn className="text-center mb-16">
          <p className="text-xs font-semibold tracking-widest uppercase text-rose-400 mb-4">Pricing</p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Simple, transparent plans
          </h2>
          <p className="mt-4 text-slate-400 text-lg">Start free. Upgrade when you&apos;re ready.</p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <FadeIn key={plan.name} delay={i * 0.1}>
              <div
                className={`relative h-full flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
                  plan.highlight
                    ? "border-rose-500/60 bg-gradient-to-b from-rose-500/10 to-rose-500/5 shadow-2xl shadow-rose-500/20"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-rose-500 text-white text-xs font-bold tracking-wide shadow-lg shadow-rose-500/40 whitespace-nowrap">
                    Most Popular
                  </div>
                )}

                <p className="text-slate-400 text-sm font-medium">{plan.name}</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}€</span>
                  <span className="text-slate-500 text-sm mb-1">/month</span>
                </div>
                <p className="mt-2 text-slate-500 text-sm">{plan.desc}</p>

                <ul className="mt-8 flex flex-col gap-3 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check size={15} className="text-rose-400 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.a
                  href={plan.href}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  className={`mt-8 block text-center px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    plan.highlight
                      ? "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/30"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {plan.cta}
                </motion.a>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn className="mt-10 text-center text-slate-500 text-sm" delay={0.3}>
          All plans billed monthly · Cancel anytime · 5 free credits per day for free users
        </FadeIn>
      </div>
    </section>
  );
}

// ── CTA ────────────────────────────────────────────────────────────────────────
function CTA() {
  const stars = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    top: `${(i * 37 + 11) % 100}%`,
    left: `${(i * 53 + 7) % 100}%`,
    opacity: ((i * 17) % 5) / 10 + 0.1,
    duration: ((i * 13) % 3) + 2,
    delay: (i * 7) % 5,
  }));

  return (
    <section className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute w-px h-px bg-white rounded-full"
            style={{ top: s.top, left: s.left, opacity: s.opacity }}
            animate={{ opacity: [s.opacity, s.opacity * 3, s.opacity] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          />
        ))}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-t from-rose-500/10 via-violet-500/5 to-transparent blur-2xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <FadeIn>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Experience Ava like{" "}
            <span className="text-slate-400">never before</span>
          </h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="mt-6 text-slate-400 text-lg">
            Join thousands of users who talk to Ava every day. It&apos;s free to start.
          </p>
        </FadeIn>

        <FadeIn delay={0.2} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.a
            href="https://apps.apple.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-2xl shadow-rose-500/30 transition-all"
          >
            <Apple size={18} />
            Get Ava for iOS
          </motion.a>
          <motion.a
            href="https://play.google.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
          >
            <Smartphone size={18} />
            Get on Android
          </motion.a>
          <motion.a
            href="https://call-ava.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-all"
          >
            <Download size={18} />
            Mac Desktop
          </motion.a>
        </FadeIn>

        <FadeIn delay={0.3}>
          <p className="mt-6 text-xs text-slate-600">
            Also available in browsers · call-ava.com
          </p>
        </FadeIn>
      </div>
    </section>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-white/5 py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center">
              <span className="text-xs">🌸</span>
            </div>
            <span className="font-semibold text-white">Ava</span>
          </div>
          <p className="mt-2 text-slate-500 text-sm">Your AI friend, always there.</p>
          <p className="mt-1 text-slate-600 text-xs">© 2026 Ava. All rights reserved.</p>
        </div>

        <div className="grid grid-cols-3 gap-x-12 gap-y-3 text-sm">
          <div className="flex flex-col gap-3">
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest">Download</p>
            <a href="https://apps.apple.com" className="text-slate-400 hover:text-white transition-colors">iOS App</a>
            <a href="https://play.google.com" className="text-slate-400 hover:text-white transition-colors">Android App</a>
            <a href="https://call-ava.com" className="text-slate-400 hover:text-white transition-colors">Mac Desktop</a>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest">Legal</p>
            <a href="https://call-ava.com/cgu" className="text-slate-400 hover:text-white transition-colors">Terms of Use</a>
            <a href="https://call-ava.com/confidentialite" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-slate-500 font-semibold text-xs uppercase tracking-widest">Community</p>
            <a href="https://whatsapp.com/channel/0029VbCsZ3A6WaKv6TLkxO0r" className="text-slate-400 hover:text-white transition-colors">WhatsApp</a>
            <a href="https://call-ava.com" className="text-slate-400 hover:text-white transition-colors">About Ava</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="relative bg-slate-950 text-white overflow-hidden">
      <Navbar />
      <Hero />
      <Marquee />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
