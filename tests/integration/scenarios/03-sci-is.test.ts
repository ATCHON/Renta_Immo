import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

const sciBaseInput = () =>
  createBaseInput({
    bien: {
      prix_achat: 250000,
      surface: 80,
      etat_bien: 'ancien',
      montant_travaux: 0,
      valeur_mobilier: 10000,
      dpe: 'C',
    },
    financement: {
      apport: 50000,
      taux_interet: 3.5,
      duree_emprunt: 20,
      assurance_pret: 0.1,
      frais_dossier: 0,
      frais_garantie: 0,
    },
    exploitation: {
      loyer_mensuel: 3000,
      type_location: 'meublee_longue_duree',
      charges_copro: 200,
      taxe_fonciere: 2000,
      assurance_pno: 250,
      comptable_annuel: 800,
      gestion_locative: 0,
      provision_travaux: 0,
      provision_vacance: 0,
      cfe_estimee: 0,
      assurance_gli: 0,
    },
    structure: {
      type: 'sci_is',
      tmi: 30,
      associes: [{ nom: 'Associé A', parts: 100, revenus: 3500, mensualites: 0, charges: 0 }],
      distribution_dividendes: false,
    },
  });

describe("SC — SCI à l'Impôt sur les Sociétés", () => {
  it('SC-11 [CGI Art.219] SCI IS capitalisation: IS calculé, pas de Flat Tax', async () => {
    const input = sciBaseInput();

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    // En capitalisation, le régime SCI IS est retourné
    expect(fiscalite.regime).toMatch(/SCI.*IS/i);
    expect(fiscalite.impot_estime).toBeGreaterThan(0);
  });

  it('SC-12 [CGI Art.200A] SCI IS distribution: Flat Tax 30% — impôt total > capitalisation', async () => {
    const distInput = sciBaseInput();
    distInput.structure.distribution_dividendes = true;

    const capitalInput = sciBaseInput();
    capitalInput.structure.distribution_dividendes = false;

    const [distResult, capitalResult] = await Promise.all([
      performCalculations(distInput, integrationConfig),
      performCalculations(capitalInput, integrationConfig),
    ]);

    expect(distResult.success).toBe(true);
    expect(capitalResult.success).toBe(true);
    if (!distResult.success || !capitalResult.success) return;

    // Distribution activée → alerte Flat Tax dans les alertes
    const distMessages = [
      ...distResult.alertes,
      ...(distResult.resultats.synthese.points_attention_detail ?? []).map((p) => p.message),
    ]
      .join(' ')
      .toLowerCase();
    expect(distMessages).toMatch(/flat.*tax|distribution.*dividend/i);

    // L'impôt en distribution doit être ≥ celui en capitalisation (IS + Flat Tax)
    expect(distResult.resultats.fiscalite.impot_estime).toBeGreaterThanOrEqual(
      capitalResult.resultats.fiscalite.impot_estime
    );
  });

  it('SC-13 [CGI Art.219] SCI IS: taux normal 25% sur tranche > 42 500€', async () => {
    const input = sciBaseInput();
    input.exploitation.loyer_mensuel = 8000;
    input.exploitation.charges_copro = 100;
    input.exploitation.taxe_fonciere = 500;
    input.exploitation.comptable_annuel = 0;

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    // IS total > 42 500 × 15% = 6 375 €
    expect(result.resultats.fiscalite.impot_estime).toBeGreaterThan(6375);
  });
});
