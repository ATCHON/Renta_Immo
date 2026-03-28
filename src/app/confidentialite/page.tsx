import Link from 'next/link';
import { APP_NAME } from '@/config/app';

export const metadata = {
  title: `Politique de confidentialité — ${APP_NAME}`,
};

export default function ConfidentialitePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="font-headline text-4xl font-extrabold text-on-surface mb-2 tracking-tight">
        Politique de confidentialité
      </h1>
      <p className="text-on-surface-variant mb-12 font-body">Dernière mise à jour : mars 2026</p>

      <section className="space-y-10 font-body text-on-surface-variant leading-relaxed">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            Données collectées
          </h2>
          <p>
            {APP_NAME} collecte uniquement les données nécessaires au fonctionnement du service :
          </p>
          <ul className="list-disc list-inside mt-3 space-y-1">
            <li>Adresse e-mail et nom (lors de la création d'un compte)</li>
            <li>Données de simulation saisies dans le formulaire</li>
            <li>Données de connexion (via Better Auth)</li>
          </ul>
        </div>

        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            Utilisation des données
          </h2>
          <p>
            Vos données sont utilisées exclusivement pour faire fonctionner le simulateur, sauvegarder
            vos simulations et vous envoyer les rapports demandés. Elles ne sont jamais vendues ni
            partagées avec des tiers à des fins commerciales.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">Conservation</h2>
          <p>
            Les données de compte sont conservées jusqu'à suppression de votre compte. Les
            simulations anonymes ne sont pas conservées au-delà de la session.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de
            suppression de vos données. Pour exercer ces droits, contactez-nous via votre espace
            compte ou par e-mail.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">Cookies</h2>
          <p>
            {APP_NAME} utilise uniquement des cookies strictement nécessaires au maintien de votre
            session. Aucun cookie publicitaire ou de tracking tiers n'est déposé.
          </p>
        </div>
      </section>

      <div className="mt-16 pt-8 border-t border-outline-variant/20">
        <Link
          href="/"
          className="font-headline font-semibold text-primary hover:text-primary/80 transition-colors text-sm"
        >
          ← Retour à l'accueil
        </Link>
      </div>
    </main>
  );
}
