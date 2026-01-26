import { describe, it, expect } from 'vitest';
import { calculerRentabilite, calculerMensualite } from './rentabilite';
import { calculerFiscalite } from './fiscalite';
import { analyserHCSF } from './hcsf';
import type { BienData, FinancementData, ExploitationData, StructureData } from '@/types/calculateur';

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
    const rentabilite = { revenu_net_avant_impots: 10000, loyer_annuel: 12000 } as any;
    const structure: StructureData = { type: 'nom_propre', regime_fiscal: 'micro_foncier', tmi: 30, associes: [] };
    
    const res = calculerFiscalite(structure, rentabilite, 200000);
    
    // Base = 12000 * 0.7 = 8400
    // Impot = 8400 * (30% + 17.2%) = 8400 * 0.472 = 3964.8
    expect(res.base_imposable).toBe(8400);
    expect(res.impot_total).toBe(3964.8);
    expect(res.alertes).toHaveLength(0);
  });

  it('should generate alert when micro-foncier threshold is exceeded', () => {
    const rentabilite = { revenu_net_avant_impots: 15000, loyer_annuel: 16000 } as any;
    const structure: StructureData = { type: 'nom_propre', regime_fiscal: 'micro_foncier', tmi: 30, associes: [] };
    const res = calculerFiscalite(structure, rentabilite, 200000);
    expect(res.alertes[0]).toContain('Plafond Micro-foncier dépassé');
  });

  it('should calculate LMNP Micro-BIC correctly', () => {
    const rentabilite = { revenu_net_avant_impots: 10000, loyer_annuel: 12000 } as any;
    const structure: StructureData = { type: 'nom_propre', regime_fiscal: 'lmnp_micro', tmi: 30, associes: [] };
    const res = calculerFiscalite(structure, rentabilite, 200000);
    
    // Base = 12000 * 0.5 = 6000
    // Impot = 6000 * 0.472 = 2832
    expect(res.base_imposable).toBe(6000);
    expect(res.impot_total).toBe(2832);
  });

  it('should calculate IS for SCI correctly with amortization', () => {
    const rentabilite = { revenu_net_avant_impots: 10000 } as any;
    const structure: StructureData = { type: 'sci_is', tmi: 0, associes: [] };
    
    const res = calculerFiscalite(structure, rentabilite, 200000);
    
    // Amortissement: 200000 * 0.8 * 0.02 = 3200
    // Base: 10000 - 3200 = 6800
    // IS (15%): 6800 * 0.15 = 1020
    expect(res.base_imposable).toBe(6800);
    expect(res.impot_total).toBe(1020);
  });
});

describe('Business Logic - HCSF', () => {
  it('should apply 70% weight to rental income', () => {
    const structure: StructureData = { 
        type: 'nom_propre', 
        tmi: 30, 
        associes: [{ nom: 'A', parts: 100, revenus: 3000, mensualites: 500, charges: 0 }] 
    };
    const financement = { mensualite_totale: 1000 } as any;
    const loyer = 1000;

    const res = analyserHCSF(structure, financement, loyer);
    
    // Revenus: 3000 (salaire) + 1000 * 0.7 (loyer) = 3700
    // Charges: 500 (existant) + 1000 (nouveau) = 1500
    // Ratio: 1500 / 3700 = 40.5%
    expect(res.taux_endettement).toBe(40.5);
    expect(res.conforme).toBe(false);
  });
});
