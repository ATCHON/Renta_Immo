'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download, Info } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, Collapsible } from '@/components/ui';
import { MetricCard } from './MetricCard';
import { RentabiliteCard } from './RentabiliteCard';
import { CashflowCard } from './CashflowCard';
import { HCSFIndicator } from './HCSFIndicator';
import { ProjectionTable } from './ProjectionTable';
import { AmortizationTable } from './AmortizationTable';
import { InvestmentBreakdown, OperationalBalance, FiscalComparator } from './';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { downloadPdf } from '@/lib/api';

export function Dashboard() {
  const router = useRouter();
  const { resultats, pdfUrl, bien, financement, exploitation, reset, setStatus } = useCalculateurStore();

  // Rediriger si pas de résultats
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

  const handleDownloadPdf = async () => {
    if (!pdfUrl) return;

    try {
      const blob = await downloadPdf(pdfUrl);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rentabilite-immobiliere.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
    }
  };

  const handleEdit = () => {
    setStatus('idle');
    router.push('/calculateur');
  };

  const handleNewCalculation = () => {
    reset();
    router.push('/calculateur');
  };

  const impotMensuelMoyen = resultats.fiscalite.impot_estime / 12;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header avec actions */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
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
            <span className="text-xs font-bold text-stone/80 uppercase tracking-widestAlpha">Rapport d&apos;analyse</span>
          </div>
          {bien.adresse && (
            <h1 className="text-4xl font-black text-charcoal tracking-tight">{bien.adresse}</h1>
          )}
        </div>
        <div className="flex gap-4">
          <Button variant="ghost" className="text-stone hover:text-charcoal" onClick={handleNewCalculation}>
            Nouveau calcul
          </Button>
          {pdfUrl && (
            <Button variant="primary" onClick={handleDownloadPdf} className="shadow-lg shadow-forest/20">
              <Download className="h-4 w-4 mr-2" />
              Télécharger le PDF
            </Button>
          )}
        </div>
      </div>

      {/* Vue d'overview - Section "Verdict" */}
      <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Score Card - ALIGNED WIDTH */}
        <Card variant="elevated" className="nordic-card-expert max-w-5xl mx-auto border-none !p-0">
          <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
            <div className="relative z-10 flex flex-col items-center md:items-start text-center md:text-left">
              <p className="nordic-label-xs !text-white/70 mb-4">Indice de Performance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-sm">{resultats.synthese.score_global}</span>
                <span className="text-2xl text-white/40 font-bold">/100</span>
              </div>
            </div>

            <div className="relative z-10 flex-1 max-w-xl nordic-glass rounded-[2rem] p-8">
              <p className="nordic-label-xs !text-white/50 mb-4">Recommandation Expert</p>
              <p className="text-xl md:text-2xl font-black leading-tight text-white mb-4">
                {resultats.synthese.recommandation}
              </p>
              <div className="h-1.5 w-12 bg-white/20 rounded-full mb-6" />
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm text-white/80 font-medium">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber shrink-0" />
                  Focus sur le cash-flow et l&apos;impact fiscal pour optimiser ce projet.
                </li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="nordic-kpi-card">
            <p className="nordic-label-xs mb-4">Renta. Nette-Nette</p>
            <p className="nordic-kpi-value !text-forest">{formatPercent(resultats.rentabilite.nette_nette)}</p>
            <p className="text-[10px] text-stone mt-2">Après charges & impôts</p>
          </div>
          <div className="nordic-kpi-card">
            <p className="nordic-label-xs mb-4">Cash-flow Net</p>
            <p className={cn(
              "nordic-kpi-value",
              resultats.cashflow.mensuel >= 0 ? "!text-forest" : "!text-terracotta"
            )}>
              {resultats.cashflow.mensuel >= 0 ? '+' : ''}{formatCurrency(resultats.cashflow.mensuel)}
            </p>
            <p className="text-[10px] text-stone mt-2">Par mois (réel)</p>
          </div>
          <div className="nordic-kpi-card">
            <p className="nordic-label-xs mb-4">TRI (20 ans)</p>
            <p className="nordic-kpi-value">
              {resultats.projections ? formatPercent(resultats.projections.totaux.tri) : '--'}
            </p>
            <p className="text-[10px] text-stone mt-2">Rendement interne</p>
          </div>
          <div className="nordic-kpi-card">
            <p className="nordic-label-xs mb-4">Patrimoine Net</p>
            <p className="nordic-kpi-value">
              {resultats.projections ? formatCurrency(resultats.projections.totaux.enrichissementTotal) : '--'}
            </p>
            <p className="text-[10px] text-stone mt-2">Gain à l&apos;horizon</p>
          </div>
        </div>
      </div>

      {/* Section 2 : Analyse Détaillée (Capital vs Exploitation) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <InvestmentBreakdown
          bien={bien}
          financement={financement}
          resultats={resultats.financement}
        />
        <OperationalBalance
          exploitation={exploitation}
          cashflow={resultats.cashflow}
          rentabilite={resultats.rentabilite}
          financement={resultats.financement}
          impotMensuel={impotMensuelMoyen}
        />
      </div>

      {/* Section 3 : Optimisation Fiscale & Bancaire */}
      {/* Fiscalité - Comparateur dynamique */}
      {resultats.comparaisonFiscalite && (
        <FiscalComparator data={resultats.comparaisonFiscalite} />
      )}

      {/* Section 4 : Expertise & Stratégie (Fusionnée & Compacte) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <HCSFIndicator hcsf={resultats.hcsf} />
        </div>
        <div className="nordic-card-expert !p-6">
          <div className="relative z-10 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/10 rounded-lg">
                  <Info size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Expertise Stratégique</h3>
              </div>
              <p className="text-xs font-medium text-white/80 leading-relaxed">
                {resultats.comparaisonFiscalite?.conseil}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="nordic-label-xs !text-white/40 mb-2">Levier & Risque Bancaire</p>
              <p className="text-xs font-medium text-white/80 leading-relaxed mb-4">
                {resultats.hcsf.conforme
                  ? "Profil sain. Profitez-en pour négocier les taux."
                  : "Risque HCSF élevé. Envisagez une SCI à l'IS."}
              </p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="nordic-label-xs !text-amber">Impact Levier</p>
                  <p className="text-2xl font-black tabular-nums">{resultats.rentabilite.effet_levier?.toFixed(2) || '0.00'}x</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Collapsible title="Expertise financement & Amortissement">
        <div className="space-y-8 py-4">
          {/* Détails financement */}
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

          {/* Tableau d'amortissement */}
          {resultats.tableauAmortissement && (
            <div className="pt-4">
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 px-1 border-l-4 border-forest/30 pl-3">
                Tableau d&apos;amortissement
              </h3>
              <AmortizationTable data={resultats.tableauAmortissement} />
            </div>
          )}
        </div>
      </Collapsible>

      {/* Collapsible: Projections pluriannuelles */}
      {resultats.projections && (
        <Collapsible title={`Projections patrimoniales (${resultats.projections.horizon} ans)`} defaultOpen={false}>
          <div className="space-y-8 py-4">
            {/* Métriques des projections */}
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

            {/* Tableau de projection */}
            <div className="pt-4">
              <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest mb-6 px-1 border-l-4 border-forest/30 pl-3">
                Simulation pluriannuelle détaillée
              </h3>
              <ProjectionTable data={resultats.projections} />
            </div>
          </div>
        </Collapsible>
      )}

      {/* Lien En savoir plus */}
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
