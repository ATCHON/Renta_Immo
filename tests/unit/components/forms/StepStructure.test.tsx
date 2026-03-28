// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepStructure } from '@/components/forms/StepStructure';
import { useCalculateurStore } from '@/stores/calculateur.store';

vi.mock('@/stores/calculateur.store', () => ({
  useCalculateurStore: vi.fn(),
}));

vi.mock('@/hooks/useScenarioFormReset', () => ({
  useScenarioFormReset: vi.fn(),
}));

// Setup simple ResizeObserver mock
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

global.DOMRect = class {
  bottom = 0;
  left = 0;
  right = 0;
  top = 0;
  constructor(
    public x = 0,
    public y = 0,
    public width = 0,
    public height = 0
  ) {}
  toJSON() {
    return this;
  }
} as any;

const mockOnSubmit = vi.fn();
const mockOnPrev = vi.fn();

describe('StepStructure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCalculateurStore).mockReturnValue({
      getActiveScenario: () => ({
        structure: {
          regime_fiscal: 'lmnp_micro',
        },
      }),
      updateStructure: vi.fn(),
      activeScenarioId: '1',
    } as any);
  });

  it('affiche le titre et les options de structure', () => {
    render(<StepStructure onNext={mockOnSubmit} onPrev={mockOnPrev} />);
    expect(screen.getByText('Structure juridique')).toBeDefined();
    expect(screen.getByText('Nom propre')).toBeDefined();
    expect(screen.getByText("SCI à l'IS")).toBeDefined();
  });

  it('affiche les boutons de navigation', () => {
    render(<StepStructure onNext={mockOnSubmit} onPrev={mockOnPrev} />);
    expect(screen.getByRole('button', { name: /Retour/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /Continuer/i })).toBeDefined();
  });

  it('affiche les options de type exploitation pour nom propre', () => {
    render(<StepStructure onNext={mockOnSubmit} onPrev={mockOnPrev} />);
    // nom_propre is selected by default
    expect(screen.getByText('Location Nue')).toBeDefined();
    expect(screen.getByText('Location Meublée (LMNP)')).toBeDefined();
  });
});
