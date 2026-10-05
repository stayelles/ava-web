'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Monitor, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react'

export type ClientAccess = { permissions: string[]; all_clients: boolean; target_user_ids: string[]; revision?: number }
type Call = (payload: Record<string, unknown>) => Promise<Record<string, unknown>>
type Client = { id: string; email: string; first_name?: string; last_name?: string }
type Employee = { user_id: string; display_name: string; email?: string; ops_role: string; active: boolean }
type Snapshot = {
  permissions: string[]; profile?: Record<string, unknown>; subscription?: Record<string, unknown>;
  desktop?: { runtime_sessions: Record<string, unknown>[]; preset_events: Record<string, unknown>[] };
  cloud?: { id: string; state: string; region: string; last_heartbeat_at: string; ava_version: string; bridge_version: string; agent_version: string; ava_running: boolean; mt5_connected: boolean; bridge_connected: boolean } | null;
  cloud_entitlement?: { status: string; expires_at: string } | null;
  commands?: { id: string; type: string; status: string; created_at: string }[];
}
const capabilities = [
  ['profile.read', 'Profil du client', 'Consulter son identité et sa date d’inscription.'],
  ['subscription.read', 'Abonnement', 'Consulter le plan et les échéances, sans les modifier.'],
  ['desktop.read', 'Historique Ava Desktop', 'Consulter les sessions moteur et les presets utilisés.'],
  ['cloud.read', 'État Ava Cloud', 'Voir la machine, les versions et les commandes récentes.'],
  ['cloud.desktop', 'Bureau Windows — contrôle complet', 'Ouvrir le bureau et intervenir dans la machine du client.'],
  ['cloud.diagnostics', 'Diagnostic Cloud', 'Vérifier les versions et lancer le diagnostic prédéfini.'],
  ['cloud.restart', 'Redémarrage des applications', 'Redémarrer Ava ou MT5 sur la machine.'],
  ['cloud.update', 'Mises à jour Cloud', 'Mettre à jour Ava, le bridge ou l’agent Cloud.'],
] as const
const commands = [
  ['check_versions', 'Vérifier les versions', 'cloud.diagnostics'], ['diagnose', 'Diagnostiquer', 'cloud.diagnostics'],
  ['restart_ava', 'Redémarrer Ava', 'cloud.restart'], ['restart_mt5', 'Redémarrer MT5', 'cloud.restart'],
  ['update_ava', 'Mettre à jour Ava', 'cloud.update'], ['update_bridge', 'Mettre à jour le bridge', 'cloud.update'],
  ['update_agent', 'Mettre à jour l’agent', 'cloud.update'], ['update_all', 'Tout mettre à jour', 'cloud.update'],
] as const
const errors: Record<string, string> = {
  CLIENT_PERMISSION_DENIED: 'Vous n’avez plus accès à ce client ou à cette action.',
  CLIENT_ACCESS_MANAGER_REQUIRED: 'La gestion des accès nécessite un compte administrateur.',
  POLICY_CONFLICT: 'Les droits ont changé entre-temps. Rechargez les accès avant de les modifier.',
  OPERATOR_REVOKED: 'Cet opérateur a été révoqué. Le propriétaire doit d’abord le réactiver dans Équipe.',
  CLOUD_DESKTOP_NOT_READY: 'Le bureau n’est pas disponible : la machine doit être créée et prête.',
  CLOUD_ENTITLEMENT_INACTIVE: 'L’accès Ava Cloud de ce client est expiré ou inactif.',
  GATEWAY_NOT_CONFIGURED: 'La passerelle du bureau n’est pas encore configurée.',
  GATEWAY_UNAVAILABLE: 'La passerelle du bureau ne répond pas. Réessayez plus tard.',
  CLOUD_READ_REQUIRED: 'Activez aussi le droit de consulter Ava Cloud.',
  REASON_REQUIRED: 'Indiquez un motif d’au moins 10 caractères.',
  CLIENT_DATA_UNAVAILABLE: 'Les informations du client sont momentanément indisponibles.',
  REQUEST_ALREADY_QUEUED: 'Cette commande a déjà été envoyée. Actualisez son état.',
}
const message = (error: unknown) => { const code = error instanceof Error ? error.message : 'Action indisponible'; return errors[code] || code }
const box = 'rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5'
const button = 'inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed'
const stateLabel = (value?: string) => ({ ready: 'Prête', running: 'En marche', provisioning: 'Création en cours', configuring: 'Configuration en cours', error: 'Erreur de création ou de configuration', suspended: 'Suspendue', stopped: 'Arrêtée', deleted: 'Supprimée', active: 'Actif', inactive: 'Inactif', pending: 'En attente', queued: 'En attente', succeeded: 'Terminée', success: 'Terminée', completed: 'Terminée', failed: 'Échec' }[value || ''] || value || '—')
const date = (value: unknown) => value && Number.isFinite(Date.parse(String(value))) ? new Date(String(value)).toLocaleString('fr-FR') : '—'

