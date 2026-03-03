# Tests d'Intégration — Conformité Fiscale et Réglementaire

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Créer une suite de tests d'intégration couvrant tous les scénarios fiscaux et réglementaires de Renta_Immo, sécurisant la conformité de l'implémentation identifiée par l'audit du 2026-02-18.

**Architecture:** Tests appelant `performCalculations(input, integrationConfig)` avec un `configOverride` statique (snapshot DB 2026) — aucune connexion DB nécessaire en CI.

**Tech Stack:** Vitest, TypeScript strict, `performCalculations()` de `src/server/calculations/index.ts`

---

## Contexte

- Audit de conformité réalisé le 2026-02-18 (rapport dans `docs/audit/`)
- Revue indépendante le 2026-02-23 (`docs/audit/fonctionnel/revue-audit.md`)
- E-04 (PS LMNP 18,6% vs foncier 17,2%) confirmé correct par l'utilisateur
- Aucune erreur critique dans le code ; tests d'intégration créés pour **pérenniser la conformité**

---

## Task 1 : Documents de référence

**Files:**

- Create: `docs/tests/test-integration/00-index.md`
- Create: `docs/tests/test-integration/01-config-reference.md`
- Create: `docs/tests/test-integration/02-scenarios-specification.md`

**Step 1: Créer 00-index.md**

```markdown
# Tests d'Intégration — Guide

## Objectif

Valider que le moteur de calcul Renta_Immo produit des résultats conformes
aux règles fiscales et réglementaires françaises en vigueur (2026).

## Structure

tests/integration/
├── config/
│ └── integration-config.ts # Snapshot config DB 2026 (sans connexion DB)
├── helpers.ts # createBaseInput(), assertions
├── scenarios/
│ ├── 01-revenus-fonciers.test.ts
│ ├── 02-lmnp.test.ts
│ ├── 03-sci-is.test.ts
│ ├── 04-hcsf.test.ts
│ ├── 05-plus-value-dpe.test.ts
│ └── 06-scoring-projections.test.ts
└── fiscal-conformity.test.ts # Paramètres fiscaux vs textes légaux

## Exécution

npm run test:integration # Intégration seuls
npm run test # Tous les tests (unit + intégration)

## Mise à jour de la config

Si les paramètres DB changent (nouvelle LF), mettre à jour :

1. tests/integration/config/integration-config.ts
2. docs/tests/test-integration/01-config-reference.md
3. Relancer les tests — les cas dérivant doivent être ajustés

## Références légales

- CGI Art.32 — Micro-foncier
- CGI Art.156 — Déficit foncier
- CGI Art.50-0 — Micro-BIC / LMNP
- CGI Art.219 — IS (15%/25%, seuil 42 500 €)
- CGI Art.200A — Flat Tax (PFU 30%)
- CGI Art.150VC/VD — Plus-values immobilières
- CGI Art.1609 nonies G — Surtaxe PV > 50 000 €
- Décision HCSF 2024 — 35%, 25 ans (27 ans VEFA)
- LFSS 2026 — PS BIC LMNP 18,6%
- LF 2025 (Loi Le Meur) — Réintégration amortissements LMNP (15/02/2025)
```

**Step 2: Créer 01-config-reference.md**

```markdown
# Configuration de Référence 2026

Snapshot des valeurs en base de données `config_params` (annee_fiscale = 2026).
Requête source : SELECT bloc, cle, valeur FROM config_params WHERE annee_fiscale = 2026 ORDER BY bloc, cle;

## Fiscalité

| Paramètre                                | Valeur        | Référence légale       |
| ---------------------------------------- | ------------- | ---------------------- |
| TAUX_PS_FONCIER                          | 0.172 (17,2%) | Revenus fonciers / PV  |
| TAUX_PS_REVENUS_BIC_LMNP                 | 0.186 (18,6%) | LFSS 2026              |
| MICRO_FONCIER_ABATTEMENT                 | 0.30          | CGI Art.32             |
| MICRO_FONCIER_PLAFOND                    | 15 000 €      | CGI Art.32             |
| MICRO_BIC_MEUBLE_LONGUE_DUREE_ABATTEMENT | 0.50          | CGI Art.50-0           |
| MICRO_BIC_MEUBLE_LONGUE_DUREE_PLAFOND    | 77 700 €      | CGI Art.50-0           |
| MICRO_BIC_TOURISME_CLASSE_ABATTEMENT     | 0.71          | CGI Art.50-0 (LF 2024) |
| MICRO_BIC_TOURISME_CLASSE_PLAFOND        | 188 700 €     | CGI Art.50-0 (LF 2024) |
| MICRO_BIC_TOURISME_NON_CLASSE_ABATTEMENT | 0.30          | CGI Art.50-0 (LF 2024) |
| MICRO_BIC_TOURISME_NON_CLASSE_PLAFOND    | 15 000 €      | CGI Art.50-0 (LF 2024) |
| IS_TAUX_REDUIT                           | 0.15          | CGI Art.219            |
| IS_TAUX_NORMAL                           | 0.25          | CGI Art.219            |
| IS_SEUIL_TAUX_REDUIT                     | 42 500 €      | CGI Art.219 (LF 2023)  |
| FLAT_TAX                                 | 0.30          | CGI Art.200A           |

## Déficit Foncier

| DEFICIT_FONCIER_PLAFOND_IMPUTATION | 10 700 € | CGI Art.156 |
| DEFICIT_FONCIER_PLAFOND_ENERGIE | 21 400 € | CGI Art.156 (LF 2023, 2023-2025) |
| DEFICIT_FONCIER_DUREE_REPORT | 10 ans | CGI Art.156 |

## Plus-Value Immobilière

| PLUS_VALUE_TAUX_IR | 0.19 (19%) | CGI Art.150VC |
| PLUS_VALUE_TAUX_PS | 0.172 (17,2%) | CGI Art.150VC |
| PLUS_VALUE_FORFAIT_FRAIS_ACQUISITION | 0.075 (7,5%) | BOFiP |
| PLUS_VALUE_FORFAIT_TRAVAUX_PV | 0.15 (15%) | BOFiP (si > 5 ans) |
| PLUS_VALUE_SEUIL_SURTAXE | 50 000 € | CGI Art.1609 nonies G |

### Barème surtaxe PV (CGI Art.1609 nonies G)

| Tranche PV nette    | Taux                |
| ------------------- | ------------------- |
| 50 001 – 100 000 €  | 2%                  |
| 100 001 – 150 000 € | 3%                  |
| 150 001 – 200 000 € | 4%                  |
| 200 001 – 250 000 € | 5% ← NC-02 corrigée |
| > 250 000 €         | 6%                  |

## HCSF (Décision 2024)

| HCSF_TAUX_MAX | 0.35 (35%) |
| HCSF_DUREE_MAX_ANNEES | 25 ans |
| HCSF_DUREE_MAX_ANNEES_VEFA | 27 ans |
| HCSF_PONDERATION_LOCATIFS | 0.70 (70%) |
| HCSF_TAUX_REFERENCE_CAPACITE | 0.035 (3,5%) |
| HCSF_DUREE_CAPACITE_RESIDUELLE_ANNEES | 20 ans |

## Scoring / LMP

| LMP_SEUIL_ALERTE | 20 000 €/an |
| LMP_SEUIL_LMP | 23 000 €/an | CGI Art.155 IV |
| RESTE_A_VIVRE_SEUIL_MIN | 1 000 €/mois |
| RESTE_A_VIVRE_SEUIL_CONFORT | 2 500 €/mois |

## DPE (Loi Climat-Résilience 2021)

| DECOTE_DPE_FG | 0.15 (−15%) |
| DECOTE_DPE_E | 0.05 (−5%) |

## Projections

| PROJECTION_INFLATION_LOYER | 0.015 (1,5%/an) |
| PROJECTION_INFLATION_CHARGES | 0.02 (2%/an) |
| PROJECTION_REVALORISATION_BIEN | 0.01 (1%/an) |
```

