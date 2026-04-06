import type { Metadata } from 'next'
import LegalLayout, { LegalSection } from '@/components/legal-layout'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Ava",
  description: "Conditions générales d'utilisation de l'assistant vocal Ava.",
}

export default function CGUPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" updatedAt="Mars 2026">
      <LegalSection n={1} title="Objet">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation
          d&apos;Ava, une assistante virtuelle propulsée par l&apos;intelligence artificielle, disponible via
          l&apos;application mobile (iOS et Android), l&apos;application web, l&apos;application desktop et
          le service de messagerie WhatsApp. Ava est conçue pour offrir des conversations vocales et textuelles
          personnalisées, des conseils et un soutien dans diverses situations du quotidien.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Acceptation des conditions">
        <p>
          En accédant à Ava et en utilisant ses services, vous acceptez pleinement et sans réserve les présentes
          CGU. Si vous n&apos;acceptez pas ces conditions, veuillez ne pas utiliser nos services.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Accès au service">
        <p>
          Ava est accessible via plusieurs plateformes : l&apos;application mobile (iOS et Android),
          l&apos;application web (call-ava.com/app), l&apos;application desktop (Mac et Windows) et
          WhatsApp. La disponibilité 24h/24 et 7j/7 n&apos;est pas garantie et peut être interrompue pour
          maintenance, mises à jour ou circonstances exceptionnelles.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Compte utilisateur">
        <p>
          Chaque utilisateur dispose d&apos;un identifiant unique associé à son compte. Votre code PIN
          personnel est strictement confidentiel et ne doit pas être partagé. Vous êtes entièrement
          responsable des activités effectuées sous votre compte. En cas de suspicion d&apos;utilisation
          non autorisée, contactez immédiatement le support à contact@call-ava.com.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Crédits et paiements">
        <p>
          Ava fonctionne selon un système de crédits. Des crédits gratuits sont attribués quotidiennement
          à chaque utilisateur. Des crédits supplémentaires peuvent être acquis via les achats intégrés.
          Les crédits achetés ne sont pas remboursables et ont une durée de validité limitée. Les abonnements
          Ava Pro donnent accès à des fonctionnalités avancées et des quotas élargis.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Responsabilités">
        <p>
          Les réponses fournies par Ava sont générées par intelligence artificielle et présentées à titre
          informatif uniquement. Elles ne constituent pas un conseil professionnel (médical, juridique,
          financier, etc.). Woonix LTD ne peut être tenu responsable des décisions prises sur la base
          des informations fournies par Ava. L&apos;utilisateur conserve la pleine responsabilité de ses actes.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Propriété intellectuelle">
        <p>
          Tous les éléments d&apos;Ava — nom, logo, interface, algorithmes, contenu — sont protégés par les
          lois sur la propriété intellectuelle et appartiennent à Woonix LTD. Toute reproduction,
          modification ou exploitation commerciale sans autorisation écrite préalable est strictement interdite.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Modification des CGU">
        <p>
          Woonix LTD se réserve le droit de modifier les présentes CGU à tout moment. Les modifications
          entrent en vigueur dès leur publication. La poursuite de l&apos;utilisation du service après
          modification vaut acceptation des nouvelles conditions.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Contact">
        <p>
          Pour toute question relative aux présentes CGU, contactez-nous à :{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
          {' '}ou via{' '}
          <a href="/support" style={{ color: '#e11d48' }}>call-ava.com/support</a>.
        </p>
      </LegalSection>

      <LegalSection n={10} title="Intelligence artificielle et services tiers">
        <p>
          Ava utilise l&apos;API Google Gemini Live pour le traitement du langage naturel et la synthèse
          vocale. Les données audio sont transmises en temps réel à Google pour traitement et ne sont pas
          stockées de manière permanente par Woonix LTD. L&apos;utilisation de ces services tiers est
          soumise aux politiques de confidentialité et conditions d&apos;utilisation de Google.
        </p>
      </LegalSection>

      <LegalSection n={11} title="Application mobile et permissions">
        <p>
          L&apos;application mobile requiert l&apos;accès au microphone pour les conversations vocales
          en temps réel. L&apos;audio peut être enregistré et transmis en arrière-plan pour maintenir
          la connexion WebSocket active. Ces permissions sont utilisées exclusivement pour les fonctionnalités
          d&apos;Ava et peuvent être révoquées à tout moment dans les paramètres de votre appareil.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Suppression de compte">
        <p>
          Vous pouvez demander la suppression de votre compte à tout moment via{' '}
          <a href="/supprimer-compte" style={{ color: '#e11d48' }}>call-ava.com/supprimer-compte</a>
          {' '}ou depuis l&apos;application mobile (Paramètres &gt; Supprimer mon compte). Les demandes
          sont traitées sous 48 heures. La suppression est définitive et entraîne la perte de toutes
          vos données (compte, historique, crédits, parrainage).
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
