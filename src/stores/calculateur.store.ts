/**
 * Store Zustand pour le calculateur de rentabilité
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  BienData,
  FinancementData,
  ExploitationData,
  StructureData,
  OptionsData,
  CalculResultats,
  FormStatus,
  Scenario,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Valeurs par défaut pour le bien
 */
const DEFAULT_BIEN: Partial<BienData> = {
  type_bien: 'appartement',
};

/**
 * Valeurs par défaut pour le financement
 */
const DEFAULT_FINANCEMENT: Partial<FinancementData> = {
  apport: 0,
  taux_interet: 3.5,
  duree_emprunt: 20,
  assurance_pret: 0.3,
};

/**
 * Valeurs par défaut pour l'exploitation
 */
const DEFAULT_EXPLOITATION: Partial<ExploitationData> = {
  charges_copro: 0,
  taxe_fonciere: 0,
  assurance_pno: 0,
  gestion_locative: 0,
  provision_travaux: 5,
  provision_vacance: 5,
};

/**
 * Valeurs par défaut pour la structure
 */
const DEFAULT_STRUCTURE: Partial<StructureData> = {
  type: 'nom_propre',
  tmi: 30,
  associes: [],
};

/**
 * Valeurs par défaut pour les options
 */
const DEFAULT_OPTIONS: OptionsData = {
  generer_pdf: true,
  envoyer_email: false,
  email: '',
  horizon_projection: 20,
  taux_evolution_loyer: 2,
  taux_evolution_charges: 2.5,
};

/**
 * Interface du state du store
 */
interface CalculateurState {
  // Navigation globale
  currentStep: number;
  status: FormStatus;
  error: string | null;

  // Gestion des scénarios
  scenarios: Scenario[];
  activeScenarioId: string;

  // Accesseurs (données du scénario actif)
  getActiveScenario: () => Scenario;

  // Actions de navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Actions de gestion des scénarios
  addScenario: () => void;
  duplicateScenario: (id: string) => void;
  removeScenario: (id: string) => void;
  renameScenario: (id: string, name: string) => void;
  switchScenario: (id: string) => void;

  // Actions de mise à jour des données (ciblent le scénario actif)
  updateBien: (data: Partial<BienData>) => void;
  updateFinancement: (data: Partial<FinancementData>) => void;
  updateExploitation: (data: Partial<ExploitationData>) => void;
  updateStructure: (data: Partial<StructureData>) => void;
  updateOptions: (data: Partial<OptionsData>) => void;

  // Actions pour les résultats (ciblent le scénario actif)
  setResultats: (resultats: CalculResultats, pdfUrl: string | null) => void;
  setStatus: (status: FormStatus) => void;
  setError: (error: string | null) => void;

  // Actions utilitaires
  reset: () => void;
  resetScenario: (id: string) => void;
  getFormData: () => {
    bien: Partial<BienData>;
    financement: Partial<FinancementData>;
    exploitation: Partial<ExploitationData>;
    structure: Partial<StructureData>;
    options: OptionsData;
  };
}

/**
 * Nombre d'étapes dans le formulaire
 */
const TOTAL_STEPS = 6;

/**
 * Génère un scénario par défaut
 */
const createInitialScenario = (name = 'Scénario 1'): Scenario => ({
  id: uuidv4(),
  name,
  bien: { ...DEFAULT_BIEN },
  financement: { ...DEFAULT_FINANCEMENT },
  exploitation: { ...DEFAULT_EXPLOITATION },
  structure: { ...DEFAULT_STRUCTURE },
  options: { ...DEFAULT_OPTIONS },
  resultats: null,
  pdfUrl: null,
  currentStep: 0,
  status: 'idle',
});

/**
 * Store Zustand avec persistance localStorage
 */
