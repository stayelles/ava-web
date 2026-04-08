import type { Metadata } from 'next'
import LegalLayout, { LegalSection } from '@/components/legal-layout'

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Ava",
  description: "Conditions générales d'utilisation de l'assistant vocal Ava.",
}

export default function CGUPage() {
  return (
    <LegalLayout title="Conditions Générales d'Utilisation" updatedAt="Avril 2026">
      <LegalSection n={1} title="Objet et parties contractantes">
        <p>
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et
          l&apos;utilisation d&apos;Ava, une assistante virtuelle propulsée par l&apos;intelligence
          artificielle, éditée par <strong style={{ color: '#f1f5f9' }}>Woonix LTD</strong>,
          société enregistrée en Angleterre et au Pays de Galles. Ava est accessible via
          l&apos;application mobile (iOS et Android), l&apos;application web (call-ava.com),
          l&apos;application desktop (Mac et Windows) et WhatsApp.
        </p>
        <p className="mt-2">
          En accédant au service, vous concluez un contrat avec Woonix LTD. Pour toute question :
          {' '}<a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>.
        </p>
      </LegalSection>

      <LegalSection n={2} title="Acceptation des conditions">
        <p>
          En accédant à Ava et en utilisant ses services, vous acceptez pleinement et sans réserve
          les présentes CGU ainsi que notre Politique de Confidentialité. Si vous n&apos;acceptez
          pas ces conditions, veuillez ne pas utiliser nos services.
        </p>
        <p className="mt-2">
          Woonix LTD se réserve le droit de modifier les présentes CGU à tout moment. Les
          modifications entrent en vigueur dès leur publication sur call-ava.com/cgu. La poursuite
          de l&apos;utilisation du service après modification vaut acceptation des nouvelles
          conditions. En cas de modification substantielle, nous vous en informerons par e-mail
          ou notification dans l&apos;application.
        </p>
      </LegalSection>

      <LegalSection n={3} title="Conditions d'accès — Âge minimum">
        <p>
          L&apos;accès à Ava est réservé aux personnes ayant atteint l&apos;âge de{' '}
          <strong style={{ color: '#f1f5f9' }}>18 ans</strong>. En utilisant le service, vous
          déclarez avoir au moins 18 ans. Il est de votre responsabilité, si vous êtes
          parent ou tuteur légal, de surveiller l&apos;utilisation du service par les mineurs
          dont vous avez la garde. Woonix LTD se réserve le droit de suspendre immédiatement
          tout compte dont le titulaire s&apos;avère être mineur.
        </p>
      </LegalSection>

      <LegalSection n={4} title="Accès au service et disponibilité">
        <p>
          Ava est accessible 24h/24, 7j/7, sous réserve de maintenance, mises à jour ou
          circonstances exceptionnelles. Woonix LTD ne garantit pas une disponibilité
          ininterrompue et ne saurait être tenu responsable des interruptions temporaires
          du service. Nous nous efforçons d&apos;effectuer les maintenances planifiées
          en dehors des heures de pointe et d&apos;en informer les utilisateurs à
          l&apos;avance lorsque cela est possible.
        </p>
      </LegalSection>

      <LegalSection n={5} title="Compte utilisateur et sécurité">
        <p>
          Chaque utilisateur dispose d&apos;un identifiant unique associé à son compte.
          Vous êtes entièrement responsable :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>De la confidentialité de votre code PIN personnel</li>
          <li>De la sécurité de l&apos;accès à votre appareil et votre session</li>
          <li>De toutes les activités effectuées sous votre compte</li>
          <li>
            De ne jamais partager vos identifiants ou donner accès à votre compte
            à un tiers non autorisé
          </li>
        </ul>
        <p className="mt-2">
          En cas de suspicion d&apos;utilisation non autorisée de votre compte, vous devez
          immédiatement en informer Woonix LTD à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>.
          Woonix LTD ne saurait être responsable des dommages résultant du non-respect
          de ces obligations de sécurité.
        </p>
      </LegalSection>

      <LegalSection n={6} title="Plans tarifaires et paiements">
        <p>
          Ava propose plusieurs plans d&apos;utilisation :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>Plan Gratuit</strong> : accès limité,
            crédits quotidiens offerts (5 crédits/jour renouvelés à minuit UTC)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Plan Pro</strong> : 250 minutes de voix/mois,
            300 messages texte/jour, fonctionnalités avancées illimitées — facturation mensuelle
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Plan Custom</strong> : quotas illimités via votre
            propre clé API Gemini — facturation mensuelle
          </li>
        </ul>
        <p className="mt-2">
          Les paiements sont traités par des prestataires de paiement tiers agréés (Apple,
          Google et nos partenaires de paiement web). Woonix LTD n&apos;est pas un prestataire
          de services de paiement et ne stocke pas vos données bancaires. Les abonnements
          se renouvellent automatiquement sauf résiliation avant la date de renouvellement.
          Les crédits achetés ne sont pas remboursables. Woonix LTD se réserve le droit de
          modifier les tarifs avec un préavis minimum de 30 jours communiqué par e-mail.
        </p>
        <p className="mt-2">
          Notre politique de remboursement complète est disponible à{' '}
          <a href="/remboursement" style={{ color: '#e11d48' }}>call-ava.com/remboursement</a>.
        </p>
      </LegalSection>

      <LegalSection n={7} title="Droit de rétractation (Union Européenne)">
        <p>
          Conformément à la réglementation européenne applicable (Directive 2011/83/UE),
          les utilisateurs résidant dans l&apos;Union Européenne bénéficient d&apos;un
          droit de rétractation de <strong style={{ color: '#f1f5f9' }}>14 jours</strong>
          {' '}à compter de la date de souscription d&apos;un abonnement payant.
        </p>
        <p className="mt-2">
          Toutefois, en souscrivant à un abonnement, vous reconnaissez que la fourniture
          du service commence immédiatement et acceptez expressément que votre droit de
          rétractation soit limité une fois le service entamé. Pour exercer votre droit
          de rétractation, contactez-nous à{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>.
        </p>
      </LegalSection>

      <LegalSection n={8} title="Utilisations interdites">
        <p>Il est strictement interdit d&apos;utiliser Ava pour :</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Produire, diffuser ou solliciter du contenu illégal, haineux, violent ou pornographique</li>
          <li>Harceler, menacer, intimider ou diffamer toute personne</li>
          <li>Tenter de contourner les limites ou les mesures de sécurité du service</li>
          <li>
            Utiliser des scripts, bots, ou systèmes automatisés pour accéder au service
            sans autorisation préalable écrite de Woonix LTD
          </li>
          <li>Revendre, sous-licencier ou exploiter commercialement le service sans accord écrit</li>
          <li>Tenter d&apos;extraire des données du service à grande échelle (scraping)</li>
          <li>Usurper l&apos;identité d&apos;une autre personne ou entité</li>
          <li>Utiliser le service à des fins contraires aux lois en vigueur dans votre pays de résidence</li>
        </ul>
        <p className="mt-2">
          Tout manquement à ces règles peut entraîner la suspension ou la résiliation immédiate
          du compte concerné, sans remboursement.
        </p>
      </LegalSection>

      <LegalSection n={9} title="Plan Custom — Clé API personnelle">
        <p>
          Le Plan Custom permet d&apos;utiliser votre propre clé API Gemini (Google AI Studio)
          à la place de la clé partagée de l&apos;application. En utilisant cette fonctionnalité :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            Vous êtes seul responsable de la gestion, de la sécurité et des coûts associés
            à votre clé API Google
          </li>
          <li>
            Votre clé est chiffrée avec votre PIN personnel (AES-256-GCM) avant stockage —
            elle est indéchiffrable par Woonix LTD sans votre PIN
          </li>
          <li>
            La perte de votre PIN entraîne la perte irrémédiable de l&apos;accès à votre
            clé chiffrée
          </li>
          <li>
            L&apos;utilisation de votre clé est soumise aux Conditions d&apos;utilisation
            de Google AI Studio
          </li>
          <li>
            Woonix LTD ne peut être tenu responsable des frais Google résultant
            de l&apos;utilisation de votre clé
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={10} title="Intégrations MCP et serveurs tiers">
        <p>
          Ava permet de connecter des serveurs MCP (Model Context Protocol) tiers
          (Notion, GitHub, Brave Search, etc.). En utilisant ces intégrations :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            Vous êtes responsable des autorisations accordées à Ava pour accéder
            à vos données tierces
          </li>
          <li>
            Woonix LTD n&apos;est pas responsable du contenu, de la disponibilité
            ou des actions des serveurs MCP tiers
          </li>
          <li>
            L&apos;utilisation des services tiers est soumise à leurs propres conditions
            d&apos;utilisation et politiques de confidentialité
          </li>
          <li>
            Ava peut exécuter des actions (lecture, écriture, modification) sur ces services
            selon vos instructions — vous assumez la responsabilité de ces actions
          </li>
        </ul>
      </LegalSection>

      <LegalSection n={11} title="Contrôle à distance et agent IA">
        <p>
          Ava dispose de fonctionnalités de contrôle à distance de votre ordinateur
          (Mac/PC) et d&apos;automatisation (agent IA). Ces fonctionnalités permettent à
          Ava d&apos;exécuter des commandes sur votre appareil selon vos instructions.
        </p>
        <p className="mt-2">
          Vous êtes seul responsable de toutes les actions effectuées sur votre appareil
          via ces fonctionnalités. Woonix LTD ne saurait être tenu responsable de tout
          dommage résultant d&apos;une utilisation incorrecte ou d&apos;instructions mal
          formulées données à l&apos;agent IA. Il est fortement déconseillé d&apos;utiliser
          ces fonctionnalités sur des systèmes de production critique sans précautions
          préalables.
        </p>
      </LegalSection>

      <LegalSection n={12} title="Intelligence artificielle et limites du service">
        <p>
          Les réponses fournies par Ava sont générées par intelligence artificielle et présentées
          à titre informatif uniquement. Elles ne constituent en aucun cas un conseil professionnel
          (médical, juridique, financier, psychologique, etc.) et ne doivent pas être interprétées
          comme tel.
        </p>
        <p className="mt-2">
          Woonix LTD ne garantit pas l&apos;exactitude, la complétude ou l&apos;adéquation des
          réponses générées par l&apos;IA. Le service est fourni{' '}
          <strong style={{ color: '#f1f5f9' }}>&quot;en l&apos;état&quot;</strong>{' '}
          sans garantie d&apos;aucune sorte, expresse ou implicite. L&apos;utilisateur conserve
          la pleine et entière responsabilité des décisions prises sur la base des informations
          fournies par Ava.
        </p>
      </LegalSection>

      <LegalSection n={13} title="Permissions de l'application mobile">
        <p>
          L&apos;application mobile requiert certaines permissions pour fonctionner correctement :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>
            <strong style={{ color: '#f1f5f9' }}>Microphone</strong> : obligatoire pour les
            conversations vocales en temps réel
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Notifications push</strong> : pour les rappels
            programmés (abonnés Pro et Custom)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Capture d&apos;écran</strong> : pour la
            fonctionnalité de vision écran (optionnelle, activée par l&apos;utilisateur)
          </li>
          <li>
            <strong style={{ color: '#f1f5f9' }}>Accessibilité (Android)</strong> : pour les
            fonctionnalités d&apos;agent IA (optionnel, activé explicitement par l&apos;utilisateur)
          </li>
        </ul>
        <p className="mt-2">
          Ces permissions peuvent être révoquées à tout moment dans les paramètres de votre
          appareil. La révocation de certaines permissions peut rendre indisponibles certaines
          fonctionnalités.
        </p>
      </LegalSection>

      <LegalSection n={14} title="Responsabilité et exclusions de garantie">
        <p>
          Dans les limites autorisées par la loi applicable, Woonix LTD exclut toute
          garantie implicite de qualité marchande, d&apos;adéquation à un usage particulier
          ou d&apos;absence de contrefaçon. Woonix LTD ne pourra être tenu responsable
          de dommages indirects, accessoires, spéciaux ou consécutifs, notamment :
        </p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Perte de données ou de revenus</li>
          <li>Interruption d&apos;activité</li>
          <li>Dommages résultant de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le service</li>
          <li>Décisions prises sur la base des réponses de l&apos;IA</li>
        </ul>
        <p className="mt-2">
          La responsabilité totale de Woonix LTD ne pourra excéder le montant versé par
          l&apos;utilisateur au cours des 12 mois précédant l&apos;événement donnant lieu
          à la réclamation.
        </p>
      </LegalSection>

      <LegalSection n={15} title="Résiliation et suspension de compte">
        <p>
          Woonix LTD se réserve le droit de suspendre ou de résilier votre accès au service,
          avec ou sans préavis, en cas de violation des présentes CGU, d&apos;activité
          frauduleuse, ou de comportement préjudiciable au service ou à d&apos;autres utilisateurs.
        </p>
        <p className="mt-2">
          Vous pouvez demander la suppression de votre compte à tout moment via{' '}
          <a href="/supprimer-compte" style={{ color: '#e11d48' }}>call-ava.com/supprimer-compte</a>
          {' '}ou depuis l&apos;application mobile (Paramètres &gt; Supprimer mon compte).
          Les demandes sont traitées sous 48 heures. La suppression est définitive et entraîne
          la perte de toutes vos données (compte, historique, crédits, parrainage).
        </p>
      </LegalSection>

      <LegalSection n={16} title="Propriété intellectuelle">
        <p>
          Tous les éléments d&apos;Ava — nom, logo, interface, algorithmes, contenu éditorial —
          sont protégés par les lois sur la propriété intellectuelle et appartiennent à
          Woonix LTD ou font l&apos;objet d&apos;une licence. Toute reproduction,
          modification, distribution ou exploitation commerciale sans autorisation écrite
          préalable est strictement interdite.
        </p>
        <p className="mt-2">
          Le contenu que vous générez via Ava (conversations, rappels, etc.) vous appartient.
          En utilisant le service, vous accordez à Woonix LTD une licence limitée,
          non exclusive et non transférable d&apos;utiliser ce contenu exclusivement
          pour la fourniture du service.
        </p>
      </LegalSection>

      <LegalSection n={17} title="Protection des données (RGPD)">
        <p>
          Woonix LTD traite vos données personnelles conformément au Règlement Général sur
          la Protection des Données (RGPD - UE 2016/679) et aux lois britanniques équivalentes
          (UK GDPR / Data Protection Act 2018). Les détails de ce traitement sont décrits
          dans notre{' '}
          <a href="/confidentialite" style={{ color: '#e11d48' }}>Politique de Confidentialité</a>.
        </p>
      </LegalSection>

      <LegalSection n={18} title="Loi applicable et juridiction">
        <p>
          Les présentes CGU sont régies par le droit anglais et gallois.
          Tout litige relatif à l&apos;interprétation ou à l&apos;exécution des présentes
          CGU sera soumis à la compétence exclusive des tribunaux d&apos;Angleterre et
          du Pays de Galles, sous réserve des dispositions légales impératives applicables
          dans votre pays de résidence au sein de l&apos;Union Européenne.
        </p>
        <p className="mt-2">
          Si vous résidez dans l&apos;Union Européenne, vous bénéficiez également de
          la protection offerte par les lois de consommation de votre pays de résidence.
          La Commission Européenne propose une plateforme de résolution des litiges en ligne
          accessible à{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" style={{ color: '#e11d48' }}>
            ec.europa.eu/consumers/odr
          </a>.
        </p>
      </LegalSection>

      <LegalSection n={19} title="Contact">
        <p>
          Pour toute question relative aux présentes CGU, contactez-nous à :{' '}
          <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
          {' '}ou via{' '}
          <a href="/support" style={{ color: '#e11d48' }}>call-ava.com/support</a>.
        </p>
        <p className="mt-2">
          <strong style={{ color: '#f1f5f9' }}>Woonix LTD</strong><br />
          71-75 Shelton Street, Covent Garden<br />
          London, WC2H 9JQ, United Kingdom<br />
          E-mail : <a href="mailto:contact@call-ava.com" style={{ color: '#e11d48' }}>contact@call-ava.com</a>
        </p>
      </LegalSection>
    </LegalLayout>
  )
}
