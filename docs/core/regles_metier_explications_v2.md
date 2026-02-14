# Documentation des Formules de Calcul et Hypothèses — v2.0

Ce document recense l'ensemble des formules de calcul, des constantes et des hypothèses utilisées dans le simulateur Renta Immo. Il est destiné à être audité par des spécialistes (experts-comptables, avocats fiscalistes) pour valider la justesse des estimations.

**Dernière mise à jour : 14 Février 2026.**
**Auteur de la révision v2.0 :** Audit interne + relecture pro immobilier + vérification réglementaire LFI 2025 / Loi Le Meur.

> **Note aux développeurs :** Ce document constitue la source de vérité pour toutes les règles métier du simulateur. La Section 8 liste les variables à exposer dans une page de configuration back-office. La Section 9 est le changelog structuré des actions à mener, priorisées et prêtes à découper en Epics/Stories.

---

## 1. Constantes et Paramètres Par Défaut

Les valeurs suivantes sont utilisées par défaut ou comme références réglementaires (Source : `src/config/constants.ts`).

### 1.1. Paramètres Fiscaux (2025)

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| **Prélèvements Sociaux (Foncier / PV)** | 17.2% | CSG/CRDS sur revenus fonciers (nom propre) et sur les plus-values immobilières |
| **Prélèvements Sociaux (LMNP BIC)** | 18.6% | Taux applicable aux revenus BIC des LMNP (LFSS 2026, applicable aux revenus 2025) |
| **Taux IS (Réduit)** | 15% | Jusqu'à 42 500 € de bénéfice |
| **Taux IS (Normal)** | 25% | Au-delà de 42 500 € |
| **Flat Tax** | 30% | Sur les dividendes (PFU) |

> ⚠️ **Distinction critique :** Le taux de 18,6 % s'applique uniquement aux **revenus locatifs BIC** des LMNP. Les **plus-values immobilières** des particuliers (y compris LMNP) restent soumises aux PS au taux de **17,2 %**. Ne pas mélanger ces deux taux dans les calculs est impératif.

### 1.2. Régimes Micro (Abattements et Plafonds) — MIS À JOUR LFI 2025 / LOI LE MEUR

> ⚠️ **Mise à jour majeure (Loi Le Meur, 19 nov. 2024, applicable revenus 2025) :** Le tableau ci-dessous remplace l'ancien tableau à deux lignes. Il distingue désormais trois sous-catégories pour le micro-BIC.

| Régime | Abattement | Plafond Recettes | Évolution |
|--------|------------|------------------|-----------|
| **Micro-Foncier** (Loc. Nue) | 30% | 15 000 € | Inchangé |
| **Micro-BIC — LMNP Classique** (longue durée) | 50% | 77 700 € | Inchangé |
| **Micro-BIC — Tourisme Classé** / Chambres d'hôtes | 50% | 77 700 € | ⬇️ Ancien taux : 71% |
| **Micro-BIC — Tourisme Non Classé** | 30% | 15 000 € | ⬇️ Ancien taux : 50%, plafond 77 700 € |

> **Conséquence pour le simulateur :** La section "Régime LMNP Micro-BIC" doit distinguer le type de location (longue durée / tourisme classé / tourisme non classé). Un menu déroulant ou des boutons radio devront permettre cette sélection. Au-delà du plafond de 15 000 €, le tourisme non classé bascule **automatiquement** au régime réel.

### 1.3. Frais d'Acquisition (Notaire)

| Type de Bien | Taux Moyen Estimé |
|--------------|-------------------|
| **Ancien** | ~8.0% |
| **Neuf (VEFA)** | ~2.5% |

> **Note VEFA :** Dans le neuf, la cuisine et le mobilier sont souvent à prévoir en supplément (5 000 € à 15 000 € selon la surface). Ces postes ont une fiscalité distincte (amortissement mobilier 10 ans). Le simulateur doit permettre de saisir un poste "Mobilier/Équipement" séparé du prix d'achat.

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
*   **Bâti** : 33 ans (Linéaire ~3%)
*   **Travaux** : 15 ans
*   **Mobilier** : 10 ans

**Calcul par Composants (Mode Expert) :**
*   Gros œuvre (40%) : 50 ans
*   Façade/Toiture (20%) : 25 ans
*   Installations Techniques (20%) : 15 ans
*   Agencements (20%) : 10 ans

### 1.5. Hypothèses de Projection

