'use client'

import {useEffect, useState} from 'react'
import {motion} from 'framer-motion'
import {useUserData} from '@/components/app/hooks/useUserData'
import {LoginScreen} from '@/components/app/LoginScreen'
import {supabaseAuth} from '@/components/app/services/supabaseAuth'

const MARKET_ORIGIN = 'https://market.call-ava.com'

export default function MarketConnect() {
 const auth = useUserData()
 const [english,setEnglish]=useState(false)
 const t=(fr:string,en:string)=>english?en:fr
 useEffect(()=>{let saved='';try{saved=localStorage.getItem('ava-language')||''}catch{}const language=new URLSearchParams(location.search).get('lang')||saved||navigator.language;setEnglish(language.startsWith('en'));try{localStorage.setItem('ava-language',language.startsWith('en')?'en':'fr')}catch{}},[])
 useEffect(()=>{document.documentElement.lang=english?'en':'fr'},[english])
 const [state,setState] = useState<string|null>(null)
 const [sent,setSent] = useState(false)
 const [busy,setBusy] = useState(false)
 const [error,setError] = useState('')
 useEffect(()=>{const value=new URLSearchParams(location.search).get('state');setState(value&&/^[a-f0-9]{64}$/.test(value)?value:'')},[])
 async function connect() {
  if(busy)return
  if(!state||!auth.user){setError(t("Reprenez la connexion depuis Ava DEX.","Start sign-in again from Ava DEX."));return}
  setBusy(true);setError('')
  try {
   const {data,error}=await supabaseAuth.auth.getSession()
   if(error||!data.session)throw Error()
   // Complete by same-site POST navigation: no popup/opener dependency, token
   // in the request body only, cookie-bound state still checked by the server.
   const form=document.createElement('form')
   form.method='POST';form.action=MARKET_ORIGIN+'/auth/complete'
   for(const [name,value] of Object.entries({state,token:data.session.access_token,lang:english?'en':'fr'})){
    const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.append(input)
   }
   document.body.append(form);setSent(true);form.submit()
  }catch{setError(t('La connexion a expiré. Reconnectez-vous à votre compte Ava.','Your session expired. Sign in to your Ava account again.'))}
  finally{setBusy(false)}
 }
 if(state===null)return null
 if(!state)return <main className="min-h-screen bg-slate-950 p-8 text-white">{t('Ouvrez la connexion depuis Ava DEX.','Open sign-in from Ava DEX.')}</main>
 if(!auth.user)return <LoginScreen language={english?'en':'fr'} loading={auth.loginLoading} error={auth.loginError} onOtpRequest={auth.requestOtp} onOtpVerify={auth.verifyOtp} onMfaVerify={auth.verifyMfa}/>
 return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
  <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
   <div className="flex items-center justify-between"><p className="text-sm font-semibold text-rose-400">Ava DEX</p><button type="button" aria-label={english?'Passer en français':'Switch to English'} className="text-xs text-slate-400" onClick={()=>{setEnglish(!english);try{localStorage.setItem('ava-language',english?'fr':'en')}catch{}}}>{english?'FR':'EN'}</button></div>
   <h1 className="mt-3 text-2xl font-bold">{t('Continuer avec mon compte Ava','Continue with my Ava account')}</h1>
   <p className="mt-4 text-slate-400">{auth.user.email}</p>
   <p className="mt-4 leading-relaxed text-slate-400">{t('Votre compte et votre abonnement, au même endroit. Votre wallet reste sous votre contrôle.','Your account and subscription, together. Your wallet stays under your control.')}</p>
   {sent?<p role="status" className="mt-6 text-slate-300">{t('Ouverture d’Ava DEX…','Opening Ava DEX…')}</p>:<button disabled={busy} onClick={connect} className="mt-6 w-full rounded-xl bg-rose-500 px-5 py-3 font-semibold disabled:opacity-50">{busy?t('Connexion…','Connecting…'):t('Continuer vers Ava DEX','Continue to Ava DEX')}</button>}
   {error&&<p role="alert" className="mt-4 text-rose-400">{error}</p>}
   <button onClick={()=>{setSent(false);void auth.logout()}} className="mt-5 text-sm text-slate-400 underline">{t('Changer de compte','Switch account')}</button>
  </motion.section>
 </main>
}
