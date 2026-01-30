'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Download } from 'lucide-react';
import { Button, Card, CardHeader, CardContent, Collapsible } from '@/components/ui';
import { MetricCard } from './MetricCard';
import { RentabiliteCard } from './RentabiliteCard';
import { CashflowCard } from './CashflowCard';
import { HCSFIndicator } from './HCSFIndicator';
import { ProjectionTable } from './ProjectionTable';
import { AmortizationTable } from './AmortizationTable';
import { FiscalComparator } from './FiscalComparator';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { downloadPdf } from '@/lib/api';

export function Dashboard() {
  const router = useRouter();
  const { resultats, pdfUrl, bien, reset, setStatus } = useCalculateurStore();

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header avec actions */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-pebble mb-2">
            <button
              onClick={handleEdit}
              className="hover:text-forest transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Modifier
            </button>
            <span className="text-sand">/</span>
            <span className="text-sm">Résultats d&apos;analyse</span>
          </div>
          {bien.adresse && (
            <h1 className="text-3xl font-bold text-charcoal">{bien.adresse}</h1>
          )}
        </div>
        <div className="flex gap-3">
          {pdfUrl && (
            <Button variant="secondary" onClick={handleDownloadPdf} className="shadow-sm">
              <Download className="h-4 w-4 mr-2" />
              Rapport PDF
            </Button>
          )}
          <Button variant="ghost" onClick={handleNewCalculation}>
            Nouveau calcul
          </Button>
        </div>
      </div>

      {/* Vos Paramètres (Données de saisie) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          label="Prix d'achat"
          value={formatCurrency(bien.prix_achat || 0)}
          status="info"
        />
        <MetricCard
          label="Travaux"
          value={formatCurrency(bien.montant_travaux || 0)}
          status="info"
        />
        <MetricCard
          label="Apport personnel"
          value={formatCurrency(useCalculateurStore.getState().financement.apport || 0)}
          status="info"
        />
        <MetricCard
          label="Loyer mensuel"
          value={formatCurrency(useCalculateurStore.getState().exploitation.loyer_mensuel || 0)}
          status="info"
        />
        <MetricCard
          label="Taux du crédit"
          value={formatPercent(useCalculateurStore.getState().financement.taux_interet || 0)}
          status="info"
        />
        <MetricCard
          label="Durée du prêt"
          value={`${useCalculateurStore.getState().financement.duree_emprunt || 0} ans`}
          status="info"
        />
      </div>

      {/* Score global */}
      <Card variant="elevated" className="overflow-hidden border-none shadow-xl">
        <div className="bg-gradient-to-br from-forest via-forest-dark to-charcoal p-8 text-white relative">
          {/* Subtle background pattern could go here */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Indice de Performance</p>
              <div className="flex items-baseline justify-center md:justify-start gap-1">
                <span className="text-7xl font-bold tracking-tight">{resultats.synthese.score_global}</span>
                <span className="text-2xl text-white/50">/100</span>
              </div>
            </div>

            <div className="md:max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
              <p className="text-white/70 text-sm font-medium uppercase tracking-wider mb-2">Recommandation Expert</p>
              <p className="text-2xl font-bold leading-tight mb-4">{resultats.synthese.recommandation}</p>

              {resultats.synthese.points_attention.length > 0 && (
                <div className="space-y-2">
                  {resultats.synthese.points_attention.slice(0, 2).map((point, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/90">
                      <span className="text-amber shrink-0 mt-0.5">●</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Performance du Projet (Indicateurs clés) */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-charcoal uppercase tracking-[0.2em] px-1">Performance du Projet</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            label="Rentabilité nette"
            value={formatPercent(resultats.rentabilite.nette)}
            status={resultats.rentabilite.nette >= 5 ? 'success' : 'warning'}
          />
          <MetricCard
            label={resultats.cashflow.mensuel >= 0 ? "Cashflow Net mensuel" : "Effort d'épargne net"}
            value={formatCurrency(resultats.cashflow.mensuel)}
            status={resultats.cashflow.mensuel >= 0 ? 'success' : 'danger'}
          />
          <MetricCard
            label="Mensualité prêt"
            value={formatCurrency(resultats.financement.mensualite)}
            status="info"
          />
          <MetricCard
            label="Taux d'endettement"
            value={formatPercent(resultats.hcsf.taux_endettement)}
            status={resultats.hcsf.conforme ? 'success' : 'danger'}
            tooltip="Seuil maximal HCSF : 35%"
          />
          <MetricCard
            label="Effet de levier"
            value={`${(resultats.rentabilite.effet_levier ?? 0).toFixed(1)}x`}
            status={(resultats.rentabilite.effet_levier ?? 0) > 1 ? 'success' : 'info'}
            tooltip="Capacité du projet à générer plus de rentabilité que le coût de l'argent"
          />
          <MetricCard
            label="Effort d'épargne"
            value={formatCurrency(Math.abs(resultats.rentabilite.effort_epargne_mensuel ?? 0))}
            status={(resultats.rentabilite.effort_epargne_mensuel ?? 0) > 0 ? 'danger' : 'success'}
            tooltip="Somme réelle à sortir de votre poche chaque mois"
          />
        </div>
      </div>

      {/* Cartes détaillées : Rentabilité et Cashflow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RentabiliteCard rentabilite={resultats.rentabilite} />
        <CashflowCard cashflow={resultats.cashflow} />
      </div>

      {/* HCSF Indicator */}
      <HCSFIndicator hcsf={resultats.hcsf} />

      {/* Fiscalité - Comparateur dynamique */}
      {resultats.comparaisonFiscalite && (
        <FiscalComparator data={resultats.comparaisonFiscalite} />
      )}


      {/* Collapsible: Détails du financement + Tableau d'amortissement */}
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
