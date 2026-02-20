import { describe, it, expect } from 'vitest';
import {
  bienSchema,
  financementSchema,
  exploitationSchema,
  structureSchema,
  optionsSchema,
  calculateurFormSchema,
} from '@/lib/validators';

// =============================================================================
// bienSchema
// =============================================================================
describe('bienSchema', () => {
  const validBien = {
    adresse: '10 rue de la Paix, Paris',
    prix_achat: 150000,
    type_bien: 'appartement',
  };

  it('accepte des données valides', () => {
    const result = bienSchema.safeParse(validBien);
    expect(result.success).toBe(true);
  });

  it('rejette une adresse trop courte', () => {
    const result = bienSchema.safeParse({ ...validBien, adresse: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejette un prix négatif', () => {
    const result = bienSchema.safeParse({ ...validBien, prix_achat: -100 });
    expect(result.success).toBe(false);
  });

  it('rejette un prix inférieur au minimum (10 000€)', () => {
    const result = bienSchema.safeParse({ ...validBien, prix_achat: 5000 });
    expect(result.success).toBe(false);
  });

  it('accepte un prix au minimum', () => {
    const result = bienSchema.safeParse({ ...validBien, prix_achat: 10000 });
    expect(result.success).toBe(true);
  });

  it('accepte une surface valide (optionnel)', () => {
    const result = bienSchema.safeParse({ ...validBien, surface: 100 });
    expect(result.success).toBe(true);
  });

  it('rejette une surface négative', () => {
    const result = bienSchema.safeParse({ ...validBien, surface: -10 });
    expect(result.success).toBe(false);
  });

  it('coerce les strings en nombres', () => {
    const result = bienSchema.safeParse({ ...validBien, prix_achat: '200000' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.prix_achat).toBe(200000);
    }
  });

  it('accepte les valeurs DPE valides', () => {
    for (const dpe of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
      const result = bienSchema.safeParse({ ...validBien, dpe });
      expect(result.success).toBe(true);
    }
  });

  it('rejette une valeur DPE invalide', () => {
    const result = bienSchema.safeParse({ ...validBien, dpe: 'X' });
    expect(result.success).toBe(false);
  });

  it('accepte un DPE vide (optionnel)', () => {
    const result = bienSchema.safeParse({ ...validBien, dpe: '' });
    expect(result.success).toBe(true);
  });

  it('gère renovation_energetique par défaut à false', () => {
    const result = bienSchema.safeParse(validBien);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.renovation_energetique).toBe(false);
    }
  });

  it('rejette un type_bien invalide', () => {
    const result = bienSchema.safeParse({ ...validBien, type_bien: 'garage' });
    expect(result.success).toBe(false);
  });

  it('gère etat_bien avec défaut "ancien"', () => {
    const result = bienSchema.safeParse(validBien);
    if (result.success) {
      expect(result.data.etat_bien).toBe('ancien');
    }
  });
});

// =============================================================================
// financementSchema
// =============================================================================
describe('financementSchema', () => {
  const validFinancement = {
    apport: 30000,
    taux_interet: 3.5,
    duree_emprunt: 20,
    assurance_pret: 0.3,
  };

  it('accepte des données valides', () => {
    const result = financementSchema.safeParse(validFinancement);
    expect(result.success).toBe(true);
  });

  it('rejette un apport négatif', () => {
    const result = financementSchema.safeParse({ ...validFinancement, apport: -1 });
    expect(result.success).toBe(false);
  });

  it('rejette un taux trop élevé (> 20)', () => {
    const result = financementSchema.safeParse({ ...validFinancement, taux_interet: 25 });
    expect(result.success).toBe(false);
  });

  it('rejette une durée hors limites', () => {
    expect(financementSchema.safeParse({ ...validFinancement, duree_emprunt: 0 }).success).toBe(
      false
    );
    expect(financementSchema.safeParse({ ...validFinancement, duree_emprunt: 31 }).success).toBe(
      false
    );
  });

  it('applique les valeurs par défaut pour frais_dossier et frais_garantie', () => {
    const result = financementSchema.safeParse(validFinancement);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.frais_dossier).toBe(0);
      expect(result.data.frais_garantie).toBe(0);
      expect(result.data.mode_assurance).toBe('capital_initial');
    }
  });
});

// =============================================================================
// exploitationSchema
// =============================================================================
describe('exploitationSchema', () => {
  const validExploitation = {
    loyer_mensuel: 750,
    charges_copro: 100,
    taxe_fonciere: 800,
    assurance_pno: 200,
    gestion_locative: 8,
    provision_travaux: 5,
    provision_vacance: 5,
  };

  it('accepte des données valides', () => {
    const result = exploitationSchema.safeParse(validExploitation);
    expect(result.success).toBe(true);
  });

  it('rejette un loyer négatif ou zéro', () => {
    expect(exploitationSchema.safeParse({ ...validExploitation, loyer_mensuel: 0 }).success).toBe(
      false
    );
    expect(
      exploitationSchema.safeParse({ ...validExploitation, loyer_mensuel: -100 }).success
    ).toBe(false);
  });

  it('rejette un taux de vacance trop élevé (> 50)', () => {
    const result = exploitationSchema.safeParse({ ...validExploitation, provision_vacance: 60 });
    expect(result.success).toBe(false);
  });

  it('applique les défauts pour les champs optionnels', () => {
    const result = exploitationSchema.safeParse(validExploitation);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type_location).toBe('nue');
      expect(result.data.taux_occupation).toBe(1);
      expect(result.data.charges_copro_recuperables).toBe(0);
    }
  });
});