function ClientSearch({ call, choose, label = 'E-mail du client' }: { call: Call; choose: (client: Client) => void; label?: string }) {
  const [query, setQuery] = useState(''), [results, setResults] = useState<Client[]>([]), [busy, setBusy] = useState(false), [error, setError] = useState('')
  return <form onSubmit={async event => { event.preventDefault(); setBusy(true); setError(''); setResults([]); try { const result = await call({ action: 'client_search', query }); const users = result.users as Client[]; setResults(users); if (!users.length) setError('Aucun client autorisé ne correspond à cet e-mail.') } catch (e) { setError(message(e)) } finally { setBusy(false) } }}>
    <label className="text-sm text-slate-300">{label}<div className="mt-2 flex gap-2"><input className="ops-input min-w-0" value={query} onChange={e => setQuery(e.target.value)} placeholder="client@exemple.com" autoComplete="off" /><button className={button} disabled={busy || query.trim().length < 3} aria-label="Rechercher le client"><Search size={17} /></button></div></label>
    {error && <p role="status" className="mt-2 text-sm text-amber-200">{error}</p>}
    <div className="mt-2 space-y-1">{results.map(client => <button key={client.id} type="button" onClick={() => { choose(client); setResults([]); setQuery('') }} className="block w-full break-all rounded-xl bg-slate-800 p-3 text-left text-sm hover:bg-slate-700">{client.email}<span className="block text-xs text-slate-400">{client.first_name} {client.last_name}</span></button>)}</div>
  </form>
}

