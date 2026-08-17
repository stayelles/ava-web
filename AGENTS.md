<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

### Ava Web 0.5.48 — publication Ava Desktop 1.5.45

- La page de téléchargements et le workflow Hostinger publient Ava Desktop 1.5.45 pour Windows, macOS Apple Silicon et macOS Intel.
- L'écran d'accès Web présente désormais un parcours unifié « Connexion ou création de compte ». Une adresse inconnue peut créer un compte par code e-mail sans exposer son existence; les contrôles de campagne OTP, de compte et Cloudflare Turnstile restent appliqués côté serveur.
- La bibliothèque `/presets` présente les presets Ava Volatility signés, leur plan, leur capital et leur révision; l'installation passe par un lien `ava://preset/...` dont Desktop vérifie la signature et les limites.
- Le Mode Assistance administrateur est en lecture seule, limité à 15 minutes, protégé par MFA et entièrement audité; aucun OTP, jeton, mot de passe ou identifiant MT5 n'est exposé.
- Boom et Crash activent par défaut leurs directions BUY et SELL au premier lancement de cette version; l'utilisateur peut toujours les modifier avant de démarrer Ava.
- Le moteur limite chaque pic confirmé à un seul panier Burst par direction et attend le prochain pic avant de réarmer le cycle.
- Les manifestes Mac sont régénérés après l'agrafage Apple et restent séparés par architecture; AvaBridgeEA reste en version 1.66, inchangé.

### Ava Web 0.5.44 — publication Ava Desktop 1.5.42

- La page de téléchargements et le workflow Hostinger publient Ava Desktop 1.5.42 pour Windows, macOS Apple Silicon et macOS Intel.
- Les manifestes Mac sont régénérés après l’agrafage Apple et restent séparés par architecture; le manifest Ava Cloud utilise le SHA-256 réel de l’installateur Windows 1.5.42.
- Desktop corrige la saisie décimale des délais Burst, expose les fenêtres post-burst Boom/Crash et ajoute les presets portables validés avec aperçu/confirmation. La création de presets distribuables reste réservée au mode développeur local.
- AvaBridgeEA reste en version 1.66, inchangé et vérifié.

### Ava Web 0.5.43 — publication Ava Desktop 1.5.39

- La page de téléchargements et le workflow Hostinger publient Ava Desktop 1.5.39 pour Windows, macOS Apple Silicon et macOS Intel.
- Desktop reconnaît `custom_max_2` sous le nom public Spécial et Custom Pro peut lancer le moteur quel que soit son capital, tout en conservant strictement ses limites de plan signées.
- Les manifestes Mac ont été régénérés après l’agrafage Apple; le manifest Ava Cloud utilise le SHA-256 réel de l’installateur Windows 1.5.39. AvaBridgeEA reste en version 1.66, inchangé.
- Le CDN Hostinger est activé pour réduire les problèmes de routage régionaux vers `call-ava.com`, notamment ceux signalés au Ghana.

### Ava Web 0.5.42 — plan public Spécial

- Le plan interne `custom_max_2` est présenté aux utilisateurs sous le nom public `Spécial`, au-dessus de Max.
- Aucun prix public ni checkout automatique n'est affiché. Le bouton `Contacter le service Ava` ouvre directement Ava Support afin que l'accès soit étudié et attribué manuellement.
- Spécial hérite de Custom Max et expose notamment les cycles Ava Alpha STOP, LIMIT et STOP-LIMIT, les règles personnalisées par capital et l'autorisation cryptographique renforcée.
- La grille des plans reste responsive : une colonne sur mobile, deux sur petit écran et quatre sur grand écran, dans le design sombre et rose Ava.

### Ava Web 0.5.41 — publication Ava Desktop 1.5.38