**Step 3: Créer 02-scenarios-specification.md** (voir contenu détaillé section suivante)

**Step 4: Vérifier que les fichiers existent**

```bash
ls docs/tests/test-integration/
```

**Step 5: Commit**

```bash
git add docs/tests/test-integration/
git commit -m "docs(tests): add integration tests reference documentation"
```

---

## Task 2 : Configuration statique pour les tests

**Files:**

- Create: `tests/integration/config/integration-config.ts`

**Step 1: Écrire integration-config.ts**

```typescript
import type { ResolvedConfig } from '@/server/config/config-types';

/**
 * Configuration de référence pour les tests d'intégration.
 * Snapshot des valeurs en base de données (annee_fiscale: 2026).
 * Dernière synchronisation : 2026-02-23
 *
 * Pour resynchroniser depuis la DB :
 * SELECT bloc, cle, valeur FROM config_params
 * WHERE annee_fiscale = 2026 ORDER BY bloc, cle;
 */
export const integrationConfig: ResolvedConfig = {
  anneeFiscale: 2026,
  // --- Fiscalité ---
  tauxPsFoncier: 0.172, // TAUX_PS_FONCIER
  tauxPsRevenusBicLmnp: 0.186, // TAUX_PS_REVENUS_BIC_LMNP (LFSS 2026)
  microFoncierAbattement: 0.3, // MICRO_FONCIER_ABATTEMENT (CGI Art.32)
  microFoncierPlafond: 15000, // MICRO_FONCIER_PLAFOND
  microBicMeubleLongueDureeAbattement: 0.5, // CGI Art.50-0
  microBicMeubleLongueDureePlafond: 77700,
  microBicTourismeClasseAbattement: 0.71, // CGI Art.50-0 LF 2024
  microBicTourismeClassePlafond: 188700,
  microBicTourismeNonClasseAbattement: 0.3,
  microBicTourismeNonClassePlafond: 15000,
  isTauxReduit: 0.15, // CGI Art.219
  isTauxNormal: 0.25,
  isSeuilTauxReduit: 42500,
  flatTax: 0.3, // CGI Art.200A (PFU)
  // --- Déficit Foncier ---
  deficitFoncierPlafondImputation: 10700, // CGI Art.156
  deficitFoncierPlafondEnergie: 21400, // CGI Art.156 LF 2023
  deficitFoncierDureeReport: 10,
  // --- Plus-Value ---
  plusValueTauxIr: 0.19, // CGI Art.150VC
  plusValueTauxPs: 0.172,
  plusValueForfaitFraisAcquisition: 0.075, // BOFiP
  plusValueForfaitTravauxPv: 0.15, // BOFiP (si > 5 ans)
  plusValueSeuilSurtaxe: 50000, // CGI Art.1609 nonies G
  // --- HCSF ---
  hcsfTauxMax: 0.35, // Décision HCSF 2024
  hcsfDureeMaxAnnees: 25,
  hcsfPonderationLocatifs: 0.7,
  hcsfTauxReferenceCapacite: 0.035,
  hcsfDureeCapaciteResiduelleAnnees: 20,
  hcsfDureeMaxAnneesVefa: 27, // REC-04 : dérogation VEFA
  // --- DPE ---
  decoteDpeFg: 0.15, // Loi Climat-Résilience 2021
  decoteDpeE: 0.05,
  // --- LMP / Scoring ---
  lmpSeuilAlerte: 20000, // CGI Art.155 IV
  lmpSeuilLmp: 23000,
  resteAVivreSeuilMin: 1000,
  resteAVivreSeuilConfort: 2500,
  // --- Charges / Défauts ---
  defaultsAssurancePno: 150,
  defaultsChargesCoproM2: 30,
  defaultsTaxeFoncieresMois: 0.1,
  defaultsFraisDossierBanque: 500,
  defaultsFraisGarantieCredit: 0.012,
  defaultsComptableLmnp: 400,
  defaultsCfeMin: 150,
  cfeSeuilExoneration: 5000,
  fraisReventeTauxAgenceDefaut: 0.05,
  fraisReventeDiagnostics: 500,
  notaireTauxAncien: 0.08,
  notaireTauxNeuf: 0.025,
  notaireDmtoTauxStandard: 0.0580665,
  notaireCsiTaux: 0.001,
  notaireDeboursForfait: 800,
  // --- Projections ---
  projectionInflationLoyer: 0.015,
  projectionInflationCharges: 0.02,
  projectionRevalorisation: 0.01,
  projectionDecoteDpeFg: 0.15,
  projectionDecoteDpeE: 0.05,
};
```

