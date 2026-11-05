'use client'
import { useEffect, useRef, useState } from 'react'
import { ShieldCheck, RefreshCw } from 'lucide-react'
type Call=(body:Record<string,unknown>)=>Promise<Record<string,unknown>>
type RequestRow={id:string;instance_id:string;status:string;expires_at:string;mine:boolean}
const button='rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-40'
export function DesktopAssistance({call,target,reason,instance}:{call:Call;target:string;reason:string;instance:string}) {
 const [rows,setRows]=useState<RequestRow[]>([]),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 const active=useRef(''),callRef=useRef(call),reasonRef=useRef(reason);callRef.current=call;reasonRef.current=reason
 const permitted=reason.trim().length>=10
 const invoke=(command:string,extra:Record<string,unknown>={})=>callRef.current({action:`client_assistance_${command}`,target_user_id:target,reason:reasonRef.current,...extra})
 useEffect(()=>{
  if(!permitted) return
  let disposed=false,inflight=false
  const refresh=async()=>{if(inflight)return;inflight=true;try {
   if(active.current) await invoke('heartbeat',{request_id:active.current})
   const result=await invoke('list');if(!disposed)setRows((result.requests as RequestRow[]).filter(r=>r.instance_id===instance))
  }catch{if(!disposed){active.current='';setNotice('La liaison d’assistance est interrompue. Actualisez avant de reprendre.')}}finally{inflight=false}}
  void refresh();const timer=window.setInterval(refresh,8000)
  return()=>{disposed=true;window.clearInterval(timer);if(active.current)void invoke('close',{request_id:active.current}).catch(()=>{});active.current=''}
  // The target and instance determine the entire lifetime of this console.
  // eslint-disable-next-line react-hooks/exhaustive-deps
 },[target,instance,permitted])
 const refresh=async()=>{setBusy(true);try{const result=await invoke('list');setRows((result.requests as RequestRow[]).filter(r=>r.instance_id===instance));setNotice('')}catch{setNotice('Assistance indisponible. Vérifiez que la version compatible est installée.')}finally{setBusy(false)}}
 const act=async(row:RequestRow,close=false)=>{setBusy(true);setNotice('');try{await invoke(close?'close':'approve',{request_id:row.id,...(!close?{code}: {})});active.current=close?'':row.id;setCode('');setNotice(close?'Assistance terminée.':'Assistance autorisée. Gardez cette page ouverte pendant l’intervention.');const result=await invoke('list');setRows((result.requests as RequestRow[]).filter(r=>r.instance_id===instance))}catch(e){const msg=e instanceof Error?e.message:'';setNotice(msg==='ASSISTANCE_CODE_INVALID'?'Le code ne correspond pas à cette demande.':'La demande est expirée, utilisée ou indisponible. Créez-en une nouvelle dans Ava Desktop.')}finally{setBusy(false)}}
 return <section className="space-y-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
  <div className="flex flex-wrap items-center justify-between gap-3"><h4 className="flex items-center gap-2 font-semibold"><ShieldCheck size={18} className="text-rose-300"/>Assistance Ava Desktop</h4><button className={button} disabled={busy||!permitted} onClick={()=>void refresh()} aria-label="Actualiser les demandes d’assistance"><RefreshCw size={16}/></button></div>
  <p className="max-w-2xl text-sm leading-6 text-slate-400">Dans Ava Desktop sur cette machine, choisissez « Assistance administrateur », puis créez une demande. Saisissez ici le code affiché.</p>
  {!rows.length&&<p className="text-sm text-slate-400">Aucune demande en cours.</p>}
  {rows.some(r=>r.status==='pending')&&<label className="block text-sm text-slate-300">Code affiché dans Ava Desktop<input autoComplete="off" spellCheck={false} maxLength={19} value={code} onChange={e=>setCode(e.target.value.toUpperCase())} className="ops-input mt-2 max-w-sm font-mono" placeholder="0000 0000 0000 0000"/></label>}
  {rows.map(row=><div key={row.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3"><p className="text-sm">{row.status==='pending'?'Demande en attente':'Assistance active'}<span className="block text-xs text-slate-400">Expire à {new Date(row.expires_at).toLocaleTimeString('fr-FR')}</span></p>{row.status==='pending'?<button className={`${button} bg-rose-600/30`} disabled={busy||!permitted||!/^[A-F0-9]{16}$/.test(code.replace(/[\s-]/g,''))} onClick={()=>void act(row)}>Autoriser pendant 15 min maximum</button>:<button className={button} disabled={busy} onClick={()=>void act(row,true)}>Révoquer l’accès</button>}</div>)}
  <p className="max-w-2xl text-xs leading-5 text-slate-400">L’administrateur peut consulter, configurer et piloter Ava Volatility. À la fin de l’accès ou si cette page est fermée, le moteur piloté pendant l’intervention s’arrête ; les positions restent ouvertes dans MT5.</p>
  {notice&&<p role="status" className="text-sm text-amber-200">{notice}</p>}
 </section>
}