// =============================================================================
// structureSchema
// =============================================================================
describe('structureSchema', () => {
  const validStructure = {
    type: 'nom_propre',
    tmi: 30,
    associes: [],
    regime_fiscal: 'reel',
  };

  it('accepte des données valides pour nom propre', () => {
    const result = structureSchema.safeParse(validStructure);
    expect(result.success).toBe(true);
  });

  it('accepte des données valides pour SCI IS', () => {
    const result = structureSchema.safeParse({ ...validStructure, type: 'sci_is' });
    expect(result.success).toBe(true);
  });

  it('rejette un type de structure invalide', () => {
    const result = structureSchema.safeParse({ ...validStructure, type: 'sarl' });
    expect(result.success).toBe(false);
  });

  it('rejette un TMI négatif', () => {
    const result = structureSchema.safeParse({ ...validStructure, tmi: -5 });
    expect(result.success).toBe(false);
  });

  it('rejette un TMI supérieur à 50', () => {
    const result = structureSchema.safeParse({ ...validStructure, tmi: 55 });
    expect(result.success).toBe(false);
  });

  it('valide les associés avec parts = 100%', () => {
    const result = structureSchema.safeParse({
      ...validStructure,
      associes: [
        { nom: 'Alice', parts: 60, revenus: 50000, mensualites: 500, charges: 200 },
        { nom: 'Bob', parts: 40, revenus: 40000, mensualites: 300, charges: 100 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejette les associés avec parts != 100%', () => {
    const result = structureSchema.safeParse({
      ...validStructure,
      associes: [
        { nom: 'Alice', parts: 60, revenus: 50000, mensualites: 500, charges: 200 },
        { nom: 'Bob', parts: 20, revenus: 40000, mensualites: 300, charges: 100 },
      ],
    });
    expect(result.success).toBe(false);
  });
});

// =============================================================================
// optionsSchema
// =============================================================================
describe('optionsSchema', () => {
  it('accepte des options valides sans email', () => {
    const result = optionsSchema.safeParse({
      generer_pdf: true,
      envoyer_email: false,
    });
    expect(result.success).toBe(true);
  });

  it('rejette quand envoyer_email est true sans email', () => {
    const result = optionsSchema.safeParse({
      generer_pdf: true,
      envoyer_email: true,
    });
    expect(result.success).toBe(false);
  });

  it('rejette email invalide quand envoyer_email est true', () => {
    const result = optionsSchema.safeParse({
      generer_pdf: true,
      envoyer_email: true,
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });

  it('accepte un email valide quand envoyer_email est true', () => {
    const result = optionsSchema.safeParse({
      generer_pdf: true,
      envoyer_email: true,
      email: 'test@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('applique les défauts pour horizon, taux, profil, ponderation', () => {
    const result = optionsSchema.safeParse({
      generer_pdf: false,
      envoyer_email: false,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.horizon_projection).toBe(20);
      expect(result.data.taux_evolution_loyer).toBe(2);
      expect(result.data.taux_evolution_charges).toBe(2.5);
      expect(result.data.profil_investisseur).toBe('rentier');
      expect(result.data.ponderation_loyers).toBe(70);
    }
  });
});

// =============================================================================
// calculateurFormSchema (schéma complet)
// =============================================================================
describe('calculateurFormSchema', () => {
  it('valide un formulaire complet', () => {
    const fullForm = {
      bien: {
        adresse: '10 rue de la Paix, Paris',
        prix_achat: 150000,
        type_bien: 'appartement',
      },
      financement: {
        apport: 30000,
        taux_interet: 3.5,
        duree_emprunt: 20,
        assurance_pret: 0.3,
      },
      exploitation: {
        loyer_mensuel: 750,
        charges_copro: 100,
        taxe_fonciere: 800,
        assurance_pno: 200,
        gestion_locative: 8,
        provision_travaux: 5,
        provision_vacance: 5,
      },
      structure: {
        type: 'nom_propre',
        tmi: 30,
        associes: [],
        regime_fiscal: 'reel',
      },
      options: {
        generer_pdf: false,
        envoyer_email: false,
      },
    };

    const result = calculateurFormSchema.safeParse(fullForm);
    expect(result.success).toBe(true);
  });

  it('rejette un formulaire incomplet', () => {
    const result = calculateurFormSchema.safeParse({
      bien: { adresse: 'test' },
    });
    expect(result.success).toBe(false);
  });
});
