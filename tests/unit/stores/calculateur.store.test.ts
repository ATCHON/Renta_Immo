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

  it('duplicateScenario crée une copie avec les mêmes données bien mais sans dbId', () => {
    const store = useCalculateurStore.getState();
    store.updateBien({ prix_achat: 300000, surface: 80 });
    // Simulons qu'il vient de la BD
    const scenarios = store.scenarios;
    scenarios[0].dbId = 'db-123';
    useCalculateurStore.setState({ scenarios });

    const originalId = useCalculateurStore.getState().activeScenarioId;

    useCalculateurStore.getState().duplicateScenario(originalId);
    const state = useCalculateurStore.getState();

    expect(state.scenarios.length).toBe(2);
    const original = state.scenarios.find((s) => s.id === originalId);
    const duplicate = state.scenarios[state.scenarios.length - 1];
    expect(duplicate?.bien.prix_achat).toBe(original?.bien.prix_achat);
    expect(duplicate?.dbId).toBeUndefined(); // Vérifie que la copie est bien locale
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

// =============================================================================
// Edge cases — branches non couvertes
// =============================================================================
describe('edge cases navigation', () => {
  beforeEach(() => {
    useCalculateurStore.getState().reset();
    localStorage.clear();
  });

  it('setStep ne change rien si step < 0', () => {
    useCalculateurStore.getState().setStep(-1);
    expect(useCalculateurStore.getState().currentStep).toBe(0);
  });

  it('setStep ne change rien si step >= TOTAL_STEPS', () => {
    useCalculateurStore.getState().setStep(99);
    expect(useCalculateurStore.getState().currentStep).toBe(0);
  });

  it('setStep valide met à jour le step', () => {
    useCalculateurStore.getState().setStep(3);
    expect(useCalculateurStore.getState().currentStep).toBe(3);
    expect(useCalculateurStore.getState().getActiveScenario().currentStep).toBe(3);
  });

  it('nextStep ne dépasse pas le dernier step', () => {
    for (let i = 0; i < 10; i++) useCalculateurStore.getState().nextStep();
    expect(useCalculateurStore.getState().currentStep).toBe(5); // TOTAL_STEPS - 1
  });

  it('prevStep ne descend pas en dessous de 0', () => {
    useCalculateurStore.getState().prevStep();
    expect(useCalculateurStore.getState().currentStep).toBe(0);
  });
});

describe('edge cases scénarios', () => {
  beforeEach(() => {
    useCalculateurStore.getState().reset();
    localStorage.clear();
  });

  it('addScenario refuse au-delà de 3', () => {
    useCalculateurStore.getState().addScenario(); // 2
    useCalculateurStore.getState().addScenario(); // 3
    useCalculateurStore.getState().addScenario(); // refusé
    expect(useCalculateurStore.getState().scenarios.length).toBe(3);
  });

  it('duplicateScenario refuse au-delà de 3', () => {
    useCalculateurStore.getState().addScenario();
    useCalculateurStore.getState().addScenario();
    const id = useCalculateurStore.getState().scenarios[0].id;
    useCalculateurStore.getState().duplicateScenario(id); // refusé
    expect(useCalculateurStore.getState().scenarios.length).toBe(3);
  });

  it('duplicateScenario ne fait rien si ID introuvable', () => {
    useCalculateurStore.getState().duplicateScenario('fake-id');
    expect(useCalculateurStore.getState().scenarios.length).toBe(1);
  });

  it('removeScenario ne supprime pas le dernier scénario', () => {
    const id = useCalculateurStore.getState().scenarios[0].id;
    useCalculateurStore.getState().removeScenario(id);
    expect(useCalculateurStore.getState().scenarios.length).toBe(1);
  });

  it('removeScenario du scénario actif bascule vers un autre', () => {
    useCalculateurStore.getState().addScenario();
    const state = useCalculateurStore.getState();
    const activeId = state.activeScenarioId;
    useCalculateurStore.getState().removeScenario(activeId);
    expect(useCalculateurStore.getState().activeScenarioId).not.toBe(activeId);
    expect(useCalculateurStore.getState().scenarios.length).toBe(1);
  });

  it('switchScenario ne fait rien si ID introuvable', () => {
    const before = useCalculateurStore.getState().activeScenarioId;
    useCalculateurStore.getState().switchScenario('fake-id');
    expect(useCalculateurStore.getState().activeScenarioId).toBe(before);
  });

  it('renameScenario change le nom', () => {
    const id = useCalculateurStore.getState().scenarios[0].id;
    useCalculateurStore.getState().renameScenario(id, 'Nouveau nom');
    expect(useCalculateurStore.getState().scenarios[0].name).toBe('Nouveau nom');
  });
});

describe('edge cases résultats et status', () => {
  beforeEach(() => {
    useCalculateurStore.getState().reset();
    localStorage.clear();
  });

  it('setResultats met le status à success', () => {
    const mockResultats = { rentabilite: { brute: 6.5 } } as never;
    useCalculateurStore.getState().setResultats(mockResultats, 'https://pdf.url');
    const state = useCalculateurStore.getState();
    expect(state.status).toBe('success');
    expect(state.getActiveScenario().resultats).toBe(mockResultats);
    expect(state.getActiveScenario().pdfUrl).toBe('https://pdf.url');
  });

  it('setStatus met à jour le status global et du scénario', () => {
    useCalculateurStore.getState().setStatus('loading');
    expect(useCalculateurStore.getState().status).toBe('loading');
    expect(useCalculateurStore.getState().getActiveScenario().status).toBe('loading');
  });

  it('setError avec un message met le status à error', () => {
    useCalculateurStore.getState().setError('Une erreur');
    const state = useCalculateurStore.getState();
    expect(state.error).toBe('Une erreur');
    expect(state.status).toBe('error');
  });

  it('setError avec null remet le status à idle', () => {
    useCalculateurStore.getState().setError('erreur');
    useCalculateurStore.getState().setError(null);
    const state = useCalculateurStore.getState();
    expect(state.error).toBeNull();
    expect(state.status).toBe('idle');
  });
});

describe('resetScenario', () => {
  beforeEach(() => {
    useCalculateurStore.getState().reset();
    localStorage.clear();
  });

  it('réinitialise le scénario actif en gardant son ID', () => {
    const store = useCalculateurStore.getState();
    const id = store.scenarios[0].id;
    store.updateBien({ prix_achat: 500000 });
    store.nextStep();

    useCalculateurStore.getState().resetScenario(id);
    const state = useCalculateurStore.getState();
    expect(state.scenarios[0].id).toBe(id);
    expect(state.scenarios[0].bien.prix_achat).toBeUndefined();
    expect(state.currentStep).toBe(0);
  });

  it('réinitialise un scénario non-actif sans toucher au global', () => {
    useCalculateurStore.getState().addScenario();
    const state = useCalculateurStore.getState();
    const firstId = state.scenarios[0].id;
    // Le scénario actif est le 2e
    expect(state.activeScenarioId).not.toBe(firstId);

    useCalculateurStore.getState().resetScenario(firstId);
    const after = useCalculateurStore.getState();
    // currentStep n'est pas réinitialisé car ce n'est pas le scénario actif
    expect(after.scenarios.find((s) => s.id === firstId)?.bien.type_bien).toBe('appartement');
  });
});

describe('loadScenario', () => {
  beforeEach(() => {
    useCalculateurStore.getState().reset();
    localStorage.clear();
  });

  it('charge une simulation complète', () => {
    const mockSimulation = {
      id: 'sim-123',
      name: 'Ma simulation',
      resultats: { rentabilite: { brute: 7 } } as never,
      form_data: {
        bien: { prix_achat: 200000, type_bien: 'appartement' as const },
        financement: { apport: 40000, taux_interet: 3.0, duree_emprunt: 20 },
        exploitation: { loyer_mensuel: 900 },
        structure: { type: 'nom_propre' as const, tmi: 30, associes: [] },
        options: {
          generer_pdf: true,
          envoyer_email: false,
          email: '',
          horizon_projection: 20,
          taux_evolution_loyer: 2,
          taux_evolution_charges: 2.5,
          taux_agence_revente: 5,
          profil_investisseur: 'rentier' as const,
          ponderation_loyers: 70,
        },
      },
    };

    useCalculateurStore.getState().loadScenario(mockSimulation as never);
    const state = useCalculateurStore.getState();

    expect(state.scenarios.length).toBe(1);
    expect(state.scenarios[0].id).toBe('sim-123');
    expect(state.scenarios[0].dbId).toBe('sim-123'); // Vérifie l'assignation du dbId
    expect(state.scenarios[0].name).toBe('Ma simulation');
    expect(state.scenarios[0].bien.prix_achat).toBe(200000);
    expect(state.activeScenarioId).toBe('sim-123');
    expect(state.currentStep).toBe(5); // TOTAL_STEPS - 1
    expect(state.status).toBe('success');
  });
});

describe('update methods', () => {
  beforeEach(() => {
    useCalculateurStore.getState().reset();
    localStorage.clear();
  });

  it('updateFinancement met à jour les données', () => {
    useCalculateurStore.getState().updateFinancement({ taux_interet: 4.5 });
    expect(useCalculateurStore.getState().getActiveScenario().financement.taux_interet).toBe(4.5);
  });

  it('updateExploitation met à jour les données', () => {
    useCalculateurStore.getState().updateExploitation({ loyer_mensuel: 800 });
    expect(useCalculateurStore.getState().getActiveScenario().exploitation.loyer_mensuel).toBe(800);
  });

  it('updateOptions met à jour les données', () => {
    useCalculateurStore.getState().updateOptions({ envoyer_email: true, email: 'test@test.com' });
    const opts = useCalculateurStore.getState().getActiveScenario().options;
    expect(opts.envoyer_email).toBe(true);
    expect(opts.email).toBe('test@test.com');
  });

  it('getFormData retourne toutes les sections', () => {
    useCalculateurStore.getState().updateBien({ prix_achat: 300000 });
    useCalculateurStore.getState().updateFinancement({ apport: 50000 });
    const formData = useCalculateurStore.getState().getFormData();
    expect(formData.bien.prix_achat).toBe(300000);
    expect(formData.financement.apport).toBe(50000);
    expect(formData.exploitation).toBeDefined();
    expect(formData.structure).toBeDefined();
    expect(formData.options).toBeDefined();
  });
});
