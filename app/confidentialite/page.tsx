import type { Metadata } from 'next'
import LegalLayout, { LegalSection } from '@/components/legal-layout'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — Ava',
  description: "Politique de confidentialité et traitement des données personnelles d'Ava.",
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de Confidentialité" updatedAt="Avril 2026">
      <LegalSection n={1} title="Responsable du traitement">
        <p>
          Le responsable du traitement de vos données personnelles est{' '}
          <strong style={{ color: '#f1f5f9' }}>Woonix LTD</strong>, société enregistrée
          en Angleterre et au Pays de Galles.
        </p>
        <p className="mt-2">
          <strong style={{ color: '#f1f5f9' }}>Woonix LTD</strong><br />
          71-75 Shelton Street, Covent Garden<br />
          London, WC2H 9JQ, United Kingdom<br />
          E-mail (DPO) : <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
        </p>
      </LegalSection>

      <LegalSection n={2} title="Données collectées">
        <p>Lors de l&apos;utilisation d&apos;Ava, nous collectons les données suivantes :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Identifiant unique et code PIN hashé pour l&apos;authentification</li>
          <li>Adresse e-mail (pour la création de compte et les communications)</li>
          <li>Numéro de téléphone (si fourni)</li>
          <li>Historique des conversations et mémoire conversationnelle résumée</li>
          <li>Solde et historique de crédits</li>
          <li>
            Données audio transmises en temps réel lors des appels vocaux (non stockées
            de manière permanente par Woonix LTD — voir section Services Tiers)
          </li>
          <li>Tokens de notification push (pour les rappels programmés)</li>
          <li>Préférences utilisateur : langue, paramètres d&apos;application</li>
          <li>Informations techniques : type d&apos;appareil, version d&apos;application, système d&apos;exploitation</li>
          <li>Données de parrainage (code referral, parrains/filleuls)</li>
          <li>
            Clé API Gemini personnelle (Plan Custom) — chiffrée AES-256-GCM avec votre PIN,
            indéchiffrable sans ce dernier
          </li>
        </ul>
        <p className="mt-2">
          Nous ne collectons pas de données de localisation, de données biométriques
          ni de données sensibles au sens du RGPD.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Base légale du traitement (RGPD Article 6)">
        <p>Nous traitons vos données personnelles sur les bases légales suivantes :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>Exécution du contrat (Art. 6.1.b)</strong> :
            authentification, fourniture du service Ava, gestion des crédits et abonnements,
            rappels programmés, fonctionnalités de conversation
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Intérêts légitimes (Art. 6.1.f)</strong> :
            sécurité du service, prévention de la fraude, amélioration du service,
            communications techniques essentielles
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Obligation légale (Art. 6.1.c)</strong> :
            conservation des données de transaction pour les obligations comptables et fiscales
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Consentement (Art. 6.1.a)</strong> :
            communications marketing, si vous y avez expressément consenti
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Utilisation des données">
        <p>Vos données sont utilisées pour :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Fournir, personnaliser et améliorer le service Ava</li>
          <li>Authentifier et sécuriser votre accès au compte</li>
          <li>Gérer votre compte, vos crédits, votre abonnement et votre parrainage</li>
          <li>Envoyer des rappels push programmés (avec votre consentement)</li>
          <li>Vous contacter pour des communications importantes relatives au service</li>
          <li>Détecter et prévenir les abus, fraudes ou violations des CGU</li>
          <li>Respecter nos obligations légales</li>
        </ul>
        <p className="mt-2">
          Nous ne pratiquons aucune prise de décision entièrement automatisée produisant
          des effets juridiques significatifs sans intervention humaine.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Stockage, sécurité et chiffrement">
        <p>
          Vos données sont stockées sur des serveurs sécurisés hébergés par Supabase
          (infrastructure cloud, certifiée SOC 2 Type II). Les mesures de sécurité
          mises en œuvre comprennent notamment :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Chiffrement des données en transit (TLS 1.3)</li>
          <li>Chiffrement des données au repos</li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Clé API Gemini (Plan Custom)</strong> :
            chiffrée localement avec AES-256-GCM avant transmission — votre PIN n&apos;est
            jamais envoyé à nos serveurs. La clé est indéchiffrable sans votre PIN,
            y compris pour nos équipes
          </li>
          <li>Contrôle d&apos;accès strict aux bases de données</li>
          <li>Journalisation des accès critiques</li>
        </ul>
        <p className="mt-2">
          En cas de violation de données susceptible d&apos;engendrer un risque pour vos
          droits et libertés, Woonix LTD s&apos;engage à vous en informer dans les
          72 heures suivant la prise de connaissance de l&apos;incident, conformément
          au RGPD.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Sous-traitants et partage des données">
        <p>
          Nous ne vendons jamais vos données personnelles. Vos données peuvent être
          partagées avec les sous-traitants suivants, uniquement pour les finalités
          décrites dans cette politique :
        </p>
        <ul className="list-disc list-inside space-y-2 mt-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>Google (Gemini Live API)</strong> :
            traitement de l&apos;audio en temps réel et génération de réponses IA —
            données non conservées de manière permanente.{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e11d48' }}>
              Politique Google
            </a>
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Supabase</strong> : hébergement de la
            base de données et authentification — infrastructure certifiée SOC 2 Type II,
            données hébergées aux États-Unis avec garanties contractuelles adéquates (SCCs)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>RevenueCat</strong> : gestion des
            abonnements mobiles (iOS/Android) — traite les données d&apos;abonnement,
            non les données de paiement directes
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Prestataires de paiement web</strong> :
            traitement des paiements web (abonnements Pro/Custom via le site). Ces
            prestataires sont des sous-traitants indépendants soumis à leurs propres
            politiques de confidentialité et certifiés PCI-DSS. Nous ne stockons pas
            vos données de carte bancaire.
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Apple / Google</strong> : distribution
            de l&apos;application et achats intégrés (App Store / Play Store)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Resend</strong> : envoi d&apos;emails
            transactionnels (vérification de compte, notifications importantes)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Expo (notifications push)</strong> :
            acheminement des notifications push via Expo Push Service, Apple APNs
            et Firebase FCM
          </li>
        </ul>
        <p className="mt-2">
          Vos données peuvent également être communiquées aux autorités légales compétentes
          sur demande formelle conforme au droit applicable.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Transferts internationaux de données">
        <p>
          Certains de nos sous-traitants sont établis hors de l&apos;Espace Économique
          Européen (notamment aux États-Unis). Ces transferts sont encadrés par :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            Des Clauses Contractuelles Types (CCT) approuvées par la Commission Européenne
          </li>
          <li>
            Des mécanismes de certification adéquats (ex. Data Privacy Framework UE-États-Unis)
            lorsqu&apos;applicables
          </li>
        </ul>
        <p className="mt-2">
          Pour obtenir des informations sur les garanties mises en place pour ces transferts,
          contactez-nous à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Données de paiement">
        <p>
          Woonix LTD ne stocke directement aucune donnée de carte bancaire ou de paiement.
          Toutes les transactions financières sont traitées exclusivement par nos
          prestataires de paiement certifiés PCI-DSS :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Apple (App Store — iOS)</li>
          <li>Google (Play Store — Android)</li>
          <li>Prestataires de paiement web agréés (paiements via call-ava.com)</li>
        </ul>
        <p className="mt-2">
          Nous conservons uniquement les métadonnées de transaction nécessaires (montant,
          devise, date, référence d&apos;abonnement) à des fins comptables et de gestion
          des accès.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Mineurs">
        <p>
          Ava est destinée exclusivement aux personnes âgées de{' '}
          <strong style={{ color: '#f1f5f9' }}>18 ans et plus</strong>. Nous ne collectons
          pas sciemment de données personnelles de mineurs. Si vous avez connaissance qu&apos;un
          mineur a créé un compte sur Ava, veuillez nous le signaler à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>{' '}
          afin que nous puissions prendre les mesures appropriées (suppression du compte
          et des données associées).
        </p>
      </LegalSection>

      <LegalSection n={10} title="Notifications push">
        <p>
          Si vous activez les notifications push (disponibles sur les plans Pro et Custom),
          nous collectons et stockons votre token de notification push dans la colonne
          sécurisée de votre compte. Ce token est utilisé exclusivement pour l&apos;envoi
          de rappels programmés que vous avez vous-même configurés.
        </p>
        <p className="mt-2">
          Vous pouvez désactiver les notifications push à tout moment depuis les paramètres
          de votre appareil. La désactivation n&apos;entraîne pas la suppression de votre compte.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Cookies et stockage local">
        <p>
          Ava utilise le stockage local (localStorage) de votre navigateur pour conserver :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Votre session de connexion</li>
          <li>Vos préférences de langue (clé <code style={{ color: '#94a3b8' }}>ava_language</code>)</li>
          <li>Vos paramètres d&apos;application (recherche web, etc.)</li>
        </ul>
        <p className="mt-2">
          Aucun cookie de tracking publicitaire, de profilage ou de mesure d&apos;audience
          tiers n&apos;est utilisé. Vous pouvez effacer ces données via les paramètres
          de votre navigateur à tout moment.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Conservation des données">
        <p>
          Vos données sont conservées pendant toute la durée d&apos;activité de votre
          compte. Différentes durées s&apos;appliquent selon le type de données :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>Données de compte</strong> : durée d&apos;activité
            du compte + suppression sous 48h après demande
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Données de transaction</strong> : 7 ans
            (obligation légale comptable)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Audio des conversations</strong> : non stocké
            de manière permanente (traitement en temps réel uniquement)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Mémoire conversationnelle</strong> : durée
            d&apos;activité du compte, supprimée sur demande
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={13} title="Vos droits (RGPD)">
        <p>
          Conformément au RGPD et aux lois britanniques équivalentes (UK GDPR), vous
          disposez des droits suivants :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><strong style={{ color: '#f1f5f9' }}>Accès</strong> : obtenir une copie de vos données personnelles</li>
          <li><strong style={{ color: '#f1f5f9' }}>Rectification</strong> : corriger des données inexactes ou incomplètes</li>
          <li><strong style={{ color: '#f1f5f9' }}>Effacement</strong> : demander la suppression de vos données (&quot;droit à l&apos;oubli&quot;)</li>
          <li><strong style={{ color: '#f1f5f9' }}>Portabilité</strong> : recevoir vos données dans un format structuré et lisible</li>
          <li><strong style={{ color: '#f1f5f9' }}>Opposition</strong> : vous opposer au traitement basé sur nos intérêts légitimes</li>
          <li><strong style={{ color: '#f1f5f9' }}>Limitation</strong> : demander la restriction du traitement dans certains cas</li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Retrait du consentement</strong> : retirer
            à tout moment votre consentement aux traitements basés sur celui-ci, sans affecter
            la licéité des traitements antérieurs
          </li>
        </ul>
        <p className="mt-2">
          Pour exercer ces droits, contactez-nous à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>.
          Nous nous engageons à répondre dans un délai d&apos;un mois à compter de la réception
          de votre demande.
        </p>
      </LegalSection>

      <LegalSection n={14} title="Droit de réclamation auprès d'une autorité de contrôle">
        <p>
          Si vous estimez que le traitement de vos données personnelles ne respecte pas
          la réglementation applicable, vous disposez du droit d&apos;introduire une
          réclamation auprès d&apos;une autorité de contrôle compétente :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>France</strong> : Commission Nationale
            de l&apos;Informatique et des Libertés (CNIL) —{' '}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: '#e11d48' }}>
              cnil.fr
            </a>
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Royaume-Uni</strong> : Information
            Commissioner&apos;s Office (ICO) —{' '}
            <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer" style={{ color: '#e11d48' }}>
              ico.org.uk
            </a>
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>UE</strong> : autorité de contrôle
            de votre pays de résidence (liste disponible sur{' '}
            <a href="https://edpb.europa.eu" target="_blank" rel="noopener noreferrer" style={{ color: '#e11d48' }}>
              edpb.europa.eu
            </a>)
          </li>
        </ul>
        <p className="mt-2">
          Nous vous encourageons à nous contacter en premier lieu afin de résoudre
          tout différend à l&apos;amiable.
        </p>
      </LegalSection>

      <LegalSection n={15} title="Suppression de compte">
        <p>
          Vous pouvez demander la suppression de votre compte à tout moment via{' '}
          <a href="/supprimer-compte" style={{ color: '#e11d48' }}>call-ava.com/supprimer-compte</a>
          {' '}ou depuis l&apos;application mobile (Paramètres &gt; Supprimer mon compte).
          La suppression entraîne l&apos;effacement définitif et irréversible de l&apos;ensemble
          de vos données : compte, historique de conversations, mémoire conversationnelle,
          crédits, données de parrainage et clé API chiffrée. Le traitement est effectué
          sous 48 heures. Les données de transaction sont conservées 7 ans pour raisons
          légales comptables.
        </p>
      </LegalSection>

      <LegalSection n={16} title="Modifications de cette politique">
        <p>
          Woonix LTD se réserve le droit de modifier cette politique à tout moment.
          En cas de modification substantielle, nous vous en informerons par e-mail
          ou notification dans l&apos;application au moins 30 jours avant l&apos;entrée
          en vigueur des nouvelles dispositions. La version en vigueur est toujours
          accessible à{' '}
          <a href="/confidentialite" style={{ color: '#e11d48' }}>call-ava.com/confidentialite</a>.
        </p>
      </LegalSection>

      <LegalSection n={17} title="Contact">
        <p>
          Pour toute question relative à cette politique ou pour exercer vos droits :
        </p>
        <p className="mt-2">
          <strong style={{ color: '#f1f5f9' }}>Woonix LTD</strong><br />
          71-75 Shelton Street, Covent Garden<br />
          London, WC2H 9JQ, United Kingdom<br />
          E-mail : <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
          {' '}— <a href="/support" style={{ color: '#e11d48' }}>call-ava.com/support</a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
