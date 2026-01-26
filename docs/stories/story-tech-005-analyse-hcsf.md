# Story TECH-005 : Analyse HCSF (Taux d'Endettement)

> **Epic** : Epic 1 - Infrastructure Backend
> **Sprint** : 0.2 - Calculs Core
> **Points** : 3
> **Priorité** : P1 (Critique)
> **Statut** : Done
> **Dépendance** : TECH-002 (Validation entrées)

---

## 1. User Story

**En tant qu'** utilisateur
**Je veux** vérifier ma conformité aux règles HCSF
**Afin de** savoir si ma banque acceptera le financement

---

## 2. Contexte

### 2.1 Objectif

Implémenter le calcul du taux d'endettement selon les normes HCSF (Haut Conseil de Stabilité Financière) pour vérifier la faisabilité bancaire du projet.

### 2.2 Règles HCSF 2024

| Règle | Seuil |
|-------|-------|
| Taux d'endettement maximum | 35% |
| Pondération revenus locatifs | 70% |
| Durée crédit maximum | 25 ans (300 mois) |

### 2.3 Fichier cible

```
src/server/calculations/hcsf.ts
```

### 2.4 Modes de calcul

| Mode | Description |
|------|-------------|
| **Nom propre** | Calcul sur l'investisseur principal |
| **SCI IS** | Calcul par associé selon quote-part |

---

## 3. Critères d'Acceptation

### 3.1 Fonctions principales

- [ ] `calculerTauxEndettement(revenus, charges, credits)` - Calcul de base
- [ ] `calculerHcsfNomPropre(data, financement)` - Mode nom propre
- [ ] `calculerHcsfSciIs(data, financement)` - Mode SCI par associé
- [ ] `analyserHcsf(data, financement)` - Orchestration

### 3.2 Calculs

- [ ] Taux d'endettement correct (formule HCSF)
- [ ] Pondération 70% des revenus locatifs
- [ ] Conformité 35% vérifiée
- [ ] Calcul par associé pour SCI

### 3.3 Alertes

- [ ] Alerte si taux > 35%
- [ ] Alerte si durée > 25 ans
- [ ] Alerte si proche du seuil (> 33%)
- [ ] Recommandations si non-conforme

### 3.4 Qualité

- [ ] TypeScript compile sans erreur
- [ ] Calculs conformes aux normes HCSF
- [ ] JSDoc complet

---

## 4. Spécifications Techniques

### 4.1 Fichier `src/server/calculations/hcsf.ts`

