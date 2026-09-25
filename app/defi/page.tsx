'use client'
import {useState} from 'react'
import Link from 'next/link'
import {DefiTab} from '@/components/app/tabs/DefiTab'
export default function DefiPage(){
 const [language,setLanguage]=useState('fr')
 return <main className="min-h-screen bg-slate-950"><div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-sm"><Link href="/app/?tab=defi" className="text-slate-300">Ava · {language==='fr'?'Mon compte':'My account'}</Link><button className="rounded-lg border border-white/10 px-3 py-2 text-slate-300" onClick={()=>setLanguage(language==='fr'?'en':'fr')}>{language==='fr'?'English':'Français'}</button></div><DefiTab language={language}/></main>
}
