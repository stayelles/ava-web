<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Deployment Guardrails

Do not replace the Hostinger deploy workflow with an SFTP/SSH deploy action.

The production deploy for `call-ava.com` must use:

- `.github/workflows/deploy.yml`
- `SamKirkland/FTP-Deploy-Action@v4.3.5`
- GitHub Actions secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
- Hostinger FTP account credentials, not SSH credentials
- `local-dir: ./out/`
- `server-dir: /public_html/`

Known regression: switching this workflow to `wlixcc/SFTP-Deploy-Action` caused failed deploys because the GitHub secrets are FTP credentials. Hostinger SSH/SFTP may use port `65002`, but this site deployment is intentionally FTP on the Hostinger FTP account. If deploy fails with `530 Login incorrect`, update the FTP password secret in GitHub instead of changing the workflow protocol.

## Download Artifacts

The landing page points Ava Desktop downloads to versioned files under:

`https://call-ava.com/downloads/`

Keep `public/downloads/.htaccess` deployed with the site. It forces `.dmg`, `.exe`, and `.ex5` files to download instead of rendering inline in Chrome/Safari. If Mac installers or the MT5 bridge open as garbled text in the browser, fix the download headers here rather than changing the file URLs.

Large Desktop artifacts must not be committed to git. The Hostinger deploy workflow downloads the required Desktop release assets from the public `stayelles/ava-desktop-releases` release into `out/downloads` before FTP upload. Keep the Desktop release tag in `.github/workflows/deploy.yml` aligned with the Desktop version when publishing new download assets.

When changing desktop download links, keep filenames versioned so older installers remain available. The current expected Ava Trading files are:

- `Ava-1.3.5-arm64.dmg`
- `Ava-1.3.5-x64.dmg`
- `AvaSetup-1.3.5.exe`
- `AvaBridgeEA-1.48.ex5` (recommended for Ava Volatility Boom/Crash and modern Ava Trading)
- `AvaBridgeEA-1.34.ex5` (Gold Classic 1.2.5 compatibility)

If AvaBridgeEA source or binary changes, bump the AvaBridgeEA version before publishing: update Desktop required bridge version, web `AVA_BRIDGE_EA_VERSION`, download filenames, release assets, and docs together. Never ship a changed `.ex5` under an old bridge version.

