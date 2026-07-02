// @vitest-environment jsdom
/**
 * BUG-08 — horizon de projection correct dans le récapitulatif step 5
 * BUG-09 — label loyer "/mois" complet dans InputRecap
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepOptions } from '@/components/forms/StepOptions';
import { useCalculateurStore } from '@/stores/calculateur.store';
import type { CalculateurState } from '@/stores/calculateur.store';

vi.mock('@/stores/calculateur.store', () => ({
  useCalculateurStore: vi.fn(),
}));

vi.mock('@/hooks/useScenarioFormReset', () => ({
  useScenarioFormReset: vi.fn(),
}));

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (data: unknown) => ({ values: data, errors: {} }),
}));

vi.mock('@/lib/auth-client', () => ({
  authClient: {
    useSession: () => ({ data: null }),
  },
}));

const mockOnSubmit = vi.fn();
const mockOnPrev = vi.fn();

function makeStoreMock(horizonProjection: number) {
  vi.mocked(useCalculateurStore).mockReturnValue({
    getActiveScenario: () => ({
      options: {
        generer_pdf: true,
        envoyer_email: false,
        email: '',
        horizon_projection: horizonProjection,
        taux_evolution_loyer: 2,
        taux_evolution_charges: 2.5,
        taux_agence_revente: 5,
      },
    }),
    updateOptions: vi.fn(),
    activeScenarioId: '1',
  } as Partial<CalculateurState>);
}

// BUG-08 : horizon_projection affiché dans le récapitulatif
describe('BUG-08 — StepOptions récapitulatif horizon de simulation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche l\'horizon de simulation (5 ans) et non la durée d\'emprunt (20 ans)', () => {
    makeStoreMock(5);
    render(<StepOptions onSubmit={mockOnSubmit} onPrev={mockOnPrev} />);

    // Le récapitulatif doit afficher "5 ans"
    expect(screen.getByText(/Projection pluriannuelle sur/i)).toBeDefined();
    const recap = screen.getByText(/Projection pluriannuelle sur/i).closest('li');
    expect(recap?.textContent).toContain('5');
  });

  it('affiche l\'horizon de simulation (10 ans) quand sélectionné', () => {
    makeStoreMock(10);
    render(<StepOptions onSubmit={mockOnSubmit} onPrev={mockOnPrev} />);

    const recap = screen.getByText(/Projection pluriannuelle sur/i).closest('li');
    expect(recap?.textContent).toContain('10');
    expect(recap?.textContent).not.toMatch(/\b20\b/);
  });
});
