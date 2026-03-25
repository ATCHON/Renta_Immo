/**
 * UX-S01 — Hero Section « Petra Nova »
 * Layout split grid 12 colonnes — slogan gauche, visuel KPI droite.
 * Référence : landing_page_accueil_premium/code.html
 */

import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-background">
      {/* Décoration fond subtile */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 2px 2px, var(--color-primary) 1px, transparent 0)',
          backgroundSize: '48px 48px',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Colonne gauche — Texte */}
        <div className="lg:col-span-6">
          {/* Badge introducing */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary-container/50 text-on-secondary-container rounded-full text-xs font-headline font-bold tracking-wider mb-6">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden="true"
            >
              architecture
            </span>
            PETRA NOVA — SIMULATEUR IMMOBILIER
          </div>

          <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-on-surface leading-[1.05] tracking-tighter mb-6">
            La puissance d&apos;Excel, <br />
            <span className="text-primary">la simplicité</span> du web.
          </h1>

          <p className="text-on-surface-variant text-lg md:text-xl max-w-lg mb-10 leading-relaxed font-body">
            Transformez vos projets immobiliers en analyses de précision. Rentabilité, fiscalité,
            cashflow et scoring — en quelques secondes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/calculateur?reset=true"
              className="btn-verdant text-base px-8 py-4 rounded-xl flex items-center justify-center gap-3 group shadow-[0_20px_40px_rgba(1,45,29,0.18)]"
            >
              Lancer la simulation
              <ArrowRight
                className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                strokeWidth={2}
              />
            </Link>
            <Link
              href="/en-savoir-plus"
              className="flex items-center justify-center px-8 py-4 rounded-xl border-2 border-outline-variant/40 text-on-surface font-headline font-bold text-base hover:bg-surface-container-high transition-all"
            >
              Voir un exemple
            </Link>
          </div>

          {/* Indicateurs de confiance */}
          <div className="mt-14 pt-8 border-t border-outline-variant/15 flex items-center gap-8 opacity-50">
            <span className="font-headline font-extrabold text-lg tracking-tighter">530+</span>
            <span className="font-body text-sm text-on-surface-variant">Tests unitaires</span>
            <span className="font-headline font-extrabold text-lg tracking-tighter">6</span>
            <span className="font-body text-sm text-on-surface-variant">Régimes fiscaux</span>
            <span className="font-headline font-extrabold text-lg tracking-tighter">HCSF</span>
            <span className="font-body text-sm text-on-surface-variant">Conformité bancaire</span>
          </div>
        </div>

        {/* Colonne droite — Visuel immobilier + overlay KPI */}
        <div className="lg:col-span-6 relative">
          {/* Carte visuelle principale */}
          <div className="relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(1,45,29,0.12)] bg-gradient-to-br from-primary-container via-primary to-on-primary-fixed">
            {/* Overlay architectural */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />

            {/* Grille architecturale décorative */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'linear-gradient(var(--color-primary-fixed) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-fixed) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
              aria-hidden="true"
            />

            {/* Silhouette immeuble CSS */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-3 pb-8 opacity-30">
              <div className="w-12 h-32 bg-primary-fixed rounded-t-lg" />
              <div className="w-16 h-48 bg-primary-fixed-dim rounded-t-lg" />
              <div className="w-20 h-40 bg-primary-fixed rounded-t-lg" />
              <div className="w-14 h-56 bg-primary-fixed-dim rounded-t-lg" />
              <div className="w-12 h-36 bg-primary-fixed rounded-t-lg" />
            </div>
          </div>

          {/* Overlay KPI — Rendement */}
          <div className="absolute top-8 left-8 glass-card p-5 shadow-lg border border-white/30">
            <div className="text-xs font-headline font-bold text-primary/60 mb-1 uppercase tracking-wider">
              Rendement brut
            </div>
            <div className="text-3xl font-headline font-extrabold text-primary">8,42 %</div>
            <div className="mt-2 flex items-center gap-1 text-emerald-600 font-bold text-xs font-headline">
              <TrendingUp className="h-3 w-3" strokeWidth={2} aria-hidden="true" />
              +1,2 % vs. marché
            </div>
          </div>

          {/* Overlay KPI — Cashflow */}
          <div className="absolute bottom-8 right-8 glass-card p-4 shadow-lg border border-white/30">
            <div className="text-xs font-headline font-bold text-primary/60 mb-1 uppercase tracking-wider">
              Cash-flow mensuel
            </div>
            <div className="text-2xl font-headline font-extrabold text-primary">+245 €</div>
          </div>

          {/* Décoration derrière la carte */}
          <div
            className="absolute -bottom-4 -right-4 w-48 h-48 bg-secondary-fixed rounded-3xl -z-10"
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
