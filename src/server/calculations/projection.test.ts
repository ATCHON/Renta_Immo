import { describe, it, expect } from 'vitest';
import { calculerTRI, genererProjections } from './projection';
import { CalculationInput } from './types';

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
