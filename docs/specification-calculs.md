# Analyse et Spécifications des Calculs - Renta Immo

---

## Introduction

Je vais d'abord vérifier les informations fiscales et réglementaires actuelles pour m'assurer que vos constantes sont à jour, puis je ferai une analyse complète de votre document.

Merci pour votre patience. J'ai maintenant une vue complète des évolutions fiscales et réglementaires actuelles. Voici mon analyse complète et le document corrigé/enrichi.

---

# Analyse des Spécifications - État des Lieux

## Résumé des Problèmes Identifiés

### 🔴 Erreurs Critiques

1. **Prélèvements sociaux LMNP obsolètes** : Votre document indique 17,2% mais pour les LMNP, la hausse de la CSG fait passer le taux global des prélèvements sociaux de 17,2% à 18,6%.

2. **Régime micro-BIC LMNP non différencié** : En 2025, les conditions du régime micro-BIC sont les suivantes :
   - Location meublée de longue durée : 50% d'abattement et 77 700€ de plafond
   - Location meublée de courte durée d'un meublé de tourisme non classé : 30% d'abattement et 15 000€ de plafond

3. **Frais de notaire non intégrés** : En 2025, les frais de notaire pour un achat dans l'ancien s'établissent en moyenne entre 7% et 8% du prix d'acquisition, contre 3% à 4% dans le neuf. Votre document ne prend pas en compte ces frais dans le coût d'acquisition.

4. **Régime réel foncier incomplet** : Vous n'avez pas de calculs pour le régime foncier réel qui permet de déduire les charges réelles.

5. **CFE (Cotisation Foncière des Entreprises) manquante** : Toute personne exerçant une activité de location meublée en LMNP est soumise à la cotisation foncière des entreprises (CFE). Cette règle s'applique même aux propriétaires déclarant au régime d'imposition micro-BIC.

### 🟡 Correctifs Importants

6. **Évolution du micro-foncier (à surveiller)** : L'abattement de 50% en micro-foncier n'a pas été adopté dans la loi de finances 2025. Le régime micro-foncier conserve donc ses règles habituelles, avec un abattement forfaitaire de 30%.

7. **Amortissement LMNP réel - composants absents** : Pour bénéficier de l'amortissement en LMNP, il faut appliquer un taux d'amortissement linéaire avec des durées différentes selon les postes : Entre 25 et 40 ans pour l'immobilier et les frais d'acquisition (2,50 à 4% / an).

8. **Réintégration amortissements LMNP** : Depuis le 15 février 2025, les amortissements déduits doivent être réintégrés dans la base de calcul de la plus-value.

9. **Hausse des DMTO** : Depuis le 1er avril 2025, les départements ont la possibilité de relever le taux normal de la taxe de publicité foncière ou du droit d'enregistrement à hauteur de 5% (contre 4,50% auparavant).

---

# Spécifications des Calculs - Renta Immo

