import type { Metadata } from 'next';
import Link from 'next/link';
import { TrendingUp, PieChart, Scale, Landmark, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormulaBox } from '@/components/education/FormulaBox';
import { ExpertTip } from '@/components/education/ExpertTip';
import { SectionHeader } from '@/components/education/SectionHeader';

export const metadata: Metadata = {
  title: 'Scoring & Rendement | Comment ça marche — Petra Nova',
  description:
    'Rentabilité brute, nette et nette-nette. Système de scoring 0–100 avec 6 critères. Profils investisseur Rentier et Patrimonial.',
};

const SCORING_CRITERIA = [
  {
    title: 'Cash-flow net mensuel',
    range: '-20 à +20 pts',
    details: [
      { cond: '≥ +200€/mois', pts: '+20', color: 'text-primary' },
      { cond: '0 à +200€', pts: 'Interpolation 0 → +20', color: 'text-on-surface' },
      { cond: '-200€ à 0', pts: 'Interpolation -20 → 0', color: 'text-on-surface' },
      { cond: '≤ -200€/mois', pts: '-20', color: 'text-error' },
    ],
  },
  {
    title: 'Rentabilité nette-nette',
    range: '-15 à +20 pts',
    details: [
      { cond: '≥ 7%', pts: '+20', color: 'text-primary' },
      { cond: '3% à 7%', pts: 'Interpolation 0 → +20', color: 'text-on-surface' },
      { cond: '0% à 3%', pts: 'Interpolation -15 → 0', color: 'text-on-surface' },
      { cond: '≤ 0%', pts: '-15', color: 'text-error' },
    ],
  },
  {
    title: "Taux d'endettement (HCSF)",
    range: '-25 à +20 pts',
    details: [
      { cond: '≤ 25%', pts: '+20', color: 'text-primary' },
      { cond: '25% à 35%', pts: 'Interpolation +20 → 0', color: 'text-on-surface' },
      { cond: '35% à 50%', pts: 'Interpolation 0 → -15', color: 'text-on-surface' },
      { cond: '> 50% ou non conforme', pts: '-25', color: 'text-error' },
    ],
  },
  {
    title: 'DPE (Performance énergétique)',
    range: '-10 à +5 pts',
    details: [
      { cond: 'DPE A ou B', pts: '+5', color: 'text-primary' },
      { cond: 'DPE C ou D', pts: '0', color: 'text-on-surface' },
      { cond: 'DPE E', pts: '-3', color: 'text-amber-600' },
      { cond: 'DPE F ou G (passoire)', pts: '-10', color: 'text-error' },
    ],
  },
  {
    title: 'Ratio prix/loyer annuel',
    range: '-5 à +10 pts',
    details: [
      { cond: '≤ 15 (excellent)', pts: '+10', color: 'text-primary' },
      { cond: '15 à 20', pts: 'Interpolation +10 → 0', color: 'text-on-surface' },
      { cond: '20 à 25', pts: 'Interpolation 0 → -5', color: 'text-on-surface' },
      { cond: '> 25 (cher)', pts: '-5', color: 'text-error' },
    ],
  },
  {
    title: 'Reste à vivre mensuel',
    range: '-10 à +5 pts',
    details: [
      { cond: '≥ 1 500€', pts: '+5', color: 'text-primary' },
      { cond: '800€ à 1 500€', pts: '0', color: 'text-on-surface' },
      { cond: '< 800€', pts: '-10', color: 'text-error' },
    ],
  },
];

const SCORE_LEVELS = [
  { range: '80 – 100', label: 'Excellent', sub: 'Opportunité rare, foncez', color: 'bg-primary' },
  { range: '60 – 79', label: 'Bon', sub: 'Dossier solide à optimiser', color: 'bg-secondary' },
  { range: '40 – 59', label: 'Moyen', sub: 'Points bloquants à résoudre', color: 'bg-amber-500' },
  { range: '0 – 39', label: 'Faible', sub: 'Risque élevé, revoir le projet', color: 'bg-error' },
];

const RENTIER_MULTIPLIERS = [
  { label: 'Cash-flow net', mult: '×1.5', note: 'déterminant', color: 'text-primary' },
  { label: 'Rentabilité nette', mult: '×1.2', note: 'renforcé', color: 'text-primary' },
  { label: 'HCSF endettement', mult: '×1.0', note: 'standard', color: 'text-on-surface' },
  { label: 'DPE', mult: '×0.8', note: 'atténué', color: 'text-amber-600' },
  { label: 'Ratio prix/loyer', mult: '×0.5', note: 'atténué', color: 'text-amber-600' },
  { label: 'Reste à vivre', mult: '×0.5', note: 'atténué', color: 'text-amber-600' },
];

