import { describe, it, expect } from 'vitest';
import { calculerFinancement } from '@/server/calculations/rentabilite';
import type { BienData, FinancementData } from '@/server/calculations/types';
import { mockConfig } from '@/server/calculations/__tests__/mock-config';

describe('calculerFinancement (frais_notaire)', () => {
    const bienMock: BienData = {
        adresse: 'Test',
        prix_achat: 200000,
        type_bien: 'appartement',
        etat_bien: 'ancien',
        montant_travaux: 0,
        valeur_mobilier: 0
    };

    const financementMock: FinancementData = {
        apport: 30000,
        taux_interet: 3.5,
        duree_emprunt: 20,
        assurance_pret: 0.3,
        frais_dossier: 0,
        frais_garantie: 0
    };

    it('devrait inclure frais_notaire dans le résultat du financement', () => {
        const result = calculerFinancement(bienMock, financementMock, mockConfig);

        expect(result).toHaveProperty('frais_notaire');
        expect(result.frais_notaire).toBeGreaterThan(0);
        // Pour 200k€ dans l'ancien, les frais sont env 7-8%
        expect(result.frais_notaire).toBeGreaterThan(14000);
        expect(result.frais_notaire).toBeLessThan(18000);
    });

    it('devrait calculer des frais de notaire différents pour le neuf', () => {
        const bienNeufMock = { ...bienMock, etat_bien: 'neuf' } as BienData;
        const result = calculerFinancement(bienNeufMock, financementMock, mockConfig);

        // REC-01 : frais par tranches (émoluments + DMTO réduit 0.715% + CSI + débours)
        // Base = 200000 - 5000 (mobilier) = 195000 → ~4 700 €
        expect(result.frais_notaire).toBeGreaterThan(3500);
        expect(result.frais_notaire).toBeLessThan(5500);
    });
});
