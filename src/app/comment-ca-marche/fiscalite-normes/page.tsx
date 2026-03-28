import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Scale, Layers, ArrowLeft } from 'lucide-react';
import { FormulaBox } from '@/components/education/FormulaBox';
import { ExpertTip } from '@/components/education/ExpertTip';
import { StatBox } from '@/components/education/StatBox';
import { SectionHeader } from '@/components/education/SectionHeader';

export const metadata: Metadata = {
  title: 'Fiscalité & Normes | Comment ça marche — Petra Nova',
  description:
    '6 régimes fiscaux comparés (LMNP, Foncier, SCI IS), déficit foncier, amortissement par composants, normes HCSF 2026.',
};

export default function FiscaliteNormesPage() {
  return (
    <main className="px-6 md:px-10 py-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <Link
        href="/comment-ca-marche"
        className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 text-sm font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Vue d&apos;ensemble
      </Link>

      <h1 className="text-4xl font-headline font-extrabold text-primary tracking-tighter mb-2">
        Fiscalité & Normes
      </h1>
      <p className="text-on-surface-variant text-lg leading-relaxed mb-12 max-w-2xl">
        Les 6 régimes fiscaux comparés, le mécanisme du déficit foncier, l&apos;amortissement
        comptable par composants et les normes HCSF 2026 qui encadrent votre financement.
      </p>

      <div className="space-y-14">
        {/* ═══════════════════════════════════════════ */}
        {/* Section Fiscalité — 6 régimes */}
        {/* ═══════════════════════════════════════════ */}
        <section id="fiscalite" className="scroll-mt-4">
          <SectionHeader icon={ShieldCheck} title="Optimisation Fiscale" />

          <div className="space-y-4 mt-6">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Le choix du régime fiscal est déterminant : il peut faire basculer un investissement
              de déficitaire à rentable. Notre simulateur compare <strong>6 régimes</strong> pour
              trouver celui qui maximise votre cash-flow net.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Micro-foncier */}
              <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-on-surface">Micro-foncier</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Location nue — Le plus simple
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Abattement" value="30%" />
                  <StatBox label="Plafond" value="15 k€" />
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Abattement forfaitaire de 30% sur les revenus fonciers. Base imposable = 70% des
                  loyers, soumise au barème IR + prélèvements sociaux (17.2%).
                </p>
                <ExpertTip variant="warning">
                  <strong>Pour qui ?</strong> Investisseurs avec peu de charges (&lt;30% des loyers)
                  et revenus fonciers &lt;15 000€/an.
                </ExpertTip>
              </div>

              {/* Foncier Réel */}
              <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-on-surface">Foncier Réel</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Location nue — Le plus puissant
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Déduction" value="100%" />
                  <StatBox label="Déficit max" value="10.7 k€" sub="Sur revenu global" />
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Déduction de toutes les charges réelles. Permet de créer un{' '}
                  <strong>déficit foncier</strong> — idéal en cas de gros travaux.
                </p>
              </div>

              {/* LMNP Micro-BIC */}
              <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-on-surface">LMNP Micro-BIC</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Meublé — Le compromis</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <StatBox label="Longue durée" value="50%" sub="Plafond 77 700€" />
                  <StatBox label="Tourisme classé" value="71%" sub="Plafond 188 700€" />
                  <StatBox label="Tourisme non classé" value="30%" sub="Plafond 15 000€" />
                </div>
                <ExpertTip variant="warning">
                  <strong>LF 2025 :</strong> Les meublés de tourisme non classés passent à 30%
                  (plafond 15 000€). Les classés conservent 71% (plafond 188 700€).
                </ExpertTip>
                <ExpertTip variant="info">
                  <strong>PS 18,6% (LFSS 2026) :</strong> Les revenus BIC sont soumis aux
                  prélèvements sociaux à <strong>18,6%</strong>, contre 17,2% pour les revenus
                  fonciers (location nue).
                </ExpertTip>
              </div>

              {/* LMNP Réel */}
              <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-on-surface">LMNP Réel</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Meublé — Le roi de la défiscalisation
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <StatBox label="Amortissement" value="Oui" sub="Bâti + mobilier" />
                  <StatBox label="Impôt" value="~0€*" sub="Pendant 8-15 ans" />
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  L&apos;amortissement comptable du bâti, du mobilier et des travaux permet souvent
                  de ramener l&apos;impôt à zéro. L&apos;amortissement ne peut pas créer de déficit
                  BIC — l&apos;excédent est reporté indéfiniment.
                </p>
                <ExpertTip variant="warning">
                  <strong>PS 18,6% sur revenus BIC (LFSS 2026) :</strong> Même avec un résultat
                  fiscal nul, si un bénéfice BIC subsiste, il est soumis à 18,6% (vs 17,2% pour la
                  location nue).
                </ExpertTip>
              </div>

              {/* SCI IS — pleine largeur */}
              <div className="md:col-span-2 bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-on-surface">SCI à l&apos;IS</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    La structure de capitalisation et de transmission par excellence.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      IS Taux Réduit
                    </p>
                    <p className="text-2xl font-black text-on-surface">
                      15%{' '}
                      <span className="text-xs font-normal text-on-surface-variant">
                        (jusqu&apos;à 42 500€)
                      </span>
                    </p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      IS Taux Normal
                    </p>
                    <p className="text-2xl font-black text-on-surface">
                      25%{' '}
                      <span className="text-xs font-normal text-on-surface-variant">(au-delà)</span>
                    </p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                      Flat Tax (distribution)
                    </p>
                    <p className="text-2xl font-black text-on-surface">
                      30%{' '}
                      <span className="text-xs font-normal text-on-surface-variant">
                        (sur dividendes)
                      </span>
                    </p>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Imposition au niveau de la société avec amortissement comptable. Deux modes :{' '}
                  <strong>capitalisation</strong> (bénéfices dans la SCI) ou{' '}
                  <strong>distribution</strong> (dividendes soumis à la flat tax de 30%).
                </p>
                <ExpertTip variant="warning">
                  <strong>Attention à la revente :</strong> En SCI IS, la plus-value est calculée
                  sur la valeur nette comptable (après amortissements). L&apos;impôt est donc
                  beaucoup plus élevé qu&apos;en nom propre. Voir la section{' '}
                  <Link
                    href="/comment-ca-marche/projections-dpe#plus-value"
                    className="underline font-bold"
                  >
                    Plus-value
                  </Link>
                  .
                </ExpertTip>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section Déficit Foncier */}
        {/* ═══════════════════════════════════════════ */}
        <section id="deficit-foncier" className="scroll-mt-4">
          <SectionHeader icon={Scale} title="Déficit Foncier" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                Mécanisme du déficit foncier
              </h3>
              <p className="text-sm text-on-surface-variant">
                Un levier fiscal puissant en location nue avec travaux.
              </p>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Quand vos charges déductibles (travaux, intérêts, assurance...) dépassent vos revenus
              fonciers, vous êtes en <strong>déficit foncier</strong>. Ce déficit se décompose en
              deux parties :
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                <h4 className="text-sm font-bold text-on-surface mb-2">
                  Déficit hors intérêts d&apos;emprunt
                </h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Imputable sur votre <strong>revenu global</strong> (salaires, etc.) dans la limite
                  de <strong className="text-primary">10 700€/an</strong>.
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-2">
                  C&apos;est la partie la plus intéressante : elle réduit directement votre impôt
                  sur le revenu.
                </p>
              </div>
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20">
                <h4 className="text-sm font-bold text-on-surface mb-2">Déficit lié aux intérêts</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Reportable uniquement sur les <strong>revenus fonciers</strong> des{' '}
                  <strong className="text-primary">10 années suivantes</strong>.
                </p>
                <p className="text-sm text-on-surface-variant leading-relaxed mt-2">
                  Il ne peut pas venir réduire vos autres revenus (salaires, etc.).
                </p>
              </div>
            </div>

            <FormulaBox>
              Économie d&apos;impôt = min(Déficit hors intérêts, 10 700€) × TMI
            </FormulaBox>

            <ExpertTip variant="success">
              <strong>Travaux de rénovation énergétique (LF 2023) :</strong> Pour les dépenses
              réalisées entre 2023 et 2025, le plafond est majoré à{' '}
              <strong className="text-primary">21 400€/an</strong> pour les travaux permettant de
              sortir le bien des classes <strong>E, F ou G</strong>.
            </ExpertTip>

            <ExpertTip variant="info">
              <strong>Exemple concret :</strong> Revenus fonciers 10 800€, charges (travaux) 18
              000€, intérêts 5 000€. Déficit total = 12 200€. Dont 7 200€ hors intérêts imputables
              sur revenu global. À TMI 30%, l&apos;économie d&apos;impôt est de{' '}
              <strong>2 160€</strong>.
            </ExpertTip>

            <ExpertTip variant="warning">
              <strong>Condition :</strong> En contrepartie, vous devez conserver le bien en location
              pendant <strong>3 ans minimum</strong> après l&apos;imputation.
            </ExpertTip>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section Amortissement */}
        {/* ═══════════════════════════════════════════ */}
        <section id="amortissement" className="scroll-mt-4">
          <SectionHeader icon={Layers} title="Amortissement Comptable" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                Amortissement simplifié vs par composants
              </h3>
              <p className="text-sm text-on-surface-variant">
                Deux méthodes pour LMNP réel et SCI IS.
              </p>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              L&apos;amortissement permet de déduire chaque année une fraction de la valeur du bien.
              Seule la partie <strong>bâti</strong> est amortissable — le terrain ne l&apos;est pas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20">
                <h4 className="text-sm font-bold text-on-surface mb-3">Mode simplifié</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                  Amortissement linéaire sur <strong>33 ans</strong> (~3%/an) pour l&apos;ensemble
                  du bâti. Simple mais sous-estime l&apos;amortissement réel.
                </p>
                <div className="bg-white p-3 rounded-xl text-center border border-outline-variant/20">
                  <p className="text-xs text-on-surface-variant">Bien 200k€ (terrain 15%)</p>
                  <p className="text-lg font-black text-on-surface">5 151€/an</p>
                </div>
              </div>

              <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10">
                <h4 className="text-sm font-bold text-on-surface mb-3">Mode par composants</h4>
                <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                  Décomposition du bâti en composants avec des durées différentes. Plus précis et
                  plus avantageux les premières années.
                </p>
                <div className="bg-white/70 p-3 rounded-xl text-center">
                  <p className="text-xs text-on-surface-variant">Bien 200k€ (terrain 15%)</p>
                  <p className="text-lg font-black text-primary">8 387€/an</p>
                  <p className="text-[10px] text-primary font-bold">+63% vs simplifié</p>
                </div>
              </div>
            </div>

            {/* Tableau composants */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-3">
                Ventilation par composants
              </p>
              <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
                <table className="w-full text-sm">
                  <thead className="bg-surface-container-low">
                    <tr>
                      <th className="text-left py-3 px-4 text-on-surface-variant font-bold text-xs uppercase">
                        Composant
                      </th>
                      <th className="text-center py-3 px-4 text-on-surface-variant font-bold text-xs uppercase">
                        Part
                      </th>
                      <th className="text-center py-3 px-4 text-on-surface-variant font-bold text-xs uppercase">
                        Durée
                      </th>
                      <th className="text-right py-3 px-4 text-on-surface-variant font-bold text-xs uppercase">
                        Amort./an*
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-on-surface divide-y divide-outline-variant/10 bg-white">
                    {[
                      { name: 'Gros oeuvre', part: '40%', duree: '50 ans', amort: '1 360€' },
                      { name: 'Façade & toiture', part: '20%', duree: '25 ans', amort: '1 360€' },
                      {
                        name: 'Installations techniques',
                        part: '20%',
                        duree: '15 ans',
                        amort: '2 267€',
                      },
                      {
                        name: 'Agencements intérieurs',
                        part: '20%',
                        duree: '10 ans',
                        amort: '3 400€',
                      },
                    ].map((row) => (
                      <tr key={row.name}>
                        <td className="py-3 px-4 font-medium">{row.name}</td>
                        <td className="py-3 px-4 text-center">{row.part}</td>
                        <td className="py-3 px-4 text-center">{row.duree}</td>
                        <td className="py-3 px-4 text-right font-bold">{row.amort}</td>
                      </tr>
                    ))}
                    <tr className="bg-primary/5 font-black">
                      <td className="py-3 px-4 text-primary" colSpan={3}>
                        Total
                      </td>
                      <td className="py-3 px-4 text-right text-primary">8 387€</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[10px] text-on-surface-variant px-4 py-2 bg-surface-container-low">
                  *Exemple : bien 200 000€, terrain 15%, valeur amortissable 170 000€
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Mobilier
                </p>
                <p className="text-sm text-on-surface">
                  Amorti sur <strong>10 ans</strong> (10%/an)
                </p>
              </div>
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  Travaux
                </p>
                <p className="text-sm text-on-surface">
                  Amortis sur <strong>15 ans</strong> (~6.7%/an)
                </p>
              </div>
            </div>

            <ExpertTip variant="info">
              <strong>Arrêt progressif :</strong> Les agencements s&apos;arrêtent après{' '}
              <strong>10 ans</strong>, les installations après <strong>15 ans</strong>, la façade
              après <strong>25 ans</strong>. Seul le gros oeuvre continue jusqu&apos;à{' '}
              <strong>50 ans</strong>.
            </ExpertTip>

            <ExpertTip variant="warning">
              <strong>Règle fondamentale :</strong> L&apos;amortissement ne peut pas créer de{' '}
              <strong>déficit BIC</strong>. L&apos;excédent est reporté sans limite de durée — il
              n&apos;est jamais perdu.
            </ExpertTip>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section HCSF */}
        {/* ═══════════════════════════════════════════ */}
        <section id="hcsf" className="scroll-mt-4">
          <SectionHeader icon={ShieldCheck} title="Normes HCSF 2026" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6 mt-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Endettement Max
                </p>
                <p className="text-4xl font-black text-error tracking-tighter">35%</p>
                <p className="text-xs text-on-surface-variant">Assurance comprise</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Durée Crédit Max
                </p>
                <p className="text-4xl font-black text-on-surface tracking-tighter">25 ans</p>
                <p className="text-xs text-on-surface-variant">27 ans pour les achats en VEFA</p>
              </div>
              <div className="text-center space-y-2">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Pondération Loyers
                </p>
                <p className="text-4xl font-black text-primary tracking-tighter">70%</p>
                <p className="text-xs text-on-surface-variant">Des revenus locatifs bruts</p>
              </div>
            </div>

            <div className="border-t border-outline-variant/20 pt-6 space-y-4">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3">
                Le calcul bancaire
              </p>
              <FormulaBox>
                Taux endettement = Total charges mensuelles / Total revenus mensuels
              </FormulaBox>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <p className="font-bold text-on-surface mb-2">Revenus pris en compte</p>
                  <ul className="text-on-surface-variant space-y-1 list-disc list-inside">
                    <li>Salaires et revenus professionnels</li>
                    <li>Revenus locatifs existants × 70%</li>
                    <li>Nouveaux loyers prévisionnels × 70%</li>
                  </ul>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <p className="font-bold text-on-surface mb-2">Charges prises en compte</p>
                  <ul className="text-on-surface-variant space-y-1 list-disc list-inside">
                    <li>Crédits existants (mensualités)</li>
                    <li>Nouveau crédit (mensualité + assurance)</li>
                    <li>Charges fixes récurrentes</li>
                  </ul>
                </div>
              </div>

              <ExpertTip variant="info">
                <strong>Marge de flexibilité :</strong> Les banques disposent d&apos;une dérogation
                de <strong>20%</strong> sur leurs dossiers. Cette marge est souvent réservée aux
                profils à haut reste à vivre (&gt;1 500€/mois) ou aux primo-accédants. Les
                investisseurs locatifs y ont rarement accès.
              </ExpertTip>
            </div>

            {/* Reste à vivre */}
            <div className="border-t border-outline-variant/20 pt-6 space-y-4">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3">
                Reste à vivre
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Le reste à vivre est le montant mensuel après paiement de toutes les charges. Les
                banques l&apos;utilisent <strong>en complément du taux d&apos;endettement</strong>{' '}
                pour évaluer la faisabilité d&apos;un prêt.
              </p>
              <FormulaBox>
                Reste à vivre = Revenus totaux mensuels - Charges totales mensuelles
              </FormulaBox>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-error-container/40 p-4 rounded-2xl border border-error/20 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Insuffisant
                  </p>
                  <p className="text-2xl font-black text-error">&lt; 800€</p>
                  <p className="text-xs text-on-surface-variant mt-1">Refus de prêt probable</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Correct
                  </p>
                  <p className="text-2xl font-black text-on-surface">800 – 1 500€</p>
                  <p className="text-xs text-on-surface-variant mt-1">Acceptable, marge limitée</p>
                </div>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Confortable
                  </p>
                  <p className="text-2xl font-black text-primary">&gt; 1 500€</p>
                  <p className="text-xs text-on-surface-variant mt-1">Profil premium bancaire</p>
                </div>
              </div>

              <ExpertTip variant="success">
                <strong>Scoring :</strong> Le reste à vivre impacte directement votre score :{' '}
                <strong>+5 points</strong> au-dessus de 1 500€, <strong>0 point</strong> entre 800
                et 1 500€, et <strong>-10 points</strong> en dessous de 800€.
              </ExpertTip>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