const PATRIMONIAL_MULTIPLIERS = [
  { label: 'Cash-flow net', mult: '×0.5', note: 'atténué', color: 'text-amber-600' },
  { label: 'Rentabilité nette', mult: '×1.0', note: 'standard', color: 'text-on-surface' },
  { label: 'HCSF endettement', mult: '×1.2', note: 'renforcé', color: 'text-primary' },
  { label: 'DPE', mult: '×1.5', note: 'renforcé', color: 'text-primary' },
  { label: 'Ratio prix/loyer', mult: '×1.0', note: 'standard', color: 'text-on-surface' },
  { label: 'Reste à vivre', mult: '×1.2', note: 'renforcé', color: 'text-primary' },
];

export default function ScoringRendementPage() {
  return (
    <main className="px-6 md:px-10 py-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Retour + header */}
      <Link
        href="/comment-ca-marche"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Vue d&apos;ensemble
      </Link>

      <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tighter mb-2">
        Scoring & Rendement
      </h1>
      <p className="text-on-surface-variant text-lg leading-relaxed mb-12 max-w-2xl">
        Les indicateurs de performance, le système de scoring 0–100 et les deux profils investisseur
        qui orientent votre lecture du projet.
      </p>

      <div className="space-y-14">
        {/* ═══════════════════════════════════════════ */}
        {/* Section Rentabilité */}
        {/* ═══════════════════════════════════════════ */}
        <section id="rentabilite" className="scroll-mt-4">
          <SectionHeader icon={TrendingUp} title="Indicateurs de Performance" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Brute */}
            <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  Rentabilité Brute
                </h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Le ratio fondamental pour une première sélection rapide.
                </p>
              </div>
              <FormulaBox>(Loyer annuel / Coût total acquisition) × 100</FormulaBox>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Ne prend pas en compte les charges ni les impôts. Un investissement à 6% brut génère
                6€ de loyer par an pour 100€ investis.
              </p>
              <ExpertTip variant="info">
                <strong>Repère :</strong> En province, visez 8–10%. En grande métropole, 5–7% est
                déjà correct. En dessous de 4%, l&apos;investissement repose essentiellement sur la
                plus-value.
              </ExpertTip>
            </div>

            {/* Nette */}
            <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  Rentabilité Nette
                </h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  La réalité opérationnelle de votre projet.
                </p>
              </div>
              <FormulaBox>(Loyer annuel - Charges) / Coût total × 100</FormulaBox>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Prend en compte toutes les charges : taxe foncière, copropriété, assurance PNO,
                frais de gestion, provision travaux et vacance locative.
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                En moyenne, les charges représentent 25 à 35% du loyer brut. La rentabilité nette
                est donc généralement 2 à 3 points inférieure à la brute.
              </p>
            </div>

            {/* Nette-nette */}
            <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4 md:col-span-2">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  Rentabilité Nette-Nette (Après Impôts)
                </h3>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  Votre performance réelle nette de toute fiscalité — l&apos;indicateur ultime.
                </p>
              </div>
              <FormulaBox highlight>
                <span className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <span>(Loyer - Charges - Impôts) / Coût total × 100</span>
                  <span className="text-xs bg-primary text-on-primary px-3 py-1 rounded-full not-italic font-bold">
                    Le plus précis
                  </span>
                </span>
              </FormulaBox>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                La rentabilité réelle après paiement de tous les impôts et prélèvements sociaux.
                Elle varie considérablement selon votre régime fiscal et votre TMI.
              </p>
              <ExpertTip variant="success">
                <strong>
                  Notre simulateur calcule cette rentabilité pour les 6 régimes fiscaux
                </strong>{' '}
                et vous recommande le plus avantageux. Un même bien peut passer de -2% nette-nette
                en micro-foncier à +3% en LMNP réel.
              </ExpertTip>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section Scoring */}
        {/* ═══════════════════════════════════════════ */}
        <section id="scoring" className="scroll-mt-4">
          <SectionHeader icon={PieChart} title="Système de Scoring" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-8 mt-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-2">
                Score d&apos;investissement (0–100)
              </h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Le score part d&apos;une <strong>base de 40 points</strong> (investissement neutre),
                puis chaque critère apporte un <strong>bonus ou malus</strong> selon la qualité du
                projet. Le résultat est borné entre 0 et 100.
              </p>
            </div>

            <FormulaBox highlight>
              Score = 40 (base) + Cashflow + Rentabilité + HCSF + DPE + Ratio prix/loyer + Reste à
              vivre
            </FormulaBox>

            {/* 6 critères */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3">
                Les 6 critères d&apos;ajustement
              </p>
              {SCORING_CRITERIA.map((critere) => (
                <div
                  key={critere.title}
                  className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-bold text-on-surface">{critere.title}</h5>
                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                      {critere.range}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {critere.details.map((d) => (
                      <div key={d.cond} className="text-xs">
                        <p className="text-on-surface-variant">{d.cond}</p>
                        <p className={cn('font-bold', d.color)}>{d.pts}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Interprétation */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-4">
                Interprétation du score
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {SCORE_LEVELS.map((level) => (
                  <div
                    key={level.range}
                    className="bg-surface-container-low p-4 rounded-2xl text-center border border-outline-variant/20"
                  >
                    <div
                      className={cn('w-3 h-3 rounded-full mx-auto mb-2 shadow-sm', level.color)}
                    />
                    <p className="font-black text-on-surface tabular-nums text-lg">{level.range}</p>
                    <p className="font-bold text-on-surface text-sm">{level.label}</p>
                    <p className="text-on-surface-variant text-xs leading-tight mt-1">
                      {level.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section Profils Investisseur */}
        {/* ═══════════════════════════════════════════ */}
        <section id="profils" className="scroll-mt-4">
          <SectionHeader icon={Scale} title="Profils Investisseur" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                Rentier vs Patrimonial — deux lectures du même projet
              </h3>
              <p className="text-sm text-on-surface-variant">
                Le score est calculé selon deux profils aux objectifs différents. Basculez entre les
                deux en un clic sur les résultats.
              </p>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Un même bien peut être <strong>excellent pour un rentier</strong> (cashflow positif
              immédiat) et <strong>moyen pour un patrimonial</strong> (TRI insuffisant sur 20 ans),
              ou vice-versa. Les deux scores sont calculés simultanément côté serveur.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profil Rentier */}
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4 className="text-sm font-bold text-on-surface">Profil Rentier</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Priorité au <strong>cashflow mensuel positif</strong> et à la rentabilité
                  immédiate. Idéal pour générer des revenus complémentaires rapidement.
                </p>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Multiplicateurs de score
                  </p>
                  {RENTIER_MULTIPLIERS.map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-xs">
                      <span className="text-on-surface">{r.label}</span>
                      <span className={cn('font-mono font-bold', r.color)}>{r.mult}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profil Patrimonial */}
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-primary" />
                  <h4 className="text-sm font-bold text-on-surface">Profil Patrimonial</h4>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Priorité au <strong>TRI sur 20 ans</strong> et à la valorisation du bien. Idéal
                  pour constituer un patrimoine durable.
                </p>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    Multiplicateurs de score
                  </p>
                  {PATRIMONIAL_MULTIPLIERS.map((r) => (
                    <div key={r.label} className="flex items-center justify-between text-xs">
                      <span className="text-on-surface">{r.label}</span>
                      <span className={cn('font-mono font-bold', r.color)}>{r.mult}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <FormulaBox>
              Score_profil = 40 + Σ (ajustement_critère × multiplicateur_profil)
            </FormulaBox>

            <ExpertTip variant="info">
              <strong>Exemple concret :</strong> Un bien avec un cashflow de +1€/mois et une
              rentabilité de 3,85% obtient <strong>79.3 en Rentier</strong> (cashflow déterminant)
              et <strong>85.3 en Patrimonial</strong> (rentabilité et ratio prix/loyer valorisés
              ×1.5). Même bien, lecture différente selon votre objectif.
            </ExpertTip>

            <ExpertTip variant="warning">
              <strong>Alerte LMP :</strong> En régime LMNP, si vos recettes annuelles dépassent{' '}
              <strong>20 000€</strong> (approche du seuil) ou <strong>23 000€</strong> (seuil LMP),
              un bandeau d&apos;alerte s&apos;affiche automatiquement. Au-delà de 23 000€, vous
              basculez en LMP avec des obligations sociales et fiscales spécifiques.
            </ExpertTip>
          </div>
        </section>
      </div>
    </main>
  );
}
