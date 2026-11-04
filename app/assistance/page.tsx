'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppShell } from '@/components/app/AppShell'
import { bootstrapToUser } from '@/components/app/hooks/useUserData'
import { SUPABASE_HEADERS, SUPABASE_URL } from '@/components/app/constants'
import { resolvePermissions, type AppTab, type UserData } from '@/components/app/types'

type Credentials={user_id:string;web_session_token:string;admin_access_token:string;assistance_token:string}
export default function AssistancePage(){
 const [user,setUser]=useState<UserData|null>(null)
 const [message,setMessage]=useState('Connexion à la session Assistance…')
 const [inVm,setInVm]=useState(false)
 const credentials=useRef<Credentials|null>(null)
 const view=useRef({tab:'cloud' as AppTab,x:0.5,y:0.25,scroll:0,in_vm:false})
 const rawFetch=useRef<typeof fetch|null>(null)
 const sequence=useRef(0)
 const onViewChange=useCallback((tab:AppTab)=>{view.current.tab=tab;view.current.scroll=0},[])
 const call=useCallback(async(action:string,payload:Record<string,unknown>={})=>{
  if(!credentials.current||!rawFetch.current) throw new Error('Session Assistance absente.')
  return rawFetch.current(`${SUPABASE_URL}/functions/v1/admin-assistance`,{method:'POST',headers:SUPABASE_HEADERS,
   body:JSON.stringify({...credentials.current,action,...payload}),signal:AbortSignal.timeout(25000)})
 },[])
 const stop=useCallback(async()=>{
  await call('close').catch(()=>undefined)
  credentials.current=null;setUser(null);setMessage('Intervention terminée. Vous pouvez fermer cette fenêtre.')
 },[call])
 useEffect(()=>{
  const originalFetch=window.fetch.bind(window);rawFetch.current=originalFetch
  let alive=true,heartbeatPending=false,started=false
  const receive=async(event:MessageEvent)=>{
   if(event.origin!==window.location.origin||event.source!==window.opener||event.data?.type!=='ava-assistance-start'||started)return
   started=true;credentials.current=event.data.credentials
   try{
    const response=await call('control_start',{state:view.current,sequence:++sequence.current})
    const data=await response.json()
    if(!response.ok)throw new Error(data.error??'Contrôle impossible.')
    const next=bootstrapToUser(data.bootstrap,'assistance-proxy')
    if(alive)setUser({...next,is_admin:false})
   }catch(error){credentials.current=null;if(alive)setMessage(error instanceof Error?error.message:'Connexion impossible.')}
  }
  window.addEventListener('message',receive)
  window.opener?.postMessage({type:'ava-assistance-ready'},window.location.origin)
  // Only this dedicated window is proxied. No customer authentication token is ever stored here.
  window.fetch=async(input,init)=>{
   const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,window.location.href)
   if(url.origin!==new URL(SUPABASE_URL).origin||!url.pathname.startsWith('/functions/v1/'))return originalFetch(input,init)
   const route=url.pathname.slice('/functions/v1/'.length)
   if(route==='admin-assistance')return originalFetch(input,init)
   let body:Record<string,unknown>={}
   try{body=JSON.parse(typeof init?.body==='string'?init.body:'{}')}catch{}
   try{
    const response=await call('proxy',{route,request:body})
    if(route==='ava-cloud'&&body.action==='browser_session'&&response.ok){view.current.in_vm=true;setInVm(true)}
    return response
   }catch{return new Response(JSON.stringify({ok:false,error:'Session Assistance interrompue.'}),{status:409,headers:{'Content-Type':'application/json'}})}
  }
  const move=(event:PointerEvent)=>{view.current.x=event.clientX/window.innerWidth;view.current.y=event.clientY/window.innerHeight}
  const scroll=(event:Event)=>{const el=event.target;if(el instanceof HTMLElement&&el.scrollHeight>el.clientHeight)view.current.scroll=el.scrollTop/(el.scrollHeight-el.clientHeight)}
  window.addEventListener('pointermove',move);document.addEventListener('scroll',scroll,true)
  const timer=setInterval(async()=>{
   if(!credentials.current||heartbeatPending)return
   heartbeatPending=true
   try{const res=await call('heartbeat',{state:view.current,sequence:++sequence.current});if(!res.ok){await stop()}}
   catch{if(alive)setMessage('Connexion interrompue : le contrôle sera libéré automatiquement.')}
   finally{heartbeatPending=false}
  },600)
  const unload=()=>{if(credentials.current)void originalFetch(`${SUPABASE_URL}/functions/v1/admin-assistance`,{method:'POST',headers:SUPABASE_HEADERS,keepalive:true,body:JSON.stringify({...credentials.current,action:'close'})})}
  window.addEventListener('pagehide',unload)
  return()=>{alive=false;unload();clearInterval(timer);window.fetch=originalFetch;window.removeEventListener('message',receive);window.removeEventListener('pointermove',move);document.removeEventListener('scroll',scroll,true);window.removeEventListener('pagehide',unload)}
 },[call,stop])
 if(!user)return <main className="flex min-h-screen items-center justify-center bg-[#101112] p-8 text-center text-slate-200">{message}</main>
 return <div className="assistance-window bg-[#101112]">
  <header className="flex h-12 items-center justify-between gap-3 border-b border-blue-400/30 bg-[#14243b] px-4 text-xs text-white">
   <span><strong>Administrateur</strong> · {user.email} · session de 15 min</span>
   <div className="flex gap-3">{inVm&&<button onClick={()=>{view.current.in_vm=false;setInVm(false)}} className="rounded bg-blue-400/20 px-3 py-2">Retour à Ava Web</button>}<button onClick={()=>void stop()} className="rounded bg-white/15 px-3 py-2 font-bold">Terminer l’intervention</button></div>
  </header>
  <style>{'.assistance-window #ava-workspace {height:calc(100dvh - 48px)}'}</style>
  <AppShell user={user} permissions={resolvePermissions(user)} onLogout={()=>void stop()} onUpdatePin={async()=>({ok:false,error:'La modification des identifiants est réservée au titulaire.'})} onRefresh={()=>undefined} assistance onViewChange={onViewChange}/>
 </div>
}
