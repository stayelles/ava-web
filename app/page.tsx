"use client";

import { useRef, useState, useEffect, createContext, useContext } from "react";
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
import {
  type Lang, type TL,
  T, LANG_FLAGS, SUPPORTED_LANGS, LANG_STORAGE_KEY,
} from "@/lib/landing-translations";
import {
  PADDLE_PRICE_PRO_STARTER, PADDLE_PRICE_PRO_PLUS,
  PADDLE_PRICE_CUSTOM,
} from "@/components/app/constants";
import { usePaddle } from "@/components/app/hooks/usePaddle";

// ─── Language context ──────────────────────────────────────────────────────────

const LangCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'en', setLang: () => {},
});
const useLang = () => useContext(LangCtx);
function useTl() {
  const { lang } = useLang();
  return (obj: TL): string => obj[lang] ?? obj.en;
}

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

// ─── Language switcher ────────────────────────────────────────────────────────

function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANG_FLAGS.find(l => l.code === lang) ?? LANG_FLAGS[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-sm font-semibold transition-all select-none"
        style={{
          background: open ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.10)',
          color: '#e2e8f0',
        }}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-[11px] font-bold tracking-wide">{current.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex items-center">
          <ChevronDown size={12} style={{ color: '#64748b' }} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1.5 w-36 rounded-2xl overflow-hidden z-50"
            style={{
              background: 'rgba(15,20,35,0.97)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {LANG_FLAGS.map(({ code, flag, label }) => (
              <button
                key={code}
                onClick={() => { setLang(code); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors"
                style={{
                  background: lang === code ? 'rgba(225,29,72,0.12)' : 'transparent',
                  color: lang === code ? '#f43f5e' : '#94a3b8',
                }}
                onMouseEnter={e => { if (lang !== code) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (lang !== code) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span className="text-base leading-none">{flag}</span>
                <span className="text-xs font-semibold flex-1">{label === 'EN' ? 'English' : label === 'FR' ? 'Français' : label === 'DE' ? 'Deutsch' : label === 'TR' ? 'Türkçe' : 'Español'}</span>
                {lang === code && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar() {
  const tl = useTl();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const NAV_ITEMS = [
    { name: tl(T.nav.features), link: "#features" },
    { name: tl(T.nav.pricing),  link: "#pricing" },
    { name: tl(T.nav.download), link: "#download" },
    { name: tl(T.nav.blog),     link: "/blog" },
  ];

  return (
    <ResizableNavbar>
      {/* Desktop */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={NAV_ITEMS} />
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <NavbarButton href="/app" variant="primary">
            {tl(T.nav.cta)}
          </NavbarButton>
        </div>
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
          <div className="pt-1 pb-1">
            <LangSwitcher />
          </div>
          <NavbarButton href="/app" variant="primary" className="w-full mt-2">
            {tl(T.nav.cta)}
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
  const tl = useTl();
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-20 overflow-hidden bg-[#020617]">
      <div className="pointer-events-none absolute inset-0 select-none"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
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
            <span className="text-white/45 text-xs">{tl(T.hero.users)}</span>
          </div>
          <Badge className="border-rose-500/30 text-rose-400 bg-rose-500/10 text-[10px] tracking-widest uppercase">
            {tl(T.hero.badge)}
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05] mb-6">
          {tl(T.hero.h1)}
          <br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 bg-clip-text text-transparent">
              {tl(T.hero.h2)}
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
          {tl(T.hero.subtitle)}
        </motion.p>

        {/* CTA buttons */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-20">
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
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-72 h-20 rounded-full blur-3xl bg-rose-500/15 pointer-events-none" />

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

const DIFF_COLORS: Record<string, string> = {
  rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
  indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  violet: "bg-violet-500/10 border-violet-500/20 text-violet-400",
};

const DIFF_ICONS = [Mic2, Monitor, Brain];
const DIFF_COLORS_KEYS = ["rose", "indigo", "violet"];
const DIFF_VISUALS = [
  (
    <div className="flex items-end gap-0.5 h-8 w-full">
      {Array.from({ length: 28 }, (_, i) => Math.abs(Math.sin(i * 0.55) * 18 + 6)).map((h, i) => (
        <div key={i} className="flex-1 rounded-full bg-rose-500/50" style={{ height: h }} />
      ))}
    </div>
  ),
  (
    <div className="rounded-xl bg-black/50 border border-white/[0.08] px-3 py-2.5 text-left font-mono text-[10px] space-y-1">
      <p className="text-emerald-400">$ open -a &quot;Spotify&quot;</p>
      <p className="text-white/30">Launching...</p>
      <p className="text-emerald-400">✓ Done in 0.4s</p>
    </div>
  ),
  (
    <div className="flex flex-wrap gap-1.5">
      {["Développeur", "Paris", "Préfère FR", "MacBook M3"].map(t => (
        <span key={t} className="px-2 py-0.5 rounded-full bg-violet-500/12 border border-violet-500/20 text-[10px] text-violet-300">{t}</span>
      ))}
    </div>
  ),
];

function Differentiators() {
  const tl = useTl();
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-30" />
      <div className="relative max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">{tl(T.diff.label)}</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {tl(T.diff.h1)}{" "}
            <span className="text-rose-400 italic">{tl(T.diff.h2)}</span>
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-lg mx-auto leading-relaxed">
            {tl(T.diff.subtitle)}
          </p>
        </FadeUp>
        <div className="grid md:grid-cols-3 gap-5">
          {T.diff.cards.map((card, i) => {
            const Icon = DIFF_ICONS[i];
            const colorKey = DIFF_COLORS_KEYS[i];
            return (
              <FadeUp key={i} delay={i * 0.1}>
                <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}
                  className="rounded-2xl bg-white/[0.04] border border-white/10 p-6 flex flex-col gap-4 h-full">
                  <div className={cn("w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0", DIFF_COLORS[colorKey])}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-2">{tl(card.title)}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{tl(card.desc)}</p>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06]">{DIFF_VISUALS[i]}</div>
                </motion.div>
              </FadeUp>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Bento ────────────────────────────────────────────────────────────

function FeatureBento() {
  const tl = useTl();
  return (
    <section id="features" className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-20" />
      <div className="relative max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">{tl(T.feat.label)}</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {tl(T.feat.h1)}
            <br />
            <span className="text-rose-400">{tl(T.feat.h2)}</span>
          </h2>
        </FadeUp>

        {/* Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
          {/* Voice */}
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
                    <p className="text-white font-bold leading-none">{tl(T.feat.voiceTitle)}</p>
                    <p className="text-rose-400/60 text-xs mt-0.5">{tl(T.feat.voiceSub)}</p>
                  </div>
                </div>
                <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-sm">{tl(T.feat.voiceDesc)}</p>
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
                  <p className="text-rose-400/50 text-[10px] mt-2 font-mono tracking-wide">{tl(T.feat.voiceLive)}</p>
                </div>
              </div>
            </motion.div>
          </FadeUp>

          {/* Right stack */}
          <div className="lg:col-span-2 flex flex-col gap-4">
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
                    <p className="text-white font-bold text-sm">{tl(T.feat.remoteTitle)}</p>
                  </div>
                  <div className="rounded-xl bg-black/50 border border-white/[0.07] px-3 py-2.5 font-mono text-[10px] space-y-1">
                    <p className="text-emerald-400">$ open -a &quot;Final Cut Pro&quot;</p>
                    <p className="text-white/30">Launching app...</p>
                    <p className="text-emerald-400">✓ Opened successfully</p>
                  </div>
                </div>
              </motion.div>
            </FadeUp>

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
                    <p className="text-white font-bold text-sm">{tl(T.feat.memoryTitle)}</p>
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

        {/* Row 2 */}
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
                  <p className="text-white font-bold text-sm">{tl(T.feat.remindersTitle)}</p>
                </div>
                <p className="text-white/45 text-xs leading-relaxed mb-4">{tl(T.feat.remindersDesc)}</p>
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
                  <p className="text-white font-bold text-sm">{tl(T.feat.mcpTitle)}</p>
                </div>
                <p className="text-white/45 text-xs leading-relaxed mb-4">{tl(T.feat.mcpDesc)}</p>
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
                <p className="text-white font-bold text-sm mb-2">{tl(T.feat.privacyTitle)}</p>
                <p className="text-white/45 text-xs leading-relaxed">{tl(T.feat.privacyDesc)}</p>
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
  const tl = useTl();
  return (
    <section className="py-20 border-y border-white/[0.06]" style={{ background: "rgba(255,255,255,0.012)" }}>
      <div className="max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/25 mb-3">{tl(T.integ.label)}</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            {tl(T.integ.h1)}{" "}
            <span className="text-rose-400">{tl(T.integ.h2)}</span>
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
  const tl = useTl();
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-25" />
      <div className="relative max-w-6xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">{tl(T.testimonials.label)}</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {tl(T.testimonials.h1)}
            <br />{tl(T.testimonials.h2)}
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
                <p className="text-slate-400 text-sm leading-relaxed flex-1">&quot;{t.text}&quot;</p>
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
  const tl = useTl();
  const SHOWCASE_ICONS = [Mic2, Brain, Zap];
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
              {tl(T.showcase.badge)}
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-6 leading-tight">
              {tl(T.showcase.h1)}
              <br />
              <span className="text-indigo-400">{tl(T.showcase.h2)}</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">{tl(T.showcase.subtitle)}</p>
            <div className="space-y-4">
              {T.showcase.items.map((item, i) => {
                const Icon = SHOWCASE_ICONS[i];
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={14} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{tl(item.label)}</p>
                      <p className="text-white/35 text-xs mt-0.5">{tl(item.desc)}</p>
                    </div>
                  </div>
                );
              })}
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

interface PlanDef {
  id: string
  name: string
  priceEur: string
  priceUsd: string
  priceId: string | null
  popular: boolean
  badge: string | null
  accent: string
  accentBg: string
  accentBorder: string
}

// 'ul' = illimité/unlimited, false = unavailable, true = check, number = value
// Unit type: 'pd' per day, 'pm' per month, 'w' words, 'steps' AI steps
type FV = false | true | number | 'ul'
type FUnit = 'pd' | 'pm' | 'w' | 'steps' | ''

function Pricing() {
  const tl = useTl()
  const { openCheckout } = usePaddle()

  // ── Currency detection ──────────────────────────────────────────────────────
  const [isEuro, setIsEuro] = useState(true)
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      setIsEuro(tz.startsWith('Europe/') || tz === 'Atlantic/Azores' || tz === 'Africa/Tunis' || tz === 'Africa/Ceuta')
    } catch {}
  }, [])

  const plans: PlanDef[] = [
    {
      id: 'free',
      name: tl({ fr: 'Gratuit', en: 'Free', de: 'Kostenlos', tr: 'Ücretsiz', es: 'Gratis' }),
      priceEur: '0€', priceUsd: '$0',
      priceId: null, popular: false, badge: null,
      accent: '#64748b', accentBg: 'rgba(100,116,139,0.05)', accentBorder: 'rgba(100,116,139,0.12)',
    },
    {
      id: 'pro_starter',
      name: 'Pro Starter',
      priceEur: '39,99€', priceUsd: '$42.99',
      priceId: PADDLE_PRICE_PRO_STARTER, popular: true,
      badge: tl(T.pricing.mostPopular),
      accent: '#f43f5e', accentBg: 'rgba(244,63,94,0.08)', accentBorder: 'rgba(244,63,94,0.32)',
    },
    {
      id: 'pro_plus',
      name: 'Pro Plus',
      priceEur: '99,99€', priceUsd: '$107.99',
      priceId: PADDLE_PRICE_PRO_PLUS, popular: false, badge: null,
      accent: '#fb7185', accentBg: 'rgba(251,113,133,0.05)', accentBorder: 'rgba(251,113,133,0.18)',
    },
    {
      id: 'custom',
      name: 'Custom',
      priceEur: '14,99€', priceUsd: '$15.99',
      priceId: PADDLE_PRICE_CUSTOM, popular: false, badge: null,
      accent: '#818cf8', accentBg: 'rgba(129,140,248,0.06)', accentBorder: 'rgba(129,140,248,0.22)',
    },
  ]

  // ── Feature rows ─────────────────────────────────────────────────────────────
  // vals order: [Free, Pro Starter, Pro Plus, Custom]
  const features: { label: string; sub?: string; vals: FV[]; unit: FUnit }[] = [
    {
      label: tl({ fr: 'Minutes de voix / mois', en: 'Voice minutes / month', de: 'Sprachminuten / Monat', tr: 'Ses dakikası / ay', es: 'Minutos de voz / mes' }),
      vals: [3, 200, 450, 'ul'], unit: 'pm',
    },
    {
      label: tl({ fr: 'Messages texte / jour', en: 'Text messages / day', de: 'Textnachrichten / Tag', tr: 'Metin mesajı / gün', es: 'Mensajes de texto / día' }),
      vals: [10, 250, 600, 'ul'], unit: 'pd',
    },
    {
      label: tl({ fr: 'Recherche web Google en temps réel', en: 'Real-time Google web search', de: 'Google-Websuche in Echtzeit', tr: 'Gerçek zamanlı Google araması', es: 'Búsqueda web Google en tiempo real' }),
      vals: [false, 50, 'ul', 'ul'], unit: 'pd',
    },
    {
      label: tl({ fr: 'Analyse d\'images (jusqu\'à 6 par appel)', en: 'Image analysis (up to 6 per call)', de: 'Bildanalyse (bis zu 6 pro Anruf)', tr: 'Görsel analizi (arama başına 6\'ya kadar)', es: 'Análisis de imágenes (hasta 6 por llamada)' }),
      vals: [false, true, true, true], unit: '',
    },
    {
      label: tl({ fr: 'Vision écran en temps réel', en: 'Real-time screen vision', de: 'Echtzeit-Bildschirmvision', tr: 'Gerçek zamanlı ekran görüşü', es: 'Visión de pantalla en tiempo real' }),
      vals: [true, true, true, true], unit: '',
    },
    {
      label: tl({ fr: 'Agent IA autonome / jour', en: 'Autonomous AI agent / day', de: 'Autonomer KI-Agent / Tag', tr: 'Özerk YZ ajanı / gün', es: 'Agente IA autónomo / día' }),
      sub: tl({ fr: 'tâches multisteps sur votre Mac/PC', en: 'multi-step tasks on your Mac/PC', de: 'Mehrschrittaufgaben auf Ihrem Mac/PC', tr: 'Mac/PC\'nizde çok adımlı görevler', es: 'tareas multistep en tu Mac/PC' }),
      vals: [false, 3, 10, 'ul'], unit: 'pd',
    },
    {
      label: tl({ fr: 'Rappels push intelligents', en: 'Smart push reminders', de: 'Smarte Push-Erinnerungen', tr: 'Akıllı push hatırlatıcılar', es: 'Recordatorios push inteligentes' }),
      vals: [false, true, true, true], unit: '',
    },
    {
      label: tl({ fr: 'Intégrations MCP (Notion, GitHub, Brave…)', en: 'MCP integrations (Notion, GitHub, Brave…)', de: 'MCP-Integrationen (Notion, GitHub…)', tr: 'MCP entegrasyonları (Notion, GitHub…)', es: 'Integraciones MCP (Notion, GitHub…)' }),
      vals: [false, 30, 60, 'ul'], unit: 'pd',
    },
    {
      label: tl({ fr: 'Contrôle Desktop Mac / PC à distance', en: 'Remote Mac / PC desktop control', de: 'Mac/PC-Fernsteuerung', tr: 'Mac/PC uzaktan masaüstü kontrolü', es: 'Control remoto Mac / PC' }),
      vals: [false, 5, 15, 'ul'], unit: 'pd',
    },
    {
      label: tl({ fr: 'Mémoire conversationnelle', en: 'Conversational memory', de: 'Gesprächsgedächtnis', tr: 'Konuşma hafızası', es: 'Memoria conversacional' }),
      sub: tl({ fr: 'mots max stockés', en: 'max words stored', de: 'max. gespeicherte Wörter', tr: 'maks. saklanan kelime', es: 'palabras máx. almacenadas' }),
      vals: [150, 350, 650, 'ul'], unit: 'w',
    },
    {
      label: tl({ fr: 'Clé API Gemini personnelle (Google AI Studio)', en: 'Personal Gemini API key (Google AI Studio)', de: 'Eigener Gemini-API-Schlüssel (Google AI Studio)', tr: 'Kişisel Gemini API anahtarı (Google AI Studio)', es: 'Clave API Gemini personal (Google AI Studio)' }),
      vals: [false, false, false, true], unit: '',
    },
    {
      label: tl({ fr: 'Accès instantané aux derniers modèles Gemini', en: 'Instant access to latest Gemini models', de: 'Sofortiger Zugang zu neuesten Gemini-Modellen', tr: 'En son Gemini modellerine anında erişim', es: 'Acceso instantáneo a los últimos modelos Gemini' }),
      vals: [true, true, true, true], unit: '',
    },
    {
      label: tl({ fr: 'Clé chiffrée de bout en bout avec PIN', en: 'End-to-end encrypted key with PIN', de: 'Ende-zu-Ende verschlüsselter Schlüssel mit PIN', tr: 'PIN ile uçtan uca şifreli anahtar', es: 'Clave cifrada de extremo a extremo con PIN' }),
      vals: [false, false, false, true], unit: '',
    },
    {
      label: tl({ fr: 'Support multilingue (FR, EN, DE, TR, ES)', en: 'Multilingual support (FR, EN, DE, TR, ES)', de: 'Mehrsprachiger Support (FR, EN, DE, TR, ES)', tr: 'Çok dilli destek (FR, EN, DE, TR, ES)', es: 'Soporte multilingüe (FR, EN, DE, TR, ES)' }),
      vals: [true, true, true, true], unit: '',
    },
    {
      label: tl({ fr: 'Support prioritaire', en: 'Priority support', de: 'Prioritätssupport', tr: 'Öncelikli destek', es: 'Soporte prioritario' }),
      vals: [false, true, true, true], unit: '',
    },
  ]

  const ulWord = tl({ fr: 'Illimité', en: 'Unlimited', de: 'Unbegrenzt', tr: 'Sınırsız', es: 'Ilimitado' })
  const pdSuffix = tl({ fr: '/j', en: '/d', de: '/T', tr: '/g', es: '/d' })
  const pmSuffix = tl({ fr: '/mois', en: '/mo', de: '/Mon.', tr: '/ay', es: '/mes' })
  const wSuffix = tl({ fr: ' mots', en: ' words', de: ' Wörter', tr: ' kelime', es: ' pal.' })

  function renderVal(val: FV, unit: FUnit, plan: PlanDef) {
    if (val === 'ul') return (
      <span className="font-bold text-xs" style={{ color: plan.accent }}>{ulWord}</span>
    )
    if (val === true) return (
      <div className="w-5 h-5 rounded-full flex items-center justify-center mx-auto flex-shrink-0"
        style={{ background: `${plan.accent}22` }}>
        <Check size={10} style={{ color: plan.accent }} />
      </div>
    )
    if (val === false) return <span className="text-white/15">—</span>
    // Numeric value
    const suffix = unit === 'pd' ? pdSuffix : unit === 'pm' ? pmSuffix : unit === 'w' ? wSuffix : ''
    return (
      <span className="font-semibold text-xs text-white/80">{val}{suffix}</span>
    )
  }

  const perMonth = tl({ fr: '/mois', en: '/mo', de: '/Mon.', tr: '/ay', es: '/mes' })
  const trialLabel = tl({ fr: 'Aujourd\'hui : 0€', en: 'Today: $0', de: 'Heute: 0€', tr: 'Bugün: 0€', es: 'Hoy: 0€' })
  const afterLabel = tl(T.pricing.afterTrial)

  const [expandedMobilePlan, setExpandedMobilePlan] = useState<number | null>(1) // default Pro Starter expanded

  return (
    <section id="pricing" className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-30" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── Header ── */}
        <FadeUp className="text-center mb-14">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">
            {tl(T.pricing.label)}
          </p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            {tl(T.pricing.h)}
          </h2>
          <p className="text-slate-400 text-lg mt-4 max-w-xl mx-auto">
            {tl(T.pricing.subtitle)}
          </p>
          {/* Single minimal trial badge — inspired by Stripe/Linear style */}
          <div className="flex justify-center mt-6">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(8,16,26,0.85)', border: '1px solid rgba(255,255,255,0.10)', color: '#34d399' }}>
              <Sparkles size={13} className="text-emerald-400" />
              {tl({ fr: '3 jours d\'essai gratuit · Annulez à tout moment', en: '3-day free trial · Cancel anytime', de: '3 Tage gratis testen · Jederzeit kündbar', tr: '3 günlük ücretsiz deneme · İstediğiniz zaman iptal', es: '3 días de prueba gratis · Cancela cuando quieras' })}
            </div>
          </div>
        </FadeUp>

        {/* ══════════════════════════════════════════════
            DESKTOP — comparison table (md and above)
        ══════════════════════════════════════════════ */}
        <FadeUp delay={0.08} className="hidden md:block">
          {/* pt-5 gives room for the popular badge that sticks above the grid */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 pb-4 pt-5">
            <div style={{ minWidth: 720 }} className="px-4 sm:px-0">

              {/* Plan headers */}
              <div className="grid gap-x-1.5" style={{ gridTemplateColumns: '180px repeat(4, 1fr)' }}>
                <div className="flex items-end pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                    {tl({ fr: 'Fonctionnalité', en: 'Feature', de: 'Funktion', tr: 'Özellik', es: 'Función' })}
                  </span>
                </div>
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="relative rounded-t-2xl px-2 pt-7 pb-3 text-center"
                    style={{ background: plan.accentBg, border: `1px solid ${plan.accentBorder}`, borderBottom: 'none' }}
                  >
                    {plan.badge && (
                      <div className="absolute -top-4 left-0 right-0 flex justify-center">
                        <span className="inline-block px-3 py-1 rounded-full text-white text-[9px] font-extrabold tracking-wide"
                          style={{ background: plan.accent, boxShadow: `0 2px 16px ${plan.accent}70` }}>
                          {plan.badge}
                        </span>
                      </div>
                    )}
                    <p className="text-[10px] font-extrabold uppercase tracking-wide mb-1" style={{ color: plan.accent }}>
                      {plan.name}
                    </p>
                    {plan.priceId ? (
                      <>
                        <p className="text-[10px] font-bold mb-0.5" style={{ color: '#34d399' }}>{trialLabel}</p>
                        <p className="text-lg font-black text-white leading-none">
                          {isEuro ? plan.priceEur : plan.priceUsd}
                          <span className="text-[10px] text-white/30 font-normal ml-0.5">{perMonth}</span>
                        </p>
                        <p className="text-[9px] text-white/25 mt-0.5">{afterLabel}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-2xl font-black text-white leading-none">0€</p>
                        <p className="text-[9px] text-white/25 mt-0.5">
                          {tl({ fr: 'pour toujours', en: 'forever free', de: 'kostenlos', tr: 'sonsuza dek', es: 'para siempre' })}
                        </p>
                        <p className="text-[9px] text-white/20 mt-0.5">
                          {tl({ fr: 'sans carte', en: 'no credit card', de: 'ohne Kreditkarte', tr: 'kartsız', es: 'sin tarjeta' })}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Feature rows */}
              {features.map((feat, fi) => (
                <div key={fi} className="grid gap-x-1.5" style={{ gridTemplateColumns: '180px repeat(4, 1fr)' }}>
                  <div className="py-2.5 pr-3 flex flex-col justify-center"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <span className="text-xs text-slate-300 leading-snug">{feat.label}</span>
                    {feat.sub && <span className="text-[9px] text-white/25 mt-0.5">{feat.sub}</span>}
                  </div>
                  {plans.map((plan, pi) => (
                    <div key={plan.id} className="py-2.5 text-center flex items-center justify-center"
                      style={{
                        background: plan.accentBg,
                        borderLeft: `1px solid ${plan.accentBorder}`,
                        borderRight: `1px solid ${plan.accentBorder}`,
                        borderBottom: fi < features.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}>
                      {renderVal(feat.vals[pi], feat.unit, plan)}
                    </div>
                  ))}
                </div>
              ))}

              {/* CTA row */}
              <div className="grid gap-x-1.5" style={{ gridTemplateColumns: '180px repeat(4, 1fr)' }}>
                <div />
                {plans.map((plan) => (
                  <div key={plan.id} className="rounded-b-2xl px-2 py-3"
                    style={{ background: plan.accentBg, border: `1px solid ${plan.accentBorder}`, borderTop: 'none' }}>
                    {plan.priceId ? (
                      <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                        onClick={() => openCheckout(plan.priceId!)}
                        className="w-full py-2.5 rounded-xl text-[11px] font-extrabold text-white transition-all"
                        style={plan.popular
                          ? { background: plan.accent, boxShadow: `0 0 20px ${plan.accent}50` }
                          : { border: `1px solid ${plan.accent}55`, color: plan.accent, background: `${plan.accent}0a` }
                        }>
                        {tl(T.pricing.cta)}
                      </motion.button>
                    ) : (
                      <a href="/app" className="block w-full py-2.5 rounded-xl text-[11px] font-bold text-center transition-all"
                        style={{ border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.45)' }}>
                        {tl({ fr: 'Commencer', en: 'Get started', de: 'Loslegen', tr: 'Başla', es: 'Empezar' })}
                      </a>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>
        </FadeUp>

        {/* ══════════════════════════════════════════════
            MOBILE — vertical accordion cards (all plans visible)
        ══════════════════════════════════════════════ */}
        <div className="md:hidden space-y-3">
          {plans.map((plan, pi) => {
            const isOpen = expandedMobilePlan === pi
            return (
              <FadeUp key={plan.id} delay={pi * 0.05}>
                <div className="rounded-2xl overflow-hidden"
                  style={{ background: plan.accentBg, border: `1px solid ${isOpen ? plan.accent : plan.accentBorder}`, transition: 'border-color 0.2s' }}>

                  {/* ── Always-visible header — tap to expand ── */}
                  <button className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left"
                    onClick={() => setExpandedMobilePlan(isOpen ? null : pi)}>
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Plan name + badge */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: plan.accent }}>
                            {plan.name}
                          </span>
                          {plan.badge && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-white text-[9px] font-extrabold"
                              style={{ background: plan.accent }}>
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        {/* Price always visible */}
                        {plan.priceId ? (
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl font-black text-white">
                              {isEuro ? plan.priceEur : plan.priceUsd}
                            </span>
                            <span className="text-xs text-white/35">{perMonth}</span>
                            <span className="text-[10px] font-semibold ml-1" style={{ color: '#34d399' }}>{trialLabel}</span>
                          </div>
                        ) : (
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xl font-black text-white">0€</span>
                            <span className="text-xs text-white/35">
                              {tl({ fr: 'pour toujours', en: 'forever free', de: 'kostenlos', tr: 'sonsuza dek', es: 'para siempre' })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }} className="flex-shrink-0">
                      <ChevronDown size={16} style={{ color: isOpen ? plan.accent : 'rgba(255,255,255,0.3)' }} />
                    </motion.div>
                  </button>

                  {/* ── Accordion body — features + CTA ── */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
                        <div style={{ borderTop: `1px solid ${plan.accentBorder}` }}>
                          {/* Feature list */}
                          <ul className="px-5 py-3 space-y-0">
                            {features.map((feat, fi) => {
                              const val = feat.vals[pi]
                              if (val === false && pi > 0) return null
                              return (
                                <li key={fi} className="flex items-center justify-between py-2"
                                  style={{ borderBottom: fi < features.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                  <div className="flex-1 mr-3">
                                    <span className="text-xs text-slate-300 leading-snug">{feat.label}</span>
                                    {feat.sub && <p className="text-[9px] text-white/25">{feat.sub}</p>}
                                  </div>
                                  <div className="flex-shrink-0">
                                    {renderVal(val, feat.unit, plan)}
                                  </div>
                                </li>
                              )
                            })}
                          </ul>
                          {/* CTA */}
                          <div className="px-5 pb-5 pt-2">
                            {plan.priceId ? (
                              <motion.button whileTap={{ scale: 0.97 }}
                                onClick={() => openCheckout(plan.priceId!)}
                                className="w-full py-3.5 rounded-2xl text-sm font-extrabold text-white transition-all"
                                style={plan.popular
                                  ? { background: plan.accent, boxShadow: `0 4px 24px ${plan.accent}50` }
                                  : { border: `1px solid ${plan.accent}55`, color: plan.accent, background: `${plan.accent}0a` }
                                }>
                                {tl(T.pricing.cta)}
                              </motion.button>
                            ) : (
                              <a href="/app" className="block w-full py-3.5 rounded-2xl text-sm font-bold text-center text-white/50"
                                style={{ border: '1px solid rgba(255,255,255,0.10)' }}>
                                {tl({ fr: 'Commencer gratuitement', en: 'Get started free', de: 'Kostenlos starten', tr: 'Ücretsiz başla', es: 'Empezar gratis' })}
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </FadeUp>
            )
          })}
        </div>

        <FadeUp delay={0.3}>
          <p className="text-center text-xs text-slate-600 mt-6 max-w-2xl mx-auto">{tl(T.pricing.noCard)}</p>
          <p className="text-center text-xs text-slate-600 mt-1.5">{tl(T.pricing.customNote)}</p>
        </FadeUp>

      </div>
    </section>
  )
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

function FAQ() {
  const tl = useTl();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      <DotGrid className="opacity-20" />
      <div className="relative max-w-2xl mx-auto px-6">
        <FadeUp className="text-center mb-16">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-3">{tl(T.faq.label)}</p>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {tl(T.faq.h1)}
            <br />{tl(T.faq.h2)}
          </h2>
        </FadeUp>
        <div className="space-y-2">
          {T.faq.items.map((faq, i) => (
            <FadeUp key={i} delay={i * 0.06}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <button onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-4">
                  <span className="text-white font-semibold text-sm">{tl(faq.q)}</span>
                  <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.22 }} className="flex-shrink-0">
                    <ChevronDown size={15} className="text-white/35" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/[0.06] pt-4">
                        {tl(faq.a)}
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
  const tl = useTl();
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
            <span className="text-rose-400 text-xs font-bold">{tl(T.finalCta.badge)}</span>
          </div>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.04]">
            {tl(T.finalCta.h1)}
            <br />
            <span className="text-rose-400">{tl(T.finalCta.h2)}</span>
          </h2>
          <p className="text-slate-400 text-xl mb-12 max-w-xl mx-auto leading-relaxed">
            {tl(T.finalCta.subtitle)}
          </p>
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
          <div className="flex flex-wrap items-center justify-center gap-3">
            <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/Ava-arm64.dmg"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex flex-col items-center gap-1 px-6 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 text-white transition-all">
              <div className="flex items-center gap-2 font-bold text-sm"><SiApple size={15} /> Mac — Apple Silicon</div>
              <span className="text-white/35 text-[10px] font-medium">M1 / M2 / M3 / M4</span>
            </motion.a>
            <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/Ava-x64.dmg"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex flex-col items-center gap-1 px-6 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 text-white transition-all">
              <div className="flex items-center gap-2 font-bold text-sm"><Cpu size={15} /> Mac — Intel</div>
              <span className="text-white/35 text-[10px] font-medium">x86_64</span>
            </motion.a>
            <motion.a href="https://github.com/stayelles/ava-desktop/releases/latest/download/AvaSetup.exe"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              className="inline-flex flex-col items-center gap-1 px-6 py-3.5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/12 text-white transition-all">
              <div className="flex items-center gap-2 font-bold text-sm"><WindowsIcon size={15} /> Windows</div>
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
  const tl = useTl();
  return (
    <footer className="border-t border-white/[0.06] py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="Ava" className="w-8 h-8 rounded-full object-cover shadow-md shadow-rose-500/20" style={{ objectPosition: "center 45%" }} />
              <span className="font-black text-white">Ava</span>
            </div>
            <p className="text-white/25 text-sm leading-relaxed max-w-xs">{tl(T.footer.tagline)}</p>
          </div>
          <div>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">{tl(T.footer.download)}</p>
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
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">{tl(T.footer.legal)}</p>
            <ul className="space-y-2.5">
              {[
                [tl(T.nav.blog), "/blog"],
                [tl(T.footer.terms), "/cgu"],
                [tl(T.footer.privacy), "/confidentialite"],
                [tl(T.footer.refund), "/remboursement"],
                [tl(T.footer.support), "/support"],
                [tl(T.footer.delete), "/supprimer-compte"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/35 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-white/45 text-[10px] font-bold uppercase tracking-widest mb-4">{tl(T.footer.community)}</p>
            <ul className="space-y-2.5">
              {[
                [tl(T.testimonials.label) === 'Testimonials' ? "WhatsApp Channel" : "WhatsApp Channel", "https://whatsapp.com/channel/0029VbCsZ3A6WaKv6TLkxO0r"],
                ["Twitter / X", "https://x.com/woonixltd"],
              ].map(([l, h]) => (
                <li key={l}><a href={h} className="text-white/35 hover:text-white text-sm transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/[0.06] pt-6 space-y-4">
          <p className="text-white/20 text-[11px] leading-relaxed">{tl(T.footer.legalNotice)}</p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-white/18 text-xs">{tl(T.footer.copyright)}</p>
            <p className="text-white/18 text-xs">{tl(T.footer.madeWith)}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Page() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
    if (saved && SUPPORTED_LANGS.includes(saved)) { setLang(saved); return; }
    const detected = (navigator.language || '').slice(0, 2).toLowerCase() as Lang;
    setLang(SUPPORTED_LANGS.includes(detected) ? detected : 'en');
  }, []);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem(LANG_STORAGE_KEY, l);
  };

  return (
    <LangCtx.Provider value={{ lang, setLang: handleSetLang }}>
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
    </LangCtx.Provider>
  );
}
