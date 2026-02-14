# Documentation des Formules de Calcul et Hypothèses

Ce document recense l'ensemble des formules de calcul, des constantes et des hypothèses utilisées dans le simulateur Renta Immo. Il est destiné à être audité par des spécialistes (experts-comptables, avocats fiscalistes) pour valider la justesse des estimations.

Dernière mise à jour : 10 Février 2026.

---

## 1. Constantes et Paramètres Par Défaut

Les valeurs suivantes sont utilisées par défaut ou comme références réglementaires (Source : `src/config/constants.ts`).

### 1.1. Paramètres Fiscaux (2025)

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| **Prélèvements Sociaux (Foncier)** | 17.2% | CSG/CRDS sur revenus fonciers (nom propre) |
| **Prélèvements Sociaux (LMNP)** | 18.6% | Hausse anticipée 2025 pour le LMNP |
| **Taux IS (Réduit)** | 15% | Jusqu'à 42 500 € de bénéfice |
| **Taux IS (Normal)** | 25% | Au-delà de 42 500 € |
| **Flat Tax** | 30% | Sur les dividendes (PFU) |

### 1.2. Régimes Micro (Abattements et Plafonds)

| Régime | Abattement | Plafond Recettes |
|--------|------------|------------------|
| **Micro-Foncier** (Loc. Nue) | 30% | 15 000 € |
| **Micro-BIC** (LMNP Std) | 50% | 77 700 € |
| **Micro-BIC** (Tourisme non classé) | 30% | 15 000 € |

### 1.3. Frais d'Acquisition (Notaire)

| Type de Bien | Taux Moyen Estimé |
|--------------|-------------------|
| **Ancien** | ~8.0% |
| **Neuf** | ~2.5% |

**Détail du calcul "Frais de Notaire Précis" (Ancien) :**
*   **Droits de Mutation (DMTO)** :
    *   Taxe Départementale : 4.50% (ou 5.00% si majoration)
    *   Taxe Communale : 1.20%
    *   Frais d'Assiette : 2.37% du montant DMTO
*   **Contribution de Sécurité Immobilière (CSI)** : 0.1% du prix
*   **Émoluments du Notaire** (TVA 20% incluse) selon barème progressif :
    *   0 - 6 500 € : 3.870%
    *   6 500 - 17 000 € : 1.596%
    *   17 000 - 60 000 € : 1.064%
    *   > 60 000 € : 0.799%
*   **Débours/Frais divers** : Forfait de 1 200 €

### 1.4. Amortissement (Comptable / Fiscal)

Utilisé pour les régimes Réel (LMNP et SCI IS).

**Ventilation par défaut :**
*   **Terrain** : 15% (Non amortissable). *Note : Variable selon le type de bien (Appartement 10%, Maison 20%).*
*   **Bâti** : 85%

**Durées d'amortissement (Mode Simplifié) :**
*   **Bâti** : 33 ans (Linear ~3%)
*   **Travaux** : 15 ans
*   **Mobilier** : 10 ans

**Calcul par Composants (Mode Expert) :**
*   Gros Œuvre (40%) : 50 ans
*   Façade/Toiture (20%) : 25 ans
*   Installations Techniques (20%) : 15 ans
*   Agencements (20%) : 10 ans

### 1.5. Hypothèses de Projection

*   **Inflation Loyers** : +2.0% / an
*   **Inflation Charges** : +2.5% / an
*   **Revalorisation du Bien** : +1.5% / an

---

## 2. Formules Financières de Base

### 2.1. Mensualité du Crédit
Formule standard PMT.
```typescript
Mensualité = (Capital * TauxMensuel) / (1 - (1 + TauxMensuel)^(-Mois))
```
*Avec TauxMensuel = TauxAnnuel / 12.*

### 2.2. Coût Total Acquisition
```
Coût Total = Prix Achat + Frais Notaire + Montant Travaux + Frais Bancaires (Dossier/Garantie)
```
*Note : C'est la base de calcul pour la rentabilité nette.*

