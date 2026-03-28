/**
 * UX-S01 — Section Bento Features « Conçu pour la Performance »
 * 3 cartes : Cartographie rendements (large), Optimisation fiscale (dark), Projections (sage).
 * Référence : landing_page_accueil_premium/code.html — Features Section
 */

export function BentoFeatures() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="mb-14">
          <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-4 tracking-tight">
            Conçu pour la Performance
          </h2>
          <p className="text-on-surface-variant max-w-xl text-lg font-body">
            Chaque calcul est optimisé pour l'investisseur immobilier exigeant.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:h-[580px]">
          {/* Grande carte — Cartographie des rendements */}
          <div className="md:col-span-7 bg-surface-container-lowest p-8 md:p-10 rounded-[2rem] flex flex-col justify-between shadow-sm border border-outline-variant/10 hover:shadow-md transition-all duration-300">
            <div>
              <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center mb-8">
                <span
                  className="material-symbols-outlined text-primary text-3xl"
                  aria-hidden="true"
                >
                  query_stats
                </span>
              </div>
              <h3 className="font-headline text-2xl md:text-3xl font-bold mb-4 text-on-surface">
                Cartographie des rendements en temps réel
              </h3>
              <p className="text-on-surface-variant text-base md:text-lg leading-relaxed max-w-md font-body">
                Visualisez instantanément l'impact des taux, des charges et du taux de vacance
                sur votre rentabilité nette. Précision à la milliseconde.
              </p>
            </div>

            {/* Mini dashboard décoratif */}
            <div className="mt-10 bg-surface p-5 rounded-2xl border border-outline-variant/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-headline font-bold uppercase tracking-widest text-on-surface/40">
                  Rendement net
                </span>
                <span className="text-sm font-headline font-extrabold text-primary">+8,42 %</span>
              </div>
              <div className="flex items-end gap-2 h-24" aria-hidden="true">
                {[35, 50, 42, 65, 58, 78, 85, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/20 transition-all hover:bg-primary/40"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-headline font-bold text-on-surface/30 uppercase tracking-widest">
                <span>An 1</span>
                <span>An 20</span>
              </div>
            </div>
          </div>

          {/* Colonne droite — 2 petites cartes */}
          <div className="md:col-span-5 flex flex-col gap-6">
            {/* Carte sombre — Optimisation fiscale */}
            <div className="flex-1 bg-primary text-on-primary p-8 md:p-10 rounded-[2rem] relative overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative z-10">
                <span
                  className="material-symbols-outlined text-4xl mb-5 block text-primary-fixed"
                  aria-hidden="true"
                >
                  receipt_long
                </span>
                <h3 className="font-headline text-xl md:text-2xl font-bold mb-3">
                  Optimisation fiscale
                </h3>
                <p className="text-primary-fixed/70 leading-relaxed font-body text-sm md:text-base">
                  Simulez LMNP, Micro-Foncier, Foncier Réel et SCI IS. 6 régimes fiscaux complets
                  avec amortissements par composants.
                </p>
              </div>
              {/* Décoration */}
              <div
                className="absolute top-0 right-0 w-28 h-28 bg-primary-container/30 rounded-bl-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-300"
                aria-hidden="true"
              />
            </div>

            {/* Carte sage — Projections patrimoniales */}
            <div className="flex-1 bg-secondary-fixed p-8 md:p-10 rounded-[2rem] border border-outline-variant/20 hover:shadow-md transition-all duration-300">
              <span
                className="material-symbols-outlined text-4xl mb-5 block text-primary"
                aria-hidden="true"
              >
                analytics
              </span>
              <h3 className="font-headline text-xl md:text-2xl font-bold mb-3 text-primary">
                Projections patrimoniales
              </h3>
              <p className="text-on-secondary-container leading-relaxed font-body text-sm md:text-base">
                Projection sur 20 ans : TRI, plus-value, effort d'épargne et scoring profil
                Rentier / Patrimonial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
