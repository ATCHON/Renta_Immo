import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, BarChart3, Building2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FormulaBox } from '@/components/education/FormulaBox';
import { ExpertTip } from '@/components/education/ExpertTip';
import { SectionHeader } from '@/components/education/SectionHeader';

export const metadata: Metadata = {
  title: 'Projections & DPE | Comment ça marche — Petra Nova',
  description:
    'Plus-value en nom propre, LMNP et SCI IS. Projections patrimoniales sur 20 ans, TRI, patrimoine net et impact DPE.',
};

// Couleurs officielles ADEME / étiquette DPE française
const DPE_LABELS = [
  { label: 'A', bg: '#009a44', text: 'text-white' },
  { label: 'B', bg: '#50b848', text: 'text-white' },
  { label: 'C', bg: '#c1d400', text: 'text-on-surface' },
  { label: 'D', bg: '#f0e400', text: 'text-on-surface' },
  { label: 'E', bg: '#f4a500', text: 'text-white' },
  { label: 'F', bg: '#e74b10', text: 'text-white' },
  { label: 'G', bg: '#d40000', text: 'text-white' },
];

const DPE_CALENDAR = [
  {
    date: 'Depuis 2023',
    label: 'DPE G+ (>450 kWh)',
    desc: 'Interdit à la location',
    dotBg: '#d40000',
  },
  { date: '1er janvier 2025', label: 'DPE G', desc: 'Interdit à la location', dotBg: '#d40000' },
  { date: '1er janvier 2028', label: 'DPE F', desc: 'Interdit à la location', dotBg: '#e74b10' },
  { date: '1er janvier 2034', label: 'DPE E', desc: 'Interdit à la location', dotBg: '#f4a500' },
];

const PV_ABATTEMENTS = [
  { duree: '0 à 5 ans', ir: '0%', ps: '0%' },
  { duree: '6 à 21 ans', ir: '6%/an', ps: '1.65%/an' },
  { duree: '22e année', ir: '+4% → 100%', ps: '+1.6% → 28%' },
  { duree: '23 à 30 ans', ir: 'Exonéré', ps: '9%/an' },
  { duree: 'Au-delà de 30 ans', ir: 'Exonéré', ps: 'Exonéré' },
];

const SURTAXE_PV = [
  { tranche: '50 001 – 100 000€', taux: '2%' },
  { tranche: '100 001 – 150 000€', taux: '3%' },
  { tranche: '150 001 – 200 000€', taux: '4%' },
  { tranche: '200 001 – 250 000€', taux: '5%' },
  { tranche: '> 250 000€', taux: '6%' },
];

