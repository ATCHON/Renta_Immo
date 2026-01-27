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
} from '@/types';

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
  // Navigation
  currentStep: number;

  // Données du formulaire
  bien: Partial<BienData>;
  financement: Partial<FinancementData>;
  exploitation: Partial<ExploitationData>;
  structure: Partial<StructureData>;
  options: OptionsData;

  // Résultats
  resultats: CalculResultats | null;
  pdfUrl: string | null;

  // Status
  status: FormStatus;
  error: string | null;

  // Actions de navigation
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Actions de mise à jour des données
  updateBien: (data: Partial<BienData>) => void;
  updateFinancement: (data: Partial<FinancementData>) => void;
  updateExploitation: (data: Partial<ExploitationData>) => void;
  updateStructure: (data: Partial<StructureData>) => void;
  updateOptions: (data: Partial<OptionsData>) => void;

  // Actions pour les résultats
  setResultats: (resultats: CalculResultats, pdfUrl: string | null) => void;
  setStatus: (status: FormStatus) => void;
  setError: (error: string | null) => void;

  // Actions utilitaires
  reset: () => void;
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
 * Store Zustand avec persistance localStorage
 */
export const useCalculateurStore = create<CalculateurState>()(
  persist(
    (set, get) => ({
      // État initial
      currentStep: 0,
      bien: { ...DEFAULT_BIEN },
      financement: { ...DEFAULT_FINANCEMENT },
      exploitation: { ...DEFAULT_EXPLOITATION },
      structure: { ...DEFAULT_STRUCTURE },
      options: { ...DEFAULT_OPTIONS },
      resultats: null,
      pdfUrl: null,
      status: 'idle',
      error: null,

      // Actions de navigation
      setStep: (step) => {
        if (step >= 0 && step < TOTAL_STEPS) {
          set({ currentStep: step });
        }
      },

      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < TOTAL_STEPS - 1) {
          set({ currentStep: currentStep + 1 });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      // Actions de mise à jour
      updateBien: (data) => {
        set((state) => ({
          bien: { ...state.bien, ...data },
        }));
      },

      updateFinancement: (data) => {
        set((state) => ({
          financement: { ...state.financement, ...data },
        }));
      },

      updateExploitation: (data) => {
        set((state) => ({
          exploitation: { ...state.exploitation, ...data },
        }));
      },

      updateStructure: (data) => {
        set((state) => ({
          structure: { ...state.structure, ...data },
        }));
      },

      updateOptions: (data) => {
        set((state) => ({
          options: { ...state.options, ...data },
        }));
      },

      // Actions pour les résultats
      setResultats: (resultats, pdfUrl) => {
        set({ resultats, pdfUrl, status: 'success' });
      },

      setStatus: (status) => {
        set({ status });
      },

      setError: (error) => {
        set({ error, status: error ? 'error' : 'idle' });
      },

      // Actions utilitaires
      reset: () => {
        set({
          currentStep: 0,
          bien: { ...DEFAULT_BIEN },
          financement: { ...DEFAULT_FINANCEMENT },
          exploitation: { ...DEFAULT_EXPLOITATION },
          structure: { ...DEFAULT_STRUCTURE },
          options: { ...DEFAULT_OPTIONS },
          resultats: null,
          pdfUrl: null,
          status: 'idle',
          error: null,
        });
      },

      getFormData: () => {
        const state = get();
        return {
          bien: state.bien,
          financement: state.financement,
          exploitation: state.exploitation,
          structure: state.structure,
          options: state.options,
        };
      },
    }),
    {
      name: 'calculateur-storage',
      partialize: (state) => ({
        bien: state.bien,
        financement: state.financement,
        exploitation: state.exploitation,
        structure: state.structure,
        options: state.options,
        currentStep: state.currentStep,
      }),
    }
  )
);
