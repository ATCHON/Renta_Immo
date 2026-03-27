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

describe('StepStructure — UX Migration (S15, S16, S17)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCalculateurStore).mockReturnValue({
      getActiveScenario: () => ({
        structure: {
          regime_fiscal: 'LMNP_MICRO',
        },
      }),
      updateStructure: vi.fn(),
      activeScenarioId: '1',
    } as any);
  });

  it('affiche les badges familles (S16) et grid (S15)', () => {
    render(<StepStructure onNext={mockOnSubmit} onPrev={mockOnPrev} />);
    expect(screen.getByText('BEST FOR CASHFLOW')).toBeDefined();
    expect(screen.getByText('STANDARD APPROACH')).toBeDefined();
    expect(screen.getByText('LEGACY BUILDING')).toBeDefined();

    // Check main families
    expect(screen.getByText('LMNP')).toBeDefined();
    expect(screen.getByText('Revenus Fonciers')).toBeDefined();
    expect(screen.getByText("SCI à l'IS")).toBeDefined();
  });
});