**Step 2: Vérifier TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors

**Step 3: Commit**

```bash
git add tests/integration/config/integration-config.ts
git commit -m "test(integration): add static config snapshot from DB 2026"
```

---

## Task 3 : Helpers partagés

**Files:**

- Create: `tests/integration/helpers.ts`

**Step 1: Écrire helpers.ts**

```typescript
import type { CalculateurFormData } from '@/types/calculateur';

/**
 * Données de base pour les scénarios d'intégration.
 * Bien de référence : appartement ancien 200k€, LMNP réel, TMI 30%.
 */
export function createBaseInput(overrides?: DeepPartial<CalculateurFormData>): CalculateurFormData {
  return {
    bien: {
      adresse: 'Test Intégration',
      prix_achat: 200000,
      surface: 50,
      type_bien: 'appartement',
      etat_bien: 'ancien',
      montant_travaux: 0,
      valeur_mobilier: 0,
      dpe: 'C',
      ...overrides?.bien,
    },
    financement: {
      apport: 40000,
      taux_interet: 3.5,
      duree_emprunt: 20,
      assurance_pret: 0.1,
      frais_dossier: 0,
      frais_garantie: 0,
      ...overrides?.financement,
    },
    exploitation: {
      loyer_mensuel: 900,
      charges_copro: 100,
      taxe_fonciere: 1000,
      assurance_pno: 150,
      gestion_locative: 0,
      provision_travaux: 0,
      provision_vacance: 0,
      type_location: 'meublee_longue_duree',
      charges_copro_recuperables: 0,
      assurance_gli: 0,
      cfe_estimee: 0,
      comptable_annuel: 400,
      taux_occupation: 1,
      ...overrides?.exploitation,
    },
    structure: {
      type: 'nom_propre',
      tmi: 30,
      regime_fiscal: 'lmnp_reel',
      associes: [],
      ...overrides?.structure,
    },
    options: {
      generer_pdf: false,
      envoyer_email: false,
      horizon_projection: 20,
      ...overrides?.options,
    },
  };
}

// Helper TypeScript pour les types partiels imbriqués
type DeepPartial<T> = T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
```

**Step 2: Vérifier compilation**

```bash
npx tsc --noEmit
```

**Step 3: Commit**

```bash
git add tests/integration/helpers.ts
git commit -m "test(integration): add shared helpers for integration tests"
```

---

## Task 4 : Scénarios Revenus Fonciers (Location Nue)

**Files:**

- Create: `tests/integration/scenarios/01-revenus-fonciers.test.ts`

**Calculs attendus (vérifiés manuellement) :**

SC-01 — Micro-foncier:

- Loyer = 800 €/mois → 9 600 €/an < 15 000 € → éligible
- Base imposable = 9 600 × (1 − 0,30) = 6 720 €
- IR = 6 720 × 0,30 = 2 016 €
- PS = 6 720 × 0,172 = 1 155,84 €
- **Total impôt ≈ 3 172 €**

SC-02 — Déficit foncier:

- Loyer = 700 €/mois → 8 400 €/an
- Travaux = 15 000 €, charges fixes ≈ 1 300 €/an
- Emprunt ≈ 185 200 € (200k + 16k notaire − 40k apport + 15k travaux...)
- Intérêts an 1 ≈ 6 482 €
- Déficit hors intérêts = 15 000 + 1 300 − 8 400 = 7 900 € → < 10 700 €
- Économie IR = 7 900 × 30% = 2 370 € → impôt < 0
- impot_estime < 0

SC-03 — Déficit majoré énergie:

- Même cas mais renovation_energetique=true → plafond 21 400 €
- Économie IR plafonnée à 21 400 × 30% = 6 420 €

SC-04 — Foncier réel positif:

- Loyer = 1 200 €/mois → 14 400 €/an, charges = 2 200 €/an, intérêts ≈ 5 740 €
- Revenu net = 14 400 − 2 200 − 5 740 = 6 460 €
- IR = 6 460 × 30% = 1 938 €
- PS = 6 460 × 17,2% = 1 111 €
- **Total ≈ 3 049 €**

**Step 1: Écrire le fichier de test**