```typescript
/**
 * Module d'analyse HCSF (Haut Conseil de Stabilité Financière)
 * Calcul du taux d'endettement selon les normes bancaires
 */

import type { CalculationInput, HCSFResultats } from './types';
import { SEUILS } from './types';
import type { FinancementResultats } from './rentabilite';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Détail du calcul HCSF
 */
export interface HcsfDetail extends HCSFResultats {
  /** Détail des revenus */
  revenus: {
    salaires: number;
    locatifs_bruts: number;
    locatifs_ponderes: number;
    total: number;
  };
  /** Détail des charges */
  charges: {
    credits_existants: number;
    nouveau_credit: number;
    charges_fixes: number;
    total: number;
  };
  /** Calcul par associé (SCI) */
  par_associe?: AssocieHcsf[];
}

/**
 * Résultat HCSF pour un associé
 */
export interface AssocieHcsf {
  nom?: string;
  parts: number;
  revenus_annuels: number;
  charges_mensuelles: number;
  credits_existants: number;
  quote_part_credit: number;
  taux_endettement: number;
  conforme: boolean;
}

// ============================================================================
// CONSTANTES HCSF
// ============================================================================

const HCSF = {
  /** Taux d'endettement maximum */
  TAUX_MAX: 0.35,

  /** Seuil d'alerte (proche du max) */
  TAUX_ALERTE: 0.33,

  /** Pondération des revenus locatifs */
  PONDERATION_LOCATIFS: 0.70,

  /** Durée max du crédit en mois */
  DUREE_MAX_MOIS: 300,
} as const;

// ============================================================================
// CALCULS DE BASE
// ============================================================================

/**
 * Calcule le taux d'endettement
 *
 * @param revenusmensuels - Revenus mensuels totaux
 * @param chargesMensuelles - Charges mensuelles totales (crédits + charges fixes)
 * @returns Taux d'endettement (0-1)
 *
 * @example
 * calculerTauxEndettement(4000, 1200) // => 0.30 (30%)
 */
export function calculerTauxEndettement(
  revenusMensuels: number,
  chargesMensuelles: number
): number {
  if (revenusMensuels <= 0) {
    return chargesMensuelles > 0 ? 1 : 0;
  }
  return chargesMensuelles / revenusMensuels;
}

/**
 * Calcule les revenus avec pondération HCSF
 *
 * @param revenusActivite - Revenus d'activité mensuels (salaires, etc.)
 * @param revenusLocatifs - Revenus locatifs mensuels bruts
 * @returns Revenus totaux pondérés
 */
export function calculerRevenusPonderes(
  revenusActivite: number,
  revenusLocatifs: number
): { bruts: number; ponderes: number; total: number } {
  const locatifsPonderes = revenusLocatifs * HCSF.PONDERATION_LOCATIFS;
  return {
    bruts: revenusLocatifs,
    ponderes: locatifsPonderes,
    total: revenusActivite + locatifsPonderes,
  };
}

// ============================================================================
// MODE NOM PROPRE
// ============================================================================

/**
 * Calcule le HCSF en mode nom propre
 *
 * @param data - Données d'entrée validées
 * @param mensualiteNouveau - Mensualité du nouveau crédit
 * @param loyerMensuel - Loyer mensuel du bien
 * @returns Analyse HCSF complète
 */
export function calculerHcsfNomPropre(
  data: CalculationInput,
  mensualiteNouveau: number,
  loyerMensuel: number
): HcsfDetail {
  const alertes: string[] = [];

  // Revenus : on utilise le TMI pour estimer les revenus annuels
  // Note: Dans une version plus complète, on demanderait les revenus directement
  const revenusMensuelsEstimes = estimerRevenusDepuisTmi(data.structure.tmi ?? 0.30);

  // Revenus locatifs pondérés
  const revenus = calculerRevenusPonderes(revenusMensuelsEstimes, loyerMensuel);

  // Charges : crédits existants (non fournis dans le MVP, on met 0)
  const creditsExistants = 0;
  const chargesFixes = 0;
  const totalCharges = creditsExistants + mensualiteNouveau + chargesFixes;

  // Taux d'endettement
  const tauxEndettement = calculerTauxEndettement(revenus.total, totalCharges);

  // Conformité
  const conforme = tauxEndettement <= HCSF.TAUX_MAX;

  // Alertes
  if (!conforme) {
    alertes.push(
      `Taux d'endettement (${formatPourcent(tauxEndettement)}) supérieur au seuil HCSF (${formatPourcent(HCSF.TAUX_MAX)})`
    );
    alertes.push('Le financement risque d\'être refusé par la banque');
  } else if (tauxEndettement > HCSF.TAUX_ALERTE) {
    alertes.push(
      `Taux d'endettement (${formatPourcent(tauxEndettement)}) proche du seuil HCSF`
    );
  }

  // Vérification durée
  if (data.financement.duree_mois > HCSF.DUREE_MAX_MOIS) {
    alertes.push(
      `Durée du crédit (${data.financement.duree_mois / 12} ans) supérieure au maximum HCSF (25 ans)`
    );
  }

  // Capacité d'emprunt résiduelle
  const capaciteResiduelle = calculerCapaciteResiduelle(
    revenus.total,
    creditsExistants + chargesFixes,
    mensualiteNouveau
  );

  return {
    taux_endettement: arrondir(tauxEndettement * 100, 2),
    conforme,
    capacite_emprunt_residuelle: arrondir(capaciteResiduelle),
    alertes,
    revenus: {
      salaires: arrondir(revenusMensuelsEstimes),
      locatifs_bruts: arrondir(loyerMensuel),
      locatifs_ponderes: arrondir(revenus.ponderes),
      total: arrondir(revenus.total),
    },
    charges: {
      credits_existants: arrondir(creditsExistants),
      nouveau_credit: arrondir(mensualiteNouveau),
      charges_fixes: arrondir(chargesFixes),
      total: arrondir(totalCharges),
    },
  };
}

