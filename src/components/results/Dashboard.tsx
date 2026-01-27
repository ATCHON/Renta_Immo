'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardContent } from '@/components/ui';
import { MetricCard } from './MetricCard';
import { RentabiliteCard } from './RentabiliteCard';
import { CashflowCard } from './CashflowCard';
import { HCSFIndicator } from './HCSFIndicator';
import { ProjectionTable } from './ProjectionTable';
import { AmortizationTable } from './AmortizationTable';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { downloadPdf } from '@/lib/api';

export function Dashboard() {
  const router = useRouter();
  const { resultats, pdfUrl, bien, reset } = useCalculateurStore();
  const [showFinancingDetails, setShowFinancingDetails] = useState(false);
  const [showProjections, setShowProjections] = useState(false);

  // Rediriger si pas de résultats
  if (!resultats) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Aucun résultat disponible
        </h2>
        <p className="text-gray-600 mb-6">
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

  const handleNewCalculation = () => {
    reset();
    router.push('/calculateur');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Résultats de l&apos;analyse
          </h1>
          {bien.adresse && (
            <p className="text-gray-600 mt-1">{bien.adresse}</p>
          )}
        </div>
        <div className="flex gap-3">
          {pdfUrl && (
            <Button variant="outline" onClick={handleDownloadPdf}>
              Télécharger PDF
            </Button>
          )}
          <Button variant="secondary" onClick={handleNewCalculation}>
            Nouveau calcul
          </Button>
        </div>
      </div>

      {/* Score global et recommandation */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="text-primary-100 text-sm">Score global</p>
              <p className="text-5xl font-bold mt-1">
                {resultats.synthese.score_global}/100
              </p>
            </div>
            <div className="flex-1 md:text-right">
              <p className="text-primary-100 text-sm">Recommandation</p>
              <p className="text-xl font-semibold mt-1">
                {resultats.synthese.recommandation}
              </p>
            </div>
          </div>

          {/* Points d'attention */}
          {resultats.synthese.points_attention.length > 0 && (
            <div className="mt-6 pt-4 border-t border-primary-500">
              <p className="text-primary-100 text-sm mb-2">Points d&apos;attention</p>
              <ul className="space-y-1">
                {resultats.synthese.points_attention.map((point, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="text-amber-300">⚠</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métriques clés */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Rentabilité nette"
          value={formatPercent(resultats.rentabilite.nette)}
          variant={resultats.rentabilite.nette >= 5 ? 'success' : 'warning'}
        />
        <MetricCard
          title="Cashflow mensuel"
          value={formatCurrency(resultats.cashflow.mensuel)}
          variant={resultats.cashflow.mensuel >= 0 ? 'success' : 'danger'}
        />
        <MetricCard
          title="Mensualité crédit"
          value={formatCurrency(resultats.financement.mensualite)}
          variant="info"
        />
        <MetricCard
          title="Taux endettement"
          value={formatPercent(resultats.hcsf.taux_endettement)}
          variant={resultats.hcsf.conforme ? 'success' : 'danger'}
        />
        <MetricCard
          title="Effet de levier"
          value={`${resultats.rentabilite.effet_levier ?? 0}x`}
          variant={(resultats.rentabilite.effet_levier ?? 0) > 1 ? 'success' : 'info'}
        />
        <MetricCard
          title="Effort d'épargne"
          value={formatCurrency(resultats.rentabilite.effort_epargne_mensuel ?? 0)}
          variant={(resultats.rentabilite.effort_epargne_mensuel ?? 0) > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Cartes détaillées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RentabiliteCard rentabilite={resultats.rentabilite} />
        <CashflowCard cashflow={resultats.cashflow} />
      </div>

      {/* HCSF et Fiscalité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HCSFIndicator hcsf={resultats.hcsf} />

        <Card>
          <CardHeader
            title="Fiscalité"
            description="Impact fiscal de votre investissement"
          />
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Régime fiscal</span>
                <span className="font-medium text-gray-900">
                  {resultats.fiscalite.regime}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Impôt estimé</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(resultats.fiscalite.impot_estime)} / an
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Revenu net après impôt</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(resultats.fiscalite.revenu_net_apres_impot)} / an
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails financement */}
      <Card>
        <CardHeader
          title="Détails du financement"
          description="Récapitulatif de votre emprunt immobilier"
        />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Montant emprunté</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(resultats.financement.montant_emprunt)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Mensualité</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(resultats.financement.mensualite)}
              </p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Coût total du crédit</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {formatCurrency(resultats.financement.cout_total_credit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau d'amortissement (déroulable) */}
      <div className="space-y-4">
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFinancingDetails(!showFinancingDetails)}
            className="flex items-center gap-2"
          >
            {showFinancingDetails ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Masquer le tableau d'amortissement
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Voir le tableau d'amortissement détaillé
              </>
            )}
          </Button>
        </div>

        {showFinancingDetails && resultats.tableauAmortissement && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <AmortizationTable data={resultats.tableauAmortissement} />
          </div>
        )}
      </div>

      {/* Projections pluriannuelles */}
      {resultats.projections && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">TRI ({resultats.projections.horizon} ans)</p>
                <p className="text-2xl font-bold text-primary-700">
                  {formatPercent(resultats.projections.totaux.tri)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Enrichissement total</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(resultats.projections.totaux.enrichissementTotal)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Cash-flow cumulé</p>
                <p className={`text-2xl font-bold ${resultats.projections.totaux.cashflowCumule >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(resultats.projections.totaux.cashflowCumule)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-500">Capital remboursé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(resultats.projections.totaux.capitalRembourse)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProjections(!showProjections)}
              className="flex items-center gap-2"
            >
              {showProjections ? (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Masquer le tableau de projection
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Voir le tableau de projection détaillé
                </>
              )}
            </Button>
          </div>

          {showProjections && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <ProjectionTable data={resultats.projections} />
            </div>
          )}
        </div>
      )}

      {/* Lien En savoir plus */}
      <div className="text-center pt-4">
        <Link
          href="/en-savoir-plus"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          En savoir plus sur les calculs et les valeurs réglementaires
        </Link>
      </div>
    </div>
  );
}