- AvaBridgeEA 1.53 respecte l’expiration Stop Cycle configurée de 30 à 3600 secondes. Une valeur de 1800 secondes doit rester 1800 dans le renderer Desktop, le worker Python, le signal JSON et l’EA MT5.
- AvaBridgeEA 1.54 persiste le cycle avant le premier ordre, place les paquets par paires BUY/SELL et récupère les expositions Stop Cycle orphelines après une interruption ou une mise à jour.
- À l’objectif du panier Stop Cycle, AvaBridge ne clôture automatiquement que les tickets individuellement positifs. Tout ticket à profit nul ou négatif reste ouvert, suivi et retenté plus tard.
- AvaBridgeEA 1.55 ajoute les familles LIMIT et STOP-LIMIT. Ava Web autorise séparément BUY/SELL pour chaque nouvelle famille dans chaque règle et zone; les nouvelles autorisations sont désactivées par défaut.
- AvaBridgeEA 1.56 ajoute `max_concurrent_cycles` dans chaque règle Stop Cycle. Ava Web doit accepter uniquement un entier de 1 à 10 et utiliser 1 pour les anciennes règles qui ne possèdent pas encore ce champ.
- La politique Stop Cycle v4 ajoute `feature_enabled`, actif par défaut. L’interrupteur owner reste visible dans Ava Web même lorsqu’il est coupé; `false` masque le composant côté utilisateur et interdit toute nouvelle action STOP, LIMIT ou STOP-LIMIT, y compris conversationnelle, sans fermer les positions déclenchées.
- Ava Web 0.5.9 renforce la chaleur conversationnelle avec des micro-réactions naturelles et contextuelles, jamais répétitives ni déplacées sur les sujets graves ou financiers.
- AvaBridgeEA 1.58 rend BUY et SELL indépendants dans chaque famille STOP, LIMIT et STOP-LIMIT. Une famille reste valide si un seul côté est autorisé; Ava Web ne doit plus présenter ni imposer un paquet BUY+SELL obligatoire.
- Desktop ne place jamais STOP, LIMIT et STOP-LIMIT simultanément au même niveau. Les familles autorisées tournent cycle après cycle, avec un seul cycle actif par marché.
- Ava Web 0.5.10 retente les indisponibilités réseau transitoires lors de la lecture/écriture des contrôles administrateur et de l’envoi d’un signal IA principale. Les signaux conservent leur clé d’idempotence pendant les tentatives.
- Ava Web 0.5.15 ajoute Ava Support Operations : panneau client flottant global (latéral sur ordinateur, plein écran mobile), réponse IA de premier niveau avec base de connaissances produit/MT5/AvaBridge/abonnements avant triage humain, double rôle client/conseiller pour l’administrateur, console conseiller dédiée et sélection d’un ticket précis, lien direct `/app?support=1`, conversations persistantes et définitivement fermées, 10 images / 1 vidéo de 300 Mo / 5 documents par message via upload TUS privé vérifié, notation 1–5 avec commentaire de 50 caractères, invitations d’agents par email, profil agent obligatoire, file prioritaire, présence/capacité, métriques de prise en charge, dictée/transcription, reformulation professionnelle obligatoire et contexte client strictement limité au ticket attribué en lecture seule avec audit. Le bouton manuel « Conseiller humain » est supprimé : Ava AI ouvre la file humaine seulement quand son évaluation serveur le demande.
- AvaBridgeEA 1.59 compte séparément les paquets conditionnels pending et les paniers déjà déclenchés. `max_concurrent_cycles` limite uniquement les paquets en attente afin que les remplacements continuent, tandis que les positions déclenchées restent suivies et ne sont jamais fermées en négatif.
- Ava Web 0.5.16 rend Ava Support quasi instantané par veille longue authentifiée, ajoute l'indicateur de saisie et le son de réception dans les deux sens, un raccourci « Tout est réglé ? », les performances/derniers avis des conseillers, les commentaires de notation sur 150 caractères et la suppression définitive d'un ticket réservée à l'administrateur. Les reformulations après l'accueil initial ne doivent jamais resaluer ni représenter le conseiller.
- Ava Web 0.5.17 corrige « Nouvelle demande » après la clôture d'un ticket : le panneau conserve explicitement l'état de création au lieu de sélectionner à nouveau une ancienne conversation fermée. La notation reste indépendante et ne bloque jamais l'ouverture d'une nouvelle conversation avec Ava Support.
- Ava Web 0.5.18 ajoute dans le contrôle global des paliers d’equity avec un plafond toutes positions confondues et un plafond Stop Cycle distinct. Le panneau support utilise le logo Ava comme profil de l’IA et « Nouvelle demande » réinitialise explicitement le brouillon et les pièces jointes avant de démarrer un nouveau ticket.

## Ava Cloud

- Public product name is `Ava Cloud`.
- La console support administrateur peut synchroniser un mot de passe Windows après une rotation Kamatera via l'action sécurisée `ava-cloud-support/sync_rdp_credentials`; le secret est chiffré côté Edge Function avec `AVA_CLOUD_CREDENTIALS_SECRET`, n'est jamais renvoyé au navigateur et invalide les anciennes sessions passerelle.
- Never show the technical term VPS in user-facing Ava Web UI. Use `Ava Cloud`, `ordinateur Ava Cloud`, `environnement Ava`, or `accès 24/7`.
- Ava Cloud is a separate `499.99 EUR/month` option for new `custom_pro`, `custom_ultra`, and `custom_max` users; existing paid entitlements keep their current paid period.
- The `/app` Cloud tab calls the Supabase `ava-cloud` Edge Function for status, card/PayPal checkout, crypto checkout, provisioning, browser access, and commands. Do not show the internal card provider name in user-facing copy.
- Browser access must use short-lived gateway URLs; never expose Windows credentials in Ava Web.
- Ava Web sends the signed `web_session_token` returned by the `login` Edge Function for Cloud actions.
- After payment, the Cloud tab auto-starts provisioning when the entitlement is active and no machine exists yet.
- If a Kamatera server was manually removed, `ava_cloud_instances.state` may be `deleted` or `terminated`. Treat those states exactly like `not_created`: show "Prêt à configurer" and allow/auto-start provisioning. Never leave a deleted instance stuck as "Configuration" at 96%.

