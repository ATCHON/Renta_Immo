import { describe, it, expect } from 'vitest';
import { calculerRentabilite, calculerMensualite } from './rentabilite';
import { calculerFiscalite } from './fiscalite';
import { analyserHcsf } from './hcsf';
import type { BienData, FinancementData, ExploitationData, StructureData, CalculationInput, FinancementCalculations } from './types';

describe('Business Logic - Rentabilité', () => {
  it('should calculate correct loan payments (PMT formula)', () => {
    // 200k€ à 3.5% sur 20 ans, assurance 0.3%
    const detail = calculerMensualite(200000, 3.5, 20, 0.3);
    expect(detail.mensualite_credit).toBeCloseTo(1159.92, 1);
    expect(detail.mensualite_assurance).toBe(50); // (200000 * 0.003) / 12
    expect(detail.mensualite_totale).toBeCloseTo(1209.92, 1);
  });

  it('should handle 0% interest rate', () => {
    const detail = calculerMensualite(120000, 0, 10, 0); // 120k sur 10 ans
    expect(detail.mensualite_credit).toBe(1000);
    expect(detail.mensualite_totale).toBe(1000);
  });

  it('should handle no loan (capital = 0)', () => {
    const detail = calculerMensualite(0, 3.5, 20);
    expect(detail.mensualite_totale).toBe(0);
  });

  it('should calculate correct profitability metrics', () => {
    const bien: BienData = { prix_achat: 200000, type_bien: 'appartement', adresse: '', surface: 50 };
    const financement: FinancementData = { apport: 20000, taux_interet: 3.5, duree_emprunt: 20, assurance_pret: 0.3 };
    const exploitation: ExploitationData = {
        loyer_mensuel: 1000,
        charges_copro: 100,
        taxe_fonciere: 800,
        assurance_pno: 150,
        gestion_locative: 8,
        provision_travaux: 5,
        provision_vacance: 5
    };

    const res = calculerRentabilite(bien, financement, exploitation);

    // Brute: (1000 * 12) / 200000 = 6%
    expect(res.rentabilite_brute).toBe(6);

    // Charges:
    // Fixes: 100*12 + 800 + 150 = 2150
    // Prop: 12000 * (8+5+5)/100 = 12000 * 0.18 = 2160
    // Total charges: 4310
    expect(res.charges.total_charges_annuelles).toBe(4310);

    // Revenu net: 12000 - 4310 = 7690
    expect(res.revenu_net_avant_impots).toBe(7690);

    // Mensualité totale: 1043.93 (crédit sur 180k) + 45 (assurance 0.3% sur 180k) = 1088.93
    // Cashflow annuel: 7690 - (1088.93 * 12) = 7690 - 13067.16 = -5377.16
    expect(res.cashflow_annuel).toBeCloseTo(-5377.16, 1);
  });
});

describe('Business Logic - Fiscalité', () => {
  it('should calculate IR for Nom Propre (Micro-foncier) correctly', () => {
    const rentabilite = {
      revenu_net_avant_impots: 10000,
      loyer_annuel: 12000,
      charges: { total_charges_annuelles: 2000 }
    } as any;
    const structure: StructureData = { type: 'nom_propre', regime_fiscal: 'micro_foncier', tmi: 30, associes: [] };

    const res = calculerFiscalite(structure, rentabilite, 200000);

    // Micro-foncier: Base = 12000 * 70% = 8400
    // Impot = 30% (TMI) + 17.2% (PS) = 47.2%
    // 8400 * 0.472 = 3964.8
    expect(res.base_imposable).toBe(8400);
    expect(res.impot_total).toBeCloseTo(3964.8, 0);
    expect(res.alertes).toHaveLength(0);
  });

  it('should generate alert when micro-foncier threshold is exceeded', () => {
    const rentabilite = { revenu_net_avant_impots: 15000, loyer_annuel: 16000, charges: { total_charges_annuelles: 1000 } } as any;
    const structure: StructureData = { type: 'nom_propre', regime_fiscal: 'micro_foncier', tmi: 30, associes: [] };
    const res = calculerFiscalite(structure, rentabilite, 200000);
    expect(res.alertes[0]).toContain('plafond micro-foncier');
  });

  it('should calculate LMNP Micro-BIC correctly', () => {
    const rentabilite = {
      revenu_net_avant_impots: 10000,
      loyer_annuel: 12000,
      charges: { total_charges_annuelles: 2000 }
    } as any;
    const structure: StructureData = { type: 'nom_propre', regime_fiscal: 'lmnp_micro', tmi: 30, associes: [] };
    const res = calculerFiscalite(structure, rentabilite, 200000);

    // LMNP Micro: Base = 12000 * 50% = 6000
    // Impot = 6000 * 0.472 = 2832
    expect(res.base_imposable).toBe(6000);
    expect(res.impot_total).toBeCloseTo(2832, 0);
  });

  it('should calculate IS for SCI correctly with amortization', () => {
    const rentabilite = {
      revenu_net_avant_impots: 10000,
      loyer_annuel: 12000,
      charges: { total_charges_annuelles: 2000 }
    } as any;
    const structure: StructureData = { type: 'sci_is', tmi: 0, associes: [] };

    const res = calculerFiscalite(structure, rentabilite, 200000);

    // Amortissement: 200000 * 0.85 (bâti) * 0.02 = 3400
    // Base: 10000 - 3400 = 6600
    // IS (15%): 6600 * 0.15 = 990
    expect(res.base_imposable).toBe(6600);
    expect(res.impot_total).toBe(990);
  });
});