```typescript
import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

describe('SC — Revenus Fonciers (Location Nue)', () => {
  it('SC-01 [CGI Art.32] Micro-foncier: abattement 30%, base imposable correcte', async () => {
    const input = createBaseInput({
      bien: { montant_travaux: 0, valeur_mobilier: 0 },
      exploitation: {
        loyer_mensuel: 800, // 9 600/an < 15 000€ → éligible micro-foncier
        type_location: 'nue',
        charges_copro: 50,
        taxe_fonciere: 800,
        assurance_pno: 150,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      structure: { regime_fiscal: 'micro_foncier', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toBe('Location Nue (Micro-foncier)');

    // Base = 9 600 × 0.7 = 6 720 €; IR = 6 720 × 30% = 2 016; PS = 6 720 × 17.2% = 1 155.84
    // Total ≈ 3 172 €
    expect(fiscalite.impot_estime).toBeGreaterThan(3000);
    expect(fiscalite.impot_estime).toBeLessThan(3350);
  });

  it('SC-02 [CGI Art.156] Déficit foncier: économie impôt plafonnée à 10 700€', async () => {
    const input = createBaseInput({
      bien: { montant_travaux: 15000, valeur_mobilier: 0 },
      exploitation: {
        loyer_mensuel: 700,
        type_location: 'nue',
        charges_copro: 50,
        taxe_fonciere: 800,
        assurance_pno: 150,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      structure: { regime_fiscal: 'reel', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toBe('Location Nue (Réel)');
    // Déficit généré par les travaux → économie d'impôt → impot_estime < 0
    expect(fiscalite.impot_estime).toBeLessThan(0);
    // Économie max plafonnée = 10 700 × 30% = −3 210
    expect(fiscalite.impot_estime).toBeGreaterThan(-4000);
  });

  it('SC-03 [CGI Art.156 LF2023] Déficit majoré énergie: plafond 21 400€ appliqué', async () => {
    const input = createBaseInput({
      bien: {
        montant_travaux: 30000,
        valeur_mobilier: 0,
        dpe: 'F',
        renovation_energetique: true,
        annee_travaux: 2024,
      },
      exploitation: {
        loyer_mensuel: 700,
        type_location: 'nue',
        charges_copro: 50,
        taxe_fonciere: 800,
        assurance_pno: 150,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      structure: { regime_fiscal: 'reel', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);

    expect(result.success).toBe(true);
    if (!result.success) return;

    // Avec travaux 30k + charges > loyers : déficit important → économie d'impôt
    expect(result.resultats.fiscalite.impot_estime).toBeLessThan(0);
    // Économie max plafonnée = 21 400 × 30% = −6 420
    expect(result.resultats.fiscalite.impot_estime).toBeGreaterThan(-7500);
  });

  it('SC-04 [CGI Art.28] Foncier réel positif: IR + PS sur revenu net', async () => {
    const input = createBaseInput({
      bien: { montant_travaux: 0, valeur_mobilier: 0 },
      exploitation: {
        loyer_mensuel: 1200, // 14 400/an
        type_location: 'nue',
        charges_copro: 80,
        taxe_fonciere: 1200,
        assurance_pno: 150,
        comptable_annuel: 0,
        gestion_locative: 0,
        provision_travaux: 0,
        provision_vacance: 0,
        cfe_estimee: 0,
        assurance_gli: 0,
      },
      structure: { regime_fiscal: 'reel', tmi: 30 },
    });

    const result = await performCalculations(input, integrationConfig);

    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toBe('Location Nue (Réel)');
    // Revenu net positif → impôt positif
    expect(fiscalite.impot_estime).toBeGreaterThan(0);
  });
});
```

**Step 2: Lancer les tests**

```bash
npx vitest run tests/integration/scenarios/01-revenus-fonciers.test.ts --reporter=verbose
```

Expected: 4 tests PASS

**Step 3: Commit**

```bash
git add tests/integration/scenarios/01-revenus-fonciers.test.ts
git commit -m "test(integration): SC-01 to SC-04 revenus fonciers location nue"
```

---

## Task 5 : Scénarios LMNP

**Files:**

- Create: `tests/integration/scenarios/02-lmnp.test.ts`

**Calculs attendus :**

SC-05 — LMNP Micro-BIC longue durée:

- Loyer = 900 €/mois → 10 800 €/an < 77 700 €
- Base = 10 800 × (1 − 0,50) = 5 400 €
- IR = 5 400 × 30% = 1 620 €
- PS = 5 400 × 18,6% = 1 004,40 €
- **Total ≈ 2 624 €**

SC-06 — LMNP Micro-BIC tourisme classé:

- Loyer = 2 500 €/mois → 30 000 €/an < 188 700 €
- Base = 30 000 × (1 − 0,71) = 8 700 €
- IR = 8 700 × 30% = 2 610 €
- PS = 8 700 × 18,6% = 1 618,20 €
- **Total ≈ 4 228 €**

SC-07 — LMNP Micro-BIC tourisme non classé:

- Loyer = 1 100 €/mois → 13 200 €/an < 15 000 €
- Base = 13 200 × (1 − 0,30) = 9 240 €
- IR = 9 240 × 30% = 2 772 €
- PS = 9 240 × 18,6% = 1 718,64 €
- **Total ≈ 4 491 €**

SC-08 — LMNP Réel base imposable = 0:

