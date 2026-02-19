import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCalculateurStore } from '@/stores/calculateur.store';

// Mock de localStorage pour l'environnement Node
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('Calculateur Store', () => {
  beforeEach(() => {
    // Réinitialiser le store avant chaque test
    useCalculateurStore.getState().reset();
    localStorage.clear();
  });

  it('should have initial state', () => {
    const state = useCalculateurStore.getState();
    const scenario = state.getActiveScenario();
    expect(state.currentStep).toBe(0);
    expect(scenario.currentStep).toBe(0);
    expect(scenario.bien.type_bien).toBe('appartement');
    expect(state.status).toBe('idle');
    expect(scenario.status).toBe('idle');
  });

  it('should navigate through steps', () => {
    const { nextStep, prevStep } = useCalculateurStore.getState();

    nextStep();
    expect(useCalculateurStore.getState().currentStep).toBe(1);

    nextStep();
    expect(useCalculateurStore.getState().currentStep).toBe(2);

    prevStep();
    expect(useCalculateurStore.getState().currentStep).toBe(1);
    expect(useCalculateurStore.getState().getActiveScenario().currentStep).toBe(1);
  });

  it('should update bien data correctly', () => {
    const { updateBien } = useCalculateurStore.getState();

    updateBien({ prix_achat: 250000, surface: 65 });

    const state = useCalculateurStore.getState();
    const scenario = state.getActiveScenario();
    expect(scenario.bien.prix_achat).toBe(250000);
    expect(scenario.bien.surface).toBe(65);
    expect(scenario.bien.type_bien).toBe('appartement'); // Should preserve other fields
  });

  it('should update structure and associes', () => {
    const { updateStructure } = useCalculateurStore.getState();

    const associes = [{ nom: 'Jean', parts: 50, revenus: 3000, mensualites: 0, charges: 0 }];
    updateStructure({ type: 'sci_is', associes });

    const state = useCalculateurStore.getState();
    const scenario = state.getActiveScenario();
    expect(scenario.structure.type).toBe('sci_is');
    expect(scenario.structure.associes).toHaveLength(1);
    expect(scenario.structure.associes?.[0].nom).toBe('Jean');
  });

  it('should reset state completely', () => {
    const { updateBien, nextStep, reset } = useCalculateurStore.getState();

    updateBien({ prix_achat: 500000 });
    nextStep();

    reset();

    const state = useCalculateurStore.getState();
    const scenario = state.getActiveScenario();
    expect(state.currentStep).toBe(0);
    expect(scenario.currentStep).toBe(0);
    expect(scenario.bien.prix_achat).toBeUndefined(); // Back to default
  });

  it('should get full form data', () => {
    const { updateBien, getFormData } = useCalculateurStore.getState();

    updateBien({ prix_achat: 150000 });
    const formData = getFormData();

    expect(formData.bien.prix_achat).toBe(150000);
    expect(formData.financement).toBeDefined();
    expect(formData.exploitation).toBeDefined();
  });
});

describe('gestion des scénarios', () => {
  beforeEach(() => {
    useCalculateurStore.getState().reset();
    localStorage.clear();
  });

  it('addScenario crée un nouveau scénario avec ID unique', () => {
    useCalculateurStore.getState().addScenario();
    const state = useCalculateurStore.getState();
    expect(state.scenarios.length).toBe(2);
    const ids = state.scenarios.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('addScenario active le nouveau scénario', () => {
    useCalculateurStore.getState().addScenario();
    const state = useCalculateurStore.getState();
    const lastId = state.scenarios[state.scenarios.length - 1].id;
    expect(state.activeScenarioId).toBe(lastId);
  });

  it('duplicateScenario crée une copie avec les mêmes données bien', () => {
    const store = useCalculateurStore.getState();
    store.updateBien({ prix_achat: 300000, surface: 80 });
    const originalId = useCalculateurStore.getState().activeScenarioId;

    useCalculateurStore.getState().duplicateScenario(originalId);
    const state = useCalculateurStore.getState();

    expect(state.scenarios.length).toBe(2);
    const original = state.scenarios.find((s) => s.id === originalId);
    const duplicate = state.scenarios[state.scenarios.length - 1];
    expect(duplicate?.bien.prix_achat).toBe(original?.bien.prix_achat);
  });

  it('removeScenario supprime le scénario ciblé', () => {
    useCalculateurStore.getState().addScenario();
    const state1 = useCalculateurStore.getState();
    const idToRemove = state1.scenarios[state1.scenarios.length - 1].id;
    const countBefore = state1.scenarios.length;

    useCalculateurStore.getState().removeScenario(idToRemove);
    expect(useCalculateurStore.getState().scenarios.length).toBe(countBefore - 1);
    expect(
      useCalculateurStore.getState().scenarios.find((s) => s.id === idToRemove)
    ).toBeUndefined();
  });

  it('switchScenario change le scénario actif', () => {
    useCalculateurStore.getState().addScenario();
    const state = useCalculateurStore.getState();
    const firstId = state.scenarios[0].id;

    useCalculateurStore.getState().switchScenario(firstId);
    expect(useCalculateurStore.getState().activeScenarioId).toBe(firstId);
  });

  it('reset remet le store à un seul scénario', () => {
    useCalculateurStore.getState().addScenario();
    useCalculateurStore.getState().addScenario();
    useCalculateurStore.getState().reset();
    expect(useCalculateurStore.getState().scenarios.length).toBe(1);
  });
});
