import { describe, it, expect } from 'vitest';
import { validateAndNormalize, normalizeFormData } from '@/server/calculations/validation';
import type { CalculateurFormData } from '@/types/calculateur';

describe('Calculations Validation', () => {
  const validBaseData = {
    bien: {
      adresse: '123 Rue de la Paix',
      prix_achat: 200000,
      surface: 50,
      type_bien: 'appartement' as const,
      etat_bien: 'ancien' as const,
      montant_travaux: 0,
      valeur_mobilier: 0,
    },
    financement: {
      apport: 20000,
      taux_interet: 3.5,
      duree_emprunt: 20,
      assurance_pret: 0.3,
      frais_dossier: 0,
      frais_garantie: 0,
    },
    exploitation: {
      loyer_mensuel: 1000,
      charges_copro: 100,
      taxe_fonciere: 500,
      assurance_pno: 150,
      gestion_locative: 8,
      provision_travaux: 5,
      provision_vacance: 5,
      type_location: 'nue' as const,
      charges_copro_recuperables: 0,
      assurance_gli: 0,
      cfe_estimee: 0,
      comptable_annuel: 0,
    },
    structure: {
      type: 'nom_propre' as const,
      tmi: 30,
      associes: [],
    },
    options: {
      generer_pdf: false,
      envoyer_email: false,
      email: '',
    },
  };

  it('should validate and normalize correct data', () => {
    const result = validateAndNormalize(validBaseData);
    expect(result.data).toBeDefined();
    expect(result.data.bien.prix_achat).toBe(200000);
    expect(result.alertes).toBeInstanceOf(Array);
  });

  it('should throw error for invalid price', () => {
    const invalidData = {
      ...validBaseData,
      bien: { ...validBaseData.bien, prix_achat: -100 },
    };

    expect(() => validateAndNormalize(invalidData)).toThrow();
  });

  it('should enforce that down payment is not greater than purchase price', () => {
    const invalidData = {
      ...validBaseData,
      financement: { ...validBaseData.financement, apport: 250000 },
    };

    expect(() => validateAndNormalize(invalidData)).toThrow(/apport/);
  });

  it('should apply default values for optional fields', () => {
    // We need to provide minimum valid data for Zod first
    // dataWithZeroValues removed as it was unused

    // validation.ts utilise `??` pour les valeurs par défaut (pas `||`)
    // → taux_interet: 0 (achat cash) est une valeur valide et ne doit PAS être remplacé
    // La valeur par défaut 3.5 ne s'applique que si le champ est null/undefined

    const dataForDefaults = {
      ...validBaseData,
      financement: {
        ...validBaseData.financement,
        taux_interet: 0, // achat comptant : 0 est valide et conservé via ??
        duree_emprunt: 10,
      },
    };

    const result = validateAndNormalize(dataForDefaults);
    expect(result.data.financement.taux_interet).toBe(0);
  });

  it('applique la valeur par défaut à taux_interet uniquement pour null/undefined et préserve 0', () => {
    // Note : Zod coerce rejette undefined/null avant normalizeFormData — on teste normalizeFormData directement
    const makeData = (taux_interet: number | null | undefined): CalculateurFormData => ({
      ...validBaseData,
      financement: {
        ...validBaseData.financement,
        taux_interet: taux_interet as unknown as number,
      },
    });

    expect(normalizeFormData(makeData(undefined)).financement.taux_interet).toBe(3.5);
    expect(normalizeFormData(makeData(null)).financement.taux_interet).toBe(3.5);
    expect(normalizeFormData(makeData(0)).financement.taux_interet).toBe(0);
  });

  it('applique la valeur par défaut à duree_emprunt uniquement pour null/undefined et préserve 0', () => {
    // Note : Zod coerce rejette undefined/null avant normalizeFormData — on teste normalizeFormData directement
    const makeData = (duree_emprunt: number | null | undefined): CalculateurFormData => ({
      ...validBaseData,
      financement: {
        ...validBaseData.financement,
        duree_emprunt: duree_emprunt as unknown as number,
      },
    });

    expect(normalizeFormData(makeData(undefined)).financement.duree_emprunt).toBe(20);
    expect(normalizeFormData(makeData(null)).financement.duree_emprunt).toBe(20);
    expect(normalizeFormData(makeData(0)).financement.duree_emprunt).toBe(0);
  });

  it('should validate SCI partners parts sum to 100%', () => {
    const sciData = {
      ...validBaseData,
      structure: {
        type: 'sci_is',
        tmi: 30,
        associes: [
          { nom: 'Alice', parts: 50, revenus: 3000, mensualites: 0, charges: 0 },
          { nom: 'Bob', parts: 40, revenus: 3000, mensualites: 0, charges: 0 },
        ],
      },
    };

    expect(() => validateAndNormalize(sciData)).toThrow(/100%/);
  });
});
