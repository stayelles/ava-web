import type { Metadata } from 'next'
import LegalLayout, { LegalSection } from '@/components/legal-layout'

export const metadata: Metadata = {
  title: 'Politique de Remboursement — Ava',
  description: "Politique de remboursement de l'assistant vocal Ava par Woonix LTD.",
}

export default function RefundPage() {
  return (
    <LegalLayout title="Politique de Remboursement" updatedAt="Avril 2026">
      <LegalSection n={1} title="Notre engagement">
        <p>
          Chez Woonix LTD, votre satisfaction est notre priorité. Ava propose un essai
          gratuit de 7 jours pour vous permettre de tester le service sans engagement
          ni paiement. Si vous souscrivez à un abonnement payant et n&apos;êtes pas
          satisfait, nous offrons un remboursement complet dans les conditions décrites
          ci-dessous — sans questions posées.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Éligibilité au remboursement">
        <p>Un remboursement complet peut être accordé dans les cas suivants :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>Premier paiement uniquement</strong> :
            dans les <strong style={{ color: '#f1f5f9' }}>7 jours</strong> suivant la
            date du premier prélèvement, si vous n&apos;avez pas utilisé intensivement
            le service au-delà de l&apos;essai gratuit
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Problème technique avéré</strong> :
            si un bug ou une défaillance technique imputable à Ava vous a empêché
            d&apos;utiliser le service normalement, et que notre équipe support n&apos;a
            pas pu le résoudre dans un délai raisonnable
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Double facturation</strong> :
            en cas d&apos;erreur de facturation (ex. double prélèvement), un
            remboursement intégral est garanti
          </li>
        </ul>
        <p className="mt-2">
          Les renouvellements d&apos;abonnement (mensuel, trimestriel, semestriel)
          ne sont pas remboursables une fois la période entamée, sauf en cas de
          problème technique documenté.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Exceptions — Non-remboursable">
        <p>Les demandes de remboursement seront refusées dans les cas suivants :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            Demande soumise après le délai de 7 jours suivant le premier paiement
            (hors problème technique)
          </li>
          <li>
            Compte suspendu ou résilié pour violation des Conditions Générales
            d&apos;Utilisation (abus, contenu interdit, fraude, etc.)
          </li>
          <li>
            Insatisfaction liée aux réponses de l&apos;IA (les performances de
            l&apos;intelligence artificielle varient par nature et ne constituent
            pas un motif de remboursement)
          </li>
          <li>
            Oubli de résiliation avant renouvellement automatique — nous vous
            recommandons de configurer un rappel avant votre date de renouvellement
          </li>
          <li>
            Crédits utilisés ou fonctionnalités consommées de manière significative
            pendant la période de remboursement demandée
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={4} title="Comment demander un remboursement">
        <p>Pour soumettre une demande de remboursement, envoyez un e-mail à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
          {' '}avec les informations suivantes :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Votre adresse e-mail de compte</li>
          <li>La référence de votre transaction ou abonnement</li>
          <li>La raison de votre demande (facultatif — nous ne posons pas de questions)</li>
        </ul>
        <p className="mt-2">
          Notre équipe accusera réception de votre demande sous 24 heures (jours ouvrés)
          et traitera le remboursement dans un délai de{' '}
          <strong style={{ color: '#f1f5f9' }}>3 à 5 jours ouvrés</strong>.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Traitement du remboursement">
        <ul className="list-disc list-inside space-y-1">
          <li>
            Le remboursement est émis sur le moyen de paiement original utilisé
            lors de l&apos;achat
          </li>
          <li>
            Vous recevrez un e-mail de confirmation une fois le remboursement traité
          </li>
          <li>
            Les délais de crédit sur votre compte bancaire dépendent de votre
            établissement financier (généralement 5 à 10 jours ouvrés)
          </li>
          <li>
            Pour les achats effectués via l&apos;App Store (Apple) ou le Play Store
            (Google), la demande de remboursement doit être adressée directement
            à Apple ou Google, conformément à leurs politiques respectives
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={6} title="Circonstances particulières">
        <p>
          Dans des situations exceptionnelles non couvertes par cette politique
          (maladie, décès, erreur de notre part), Woonix LTD examinera toute
          demande au cas par cas et pourra accorder un remboursement à sa discrétion.
          Contactez-nous à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
          {' '}pour en discuter.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Contact">
        <p>
          Pour toute demande de remboursement ou question relative à cette politique :
        </p>
        <p className="mt-2">
          <strong style={{ color: '#f1f5f9' }}>Woonix LTD</strong><br />
          71-75 Shelton Street, Covent Garden<br />
          London, WC2H 9JQ, United Kingdom<br />
          E-mail :{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a><br />
          Support :{' '}
          <a href="/support" style={{ color: '#e11d48' }}>call-ava.com/support</a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
