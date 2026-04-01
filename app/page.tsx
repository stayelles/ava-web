"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Mic2, Monitor, Eye, Brain, Bell, Zap,
  Check, ArrowRight, Apple, Smartphone, Download,
  Sparkles, Shield, MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Utilities ────────────────────────────────────────────────────────────────

function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Dot Grid Background ──────────────────────────────────────────────────────

function DotGrid({ className }: { className?: string }) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-5 left-1/2 z-50 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-xl"
    >
      <div className="flex items-center justify-between px-5 py-2.5 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 shadow-2xl shadow-black/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/40">
            <span className="text-sm">🌸</span>
          </div>
          <span className="font-bold text-white tracking-tight">Ava</span>
        </div>
        <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          <a href="https://call-ava.com" className="hover:text-white transition-colors">About</a>
        </nav>
        <motion.a
          href="https://apps.apple.com"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-semibold transition-colors shadow-lg shadow-rose-500/30"
        >
          Get Ava
        </motion.a>
      </div>
    </motion.nav>
  );
}

// ─── iPhone 15 Pro Mockup ─────────────────────────────────────────────────────

function IPhoneMockup() {
  return (
    <motion.div
      animate={{ y: [0, -18, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="relative mx-auto"
      style={{ width: 280, height: 580 }}
    >
      {/* Glow behind phone */}
      <div className="absolute inset-x-10 inset-y-20 bg-rose-500/25 blur-3xl rounded-full pointer-events-none" />

      {/* Phone body */}
      <div className="relative w-full h-full rounded-[44px] bg-gradient-to-b from-slate-800 to-slate-900 border-[3px] border-slate-700 shadow-2xl shadow-black/60 overflow-hidden">

        {/* Side volume buttons */}
        <div className="absolute -left-[5px] top-28 w-[3px] h-8 bg-slate-600 rounded-l-full" />
        <div className="absolute -left-[5px] top-40 w-[3px] h-10 bg-slate-600 rounded-l-full" />
        <div className="absolute -left-[5px] top-52 w-[3px] h-10 bg-slate-600 rounded-l-full" />
        {/* Power button */}
        <div className="absolute -right-[5px] top-40 w-[3px] h-14 bg-slate-600 rounded-r-full" />

        {/* Screen */}
        <div className="absolute inset-[3px] rounded-[42px] bg-slate-950 overflow-hidden">

          {/* Dynamic Island */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-28 h-8 bg-black rounded-full flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
            <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-700" />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-7 pt-[60px] pb-1">
            <span className="text-[10px] text-white/70 font-medium">9:41</span>
            <div className="flex items-center gap-1">
              <div className="flex gap-0.5 items-end h-2.5">
                {[3, 5, 7, 10].map((h, i) => (
                  <div key={i} className="w-0.5 bg-white/60 rounded-sm" style={{ height: h }} />
                ))}
              </div>
              <div className="w-3.5 h-2 border border-white/60 rounded-sm relative ml-1">
                <div className="absolute inset-y-0.5 left-0.5 right-1 bg-white/60 rounded-sm" />
              </div>
            </div>
          </div>

          {/* App content */}
          <div className="flex flex-col items-center px-5 pt-4 gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 flex items-center justify-center shadow-xl shadow-rose-500/40">
                <span className="text-3xl">🌸</span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-rose-400/60"
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-rose-400/30"
                animate={{ scale: [1, 1.55, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              />
            </div>

            <div className="text-center">
              <p className="text-white font-semibold text-sm">Ava is with you...</p>
              <p className="text-slate-500 text-[11px] mt-0.5">Tap to speak</p>
            </div>

            {/* Waveform */}
            <div className="flex items-center gap-[3px] h-7">
              {[2, 5, 9, 14, 9, 16, 11, 7, 16, 9, 5, 11, 7, 3].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full bg-rose-400"
                  style={{ height: h }}
                  animate={{ height: [h, h * 2.2, h] }}
                  transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.065, ease: "easeInOut" }}
                />
              ))}
            </div>

            {/* Chat bubble */}
            <div className="w-full rounded-2xl bg-white/[0.04] border border-white/8 px-4 py-3">
              <p className="text-slate-300 text-[11px] leading-relaxed">
                &ldquo;Done! I&apos;ve opened Slack and sent a message to your team. 📨&rdquo;
              </p>
            </div>

            {/* Mini bento */}
            <div className="w-full grid grid-cols-3 gap-1.5">
              {[
                { icon: "🎙️", label: "Voice" },
                { icon: "💻", label: "Desktop" },
                { icon: "🧠", label: "Memory" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-white/[0.04] border border-white/8 p-2 flex flex-col items-center gap-1">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[9px] text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Tab bar */}
            <div className="absolute bottom-6 left-0 right-0 flex items-center justify-around px-6">
              {["🌸", "💬", "🎁", "💳", "⚙️"].map((icon, i) => (
                <div key={i} className={cn("text-lg", i !== 0 && "opacity-30")}>
                  {icon}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-20 px-6">
      {/* Dot grid */}
      <DotGrid />

      {/* Radial gradient overlay — deep AI network vibe */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_rgba(244,63,94,0.15)_0%,_rgba(2,6,23,0.85)_60%,_rgb(2,6,23)_100%)]" />

      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-rose-500/8 blur-[160px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-6xl mx-auto w-full">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Badge variant="outline" className="mb-8 px-4 py-1.5 text-xs tracking-widest uppercase">
            <Sparkles size={11} className="mr-1.5" />
            Powered by Gemini Live
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold tracking-tight leading-[1.04] max-w-4xl"
        >
          Experience your{" "}
          <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 bg-clip-text text-transparent">
            computer
          </span>
          <br />
          like never before
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.65 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed"
        >
          Meet Ava — the AI friend that speaks naturally, controls your Mac,
          reads your screen, and remembers everything. Available 24/7.
        </motion.p>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-3"
        >
          <motion.a
            href="https://apps.apple.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-semibold text-sm shadow-2xl shadow-rose-500/35 transition-all"
          >
            <Apple size={17} />
            Download for iOS
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </motion.a>
          <motion.a
            href="https://play.google.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl backdrop-blur-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-sm transition-all"
          >
            <Smartphone size={17} />
            Get on Android
          </motion.a>
          <motion.a
            href="https://call-ava.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl backdrop-blur-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white font-semibold text-sm transition-all"
          >
            <Download size={17} />
            Mac Desktop
          </motion.a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-xs text-slate-600"
        >
          Free to start · No credit card required
        </motion.p>

        {/* iPhone mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 relative"
        >
          {/* Floating side cards */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-44 top-24 hidden lg:flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 shadow-2xl text-sm text-white/80 whitespace-nowrap"
          >
            <div className="w-7 h-7 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Monitor size={14} className="text-violet-400" />
            </div>
            Desktop Control
          </motion.div>

          <motion.div
            animate={{ y: [5, -5, 5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute -right-48 top-32 hidden lg:flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 shadow-2xl text-sm text-white/80 whitespace-nowrap"
          >
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Brain size={14} className="text-emerald-400" />
            </div>
            Persistent Memory
          </motion.div>

          <motion.div
            animate={{ y: [-3, 7, -3] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            className="absolute -left-36 bottom-28 hidden lg:flex items-center gap-2.5 px-4 py-3 rounded-2xl backdrop-blur-xl bg-rose-500/10 border border-rose-500/20 shadow-2xl text-sm text-rose-300 whitespace-nowrap"
          >
            <div className="w-7 h-7 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Mic2 size={14} className="text-rose-400" />
            </div>
            Ultra-realistic Voice
          </motion.div>

          <IPhoneMockup />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Marquee ──────────────────────────────────────────────────────────────────

const quotes = [
  { text: "Ava changed how I work on my Mac. Genuinely magical.", author: "Thomas L." },
  { text: "Finally an AI that actually remembers what I said last week.", author: "Amina K." },
  { text: "The voice is so natural I forget it's AI. Insane quality.", author: "Lucas M." },
  { text: "Controls my desktop while I'm on a call. Next level.", author: "Priya S." },
  { text: "Worth every credit. Screen analysis is genius.", author: "Julien R." },
  { text: "Like having a best friend who's an expert at everything.", author: "Sara B." },
];

function Marquee() {
  return (
    <section className="relative py-14 overflow-hidden border-y border-white/[0.05]">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
      />
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        className="flex gap-5 shrink-0"
      >
        {[...quotes, ...quotes].map((q, i) => (
          <div
            key={i}
            className="shrink-0 w-72 px-6 py-5 rounded-2xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.07]"
          >
            <p className="text-slate-300 text-sm leading-relaxed">&ldquo;{q.text}&rdquo;</p>
            <p className="mt-3 text-rose-400 text-xs font-semibold">— {q.author}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

// ─── Bento Features ───────────────────────────────────────────────────────────

interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
  span: string;
  accentBg: string;
  accentIcon: string;
  accentOrb: string;
  visual?: React.ReactNode;
}

function WaveformVisual() {
  return (
    <div className="flex items-center gap-1 h-10 mt-2">
      {[4, 8, 14, 20, 14, 24, 18, 11, 22, 14, 8, 16, 10, 5, 18, 12].map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-rose-400/60"
          style={{ height: h }}
          animate={{ height: [h, h * 1.8, h] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ScreenVisual() {
  return (
    <div className="mt-3 w-full rounded-xl bg-slate-950/80 border border-white/8 p-3 text-[10px] font-mono text-emerald-400/80 leading-relaxed">
      <span className="text-slate-500">$ </span>ava analyze screen<br />
      <span className="text-white/60">→ Detected: Slack open</span><br />
      <span className="text-white/60">→ 3 unread messages</span><br />
      <span className="text-rose-400/80">→ Drafting reply...</span>
    </div>
  );
}

function MemoryVisual() {
  const nodes = [
    { x: 30, y: 20, label: "Prénom: Jordan" },
    { x: 70, y: 50, label: "Project: Ava" },
    { x: 25, y: 72, label: "Lang: French" },
    { x: 65, y: 15, label: "Team: 3 devs" },
  ];
  return (
    <div className="relative mt-3 w-full h-20 overflow-hidden">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80" preserveAspectRatio="none">
        {nodes.map((n, i) =>
          nodes.slice(i + 1).map((m, j) => (
            <line key={`${i}-${j}`} x1={n.x} y1={n.y} x2={m.x} y2={m.y} stroke="rgba(52,211,153,0.15)" strokeWidth="0.5" />
          ))
        )}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="2" fill="rgba(52,211,153,0.6)" />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-wrap gap-1 content-start p-1">
        {nodes.map((n) => (
          <span key={n.label} className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px]">
            {n.label}
          </span>
        ))}
      </div>
    </div>
  );
}

const features: Feature[] = [
  {
    icon: Mic2,
    title: "Ultra-realistic Voice",
    desc: "Gemini Live powers Ava's voice — real-time barge-in, natural intonation, zero latency. iOS & Android.",
    span: "md:col-span-2",
    accentBg: "from-rose-500/10 to-transparent",
    accentIcon: "bg-rose-500/15 text-rose-400",
    accentOrb: "bg-rose-500/20",
    visual: <WaveformVisual />,
  },
  {
    icon: Monitor,
    title: "Desktop Control",
    desc: "Ava sees your Mac screen, moves the cursor, clicks buttons, types text — entirely hands-free.",
    span: "md:col-span-1",
    accentBg: "from-violet-500/10 to-transparent",
    accentIcon: "bg-violet-500/15 text-violet-400",
    accentOrb: "bg-violet-500/20",
  },
  {
    icon: Eye,
    title: "Screen Analysis",
    desc: "Ask Ava what's on your screen. She reads, summarizes, and acts on anything visible.",
    span: "md:col-span-1",
    accentBg: "from-blue-500/10 to-transparent",
    accentIcon: "bg-blue-500/15 text-blue-400",
    accentOrb: "bg-blue-500/20",
    visual: <ScreenVisual />,
  },
  {
    icon: Brain,
    title: "Persistent Memory",
    desc: "Every detail you share is remembered. Ava builds a growing model of you across all sessions.",
    span: "md:col-span-2",
    accentBg: "from-emerald-500/10 to-transparent",
    accentIcon: "bg-emerald-500/15 text-emerald-400",
    accentOrb: "bg-emerald-500/20",
    visual: <MemoryVisual />,
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Just say it — Ava schedules and delivers push notifications exactly when needed.",
    span: "md:col-span-1",
    accentBg: "from-amber-500/10 to-transparent",
    accentIcon: "bg-amber-500/15 text-amber-400",
    accentOrb: "bg-amber-500/20",
  },
  {
    icon: Zap,
    title: "MCP Integrations",
    desc: "Plug in Notion, GitHub, Brave and any JSON-RPC server. Your tools, your context, one voice.",
    span: "md:col-span-1",
    accentBg: "from-cyan-500/10 to-transparent",
    accentIcon: "bg-cyan-500/15 text-cyan-400",
    accentOrb: "bg-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Privacy-first",
    desc: "Your conversations stay yours. No training on your data. Supabase-backed with RLS.",
    span: "md:col-span-1",
    accentBg: "from-slate-400/10 to-transparent",
    accentIcon: "bg-slate-400/15 text-slate-300",
    accentOrb: "bg-slate-400/15",
  },
  {
    icon: MessageSquare,
    title: "Text Chat Mode",
    desc: "No call needed — switch to silent text chat with Ava. Full memory, zero audio.",
    span: "md:col-span-2",
    accentBg: "from-pink-500/10 to-transparent",
    accentIcon: "bg-pink-500/15 text-pink-400",
    accentOrb: "bg-pink-500/20",
  },
];

function BentoCard({ feature, index }: { feature: Feature; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 36 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: index * 0.07 }}
      whileHover={{ scale: 1.02, transition: { type: "spring", stiffness: 280, damping: 22 } }}
      className={cn(
        feature.span,
        "group relative rounded-2xl border border-white/[0.07] hover:border-white/[0.14] transition-all duration-300 overflow-hidden cursor-default",
        `bg-gradient-to-br ${feature.accentBg}`,
        "backdrop-blur-sm"
      )}
    >
      {/* Inner glow orb */}
      <div className={cn(
        "absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none",
        feature.accentOrb
      )} />
      <div className={cn(
        "absolute -bottom-16 -left-10 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none",
        feature.accentOrb
      )} />

      <div className="relative p-6 flex flex-col gap-4 min-h-[200px]">
        {/* Icon squircle */}
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0",
          feature.accentIcon
        )}>
          <Icon size={22} />
        </div>

        <div>
          <h3 className="font-semibold text-white text-lg tracking-tight">{feature.title}</h3>
          <p className="mt-2 text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
        </div>

        {feature.visual && (
          <div className="mt-auto">{feature.visual}</div>
        )}
      </div>
    </motion.div>
  );
}

function Features() {
  return (
    <section id="features" className="relative py-32 px-6 overflow-hidden">
      <DotGrid className="opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <Badge variant="outline" className="mb-5">Features</Badge>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Everything you need,{" "}
            <span className="text-slate-500">nothing you don&apos;t</span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-lg mx-auto">
            Ava is your AI companion across every device — powerful, private, always on.
          </p>
        </FadeUp>

        {/* True asymmetric bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <BentoCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const plans = [
  {
    name: "Plus",
    price: "14.99",
    desc: "For personal daily use",
    popular: false,
    features: [
      "Unlimited voice conversations",
      "Smart reminders",
      "Memory across sessions",
      "4 languages",
      "iOS & Android apps",
    ],
    cta: "Get Plus",
    href: "https://call-ava.com",
  },
  {
    name: "Pro",
    price: "39.99",
    desc: "For power users & professionals",
    popular: true,
    features: [
      "Everything in Plus",
      "Mac desktop control",
      "Screen analysis",
      "MCP server integrations",
      "Telegram bridge",
      "Priority processing",
    ],
    cta: "Get Pro",
    href: "https://call-ava.com",
  },
  {
    name: "Max",
    price: "79.99",
    desc: "For teams & heavy workflows",
    popular: false,
    features: [
      "Everything in Pro",
      "Unlimited MCP servers",
      "Advanced agent mode",
      "Custom persona",
      "API access (soon)",
      "Priority support",
    ],
    cta: "Get Max",
    href: "https://call-ava.com",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,_rgba(244,63,94,0.07)_0%,_transparent_70%)] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <Badge variant="outline" className="mb-5">Pricing</Badge>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Simple, transparent plans
          </h2>
          <p className="mt-4 text-slate-400 text-lg">Start free. Upgrade when you&apos;re ready.</p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.1}>
              <motion.div
                whileHover={!plan.popular ? { scale: 1.02 } : {}}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={plan.popular ? { scale: 1.05 } : {}}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 transition-all duration-300",
                  plan.popular
                    ? "border-rose-500 bg-gradient-to-b from-rose-500/[0.08] to-rose-500/[0.02] shadow-[0_0_40px_rgba(244,63,94,0.18)] z-10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1 text-xs font-bold shadow-lg shadow-rose-500/40">
                      ✦ Most Popular
                    </Badge>
                  </div>
                )}

                <div>
                  <p className="text-slate-400 text-sm font-medium">{plan.name}</p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-[42px] font-bold leading-none text-white">{plan.price}€</span>
                    <span className="text-slate-500 text-sm mb-1.5">/mo</span>
                  </div>
                  <p className="mt-2 text-slate-500 text-sm">{plan.desc}</p>
                </div>

                <ul className="mt-8 flex flex-col gap-3.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-rose-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <motion.a
                  href={plan.href}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  className={cn(
                    "mt-8 block text-center px-6 py-3.5 rounded-xl font-semibold text-sm transition-all",
                    plan.popular
                      ? "bg-rose-500 hover:bg-rose-400 text-white shadow-xl shadow-rose-500/30"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  )}
                >
                  {plan.cta}
                </motion.a>
              </motion.div>
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-10 text-center text-slate-600 text-sm" delay={0.3}>
          All plans billed monthly · Cancel anytime · 5 free credits/day on free tier
        </FadeUp>
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA() {
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    top: `${(i * 37 + 11) % 100}%`,
    left: `${(i * 53 + 7) % 100}%`,
    size: i % 3 === 0 ? 1.5 : 1,
    opacity: ((i * 17) % 5) / 10 + 0.08,
    duration: ((i * 13) % 3) + 2,
    delay: (i * 7) % 5,
  }));

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <DotGrid className="opacity-30" />
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: s.opacity }}
            animate={{ opacity: [s.opacity, s.opacity * 4, s.opacity] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          />
        ))}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-t from-rose-500/12 via-violet-500/5 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto text-center">
        <FadeUp>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Experience Ava like{" "}
            <span className="text-slate-500">never before</span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="mt-6 text-slate-400 text-lg">
            Join thousands of users talking to Ava every day. Free to start, no credit card needed.
          </p>
        </FadeUp>

        <FadeUp delay={0.2} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.a
            href="https://apps.apple.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-2xl shadow-rose-500/35 transition-all"
          >
            <Apple size={18} />
            iOS App
          </motion.a>
          <motion.a
            href="https://play.google.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white font-semibold transition-all"
          >
            <Smartphone size={18} />
            Android App
          </motion.a>
          <motion.a
            href="https://call-ava.com"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white font-semibold transition-all"
          >
            <Download size={18} />
            Mac Desktop
          </motion.a>
        </FadeUp>

        <FadeUp delay={0.3}>
          <p className="mt-5 text-xs text-slate-700">call-ava.com</p>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] py-14 px-6">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <span className="text-sm">🌸</span>
            </div>
            <span className="font-bold text-white">Ava</span>
          </div>
          <p className="mt-2 text-slate-500 text-sm">Your AI friend, always there.</p>
          <p className="mt-1 text-slate-700 text-xs">© 2026 Ava. All rights reserved.</p>
        </div>

        <div className="grid grid-cols-3 gap-x-14 gap-y-3 text-sm">
          {[
            {
              title: "Download",
              links: [
                { label: "iOS App", href: "https://apps.apple.com" },
                { label: "Android App", href: "https://play.google.com" },
                { label: "Mac Desktop", href: "https://call-ava.com" },
              ],
            },
            {
              title: "Legal",
              links: [
                { label: "Terms", href: "https://call-ava.com/cgu" },
                { label: "Privacy", href: "https://call-ava.com/confidentialite" },
              ],
            },
            {
              title: "Community",
              links: [
                { label: "WhatsApp", href: "https://whatsapp.com/channel/0029VbCsZ3A6WaKv6TLkxO0r" },
                { label: "About Ava", href: "https://call-ava.com" },
              ],
            },
          ].map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="text-slate-500 font-semibold text-[10px] uppercase tracking-widest">{col.title}</p>
              {col.links.map((l) => (
                <a key={l.label} href={l.href} className="text-slate-400 hover:text-white transition-colors">
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <main className="relative bg-slate-950 text-white overflow-x-hidden">
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
