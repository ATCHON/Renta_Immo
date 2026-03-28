// @vitest-environment jsdom
/**
 * UX-S03 — Tests unitaires : Dashboard (4 tabs)
 *
 * Verifie :
 * - Tab "Analyse" actif par defaut
 * - Passage a l'onglet "Projections" via clic
 * - Stubs pour "Comparaison" et "Avance"
 * - Breadcrumb "Modifier la saisie" appelle router.push
 * - Rendu du message "Aucun resultat" sans resultats
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mocks des modules Next.js ──
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mockPush }) }));
vi.mock('next/dynamic', () => ({
  default: () =>
    function DynamicStub() {
      return <div data-testid="chart-stub">Chart</div>;
    },
}));
vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// ── Mocks des hooks ──
vi.mock('@/hooks/useHasHydrated', () => ({ useHasHydrated: () => true }));
vi.mock('@/hooks/useChartData', () => ({
  useChartData: () => ({
    cashflowData: [],
    patrimoineData: [],
    breakEvenYear: null,
    loanEndYear: null,
  }),
}));
vi.mock('@/stores/calculateur.store', () => ({
  useCalculateurStore: vi.fn(),
}));

// ── Mocks des sous-composants resultats ──
vi.mock('@/components/results/', () => ({
  InvestmentBreakdown: () => <div data-testid="investment-breakdown">InvestmentBreakdown</div>,
  OperationalBalance: () => <div data-testid="operational-balance">OperationalBalance</div>,
  FiscalComparator: () => <div data-testid="fiscal-comparator">FiscalComparator</div>,
  ScenarioTabs: () => <div data-testid="scenario-tabs">ScenarioTabs</div>,
  DashboardFloatingFooter: () => <div data-testid="floating-footer">Footer</div>,
  ScorePanel: () => <div data-testid="score-panel">ScorePanel</div>,
  InputRecap: () => <div data-testid="input-recap">InputRecap</div>,
  PointsAttention: () => <div data-testid="points-attention">PointsAttention</div>,
  RecommandationsPanel: () => <div data-testid="recommandations-panel">Recommandations</div>,
  ProfilInvestisseurToggle: () => <div data-testid="profil-toggle">ProfilToggle</div>,
}));
vi.mock('@/components/results/HCSFIndicator', () => ({
  HCSFIndicator: () => <div data-testid="hcsf-indicator">HCSF</div>,
}));
vi.mock('@/components/results/ProjectionTable', () => ({
  ProjectionTable: () => <div data-testid="projection-table">ProjectionTable</div>,
}));
vi.mock('@/components/results/AmortizationTable', () => ({
  AmortizationTable: () => <div data-testid="amortization-table">AmortizationTable</div>,
}));
vi.mock('@/components/results/FiscalAmortizationTable', () => ({
  FiscalAmortizationTable: () => (
    <div data-testid="fiscal-amortization-table">FiscalAmortizationTable</div>
  ),
}));
vi.mock('@/components/results/MetricCard', () => ({
  MetricCard: ({ label, value }: { label: string; value: string }) => (
    <div data-testid={`metric-${label.toLowerCase().replace(/\W+/g, '-')}`}>
      {label}: {value}
    </div>
  ),
}));
vi.mock('@/components/simulations/SaveSimulationButton', () => ({
  SaveSimulationButton: () => <button>Sauvegarder</button>,
}));

import { Dashboard } from '@/components/results/Dashboard';
import { useCalculateurStore } from '@/stores/calculateur.store';

const mockedUseCalculateurStore = vi.mocked(useCalculateurStore);

// ── Fixture resultats minimal ──
const MOCK_RESULTATS = {
  cashflow: { mensuel: 120 },
  rentabilite: { brute: 5.5, nette_nette: 4.2, loyer_annuel: 9600, effet_levier: true },
  fiscalite: { impot_estime: 0 },
  financement: {
    montant_emprunt: 180000,
    mensualite: 900,
    cout_total_credit: 40000,
  },
  synthese: {
    score_global: 72,
    evaluation: 'Bon',
    couleur: 'blue',
    score_detail: {},
    scores_par_profil: null,
    points_attention: [],
    points_attention_detail: [],
    recommandations_detail: [],
  },
  hcsf: { conforme: true, taux_endettement: 30 },
  comparaisonFiscalite: null,
  projections: null,
  tableauAmortissement: null,
  tableauAmortissementFiscal: null,
};

function mockStore(resultats: typeof MOCK_RESULTATS | null = MOCK_RESULTATS) {
  const storeObj = {
    getActiveScenario: () => ({
      resultats,
      bien: { adresse: '10 rue de la Paix', dpe: 'C' },
      financement: {},
      exploitation: {},
      structure: {},
      options: { profil_investisseur: 'rentier' },
      description: '',
    }),
    setStatus: vi.fn(),
  };
  // Dashboard appelle useCalculateurStore() sans sélecteur → retourner le store complet
  // Les autres composants appellent avec un sélecteur → appliquer le sélecteur
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedUseCalculateurStore.mockImplementation((selector?: (s: any) => unknown) => {
    if (typeof selector === 'function') return selector(storeObj);
    return storeObj;
  });
}

describe('Dashboard — etat sans resultats', () => {
  beforeEach(() => mockStore(null));

  it('affiche le message Aucun resultat disponible', () => {
    render(<Dashboard />);
    expect(screen.getByText(/aucun r.sultat disponible/i)).toBeDefined();
  });

  it('affiche un lien vers /calculateur', () => {
    render(<Dashboard />);
    const link = screen.getByRole('link', { name: /commencer un calcul/i });
    expect(link.getAttribute('href')).toBe('/calculateur');
  });
});

describe('Dashboard — tab Analyse (defaut)', () => {
  beforeEach(() => mockStore());

  it("affiche l'onglet Analyse dans la tab bar", () => {
    render(<Dashboard />);
    const analyseTab = screen.getByRole('button', { name: /analyse/i });
    expect(analyseTab).toBeDefined();
  });

  it("affiche l'adresse dans le header", () => {
    render(<Dashboard />);
    expect(screen.getByText('10 rue de la Paix')).toBeDefined();
  });

  it('affiche le ScorePanel et InputRecap dans Analyse', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('score-panel')).toBeDefined();
    expect(screen.getByTestId('input-recap')).toBeDefined();
  });

  it('affiche le DashboardFloatingFooter', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('floating-footer')).toBeDefined();
  });

  it('affiche les MetricCards dans Analyse', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('metric-renta-brute')).toBeDefined();
  });

  it('affiche le HCSF indicator dans Analyse', () => {
    render(<Dashboard />);
    expect(screen.getByTestId('hcsf-indicator')).toBeDefined();
  });
});

describe('Dashboard — navigation par tabs', () => {
  beforeEach(() => mockStore());

  it('affiche les 4 onglets dans la tab bar', () => {
    render(<Dashboard />);
    expect(screen.getByRole('button', { name: /analyse/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /projections/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /comparaison/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /avanc/i })).toBeDefined();
  });

  it('passer sur Projections masque InputRecap', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /projections/i }));
    expect(screen.queryByTestId('input-recap')).toBeNull();
  });

  it('onglet Comparaison affiche le message Prochainement', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /comparaison/i }));
    expect(screen.getByText(/prochainement/i)).toBeDefined();
  });

  it('onglet Avance affiche le message Prochainement', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /avanc/i }));
    expect(screen.getByText(/prochainement/i)).toBeDefined();
  });

  it('retour sur Analyse apres Comparaison affiche a nouveau InputRecap', () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /comparaison/i }));
    fireEvent.click(screen.getByRole('button', { name: /analyse/i }));
    expect(screen.getByTestId('input-recap')).toBeDefined();
  });
});

describe('Dashboard — action Modifier la saisie', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockStore();
  });

  it('appelle router.push vers /calculateur', () => {
    render(<Dashboard />);
    const btn = screen.getByRole('button', { name: /modifier la saisie/i });
    fireEvent.click(btn);
    expect(mockPush).toHaveBeenCalledWith('/calculateur');
  });
});
