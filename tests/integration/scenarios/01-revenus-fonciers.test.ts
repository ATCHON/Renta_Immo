import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

describe('SC — Revenus Fonciers (Location Nue)', () => {
  it('SC-01 [CGI Art.32] Micro-foncier: abattement 30%, base imposable correcte', async () => {
    const input = createBaseInput({
      bien: { montant_travaux: 0, valeur_mobilier: 0 },
      exploitation: {
        loyer_mensuel: 800,
        type_location: 'nue',
        charges_copro: 50,
        taxe_fonciere: 800,
        assurance_pno: 150,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      structure: { regime_fiscal: 'micro_foncier', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toMatch(/[Mm]icro.?foncier/i);

    // Base = 9 600 × 0.7 = 6 720 €; IR = 6 720 × 30% = 2 016; PS = 6 720 × 17.2% = 1 155.84
    // Total ≈ 3 172 €
    expect(fiscalite.impot_estime).toBeGreaterThan(3000);
    expect(fiscalite.impot_estime).toBeLessThan(3350);
  });

  it('SC-02 [CGI Art.156] Déficit foncier: charges annuelles > revenus, impôt réduit', async () => {
    // Loyer faible + charges élevées + financement important = déficit foncier
    // Loyer 500€/mois = 6 000€/an
    // Charges: copro 200 + TF 2000 + PNO 300 = 2 500€/an
    // Intérêts an 1 sur 200k à 3.5% ≈ 7 000€
    // Total charges + intérêts ≈ 9 500€ > 6 000€ → déficit
    const input = createBaseInput({
      bien: {
        prix_achat: 200000,
        montant_travaux: 0,
        valeur_mobilier: 0,
        etat_bien: 'ancien',
      },
      financement: {
        apport: 10000,
        taux_interet: 3.5,
        duree_emprunt: 25,
        assurance_pret: 0.1,
        frais_dossier: 0,
        frais_garantie: 0,
      },
      exploitation: {
        loyer_mensuel: 500,
        type_location: 'nue',
        charges_copro: 200,
        taxe_fonciere: 2000,
        assurance_pno: 300,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      structure: { regime_fiscal: 'reel', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toMatch(/[Ff]oncier.*(réel|reel)/i);
    // Déficit → impôt réduit (≤ 0 ou très faible par rapport au cas positif)
    expect(fiscalite.impot_estime).toBeLessThanOrEqual(0);
    // Plafond 10 700€ : économie max = 10 700 × 30% = 3 210 €
    expect(fiscalite.impot_estime).toBeGreaterThan(-4000);
  });

  it('SC-03 [CGI Art.156 LF2023] Déficit majoré énergie: impôt réduit, plafond 21 400€', async () => {
    // Même structure que SC-02 avec bien DPE F + rénovation énergétique
    const input = createBaseInput({
      bien: {
        prix_achat: 200000,
        montant_travaux: 0,
        valeur_mobilier: 0,
        etat_bien: 'ancien',
        dpe: 'F',
        renovation_energetique: true,
        annee_travaux: 2024,
      },
      financement: {
        apport: 10000,
        taux_interet: 3.5,
        duree_emprunt: 25,
        assurance_pret: 0.1,
        frais_dossier: 0,
        frais_garantie: 0,
      },
      exploitation: {
        loyer_mensuel: 500,
        type_location: 'nue',
        charges_copro: 200,
        taxe_fonciere: 2000,
        assurance_pno: 300,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      structure: { regime_fiscal: 'reel', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Avec DPE F + rénovation énergétique : plafond majoré 21 400€
    expect(result.resultats.fiscalite.impot_estime).toBeLessThanOrEqual(0);
    // Économie max plafonnée = 21 400 × 30% = 6 420 → impôt jamais < -6 500
    expect(result.resultats.fiscalite.impot_estime).toBeGreaterThan(-7500);
  });

  it('SC-04 [CGI Art.28] Foncier réel positif: IR + PS sur revenu net', async () => {
    const input = createBaseInput({
      bien: { montant_travaux: 0, valeur_mobilier: 0 },
      exploitation: {
        loyer_mensuel: 1200,
        type_location: 'nue',
        charges_copro: 80,
        taxe_fonciere: 1200,
        assurance_pno: 150,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      structure: { regime_fiscal: 'reel', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toMatch(/[Ff]oncier.*(réel|reel)/i);
    // Revenu net positif → impôt positif
    expect(fiscalite.impot_estime).toBeGreaterThan(0);
  });
});
