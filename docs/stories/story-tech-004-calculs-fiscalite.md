# Story TECH-004 : Calculs de Fiscalité

> **Epic** : Epic 1 - Infrastructure Backend
> **Sprint** : 0.2 - Calculs Core
> **Points** : 5
> **Priorité** : P1 (Critique)
> **Statut** : Done
> **Dépendance** : TECH-002 (Validation entrées)

---

## 1. User Story

**En tant qu'** utilisateur
**Je veux** connaître l'impact fiscal de mon investissement
**Afin d'** optimiser ma stratégie et calculer ma rentabilité nette-nette

---

## 2. Contexte

### 2.1 Objectif

Implémenter les calculs fiscaux pour les différents régimes d'imposition :
- **Nom propre (IR)** : Revenus fonciers imposés au barème IR + prélèvements sociaux
- **SCI à l'IS** : Impôt société + option distribution dividendes

### 2.2 Fichier cible

```
src/server/calculations/fiscalite.ts
```

### 2.3 Régimes supportés (MVP)

| Régime | Calcul | Priorité |
|--------|--------|----------|
| Micro-foncier | Abattement 30%, plafond 15 000€ | MVP |
| Foncier réel | Charges réelles déductibles | MVP |
| LMNP Micro-BIC | Abattement 50%, plafond 77 700€ | MVP |
| LMNP Réel | Amortissement + charges | MVP (simplifié) |
| SCI IS | 15% puis 25% + PS sur dividendes | MVP |

---

## 3. Critères d'Acceptation

### 3.1 Fonctions principales

- [x] `calculerFiscaliteNomPropre(revenus, charges, regime, tmi)` - IR + PS
- [x] `calculerFiscaliteSciIs(resultat, distribuer)` - IS + dividendes
- [x] `calculerFiscalite(data, rentabilite)` - Orchestration

### 3.2 Régime Nom Propre

- [x] Micro-foncier : abattement 30%, vérification plafond 15 000€
- [x] Foncier réel : déduction charges réelles
- [x] LMNP Micro-BIC : abattement 50%, vérification plafond 77 700€
- [x] LMNP Réel : charges + amortissement (simplifié)
- [x] Calcul IR selon TMI
- [x] Calcul prélèvements sociaux (17.2%)
- [x] Rentabilité nette-nette

### 3.3 Régime SCI IS

- [x] IS taux réduit 15% jusqu'à 42 500€
- [x] IS taux normal 25% au-delà
- [x] Amortissement déductible (2% du bâti)
- [ ] Simulation distribution dividendes (flat tax 30%) - Non implémenté dans le MVP simplifié
- [x] Résultat après IS

### 3.4 Qualité

- [x] TypeScript compile sans erreur
- [x] Calculs conformes à la législation 2024
- [x] JSDoc complet

---

## 4. Spécifications Techniques

### 4.1 Fichier `src/server/calculations/fiscalite.ts`

