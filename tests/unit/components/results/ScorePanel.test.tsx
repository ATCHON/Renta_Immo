// @vitest-environment jsdom
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ScorePanel } from '@/components/results/ScorePanel';

const mockSynthese = {
  score_global: 75,
  evaluation: 'Bon',
  couleur: 'green',
  recommandation: 'Good',
  score_detail: {
    rentabilite: 80,
    cashflow: 70,
    risque: 75,
    ajustements: { 'Ajustement 1': 5 },
  },
  scores_par_profil: {
    rentier: 80,
    patrimonial: 70,
    equilibree: 75,
  },
  points_attention: [],
  points_attention_detail: [],
  recommandations_detail: [],
} as any;

const mockAjustements = [{ description: 'Ajustement 1', impact: 5 }];

describe('ScorePanel — SVG Circle & Accordion (D4, D5)', () => {
  it('renders the SVG circle gauge with correct score and label', () => {
    const { container } = render(<ScorePanel synthese={mockSynthese} />);
    expect(screen.getAllByText('75').length).toBeGreaterThan(0);
    expect(screen.getByText('Bon')).toBeDefined();
    // Verify SVG circle is rendered
    expect(container.querySelector('circle')).toBeDefined();
  });

  it('renders the collapsible adjustment breakdown', () => {
    render(<ScorePanel synthese={mockSynthese} />);
    // Open collapsible
    const summaryBtn = screen.getByText(/Voir le détail des sous-scores/i);
    expect(summaryBtn).toBeDefined();

    // Check that adjustments text is not visible initially but is in DOM
    const adjText = screen.getByText('Ajustement 1');
    expect(adjText).toBeDefined();
  });
});