- La page de téléchargements et le workflow Hostinger publient Ava Desktop 1.5.38 pour Windows, macOS Apple Silicon et macOS Intel.
- Les manifestes d’auto-update Mac sont régénérés après l’agrafage des DMG et restent séparés par architecture.
- Le manifest Ava Cloud utilise le SHA-256 réel de l’installateur Windows 1.5.38; AvaBridgeEA reste en version 1.66, inchangé.

### Ava Web 0.5.40 — vérification Turnstile pour Ava Desktop 1.5.38

- La route publique non indexée `/security-check/` héberge le widget Cloudflare Turnstile utilisé uniquement lorsque le backend classe une demande OTP Desktop comme suspecte.
- Le site key public est transmis par Ava Desktop; le secret Turnstile reste exclusivement dans Supabase sous `TURNSTILE_SECRET_KEY` et chaque jeton est validé côté Edge Function avec l'action `ava_desktop_otp` et le hostname `call-ava.com`.
- Après succès, la page place le jeton et l’état aléatoire dans le fragment `#` d’une navigation vers `/security-check/callback/`; ce fragment n’est jamais envoyé au serveur et Ava Desktop intercepte la navigation avant toute requête réseau. Aucun OTP, mot de passe ou secret Supabase ne transite par cette page.

### Ava Web 0.5.39 — publication Ava Desktop 1.5.37

- La page de téléchargements et le workflow Hostinger publient Ava Desktop 1.5.37 pour Windows, macOS Apple Silicon et macOS Intel.
- Les manifests d'auto-update Mac sont séparés par architecture et correspondent aux DMG 1.5.37 après notarisation et agrafage Apple.
- Le manifest Ava Cloud pointe vers l'installateur Windows 1.5.37 avec son SHA-256 réel; AvaBridgeEA reste en version 1.66, inchangé.

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

