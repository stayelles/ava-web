"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Mic2, Monitor, Brain, Bell, Zap, Check, Apple, Smartphone,
  Sparkles, Shield, Terminal, Star, ChevronDown, Layers, Wifi,
  ArrowRight, Lock, Globe, Cpu,
} from "lucide-react";
import { SiApple, SiGoogleplay } from "react-icons/si";

function WindowsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-13.051-1.851" />
    </svg>
  );
}
import { Badge } from "@/components/ui/badge";
import { Spotlight } from "@/components/ui/spotlight";
import { cn } from "@/lib/utils";
import Iphone15Pro from "@/components/magicui/iphone-15-pro";
import { BorderBeam } from "@/components/magicui/border-beam";
import {
  Navbar as ResizableNavbar, NavBody, NavItems, MobileNav, NavbarLogo,
  NavbarButton, MobileNavHeader, MobileNavToggle, MobileNavMenu,
} from "@/components/ui/resizable-navbar";

// ─── Pre-computed waveform heights (no Math.random in render) ────────────────
const WAVE_BARS_HERO = Array.from({ length: 24 }, (_, i) =>
  Math.abs(Math.sin(i * 0.5) * 14 + Math.cos(i * 0.9) * 6 + 10)
);
const WAVE_BARS_FEAT = Array.from({ length: 40 }, (_, i) =>
  Math.max(3, Math.abs(Math.sin(i * 0.4) * 20 + Math.cos(i * 0.7) * 12 + 20))
);

// ─── Utilities ────────────────────────────────────────────────────────────────

function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>
  );
}

function DotGrid({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { name: "Features", link: "#features" },
  { name: "Pricing", link: "#pricing" },
  { name: "Download", link: "#download" },
];

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ResizableNavbar>
      {/* Desktop */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <NavbarButton href="/app" variant="primary">
          Start For Free
        </NavbarButton>
      </NavBody>

      {/* Mobile */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>
        <MobileNavMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)}>
          {NAV_ITEMS.map((item, idx) => (
            <a key={idx} href={item.link} onClick={() => setIsMobileMenuOpen(false)}
              className="text-slate-300 hover:text-white font-medium py-1 transition-colors">
              {item.name}
            </a>
          ))}
          <NavbarButton href="/app" variant="primary" className="w-full mt-2">
            Start For Free
          </NavbarButton>
        </MobileNavMenu>
      </MobileNav>
    </ResizableNavbar>
  );
}

// ─── Phone screen content ─────────────────────────────────────────────────────

