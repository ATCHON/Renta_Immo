// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// Mock zodResolver pour isoler la logique de soumission du formulaire
// de la validation Zod (qui ne fonctionne pas fiablement en jsdom)
vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => async (data: unknown) => ({ values: data, errors: {} }),
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
          prix_achat: 100000,
          surface: 50,
          dpe: 'C',
          adresse: '10 rue test',
          etat_bien: 'ancien',
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

  it('permet de sélectionner le type_bien via les cards (S6)', async () => {
    const user = userEvent.setup();
    render(<StepBien onNext={mockOnNext} />);

    const maisonButton = screen.getByRole('button', { name: /Maison/i });
    const appartButton = screen.getByRole('button', { name: /Appartement/i });

    // Appartement est actif par défaut (defaultValues)
    expect(Array.from(appartButton.classList)).toContain('bg-primary');
    expect(Array.from(maisonButton.classList)).not.toContain('bg-primary');

    // Clic sur Maison
    await user.click(maisonButton);
    expect(Array.from(maisonButton.classList)).toContain('bg-primary');
    expect(Array.from(appartButton.classList)).not.toContain('bg-primary');

    // Clic sur Immeuble
    const immeubleButton = screen.getByRole('button', { name: /Immeuble/i });
    await user.click(immeubleButton);
    expect(Array.from(immeubleButton.classList)).toContain('bg-primary');
    expect(Array.from(maisonButton.classList)).not.toContain('bg-primary');
  });

  it("permet de sélectionner l'etat_bien via les boutons", async () => {
    const user = userEvent.setup();
    render(<StepBien onNext={mockOnNext} />);

    const ancienButton = screen.getByRole('button', { name: /Ancien/i });
    const neufButton = screen.getByRole('button', { name: /Neuf \(VEFA\)/i });

    // Ancien est actif par défaut
    expect(Array.from(ancienButton.classList)).toContain('bg-primary');
    expect(Array.from(neufButton.classList)).not.toContain('bg-primary');

    // Clic sur Neuf (VEFA)
    await user.click(neufButton);
    expect(Array.from(neufButton.classList)).toContain('bg-primary');
    expect(Array.from(ancienButton.classList)).not.toContain('bg-primary');
  });

  it('soumet le formulaire et appelle updateBien puis onNext', async () => {
    const user = userEvent.setup();
    render(<StepBien onNext={mockOnNext} />);

    await user.click(screen.getByRole('button', { name: /Continuer/i }));

    await waitFor(() => {
      // updateBien peut être appelé plusieurs fois : via le watch de preview
      // ET via onSubmit. On vérifie qu'il a été appelé au moins une fois.
      expect(mockUpdateBien).toHaveBeenCalled();
    });
    expect(mockUpdateBien).toHaveBeenCalledWith(
      expect.objectContaining({
        type_bien: 'appartement',
      })
    );
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it("appelle updateBien lors du changement d'un champ (mise à jour preview)", async () => {
    const user = userEvent.setup();
    render(<StepBien onNext={mockOnNext} />);
    vi.clearAllMocks();

    // Simuler un changement d'état via le bouton Maison
    const maisonButton = screen.getByRole('button', { name: /Maison/i });
    await user.click(maisonButton);

    await waitFor(() => {
      // La subscription watch doit avoir déclenché updateBien
      expect(mockUpdateBien).toHaveBeenCalled();
    });
  });
});
