import { describe, it, expect } from 'vitest';
import { calculerTRI, genererProjections } from './projection';
import type { ValidatedFormData } from './types';

describe('Calculateur TRI', () => {
    it('doit calculer un TRI correct pour un flux simple', () => {
        // -100, 10, 10, 110 => TRI = 10%
        const flux = [-100, 10, 10, 110];
        const tri = calculerTRI(flux);
        expect(tri).toBeCloseTo(10, 1);
    });

    it('doit calculer un TRI correct pour un investissement immobilier type', () => {
        // Apport 20000
        // Cashflows 1000/an pendant 5 ans
        // Valeur de revente + capital restant dû = 30000 nets à la fin
        const flux = [-20000, 1000, 1000, 1000, 1000, 31000]; // 1000 + 30000
        const tri = calculerTRI(flux);
        // Approximation: tri environ 11-12%
        expect(tri).toBeGreaterThan(10);
        expect(tri).toBeLessThan(15);
    });

    it('doit gérer un apport de 0 (pas de flux négatif)', () => {
        const flux = [0, 1000, 1000, 11000];
        const tri = calculerTRI(flux);
        // Doit retourner 0 car pas de flux négatif (rendement infini non calculable)
        expect(tri).toBe(0);
    });

    it('doit gérer une divergence', () => {
        const flux = [-1, 1000000, 1000000];
        const tri = calculerTRI(flux);
        // Devrait être capé par la sécurité et retourner 0 ou un grand nombre
        expect(tri).toBeLessThan(110000);
    });
});

describe('AUDIT-110 & V2-S14 : Revalorisation selon DPE', () => {
    const baseInput = {
        bien: {
            adresse: 'Test', prix_achat: 100000, type_bien: 'appartement',
            etat_bien: 'ancien', montant_travaux: 0, valeur_mobilier: 0,
        },
        financement: {
            apport: 0, taux_interet: 3, duree_emprunt: 20,
            assurance_pret: 0.3,
        },
        exploitation: {
            loyer_mensuel: 500, charges_copro: 0, taxe_fonciere: 500,
            assurance_pno: 100, gestion_locative: 0, provision_travaux: 0,
            provision_vacance: 0, type_location: 'nue',
        },
        structure: {
            type: 'nom_propre', tmi: 30, regime_fiscal: 'reel',
        },
        options: {
            horizon_projection: 20, taux_evolution_loyer: 0,
        },
    } as unknown as ValidatedFormData;

    it('DPE F/G : Décote immédiate de 15%', () => {
        const inputF = { ...baseInput, bien: { ...baseInput.bien, dpe: 'F' } };
        // Projection sur 1 an. Valeur théorique = 100k * 1.015 = 101500.
        // Valeur réelle = 101500 * (1 - 0.15) = 86275.
        const result = genererProjections(inputF, 1);
        const projectionAn1 = result.projections[0];

        // 100000 * 0.85 = 85000 (Pas d'inflation année 1)
        expect(projectionAn1.valeurBien).toBeCloseTo(85000, -1);
    });

    it('DPE E : Décote de 10% à partir de 2034', () => {
        const inputE = { ...baseInput, bien: { ...baseInput.bien, dpe: 'E' } };
        const result = genererProjections(inputE, 20);

        const currentYear = new Date().getFullYear();
        const yearsTo2034 = 2034 - currentYear;

        if (yearsTo2034 > 0 && yearsTo2034 < 20) {
            const index2033 = yearsTo2034 - 1;
            const index2034 = yearsTo2034;

            // En 2033 : Pas de décote. Valeur = Prix * 1.015^n
            // En 2034 : Décote 10%. Valeur = (Prix * 1.015^(n+1)) * 0.90

            const valeur2033 = result.projections[index2033].valeurBien;
            const valeur2034 = result.projections[index2034].valeurBien;

            // La valeur en 2034 devrait être INFÉRIEURE à 2033 malgré la hausse théorique de 1.5% 
            // car le drop de 10% absorbe la hausse.
            expect(valeur2034).toBeLessThan(valeur2033);
        }
    });

    it('DPE C : Pas de décote', () => {
        const inputC = { ...baseInput, bien: { ...baseInput.bien, dpe: 'C' } };
        const result = genererProjections(inputC, 1);
        // 100000 (Pas d'inflation année 1)
        expect(result.projections[0].valeurBien).toBeCloseTo(100000, -1);
    });
});