- `Ava-1.5.45-arm64.dmg`
- `Ava-1.5.45-x64.dmg`
- `AvaSetup-1.5.45.exe`
- `AvaBridgeEA-1.66.ex5` (obligatoire pour Ava Volatility Boom/Crash et Gold Cortex)
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
- Ava Web 0.5.21 rend Ava Support plus lisible et réactif : les messages client, Ava IA et conseiller possèdent des styles distincts et une heure visible; l’envoi client/conseiller est optimiste; la reformulation utilise le modèle léger; les conseillers peuvent envoyer et télécharger les pièces jointes autorisées. Les liens sont cliquables. Une réponse conseiller non lue déclenche un email de reprise au client, tandis qu’un numéro WhatsApp/contact privé détecté côté serveur alerte les administrateurs avec le contexte et un lien audité vers la conversation.
- Ava Web 0.5.22 publie Ava Desktop 1.5.19 pour Windows, Mac Intel et Apple Silicon, avec les métadonnées de mise à jour propres à chaque architecture.
- Ava Web 0.5.24 corrige les pièces jointes Ava Support : les images, vidéos et documents utilisent l’endpoint TUS signé `/storage/v1/upload/resumable/sign`; le jeton `x-signature` reste éphémère, le bucket privé et le fichier est toujours vérifié par l’Edge Function avant d’être joint au message. Les erreurs d’upload, de taille, de session et de ticket fermé sont distinguées côté client.
- Ava Web transmet la locale et le fuseau IANA à `ava-ai`; l'Edge Function calcule elle-même l'heure et le jour locaux afin que les échanges texte et vocaux puissent s'adapter naturellement au matin, à l'après-midi, au soir ou à la nuit.
- Ava Web 0.5.26 publie Ava Desktop Windows 1.5.22 et AvaBridgeEA 1.61. AvaBridge 1.61 est obligatoire pour Ava Volatility afin que l’historique MT5 volumineux ne puisse plus retarder puis faire expirer un signal frais; macOS reste temporairement sur Desktop 1.5.21 jusqu’à son build notarié séparé.
- Ava Web 0.5.27 publie Ava Desktop 1.5.23 sur Windows, Mac Intel et Apple Silicon avec AvaBridgeEA 1.62. La demande d’historique M1 utilise désormais un canal indépendant du signal de trading afin qu’un rafraîchissement Boom ou Crash ne puisse plus retarder, remplacer ou faire expirer un ordre frais; l’EA exporte cet historique indépendamment du timeframe visible dans MT5.
- Ava Web 0.5.28 corrige le parcours Custom Pro/Ultra/Max depuis la page publique vers un compte déjà authentifié : le paramètre `plan` ouvre réellement le choix sécurisé du moyen de paiement au lieu de seulement surligner la formule. Les protections contre un double abonnement restent actives et leur motif apparaît désormais dans un message fixe visible, même lorsque l’utilisateur se trouve plus bas dans la page.
- Ava Web 0.5.29 aligne la fenêtre « Télécharger Ava » du compte authentifié sur les artefacts réellement publiés : Ava Desktop 1.5.23 pour Windows, Mac Intel et Mac Apple Silicon, ainsi qu’AvaBridgeEA 1.62. La page publique et la fenêtre du compte ne doivent plus conserver des constantes de version séparées et périmées lors d’une release Desktop.
- Ava Web 0.5.30 fiabilise Ava Support : chaque message client enregistré déclenche désormais la réponse IA depuis l’Edge Function, indépendamment de la page ou de la connexion du navigateur. Une erreur fournisseur, une réponse invalide ou un échec de déclenchement place atomiquement la conversation dans la file humaine, ajoute un message explicite au client et notifie les conseillers. Le Web ne lance plus une seconde requête IA fragile après l’envoi et indique clairement lorsqu’aucun conseiller n’est connecté.
- Ava Web 0.5.31 publie Ava Desktop 1.5.24 pour Windows, Mac Intel et Apple Silicon. AvaBridgeEA reste 1.62. Ava AI et Ava Support partagent désormais la même règle de communication financière responsable et préparent un résumé exact pour le conseiller lorsqu'un diagnostic automatique ne suffit pas.
- Le contrôle global Ava Cloud permet à l’owner de publier un `volatility_default_config` serveur. Ce JSON est nettoyé par l’Edge Function, distingue Boom 1000 et Crash 1000 sous `symbolConfigs`, remplace les réglages locaux correspondants au prochain démarrage Desktop et ne peut jamais contourner le plan, les directions bloquées ou les plafonds par capital.
- Le contrôle global permet aussi de publier `volatility_recommendation_rules`, des tranches consultatives par equity pour Ava vocale. Elles sont écrites uniquement via `trading-admin-control`, ne sont jamais consommées par le moteur/AvaBridge et ne remplacent aucun droit ni plafond. L’interface doit rappeler qu’Ava utilise une equity Desktop récente et demande confirmation avant toute proposition de configuration.

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
- Aucun compte n'a de crédits illimités, y compris l'owner. Custom Max et l'owner reçoivent 115 crédits tous les 30 jours.
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

### Ava Web 0.5.33 — migration des anciens abonnés Paddle

- Un ancien `subscription_source='paddle'` ne verrouille plus l’achat, le renouvellement du même plan ni un changement de formule. L’utilisateur ouvre directement le sélecteur des moyens de paiement actuels.
- L’arrêt de l’ancien renouvellement Paddle reste recommandé pour éviter un double prélèvement, mais il n’est plus une précondition au nouveau checkout.
- Le message de transition précise que l’historique Paddle ne choisit plus le fournisseur actuel. Les protections contre deux abonnements réellement actifs chez les fournisseurs actuels restent appliquées.
- `paddle-webhook` ne doit jamais réécrire le plan, la source ou les dates d’un compte dont la source active n’est plus Paddle, y compris après un remboursement tardif. Une annulation Paddle tardive ne met à jour que les métadonnées legacy.

### Ava Web 0.5.34 — publication Ava Desktop 1.5.26

