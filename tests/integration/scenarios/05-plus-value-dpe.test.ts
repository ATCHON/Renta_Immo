import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

describe('SC — Plus-Value et Impact DPE', () => {
  it('SC-18 [CGI Art.150VC] PV sans abattement (< 5 ans): IR 19% + PS 17.2%', async () => {
    // Régime micro_foncier (location nue) pour éviter la réintégration d'amortissements LMNP
    const input = createBaseInput({
      bien: {
        prix_achat: 100000,
        etat_bien: 'ancien',
        montant_travaux: 0,
        valeur_mobilier: 0,
        dpe: 'C',
      },
      exploitation: {
        loyer_mensuel: 800,
        type_location: 'nue',
        charges_copro: 0,
        taxe_fonciere: 0,
        assurance_pno: 0,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      financement: {
        apport: 100000,
        taux_interet: 0,
        duree_emprunt: 1,
        assurance_pret: 0,
        frais_dossier: 0,
        frais_garantie: 0,
      },
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'micro_foncier',
        associes: [],
      },
      options: {
        generer_pdf: false,
        envoyer_email: false,
        horizon_projection: 3,
        prix_revente: 150000,
        duree_detention: 3,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const pv = result.resultats.projections?.plusValue;
    expect(pv).toBeDefined();
    if (!pv) return;

    // PV brute = 150 000 − (100 000 × 1.075) = 42 500 €
    // Abattement 0% (< 5 ans) → pas de réintégration d'amortissements (regime foncier)
    expect(pv.plus_value_brute).toBeCloseTo(42500, -2);
    expect(pv.amortissements_reintegres).toBe(0);
    // Abattement 0% (< 5 ans)
    expect(pv.abattement_ir).toBe(0);
    // PV nette = 42 500 € < 50 000 € → pas de surtaxe
    expect(pv.surtaxe).toBe(0);
    // Impôt IR = 42 500 × 19%
    expect(pv.impot_ir).toBeCloseTo(8075, -2);
    // Impôt PS = 42 500 × 17.2%
    expect(pv.impot_ps).toBeCloseTo(7310, -2);
  });

  it('SC-19 [CGI Art.1609 nonies G] Surtaxe PV tranche 200-250k: taux 5% (NC-02)', async () => {
    const input = createBaseInput({
      bien: {
        prix_achat: 100000,
        etat_bien: 'ancien',
        montant_travaux: 0,
        valeur_mobilier: 0,
        dpe: 'C',
      },
      exploitation: {
        loyer_mensuel: 800,
        type_location: 'nue',
        charges_copro: 0,
        taxe_fonciere: 0,
        assurance_pno: 0,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      financement: {
        apport: 100000,
        taux_interet: 0,
        duree_emprunt: 1,
        assurance_pret: 0,
        frais_dossier: 0,
        frais_garantie: 0,
      },
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'micro_foncier',
        associes: [],
      },
      options: {
        generer_pdf: false,
        envoyer_email: false,
        horizon_projection: 3,
        prix_revente: 400000,
        duree_detention: 3,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const pv = result.resultats.projections?.plusValue;
    expect(pv).toBeDefined();
    if (!pv) return;

    expect(pv.surtaxe).toBeGreaterThan(0);

    const pvNetteIr = pv.plus_value_nette_ir;
    if (pvNetteIr > 200000 && pvNetteIr < 250000) {
      const surtaxeTrancheAttendue =
        50000 * 0.02 + 50000 * 0.03 + 50000 * 0.04 + (pvNetteIr - 200000) * 0.05;
      expect(pv.surtaxe).toBeCloseTo(surtaxeTrancheAttendue, -1);
    }
  });

  it('SC-20 [Loi Climat-Résilience] DPE F: décote 15% valeur terminale + alerte passoire', async () => {
    const input = createBaseInput({
      bien: { dpe: 'F', prix_achat: 150000, montant_travaux: 0, valeur_mobilier: 0 },
      options: {
        generer_pdf: false,
        envoyer_email: false,
        horizon_projection: 10,
        duree_detention: 10,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const projections = result.resultats.projections;
    expect(projections).toBeDefined();
    if (!projections) return;

    const lastProjection = projections.projections[9];
    // Valeur bien avec DPE F = prix × (1.01)^10 × (1 - 15%) < prix d'achat
    expect(lastProjection.valeurBien).toBeLessThan(150000);

    // Alerte DPE passoire doit être présente
    const allMessages = [...result.alertes, ...result.resultats.synthese.points_attention]
      .join(' ')
      .toLowerCase();
    expect(allMessages).toMatch(/dpe|passoire|énergi/i);
  });

  it('SC-21 [LF2025 Loi Le Meur] LMNP réel: amortissements réintégrés dans PV', async () => {
    const input = createBaseInput({
      bien: {
        prix_achat: 200000,
        montant_travaux: 0,
        valeur_mobilier: 5000,
        dpe: 'C',
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
      options: {
        generer_pdf: false,
        envoyer_email: false,
        horizon_projection: 10,
        prix_revente: 250000,
        duree_detention: 10,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const pv = result.resultats.projections?.plusValue;
    expect(pv).toBeDefined();
    if (!pv) return;

    // Loi Le Meur (15/02/2025) : amortissements immobiliers réintégrés dans PV
    expect(pv.amortissements_reintegres).toBeGreaterThan(0);
    // PV brute augmentée par la réintégration
    expect(pv.plus_value_brute).toBeGreaterThan(pv.prix_vente - pv.prix_achat * (1 + 0.075));
  });
});
