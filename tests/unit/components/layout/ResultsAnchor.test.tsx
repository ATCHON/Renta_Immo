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
import { render, screen } from '@testing-library/react';
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
      getActiveScenario: () => ({ resultats: hasResults ? {} : null }),
      getFormData: () => ({}),
    });
  });
}

describe('ResultsAnchor — valeurs null', () => {
  beforeEach(() => {
    mockedUsePreviewKPIs.mockReturnValue(KPI_NULL);
    mockStore(false);
  });

  it('affiche le tiret em pour rendementBrut null (step 1)', () => {
    render(<ResultsAnchor currentStep={1} />);
    // Should find "—" somewhere in the KPI area
    expect(document.body.textContent).toContain('—');
  });

  it('affiche le tiret em pour taegApprox null (step 2)', () => {
    render(<ResultsAnchor currentStep={2} />);
    expect(document.body.textContent).toContain('—');
  });
});

describe('ResultsAnchor — valeurs populées', () => {
  beforeEach(() => {
    mockedUsePreviewKPIs.mockReturnValue(KPI_POPULATED);
    mockStore(false);
  });

  it('affiche le préfixe ~ pour rendement brut (step 1)', () => {
    render(<ResultsAnchor currentStep={1} />);
    expect(document.body.textContent).toMatch(/~5[,.]2\s*%/);
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