*   **Inflation Loyers** : +2.0% / an
    > ⚠️ **Conditionné à la classe DPE :** Les biens classés F ou G (gel des loyers depuis 2022) et E (gel à venir) ne peuvent pas se voir appliquer ce taux de revalorisation automatiquement. Voir Section 7.2 pour la logique conditionnelle.
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
Coût Total = Prix Achat + Frais Notaire + Montant Travaux + Mobilier/Équipement + Frais Bancaires (Dossier/Garantie)
```
*Note : C'est la base de calcul pour la rentabilité nette. Le poste "Mobilier/Équipement" est désormais explicitement séparé pour permettre une fiscalité distincte (amortissement 10 ans).*

### 2.3. Revenus Bruts Corrigés (NOUVEAU)

> ⚠️ **Correction v2.0 :** Le simulateur utilisait jusqu'ici le "Loyer Annuel" brut dans les calculs de cashflow et de rentabilité nette. Cette approche surestime les performances car elle ignore la vacance locative structurelle. La formule corrigée est :

```
Revenus Bruts Annuels = Loyer Mensuel × (12 × Taux_Occupation)
```
*Avec `Taux_Occupation` (défaut : 92%, soit ~4 semaines de vacance/an). Ce paramètre doit être configurable dans l'interface utilisateur.*

Formule alternative avec saisie en semaines :
```
Revenus Bruts Annuels = Loyer Mensuel × ((52 - Semaines_Vacance) / 52) × 12
```

| Type de marché | Vacance suggérée | Taux d'occupation |
|----------------|------------------|--------------------|
| Zone très tendue (Paris, Lyon centre) | 1-2 semaines | 96-98% |
| Zone tendue (grande ville) | 3-4 semaines | 92-94% |
| Zone standard | 4-6 semaines | 88-92% |
| Zone détendue / saisonnière | 6-10 semaines | 80-88% |

### 2.4. Cashflow Net
```
Cashflow Net = Revenus Bruts Annuels (corrigés) / 12 - Charges Exploitation Mensuelles - Mensualité Crédit - Impôts Mensualisés - CFE Mensuelle
```
*Voir Section 3.2 pour la composition des Charges Exploitation.*

---

## 3. Indicateurs de Rentabilité

### 3.1. Rentabilité Brute
```
Rentabilité Brute = (Loyer Mensuel × 12 / Prix Achat) × 100
```
*Note : Utilise le loyer "facial" sans vacance, conformément à l'usage du marché pour cette métrique.*

### 3.2. Rentabilité Nette (avant impôts) — MIS À JOUR

```
Rentabilité Nette = ((Revenus Bruts Corrigés - Charges Annuelles Totales) / Coût Total Acquisition) × 100
```

**Charges Annuelles Totales (composition complète) :**
*   Taxe foncière
*   Charges de copropriété (part non récupérable)
*   Assurance PNO (Propriétaire Non Occupant)
*   Assurance GLI (Garantie Loyers Impayés) — optionnel
*   Frais de gestion locative — optionnel
*   Entretien courant / provisions
*   **CFE (Cotisation Foncière des Entreprises)** ← *Ajout v2.0 — LMNP uniquement*
*   **Frais de comptabilité / expert-comptable** ← *Ajout v2.0 — LMNP Réel uniquement*

### 3.3. Rentabilité Nette-Nette (après impôts)
```
Rentabilité Nette-Nette = (Revenu Net Après Impôts / Coût Total Acquisition) × 100
```

---

## 4. Calculs Fiscaux Détaillés

Le simulateur compare 5 régimes.

### 4.1. Location Nue - Micro-Foncier
*   **Condition** : Revenus < 15 000 €
*   **Base Imposable** : 70% des Revenus Bruts (Abattement 30%)
*   **Impôt** = (Base × TMI) + (Base × 17.2%)

**Déficit Foncier (non applicable en Micro-Foncier, mais documenté pour le Réel) :**
*   Plafond standard d'imputation sur le revenu global : **10 700 €/an**
*   **Plafond majoré temporaire** : **21 400 €/an** pour les dépenses de rénovation énergétique permettant de passer d'une classe E, F ou G à une classe A, B, C ou D. Conditions : devis accepté après le 5 novembre 2022, travaux payés entre le 1er janvier 2023 et le **31 décembre 2025**. ← *Ajout v2.0*
*   L'excédent (et la part liée aux intérêts) est reportable sur les revenus fonciers des **10 années suivantes** (gestion FIFO).

### 4.2. Location Nue - Réel
*   **Déductibilité** : Charges réelles + Intérêts d'emprunt + Assurance emprunteur
*   **Déficit Foncier** :
    *   Déficit hors intérêts imputable sur le revenu global jusqu'à **10 700 €** (ou **21 400 €** si travaux de rénovation énergétique éligibles jusqu'au 31/12/2025).
    *   L'excédent (et la part liée aux intérêts) est reportable sur les revenus fonciers des **10 années suivantes**.
*   **Impôt** = (Résultat Foncier Net × TMI) + (Résultat Foncier Net × 17.2%)

### 4.3. LMNP - Micro-BIC — MIS À JOUR

*   **Trois sous-catégories** (voir tableau Section 1.2) :
    *   LMNP Classique (longue durée) : Abattement 50%, plafond 77 700 €
    *   Tourisme Classé / Chambres d'hôtes : Abattement 50%, plafond 77 700 €
    *   Tourisme Non Classé : Abattement 30%, plafond 15 000 €
*   **Base Imposable** : Revenus Bruts × (1 - Taux_Abattement)
*   **Impôt** = (Base × TMI) + (Base × 18.6%)
*   **Important** : En Micro-BIC, **aucune charge réelle ne peut être déduite**, y compris la CFE. Celle-ci est un coût net supporté intégralement par l'investisseur.
*   **Réintégration des amortissements en plus-value** : Non concerné (seul le régime Réel pratique des amortissements).

### 4.4. LMNP - Réel — MIS À JOUR

*   **Déductibilité** : Charges réelles + Intérêts + **CFE** + **Frais de comptabilité** (100% déductibles).
*   **Amortissement** : Déductible des bénéfices, mais **ne peut pas créer de déficit**. L'excédent est reportable sans limite de durée (ARD - Amortissements Reportables Différés).
*   **Base Imposable** = MAX(0 ; Recettes - Charges - Amortissement Déductible)
*   **Impôt** = (Base × TMI) + (Base × 18.6%)
*   **Frais de comptabilité** : Déductibles en charge à 100%. ← *Ajout v2.0*
    > ⚠️ **Suppression de la réduction d'impôt OGA/CGA** : Depuis la LFI 2025 (applicable aux revenus 2025, déclaration 2026), la réduction d'impôt de 915 € (2/3 des frais de compta, plafonnée) liée à l'adhésion à un Centre de Gestion Agréé **est définitivement supprimée**. Ne pas implémenter ni documenter cet avantage dans le simulateur. Les frais restent déductibles en charge, mais il n'y a plus de réduction fiscale séparée.

### 4.5. SCI à l'IS
*   **Amortissement** : Déductible en charge comptable (peut créer un déficit).
*   **Résultat Comptable** = Recettes - Charges - Amortissement
*   **Impôt Société (IS)** :
    *   15% sur la part < 42 500 €
    *   25% au-delà
*   **Dividendes** (Optionnel) : Si distribution, application de la **Flat Tax (30%)** sur le net versé.

### 4.6. Plus-Values Immobilières (Revente) — MIS À JOUR

#### Particuliers (IR) — Location Nue & LMNP

**Formule de calcul de la plus-value brute :**

```
PV Brute = Prix de Vente - Prix d'Acquisition Corrigé

Prix d'Acquisition Corrigé = Prix d'Achat
  + Frais d'Acquisition (réels ou forfait 7.5%)   ← Ajout v2.0
  + Travaux (réels ou forfait 15% si détention > 5 ans)  ← Ajout v2.0
  - Amortissements réintégrés (LMNP Réel uniquement, hors mobilier)  ← LFI 2025
