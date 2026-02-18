import { describe, it, expect } from 'vitest';
import { calculerChargesAnnuelles, calculerFraisNotairePrecis } from '@/server/calculations/rentabilite';
import type { ExploitationFormData as ExploitationData } from '@/lib/validators';
import { mockConfig } from '@/server/calculations/__tests__/mock-config';

describe('calculerChargesAnnuelles (Fix Vacance)', () => {
    const exploitationMock = {
        charges_copro: 0,
        charges_copro_recuperables: 0,
        taxe_fonciere: 0,
        assurance_pno: 0,
        assurance_gli: 0,
        cfe_estimee: 0,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 5, // 5% provision vacance
        loyer_mensuel: 1000,
        type_location: 'nue',
    } as unknown as ExploitationData;

    it('devrait inclure la provision vacance quand tauxOccupation est absent (undefined)', () => {
        const loyerAnnuel = 12000;
        const result = calculerChargesAnnuelles(exploitationMock, loyerAnnuel, undefined, mockConfig);

        // Vacance = 5% of 12000 = 600
        expect(result.charges_proportionnelles_annuelles).toBe(600);
    });

    it('devrait EXCLURE la provision vacance quand tauxOccupation < 1 est fourni', () => {
        const tauxOccupation = 0.9;
        const loyerAnnuel = 12000 * 0.9; // 10800

        const result = calculerChargesAnnuelles(exploitationMock, loyerAnnuel, tauxOccupation, mockConfig);

        // Vacance should be 0 because tauxOccupation is defined
        expect(result.charges_proportionnelles_annuelles).toBe(0);
    });

    it('devrait EXCLURE la provision vacance si tauxOccupation = 1 (explicite)', () => {
        // Si l'utilisateur force 100%, on respecte son choix et on n'ajoute pas de provision arbitraire
        const result = calculerChargesAnnuelles(exploitationMock, 12000, 1, mockConfig);
        expect(result.charges_proportionnelles_annuelles).toBe(0);
    });
});

describe('calculerChargesAnnuelles - CFE pilotée par config (cfeSeuilExoneration = 5 000 €)', () => {
    // mockConfig.cfeSeuilExoneration = 5000

    const baseExploitation = {
        charges_copro: 0,
        charges_copro_recuperables: 0,
        taxe_fonciere: 0,
        assurance_pno: 0,
        assurance_gli: 0,
        cfe_estimee: 300, // CFE à inclure ou exclure selon le seuil
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        loyer_mensuel: 1000,
        type_location: 'nue',
    } as unknown as ExploitationData;

    it('devrait exclure la CFE si loyerAnnuel < cfeSeuilExoneration (4 900 € < 5 000 €)', () => {
        const loyerAnnuel = 4900; // sous le seuil → exonéré
        const result = calculerChargesAnnuelles(baseExploitation, loyerAnnuel, undefined, mockConfig);
        expect(result.charges_fixes_annuelles).toBe(0); // CFE exclue
    });

    it('devrait inclure la CFE si loyerAnnuel >= cfeSeuilExoneration (5 100 € >= 5 000 €)', () => {
        const loyerAnnuel = 5100; // au dessus du seuil → CFE incluse
        const result = calculerChargesAnnuelles(baseExploitation, loyerAnnuel, undefined, mockConfig);
        expect(result.charges_fixes_annuelles).toBe(300); // CFE incluse
    });
});

// ============================================================================
// REC-01 : Frais de notaire par tranches réelles (Décret 2016-230)
// ============================================================================
describe('REC-01 : calculerFraisNotairePrecis - calcul par tranches', () => {
    it('baseTaxable = 0 → retourner 0', () => {
        expect(calculerFraisNotairePrecis(0, 'ancien', mockConfig)).toBe(0);
    });

    it('bien ancien 200 000 € → frais détaillés ≈ 15 000 €', () => {
        // Emoluments : 251.55 + 167.58 + 457.52 + 1118.60 = 1995.25, ×1.2 = 2394.30
        // DMTO : 200000 × 5.80665% = 11613.30
        // CSI : 200000 × 0.1% = 200.00
        // Débours : 800
        // Total ≈ 15007.60
        const result = calculerFraisNotairePrecis(200000, 'ancien', mockConfig);
        expect(result).toBeCloseTo(15007.60, 0);
    });

    it('bien neuf 200 000 € → DMTO réduit (0.715%), total ≈ 4 800 €', () => {
        // Emoluments ×1.2 = 2394.30
        // DMTO neuf : 200000 × 0.715% = 1430
        // CSI : 200 + Débours : 800
        // Total ≈ 4824.30
        const result = calculerFraisNotairePrecis(200000, 'neuf', mockConfig);
        expect(result).toBeCloseTo(4824.30, 0);
        // Nettement inférieur au cas ancien
        expect(result).toBeLessThan(calculerFraisNotairePrecis(200000, 'ancien', mockConfig));
    });

    it('bien ancien 100 000 € → frais ≈ 8 100 € (cohérent avec l\'ancien forfait 8 %)', () => {
        // Total ≈ 8142
        const result = calculerFraisNotairePrecis(100000, 'ancien', mockConfig);
        expect(result).toBeGreaterThan(7500);
        expect(result).toBeLessThan(9000);
    });

    it('émoluments par tranches sont progressifs (100k < 200k < 300k)', () => {
        const f100 = calculerFraisNotairePrecis(100000, 'ancien', mockConfig);
        const f200 = calculerFraisNotairePrecis(200000, 'ancien', mockConfig);
        const f300 = calculerFraisNotairePrecis(300000, 'ancien', mockConfig);
        expect(f200).toBeGreaterThan(f100);
        expect(f300).toBeGreaterThan(f200);
    });
});
