import { describe, it, expect } from 'vitest';
import { analyserHcsf } from '@/server/calculations/hcsf';
import { CalculationInput } from '@/server/calculations/types';
import { mockConfig } from '@/server/calculations/__tests__/mock-config';

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
        cout_total_interets: 15000,
        cout_total_acquisition: 120000,
        taux_interet: 4,
        frais_notaire: 8000
    };

    it('should use TMI-based estimation when revenus_activite is 0 or missing', () => {
        // TMI 30 -> estimate is 3500 (from estimerRevenusDepuisTmi)
        const result = analyserHcsf(baseInput as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);

        // Taux = (Credits + NouveauCredit) / (EstimatedSalaries + 70% * Loyer)
        // Taux = (1000 + 625) / (3500 + 700) = 1625 / 4200 ≈ 38.69%
        expect(result.taux_endettement).toBeCloseTo(38.69, 1);
    });

    it('should use exact revenus_activite when provided', () => {
        const inputWithIncome = {
            ...baseInput,
            structure: {
                ...baseInput.structure!,
                revenus_activite: 6000
            }
        };

        const result = analyserHcsf(inputWithIncome as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);

        // Taux = (1000 + 625) / (6000 + 700) = 1625 / 6700 ≈ 24.25%
        expect(result.taux_endettement).toBeCloseTo(24.25, 1);
        expect(result.revenus_detail.salaires_estimatif_mensuels).toBe(6000);
    });
});

// ============================================================================
// V2-S18 : Pondération loyers HCSF configurable
// ============================================================================
describe('V2-S18 : Pondération loyers HCSF configurable', () => {
    const baseInput = {
        structure: {
            type: 'nom_propre' as const,
            tmi: 30,
            revenus_activite: 4000,
            credits_immobiliers: 0,
            loyers_actuels: 0,
            associes: [],
        },
        financement: {
            apport: 20000,
            taux_interet: 4,
            duree_emprunt: 20,
            assurance_pret: 0.3,
            frais_dossier: 0,
            frais_garantie: 0,
        },
        options: {},
    };

    const fakeFinancement = {
        montant_emprunt: 100000,
        mensualite_credit: 600,
        mensualite_assurance: 25,
        mensualite_totale: 625,
        remboursement_annuel: 7500,
        cout_total_credit: 50000,
        cout_total_interets: 15000,
        cout_total_acquisition: 120000,
        taux_interet: 4,
        frais_notaire: 8000
    };

    it('pondération 70% par défaut (sans option)', () => {
        const result = analyserHcsf(baseInput as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        // Taux = 625 / (4000 + 0.70*1000) = 625 / 4700 ≈ 13.30%
        expect(result.taux_endettement).toBeCloseTo(13.30, 1);
    });

    it('pondération 80% avec GLI → taux d\'endettement différent', () => {
        const inputGLI = { ...baseInput, options: { ponderation_loyers: 80 } };
        const result = analyserHcsf(inputGLI as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        // Taux = 625 / (4000 + 0.80*1000) = 625 / 4800 ≈ 13.02%
        expect(result.taux_endettement).toBeCloseTo(13.02, 1);
    });

    it('pondération 80% donne un taux d\'endettement plus bas (meilleurs revenus pris en compte)', () => {
        const result70 = analyserHcsf(baseInput as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        const inputGLI = { ...baseInput, options: { ponderation_loyers: 80 } };
        const result80 = analyserHcsf(inputGLI as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        // Avec 80% de pondération, les revenus locatifs sont plus élevés → taux d'endettement plus bas
        expect(result80.taux_endettement).toBeLessThan(result70.taux_endettement);
    });
});

// ============================================================================
// estimerRevenusDepuisTmi — couverture par tranche
// Taux = (credits 1000 + mensualité 625) / (revenusTMI + 0.7 * loyerAnnuel 1000)
//      = 1625 / (revenusTMI + 700)
// ============================================================================
describe('estimerRevenusDepuisTmi — couverture par tranche', () => {
    const baseInput = {
        structure: {
            type: 'nom_propre' as const,
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
            frais_garantie: 0,
        },
    };

    const fakeFinancement = {
        montant_emprunt: 100000,
        mensualite_credit: 600,
        mensualite_assurance: 25,
        mensualite_totale: 625,
        remboursement_annuel: 7500,
        cout_total_credit: 50000,
        cout_total_interets: 15000,
        cout_total_acquisition: 120000,
        taux_interet: 4,
        frais_notaire: 8000,
    };

    it('TMI 0 → estimation 800 €/mois → taux > 100%', () => {
        const input = { ...baseInput, structure: { ...baseInput.structure, tmi: 0 } };
        const result = analyserHcsf(input as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        // 1625 / (800 + 700) = 1625 / 1500 ≈ 108.33%
        expect(result.taux_endettement).toBeCloseTo(108.33, 1);
        expect(result.revenus_detail.salaires_estimatif_mensuels).toBe(800);
    });

    it('TMI 11 → estimation 1 800 €/mois → taux ≈ 65%', () => {
        const input = { ...baseInput, structure: { ...baseInput.structure, tmi: 11 } };
        const result = analyserHcsf(input as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        // 1625 / (1800 + 700) = 1625 / 2500 = 65.00%
        expect(result.taux_endettement).toBeCloseTo(65.00, 1);
        expect(result.revenus_detail.salaires_estimatif_mensuels).toBe(1800);
    });

    it('TMI 30 → estimation 3 500 €/mois → taux ≈ 38.7%', () => {
        const input = { ...baseInput, structure: { ...baseInput.structure, tmi: 30 } };
        const result = analyserHcsf(input as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        // 1625 / (3500 + 700) = 1625 / 4200 ≈ 38.69%
        expect(result.taux_endettement).toBeCloseTo(38.69, 1);
        expect(result.revenus_detail.salaires_estimatif_mensuels).toBe(3500);
    });

    it('TMI 41 → estimation 7 000 €/mois → taux ≈ 21.1%', () => {
        const input = { ...baseInput, structure: { ...baseInput.structure, tmi: 41 } };
        const result = analyserHcsf(input as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        // 1625 / (7000 + 700) = 1625 / 7700 ≈ 21.10%
        expect(result.taux_endettement).toBeCloseTo(21.10, 1);
        expect(result.revenus_detail.salaires_estimatif_mensuels).toBe(7000);
    });

    it('TMI 45 → estimation 15 000 €/mois → taux ≈ 10.4%', () => {
        const input = { ...baseInput, structure: { ...baseInput.structure, tmi: 45 } };
        const result = analyserHcsf(input as unknown as CalculationInput, fakeFinancement, 1000, mockConfig);
        // 1625 / (15000 + 700) = 1625 / 15700 ≈ 10.35%
        expect(result.taux_endettement).toBeCloseTo(10.35, 1);
        expect(result.revenus_detail.salaires_estimatif_mensuels).toBe(15000);
    });
});