function PhoneScreen() {
  return (
    <div className="w-full h-full bg-[#020617] flex flex-col overflow-hidden rounded-[40px] select-none">
      <div className="h-12 flex-shrink-0" />
      <div className="flex-1 flex flex-col gap-3 px-4 py-3 overflow-hidden">
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="self-start max-w-[78%] bg-white/[0.07] border border-white/10 rounded-2xl rounded-tl-none px-3 py-2">
          <p className="text-white/85 text-[11px] leading-relaxed">Bonjour ! Comment puis-je t'aider ?</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.85, duration: 0.5 }}
          className="self-end max-w-[78%] bg-rose-600 rounded-2xl rounded-tr-none px-3 py-2">
          <p className="text-white text-[11px] leading-relaxed">Ouvre Spotify et joue mes favoris</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="self-start max-w-[78%] bg-white/[0.07] border border-white/10 rounded-2xl rounded-tl-none px-3 py-2">
          <p className="text-white/85 text-[11px] leading-relaxed">J'ouvre Spotify et lance tes morceaux favoris 🎵</p>
        </motion.div>
      </div>
      <div className="px-4 pb-4">
        <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-3 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0">
            <Mic2 size={13} className="text-rose-400" />
          </div>
          <div className="flex items-end gap-0.5 flex-1 h-5">
            {WAVE_BARS_HERO.map((h, i) => (
              <motion.div key={i} className="flex-1 rounded-full bg-rose-500"
                animate={{ height: [2, h, 2] }}
                transition={{ duration: 0.7 + i * 0.02, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden bg-[#020617]">
      {/* Grid background */}
      <div className="pointer-events-none absolute inset-0 select-none"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      {/* Spotlight — teinte rose pour matcher nos couleurs */}
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#f43f5e" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(225,29,72,0.10) 0%, transparent 65%)" }} />

      <div className="relative max-w-5xl mx-auto px-6 flex flex-col items-center text-center">

        {/* Rating + badge */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }} className="flex flex-wrap items-center justify-center gap-3 mb-7">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/10">
            {[...Array(5)].map((_, i) => <Star key={i} size={11} className="text-amber-400 fill-amber-400" />)}
            <span className="text-white/70 text-xs font-bold ml-1">4.8</span>
            <span className="text-white/25 text-xs mx-0.5">·</span>
            <span className="text-white/45 text-xs">2 400+ users</span>
          </div>
          <Badge className="border-rose-500/30 text-rose-400 bg-rose-500/10 text-[10px] tracking-widest uppercase">
            Your AI Voice Companion
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6">
          Your AI companion
          <br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 bg-clip-text text-transparent">
              always by your side
            </span>
            <svg className="absolute -bottom-1.5 left-0 w-full overflow-visible" viewBox="0 0 400 10" fill="none" aria-hidden>
              <motion.path d="M 4 7 Q 100 2 200 7 Q 300 12 396 7"
                stroke="rgba(225,29,72,0.55)" strokeWidth="2.5" strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: 0.9, duration: 0.9, ease: "easeOut" }} />
            </svg>
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-xl mb-9">
          Ava listens, acts, and remembers. Control your Mac, set reminders, and have real conversations — all with your voice.
        </motion.p>

        {/* CTA buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-20">
          {/* Mobile */}
          <motion.a href="https://apps.apple.com/app/ava-ai-voice-assistant/id6744959525"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm shadow-2xl shadow-rose-500/35 transition-colors">
            <SiApple size={15} /> App Store
          </motion.a>
          <motion.a href="https://play.google.com/store/apps/details?id=com.kemyamo.ava"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white font-bold text-sm transition-all">
            <SiGoogleplay size={15} /> Google Play
          </motion.a>
          {/* Desktop */}
          <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/Ava-arm64.dmg"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="inline-flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white transition-all">
            <div className="flex items-center gap-1.5 font-bold text-sm"><SiApple size={13} /> Mac — Apple Silicon</div>
            <span className="text-white/35 text-[10px]">M1 / M2 / M3 / M4</span>
          </motion.a>
          <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/Ava-x64.dmg"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="inline-flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white transition-all">
            <div className="flex items-center gap-1.5 font-bold text-sm"><Cpu size={13} /> Mac — Intel</div>
            <span className="text-white/35 text-[10px]">x86_64</span>
          </motion.a>
          <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/AvaSetup.exe"
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="inline-flex flex-col items-center gap-0.5 px-5 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.10] border border-white/10 text-white transition-all">
            <div className="flex items-center gap-1.5 font-bold text-sm"><WindowsIcon size={13} /> Windows</div>
            <span className="text-white/35 text-[10px]">10 / 11</span>
          </motion.a>
        </motion.div>

        {/* Phone mockup */}
        <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative">
          {/* Glow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-72 h-20 rounded-full blur-3xl bg-rose-500/15 pointer-events-none" />

          {/* Left pill */}
          <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 top-20 hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 shadow-xl shadow-black/40 z-10">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
              <Monitor size={13} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-[9px] text-white/35 leading-none">Remote control</p>
              <p className="text-[11px] text-white font-bold leading-none mt-0.5">Mac Desktop</p>
            </div>
          </motion.div>

          {/* Right pill */}
          <motion.div animate={{ y: [0, -9, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="absolute -right-4 top-28 hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 shadow-xl shadow-black/40 z-10">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <Brain size={13} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[9px] text-white/35 leading-none">Memory active</p>
              <p className="text-[11px] text-white font-bold leading-none mt-0.5">Knows you</p>
            </div>
          </motion.div>

          {/* Bottom-left pill */}
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 1.1 }}
            className="absolute -left-2 bottom-28 hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 shadow-xl shadow-black/40 z-10">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
              <Bell size={13} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[9px] text-white/35 leading-none">Reminder set</p>
              <p className="text-[11px] text-white font-bold leading-none mt-0.5">Tomorrow 9am</p>
            </div>
          </motion.div>

          <Iphone15Pro className="w-[250px] sm:w-[280px] relative z-0" src="">
            <PhoneScreen />
          </Iphone15Pro>
        </motion.div>
      </div>
    </section>
  );
}


// ─── What makes Ava different ─────────────────────────────────────────────────

const DIFFS = [
  {
    icon: Mic2, color: "rose",
    title: "Ultra-realistic voice",
    desc: "The most natural AI voice you've ever heard. Talk like you'd talk to a friend.",
    visual: (
      <div className="flex items-end gap-0.5 h-8 w-full">
        {Array.from({ length: 28 }, (_, i) => Math.abs(Math.sin(i * 0.55) * 18 + 6)).map((h, i) => (
          <div key={i} className="flex-1 rounded-full bg-rose-500/50" style={{ height: h }} />
        ))}
      </div>
    ),
  },
  {
    icon: Monitor, color: "indigo",
    title: "Remote Mac control",
    desc: "Send commands from your phone. Ava opens apps, runs scripts, and manages files on your Mac — instantly.",
    visual: (
      <div className="rounded-xl bg-black/50 border border-white/[0.08] px-3 py-2.5 text-left font-mono text-[10px] space-y-1">
        <p className="text-emerald-400">$ open -a "Spotify"</p>
        <p className="text-white/30">Launching...</p>
        <p className="text-emerald-400">✓ Done in 0.4s</p>
      </div>
    ),
  },
  {
    icon: Brain, color: "violet",
    title: "Persistent memory",
    desc: "Ava remembers your preferences, habits, and past conversations. Every session picks up where you left off.",
    visual: (
      <div className="flex flex-wrap gap-1.5">
        {["Développeur", "Paris", "Préfère FR", "MacBook M3"].map(t => (
          <span key={t} className="px-2 py-0.5 rounded-full bg-violet-500/12 border border-violet-500/20 text-[10px] text-violet-300">{t}</span>
        ))}
      </div>
    ),
  },
];

const DIFF_COLORS: Record<string, string> = {
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
};

function Differentiators() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-30" />
      <div className="relative max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">What makes Ava different</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            AI that actually{" "}
            <span className="text-rose-400 italic">does things</span>
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-lg mx-auto leading-relaxed">
            Not just a chatbot. Ava understands you, acts on your behalf, and gets smarter every day.
          </p>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {DIFFS.map((d, i) => (
            <FadeUp key={d.title} delay={i * 0.1}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}
                className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 flex flex-col gap-4 h-full">
                <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0", DIFF_COLORS[d.color])}>
                  <d.icon size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">{d.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{d.desc}</p>
                </div>
                <div className="pt-3 border-t border-white/[0.06]">{d.visual}</div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Bento ────────────────────────────────────────────────────────────

function FeatureBento() {
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-20" />
      <div className="relative max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">Powerful features</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Built to boost
            <br />
            <span className="text-rose-400">your workflow</span>
          </h2>
        </FadeUp>

        {/* Row 1 — Voice (3) + Remote+Memory stack (2) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          {/* Voice — wide */}
          <FadeUp className="lg:col-span-3" delay={0.05}>
            <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 200 }}
              className="rounded-3xl overflow-hidden min-h-[300px] relative h-full"
              style={{ background: "linear-gradient(135deg, #1c0a1c 0%, #2e0b20 60%, #1a0918 100%)", border: "1px solid rgba(225,29,72,0.18)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(225,29,72,0.14) 0%, transparent 60%)" }} />
              <div className="relative p-8 flex flex-col h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                    <Mic2 size={18} className="text-rose-400" />
                  </div>
                  <div>
                    <p className="text-white font-bold leading-none">Ultra-realistic Voice</p>
                    <p className="text-rose-400/60 text-xs mt-0.5">Ultra-realistic AI voice</p>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">
                  Experience the most natural AI conversation. Ava speaks with emotion, understands context, and responds in real-time with zero latency.
                </p>
                <div className="mt-auto">
                  <div className="flex items-end gap-0.5 h-14">
                    {WAVE_BARS_FEAT.map((h, i) => (
                      <motion.div key={i} className="flex-1 rounded-full"
                        style={{ background: "linear-gradient(to top, #9f1239, #f43f5e)" }}
                        animate={{ height: [3, h, 3] }}
                        transition={{ duration: 0.9, repeat: Infinity, repeatType: "reverse", delay: i * 0.035, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                  <p className="text-rose-400/50 text-[10px] mt-2 font-mono tracking-wide">● LIVE · Ava is speaking...</p>
                </div>
              </div>
            </motion.div>
          </FadeUp>

          {/* Right stack */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Remote */}
            <FadeUp delay={0.1}>
              <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 200 }}
                className="rounded-3xl overflow-hidden relative"
                style={{ background: "linear-gradient(135deg, #0c0e2a 0%, #10122e 100%)", border: "1px solid rgba(99,102,241,0.18)" }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 80% 10%, rgba(99,102,241,0.14) 0%, transparent 60%)" }} />
                <div className="relative p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <Monitor size={14} className="text-indigo-400" />
                    </div>
                    <p className="text-white font-bold text-sm">Remote Mac Control</p>
                  </div>
                  <div className="rounded-xl bg-black/50 border border-white/[0.07] px-3 py-2.5 font-mono text-[10px] space-y-1">
                    <p className="text-emerald-400">$ open -a "Final Cut Pro"</p>
                    <p className="text-white/30">Launching app...</p>
                    <p className="text-emerald-400">✓ Opened successfully</p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>

            {/* Memory */}
            <FadeUp delay={0.14}>
              <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 200 }}
                className="rounded-3xl overflow-hidden relative flex-1"
                style={{ background: "linear-gradient(135deg, #0b1a0d 0%, #0e2010 100%)", border: "1px solid rgba(52,211,153,0.18)" }}>
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 30% 90%, rgba(52,211,153,0.10) 0%, transparent 60%)" }} />
                <div className="relative p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Brain size={14} className="text-emerald-400" />
                    </div>
                    <p className="text-white font-bold text-sm">Persistent Memory</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {["Préfère le français", "Dev / Maker", "MacBook M3", "Paris"].map(t => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-300">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </FadeUp>
          </div>
        </div>

        {/* Row 2 — Reminders (2) + MCP (2) + Privacy (1) */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <FadeUp className="lg:col-span-2" delay={0.18}>
            <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 200 }}
              className="rounded-3xl overflow-hidden relative min-h-[200px]"
              style={{ background: "linear-gradient(135deg, #1a1200 0%, #241900 100%)", border: "1px solid rgba(251,191,36,0.18)" }}>
              <div className="relative p-6">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Bell size={14} className="text-amber-400" />
                  </div>
                  <p className="text-white font-bold text-sm">Smart Reminders</p>
                </div>
                <p className="text-white/45 text-xs leading-relaxed mb-4">Just say it. Ava schedules and sends push notifications at the right time.</p>
                <div className="space-y-2">
                  {["Appel médecin — demain 9h", "Deploy avant 18h", "Call team — vendredi"].map(r => (
                    <div key={r} className="flex items-center gap-2 bg-white/[0.04] rounded-lg px-3 py-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                      <p className="text-white/65 text-[11px]">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </FadeUp>

          <FadeUp className="lg:col-span-2" delay={0.22}>
            <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 200 }}
              className="rounded-3xl overflow-hidden relative min-h-[200px]"
              style={{ background: "linear-gradient(135deg, #0e0a1e 0%, #130d2a 100%)", border: "1px solid rgba(167,139,250,0.18)" }}>
              <div className="relative p-6">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center">
                    <Layers size={14} className="text-violet-400" />
                  </div>
                  <p className="text-white font-bold text-sm">MCP Integrations</p>
                </div>
                <p className="text-white/45 text-xs leading-relaxed mb-4">Connect Notion, GitHub, Google Calendar and more via MCP servers.</p>
                <div className="flex flex-wrap gap-2">
                  {["Notion", "GitHub", "Calendar", "Slack", "Brave"].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-white/55 text-[11px] font-medium">{t}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </FadeUp>

          <FadeUp className="lg:col-span-1" delay={0.26}>
            <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 200 }}
              className="rounded-3xl overflow-hidden relative min-h-[200px]"
              style={{ background: "linear-gradient(135deg, #0a1320 0%, #0d1a28 100%)", border: "1px solid rgba(56,189,248,0.18)" }}>
              <div className="relative p-6 flex flex-col h-full">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center mb-3">
                  <Shield size={14} className="text-sky-400" />
                </div>
                <p className="text-white font-bold text-sm mb-2">Privacy First</p>
                <p className="text-white/45 text-xs leading-relaxed">Your data stays yours. No training on your conversations. Ever.</p>
              </div>
            </motion.div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Integrations ─────────────────────────────────────────────────────────────

const INTEG = [
  { name: "iOS", icon: Apple, cls: "text-rose-400" },
  { name: "Android", icon: Smartphone, cls: "text-emerald-400" },
  { name: "macOS", icon: Monitor, cls: "text-white/55" },
  { name: "Windows", icon: Monitor, cls: "text-sky-400" },
  { name: "Notion", icon: Layers, cls: "text-white/55" },
  { name: "GitHub", icon: Terminal, cls: "text-white/55" },
  { name: "AI", icon: Sparkles, cls: "text-indigo-400" },
  { name: "MCP", icon: Wifi, cls: "text-violet-400" },
];

function Integrations() {
  return (
    <section className="py-20 border-y border-white/[0.06]" style={{ background: "rgba(255,255,255,0.012)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">Works everywhere</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Integrations with your{" "}
            <span className="text-rose-400">favorite tools</span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <div className="flex items-center justify-center flex-wrap gap-3">
            {INTEG.map(item => (
              <motion.div key={item.name} whileHover={{ y: -4, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
                className="flex flex-col items-center gap-2 px-5 py-4 rounded-2xl bg-white/[0.04] border border-white/10 w-[90px] cursor-default">
                <item.icon size={20} className={item.cls} />
                <p className="text-white/40 text-[11px] font-semibold">{item.name}</p>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const TESTIMONIALS = [
  { name: "Sophie L.", role: "Product Designer", stars: 5, text: "I've tried every AI assistant out there. Ava is the only one that actually feels like talking to a real person. The voice quality is insane." },
  { name: "Marc D.", role: "Indie Developer", stars: 5, text: "The remote desktop control changed my life. I control my Mac from my phone while commuting. Ava just gets it done." },
  { name: "Léa P.", role: "Entrepreneur", stars: 5, text: "The memory feature is what sold me. Ava remembers my preferences between sessions. It feels like having a real personal assistant." },
  { name: "Thomas R.", role: "Software Engineer", stars: 5, text: "MCP integrations with Notion and GitHub are a game changer. I manage everything through voice commands now." },
];

function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-25" />
      <div className="relative max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">Testimonials</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            What our users
            <br />are saying
          </h2>
        </FadeUp>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <FadeUp key={t.name} delay={i * 0.08}>
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}
                className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 flex flex-col gap-3 h-full">
                <div className="flex gap-0.5">
                  {[...Array(t.stars)].map((_, j) => <Star key={j} size={11} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-400 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="border-t border-white/[0.06] pt-3">
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.role}</p>
                </div>
              </motion.div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Showcase ─────────────────────────────────────────────────────────────────

function Showcase() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #070818 0%, #0e0c2c 45%, #070818 100%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.11) 0%, transparent 60%)" }} />
      <DotGrid className="opacity-30" />
      <div className="relative max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <FadeUp>
            <Badge className="border-indigo-500/30 text-indigo-400 bg-indigo-500/10 text-[10px] tracking-widest uppercase mb-6">
              All in one app
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
              A clear and intuitive
              <br />
              <span className="text-indigo-400">AI experience</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Clean interface, powerful features. Ava handles the complexity so you can focus on what matters most.
            </p>
            <div className="space-y-4">
              {[
                { icon: Mic2, label: "Voice-first interface", desc: "Tap and speak — no typing needed" },
                { icon: Brain, label: "Context-aware AI", desc: "Understands what you mean, not just what you say" },
                { icon: Zap, label: "Instant responses", desc: "Real-time streaming, zero wait time" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon size={14} className="text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{item.label}</p>
                    <p className="text-white/35 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeUp>
          <FadeUp delay={0.15} className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-10 rounded-full blur-3xl bg-indigo-500/08 pointer-events-none" />
              <Iphone15Pro className="w-[240px] relative" src="">
                <PhoneScreen />
              </Iphone15Pro>
            </div>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PLANS = [
  {
    label: "1 month", price: "19.99€", per: "/month", href: "https://woonixltd.gumroad.com/l/ava-pro",
    popular: false, note: null,
  },
  {
    label: "3 months", price: "14.99€", per: "/month", href: "https://woonixltd.gumroad.com/l/ava-pro",
    popular: true, note: "44.99€ total",
  },
  {
    label: "6 months", price: "11.99€", per: "/month", href: "https://woonixltd.gumroad.com/l/ava-pro",
    popular: false, note: "71.99€ total",
  },
];

const PLAN_FEATURES = [
  "Unlimited voice conversations",
  "Remote Mac/PC control",
  "Smart push reminders",
  "MCP integrations",
  "Persistent memory",
  "Priority support",
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-30" />
      <div className="relative max-w-5xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Flexible pricing plans
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-lg mx-auto">
            All plans unlock every feature. Pick the duration that suits you.
          </p>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <FadeUp key={plan.label} delay={i * 0.08}>
              <div className={cn(
                "relative rounded-3xl border p-8 flex flex-col h-full",
                plan.popular ? "bg-rose-500/[0.07] border-rose-500/30" : "bg-white/[0.03] border-white/10"
              )}>
                {plan.popular && <BorderBeam size={200} duration={8} colorFrom="#e11d48" colorTo="#f43f5e" />}
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/30 whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}
                <p className="text-white/35 text-xs font-bold uppercase tracking-wider mb-4">{plan.label}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-white/35 text-sm mb-1.5">{plan.per}</span>
                </div>
                {plan.note
                  ? <p className="text-white/20 text-xs mb-7">{plan.note} billed upfront</p>
                  : <div className="mb-7" />
                }
                <ul className="space-y-3 mb-8 flex-1">
                  {PLAN_FEATURES.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                      <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                        <Check size={9} className="text-rose-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <motion.a href={plan.href} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  className={cn(
                    "block text-center py-3.5 rounded-2xl font-bold text-sm transition-all",
                    plan.popular
                      ? "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/25"
                      : "bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white"
                  )}>
                  Get Started
                </motion.a>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "What is Ava?", a: "Ava is an AI voice companion. She can control your Mac remotely, set smart reminders, remember your preferences, and hold natural voice conversations." },
  { q: "Which devices does Ava support?", a: "Ava is available on iOS, Android, Mac (Apple Silicon & Intel), and Windows. All platforms sync seamlessly through your account." },
  { q: "How does remote Mac control work?", a: "Install Ava Desktop on your Mac and link it to your phone. Then send voice commands from anywhere — Ava executes them on your computer in seconds." },
  { q: "Is my data private?", a: "Yes. Ava does not train on your conversations. Your memory data is stored encrypted and is never shared with third parties." },
  { q: "Can I try Ava for free?", a: "Yes! You get 5 free daily conversation credits with no credit card required. Subscribe to Ava Pro for unlimited access to all features." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-20" />
      <div className="relative max-w-2xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">FAQ</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Frequently asked
            <br />questions
          </h2>
        </FadeUp>
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                  <span className="text-white font-semibold text-sm">{faq.q}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.22 }} className="flex-shrink-0">
                    <ChevronDown size={15} className="text-white/35" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/[0.06] pt-4">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeUp>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section id="download" className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1c0510 0%, #280a1c 50%, #1c0510 100%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(225,29,72,0.16) 0%, transparent 65%)" }} />
      <DotGrid className="opacity-45" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <FadeUp>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/12 border border-rose-500/22 mb-8">
            <Sparkles size={13} className="text-rose-400" />
            <span className="text-rose-400 text-xs font-bold">Start for free today — no credit card</span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.04]">
            Supercharge your
            <br />
            <span className="text-rose-400">daily productivity</span>
          </h2>
          <p className="text-slate-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            5 free daily credits, no card required. Join 2,400+ users already talking to Ava.
          </p>
          {/* Mobile */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <motion.a href="https://apps.apple.com/app/ava-ai-voice-assistant/id6744959525"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-base shadow-2xl shadow-rose-500/40 transition-colors">
              <SiApple size={18} /> App Store
            </motion.a>
            <motion.a href="https://play.google.com/store/apps/details?id=com.kemyamo.ava"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 text-white font-bold text-base transition-all">
              <SiGoogleplay size={18} /> Google Play
            </motion.a>
          </div>
          {/* Desktop */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/Ava-arm64.dmg"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex flex-col items-center gap-1 px-6 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 text-white transition-all">
              <div className="flex items-center gap-2 font-bold text-sm">
                <SiApple size={15} /> Mac — Apple Silicon
              </div>
              <span className="text-white/35 text-[10px] font-medium">M1 / M2 / M3 / M4</span>
            </motion.a>
            <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/Ava-x64.dmg"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex flex-col items-center gap-1 px-6 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 text-white transition-all">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Cpu size={15} /> Mac — Intel
              </div>
              <span className="text-white/35 text-[10px] font-medium">x86_64</span>
            </motion.a>
            <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/AvaSetup.exe"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex flex-col items-center gap-1 px-6 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 text-white transition-all">
              <div className="flex items-center gap-2 font-bold text-sm">
                <WindowsIcon size={15} /> Windows
              </div>
              <span className="text-white/35 text-[10px] font-medium">10 / 11</span>
            </motion.a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Ava" className="w-8 h-8 rounded-full object-cover shadow-md shadow-rose-500/20" style={{ objectPosition: "center 45%" }} />
              <span className="font-black text-white">Ava</span>
            </div>
            <p className="text-white/25 text-sm leading-relaxed max-w-xs">
              Your AI companion, always by your side.
            </p>
          </div>
          <div>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">Download</p>
            <ul className="space-y-2.5">
              {[
                ["iOS App", "https://apps.apple.com/app/ava-ai-voice-assistant/id6744959525"],
                ["Android App", "https://play.google.com/store/apps/details?id=com.kemyamo.ava"],
                ["Mac (Apple Silicon)", "https://github.com/stayelles/ava-desktop/releases/latest/download/Ava-arm64.dmg"],
                ["Mac (Intel)", "https://github.com/stayelles/ava-desktop/releases/latest/download/Ava-x64.dmg"],
                ["Windows", "https://github.com/stayelles/ava-desktop/releases/latest/download/AvaSetup.exe"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/35 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">Legal</p>
            <ul className="space-y-2.5">
              {[
                ["Terms of Service", "/cgu"],
                ["Privacy Policy", "/confidentialite"],
                ["Support", "/support"],
                ["Delete Account", "/supprimer-compte"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/35 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">Community</p>
            <ul className="space-y-2.5">
              {[
                ["WhatsApp Channel", "https://whatsapp.com/channel/0029VbCsZ3A6WaKv6TLkxO0r"],
                ["Twitter / X", "https://x.com/woonixltd"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/35 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-white/18 text-xs">© 2026 Ava. All rights reserved.</p>
          <p className="text-white/18 text-xs">Woonix ltd · Made with ♥</p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  return (
    <main className="bg-[#020617] min-h-screen">
      <Navbar />
      <Hero />
<Differentiators />
      <FeatureBento />
      <Integrations />
      <Testimonials />
      <Showcase />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}
