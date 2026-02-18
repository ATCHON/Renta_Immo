'use client';

import { useState } from 'react';
import { ConfigParam } from '@/server/config/config-types';

interface DryRunPanelProps {
  param: ConfigParam;
  newValue: number;
}

interface ScenarioImpact {
  scenarioId: string;
  label: string;
  metrics: {
    rentabilite: { delta: number; before: number; after: number };
    cashflow: { delta: number; before: number; after: number };
    impot: { delta: number; before: number; after: number };
  };
  hasChanges: boolean;
}

export default function DryRunPanel({ param, newValue }: DryRunPanelProps) {
  const [results, setResults] = useState<ScenarioImpact[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/dry-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cle: param.cle, valeur: newValue }),
      });
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
        setHasRun(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
        <div className="animate-spin h-5 w-5 border-2 border-forest border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-slate-500">Simulation en cours...</p>
      </div>
    );
  }

  if (!hasRun) {
    return (
      <div className="mt-6">
        <button
          onClick={runSimulation}
          className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-medium hover:border-forest hover:text-forest hover:bg-forest/5 transition-all text-sm"
        >
          ✨ Simuler l&apos;impact avant de valider
        </button>
      </div>
    );
  }

  const changedScenarios = results.filter((r) => r.hasChanges);

  return (
    <div className="mt-6 space-y-4">
      <h3 className="font-semibold text-slate-900 flex justify-between items-center">
        Impact simulé
        <button onClick={runSimulation} className="text-xs text-forest hover:underline">
          Rafraîchir
        </button>
      </h3>

      {changedScenarios.length === 0 ? (
        <div className="p-3 bg-slate-50 text-slate-500 text-sm rounded-lg italic text-center">
          Aucun impact notable détecté sur les scénarios types.
        </div>
      ) : (
        <div className="space-y-3">
          {changedScenarios.map((scenario) => (
            <div
              key={scenario.scenarioId}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm"
            >
              <div className="font-medium text-slate-700 mb-2">{scenario.label}</div>
              <div className="grid grid-cols-2 gap-2">
                <MetricDiff
                  label="Rentabilité"
                  delta={scenario.metrics.rentabilite.delta}
                  unit="%"
                  isPercent
                />
                <MetricDiff label="Cashflow/an" delta={scenario.metrics.cashflow.delta} unit="€" />
                <MetricDiff label="Impôt" delta={scenario.metrics.impot.delta} unit="€" inverse />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricDiff({
  label,
  delta,
  unit,
  isPercent,
  inverse,
}: {
  label: string;
  delta: number;
  unit: string;
  isPercent?: boolean;
  inverse?: boolean;
}) {
  if (Math.abs(delta) < (isPercent ? 0.01 : 1)) return null;

  const isPositive = delta > 0;
  const isGood = inverse ? !isPositive : isPositive;
  const colorClass = isGood ? 'text-green-600' : 'text-red-600';
  const sign = isPositive ? '+' : '';

  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-mono font-medium ${colorClass}`}>
        {sign}
        {isPercent ? delta.toFixed(2) : Math.round(delta)}
        {unit}
      </span>
    </div>
  );
}
