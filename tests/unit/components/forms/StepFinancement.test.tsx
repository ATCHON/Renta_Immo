// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepFinancement } from '@/components/forms/StepFinancement';
import { useCalculateurStore } from '@/stores/calculateur.store';

vi.mock('@/stores/calculateur.store', () => ({
  useCalculateurStore: vi.fn(),
}));

vi.mock('@/hooks/useScenarioFormReset', () => ({
  useScenarioFormReset: vi.fn(),
}));

const mockOnNext = vi.fn();
const mockOnPrev = vi.fn();

describe('StepFinancement — UX Migration (S4, S7, S8, S9, S11, S12)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCalculateurStore).mockReturnValue({
      getActiveScenario: () => ({
        bien: {
          prix_achat: 200000,
          prix: 200000,
        },
        financement: {
          apport: 10000,
          duree_emprunt: 20,
          taux_interet: 3.5,
          taux_assurance: 0.3,
        },
        options: { ponderation_loyers: 70 },
      }),
      updateFinancement: vi.fn(),
      activeScenarioId: '1',
    } as any);
  });

  it('affiche le badge STEP 02 (S4) et le header de stratégie (S7)', () => {
    render(<StepFinancement onNext={mockOnNext} onPrev={mockOnPrev} />);
    expect(screen.getByText('STEP 02')).toBeDefined();
    expect(screen.getByText(/Affinez votre stratégie/i)).toBeDefined();
  });

  it('affiche le badge section 2 (S9)', () => {
    render(<StepFinancement onNext={mockOnNext} onPrev={mockOnPrev} />);
    // Le badge est rendu sous forme de div contenant "2" près de "Détails du financement"
    expect(screen.getByText('2')).toBeDefined();
    expect(screen.getByText(/Détails du financement/i)).toBeDefined();
  });

  it("affiche l'incitation au pro-tip (S12) et suggestions (S11)", () => {
    render(<StepFinancement onNext={mockOnNext} onPrev={mockOnPrev} />);
    expect(screen.getByText(/Levier vs\. Apport/i)).toBeDefined(); // Pro tip
    expect(screen.getByText(/Recommandé/i)).toBeDefined(); // S11 hints
  });
});
