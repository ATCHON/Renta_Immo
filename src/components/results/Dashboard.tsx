'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, Collapsible } from '@/components/ui';
import { HCSFIndicator } from './HCSFIndicator';
import { ProjectionTable } from './ProjectionTable';
import { AmortizationTable } from './AmortizationTable';
import { FiscalAmortizationTable } from './FiscalAmortizationTable';
import { MetricCard } from './MetricCard';
import type { CalculateurFormData } from '@/types/calculateur';
import {
  InvestmentBreakdown,
  OperationalBalance,
  FiscalComparator,
  ScenarioTabs,
  DownloadPdfButton,
  ScorePanel,
  InputRecap,
  PointsAttention,
  RecommandationsPanel,
  ProfilInvestisseurToggle,
  AlerteLmp,
} from './';
import { SaveSimulationButton } from '../simulations/SaveSimulationButton';
import { CONSTANTS } from '@/config/constants';

const ChartSkeleton = () => (
  <div className="h-[350px] w-full bg-surface/50 rounded-xl animate-pulse" />
);

const CashflowChart = dynamic(
  () => import('./CashflowChart').then(mod => ({ default: mod.CashflowChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);

const PatrimoineChart = dynamic(
  () => import('./PatrimoineChart').then(mod => ({ default: mod.PatrimoineChart })),
  { loading: () => <ChartSkeleton />, ssr: false }
);
import { useCalculateurStore } from '@/stores/calculateur.store';
import { useChartData } from '@/hooks/useChartData';
import { useHasHydrated } from '@/hooks/useHasHydrated';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useState } from 'react';
import type { ProfilInvestisseur } from '@/types/calculateur';

function scoreToEvaluation(score: number) {
  if (score >= 80) return { evaluation: 'Excellent' as const, couleur: 'green' as const };
  if (score >= 60) return { evaluation: 'Bon' as const, couleur: 'blue' as const };
  if (score >= 40) return { evaluation: 'Moyen' as const, couleur: 'orange' as const };
  return { evaluation: 'Faible' as const, couleur: 'red' as const };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-black uppercase tracking-widest text-charcoal">
      {children}
    </h2>
  );
}

export function Dashboard() {
  const router = useRouter();
  const { getActiveScenario, setStatus } = useCalculateurStore();

  const hasHydrated = useHasHydrated();
  const scenario = getActiveScenario();
  const { resultats, bien, financement, exploitation, structure, options } = scenario;

  const { cashflowData, patrimoineData, breakEvenYear, loanEndYear } = useChartData(resultats?.projections?.projections);
  const [profilInvestisseur, setProfilInvestisseur] = useState<ProfilInvestisseur>(
    (scenario.options?.profil_investisseur as ProfilInvestisseur) ?? 'rentier'
  );

  if (!hasHydrated) return null;

  if (!resultats) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-medium text-charcoal mb-4">
          Aucun résultat disponible
        </h2>
        <p className="text-stone mb-6">
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

  // KPI contextual statuses
  const cashflowStatus = resultats.cashflow.mensuel >= 0 ? 'success' as const : 'danger' as const;
  const rentaStatus = resultats.rentabilite.nette_nette >= 7 ? 'success' as const : resultats.rentabilite.nette_nette >= 3 ? 'warning' as const : 'danger' as const;
  const triStatus = resultats.projections && resultats.projections.totaux.tri >= 5 ? 'success' as const : 'info' as const;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-6 border-b border-sand/60">
        <div>
          <div className="flex items-center gap-2 text-stone mb-3">
            <button
              onClick={handleEdit}
              className="hover:text-forest transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Modifier la saisie
            </button>
            <span className="text-sand">/</span>
            <span className="text-xs font-bold text-stone/80 uppercase tracking-widest">Rapport d&apos;analyse</span>
          </div>
          {bien.adresse && (
            <h1 className="text-4xl font-black text-charcoal tracking-tight">{bien.adresse}</h1>
          )}
        </div>
        <div className="flex gap-4">
          <SaveSimulationButton
            formData={formData}
            resultats={resultats}
          />
          <DownloadPdfButton
            formData={formData}
            resultats={resultats}
            className="shadow-lg shadow-forest/20"
          />
        </div>
      </div>

      {/* 2. ScenarioTabs */}
      <ScenarioTabs />

      {/* 3. InputRecap */}
      <div className="space-y-3">
        <SectionTitle>Paramètres</SectionTitle>
        <InputRecap
          bien={bien}
          financement={financement}
          exploitation={exploitation}
          structure={structure}
        />
      </div>

      {/* 4. ScorePanel avec toggle profil investisseur (V2-S16) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SectionTitle>Performance</SectionTitle>
          <ProfilInvestisseurToggle
            profil={profilInvestisseur}
            onChange={setProfilInvestisseur}
          />
        </div>
        <ScorePanel
          synthese={
            resultats.synthese.scores_par_profil
              ? (() => {
                const scoreDetail = resultats.synthese.scores_par_profil[profilInvestisseur];
                const { evaluation, couleur } = scoreToEvaluation(scoreDetail.total);
                return {
                  ...resultats.synthese,
                  score_global: scoreDetail.total,
                  score_detail: scoreDetail,
                  evaluation,
                  couleur,
                };
              })()
              : resultats.synthese
          }
        />
      </div>

      {/* 5. KPI Cards */}
      <div className="space-y-3">
        <SectionTitle>Indicateurs Clés</SectionTitle>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            label="TRI (20 ans)"
            value={resultats.projections ? formatPercent(resultats.projections.totaux.tri) : '--'}
            status={triStatus}
            tooltip="Rendement interne"
          />
          <MetricCard
            label="Patrimoine Net"
            value={resultats.projections ? formatCurrency(resultats.projections.totaux.enrichissementTotal) : '--'}
            status="success"
            tooltip="Gain à l'horizon"
          />
        </div>
      </div>

      {/* 6. Points d'Attention + Alerte LMP (V2-S17) */}
      {(() => {
        const isLmnp = structure?.regime_fiscal === 'lmnp_reel' || structure?.regime_fiscal === 'lmnp_micro';
        // Utiliser loyer_annuel du backend (déjà pondéré par taux_occupation) pour rester cohérent avec genererAlertesLmp
        const recettesAnnuelles = resultats.rentabilite.loyer_annuel ?? 0;
        const hasPoints = resultats.synthese.points_attention_detail?.length || resultats.synthese.points_attention?.length;
        const hasLmpAlert = isLmnp && recettesAnnuelles > CONSTANTS.LMP.SEUIL_ALERTE;
        if (!hasPoints && !hasLmpAlert) return null;
        return (
          <div className="space-y-3">
            <SectionTitle>Points d&apos;Attention</SectionTitle>
            {hasLmpAlert && <AlerteLmp recettesLmnpAnnuelles={recettesAnnuelles} />}
            <PointsAttention
              points={resultats.synthese.points_attention}
              pointsDetail={resultats.synthese.points_attention_detail}
            />
          </div>
        );
      })()}

      {/* 7. InvestmentBreakdown + OperationalBalance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      </div>

      {/* 8. FiscalComparator */}
      {resultats.comparaisonFiscalite && (
        <FiscalComparator data={resultats.comparaisonFiscalite} />
      )}

      {/* 9. HCSFIndicator */}
      <HCSFIndicator hcsf={resultats.hcsf} />

      {/* 10. RecommandationsPanel */}
      <RecommandationsPanel
        recommandations={resultats.synthese.recommandations_detail}
        fiscalConseil={resultats.comparaisonFiscalite?.conseil}
        hcsfConforme={resultats.hcsf.conforme}
        effetLevier={resultats.rentabilite.effet_levier}
      />

      {/* 10. Graphiques (sortis du Collapsible) */}
      {resultats.projections && (
        <div className="space-y-3">
          <SectionTitle>Projections</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 bg-white shadow-sm border-none">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">Projection Cash-flow (Net d&apos;impôt)</h3>
              </div>
              <CashflowChart data={cashflowData} breakEvenYear={breakEvenYear} />
            </Card>
            <Card className="p-6 bg-white shadow-sm border-none">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest">Évolution du Patrimoine</h3>
              </div>
              <PatrimoineChart data={patrimoineData} loanEndYear={loanEndYear} dpe={bien.dpe} />
            </Card>
          </div>
        </div>
      )}

      {/* 11. Collapsible: Financement & Amortissement */}
      <Collapsible title="Expertise financement & Amortissement">
        <div className="space-y-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-surface border border-sand/50 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">Montant emprunté</p>
              <p className="text-3xl font-black text-charcoal tabular-nums">
                {formatCurrency(resultats.financement.montant_emprunt)}
              </p>
            </div>
            <div className="text-center p-6 bg-surface border border-sand/50 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">Engagement mensuel</p>
              <p className="text-3xl font-black text-charcoal tabular-nums">
                {formatCurrency(resultats.financement.mensualite)}
              </p>
            </div>
            <div className="text-center p-6 bg-terracotta/[0.03] border border-terracotta/10 rounded-2xl shadow-sm">
              <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">Coût du crédit</p>
              <p className="text-3xl font-black text-terracotta tabular-nums">
                {formatCurrency(resultats.financement.cout_total_credit)}
              </p>
            </div>
          </div>

          {resultats.tableauAmortissement && (
            <div className="pt-4">
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 px-1 border-l-4 border-forest/30 pl-3">
                Remboursement du crédit
              </h3>
              <AmortizationTable data={resultats.tableauAmortissement} />
            </div>
          )}

          {resultats.tableauAmortissementFiscal && (
            <div className="pt-4">
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 px-1 border-l-4 border-amber-500/40 pl-3">
                Amortissement fiscal
              </h3>
              <FiscalAmortizationTable data={resultats.tableauAmortissementFiscal} />
            </div>
          )}
        </div>
      </Collapsible>

      {/* 12. Collapsible: Projections détaillées (table + KPIs only) */}
      {resultats.projections && (
        <Collapsible title={`Projections patrimoniales détaillées (${resultats.projections.horizon} ans)`} defaultOpen={false}>
          <div className="space-y-8 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-forest/5 border border-forest/10 rounded-2xl">
                <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">TRI Projet</p>
                <p className="text-3xl font-black text-forest tabular-nums">
                  {formatPercent(resultats.projections.totaux.tri)}
                </p>
              </div>
              <div className="text-center p-6 bg-sage/5 border border-sage/10 rounded-2xl">
                <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">Patrimoine net</p>
                <p className="text-3xl font-black text-forest tabular-nums">
                  {formatCurrency(resultats.projections.totaux.enrichissementTotal)}
                </p>
              </div>
              <div className="text-center p-6 bg-surface border border-sand/50 rounded-2xl">
                <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">Cash-flow cumulé</p>
                <p className={`text-3xl font-black tabular-nums ${resultats.projections.totaux.cashflowCumule >= 0 ? 'text-forest' : 'text-terracotta'}`}>
                  {formatCurrency(resultats.projections.totaux.cashflowCumule)}
                </p>
              </div>
              <div className="text-center p-6 bg-surface border border-sand/50 rounded-2xl">
                <p className="text-xs font-bold text-pebble uppercase tracking-wider mb-2">Dette remboursée</p>
                <p className="text-3xl font-black text-charcoal tabular-nums">
                  {formatCurrency(resultats.projections.totaux.capitalRembourse)}
                </p>
              </div>
            </div>

            <div className="pt-4">
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 px-1 border-l-4 border-forest/30 pl-3">
                Simulation pluriannuelle détaillée
              </h3>
              <ProjectionTable data={resultats.projections} />
            </div>
          </div>
        </Collapsible>
      )}

      {/* 13. Lien Méthodologie */}
      <div className="text-center pt-8">
        <Link
          href="/en-savoir-plus"
          className="inline-flex items-center gap-2 text-forest hover:text-forest-dark transition-all text-sm font-bold uppercase tracking-widest bg-forest/5 px-6 py-3 rounded-full border border-forest/10 hover:border-forest/30"
        >
          Méthodologie & Valeurs réglementaires
        </Link>
      </div>
    </div>
  );
}