// ============================================================================
// MODE SCI IS
// ============================================================================

/**
 * Calcule le HCSF en mode SCI IS (par associé)
 *
 * @param data - Données d'entrée validées
 * @param mensualiteNouveau - Mensualité du nouveau crédit
 * @param loyerMensuel - Loyer mensuel du bien
 * @returns Analyse HCSF complète avec détail par associé
 */
export function calculerHcsfSciIs(
  data: CalculationInput,
  mensualiteNouveau: number,
  loyerMensuel: number
): HcsfDetail {
  const alertes: string[] = [];
  const associes = data.structure.associes ?? [];

  if (associes.length === 0) {
    return {
      taux_endettement: 0,
      conforme: false,
      capacite_emprunt_residuelle: 0,
      alertes: ['Aucun associé défini pour la SCI'],
      revenus: {
        salaires: 0,
        locatifs_bruts: 0,
        locatifs_ponderes: 0,
        total: 0,
      },
      charges: {
        credits_existants: 0,
        nouveau_credit: 0,
        charges_fixes: 0,
        total: 0,
      },
      par_associe: [],
    };
  }

  // Calcul pour chaque associé
  const parAssocie: AssocieHcsf[] = associes.map((associe) => {
    // Quote-part de la mensualité selon les parts
    const quotePartCredit = mensualiteNouveau * associe.parts;

    // Quote-part des revenus locatifs
    const quotePartLoyer = loyerMensuel * associe.parts;

    // Revenus mensuels de l'associé
    const revenusMensuels = associe.revenus_annuels / 12;

    // Revenus pondérés
    const revenus = calculerRevenusPonderes(revenusMensuels, quotePartLoyer);

    // Charges de l'associé
    const chargesAssocie =
      (associe.charges_mensuelles ?? 0) +
      (associe.credits_mensuels ?? 0) +
      quotePartCredit;

    // Taux d'endettement
    const tauxEndettement = calculerTauxEndettement(revenus.total, chargesAssocie);

    return {
      nom: associe.nom,
      parts: associe.parts,
      revenus_annuels: associe.revenus_annuels,
      charges_mensuelles: associe.charges_mensuelles ?? 0,
      credits_existants: associe.credits_mensuels ?? 0,
      quote_part_credit: arrondir(quotePartCredit),
      taux_endettement: arrondir(tauxEndettement * 100, 2),
      conforme: tauxEndettement <= HCSF.TAUX_MAX,
    };
  });

  // Vérification conformité globale (tous les associés doivent être conformes)
  const tousConformes = parAssocie.every((a) => a.conforme);

  // Associés non conformes
  const nonConformes = parAssocie.filter((a) => !a.conforme);
  if (nonConformes.length > 0) {
    nonConformes.forEach((a) => {
      alertes.push(
        `${a.nom ?? 'Associé'} : taux d'endettement ${a.taux_endettement}% > seuil HCSF 35%`
      );
    });
  }

  // Taux moyen pondéré (pour affichage)
  const tauxMoyen =
    parAssocie.reduce((sum, a) => sum + a.taux_endettement * a.parts, 0) / 100;

  // Calcul capacité résiduelle (pour l'associé le plus contraint)
  const associePlusContraint = parAssocie.reduce((prev, curr) =>
    curr.taux_endettement > prev.taux_endettement ? curr : prev
  );
  const capaciteResiduelle = calculerCapaciteResiduelleAssocie(associePlusContraint);

  // Totaux pour l'affichage
  const totalRevenusActivite = parAssocie.reduce(
    (sum, a) => sum + a.revenus_annuels / 12,
    0
  );

  return {
    taux_endettement: arrondir(tauxMoyen * 100, 2),
    conforme: tousConformes,
    capacite_emprunt_residuelle: arrondir(capaciteResiduelle),
    alertes,
    revenus: {
      salaires: arrondir(totalRevenusActivite),
      locatifs_bruts: arrondir(loyerMensuel),
      locatifs_ponderes: arrondir(loyerMensuel * HCSF.PONDERATION_LOCATIFS),
      total: arrondir(
        totalRevenusActivite + loyerMensuel * HCSF.PONDERATION_LOCATIFS
      ),
    },
    charges: {
      credits_existants: arrondir(
        parAssocie.reduce((sum, a) => sum + a.credits_existants, 0)
      ),
      nouveau_credit: arrondir(mensualiteNouveau),
      charges_fixes: arrondir(
        parAssocie.reduce((sum, a) => sum + a.charges_mensuelles, 0)
      ),
      total: arrondir(
        parAssocie.reduce(
          (sum, a) =>
            sum + a.credits_existants + a.charges_mensuelles + a.quote_part_credit,
          0
        )
      ),
    },
    par_associe: parAssocie,
  };
}