describe('Business Logic - HCSF', () => {
  // Mock data for Nom Propre
  const nomPropreData: CalculationInput = {
    bien: {} as any,
    financement: {
      apport: 0,
      taux_interet: 0,
      duree_emprunt: 20, // 20 ans
      assurance_pret: 0
    },
    exploitation: {} as any,
    structure: {
      type: 'nom_propre',
      regime_fiscal: 'micro_foncier',
      tmi: 0.30, // TMI 30% -> revenus estimés 3500€/mois
      associes: []
    }
  };
  const nomPropreFinancement: FinancementCalculations = {
    montant_emprunt: 0,
    mensualite_credit: 0,
    mensualite_assurance: 0,
    mensualite_totale: 1100, // Nouveau crédit de 1100€
    remboursement_annuel: 0,
    cout_total_credit: 0,
    cout_total_interets: 0
  };
  const nomPropreLoyer = 900;

  it('should calculate HCSF for Nom Propre correctly (conforme)', () => {
    // Revenus estimés (TMI 30%) = 3500€
    // Revenus locatifs pondérés = 900 * 0.7 = 630€
    // Revenus totaux HCSF = 3500 + 630 = 4130€
    // Charges = 1100€ (nouveau crédit)
    // Taux endettement = 1100 / 4130 = 26.63%
    const res = analyserHcsf(nomPropreData, nomPropreFinancement, nomPropreLoyer);
    expect(res.taux_endettement).toBeCloseTo(26.63);
    expect(res.conforme).toBe(true);
    expect(res.alertes).toHaveLength(0); // Pas d'alerte pour 26.63%
    expect(res.revenus_detail.total_mensuels).toBe(4130);
    expect(res.charges_detail.total_mensuelles).toBe(1100);
  });

  it('should generate alert if HCSF Nom Propre is above 35%', () => {
    const data: CalculationInput = { ...nomPropreData };
    data.structure = { ...data.structure, tmi: 0 }; // Revenus estimés à 1000€
    const financement = { ...nomPropreFinancement, mensualite_totale: 1200 }; // Mensualité plus élevée
    const res = analyserHcsf(data, financement, 800); // Loyer 800
    // Revenus estimés (TMI 0%) = 1000€
    // Revenus locatifs pondérés = 800 * 0.7 = 560€
    // Revenus totaux HCSF = 1000 + 560 = 1560€
    // Charges = 1200€
    // Taux endettement = 1200 / 1560 = 76.92%
    expect(res.taux_endettement).toBeCloseTo(76.92);
    expect(res.conforme).toBe(false);
    expect(res.alertes[0]).toContain('supérieur au seuil HCSF (35%)');
  });

  it('should generate alert if HCSF Nom Propre is close to 35% (above 33%)', () => {
    const data: CalculationInput = { ...nomPropreData };
    data.structure = { ...data.structure, tmi: 0.30 }; // Revenus estimés 3500€
    const financement3 = { ...nomPropreFinancement, mensualite_totale: 1400 }; // Mensualité 1400€
    const res3 = analyserHcsf(data, financement3, 1000); // Loyer 1000€
    // Revenus locatifs pondérés = 1000 * 0.7 = 700€
    // Revenus totaux HCSF = 3500 + 700 = 4200€
    // Taux endettement = 1400 / 4200 = 33.33%
    expect(res3.taux_endettement).toBeCloseTo(33.33);
    expect(res3.conforme).toBe(true); // Still conforms
    expect(res3.alertes[0]).toContain('proche du seuil HCSF');
  });

  it('should generate alert if loan duration is above 25 years', () => {
    const data: CalculationInput = { ...nomPropreData };
    data.financement = { ...data.financement, duree_emprunt: 26 }; // 26 ans
    const res = analyserHcsf(data, nomPropreFinancement, nomPropreLoyer);
    expect(res.alertes[0]).toContain('Durée du crédit (26 ans) supérieure au maximum HCSF (25 ans)');
  });

  // Mock data for SCI IS
  const sciIsData: CalculationInput = {
    bien: {} as any,
    financement: {
      apport: 0,
      taux_interet: 0,
      duree_emprunt: 20,
      assurance_pret: 0
    },
    exploitation: {} as any,
    structure: {
      type: 'sci_is',
      associes: [
        { nom: 'Associé A', parts: 60, revenus_annuels: 60000, credits_mensuels: 500, charges_mensuelles: 100 },
        { nom: 'Associé B', parts: 40, revenus_annuels: 36000, credits_mensuels: 300, charges_mensuelles: 50 }
      ]
    }
  };
  const sciIsFinancement: FinancementCalculations = {
    montant_emprunt: 0,
    mensualite_credit: 0,
    mensualite_assurance: 0,
    mensualite_totale: 1100, // Nouveau crédit de 1100€
    remboursement_annuel: 0,
    cout_total_credit: 0,
    cout_total_interets: 0
  };
  const sciIsLoyer = 900;

  it('should calculate HCSF for SCI IS per associate correctly', () => {
    const res = analyserHcsf(sciIsData, sciIsFinancement, sciIsLoyer);
    expect(res.par_associe).toHaveLength(2);

    // Associé A:
    // parts = 60%
    // revenus_annuels = 60000 -> 5000€/mois
    // credits_existants_mensuels = 500
    // charges_fixes_mensuelles = 100
    // quote_part_mensualite_credit = 1100 * 0.6 = 660
    // revenus_locatifs_bruts_mensuels = 900 * 0.6 = 540
    // revenus_totaux_ponderes_mensuels = 5000 + (540 * 0.7) = 5000 + 378 = 5378
    // charges_totales_mensuelles = 500 + 100 + 660 = 1260
    // taux_endettement = 1260 / 5378 = 23.43%
    const associeA = res.par_associe![0];
    expect(associeA.nom).toBe('Associé A');
    expect(associeA.taux_endettement).toBeCloseTo(23.43);
    expect(associeA.conforme).toBe(true);

    // Associé B:
    // parts = 40%
    // revenus_annuels = 36000 -> 3000€/mois
    // credits_existants_mensuels = 300
    // charges_fixes_mensuelles = 50
    // quote_part_mensualite_credit = 1100 * 0.4 = 440
    // revenus_locatifs_bruts_mensuels = 900 * 0.4 = 360
    // revenus_totaux_ponderes_mensuels = 3000 + (360 * 0.7) = 3000 + 252 = 3252
    // charges_totales_mensuelles = 300 + 50 + 440 = 790
    // taux_endettement = 790 / 3252 = 24.29%
    const associeB = res.par_associe![1];
    expect(associeB.nom).toBe('Associé B');
    expect(associeB.taux_endettement).toBeCloseTo(24.29);
    expect(associeB.conforme).toBe(true);

    // Global: tous conformes, taux global = max des associés = 24.29%
    expect(res.conforme).toBe(true);
    expect(res.taux_endettement).toBeCloseTo(24.29);
    expect(res.alertes).toHaveLength(0);
  });

  it('should generate alert if an SCI associate is non-conforme', () => {
    const data: CalculationInput = {
      ...sciIsData,
      structure: {
        ...sciIsData.structure,
        associes: [
          { nom: 'Associé A', parts: 60, revenus_annuels: 60000, credits_mensuels: 3000, charges_mensuelles: 100 },
          { nom: 'Associé B', parts: 40, revenus_annuels: 36000, credits_mensuels: 300, charges_mensuelles: 50 }
        ]
      }
    };
    const res = analyserHcsf(data, sciIsFinancement, sciIsLoyer);

    const associeA = res.par_associe![0];
    // Revenus totaux HCSF = 5378€ (inchangé)
    // Charges = 3000 (existants) + 100 (fixes) + 660 (nouveau) = 3760
    // Taux endettement = 3760 / 5378 = 69.91%
    expect(associeA.taux_endettement).toBeCloseTo(69.91);
    expect(associeA.conforme).toBe(false);
    expect(res.conforme).toBe(false);
    expect(res.alertes[0]).toContain('Associé A : Taux d\'endettement (69.9%) > seuil HCSF (35%)');
  });

  it('should handle empty associates list for SCI IS', () => {
    const data: CalculationInput = {
      ...sciIsData,
      structure: {
        ...sciIsData.structure,
        associes: []
      }
    };
    const res = analyserHcsf(data, sciIsFinancement, sciIsLoyer);
    expect(res.alertes[0]).toContain('Aucun associé défini pour la SCI');
    expect(res.conforme).toBe(false);
  });
});
