'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart2, TrendingUp, GitCompare, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button, Card } from '@/components/ui';
import { HCSFIndicator } from './HCSFIndicator';
import { ProjectionTable } from './ProjectionTable';
import { AmortizationTable } from './AmortizationTable';
import { FiscalAmortizationTable } from './FiscalAmortizationTable';
import { MetricCard } from './MetricCard';
import type { CalculateurFormData } from '@/types/calculateur';
import type { ProfilInvestisseur } from '@/types/calculateur';
import {
  InvestmentBreakdown,
  OperationalBalance,
  FiscalComparator,
  ScenarioTabs,
  ScorePanel,
  InputRecap,
  PointsAttention,
  RecommandationsPanel,
  ProfilInvestisseurToggle,
  DashboardFloatingFooter,
} from './';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useChartData } from '@/hooks/useChartData';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { formatCurrency, formatPercent } from '@/lib/utils';

// --- Dynamic chart imports (no SSR) ---
const ChartSkeleton = () => (
  <div className="h-[350px] w-full bg-surface-container/50 rounded-xl animate-pulse" />
);

const CashflowChart = dynamic(
  () => import('./CashflowChart').then((mod) => ({ default: mod.CashflowChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const PatrimoineChart = dynamic(
  () => import('./PatrimoineChart').then((mod) => ({ default: mod.PatrimoineChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

// --- Tab definitions ---
type TabId = 'analyse' | 'projections' | 'comparaison' | 'avance';

const TABS: { id: TabId; label: string; icon: React.ReactNode; stub?: boolean }[] = [
  { id: 'analyse', label: 'Analyse', icon: <BarChart2 className="h-4 w-4" /> },
  { id: 'projections', label: 'Projections', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'comparaison', label: 'Comparaison', icon: <GitCompare className="h-4 w-4" />, stub: true },
  { id: 'avance', label: 'Avancé', icon: <Settings2 className="h-4 w-4" />, stub: true },
];

// --- Helper components ---
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">
      {children}
    </h2>
  );
}

function StubPanel({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <Settings2 className="h-8 w-8 text-on-surface-variant/40" />
      </div>
      <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
        {label} — Prochainement
      </p>
      <p className="text-xs text-on-surface-variant/60 mt-1">
        Cette section sera disponible dans une prochaine version.
      </p>
    </div>
  );
}

function scoreToEvaluation(score: number) {
  if (score >= 80) return { evaluation: 'Excellent' as const, couleur: 'green' as const };
  if (score >= 60) return { evaluation: 'Bon' as const, couleur: 'blue' as const };
  if (score >= 40) return { evaluation: 'Moyen' as const, couleur: 'orange' as const };
  return { evaluation: 'Faible' as const, couleur: 'red' as const };
}

// --- Main component ---
export function Dashboard() {
  const router = useRouter();
  const { getActiveScenario, setStatus } = useCalculateurStore();
  const hasHydrated = useHasHydrated();
  const scenario = getActiveScenario();

  const [activeTab, setActiveTab] = useState<TabId>('analyse');
  const [profilInvestisseur, setProfilInvestisseur] = useState<ProfilInvestisseur>(
    (scenario.options?.profil_investisseur as ProfilInvestisseur) ?? 'rentier'
  );
  const { resultats, bien, financement, exploitation, structure, options } = scenario;

  const { cashflowData, patrimoineData, breakEvenYear, loanEndYear } = useChartData(
    resultats?.projections?.projections
  );

  if (!hasHydrated) return null;

  if (!resultats) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-medium text-on-surface mb-4">Aucun résultat disponible</h2>
        <p className="text-on-surface-variant mb-6">
          Vous devez d&apos;abord effectuer un calcul de rentabilité.
        </p>
        <Link href="/calculateur">
          <Button>Commencer un calcul</Button>
        </Link>
      </div>
    );
  }

  const formData: CalculateurFormData = {
    bien: bien as CalculateurFormData['bien'],
    financement: financement as CalculateurFormData['financement'],
    exploitation: exploitation as CalculateurFormData['exploitation'],
    structure: structure as CalculateurFormData['structure'],
    options,
  };

  const handleEdit = () => {
    setStatus('idle');
    router.push('/calculateur');
  };

  const impotMensuelMoyen = resultats.fiscalite.impot_estime / 12;

  const cashflowStatus =
    resultats.cashflow.mensuel >= 0 ? ('success' as const) : ('danger' as const);
  const rentaStatus =
    resultats.rentabilite.nette_nette >= 7
      ? ('success' as const)
      : resultats.rentabilite.nette_nette >= 3
        ? ('warning' as const)
        : ('danger' as const);
  const triStatus =
    resultats.projections && resultats.projections.totaux.tri >= 5
      ? ('success' as const)
      : ('info' as const);

  // Score par profil — always run scoreToEvaluation to ensure evaluation/couleur are fresh
  const scoreForProfil = (() => {
    const base = resultats.synthese.scores_par_profil
      ? (() => {
          const scoreDetail = resultats.synthese.scores_par_profil![profilInvestisseur];
          return {
            ...resultats.synthese,
            score_global: scoreDetail.total,
            score_detail: scoreDetail,
          };
        })()
      : resultats.synthese;
    const { evaluation, couleur } = scoreToEvaluation(base.score_global);
    return { ...base, evaluation, couleur };
  })();

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant mb-3">
            <button
              onClick={handleEdit}
              className="hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Modifier la saisie
            </button>
            <span className="text-outline-variant">/</span>
            <span className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
              Rapport d&apos;analyse
            </span>
          </div>
          {bien?.adresse && (
            <h1 className="text-2xl sm:text-4xl font-black text-on-surface tracking-tight">
              {bien.adresse}
            </h1>
          )}
        </div>
      </div>

      {/* ── ScenarioTabs ── */}
      <div className="mt-6">
        <ScenarioTabs />
      </div>

      {/* ── Tab Bar ── */}
      <div className="mt-6 flex gap-1 border-b border-outline-variant/40 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 text-sm font-bold whitespace-nowrap',
              'border-b-2 -mb-px transition-colors duration-150',
              activeTab === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant'
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.stub && (
              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant/60">
                Bientôt
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="mt-8 space-y-10">
        {/* ─── Tab 1 : Analyse ─── */}
        {activeTab === 'analyse' && (
          <>
            {/* Paramètres */}
            <section className="space-y-3">
              <SectionTitle>Paramètres</SectionTitle>
              <InputRecap
                bien={bien}
                financement={financement}
                exploitation={exploitation}
                structure={structure}
              />
            </section>

            {/* Performance */}
            <section className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <SectionTitle>Performance</SectionTitle>
                <ProfilInvestisseurToggle
                  profil={profilInvestisseur}
                  onChange={setProfilInvestisseur}
                />
              </div>
              <ScorePanel synthese={scoreForProfil} />
            </section>

            {/* Indicateurs Clés */}
            <section className="space-y-3">
              <SectionTitle>Indicateurs Clés</SectionTitle>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <MetricCard
                  label="Renta. Brute"
                  value={formatPercent(resultats.rentabilite.brute)}
                  status="info"
                  tooltip="Loyer facial / Prix d'achat (convention marché)"
                  data-testid="rentabilite-brute"
                />
                <MetricCard
                  label="Revenus Annuels"
                  value={formatCurrency(resultats.rentabilite.loyer_annuel ?? 0)}
                  status="info"
                  tooltip="Loyer annuel effectif (après taux d'occupation)"
                  data-testid="revenus-annuels"
                />
                <MetricCard
                  label="Renta. Nette-Nette"
                  value={formatPercent(resultats.rentabilite.nette_nette)}
                  status={rentaStatus}
                  tooltip="Après charges & impôts"
                />
                <MetricCard
                  label="Cash-flow Net"
                  value={`${resultats.cashflow.mensuel >= 0 ? '+' : ''}${formatCurrency(resultats.cashflow.mensuel)}`}
                  status={cashflowStatus}
                  tooltip="Par mois (réel)"
                />
                <MetricCard
                  label="TRI"
                  value={
                    resultats.projections ? formatPercent(resultats.projections.totaux.tri) : '--'
                  }
                  status={triStatus}
                  tooltip="Rendement interne"
                />
                <MetricCard
                  label="Patrimoine Net"
                  value={
                    resultats.projections
                      ? formatCurrency(resultats.projections.totaux.enrichissementTotal)
                      : '--'
                  }
                  status="success"
                  tooltip="Gain à l'horizon"
                />
              </div>
            </section>

            {/* Points d'Attention */}
            {resultats.synthese.points_attention_detail?.length ||
            resultats.synthese.points_attention?.length ? (
              <section className="space-y-3">
                <SectionTitle>Points d&apos;Attention</SectionTitle>
                <PointsAttention
                  points={resultats.synthese.points_attention}
                  pointsDetail={resultats.synthese.points_attention_detail}
                />
              </section>
            ) : null}

            {/* Cash-flow & Rentabilité */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InvestmentBreakdown
                bien={bien}
                financement={financement}
                resultats={resultats.financement}
              />
              <OperationalBalance
                exploitation={exploitation}
                cashflow={resultats.cashflow}
                financement={resultats.financement}
                rentabilite={resultats.rentabilite}
                impotMensuel={impotMensuelMoyen}
              />
            </section>

            {/* Comparaison Fiscale */}
            {resultats.comparaisonFiscalite && (
              <section className="space-y-3">
                <SectionTitle>Comparaison Fiscale</SectionTitle>
                <FiscalComparator data={resultats.comparaisonFiscalite} />
              </section>
            )}

            {/* HCSF */}
            <HCSFIndicator hcsf={resultats.hcsf} />

            {/* Recommandations */}
            <RecommandationsPanel
              recommandations={resultats.synthese.recommandations_detail}
              fiscalConseil={resultats.comparaisonFiscalite?.conseil}
              hcsfConforme={resultats.hcsf.conforme}
              effetLevier={resultats.rentabilite.effet_levier}
            />
          </>
        )}

        {/* ─── Tab 2 : Projections ─── */}
        {activeTab === 'projections' && (
          <>
            {/* Graphiques */}
            {resultats.projections && (
              <section className="space-y-3">
                <SectionTitle>Projections</SectionTitle>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6 md:p-10 rounded-3xl bg-surface-container-lowest shadow-sm border-none">
                    <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-5">
                      Cash-flow net d&apos;impôt
                    </h3>
                    <CashflowChart data={cashflowData} breakEvenYear={breakEvenYear} />
                  </Card>
                  <Card className="p-6 md:p-10 rounded-3xl bg-surface-container-lowest shadow-sm border-none">
                    <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-5">
                      Évolution du patrimoine
                    </h3>
                    <PatrimoineChart
                      data={patrimoineData}
                      loanEndYear={loanEndYear}
                      dpe={bien?.dpe}
                    />
                  </Card>
                </div>
              </section>
            )}

            {/* Plus-Value à la revente */}
            {resultats.projections?.plusValue && (
              <section className="space-y-3">
                <SectionTitle>Plus-Value à la Revente</SectionTitle>
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 p-6 space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      {
                        label: 'PV brute',
                        value: formatCurrency(resultats.projections.plusValue.plus_value_brute),
                        testId: 'pv-brute',
                        color: 'text-on-surface',
                      },
                      {
                        label: 'Impôt total PV',
                        value: formatCurrency(resultats.projections.plusValue.impot_total),
                        testId: 'impot-pv-total',
                        color: 'text-error',
                      },
                      {
                        label: 'Net revente',
                        value: formatCurrency(resultats.projections.plusValue.net_revente),
                        color: 'text-primary',
                      },
                      {
                        label: 'Durée détention',
                        value: `${resultats.projections.plusValue.duree_detention} ans`,
                        color: 'text-on-surface',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="text-center p-4 rounded-xl bg-surface-container"
                      >
                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-1">
                          {item.label}
                        </p>
                        <p
                          className={`text-base sm:text-xl font-black ${item.color}`}
                          {...(item.testId ? { 'data-testid': item.testId } : {})}
                        >
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-outline-variant/30 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-on-surface-variant">Base imposable (IR)</span>
                      <span
                        className="ml-2 font-bold text-on-surface"
                        data-testid="base-imposable-pv"
                      >
                        {formatCurrency(resultats.projections.plusValue.plus_value_nette_ir)}
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Abattement IR</span>
                      <span className="ml-2 font-bold text-on-surface" data-testid="abattement-ir">
                        {resultats.projections.plusValue.abattement_ir}%
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Abattement PS</span>
                      <span className="ml-2 font-bold text-on-surface" data-testid="abattement-ps">
                        {resultats.projections.plusValue.abattement_ps}%
                      </span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant">Surtaxe PV</span>
                      <span className="ml-2 font-bold text-on-surface" data-testid="surtaxe-pv">
                        {formatCurrency(resultats.projections.plusValue.surtaxe)}
                      </span>
                    </div>
                    {resultats.projections.plusValue.amortissements_reintegres > 0 && (
                      <div className="col-span-2">
                        <span className="text-on-surface-variant">
                          Amortissements réintégrés (LMNP)
                        </span>
                        <span className="ml-2 font-bold text-tertiary">
                          {formatCurrency(
                            resultats.projections.plusValue.amortissements_reintegres
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Projections détaillées (KPIs + table) */}
            {resultats.projections && (
              <section className="space-y-3">
                <SectionTitle>Détail sur {resultats.projections.horizon} ans</SectionTitle>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    {
                      label: 'TRI Projet',
                      value: formatPercent(resultats.projections.totaux.tri),
                      color: 'text-primary',
                    },
                    {
                      label: 'Patrimoine net',
                      value: formatCurrency(resultats.projections.totaux.enrichissementTotal),
                      color: 'text-primary',
                    },
                    {
                      label: 'Cash-flow cumulé',
                      value: formatCurrency(resultats.projections.totaux.cashflowCumule),
                      color:
                        resultats.projections.totaux.cashflowCumule >= 0
                          ? 'text-primary'
                          : 'text-error',
                    },
                    {
                      label: 'Dette remboursée',
                      value: formatCurrency(resultats.projections.totaux.capitalRembourse),
                      color: 'text-on-surface',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="text-center p-5 rounded-xl bg-surface-container"
                    >
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-1">
                        {item.label}
                      </p>
                      <p className={`text-xl font-black tabular-nums ${item.color}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
                <ProjectionTable data={resultats.projections} />
              </section>
            )}

            {/* Financement & Amortissement */}
            <section className="space-y-3">
              <SectionTitle>Financement &amp; Amortissement</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: 'Montant emprunté',
                    value: formatCurrency(resultats.financement.montant_emprunt),
                    accent: false,
                  },
                  {
                    label: 'Engagement mensuel',
                    value: formatCurrency(resultats.financement.mensualite),
                    accent: false,
                  },
                  {
                    label: 'Coût du crédit',
                    value: formatCurrency(resultats.financement.cout_total_credit),
                    accent: true,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      'text-center p-5 rounded-xl',
                      item.accent ? 'bg-error/5 border border-error/10' : 'bg-surface-container'
                    )}
                  >
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-wider mb-2">
                      {item.label}
                    </p>
                    <p
                      className={cn(
                        'text-2xl font-black tabular-nums',
                        item.accent ? 'text-error' : 'text-on-surface'
                      )}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {resultats.tableauAmortissement && (
                <AmortizationTable data={resultats.tableauAmortissement} />
              )}

              {resultats.tableauAmortissementFiscal && (
                <div className="pt-2">
                  <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4 pl-3 border-l-4 border-tertiary/40">
                    Amortissement fiscal
                  </h3>
                  <FiscalAmortizationTable data={resultats.tableauAmortissementFiscal} />
                </div>
              )}
            </section>
          </>
        )}

        {/* ─── Tab 3 : Comparaison (stub) ─── */}
        {activeTab === 'comparaison' && <StubPanel label="Comparaison de scénarios" />}

        {/* ─── Tab 4 : Avancé (stub) ─── */}
        {activeTab === 'avance' && <StubPanel label="Analyse avancée" />}
      </div>

      {/* ── Footer ── */}
      <div className="text-center pt-12">
        <Link
          href="/en-savoir-plus"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-bold uppercase tracking-widest bg-primary/5 px-6 py-3 rounded-full border border-primary/10 hover:border-primary/30"
        >
          Méthodologie &amp; Valeurs réglementaires
        </Link>
      </div>

      <DashboardFloatingFooter formData={formData} resultats={resultats} />
    </div>
  );
}