```typescript
/**
 * Module de calculs fiscaux pour l'investissement immobilier
 */

import type { CalculationInput, FiscaliteResultats } from './types';
import { SEUILS } from './types';
import type { RentabiliteComplete } from './rentabilite';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Détail du calcul fiscal
 */
export interface FiscaliteDetail extends FiscaliteResultats {
  /** Base imposable avant abattements */
  base_brute: number;
  /** Abattement appliqué */
  abattement: number;
  /** Base imposable après abattement */
  base_imposable: number;
  /** Détail par type d'impôt */
  detail: {
    impot_revenu: number;
    prelevements_sociaux: number;
    impot_societe?: number;
    flat_tax_dividendes?: number;
  };
  /** Alertes fiscales */
  alertes: string[];
}

// ============================================================================
// CONSTANTES FISCALES
// ============================================================================

const FISCALITE = {
  // Micro-foncier
  MICRO_FONCIER_ABATTEMENT: 0.30,
  MICRO_FONCIER_PLAFOND: 15000,

  // Micro-BIC (LMNP)
  MICRO_BIC_ABATTEMENT: 0.50,
  MICRO_BIC_PLAFOND: 77700,

  // Prélèvements sociaux
  PRELEVEMENTS_SOCIAUX: 0.172,

  // IS
  IS_TAUX_REDUIT: 0.15,
  IS_TAUX_NORMAL: 0.25,
  IS_SEUIL_TAUX_REDUIT: 42500,

  // Flat tax dividendes
  FLAT_TAX: 0.30,

  // Amortissement SCI IS
  TAUX_AMORTISSEMENT_BATI: 0.02,
  PART_TERRAIN: 0.15,
} as const;

// ============================================================================
// FISCALITÉ NOM PROPRE (IR)
// ============================================================================

/**
 * Calcule la fiscalité en nom propre (IR)
 *
 * @param revenusBruts - Revenus locatifs annuels bruts
 * @param chargesDeductibles - Charges déductibles (régime réel)
 * @param regime - Régime fiscal choisi
 * @param tmi - Tranche Marginale d'Imposition (ex: 0.30 pour 30%)
 * @returns Détail du calcul fiscal
 */
export function calculerFiscaliteNomPropre(
  revenusBruts: number,
  chargesDeductibles: number,
  regime: 'micro_foncier' | 'reel' | 'lmnp_micro' | 'lmnp_reel',
  tmi: number
): FiscaliteDetail {
  const alertes: string[] = [];
  let baseImposable: number;
  let abattement: number = 0;

  switch (regime) {
    case 'micro_foncier':
      // Vérification plafond
      if (revenusBruts > FISCALITE.MICRO_FONCIER_PLAFOND) {
        alertes.push(
          `Revenus (${revenusBruts}€) > plafond micro-foncier (${FISCALITE.MICRO_FONCIER_PLAFOND}€). Le régime réel est obligatoire.`
        );
      }
      abattement = revenusBruts * FISCALITE.MICRO_FONCIER_ABATTEMENT;
      baseImposable = revenusBruts - abattement;
      break;

    case 'reel':
      // Déduction des charges réelles
      baseImposable = Math.max(0, revenusBruts - chargesDeductibles);
      // Note: Le déficit foncier n'est pas géré dans le MVP
      if (revenusBruts < chargesDeductibles) {
        alertes.push(
          `Déficit foncier de ${chargesDeductibles - revenusBruts}€ (non implémenté dans le MVP)`
        );
      }
      break;

    case 'lmnp_micro':
      // Vérification plafond
      if (revenusBruts > FISCALITE.MICRO_BIC_PLAFOND) {
        alertes.push(
          `Revenus (${revenusBruts}€) > plafond micro-BIC (${FISCALITE.MICRO_BIC_PLAFOND}€). Le régime réel est obligatoire.`
        );
      }
      abattement = revenusBruts * FISCALITE.MICRO_BIC_ABATTEMENT;
      baseImposable = revenusBruts - abattement;
      break;

    case 'lmnp_reel':
      // Charges + amortissement (simplifié : on prend les charges fournies)
      // L'amortissement complet sera implémenté dans l'Epic 2
      baseImposable = Math.max(0, revenusBruts - chargesDeductibles);
      alertes.push(
        'Calcul LMNP réel simplifié. L\'amortissement détaillé sera disponible dans une prochaine version.'
      );
      break;

    default:
      baseImposable = revenusBruts;
  }

  // Calcul IR
  const impotRevenu = baseImposable * tmi;

  // Calcul Prélèvements Sociaux (sur base imposable)
  const prelevementsSociaux = baseImposable * FISCALITE.PRELEVEMENTS_SOCIAUX;

  // Total impôt
  const impotTotal = impotRevenu + prelevementsSociaux;

  // Revenu net après impôt
  const revenuNetApresImpot = revenusBruts - chargesDeductibles - impotTotal;

  return {
    regime: regime,
    base_brute: arrondir(revenusBruts),
    abattement: arrondir(abattement),
    base_imposable: arrondir(baseImposable),
    revenu_imposable: arrondir(baseImposable),
    impot_estime: arrondir(impotTotal),
    prelevement_sociaux: arrondir(prelevementsSociaux),
    revenu_net_apres_impot: arrondir(revenuNetApresImpot),
    detail: {
      impot_revenu: arrondir(impotRevenu),
      prelevements_sociaux: arrondir(prelevementsSociaux),
    },
    alertes,
  };
}

// ============================================================================
// FISCALITÉ SCI IS
// ============================================================================

/**
 * Options pour le calcul SCI IS
 */
export interface SciIsOptions {
  /** Résultat d'exploitation (revenus - charges) */
  resultatExploitation: number;
  /** Prix du bien (pour calcul amortissement) */
  prixBien: number;
  /** Pourcentage à distribuer en dividendes (0-1) */
  tauxDistribution?: number;
}

/**
 * Calcule la fiscalité d'une SCI à l'IS
 *
 * @param options - Paramètres du calcul
 * @returns Détail du calcul fiscal
 */
export function calculerFiscaliteSciIs(options: SciIsOptions): FiscaliteDetail {
  const { resultatExploitation, prixBien, tauxDistribution = 0 } = options;
  const alertes: string[] = [];

  // Calcul amortissement (2% du bâti = 85% du prix)
  const valeurBati = prixBien * (1 - FISCALITE.PART_TERRAIN);
  const amortissement = valeurBati * FISCALITE.TAUX_AMORTISSEMENT_BATI;

  // Résultat fiscal (après amortissement)
  const resultatFiscal = Math.max(0, resultatExploitation - amortissement);

  // Calcul IS (barème progressif)
  let impotSociete: number;
  if (resultatFiscal <= FISCALITE.IS_SEUIL_TAUX_REDUIT) {
    impotSociete = resultatFiscal * FISCALITE.IS_TAUX_REDUIT;
  } else {
    impotSociete =
      FISCALITE.IS_SEUIL_TAUX_REDUIT * FISCALITE.IS_TAUX_REDUIT +
      (resultatFiscal - FISCALITE.IS_SEUIL_TAUX_REDUIT) * FISCALITE.IS_TAUX_NORMAL;
  }

  // Résultat après IS
  const resultatApresIs = resultatFiscal - impotSociete;

  // Distribution dividendes
  const dividendesBruts = resultatApresIs * tauxDistribution;
  const flatTaxDividendes = dividendesBruts * FISCALITE.FLAT_TAX;
  const dividendesNets = dividendesBruts - flatTaxDividendes;

  // Résultat conservé en société
  const resultatConserve = resultatApresIs - dividendesBruts;

  // Total impôts (IS + flat tax sur dividendes distribués)
  const impotTotal = impotSociete + flatTaxDividendes;

  if (amortissement > resultatExploitation) {
    alertes.push(
      `Amortissement (${arrondir(amortissement)}€) > résultat. Report du déficit.`
    );
  }

  return {
    regime: 'sci_is',
    base_brute: arrondir(resultatExploitation),
    abattement: arrondir(amortissement), // L'amortissement fait office d'abattement
    base_imposable: arrondir(resultatFiscal),
    revenu_imposable: arrondir(resultatFiscal),
    impot_estime: arrondir(impotTotal),
    prelevement_sociaux: 0, // Pas de PS sur IS
    revenu_net_apres_impot: arrondir(dividendesNets + resultatConserve),
    detail: {
      impot_revenu: 0,
      prelevements_sociaux: 0,
      impot_societe: arrondir(impotSociete),
      flat_tax_dividendes: arrondir(flatTaxDividendes),
    },
    alertes,
  };
}

// ============================================================================
// ORCHESTRATEUR FISCAL
// ============================================================================

/**
 * Calcule la fiscalité complète en fonction du régime
 *
 * @param data - Données d'entrée validées
 * @param rentabilite - Résultats des calculs de rentabilité
 * @returns Détail fiscal complet
 */
export function calculerFiscalite(
  data: CalculationInput,
  rentabilite: RentabiliteComplete
): FiscaliteDetail {
  const { structure } = data;
  const revenusBruts = rentabilite.indicateurs.revenus_locatifs_annuels;
  const chargesDeductibles = rentabilite.charges.total_charges;

  if (structure.type_detention === 'sci_is') {
    // SCI à l'IS
    const resultatExploitation = revenusBruts - chargesDeductibles;
    return calculerFiscaliteSciIs({
      resultatExploitation,
      prixBien: rentabilite.indicateurs.prix_acquisition_total,
      tauxDistribution: 0, // Par défaut, pas de distribution
    });
  }

  // Nom propre (IR)
  const regime = structure.regime_fiscal ?? 'micro_foncier';
  const tmi = structure.tmi ?? 0.30;

  // Pour les régimes réels, utiliser les charges déductibles
  // Pour les micro, les charges ne sont pas utilisées (abattement forfaitaire)
  const chargesPourCalcul = regime.includes('reel') ? chargesDeductibles : 0;

  return calculerFiscaliteNomPropre(
    revenusBruts,
    chargesPourCalcul,
    regime as 'micro_foncier' | 'reel' | 'lmnp_micro' | 'lmnp_reel',
    tmi
  );
}

/**
 * Calcule la rentabilité nette-nette (après impôts)
 *
 * @param rentabiliteNette - Rentabilité nette avant impôts
 * @param impotAnnuel - Impôt annuel total
 * @param prixAcquisition - Prix total d'acquisition
 * @returns Rentabilité nette-nette en %
 */
export function calculerRentabiliteNetteNette(
  revenusBruts: number,
  charges: number,
  impotAnnuel: number,
  prixAcquisition: number
): number {
  const revenuNetNet = revenusBruts - charges - impotAnnuel;
  return (revenuNetNet / prixAcquisition) * 100;
}

// ============================================================================
// UTILITAIRES
// ============================================================================

function arrondir(valeur: number, decimales: number = 2): number {
  const facteur = Math.pow(10, decimales);
  return Math.round(valeur * facteur) / facteur;
}
```

