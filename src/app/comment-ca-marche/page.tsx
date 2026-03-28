import type { Metadata } from 'next';
import Link from 'next/link';
import {
  TrendingUp,
  Landmark,
  ShieldCheck,
  BarChart3,
  ShieldCheck as ValidationIcon,
  Scale,
  PieChart,
  ChevronRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Comment ça marche | Petra Nova — Simulateur immobilier',
  description:
    "Découvrez les formules, régimes fiscaux et méthodes de calcul utilisés par notre moteur d'analyse immobilière. Valeurs 2026 à jour.",
};

const PIPELINE_STEPS = [
  { icon: ValidationIcon, label: 'Validation', sub: 'Normalisation des entrées' },
  { icon: TrendingUp, label: 'Rentabilité', sub: 'Crédit, charges, rendements' },
  { icon: Scale, label: 'Fiscalité', sub: '6 régimes comparés' },
  { icon: ShieldCheck, label: 'HCSF', sub: 'Endettement, reste à vivre' },
  { icon: PieChart, label: 'Synthèse', sub: 'Score 0-100, alertes' },
  { icon: Scale, label: 'Profils', sub: 'Rentier vs Patrimonial' },
  { icon: BarChart3, label: 'Projections', sub: '20 ans, TRI, plus-value' },
];

const SUB_PAGES = [
  {
    href: '/comment-ca-marche/scoring-rendement',
    icon: TrendingUp,
    label: 'Scoring & Rendement',
    description:
      "Rentabilité brute, nette et nette-nette. Système de scoring 0–100 avec les 6 critères d'ajustement. Profils Rentier et Patrimonial.",
    topics: ['Rentabilité brute/nette/nette-nette', 'Score 0–100', 'Profils investisseur'],
    accent: 'bg-primary text-on-primary',
    colSpan: 'md:col-span-7',
  },
  {
    href: '/comment-ca-marche/financement-levier',
    icon: Landmark,
    label: 'Financement & Levier',
    description:
      "Formule PMT d'annuité constante. Assurance capital initial vs CRD. Cash-flow brut, net et net-net. Effort d'épargne.",
    topics: ['Formule PMT', 'Assurance CRD', 'Cash-flow 3 niveaux'],
    accent: 'bg-secondary-fixed text-primary',
    colSpan: 'md:col-span-5',
  },
  {
    href: '/comment-ca-marche/fiscalite-normes',
    icon: ShieldCheck,
    label: 'Fiscalité & Normes',
    description:
      '6 régimes fiscaux comparés (LMNP, Foncier, SCI IS). Déficit foncier, amortissement par composants. Normes HCSF 2026.',
    topics: ['6 régimes fiscaux', 'Déficit foncier', 'HCSF 2026'],
    accent: 'bg-surface-container-high text-primary',
    colSpan: 'md:col-span-5',
  },
  {
    href: '/comment-ca-marche/projections-dpe',
    icon: BarChart3,
    label: 'Projections & DPE',
    description:
      'Plus-value en nom propre, LMNP et SCI IS. Projections patrimoniales sur 20 ans. TRI, patrimoine net, impact DPE.',
    topics: ['Plus-value & abattements', 'TRI & patrimoine net', 'Calendrier DPE'],
    accent: 'bg-primary-fixed text-primary',
    colSpan: 'md:col-span-7',
  },
];

export default function CommentCaMarchePage() {
  return (
    <main className="animate-in fade-in duration-500">
      {/* ── Hero editorial ── */}
      <section className="px-8 pt-6 pb-16 max-w-5xl mx-auto">
        <span className="inline-block px-4 py-1.5 bg-secondary-container text-on-secondary-container rounded-full text-xs font-bold tracking-widest uppercase mb-6">
          Moteur de calcul — 2026
        </span>
        <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-primary leading-[1.1] tracking-tighter max-w-3xl">
          Comment nous calculons votre investissement.
        </h1>
        <p className="text-lg text-on-surface-variant leading-relaxed max-w-2xl mt-6">
          Petra Nova applique des formules mathématiques rigoureuses et des règles fiscales à jour
          pour analyser chaque dimension de votre projet locatif. Aucune approximation.
        </p>
      </section>

      {/* ── Pipeline de calcul ── */}
      <section className="px-8 pb-16 max-w-5xl mx-auto">
        <div className="bg-white rounded-3xl p-6 border border-outline-variant/20 shadow-sm overflow-x-auto">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-5">
            Pipeline d&apos;exécution — 7 modules en séquence
          </p>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-0 min-w-max">
            {PIPELINE_STEPS.map((step, index) => (
              <div key={step.label} className="flex items-center">
                <div className="flex flex-col items-center text-center gap-1.5 px-2.5 md:px-3 py-2 rounded-2xl hover:bg-secondary-fixed/50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/8 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-on-surface">{step.label}</span>
                  <span className="text-[11px] text-on-surface-variant leading-tight max-w-[80px]">
                    {step.sub}
                  </span>
                </div>
                {index < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block h-4 w-4 text-outline shrink-0 mx-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Grid 4 sous-pages ── */}
      <section className="px-8 pb-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-headline font-bold text-primary mb-2 tracking-tight">
          Quatre dimensions, une décision
        </h2>
        <p className="text-on-surface-variant mb-10 max-w-xl">
          Chaque section couvre un pilier du calcul. Explorez ceux qui vous intéressent.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {SUB_PAGES.map((page) => (
            <Link
              key={page.href}
              href={page.href}
              className={`group relative ${page.colSpan} ${page.accent} rounded-[2rem] p-8 overflow-hidden flex flex-col justify-between min-h-[260px] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
            >
              {/* Icône décorative en fond */}
              <div className="absolute right-4 bottom-4 opacity-[0.06] group-hover:opacity-[0.1] transition-opacity duration-500">
                <page.icon className="w-36 h-36" />
              </div>

              <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <page.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-headline font-bold tracking-tight mb-2">
                    {page.label}
                  </h3>
                  <p className="text-sm opacity-80 leading-relaxed max-w-sm">{page.description}</p>
                </div>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-6">
                <div className="flex flex-wrap gap-2">
                  {page.topics.map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2.5 py-1 rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors shrink-0">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