// ============================================================================
// ORCHESTRATEUR
// ============================================================================

/**
 * Analyse HCSF complète selon le mode de détention
 *
 * @param data - Données d'entrée validées
 * @param financement - Résultats du calcul de financement
 * @param loyerMensuel - Loyer mensuel
 * @returns Analyse HCSF complète
 */
export function analyserHcsf(
  data: CalculationInput,
  financement: FinancementResultats,
  loyerMensuel: number
): HcsfDetail {
  const mensualite = financement.mensualite;

  if (data.structure.type_detention === 'sci_is') {
    return calculerHcsfSciIs(data, mensualite, loyerMensuel);
  }

  return calculerHcsfNomPropre(data, mensualite, loyerMensuel);
}

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Estime les revenus mensuels à partir du TMI
 * Approximation basée sur les tranches d'imposition
 */
function estimerRevenusDepuisTmi(tmi: number): number {
  // Approximation grossière basée sur le TMI
  // TMI 0% : ~0€/mois
  // TMI 11% : ~1500€/mois
  // TMI 30% : ~3500€/mois
  // TMI 41% : ~6500€/mois
  // TMI 45% : ~15000€/mois
  if (tmi <= 0) return 1000;
  if (tmi <= 0.11) return 1500;
  if (tmi <= 0.30) return 3500;
  if (tmi <= 0.41) return 6500;
  return 15000;
}

/**
 * Calcule la capacité d'emprunt résiduelle
 */
function calculerCapaciteResiduelle(
  revenusMensuels: number,
  chargesExistantes: number,
  nouvelleCharge: number
): number {
  const chargeMaximale = revenusMensuels * HCSF.TAUX_MAX;
  const chargesActuelles = chargesExistantes + nouvelleCharge;
  const capaciteMensuelle = Math.max(0, chargeMaximale - chargesActuelles);

  // Conversion en capacité d'emprunt (approximation sur 20 ans à 3.5%)
  // Formule inverse de PMT simplifiée
  const tauxMensuel = 0.035 / 12;
  const dureeMois = 240;
  const facteur = (Math.pow(1 + tauxMensuel, dureeMois) - 1) /
    (tauxMensuel * Math.pow(1 + tauxMensuel, dureeMois));

  return capaciteMensuelle * facteur;
}

/**
 * Calcule la capacité résiduelle pour un associé
 */
function calculerCapaciteResiduelleAssocie(associe: AssocieHcsf): number {
  const revenusMensuels = associe.revenus_annuels / 12;
  const chargesExistantes = associe.charges_mensuelles + associe.credits_existants;
  return calculerCapaciteResiduelle(revenusMensuels, chargesExistantes, associe.quote_part_credit);
}

