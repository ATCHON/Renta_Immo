/**
 * UX-S01 — Footer « Petra Nova »
 * Couleur de fond : secondary-fixed (#d6e6dd)
 */

import Link from 'next/link';
import { APP_NAME } from '@/config/app';

export function VerdantFooter() {
  return (
    <footer className="w-full pt-14 pb-10 bg-secondary-fixed">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <span className="font-headline font-bold text-xl text-primary tracking-tighter">
          {APP_NAME}
        </span>

        <div className="flex items-center gap-8">
          <Link
            href="/mentions-legales"
            className="font-body text-sm text-primary/50 hover:text-primary transition-colors"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="font-body text-sm text-primary/50 hover:text-primary transition-colors"
          >
            Politique de confidentialité
          </Link>
          <Link
            href="/en-savoir-plus"
            className="font-body text-sm text-primary/50 hover:text-primary transition-colors"
          >
            Comment ça marche
          </Link>
        </div>

        <p className="font-body text-sm text-primary/40">
          © 2026 Petra Nova. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
