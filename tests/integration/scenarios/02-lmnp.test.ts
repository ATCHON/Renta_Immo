import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

describe('SC — LMNP (Loueur en Meublé)', () => {
  it('SC-05 [CGI Art.50-0] LMNP Micro-BIC longue durée: abattement 50%', async () => {
    const input = createBaseInput({
      bien: { valeur_mobilier: 5000 },
      exploitation: {
        loyer_mensuel: 900,
        type_location: 'meublee_longue_duree',
        provision_travaux: 0,
        provision_vacance: 0,
        gestion_locative: 0,
      },
      structure: { regime_fiscal: 'lmnp_micro', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toMatch(/LMNP.*(Micro|micro).*BIC|Micro.*BIC.*LMNP/i);
    // Base = 10 800 × 50% = 5 400; IR = 1 620; PS(18.6%) = 1 004
    // Total ≈ 2 624 €
    expect(fiscalite.impot_estime).toBeGreaterThan(2400);
    expect(fiscalite.impot_estime).toBeLessThan(2900);
  });

  it('SC-06 [CGI Art.50-0 LF2024] LMNP Micro-BIC tourisme classé: abattement 71%', async () => {
    const input = createBaseInput({
      bien: { valeur_mobilier: 10000 },
      exploitation: {
        loyer_mensuel: 2500,
        type_location: 'meublee_tourisme_classe',
        provision_travaux: 0,
        provision_vacance: 0,
        gestion_locative: 0,
      },
      structure: { regime_fiscal: 'lmnp_micro', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    // Base = 30 000 × (1-0.71) = 8 700; IR = 2 610; PS(18.6%) = 1 618
    expect(fiscalite.impot_estime).toBeGreaterThan(3900);
    expect(fiscalite.impot_estime).toBeLessThan(4600);
  });

  it('SC-07 [CGI Art.50-0 LF2024] LMNP Micro-BIC tourisme non classé: abattement 30%', async () => {
    const input = createBaseInput({
      bien: { valeur_mobilier: 5000 },
      exploitation: {
        loyer_mensuel: 1100,
        type_location: 'meublee_tourisme_non_classe',
        provision_travaux: 0,
        provision_vacance: 0,
        gestion_locative: 0,
      },
      structure: { regime_fiscal: 'lmnp_micro', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    // Base = 13 200 × 70% = 9 240; IR = 2 772; PS(18.6%) = 1 719
    expect(fiscalite.impot_estime).toBeGreaterThan(4100);
    expect(fiscalite.impot_estime).toBeLessThan(4900);
  });

  it('SC-08 [CGI Art.39C] LMNP Réel: amortissements plafonnés — base imposable nulle', async () => {
    const input = createBaseInput({
      bien: {
        prix_achat: 200000,
        montant_travaux: 0,
        valeur_mobilier: 5000,
      },
      exploitation: {
        loyer_mensuel: 900,
        type_location: 'meublee_longue_duree',
        provision_travaux: 0,
        provision_vacance: 0,
        gestion_locative: 0,
        comptable_annuel: 400,
      },
      structure: { regime_fiscal: 'lmnp_reel', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toMatch(/LMNP.*(Réel|reel|Réel)/i);
    // Amorts (5 652/an) > bénéfice résiduel → base = 0 → impôt = 0
    expect(fiscalite.impot_estime).toBe(0);
  });

  it('SC-09 [CGI Art.39C] LMNP Réel: bénéfice résiduel positif si amorts insuffisants', async () => {
    const input = createBaseInput({
      bien: {
        prix_achat: 200000,
        montant_travaux: 0,
        valeur_mobilier: 1000,
      },
      exploitation: {
        loyer_mensuel: 2000,
        type_location: 'meublee_longue_duree',
        provision_travaux: 0,
        provision_vacance: 0,
        gestion_locative: 0,
        comptable_annuel: 400,
      },
      structure: { regime_fiscal: 'lmnp_reel', tmi: 41 },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    // Revenus élevés > charges + amorts → base imposable > 0 → impôt > 0
    expect(result.resultats.fiscalite.impot_estime).toBeGreaterThan(0);
  });

  it('SC-10 [CGI Art.155IV] LMNP: alerte seuil LMP (loyers > 20 000€/an)', async () => {
    const input = createBaseInput({
      exploitation: {
        loyer_mensuel: 1800,
        type_location: 'meublee_longue_duree',
        provision_travaux: 0,
        provision_vacance: 0,
        gestion_locative: 0,
      },
      structure: { regime_fiscal: 'lmnp_reel', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const allMessages = [
      ...result.alertes,
      ...result.resultats.synthese.points_attention,
      ...(result.resultats.synthese.points_attention_detail ?? []).map((p) => p.message),
    ]
      .join(' ')
      .toLowerCase();

    expect(allMessages).toMatch(/lmp|loueur.*meublé.*professionnel/i);
  });
});