export function OpsClientWorkspace({ call, manager, access, userId }: { call: Call; manager: boolean; access: ClientAccess; userId: string }) {
  const [mode, setMode] = useState<'clients' | 'access'>('clients')
  const [client, setClient] = useState<Client | null>(null), [reason, setReason] = useState('')
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null), [busy, setBusy] = useState(''), [notice, setNotice] = useState('')
  const [link, setLink] = useState('')
  const pendingCommands = useRef<Record<string, string>>({})
  const generation = useRef(0)
  const pendingPopup = useRef<Window | null>(null)
  useEffect(() => () => { generation.current++; pendingPopup.current?.close(); pendingPopup.current = null }, [])
  const permissions = snapshot?.permissions ?? access.permissions
  useEffect(() => { if (!link) return; const timer = window.setTimeout(() => setLink(''), 300000); return () => clearTimeout(timer) }, [link])
  const inspect = async () => {
    if (!client) return
    const current = generation.current
    setBusy('inspect'); setNotice(''); setSnapshot(null); setLink('')
    try { const result = await call({ action: 'client_snapshot', target_user_id: client.id, reason }); if (generation.current === current) setSnapshot(result as unknown as Snapshot) }
    catch (e) { if (generation.current === current) setNotice(message(e)) } finally { setBusy('') }
  }
  const act = async (type?: string) => {
    if (!client) return
    const current = generation.current
    // Open during the click so mobile browsers do not reject a late popup.
    const popup = !type ? window.open('about:blank', '_blank') : null
    pendingPopup.current = popup
    if (popup) { popup.opener = null; popup.document.title = 'Ouverture du bureau Ava Cloud…'; popup.document.body.textContent = 'Vérification des droits et ouverture du bureau…' }
    setBusy(type || 'desktop'); setNotice(''); setLink('')
    const key = `${client.id}:${type}`
    if (type && !pendingCommands.current[key]) pendingCommands.current[key] = crypto.randomUUID()
    try {
      const result = await call({ action: type ? 'client_command' : 'client_desktop', target_user_id: client.id, reason, ...(type ? { type, request_id: pendingCommands.current[key] } : {}) })
      if (type) { delete pendingCommands.current[key]; if (generation.current === current) { setNotice('Commande envoyée. Actualisez pour suivre son exécution.'); const updated = await call({ action: 'client_snapshot', target_user_id: client.id, reason }); if (generation.current === current) setSnapshot(updated as unknown as Snapshot) } }
      else { const url = new URL(String(result.url)); if (url.protocol !== 'https:') throw new Error('Lien de bureau invalide'); if (generation.current !== current) { popup?.close(); return } if (popup && !popup.closed) popup.location.replace(url.href); else setLink(url.href); setNotice('Accès au bureau autorisé. Fermez le bureau à la fin de l’intervention.') }
    } catch (e) { popup?.close(); if (generation.current === current) { setNotice(message(e)); setSnapshot(null) } } finally { pendingPopup.current = null; setBusy('') }
  }
  const ready = !!snapshot?.cloud && ['ready','running'].includes(snapshot.cloud.state) && snapshot.cloud_entitlement?.status === 'active' && Date.parse(snapshot.cloud_entitlement.expires_at) > Date.now()
  return <section className="mt-5 space-y-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-black">Clients & Cloud</h2><p className="mt-1 max-w-3xl text-sm text-slate-400">Intervenez avec votre propre compte. Chaque consultation et chaque action sont journalisées avec votre motif.</p></div>{manager && <button className={button} onClick={() => { generation.current++; setMode(mode === 'access' ? 'clients' : 'access'); setSnapshot(null); setLink('') }}><Users size={17} />{mode === 'access' ? 'Voir les clients' : 'Droits des employés'}</button>}</div>
    {mode === 'access' && manager ? <ClientPermissions call={call} userId={userId} /> : <div className="grid items-start gap-5 lg:grid-cols-[320px_1fr]">
      <div className={`${box} space-y-4`}><ClientSearch call={call} choose={value => { generation.current++; setClient(value); setSnapshot(null); setLink(''); setNotice(''); setReason('') }} />
        {client && <><p className="break-all rounded-xl bg-rose-400/10 p-3 text-sm text-rose-200">{client.email}</p><label className="block text-sm text-slate-300">Motif de l’intervention<textarea className="ops-input mt-2" rows={3} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex. : assistance demandée pour configurer Ava Cloud" /></label><button className={`${button} w-full`} disabled={!!busy || reason.trim().length < 10} onClick={() => void inspect()}><RefreshCw size={16} className={busy === 'inspect' ? 'animate-spin' : ''} />Consulter / actualiser</button></>}
        <p className="text-xs leading-5 text-slate-500">{access.all_clients ? 'Périmètre : tous les clients.' : `Périmètre : ${access.target_user_ids.length} client(s) autorisé(s).`} Les droits sont revérifiés à chaque action.</p>
      </div>
      <div className="min-w-0 space-y-4">
        {notice && <div role="status" className="break-words rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">{notice}</div>}
        {link && <a href={link} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" className={`${button} text-rose-200`}>Ouvrir le bureau Windows ↗</a>}
        {!snapshot ? <div className={`${box} py-14 text-center text-slate-400`}><ShieldCheck className="mx-auto mb-4 text-rose-300" />Sélectionnez un client, puis indiquez le motif de votre intervention.</div> : <>
          {snapshot.profile && <div className={box}><h3 className="font-bold">Profil</h3><p className="mt-3 break-all">{String(snapshot.profile.first_name || '')} {String(snapshot.profile.last_name || '')} · {String(snapshot.profile.email || '')}</p><p className="mt-2 text-sm text-slate-400">Inscrit le {date(snapshot.profile.created_at)}</p></div>}
          {snapshot.subscription && <div className={box}><h3 className="font-bold">Abonnement · lecture seule</h3><p className="mt-3">{String(snapshot.subscription.subscription_plan || 'Gratuit')}</p><p className="mt-2 text-sm text-slate-400">Échéance : {date(snapshot.subscription.subscription_expires_at)}<br />Accès Custom : {date(snapshot.subscription.custom_plan_expires_at)}</p></div>}
          {snapshot.desktop && <div className={box}><h3 className="font-bold">Historique Ava Desktop</h3><RecordList title="Sessions moteur" rows={snapshot.desktop.runtime_sessions} /><RecordList title="Presets utilisés" rows={snapshot.desktop.preset_events} /></div>}
          {permissions.includes('cloud.read') && <div className={`${box} space-y-4`}><h3 className="flex items-center gap-2 font-bold"><Monitor size={20} className="text-sky-300" />Ava Cloud</h3>
            {!snapshot.cloud ? <p className="text-slate-400">Aucune machine créée pour ce client.</p> : <><div className="grid gap-3 text-sm sm:grid-cols-2"><p>État : <strong>{stateLabel(snapshot.cloud.state)}</strong><br /><span className="text-slate-400">Région : {snapshot.cloud.region || '—'}</span></p><p>Dernier signal : {date(snapshot.cloud.last_heartbeat_at)}<br /><span className="text-slate-400">Abonnement Cloud : {stateLabel(snapshot.cloud_entitlement?.status || 'inactive')} · {date(snapshot.cloud_entitlement?.expires_at)}</span></p><p>Ava {snapshot.cloud.ava_version || '—'} · Bridge {snapshot.cloud.bridge_version || '—'} · Agent {snapshot.cloud.agent_version || '—'}</p><p>Ava : {snapshot.cloud.ava_running ? 'démarré' : 'arrêté'} · MT5 : {snapshot.cloud.mt5_connected ? 'connecté' : 'déconnecté'}</p></div>
            {!ready && <p className="flex gap-2 rounded-xl bg-amber-400/10 p-3 text-sm text-amber-200"><AlertTriangle size={18} className="shrink-0" />Le bureau sera accessible quand la machine sera prête et l’abonnement Cloud actif.</p>}
            {permissions.includes('cloud.desktop') && <div><button disabled={!ready || !!busy || reason.trim().length < 10} className={`${button} bg-rose-600/30 text-rose-100`} onClick={() => void act()}><Monitor size={17} />{busy === 'desktop' ? 'Ouverture…' : 'Ouvrir le bureau Windows'}</button><p className="mt-2 text-xs text-slate-500">Contrôle complet de la machine. Fermez l’onglet après votre intervention.</p></div>}
            <div className="flex flex-wrap gap-2">{commands.filter(command => permissions.includes(command[2])).map(command => <button key={command[0]} className={button} disabled={!ready || !!busy || reason.trim().length < 10} onClick={() => void act(command[0])}>{busy === command[0] ? 'Envoi…' : command[1]}</button>)}</div>
            {permissions.some(p => ['cloud.restart','cloud.update'].includes(p)) && <p className="text-xs text-amber-200/80">Un redémarrage ou une mise à jour peut interrompre Ava ou MT5. Coordonnez l’intervention avec le client.</p>}
            {!!snapshot.commands?.length && <div className="border-t border-white/10 pt-3"><h4 className="text-sm font-bold">Commandes récentes</h4>{snapshot.commands.map(c => <p key={c.id} className="mt-2 text-xs text-slate-400">{commands.find(item => item[0] === c.type)?.[1] || c.type} · {stateLabel(c.status)} · {date(c.created_at)}</p>)}</div>}</>}
          </div>}
        </>}
      </div>
    </div>}
  </section>
}

function RecordList({ title, rows }: { title: string; rows: Record<string, unknown>[] }) {
  return <details className="mt-3 rounded-xl bg-slate-950/50 p-3"><summary className="cursor-pointer text-sm">{title} ({rows.length})</summary>{rows.length ? rows.map((row, i) => <pre key={i} className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-400">{JSON.stringify(row, null, 2)}</pre>) : <p className="mt-2 text-sm text-slate-500">Aucun événement.</p>}</details>
}
function ClientPermissions({ call, userId }: { call: Call; userId: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]), [policies, setPolicies] = useState<(ClientAccess & { user_id: string })[]>([])
  const [selected, setSelected] = useState(''), [policy, setPolicy] = useState<ClientAccess>({ permissions: [], all_clients: false, target_user_ids: [], revision: 0 })
  const [names, setNames] = useState<Record<string, string>>({}), [reason, setReason] = useState(''), [busy, setBusy] = useState(false), [notice, setNotice] = useState('')
  const load = async () => { setBusy(true); try { const result = await call({ action: 'client_access_team' }); setEmployees(result.employees as Employee[]); setNames(Object.fromEntries(((result.clients as Client[]) || []).map(c => [c.id,c.email]))); setPolicies(result.policies as (ClientAccess & { user_id: string })[]); setSelected(''); setNotice('') } catch(e) { setNotice(message(e)) } finally { setBusy(false) } }
  // Remounting the editor starts from a fresh revision.
  useEffect(() => { void load() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  const save = async (revoke = false) => { setBusy(true); setNotice(''); try { await call({ action: 'client_access_save', employee_id: selected, ...policy, ...(revoke ? { permissions: [], all_clients: false, target_user_ids: [] } : {}), reason }); await load(); setNotice(revoke ? 'Les nouveaux accès de cet employé aux clients sont révoqués.' : 'Droits enregistrés. L’employé utilise son compte personnel sur Ava OPS, avec double authentification.'); setReason('') } catch(e) { setNotice(message(e)) } finally { setBusy(false) } }
  return <div className={`${box} space-y-5`}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">Droits des employés</h3><p className="mt-1 text-sm text-slate-400">Sélectionnez un membre du service client ou d’Ava OPS, puis définissez ses droits.</p></div><button className={button} disabled={busy} onClick={() => void load()}><RefreshCw size={15} />Recharger</button></div>
    {notice && <p role="status" className="rounded-xl bg-amber-400/10 p-3 text-sm text-amber-200">{notice}</p>}
    <label className="block text-sm">Employé<select className="ops-input mt-2" disabled={busy} value={selected} onChange={e => { setSelected(e.target.value); const current = policies.find(p => p.user_id === e.target.value); setPolicy(current || { permissions: [], all_clients: false, target_user_ids: [], revision: 0 }); setReason(''); setNotice('') }}><option value="">Choisir un employé…</option>{employees.filter(e => e.user_id !== userId && !['owner','admin'].includes(e.ops_role)).map(e => <option key={e.user_id} value={e.user_id} disabled={!e.active}>{e.display_name} {e.active ? '' : '— révoqué'}</option>)}</select></label>
    {selected && <><div className="grid gap-3 sm:grid-cols-2">{capabilities.map(([key,label,description]) => <label key={key} className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 p-3"><input type="checkbox" className="mt-1 accent-rose-500" disabled={busy} checked={policy.permissions.includes(key)} onChange={e => setPolicy(current => { let next = e.target.checked ? [...current.permissions,key] : current.permissions.filter(p => p !== key); if (e.target.checked && key.startsWith('cloud.') && !next.includes('cloud.read')) next.push('cloud.read'); if (!e.target.checked && key === 'cloud.read') next = next.filter(p => !p.startsWith('cloud.')); return { ...current, permissions: next } })} /><span><strong className="text-sm">{label}</strong><span className="mt-1 block text-xs leading-5 text-slate-400">{description}</span></span></label>)}</div>
      <div className="grid gap-4 lg:grid-cols-2"><div><label className="text-sm">Clients autorisés<select disabled={busy} className="ops-input mt-2" value={policy.all_clients ? 'all' : 'selected'} onChange={e => setPolicy(p => ({ ...p, all_clients: e.target.value === 'all', target_user_ids: e.target.value === 'all' ? [] : p.target_user_ids }))}><option value="selected">Uniquement les clients sélectionnés</option><option value="all">Tous les clients, actuels et futurs</option></select></label>
        {!policy.all_clients && <div className="mt-3"><ClientSearch call={call} label="Ajouter un client au périmètre" choose={client => { setNames(n => ({ ...n,[client.id]: client.email })); setPolicy(p => ({ ...p,target_user_ids: [...new Set([...p.target_user_ids,client.id])].slice(0,100) })) }} /><div className="mt-2 space-y-2">{policy.target_user_ids.map(id => <div key={id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-800 p-2 text-xs"><span className="break-all">{names[id] || id}</span><button disabled={busy} onClick={() => setPolicy(p => ({ ...p,target_user_ids: p.target_user_ids.filter(t => t !== id) }))} className="shrink-0 text-rose-300">Retirer</button></div>)}</div></div>}</div>
      <label className="text-sm">Motif du changement<textarea disabled={busy} className="ops-input mt-2" rows={4} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} placeholder="Décrivez la mission confiée à cet employé…" /></label></div>
      <p className="text-xs leading-5 text-slate-400">Ces droits s’ajoutent aux droits Ava OPS existants. Leur retrait bloque les nouvelles consultations et ouvertures. Un bureau déjà ouvert doit être fermé ; le retrait ne déconnecte pas une session Windows en cours.</p>
      <div className="flex flex-wrap gap-3"><button disabled={busy || reason.trim().length < 10 || (policy.permissions.length > 0 && !policy.all_clients && !policy.target_user_ids.length)} className={`${button} bg-rose-600/40`} onClick={() => void save()}>Enregistrer les droits</button><button disabled={busy || reason.trim().length < 10} className={`${button} text-rose-300`} onClick={() => void save(true)}>Révoquer tous ces droits</button></div>
    </>}
    <p className="text-xs text-slate-500">Les administrateurs et le propriétaire ont accès à tous les clients. Le rôle global Ava OPS reste géré par le propriétaire dans Équipe.</p>
  </div>
}
