'use client';

import { useEffect } from 'react';
import { useSimulation } from '@/hooks/useSimulations';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { Dashboard } from '@/components/results/Dashboard';
import { useParams } from 'next/navigation';

export default function SimulationDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { data: simulation, isLoading, error } = useSimulation(id);
  const { loadScenario } = useCalculateurStore();

  useEffect(() => {
    if (simulation && simulation.data) {
      loadScenario(simulation.data);
    }
  }, [simulation, loadScenario]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-forest rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Chargement de votre simulation...</p>
      </div>
    );
  }

  if (error || !simulation) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl max-w-md mx-auto inline-block border border-red-100">
          <p className="font-bold mb-2">Erreur lors du chargement</p>
          <p className="text-sm opacity-90">Impossible de récupérer cette simulation.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen py-8 px-4 bg-background">
      <Dashboard />
    </main>
  );
}
