/**
 * UX-BE02 — Tests unitaires : usePreviewKPIs
 *
 * Pattern : mock du store Zustand + mock de React.useMemo (exécution directe)
 * pour tester le hook en environnement Vitest (Node, sans DOM).
 */

import { describe, it, expect, vi } from 'vitest';

// Mock React.useMemo pour exécuter la callback immédiatement
vi.mock('react', () => ({
  useMemo: (fn: () => unknown) => fn(),
}));

// Mock computePreviewKPIs pour isoler le hook
vi.mock('@/lib/calculateur-preview', () => ({
  computePreviewKPIs: vi.fn(),
}));

// Mock du store Zustand
vi.mock('@/stores/calculateur.store', () => ({
  useCalculateurStore: vi.fn(),
}));

import { usePreviewKPIs } from '@/hooks/usePreviewKPIs';
import { computePreviewKPIs } from '@/lib/calculateur-preview';
import { useCalculateurStore } from '@/stores/calculateur.store';

const mockedComputePreviewKPIs = vi.mocked(computePreviewKPIs);
const mockedUseCalculateurStore = vi.mocked(useCalculateurStore);

// Données de test
const BIEN_TEST = {
  prix_achat: 150_000,
  montant_travaux: 5_000,
  type_bien: 'appartement' as const,
  etat_bien: 'ancien' as const,
  valeur_mobilier: 0,
  adresse: '',
};
const FINANCEMENT_TEST = {
  apport: 20_000,
  taux_interet: 3.0,
  duree_emprunt: 15,
  assurance_pret: 0.2,
  frais_dossier: 500,
  frais_garantie: 1_000,
};
const EXPLOITATION_TEST = {
  loyer_mensuel: 700,
  charges_copro: 600,
  taxe_fonciere: 800,
  assurance_pno: 120,
  gestion_locative: 0,
  provision_travaux: 0,
  provision_vacance: 5,
  type_location: 'meublee_longue_duree' as const,
  charges_copro_recuperables: 0,
  assurance_gli: 0,
  cfe_estimee: 0,
  comptable_annuel: 0,
};

const MOCK_KPIS = {
  rendementBrut: 5.2,
  mensualiteEstimee: 987.43,
  investissementTotal: 162_000,
  cashflowMensuelEstime: -427.43,
  taegApprox: 3.15,
  coutTotalCreditEstime: 34_937.4,
  isPartiel: true as const,
};

/**
 * Helper pour configurer le mock du store.
 * Simule le comportement de `useCalculateurStore(selector)`.
 */
function setupStoreMock(
  bien = BIEN_TEST,
  financement = FINANCEMENT_TEST,
  exploitation = EXPLOITATION_TEST
) {
  const scenario = { bien, financement, exploitation };
  mockedUseCalculateurStore.mockImplementation((selector) => {
    const fakeState = {
      getActiveScenario: () => scenario,
    };
    return (selector as (state: unknown) => unknown)(fakeState);
  });
}

describe('usePreviewKPIs', () => {
  it('appelle computePreviewKPIs avec les données du scénario actif', () => {
    setupStoreMock();
    mockedComputePreviewKPIs.mockReturnValue(MOCK_KPIS);

    const result = usePreviewKPIs();

    expect(mockedComputePreviewKPIs).toHaveBeenCalledWith(
      BIEN_TEST,
      FINANCEMENT_TEST,
      EXPLOITATION_TEST
    );
    expect(result).toEqual(MOCK_KPIS);
  });

  it('retourne les KPIs calculés avec isPartiel = true', () => {
    setupStoreMock();
    mockedComputePreviewKPIs.mockReturnValue(MOCK_KPIS);

    const result = usePreviewKPIs();

    expect(result.isPartiel).toBe(true);
    expect(result.rendementBrut).toBe(5.2);
    expect(result.mensualiteEstimee).toBe(987.43);
  });

  it('retourne les KPIs avec nulls si bien absent', () => {
    setupStoreMock({} as typeof BIEN_TEST);
    const kpisAvecNulls = { ...MOCK_KPIS, rendementBrut: null, investissementTotal: null };
    mockedComputePreviewKPIs.mockReturnValue(kpisAvecNulls);

    const result = usePreviewKPIs();

    expect(result.rendementBrut).toBeNull();
    expect(result.investissementTotal).toBeNull();
    expect(result.isPartiel).toBe(true);
  });

  it('retourne le bon type — objet PreviewKPIs avec tous les champs attendus', () => {
    setupStoreMock();
    mockedComputePreviewKPIs.mockReturnValue(MOCK_KPIS);

    const result = usePreviewKPIs();

    expect(result).toHaveProperty('rendementBrut');
    expect(result).toHaveProperty('mensualiteEstimee');
    expect(result).toHaveProperty('investissementTotal');
    expect(result).toHaveProperty('cashflowMensuelEstime');
    expect(result).toHaveProperty('taegApprox');
    expect(result).toHaveProperty('coutTotalCreditEstime');
    expect(result).toHaveProperty('isPartiel');
  });
});
