"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Mic2, Monitor, Eye, Brain, Bell, Zap,
  Check, ArrowRight, Apple, Smartphone, Download,
  Sparkles, Shield, MessageSquare, Terminal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Shared utilities ──────────────────────────────────────────────────────────

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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
          <a href="#showcase" className="hover:text-white transition-colors">How it Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
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

// ─── MacBook Mockup (hero) ────────────────────────────────────────────────────

function MacBookMockup() {
  return (
    <div className="relative" style={{ width: 380 }}>
      {/* Screen */}
      <div className="w-full rounded-xl overflow-hidden border border-slate-700 shadow-2xl shadow-black/60 bg-slate-950">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 border-b border-slate-800">
          <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/50" />
          <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />
          <span className="ml-3 text-[11px] text-slate-500 font-medium">Ava Desktop</span>
          <div className="ml-auto flex gap-2">
            <div className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 text-[9px] font-medium">LIVE</div>
          </div>
        </div>
        {/* Desktop UI */}
        <div className="p-4 h-52 flex flex-col gap-3 bg-gradient-to-b from-slate-950 to-slate-900">
          {/* Chat messages */}
          <div className="flex flex-col gap-2">
            <div className="self-end max-w-[70%] px-3 py-1.5 rounded-xl rounded-br-sm bg-rose-500/80 text-white text-[10px]">
              Open my Downloads folder
            </div>
            <div className="self-start max-w-[80%] px-3 py-1.5 rounded-xl rounded-bl-sm bg-white/8 border border-white/10 text-slate-300 text-[10px]">
              Sure! Opening Finder → Downloads now...
            </div>
          </div>
          {/* Mini terminal */}
          <div className="mt-auto rounded-lg bg-black/60 border border-white/10 px-3 py-2 font-mono text-[9px]">
            <span className="text-slate-500">$ </span>
            <span className="text-emerald-400">open ~/Downloads</span>
            <div className="mt-1 text-slate-500">▸ Finder window opened</div>
          </div>
          {/* Status bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px] text-slate-500">Ava connected</span>
            </div>
            <span className="text-[9px] text-slate-600">macOS Sequoia</span>
          </div>
        </div>
      </div>
      {/* Laptop hinge + base */}
      <div className="relative mt-0">
        <div className="h-[3px] bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 rounded-sm" />
        <div
          className="h-[14px] bg-gradient-to-b from-slate-700 to-slate-800 rounded-b-xl"
          style={{ clipPath: "polygon(2% 0%, 98% 0%, 95% 100%, 5% 100%)" }}
        />
        {/* Trackpad */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 rounded-md border border-slate-600/50 bg-slate-700/30" />
      </div>
    </div>
  );
}

// ─── iPhone Mockup (hero) ─────────────────────────────────────────────────────

function IPhoneMockup() {
  return (
    <div className="relative" style={{ width: 240, height: 490 }}>
      {/* Glow */}
      <div className="absolute inset-x-8 inset-y-16 bg-rose-500/25 blur-3xl rounded-full pointer-events-none" />
      {/* Body */}
      <div className="relative w-full h-full rounded-[40px] bg-gradient-to-b from-slate-800 to-slate-900 border-[2.5px] border-slate-700 shadow-2xl shadow-black/60 overflow-hidden">
        {/* Buttons */}
        <div className="absolute -left-[4px] top-24 w-[2.5px] h-7 bg-slate-600 rounded-l-full" />
        <div className="absolute -left-[4px] top-36 w-[2.5px] h-9 bg-slate-600 rounded-l-full" />
        <div className="absolute -right-[4px] top-36 w-[2.5px] h-12 bg-slate-600 rounded-r-full" />
        {/* Screen */}
        <div className="absolute inset-[2.5px] rounded-[38px] bg-slate-950 overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-10 w-24 h-7 bg-black rounded-full flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
          </div>
          {/* Status bar */}
          <div className="flex items-center justify-between px-6 pt-[52px] pb-1">
            <span className="text-[9px] text-white/70 font-medium">9:41</span>
            <div className="flex items-center gap-0.5">
              {[3, 5, 7, 9].map((h, i) => (
                <div key={i} className="w-0.5 bg-white/60 rounded-sm" style={{ height: h }} />
              ))}
              <div className="w-3 h-1.5 border border-white/60 rounded-sm relative ml-1">
                <div className="absolute inset-y-0.5 left-0.5 right-1 bg-white/60 rounded-sm" />
              </div>
            </div>
          </div>
          {/* App UI */}
          <div className="flex flex-col items-center px-4 pt-3 gap-3">
            {/* Avatar */}
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 via-rose-500 to-rose-700 flex items-center justify-center shadow-xl shadow-rose-500/40">
                <span className="text-2xl">🌸</span>
              </div>
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-rose-400/50"
                animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <p className="text-white font-semibold text-xs">Ava is with you...</p>
            {/* Waveform */}
            <div className="flex items-center gap-[2.5px] h-6">
              {[2, 5, 8, 12, 8, 15, 10, 6, 14, 8, 5, 10, 7, 3].map((h, i) => (
                <motion.div
                  key={i}
                  className="w-0.5 rounded-full bg-rose-400"
                  style={{ height: h }}
                  animate={{ height: [h, h * 2, h] }}
                  transition={{ duration: 0.85, repeat: Infinity, delay: i * 0.06, ease: "easeInOut" }}
                />
              ))}
            </div>
            {/* Chat bubble */}
            <div className="w-full rounded-2xl bg-white/[0.04] border border-white/8 px-3 py-2.5">
              <p className="text-slate-300 text-[10px] leading-relaxed">
                &ldquo;Done! I&apos;ve opened Slack and sent your message. 📨&rdquo;
              </p>
            </div>
            {/* Tabs */}
            <div className="absolute bottom-5 left-0 right-0 flex items-center justify-around px-5">
              {["🌸", "💬", "🎁", "💳", "⚙️"].map((icon, i) => (
                <div key={i} className={cn("text-base", i !== 0 && "opacity-25")}>{icon}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24 pb-10 px-6">
      <DotGrid />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,_rgba(244,63,94,0.15)_0%,_rgba(2,6,23,0.85)_60%,_rgb(2,6,23)_100%)]" />
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
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[84px] font-bold tracking-tight leading-[1.04] max-w-4xl"
        >
          Experience your{" "}
          <span className="bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 bg-clip-text text-transparent">
            computer
          </span>
          <br />
          like never before
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.65 }}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-xl leading-relaxed"
        >
          Ava speaks naturally, controls your Mac remotely, reads your screen,
          and remembers everything — from your phone. Available 24/7.
        </motion.p>

        {/* CTAs */}
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
            Android
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
          className="mt-3 text-xs text-slate-600"
        >
          Free to start · No credit card required
        </motion.p>

        {/* ── Dual Mockup: MacBook + iPhone ─── */}
        <motion.div
          initial={{ opacity: 0, y: 70, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 relative flex items-end justify-center"
        >
          {/* Shared glow */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-rose-500/10 via-transparent to-transparent blur-2xl pointer-events-none" />

          {/* MacBook — behind, left, gentle float */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="relative -mr-14 mb-6 z-0 hidden md:block"
            style={{ filter: "drop-shadow(0 40px 60px rgba(0,0,0,0.6))" }}
          >
            <MacBookMockup />
          </motion.div>

          {/* iPhone — front, right, faster float */}
          <motion.div
            animate={{ y: [0, -18, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="relative z-10"
            style={{ filter: "drop-shadow(0 40px 80px rgba(244,63,94,0.2))" }}
          >
            <IPhoneMockup />
          </motion.div>

          {/* Floating labels */}
          <motion.div
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-40 top-20 hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 shadow-xl text-xs text-white/80 whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Monitor size={12} className="text-violet-400" />
            </div>
            Remote Mac Control
          </motion.div>
          <motion.div
            animate={{ y: [4, -6, 4] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
            className="absolute -right-36 top-16 hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl backdrop-blur-xl bg-rose-500/10 border border-rose-500/20 shadow-xl text-xs text-rose-300 whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <Mic2 size={12} className="text-rose-400" />
            </div>
            Ultra-realistic Voice
          </motion.div>
          <motion.div
            animate={{ y: [-3, 7, -3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            className="absolute -right-40 bottom-24 hidden lg:flex items-center gap-2 px-3.5 py-2.5 rounded-2xl backdrop-blur-xl bg-white/[0.04] border border-white/10 shadow-xl text-xs text-white/80 whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Brain size={12} className="text-emerald-400" />
            </div>
            Persistent Memory
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Interactive Showcase ──────────────────────────────────────────────────────
// Animation steps:
//  0 = reset / idle
//  1 = phone: user message appears
//  2 = mac: terminal fires
//  3 = phone: Ava waveform + response

function ShowcasePhone({ step }: { step: number }) {
  return (
    <div className="relative mx-auto shrink-0" style={{ width: 200, height: 400 }}>
      {/* Glow */}
      <div className="absolute inset-x-6 inset-y-10 bg-rose-500/20 blur-2xl rounded-full pointer-events-none" />
      {/* Body */}
      <div className="relative w-full h-full rounded-[34px] bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-700 shadow-2xl shadow-black/50 overflow-hidden">
        {/* Buttons */}
        <div className="absolute -left-[3px] top-20 w-[2px] h-6 bg-slate-600 rounded-l-full" />
        <div className="absolute -left-[3px] top-28 w-[2px] h-8 bg-slate-600 rounded-l-full" />
        <div className="absolute -right-[3px] top-28 w-[2px] h-10 bg-slate-600 rounded-r-full" />
        {/* Screen */}
        <div className="absolute inset-[2px] rounded-[33px] bg-slate-950 overflow-hidden">
          {/* Dynamic Island */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-10" />
          {/* Status */}
          <div className="flex items-center justify-between px-5 pt-11 pb-0.5">
            <span className="text-[9px] text-white/60">9:41</span>
            <div className="flex gap-0.5 items-end h-2">
              {[2, 4, 6, 8].map((h, i) => (
                <div key={i} className="w-0.5 bg-white/50 rounded-sm" style={{ height: h }} />
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-col gap-2.5 px-3 pt-3 pb-16">
            {/* Header */}
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center">
                <span className="text-[10px]">🌸</span>
              </div>
              <span className="text-white text-[10px] font-semibold">Ava</span>
              <div className="ml-auto flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-[8px]">Live</span>
              </div>
            </div>

            {/* Step 1: user message */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  key="user-msg"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="self-end max-w-[85%]"
                >
                  <div className="px-3 py-2 rounded-2xl rounded-br-sm bg-rose-500 text-white text-[9px] leading-relaxed shadow-lg shadow-rose-500/20">
                    Ava, what&apos;s the latest file in my Mac&apos;s Downloads folder?
                  </div>
                  <p className="text-right text-[7px] text-slate-600 mt-1 pr-1">09:41</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: Ava response */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  key="ava-response"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="self-start max-w-[90%] flex flex-col gap-1.5"
                >
                  {/* Waveform */}
                  <div className="flex items-center gap-[2px] h-4 pl-1">
                    {[2, 4, 6, 9, 6, 11, 7, 4, 10, 6, 4, 8].map((h, i) => (
                      <motion.div
                        key={i}
                        className="w-0.5 rounded-full bg-rose-400"
                        style={{ height: h }}
                        animate={{ height: [h, h * 2, h] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.05, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                  <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-white/[0.06] border border-white/10 text-slate-300 text-[9px] leading-relaxed">
                    I found <span className="text-rose-400 font-semibold">image_receipt.png</span> — latest file from Apr 2. I&apos;ve just sent it to your screen. 📎
                  </div>
                  <p className="text-[7px] text-slate-600 pl-1">09:41</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Typing indicator (between steps 1 and 3) */}
            <AnimatePresence>
              {step === 2 && (
                <motion.div
                  key="typing"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="self-start flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-sm bg-white/[0.04] border border-white/8"
                >
                  {[0, 0.2, 0.4].map((delay) => (
                    <motion.div
                      key={delay}
                      className="w-1 h-1 rounded-full bg-slate-400"
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input bar */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.04] border border-white/10">
            <span className="text-slate-600 text-[9px] flex-1">Message Ava...</span>
            <div className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center">
              <Mic2 size={9} className="text-rose-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowcaseMac({ step }: { step: number }) {
  const terminalLines = [
    { text: "$ ls -la ~/Downloads", color: "text-slate-400", delay: 0 },
    { text: "total 96", color: "text-slate-500", delay: 0.15 },
    { text: "-rw-r--r--  1 user  staff   48K  Apr 01  invoice_mars.pdf", color: "text-slate-400", delay: 0.3 },
    { text: "-rw-r--r--  1 user  staff  2.1M  Apr 02  image_receipt.png", color: "text-white font-semibold", delay: 0.45 },
    { text: "→ Latest: image_receipt.png (Apr 02, 09:41)", color: "text-emerald-400", delay: 0.65 },
    { text: "→ Sending metadata to Ava...", color: "text-rose-400", delay: 0.85 },
  ];

  return (
    <div className="shrink-0" style={{ width: 420 }}>
      {/* Window chrome */}
      <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl shadow-black/50 bg-slate-950">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/90 border-b border-slate-800">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-400" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="flex-1 mx-3 px-3 py-1 rounded-md bg-slate-800 border border-slate-700">
            <span className="text-[10px] text-slate-400 font-mono">Terminal — zsh — 80×24</span>
          </div>
          <Terminal size={12} className="text-slate-500" />
        </div>

        {/* Terminal body */}
        <div className="p-4 h-56 font-mono text-[11px] leading-relaxed bg-slate-950 overflow-hidden">
          <AnimatePresence>
            {step >= 2 && (
              <motion.div
                key="terminal-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-0.5"
              >
                {terminalLines.map((line, i) => (
                  <motion.p
                    key={i}
                    className={line.color}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: line.delay, duration: 0.3 }}
                  >
                    {line.text}
                  </motion.p>
                ))}
                {/* Blinking cursor */}
                <motion.span
                  className="inline-block w-2 h-3 bg-white/80 align-middle ml-0.5 mt-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            )}

            {step < 2 && (
              <motion.div
                key="idle"
                className="flex flex-col gap-1 h-full justify-center items-center opacity-20"
              >
                <Terminal size={28} className="text-slate-500" />
                <p className="text-slate-500 text-[10px]">Waiting for command...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <AnimatePresence>
              {step >= 2 ? (
                <motion.div
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                  <span className="text-[9px] text-rose-400 font-mono">Ava executing...</span>
                </motion.div>
              ) : (
                <motion.div
                  key="idle-status"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  <span className="text-[9px] text-slate-600 font-mono">Idle</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <span className="text-[9px] text-slate-600 font-mono">macOS Sequoia · Ava Bridge</span>
        </div>
      </div>
    </div>
  );
}

function InteractiveShowcase() {
  const [step, setStep] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  // Start the loop once in view
  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    const run = async () => {
      while (!cancelled) {
        setStep(0);
        await wait(600);
        if (cancelled) break;
        setStep(1);           // user message
        await wait(2200);
        if (cancelled) break;
        setStep(2);           // mac terminal
        await wait(2800);
        if (cancelled) break;
        setStep(3);           // ava response
        await wait(4000);
        if (cancelled) break;
      }
    };

    run();
    return () => { cancelled = true; };
  }, [inView]);

  return (
    <section id="showcase" ref={ref} className="relative py-28 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,_rgba(244,63,94,0.06)_0%,_transparent_70%)] pointer-events-none" />
      <DotGrid className="opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto">
        <FadeUp className="text-center mb-16">
          <Badge variant="outline" className="mb-5">How it Works</Badge>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Your phone controls{" "}
            <span className="bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
              your Mac
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg max-w-lg mx-auto">
            Speak to Ava on your phone. She executes on your desktop — in real time.
          </p>
        </FadeUp>

        {/* Step indicator */}
        <FadeUp className="flex justify-center gap-3 mb-12" delay={0.1}>
          {[
            { n: 1, label: "You ask" },
            { n: 2, label: "Mac executes" },
            { n: 3, label: "Ava responds" },
          ].map(({ n, label }) => (
            <div key={n} className="flex items-center gap-2">
              <motion.div
                animate={{
                  backgroundColor: step >= n ? "rgb(244,63,94)" : "rgba(255,255,255,0.06)",
                  borderColor: step >= n ? "rgba(244,63,94,0.8)" : "rgba(255,255,255,0.1)",
                }}
                className="w-7 h-7 rounded-full border flex items-center justify-center text-[10px] font-bold text-white"
              >
                {n}
              </motion.div>
              <span className={cn("text-xs hidden sm:block transition-colors", step >= n ? "text-white" : "text-slate-600")}>
                {label}
              </span>
              {n < 3 && <div className="w-8 h-px bg-white/10 hidden sm:block" />}
            </div>
          ))}
        </FadeUp>

        {/* Main visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8"
        >
          {/* Phone */}
          <ShowcasePhone step={step} />

          {/* Connection arrows */}
          <div className="flex flex-col items-center gap-3 shrink-0">
            {/* Phone → Mac */}
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-rose-400"
                  animate={step === 1 || step === 2
                    ? { opacity: [0, 1, 0], x: [0, 4, 8] }
                    : { opacity: 0.15 }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
              <ArrowRight size={14} className={cn("transition-colors", step >= 2 ? "text-rose-400" : "text-slate-700")} />
            </div>

            {/* Label */}
            <div className="px-3 py-1.5 rounded-full border border-white/8 bg-white/[0.02] text-[10px] text-slate-500 whitespace-nowrap">
              P2P Bridge
            </div>

            {/* Mac → Phone (return) */}
            <div className="flex items-center gap-1 flex-row-reverse">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={step === 3
                    ? { opacity: [0, 1, 0], x: [0, -4, -8] }
                    : { opacity: 0.15 }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
              <ArrowRight size={14} className={cn("rotate-180 transition-colors", step === 3 ? "text-emerald-400" : "text-slate-700")} />
            </div>
          </div>

          {/* Mac terminal */}
          <ShowcaseMac step={step} />
        </motion.div>

        {/* Caption */}
        <FadeUp className="mt-12 text-center" delay={0.3}>
          <p className="text-slate-500 text-sm">
            The animation loops automatically — no interaction needed. This is exactly what happens in real time.
          </p>
        </FadeUp>
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
        className="absolute inset-0 pointer-events-none z-10"
        style={{ maskImage: "linear-gradient(to right, black, transparent 10%, transparent 90%, black)" }}
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

// ─── Features Bento ───────────────────────────────────────────────────────────

interface Feature {
  icon: React.ElementType;
  title: string;
  desc: string;
  cols: string;
  accentBg: string;
  accentIcon: string;
  accentOrb: string;
  visual?: React.ReactNode;
}

function WaveformVisual() {
  return (
    <div className="flex items-center gap-[3px] h-10 mt-3">
      {[3, 6, 11, 17, 11, 20, 14, 8, 18, 12, 6, 14, 9, 4, 16, 10].map((h, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-rose-400/60"
          style={{ height: h }}
          animate={{ height: [h, h * 1.9, h] }}
          transition={{ duration: 0.95, repeat: Infinity, delay: i * 0.055, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function TerminalVisual() {
  return (
    <div className="mt-3 w-full rounded-xl bg-slate-950/80 border border-white/8 overflow-hidden">
      <div className="flex gap-1.5 px-3 py-2 bg-slate-900/60 border-b border-white/5">
        <div className="w-2 h-2 rounded-full bg-red-500/70" />
        <div className="w-2 h-2 rounded-full bg-yellow-400/70" />
        <div className="w-2 h-2 rounded-full bg-green-500/70" />
      </div>
      <div className="p-3 font-mono text-[10px] leading-relaxed">
        <p className="text-slate-500">$ ava click &quot;Send&quot; in Slack</p>
        <p className="text-slate-400 mt-1">→ Found element: [button#send]</p>
        <p className="text-emerald-400/80">→ Clicked. Message sent ✓</p>
      </div>
    </div>
  );
}

function ScreenAnalysisVisual() {
  return (
    <div className="mt-3 w-full rounded-xl bg-slate-950/80 border border-white/8 p-3 text-[10px] font-mono leading-relaxed">
      <span className="text-slate-500">$ </span><span className="text-blue-400">ava analyze</span>
      <br />
      <span className="text-slate-400">→ Detected: Chrome open</span>
      <br />
      <span className="text-slate-400">→ Tab: &quot;Q4 Report - Notion&quot;</span>
      <br />
      <span className="text-rose-400/80">→ Summarizing page...</span>
    </div>
  );
}

function MemoryVisual() {
  const nodes = [
    { cx: 28, cy: 22, label: "Jordan" },
    { cx: 72, cy: 18, label: "Ava project" },
    { cx: 20, cy: 68, label: "French" },
    { cx: 68, cy: 62, label: "Mac M3" },
    { cx: 48, cy: 42, label: "Dev team" },
  ];
  return (
    <div className="relative mt-3 h-20 w-full overflow-hidden rounded-xl bg-slate-950/60 border border-white/5">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 80">
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b, j) => (
            <line key={`${i}-${j}`} x1={a.cx} y1={a.cy} x2={b.cx} y2={b.cy} stroke="rgba(52,211,153,0.12)" strokeWidth="0.6" />
          ))
        )}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.cx} cy={n.cy} r="2.5" fill="rgba(52,211,153,0.5)" />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-wrap gap-1 p-2 content-start">
        {nodes.map((n) => (
          <span key={n.label} className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px]">
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
    title: "Ultra-Realistic Native Voice",
    desc: "Gemini Live powers Ava — real-time barge-in, sub-100ms latency, natural emotion. iOS & Android native.",
    cols: "md:col-span-2",
    accentBg: "from-rose-500/10 to-transparent",
    accentIcon: "bg-rose-500/15 text-rose-400",
    accentOrb: "bg-rose-500/25",
    visual: <WaveformVisual />,
  },
  {
    icon: Monitor,
    title: "Remote Mac Control",
    desc: "Ava clicks, types, scrolls and automates your Mac — all from a voice command on your phone.",
    cols: "md:col-span-1",
    accentBg: "from-violet-500/10 to-transparent",
    accentIcon: "bg-violet-500/15 text-violet-400",
    accentOrb: "bg-violet-500/25",
    visual: <TerminalVisual />,
  },
  {
    icon: Eye,
    title: "Live Screen Analysis",
    desc: "Point Ava at your screen — she reads, summarizes, and acts on what&apos;s visible instantly.",
    cols: "md:col-span-1",
    accentBg: "from-blue-500/10 to-transparent",
    accentIcon: "bg-blue-500/15 text-blue-400",
    accentOrb: "bg-blue-500/25",
    visual: <ScreenAnalysisVisual />,
  },
  {
    icon: Brain,
    title: "Persistent Memory",
    desc: "Every detail you share is permanently remembered. Ava builds a growing model of you across sessions.",
    cols: "md:col-span-2",
    accentBg: "from-emerald-500/10 to-transparent",
    accentIcon: "bg-emerald-500/15 text-emerald-400",
    accentOrb: "bg-emerald-500/25",
    visual: <MemoryVisual />,
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Say it once — Ava schedules and fires push notifications at the exact right moment.",
    cols: "md:col-span-1",
    accentBg: "from-amber-500/10 to-transparent",
    accentIcon: "bg-amber-500/15 text-amber-400",
    accentOrb: "bg-amber-500/20",
  },
  {
    icon: Zap,
    title: "MCP Integrations",
    desc: "Connect Notion, GitHub, Brave and any JSON-RPC server. Your tools, your context, one voice.",
    cols: "md:col-span-1",
    accentBg: "from-cyan-500/10 to-transparent",
    accentIcon: "bg-cyan-500/15 text-cyan-400",
    accentOrb: "bg-cyan-500/20",
  },
  {
    icon: Shield,
    title: "Privacy-first",
    desc: "No training on your data. Supabase-backed, RLS-enabled. Your conversations stay yours.",
    cols: "md:col-span-1",
    accentBg: "from-slate-400/8 to-transparent",
    accentIcon: "bg-slate-400/12 text-slate-300",
    accentOrb: "bg-slate-400/15",
  },
  {
    icon: MessageSquare,
    title: "Silent Text Chat",
    desc: "Switch to text-only mode — full Ava intelligence, full memory, zero audio. Perfect for meetings.",
    cols: "md:col-span-2",
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
      whileHover={{ scale: 1.025, transition: { type: "spring", stiffness: 280, damping: 22 } }}
      className={cn(
        feature.cols,
        "group relative rounded-2xl border border-white/[0.07] hover:border-white/[0.15]",
        "transition-all duration-300 overflow-hidden cursor-default",
        `bg-gradient-to-br ${feature.accentBg}`,
        "backdrop-blur-sm"
      )}
    >
      {/* Hover orb */}
      <div className={cn(
        "absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none",
        feature.accentOrb
      )} />
      <div className={cn(
        "absolute -bottom-16 -left-10 w-52 h-52 rounded-full blur-3xl opacity-15 pointer-events-none",
        feature.accentOrb
      )} />

      <div className="relative p-6 flex flex-col gap-4 min-h-[200px]">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0", feature.accentIcon)}>
          <Icon size={22} />
        </div>
        <div>
          <h3 className="font-semibold text-white text-[17px] tracking-tight">{feature.title}</h3>
          <p className="mt-2 text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
        </div>
        {feature.visual && <div className="mt-auto">{feature.visual}</div>}
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
      "1 Hour of Voice / month",
      "Full Desktop Control",
      "5 min Screen Analysis / day",
      "Unlimited Text Chat",
      "Smart Reminders",
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
      "4 Hours of Voice / month",
      "Advanced P2P Desktop Control",
      "Unlimited Screen Analysis",
      "Priority Task Execution",
      "MCP server integrations",
      "Telegram bridge",
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
      "15 Hours of Voice / month",
      "Maximum Network Priority",
      "Unrestricted Control",
      "VIP Support",
      "Unlimited MCP servers",
      "Custom AI persona",
    ],
    cta: "Get Max",
    href: "https://call-ava.com",
  },
];

function Pricing() {
  return (
    <section id="pricing" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,_rgba(244,63,94,0.07)_0%,_transparent_70%)] pointer-events-none" />
      <div className="relative max-w-5xl mx-auto">
        <FadeUp className="text-center mb-20">
          <Badge variant="outline" className="mb-5">Pricing</Badge>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Simple, transparent plans
          </h2>
          <p className="mt-4 text-slate-400 text-lg">Start free. Upgrade when you&apos;re ready.</p>
        </FadeUp>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {plans.map((plan, i) => (
            <FadeUp key={plan.name} delay={i * 0.1}>
              <motion.div
                whileHover={!plan.popular ? { scale: 1.02, transition: { type: "spring", stiffness: 260, damping: 20 } } : {}}
                style={plan.popular ? { scale: 1.05 } : {}}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-8 transition-colors duration-300",
                  plan.popular
                    ? "border-rose-500 bg-gradient-to-b from-rose-500/[0.09] to-rose-500/[0.03] shadow-[0_0_40px_rgba(244,63,94,0.2)] z-10"
                    : "border-white/10 bg-white/[0.025] hover:border-white/20"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="px-4 py-1 text-[11px] font-bold shadow-xl shadow-rose-500/40 whitespace-nowrap">
                      ✦ Most Popular
                    </Badge>
                  </div>
                )}
                <p className="text-slate-400 text-sm font-medium tracking-wide">{plan.name}</p>
                <div className="mt-2 flex items-end gap-1.5">
                  <span className="text-[44px] font-bold leading-none text-white">{plan.price}€</span>
                  <span className="text-slate-500 text-sm mb-2">/mo</span>
                </div>
                <p className="mt-1.5 text-slate-500 text-sm">{plan.desc}</p>

                <div className="my-6 h-px bg-white/[0.07]" />

                <ul className="flex flex-col gap-3.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                        <Check size={9} className="text-rose-400" />
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
                      : "bg-white/[0.05] hover:bg-white/[0.09] text-white border border-white/10"
                  )}
                >
                  {plan.cta}
                </motion.a>
              </motion.div>
            </FadeUp>
          ))}
        </div>

        <FadeUp className="mt-10 text-center text-slate-600 text-sm" delay={0.3}>
          All plans billed monthly · Cancel anytime · 5 free credits / day on free tier
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
      <DotGrid className="opacity-25" />
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
            Join thousands of users who let Ava run their day. Free to start.
          </p>
        </FadeUp>
        <FadeUp delay={0.2} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <motion.a href="https://apps.apple.com" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-semibold shadow-2xl shadow-rose-500/35 transition-all">
            <Apple size={18} />iOS App
          </motion.a>
          <motion.a href="https://play.google.com" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white font-semibold transition-all">
            <Smartphone size={18} />Android App
          </motion.a>
          <motion.a href="https://call-ava.com" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2.5 px-8 py-4 rounded-2xl backdrop-blur-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white font-semibold transition-all">
            <Download size={18} />Mac Desktop
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
  const cols = [
    { title: "Download", links: [
      { label: "iOS App", href: "https://apps.apple.com" },
      { label: "Android App", href: "https://play.google.com" },
      { label: "Mac Desktop", href: "https://call-ava.com" },
    ]},
    { title: "Legal", links: [
      { label: "Terms", href: "https://call-ava.com/cgu" },
      { label: "Privacy", href: "https://call-ava.com/confidentialite" },
    ]},
    { title: "Community", links: [
      { label: "WhatsApp", href: "https://whatsapp.com/channel/0029VbCsZ3A6WaKv6TLkxO0r" },
      { label: "About Ava", href: "https://call-ava.com" },
    ]},
  ];

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
          {cols.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="text-slate-500 font-semibold text-[10px] uppercase tracking-widest">{col.title}</p>
              {col.links.map((l) => (
                <a key={l.label} href={l.href} className="text-slate-400 hover:text-white transition-colors">{l.label}</a>
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
      <InteractiveShowcase />
      <Marquee />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