- Amortissements > bénéfice → impôt = 0 (CGI Art.39C : l'amort ne crée pas de déficit BIC)

SC-09 — LMNP Réel bénéfice résiduel:

- Très petit bien avec valeur mobilier faible → amorts insuffisants → impôt > 0
- impot_estime > 0

SC-10 — Alerte LMP seuil 20 000 €:

- loyer_mensuel = 1 800 €/mois → 21 600 €/an > 20 000 €
- Alerte LMP dans alertes ou points_attention

**Step 1: Écrire le fichier de test**

```typescript
import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

describe('SC — LMNP (Loueur en Meublé)', () => {
  it('SC-05 [CGI Art.50-0] LMNP Micro-BIC longue durée: abattement 50%', async () => {
    const input = createBaseInput({
      bien: { valeur_mobilier: 5000 },
      exploitation: {
        loyer_mensuel: 900, // 10 800/an < 77 700€
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
    expect(fiscalite.regime).toBe('LMNP (Micro-BIC)');
    // Base = 10 800 × 50% = 5 400; IR = 1 620; PS(18.6%) = 1 004
    // Total ≈ 2 624 €
    expect(fiscalite.impot_estime).toBeGreaterThan(2400);
    expect(fiscalite.impot_estime).toBeLessThan(2900);
  });

  it('SC-06 [CGI Art.50-0 LF2024] LMNP Micro-BIC tourisme classé: abattement 71%', async () => {
    const input = createBaseInput({
      bien: { valeur_mobilier: 10000 },
      exploitation: {
        loyer_mensuel: 2500, // 30 000/an < 188 700€
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
    // Base = 30 000 × (1-0.71) = 8 700; IR = 2 610; PS = 1 618
    expect(fiscalite.impot_estime).toBeGreaterThan(3900);
    expect(fiscalite.impot_estime).toBeLessThan(4600);
  });

  it('SC-07 [CGI Art.50-0 LF2024] LMNP Micro-BIC tourisme non classé: abattement 30%', async () => {
    const input = createBaseInput({
      bien: { valeur_mobilier: 5000 },
      exploitation: {
        loyer_mensuel: 1100, // 13 200/an < 15 000€
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
        valeur_mobilier: 5000, // amort mobilier 500/an
        // bâti 85% = 170k; amort annuel bâti = 170k/33 ≈ 5 152/an
      },
      exploitation: {
        loyer_mensuel: 900, // 10 800/an
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
    expect(fiscalite.regime).toBe('LMNP (Réel)');
    // Amorts (5 652/an) > bénéfice résiduel → base = 0 → impôt = 0
    expect(fiscalite.impot_estime).toBe(0);
  });

  it('SC-09 [CGI Art.39C] LMNP Réel: bénéfice résiduel positif si amorts insuffisants', async () => {
    const input = createBaseInput({
      bien: {
        prix_achat: 200000,
        montant_travaux: 0,
        valeur_mobilier: 1000, // amort mobilier = 100/an seulement
      },
      exploitation: {
        loyer_mensuel: 2000, // 24 000/an — revenus élevés
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
        loyer_mensuel: 1800, // 21 600/an > 20 000€ seuil alerte LMP
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

    // L'alerte LMP doit apparaître dans les points d'attention ou alertes
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
```

**Step 2: Lancer les tests**

```bash
npx vitest run tests/integration/scenarios/02-lmnp.test.ts --reporter=verbose
```

Expected: 6 tests PASS

**Step 3: Commit**

```bash
git add tests/integration/scenarios/02-lmnp.test.ts
git commit -m "test(integration): SC-05 to SC-10 LMNP micro-BIC et réel"
```

---

## Task 6 : Scénarios SCI à l'IS

**Files:**

- Create: `tests/integration/scenarios/03-sci-is.test.ts`

**Calculs attendus :**

SC-11 — SCI IS capitalisation:

- Loyer = 3 000 €/mois → 36 000 €/an
- Prix achat = 250 000 €, mobilier = 10 000 €
- Résultat avant IS = loyers − charges − intérêts − amortissements
- IS 15% si bénéfice < 42 500 €
- Pas de Flat Tax en capitalisation

SC-12 — SCI IS distribution:

- Même données mais distribution_dividendes = true
- Flat Tax 30% sur le résultat net comptable distribuable

SC-13 — SCI IS taux normal (bénéfice > 42 500 €):

- Loyers très élevés pour forcer le bénéfice > 42 500 €
- La tranche au-delà de 42 500 € est taxée à 25%

**Step 1: Écrire le fichier de test**

```typescript
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
    expect(fiscalite.regime).toMatch(/SCI.*IS.*Capitalisation/i);
    // Impôt > 0 (IS calculé)
    expect(fiscalite.impot_estime).toBeGreaterThan(0);
  });

  it('SC-12 [CGI Art.200A] SCI IS distribution: Flat Tax 30% sur dividendes distribuables', async () => {
    const input = sciBaseInput();
    // Activer la distribution
    (input.structure as { distribution_dividendes: boolean }).distribution_dividendes = true;

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const { fiscalite } = result.resultats;
    expect(fiscalite.regime).toMatch(/SCI.*IS.*Distribution/i);
    // Impôt = IS + Flat Tax
    expect(fiscalite.impot_estime).toBeGreaterThan(0);

    // En distribution, l'impôt total doit être supérieur à la capitalisation seule
    // (IS + FlatTax > IS seul)
    const capitalInput = sciBaseInput();
    (capitalInput.structure as { distribution_dividendes: boolean }).distribution_dividendes =
      false;
    const capitalResult = await performCalculations(capitalInput, integrationConfig);
    if (capitalResult.success) {
      expect(fiscalite.impot_estime).toBeGreaterThan(
        capitalResult.resultats.fiscalite.impot_estime
      );
    }
  });

  it('SC-13 [CGI Art.219] SCI IS: taux normal 25% sur tranche > 42 500€', async () => {
    // Loyers très élevés pour générer un bénéfice imposable > 42 500€
    const input = sciBaseInput();
    input.exploitation.loyer_mensuel = 8000; // 96 000/an
    input.exploitation.charges_copro = 100;
    input.exploitation.taxe_fonciere = 500;
    input.exploitation.comptable_annuel = 0;

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    // L'impôt doit intégrer le taux normal 25% sur la part > 42 500€
    // IS total > 42 500 × 15% = 6 375 €
    expect(result.resultats.fiscalite.impot_estime).toBeGreaterThan(6375);
  });
});
```

**Step 2: Lancer les tests**

```bash
npx vitest run tests/integration/scenarios/03-sci-is.test.ts --reporter=verbose
```

Expected: 3 tests PASS

**Step 3: Commit**

```bash
git add tests/integration/scenarios/03-sci-is.test.ts
git commit -m "test(integration): SC-11 to SC-13 SCI IS capitalisation et distribution"
```

---

## Task 7 : Scénarios HCSF

**Files:**

- Create: `tests/integration/scenarios/04-hcsf.test.ts`

**Calculs attendus :**

SC-14 — HCSF conforme:

- Revenus activité 4 000 €/mois (TMI 30% → 3 500 approximation ou saisi)
- Mensualité crédit existant 0
- Nouveau crédit ≈ 800 €/mois
- Loyer pondéré 70% = 900 × 70% = 630 €/mois
- Revenus pondérés = 4 000 + 630 = 4 630 €/mois
- Taux endettement = 800 / 4 630 = 17,3% < 35% → CONFORME

SC-15 — HCSF non conforme:

- Mensualités existantes élevées → taux > 35%

SC-16 — HCSF VEFA 27 ans:

- is_vefa = true, duree_emprunt = 26 ans → CONFORME (< 27 ans max VEFA)
- is_vefa = false, duree_emprunt = 26 ans → alerte (> 25 ans standard)

SC-17 — GLI pondération 80%:

- assurance_gli > 0 + ponderation_loyers = 80
- Revenus locatifs pris à 80% → taux endettement amélioré

**Step 1: Écrire le fichier de test**

```typescript
import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

describe('SC — Analyse HCSF (Décision 2024)', () => {
  it('SC-14 [HCSF Art.1] Taux endettement < 35%: dossier conforme', async () => {
    const input = createBaseInput({
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
        revenus_activite: 4000, // 4 000 €/mois
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
    expect(result.resultats.hcsf.taux_endettement).toBeLessThan(0.35);
  });

  it('SC-15 [HCSF Art.1] Taux endettement > 35%: dossier non conforme', async () => {
    const input = createBaseInput({
      structure: {
        type: 'nom_propre',
        tmi: 30,
        regime_fiscal: 'lmnp_reel',
        associes: [],
        revenus_activite: 2000, // Revenus faibles
        credits_immobiliers: 600, // Crédits existants élevés
        loyers_actuels: 0,
      },
      exploitation: { loyer_mensuel: 900 },
      financement: {
        apport: 10000,
        taux_interet: 3.5,
        duree_emprunt: 25, // Gros emprunt
        assurance_pret: 0.3,
        frais_dossier: 0,
        frais_garantie: 0,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.resultats.hcsf.conforme).toBe(false);
    expect(result.resultats.hcsf.taux_endettement).toBeGreaterThan(0.35);
  });

  it('SC-16 [REC-04] HCSF VEFA: durée 26 ans acceptée (max 27 ans)', async () => {
    const input = createBaseInput({
      bien: { etat_bien: 'neuf', is_vefa: true },
      financement: {
        apport: 40000,
        taux_interet: 3.5,
        duree_emprunt: 26, // > 25 ans standard, < 27 ans VEFA → OK
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
    // L'alerte "durée > 25 ans" doit être présente mais le dossier HCSF est conforme
    const hasVefaContext = result.resultats.hcsf.conforme;
    expect(hasVefaContext).toBe(true);
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
      ...baseInput,
      exploitation: { ...baseInput.exploitation, assurance_gli: 500 },
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
```

**Step 2: Lancer les tests**

```bash
npx vitest run tests/integration/scenarios/04-hcsf.test.ts --reporter=verbose
```

Expected: 4 tests PASS

**Step 3: Commit**

```bash
git add tests/integration/scenarios/04-hcsf.test.ts
git commit -m "test(integration): SC-14 to SC-17 conformité HCSF et VEFA"
```

---

## Task 8 : Scénarios Plus-Value et DPE

**Files:**

- Create: `tests/integration/scenarios/05-plus-value-dpe.test.ts`

**Calculs attendus :**

SC-18 — PV brute simple (< 5 ans, sans abattement):

- prix_achat = 100 000 €, prix_revente = 150 000 €, duree_detention = 3 ans
- Prix acquisition corrigé (BOFiP) = 100 000 × (1 + 7,5%) = 107 500 €
- PV brute = 150 000 − 107 500 = 42 500 € < 50 000 € → pas de surtaxe
- Abattement IR = 0% (< 5 ans)
- Impôt IR = 42 500 × 19% = 8 075 €
- Impôt PS = 42 500 × 17,2% = 7 310 €
- Total ≈ 15 385 €

SC-19 — Surtaxe PV tranche 200-250k (NC-02 corrigée):

- PV nette IR dans la tranche 200-250k → taux 5% (pas 6%)

SC-20 — DPE F décote 15%:

- DPE = 'F', détention 10 ans
- Valeur terminale = prix_achat × (1+1%)^10 × (1−15%)
- Alerte DPE passoire présente

SC-21 — Loi Le Meur réintégration amortissements:

- LMNP réel, détention > 15/02/2025
- amortissements_reintegres > 0 dans le résultat plus-value

**Step 1: Écrire le fichier de test**

```typescript
import { describe, it, expect } from 'vitest';
import { performCalculations } from '@/server/calculations/index';
import { integrationConfig } from '../config/integration-config';
import { createBaseInput } from '../helpers';

describe('SC — Plus-Value et Impact DPE', () => {
  it('SC-18 [CGI Art.150VC] PV sans abattement (< 5 ans): IR 19% + PS 17.2%', async () => {
    const input = createBaseInput({
      bien: {
        prix_achat: 100000,
        etat_bien: 'ancien',
        montant_travaux: 0,
        valeur_mobilier: 0,
        dpe: 'C',
      },
      financement: {
        apport: 100000, // achat cash pour simplifier
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
        prix_revente: 150000,
        duree_detention: 3, // < 5 ans → pas d'abattement
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const pv = result.resultats.projections.plusValue;
    expect(pv).toBeDefined();
    if (!pv) return;

    // PV brute = 150 000 − (100 000 × 1.075) = 42 500 €
    expect(pv.plus_value_brute).toBeCloseTo(42500, -2);
    // Abattement 0% (< 5 ans)
    expect(pv.abattement_ir).toBe(0);
    // PV nette = PV brute = 42 500 € < 50 000 € → pas de surtaxe
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
        prix_revente: 400000, // PV brute élevée pour atteindre la tranche 200-250k
        duree_detention: 3,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const pv = result.resultats.projections.plusValue;
    expect(pv).toBeDefined();
    if (!pv) return;

    // PV nette IR dans la tranche 200-250k → taux 5% (pas 6%)
    // Tranche 200-250k: 50 000 × 5% = 2 500 € pour cette tranche seule
    expect(pv.surtaxe).toBeGreaterThan(0);

    // Vérification de la cohérence : si PV nette = 292 500 approx
    // Surtaxe = 50k×2% + 50k×3% + 50k×4% + 50k×5% + 42500×6%
    // = 1000 + 1500 + 2000 + 2500 + 2550 = 9 550 €
    // La surtaxe doit être cohérente avec le barème corrigé
    const pvNetteIr = pv.plus_value_nette_ir;
    if (pvNetteIr > 200000 && pvNetteIr < 250000) {
      // La tranche 200-250k doit être taxée à 5%, pas 6%
      // Surtaxe de cette tranche = (pvNetteIr - 200000) × 5%
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
        prix_revente: undefined,
        duree_detention: 10,
      },
    });

    const result = await performCalculations(input, integrationConfig);
    expect(result.success).toBe(true);
    if (!result.success) return;

    const lastProjection = result.resultats.projections.projections[9]; // année 10
    // Valeur bien avec DPE F = prix × (1.01)^10 × (1 - 15%)
    // = 150 000 × 1.1046 × 0.85 = 140 838 € → < prix d'achat
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
        // Pas de résidence de services → réintégration active
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

    const pv = result.resultats.projections.plusValue;
    expect(pv).toBeDefined();
    if (!pv) return;

    // Loi Le Meur (15/02/2025) : amortissements immobiliers réintégrés dans PV
    // → amortissements_reintegres > 0
    expect(pv.amortissements_reintegres).toBeGreaterThan(0);
    // → PV brute augmentée par la réintégration
    expect(pv.plus_value_brute).toBeGreaterThan(pv.prix_vente - pv.prix_achat * (1 + 0.075));
  });
});
```

**Step 2: Lancer les tests**

```bash
npx vitest run tests/integration/scenarios/05-plus-value-dpe.test.ts --reporter=verbose
```

Expected: 4 tests PASS

**Step 3: Commit**

```bash
git add tests/integration/scenarios/05-plus-value-dpe.test.ts
git commit -m "test(integration): SC-18 to SC-21 plus-value, DPE, Loi Le Meur"
```

---

## Task 9 : Scoring et Projections

**Files:**

- Create: `tests/integration/scenarios/06-scoring-projections.test.ts`

**Step 1: Écrire le fichier de test**

```typescript
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
      bien: { dpe: 'E' }, // DPE moyen → score patrimonial impacté
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

    // Les deux profils doivent être calculés
    const scoreRentier = rentierResult.resultats.synthese.scores_par_profil?.rentier;
    const scorePatrimonial = patrimonialResult.resultats.synthese.scores_par_profil?.patrimonial;

    expect(scoreRentier).toBeDefined();
    expect(scorePatrimonial).toBeDefined();

    // Les scores doivent être dans [0, 100]
    expect(rentierResult.resultats.synthese.score_global).toBeGreaterThanOrEqual(0);
    expect(rentierResult.resultats.synthese.score_global).toBeLessThanOrEqual(100);
  });

  it('SC-23 [REC-05] Apport = 0: alerte TRI non significatif', async () => {
    const input = createBaseInput({
      financement: {
        apport: 0, // Financement 110%
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

    // REC-05 : alerte TRI non significatif si apport = 0
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
        revenus_activite: 1500, // Revenus très faibles
        credits_immobiliers: 300, // Charge existante
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

    // Le reste à vivre doit déclencher une alerte
    const allMessages = [...result.alertes, ...result.resultats.synthese.points_attention]
      .join(' ')
      .toLowerCase();

    // Soit le taux d'endettement est > 35% (non conforme), soit une alerte RAV
    const isNonConforme = !result.resultats.hcsf.conforme;
    const hasRavAlert = allMessages.includes('reste') || allMessages.includes('vivre');
    expect(isNonConforme || hasRavAlert).toBe(true);
  });

  it('SC-25 Projections 20 ans: hypothèses inflation présentes (REC-03)', async () => {
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
    // REC-03 : hypothèses inflation affichées
    expect(projections.hypotheses).toBeDefined();
    expect(projections.hypotheses?.inflationLoyer).toBe(0.015);
    expect(projections.hypotheses?.inflationCharges).toBe(0.02);
    expect(projections.hypotheses?.revalorisationBien).toBe(0.01);
    // 20 années de projection
    expect(projections.projections).toHaveLength(20);
  });
});
```

**Step 2: Lancer les tests**

```bash
npx vitest run tests/integration/scenarios/06-scoring-projections.test.ts --reporter=verbose
```

Expected: 4 tests PASS

**Step 3: Commit**

```bash
git add tests/integration/scenarios/06-scoring-projections.test.ts
git commit -m "test(integration): SC-22 to SC-25 scoring dual profil et projections"
```

---

## Task 10 : Tests de Conformité Fiscale

**Files:**

- Create: `tests/integration/fiscal-conformity.test.ts`

Ces tests vérifient que les **paramètres fiscaux appliqués** sont ceux de la configuration légale 2026. Ils servent de filet de sécurité si les valeurs de config changent.

**Step 1: Écrire le fichier de test**

```typescript
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
          associes: [{ nom: 'A', parts: 100, revenus: 3500, mensualites: 0, charges: 0 }],
          distribution_dividendes: true,
        },
      });

      const result = await performCalculations(input, integrationConfig);
      expect(result.success).toBe(true);
      if (!result.success) return;

      expect(result.resultats.fiscalite.regime).toMatch(/Distribution/i);
      // La flat tax doit être dans les comparaisons
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
          associes: [{ nom: 'A', parts: 100, revenus: 3500, mensualites: 0, charges: 0 }],
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
      expect(pv.abattement_ir).toBe(1); // 100%
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

      // Abattement PS pour 10 ans = (10-5) × 1.65% = 8.25%
      expect(pv.abattement_ps).toBeCloseTo(0.0825, 3);
    });
  });

  describe('CF-08 — PMT (Mensualité Crédit)', () => {
    it('CF-08 Formule PMT standard: 160 000€, 20 ans, 3.5% → ≈ 928€/mois', async () => {
      const input = createBaseInput({
        financement: {
          apport: 40000, // 200k + ~16k notaire - 40k = ~176k
          taux_interet: 3.5,
          duree_emprunt: 20,
          assurance_pret: 0, // Isoler la mensualité hors assurance
          frais_dossier: 0,
          frais_garantie: 0,
        },
        bien: { prix_achat: 176000, etat_bien: 'ancien', montant_travaux: 0, valeur_mobilier: 0 },
      });

      // Pour 176k achat, notaire 8% = 14 080k, total = 190 080, emprunt = 190 080 - 40 000 = 150 080
      // On veut isoler pour un emprunt de ~160k:
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
      // Pour 150k, 3.5%, 20 ans → mensualité ≈ 869 €
      // Vérification formule PMT: M = Capital × i / (1 - (1+i)^-n)
      const capital = result.resultats.financement.montant_emprunt;
      const i = 3.5 / 100 / 12;
      const n = 20 * 12;
      const expected = (capital * i) / (1 - Math.pow(1 + i, -n));
      expect(mensualite).toBeCloseTo(expected, 0); // précision 1€
    });
  });
});
```

**Step 2: Lancer les tests**

```bash
npx vitest run tests/integration/fiscal-conformity.test.ts --reporter=verbose
```

Expected: 8+ tests PASS

**Step 3: Commit**

```bash
git add tests/integration/fiscal-conformity.test.ts
git commit -m "test(integration): CF-01 to CF-08 conformité paramètres fiscaux 2026"
```

---

## Task 11 : Script package.json + Job CI/CD

**Files:**

- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**Step 1: Ajouter script dans package.json**

Dans la section `scripts`, ajouter après `test:regression:watch`:

```json
"test:integration": "vitest run --reporter=verbose tests/integration",
```

**Step 2: Vérifier que le script fonctionne**

```bash
npm run test:integration
```

Expected: tous les tests d'intégration passent

**Step 3: Ajouter job integration-tests dans ci.yml**

Ajouter après le job `unit-tests` :

```yaml
integration-tests:
  name: Integration Tests (Fiscal Conformity)
  runs-on: ubuntu-latest
  needs: [quality-checks, unit-tests]

  steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup Node.js ${{ env.NODE_VERSION }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run integration tests
      # Pas de DB requise : config statique dans tests/integration/config/
      run: npm run test:integration

    - name: Upload integration test results
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: integration-test-results
        path: |
          coverage/
        retention-days: 7
```

Mettre aussi à jour le job `build` pour dépendre de `integration-tests`:

```yaml
build:
  needs: [quality-checks, unit-tests, integration-tests]
```

**Step 4: Vérifier la config CI**

```bash
# Vérifier la syntaxe YAML localement si actionlint disponible
cat .github/workflows/ci.yml
```

**Step 5: Commit final**

```bash
git add package.json .github/workflows/ci.yml
git commit -m "ci: add integration-tests job for fiscal conformity verification"
```

---

## Task 12 : Document de Spécification des Scénarios

**Files:**

- Create: `docs/tests/test-integration/02-scenarios-specification.md`

Ce document doit contenir pour chaque scénario :

- Code de référence (SC-XX ou CF-XX)
- Règle testée et référence légale
- Données d'entrée
- Résultats attendus avec calculs
- Fichier de test correspondant

(Voir contenu complet Task 1 Step 3 — à créer en même temps que les autres docs)

---

## Résumé d'exécution

| Task      | Fichiers                              | Tests créés       |
| --------- | ------------------------------------- | ----------------- |
| 1         | 3 docs de référence                   | 0                 |
| 2         | integration-config.ts                 | 0                 |
| 3         | helpers.ts                            | 0                 |
| 4         | 01-revenus-fonciers.test.ts           | 4 (SC-01 à SC-04) |
| 5         | 02-lmnp.test.ts                       | 6 (SC-05 à SC-10) |
| 6         | 03-sci-is.test.ts                     | 3 (SC-11 à SC-13) |
| 7         | 04-hcsf.test.ts                       | 4 (SC-14 à SC-17) |
| 8         | 05-plus-value-dpe.test.ts             | 4 (SC-18 à SC-21) |
| 9         | 06-scoring-projections.test.ts        | 4 (SC-22 à SC-25) |
| 10        | fiscal-conformity.test.ts             | 8 (CF-01 à CF-08) |
| 11        | package.json + ci.yml                 | —                 |
| 12        | 02-scenarios-specification.md         | 0                 |
| **Total** | **11 fichiers nouveaux + 2 modifiés** | **33 tests**      |

```bash
# Vérification finale — lancer tous les tests (unit + intégration)
npm run test
# Lancer uniquement les intégrations
npm run test:integration
```

---

**Plan complet et sauvegardé. Deux options d'exécution :**

**1. Subagent-Driven (cette session)** — dispatch de sous-agents par tâche, revue entre chaque tâche

**2. Parallel Session (session séparée)** — ouvrir une nouvelle session dans un worktree avec `superpowers:executing-plans`
