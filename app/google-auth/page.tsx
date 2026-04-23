"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

function GoogleAuthContent() {
  const searchParams = useSearchParams();
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams?.get('code');
    const state = searchParams?.get('state') || '';
    const error = searchParams?.get('error');

    let rawRedirectUrl = 'ava://google-auth';
    if (error) {
      rawRedirectUrl += `?error=${encodeURIComponent(error)}`;
    } else if (code) {
      rawRedirectUrl += `?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`;
    }
    
    setRedirectUrl(rawRedirectUrl);

    // Auto-redirect after a short delay
    const timer = setTimeout(() => {
      window.location.href = rawRedirectUrl;
    }, 800);

    return () => clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full bg-white/5 border border-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl relative z-10 flex flex-col items-center text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
          <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={2.5} />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Authentification Google</h1>
        <p className="text-zinc-400 mb-8 text-sm">
          Connexion établie avec succès ! Redirection vers l'application Ava...
        </p>

        <div className="flex flex-col items-center space-y-5 w-full">
          <div className="flex items-center space-x-3 text-zinc-300 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-sm font-medium">Ouverture en cours...</span>
          </div>

          <p className="text-xs text-zinc-500">
            Si rien ne se passe automatiquement, veuillez cliquer sur le bouton ci-dessous :
          </p>

          <a 
            href={redirectUrl || "#"}
            className="w-full relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl opacity-90 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-medium text-white shadow-xl">
              <span>Ouvrir l'application Ava</span>
              <ExternalLink className="w-4 h-4" />
            </div>
          </a>
        </div>
      </motion.div>
    </div>
  );
}

export default function GoogleAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09090b] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-zinc-500" /></div>}>
      <GoogleAuthContent />
    </Suspense>
  );
}
