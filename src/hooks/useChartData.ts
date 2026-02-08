import { useMemo } from 'react';
import { ProjectionAnnuelle } from '@/types';

export const useChartData = (projections: ProjectionAnnuelle[] = []) => {
    const cashflowData = useMemo(() => {
        let cumul = 0;
        return projections.map((p) => {
            cumul += p.cashflowNetImpot;
            return {
                name: `Année ${p.annee}`,
                cashflow: p.cashflow,
                cashflowNetImpot: p.cashflowNetImpot,
                cashflowCumule: Math.round(cumul),
            };
        });
    }, [projections]);

    const patrimoineData = useMemo(() => {
        return projections.map((p) => ({
            name: `Année ${p.annee}`,
            valeurBien: Math.round(p.valeurBien),
            capitalRestant: Math.round(p.capitalRestant),
            patrimoineNet: Math.round(p.patrimoineNet),
        }));
    }, [projections]);

    const cumulativeData = useMemo(() => {
        let capitalCumule = 0;
        return projections.map((p) => {
            capitalCumule += p.capitalRembourse;
            return {
                name: `Année ${p.annee}`,
                capitalCumule: Math.round(capitalCumule),
            };
        });
    }, [projections]);

    const breakEvenYear = useMemo(() => {
        for (let i = 0; i < projections.length; i++) {
            if (projections[i].cashflowNetImpot >= 0 && (i === 0 || projections[i - 1].cashflowNetImpot < 0)) {
                return projections[i].annee;
            }
        }
        return null;
    }, [projections]);

    const loanEndYear = useMemo(() => {
        for (const p of projections) {
            if (p.capitalRestant <= 0) {
                return p.annee;
            }
        }
        return null;
    }, [projections]);

    return {
        cashflowData,
        patrimoineData,
        cumulativeData,
        breakEvenYear,
        loanEndYear,
    };
};