- Les téléchargements Windows, macOS Apple Silicon et macOS Intel utilisent Ava Desktop 1.5.26 et AvaBridgeEA 1.65.
- Les manifestes d’auto-update Mac sont séparés par architecture et leurs SHA-512 correspondent aux DMG après notarisation/agrafage. Le manifest Ava Cloud contient les SHA-256 réels du Windows 1.5.26 et du Bridge 1.65.
- Ava Cloud signale désormais toute version Bridge inférieure à 1.65 avant de lancer le moteur.

### Ava Web 0.5.35 — publication Ava Desktop 1.5.27 et AvaBridgeEA 1.66

- Les téléchargements Desktop ciblent Ava 1.5.27 et AvaBridgeEA 1.66. Le workflow Hostinger récupère les artefacts versionnés depuis la release Desktop correspondante.
- AvaBridgeEA 1.66 exclut les positions Stop Cycle du plafond ordinaire Burst/Rebond et conserve tout le nombre d’ordres demandé lors d’un repli sans TP après `10016 invalid stops`.
- Ava Cloud refuse les versions Bridge inférieures à 1.66 avant le lancement du moteur. Gold Classic 1.2.5 conserve AvaBridgeEA 1.34.

### Ava Web 0.5.36 — publication Ava Desktop 1.5.28

- Les téléchargements Windows, macOS Apple Silicon et macOS Intel ciblent Ava Desktop 1.5.28; les manifestes d’auto-update restent séparés par architecture.
- Ava Desktop 1.5.28 restaure les positions MT5 en temps réel, affiche séparément les prix Boom et Crash et maintient l’isolation entre Stop Cycle et les positions ordinaires Burst/cadence.
- AvaBridgeEA reste en version 1.66 car son binaire et son protocole n’ont pas changé dans cette publication.

### Ava Web 0.5.37 — authentification sécurisée et migration OTP

- Ava Web ne lit plus directement `ava_users` ni `ava_user_memory` avec la clé publique. Le profil minimal, les droits, le portefeuille et les quotas proviennent de `ava-session-bootstrap` après vérification Supabase Auth.
- La connexion permanente par PIN est remplacée par un OTP e-mail Supabase Auth. Les sessions Auth sont restaurées et renouvelées par le SDK officiel; seul le jeton Ava court nécessaire aux fonctions legacy reste dans le cache applicatif de transition.
- L’owner et tout compte privilégié doivent atteindre `aal2`. Au premier accès, Ava Web enrôle un facteur TOTP, affiche le QR code une seule fois et refuse de lier le compte tant que le challenge n’est pas vérifié.
- Le bootstrap ne renvoie aucun identifiant fournisseur de paiement, jeton appareil, secret, champ administratif interne ou donnée d’un autre utilisateur.
- Les anciens parcours création/réinitialisation de PIN sont retirés de l’écran de connexion pendant la migration de sécurité.

### Bibliothèque de presets et Mode Assistance (publié avec Ava Web 0.5.48)

- `/presets` affiche seulement les métadonnées publiques des presets Ava Volatility publiés : plan, capital minimum, plage recommandée, date et révision. Le bouton d’installation utilise `ava://preset/<uuid>?revision=<n>` et ne place jamais la configuration brute dans l’URL.
- La configuration et sa signature sont téléchargées par Ava Desktop après authentification, puis vérifiées localement avant confirmation. Le Web ne peut pas accorder un plan, contourner un capital minimum ni signer un preset.
- Le Mode Assistance owner/admin est strictement en lecture seule. Il exige le step-up administrateur déjà protégé par MFA, un motif, une cible précise et expire après 15 minutes; ouverture, consultation et fermeture sont auditées.
- La vue Assistance affiche le profil sûr, les sessions moteur, les paramètres nettoyés utilisés au lancement et l’historique des presets. Elle ne fournit aucun OTP client, mot de passe, jeton, secret, identifiant MT5 ou possibilité d’usurpation.
- Ne jamais rendre le Mode Assistance modifiable ni permettre l'usurpation d'une session utilisateur; toute future action support doit rester explicite, séparée et auditée.