/**
 * Formate un nombre en pourcentage
 */
function formatPourcent(valeur: number): string {
  return `${arrondir(valeur * 100, 1)}%`;
}

/**
 * Arrondit un nombre
 */
function arrondir(valeur: number, decimales: number = 2): number {
  const facteur = Math.pow(10, decimales);
  return Math.round(valeur * facteur) / facteur;
}
```

---

## 5. Cas de Test

### 5.1 Test Nom Propre

| Revenus/mois | Loyer | Mensualité | Taux attendu | Conforme |
|--------------|-------|------------|--------------|----------|
| 4 000€ | 900€ | 1 100€ | 25.6% | ✅ |
| 3 000€ | 800€ | 1 200€ | 36.7% | ❌ |
| 5 000€ | 1 000€ | 1 500€ | 27.0% | ✅ |

**Calcul exemple 1** :
- Revenus pondérés = 4 000 + (900 × 70%) = 4 630€
- Taux = 1 100 / 4 630 = 23.8%

### 5.2 Test SCI IS (2 associés)

| Associé | Parts | Revenus/an | Quote-part crédit | Taux |
|---------|-------|------------|-------------------|------|
| A | 60% | 60 000€ | 660€ | 15.4% |
| B | 40% | 36 000€ | 440€ | 16.9% |

**Avec** : Mensualité totale = 1 100€, Loyer = 900€

### 5.3 Cas d'alerte

| Cas | Alerte attendue |
|-----|-----------------|
| Taux > 35% | "Taux supérieur au seuil HCSF" |
| Taux > 33% | "Taux proche du seuil HCSF" |
| Durée > 25 ans | "Durée supérieure au maximum HCSF" |
| Associé non conforme | "Associé X : taux > 35%" |

---

## 6. Intégration avec l'Orchestrateur

### 6.1 Mise à jour de `index.ts`

```typescript
import { analyserHcsf } from './hcsf';

export function performCalculations(input: unknown): CalculationResult | CalculationError {
  // ... validation, rentabilité, fiscalité ...

  // Étape 4 - Analyse HCSF
  const hcsf = analyserHcsf(
    data,
    rentabilite.financement,
    data.exploitation.loyer_mensuel
  );

  // Collecter les alertes
  const alertes = [...hcsf.alertes, ...fiscalite.alertes];

  // TODO: Étape 5 - Génération synthèse (TECH-006)
  // ...
}
```

---

## 7. Checklist de Développement

### 7.1 Préparation

- [ ] TECH-002 complétée
- [ ] Comprendre les règles HCSF
- [ ] Avoir des cas de test

### 7.2 Implémentation

- [ ] Créer `hcsf.ts`
- [ ] Implémenter `calculerTauxEndettement()`
- [ ] Implémenter `calculerRevenusPonderes()`
- [ ] Implémenter `calculerHcsfNomPropre()`
- [ ] Implémenter `calculerHcsfSciIs()`
- [ ] Implémenter `analyserHcsf()`
- [ ] Générer les alertes appropriées
- [ ] Mettre à jour `index.ts`

### 7.3 Validation

- [ ] `npm run type-check` passe
- [ ] `npm run lint` passe
- [ ] Tests avec cas de référence
- [ ] Code review demandée

---

## 8. Definition of Done

- [ ] Fichier `hcsf.ts` créé et complet
- [ ] Calcul correct du taux d'endettement
- [ ] Mode nom propre fonctionnel
- [ ] Mode SCI IS fonctionnel
- [ ] Alertes générées correctement
- [ ] `index.ts` mis à jour
- [ ] TypeScript compile sans erreur
- [ ] JSDoc complet
- [ ] Code review approuvée

---

## 9. Références

| Document | Lien |
|----------|------|
| Story précédente | [TECH-004 - Fiscalité](./story-tech-004-calculs-fiscalite.md) |
| Architecture | [docs/architecture.md](../architecture.md) - Section 6.1.5 |
| Règles HCSF | https://www.economie.gouv.fr/hcsf |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
