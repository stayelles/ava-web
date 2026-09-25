'use client'
import {useCallback,useEffect,useState} from 'react'
import {ArrowDownToLine,ArrowUpFromLine,ArrowUpRight,Check,ChevronRight,ExternalLink,LockKeyhole,Pause,Play,RefreshCw,ShieldCheck,Wallet,Workflow,Zap} from 'lucide-react'
import {formatUnits,zeroAddress} from 'viem'
import {api,connect,micros,factoryAbi,tokenAbi,vaultAbi,type Connection,type DefiAccount,type Deployment,type Operation} from '../defi/client'

const field='w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-3 text-sm text-white outline-none focus:border-rose-400'
const action='flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35'
export function DefiTab({language='fr'}:{language?:string}){
 const fr=language==='fr',t=(a:string,b:string)=>fr?a:b
 const money=(v:string|null|undefined)=>v==null?'—':new Intl.NumberFormat(fr?'fr-FR':'en-GB',{maximumFractionDigits:4}).format(Number(v)/1e6)
 const [summaries,setSummaries]=useState<{strategy:string;profit:string;gas:string;count:number}[]>([])
 const [pending,setPending]=useState<`0x${string}`|null>(null)
 const [deployment,setDeployment]=useState<Deployment|null>(null),[connection,setConnection]=useState<Connection|null>(null)
 const [accounts,setAccounts]=useState<DefiAccount[]>([]),[operations,setOperations]=useState<Operation[]>([]),[selected,setSelected]=useState<'arbitrage'|'liquidations'>('arbitrage')
 const [balance,setBalance]=useState<{balance:string;remaining:string;expiresAt:string}|null>(null)
 const [amount,setAmount]=useState('10'),[minimum,setMinimum]=useState('0.05'),[maxGas,setMaxGas]=useState('0.25'),[duration,setDuration]=useState('15')
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[error,setError]=useState(''),[walletChoice,setWalletChoice]=useState(false)
 const account=accounts.find(a=>a.strategy===selected&&a.chain_id===deployment?.chain)
 const refresh=useCallback(async()=>{
  const d=await api<Deployment>('/status',undefined,undefined,true);setDeployment(d)
  if(!d.ready)return
  const [a,o,s]=await Promise.all([api<{accounts:DefiAccount[]}>('/accounts'),api<{operations:Operation[]}>('/operations'),api<{summaries:{strategy:string;profit:string;gas:string;count:number}[]}>('/summary')]);setAccounts(a.accounts);setOperations(o.operations);setSummaries(s.summaries)
 },[])
 useEffect(()=>{void refresh().catch(e=>setError(e.message));const timer=setInterval(()=>{void refresh().catch(()=>{})},10_000);return()=>clearInterval(timer)},[refresh])
 useEffect(()=>{
  let current=true
  if(!account){setBalance(null);return}
  void api<{balance:string;remaining:string;expiresAt:string}>(`/accounts/${account.id}/balance`).then(b=>{if(current)setBalance(b)}).catch(e=>{if(current)setError(e.message)})
  return()=>{current=false}
 },[account])
 useEffect(()=>{
  if(!connection)return
  const invalidate=()=>{setConnection(null);setNotice('');setError('WALLET_CHANGED')}
  connection.provider.on?.('accountsChanged',invalidate);connection.provider.on?.('chainChanged',invalidate)
  return()=>{connection.provider.removeListener?.('accountsChanged',invalidate);connection.provider.removeListener?.('chainChanged',invalidate)}
 },[connection])
 const work=async(fn:()=>Promise<void>)=>{if(busy)return;setBusy(true);setError('');setNotice('');try{await fn();await refresh()}catch(e){setError(e instanceof Error?e.message:'SERVICE_UNAVAILABLE')}finally{setBusy(false)}}
 const link=async(kind:'extension'|'walletconnect')=>work(async()=>{
  if(!deployment?.ready)throw Error('DEPLOYMENT_PENDING')
  const c=await connect(kind,deployment)
  const saved=localStorage.getItem(`ava-defi-pending:${deployment.chain}:${c.address.toLowerCase()}`);if(saved&&/^0x[0-9a-f]{64}$/i.test(saved))setPending(saved as `0x${string}`)
  const challenge=await api<{id:string;message:string}>('/wallet/challenge',{address:c.address})
  const signature=await c.wallet.signMessage({account:c.address,message:challenge.message})
  await api('/wallet/verify',{id:challenge.id,signature});setConnection(c);setWalletChoice(false);setNotice(t('Wallet lié à votre compte Ava.','Wallet linked to your Ava account.'))
 })
 const receipt=async(hash:`0x${string}`)=>{
  if(!connection)throw Error('WALLET_MISSING')
  const key=`ava-defi-pending:${deployment?.chain}:${connection.address.toLowerCase()}`
  localStorage.setItem(key,hash);setPending(hash)
  setNotice(t('Transaction envoyée. Vérification…','Transaction sent. Checking…'))
  const r=await connection.publicClient.waitForTransactionReceipt({hash,confirmations:2,timeout:120_000})
  localStorage.removeItem(key);setPending(null)
  if(r.status!=='success')throw Error('TRANSACTION_REVERTED')
  setNotice(t('Transaction confirmée ; finalisation réseau en cours.','Transaction confirmed; network finalization pending.'))
 }
 const create=()=>work(async()=>{
  if(!connection||!deployment?.factory)throw Error('WALLET_MISSING')
  if(pending)throw Error('PENDING_TRANSACTION')
  const index=selected==='arbitrage'?0:1
  let vault=await connection.publicClient.readContract({address:deployment.factory,abi:factoryAbi,functionName:'vaults',args:[connection.address,index]})
  if(vault===zeroAddress){await receipt(await connection.wallet.writeContract({account:connection.address,address:deployment.factory,abi:factoryAbi,functionName:'create',args:[index]}));vault=await connection.publicClient.readContract({address:deployment.factory,abi:factoryAbi,functionName:'vaults',args:[connection.address,index]})}
  await api('/accounts',{strategy:selected,vault})
 })
 const transfer=(withdraw:boolean)=>work(async()=>{
  if(!account||!connection||!deployment?.usdc)throw Error('WALLET_MISSING')
  if(pending)throw Error('PENDING_TRANSACTION')
  const value=micros(amount);if(value<=BigInt(0)||(!withdraw&&value>BigInt(100_000_000))||(withdraw&&balance&&value>BigInt(balance.balance)))throw Error('INVALID_AMOUNT')
  if(!withdraw)await receipt(await connection.wallet.writeContract({account:connection.address,address:deployment.usdc,abi:tokenAbi,functionName:'approve',args:[account.vault,value]}))
  await receipt(await connection.wallet.writeContract({account:connection.address,address:account.vault,abi:vaultAbi,functionName:withdraw?'withdraw':'deposit',args:[value]}))
 })
 const authorize=()=>work(async()=>{
  if(!account||!connection||!balance)throw Error('WALLET_MISSING')
  if(pending)throw Error('PENDING_TRANSACTION')
  const budget=micros(amount),min=micros(minimum),gas=micros(maxGas)
  if(budget<=BigInt(0)||budget>BigInt(100_000_000)||budget>BigInt(balance.balance)||min<BigInt(50_000)||gas<=BigInt(0)||gas>BigInt(250_000))throw Error('INVALID_LIMITS')
  await api(`/accounts/${account.id}/config`,{amountMicros:budget.toString(),minimumNetMicros:min.toString(),maxGasMicros:gas.toString()},'PUT')
  await receipt(await connection.wallet.writeContract({account:connection.address,address:account.vault,abi:vaultAbi,functionName:'authorize',args:[budget,budget,min,BigInt(Math.floor(Date.now()/1000)+Number(duration)*60)]}))
 })
 const command=(command:'start'|'stop')=>work(async()=>{if(!account)throw Error('ACCOUNT_REQUIRED');await api(`/accounts/${account.id}/commands`,{command});setNotice(command==='stop'?t('Moteur arrêté. Une transaction déjà envoyée peut encore aboutir.','Engine stopped. An already submitted transaction may still execute.'):t('Surveillance démarrée. Aucun rendement garanti.','Monitoring started. No return is guaranteed.'))})
 const revoke=()=>work(async()=>{if(pending)throw Error('PENDING_TRANSACTION');if(!account||!connection)throw Error('WALLET_MISSING');await receipt(await connection.wallet.writeContract({account:connection.address,address:account.vault,abi:vaultAbi,functionName:'revoke'}))})
 const errors:Record<string,string>={
  WALLET_REJECTED:t('Demande annulée dans le wallet.','Request cancelled in the wallet.'),
  WALLET_REQUEST_PENDING:t('Une demande attend déjà dans le wallet. Ouvrez-le pour continuer.','A request is already waiting in your wallet. Open it to continue.'),
  WALLET_UNAUTHORIZED:t('Autorisez la connexion à Ava dans votre wallet.','Allow the connection to Ava in your wallet.'),
  WALLET_NETWORK_UNAVAILABLE:t('Le wallet n’a pas sélectionné le réseau requis. Pour ce test, activez Base Sepolia.','The wallet did not select the required network. For this test, enable Base Sepolia.'),
  WALLET_CONNECTION_FAILED:t('Connexion au wallet impossible. Ouvrez-le, déverrouillez-le puis réessayez.','Unable to connect to the wallet. Open it, unlock it and retry.'),
 PENDING_TRANSACTION:t('Une transaction reste à vérifier. Consultez son statut avant de recommencer.','A transaction remains unresolved. Check its status before retrying.'),DEPLOYMENT_PENDING:t('Déploiement public en préparation. Les fonds restent dans votre wallet.','Public deployment is being prepared. Funds stay in your wallet.'),AVA_SIGN_IN:t('Connectez-vous à votre compte Ava pour continuer.','Sign in to your Ava account to continue.'),WALLET_MISSING:t('Connectez un wallet compatible Base.','Connect a Base-compatible wallet.'),WALLETCONNECT_PENDING:t('WalletConnect sera disponible après configuration du service.','WalletConnect requires service configuration.'),RELEASE_GATES_PENDING:t('Démarrage indisponible : validations de cette version encore en cours.','Starting is unavailable: release checks are still pending.'),INVALID_LIMITS:t('Vérifiez le solde déposé, le gain minimum et le plafond de frais.','Check your deposited balance, minimum profit and fee cap.'),WALLET_CHANGED:t('Wallet ou réseau modifié. Reconnectez-vous.','Wallet or network changed. Please reconnect.'),INVALID_AMOUNT:t('Saisissez un montant entre 0 et 100 USDC, avec six décimales maximum.','Enter an amount between 0 and 100 USDC, with up to six decimal places.')}
 const rows=operations.filter(o=>o.strategy===selected),summary=summaries.find(s=>s.strategy===selected)
 const net=summary?(BigInt(summary.profit)-BigInt(summary.gas)).toString():null
 const statusNames:Record<string,string>={reserved:t('Réservée','Reserved'),signed:t('Signée','Signed'),uncertain:t('À vérifier','Uncertain'),included:t('Incluse','Included'),finalized:t('Finalisée','Finalized'),reverted:t('Échouée','Reverted'),reorged:t('Réorganisation','Reorganization')}
 return <section className="flex-1 overflow-y-auto text-slate-200">
  <div className="mx-auto max-w-6xl space-y-7 px-4 py-6 sm:px-8 sm:py-10">
   <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-rose-400"><Workflow size={15}/> Ava · DeFi</p><h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{t('Automatisations DeFi','DeFi Automations')}</h1></div><button className={action} onClick={()=>setWalletChoice(!walletChoice)} aria-expanded={walletChoice}><Wallet size={16}/>{connection?`${connection.address.slice(0,6)}…${connection.address.slice(-4)}`:t('Connecter un wallet','Connect wallet')}</button></header>
   {walletChoice&&<div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4"><button disabled={busy||!deployment?.ready} className={action} onClick={()=>void link('extension')}>{t('Extension du navigateur','Browser extension')}</button><button disabled={busy||!deployment?.ready} className={action} onClick={()=>void link('walletconnect')}>WalletConnect</button>{!deployment?.ready&&<p className="w-full text-sm text-amber-200">{errors.DEPLOYMENT_PENDING}</p>}</div>}
   <div className="flex flex-wrap items-center gap-3 text-xs"><span className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-blue-300">● Base</span><span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1.5 text-amber-200">{deployment?.stage==='pilot'?t('Pilote · fonds réels','Pilot · real funds'):deployment?.stage==='beta'?t('Bêta privée · fonds réels','Private beta · real funds'):t('Test · aucun fonds réel','Test · no real funds')}</span><span className="text-slate-500">{t('USDC · Frais réseau en ETH','USDC · Network fees in ETH')}</span></div>
   {(error||notice)&&<div role={error?'alert':'status'} className={`rounded-2xl border px-4 py-3 text-sm ${error?'border-amber-400/20 bg-amber-500/5 text-amber-200':'border-emerald-400/20 bg-emerald-500/5 text-emerald-200'}`}>{error?(errors[error]??t('Action non aboutie. Vérifiez votre wallet et l’historique avant de réessayer.','Action did not complete. Check your wallet and history before retrying.')):notice}</div>}
   {pending&&<div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-400/20 p-3 text-sm text-blue-200"><span>{t('Transaction en attente de vérification','Transaction awaiting verification')}</span><button disabled={busy} className={action} onClick={()=>void work(()=>receipt(pending))}>{t('Vérifier','Check')}</button><a href={`${deployment?.explorer}/tx/${pending}`} target="_blank" rel="noreferrer"><ExternalLink size={16}/></a></div>}
   <div className="grid gap-3 sm:grid-cols-2">{(['arbitrage','liquidations'] as const).map(s=><button key={s} onClick={()=>setSelected(s)} className={`rounded-2xl border p-5 text-left transition ${selected===s?'border-rose-400/40 bg-rose-500/[.08]':'border-white/10 bg-white/[.02] hover:bg-white/5'}`}><span className="flex items-center justify-between"><span className="flex items-center gap-2 font-bold text-white">{s==='arbitrage'?<Zap size={19} className="text-rose-300"/>:<ShieldCheck size={19} className="text-blue-300"/>}{s==='arbitrage'?t('Arbitrage','Arbitrage'):t('Liquidations','Liquidations')}</span>{selected===s?<Check size={17} className="text-rose-300"/>:<ChevronRight size={17}/>}</span><span className="mt-2 block text-xs text-slate-400">{s==='arbitrage'?'Uniswap ↔ Aerodrome':'Morpho Blue · USDC / WETH'}</span></button>)}</div>
   <div className="grid gap-4 sm:grid-cols-3">{[[t('Capital disponible','Available capital'),balance?.balance],[t('Autorisation restante','Remaining authorization'),balance?.remaining],[t('Résultat net réalisé','Realized trading net'),net]].map(([label,value])=><div key={label} className="rounded-2xl border border-white/10 bg-white/[.02] p-5"><p className="text-xs text-slate-400">{label}</p><p className="mt-3 text-2xl font-semibold tabular-nums text-white">{money(value)} <span className="text-xs font-normal text-slate-500">USDC</span></p></div>)}</div>
   <div className="grid items-start gap-5 lg:grid-cols-[1.15fr_1fr]">
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[.02] p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="font-semibold text-white">{t('Votre coffre','Your vault')}</h2><span className="flex items-center gap-1.5 text-xs text-slate-400"><LockKeyhole size={13}/>{t('Retrait propriétaire','Owner withdrawal')}</span></div>
     {!account?<div className="py-4"><p className="mb-5 text-sm leading-relaxed text-slate-400">{t('Un coffre indépendant pour chaque stratégie. Vous gardez le contrôle des retraits.','An independent vault for each strategy. You control withdrawals.')}</p><button disabled={busy||!connection||!deployment?.ready} onClick={()=>void create()} className={action}>{t('Créer le coffre','Create vault')}<ArrowUpRight size={16}/></button></div>:<>
      <label className="block text-xs text-slate-400">{t('Montant · USDC','Amount · USDC')}<input aria-label={t('Montant USDC','Amount USDC')} inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} className={field+' mt-2'}/></label>
      <div className="grid grid-cols-2 gap-3"><button disabled={busy||!connection} className={action} onClick={()=>void transfer(false)}><ArrowDownToLine size={16}/>{t('Dépôt','Deposit')}</button><button disabled={busy||!connection} className={action} onClick={()=>void transfer(true)}><ArrowUpFromLine size={16}/>{t('Retrait','Withdraw')}</button></div>
      <div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate-400">{t('Gain net minimum · USDC','Minimum net profit · USDC')}<input className={field+' mt-2'} inputMode="decimal" value={minimum} onChange={e=>setMinimum(e.target.value)}/></label><label className="text-xs text-slate-400">{t('Frais max. / opération · $','Max. fee / operation · $')}<input className={field+' mt-2'} inputMode="decimal" value={maxGas} onChange={e=>setMaxGas(e.target.value)}/></label></div>
      <label className="block text-xs text-slate-400">{t('Durée d’autorisation','Authorization duration')}<select className={field+' mt-2'} value={duration} onChange={e=>setDuration(e.target.value)}><option value="15">15 min</option><option value="60">1 h</option><option value="1440">24 h</option></select></label>
      <div className="flex flex-wrap gap-2"><button disabled={busy||!connection} className={action} onClick={()=>void authorize()}><ShieldCheck size={16}/>{t('Autoriser','Authorize')}</button><button disabled={busy||!connection} className={action} onClick={()=>void revoke()}>{t('Révoquer','Revoke')}</button><button disabled={busy} className={action+' flex-1 !border-rose-400/20 !bg-rose-500/15 !text-rose-200'} onClick={()=>void command(account.enabled?'stop':'start')}>{account.enabled?<Pause size={16}/>:<Play size={16}/>} {account.enabled?t('Arrêter','Stop'):t('Démarrer','Start')}</button></div>
      <a className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300" target="_blank" rel="noreferrer" href={`${deployment?.explorer}/address/${account.vault}`}>{t('Voir le coffre','View vault')}<ExternalLink size={12}/></a>
     </>}
    </div>
    <div className="space-y-5 rounded-2xl border border-white/10 bg-white/[.02] p-5 sm:p-6"><h2 className="font-semibold text-white">{t('Cadre du pilote','Pilot limits')}</h2><dl className="space-y-4 text-sm">{[[t('Capital maximum','Maximum capital'),'100 USDC'],[t('Budget réseau total','Total network budget'),'20 $'],[t('Plafond journalier','Daily cap'),'2 $'],[t('Provision frais','Fee provision'),'150 %']].map(([k,v])=><div key={k} className="flex justify-between gap-3"><dt className="text-slate-400">{k}</dt><dd className="font-medium text-white">{v}</dd></div>)}</dl><p className="border-t border-white/10 pt-4 text-xs leading-relaxed text-slate-500">{t('Aucun réapprovisionnement automatique. Les opérations sont envoyées uniquement si leur résultat estimé dépasse les coûts provisionnés.','No automatic top-ups. Operations are submitted only when estimated proceeds exceed provisioned costs.')}</p><div className="space-y-2 border-t border-white/10 pt-4 text-xs"><p className="flex justify-between"><span>{t('Gain des opérations','Operation proceeds')}</span><span>{money(summary?.profit)} USDC</span></p><p className="flex justify-between"><span>{t('Frais réseau réels','Actual network fees')}</span><span>{money(summary?.gas)} USDC</span></p></div><details className="text-xs text-slate-400"><summary className="cursor-pointer">{t('Comprendre le résultat','Understanding results')}</summary><p className="mt-3 leading-relaxed">{t('Le résultat net comprend les frais réseau, y compris ceux des opérations échouées. Les frais DEX déjà inclus dans les échanges ne sont pas déduits deux fois. Le bilan du service déduit aussi l’hébergement et le RPC ; il sera disponible après rapprochement des factures.','Net trading results include network fees, including failed transactions. DEX fees embedded in swaps are not deducted twice. Service economics also deduct hosting and RPC invoices, available after reconciliation.')}</p></details></div>
   </div>
   <section className="overflow-hidden rounded-2xl border border-white/10"><div className="flex items-center justify-between border-b border-white/10 p-5"><h2 className="font-semibold text-white">{t('Opérations','Operations')}</h2><button title={t('Actualiser','Refresh')} aria-label={t('Actualiser','Refresh')} disabled={busy} onClick={()=>void work(refresh)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5"><RefreshCw size={16} className={busy?'animate-spin':''}/></button></div>{!rows.length?<div className="px-5 py-12 text-center"><Workflow size={28} className="mx-auto mb-3 text-slate-600"/><p className="text-sm text-slate-400">{t('Aucune opération enregistrée','No recorded operations')}</p><p className="mt-2 text-xs text-slate-600">{t('Les résultats apparaîtront après exécution sur la blockchain.','Results appear after execution on the blockchain.')}</p></div>:<div className="divide-y divide-white/5">{rows.map(o=><div key={o.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm"><div><span className="text-slate-200">{statusNames[o.state]??o.state}</span><p className="mt-1 text-xs text-slate-500">{new Date(o.created_at).toLocaleString(fr?'fr-FR':'en-GB')}</p></div><span className="tabular-nums">{o.profit!==null&&o.gas!==null?formatUnits(BigInt(o.profit)-BigInt(o.gas),6):'—'} USDC</span>{o.hash&&<a href={`${deployment?.explorer}/tx/${o.hash}`} target="_blank" rel="noreferrer" aria-label={t('Voir la transaction','View transaction')} className="p-2 text-rose-300"><ExternalLink size={16}/></a>}</div>)}</div>}</section>
  </div>
 </section>
}
