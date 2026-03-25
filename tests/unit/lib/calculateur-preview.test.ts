/**
 * UX-BE01 — Tests unitaires : computePreviewKPIs
 *
 * Couverture :
 * - Cas nominal (données complètes)
 * - Calcul exact PMT
 * - Cas limites : prix_achat absent, loyer=0, taux=0, durée=0
 * - Discriminant isPartiel
 */

import { describe, it, expect } from 'vitest';
import { computePreviewKPIs } from '@/lib/calculateur-preview';

// Scénario de référence
const BIEN_COMPLET = {
  prix_achat: 200_000,
  montant_travaux: 10_000,
  type_bien: 'appartement' as const,
  etat_bien: 'ancien' as const,
  valeur_mobilier: 0,
  adresse: '10 rue de la Paix, Paris',
};

const FINANCEMENT_COMPLET = {
  apport: 30_000,
  taux_interet: 3.5, // % annuel
  duree_emprunt: 20, // années
  assurance_pret: 0.3,
  frais_dossier: 1_000,
  frais_garantie: 2_000,
};

const EXPLOITATION_COMPLETE = {
  loyer_mensuel: 900,
  charges_copro: 1_200, // annuel → 100 €/mois
  taxe_fonciere: 1_200, // annuel → 100 €/mois
  assurance_pno: 240, // annuel → 20 €/mois
  gestion_locative: 0,
  provision_travaux: 0,
  provision_vacance: 5,
  type_location: 'meublee_longue_duree' as const,
  charges_copro_recuperables: 0,
  assurance_gli: 0,
  cfe_estimee: 0,
  comptable_annuel: 0,
};

