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
 useEffect(()=>setEnglish((localStorage.getItem('ava-language')||navigator.language).startsWith('en')),[])
 const [state,setState] = useState<string|null>(null)
 const [sent,setSent] = useState(false)
 const [busy,setBusy] = useState(false)
 const [error,setError] = useState('')
 useEffect(()=>{const value=new URLSearchParams(location.search).get('state');setState(value&&/^[a-f0-9]{64}$/.test(value)?value:'')},[])
 async function connect() {
  if(!state||!window.opener||!auth.user||busy)return
  setBusy(true);setError('')
  try {
   const {data,error}=await supabaseAuth.auth.getSession()
   if(error||!data.session)throw Error()
   // No token in a URL, log, or shared parent-domain cookie. Ava Market verifies
   // this JWT with Ava's server and binds it to its own one-time login state.
   window.opener.postMessage({type:'ava-market-auth',state,token:data.session.access_token},MARKET_ORIGIN)
   setSent(true)
  }catch{setError(t('La connexion a expiré. Reconnectez-vous à votre compte Ava.','Your session expired. Sign in to your Ava account again.'))}
  finally{setBusy(false)}
 }
 if(state===null)return null
 if(!state)return <main className="min-h-screen bg-slate-950 p-8 text-white">{t('Ouvrez la connexion depuis Ava Market.','Open sign-in from Ava Market.')}</main>
 if(!auth.user)return <LoginScreen loading={auth.loginLoading} error={auth.loginError} onOtpRequest={auth.requestOtp} onOtpVerify={auth.verifyOtp} onMfaVerify={auth.verifyMfa}/>
 return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
  <motion.section initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl">
   <p className="text-sm font-semibold text-rose-400">Ava Market</p>
   <h1 className="mt-3 text-2xl font-bold">{t('Continuer avec mon compte Ava','Continue with my Ava account')}</h1>
   <p className="mt-4 text-slate-400">{auth.user.email}</p>
   <p className="mt-4 leading-relaxed text-slate-400">{t('Votre abonnement sera reconnu dans Ava Market. Votre wallet et les signatures restent sous votre contrôle.','Your subscription will be recognized in Ava Market. Your wallet and signatures stay under your control.')}</p>
   {sent?<p role="status" className="mt-6 text-slate-300">{t('Connexion transmise. Revenez à Ava Market.','Sign-in sent. Return to Ava Market.')}</p>:<button disabled={busy} onClick={connect} className="mt-6 w-full rounded-xl bg-rose-500 px-5 py-3 font-semibold disabled:opacity-50">{busy?t('Connexion…','Connecting…'):t('Continuer vers Ava Market','Continue to Ava Market')}</button>}
   {error&&<p role="alert" className="mt-4 text-rose-400">{error}</p>}
   <button onClick={()=>{setSent(false);void auth.logout()}} className="mt-5 text-sm text-slate-400 underline">{t('Changer de compte','Switch account')}</button>
  </motion.section>
 </main>
}
