/**
 * UX-S01 — Section témoignages (données fictives)
 * Référence : landing_page_accueil_premium/code.html — Social Proof Section
 */

import Image from 'next/image';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  image: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      '« Petra Nova a complètement remplacé nos tableurs Excel. La vitesse de calcul et la rigueur fiscale sont incomparables sur le marché. »',
    author: 'Alexandre Thorneau',
    role: 'Investisseur, 12 biens en portefeuille',
    image: '/images/testimonial-at.png',
  },
  {
    quote:
      "« Le scoring dual Rentier / Patrimonial m'a permis de choisir la bonne stratégie fiscale. L'interface est d'une clarté remarquable. »",
    author: 'Éléna Rousseau',
    role: 'Conseillère en gestion de patrimoine',
    image: '/images/testimonial-er.png',
  },
];

function StarRating({ count = 5, max = 5 }: { count?: number; max?: number }) {
  return (
    <div className="flex gap-1" aria-label={`${count} étoiles sur ${max}`}>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="material-symbols-outlined text-primary-container text-xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
          aria-hidden="true"
        >
          star
        </span>
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-12 lg:gap-16">
          {/* Gauche — accroche */}
          <div className="lg:w-1/3">
            <h2 className="font-headline text-3xl font-extrabold mb-5 tracking-tight text-on-surface">
              L&apos;outil choisi par les investisseurs sérieux
            </h2>
            <StarRating />
            <p className="text-on-surface-variant leading-relaxed mt-4 font-body">
              Rejoignez les investisseurs qui valident leurs opportunités avec une rigueur de niveau
              professionnel.
            </p>
          </div>

          {/* Droite — 2 cartes témoignage */}
          <div className="lg:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.author}
                className="bg-surface p-7 rounded-3xl border border-outline-variant/10 hover:shadow-md transition-all duration-300"
              >
                <p className="text-base italic text-on-surface mb-6 font-body leading-relaxed">
                  {t.quote}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 relative rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-secondary-container">
                    <Image src={t.image} alt={t.author} fill className="object-cover" />
                  </div>
                  <div>
                    <div className="font-headline font-bold text-sm text-on-surface">
                      {t.author}
                    </div>
                    <div className="text-xs text-on-surface-variant font-body">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