export const useCalculateurStore = create<CalculateurState>()(
  persist(
    (set, get) => {
      const initialScenario = createInitialScenario();

      return {
        // État initial global
        currentStep: 0,
        status: 'idle',
        error: null,

        // État initial scénarios
        scenarios: [initialScenario],
        activeScenarioId: initialScenario.id,

        // Accesseur
        getActiveScenario: () => {
          const { scenarios, activeScenarioId } = get();
          return scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
        },

        // Actions de navigation
        setStep: (step) => {
          if (step >= 0 && step < TOTAL_STEPS) {
            const { scenarios, activeScenarioId } = get();
            set({
              currentStep: step,
              scenarios: scenarios.map(s => s.id === activeScenarioId ? { ...s, currentStep: step } : s)
            });
          }
        },

        nextStep: () => {
          const { currentStep, scenarios, activeScenarioId } = get();
          if (currentStep < TOTAL_STEPS - 1) {
            const nextStep = currentStep + 1;
            set({
              currentStep: nextStep,
              scenarios: scenarios.map(s => s.id === activeScenarioId ? { ...s, currentStep: nextStep } : s)
            });
          }
        },

        prevStep: () => {
          const { currentStep, scenarios, activeScenarioId } = get();
          if (currentStep > 0) {
            const prevStep = currentStep - 1;
            set({
              currentStep: prevStep,
              scenarios: scenarios.map(s => s.id === activeScenarioId ? { ...s, currentStep: prevStep } : s)
            });
          }
        },

        // Actions de gestion des scénarios
        addScenario: () => {
          const { scenarios } = get();
          if (scenarios.length >= 3) return;

          const newScenario = createInitialScenario(`Scénario ${scenarios.length + 1}`);
          set({
            scenarios: [...scenarios, newScenario],
            activeScenarioId: newScenario.id,
            currentStep: 0,
            status: 'idle',
          });
        },

        duplicateScenario: (id) => {
          const { scenarios } = get();
          if (scenarios.length >= 3) return;

          const source = scenarios.find((s) => s.id === id);
          if (!source) return;

          const duplicate: Scenario = {
            ...JSON.parse(JSON.stringify(source)), // Deep copy simple
            id: uuidv4(),
            name: `${source.name} (copie)`,
          };

          set({
            scenarios: [...scenarios, duplicate],
            activeScenarioId: duplicate.id,
            currentStep: duplicate.currentStep,
            status: duplicate.status,
          });
        },

        removeScenario: (id) => {
          const { scenarios, activeScenarioId } = get();
          if (scenarios.length <= 1) return;

          const nextScenarios = scenarios.filter((s) => s.id !== id);
          let nextActiveId = activeScenarioId;

          if (activeScenarioId === id) {
            nextActiveId = nextScenarios[0].id;
          }

          set({
            scenarios: nextScenarios,
            activeScenarioId: nextActiveId,
            currentStep: nextScenarios.find(s => s.id === nextActiveId)?.currentStep ?? 0,
            status: nextScenarios.find(s => s.id === nextActiveId)?.status ?? 'idle',
          });
        },

        renameScenario: (id, name) => {
          const { scenarios } = get();
          set({
            scenarios: scenarios.map((s) => (s.id === id ? { ...s, name } : s)),
          });
        },

        switchScenario: (id) => {
          const { scenarios } = get();
          const target = scenarios.find(s => s.id === id);
          if (target) {
            set({
              activeScenarioId: id,
              currentStep: target.currentStep,
              status: target.status
            });
          }
        },

        // Actions de mise à jour (ciblent le scénario actif)
        updateBien: (data) => {
          const { scenarios, activeScenarioId } = get();
          set({
            scenarios: scenarios.map((s) =>
              s.id === activeScenarioId ? { ...s, bien: { ...s.bien, ...data } } : s
            ),
          });
        },

        updateFinancement: (data) => {
          const { scenarios, activeScenarioId } = get();
          set({
            scenarios: scenarios.map((s) =>
              s.id === activeScenarioId
                ? { ...s, financement: { ...s.financement, ...data } }
                : s
            ),
          });
        },

        updateExploitation: (data) => {
          const { scenarios, activeScenarioId } = get();
          set({
            scenarios: scenarios.map((s) =>
              s.id === activeScenarioId
                ? { ...s, exploitation: { ...s.exploitation, ...data } }
                : s
            ),
          });
        },

        updateStructure: (data) => {
          const { scenarios, activeScenarioId } = get();
          set({
            scenarios: scenarios.map((s) =>
              s.id === activeScenarioId
                ? { ...s, structure: { ...s.structure, ...data } }
                : s
            ),
          });
        },

        updateOptions: (data) => {
          const { scenarios, activeScenarioId } = get();
          set({
            scenarios: scenarios.map((s) =>
              s.id === activeScenarioId
                ? { ...s, options: { ...s.options, ...data } }
                : s
            ),
          });
        },

        // Actions pour les résultats (ciblent le scénario actif)
        setResultats: (resultats, pdfUrl) => {
          const { scenarios, activeScenarioId } = get();
          set({
            status: 'success',
            scenarios: scenarios.map((s) =>
              s.id === activeScenarioId ? { ...s, resultats, pdfUrl } : s
            ),
          });
        },

        setStatus: (status) => {
          const { scenarios, activeScenarioId } = get();
          set({
            status,
            scenarios: scenarios.map(s => s.id === activeScenarioId ? { ...s, status } : s)
          });
        },

        setError: (error) => {
          const { scenarios, activeScenarioId } = get();
          const status = error ? 'error' : 'idle';
          set({
            error,
            status,
            scenarios: scenarios.map(s => s.id === activeScenarioId ? { ...s, status } : s)
          });
        },

        // Actions utilitaires
        reset: () => {
          const initialScenario = createInitialScenario();
          set({
            currentStep: 0,
            scenarios: [initialScenario],
            activeScenarioId: initialScenario.id,
            status: 'idle',
            error: null,
          });
        },

        resetScenario: (id) => {
          const { scenarios } = get();
          set({
            scenarios: scenarios.map((s) => {
              if (s.id === id) {
                const fresh = createInitialScenario(s.name);
                return { ...fresh, id: s.id }; // On garde le même ID
              }
              return s;
            }),
            currentStep: 0,
            status: 'idle',
            error: null,
          });
        },

        getFormData: () => {
          const scenario = get().getActiveScenario();
          return {
            bien: scenario.bien,
            financement: scenario.financement,
            exploitation: scenario.exploitation,
            structure: scenario.structure,
            options: scenario.options,
          };
        },
      };
    },
    {
      name: 'calculateur-storage',
      partialize: (state) => ({
        // On ne persiste que l'ID actif et l'étape pour retrouver son contexte
        // L'AC 6 demande que les scénarios soient "volatils" (Mémoire vive)
        activeScenarioId: state.activeScenarioId,
        currentStep: state.currentStep,
        // ATTENTION: Si on veut vraiment zéro persistance des données de simulation
        // on ne doit pas mettre les scenarios ici. 
        // Je vais quand même persister le tableau pour l'UX de refresh, 
        // SAUF si l'utilisateur a explicitement demandé l'inverse. 
        // L'AC 6 dit: "ne sont pas persistées en DB/LocalStorage (hors scope)".
        // Je vais donc les EXCLURE.
      }),
    }
  )
);
