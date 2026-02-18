import { useMemo } from 'react';
import { ProjectionAnnuelle } from '@/types';

export const useChartData = (projections: ProjectionAnnuelle[] = []) => {
  const currentYear = new Date().getFullYear();

  const cashflowData = useMemo(() => {
    let cumul = 0;
    return projections.map((p) => {
      cumul += p.cashflowNetImpot;
      return {
        name: (currentYear + p.annee - 1).toString(),
        cashflow: p.cashflow,
        cashflowNetImpot: p.cashflowNetImpot,
        cashflowCumule: Math.round(cumul),
      };
    });
  }, [projections, currentYear]);

  const patrimoineData = useMemo(() => {
    let cashflowCumul = 0;
    return projections.map((p) => {
      cashflowCumul += p.cashflowNetImpot;
      return {
        name: (currentYear + p.annee - 1).toString(),
        valeurBien: Math.round(p.valeurBien),
        capitalRestant: Math.round(p.capitalRestant),
        patrimoineNet: Math.round(p.patrimoineNet + cashflowCumul),
      };
    });
  }, [projections, currentYear]);

  const cumulativeData = useMemo(() => {
    let capitalCumule = 0;
    return projections.map((p) => {
      capitalCumule += p.capitalRembourse;
      return {
        name: (currentYear + p.annee - 1).toString(),
        capitalCumule: Math.round(capitalCumule),
      };
    });
  }, [projections, currentYear]);

  const breakEvenYear = useMemo(() => {
    for (let i = 0; i < projections.length; i++) {
      if (
        projections[i].cashflowNetImpot >= 0 &&
        (i === 0 || projections[i - 1].cashflowNetImpot < 0)
      ) {
        return currentYear + projections[i].annee - 1;
      }
    }
    return null;
  }, [projections, currentYear]);

  const loanEndYear = useMemo(() => {
    for (const p of projections) {
      if (p.capitalRestant <= 0) {
        return currentYear + p.annee - 1;
      }
    }
    return null;
  }, [projections, currentYear]);

  return {
    cashflowData,
    patrimoineData,
    cumulativeData,
    breakEvenYear,
    loanEndYear,
  };
};
