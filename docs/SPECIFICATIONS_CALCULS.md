# Spécifications des Calculs - Renta Immo

**Version:** 1.0
**Date:** 2026-01-27
**Objectif:** Document de validation des formules de calcul avec le métier

---

## Table des matières

1. [Données d'entrée](#1-données-dentrée)
2. [Calculs de financement](#2-calculs-de-financement)
3. [Calculs des charges](#3-calculs-des-charges)
4. [Calculs de rentabilité](#4-calculs-de-rentabilité)
5. [Calculs de fiscalité](#5-calculs-de-fiscalité)
6. [Analyse HCSF](#6-analyse-hcsf)
7. [Scoring et synthèse](#7-scoring-et-synthèse)
8. [Constantes et seuils](#8-constantes-et-seuils)

---

## 1. Données d'entrée

### 1.1 Bien immobilier

| Champ | Type | Description |
|-------|------|-------------|
| `prix_achat` | Nombre | Prix d'achat du bien (€) |
| `surface` | Nombre | Surface habitable (m²) |
| `type_bien` | Texte | appartement, maison, immeuble |
| `adresse` | Texte | Adresse du bien |

### 1.2 Financement

| Champ | Type | Description |
|-------|------|-------------|
| `apport` | Nombre | Apport personnel (€) |
| `taux_interet` | Nombre | Taux d'intérêt annuel (%) |
| `duree_emprunt` | Nombre | Durée du prêt (années) |
| `assurance_pret` | Nombre | Taux d'assurance annuel sur capital (%) |

### 1.3 Exploitation

| Champ | Type | Description |
|-------|------|-------------|
| `loyer_mensuel` | Nombre | Loyer mensuel hors charges (€) |
| `charges_copro` | Nombre | Charges de copropriété mensuelles (€) |
| `taxe_fonciere` | Nombre | Taxe foncière annuelle (€) |
| `assurance_pno` | Nombre | Assurance PNO annuelle (€) |
| `gestion_locative` | Nombre | Frais de gestion (% du loyer) |
| `provision_travaux` | Nombre | Provision travaux (% du loyer) |
| `provision_vacance` | Nombre | Provision vacance locative (% du loyer) |

### 1.4 Structure juridique

| Champ | Type | Description |
|-------|------|-------------|
| `type` | Texte | `nom_propre` ou `sci_is` |
| `tmi` | Nombre | Tranche Marginale d'Imposition (%) |
| `regime_fiscal` | Texte | `micro_foncier`, `reel`, `lmnp_micro`, `lmnp_reel` |
| `associes` | Liste | Liste des associés (pour SCI IS) |

---

## 2. Calculs de financement

### 2.1 Montant emprunté

```
Montant_Emprunt = max(0, Prix_Achat - Apport)
```

### 2.2 Mensualité du crédit (formule PMT)

La mensualité est calculée avec la formule de remboursement à échéances constantes :

```
Si Taux_Annuel = 0 :
    Mensualité_Crédit = Montant_Emprunt / (Durée_Années × 12)

Sinon :
    Taux_Mensuel = Taux_Annuel / 100 / 12
    Nombre_Mois = Durée_Années × 12

    Mensualité_Crédit = Montant_Emprunt × Taux_Mensuel × (1 + Taux_Mensuel)^Nombre_Mois
                        ─────────────────────────────────────────────────────────────────
                                    (1 + Taux_Mensuel)^Nombre_Mois - 1
```

### 2.3 Mensualité d'assurance

```
Mensualité_Assurance = (Montant_Emprunt × Taux_Assurance / 100) / 12
```

### 2.4 Mensualité totale

```
Mensualité_Totale = Mensualité_Crédit + Mensualité_Assurance
```

### 2.5 Coût total du crédit

```
Coût_Total_Crédit = Mensualité_Totale × Durée_Années × 12
```

### 2.6 Coût total des intérêts

```
Coût_Intérêts = Coût_Total_Crédit - Montant_Emprunt - (Mensualité_Assurance × Durée_Années × 12)
```

### 2.7 Exemple de calcul

| Donnée | Valeur |
|--------|--------|
| Prix d'achat | 150 000 € |
| Apport | 30 000 € |
| Taux d'intérêt | 3.5% |
| Durée | 20 ans |
| Assurance | 0.36% |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Montant emprunté | 150 000 - 30 000 | **120 000 €** |
| Mensualité crédit | Formule PMT | **695.65 €** |
| Mensualité assurance | 120 000 × 0.0036 / 12 | **36.00 €** |
| Mensualité totale | 695.65 + 36.00 | **731.65 €** |
| Coût total crédit | 731.65 × 240 | **175 596 €** |

---

## 3. Calculs des charges

### 3.1 Loyer annuel brut

```
Loyer_Annuel = Loyer_Mensuel × 12
```

### 3.2 Charges fixes annuelles

```
Charges_Fixes = (Charges_Copro × 12) + Taxe_Foncière + Assurance_PNO
```

### 3.3 Charges proportionnelles annuelles

Calculées en pourcentage du loyer annuel brut :

```
Gestion = (Gestion_Locative / 100) × Loyer_Annuel
Travaux = (Provision_Travaux / 100) × Loyer_Annuel
Vacance = (Provision_Vacance / 100) × Loyer_Annuel

Charges_Proportionnelles = Gestion + Travaux + Vacance
```

### 3.4 Total des charges annuelles

```
Total_Charges = Charges_Fixes + Charges_Proportionnelles
```

### 3.5 Exemple de calcul

| Donnée | Valeur |
|--------|--------|
| Loyer mensuel | 750 € |
| Charges copro | 80 € / mois |
| Taxe foncière | 600 € / an |
| Assurance PNO | 150 € / an |
| Gestion locative | 0% |
| Provision travaux | 5% |
| Provision vacance | 5% |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Loyer annuel | 750 × 12 | **9 000 €** |
| Charges fixes | (80 × 12) + 600 + 150 | **1 710 €** |
| Charges proportionnelles | (0% + 5% + 5%) × 9 000 | **900 €** |
| **Total charges** | 1 710 + 900 | **2 610 €** |

---

## 4. Calculs de rentabilité

### 4.1 Rentabilité brute

```
Rentabilité_Brute (%) = (Loyer_Annuel / Prix_Achat) × 100
```

### 4.2 Revenu net avant impôts

```
Revenu_Net_Avant_Impôts = Loyer_Annuel - Total_Charges
```

### 4.3 Rentabilité nette (avant impôts)

```
Rentabilité_Nette (%) = (Revenu_Net_Avant_Impôts / Prix_Achat) × 100
```

### 4.4 Cash-flow

```
Cash-flow_Annuel = Revenu_Net_Avant_Impôts - Remboursement_Annuel

où : Remboursement_Annuel = Mensualité_Totale × 12

Cash-flow_Mensuel = Cash-flow_Annuel / 12
```

### 4.5 Exemple de calcul

| Donnée | Valeur |
|--------|--------|
| Prix d'achat | 150 000 € |
| Loyer annuel | 9 000 € |
| Total charges | 2 610 € |
| Remboursement annuel | 8 779.80 € |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Rentabilité brute | (9 000 / 150 000) × 100 | **6.00%** |
| Revenu net avant impôts | 9 000 - 2 610 | **6 390 €** |
| Rentabilité nette | (6 390 / 150 000) × 100 | **4.26%** |
| Cash-flow annuel | 6 390 - 8 779.80 | **-2 389.80 €** |
| Cash-flow mensuel | -2 389.80 / 12 | **-199.15 €** |

---

## 5. Calculs de fiscalité

### 5.1 Régimes disponibles

| Régime | Structure | Description |
|--------|-----------|-------------|
| Micro-foncier | Nom propre | Abattement forfaitaire de 30% |
| Foncier réel | Nom propre | Déduction des charges réelles |
| LMNP Micro-BIC | Nom propre | Abattement forfaitaire de 50% |
| LMNP Réel | Nom propre | Amortissement du bien |
| IS | SCI IS | Impôt sur les sociétés |

### 5.2 Régime Micro-foncier

**Condition :** Loyer annuel ≤ 15 000 €

```
Base_Imposable = Loyer_Annuel × (1 - 30%)
               = Loyer_Annuel × 0.70

Impôt_Revenu = Base_Imposable × TMI
Prélèvements_Sociaux = Base_Imposable × 17.2%

Impôt_Total = Impôt_Revenu + Prélèvements_Sociaux
```

### 5.3 Régime LMNP Micro-BIC

**Condition :** Loyer annuel ≤ 77 700 €

```
Base_Imposable = Loyer_Annuel × (1 - 50%)
               = Loyer_Annuel × 0.50

Impôt_Revenu = Base_Imposable × TMI
Prélèvements_Sociaux = Base_Imposable × 17.2%

Impôt_Total = Impôt_Revenu + Prélèvements_Sociaux
```

### 5.4 Régime SCI à l'IS

```
Valeur_Amortissable = Prix_Achat × 80%  (hors terrain)
Amortissement_Annuel = Valeur_Amortissable × 2%

Base_Imposable = max(0, Revenu_Net_Avant_Impôts - Amortissement_Annuel)

Si Base_Imposable ≤ 42 500 € :
    Impôt_IS = Base_Imposable × 15%
Sinon :
    Impôt_IS = 42 500 × 15% + (Base_Imposable - 42 500) × 25%

Impôt_Total = Impôt_IS
(Pas de prélèvements sociaux en SCI IS)
```

### 5.5 Rentabilité nette-nette

```
Revenu_Net_Après_Impôt = Revenu_Net_Avant_Impôts - Impôt_Total

Rentabilité_Nette_Nette (%) = (Revenu_Net_Après_Impôt / Prix_Achat) × 100
```

### 5.6 Exemple : Micro-foncier TMI 30%

| Donnée | Valeur |
|--------|--------|
| Loyer annuel | 9 000 € |
| Revenu net avant impôts | 6 390 € |
| TMI | 30% |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Base imposable | 9 000 × 0.70 | **6 300 €** |
| Impôt revenu | 6 300 × 30% | **1 890 €** |
| Prélèvements sociaux | 6 300 × 17.2% | **1 083.60 €** |
| **Impôt total** | 1 890 + 1 083.60 | **2 973.60 €** |
| Revenu net après impôt | 6 390 - 2 973.60 | **3 416.40 €** |
| Rentabilité nette-nette | (3 416.40 / 150 000) × 100 | **2.28%** |

---

## 6. Analyse HCSF

### 6.1 Principes HCSF

Le Haut Conseil de Stabilité Financière impose des règles pour l'octroi de crédits immobiliers :
- **Taux d'endettement maximum :** 35%
- **Durée maximale du crédit :** 25 ans
- **Pondération des revenus locatifs :** 70%

### 6.2 Calcul du taux d'endettement

```
Taux_Endettement = Charges_Mensuelles / Revenus_Mensuels_Pondérés
```

### 6.3 Revenus pondérés (mode nom propre)

```
Revenus_Activité_Estimés = Estimation selon TMI (voir table ci-dessous)
Revenus_Locatifs_Pondérés = Loyer_Mensuel × 70%

Revenus_Totaux_Pondérés = Revenus_Activité_Estimés + Revenus_Locatifs_Pondérés
```

**Estimation des revenus selon TMI :**

| TMI | Revenus mensuels estimés |
|-----|--------------------------|
| 0% | 1 000 € |
| 11% | 1 500 € |
| 30% | 3 500 € |
| 41% | 6 500 € |
| 45% | 15 000 € |

### 6.4 Charges mensuelles

```
Charges_Mensuelles = Crédits_Existants + Nouveau_Crédit + Charges_Fixes

où : Nouveau_Crédit = Mensualité_Totale (du nouveau prêt)
```

### 6.5 Conformité HCSF

```
Conforme = (Taux_Endettement ≤ 35%)
```

### 6.6 Mode SCI IS (par associé)

Pour chaque associé, le calcul est fait au prorata de ses parts :

```
Quote_Part_Crédit = Mensualité_Totale × (Parts / 100)
Quote_Part_Loyer = Loyer_Mensuel × (Parts / 100)

Revenus_Associé = (Revenus_Annuels_Associé / 12) + (Quote_Part_Loyer × 70%)
Charges_Associé = Crédits_Existants_Associé + Charges_Fixes_Associé + Quote_Part_Crédit

Taux_Endettement_Associé = Charges_Associé / Revenus_Associé
```

La SCI est **non conforme** si au moins un associé dépasse 35%.

### 6.7 Capacité d'emprunt résiduelle

```
Charge_Max_Autorisée = Revenus_Pondérés × 35%
Marge_Mensuelle = Charge_Max_Autorisée - Charges_Actuelles

# Conversion en capital empruntable (sur 20 ans à 3.5%)
Taux_Mensuel = 3.5% / 12
Durée = 240 mois
Facteur = (1 - (1 + Taux_Mensuel)^(-Durée)) / Taux_Mensuel

Capacité_Résiduelle = Marge_Mensuelle × Facteur
```

### 6.8 Exemple de calcul HCSF

| Donnée | Valeur |
|--------|--------|
| TMI | 30% |
| Loyer mensuel | 750 € |
| Mensualité crédit | 731.65 € |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Revenus activité estimés | TMI 30% | **3 500 €** |
| Revenus locatifs pondérés | 750 × 70% | **525 €** |
| Revenus totaux | 3 500 + 525 | **4 025 €** |
| Charges mensuelles | 731.65 | **731.65 €** |
| **Taux d'endettement** | 731.65 / 4 025 | **18.18%** |
| Conforme HCSF | 18.18% ≤ 35% | **Oui** |

---

## 7. Scoring et synthèse

### 7.1 Critères d'évaluation

| Critère | Condition pour OK | Points |
|---------|-------------------|--------|
| Autofinancement | Cash-flow mensuel ≥ 0 | +1 |
| Rentabilité | Rentabilité nette ≥ 7% | +1 |
| Conformité HCSF | Taux endettement ≤ 35% | +1 |
| Bonus rentabilité | Rentabilité nette ≥ 10% | +1 |

### 7.2 Score interne (0-4)

| Score | Évaluation | Recommandation |
|-------|------------|----------------|
| 4 | Excellent | Investissement très viable. Tous les indicateurs sont au vert. |
| 3 | Bon | Investissement viable. Vérifiez les points d'attention. |
| 2 | Moyen | Investissement à optimiser. Négociez le prix ou le loyer. |
| 0-1 | Faible | Investissement risqué. Reconsidérez le projet. |

### 7.3 Score global (0-100)

Le score global est calculé avec les contributions suivantes :

```
Score_Base = 50

# Cash-flow (-15 à +15 points)
Si Cash-flow_Mensuel ≥ 0 :
    Bonus = min(15, (Cash-flow_Mensuel / 500) × 15)
Sinon :
    Malus = min(15, (|Cash-flow_Mensuel| / 300) × 15)

# Rentabilité nette (-10 à +20 points)
Si Rentabilité_Nette ≥ 10% : +20 points
Si Rentabilité_Nette ≥ 7%  : +10 points
Si Rentabilité_Nette ≥ 5%  : +0 points
Sinon                      : -10 points

# HCSF (+/- 15 points)
Si Conforme_HCSF : +15 points
Sinon            : -15 points

Score_Global = max(0, min(100, Score_Base + Ajustements))
```

### 7.4 Exemple de calcul du score

| Donnée | Valeur |
|--------|--------|
| Cash-flow mensuel | -199 € |
| Rentabilité nette | 4.26% |
| Conforme HCSF | Oui |

| Composante | Calcul | Points |
|------------|--------|--------|
| Score base | - | **50** |
| Cash-flow | -(199 / 300) × 15 | **-9.95** |
| Rentabilité | 4.26% < 5% | **-10** |
| HCSF | Conforme | **+15** |
| **Score final** | 50 - 9.95 - 10 + 15 | **45** |

---

## 8. Constantes et seuils

### 8.1 Constantes fiscales

| Constante | Valeur | Description |
|-----------|--------|-------------|
| `PRELEVEMENTS_SOCIAUX` | 17.2% | CSG-CRDS sur revenus fonciers |
| `MICRO_FONCIER_PLAFOND` | 15 000 € | Plafond de loyer pour micro-foncier |
| `MICRO_FONCIER_ABATTEMENT` | 30% | Abattement micro-foncier |
| `MICRO_BIC_PLAFOND` | 77 700 € | Plafond de loyer pour LMNP micro-BIC |
| `MICRO_BIC_ABATTEMENT` | 50% | Abattement LMNP micro-BIC |
| `IS_TAUX_REDUIT` | 15% | Taux IS réduit (≤ 42 500 €) |
| `IS_TAUX_NORMAL` | 25% | Taux IS normal (> 42 500 €) |
| `IS_SEUIL` | 42 500 € | Seuil du taux réduit IS |
| `AMORTISSEMENT_BATI` | 80% | Part amortissable du bien (hors terrain) |
| `TAUX_AMORTISSEMENT` | 2% | Taux d'amortissement annuel |

### 8.2 Constantes HCSF

| Constante | Valeur | Description |
|-----------|--------|-------------|
| `TAUX_ENDETTEMENT_MAX` | 35% | Taux d'endettement maximum |
| `TAUX_ENDETTEMENT_ALERTE` | 33% | Seuil d'alerte |
| `DUREE_EMPRUNT_MAX` | 25 ans | Durée maximale du crédit |
| `PONDERATION_LOCATIFS` | 70% | Pondération des revenus locatifs |

### 8.3 Seuils d'analyse

| Seuil | Valeur | Description |
|-------|--------|-------------|
| `RENTABILITE_BRUTE_MIN` | 7% | Rentabilité nette minimum acceptable |
| `RENTABILITE_BRUTE_BONNE` | 10% | Seuil pour bonus rentabilité |
| `CASHFLOW_CRITIQUE` | -200 € | Cash-flow mensuel critique |
| `RATIO_PRIX_LOYER_MAX` | 250 | Prix / (Loyer × 12) maximum |

---

## Annexe : Flux de calcul

```
┌─────────────────────────────────────────────────────────────────┐
│                        DONNÉES D'ENTRÉE                         │
│  Bien | Financement | Exploitation | Structure                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     1. VALIDATION                               │
│  Vérification des données obligatoires et cohérence            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     2. FINANCEMENT                              │
│  Montant emprunt → Mensualités → Coût total crédit             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     3. CHARGES                                  │
│  Charges fixes + Charges proportionnelles → Total charges       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     4. RENTABILITÉ                              │
│  Rentabilité brute → Rentabilité nette → Cash-flow             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     5. FISCALITÉ                                │
│  Selon régime : Base imposable → Impôt → Rentabilité nette-nette│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     6. ANALYSE HCSF                             │
│  Revenus pondérés → Taux endettement → Conformité              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     7. SYNTHÈSE                                 │
│  Critères → Score global → Recommandation                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RÉSULTATS                                  │
│  Rentabilités | Fiscalité | HCSF | Score | Points d'attention  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Historique des modifications

| Date | Version | Auteur | Description |
|------|---------|--------|-------------|
| 2026-01-27 | 1.0 | Dev | Création du document |

---

**Document à valider avec le métier avant mise en production.**
