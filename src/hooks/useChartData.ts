import { useMemo } from 'react';
import { ProjectionAnnuelle } from '@/types';

export const useChartData = (projections: ProjectionAnnuelle[] = []) => {
    const cashflowData = useMemo(() => {
        return projections.map((p) => ({
            name: `Année ${p.annee}`,
            cashflow: p.cashflow,
            cashflowNetImpot: p.cashflowNetImpot,
        }));
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
        let interetsCumules = 0;
        let capitalCumule = 0;

        // Note: Pour un graphique cumulé précis, on pourrait avoir besoin des données d'intérêts annuels
        // Si elles ne sont pas dans ProjectionAnnuelle, on peut les déduire ou ajouter au serveur plus tard.
        // Pour l'instant on se base sur le capital remboursé.
        return projections.map((p) => {
            capitalCumule += p.capitalRembourse;
            return {
                name: `Année ${p.annee}`,
                capitalCumule: Math.round(capitalCumule),
                // On pourrait ajouter les intérêts ici si on les avait
            };
        });
    }, [projections]);

    return {
        cashflowData,
        patrimoineData,
        cumulativeData,
    };
};
