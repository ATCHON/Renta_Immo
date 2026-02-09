import { describe, it, expect } from 'vitest';
import { genererProjections } from './projection';
import type { CalculationInput } from './types';

describe('AUDIT-108 : Frais de revente dans le TRI', () => {
  const baseInput: CalculationInput = {
    bien: {
      adresse: 'Test', prix_achat: 200000, type_bien: 'appartement',
      etat_bien: 'ancien', montant_travaux: 0, valeur_mobilier: 0,
    },
    financement: {
      apport: 20000, taux_interet: 3.5, duree_emprunt: 20,
      assurance_pret: 0.3, frais_dossier: 0, frais_garantie: 0,
    },
    exploitation: {
      loyer_mensuel: 900, charges_copro: 100, taxe_fonciere: 1000,
      assurance_pno: 150, gestion_locative: 7, provision_travaux: 5,
      provision_vacance: 5, type_location: 'nue',
      charges_copro_recuperables: 0, assurance_gli: 0,
      cfe_estimee: 0, comptable_annuel: 0,
    },
    structure: {
      type: 'nom_propre', tmi: 30, associes: [],
      regime_fiscal: 'reel',
    },
    options: {
      generer_pdf: false, envoyer_email: false,
      horizon_projection: 20,
    },
  };

  it('déduit les frais de revente par défaut (5% + 500€ diagnostics)', () => {
    const result = genererProjections(baseInput, 20);
    expect(result.totaux.frais_revente).toBeDefined();
    const derniere = result.projections[result.projections.length - 1];
    const expectedFrais = Math.round(derniere.valeurBien * 0.05 + 500);
    expect(result.totaux.frais_revente).toBe(expectedFrais);
  });

  it('applique un taux custom (0% = vente entre particuliers)', () => {
    const inputSansFrais: CalculationInput = {
      ...baseInput,
      options: { ...baseInput.options, taux_agence_revente: 0 },
    };
    const result = genererProjections(inputSansFrais, 20);
    expect(result.totaux.frais_revente).toBe(500); // Seulement diagnostics
  });

  it('réduit le TRI par rapport à une version sans frais', () => {
    const inputSansFrais: CalculationInput = {
      ...baseInput,
      options: { ...baseInput.options, taux_agence_revente: 0 },
    };
    const avecFrais = genererProjections(baseInput, 20);
    const sansFrais = genererProjections(inputSansFrais, 20);
    expect(avecFrais.totaux.tri).toBeLessThanOrEqual(sansFrais.totaux.tri);
  });

  it('réduit l\'enrichissement total du montant exact des frais d\'agence', () => {
    const inputSansFrais: CalculationInput = {
      ...baseInput,
      options: { ...baseInput.options, taux_agence_revente: 0 },
    };
    const avecFrais = genererProjections(baseInput, 20);
    const sansFrais = genererProjections(inputSansFrais, 20);
    const fraisDefaut = avecFrais.totaux.frais_revente ?? 0;
    // La différence d'enrichissement = frais agence (les diagnostics sont dans les deux)
    const ecart = sansFrais.totaux.enrichissementTotal - avecFrais.totaux.enrichissementTotal;
    expect(ecart).toBe(fraisDefaut - 500);
  });
});