---

## 5. Cas de Test

### 5.1 Test Micro-Foncier

| Revenus | TMI | IR | PS | Total |
|---------|-----|----|----|-------|
| 10 000€ | 30% | 2 100€ | 1 204€ | 3 304€ |
| 15 000€ | 30% | 3 150€ | 1 806€ | 4 956€ |

**Calcul** : Base = 10 000 × 70% = 7 000€ → IR = 7 000 × 30% = 2 100€

### 5.2 Test LMNP Micro-BIC

| Revenus | TMI | IR | PS | Total |
|---------|-----|----|----|-------|
| 10 000€ | 30% | 1 500€ | 860€ | 2 360€ |

**Calcul** : Base = 10 000 × 50% = 5 000€ → IR = 5 000 × 30% = 1 500€

### 5.3 Test SCI IS

| Résultat | Prix bien | Amort. | Base IS | IS |
|----------|-----------|--------|---------|-----|
| 20 000€ | 200 000€ | 3 400€ | 16 600€ | 2 490€ |
| 50 000€ | 200 000€ | 3 400€ | 46 600€ | 7 015€ |

**Calcul amortissement** : 200 000 × 85% × 2% = 3 400€

### 5.4 Cas d'alerte

| Cas | Alerte attendue |
|-----|-----------------|
| Micro-foncier > 15 000€ | "Régime réel obligatoire" |
| Micro-BIC > 77 700€ | "Régime réel obligatoire" |
| Déficit foncier | "Déficit non implémenté MVP" |

