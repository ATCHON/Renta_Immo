// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepFinancement } from '@/components/forms/StepFinancement';
import { useCalculateurStore } from '@/stores/calculateur.store';
import type { CalculateurState } from '@/stores/calculateur.store';

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
    } as Partial<CalculateurState>);
  });

  it('affiche le header contextuel de stratégie (S7) — sans badge STEP', () => {
    render(<StepFinancement onNext={mockOnNext} onPrev={mockOnPrev} />);
    // Le header h2 est rendu directement sans badge numérique depuis la migration Verdant
    expect(screen.getByText(/Affinez votre stratégie/i)).toBeDefined();
    expect(screen.getByText(/paramètres de financement/i)).toBeDefined();
  });

  it('affiche le titre de section financement (S9)', () => {
    render(<StepFinancement onNext={mockOnNext} onPrev={mockOnPrev} />);
    // Le composant affiche un <h3> "Détails du financement" sans badge numérique
    expect(screen.getByText(/Détails du financement/i)).toBeDefined();
    expect(screen.getByText(/Apport personnel/i)).toBeDefined();
  });

  it("affiche l'incitation au pro-tip (S12) et suggestions (S11)", () => {
    render(<StepFinancement onNext={mockOnNext} onPrev={mockOnPrev} />);
    expect(screen.getByText(/Levier vs\. Apport/i)).toBeDefined(); // Pro tip
    expect(screen.getByText(/Recommandé/i)).toBeDefined(); // S11 hints
  });
});

// BUG-03 — Montant emprunté cohérent entre step 2 et résultats
describe('StepFinancement — BUG-03 montant emprunté cohérent', () => {
  it('affiche un montant emprunté incluant frais notaire (~8%) et travaux, pas seulement prixAchat - apport', () => {
    // prix_achat = 300 000, travaux = 15 000, apport = 60 000
    // Montant INCORRECT (ancien) : 300 000 - 60 000 = 240 000
    // Montant CORRECT : (300 000 + 300 000*0.08 + 15 000) - 60 000 = 279 000
    vi.mocked(useCalculateurStore).mockReturnValue({
      getActiveScenario: () => ({
        bien: {
          prix_achat: 300000,
          montant_travaux: 15000,
        },
        financement: {
          apport: 60000,
          duree_emprunt: 20,
          taux_interet: 3.5,
          assurance_pret: 0.3,
          frais_dossier: 0,
          frais_garantie: 0,
        },
        options: { ponderation_loyers: 70 },
      }),
      updateFinancement: vi.fn(),
      activeScenarioId: '1',
    } as Partial<CalculateurState>);

    render(<StepFinancement onNext={mockOnNext} onPrev={mockOnPrev} />);

    // Le montant emprunté réel = 300000 + 24000 (notaire 8%) + 15000 (travaux) - 60000 = 279 000
    // L'ancien montant erroné était 240 000 € (300 000 - 60 000)
    const wrongAmount = /240\s*000/;
    const correctAmount = /279\s*000/;

    const elements = screen.getAllByText(correctAmount);
    expect(elements.length).toBeGreaterThan(0);

    // S'assurer que le montant incorrect (prixAchat - apport) n'est PAS affiché
    // comme montant emprunté dans le widget dédié
    const wrongElements = screen.queryAllByText(wrongAmount);
    // Le montant 240 000 ne doit pas apparaître dans le widget "Montant à emprunter"
    const widget = screen.getByText(/Montant à emprunter/i).closest('div');
    expect(widget?.textContent).not.toMatch(wrongAmount);
  });

  it('affiche la décomposition du coût total avec frais notaire et travaux', () => {
    vi.mocked(useCalculateurStore).mockReturnValue({
      getActiveScenario: () => ({
        bien: {
          prix_achat: 300000,
          montant_travaux: 15000,
        },
        financement: {
          apport: 60000,
          duree_emprunt: 20,
          taux_interet: 3.5,
          assurance_pret: 0.3,
          frais_dossier: 0,
          frais_garantie: 0,
        },
        options: { ponderation_loyers: 70 },
      }),
      updateFinancement: vi.fn(),
      activeScenarioId: '1',
    } as Partial<CalculateurState>);

    render(<StepFinancement onNext={mockOnNext} onPrev={mockOnPrev} />);

    // Les frais de notaire doivent être affichés dans la décomposition
    expect(screen.getByText(/Frais de notaire/i)).toBeDefined();
  });
});
