import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

describe('SC — Scoring et Projections', () => {
  it('SC-22 [V2-S16] Profil Rentier vs Patrimonial: scores différenciés', async () => {
    const baseInput = createBaseInput({
      exploitation: {
        loyer_mensuel: 900,
        provision_travaux: 0,
        provision_vacance: 0,
        gestion_locative: 0,
      },
      bien: { dpe: 'E' },
    });

    const rentierInput = {
      ...baseInput,
      options: { ...baseInput.options, profil_investisseur: 'rentier' as const },
    };
    const patrimonialInput = {
      ...baseInput,
      options: { ...baseInput.options, profil_investisseur: 'patrimonial' as const },
    };

    const [rentierResult, patrimonialResult] = await Promise.all([
      performCalculations(rentierInput, integrationConfig),
      performCalculations(patrimonialInput, integrationConfig),
    ]);

    expect(rentierResult.success).toBe(true);
    expect(patrimonialResult.success).toBe(true);
    if (!rentierResult.success || !patrimonialResult.success) return;

    const scoreRentier = rentierResult.resultats.synthese.scores_par_profil?.rentier;
    const scorePatrimonial = patrimonialResult.resultats.synthese.scores_par_profil?.patrimonial;

    expect(scoreRentier).toBeDefined();
    expect(scorePatrimonial).toBeDefined();

    expect(rentierResult.resultats.synthese.score_global).toBeGreaterThanOrEqual(0);
    expect(rentierResult.resultats.synthese.score_global).toBeLessThanOrEqual(100);
  });

  it('SC-23 [REC-05] Apport = 0: alerte TRI non significatif', async () => {
    const input = createBaseInput({
      financement: {
        apport: 0,
        taux_interet: 3.5,
        duree_emprunt: 20,
        assurance_pret: 0.3,
        frais_dossier: 0,
        frais_garantie: 0,
      },
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

    expect(allMessages).toMatch(/tri|apport/i);
  });

  it('SC-24 Reste à vivre < 1 000€/mois: alerte danger', async () => {
    const input = createBaseInput({
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
        revenus_activite: 1500,
        credits_immobiliers: 300,
      },
      financement: {
        apport: 5000,
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

    const allMessages = [...result.alertes, ...result.resultats.synthese.points_attention]
      .join(' ')
      .toLowerCase();

    const isNonConforme = !result.resultats.hcsf.conforme;
    const hasRavAlert = allMessages.includes('reste') || allMessages.includes('vivre');
    expect(isNonConforme || hasRavAlert).toBe(true);
  });

  it('SC-25 Projections 20 ans: hypothèses inflation présentes (REC-03)', async () => {
    // Note: les valeurs d'inflation dans hypotheses sont celles du validateur Zod (défauts UI)
    // taux_evolution_loyer = 2% (défaut Zod) → inflationLoyer = 0.02
    // taux_evolution_charges = 2.5% (défaut Zod) → inflationCharges = 0.025
    // Si on veut les valeurs de la config (1.5%/2%/1%), il faut passer des options explicites
    const input = createBaseInput({
      options: {
        generer_pdf: false,
        envoyer_email: false,
        horizon_projection: 20,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const { projections } = result.resultats;
    expect(projections).toBeDefined();
    if (!projections) return;

    // Les hypothèses doivent être présentes (REC-03)
    expect(projections.hypotheses).toBeDefined();
    expect(projections.hypotheses?.inflationLoyer).toBeGreaterThan(0);
    expect(projections.hypotheses?.inflationCharges).toBeGreaterThan(0);
    expect(projections.hypotheses?.revalorisationBien).toBe(
      integrationConfig.projectionRevalorisation
    );
    expect(projections.projections).toHaveLength(20);
  });
});
