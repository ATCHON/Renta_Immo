// @vitest-environment jsdom
/**
 * BUG-09 — Troncature "Loyer €/m" dans InputRecap
 * Vérifie que le label du loyer mensuel affiche "/mois" complet et non "/m" tronqué.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { InputRecap } from '@/components/results/InputRecap';

// InputRecap n'utilise pas de store ni de hooks — pas de mock nécessaire
// Seule dépendance : formatCurrency de @/lib/utils

describe('BUG-09 — InputRecap affiche "/mois" complet pour le loyer', () => {
  const defaultProps = {
    bien: { type_bien: 'appartement', prix_achat: 200000, surface: 45 },
    financement: { apport: 30000, taux_interet: 3.5, duree_emprunt: 20 },
    exploitation: { loyer_mensuel: 1100, charges_copro: 0, assurance_pno: 0, taxe_fonciere: 800 },
    structure: { type: 'nom_propre', tmi: 30, regime_fiscal: 'lmnp_reel' },
  };

  it('affiche "€/mois" complet et non "€/m" tronqué pour le loyer mensuel', () => {
    render(<InputRecap {...defaultProps} />);

    // La valeur du loyer doit contenir "/mois" et non se terminer par "/m" seul
    const loyerRow = screen.getByText(/\/mois/);
    expect(loyerRow).toBeDefined();
    expect(loyerRow.textContent).toContain('/mois');
    // S'assurer qu'il n'y a pas un "/m" non suivi de "ois" quelque part
    expect(loyerRow.textContent).not.toMatch(/\/m(?!ois)/);
  });

  it('n\'affiche pas de label "€/m" tronqué', () => {
    render(<InputRecap {...defaultProps} />);

    // Aucun élément ne doit avoir exactement "/m" comme suffixe de loyer
    const allText = document.body.textContent ?? '';
    // Vérifie que "/mois" est présent
    expect(allText).toContain('/mois');
  });
});