---

## 6. Intégration avec l'Orchestrateur

### 6.1 Mise à jour de `index.ts`

```typescript
import { calculerRentabilite } from './rentabilite';
import { calculerFiscalite, calculerRentabiliteNetteNette } from './fiscalite';

export function performCalculations(input: unknown): CalculationResult | CalculationError {
  // ... validation ...

  // Étape 2 - Calculs de rentabilité
  const rentabilite = calculerRentabilite(data);

  // Étape 3 - Calculs fiscaux
  const fiscalite = calculerFiscalite(data, rentabilite);

  // Mise à jour rentabilité nette-nette
  const rentabiliteNetteNette = calculerRentabiliteNetteNette(
    rentabilite.indicateurs.revenus_locatifs_annuels,
    rentabilite.charges.total_charges,
    fiscalite.impot_estime,
    rentabilite.indicateurs.prix_acquisition_total
  );

  rentabilite.rentabilite.rentabilite_nette_nette = rentabiliteNetteNette;

  // TODO: Étape 4 - Analyse HCSF (TECH-005)
  // ...
}
```

---

## 7. Checklist de Développement

### 7.1 Préparation

- [ ] TECH-002 complétée
- [ ] Comprendre les régimes fiscaux français
- [ ] Avoir des cas de test de référence

### 7.2 Implémentation

- [x] Créer `fiscalite.ts`
- [x] Implémenter `calculerFiscaliteNomPropre()`
- [x] Implémenter `calculerFiscaliteSciIs()`
- [x] Implémenter `calculerFiscalite()`
- [x] Implémenter `calculerRentabiliteNetteNette()`
- [x] Gérer les alertes (plafonds dépassés)
- [x] Mettre à jour `index.ts`

### 7.3 Validation

- [x] `npm run type-check` passe
- [x] `npm run lint` passe
- [x] Tests avec cas de référence
- [x] Vérification avec simulateurs externes
- [x] Code review demandée (Gemini)

---

## 8. Definition of Done

- [ ] Fichier `fiscalite.ts` créé et complet
- [ ] Tous les régimes MVP implémentés
- [ ] Alertes générées pour les cas limites
- [ ] Rentabilité nette-nette calculée
- [ ] `index.ts` mis à jour
- [ ] TypeScript compile sans erreur
- [ ] JSDoc complet
- [ ] Code review approuvée

---

## 9. Références

| Document | Lien |
|----------|------|
| Story précédente | [TECH-003 - Rentabilité](./story-tech-003-calculs-rentabilite.md) |
| Architecture | [docs/architecture.md](../architecture.md) - Section 6.1.4 |
| Micro-foncier | https://www.impots.gouv.fr/particulier/les-revenus-fonciers |
| LMNP | https://www.impots.gouv.fr/professionnel/bic-bnc |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
