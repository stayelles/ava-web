'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ArrowUpRight, Check, ChevronDown, Layers, X } from 'lucide-react'
import s from './SubscriptionDesign.module.css'

export const PLAN_STYLE = {
  custom_pro: { tone: 'pro', name: 'Pro', tag: 'L’essentiel avancé', enTag: 'Advanced essentials', description: 'Plus de liberté dans vos réglages.', enDescription: 'More freedom in your settings.', capacity: '1 000 – 3 000 €', features: ['Limites personnalisées', 'Automatisations avancées', 'Configuration flexible', 'Support prioritaire'], enFeatures: ['Custom limits', 'Advanced automation', 'Flexible configuration', 'Priority support'] },
  custom_ultra: { tone: 'ultra', name: 'Ultra', tag: 'Usage intensif', enTag: 'Intensive use', description: 'Davantage de capacité, à votre rythme.', enDescription: 'More capacity, at your own pace.', capacity: '3 000 – 8 000 €', features: ['Tout Pro inclus', 'Limites élevées', 'Automatisations étendues', 'Support très prioritaire'], enFeatures: ['Everything in Pro', 'Higher limits', 'Extended automation', 'Higher priority support'] },
  custom_max: { tone: 'max', name: 'Max', tag: 'Toute la puissance', enTag: 'Full power', description: 'L’expérience Ava à pleine capacité.', enDescription: 'The full-capacity Ava experience.', capacity: '8 000 € +', features: ['Tout Ultra inclus', 'Limites maximales', 'Automatisations premium', 'Accompagnement direct'], enFeatures: ['Everything in Ultra', 'Maximum limits', 'Premium automation', 'Direct support'] },
  custom_max_2: { tone: 'special', name: 'Spécial', tag: 'Accès exclusif', enTag: 'Exclusive access', description: 'Des possibilités et un suivi exclusifs.', enDescription: 'Exclusive capabilities and support.', capacity: 'Personnalisé', features: ['Tout Max inclus', 'Cycles Ava Alpha avancés', 'STOP, LIMIT et STOP-LIMIT', 'Accompagnement exclusif'], enFeatures: ['Everything in Max', 'Advanced Ava Alpha cycles', 'STOP, LIMIT and STOP-LIMIT', 'Exclusive support'] },
} as const
export type DisplayPlanKey = keyof typeof PLAN_STYLE

export function PlanCard({ planKey, price, period, note, label, onChoose, disabled, active, selected, english = false, configuration }: {
  planKey: DisplayPlanKey; price: string; period: string; note: string; label: string
  onChoose: () => void; disabled?: boolean; active?: boolean; selected?: boolean; english?: boolean; configuration?: ReactNode
}) {
  const p = PLAN_STYLE[planKey]
  const [expanded,setExpanded]=useState(false)
  const features=english?p.enFeatures:p.features
  const extrasId=useId()
  return <article className={`${s.planCard} ${s[p.tone]} ${selected ? s.selectedCard : ''}`} aria-label={`${planKey === 'custom_max_2' ? '' : 'Custom '}${english && planKey === 'custom_max_2' ? 'Special' : p.name}`}>
    <div className={s.planHeading}>
      <div className={s.cardTopline}><span>{planKey === 'custom_max_2' ? 'AVA' : 'AVA CUSTOM'}</span><span className={s.planTag}>{active ? (english ? 'Your plan' : 'Votre formule') : english ? p.enTag : p.tag}</span></div>
      <h3>{english && planKey === 'custom_max_2' ? 'Special' : p.name}<span className={s.planGlyph} aria-hidden><Layers size={21}/></span></h3>
      <p>{english ? p.enDescription : p.description}</p>
    </div>
    <div className={s.cardConfiguration}>{configuration || <div className={s.monthlyInfo}><h4>{english?'YOUR ACCESS':'VOTRE ACCÈS'}</h4><dl><div><dt>{english?'Duration':'Durée'}</dt><dd>{english?'1 month':'1 mois'}</dd></div><div><dt>{english?'Payment':'Paiement'}</dt><dd>{english?'Card or crypto':'Carte ou crypto'}</dd></div><div><dt>{english?'AI key':'Clé IA'}</dt><dd>{english?'Personal':'Personnelle'}</dd></div><div><dt>{english?'Suggested capital':'Capital conseillé'}</dt><dd>{p.capacity}</dd></div></dl></div>}</div>
    <div className={s.priceBlock}>
      <div className={s.priceLine}><strong className={price.length > 11 ? s.textPrice : ''}>{price}</strong><span>{period}</span></div>
      <p>{note}</p>
    </div>
    <button type="button" className={s.planButton} onClick={onChoose} disabled={disabled || active}>
      {active ? <><Check size={16}/>{english ? 'Current plan' : 'Formule active'}</> : <>{label}<ArrowUpRight size={17}/></>}
    </button>
    <div className={s.cardContents}>
      <div className={s.featureBox}>
        <h4>{english ? 'INCLUDED IN YOUR PLAN' : 'DANS VOTRE FORMULE'}</h4>
        <ul>{features.slice(0,2).map(feature => <li key={feature}><Check size={14}/><span>{feature}</span></li>)}</ul>
        <ul id={extrasId} className={`${s.extraFeatures} ${expanded?s.featuresExpanded:''}`}>{features.slice(2).map(feature=><li key={feature}><Check size={14}/><span>{feature}</span></li>)}</ul>
        <button type="button" className={s.showMore} aria-expanded={expanded} aria-controls={extrasId} onClick={()=>setExpanded(v=>!v)}><ChevronDown size={13}/>{expanded?(english?'Show less':'Voir moins'):(english?'Show more':'Voir plus')}</button>
      </div>
      <div className={s.cardFooter}><Check size={13}/>{english ? 'Ava Desktop included' : 'Ava Desktop inclus'}<span>MT4 / MT5</span></div>
    </div>
  </article>
}

/** Native dialog provides focus containment, Escape and focus restoration. */
export function BillingDialog({ title, subtitle, tone = 'max', onClose, busy = false, children }: {
  title: string; subtitle: string; tone?: string; onClose: () => void; busy?: boolean; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  useEffect(() => {
    const dialog = ref.current
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog?.showModal()
    return () => { dialog?.close(); previous?.focus() }
  }, [])
  return createPortal(<dialog ref={ref} className={`${s.dialog} ${s[tone] || s.max}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); if (!busy) onClose() }}
    onClick={event => { if (event.target === event.currentTarget && !busy) onClose() }}>
    <div className={s.dialogInner}>
      <header className={s.dialogHeader}><div><p>{subtitle}</p><h2 id={titleId}>{title}</h2></div><button type="button" autoFocus onClick={onClose} disabled={busy} aria-label="Fermer / Close" className={s.closeButton}><X size={19}/></button></header>
      {children}
    </div>
  </dialog>, document.body)
}
