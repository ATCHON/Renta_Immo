import { describe, it, expect } from 'vitest';
import { validateAndNormalize } from './validation';

describe('Calculations Validation', () => {
  const validBaseData = {
    bien: {
      adresse: "123 Rue de la Paix",
      prix_achat: 200000,
      surface: 50,
      type_bien: "appartement",
    },
    financement: {
      apport: 20000,
      taux_interet: 3.5,
      duree_emprunt: 20,
      assurance_pret: 0.3
    },
    exploitation: {
      loyer_mensuel: 1000,
      charges_copro: 100,
      taxe_fonciere: 500,
      assurance_pno: 150,
      gestion_locative: 8,
      provision_travaux: 5,
      provision_vacance: 5
    },
    structure: {
      type: "nom_propre",
      tmi: 30,
      associes: []
    },
    options: {
      generer_pdf: false,
      envoyer_email: false,
      email: ""
    }
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
      bien: { ...validBaseData.bien, prix_achat: -100 }
    };
    
    expect(() => validateAndNormalize(invalidData)).toThrow();
  });

  it('should enforce that down payment is not greater than purchase price', () => {
    const invalidData = {
      ...validBaseData,
      financement: { ...validBaseData.financement, apport: 250000 }
    };
    
    expect(() => validateAndNormalize(invalidData)).toThrow(/apport/);
  });

  it('should apply default values for optional fields', () => {
    // We need to provide minimum valid data for Zod first
    const dataWithZeroValues = {
      ...validBaseData,
      financement: {
        ...validBaseData.financement,
        taux_interet: 0, // In our logic, 0 might trigger default
        duree_emprunt: 0, 
      }
    };
    
    // Actually, looking at validation.ts, it uses `data.financement.taux_interet || DEFAULTS...`
    // But Zod schema says min(1) for duree_emprunt. 
    // Let's test fields that are truly optional in Zod but have defaults in normalize
    
    const dataForDefaults = {
        ...validBaseData,
        financement: {
            ...validBaseData.financement,
            taux_interet: 0, // will trigger || default
            duree_emprunt: 10,
        }
    };

    const result = validateAndNormalize(dataForDefaults);
    expect(result.data.financement.taux_interet).toBe(3.5);
  });

  it('should validate SCI partners parts sum to 100%', () => {
    const sciData = {
      ...validBaseData,
      structure: {
        type: "sci_is",
        tmi: 30,
        associes: [
          { nom: "A", parts: 50, revenus: 3000, mensualites: 0, charges: 0 },
          { nom: "B", parts: 40, revenus: 3000, mensualites: 0, charges: 0 }
        ]
      }
    };
    
    expect(() => validateAndNormalize(sciData)).toThrow(/100%/);
  });
});