## macOS Signature & Notarization (Apple Developer)

To ensure macOS desktop builds are not blocked by Gatekeeper upon installation:
- **Certificate**: A valid Apple "Developer ID Application" certificate must be installed in the Keychain of the build host.
- **Identity**: Configured in `package.json` as `"Woonix LTD (YW93WGC3RQ)"`.
- **Entitlements**: Uses `build/entitlements.mac.plist` (which allows JIT, micro access, and location).
- **Notarization**: Apple notarization requires the following env vars to be present when running the release command:
  - `APPLE_ID`: The Apple Developer account email address.
  - `APPLE_APP_SPECIFIC_PASSWORD`: An app-specific password generated on appleid.apple.com.
  - `APPLE_TEAM_ID`: `YW93WGC3RQ` (also specified in `package.json` under `notarize.teamId`).
- **Release Command**:
  ```bash
  APPLE_ID="your-apple-id@dev.com" APPLE_APP_SPECIFIC_PASSWORD="abcd-efgh-ijkl-mnop" GH_TOKEN="your_github_token" npm run release:mac
  ```

### Ava Web 0.4.1 — crédits Ava AI datés et recharge automatique

- L'onglet `Crédits IA` est réservé à Custom Max/Owner et utilise la fonction sécurisée `ava-ai-credits`.
- Aucun compte n'a de crédits illimités, y compris l'owner. Custom Max et l'owner reçoivent 150 crédits tous les 30 jours.
- Chaque lot inclus ou acheté expire 90 jours après son octroi. Une interruption de Custom Max annule définitivement tous les lots restants.
- Prix fixe sans remise : 0,25 € par crédit. Presets : 50 crédits à 12,50 €, 150 à 37,50 €, 400 à 100 €. Quantité personnalisée : 30 à 10 000 crédits.
- L'interface expose seulement `Carte / PayPal` et `Crypto`; elle ne nomme jamais l'agrégateur de paiement interne.
- Chaque recharge crée une commande serveur. L'octroi est unique et intervient uniquement après vérification directe du statut, du montant, de la devise et de l'identifiant chez le fournisseur.
- La recharge automatique utilise uniquement une carte ou PayPal enregistrés via un flux fournisseur hébergé. L'utilisateur choisit le seuil, le solde cible et un plafond facultatif sur 30 jours, puis peut la désactiver à tout moment. La crypto reste manuelle.
- Le backend refuse un pack si le coût IA mesuré et les frais estimés dépassent 20 % du prix.
- Les liens Desktop ouvrent `https://call-ava.com/app?tab=ai-credits`.

### Admin Ava Volatility — zones double sens et signaux IA principale

- Le contrôle global stocke `dual_entry_zone_rules` via `trading-admin-control`. Chaque zone cible un marché Boom/Crash exact, possède deux bornes inclusives obligatoires, une activation et une planification facultative.
- L'interface explique précisément qu'une entrée Ava confirmée dans cette zone provoque ensuite une position opposée sur le même marché; elle ne promet pas une exécution si le plan, le capital, une barrière ou une capacité la bloque.
- `trading-admin-signal` crée les signaux instantanés avec marché, direction, capital net minimum et expiration configurable de 60 à 120 secondes. Un clic produit une clé d'idempotence unique.
- Après l'envoi, Ava Web consulte les accusés Desktop et affiche si MT5 a confirmé la position ou le motif exact du blocage; un succès de création cloud ne doit jamais être présenté comme une exécution broker.
- L'interface doit demander une confirmation explicite avant l'envoi et afficher uniquement `Signal précis de l'IA principale` dans les informations destinées aux utilisateurs.
- Les aides `?` des barrières doivent conserver des exemples exacts : bornes inclusives, zone fermée, seuil ouvert vers l'infini, planification et marge de réactivation.

### Ava Web 0.4.3 — publication Ava Desktop 1.4.1

- Les pages publiques et le workflow Hostinger distribuent Ava Desktop `1.4.1` pour Windows x64, macOS Apple Silicon et macOS Intel.
- Le workflow récupère les installateurs, blockmaps et manifestes depuis la release publique `stayelles/ava-desktop-releases@v1.4.1`; aucun gros binaire Desktop n'est commité dans Ava Web.
- AvaBridgeEA reste strictement en version `1.48` et Ava Cloud Agent en version `0.3.4`.
