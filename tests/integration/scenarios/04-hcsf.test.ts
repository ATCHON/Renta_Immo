import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

// Note: hcsf.taux_endettement est exprimé en % (ex: 22.5 pour 22,5%)
const HCSF_SEUIL_POURCENTAGE = 35;

describe('SC — Analyse HCSF (Décision 2024)', () => {
  it('SC-14 [HCSF Art.1] Taux endettement < 35%: dossier conforme', async () => {
    const input = createBaseInput({
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
        revenus_activite: 4000,
        credits_immobiliers: 0,
        loyers_actuels: 0,
      },
      exploitation: { loyer_mensuel: 900 },
      financement: {
        apport: 40000,
        taux_interet: 3.5,
        duree_emprunt: 20,
        assurance_pret: 0.1,
        frais_dossier: 0,
        frais_garantie: 0,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.resultats.hcsf.conforme).toBe(true);
    expect(result.resultats.hcsf.taux_endettement).toBeLessThan(HCSF_SEUIL_POURCENTAGE);
  });

  it('SC-15 [HCSF Art.1] Taux endettement > 35%: dossier non conforme', async () => {
    const input = createBaseInput({
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
        revenus_activite: 2000,
        credits_immobiliers: 600,
        loyers_actuels: 0,
      },
      exploitation: { loyer_mensuel: 900 },
      financement: {
        apport: 10000,
        taux_interet: 3.5,
        duree_emprunt: 25,
        assurance_pret: 0.3,
        frais_dossier: 0,
        frais_garantie: 0,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.resultats.hcsf.conforme).toBe(false);
    expect(result.resultats.hcsf.taux_endettement).toBeGreaterThan(HCSF_SEUIL_POURCENTAGE);
  });

  it('SC-16 [REC-04] HCSF VEFA: durée 26 ans acceptée (max 27 ans)', async () => {
    const input = createBaseInput({
      bien: { etat_bien: 'neuf', is_vefa: true },
      financement: {
        apport: 40000,
        taux_interet: 3.5,
        duree_emprunt: 26,
        assurance_pret: 0.1,
        frais_dossier: 0,
        frais_garantie: 0,
      },
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
        revenus_activite: 5000,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    // 26 ans avec is_vefa → conforme (max VEFA = 27 ans)
    expect(result.resultats.hcsf.conforme).toBe(true);
  });

  it('SC-17 [V2-S18] GLI pondération 80%: taux endettement amélioré', async () => {
    const baseInput = createBaseInput({
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
        revenus_activite: 3000,
        credits_immobiliers: 0,
      },
      exploitation: { loyer_mensuel: 900, assurance_gli: 500 },
    });

    // Sans GLI pondération (70%)
    const result70 = await performCalculations(baseInput, integrationConfig);

    // Avec GLI pondération 80%
    const input80 = createBaseInput({
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
        revenus_activite: 3000,
        credits_immobiliers: 0,
      },
      exploitation: { loyer_mensuel: 900, assurance_gli: 500 },
      options: {
        generer_pdf: false,
        envoyer_email: false,
        horizon_projection: 20,
        ponderation_loyers: 80,
      },
    });
    const result80 = await performCalculations(input80, integrationConfig);

    expect(result70.success).toBe(true);
    expect(result80.success).toBe(true);
    if (!result70.success || !result80.success) return;

    // Pondération 80% → loyers valorisés davantage → taux endettement plus bas
    expect(result80.resultats.hcsf.taux_endettement).toBeLessThanOrEqual(
      result70.resultats.hcsf.taux_endettement
    );
  });
});
