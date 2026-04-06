import type { Metadata } from 'next'
import LegalLayout, { LegalSection } from '@/components/legal-layout'

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — Ava',
  description: "Politique de confidentialité et traitement des données personnelles d'Ava.",
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Politique de Confidentialité" updatedAt="Mars 2026">
      <LegalSection n={1} title="Données collectées">
        <p>Lors de l&apos;utilisation d&apos;Ava, nous collectons les données suivantes :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Identifiant unique et code PIN pour l&apos;authentification</li>
          <li>Adresse e-mail (si fournie lors de l&apos;inscription)</li>
          <li>Numéro de téléphone (si fourni)</li>
          <li>Historique des conversations et mémoire conversationnelle</li>
          <li>Solde et historique de crédits</li>
          <li>Données audio transmises en temps réel lors des appels (non stockées de manière permanente)</li>
          <li>Informations techniques : appareil, version d&apos;application, langue</li>
        </ul>
      </LegalSection>

      <LegalSection n={2} title="Utilisation des données">
        <p>Vos données sont utilisées pour :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Fournir et personnaliser le service Ava</li>
          <li>Maintenir et améliorer les fonctionnalités de l&apos;assistante</li>
          <li>Gérer votre compte, vos crédits et votre abonnement</li>
          <li>Vous contacter pour des informations importantes relatives au service</li>
          <li>Respecter nos obligations légales</li>
        </ul>
      </LegalSection>

      <LegalSection n={3} title="Stockage et sécurité">
        <p>
          Vos données sont stockées sur des serveurs sécurisés hébergés par Supabase (infrastructure
          cloud chiffrée). Nous mettons en œuvre des mesures techniques et organisationnelles
          appropriées pour protéger vos données contre tout accès non autorisé, perte ou divulgation.
          Les données audio des conversations ne sont pas stockées de manière permanente.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Partage des données">
        <p>Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées avec :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>Prestataires techniques</strong> : Supabase (base de données),
            Google (Gemini Live API), Resend (emails transactionnels), RevenueCat (abonnements)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Autorités légales</strong> : uniquement sur demande légale
            formelle
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={5} title="Vos droits">
        <p>Conformément aux réglementations applicables en matière de protection des données, vous disposez des droits suivants :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Droit d&apos;accès à vos données personnelles</li>
          <li>Droit de rectification des données inexactes</li>
          <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
          <li>Droit à la portabilité de vos données</li>
          <li>Droit d&apos;opposition au traitement</li>
        </ul>
        <p className="mt-2">
          Pour exercer ces droits, contactez-nous à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Cookies et stockage local">
        <p>
          Ava utilise le stockage local (localStorage) de votre navigateur pour conserver votre session
          de connexion et vos préférences (langue, paramètres). Aucun cookie de tracking publicitaire
          n&apos;est utilisé. Vous pouvez effacer ces données via les paramètres de votre navigateur.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Conservation des données">
        <p>
          Vos données sont conservées pendant toute la durée d&apos;activité de votre compte afin
          d&apos;assurer la continuité du service. À la suite d&apos;une demande de suppression de compte,
          l&apos;ensemble de vos données est définitivement effacé sous 48 heures.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Contact">
        <p>
          Pour toute question relative à cette politique ou pour exercer vos droits :{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
          {' '}— <a href="/support" style={{ color: '#e11d48' }}>call-ava.com/support</a>
        </p>
      </LegalSection>

      <LegalSection n={9} title="Services tiers">
        <ul className="list-disc list-inside space-y-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>Google Gemini Live</strong> : traitement de l&apos;audio
            en temps réel, non stocké de manière permanente —{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e11d48' }}>
              Politique Google
            </a>
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Supabase</strong> : hébergement base de données et
            authentification — infrastructure chiffrée ISO 27001
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Resend</strong> : envoi d&apos;emails transactionnels
            (vérification, notifications)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>RevenueCat</strong> : gestion des abonnements mobiles
            (iOS/Android)
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={10} title="Suppression de compte">
        <p>
          Vous pouvez demander la suppression de votre compte à tout moment via{' '}
          <a href="/supprimer-compte" style={{ color: '#e11d48' }}>call-ava.com/supprimer-compte</a>
          {' '}ou depuis l&apos;application mobile. La suppression entraîne l&apos;effacement définitif
          et irréversible de l&apos;ensemble de vos données : compte, historique de conversations,
          mémoire, crédits et données de parrainage. Le traitement est effectué sous 48 heures.
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
