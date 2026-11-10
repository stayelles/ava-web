'use client'

import { useCallback, useEffect, useState } from 'react'
import { CreditCard, Coins, Loader2, ShieldCheck, ArrowRight, Info, CirclePause, Monitor } from 'lucide-react'
import { BillingDialog, PlanCard, type DisplayPlanKey } from './SubscriptionDesign'
import style from './SubscriptionDesign.module.css'
import { SUPABASE_HEADERS, SUPABASE_URL } from './constants'
import type { UserData } from './types'

export type PrepaidOffer = {
  plan_key: 'custom_max' | 'custom_max_2'; offer_key: 'week' | 'split_2' | 'split_3' | 'split_4'
  amount_minor: number; total_minor: number | null; currency: string; payment_count: number | null
  period_days: number[]; billing_days: number; terms_version: string
}
type Contract = {
  id: string; plan_key: string; offer_key: string; provider: 'whop' | 'nowpayments'
  amount_minor: number; paid_count: number; payment_count: number | null
  checkout_url?:string|null; paid_until: string | null; next_due_at: string | null; status: string; active: boolean; can_resume?: boolean
}
const money=(amount:number,english:boolean)=>new Intl.NumberFormat(english?'en-IE':'fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(amount/100)

export type MonthlyAccessPlan = {
  key: DisplayPlanKey; price: string; period: string; label: string; active?:boolean; selected?:boolean; disabled?:boolean; onChoose:()=>void
}

export function TradingAccessOptions({ offers, monthlyPlans=[], language='fr', busy=false, checkoutBlocked=false, prepaidUnavailable=false, error='', onCheckout }:{
  offers:PrepaidOffer[]; monthlyPlans?:MonthlyAccessPlan[]; language?:string; busy?:boolean; checkoutBlocked?:boolean; prepaidUnavailable?:boolean; error?:string
  onCheckout:(offer:PrepaidOffer,provider:'whop'|'nowpayments')=>void
}) {
  const english=language==='en',tr=(fr:string,en:string)=>english?en:fr
  const [choices,setChoices]=useState<Record<string,'monthly'|PrepaidOffer['offer_key']>>({})
  const [offer,setOffer]=useState<PrepaidOffer|null>(null)
  const [provider,setProvider]=useState<'whop'|'nowpayments'>('whop')
  const [accepted,setAccepted]=useState(false)
  const [cardAccepted,setCardAccepted]=useState(false)
  const choose=(o:PrepaidOffer)=>{setOffer(o);setAccepted(false);setCardAccepted(false);setProvider('whop')}
  const schedule=(o:PrepaidOffer)=>{let day=0;return o.period_days.map((days,index)=>{const item={index,day,days};day+=days;return item})}
  // The four plans remain visible. Each premium card owns its payment choice.
  const plans=monthlyPlans.length?monthlyPlans:([...new Set(offers.map(o=>o.plan_key))].map(key=>({key,price:key==='custom_max'?'999,99 €':tr('Sur demande','On request'),period:key==='custom_max'?tr('/ mois','/ month'):'',label:tr('Choisir','Choose'),disabled:true,onChoose:()=>{}})) as MonthlyAccessPlan[])
  return <section aria-label={tr('Choisir votre formule','Choose your plan')}>
    <div className={style.catalogHeading}><h2>{tr('Les formules Ava','Ava plans')}</h2><span className={style.toolbarHint}><CreditCard size={13}/><Coins size={13}/>{tr('Carte & crypto','Card & crypto')}</span></div>
    <div className={style.grid}>
      {plans.map(p=>{
        const flexible=p.key==='custom_max'||p.key==='custom_max_2'
        const choice=choices[p.key]??'monthly'
        const selectedOffer=offers.find(o=>o.plan_key===p.key&&o.offer_key===choice)
        const monthly=choice==='monthly'
        return <PlanCard key={p.key} planKey={p.key} english={english}
          price={selectedOffer?money(selectedOffer.amount_minor,english):p.price}
          period={selectedOffer?(selectedOffer.payment_count?tr('/ paiement','/ payment'):tr('/ semaine','/ week')):p.period}
          note={selectedOffer?(selectedOffer.total_minor?tr(`${selectedOffer.payment_count} × ${money(selectedOffer.amount_minor,english)} · ${money(selectedOffer.total_minor,english)} / 28 jours`,`${selectedOffer.payment_count} × ${money(selectedOffer.amount_minor,english)} · ${money(selectedOffer.total_minor,english)} / 28 days`):tr('7 jours d’accès · renouvelable','7 days of access · renewable')):(p.key==='custom_max_2'?tr('Une formule étudiée avec Ava','A plan tailored with Ava'):tr('Abonnement mensuel','Monthly subscription'))}
          label={selectedOffer?tr('Choisir '+(p.key==='custom_max'?'Max':'Spécial'),'Choose '+(p.key==='custom_max'?'Max':'Special')):p.label}
          active={monthly&&p.active} selected={p.selected} disabled={busy||(monthly?p.disabled:prepaidUnavailable||!selectedOffer)}
          onChoose={()=>{if(selectedOffer)choose(selectedOffer);else if(monthly)p.onChoose()}}
          configuration={flexible?<fieldset className={style.offerPicker} disabled={busy} aria-label={tr('Paiement ','Payment ')+(p.key==='custom_max'?'Max':tr('Spécial','Special'))}>
            <legend>{tr('CHOISISSEZ VOTRE PAIEMENT','CHOOSE YOUR PAYMENT')}</legend>
            <label className={style.offerRow}><input type="radio" name={'payment-'+p.key} checked={monthly} onChange={()=>setChoices(v=>({...v,[p.key]:'monthly'}))}/><span>{tr('Mensuel','Monthly')}</span><strong>{p.price}</strong></label>
            {offers.filter(o=>o.plan_key===p.key).map(o=><label key={o.offer_key} className={style.offerRow}>
              <input type="radio" name={'payment-'+p.key} checked={choice===o.offer_key} disabled={prepaidUnavailable} onChange={()=>setChoices(v=>({...v,[p.key]:o.offer_key}))}/><span>{o.payment_count?tr(o.payment_count+' paiements',o.payment_count+' payments'):tr('À la semaine','Weekly')}</span><strong>{o.payment_count?o.payment_count+' × ':''}{money(o.amount_minor,english)}</strong>
            </label>)}
            {!offers.some(o=>o.plan_key===p.key)&&<p className={style.loadingOffers}>{error?tr('Prépayé indisponible','Prepaid unavailable'):tr('Chargement des options…','Loading options…')}</p>}
          </fieldset>:undefined}/>
      })}
    </div>
    <p className={style.finePrint}>{tr('Prépayé : chaque tranche ouvre sa période. Arrêtez avant la suivante, sans solde restant dû.','Prepaid: each payment opens its period. Stop before the next one, with no outstanding balance.')}<span>{tr('Clé IA personnelle pour les plans Custom. Taxes éventuelles précisées au paiement.','Personal AI key for Custom plans. Applicable taxes shown at checkout.')}</span></p>
    {offer&&<BillingDialog title={offer.plan_key==='custom_max'?'Custom Max':tr('Spécial','Special')} subtitle={tr('Votre formule · ','Your plan · ')+(offer.payment_count?tr(offer.payment_count+' paiements',offer.payment_count+' payments'):tr('À la semaine','Weekly'))}
      tone={offer.plan_key==='custom_max'?'max':'special'} busy={busy} onClose={()=>setOffer(null)}>
      <div className={style.orderSummary}><div><strong>{money(offer.amount_minor,english)}</strong><span>{tr('premier paiement','first payment')}</span></div>
        <p>{offer.total_minor?tr(`${offer.payment_count} × ${money(offer.amount_minor,english)} · ${money(offer.total_minor,english)} pour 28 jours`,`${offer.payment_count} × ${money(offer.amount_minor,english)} · ${money(offer.total_minor,english)} for 28 days`):tr('7 jours d’accès · renouvelable chaque semaine','7 days of access · renewable weekly')}</p></div>
      <ol className={style.schedule} aria-label={tr('Échéancier','Payment schedule')}>{schedule(offer).map(s=><li key={s.index}>
        <div><span className={style.scheduleNumber}>{s.index+1}</span><b>{s.day===0?tr('Aujourd’hui','Today'):tr('Jour '+s.day,'Day '+s.day)}</b><span>· {s.days} {tr('jours','days')}</span></div><b>{money(offer.amount_minor,english)}</b>
      </li>)}</ol>
      <div className={style.paymentMethods} role="group" aria-label={tr('Moyen de paiement','Payment method')}>
        <button type="button" disabled={busy} aria-pressed={provider==='whop'} onClick={()=>{setProvider('whop');setCardAccepted(false)}}><CreditCard size={19}/><strong>{tr('Carte bancaire','Bank card')}</strong><small>{tr('Renouvellement automatique','Automatic renewal')}</small></button>
        <button type="button" disabled={busy} aria-pressed={provider==='nowpayments'} onClick={()=>{setProvider('nowpayments');setCardAccepted(false)}}><Coins size={19}/><strong>{tr('Crypto-monnaie','Cryptocurrency')}</strong><small>{tr('Chaque paiement est manuel','Each payment is manual')}</small></button>
      </div>
      <div className={style.expiry}><strong><CirclePause size={14}/>{tr('Accès expiré : toute gestion s’arrête','Access expired: all management stops')}</strong>
        <p>{tr('Ava n’ouvre, ne ferme et ne gère plus aucune position. Les positions ouvertes restent sous votre responsabilité.','Ava no longer opens, closes or manages any position. Open positions remain your responsibility.')}</p>
        <details><summary>{tr('Voir les conditions de cette formule','View the terms for this offer')}</summary><p>{tr('Aucune modification ni surveillance active. Les ordres en attente et les TP/SL déjà enregistrés chez le courtier peuvent toujours être exécutés par celui-ci. Un paiement tardif confirmé ouvre sa période complète à la reprise ; la période impayée ne donne aucun accès. Les tranches suivantes ne sont pas dues si vous arrêtez.','No modifications or active monitoring. Pending orders and TP/SL already held by your broker may still execute. A confirmed late payment unlocks its full period when you resume; unpaid periods grant no access. Future payments are not due if you stop.')}</p>
        <p>{tr('Ces formules nécessitent la version compatible d’Ava Desktop avec AvaBridge 1.76.','These offers require the compatible Ava Desktop version with AvaBridge 1.76.')}</p></details>
      </div>
      {checkoutBlocked&&<div role="status" className={style.notice}><Info size={15}/><p><strong>{tr('Votre abonnement est déjà actif.','Your subscription is already active.')}</strong><br/>{tr('Un nouvel achat sera disponible à son échéance pour éviter un double abonnement.','A new purchase will be available at expiry to avoid overlapping subscriptions.')}</p></div>}
      {error&&<p role="alert" className={style.error}>{error}</p>}
      <label className={style.consent}><input type="checkbox" checked={accepted} disabled={busy||checkoutBlocked} onChange={e=>setAccepted(e.target.checked)}/>{tr('J’accepte le montant, les périodes prépayées et l’arrêt complet de la gestion à expiration.','I accept the price, prepaid periods and complete stop of management when access expires.')}</label>
      {provider==='whop'&&<label className={style.consent}><input type="checkbox" checked={cardAccepted} disabled={busy||checkoutBlocked} onChange={e=>setCardAccepted(e.target.checked)}/>{tr('J’autorise les paiements automatiques de cet échéancier, annulables avant la prochaine tranche.','I authorize automatic payments on this schedule, cancellable before the next payment.')}</label>}
      <button type="button" className={style.planButton} disabled={busy||checkoutBlocked||!accepted||(provider==='whop'&&!cardAccepted)} onClick={()=>onCheckout(offer,provider)}>
        {busy?<Loader2 size={16} className="animate-spin"/>:<ShieldCheck size={16}/>} {busy?tr('Ouverture…','Opening…'):tr('Continuer · ','Continue · ')+money(offer.amount_minor,english)}{!busy&&<ArrowRight size={15}/>}</button>
      <p className={style.dialogHint}>{tr('Taxes éventuelles précisées au paiement. ','Any applicable taxes are shown at checkout. ')}{provider==='nowpayments'?tr('L’accès est activé uniquement après confirmation du paiement crypto. Chaque tranche suivante se règle manuellement.','Access is activated only after the crypto payment is confirmed. Each following payment is manual.'):tr('La prochaine échéance indiquera sa date et son heure. Vous pouvez arrêter les paiements suivants depuis votre compte.','Your next due date includes the exact date and time. You can stop future payments from your account.')}</p>
    </BillingDialog>}
  </section>
}

export function TradingAccessPanel({user,language='fr',onRefresh,monthlyPlans}:{user:UserData;language?:string;onRefresh?:()=>void;monthlyPlans:MonthlyAccessPlan[]}) {
  const english=language==='en',tr=(fr:string,en:string)=>english?en:fr
  const [offers,setOffers]=useState<PrepaidOffer[]>([]),[contract,setContract]=useState<Contract|null>(null)
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[confirmCancel,setConfirmCancel]=useState(false)
  const request=useCallback(async(body:Record<string,unknown>)=>{
    const r=await fetch(SUPABASE_URL+'/functions/v1/trading-access',{method:'POST',headers:SUPABASE_HEADERS,
      body:JSON.stringify({...body,user_id:user.id,ava_session_token:user.ava_session_token})})
    const data=await r.json()
    if(!r.ok||!data.ok) throw new Error(data.error||'Service indisponible.')
    return data
  },[user.id,user.ava_session_token])
  const refresh=useCallback(async()=>{
    try {const d=await request({action:'status'});setOffers(d.offers);setContract(d.contract);setError('')}
    catch {setError(english?'Prepaid offers are temporarily unavailable. Your existing subscription is unchanged.':'Les formules prépayées sont momentanément indisponibles. Votre abonnement actuel reste inchangé.')}
  },[request,english])
  useEffect(()=>{void refresh();const timer=setInterval(()=>{void refresh()},30000);return()=>clearInterval(timer)},[refresh])
  const checkout=async(offer:PrepaidOffer,provider:'whop'|'nowpayments')=>{
    setBusy(true);setError('')
    try {
      const d=await request({action:'checkout',plan_key:offer.plan_key,offer_key:offer.offer_key,provider,
        terms_version:offer.terms_version,accept_prepaid:true,accept_expiry_halt:true,accept_card_schedule:provider==='whop'})
      const url=new URL(d.redirect_url)
      if(url.protocol!=='https:') throw new Error('Lien de paiement invalide.')
      window.location.assign(url.toString())
    }catch(e){setError(e instanceof Error?e.message:'Paiement indisponible.')}
    finally{setBusy(false)}
  }
  const cancel=async()=>{
    if(!contract)return
    setBusy(true);setError('')
    try{const d=await request({action:'cancel',contract_id:contract.id});setContract(d.contract);setConfirmCancel(false);onRefresh?.()}
    catch(e){setError(e instanceof Error?e.message:'Annulation indisponible.')}
    finally{setBusy(false)}
  }
  const resume=async()=>{
    if(!contract)return
    setBusy(true);setError('')
    try{const d=await request({action:'resume',contract_id:contract.id});setContract(d.contract);onRefresh?.()}
    catch(e){setError(e instanceof Error?e.message:tr('Reprise indisponible.','Unable to resume.'))}
    finally{setBusy(false)}
  }
  const open=contract&&['checkout_pending','active','cancel_requested','review'].includes(contract.status)
  // Advisory UI guard only: the server rechecks and locks the current account at checkout.
  // Existing prepaid contracts can still pay their next crypto period before expiry.
  const existingAccessUntil=Math.max(0,...[user.subscription_expires_at,user.custom_plan_expires_at]
    .map(value=>value?Date.parse(value):0).filter(Number.isFinite))
  const checkoutBlocked=!open&&existingAccessUntil>Date.now()
  const date=(value:string)=>new Intl.DateTimeFormat(english?'en-GB':'fr-FR',{dateStyle:'long',timeStyle:'short'}).format(new Date(value))
  return <div>
      {error&&<p role="alert" className={style.error}>{error}</p>}
      {contract&&<div className={style.contract}>
        <p className="font-bold text-white">{contract.plan_key==='custom_max'?'Custom Max':tr('Spécial','Special')} · {contract.paid_count}{contract.payment_count?'/'+contract.payment_count:''} {tr('paiement(s) confirmé(s)','confirmed payment(s)')}</p>
        <p>{contract.paid_until?tr('Accès payé jusqu’au ','Access paid until ')+date(contract.paid_until):tr('En attente du premier paiement confirmé.','Awaiting the first confirmed payment.')}</p>
        {contract.next_due_at&&<p>{tr('Prochaine échéance : ','Next due date: ')}{date(contract.next_due_at)}</p>}
        {contract.status==='cancelled'&&<p>{tr('Renouvellement arrêté. La période déjà payée reste disponible.','Renewal stopped. Your already-paid period remains available.')}</p>}
        {contract.can_resume&&<div>
          <p>{tr('Reprenez au prochain paiement, en conservant les tranches déjà réglées. Aucun paiement ne sera lancé automatiquement.','Continue with the next payment and keep your confirmed installments. No payment will be initiated automatically.')}</p>
          <button type="button" disabled={busy} onClick={()=>void resume()} className="min-h-11 rounded-xl bg-rose-500 px-4 font-bold text-white disabled:opacity-40">{busy?tr('Reprise…','Resuming…'):tr('Reprendre mon échéancier','Resume my payment schedule')}</button>
        </div>}
        {contract.status==='completed'&&<p>{tr('Échéancier terminé : aucun nouveau prélèvement prévu.','Schedule complete: no further automatic payment.')}</p>}
        {open&&contract.provider==='nowpayments'&&contract.status!=='review'&&<button type="button" disabled={busy} onClick={()=>{
          const offer=offers.find(o=>o.plan_key===contract.plan_key&&o.offer_key===contract.offer_key)
          if(offer) void checkout(offer,'nowpayments')
        }} className="min-h-11 rounded-xl bg-rose-500 px-4 font-bold text-white disabled:opacity-40">{tr('Régler la prochaine période en crypto','Pay for the next period with crypto')}</button>}
        {open&&contract.provider==='whop'&&contract.paid_count===0&&contract.checkout_url&&<button type="button" disabled={busy} onClick={()=>{
          const offer=offers.find(o=>o.plan_key===contract.plan_key&&o.offer_key===contract.offer_key)
          if(offer) void checkout(offer,'whop')
        }} className="min-h-11 rounded-xl bg-rose-500 px-4 font-bold text-white disabled:opacity-40">{tr('Reprendre le paiement par carte','Resume card checkout')}</button>}
        {contract.status==='review'&&<p>{tr('Cette formule nécessite une vérification du support. Aucun nouveau prélèvement ne doit être lancé depuis ce compte.','This schedule requires a support review. Do not initiate another payment from this account.')}</p>}
        {contract.status==='cancel_requested'&&<p>{tr('Annulation en cours de confirmation. Vous pouvez relancer la demande ci-dessous.','Cancellation is awaiting confirmation. You may retry the request below.')}</p>}
        {open&&contract.status!=='review'&&(contract.provider==='nowpayments'||contract.paid_count>0||!!contract.checkout_url)&&<div>
          {confirmCancel?<div className="space-y-2">
            <p>{tr('Arrêter les paiements suivants ? Votre accès restera valable jusqu’à la fin déjà payée.','Stop future payments? Your access will remain valid until the paid period ends.')}</p>
            <button type="button" disabled={busy} onClick={()=>void cancel()} className="mr-3 min-h-11 rounded-xl border border-rose-400/30 px-4 text-rose-200">{tr('Confirmer l’arrêt','Confirm cancellation')}</button>
            <button type="button" onClick={()=>setConfirmCancel(false)} className="min-h-11 px-3">{tr('Retour','Back')}</button>
          </div>:<button type="button" disabled={busy} onClick={()=>setConfirmCancel(true)} className="min-h-11 text-rose-300 underline underline-offset-4">{tr('Arrêter les paiements suivants','Stop future payments')}</button>}
        </div>}
      </div>}
      <TradingAccessOptions offers={offers} monthlyPlans={monthlyPlans} language={language} busy={busy} checkoutBlocked={checkoutBlocked} prepaidUnavailable={!!open} error={error} onCheckout={(o,p)=>void checkout(o,p)}/>
      <div className={style.footerStrip}>
        <div><Monitor size={17}/><div><strong>{tr('Un seul écosystème Ava','One Ava ecosystem')}</strong><p>{tr('Vos accès synchronisés sur Desktop, Web et mobile.','Your access synced across Desktop, Web and mobile.')}</p></div></div>
        <div><CreditCard size={17}/><div><strong>{tr('Votre moyen de paiement','Your payment method')}</strong><p>{tr('Carte bancaire ou crypto, selon vos préférences.','Bank card or crypto, the choice is yours.')}</p></div></div>
        <div><ShieldCheck size={17}/><div><strong>{tr('Vous gardez le contrôle','You stay in control')}</strong><p>{tr('Échéances visibles et arrêt des paiements depuis votre compte.','Visible due dates and payment cancellation from your account.')}</p></div></div>
      </div>
    </div>
}
