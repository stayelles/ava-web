# Accès aux clients et aux bureaux Ava Cloud

Ava Web 0.5.73 ajoute **Clients & Cloud** dans `/ops?tab=clients`, accessible aussi depuis Ava Cloud (administrateur) et les consoles Ava Support.

## Utilisation

- Administrateur/propriétaire : ouvrir Clients & Cloud, rechercher l’e-mail du client, sélectionner le dossier et saisir un motif (10 caractères minimum).
- Le bouton **Ouvrir le bureau Windows** crée un accès temporaire via la passerelle existante. La machine doit être prête, avec un abonnement Cloud actif. L’intervenant conserve son propre compte ; aucune session Web du client n’est usurpée.
- **Droits des employés** : sélectionner un conseiller Support ou un opérateur OPS existant ; cocher les droits et choisir certains clients ou tous les clients (y compris futurs). Le motif, les changements et leur auteur sont audités.
- Un conseiller sans accès OPS est inscrit comme opérateur sans permissions OPS globales. Son rôle sécurisé exige un TOTP à sa prochaine connexion. Il doit se reconnecter si une ancienne session n’a pas le niveau AAL2.
- Les rôles globaux restent gérés par le propriétaire dans Équipe. Les administrateurs/propriétaires ont accès à tous les clients ; ils ne sont pas des destinataires de droits limités.

## Droits distincts

Profil (lecture), abonnement (lecture), historique Desktop (lecture), état Cloud (lecture), bureau Windows (contrôle complet de la VM), diagnostic prédéfini, redémarrage Ava/MT5, mises à jour Ava/bridge/agent. Toute action Cloud exige aussi `cloud.read`. Aucune commande shell libre n’est exposée.

Le retrait des droits bloque les nouvelles requêtes ; il ne termine pas un bureau déjà ouvert ni une commande déjà acceptée. Les intervenants doivent fermer leur bureau en fin d’intervention. Le contrat actuel de la passerelle ne fournit pas de révocation d’une connexion RDP active ; aucune déconnexion forcée n’est promise. Les sessions créées demandent un TTL de 300 secondes à la passerelle. Le lien n’est stocké ni dans la base ni dans l’audit ; les mots de passe Windows restent côté serveur.

## Validation et déploiement

- `node --test tests/ops-client-access.test.mjs` dans ava-mobile : 11 scénarios sur le véritable handler, dont Auth/AAL2, session Ava, périmètre, droits, fuite de secrets, erreur de passerelle, révocation pendant l’ouverture, idempotence et absence d’accès global aux requêtes OPS.
- Migration `20261005120000_ops_client_access.sql` : table privée, fonction transactionnelle droits + audit, contrôle de révision et clé unique des commandes.
- Migration et scénarios SQL vérifiés dans une transaction annulée : dépendances de droits, absence de périmètre, conflit de révision, refus d’auto-escalade, révocation et droits SQL privés. Aucun droit employé conservé par ces tests.
- Interface vérifiée dans Chrome avec données fictives, largeur mobile 390 demandée : sélection, motif, enregistrement, restrictions et panne de passerelle.
- Le contrôle complet d’un bureau réel requiert une VM Kamatera disponible. Le test local simule la réponse de la passerelle ; il ne prouve pas une connexion RDP réelle.

Déployer uniquement la migration indiquée et `ava-ops`, puis publier Ava Web par son workflow FTP existant. Les fonctions Cloud de paiement/provisioning et le Mode Assistance en lecture seule restent indépendants.
