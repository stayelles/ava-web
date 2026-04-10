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
          gratuit de 3 jours pour vous permettre de tester le service sans engagement
          ni paiement. Si vous souscrivez à un abonnement payant et souhaitez être
          remboursé, vous bénéficiez d&apos;un remboursement complet, sans conditions
          ni questions posées, dans les 14 jours suivant votre premier paiement.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Droit au remboursement">
        <p>
          Tout abonnement souscrit via Paddle (notre prestataire de paiement) ouvre droit
          à un remboursement complet si la demande est formulée dans les{' '}
          <strong style={{ color: '#f1f5f9' }}>14 jours</strong> suivant la date du
          premier prélèvement. Ce remboursement est accordé{' '}
          <strong style={{ color: '#f1f5f9' }}>sans condition ni justification</strong>.
        </p>
        <p className="mt-2">
          En cas de double facturation ou d&apos;erreur technique imputable à Paddle
          ou à Woonix LTD, le remboursement est intégral, quel que soit le délai.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Comment demander un remboursement">
        <p>Pour exercer votre droit au remboursement, contactez-nous à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
          {' '}avec les informations suivantes :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Votre adresse e-mail de compte</li>
          <li>La référence de votre transaction (disponible dans le reçu Paddle)</li>
        </ul>
        <p className="mt-2">
          Notre équipe accusera réception sous 24 heures (jours ouvrés) et traitera
          le remboursement dans un délai de{' '}
          <strong style={{ color: '#f1f5f9' }}>3 à 5 jours ouvrés</strong>.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Traitement du remboursement">
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
        </ul>
      </LegalSection>

      <LegalSection n={5} title="Contact">
        <p>
          Pour toute demande de remboursement ou question relative à cette politique :
        </p>
        <p className="mt-2">
          <strong style={{ color: '#f1f5f9' }}>Woonix LTD</strong><br />
          71-75 Shelton Street, Covent Garden<br />
          London, WC2H 9JQ, United Kingdom<br />
          E-mail :{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