```

> ⚠️ **Ordre d'application obligatoire (précision DGFiP mars 2025)** : Les majorations forfaitaires (7,5 % et 15 %) doivent être appliquées **AVANT** de soustraire les amortissements. Inverser cet ordre surestime l'impôt sur la plus-value.

**Détail LMNP Réel — Réintégration des amortissements (LFI 2025) :**
*   **Date d'application** : ventes réalisées à partir du **15 février 2025**.
*   **Périmètre** : Uniquement les amortissements du **bâti et des travaux**. Le mobilier n'est pas réintégré.
*   **Exception** : Les résidences de services (résidences étudiantes, résidences seniors, EHPAD) sont **exemptées** de la réintégration.
*   **LMNP Micro-BIC** : Non concerné (pas d'amortissements pratiqués dans ce régime).
*   **Formule** :
    ```
    PV imposable = Prix de Vente - (Prix d'Achat + Frais [réels ou forfait 7.5%] + Travaux [réels ou forfait 15%] - Amortissements bâti déduits)
    ```

**Abattements pour durée de détention — Barème COMPLET (Ajout v2.0) :**

*Impôt sur le Revenu (taux 19%) :*

| Durée de détention | Abattement IR par an | Abattement cumulé |
|--------------------|----------------------|-------------------|
| Moins de 6 ans | 0% | 0% |
| De la 6e à la 21e année | 6% / an | 6% à 96% |
| 22e année | 4% | 100% → **Exonération totale IR** |

*Prélèvements Sociaux (taux 17,2%) :*

| Durée de détention | Abattement PS par an | Abattement cumulé |
|--------------------|----------------------|-------------------|
| Moins de 6 ans | 0% | 0% |
| De la 6e à la 21e année | 1.65% / an | 1.65% à 26.4% |
| 22e année | 1.60% | 28% |
| De la 23e à la 30e année | 9% / an | 37% à 100% → **Exonération totale PS** |

> Le simulateur doit calculer le taux d'abattement applicable à l'**année de simulation de la revente** en appliquant ce barème progressif, et non simplement tester si on dépasse 22 ou 30 ans.

**Surtaxe sur les plus-values élevées (Ajout v2.0) :**

Si la PV nette imposable (après abattements, pour le calcul IR) dépasse **50 000 €**, une surtaxe s'applique :

| PV nette imposable | Surtaxe |
|--------------------|---------|
| De 50 001 € à 60 000 € | 2% |
| De 60 001 € à 100 000 € | 3% |
| De 100 001 € à 110 000 € | 4% |
| De 110 001 € à 150 000 € | 5% |
| > 150 000 € | 6% |

> Cette surtaxe s'ajoute au taux IR de 19%. Elle ne s'applique pas aux plus-values exonérées (résidence principale) ni aux terrains à bâtir. À intégrer dans le calcul du TRI pour les investissements à forte valorisation.

**Taux global d'imposition sur la PV :**
```
Impôt PV Total = PV Nette IR × (19% + Surtaxe éventuelle) + PV Nette PS × 17.2%
```

#### SCI à l'IS
*   **Calcul** : Prix de Vente - Valeur Nette Comptable (VNC).
*   *VNC = Prix Achat - Amortissements Cumulés.*
*   La totalité de la Plus-Value est ajoutée au résultat de l'exercice et imposée à l'IS (15%/25%).
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
*   **Revenus Locatifs** : Pondérés à **70%** (pour compenser vacances/impayés). *Ce taux est une pratique bancaire courante, non une règle HCSF réglementaire. Certains établissements retiennent 80% voire 90% en présence d'une GLI. Ce paramètre doit être ajustable (voir Section 8).*
*   **Revenus LMNP** : Également pondérés lors de l'analyse bancaire standard.

### 5.3. Capacité d'Emprunt Résiduelle
Montant théorique empruntable sur 20 ans à 3.5% avec la marge de manœuvre restante (35% des revenus - charges actuelles).

---

## 6. Projections Financières

Le simulateur projette les flux de trésorerie année par année.
*   Les déficits reportables sont gérés en FIFO (First In, First Out) avec expiration à 10 ans.
*   Le **TRI (Taux de Rendement Interne)** est calculé sur les flux de trésorerie nets d'impôts + la valeur nette de revente à terme (après impôt sur la plus-value, incluant la surtaxe le cas échéant).
*   La **valeur de revente simulée** intègre la revalorisation annuelle du bien (+1.5%/an par défaut, ajustable).
*   **Conditionnel DPE** : Le taux de revalorisation et d'inflation des loyers doivent être mis à zéro (ou réduits) pour les biens F, G et (dès 2034) E, en cohérence avec le gel des loyers et les interdictions de location.

---

## 7. Système de Scoring et Recommandations

Le simulateur attribue une **note globale sur 100** pour évaluer la qualité du projet.
Ce score est calculé à partir d'une **base de 40 points**, ajustée selon les critères suivants :

### 7.1. Calcul du Score Global — AMÉLIORÉ v2.0

> **Évolution v2.0 :** Introduction de deux profils de scoring distincts pour éviter de pénaliser des stratégies patrimoniales légitimes.

**Profil "Rentier" (priorité Cashflow)** — comportement existant :
*   **Base** : 40 points
*   **Ajustement Cashflow** (-20 à +20 pts) :
    *   < -200 €/mois : -20 pts
    *   > +200 €/mois : +20 pts
    *   Interpolation linéaire entre les deux bornes.
*   **Ajustement Rentabilité Nette-Nette** (-15 à +20 pts) :
    *   < 0% : -15 pts
    *   > 7% : +20 pts
    *   Interpolation linéaire (Neutre entre 3% et 7%).

**Profil "Patrimonial" (priorité Capitalisation)** — nouveau :
*   **Base** : 40 points
*   **Ajustement Cashflow** atténué (-10 à +10 pts) : Un cashflow légèrement négatif est moins pénalisé.
*   **Ajustement TRI sur 15 ans** (-15 à +20 pts) :
    *   TRI < 3% : -15 pts
    *   TRI > 8% : +20 pts
*   **Ajustement Rentabilité Nette-Nette** (-10 à +15 pts).

*Les ajustements HCSF, DPE, Ratio Prix/Loyer et Reste à Vivre sont identiques dans les deux profils :*

*   **Ajustement HCSF** (-25 à +20 pts) :
    *   Taux d'endettement <= 25% : +20 pts
    *   Non conforme (> 35%) : Sanction pouvant aller jusqu'à -25 pts.
*   **Ajustement DPE** :
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

### 7.2. Impact DPE (Réglementation) — Conditionnel sur l'inflation des loyers

Le simulateur intègre les interdictions de location (Loi Climat et Résilience) et conditionne le taux d'inflation des loyers :

| Classe DPE | Statut | Inflation loyers applicable |
|------------|--------|-----------------------------|
| A, B, C | Autorisée | +2.0%/an (défaut) |
| D | Autorisée | +2.0%/an (défaut) |
| E | Interdite dès 2034 | +2.0%/an jusqu'en 2033, puis 0% |
| F | Interdite dès 2028 + Gel des loyers | **0%** (gel actif depuis juil. 2022) |
| G | Interdite depuis 2025 + Gel des loyers | **0%** (gel actif depuis juil. 2022) |

> **Logique de projection** : Pour un bien F ou G, le simulateur doit afficher une alerte forte et appliquer 0% de revalorisation des loyers dès la première année. Pour un bien E, appliquer 0% à partir de l'année 2034 dans la projection.

### 7.3. Logique des Recommandations
Une recommandation est classée **Haute Priorité** si :
*   Le Cashflow est négatif (< 0).
*   L'endettement dépasse le seuil HCSF (35%).
*   Le bien est une passoire thermique (F ou G).
*   Le régime fiscal est inadapté (ex: Micro-Foncier avec >15k€ de revenus, ou Tourisme Non Classé Micro-BIC avec >15k€).
*   *(Nouveau)* Les recettes LMNP approchent du seuil de basculement LMP (23 000 €).

---

## 8. Règles de Validation Métier

Des règles strictes sont appliquées pour garantir la cohérence des calculs :

*   **Apport Maximum** : L'apport personnel ne peut pas excéder le prix d'achat du bien.
*   **Financement 110%** : Une alerte est levée si l'apport est de 0€ (financement des frais annexes par la banque plus difficile).
*   **SCI** : Une SCI doit obligatoirement comporter au moins un associé déclaré, et la somme des parts doit faire exactement 100%.
*   *(Nouveau)* **Seuil LMP** : Si les recettes locatives LMNP saisies dépassent 23 000 €, afficher un avertissement indiquant que le statut LMP peut s'appliquer et que les règles fiscales (notamment sur les plus-values professionnelles) sont différentes.
*   *(Nouveau)* **CFE non applicable** : Si les recettes annuelles sont < 5 000 €, la CFE est exonérée. Ne pas l'inclure dans les charges dans ce cas.

---

---

# SECTION 9 — Nouveautés, Corrections et Compléments v2.0

> Cette section documente tous les changements identifiés lors de l'audit réglementaire de février 2026. Elle est structurée pour servir de base à la création des **Epics, Sprints et User Stories** par l'équipe de développement.

---

## 9.1. Corrections Critiques (Bugs / Erreurs de Calcul)

### CORR-01 — Formule Plus-Value LMNP : Ordre de calcul incorrect
**Priorité :** 🔴 Critique  
**Impact :** Surestime l'impôt sur la plus-value pour les détentions > 5 ans avec travaux.

**Problème actuel :** Le simulateur calcule `PV = Prix Vente - Prix Achat - Amortissements`, sans appliquer les majorations forfaitaires.

**Correction :**
```
Prix d'Acquisition Corrigé = Prix d'Achat
  + MAX(Frais_Acq_Réels, Prix_Achat × 7.5%)
  + MAX(Travaux_Réels, Prix_Achat × 15%) [si détention > 5 ans]
  - Amortissements_Bâti_Déduits [LMNP Réel uniquement, hors mobilier]

PV Brute = Prix de Vente - Prix d'Acquisition Corrigé
```

**Source :** Article 150 VB du CGI, précision DGFiP mars 2025.  
**Fichier concerné :** `src/calculators/plusvalue.ts`

---

### CORR-02 — Barème abattements plus-value : calcul approximatif
**Priorité :** 🔴 Critique  
**Impact :** Le TRI calculé sur revente à différentes années est inexact.

**Problème actuel :** Le simulateur teste uniquement les seuils de 22 ans (IR) et 30 ans (PS) sans appliquer le barème progressif annuel.

**Correction :** Implémenter les deux fonctions suivantes :

```typescript
function abattementIR(annees: number): number {
  if (annees < 6) return 0;
  if (annees <= 21) return (annees - 5) * 0.06;
  if (annees === 22) return 0.96 + 0.04; // = 1.00 → exonéré
  return 1.0;
}

function abattementPS(annees: number): number {
  if (annees < 6) return 0;
  if (annees <= 21) return (annees - 5) * 0.0165;
  if (annees === 22) return (16 * 0.0165) + 0.016;
  if (annees <= 30) return (16 * 0.0165) + 0.016 + (annees - 22) * 0.09;
  return 1.0;
}
```

**Fichier concerné :** `src/calculators/plusvalue.ts`

---

### CORR-03 — Surtaxe plus-value élevée manquante
**Priorité :** 🔴 Critique  
**Impact :** Sous-estime l'imposition sur les projets à forte valorisation (PV nette IR > 50 000 €).

**Correction :** Ajouter la fonction de calcul de la surtaxe après application des abattements IR :

```typescript
function surtaxePV(pvNetteIR: number): number {
  if (pvNetteIR <= 50000) return 0;
  if (pvNetteIR <= 60000) return pvNetteIR * 0.02;
  if (pvNetteIR <= 100000) return pvNetteIR * 0.03;
  if (pvNetteIR <= 110000) return pvNetteIR * 0.04;
  if (pvNetteIR <= 150000) return pvNetteIR * 0.05;
  return pvNetteIR * 0.06;
}
```

**Fichier concerné :** `src/calculators/plusvalue.ts`

---

### CORR-04 — Micro-BIC Tourisme : une seule catégorie au lieu de trois
**Priorité :** 🔴 Critique  
**Impact :** Les investisseurs en location saisonnière (Airbnb) voient leurs impôts sous-estimés.

**Problème actuel :** Le simulateur applique un taux unique de 50% et un plafond de 77 700 € pour tout LMNP micro-BIC.

**Correction :** Distinguer trois sous-types dans le formulaire et les calculs :

| Enum `TypeLMNP` | Abattement | Plafond |
|-----------------|------------|---------|
| `CLASSIQUE_LONGUE_DUREE` | 50% | 77 700 € |
| `TOURISME_CLASSE` | 50% | 77 700 € |
| `TOURISME_NON_CLASSE` | 30% | 15 000 € |

**Fichier concerné :** `src/config/constants.ts`, `src/calculators/lmnp.ts`, `src/components/RegimeFiscalSelector.tsx`

---

### CORR-05 — PS Plus-Value : taux 18,6 % appliqué par erreur
**Priorité :** 🔴 Critique  
**Impact :** Surestime l'imposition à la revente pour les LMNP.

**Problème actuel :** Le taux de 18,6 % (correct pour les revenus BIC courants) est potentiellement appliqué aux plus-values immobilières.

**Correction :** Les plus-values immobilières restent soumises aux PS au taux de **17,2 %**, même pour les LMNP. Vérifier et corriger partout où `tauxPS` est utilisé dans le module plus-value.

```typescript
const TAUX_PS_REVENUS_LMNP = 0.186;   // Revenus locatifs BIC
const TAUX_PS_PLUSVALUE = 0.172;       // Plus-values immobilières (tous régimes)
```

**Fichier concerné :** `src/config/constants.ts`, `src/calculators/plusvalue.ts`

---

### CORR-06 — Vacance locative absente des calculs de cashflow et rentabilité
**Priorité :** 🔴 Critique  
**Impact :** Surestime systématiquement le cashflow et la rentabilité nette.

**Problème actuel :** `CashflowNet = Loyer_Mensuel - Charges - Mensualité - Impôts`. Le loyer mensuel est utilisé tel quel (12 mois pleins implicites).

**Correction :** Introduire un paramètre `tauxOccupation` (défaut : 0.92, soit ~4 semaines de vacance/an) et l'appliquer systématiquement :

```typescript
const revenusBrutsAnnuels = loyerMensuel * 12 * tauxOccupation;
```

Ce paramètre doit être :
- Saisi par l'utilisateur dans le formulaire (slider ou champ texte avec %)
- Pré-rempli avec une valeur selon la zone (voir tableau Section 2.3)
- Clairement expliqué dans une infobulle

**Fichier concerné :** `src/calculators/cashflow.ts`, `src/calculators/rentabilite.ts`

---

### CORR-07 — Inflation loyers non conditionnée à la classe DPE
**Priorité :** 🟠 Important  
**Impact :** Projections à 20+ ans erronées pour les biens F/G.

**Correction :** Dans le moteur de projection annuelle :
```typescript
function tauxRevalorisation(dpe: string, annee: number): number {
  if (['F', 'G'].includes(dpe)) return 0; // Gel des loyers
  if (dpe === 'E' && annee >= 2034) return 0; // Interdiction future
  return INFLATION_LOYERS_DEFAULT; // 0.02
}
```

**Fichier concerné :** `src/calculators/projection.ts`

---

## 9.2. Manques Fonctionnels (Features manquantes)

### FEAT-01 — Ajout de la CFE dans les charges LMNP
**Priorité :** 🔴 Critique  
**Epic suggéré :** "Complétude des charges LMNP"

**Description :**  
La Cotisation Foncière des Entreprises est obligatoire pour tout LMNP (micro-BIC ou réel) dès que les recettes dépassent 5 000 €/an. Elle n'est actuellement pas intégrée dans les calculs.

**Règles métier :**
- Exonérée si recettes < 5 000 €/an (exonération automatique)
- Exonérée la **première année d'activité**
- Montant : variable selon la commune. Fourchettes nationales indicatives :
  - Recettes < 10 000 € → CFE entre 243 € et 542 €
  - Recettes 10 000 - 23 000 € → CFE entre 542 € et 1 000 €+ (selon commune)
- Déductible en charge au régime **Réel uniquement**
- En Micro-BIC : coût sec supporté intégralement (n'entre pas dans l'abattement)

**Implémentation suggérée :**
1. Ajouter un champ "CFE estimée" dans le formulaire (pré-rempli à 300 €/an, ajustable)
2. Afficher une infobulle : "Taxe locale obligatoire pour les LMNP. Vérifiez le montant exact auprès des impôts de votre commune."
3. Intégrer dans `ChargesAnnuellesLMNP` avec flag `deductibleReelSeulement: true`
4. En Micro-BIC : additionner directement au cashflow comme charge nette

**User Stories :**
- US-01a : En tant qu'investisseur LMNP, je veux voir la CFE dans le détail de mes charges annuelles
- US-01b : En tant que développeur, je veux que la CFE soit automatiquement exclue si recettes < 5 000 €
- US-01c : En tant qu'investisseur au Micro-BIC, je veux comprendre que la CFE est un coût non couvert par l'abattement forfaitaire

---

### FEAT-02 — Frais de comptabilité déductibles (LMNP Réel)
**Priorité :** 🟠 Important  
**Epic suggéré :** "Complétude des charges LMNP"

**Description :**  
En LMNP au régime réel, les frais d'expert-comptable sont déductibles à 100%. Ils ne sont actuellement pas modélisés.

**Règles métier :**
- Déductibles uniquement au régime Réel (pas au Micro-BIC)
- ❌ **Ne pas implémenter de réduction d'impôt de 915 € (supprimée par LFI 2025)**
- Montant typique : 300 € à 600 €/an (solution digitale) à 800 € - 1 500 €/an (cabinet comptable)
- Valeur par défaut suggérée : 500 €/an (ajustable)

**Implémentation suggérée :**
1. Ajouter un champ "Frais de comptabilité" dans les charges du régime Réel
2. Masquer ce champ en Micro-BIC
3. Ajouter une note : "La réduction d'impôt OGA/CGA a été supprimée par la loi de finances 2025. Ces frais sont déductibles en charge mais n'ouvrent plus droit à réduction d'impôt."

---

### FEAT-03 — Plafond déficit foncier majoré à 21 400 € (travaux énergétiques)
**Priorité :** 🟠 Important  
**Epic suggéré :** "Fiscalité Location Nue"

**Description :**  
Pour les travaux de rénovation énergétique permettant de sortir d'une passoire thermique (E/F/G → A/B/C/D), le plafond d'imputation du déficit sur le revenu global est doublé à 21 400 € pour les travaux payés entre le 1er janvier 2023 et le 31 décembre 2025.

**Règles métier :**
- Régime concerné : Location Nue Réel uniquement
- Conditions cumulatives :
  - Devis accepté après le 5 novembre 2022
  - Travaux payés entre 01/01/2023 et 31/12/2025
  - Le logement passe de classe E, F ou G à A, B, C ou D (DPE avant/après travaux requis)
- Plafond : 21 400 € au lieu de 10 700 €
- Ce dispositif expire après le 31/12/2025 → revenir à 10 700 € pour les années suivantes

**Implémentation suggérée :**
1. Ajouter une checkbox "Travaux de rénovation énergétique éligibles (E/F/G → A/B/C/D)"
2. Si cochée et si `anneeSimulation <= 2025` : appliquer `plafondDeficit = 21400`
3. Sinon : `plafondDeficit = 10700`
4. Afficher une alerte si la case est cochée et que l'année est > 2025 : "Ce dispositif a expiré le 31/12/2025."

---

### FEAT-04 — Réintégration amortissements LMNP en plus-value (LFI 2025)
**Priorité :** 🟠 Important  
**Epic suggéré :** "Plus-value LMNP 2025"  
*Note : Cette feature est partiellement documentée dans l'ancienne version. Les corrections et précisions sont ici.*

**Règles métier complémentaires :**
- Date d'entrée en vigueur : **15 février 2025** (pas le 1er janvier)
- Seuls les amortissements du **bâti et des travaux** sont réintégrés. Le mobilier ne l'est pas.
- Les **résidences de services** (étudiantes, seniors, EHPAD) sont **exemptées**
- Le Micro-BIC n'est pas concerné (pas d'amortissements)
- Les abattements pour durée de détention restent applicables sur la PV totale (y compris la partie réintégrée)

**Implémentation suggérée :**
1. Ajouter un champ `typeResidence` (standard / résidence de services)
2. Si `typeResidence === 'residenceDeServices'` : ne pas réintégrer les amortissements
3. Si `dateAcquisition < 15/02/2025` : appliquer la réintégration au prorata temporis ou dès la première revente après le 15/02/2025
4. Suivre séparément les amortissements mobilier (non réintégrés) et bâti/travaux (réintégrés)

---

### FEAT-05 — Avertissement seuil LMP
**Priorité :** 🟡 Utile  
**Epic suggéré :** "Conformité fiscale et alertes"

**Description :**  
Le statut LMP (Loueur Meublé Professionnel) s'applique dès que les recettes LMNP dépassent 23 000 €/an ET sont supérieures aux autres revenus du foyer. Les règles fiscales (notamment sur les plus-values) sont différentes.

**Implémentation :**  
Si `recettesLMNP > 20000` (seuil d'alerte à 20 000 € pour anticiper), afficher un bandeau d'alerte : "Vos revenus locatifs approchent du seuil LMP (23 000 €). Au-delà, le statut LMP s'applique avec des règles fiscales spécifiques. Consultez un conseiller fiscal."

---

### FEAT-06 — Scoring dual profil (Rentier / Patrimonial)
**Priorité :** 🟡 Utile  
**Epic suggéré :** "UX Scoring et recommandations"

**Description :**  
Le scoring actuel pénalise fortement le cashflow négatif, ce qui est inadapté aux investisseurs ayant une stratégie patrimoniale (capitalisation long terme, marché tendu). Implémenter deux modes de scoring.

**Implémentation suggérée :**
1. Ajouter un toggle en tête de la section Scoring : "Profil investisseur : Rentier / Patrimonial"
2. En mode Patrimonial : pondération cashflow atténuée, pondération TRI renforcée (voir Section 7.1)
3. Afficher une explication claire de la différence entre les deux profils dans une infobulle

---

### FEAT-07 — Paramètre taux d'occupation (vacance locative)
**Priorité :** 🔴 Critique (lié à CORR-06)  
**Epic suggéré :** "Paramètres de simulation"

**Description :**  
Permettre à l'utilisateur de définir son taux d'occupation annuel pour le calcul des revenus réels.

**Implémentation :**
1. Slider de 70% à 100% dans le formulaire, libellé "Taux d'occupation annuel"
2. Valeur par défaut : 92% (affichée avec mention "~4 semaines de vacance/an")
3. Tooltip avec les valeurs de référence selon la tension du marché (voir tableau Section 2.3)
4. Propagation de la valeur dans `revenusBrutsAnnuels = loyerMensuel × 12 × tauxOccupation`

---

### FEAT-08 — Pondération loyers HCSF ajustable
**Priorité :** 🟡 Utile  
**Epic suggéré :** "Paramètres HCSF"

**Description :**  
La pondération des loyers à 70% pour le calcul HCSF est une pratique bancaire, non une règle réglementaire. Certaines banques montent à 80-90% avec GLI.

**Implémentation :**
1. Champ configurable dans le formulaire HCSF (défaut : 70%)
2. Bouton "Avec GLI" qui passe automatiquement à 80%
3. Note explicative : "Ce taux est une pratique bancaire. Vérifiez avec votre conseiller."

---

---

# SECTION 10 — Variables Réglementaires Clés : Page de Configuration Back-Office

> Cette section liste toutes les **constantes réglementaires susceptibles d'évoluer** avec les lois de finances et les réglementations. L'équipe de développement doit créer une **page d'administration** permettant de modifier, désactiver ou versionner ces valeurs sans déploiement de code.

---

## 10.1. Objectif de la Page de Configuration

**Contexte :** Les lois de finances changent chaque année (parfois en cours d'année). Le simulateur Renta Immo doit pouvoir être mis à jour rapidement sans modifier le code source. Une page d'administration dédiée permettra à l'équipe métier de :

- Modifier les taux et plafonds fiscaux annuellement
- Désactiver des dispositifs temporaires expirés
- Activer de nouveaux dispositifs dès leur promulgation
- Versionner les paramètres par année fiscale (pour les projections historiques)

---

## 10.2. Variables à Exposer dans la Page de Configuration

### Bloc A — Taux Fiscaux Généraux

| Identifiant | Libellé | Valeur actuelle | Type | Configurable |
|-------------|---------|-----------------|------|--------------|
| `PS_REVENUS_FONCIERS` | Prélèvements sociaux — Revenus fonciers (loc. nue) | 17.2% | Pourcentage | ✅ |
| `PS_REVENUS_BIC_LMNP` | Prélèvements sociaux — Revenus BIC LMNP | 18.6% | Pourcentage | ✅ |
| `PS_PLUS_VALUES` | Prélèvements sociaux — Plus-values immobilières | 17.2% | Pourcentage | ✅ |
| `IR_TAUX_PLUS_VALUE` | Taux IR fixe — Plus-values immobilières | 19% | Pourcentage | ✅ |
| `IS_TAUX_REDUIT` | Taux IS réduit (SCI IS) | 15% | Pourcentage | ✅ |
| `IS_SEUIL_TAUX_REDUIT` | Seuil bénéfice taux IS réduit | 42 500 € | Montant | ✅ |
| `IS_TAUX_NORMAL` | Taux IS normal (SCI IS) | 25% | Pourcentage | ✅ |
| `FLAT_TAX_DIVIDENDES` | Flat Tax — Dividendes SCI | 30% | Pourcentage | ✅ |

### Bloc B — Régimes Micro (Abattements et Plafonds)

| Identifiant | Libellé | Valeur actuelle | Type | Configurable |
|-------------|---------|-----------------|------|--------------|
| `MICRO_FONCIER_ABATTEMENT` | Abattement Micro-Foncier | 30% | Pourcentage | ✅ |
| `MICRO_FONCIER_PLAFOND` | Plafond Micro-Foncier | 15 000 € | Montant | ✅ |
| `MICRO_BIC_CLASSIQUE_ABATTEMENT` | Abattement Micro-BIC LMNP classique | 50% | Pourcentage | ✅ |
| `MICRO_BIC_CLASSIQUE_PLAFOND` | Plafond Micro-BIC LMNP classique | 77 700 € | Montant | ✅ |
| `MICRO_BIC_TOURISME_CLASSE_ABATTEMENT` | Abattement Micro-BIC Tourisme classé | 50% | Pourcentage | ✅ |
| `MICRO_BIC_TOURISME_CLASSE_PLAFOND` | Plafond Micro-BIC Tourisme classé | 77 700 € | Montant | ✅ |
| `MICRO_BIC_TOURISME_NON_CLASSE_ABATTEMENT` | Abattement Micro-BIC Tourisme non classé | 30% | Pourcentage | ✅ |
| `MICRO_BIC_TOURISME_NON_CLASSE_PLAFOND` | Plafond Micro-BIC Tourisme non classé | 15 000 € | Montant | ✅ |

### Bloc C — Déficit Foncier

| Identifiant | Libellé | Valeur actuelle | Type | Configurable |
|-------------|---------|-----------------|------|--------------|
| `DEFICIT_FONCIER_PLAFOND_STANDARD` | Plafond déficit foncier — Standard | 10 700 € | Montant | ✅ |
| `DEFICIT_FONCIER_PLAFOND_ENERGIE` | Plafond déficit foncier — Rénovation énergétique | 21 400 € | Montant | ✅ |
| `DEFICIT_FONCIER_DATE_FIN_ENERGIE` | Date d'expiration du plafond majoré | 31/12/2025 | Date | ✅ |
| `DEFICIT_FONCIER_REPORT_DUREE` | Durée de report déficit sur revenus fonciers | 10 ans | Entier | ✅ |

### Bloc D — Plus-Values Immobilières

| Identifiant | Libellé | Valeur actuelle | Type | Configurable |
|-------------|---------|-----------------|------|--------------|
| `PV_ABATTEMENT_IR_DEBUT_ANNEE` | Début abattement IR (années de détention) | 6 | Entier | ✅ |
| `PV_ABATTEMENT_IR_TAUX_PAR_AN` | Taux abattement IR annuel (ans 6-21) | 6% | Pourcentage | ✅ |
| `PV_ABATTEMENT_IR_TAUX_AN22` | Taux abattement IR — 22e année | 4% | Pourcentage | ✅ |
| `PV_EXONERATION_IR_ANNEES` | Exonération totale IR (années) | 22 | Entier | ✅ |
| `PV_ABATTEMENT_PS_TAUX_ANS_6_21` | Taux abattement PS annuel (ans 6-21) | 1.65% | Pourcentage | ✅ |
| `PV_ABATTEMENT_PS_TAUX_AN22` | Taux abattement PS — 22e année | 1.60% | Pourcentage | ✅ |
| `PV_ABATTEMENT_PS_TAUX_ANS_23_30` | Taux abattement PS annuel (ans 23-30) | 9% | Pourcentage | ✅ |
| `PV_EXONERATION_PS_ANNEES` | Exonération totale PS (années) | 30 | Entier | ✅ |
| `PV_SURTAXE_SEUIL` | Seuil déclenchant la surtaxe PV élevée | 50 000 € | Montant | ✅ |
| `PV_FORFAIT_FRAIS_ACHAT` | Forfait frais d'acquisition PV | 7.5% | Pourcentage | ✅ |
| `PV_FORFAIT_TRAVAUX` | Forfait travaux PV (si détention > 5 ans) | 15% | Pourcentage | ✅ |
| `PV_FORFAIT_TRAVAUX_DUREE_MIN` | Durée min pour forfait travaux (années) | 5 | Entier | ✅ |

### Bloc E — LMNP Réel (Réintégration Amortissements)

| Identifiant | Libellé | Valeur actuelle | Type | Configurable |
|-------------|---------|-----------------|------|--------------|
| `LMNP_REINTEGRATION_AMORT_ACTIVE` | Réintégration amortissements en PV active | true | Booléen | ✅ |
| `LMNP_REINTEGRATION_DATE_ENTREE` | Date d'entrée en vigueur | 15/02/2025 | Date | ✅ |
| `LMNP_REINTEGRATION_EXCLURE_MOBILIER` | Exclure le mobilier de la réintégration | true | Booléen | ✅ |
| `LMNP_RESIDENCE_SERVICES_EXEMPTE` | Résidences de services exemptées | true | Booléen | ✅ |

### Bloc F — CFE (Cotisation Foncière des Entreprises)

| Identifiant | Libellé | Valeur actuelle | Type | Configurable |
|-------------|---------|-----------------|------|--------------|
| `CFE_SEUIL_EXONERATION` | Seuil exonération CFE (recettes annuelles) | 5 000 € | Montant | ✅ |
| `CFE_MONTANT_DEFAUT` | Montant CFE par défaut (estimation nationale) | 300 € | Montant | ✅ |
| `CFE_EXONERATION_PREMIERE_ANNEE` | Exonération automatique première année | true | Booléen | ✅ |

### Bloc G — Dispositifs Temporaires

> ⚠️ Ces variables contrôlent des dispositifs qui ont une date d'expiration connue. Un mécanisme d'alerte automatique (email ou dashboard admin) doit être déclenché 3 mois avant la date d'expiration.

| Identifiant | Libellé | Valeur | Expiration | Actif |
|-------------|---------|--------|------------|-------|
| `DEFICIT_ENERGIE_ACTIF` | Plafond majoré déficit foncier énergie | 21 400 € | 31/12/2025 | ⚠️ Expiré |
| `DPE_INTERDICTION_G` | Interdiction location classe G | Actif | 01/01/2025 | ✅ Actif |
| `DPE_INTERDICTION_F` | Interdiction location classe F | À venir | 01/01/2028 | ⏳ Planifié |
| `DPE_INTERDICTION_E` | Interdiction location classe E | À venir | 01/01/2034 | ⏳ Planifié |
| `REDUCTION_OGA_ACTIVE` | Réduction impôt adhésion OGA/CGA | Supprimée | 01/01/2025 | ❌ Supprimé |

### Bloc H — Hypothèses de Projection (Ajustables)

| Identifiant | Libellé | Valeur actuelle | Type | Configurable |
|-------------|---------|-----------------|------|--------------|
| `INFLATION_LOYERS_DEFAUT` | Inflation annuelle des loyers (défaut) | 2.0% | Pourcentage | ✅ |
| `INFLATION_CHARGES_DEFAUT` | Inflation annuelle des charges (défaut) | 2.5% | Pourcentage | ✅ |
| `REVALORISATION_BIEN_DEFAUT` | Revalorisation annuelle du bien (défaut) | 1.5% | Pourcentage | ✅ |
| `TAUX_OCCUPATION_DEFAUT` | Taux d'occupation par défaut | 92% | Pourcentage | ✅ |
| `HCSF_TAUX_MAX` | Taux d'endettement max HCSF | 35% | Pourcentage | ✅ |
| `HCSF_DUREE_MAX` | Durée max prêt HCSF (années) | 25 | Entier | ✅ |
| `HCSF_PONDERATION_LOYERS` | Pondération loyers locatifs pour HCSF | 70% | Pourcentage | ✅ |
| `HCSF_CAPACITE_EMPRUNT_TAUX` | Taux de référence capacité d'emprunt | 3.5% | Pourcentage | ✅ |
| `HCSF_CAPACITE_EMPRUNT_DUREE` | Durée de référence capacité d'emprunt | 20 ans | Entier | ✅ |
| `SEUIL_LMP_RECETTES` | Seuil de recettes pour basculement LMP | 23 000 € | Montant | ✅ |

---

## 10.3. Spécifications Techniques de la Page de Configuration

**Fonctionnalités attendues par l'équipe de développement :**

1. **Interface d'administration** accessible uniquement aux rôles `ADMIN` et `SUPER_ADMIN`
2. **Versioning** des paramètres par année fiscale : pouvoir recalculer une simulation historique avec les règles de l'année en question
3. **Audit log** : toute modification de paramètre doit être tracée (qui, quand, ancienne valeur, nouvelle valeur)
4. **Validation de cohérence** : empêcher des configurations incohérentes (ex. : plafond majoré < plafond standard)
5. **Alerte automatique** pour les dispositifs temporaires expirant dans les 90 jours
6. **Export JSON** des paramètres actifs pour documentation et intégration CI/CD
7. **Mode "Dry Run"** : simuler l'impact d'un changement de paramètre sur un ensemble de cas de test avant de l'activer en production

**Structure de données suggérée :**

```typescript
interface ConfigParam {
  id: string;            // Identifiant unique (ex: "PS_REVENUS_BIC_LMNP")
  label: string;         // Libellé humain
  value: number | boolean | string | Date;
  type: 'percent' | 'amount' | 'integer' | 'boolean' | 'date';
  bloc: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';
  anneeApplication: number;   // Année fiscale d'application
  dateExpiration?: Date;       // Si dispositif temporaire
  actif: boolean;
  source: string;              // Référence légale (ex: "LFI 2025, art. 24")
  updatedAt: Date;
  updatedBy: string;
}
```

---

---

# SECTION 11 — Tableau Récapitulatif des Changements v2.0

> Synthèse de l'ensemble des corrections, manques et améliorations identifiés lors de l'audit de février 2026. Ce tableau est la base pour la création des tickets dans votre outil de gestion de projet (Jira, Linear, etc.).

| ID | Type | Priorité | Section | Titre | Impact métier | Effort estimé |
|----|------|----------|---------|-------|---------------|---------------|
| CORR-01 | 🐛 Correction | 🔴 Critique | 4.6 | Formule plus-value : ordre majorations forfaitaires incorrect | Surestime l'impôt PV sur détentions > 5 ans | M |
| CORR-02 | 🐛 Correction | 🔴 Critique | 4.6 | Barème abattements PV : calcul progressif annuel manquant | TRI inexact par année de revente | M |
| CORR-03 | 🐛 Correction | 🔴 Critique | 4.6 | Surtaxe PV élevée (> 50 000 €) manquante | Sous-estime l'imposition sur gros investissements | S |
| CORR-04 | 🐛 Correction | 🔴 Critique | 1.2 / 4.3 | Micro-BIC Tourisme : 3 catégories distinctes (Loi Le Meur) | Sous-estime la fiscalité des locations Airbnb | M |
| CORR-05 | 🐛 Correction | 🔴 Critique | 4.6 | PS PV LMNP : 18,6% au lieu de 17,2% | Surestime l'imposition à la revente | S |
| CORR-06 | 🐛 Correction | 🔴 Critique | 2.3 / 2.4 | Vacance locative absente des formules | Surestime cashflow et rentabilité nette | L |
| CORR-07 | 🐛 Correction | 🟠 Important | 1.5 / 6 | Inflation loyers non conditionnée au DPE F/G | Projections erronées pour passoires thermiques | S |
| FEAT-01 | ✨ Feature | 🔴 Critique | 3.2 | Intégration CFE dans les charges LMNP | Manque systématique dans le cashflow LMNP | M |
| FEAT-02 | ✨ Feature | 🟠 Important | 4.4 | Frais de comptabilité déductibles LMNP Réel | Sous-estime les charges, mais SANS réduction 915€ (supprimée) | S |
| FEAT-03 | ✨ Feature | 🟠 Important | 4.1 / 4.2 | Plafond déficit foncier majoré 21 400 € (énergie) | Manque pour les projets de rénovation 2023-2025 | S |
| FEAT-04 | ✨ Feature | 🟠 Important | 4.6 | Réintégration amortissements LMNP PV : précisions LFI 2025 | Calcul PV LMNP incomplet (date, mobilier, résidences de services) | M |
| FEAT-05 | ✨ Feature | 🟡 Utile | 4.4 / 8 | Alerte seuil LMP (23 000 €) | Prévient les erreurs de statut fiscal | S |
| FEAT-06 | ✨ Feature | 🟡 Utile | 7.1 | Scoring dual profil : Rentier / Patrimonial | UX améliorée, évite faux négatifs sur stratégies long terme | M |
| FEAT-07 | ✨ Feature | 🔴 Critique | 2.3 | Paramètre taux d'occupation (vacance) | Lié à CORR-06, interface utilisateur | S |
| FEAT-08 | ✨ Feature | 🟡 Utile | 5.2 | Pondération loyers HCSF ajustable | Flexibilité pour différents profils bancaires | S |
| CONFIG-01 | ⚙️ Config | 🟠 Important | 10 | Page de configuration back-office des variables réglementaires | Maintenabilité critique à chaque LFI | XL |
| ARCH-01 | 🏗️ Architecture | 🟠 Important | 10.3 | Versioning des paramètres par année fiscale | Simulations historiques et conformité | L |
| ARCH-02 | 🏗️ Architecture | 🟡 Utile | 10.3 | Alertes automatiques dispositifs temporaires expirés | Évite les erreurs réglementaires silencieuses | M |
| DOC-01 | 📚 Suppression | 🔴 Critique | 4.4 | Supprimer toute référence à la réduction d'impôt OGA/CGA 915 € | Erreur de calcul active si non supprimée | S |
| DOC-02 | 📚 Clarification | 🟠 Important | 1.1 | Distinguer PS revenus BIC (18,6%) vs PS plus-values (17,2%) | Clarté documentation et implémentation | S |

**Légende efforts :** S = < 1 jour | M = 1-3 jours | L = 3-7 jours | XL = 1-3 semaines

---

*Fin du document — Version 2.0 — 14 Février 2026*  
*Prochaine révision prévue : Avril 2026 (post-promulgation LFI 2026)*
