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

// ============================================================================
// REC-02 : Capacité résiduelle HCSF configurable
// ============================================================================
describe('REC-02 : calculerCapaciteResiduelle avec config custom', () => {
    const baseInput = {
        structure: {
            type: 'nom_propre' as const,
            tmi: 30,
            revenus_activite: 10000,
            credits_immobiliers: 0,
            loyers_actuels: 0,
            associes: [],
        },
        financement: {
            apport: 20000,
            taux_interet: 4,
            duree_emprunt: 20,
            assurance_pret: 0,
            frais_dossier: 0,
            frais_garantie: 0,
        },
        options: {},
    };

    const fakeFinancement = {
        montant_emprunt: 200000,
        mensualite_credit: 1000,
        mensualite_assurance: 0,
        mensualite_totale: 1000,
        remboursement_annuel: 12000,
        cout_total_credit: 80000,
        cout_total_interets: 30000,
        cout_total_acquisition: 230000,
        taux_interet: 4,
        frais_notaire: 16000,
    };

    it('valeurs par défaut (3.5%/20 ans) → capacité ≈ 515 000 €', () => {
        // revenusPonderes = 10000 + 0.7*2000 = 11400
        // chargeMax = 11400 * 35% = 3990
        // marge = 3990 - 1000 = 2990
        // facteur ≈ 172.35 → capacite = 2990 * 172.35 ≈ 515127
        const result = analyserHcsf(baseInput as unknown as CalculationInput, fakeFinancement, 2000, mockConfig);
        expect(result.capacite_emprunt_residuelle).toBeGreaterThan(500000);
        expect(result.capacite_emprunt_residuelle).toBeLessThan(530000);
    });

    it('taux 5%/15 ans → capacité inférieure à celle avec 3.5%/20 ans', () => {
        const configHautTaux = { ...mockConfig, hcsfTauxReferenceCapacite: 0.05, hcsfDureeCapaciteResiduelleAnnees: 15 };
        const resultDefault = analyserHcsf(baseInput as unknown as CalculationInput, fakeFinancement, 2000, mockConfig);
        const resultHautTaux = analyserHcsf(baseInput as unknown as CalculationInput, fakeFinancement, 2000, configHautTaux);
        // Facteur pour 5%/15 ans ≈ 126 vs 172 pour 3.5%/20 ans
        expect(resultHautTaux.capacite_emprunt_residuelle).toBeLessThan(resultDefault.capacite_emprunt_residuelle);
    });
});

// ============================================================================
// REC-04 : VEFA HCSF durée 27 ans
// ============================================================================
describe('REC-04 : VEFA HCSF durée 27 ans', () => {
    const baseStructure = {
        type: 'nom_propre' as const,
        tmi: 30,
        revenus_activite: 8000,
        credits_immobiliers: 0,
        loyers_actuels: 0,
        associes: [],
    };

    const fakeFinancement = {
        montant_emprunt: 200000,
        mensualite_credit: 900,
        mensualite_assurance: 0,
        mensualite_totale: 900,
        remboursement_annuel: 10800,
        cout_total_credit: 90000,
        cout_total_interets: 35000,
        cout_total_acquisition: 220000,
        taux_interet: 3.5,
        frais_notaire: 16000,
    };

    it('crédit 26 ans + is_vefa=true → pas d\'alerte durée', () => {
        const input = {
            structure: baseStructure,
            financement: { apport: 20000, taux_interet: 3.5, duree_emprunt: 26, assurance_pret: 0, frais_dossier: 0, frais_garantie: 0 },
            bien: { is_vefa: true },
            options: {},
        };
        const result = analyserHcsf(input as unknown as CalculationInput, fakeFinancement, 1500, mockConfig);
        const alertesDuree = result.alertes.filter(a => a.includes('Durée'));
        expect(alertesDuree).toHaveLength(0);
    });

    it('crédit 26 ans + is_vefa=false → alerte durée (max 25 ans)', () => {
        const input = {
            structure: baseStructure,
            financement: { apport: 20000, taux_interet: 3.5, duree_emprunt: 26, assurance_pret: 0, frais_dossier: 0, frais_garantie: 0 },
            bien: { is_vefa: false },
            options: {},
        };
        const result = analyserHcsf(input as unknown as CalculationInput, fakeFinancement, 1500, mockConfig);
        const alertesDuree = result.alertes.filter(a => a.includes('Durée'));
        expect(alertesDuree).toHaveLength(1);
        expect(alertesDuree[0]).toContain('26');
        expect(alertesDuree[0]).toContain('25');
    });

    it('crédit 28 ans + is_vefa=true → alerte durée (max 27 ans)', () => {
        const input = {
            structure: baseStructure,
            financement: { apport: 20000, taux_interet: 3.5, duree_emprunt: 28, assurance_pret: 0, frais_dossier: 0, frais_garantie: 0 },
            bien: { is_vefa: true },
            options: {},
        };
        const result = analyserHcsf(input as unknown as CalculationInput, fakeFinancement, 1500, mockConfig);
        const alertesDuree = result.alertes.filter(a => a.includes('Durée'));
        expect(alertesDuree).toHaveLength(1);
        expect(alertesDuree[0]).toContain('28');
        expect(alertesDuree[0]).toContain('27');
    });
});
