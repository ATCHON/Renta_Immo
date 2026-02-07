# Story : Correction des Formules (Audit Janvier 2026)

**ID** : AUDIT-001  
**Titre** : Correction notariale et base de rentabilité  
**Priorité** : P1 (Critique)  
**Statut** : Validé (Corrections Audit Janv 2026)

## 1. Contexte
L'audit interne a révélé des écarts entre les spécifications métier (v2.0) et l'implémentation initiale des calculs de rentabilité et des frais de notaire.

## 2. Objectifs
- Aligner le calcul de la rentabilité nette sur le coût total d'acquisition (et non le prix d'achat).
- Rendre le calcul des frais de notaire plus précis en utilisant le barème légal et en déduisant le mobilier.

## 3. Critères d'acceptation

### 3.1 Rentabilité Nette
- [x] La formule de rentabilité nette dans `rentabilite.ts` utilise `cout_total_acquisition` comme dénominateur.
- [x] Le `cout_total_acquisition` inclut : Prix d'achat + Frais de notaire + Travaux + Frais bancaires.

### 3.2 Frais de Notaire
- [x] Déduction automatique de la `valeur_mobilier` de l'assiette taxable.
- [x] Utilisation du barème progressif des émoluments (Tranches : 0-6.5k, 6.5k-17k, 17k-60k, >60k).
- [x] Support des taxes fixes (DMTO, Taxe communale, Sécurité immobilière).

## 4. Impacts techniques
- `src/server/calculations/rentabilite.ts` : modification des fonctions `calculerFraisNotaire` et `calculerRentabilite`.
- `src/config/constants.ts` : ajout des tranches du barème des notaires.
