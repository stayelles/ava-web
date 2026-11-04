'use client'
import { useEffect, useState } from 'react'
import { MousePointer2, ShieldCheck } from 'lucide-react'
import { SUPABASE_HEADERS, SUPABASE_URL } from '../constants'
import type { AppTab, UserData } from '../types'

type Presence = { session_id: string; lock_until: string; state: { tab: AppTab; x: number; y: number; scroll: number; in_vm?: boolean } }
export function AssistancePresence({ user, onNavigate }: { user: UserData; onNavigate: (tab: AppTab) => void }) {
 const [presence, setPresence] = useState<Presence | null>(null)
 useEffect(() => {
  let alive=true, pending=false
  const poll=async()=>{
   if(pending) return
   pending=true
   try {
    const response=await fetch(`${SUPABASE_URL}/functions/v1/ava-client-data`,{method:'POST',headers:SUPABASE_HEADERS,
      body:JSON.stringify({action:'assistance_presence',user_id:user.id,ava_session_token:user.ava_session_token??user.web_session_token}),signal:AbortSignal.timeout(5000)})
    const data=await response.json()
    if(alive&&response.ok) setPresence(data.presence??null)
   } catch {} finally {pending=false}
  }
  void poll(); const timer=setInterval(()=>void poll(),1200)
  return()=>{alive=false;clearInterval(timer)}
 },[user.id,user.web_session_token,user.ava_session_token])
 useEffect(()=>{
  if(!presence) return
  const remaining=Date.parse(presence.lock_until)-Date.now()
  if(remaining<=0){setPresence(null);return}
  const timer=setTimeout(()=>setPresence(null),remaining)
  return()=>clearTimeout(timer)
 },[presence])
 useEffect(()=>{
  const root=document.getElementById('ava-workspace')
  if(root) root.inert=Boolean(presence)
  if(presence) onNavigate(presence.state.tab)
  return()=>{if(root) root.inert=false}
 },[presence,onNavigate])
 useEffect(()=>{
  if(!presence||presence.state.in_vm) return
  const targets=Array.from(document.querySelectorAll<HTMLElement>('#ava-workspace *')).filter(el=>el.scrollHeight>el.clientHeight+30&&/(auto|scroll)/.test(getComputedStyle(el).overflowY))
  const scroller=targets.sort((a,b)=>b.clientHeight-a.clientHeight)[0]
  if(scroller) scroller.scrollTop=presence.state.scroll*(scroller.scrollHeight-scroller.clientHeight)
 },[presence])
 if(!presence) return null
 return <div className="fixed inset-0 z-[9998] cursor-wait" role="status" aria-live="polite" aria-label="Intervention administrateur en cours">
  <div className="absolute left-1/2 top-3 flex max-w-[95vw] -translate-x-1/2 items-center gap-3 rounded-2xl border border-blue-300/30 bg-[#17243b] px-5 py-3 text-white shadow-2xl">
   <ShieldCheck size={21} className="shrink-0 text-blue-300"/><div><strong className="text-sm">Administrateur connecté</strong><p className="text-xs text-blue-100/70">{presence.state.in_vm?'Intervention sur votre machine Ava Cloud.':'Votre espace est temporairement réservé à l’assistance.'}</p></div>
  </div>
  {!presence.state.in_vm&&<div className="pointer-events-none absolute flex items-start text-blue-300" style={{left:`${presence.state.x*100}%`,top:`${presence.state.y*100}%`,transition:'left 120ms linear,top 120ms linear'}}>
   <MousePointer2 size={25} fill="#6398ff" stroke="white"/><span className="mt-5 rounded-md bg-blue-500 px-2 py-1 text-[11px] font-bold text-white shadow-lg">Administrateur</span>
  </div>}
 </div>
}