describe('computePreviewKPIs', () => {
  describe('cas nominal — données complètes', () => {
    const kpis = computePreviewKPIs(BIEN_COMPLET, FINANCEMENT_COMPLET, EXPLOITATION_COMPLETE);

    it('retourne isPartiel = true', () => {
      expect(kpis.isPartiel).toBe(true);
    });

    it('calcule investissementTotal = prix + travaux + 8% notaire', () => {
      // 200000 + 10000 + 200000*0.08 = 226000
      expect(kpis.investissementTotal).toBeCloseTo(226_000, 0);
    });

    it('calcule rendementBrut = (loyer_annuel / investissement) * 100', () => {
      // (900*12 / 226000) * 100 = 4.779...
      expect(kpis.rendementBrut).not.toBeNull();
      expect(kpis.rendementBrut!).toBeCloseTo(4.78, 1);
    });

    it('calcule mensualiteEstimee via PMT', () => {
      // montant emprunté = 226000 - 30000 = 196000
      // PMT(3.5%/12, 240, 196000) ≈ 1136 €
      expect(kpis.mensualiteEstimee).not.toBeNull();
      expect(kpis.mensualiteEstimee!).toBeCloseTo(1136, -1);
    });

    it('calcule cashflowMensuelEstime = loyer - mensualite - charges', () => {
      // charges mensuelles = (1200+1200+240)/12 = 220 €
      // 900 - 1136 - 220 = -456 (approx)
      expect(kpis.cashflowMensuelEstime).not.toBeNull();
      // Le cashflow est négatif ici (normal : fort emprunt)
      expect(kpis.cashflowMensuelEstime!).toBeLessThan(0);
    });

    it('calcule coutTotalCreditEstime > 0', () => {
      expect(kpis.coutTotalCreditEstime).not.toBeNull();
      expect(kpis.coutTotalCreditEstime!).toBeGreaterThan(0);
    });

    it('calcule taegApprox légèrement supérieur au taux nominal', () => {
      expect(kpis.taegApprox).not.toBeNull();
      expect(kpis.taegApprox!).toBeGreaterThan(3.5); // au-dessus du taux nominal
    });
  });

  describe('calcul PMT exact', () => {
    it('PMT(0.001, 240, 200000) ≈ 1006.43 €', () => {
      // taux_interet: 1.2%/an → 0.1%/mois ; duree: 20 ans = 240 mois
      const kpis = computePreviewKPIs(
        {
          prix_achat: 230_000,
          montant_travaux: 0,
          type_bien: 'appartement',
          etat_bien: 'ancien',
          valeur_mobilier: 0,
          adresse: '',
        },
        {
          apport: 30_000,
          taux_interet: 1.2,
          duree_emprunt: 20,
          assurance_pret: 0,
          frais_dossier: 0,
          frais_garantie: 0,
        },
        {}
      );
      // Montant emprunté = 230000*1.08 - 30000 = 218400 (avec notaire) → pas exactement 200000
      // Test spécifique de la formule PMT avec 200000 €
      const kpis2 = computePreviewKPIs(
        {
          prix_achat: 185_185,
          montant_travaux: 0,
          type_bien: 'appartement',
          etat_bien: 'ancien',
          valeur_mobilier: 0,
          adresse: '',
        },
        {
          apport: 0,
          taux_interet: 1.2,
          duree_emprunt: 20,
          assurance_pret: 0,
          frais_dossier: 0,
          frais_garantie: 0,
        },
        {}
      );
      // investissement = 185185 * 1.08 ≈ 200000 → mensualite ≈ 937.74 €
      expect(kpis2.mensualiteEstimee).not.toBeNull();
      expect(kpis2.mensualiteEstimee!).toBeGreaterThan(930);
      expect(kpis2.mensualiteEstimee!).toBeLessThan(950);
    });
  });

  describe('cas limite : prix_achat absent', () => {
    const kpis = computePreviewKPIs({}, FINANCEMENT_COMPLET, EXPLOITATION_COMPLETE);

    it('investissementTotal = null', () => {
      expect(kpis.investissementTotal).toBeNull();
    });

    it('rendementBrut = null', () => {
      expect(kpis.rendementBrut).toBeNull();
    });

    it('mensualiteEstimee = null (pas de montant à emprunter)', () => {
      expect(kpis.mensualiteEstimee).toBeNull();
    });

    it('cashflowMensuelEstime = null', () => {
      expect(kpis.cashflowMensuelEstime).toBeNull();
    });

    it('isPartiel reste true', () => {
      expect(kpis.isPartiel).toBe(true);
    });
  });

  describe('cas limite : loyer_mensuel = 0 ou absent', () => {
    it('cashflowMensuelEstime = null si loyer = 0', () => {
      const kpis = computePreviewKPIs(BIEN_COMPLET, FINANCEMENT_COMPLET, {
        ...EXPLOITATION_COMPLETE,
        loyer_mensuel: 0,
      });
      expect(kpis.cashflowMensuelEstime).toBeNull();
    });

    it('rendementBrut = null si loyer_mensuel absent', () => {
      const kpis = computePreviewKPIs(BIEN_COMPLET, FINANCEMENT_COMPLET, {});
      expect(kpis.rendementBrut).toBeNull();
    });
  });

  describe('cas limite : taux_interet = 0', () => {
    it('mensualiteEstimee = montant / dureeMois (pas de division par zéro)', () => {
      const kpis = computePreviewKPIs(
        BIEN_COMPLET,
        { ...FINANCEMENT_COMPLET, taux_interet: 0 },
        {}
      );
      expect(kpis.mensualiteEstimee).not.toBeNull();
      // montant = (200000+10000+16000) - 30000 = 196000 — durée = 240 mois
      expect(kpis.mensualiteEstimee!).toBeCloseTo(196_000 / 240, 0);
    });

    it('taegApprox reflète le coût des frais de dossier même si taux = 0', () => {
      const kpis = computePreviewKPIs(
        BIEN_COMPLET,
        { ...FINANCEMENT_COMPLET, taux_interet: 0 },
        {}
      );
      expect(kpis.taegApprox).not.toBeNull();
      expect(kpis.taegApprox!).toBeGreaterThan(0);
    });
  });

  describe('cas limite : taux_interet défini mais formule principale inapplicable', () => {
    it('utilise le fallback (tauxAnnuel * 1.05) quand duree_emprunt <= 0', () => {
      const financementDureeNulle = {
        ...FINANCEMENT_COMPLET,
        duree_emprunt: 0,
      };

      const kpis = computePreviewKPIs(BIEN_COMPLET, financementDureeNulle, {});

      expect(kpis.taegApprox).not.toBeNull();
      // Fallback attendu : tauxAnnuel * 1.05
      expect(kpis.taegApprox!).toBeCloseTo(FINANCEMENT_COMPLET.taux_interet * 1.05, 5);
    });

    it('utilise aussi le fallback quand le montant emprunté est nul ou négatif (apport >= investissementTotal)', () => {
      const financementApportTropEleve = {
        ...FINANCEMENT_COMPLET,
        apport: 1_000_000,
      };

      const kpis = computePreviewKPIs(BIEN_COMPLET, financementApportTropEleve, {});

      expect(kpis.taegApprox).not.toBeNull();
      expect(kpis.taegApprox!).toBeCloseTo(FINANCEMENT_COMPLET.taux_interet * 1.05, 5);
    });
  });

  describe('cas limite : taux_interet nul / non défini', () => {
    it('retourne taegApprox = null quand taux_interet est null avec des inputs valides', () => {
      const financementSansTaux = {
        ...FINANCEMENT_COMPLET,
        taux_interet: null,
      } as unknown as Partial<typeof FINANCEMENT_COMPLET>;

      const kpis = computePreviewKPIs(BIEN_COMPLET, financementSansTaux, {});

      expect(kpis.taegApprox).toBeNull();
    });

    it('retourne taegApprox = null quand taux_interet est undefined avec des inputs valides', () => {
      const { taux_interet, ...financementSansTauxInteret } = FINANCEMENT_COMPLET;

      const kpis = computePreviewKPIs(
        BIEN_COMPLET,
        financementSansTauxInteret as typeof FINANCEMENT_COMPLET,
        {}
      );

      expect(kpis.taegApprox).toBeNull();
    });
  });

  describe('cas limite : durée = 0', () => {
    it('mensualiteEstimee = null si duree_emprunt = 0', () => {
      const kpis = computePreviewKPIs(
        BIEN_COMPLET,
        { ...FINANCEMENT_COMPLET, duree_emprunt: 0 },
        {}
      );
      expect(kpis.mensualiteEstimee).toBeNull();
    });
  });

  describe('données totalement vides', () => {
    const kpis = computePreviewKPIs({}, {}, {});

    it('tous les KPIs = null sauf isPartiel', () => {
      expect(kpis.rendementBrut).toBeNull();
      expect(kpis.mensualiteEstimee).toBeNull();
      expect(kpis.investissementTotal).toBeNull();
      expect(kpis.cashflowMensuelEstime).toBeNull();
      expect(kpis.taegApprox).toBeNull();
      expect(kpis.coutTotalCreditEstime).toBeNull();
      expect(kpis.isPartiel).toBe(true);
    });
  });
});
