/**
 * Test pour BUG-CALC-01 : Prix de revente saisi ignoré
 * Vérifie que le prix_revente saisi par l'utilisateur est bien utilisé
 * au lieu de la valeur revaluée automatiquement
 */

import { describe, it, expect } from 'vitest';
import { genererProjections } from './projection';
import { mockConfig } from './__tests__/mock-config';
import type { CalculationInput } from './types';

describe('BUG-CALC-01: Prix de revente ignoré', () => {
  const baseInput: CalculationInput = {
    bien: {
      adresse: '123 rue Test, Paris',
      prix_achat: 200000,
      surface: 50,
      type_bien: 'appartement',
      etat_bien: 'ancien',
      montant_travaux: 0,
      valeur_mobilier: 0,
      part_terrain: 0.1,
    },
    financement: {
      apport: 0,
      taux_interet: 3.5,
      duree_emprunt: 20,
      assurance_pret: 0.3,
      frais_dossier: 0,
      frais_garantie: 2000,
      mode_assurance: 'capital_initial',
    },
    exploitation: {
      loyer_mensuel: 1000,
      charges_copro: 0,
      taxe_fonciere: 0,
      assurance_pno: 0,
      gestion_locative: 0,
      provision_travaux: 5,
      provision_vacance: 5,
      charges_copro_recuperables: 0,
      assurance_gli: 0,
      cfe_estimee: 0,
      comptable_annuel: 0,
      type_location: 'nue',
      taux_occupation: 0.92,
    },
    structure: {
      type: 'nom_propre',
      tmi: 30,
      regime_fiscal: 'micro_foncier',
      associes: [],
      credits_immobiliers: 0,
      loyers_actuels: 0,
      revenus_activite: 0,
      distribution_dividendes: false,
      autres_charges: 0,
      mode_amortissement: 'simplifie',
    },
    options: {
      generer_pdf: false,
      envoyer_email: false,
      horizon_projection: 20,
      taux_evolution_loyer: 2,
      taux_evolution_charges: 2.5,
      taux_agence_revente: 5,
      profil_investisseur: 'rentier',
      ponderation_loyers: 70,
    },
  };

  it('doit utiliser le prix de revente saisi par l\'utilisateur', () => {
    // ARRANGE: L'utilisateur saisit un prix de revente de 250 000 €
    const input = {
      ...baseInput,
      options: {
        ...baseInput.options,
        prix_revente: 250000,  // ← Prix saisi
        duree_detention: 20,
      },
    };

    // ACT: Générer les projections
    const result = genererProjections(input, mockConfig, 20);

    // ASSERT: Le prix de vente utilisé doit être celui saisi (250 000 €)
    expect(result.plusValue).toBeDefined();
    expect(result.plusValue!.prix_vente).toBe(250000);

    // Vérifier que ce n'est PAS la valeur revaluée
    const derniereProjection = result.projections[result.projections.length - 1];
    const valeurRevaluee = derniereProjection.valeurBien;
    expect(result.plusValue!.prix_vente).not.toBe(valeurRevaluee);

    // Log pour debug
    console.log('[BUG-CALC-01] Prix saisi:', 250000);
    console.log('[BUG-CALC-01] Prix utilisé:', result.plusValue!.prix_vente);
    console.log('[BUG-CALC-01] Valeur revaluée:', valeurRevaluee);
  });

  it('doit utiliser la valeur revaluée si prix_revente n\'est pas saisi', () => {
    // ARRANGE: L'utilisateur ne saisit PAS de prix de revente
    const input = {
      ...baseInput,
      options: {
        ...baseInput.options,
        prix_revente: undefined,  // ← Non saisi
      },
    };

    // ACT: Générer les projections
    const result = genererProjections(input, mockConfig, 20);

    // ASSERT: Le prix de vente doit être la valeur revaluée
    const derniereProjection = result.projections[result.projections.length - 1];
    const valeurRevaluee = derniereProjection.valeurBien;

    expect(result.plusValue).toBeDefined();
    expect(result.plusValue!.prix_vente).toBe(valeurRevaluee);
  });

  it('doit calculer la PV brute correctement avec prix_revente saisi', () => {
    // ARRANGE
    const input = {
      ...baseInput,
      options: {
        ...baseInput.options,
        prix_revente: 250000,
        duree_detention: 10,
      },
    };

    // ACT
    const result = genererProjections(input, mockConfig, 20);

    // ASSERT
    // Prix acquisition corrigé ≈ 200000 + 16000 (notaire) + 15000 (forfait acquisition) + 30000 (forfait travaux >5ans)
    // = 261000 (approximativement)
    // PV brute attendue ≈ 250000 - 261000 = négatif ou faible
    expect(result.plusValue).toBeDefined();
    expect(result.plusValue!.prix_vente).toBe(250000);
    expect(result.plusValue!.plus_value_brute).toBeLessThan(20000);

    // Avec la valeur revaluée (265784€), la PV brute serait plus élevée
    console.log('[BUG-CALC-01] PV brute avec prix saisi (250k):', result.plusValue!.plus_value_brute);
  });
});
