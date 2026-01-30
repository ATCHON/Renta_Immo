import { describe, it, expect } from 'vitest';
import { analyserHcsf } from './hcsf';
import { CalculationInput } from './types';

describe('HCSF Precision Calculations', () => {
    const baseInput: Partial<CalculationInput> = {
        structure: {
            type: 'nom_propre',
            tmi: 30,
            credits_immobiliers: 1000,
            loyers_actuels: 0,
            associes: [],
        },
        financement: {
            apport: 20000,
            taux_interet: 4,
            duree_emprunt: 20,
            assurance_pret: 0.3,
            frais_dossier: 0,
            frais_garantie: 0
        }
    };

    const fakeFinancement = {
        montant_emprunt: 100000,
        mensualite_credit: 600,
        mensualite_assurance: 25,
        mensualite_totale: 625,
        remboursement_annuel: 7500,
        cout_total_credit: 50000,
        cout_total_interets: 15000
    };

    it('should use TMI-based estimation when revenus_activite is 0 or missing', () => {
        // TMI 30 -> estimate is 4000 (from constants)
        const result = analyserHcsf(baseInput as CalculationInput, fakeFinancement, 1000);

        // Taux = (Credits + NouveauCredit) / (EstimatedSalaries + 70% * Loyer)
        // Taux = (1000 + 625) / (4000 + 700) = 1625 / 4700 ≈ 34.57%
        expect(result.taux_endettement).toBeCloseTo(34.57, 1);
    });

    it('should use exact revenus_activite when provided', () => {
        const inputWithIncome = {
            ...baseInput,
            structure: {
                ...baseInput.structure!,
                revenus_activite: 6000
            }
        };

        const result = analyserHcsf(inputWithIncome as CalculationInput, fakeFinancement, 1000);

        // Taux = (1000 + 625) / (6000 + 700) = 1625 / 6700 ≈ 24.25%
        expect(result.taux_endettement).toBeCloseTo(24.25, 1);
        expect(result.revenus_detail.salaires_estimatif_mensuels).toBe(6000);
    });
});