### 2.3. Cashflow
```
Cashflow Net = Loyer Mensuel - Charges Exploitation - Mensualité Crédit - Impôts Mensualisés
```

---

## 3. Indicateurs de Rentabilité

### 3.1. Rentabilité Brute
```
Rentabilité Brute = (Loyer Annuel / Prix Achat) * 100
```

### 3.2. Rentabilité Nette (avant impôts)
```
Rentabilité Nette = ((Loyer Annuel - Charges Annuelles) / Coût Total Acquisition) * 100
```
*Charges Annuelles = Taxe foncière + Charges Copro + Assurances (PNO/GLI) + Frais Gestion + Entretien.*

### 3.3. Rentabilité Nette-Nette (après impôts)
```
Rentabilité Nette-Nette = (Revenu Net Après Impôts / Coût Total Acquisition) * 100
```

---

## 4. Calculs Fiscaux Détaillés

Le simulateur compare 5 régimes.

### 4.1. Location Nue - Micro-Foncier
*   **Condition** : Revenus < 15 000 €
*   **Base Imposable** : 70% des Revenus Bruts (Abattement 30%)
*   **Impôt** = (Base * TMI) + (Base * 17.2%)

### 4.2. Location Nue - Réel
*   **Déductibilité** : Charges réelles + Intérêts d'emprunt + Assurance emprunteur
*   **Déficit Foncier** :
    *   Déficit hors intérêts imputable sur le revenu global jusqu'à **10 700 €**.
    *   L'excédent (et la part liée aux intérêts) est reportable sur les revenus fonciers des **10 années suivantes**.
*   **Impôt** = (Résultat Foncier Net * TMI) + (Résultat Foncier Net * 17.2%)

### 4.3. LMNP - Micro-BIC
*   **Condition** : Revenus < 77 700 €
*   **Base Imposable** : 50% des Revenus Bruts (Abattement 50%)
*   **Impôt** = (Base * TMI) + (Base * 18.6%*)
    *   *Note : Taux PS LMNP aligné préventivement à 18.6% (projet LF).*

### 4.4. LMNP - Réel
*   **Déductibilité** : Charges réelles + Intérêts.
*   **Amortissement** : Déductible des bénéfices, mais **ne peut pas créer de déficit**. L'excédent est reportable sans limite de durée (ARD).
*   **Base Imposable** = MAX(0 ; Recettes - Charges - Amortissement Déductible)
*   **Impôt** = (Base * TMI) + (Base * 18.6%)

### 4.5. SCI à l'IS
*   **Amortissement** : Déductible en charge comptable (peut créer un déficit).
*   **Résultat Comptable** = Recettes - Charges - Amortissement
*   **Impôt Société (IS)** :
    *   15% sur la part < 42 500 €
    *   25% au-delà
*   **Dividendes** (Optionnel) : Si distribution, application de la **Flat Tax (30%)** sur le net versé.

### 4.6. Plus-Values Immobilières (Revente)

#### Particuliers (IR) - Location Nue & LMNP
*   **Abattements Durée de Détention** :
    *   IR : Progressif, exonération totale après **22 ans**.
    *   PS : Progressif, exonération totale après **30 ans**.
*   **Calcul** : Prix de Vente - Prix d'Achat (Forfait travaux/frais possible).
*   **Spécificité LMNP (LF 2025)** : Réintégration des amortissements dans le calcul de la Plus-Value (comme pour les pro). Le simulateur applique cette règle conservatrice.

#### SCI à l'IS
*   **Calcul** : Prix de Vente - Valeur Nette Comptable (VNC).
*   *VNC = Prix Achat - Amortissements Cumulés.*
*   La totalité de la Plus-Value (qui inclut donc les amortissements pratiqués) est ajoutée au résultat de l'exercice et imposée à l'IS (15%/25%).
*   + Flat Tax si sortie de l'argent vers les associés.

---

