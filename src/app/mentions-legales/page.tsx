import Link from 'next/link';
import { APP_NAME } from '@/config/app';

export const metadata = {
  title: `Mentions légales — ${APP_NAME}`,
};

export default function MentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <h1 className="font-headline text-4xl font-extrabold text-on-surface mb-2 tracking-tight">
        Mentions légales
      </h1>
      <p className="text-on-surface-variant mb-12 font-body">Dernière mise à jour : mars 2026</p>

      <section className="space-y-10 font-body text-on-surface-variant leading-relaxed">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">Éditeur du site</h2>
          <p>
            {APP_NAME} est un service de simulation d&apos;investissement immobilier édité à titre
            personnel. Pour toute question, contactez-nous à l&apos;adresse indiquée en bas de page.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">Hébergement</h2>
          <p>
            Le site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701, San
            Francisco, CA 94104, États-Unis.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">
            Propriété intellectuelle
          </h2>
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, graphiques, logotypes,
            icônes, images) sont protégés par le droit d&apos;auteur. Toute reproduction ou
            représentation, même partielle, est interdite sans autorisation préalable.
          </p>
        </div>

        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface mb-3">Responsabilité</h2>
          <p>
            Les simulations fournies par {APP_NAME} sont données à titre indicatif et ne constituent
            pas un conseil financier, fiscal ou juridique. L&apos;éditeur décline toute
            responsabilité quant aux décisions prises sur la base de ces résultats.
          </p>
        </div>
      </section>

      <div className="mt-16 pt-8 border-t border-outline-variant/20">
        <Link
          href="/"
          className="font-headline font-semibold text-primary hover:text-primary/80 transition-colors text-sm"
        >
          ← Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
