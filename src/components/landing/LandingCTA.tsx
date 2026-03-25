/**
 * UX-S01 — Section CTA finale
 * Référence : landing_page_accueil_premium/code.html — Final CTA Section
 */

import Link from 'next/link';

export function LandingCTA() {
  return (
    <section className="py-20 px-6 md:px-8">
      <div className="max-w-5xl mx-auto bg-primary-container rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            Prêt à sécuriser votre prochain investissement ?
          </h2>
          <p className="text-white/70 font-body text-lg max-w-md mx-auto mb-10">
            Analyse complète en moins de 2 minutes. Aucun compte requis pour commencer.
          </p>
          <Link
            href="/calculateur?reset=true"
            className="inline-flex items-center justify-center px-12 py-5 bg-white text-primary rounded-full font-headline font-extrabold text-xl shadow-xl hover:bg-secondary-fixed transition-all duration-200 active:scale-95"
          >
            Commencer maintenant
          </Link>
          <p className="mt-6 text-white/50 font-body text-sm">
            Gratuit · Aucune carte bancaire · Résultats instantanés
          </p>
        </div>

        {/* Décorations blur */}
        <div
          className="absolute -bottom-16 -left-16 w-72 h-72 bg-primary rounded-full mix-blend-multiply opacity-50 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -top-16 -right-16 w-72 h-72 bg-primary-fixed-dim rounded-full mix-blend-screen opacity-20 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
