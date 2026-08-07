"use client";

import Script from "next/script";
import { ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (target: string | HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type ChallengeConfig = {
  siteKey: string;
  action: "ava_desktop_otp";
  state: string;
};

function readChallengeConfig(): ChallengeConfig | null {
  const params = new URLSearchParams(window.location.search);
  const siteKey = params.get("sitekey")?.trim() ?? "";
  const action = params.get("action")?.trim() ?? "";
  const state = params.get("state")?.trim() ?? "";
  if (!/^[A-Za-z0-9_-]{10,100}$/.test(siteKey)) return null;
  if (action !== "ava_desktop_otp") return null;
  if (!/^[A-Za-z0-9_-]{32,80}$/.test(state)) return null;
  return { siteKey, action, state };
}

export default function SecurityCheckPage() {
  const [config, setConfig] = useState<ChallengeConfig | null>(null);
  const [error, setError] = useState("");
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    const parsed = readChallengeConfig();
    if (!parsed) setError("Cette demande de vérification est invalide. Fermez cette fenêtre et réessayez depuis Ava Desktop.");
    setConfig(parsed);
  }, []);

  const renderWidget = useCallback(() => {
    if (!config || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render("#ava-turnstile", {
      sitekey: config.siteKey,
      action: config.action,
      theme: "dark",
      size: "flexible",
      appearance: "always",
      callback: (token: string) => {
        const callback = new URL("/security-check/callback/", window.location.origin);
        callback.hash = new URLSearchParams({ token, state: config.state }).toString();
        window.location.assign(callback.toString());
      },
      "error-callback": () => {
        setError("La vérification n’a pas pu démarrer. Vérifiez votre connexion puis réessayez.");
      },
      "expired-callback": () => {
        setError("La vérification a expiré. Fermez cette fenêtre puis relancez l’envoi du code.");
      },
      "timeout-callback": () => {
        setError("La vérification a pris trop de temps. Fermez cette fenêtre puis réessayez.");
      },
    });
  }, [config]);

  useEffect(() => {
    renderWidget();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [renderWidget]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020617] px-5 py-10 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(244,63,94,0.16),transparent_42%)]" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-center shadow-2xl shadow-rose-500/10 backdrop-blur-xl sm:p-9">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
          <ShieldCheck size={26} />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">Ava Security</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">Vérification anti-robot</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Cette vérification protège les comptes Ava lorsqu’une demande de code ressemble à une campagne automatisée.
        </p>

        <div className="mt-7 min-h-20 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          {config && <div id="ava-turnstile" className="mx-auto w-full" />}
          {!config && !error && <p className="py-4 text-sm text-slate-500">Préparation de la vérification…</p>}
        </div>

        {error && (
          <p role="alert" className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm leading-relaxed text-rose-200">
            {error}
          </p>
        )}
        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          Aucun mot de passe, code e-mail ou secret Supabase n’est transmis à cette page.
        </p>
      </section>

      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={renderWidget}
      />
    </main>
  );
}
