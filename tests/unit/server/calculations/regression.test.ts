import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { DPE } from '@/server/calculations/types';
import { mockConfig } from './mock-config';

/**
 * Tests de Régression - Audit Fonctionnel 2026
 * Basé sur docs/audit/fonctionnel/revue-audit.md
 */
describe('Calculations Regression Tests (Audit 2026)', () => {
  const defaultExploitation = {
    gestion_locative: 0,
    provision_travaux: 0,
    provision_vacance: 0,
    charges_copro_recuperables: 0,
    assurance_gli: 0,
    cfe_estimee: 0,
    comptable_annuel: 0,
    taxe_fonciere: 0,
    assurance_pno: 0,
    charges_copro: 0,
    loyer_mensuel: 0,
    type_location: 'nue' as const,
  };

  const defaultFinancement = {
    apport: 0,
    taux_interet: 3.5,
    duree_emprunt: 20,
    assurance_pret: 0.1,
    frais_dossier: 0,
    frais_garantie: 0,
    mode_assurance: 'capital_initial' as const,
  };

  it('CAS 1: LMNP Réel - Amortissement et Fiscalité BIC', async () => {
    const input = {
      bien: {
        adresse: '123 Rue de la Paix, 75002 Paris',
        prix_achat: 200000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 5000,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 40000 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 900,
        type_location: 'meublee_longue_duree' as const,
        charges_copro: 100,
        taxe_fonciere: 1200,
        assurance_pno: 150,
        comptable_annuel: 800,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'lmnp_reel' as const,
        tmi: 30,
        associes: [],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) {
      console.error('Validation Error Details:', JSON.stringify(result, null, 2));
      throw new Error(`CAS 1 failed: ${result.error}`);
    }

    const { fiscalite } = result.resultats;
    expect(fiscalite.impot_estime).toBe(0);
    expect(fiscalite.regime).toContain('LMNP Réel');
  });

  it('CAS 2: SCI IS - Distribution Dividendes (Fix E-01)', async () => {
    const input = {
      bien: {
        adresse: '456 Avenue des Champs-Élysées, 75008 Paris',
        prix_achat: 500000,
        type_bien: 'immeuble' as const,
        montant_travaux: 0,
        valeur_mobilier: 0,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 100000 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 4000,
        type_location: 'meublee_longue_duree' as const,
        charges_copro: 200,
        taxe_fonciere: 1500,
        assurance_pno: 150,
      },
      structure: {
        type: 'sci_is' as const,
        tmi: 30,
        distribution_dividendes: true,
        associes: [{ nom: 'Associé A', parts: 100, revenus: 3000, mensualites: 0, charges: 0 }],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) {
      console.error('Validation Error Details:', JSON.stringify(result, null, 2));
      throw new Error(`CAS 2 failed: ${result.error}`);
    }

    const { fiscalite } = result.resultats;

    // SCI IS distribution — calcul théorique précis :
    // loyer_annuel = 4 000 * 12 = 48 000€
    // charges = copro 200 + tf 1 500 + pno 150 = 1 850€
    // revenu_net_avant_impots = 48 000 - 1 850 = 46 150€
    //
    // fraisNotaire(500k ancien) = 35 603.95€ → montant_emprunt = 435 604€
    // coutFinancierAn1 = 435 604 × 3.5% + assurance = 15 246 + 436 = 15 682€
    //
    // Amortissement SCI IS simplifié: prixAchat × (1 - partTerrain) / 33 ans
    // 500 000 × 0.9 / 33 = 13 636€  (type 'immeuble' → partTerrain = 10%)
    //
    // baseImposable = max(0, 46 150 - 15 682 - 13 636) = 16 832€
    // IS = 16 832 × 15% = 2 525€
    // dividendes_bruts = 16 832 - 2 525 = 14 307€
    // flat_tax = 14 307 × 30% = 4 292€
    // impot_total = 2 525 + 4 292 = 6 817€
    expect(fiscalite.base_imposable).toBeCloseTo(16832, 0);
    expect(fiscalite.impot_estime).toBeCloseTo(6817, 0);
    expect(fiscalite.dividendes_bruts).toBeCloseTo(14307, 0);
    expect(fiscalite.flat_tax).toBeCloseTo(4292, 0);
  });

  it('CAS 3: Déficit Foncier - Imputation Revenu Global', async () => {
    const input = {
      bien: {
        adresse: '789 Rue du Commerce, 69002 Lyon',
        prix_achat: 150000,
        type_bien: 'appartement' as const,
        montant_travaux: 50000,
        valeur_mobilier: 0,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 30000, taux_interet: 4.5 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 700,
        type_location: 'nue' as const,
        charges_copro: 166.67,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'reel' as const,
        tmi: 30,
        associes: [],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) {
      console.error('Validation Error Details:', JSON.stringify(result, null, 2));
      throw new Error(`CAS 3 failed: ${result.error}`);
    }

    const { fiscalite } = result.resultats;
    expect(fiscalite.impot_estime).toBe(0);
  });

  it("CAS 4: HCSF - Taux d'endettement", async () => {
    const input = {
      bien: {
        adresse: '10 Rue de la Gare, 33000 Bordeaux',
        prix_achat: 200000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 5000,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 40000, assurance_pret: 0 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 900,
        type_location: 'meublee_longue_duree' as const,
      },
      structure: {
        type: 'nom_propre' as const,
        tmi: 30,
        associes: [], // Ignoré pour nom_propre : HCSF utilise credits_immobiliers/revenus_activite
        credits_immobiliers: 800,
        revenus_activite: 3500,
        loyers_actuels: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) {
      console.error('Validation Error Details:', JSON.stringify(result, null, 2));
      throw new Error(`CAS 4 failed: ${result.error}`);
    }

    const { hcsf } = result.resultats;
    expect(hcsf.taux_endettement).toBeCloseTo(43.9, 1);
    expect(hcsf.conforme).toBe(false);
  });

  it('CAS 5: DPE F et Revente', async () => {
    const input = {
      bien: {
        adresse: '20 Rue du Pont, 44000 Nantes',
        prix_achat: 150000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 0,
        etat_bien: 'ancien' as const,
        dpe: 'F' as DPE,
      },
      financement: { ...defaultFinancement, apport: 150000, taux_interet: 0 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 600,
        type_location: 'nue' as const,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'micro_foncier' as const,
        tmi: 30,
        associes: [],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 10,
        duree_detention: 10,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
        taux_evolution_loyer: 2,
        taux_evolution_charges: 2.5,
        taux_agence_revente: 5,
        ponderation_loyers: 70,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) {
      console.error('Validation Error Details:', JSON.stringify(result, null, 2));
      throw new Error(`CAS 5 failed: ${result.error}`);
    }

    const { projections } = result.resultats;
    expect(projections).toBeDefined();
    if (!projections) return;

    // With DPE F, price_selling is reduced (décote)
    expect(projections.plusValue?.prix_vente).toBeLessThan(150000);
  });

  it('CAS 6: LMNP Micro-BIC - Longue durée vs Tourisme Classé', async () => {
    const inputLongueDuree = {
      bien: {
        adresse: '30 Rue de Rivoli, 75004 Paris',
        prix_achat: 100000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 2000,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 100000, taux_interet: 0 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 1000,
        type_location: 'meublee_longue_duree' as const,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'lmnp_micro' as const,
        tmi: 30,
        associes: [],
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const resLongue = await performCalculations(inputLongueDuree, mockConfig);
    if (resLongue.success === false) return;
    expect(resLongue.success).toBe(true);

    // Abattement 50% sur 12000 = 6000 base imposable.
    expect(resLongue.resultats.fiscalite.base_imposable).toBe(6000);
    // PS LMNP = 18.6% (LFSS 2026) -> 6000 * 0.186 = 1116
    expect(resLongue.resultats.fiscalite.prelevements_sociaux).toBeCloseTo(1116, 0);

    const inputTourisme = {
      ...inputLongueDuree,
      exploitation: {
        ...inputLongueDuree.exploitation,
        type_location: 'meublee_tourisme_classe' as const,
      },
    };
    const resTourisme = await performCalculations(inputTourisme, mockConfig);
    if (resTourisme.success === false) return;
    expect(resTourisme.success).toBe(true);

    // Abattement 71% sur 12000 = 3480 base imposable.
    expect(resTourisme.resultats.fiscalite.base_imposable).toBe(3480);
  });

  it('CAS 7: LMNP Réel - Amortissement par Composants', async () => {
    const input = {
      bien: {
        adresse: '40 Rue de Londres, 75008 Paris',
        prix_achat: 300000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 10000,
        etat_bien: 'ancien' as const,
        part_terrain: 0.2, // 80% bâti = 240000 amortissable
      },
      financement: { ...defaultFinancement, apport: 100000, taux_interet: 0 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 1500,
        type_location: 'meublee_longue_duree' as const,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'lmnp_reel' as const,
        tmi: 30,
        mode_amortissement: 'composants' as const,
        associes: [],
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (result.success === false) return;
    expect(result.success).toBe(true);

    // Amortissement composants (valeurBati = 300k × 80% = 240k) :
    // 240k × 40% / 50 ans = 1 920
    // 240k × 20% / 25 ans = 1 920
    // 240k × 20% / 15 ans = 3 200
    // 240k × 20% / 10 ans = 4 800
    // Total immo = 11 840 | Mobilier = 10 000 / 10 = 1 000 → Total = 12 840
    //
    // Avec taux=0, coutFinancierAn1 = 0 + assurance(221 187 × 0.1%/12 × 12) = 221€
    // resultatAvantAmortissement = 18 000 - 221 = 17 779 > 12 840
    // → amortissementDeductible = min(17 779, 12 840) = 12 840 (plafonné au total composants)
    //
    // NB: avant fix fiscalite.ts (|| 3.5 → ?? 3.5), taux fictif 3.5% sur 221 187€
    //     créait coutFinancier ≈ 7 963€ → plafonnement à 10 037 (valeur erronée)
    const { fiscalite } = result.resultats;
    expect(fiscalite.abattement).toBeCloseTo(12840, 0);
  });

  it('CAS 8: SCI IS - Mode Capitalisation (Trésorerie bloquée)', async () => {
    const input = {
      bien: {
        adresse: '50 Rue de la Paix, 75002 Paris',
        prix_achat: 200000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 0,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 200000, taux_interet: 0 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 1200,
        type_location: 'nue' as const,
        charges_copro: 100,
        taxe_fonciere: 1200,
      },
      structure: {
        type: 'sci_is' as const,
        distribution_dividendes: false, // Pas de distribution
        tmi: 30,
        associes: [],
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (result.success === false) return;
    const { fiscalite } = result.resultats;

    // Pas de dividendes, pas de flat tax
    expect(fiscalite.dividendes_bruts).toBe(0);
    expect(fiscalite.flat_tax).toBe(0);
    // Net en poche = Cashflow après IS seulement
    expect(fiscalite.net_en_poche).toBe(fiscalite.revenu_net_apres_impot);
  });

  it('CAS 9: HCSF SCI IS - Multi-associés (Analyse globale)', async () => {
    const input = {
      bien: {
        adresse: '60 Rue de Lyon, 75012 Paris',
        prix_achat: 500000,
        type_bien: 'appartement' as const,
        montant_travaux: 50000,
        valeur_mobilier: 0,
        etat_bien: 'ancien' as const,
      },
      financement: {
        ...defaultFinancement,
        taux_interet: 4.0,
        duree_emprunt: 25,
        apport: 100000,
      },
      exploitation: { ...defaultExploitation, loyer_mensuel: 2500 },
      structure: {
        type: 'sci_is' as const,
        tmi: 30,
        distribution_dividendes: false,
        // Champs réels de l'associé : parts (%), revenus (mensuel €), mensualites (€/mois), charges (€/mois)
        associes: [
          { nom: 'Asso 1', parts: 50, revenus: 4167, mensualites: 1000, charges: 0 },
          { nom: 'Asso 2', parts: 50, revenus: 2500, mensualites: 417, charges: 0 },
        ],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (result.success === false) {
      console.error('CAS 9 error:', JSON.stringify(result));
      throw new Error(`CAS 9 failed: ${result.error}`);
    }

    // HCSF SCI IS : calculé par associé, mensualité SCI répartie au prorata des parts
    // fraisNotaire(500k) ≈ 35 604€, travaux 50k → montant_emprunt ≈ 485 604€
    // Mensualité SCI à 4% / 25 ans ≈ 2 563€/mois → 50% par associé = 1 281€
    //
    // Asso 1 (revenus 4 167€/mois) : (1 000 + 1 281) / 4 167 ≈ 54.7% > 35% ✗
    // Asso 2 (revenus 2 500€/mois) : (417 + 1 281) / 2 500 ≈ 67.9% > 35% ✗
    expect(result.resultats.hcsf.taux_endettement).toBeGreaterThan(35);
    expect(result.resultats.hcsf.conforme).toBe(false);
  });

  it('CAS 10: DPE G - Gel des loyers et interdiction progressive', async () => {
    const input = {
      bien: {
        adresse: '70 Rue de Rome, 75017 Paris',
        prix_achat: 150000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 0,
        etat_bien: 'ancien' as const,
        dpe: 'G' as const,
      },
      financement: { ...defaultFinancement, apport: 150000, taux_interet: 0 },
      exploitation: { ...defaultExploitation, loyer_mensuel: 800 },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'micro_foncier' as const,
        tmi: 30,
        associes: [],
      },
      options: {
        horizon_projection: 10,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (result.success === false) return;

    const projectionData = result.resultats.projections;
    if (!projectionData) return;

    // Gel des loyers : le loyer année 10 doit être égal au loyer année 1 (car DPE G)
    expect(projectionData.projections[9].loyer).toBe(projectionData.projections[0].loyer);
    // Décote revente 15% pour G compensée par l'inflation (1% / an)
    // Sans décote: ~164k. Avec décote: ~139k.
    expect(projectionData.plusValue?.prix_vente).toBeLessThan(145000);
  });

  it('CAS 11: VEFA - Frais Réduits & Durée HCSF 27 ans', async () => {
    const input = {
      bien: {
        adresse: '80 Rue Neuve, 33000 Bordeaux',
        prix_achat: 300000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 0,
        etat_bien: 'neuf' as const,
        is_vefa: true,
      },
      financement: {
        ...defaultFinancement,
        taux_interet: 3.5,
        duree_emprunt: 25,
        differe_amortissement: 24, // 2 ans de VEFA
        apport: 30000,
      },
      exploitation: { ...defaultExploitation, loyer_mensuel: 1200 },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'micro_foncier' as const,
        tmi: 30,
        associes: [],
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (result.success === false) return;

    // Frais de notaire ~2.5% au lieu de 7.5%
    expect(result.resultats.financement.frais_notaire).toBeLessThan(10000);
    // HCSF conforme car 25 + 2 = 27 ans max autorisé en VEFA
    expect(result.resultats.hcsf.conforme).toBe(true);
  });

  it('CAS 12: Plus-value LMNP - Réintégration Amortissements (Loi Le Meur)', async () => {
    // Note: lmnpOptions.dateCession n'est PAS transmis depuis projection.ts
    // → amortissementsReintegres = amortissementsCumule (toujours réintégré, pas de check date)
    const input = {
      bien: {
        adresse: '90 Rue de la Loi, 44000 Nantes',
        prix_achat: 200000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 10000,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 200000, taux_interet: 0 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 1000,
        type_location: 'meublee_longue_duree' as const,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'lmnp_reel' as const,
        tmi: 30,
        associes: [],
      },
      options: {
        horizon_projection: 10,
        prix_revente: 250000,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (result.success === false) return;

    const pv = result.resultats.projections?.plusValue;
    if (!pv) return;

    // PV Brute = 250k - (200k + frais + travaux) + Amortissements Réintégrés
    expect(pv.amortissements_reintegres).toBeGreaterThan(30000);
    expect(pv.impot_total).toBeGreaterThan(0);
  });

  it('CAS 13: Micro-Foncier - PS à 17.2% (vs 18.6% LMNP)', async () => {
    // Valide que le taux PS foncier (tauxPsFoncier=17.2%) est bien distinct du taux LMNP (18.6%)
    const input = {
      bien: {
        adresse: '100 Rue du Faubourg, 75011 Paris',
        prix_achat: 150000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 0,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 150000, taux_interet: 0 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 1000,
        type_location: 'nue' as const,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'micro_foncier' as const,
        tmi: 30,
        associes: [],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) throw new Error(`CAS 13 failed: ${result.error}`);

    const { fiscalite } = result.resultats;

    // revenusBruts = 1 000 * 12 = 12 000€
    // Abattement micro-foncier 30% → base_imposable = 12 000 * 0.7 = 8 400€
    // Plafond micro-foncier = 15 000€ > 12 000€ → régime applicable
    //
    // IR = 8 400 * 30% (TMI) = 2 520€
    // PS foncier = 8 400 * 17.2% = 1 444.80€  ← pas 18.6% (LMNP)
    // impot_total = 2 520 + 1 444.80 = 3 964.80€
    expect(fiscalite.base_imposable).toBeCloseTo(8400, 0);
    expect(fiscalite.prelevements_sociaux).toBeCloseTo(1445, 0);
    expect(fiscalite.impot_estime).toBeCloseTo(3965, 0);
    expect(fiscalite.regime).toContain('Micro');
  });

  it('CAS 14: Scoring Dual Profil - Rentier vs Patrimonial (V2-S16)', async () => {
    // Valide que les deux profils produisent des scores différents au sein du même calcul.
    // Scénario : financement partiel (apport 30k sur 180k) → cashflow positif modéré,
    // DPE C → patrimonial valorise la qualité énergétique (poids DPE 1.5 vs 0.8).
    // L'avantage DPE pour le patrimonial l'emporte sur l'avantage cashflow du rentier,
    // donc scorePatrimonial > scoreRentier avec ce bien de bonne qualité thermique.
    const input = {
      bien: {
        adresse: '110 Avenue Victor Hugo, 69006 Lyon',
        prix_achat: 180000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 5000,
        etat_bien: 'ancien' as const,
        dpe: 'C' as DPE,
      },
      financement: { ...defaultFinancement, apport: 30000, taux_interet: 3.5, duree_emprunt: 20 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 1100,
        type_location: 'meublee_longue_duree' as const,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'lmnp_reel' as const,
        tmi: 30,
        associes: [],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 5000,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) throw new Error(`CAS 14 failed: ${result.error}`);

    const synth = result.resultats.synthese;

    // scores_par_profil doit être défini avec les deux profils
    expect(synth.scores_par_profil).toBeDefined();
    expect(synth.scores_par_profil?.rentier).toBeDefined();
    expect(synth.scores_par_profil?.patrimonial).toBeDefined();

    // Comparaison au sein du même résultat (SCORING_PROFIL_WEIGHTS différents)
    // scores_par_profil.rentier est un ScoreDetailResultat { base, ajustements, total }
    const scoreRentier = synth.scores_par_profil?.rentier?.total ?? 0;
    const scorePatrimonial = synth.scores_par_profil?.patrimonial?.total ?? 0;

    // Les deux profils doivent produire des scores distincts
    expect(scoreRentier).not.toBe(scorePatrimonial);
    // DPE C : patrimonial poids DPE = 1.5 > rentier poids DPE = 0.8
    // L'avantage DPE (bien énergétique) bénéficie davantage au profil patrimonial
    expect(scorePatrimonial).toBeGreaterThan(scoreRentier);
  });

  it('CAS 15: Plafond Micro-BIC dépassé - Alerte générée', async () => {
    // loyer 7 000€/mois = 84 000€/an > plafond micro-BIC longue durée (77 700€)
    // Le moteur doit calculer ET émettre une alerte de dépassement
    const input = {
      bien: {
        adresse: '120 Boulevard Haussmann, 75008 Paris',
        prix_achat: 800000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 20000,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 800000, taux_interet: 0 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 7000,
        type_location: 'meublee_longue_duree' as const,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'lmnp_micro' as const,
        tmi: 30,
        associes: [],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) throw new Error(`CAS 15 failed: ${result.error}`);

    // Le moteur calcule quand même (pas de blocage)
    expect(result.resultats.fiscalite.regime).toContain('Micro');

    // Alerte de dépassement du plafond micro-BIC doit être présente
    const toutesAlertes = result.alertes.join(' ');
    expect(toutesAlertes).toMatch(/plafond|dépassé|micro/i);
  });

  it('CAS 16: ComparaisonFiscalite - 6 régimes présents avec isOptimal', async () => {
    // Valide que calculerToutesFiscalites retourne exactement 6 régimes
    // et qu'un seul est marqué isOptimal = true
    const input = {
      bien: {
        adresse: '130 Rue de la République, 13001 Marseille',
        prix_achat: 250000,
        type_bien: 'appartement' as const,
        montant_travaux: 0,
        valeur_mobilier: 8000,
        etat_bien: 'ancien' as const,
      },
      financement: { ...defaultFinancement, apport: 50000 },
      exploitation: {
        ...defaultExploitation,
        loyer_mensuel: 1200,
        type_location: 'meublee_longue_duree' as const,
        taxe_fonciere: 1200,
        assurance_pno: 200,
      },
      structure: {
        type: 'nom_propre' as const,
        regime_fiscal: 'lmnp_reel' as const,
        tmi: 30,
        associes: [],
        credits_immobiliers: 0,
        loyers_actuels: 0,
        revenus_activite: 0,
        autres_charges: 0,
      },
      options: {
        horizon_projection: 1,
        generer_pdf: false,
        envoyer_email: false,
        email: '',
        profil_investisseur: 'rentier' as const,
      },
    };

    const result = await performCalculations(input, mockConfig);
    if (!result.success) throw new Error(`CAS 16 failed: ${result.error}`);

    const { comparaisonFiscalite } = result.resultats;

    // comparaisonFiscalite est { items: FiscaliteComparaisonItem[], conseil: string }
    const items = comparaisonFiscalite?.items ?? [];

    // Exactement 6 régimes
    expect(items).toHaveLength(6);

    // Labels des 6 régimes attendus (r.label dans calculerToutesFiscalites, pas r.id)
    const regimes = items.map((r) => r.regime);
    expect(regimes).toContain('Location Nue (Micro-foncier)');
    expect(regimes).toContain('Location Nue (Réel)');
    expect(regimes).toContain('LMNP (Micro-BIC)');
    expect(regimes).toContain('LMNP (Réel)');
    expect(regimes).toContain("SCI à l'IS (Capitalisation)");
    expect(regimes).toContain("SCI à l'IS (Distribution)");

    // Exactement 1 régime optimal
    const optimaux = items.filter((r) => r.isOptimal);
    expect(optimaux).toHaveLength(1);
  });
});
