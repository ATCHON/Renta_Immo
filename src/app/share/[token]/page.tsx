'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useCalculateurStore } from '@/stores/calculateur.store';
import { authClient } from '@/lib/auth-client';
import { Dashboard } from '@/components/results/Dashboard';
import { useSimulationMutations } from '@/hooks/useSimulationMutations';
import { APP_NAME } from '@/config/app';
import type { CalculateurFormData, CalculResultats } from '@/types/calculateur';
import toast from 'react-hot-toast';

interface SharedSimulation {
  id: string;
  name: string;
  description: string | null;
  form_data: CalculateurFormData;
  resultats: CalculResultats;
  created_at: string;
}

export default function SharedSimulationPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { loadScenario } = useCalculateurStore();
  const { createSimulation } = useSimulationMutations();

  const [simulation, setSimulation] = useState<SharedSimulation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchSharedSimulation() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/share/${token}`);
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const json = await res.json();
        if (!json.success || !json.data) {
          setNotFound(true);
          return;
        }
        setSimulation(json.data);
        loadScenario(json.data);
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) fetchSharedSimulation();
  }, [token, loadScenario]);

  const handleClone = async () => {
    if (!simulation || !session) return;
    setIsCloning(true);
    try {
      await createSimulation.mutateAsync({
        user_id: session.user.id,
        name: `Copie de ${simulation.name}`,
        description: simulation.description ?? '',
        form_data: simulation.form_data,
        resultats: simulation.resultats,
      });
      toast.success('Simulation clonée dans vos simulations !');
      router.push('/simulations');
    } catch {
      toast.error('Impossible de cloner la simulation.');
    } finally {
      setIsCloning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-on-surface/60 font-headline font-medium">
            Chargement de la simulation…
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-2">
            Lien invalide ou expiré
          </h1>
          <p className="text-on-surface/60 font-label mb-6">
            Cette simulation partagée n&apos;existe plus ou a été révoquée par son propriétaire.
          </p>
          <a
            href="/calculateur"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-headline font-bold rounded-xl hover:bg-primary/90 transition-colors"
          >
            Créer ma propre simulation
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Bannière partage */}
      <div className="bg-primary/5 border-b border-primary/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="font-headline font-semibold text-sm text-on-surface">
              Simulation partagée{simulation?.name ? ` — ${simulation.name}` : ''} via{' '}
              <span className="text-primary">{APP_NAME}</span>
            </p>
            <p className="text-xs text-on-surface/50 font-label mt-0.5">
              Vous consultez cette simulation en lecture seule.
            </p>
          </div>

          {session ? (
            <button
              type="button"
              onClick={handleClone}
              disabled={isCloning}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-headline font-bold text-sm rounded-xl hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 shrink-0"
            >
              {isCloning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Clonage…
                </>
              ) : (
                'Cloner cette simulation'
              )}
            </button>
          ) : (
            <a
              href={`/auth/signup?callbackUrl=/share/${token}`}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-headline font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors shrink-0"
            >
              Créer un compte pour sauvegarder
            </a>
          )}
        </div>
      </div>

      {/* Dashboard résultats en lecture seule */}
      <div className="py-8 px-4">
        <Dashboard />
      </div>
    </main>
  );
}