**Version:** 2.0  
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
9. [Projections pluriannuelles](#9-projections-pluriannuelles)

---

## 1. Données d'entrée

### 1.1 Bien immobilier

| Champ | Type | Description |
|-------|------|-------------|
| `prix_achat` | Nombre | Prix d'achat du bien (€) |
| `surface` | Nombre | Surface habitable (m²) |
| `type_bien` | Texte | appartement, maison, immeuble |
| `etat_bien` | Texte | `ancien` ou `neuf` (VEFA ou < 5 ans jamais habité) |
| `adresse` | Texte | Adresse du bien |
| `code_postal` | Texte | Code postal (pour déterminer département/DMTO) |
| `dpe` | Texte | Classe énergétique (A à G) |
| `annee_construction` | Nombre | Année de construction |
| `montant_travaux` | Nombre | Montant estimé des travaux (€) |
| `valeur_mobilier` | Nombre | Valeur du mobilier inclus (€) - pour déduction frais notaire |

### 1.2 Financement

| Champ | Type | Description |
|-------|------|-------------|
| `apport` | Nombre | Apport personnel (€) |
| `taux_interet` | Nombre | Taux d'intérêt annuel (%) |
| `duree_emprunt` | Nombre | Durée du prêt (années) |
| `assurance_pret` | Nombre | Taux d'assurance annuel sur capital initial/restant dû (%) |
| `type_assurance` | Texte | `capital_initial` ou `capital_restant_du` |
| `frais_dossier` | Nombre | Frais de dossier bancaire (€) |
| `frais_garantie` | Nombre | Frais de garantie/hypothèque (€) |

### 1.3 Frais d'acquisition

| Champ | Type | Description |
|-------|------|-------------|
| `taux_dmto_departement` | Nombre | Taux DMTO du département (4.5% ou 5%) |
| `primo_accedant` | Booléen | Primo-accédant (exonéré hausse DMTO) |
| `frais_agence` | Nombre | Frais d'agence (€) |
| `frais_agence_charge` | Texte | `vendeur` ou `acquereur` |

### 1.4 Exploitation

| Champ | Type | Description |
|-------|------|-------------|
| `type_location` | Texte | `nue`, `meublee_longue_duree`, `meublee_tourisme_classe`, `meublee_tourisme_non_classe` |
| `loyer_mensuel` | Nombre | Loyer mensuel hors charges (€) |
| `charges_copro` | Nombre | Charges de copropriété mensuelles (€) |
| `charges_copro_recuperables` | Nombre | Part récupérable sur locataire (€) |
| `taxe_fonciere` | Nombre | Taxe foncière annuelle (€) |
| `taxe_ordures_menageres` | Nombre | Part TEOM récupérable (€) |
| `assurance_pno` | Nombre | Assurance PNO annuelle (€) |
| `assurance_gli` | Nombre | Garantie Loyers Impayés annuelle (€) - optionnel |
| `gestion_locative` | Nombre | Frais de gestion (% du loyer) |
| `provision_travaux` | Nombre | Provision travaux (% du loyer) |
| `provision_vacance` | Nombre | Provision vacance locative (% du loyer) |
| `cfe_estimee` | Nombre | CFE estimée annuelle (€) - obligatoire LMNP |
| `comptable_annuel` | Nombre | Frais comptable annuels (€) - si régime réel |

### 1.5 Structure juridique

| Champ | Type | Description |
|-------|------|-------------|
| `type` | Texte | `nom_propre` ou `sci_is` |
| `tmi` | Nombre | Tranche Marginale d'Imposition (%) |
| `regime_fiscal` | Texte | `micro_foncier`, `reel_foncier`, `lmnp_micro`, `lmnp_reel` |
| `associes` | Liste | Liste des associés (pour SCI IS) |
| `revenus_annuels_foyer` | Nombre | Revenus annuels du foyer (€) - pour calcul précis |
| `autres_revenus_fonciers` | Nombre | Autres revenus fonciers existants (€) |

---

## 2. Calculs de financement

### 2.1 Frais de notaire (NOUVEAU)

Les frais de notaire doivent être calculés précisément selon le type de bien :

**Pour un bien ancien :**

```
Droits_Mutation = Prix_Achat × Taux_DMTO_Effectif

où : Taux_DMTO_Effectif = 
    Si Primo_Accedant ET Departement_Hausse :
        4.5% (taux avant hausse)
    Sinon :
        Taux_DMTO_Departement (4.5% à 5%)

Taxe_Communale = Prix_Achat × 1.20%
Contribution_Securite_Immobiliere = Prix_Achat × 0.10%

Emoluments_Notaire = Calcul_Bareme(Prix_Achat)
    - Tranche 0 à 6 500 € : 3.870%
    - Tranche 6 500 à 17 000 € : 1.596%
    - Tranche 17 000 à 60 000 € : 1.064%
    - Au-delà de 60 000 € : 0.799%

Debours = Entre 800 € et 1 600 € (forfait 1 200 €)

Frais_Notaire_Total = Droits_Mutation + Taxe_Communale + 
                       Contribution_Securite_Immobiliere +
                       Emoluments_Notaire + Debours

# Estimation simplifiée
Frais_Notaire_Ancien ≈ Prix_Achat × 7.5% à 8.5%
```

**Pour un bien neuf :**

```
Droits_Mutation_Neuf = Prix_Achat × 0.715%
Frais_Notaire_Neuf ≈ Prix_Achat × 2.5% à 3%
```

### 2.2 Coût total d'acquisition (NOUVEAU)

```
Base_Frais_Notaire = Prix_Achat - Valeur_Mobilier
Frais_Notaire = Calcul_Frais_Notaire(Base_Frais_Notaire, Etat_Bien)

Cout_Total_Acquisition = Prix_Achat + Frais_Notaire + Montant_Travaux +
                          Frais_Agence (si charge acquéreur)
```

### 2.3 Montant emprunté

```
Montant_Emprunt = max(0, Cout_Total_Acquisition - Apport)
```

### 2.4 Mensualité du crédit (formule PMT)

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

### 2.5 Mensualité d'assurance

```
Si Type_Assurance = "capital_initial" :
    Mensualité_Assurance = (Montant_Emprunt × Taux_Assurance / 100) / 12

Si Type_Assurance = "capital_restant_du" :
    # Calcul mois par mois sur capital restant dû
    Mensualité_Assurance(n) = Capital_Restant_Du(n) × Taux_Assurance / 100 / 12
```

### 2.6 Mensualité totale

```
Mensualité_Totale = Mensualité_Crédit + Mensualité_Assurance
```

### 2.7 Tableau d'amortissement (NOUVEAU - pour régime réel)

Pour chaque année n :

```
Capital_Restant_Début(n) = Capital_Restant_Fin(n-1)

Pour chaque mois m de l'année n :
    Intérêts(m) = Capital_Restant(m) × Taux_Mensuel
    Principal(m) = Mensualité_Crédit - Intérêts(m)
    Capital_Restant(m+1) = Capital_Restant(m) - Principal(m)

Total_Intérêts_Annuels(n) = Somme(Intérêts(m)) pour m dans année n
Total_Assurance_Annuel(n) = Somme(Assurance(m)) pour m dans année n
```

### 2.8 Coût total du crédit

```
Coût_Total_Crédit = Mensualité_Totale × Durée_Années × 12
```

### 2.9 Coût total des intérêts

```
Coût_Intérêts = Coût_Total_Crédit - Montant_Emprunt - Coût_Total_Assurance
```

### 2.10 Exemple de calcul complet

| Donnée | Valeur |
|--------|--------|
| Prix d'achat | 150 000 € |
| État du bien | Ancien |
| Département | DMTO 5% |
| Primo-accédant | Non |
| Apport | 30 000 € |
| Travaux | 10 000 € |
| Taux d'intérêt | 3.5% |
| Durée | 20 ans |
| Assurance | 0.36% sur capital initial |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Frais de notaire | 150 000 × 8% | **12 000 €** |
| Coût total acquisition | 150 000 + 12 000 + 10 000 | **172 000 €** |
| Montant emprunté | 172 000 - 30 000 | **142 000 €** |
| Mensualité crédit | Formule PMT | **823.11 €** |
| Mensualité assurance | 142 000 × 0.0036 / 12 | **42.60 €** |
| Mensualité totale | 823.11 + 42.60 | **865.71 €** |
| Coût total crédit | 865.71 × 240 | **207 770 €** |

---

## 3. Calculs des charges

### 3.1 Loyer annuel brut

```
Loyer_Annuel = Loyer_Mensuel × 12
```

### 3.2 Charges fixes annuelles

```
Charges_Copro_Non_Recup = (Charges_Copro - Charges_Copro_Recuperables) × 12

Charges_Fixes = Charges_Copro_Non_Recup + Taxe_Fonciere + 
                Assurance_PNO + Assurance_GLI + CFE_Estimee
```

> **Note CFE :** La Cotisation Foncière des Entreprises est obligatoire pour toute activité LMNP.
> - Exonération première année d'activité
> - Exonération si CA < 5 000 €
> - Montant variable selon commune (généralement 200 € à 1 500 €)

### 3.3 Charges proportionnelles annuelles

```
Gestion = (Gestion_Locative / 100) × Loyer_Annuel
Travaux = (Provision_Travaux / 100) × Loyer_Annuel
Vacance = (Provision_Vacance / 100) × Loyer_Annuel

Charges_Proportionnelles = Gestion + Travaux + Vacance
```

### 3.4 Charges spécifiques au régime réel (NOUVEAU)

```
Si Regime_Fiscal IN ("reel_foncier", "lmnp_reel") :
    Charges_Comptable = Comptable_Annuel
Sinon :
    Charges_Comptable = 0
```

### 3.5 Total des charges annuelles

```
Total_Charges = Charges_Fixes + Charges_Proportionnelles + Charges_Comptable
```

### 3.6 Charges déductibles selon régime (NOUVEAU)

**Location nue - Régime réel foncier :**

```
Charges_Deductibles_Foncier = 
    Charges_Copro_Non_Recup +
    Taxe_Fonciere +
    Assurance_PNO +
    Assurance_GLI +
    Intérêts_Emprunt_Annuels +
    Assurance_Emprunt_Annuel +
    Frais_Gestion (si agence) +
    Travaux_Entretien_Amelioration +
    20 € forfait par bien (frais de gestion divers)
```

**LMNP - Régime réel :**

```
Charges_Deductibles_LMNP = 
    Toutes charges du foncier réel +
    CFE +
    Frais_Comptable +
    Amortissements (voir section 5)
```

### 3.7 Exemple de calcul

| Donnée | Valeur |
|--------|--------|
| Loyer mensuel | 750 € |
| Charges copro | 80 € / mois |
| Part récupérable | 30 € / mois |
| Taxe foncière | 600 € / an |
| Assurance PNO | 150 € / an |
| CFE | 300 € / an |
| Gestion locative | 0% |
| Provision travaux | 5% |
| Provision vacance | 5% |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Loyer annuel | 750 × 12 | **9 000 €** |
| Charges copro non récup | (80-30) × 12 | **600 €** |
| Charges fixes | 600 + 600 + 150 + 300 | **1 650 €** |
| Charges proportionnelles | (5% + 5%) × 9 000 | **900 €** |
| **Total charges** | 1 650 + 900 | **2 550 €** |

---

## 4. Calculs de rentabilité

### 4.1 Rentabilité brute

```
Rentabilité_Brute (%) = (Loyer_Annuel / Prix_Achat) × 100
```

### 4.2 Rentabilité brute sur coût total (NOUVEAU)

```
Rentabilité_Brute_Totale (%) = (Loyer_Annuel / Cout_Total_Acquisition) × 100
```

### 4.3 Revenu net avant impôts

```
Revenu_Net_Avant_Impôts = Loyer_Annuel - Total_Charges
```

### 4.4 Rentabilité nette (avant impôts)

```
Rentabilité_Nette (%) = (Revenu_Net_Avant_Impôts / Cout_Total_Acquisition) × 100
```

### 4.5 Cash-flow

```
Cash-flow_Annuel = Revenu_Net_Avant_Impôts - Remboursement_Annuel

où : Remboursement_Annuel = Mensualité_Totale × 12

Cash-flow_Mensuel = Cash-flow_Annuel / 12
```

### 4.6 Enrichissement patrimonial (NOUVEAU)

```
Capital_Rembourse_Annuel(n) = Somme(Principal(m)) pour m dans année n
Enrichissement_Brut(n) = Capital_Rembourse_Annuel(n) + Cash-flow_Annuel(n)
```

### 4.7 Rendement sur fonds propres (NOUVEAU)

```
Rendement_Fonds_Propres (%) = (Enrichissement_Brut / Apport) × 100
```

### 4.8 Exemple de calcul

| Donnée | Valeur |
|--------|--------|
| Prix d'achat | 150 000 € |
| Coût total acquisition | 172 000 € |
| Loyer annuel | 9 000 € |
| Total charges | 2 550 € |
| Remboursement annuel | 10 388.52 € |
| Apport | 30 000 € |
| Capital remboursé An 1 | 5 200 € (estimé) |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Rentabilité brute | (9 000 / 150 000) × 100 | **6.00%** |
| Rentabilité brute totale | (9 000 / 172 000) × 100 | **5.23%** |
| Revenu net avant impôts | 9 000 - 2 550 | **6 450 €** |
| Rentabilité nette | (6 450 / 172 000) × 100 | **3.75%** |
| Cash-flow annuel | 6 450 - 10 388.52 | **-3 938.52 €** |
| Cash-flow mensuel | -3 938.52 / 12 | **-328.21 €** |
| Enrichissement brut An 1 | 5 200 - 3 938.52 | **1 261.48 €** |
| Rendement fonds propres | (1 261.48 / 30 000) × 100 | **4.20%** |

---

## 5. Calculs de fiscalité

### 5.1 Régimes disponibles

| Régime | Structure | Type Location | Description |
|--------|-----------|---------------|-------------|
| Micro-foncier | Nom propre | Nue | Abattement forfaitaire de 30% |
| Foncier réel | Nom propre | Nue | Déduction des charges réelles + intérêts |
| LMNP Micro-BIC | Nom propre | Meublée | Abattement forfaitaire (30% à 50%) |
| LMNP Réel | Nom propre | Meublée | Amortissement + charges réelles |
| IS | SCI IS | Toute | Impôt sur les sociétés |

### 5.2 Régime Micro-foncier (Location nue)

**Conditions :**
- Loyer annuel ≤ 15 000 €
- Pas de dispositif fiscal spécifique (Pinel, Malraux, etc.)
- Location nue uniquement

```
Base_Imposable = Loyer_Annuel × (1 - 30%)
               = Loyer_Annuel × 0.70

Impôt_Revenu = Base_Imposable × TMI
Prélèvements_Sociaux = Base_Imposable × 17.2%

Impôt_Total = Impôt_Revenu + Prélèvements_Sociaux
```

**CSG déductible :**

```
CSG_Deductible = Base_Imposable × 6.8%
# Applicable sur revenus de l'année suivante
```

### 5.3 Régime Foncier Réel (Location nue) - NOUVEAU

**Obligatoire si :** Revenus fonciers > 15 000 € ou sur option (engagement 3 ans)

```
Revenus_Fonciers_Bruts = Loyer_Annuel

Charges_Deductibles = 
    Charges_Copro_Non_Recuperables +
    Taxe_Fonciere +
    Assurance_PNO +
    Intérêts_Emprunt +
    Assurance_Emprunt +
    Frais_Gestion +
    Travaux_Entretien_Amelioration +
    20 € (forfait gestion)

Revenu_Foncier_Net = Revenus_Fonciers_Bruts - Charges_Deductibles

Si Revenu_Foncier_Net ≥ 0 :
    Base_Imposable = Revenu_Foncier_Net
    Impôt_Revenu = Base_Imposable × TMI
    Prélèvements_Sociaux = Base_Imposable × 17.2%

Si Revenu_Foncier_Net < 0 (Déficit foncier) :
    # Déficit hors intérêts imputable sur revenu global
    Deficit_Hors_Interets = min(|Revenu_Foncier_Net + Intérêts_Emprunt|, 10 700)
    Deficit_Interets = |Deficit - Deficit_Hors_Interets|
    
    # Imputable sur revenu global (limité à 10 700 €/an, 21 400 € si travaux réno énergétique)
    Economie_Impot = Deficit_Hors_Interets × TMI
    
    # Report du surplus sur 10 ans sur revenus fonciers uniquement
    Deficit_Reportable = max(0, |Revenu_Foncier_Net| - Deficit_Hors_Interets)
```

### 5.4 Régime LMNP Micro-BIC (CORRIGÉ)

**Plafonds et abattements selon type de location (applicable 2025-2026) :**

| Type de location | Plafond CA | Abattement | PS |
|------------------|------------|------------|-----|
| Meublée longue durée | 77 700 € | 50% | 18.6% |
| Meublé tourisme classé | 77 700 € | 50% | 18.6% |
| Meublé tourisme non classé | 15 000 € | 30% | 18.6% |

```
Si Type_Location = "meublee_longue_duree" OU "meublee_tourisme_classe" :
    Plafond = 77 700 €
    Abattement = 50%
    
Si Type_Location = "meublee_tourisme_non_classe" :
    Plafond = 15 000 €
    Abattement = 30%

Si Loyer_Annuel ≤ Plafond :
    Base_Imposable = Loyer_Annuel × (1 - Abattement)
    
    Impôt_Revenu = Base_Imposable × TMI
    Prélèvements_Sociaux = Base_Imposable × 18.6%  # CORRIGÉ (était 17.2%)
    
    Impôt_Total = Impôt_Revenu + Prélèvements_Sociaux

Sinon :
    # Basculement obligatoire au régime réel
    Régime = "lmnp_reel"
```

### 5.5 Régime LMNP Réel (ENRICHI)

**Amortissement par composants :**

| Composant | Part du bien | Durée | Taux annuel |
|-----------|--------------|-------|-------------|
| Terrain | 10-20% | Non amortissable | 0% |
| Gros œuvre | 40-50% | 50 ans | 2% |
| Toiture | 5-10% | 25 ans | 4% |
| Installations électriques | 5% | 25 ans | 4% |
| Plomberie | 5% | 25 ans | 4% |
| Agencements | 10-15% | 15 ans | 6.67% |
| Meubles | Variable | 5-10 ans | 10-20% |
| Travaux | Variable | 10-15 ans | 6.67-10% |

```
# 1. Calcul de l'amortissement immobilier
Part_Terrain = Prix_Achat × 15%  # Non amortissable
Valeur_Amortissable = Prix_Achat - Part_Terrain + Frais_Notaire + Frais_Agence

Amortissement_Immobilier_Annuel = 
    Somme(Part_Composant × Valeur_Amortissable / Durée_Composant)

# Simplification courante :
Amortissement_Immobilier ≈ Valeur_Amortissable × 3%  # ~33 ans moyen

# 2. Calcul de l'amortissement mobilier
Amortissement_Mobilier = Valeur_Mobilier / Durée_Mobilier  # 5-10 ans

# 3. Calcul de l'amortissement travaux
Amortissement_Travaux = Montant_Travaux / Durée_Travaux  # 10-15 ans

Amortissement_Total = Amortissement_Immobilier + Amortissement_Mobilier + Amortissement_Travaux

# 4. Calcul du résultat BIC
Revenus_BIC = Loyer_Annuel

Charges_Deductibles_BIC = 
    Charges_Copro_Non_Recup +
    Taxe_Fonciere +
    Assurance_PNO +
    Assurance_GLI +
    CFE +
    Intérêts_Emprunt +
    Assurance_Emprunt +
    Frais_Gestion +
    Frais_Comptable +
    Travaux_Entretien (<600€)

Resultat_Avant_Amortissement = Revenus_BIC - Charges_Deductibles_BIC

# L'amortissement ne peut pas créer de déficit
Amortissement_Deductible = min(Amortissement_Total, max(0, Resultat_Avant_Amortissement))
Amortissement_Differe = Amortissement_Total - Amortissement_Deductible  # Reportable sans limite

Resultat_BIC = max(0, Resultat_Avant_Amortissement - Amortissement_Deductible)

# 5. Imposition
Impôt_Revenu = Resultat_BIC × TMI
Prélèvements_Sociaux = Resultat_BIC × 18.6%  # CORRIGÉ

Impôt_Total = Impôt_Revenu + Prélèvements_Sociaux
```

**Réintégration des amortissements à la revente (depuis février 2025) :**

```
Plus_Value_Brute = Prix_Vente - Prix_Achat
Amortissements_Cumules = Somme(Amortissement_Deductible) sur toutes les années

Plus_Value_Corrigee = Plus_Value_Brute + Amortissements_Cumules

# Abattements pour durée de détention applicables ensuite
# Exonération IR après 22 ans, PS après 30 ans

# Exceptions : Résidences services (étudiantes, seniors, EHPAD) non concernées
```

### 5.6 Régime SCI à l'IS (ENRICHI)

```
# Amortissement SCI IS
Valeur_Terrain = Prix_Achat × 15%  # Non amortissable
Valeur_Amortissable = Prix_Achat - Valeur_Terrain

# Composants possibles, simplification :
Amortissement_Annuel = Valeur_Amortissable × 2.5%  # ~40 ans linéaire

Charges_Deductibles_SCI = 
    Toutes charges d'exploitation +
    Intérêts_Emprunt +
    Assurance_Emprunt +
    Frais_Comptable +
    Amortissement_Annuel

Base_Imposable = max(0, Loyer_Annuel - Charges_Deductibles_SCI)

Si Base_Imposable ≤ 42 500 € :
    Impôt_IS = Base_Imposable × 15%
Sinon :
    Impôt_IS = 42 500 × 15% + (Base_Imposable - 42 500) × 25%

# Pas de prélèvements sociaux au niveau de la SCI
# PS applicables uniquement sur dividendes distribués

Si Distribution_Dividendes :
    Base_Dividendes = Resultat_Net_SCI × Quote_Part_Associe
    Flat_Tax = Base_Dividendes × 30%  # ou option barème
```

### 5.7 Rentabilité nette-nette

```
Revenu_Net_Après_Impôt = Revenu_Net_Avant_Impôts - Impôt_Total

Rentabilité_Nette_Nette (%) = (Revenu_Net_Après_Impôt / Cout_Total_Acquisition) × 100

Cash_Flow_Net_Impôt = Cash_Flow_Annuel - Impôt_Total
Cash_Flow_Mensuel_Net = Cash_Flow_Net_Impôt / 12
```

### 5.8 Exemple comparatif : Micro-foncier vs LMNP Micro-BIC

| Donnée | Valeur |
|--------|--------|
| Loyer annuel | 9 000 € |
| TMI | 30% |

| Critère | Micro-foncier | LMNP Micro-BIC |
|---------|---------------|----------------|
| Abattement | 30% | 50% |
| Base imposable | 6 300 € | 4 500 € |
| IR | 1 890 € | 1 350 € |
| PS (taux) | 17.2% | 18.6% |
| PS (montant) | 1 083.60 € | 837 € |
| **Impôt total** | **2 973.60 €** | **2 187 €** |
| Économie LMNP | - | **786.60 €** |

---

## 6. Analyse HCSF

### 6.1 Principes HCSF (Actualisés)

Le Haut Conseil de Stabilité Financière impose des règles pour l'octroi de crédits immobiliers :
- **Taux d'endettement maximum :** 35% (assurance incluse)
- **Durée maximale du crédit :** 25 ans (+ 2 ans différé possible en VEFA/construction)
- **Pondération des revenus locatifs :** 70%
- **Marge de flexibilité :** 20% des prêts peuvent déroger (dont 80% pour RP)

### 6.2 Calcul du taux d'endettement

```
Taux_Endettement = Total_Charges_Mensuelles / Revenus_Nets_Mensuels × 100
```

### 6.3 Revenus pondérés (mode nom propre)

```
Revenus_Nets_Mensuels = Revenus_Activité_Mensuels + (Loyer_Mensuel × 70%)

# Estimation des revenus selon TMI (si non fournis)
```

**Estimation des revenus selon TMI :**

| TMI | Revenus mensuels nets estimés |
|-----|------------------------------|
| 0% | 1 200 € |
| 11% | 2 000 € |
| 30% | 4 000 € |
| 41% | 7 000 € |
| 45% | 16 000 € |

### 6.4 Charges mensuelles

```
Total_Charges_Mensuelles = 
    Credits_Existants_Mensuels +
    Nouveau_Credit_Mensuel +
    Loyers_Residence_Principale (si locataire)

où : Nouveau_Credit_Mensuel = Mensualité_Totale (crédit + assurance)
```

### 6.5 Conformité HCSF

```
Conforme = (Taux_Endettement ≤ 35%) ET (Durée_Emprunt ≤ 25)
```

### 6.6 Reste à vivre (NOUVEAU)

```
Reste_A_Vivre = Revenus_Nets_Mensuels - Total_Charges_Mensuelles

# Seuils recommandés
Reste_A_Vivre_Min_Celibataire = 700 €
Reste_A_Vivre_Min_Couple = 1 000 €
Reste_A_Vivre_Par_Enfant = + 300 €
```

### 6.7 Mode SCI IS (par associé)

Pour chaque associé :

```
Quote_Part_Crédit = Mensualité_Totale × (Parts / 100)
Quote_Part_Loyer = Loyer_Mensuel × (Parts / 100)

Revenus_Associé_Total = Revenus_Personnels_Mensuels + (Quote_Part_Loyer × 70%)
Charges_Associé_Total = Crédits_Personnels + Quote_Part_Crédit

Taux_Endettement_Associé = Charges_Associé_Total / Revenus_Associé_Total × 100
```

La SCI est **non conforme** si au moins un associé dépasse 35%.

### 6.8 Capacité d'emprunt résiduelle

```
Charge_Max_Autorisée = Revenus_Nets_Mensuels × 35%
Marge_Mensuelle = max(0, Charge_Max_Autorisée - Total_Charges_Mensuelles_Actuelles)

# Conversion en capital empruntable
Taux_Mensuel = Taux_Marché / 100 / 12
Durée_Mois = 20 × 12  # 20 ans standard

Facteur_Annuité = (1 - (1 + Taux_Mensuel)^(-Durée_Mois)) / Taux_Mensuel

Capacité_Résiduelle = Marge_Mensuelle × Facteur_Annuité
```

### 6.9 Exemple de calcul HCSF

| Donnée | Valeur |
|--------|--------|
| Revenus nets mensuels | 4 000 € |
| Crédits existants | 200 € |
| Loyer mensuel projet | 750 € |
| Mensualité nouveau crédit | 865.71 € |

| Résultat | Calcul | Valeur |
|----------|--------|--------|
| Revenus locatifs pondérés | 750 × 70% | **525 €** |
| Revenus totaux | 4 000 + 525 | **4 525 €** |
| Charges totales | 200 + 865.71 | **1 065.71 €** |
| **Taux d'endettement** | 1 065.71 / 4 525 | **23.55%** |
| Conforme HCSF | 23.55% ≤ 35% | **Oui** |
| Reste à vivre | 4 525 - 1 065.71 | **3 459.29 €** |

---

## 7. Scoring et synthèse

### 7.1 Critères d'évaluation (ENRICHIS)

| Critère | Condition | Points | Poids |
|---------|-----------|--------|-------|
| Autofinancement | Cash-flow mensuel net impôt ≥ 0 | +15 | Élevé |
| Rentabilité brute | ≥ 7% | +10 | Moyen |
| Rentabilité nette-nette | ≥ 5% | +15 | Élevé |
| Conformité HCSF | Taux endettement ≤ 35% | +20 | Critique |
| Reste à vivre | ≥ seuil minimum | +10 | Élevé |
| Prix au m² | ≤ prix médian secteur | +5 | Faible |
| DPE | Classe A à D | +5 | Moyen |
| Ratio prix/loyer | ≤ 200 (années de loyer) | +10 | Moyen |
| Enrichissement positif | Enrichissement brut > 0 | +10 | Moyen |

### 7.2 Score interne (0-5)

| Score | Évaluation | Recommandation |
|-------|------------|----------------|
| 5 | Excellent | Investissement exceptionnel. Tous les indicateurs au vert. |
| 4 | Très bon | Investissement très viable. Un ou deux points d'attention mineurs. |
| 3 | Bon | Investissement viable. Vérifiez les points d'attention. |
| 2 | Moyen | Investissement à optimiser. Négociez le prix ou augmentez le loyer. |
| 1 | Faible | Investissement risqué. Améliorations nécessaires. |
| 0 | Très faible | Investissement déconseillé. Reconsidérez le projet. |

### 7.3 Score global (0-100)

```
Score_Base = 40

# Cash-flow net impôt (-20 à +20 points)
Si Cash_Flow_Mensuel_Net ≥ 200 :
    Bonus = +20
Si Cash_Flow_Mensuel_Net ≥ 0 :
    Bonus = +15 + (Cash_Flow_Mensuel_Net / 200) × 5
Sinon Si Cash_Flow_Mensuel_Net ≥ -200 :
    Malus = (Cash_Flow_Mensuel_Net / 200) × 10
Sinon :
    Malus = -20

# Rentabilité nette-nette (-15 à +20 points)
Si Rentabilité_Nette_Nette ≥ 7% : +20 points
Si Rentabilité_Nette_Nette ≥ 5% : +10 points
Si Rentabilité_Nette_Nette ≥ 3% : +0 points
Sinon : -15 points

# HCSF (+20 / -25 points)
Si Conforme_HCSF ET Taux_Endettement ≤ 30% : +20 points
Si Conforme_HCSF : +15 points
Sinon : -25 points

# DPE (+5 / -10 points)
Si DPE IN (A, B, C) : +5 points
Si DPE IN (D, E) : +0 points
Si DPE IN (F, G) : -10 points  # Passoires énergétiques

# Ratio prix/loyer annuel (-5 à +10 points)
Ratio = Prix_Achat / Loyer_Annuel
Si Ratio ≤ 15 : +10 points
Si Ratio ≤ 18 : +5 points
Si Ratio ≤ 22 : +0 points
Sinon : -5 points

# Reste à vivre (+5 / -10 points)
Si Reste_A_Vivre ≥ Seuil_Recommandé × 1.5 : +5 points
Si Reste_A_Vivre ≥ Seuil_Recommandé : +0 points
Sinon : -10 points

Score_Global = max(0, min(100, Score_Base + Somme(Ajustements)))
```

### 7.4 Alertes et points d'attention

| Alerte | Niveau | Condition | Message |
|--------|--------|-----------|---------|
| DPE F/G | 🔴 Critique | DPE ∈ {F, G} | Interdiction location 2025 (G) / 2028 (F) |
| HCSF dépassé | 🔴 Critique | Taux > 35% | Financement bancaire improbable |
| Cash-flow très négatif | 🟠 Important | CF < -300€/mois | Effort d'épargne conséquent requis |
| Rentabilité faible | 🟠 Important | Renta nette < 3% | Rentabilité inférieure aux placements sécurisés |
| CFE non budgétée | 🟡 Attention | LMNP sans CFE | Prévoir 200€ à 1500€/an selon commune |
| Fiscalité non optimale | 🟡 Attention | Micro > Réel | Un régime réel pourrait être plus avantageux |

### 7.5 Exemple de calcul du score

| Donnée | Valeur |
|--------|--------|
| Cash-flow mensuel net impôt | -150 € |
| Rentabilité nette-nette | 3.2% |
| Conforme HCSF | Oui (23.55%) |
| DPE | D |
| Ratio prix/loyer | 16.7 |
| Reste à vivre | 3 459 € (> seuil) |

| Composante | Calcul | Points |
|------------|--------|--------|
| Score base | - | **40** |
| Cash-flow | -150€ → (-150/200)×10 | **-7.5** |
| Rentabilité nette-nette | 3.2% ∈ [3%;5%[ | **0** |
| HCSF | Conforme, 23.55% ≤ 30% | **+20** |
| DPE | D | **0** |
| Ratio prix/loyer | 16.7 ≤ 18 | **+5** |
| Reste à vivre | > seuil ×1.5 | **+5** |
| **Score final** | 40 - 7.5 + 0 + 20 + 0 + 5 + 5 | **62.5** |

---

## 8. Constantes et seuils (ACTUALISÉS)

### 8.1 Constantes fiscales 2025-2026

| Constante | Valeur | Description |
|-----------|--------|-------------|
| `PS_REVENUS_FONCIERS` | 17.2% | PS sur revenus fonciers (location nue) |
| `PS_REVENUS_BIC_LMNP` | 18.6% | PS sur BIC LMNP (hausse CSG 2025) |
| `CSG_DEDUCTIBLE` | 6.8% | CSG déductible sur revenus fonciers |
| `MICRO_FONCIER_PLAFOND` | 15 000 € | Plafond de loyer pour micro-foncier |
| `MICRO_FONCIER_ABATTEMENT` | 30% | Abattement micro-foncier |
| `MICRO_BIC_PLAFOND_LONGUE_DUREE` | 77 700 € | Plafond LMNP longue durée |
| `MICRO_BIC_ABATTEMENT_LONGUE_DUREE` | 50% | Abattement LMNP longue durée |
| `MICRO_BIC_PLAFOND_TOURISME_NON_CLASSE` | 15 000 € | Plafond meublé tourisme non classé |
| `MICRO_BIC_ABATTEMENT_TOURISME_NON_CLASSE` | 30% | Abattement meublé tourisme non classé |
| `MICRO_BIC_PLAFOND_TOURISME_CLASSE` | 77 700 € | Plafond meublé tourisme classé |
| `MICRO_BIC_ABATTEMENT_TOURISME_CLASSE` | 50% | Abattement meublé tourisme classé |
| `IS_TAUX_REDUIT` | 15% | Taux IS réduit (≤ 42 500 €) |
| `IS_TAUX_NORMAL` | 25% | Taux IS normal (> 42 500 €) |
| `IS_SEUIL` | 42 500 € | Seuil du taux réduit IS |
| `DEFICIT_FONCIER_PLAFOND` | 10 700 € | Plafond déficit foncier sur revenu global |
| `DEFICIT_FONCIER_RENO_ENERGETIQUE` | 21 400 € | Plafond déficit pour réno énergétique |

### 8.2 Constantes frais de notaire

| Constante | Valeur | Description |
|-----------|--------|-------------|
| `DMTO_TAUX_BASE` | 4.5% | Taux DMTO de base |
| `DMTO_TAUX_HAUSSE` | 5.0% | Taux DMTO avec hausse départementale |
| `TAXE_COMMUNALE` | 1.20% | Taxe au profit de la commune |
| `CSI` | 0.10% | Contribution sécurité immobilière |
| `DMTO_NEUF` | 0.715% | DMTO pour bien neuf |
| `FRAIS_NOTAIRE_ANCIEN_ESTIM` | 8% | Estimation frais notaire ancien |
| `FRAIS_NOTAIRE_NEUF_ESTIM` | 3% | Estimation frais notaire neuf |
| `DEBOURS_FORFAIT` | 1 200 € | Forfait débours estimé |

### 8.3 Constantes HCSF

| Constante | Valeur | Description |
|-----------|--------|-------------|
| `TAUX_ENDETTEMENT_MAX` | 35% | Taux d'endettement maximum |
| `TAUX_ENDETTEMENT_CONFORT` | 30% | Seuil confort recommandé |
| `DUREE_EMPRUNT_MAX` | 25 ans | Durée maximale du crédit |
| `DUREE_EMPRUNT_MAX_VEFA` | 27 ans | Durée maximale avec différé VEFA |
| `PONDERATION_LOCATIFS` | 70% | Pondération des revenus locatifs |

### 8.4 Constantes amortissement LMNP

| Composant | Part estimée | Durée | Taux |
|-----------|-------------|-------|------|
| Terrain | 15% | N/A | 0% |
| Gros œuvre | 45% | 50 ans | 2% |
| Toiture | 8% | 25 ans | 4% |
| Installations élec/plomb | 10% | 25 ans | 4% |
| Agencements intérieurs | 12% | 15 ans | 6.67% |
| Façade/étanchéité | 10% | 20 ans | 5% |
| Meubles | Variable | 7 ans | 14.3% |
| Électroménager | Variable | 5 ans | 20% |
| Travaux | Variable | 10 ans | 10% |

### 8.5 Seuils d'analyse

| Seuil | Valeur | Description |
|-------|--------|-------------|
| `RENTABILITE_BRUTE_MIN` | 5% | Rentabilité brute minimum acceptable |
| `RENTABILITE_BRUTE_BONNE` | 7% | Seuil rentabilité brute bonne |
| `RENTABILITE_BRUTE_EXCELLENTE` | 10% | Rentabilité brute excellente |
| `RENTABILITE_NETTE_MIN` | 3% | Rentabilité nette minimum |
| `RENTABILITE_NETTE_BONNE` | 5% | Rentabilité nette bonne |
| `CASHFLOW_POSITIF` | 0 € | Seuil autofinancement |
| `CASHFLOW_CRITIQUE` | -300 € | Cash-flow mensuel critique |
| `RATIO_PRIX_LOYER_BON` | 15 | Prix / loyer annuel bon |
| `RATIO_PRIX_LOYER_MAX` | 22 | Prix / loyer annuel maximum |
| `CFE_EXONERATION_CA` | 5 000 € | Seuil exonération CFE |

### 8.6 TMI et barème IR 2025

| Tranche | Taux |
|---------|------|
| 0 € à 11 294 € | 0% |
| 11 294 € à 28 797 € | 11% |
| 28 797 € à 82 341 € | 30% |
| 82 341 € à 177 106 € | 41% |
| > 177 106 € | 45% |

---

## 9. Projections pluriannuelles (NOUVEAU)

### 9.1 Paramètres de projection

| Paramètre | Valeur par défaut | Description |
|-----------|-------------------|-------------|
| `INFLATION_LOYER` | 2% | Hausse annuelle des loyers |
| `INFLATION_CHARGES` | 2.5% | Hausse annuelle des charges |
| `INFLATION_TRAVAUX` | 3% | Hausse annuelle coûts travaux |
| `REVALORISATION_BIEN` | 1.5% | Hausse annuelle valeur bien |
| `HORIZON_PROJECTION` | 20 ans | Durée de projection |

### 9.2 Projection annuelle

Pour chaque année n :

```
Loyer_Annuel(n) = Loyer_Annuel(n-1) × (1 + INFLATION_LOYER)
Charges(n) = Charges(n-1) × (1 + INFLATION_CHARGES)
Valeur_Bien(n) = Valeur_Bien(n-1) × (1 + REVALORISATION_BIEN)
Capital_Rembourse_Cumule(n) = Somme(Principal) de 1 à n

Flux_Net(n) = Loyer_Annuel(n) - Charges(n) - Impot(n) - Mensualite_Annuelle
Enrichissement(n) = Capital_Rembourse(n) + Flux_Net(n) + Plus_Value_Latente(n)
```

### 9.3 Indicateurs de sortie

```
# TRI (Taux de Rendement Interne)
TRI = Résolution de : Apport = Somme(Flux_Net(n) / (1+TRI)^n) + Valeur_Sortie / (1+TRI)^Horizon

# VAN (Valeur Actuelle Nette)
VAN = Somme(Flux_Net(n) / (1+Taux_Actualisation)^n) + Valeur_Sortie_Nette / (1+Taux_Actualisation)^Horizon - Apport

# Multiple sur capital investi
Multiple = (Valeur_Sortie_Nette + Somme(Flux_Net)) / Apport
```

---

## Annexe A : Flux de calcul

```
┌─────────────────────────────────────────────────────────────────┐
│                        DONNÉES D'ENTRÉE                         │
│  Bien | Financement | Exploitation | Structure | Frais notaire  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     1. VALIDATION                               │
│  Vérification données obligatoires + cohérence + DPE           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     2. FRAIS D'ACQUISITION                      │
│  Frais notaire + Travaux → Coût total acquisition              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     3. FINANCEMENT                              │
│  Montant emprunt → Mensualités → Tableau amortissement         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     4. CHARGES                                  │
│  Charges fixes + Proportionnelles + CFE → Total charges        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     5. RENTABILITÉ BRUTE                        │
│  Rentabilité brute → Rentabilité nette → Cash-flow             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     6. FISCALITÉ                                │
│  Selon régime : Base imposable → Amortissements → Impôt        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     7. RENTABILITÉ NETTE-NETTE                  │
│  Cash-flow net impôt → Enrichissement → Rendement fonds propres│
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     8. ANALYSE HCSF                             │
│  Revenus pondérés → Taux endettement → Reste à vivre          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     9. PROJECTIONS                              │
│  Evolution N+1 à N+20 → TRI → VAN → Multiple                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     10. SCORING & ALERTES                       │
│  Critères → Score global → Alertes → Recommandation            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      RÉSULTATS                                  │
│  Rentabilités | Fiscalité | HCSF | Score | Projections | Alertes│
└─────────────────────────────────────────────────────────────────┘
```

---

## Annexe B : Checklist de validation métier

### Avant mise en production, valider :

- [ ] Taux DMTO par département à jour
- [ ] Barème émoluments notaire à jour
- [ ] Taux de prélèvements sociaux différenciés (17.2% / 18.6%)
- [ ] Plafonds et abattements micro-BIC par type de location
- [ ] Barème IR actualisé
- [ ] Taux IS actualisés
- [ ] Seuils HCSF confirmés
- [ ] Durées d'amortissement par composant validées
- [ ] CFE : seuil d'exonération et estimation par défaut
- [ ] Gestion du DPE et interdictions de location

---

## Historique des modifications

| Date | Version | Auteur | Description |
|------|---------|--------|-------------|
| 2026-01-27 | 1.0 | Dev | Création du document |
| 2026-01-27 | 2.0 | Expert | Corrections majeures : PS 18.6% LMNP, frais notaire, CFE, régimes détaillés, amortissements composants, HCSF enrichi, scoring amélioré, projections |

---

> ⚠️ **Document validé sous réserve de confirmation avec un expert-comptable et un notaire avant mise en production.**

**Points de vigilance particuliers :**
1. La fiscalité LMNP est en évolution constante - prévoir une mise à jour régulière
2. Les taux DMTO varient par département - implémenter une table de référence
3. La réintégration des amortissements à la revente LMNP (depuis 02/2025) doit être prise en compte dans les projections
4. Le statut du bailleur privé (PLF 2026) pourrait modifier les règles - à surveiller

---

# Résumé des modifications apportées

## 🔴 Corrections critiques

1. **Prélèvements sociaux LMNP** : 17.2% → 18.6%
2. **Régimes micro-BIC LMNP** différenciés selon type de location
3. **Frais de notaire** ajoutés avec calcul détaillé
4. **CFE** ajoutée comme charge obligatoire LMNP

## 🟢 Ajouts majeurs

5. **Régime foncier réel** complet avec déficit foncier
6. **Amortissement LMNP** par composants avec durées
7. **Réintégration amortissements** à la revente
8. **Reste à vivre** dans l'analyse HCSF
9. **Alertes DPE** pour passoires énergétiques
10. **Projections pluriannuelles** (TRI, VAN, Multiple)
11. **Enrichissement patrimonial** et rendement fonds propres
12. **Scoring enrichi** avec plus de critères

## 🟡 Améliorations

13. Distinction ancien/neuf pour frais notaire
14. Part terrain non amortissable documentée
15. CSG déductible mentionnée
16. Hausse DMTO (5%) avec exemption primo-accédants
17. Barème IR 2025 actualisé