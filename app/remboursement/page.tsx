import type { Metadata } from 'next'
import LegalLayout, { LegalSection } from '@/components/legal-layout'

export const metadata: Metadata = {
  title: 'Politique de Remboursement — Ava',
  description: "Politique de vente finale et de remboursement des services Ava par Woonix LTD.",
}

export default function RefundPage() {
  return (
    <LegalLayout title="Politique de Remboursement" updatedAt="Août 2026">
      <LegalSection n={1} title="Vente finale après activation">
        <p>
          Les abonnements, renouvellements, changements de formule et achats de services
          Ava sont des ventes finales dès que le paiement est confirmé et que l&apos;accès
          est activé. Aucun remboursement commercial n&apos;est accordé après cette
          activation, notamment en cas de changement d&apos;avis, de non-utilisation du
          service, de résultat financier différent des attentes, de difficulté de
          configuration relevant de l&apos;utilisateur ou d&apos;incompatibilité non vérifiée
          avant l&apos;achat.
        </p>
        <p className="mt-2">
          L&apos;activation peut engager immédiatement des capacités techniques, des
          licences, des services tiers et des ressources opérationnelles non récupérables.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Renouvellement et période déjà payée">
        <p>
          Lorsque le moyen de paiement le permet, vous pouvez arrêter un renouvellement
          futur. Cet arrêt empêche le prochain prélèvement mais ne résilie pas
          rétroactivement la période déjà payée et ne donne droit à aucun remboursement,
          total ou partiel, de cette période. L&apos;accès reste disponible jusqu&apos;à son
          échéance, sauf suspension prévue par les Conditions Générales d&apos;Utilisation.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Canaux de vente concernés">
        <p>
          Cette politique couvre les paiements effectués sur call-ava.com, dans Ava,
          auprès de nos partenaires de paiement agréés, au moyen d&apos;un lien de paiement
          direct ou à la suite d&apos;un échange écrit avec l&apos;équipe Ava. Lorsqu&apos;un accord
          écrit distinct a été présenté et accepté avant le paiement, ses conditions font
          également partie du contrat.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Droits impératifs et erreurs de paiement">
        <p>
          La présente politique ne limite pas les droits auxquels un consommateur ne peut
          légalement renoncer dans son pays de résidence. Toute demande fondée sur un droit
          impératif, une double facturation vérifiée, un montant prélevé incorrectement ou
          une transaction non autorisée est examinée individuellement avec le prestataire
          de paiement concerné. Aucune exception éventuelle ne crée une garantie générale
          de remboursement pour les autres achats.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Contact">
        <p>
          Pour signaler une erreur de paiement ou poser une question relative à cette politique :
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
