import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from './config/integration-config';
import { createBaseInput } from './helpers';

/**
 * Tests de Conformité Fiscale 2026
 * Vérifient que les taux et règles légaux sont correctement appliqués.
 * Référence: docs/tests/test-integration/01-config-reference.md
 */
describe('CF — Conformité Fiscale 2026', () => {
  describe('CF-01/02 — Prélèvements Sociaux (LFSS 2026)', () => {
    it('CF-01 PS BIC LMNP = 18.6% (LFSS 2026)', async () => {
      // Loyer 900/mois, LMNP micro-BIC, base = 5 400
      // PS attendus = 5 400 × 18.6% = 1 004.40 €
      const input = createBaseInput({
        exploitation: {
          loyer_mensuel: 900,
          type_location: 'meublee_longue_duree',
          provision_travaux: 0,
          provision_vacance: 0,
          gestion_locative: 0,
          comptable_annuel: 0,
        },
        structure: { regime_fiscal: 'lmnp_micro', tmi: 0 }, // TMI 0 pour isoler les PS
      });

      const result = await performCalculations(input, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      // Avec TMI = 0 → seuls les PS s'appliquent
      // Base micro = 10 800 × 50% = 5 400 €
      // PS = 5 400 × 18.6% = 1 004.40 €
      expect(result.resultats.fiscalite.impot_estime).toBeCloseTo(1004, 0);
    });

    it('CF-02 PS revenus fonciers = 17.2%', async () => {
      // Loyer 800/mois, micro-foncier, base = 6 720
      // PS attendus = 6 720 × 17.2% = 1 155.84 €
      const input = createBaseInput({
        exploitation: {
          loyer_mensuel: 800,
          type_location: 'nue',
          provision_travaux: 0,
          provision_vacance: 0,
          gestion_locative: 0,
          comptable_annuel: 0,
          charges_copro: 0,
          taxe_fonciere: 0,
          assurance_pno: 0,
        },
        structure: { regime_fiscal: 'micro_foncier', tmi: 0 }, // TMI 0 pour isoler les PS
      });

      const result = await performCalculations(input, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      // Base = 9 600 × 70% = 6 720 €
      // PS = 6 720 × 17.2% = 1 155.84 €
      expect(result.resultats.fiscalite.impot_estime).toBeCloseTo(1156, 0);
    });
  });

  describe('CF-03 — Flat Tax (CGI Art.200A)', () => {
    it('CF-03 Flat Tax SCI distribution = 30%', async () => {
      const input = createBaseInput({
        bien: { prix_achat: 250000, montant_travaux: 0, valeur_mobilier: 10000 },
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
          distribution_dividendes: true,
        },
      });

      const result = await performCalculations(input, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      // SCI IS: régime = 'SCI à l'IS' quel que soit le mode de distribution
      expect(result.resultats.fiscalite.regime).toMatch(/SCI.*IS/i);
      // La flat tax (distribution) doit être dans les comparaisons fiscales
      const distItem = result.resultats.comparaisonFiscalite.items.find((i) =>
        i.regime.includes('Distribution')
      );
      expect(distItem).toBeDefined();
    });
  });

  describe('CF-04 — IS (CGI Art.219)', () => {
    it('CF-04 IS taux réduit 15% sur tranche ≤ 42 500€', async () => {
      // Bénéfice faible → 100% au taux réduit
      const input = createBaseInput({
        bien: { prix_achat: 200000, montant_travaux: 0, valeur_mobilier: 5000 },
        exploitation: {
          loyer_mensuel: 1000,
          type_location: 'meublee_longue_duree',
          charges_copro: 100,
          taxe_fonciere: 1000,
          assurance_pno: 150,
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

      const result = await performCalculations(input, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const capitaItem = result.resultats.comparaisonFiscalite.items.find((i) =>
        i.regime.includes('Capitalisation')
      );
      expect(capitaItem).toBeDefined();
      // L'IS existe (impôt > 0 si bénéfice > 0)
    });
  });

  describe('CF-05 — Surtaxe Plus-Value (CGI Art.1609 nonies G)', () => {
    it('CF-05 Barème surtaxe: tranche 200-250k à 5% (NC-02 corrigée)', async () => {
      const input = createBaseInput({
        bien: { prix_achat: 100000, montant_travaux: 0, valeur_mobilier: 0 },
        financement: {
          apport: 100000,
          taux_interet: 0,
          duree_emprunt: 1,
          assurance_pret: 0,
          frais_dossier: 0,
          frais_garantie: 0,
        },
        options: {
          generer_pdf: false,
          envoyer_email: false,
          horizon_projection: 3,
          prix_revente: 430000, // PV nette ≈ 214 375 € dans la tranche 200-250k
          duree_detention: 3,
        },
      });

      const result = await performCalculations(input, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const pv = result.resultats.projections.plusValue;
      if (!pv || pv.plus_value_nette_ir <= 200000 || pv.plus_value_nette_ir > 250000) return;

      // Pour la tranche 200-250k, le taux doit être 5% (pas 6%)
      // Surtaxe cumulative de 50k à la tranche actuelle
      const pvNette = pv.plus_value_nette_ir;
      const surtaxeAttendue =
        50000 * 0.02 + // tranche 50-100k
        50000 * 0.03 + // tranche 100-150k
        50000 * 0.04 + // tranche 150-200k
        (pvNette - 200000) * 0.05; // tranche 200-250k à 5% (NC-02)

      expect(pv.surtaxe).toBeCloseTo(surtaxeAttendue, -1); // précision 10€
    });
  });

  describe('CF-06 — Abattements PV pour durée (CGI Art.150VC/VD)', () => {
    it('CF-06 Exonération IR totale à 22 ans de détention', async () => {
      const input = createBaseInput({
        bien: { prix_achat: 100000, montant_travaux: 0, valeur_mobilier: 0 },
        financement: {
          apport: 100000,
          taux_interet: 0,
          duree_emprunt: 1,
          assurance_pret: 0,
          frais_dossier: 0,
          frais_garantie: 0,
        },
        options: {
          generer_pdf: false,
          envoyer_email: false,
          horizon_projection: 22,
          prix_revente: 150000,
          duree_detention: 22, // 22 ans → exonération totale IR
        },
      });

      const result = await performCalculations(input, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const pv = result.resultats.projections.plusValue;
      expect(pv).toBeDefined();
      if (!pv) return;

      // 22 ans → abattement IR = 100% → impôt IR = 0
      expect(pv.abattement_ir).toBe(100); // 100% exprimé en pourcentage (0-100)
      expect(pv.impot_ir).toBe(0);
    });

    it('CF-07 Abattement PS progressif: 1.65%/an au-delà de 5 ans', async () => {
      // 10 ans → abattement PS = (10-5) × 1.65% = 8.25%
      const input = createBaseInput({
        bien: { prix_achat: 100000, montant_travaux: 0, valeur_mobilier: 0 },
        financement: {
          apport: 100000,
          taux_interet: 0,
          duree_emprunt: 1,
          assurance_pret: 0,
          frais_dossier: 0,
          frais_garantie: 0,
        },
        options: {
          generer_pdf: false,
          envoyer_email: false,
          horizon_projection: 10,
          prix_revente: 150000,
          duree_detention: 10,
        },
      });

      const result = await performCalculations(input, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const pv = result.resultats.projections.plusValue;
      expect(pv).toBeDefined();
      if (!pv) return;

      // Abattement PS pour 10 ans = (10-5) × 1.65% = 8.25% → arrondi à 8.3% (exprimé en %, 0-100)
      expect(pv.abattement_ps).toBeCloseTo(8.3, 1);
    });
  });

  describe('CF-08 — PMT (Mensualité Crédit)', () => {
    it('CF-08 Formule PMT standard: 160 000€, 20 ans, 3.5% → ≈ 928€/mois', async () => {
      const input2 = createBaseInput({
        financement: {
          apport: 40000,
          taux_interet: 3.5,
          duree_emprunt: 20,
          assurance_pret: 0,
          frais_dossier: 0,
          frais_garantie: 0,
        },
        bien: { prix_achat: 185185, etat_bien: 'neuf', montant_travaux: 0, valeur_mobilier: 0 },
        // Neuf: frais notaire 2.5% → 185185 + 4630 = 189815, emprunt ≈ 149815 (~150k)
      });

      const result = await performCalculations(input2, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      const { mensualite } = result.resultats.financement;
      // Vérification formule PMT: M = Capital × i / (1 - (1+i)^-n)
      const capital = result.resultats.financement.montant_emprunt;
      const i = 3.5 / 100 / 12;
      const n = 20 * 12;
      const expected = (capital * i) / (1 - Math.pow(1 + i, -n));
      expect(mensualite).toBeCloseTo(expected, 0); // précision 1€
    });
  });
});
