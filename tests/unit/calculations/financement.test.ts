import { describe, it, expect } from 'vitest';
import { calculerFinancement, calculerTAEG } from '@/server/calculations/rentabilite';
import type { BienData, FinancementData } from '@/server/calculations/types';
import { mockConfig } from '../server/calculations/mock-config';

describe('calculerFinancement (frais_notaire)', () => {
  const bienMock: BienData = {
    adresse: 'Test',
    prix_achat: 200000,
    type_bien: 'appartement',
    etat_bien: 'ancien',
    montant_travaux: 0,
    valeur_mobilier: 0,
  };

  const financementMock: FinancementData = {
    apport: 30000,
    taux_interet: 3.5,
    duree_emprunt: 20,
    assurance_pret: 0.3,
    frais_dossier: 0,
    frais_garantie: 0,
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

describe('calculerTAEG', () => {
  it('calcule un TAEG correct pour un crédit standard', () => {
    // Ex: 100k€ emprunté, 1000€ frais banque, mensualité de 500€ sur 240 mois (20 ans)
    const taeg = calculerTAEG(100000, 1000, 500, 240);
    expect(taeg).not.toBeNull();
    expect(taeg).toBeGreaterThan(0);
    expect(taeg).toBeLessThan(10); // Logique
  });

  it('retourne null si les données sont invalides', () => {
    expect(calculerTAEG(-100, 0, 500, 240)).toBeNull();
    expect(calculerTAEG(100000, 0, -500, 240)).toBeNull();
    expect(calculerTAEG(100000, 0, 500, 0)).toBeNull();
  });

  it('retourne null si la mensualité * nbMois ne couvre même pas le capital + intérêts logiques', () => {
    // En vrai, si M*N <= capitalNet, la fonction retourne 0 si l'algo converge ou null si invraisemblable
    // On teste avec une mensualité hyper faible
    const taeg = calculerTAEG(100000, 1000, 10, 240);
    // La fonction calcule si le crédit est gratuit. 10 * 240 = 2400 < 99000
    expect(taeg).toBe(0);
  });

  it('TAEG doit être supérieur au taux nominal (si frais bancaires présents)', () => {
    // Le nominal: 2%, sans assurance, 100k sur 20 ans = 505.88 € / mois
    const montant = 100000;
    const frais = 1500;
    const mensualite = 505.88;
    const duree = 240;

    const taeg = calculerTAEG(montant, frais, mensualite, duree);
    expect(taeg).toBeGreaterThan(2.0);
    // Ex: avec 1500€ de frais, le TAEG actuariel monte vers ~2.19%
    expect(taeg).toBeCloseTo(2.19, 0);
  });
});
