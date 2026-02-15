import { describe, it, expect } from 'vitest';
import { calculerChargesAnnuelles } from './rentabilite';
import type { ExploitationData } from '@/lib/validators';

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
        const result = calculerChargesAnnuelles(exploitationMock, loyerAnnuel, undefined);

        // Vacance = 5% of 12000 = 600
        expect(result.charges_proportionnelles_annuelles).toBe(600);
    });

    it('devrait EXCLURE la provision vacance quand tauxOccupation < 1 est fourni', () => {
        const tauxOccupation = 0.9;
        const loyerAnnuel = 12000 * 0.9; // 10800

        const result = calculerChargesAnnuelles(exploitationMock, loyerAnnuel, tauxOccupation);

        // Vacance should be 0 because tauxOccupation is defined
        expect(result.charges_proportionnelles_annuelles).toBe(0);
    });

    it('devrait EXCLURE la provision vacance si tauxOccupation = 1 (explicite)', () => {
        // Si l'utilisateur force 100%, on respecte son choix et on n'ajoute pas de provision arbitraire
        const result = calculerChargesAnnuelles(exploitationMock, 12000, 1);
        expect(result.charges_proportionnelles_annuelles).toBe(0);
    });
});
