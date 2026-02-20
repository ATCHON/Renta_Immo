import { describe, it, expect } from 'vitest';
import {
  TMI_OPTIONS,
  TYPE_BIEN_OPTIONS,
  TYPE_LOCATION_OPTIONS,
  STRUCTURE_OPTIONS,
  REGIME_FISCAL_OPTIONS,
  HCSF,
  FISCALITE,
  DEFAULT_VALUES,
  LIMITS,
  ERROR_MESSAGES,
  STEP_LABELS,
} from '@/lib/constants';

// =============================================================================
// TMI_OPTIONS
// =============================================================================
describe('TMI_OPTIONS', () => {
  it('contient 5 tranches marginales', () => {
    expect(TMI_OPTIONS).toHaveLength(5);
  });

  it('contient les taux 0, 11, 30, 41, 45', () => {
    const values = TMI_OPTIONS.map((o) => o.value);
    expect(values).toEqual([0, 11, 30, 41, 45]);
  });

  it('chaque option a un label non vide', () => {
    TMI_OPTIONS.forEach((o) => {
      expect(o.label).toBeTruthy();
    });
  });
});

// =============================================================================
// TYPE_BIEN_OPTIONS
// =============================================================================
describe('TYPE_BIEN_OPTIONS', () => {
  it('contient appartement, maison, immeuble', () => {
    const values = TYPE_BIEN_OPTIONS.map((o) => o.value);
    expect(values).toContain('appartement');
    expect(values).toContain('maison');
    expect(values).toContain('immeuble');
  });
});

// =============================================================================
// TYPE_LOCATION_OPTIONS
// =============================================================================
describe('TYPE_LOCATION_OPTIONS', () => {
  it('contient 4 types de location', () => {
    expect(TYPE_LOCATION_OPTIONS).toHaveLength(4);
  });

  it('contient nue et meublée', () => {
    const values = TYPE_LOCATION_OPTIONS.map((o) => o.value);
    expect(values).toContain('nue');
    expect(values).toContain('meublee_longue_duree');
  });
});

// =============================================================================
// STRUCTURE_OPTIONS
// =============================================================================
describe('STRUCTURE_OPTIONS', () => {
  it('contient nom_propre et sci_is', () => {
    const values = STRUCTURE_OPTIONS.map((o) => o.value);
    expect(values).toEqual(['nom_propre', 'sci_is']);
  });

  it('chaque option a une description', () => {
    STRUCTURE_OPTIONS.forEach((o) => {
      expect(o.description).toBeTruthy();
    });
  });
});

// =============================================================================
// REGIME_FISCAL_OPTIONS
// =============================================================================
describe('REGIME_FISCAL_OPTIONS', () => {
  it('contient 4 régimes fiscaux', () => {
    expect(REGIME_FISCAL_OPTIONS).toHaveLength(4);
  });

  it('contient micro_foncier, reel, lmnp_micro, lmnp_reel', () => {
    const values = REGIME_FISCAL_OPTIONS.map((o) => o.value);
    expect(values).toEqual(['micro_foncier', 'reel', 'lmnp_micro', 'lmnp_reel']);
  });
});

// =============================================================================
// HCSF
// =============================================================================
describe('HCSF', () => {
  it("a un taux d'endettement max de 35%", () => {
    expect(HCSF.TAUX_ENDETTEMENT_MAX).toBe(35);
  });

  it("a un taux d'alerte de 33%", () => {
    expect(HCSF.TAUX_ENDETTEMENT_ALERTE).toBe(33);
  });

  it('a une durée max de 25 ans', () => {
    expect(HCSF.DUREE_MAX_ANNEES).toBe(25);
  });

  it('a une pondération revenus locatifs de 70%', () => {
    expect(HCSF.PONDERATION_REVENUS_LOCATIFS).toBe(0.7);
  });
});

// =============================================================================
// FISCALITE
// =============================================================================
describe('FISCALITE', () => {
  it('a des prélèvements sociaux à 17.2%', () => {
    expect(FISCALITE.PRELEVEMENTS_SOCIAUX).toBe(0.172);
  });

  it('a un abattement micro-foncier à 30%', () => {
    expect(FISCALITE.MICRO_FONCIER_ABATTEMENT).toBe(0.3);
  });

  it('a un plafond micro-foncier à 15 000€', () => {
    expect(FISCALITE.MICRO_FONCIER_PLAFOND).toBe(15000);
  });

  it('a un taux IS réduit de 15%', () => {
    expect(FISCALITE.IS_TAUX_REDUIT).toBe(0.15);
  });

  it('a un taux IS normal de 25%', () => {
    expect(FISCALITE.IS_TAUX_NORMAL).toBe(0.25);
  });

  it('a une flat tax de 30%', () => {
    expect(FISCALITE.FLAT_TAX).toBe(0.3);
  });
});

// =============================================================================
// DEFAULT_VALUES
// =============================================================================
describe('DEFAULT_VALUES', () => {
  it("a un taux d'intérêt par défaut de 3.5%", () => {
    expect(DEFAULT_VALUES.TAUX_INTERET).toBe(3.5);
  });

  it('a une durée par défaut de 20 ans', () => {
    expect(DEFAULT_VALUES.DUREE_EMPRUNT).toBe(20);
  });
});

// =============================================================================
// LIMITS
// =============================================================================
describe('LIMITS', () => {
  it('a un prix minimum de 10 000€', () => {
    expect(LIMITS.PRIX_MIN).toBe(10000);
  });

  it('a un prix maximum de 100 000 000€', () => {
    expect(LIMITS.PRIX_MAX).toBe(100000000);
  });

  it('a une durée max de 30 ans', () => {
    expect(LIMITS.DUREE_MAX).toBe(30);
  });
});

// =============================================================================
// ERROR_MESSAGES
// =============================================================================
describe('ERROR_MESSAGES', () => {
  it("contient les messages d'erreur requis", () => {
    expect(ERROR_MESSAGES.REQUIRED).toBeTruthy();
    expect(ERROR_MESSAGES.INVALID_NUMBER).toBeTruthy();
    expect(ERROR_MESSAGES.POSITIVE_NUMBER).toBeTruthy();
    expect(ERROR_MESSAGES.EMAIL_INVALID).toBeTruthy();
    expect(ERROR_MESSAGES.PARTS_TOTAL).toBeTruthy();
  });
});

// =============================================================================
// STEP_LABELS
// =============================================================================
describe('STEP_LABELS', () => {
  it('contient 6 étapes', () => {
    expect(STEP_LABELS).toHaveLength(6);
  });

  it('commence par "Bien immobilier"', () => {
    expect(STEP_LABELS[0]).toBe('Bien immobilier');
  });

  it('finit par "Options"', () => {
    expect(STEP_LABELS[5]).toBe('Options');
  });
});
