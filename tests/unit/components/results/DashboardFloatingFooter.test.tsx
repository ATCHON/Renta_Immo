// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardFloatingFooter } from '@/components/results/DashboardFloatingFooter';

vi.mock('@/components/results/DownloadPdfButton', () => ({
  DownloadPdfButton: () => <button>Télécharger PDF</button>,
}));

vi.mock('@/components/simulations/SaveSimulationButton', () => ({
  SaveSimulationButton: () => <button>Sauvegarder</button>,
}));

const mockResultats = {
  cashflow: { mensuel: 100 },
  rentabilite: { brute: 5, nette_nette: 3, loyer_annuel: 8000, effet_levier: false },
  fiscalite: { impot_estime: 0 },
  financement: { montant_emprunt: 100000, mensualite: 500, cout_total_credit: 20000 },
  synthese: {
    score_global: 70,
    evaluation: 'Bon',
    couleur: 'blue',
    score_detail: {},
    scores_par_profil: null,
    points_attention: [],
    points_attention_detail: [],
    recommandations_detail: [],
  },
  hcsf: { conforme: true, taux_endettement: 25 },
  comparaisonFiscalite: null,
  projections: [],
  tableauAmortissement: [],
  tableauAmortissementFiscal: [],
} as any;

describe('DashboardFloatingFooter (D3)', () => {
  it('renders fixed footer with expected action buttons', () => {
    render(<DashboardFloatingFooter formData={{} as any} resultats={mockResultats} />);
    expect(screen.getByTitle('Partager la simulation')).toBeDefined();
    expect(screen.getByText('Sauvegarder')).toBeDefined();
    expect(screen.getByText('Télécharger PDF')).toBeDefined();
  });
});
