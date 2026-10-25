'use client'
import {useEffect,useState} from 'react'
import {motion} from 'framer-motion'
import {ArrowUpRight,ShieldCheck} from 'lucide-react'
import {useUserData} from '@/components/app/hooks/useUserData'
import {LoginScreen} from '@/components/app/LoginScreen'
import {supabaseAuth} from '@/components/app/services/supabaseAuth'
import {SUPABASE_URL,SUPABASE_ANON_KEY} from '@/components/app/constants'
import {loginTranslations} from './translations'
const copy={
 fr:['Continuer vers Noverive','Votre compte Ava. Un nouveau monde.','Seule votre identité est transmise au jeu. Vos abonnements et vos soldes Ava restent séparés.','Connexion…','Changer de compte','La connexion a expiré. Reprenez depuis Noverive.','Retour à Noverive','Connexion sécurisée'],
 en:['Continue to Noverive','Your Ava account. A new world.','Only your identity is shared with the game. Your Ava subscriptions and balances stay separate.','Connecting…','Switch account','This sign-in expired. Start again from Noverive.','Back to Noverive','Secure sign-in'],
 es:['Continuar a Noverive','Tu cuenta Ava. Un mundo nuevo.','Solo tu identidad se comparte con el juego. Tus suscripciones y saldos de Ava permanecen separados.','Conectando…','Cambiar de cuenta','La conexión ha caducado. Vuelve a empezar desde Noverive.','Volver a Noverive','Conexión segura'],
 de:['Weiter zu Noverive','Dein Ava-Konto. Eine neue Welt.','Nur deine Identität wird an das Spiel übermittelt. Ava-Abonnements und Guthaben bleiben getrennt.','Verbindung…','Konto wechseln','Die Anmeldung ist abgelaufen. Starte erneut bei Noverive.','Zurück zu Noverive','Sichere Anmeldung']
}
type Language=keyof typeof copy
export default function NoveriveConnect(){
 const auth=useUserData(),[lang,setLang]=useState<Language>('fr'),[state,setState]=useState<string|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(false)
 useEffect(()=>{const q=new URLSearchParams(location.search),l=q.get('lang')||'fr';setLang(l in copy?l as Language:'fr');const c=q.get('state');setState(c&&/^[-_a-zA-Z0-9]{43}$/.test(c)?c:'')},[])
 useEffect(()=>{document.documentElement.lang=lang},[lang])
 const t=copy[lang]
 async function connect(){
  if(busy||!state||!auth.user)return
  setBusy(true);setError(false)
  try{
   const {data,error}=await supabaseAuth.auth.getSession();if(error||!data.session)throw Error()
   const response=await fetch(SUPABASE_URL+'/functions/v1/ava-terra-identity',{method:'POST',headers:{'Content-Type':'application/json',apikey:SUPABASE_ANON_KEY,Authorization:'Bearer '+data.session.access_token},body:JSON.stringify({challenge:state})})
   if(!response.ok)throw Error();const result=await response.json();if(typeof result.assertion!=='string')throw Error()
   // Ava's access token stays on Ava. Only the dedicated 5-minute game
   // assertion travels in a POST body to the fixed, allowlisted destination.
   const form=document.createElement('form');form.method='POST';form.action='https://noverive.com/auth/complete?lang='+lang
   const input=document.createElement('input');input.type='hidden';input.name='assertion';input.value=result.assertion;form.append(input);document.body.append(form);form.submit()
  }catch{setError(true);setBusy(false)}
 }
 if(state===null)return null
 if(state&&!auth.user)return <LoginScreen language={lang} translations={loginTranslations[lang]} loading={auth.loginLoading} error={auth.loginError} onOtpRequest={auth.requestOtp} onOtpVerify={auth.verifyOtp} onMfaVerify={auth.verifyMfa}/>
 return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
  <motion.section initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-8 sm:p-12">
   <div className="flex items-center justify-between"><span className="text-sm font-semibold tracking-widest text-rose-400">AVA → NOVERIVE</span><ShieldCheck className="text-rose-400" aria-label={t[7]}/></div>
   <h1 className="mt-8 text-3xl font-black tracking-tight">{t[1]}</h1><p className="mt-4 leading-relaxed text-slate-400">{t[2]}</p>
   {state&&<><p className="mt-6 break-all text-sm text-slate-300">{auth.user?.email}</p><button onClick={connect} disabled={busy} className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-rose-500 px-5 py-4 font-semibold disabled:opacity-50">{busy?t[3]:t[0]}<ArrowUpRight size={20}/></button><button onClick={()=>void auth.logout()} className="mt-5 text-sm text-slate-400 underline">{t[4]}</button></>}
   {(!state||error)&&<p role="alert" className="mt-5 text-rose-400">{t[5]}</p>}
   <a href={'https://noverive.com/?lang='+lang} className="mt-6 block text-sm text-slate-400 underline">{t[6]}</a>
  </motion.section>
 </main>
}
