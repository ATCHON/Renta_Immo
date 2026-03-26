// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepBien } from '@/components/forms/StepBien';
import { useCalculateurStore } from '@/stores/calculateur.store';

vi.mock('@/stores/calculateur.store', () => ({
  useCalculateurStore: vi.fn(),
  useScenarioFormReset: vi.fn(),
}));

vi.mock('@/hooks/useScenarioFormReset', () => ({
  useScenarioFormReset: vi.fn(),
}));

const mockUpdateBien = vi.fn();
const mockOnNext = vi.fn();

describe('StepBien — UX Migration (S4, S5, S6)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCalculateurStore).mockReturnValue({
      getActiveScenario: () => ({
        bien: {
          type_bien: 'appartement',
          prix: 100000,
          surface: 50,
          dpe: 'C',
          adresse: '10 rue test',
          nom_projet: 'Test',
        },
      }),
      updateBien: mockUpdateBien,
      activeScenarioId: '1',
    } as any);
  });

  it('affiche le titre', () => {
    render(<StepBien onNext={mockOnNext} />);
    expect(screen.getByText(/Informations du bien/i)).toBeDefined();
  });

  it('affiche les cards radio pour le type_bien (S6)', () => {
    render(<StepBien onNext={mockOnNext} />);
    const apptCard = screen.getAllByText(/Appartement/i)[0];
    const maisonCard = screen.getAllByText(/Maison/i)[0];
    const immeubleCard = screen.getAllByText(/Immeuble/i)[0];

    expect(apptCard).toBeDefined();
    expect(maisonCard).toBeDefined();
    expect(immeubleCard).toBeDefined();
  });
});