## 5. Analyse HCSF (Haut Conseil de Stabilité Financière)

### 5.1. Règles
*   **Taux d'endettement max** : 35%
*   **Durée max** : 25 ans

### 5.2. Calcul du Taux d'Endettement
```
Taux = Charges Totales Mensuelles / Revenus Totaux Mensuels
```
*   **Revenus Locatifs** : Pondérés à **70%** (pour compenser vacances/impayés).
*   **Revenus LMNP** : Également pondérés lors de l'analyse bancaire standard.

### 5.3. Capacité d'Emprunt Résiduelle
Montant théorique empruntable sur 20 ans à 3.5% avec la marge de manœuvre restante (35% des revenus - charges actuelles).

---

## 6. Projections Financières

Le simulateur projette les flux de trésorerie année par année.
*   Les déficits reportables sont gérés en FIFO (First In, First Out) avec expiration à 10 ans.
*   Le **TRI (Taux de Rendement Interne)** est calculé sur les flux de trésorerie nets d'impôts + la valeur nette de revente à terme (après impôt sur la plus-value).

---

## 7. Système de Scoring et Recommandations

Le simulateur attribue une **note globale sur 100** pour évaluer la qualité du projet.
Ce score est calculé à partir d'une **base de 40 points**, ajustée selon les critères suivants :

### 7.1. Calcul du Score Global
*   **Base** : 40 points
*   **Ajustement Cashflow** (-20 à +20 pts) :
    *   < -200 €/mois : -20 pts
    *   > +200 €/mois : +20 pts
    *   Interpolation linéaire entre les deux bornes.
*   **Ajustement Rentabilité Nette-Nette** (-15 à +20 pts) :
    *   < 0% : -15 pts
    *   > 7% : +20 pts
    *   Interpolation linéaire (Neutre entre 3% et 7%).
*   **Ajustement HCSF** (-25 à +20 pts) :
    *   Taux d'endettement <= 25% : +20 pts
    *   Non conforme (> 35%) : Sanction pouvant aller jusqu'à -25 pts.
*   **Ajustement DPE** (Diagnostic de Performance Énergétique) :
    *   A ou B : +5 pts
    *   C ou D : 0 pt
    *   E : -3 pts
    *   F ou G : -10 pts
*   **Ajustement Ratio Prix/Loyer** (-5 à +10 pts) :
    *   Ratio <= 15 (Très bon marché) : +10 pts
    *   Ratio > 25 (Très cher) : -5 pts
*   **Ajustement Reste à Vivre** (-10 à +5 pts) :
    *   >= 1 500 € : +5 pts
    *   < 800 € : -10 pts

**Échelle d'évaluation :**
*   **Excellent** : 80 - 100
*   **Bon** : 60 - 79
*   **Moyen** : 40 - 59
*   **Faible** : 0 - 39

### 7.2. Impact DPE (Réglementation)
Le simulateur intègre les interdictions de location (Loi Climat et Résilience) :
*   **Classe G** : Interdite depuis 2025 + Gel des Loyers.
*   **Classe F** : Interdite dès 2028 + Gel des Loyers.
*   **Classe E** : Interdite dès 2034.

### 7.3. Logique des Recommandations
Une recommandation est classée **Haute Priorité** si :
*   Le Cashflow est négatif (< 0).
*   L'endettement dépasse le seuil HCSF (35%).
*   Le bien est une passoire thermique (F ou G).
*   Le régime fiscal est inadapté (ex: Micro-Foncier avec >15k€ de revenus).

---

## 8. Règles de Validation Métier

Des règles strictes sont appliquées pour garantir la cohérence des calculs :

*   **Apport Maximum** : L'apport personnel ne peut pas excéder le prix d'achat du bien.
*   **Financement 110%** : Une alerte est levée si l'apport est de 0€ (financement des frais annexes par la banque plus difficile).
*   **SCI** : Une SCI doit obligatoirement comporter au moins un associé déclaré, et la somme des parts doit faire exactement 100%.
