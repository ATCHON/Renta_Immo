// @vitest-environment jsdom
/**
 * UX-S02a — Tests unitaires : ResultsAnchor
 *
 * Vérifie :
 * - Affichage correct des KPIs selon le step
 * - Valeurs null → tiret em « — »
 * - Préfixe « ~ » sur les valeurs numériques
 * - Bouton PDF désactivé quand pas de résultats
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { PreviewKPIs } from '@/types/calculateur';
// Mocks des dépendances
vi.mock('@/hooks/usePreviewKPIs', () => ({
  usePreviewKPIs: vi.fn(),
}));

vi.mock('@/stores/calculateur.store', () => ({
  useCalculateurStore: vi.fn(),
}));

vi.mock('@/components/results/DownloadPdfButton', () => ({
  DownloadPdfButton: () => <button>Télécharger PDF</button>,
}));

import { ResultsAnchor } from '@/components/layout/ResultsAnchor';
import { usePreviewKPIs } from '@/hooks/usePreviewKPIs';
import { useCalculateurStore } from '@/stores/calculateur.store';

const mockedUsePreviewKPIs = vi.mocked(usePreviewKPIs);
const mockedUseCalculateurStore = vi.mocked(useCalculateurStore);

const KPI_NULL: PreviewKPIs = {
  rendementBrut: null,
  mensualiteEstimee: null,
  investissementTotal: null,
  cashflowMensuelEstime: null,
  taegApprox: null,
  coutTotalCreditEstime: null,
  isPartiel: true,
};

const KPI_POPULATED: PreviewKPIs = {
  rendementBrut: 5.2,
  mensualiteEstimee: 987,
  investissementTotal: 220000,
  cashflowMensuelEstime: -120,
  taegApprox: 4.23,
  coutTotalCreditEstime: 48500,
  isPartiel: true,
};

function mockStore(hasResults = false) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockedUseCalculateurStore.mockImplementation((selector: (s: any) => unknown) => {
    return selector({
      getActiveScenario: () => ({
        resultats: hasResults ? {} : null,
        bien: { prix_achat: 200000, surface: 50, montant_travaux: 0 },
        financement: { apport: 30000, taux_interet: 3.5, duree_emprunt: 20 },
        exploitation: { loyer_mensuel: 1000, charges_copro: 1200, taxe_fonciere: 800 },
        structure: {
          revenus_activite: 3000,
          credits_immobiliers: 0,
          loyers_actuels: 0,
          autres_charges: 0,
        },
      }),
      getFormData: () => ({}),
    });
  });
}

describe('ResultsAnchor — valeurs null', () => {
  beforeEach(() => {
    mockedUsePreviewKPIs.mockReturnValue(KPI_NULL);
    mockStore(false);
  });

  it('affiche au moins un tiret em pour rendementBrut null (step 1)', () => {
    render(<ResultsAnchor currentStep={1} />);
    const dashes = screen.getAllByText('—');
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it('affiche le tiret em dans la zone TAEG pour taegApprox null (step 2)', () => {
    render(<ResultsAnchor currentStep={2} />);
    const taegLabel = screen.getByText(/taeg/i);
    // Le tiret em doit être présent dans le voisinage du label TAEG
    const container = taegLabel.closest('div[class*="rounded"]') ?? taegLabel.parentElement;
    expect(within(container as HTMLElement).getByText('—')).toBeDefined();
  });
});

describe('ResultsAnchor — valeurs populées', () => {
  beforeEach(() => {
    mockedUsePreviewKPIs.mockReturnValue(KPI_POPULATED);
    mockStore(false);
  });

  it("affiche le prix au m² à l'étape 1 (200000 / 50 = 4000 €/m²)", () => {
    render(<ResultsAnchor currentStep={1} />);
    // Prix au m² = 200000 / 50 = 4000 €/m²
    expect(document.body.textContent).toMatch(/4\s*000\s*€\/m²/);
  });

  it("affiche l'état de fallback sans surface à l'étape 1", () => {
    // Mock store sans surface pour tester l'état de fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockedUseCalculateurStore.mockImplementation((selector: (s: any) => unknown) => {
      return selector({
        getActiveScenario: () => ({
          resultats: null,
          bien: { prix_achat: 200000, surface: undefined, montant_travaux: 0 },
          financement: { apport: 30000, taux_interet: 3.5, duree_emprunt: 20 },
          exploitation: { loyer_mensuel: 1000, charges_copro: 1200, taxe_fonciere: 800 },
          structure: {
            revenus_activite: 3000,
            credits_immobiliers: 0,
            loyers_actuels: 0,
            autres_charges: 0,
          },
        }),
        getFormData: () => ({}),
      });
    });

    render(<ResultsAnchor currentStep={1} />);

    // Pas de prix au m² calculé
    expect(document.body.textContent).not.toMatch(/€\/m²/);
    // Message d'aide affiché
    expect(document.body.textContent).toMatch(/Renseignez la surface pour calculer/i);
  });

  it('affiche la mensualité avec ~ (step 2)', () => {
    render(<ResultsAnchor currentStep={2} />);
    expect(document.body.textContent).toMatch(/~987\s*€|~1\s*k€/);
  });

  it('affiche le TAEG avec ~ (step 2)', () => {
    render(<ResultsAnchor currentStep={2} />);
    expect(document.body.textContent).toMatch(/~4[,.]2\d*\s*%/);
  });

  it('affiche la barre de progression de step (5 segments)', () => {
    render(<ResultsAnchor currentStep={3} />);
    // Les 5 segments de progression (divs avec aria-label contenant "Étape")
    const segments = screen
      .getAllByRole('generic')
      .filter((el) => el.getAttribute('aria-label')?.startsWith('Étape'));
    expect(segments.length).toBe(5);
  });
});

describe('ResultsAnchor — bouton PDF', () => {
  beforeEach(() => {
    mockedUsePreviewKPIs.mockReturnValue(KPI_POPULATED);
  });

  it('bouton PDF désactivé quand pas de résultats', () => {
    mockStore(false);
    render(<ResultsAnchor currentStep={1} />);
    const btn = screen.getByRole('button', { name: /télécharger/i });
    expect(btn).toBeDefined();
    expect(btn.hasAttribute('disabled')).toBe(true);
  });

  it('bouton PDF actif quand résultats disponibles', () => {
    mockStore(true);
    render(<ResultsAnchor currentStep={1} />);
    // DownloadPdfButton est rendu (pas le bouton disabled)
    const btn = screen.getByRole('button', { name: /télécharger pdf/i });
    expect(btn.hasAttribute('disabled')).toBe(false);
  });
});

describe('ResultsAnchor — Step 4 taux endettement HCSF', () => {
  beforeEach(() => {
    // kpis.mensualiteEstimee = 987 €
    // structure: revenus_activite=3000, loyers_actuels=0, credits_immo=0, autres_charges=0
    // exploitation: loyer_mensuel=1000
    // Revenus pondérés = 3000 + 1000×0.7 + 0 = 3700 €
    // Charges = 987 + 0 + 0 = 987 €
    // Taux = 987 / 3700 × 100 ≈ 26.7 %
    mockedUsePreviewKPIs.mockReturnValue(KPI_POPULATED);
    mockStore(false);
  });

  it('affiche le taux endettement HCSF avec la nouvelle formule (step 4)', () => {
    render(<ResultsAnchor currentStep={4} />);
    // Le taux ≈ 26.7 % → doit être dans la page (avec ~), on tolère un affichage arrondi à 27 %
    expect(document.body.textContent).toMatch(/~?\s*27\s*%/);
  });

  it('affiche le label Charges / Revenus pondérés (step 4)', () => {
    render(<ResultsAnchor currentStep={4} />);
    expect(screen.getByText(/Charges \/ Revenus pondérés/i)).toBeDefined();
  });
});

describe('ResultsAnchor — Step 5 synthèse enrichie', () => {
  beforeEach(() => {
    mockedUsePreviewKPIs.mockReturnValue(KPI_POPULATED);
    mockStore(false);
  });

  it('affiche la mensualité estimée dans la synthèse (step 5)', () => {
    render(<ResultsAnchor currentStep={5} />);
    expect(screen.getByText(/Mensualité estimée/i)).toBeDefined();
  });

  it("affiche le badge Effort d'épargne quand cashflow négatif (step 5)", () => {
    render(<ResultsAnchor currentStep={5} />);
    // KPI_POPULATED.cashflowMensuelEstime = -120
    expect(document.body.textContent).toMatch(/Effort d.épargne/i);
  });

  it('affiche le badge Autofinancé quand cashflow positif (step 5)', () => {
    mockedUsePreviewKPIs.mockReturnValue({
      ...KPI_POPULATED,
      cashflowMensuelEstime: 120,
    });

    render(<ResultsAnchor currentStep={5} />);

    expect(document.body.textContent).toMatch(/Autofinancé/i);
    expect(document.body.textContent).not.toMatch(/Effort d.épargne/i);
  });

  it("n'affiche pas le graphique décoratif (step 5)", () => {
    render(<ResultsAnchor currentStep={5} />);
    // Les anciennes barres avaient style={{ height: '35%' }} — ne doivent plus exister
    const barredDivs = document.querySelectorAll('[style*="height: 35%"]');
    expect(barredDivs.length).toBe(0);
  });
});

describe('ResultsAnchor — mode compact', () => {
  beforeEach(() => {
    mockedUsePreviewKPIs.mockReturnValue(KPI_POPULATED);
    mockStore(false);
  });

  it('affiche le résumé compact sur mobile', () => {
    render(<ResultsAnchor currentStep={1} compact />);
    // En mode compact, pas de titre "Calculs en direct"
    expect(screen.queryByText('Calculs en direct')).toBeNull();
  });
});