export default function ProjectionsDpePage() {
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
        Projections & DPE
      </h1>
      <p className="text-on-surface-variant text-lg leading-relaxed mb-12 max-w-2xl">
        La plus-value à la revente selon votre structure, les projections patrimoniales sur 20 ans
        et l&apos;impact du diagnostic de performance énergétique sur votre investissement.
      </p>

      <div className="space-y-14">
        {/* ═══════════════════════════════════════════ */}
        {/* Section Plus-value */}
        {/* ═══════════════════════════════════════════ */}
        <section id="plus-value" className="scroll-mt-4">
          <SectionHeader icon={Clock} title="Plus-Value à la Revente" />

          <div className="space-y-5 mt-6">
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Lors de la revente, l&apos;impôt de plus-value peut représenter un montant
              significatif. Son calcul diffère radicalement selon votre structure de détention.
            </p>

            {/* Nom propre */}
            <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  En nom propre (IR)
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Location nue et LMNP — Abattements progressifs pour durée de détention.
                </p>
              </div>

              <FormulaBox>Plus-value brute = Prix de vente - Prix d&apos;achat</FormulaBox>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Forfait frais d&apos;acquisition (BOFiP)
                  </p>
                  <p className="text-sm text-on-surface">
                    <strong className="text-primary">7,5%</strong> du prix d&apos;achat, déductibles
                    du prix de revient (à défaut de justificatifs réels)
                  </p>
                </div>
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Forfait travaux (BOFiP)
                  </p>
                  <p className="text-sm text-on-surface">
                    <strong className="text-primary">15%</strong> du prix d&apos;achat, déductibles
                    si détention &gt; 5 ans (à défaut de justificatifs réels)
                  </p>
                </div>
              </div>

              <p className="text-sm text-on-surface-variant leading-relaxed">
                La plus-value est soumise à deux impôts distincts avec des abattements différents :{' '}
                <strong>IR (19%)</strong> et <strong>Prélèvements Sociaux (17.2%)</strong>.
              </p>

              <div>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-3">
                  Barème des abattements
                </p>
                <div className="overflow-x-auto rounded-2xl border border-outline-variant/20">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-container-low">
                      <tr>
                        <th className="text-left py-3 px-4 text-on-surface-variant font-bold text-xs uppercase">
                          Durée de détention
                        </th>
                        <th className="text-center py-3 px-4 text-on-surface-variant font-bold text-xs uppercase">
                          Abattement IR
                        </th>
                        <th className="text-center py-3 px-4 text-on-surface-variant font-bold text-xs uppercase">
                          Abattement PS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 bg-white">
                      {PV_ABATTEMENTS.map((row) => (
                        <tr key={row.duree}>
                          <td className="py-3 px-4 font-medium text-on-surface">{row.duree}</td>
                          <td className="py-3 px-4 text-center text-on-surface-variant">
                            {row.ir}
                          </td>
                          <td className="py-3 px-4 text-center text-on-surface-variant">
                            {row.ps}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <ExpertTip variant="info">
                <strong>Exemple :</strong> Achat 200 000€, revente 230 000€ après 10 ans. PV brute =
                30 000€. Abattement IR 30% → IR = 21 000€ × 19% = <strong>3 990€</strong>.
                Abattement PS 8.25% → PS = 27 525€ × 17.2% = <strong>4 734€</strong>. Total ={' '}
                <strong>8 724€</strong>.
              </ExpertTip>

              <ExpertTip variant="warning">
                <strong>Surtaxe (barème progressif) :</strong> Pour une plus-value nette IR
                supérieure à <strong>50 000€</strong> :
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-amber-200">
                        <th className="text-left py-1 font-bold">Tranche PV nette IR</th>
                        <th className="text-right py-1 font-bold">Surtaxe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SURTAXE_PV.map((row) => (
                        <tr key={row.tranche} className="border-b border-amber-100">
                          <td className="py-1">{row.tranche}</td>
                          <td className="py-1 text-right font-bold">{row.taux}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ExpertTip>
            </div>

            {/* LMNP réintégration */}
            <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  LMNP — Réintégration des amortissements (LF 2025)
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Nouveauté : les amortissements déduits augmentent la plus-value imposable.
                </p>
              </div>
              <FormulaBox highlight>
                PV brute = Prix de vente - (Prix d&apos;achat - Amortissements cumulés)
              </FormulaBox>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Depuis la <strong>loi de finances 2025</strong>, les amortissements déduits en LMNP
                sont réintégrés dans le calcul de la plus-value. Les abattements pour durée de
                détention s&apos;appliquent ensuite normalement.
              </p>
              <ExpertTip variant="warning">
                <strong>Impact concret :</strong> Si vous avez amorti 50 000€ sur 10 ans, votre
                plus-value brute augmente de 50 000€. C&apos;est le prix à payer pour des années
                d&apos;impôt zéro. À long terme (&gt;22 ans), l&apos;exonération IR compense
                largement.
              </ExpertTip>
              <ExpertTip variant="success">
                <strong>Exception — Résidences de services (LF 2025) :</strong> Les biens détenus en
                LMNP dans les résidences de services (EHPAD, résidences étudiantes, seniors,
                tourisme) sont <strong>exemptés</strong> de la réintégration.
              </ExpertTip>
            </div>

            {/* SCI IS */}
            <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-headline font-bold text-on-surface">
                  SCI à l&apos;IS — Plus-value professionnelle
                </h3>
                <p className="text-sm text-on-surface-variant">
                  Pas d&apos;abattement pour durée de détention.
                </p>
              </div>
              <FormulaBox>
                PV = Prix de vente - Valeur Nette Comptable (Prix - Amortissements cumulés)
              </FormulaBox>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                En SCI IS, la plus-value est calculée sur la <strong>valeur nette comptable</strong>
                . Après des années d&apos;amortissement, la VNC peut être très faible — ce qui
                génère une plus-value imposable importante. <strong>Aucun abattement</strong> pour
                durée de détention.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Sans distribution
                  </p>
                  <p className="text-sm text-on-surface">IS seul (15%/25%)</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Le profit reste dans la SCI
                  </p>
                </div>
                <div className="bg-error-container/30 p-4 rounded-2xl border border-error/15">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    Avec distribution
                  </p>
                  <p className="text-sm text-on-surface">IS + Flat Tax 30%</p>
                  <p className="text-xs text-on-surface-variant mt-1">Double imposition</p>
                </div>
              </div>
              <ExpertTip variant="warning">
                <strong>Exemple frappant :</strong> Achat 200 000€, revente 230 000€ après 10 ans.
                En <strong>nom propre : 8 724€</strong> d&apos;impôt PV. En{' '}
                <strong>SCI IS avec distribution : 35 742€</strong>. Soit <strong>4× plus</strong>.
                La SCI IS est un outil de capitalisation long terme, pas de revente rapide.
              </ExpertTip>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section Projections */}
        {/* ═══════════════════════════════════════════ */}
        <section id="projections" className="scroll-mt-4">
          <SectionHeader icon={BarChart3} title="Projections Patrimoniales" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                Simulation pluriannuelle
              </h3>
              <p className="text-sm text-on-surface-variant">
                Projections sur 20 ans intégrant inflation, fiscalité et crédit.
              </p>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Notre moteur projette votre investissement sur <strong>20 ans</strong> en intégrant
              toutes les variables qui évoluent : inflation des loyers, hausse des charges,
              remboursement du crédit et fiscalité réelle.
            </p>

            {/* Hypothèses */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-3">
                Hypothèses de projection
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Inflation loyers', value: '+1,5%', unit: '/an' },
                  { label: 'Inflation charges', value: '+2,0%', unit: '/an' },
                  { label: 'Revalorisation bien', value: '+1,0%', unit: '/an' },
                ].map((h) => (
                  <div
                    key={h.label}
                    className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 text-center"
                  >
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      {h.label}
                    </p>
                    <p className="text-2xl font-black text-on-surface">
                      {h.value}
                      <span className="text-xs font-normal text-on-surface-variant">{h.unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Indicateurs clés */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 space-y-3">
                <h5 className="text-sm font-bold text-on-surface">
                  TRI (Taux de Rendement Interne)
                </h5>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Le TRI mesure la rentabilité annualisée en prenant en compte{' '}
                  <strong>tous les flux</strong> : apport initial, cash-flows annuels nets
                  d&apos;impôt, valeur de revente nette de plus-value et de frais de cession.
                </p>
                <FormulaBox>
                  Flux final = Cash-flow net + Patrimoine net - Impôt PV - Frais de revente
                </FormulaBox>
              </div>
              <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 space-y-3">
                <h5 className="text-sm font-bold text-on-surface">
                  Patrimoine net à l&apos;horizon
                </h5>
                <p className="text-sm text-on-surface-variant leading-relaxed">
                  Mesure réaliste de votre enrichissement, intégrant les flux de trésorerie cumulés.
                </p>
                <FormulaBox>
                  Patrimoine net = Valeur du bien - Capital restant dû + Cash-flow net cumulé
                </FormulaBox>
              </div>
            </div>

            {/* Frais de revente */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-3">
                Frais de revente
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Frais d&apos;agence
                  </p>
                  <p className="text-2xl font-black text-on-surface">
                    5%
                    <span className="text-xs font-normal text-on-surface-variant"> du prix</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">Modifiable (0% si PAP)</p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Diagnostics
                  </p>
                  <p className="text-2xl font-black text-on-surface">
                    500€
                    <span className="text-xs font-normal text-on-surface-variant"> forfait</span>
                  </p>
                  <p className="text-xs text-on-surface-variant mt-1">DPE, amiante, plomb, etc.</p>
                </div>
                <div className="bg-error-container/30 p-4 rounded-2xl border border-error/15 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Exemple 230k€
                  </p>
                  <p className="text-2xl font-black text-error">12 000€</p>
                  <p className="text-xs text-on-surface-variant mt-1">
                    Impact TRI : -0.3 à -0.5 pt
                  </p>
                </div>
              </div>
            </div>

            {/* Lecture des graphiques */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-3">
                Lecture des graphiques
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 space-y-3">
                  <h5 className="text-sm font-bold text-on-surface">Graphe Cash-flow</h5>
                  {[
                    {
                      color: '#2D5A45',
                      label: 'Barres',
                      desc: 'Cash-flow net annuel. Vert si positif, rouge si négatif.',
                    },
                    {
                      color: '#60A5FA',
                      label: 'Ligne pointillée',
                      desc: "Somme de tous les cash-flows nets depuis l'année 1.",
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2 text-sm">
                      <span
                        className="h-3 w-3 rounded-full mt-0.5 shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="font-bold text-on-surface">{item.label}</p>
                        <p className="text-on-surface-variant text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/20 space-y-3">
                  <h5 className="text-sm font-bold text-on-surface">
                    Graphe Évolution du Patrimoine
                  </h5>
                  {[
                    {
                      color: '#2D5A45',
                      label: 'Valeur du bien',
                      desc: "Prix d'achat + revalorisation (+1,5%/an par défaut).",
                    },
                    {
                      color: '#DC2626',
                      label: 'Capital restant dû',
                      desc: "Montant d'emprunt restant. Atteint 0 à la fin du crédit.",
                    },
                    {
                      color: '#2563EB',
                      label: 'Patrimoine net',
                      desc: 'Valeur - Capital restant + Cash-flow net cumulé.',
                    },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-2 text-sm">
                      <span
                        className="h-3 w-3 rounded-full mt-0.5 shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="font-bold text-on-surface">{item.label}</p>
                        <p className="text-on-surface-variant text-xs">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════ */}
        {/* Section DPE */}
        {/* ═══════════════════════════════════════════ */}
        <section id="dpe" className="scroll-mt-4">
          <SectionHeader icon={Building2} title="Diagnostic de Performance Énergétique (DPE)" />

          <div className="bg-white rounded-3xl p-7 border border-outline-variant/15 shadow-sm space-y-6 mt-6">
            <div>
              <h3 className="text-lg font-headline font-bold text-on-surface mb-1">
                Impact du DPE sur votre investissement
              </h3>
              <p className="text-sm text-on-surface-variant">
                Un critère devenu incontournable depuis la loi Climat 2021.
              </p>
            </div>

            <p className="text-sm text-on-surface-variant leading-relaxed">
              Le DPE classe les logements de <strong>A</strong> (très performant) à{' '}
              <strong>G</strong> (passoire thermique). Il a un impact direct sur la{' '}
              <strong>valeur du bien</strong>, la <strong>capacité à louer</strong> et le{' '}
              <strong>score</strong> de votre investissement.
            </p>

            {/* Échelle DPE */}
            <div className="grid grid-cols-7 gap-2">
              {DPE_LABELS.map((dpe) => (
                <div
                  key={dpe.label}
                  className={cn('rounded-xl p-3 text-center font-black text-lg', dpe.text)}
                  style={{ backgroundColor: dpe.bg }}
                >
                  {dpe.label}
                </div>
              ))}
            </div>

            {/* Calendrier */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-3">
                Calendrier d&apos;interdiction de location
              </p>
              <div className="space-y-2">
                {DPE_CALENDAR.map((item) => (
                  <div key={item.date} className="flex items-center gap-4 text-sm">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.dotBg }}
                    />
                    <span className="font-bold text-on-surface w-40 shrink-0">{item.date}</span>
                    <span className="text-on-surface-variant">
                      {item.label} — {item.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gel des loyers */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-error pl-3 mb-3">
                Gel des loyers (DPE F et G)
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Les logements classés <strong>F ou G</strong> ne peuvent plus faire l&apos;objet
                d&apos;une augmentation de loyer depuis 2022. Le DPE <strong>E</strong> sera soumis
                au même gel à partir du <strong>1er janvier 2034</strong>.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    DPE A à E
                  </p>
                  <p className="text-sm text-on-surface">
                    Loyer revalorisé selon l&apos;IRL (<strong>+2%/an</strong> en moyenne)
                  </p>
                </div>
                <div className="bg-error-container/30 p-4 rounded-2xl border border-error/15">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    DPE F ou G
                  </p>
                  <p className="text-sm text-on-surface">
                    Loyer <strong>gelé</strong> — inflation forcée à 0% dans les projections
                  </p>
                </div>
              </div>
              <ExpertTip variant="warning">
                <strong>Impact concret :</strong> Pour un loyer de 900€/mois, le gel représente un
                manque à gagner de <strong>~175€/mois à l&apos;horizon 10 ans</strong> par rapport à
                un DPE C avec inflation de 2%.
              </ExpertTip>
            </div>

            {/* Décotes valeur vénale */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-3">
                Décotes sur la valeur vénale
              </p>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
                Les passoires thermiques subissent des décotes significatives à la revente (source :
                Notaires France 2024). Ces décotes sont intégrées dans le calcul de la valeur
                patrimoniale et du TRI.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    DPE A à D
                  </p>
                  <p className="text-2xl font-black text-primary">0%</p>
                  <p className="text-xs text-on-surface-variant mt-1">Pas de décote</p>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    DPE E
                  </p>
                  <p className="text-2xl font-black text-amber-600">-5%</p>
                  <p className="text-xs text-on-surface-variant mt-1">Décote modérée</p>
                </div>
                <div className="bg-error-container/30 p-4 rounded-2xl border border-error/15 text-center">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    DPE F ou G
                  </p>
                  <p className="text-2xl font-black text-error">-15%</p>
                  <p className="text-xs text-on-surface-variant mt-1">Décote passoire thermique</p>
                </div>
              </div>
            </div>

            {/* Alertes scoring */}
            <div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 border-l-4 border-primary pl-3 mb-3">
                Alertes et recommandations
              </p>
              <ExpertTip variant="warning">
                <strong>Impact sur le score :</strong> Un DPE A ou B apporte un bonus de{' '}
                <strong>+5 points</strong>, un DPE E un malus de <strong>-3 points</strong>, et un
                DPE F ou G un malus de <strong>-10 points</strong>. Le simulateur émet des alertes
                spécifiques si l&apos;interdiction de location tombe avant la fin de votre horizon
                de projection.
              </ExpertTip>
              <ExpertTip variant="success">
                <strong>Opportunité :</strong> Un bien en DPE F ou G acheté avec décote + travaux de
                rénovation énergétique peut être une excellente opération : vous bénéficiez du{' '}
                <strong>déficit foncier</strong> sur les travaux tout en augmentant la valeur et la
                performance du bien. Vérifiez votre éligibilité à{' '}
                <strong>MaPrimeRénov&apos;</strong>.
              </ExpertTip>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
