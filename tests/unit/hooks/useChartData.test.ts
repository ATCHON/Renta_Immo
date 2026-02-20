import { describe, it, expect } from 'vitest';

// On importe directement la logique car useChartData utilise useMemo de React
// On va tester la logique de calcul en la dupliquant/extrayant
// Pour vitest en environnement 'node', on peut mocker React.useMemo

import { vi } from 'vitest';

// Mock React pour que useMemo exécute simplement la callback
vi.mock('react', () => ({
  useMemo: (fn: () => unknown) => fn(),
}));

import { useChartData } from '@/hooks/useChartData';

// =============================================================================
// Types de test
// =============================================================================
const mockProjections = [
  {
    annee: 1,
    cashflow: 2400,
    cashflowNetImpot: 1200,
    valeurBien: 155000,
    capitalRestant: 95000,
    patrimoineNet: 60000,
    capitalRembourse: 5000,
  },
  {
    annee: 2,
    cashflow: 2500,
    cashflowNetImpot: 1300,
    valeurBien: 157000,
    capitalRestant: 89000,
    patrimoineNet: 68000,
    capitalRembourse: 6000,
  },
  {
    annee: 3,
    cashflow: 2600,
    cashflowNetImpot: -500,
    valeurBien: 160000,
    capitalRestant: 83000,
    patrimoineNet: 77000,
    capitalRembourse: 6000,
  },
];

// =============================================================================
// cashflowData
// =============================================================================
describe('useChartData', () => {
  it('retourne des données vides pour des projections vides', () => {
    const result = useChartData([]);
    expect(result.cashflowData).toEqual([]);
    expect(result.patrimoineData).toEqual([]);
    expect(result.cumulativeData).toEqual([]);
    expect(result.breakEvenYear).toBeNull();
    expect(result.loanEndYear).toBeNull();
  });

  it('retourne des données vides sans arguments', () => {
    const result = useChartData();
    expect(result.cashflowData).toEqual([]);
  });

  describe('cashflowData', () => {
    it('calcule le cashflow cumulé correctement', () => {
      const { cashflowData } = useChartData(mockProjections as never[]);

      expect(cashflowData).toHaveLength(3);
      expect(cashflowData[0].cashflow).toBe(2400);
      expect(cashflowData[0].cashflowNetImpot).toBe(1200);
      // Cumulé : 1200
      expect(cashflowData[0].cashflowCumule).toBe(1200);
      // Cumulé : 1200 + 1300 = 2500
      expect(cashflowData[1].cashflowCumule).toBe(2500);
      // Cumulé : 2500 + (-500) = 2000
      expect(cashflowData[2].cashflowCumule).toBe(2000);
    });

    it("utiliseles années basées sur l'année courante", () => {
      const { cashflowData } = useChartData(mockProjections as never[]);
      const currentYear = new Date().getFullYear();
      expect(cashflowData[0].name).toBe(currentYear.toString());
      expect(cashflowData[1].name).toBe((currentYear + 1).toString());
    });
  });

  describe('patrimoineData', () => {
    it('calcule le patrimoine net avec cashflow cumulé', () => {
      const { patrimoineData } = useChartData(mockProjections as never[]);

      expect(patrimoineData).toHaveLength(3);
      expect(patrimoineData[0].valeurBien).toBe(155000);
      expect(patrimoineData[0].capitalRestant).toBe(95000);
      // patrimoineNet: 60000 + cashflowCumul(1200) = 61200
      expect(patrimoineData[0].patrimoineNet).toBe(61200);
    });
  });

  describe('cumulativeData', () => {
    it('calcule le capital cumulé correctement', () => {
      const { cumulativeData } = useChartData(mockProjections as never[]);

      expect(cumulativeData).toHaveLength(3);
      expect(cumulativeData[0].capitalCumule).toBe(5000);
      expect(cumulativeData[1].capitalCumule).toBe(11000);
      expect(cumulativeData[2].capitalCumule).toBe(17000);
    });
  });

  describe('breakEvenYear', () => {
    it("retourne l'année où le cashflow net devient positif", () => {
      // Premier élément a cashflowNetImpot >= 0 et c'est i===0
      const { breakEvenYear } = useChartData(mockProjections as never[]);
      const currentYear = new Date().getFullYear();
      expect(breakEvenYear).toBe(currentYear);
    });

    it('retourne null si jamais positif', () => {
      const negativeProjections = [
        {
          annee: 1,
          cashflow: -100,
          cashflowNetImpot: -100,
          valeurBien: 100000,
          capitalRestant: 90000,
          patrimoineNet: 10000,
          capitalRembourse: 5000,
        },
        {
          annee: 2,
          cashflow: -50,
          cashflowNetImpot: -50,
          valeurBien: 100000,
          capitalRestant: 85000,
          patrimoineNet: 15000,
          capitalRembourse: 5000,
        },
      ];
      const { breakEvenYear } = useChartData(negativeProjections as never[]);
      expect(breakEvenYear).toBeNull();
    });
  });

  describe('loanEndYear', () => {
    it("retourne null si le prêt n'est jamais remboursé", () => {
      const { loanEndYear } = useChartData(mockProjections as never[]);
      expect(loanEndYear).toBeNull();
    });

    it("retourne l'année de fin de prêt", () => {
      const projectionsWithEnd = [
        {
          annee: 1,
          cashflow: 1000,
          cashflowNetImpot: 500,
          valeurBien: 100000,
          capitalRestant: 50000,
          patrimoineNet: 50000,
          capitalRembourse: 50000,
        },
        {
          annee: 2,
          cashflow: 1000,
          cashflowNetImpot: 500,
          valeurBien: 100000,
          capitalRestant: 0,
          patrimoineNet: 100000,
          capitalRembourse: 50000,
        },
      ];
      const currentYear = new Date().getFullYear();
      const { loanEndYear } = useChartData(projectionsWithEnd as never[]);
      expect(loanEndYear).toBe(currentYear + 1);
    });
  });
});
