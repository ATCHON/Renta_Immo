# Sprint Planning V2 — Renta Immo

> **Généré le** : 2026-02-14 par Bob (Scrum Master)
> **Source** : épics v2 (epic-v2-01 à 08) + stories v2 (v2-s01 à v2-s24)
> **Total** : 8 épics, 24 stories, ~4 sprints

---

## Vue d'ensemble

| Sprint | Épics | Stories | Priorité | Effort estimé |
|--------|-------|---------|----------|---------------|
| Sprint 1 | V2-01, V2-02 | S01–S08 | CRITIQUE | 2 semaines |
| Sprint 2 | V2-03, V2-04, V2-05 | S09–S15 | CRITIQUE + IMPORTANT | 2 semaines |
| Sprint 3 | V2-06, V2-07 | S16–S18 | UTILE | 1 semaine |
| Sprint 4+ | V2-08 | S19–S24 | IMPORTANT (long terme) | 3–4 semaines |

---

## Sprint 1 — Corrections Critiques (2 semaines)

**Épics** : V2-01 (Plus-Value) + V2-02 (Vacance Locative)

### Objectif du sprint
Corriger les bugs critiques du calcul de plus-value et propager la vacance locative dans tous les calculs.

### Backlog Sprint 1

| ID | Titre | Effort | Dépendances | Statut |
|----|-------|--------|-------------|--------|
| **V2-S01** | Corriger la formule prix d'acquisition corrigé (forfaits 7.5% + 15%) | M | — | Done |
| **V2-S02** | Vérifier et consolider le barème abattements PV progressif | S | — | Done |
| **V2-S03** | Vérifier le barème surtaxe PV vs spécification v2 | S | — | Done |
| **V2-S04** | Audit taux PS PV (17.2%) vs PS revenus BIC LMNP | S | — | Done |
| **V2-S05** | Réintégration amortissements résidences de services + mobilier | M | V2-S01 | Done |
| **V2-S06** | Propager tauxOccupation dans calculs cashflow et rentabilité | M | — | Done |
| **V2-S07** | Ajouter le slider taux d'occupation dans le formulaire | S | V2-S06 | Done |
| **V2-S08** | Mettre à jour les tests de régression vacance locative | S | V2-S06 | Done |

**Séquence recommandée** :
1. S01 + S02 + S03 + S04 + S06 en parallèle (indépendants)
2. S05 après S01
3. S07 + S08 après S06

**Definition of Done Sprint 1** :
- Formule PV conforme v2 (forfaits, abattements, surtaxe, taux PS)
- `revenusBrutsAnnuels = loyerMensuel * 12 * tauxOccupation` partout
- Slider taux d'occupation opérationnel (défaut 92%)
- `npm test` : 0 échec

---

## Sprint 2 — Conformité Fiscale + DPE + Déficit Foncier (2 semaines)

**Épics** : V2-03 (LMNP) + V2-04 (DPE) + V2-05 (Déficit foncier)

### Objectif du sprint
Compléter la conformité fiscale LMNP (Micro-BIC 3 catégories, CFE, comptabilité, OGA) et implémenter les projections DPE.

### Backlog Sprint 2

| ID | Titre | Effort | Dépendances | Statut |
|----|-------|--------|-------------|--------|
| **V2-S09** | Propager les 3 catégories Micro-BIC dans le calculateur fiscal | M | — | Draft |
| **V2-S10** | Intégrer la CFE dans les charges LMNP avec logique d'exonération | M | V2-S09 | Draft |
| **V2-S11** | Frais de comptabilité LMNP réel (sans réduction OGA/CGA) | S | — | Draft |
| **V2-S12** | Auditer et supprimer toute référence OGA/CGA | S | — | Draft |
| **V2-S13** | Conditionner l'inflation des loyers à la classe DPE | S | Sprint 1 complet | Draft |
| **V2-S14** | Conditionner la revalorisation du bien au DPE | S | V2-S13 | Draft |
| **V2-S15** | Implémenter le plafond déficit foncier majoré 21 400€ | S | — | Draft |

**Séquence recommandée** :
1. S09 + S11 + S12 + S15 en parallèle (indépendants)
2. S10 après S09
3. S13 après Sprint 1 (tauxOccupation dans projections)
4. S14 après S13

**Definition of Done Sprint 2** :
- 3 catégories Micro-BIC correctement appliquées
- CFE intégrée avec règles d'exonération
- 0 référence OGA/CGA dans le code et docs
- Projections DPE F/G : 0% loyers, décote valeur -15%
- Déficit foncier majoré 21 400€ avec alerte d'expiration

---

## Sprint 3 — Scoring Dual Profil + HCSF (1 semaine)

**Épics** : V2-06 (Scoring) + V2-07 (HCSF)

### Objectif du sprint
Implémenter le scoring dual profil Rentier/Patrimonial, l'alerte LMP, et rendre la pondération HCSF configurable.

### Backlog Sprint 3

| ID | Titre | Effort | Dépendances | Statut |
|----|-------|--------|-------------|--------|
| **V2-S16** | Implémenter le profil scoring "Patrimonial" | M | Sprint 1+2 | Draft |
| **V2-S17** | Ajouter l'alerte seuil LMP (23 000€) | S | — | Draft |
| **V2-S18** | Rendre la pondération loyers HCSF configurable | S | — | Draft |

**Definition of Done Sprint 3** :
- Toggle Rentier/Patrimonial dans l'UI avec scores différenciés
- Bandeau alerte orange (>20k€) et rouge (>23k€) LMNP
- Champ pondération HCSF (70% défaut, bouton GLI → 80%)

---

## Sprint 4+ — Back-Office Configuration (3–4 semaines)

**Epic** : V2-08 — Chantier le plus lourd, à planifier après Sprint 3

### Objectif
Transformer toutes les constantes en dur en paramètres configurables via interface admin.

### Backlog Sprint 4+

| ID | Titre | Effort | Dépendances | Statut |
|----|-------|--------|-------------|--------|
| **V2-S19** | Concevoir le schéma de données ConfigParam | M | — | Draft |
| **V2-S20** | Créer l'API CRUD pour les paramètres | L | V2-S19 | Draft |
| **V2-S21** | Créer l'interface admin des paramètres (8 blocs) | L | V2-S20 | Draft |
| **V2-S22** | Migrer les constantes du code vers la base de données | L | S19+S20+S21 | Draft |
| **V2-S23** | Système d'alertes pour dispositifs temporaires | M | V2-S21 | Draft |
| **V2-S24** | Mode Dry Run (simulation impact changement) | M | S21+S22 | Draft |

**Note** : Nécessite coordination avec l'architecte. Démarrer par S19 seul pour valider le schéma avant de s'engager sur S20+.

---

## Points d'attention identifiés

### Ambiguïtés à clarifier avant Sprint 1

| Story | Problème | Décision requise |
|-------|---------|-----------------|
| **V2-S04** | Titre dit "PS revenus BIC LMNP (18.6%)" mais les Dev Notes précisent "17.2% pour les non-professionnels, 18.6% pour certains cas spécifiques". Quelle est la valeur à implémenter comme `TAUX_PS_REVENUS_BIC_LMNP` ? | PM/Expert fiscal à confirmer |
| **V2-S05** | La Loi Le Meur est applicable depuis le 15/02/2025 → aujourd'hui (14/02/2026) elle est déjà en vigueur. Le cas `date < 15/02/2025` concerne uniquement les simulations historiques. Confirmer que c'est bien le besoin. | PM à confirmer |

### Dépendances inter-sprints critiques

```
Sprint 1 complet → V2-S13 (DPE projections dépend de tauxOccupation)
V2-S01 → V2-S05 (réintégration sur nouvelle formule PV)
V2-S06 → V2-S07, V2-S08
V2-S09 → V2-S10
V2-S19 → V2-S20 → V2-S21 → V2-S22 → V2-S23/S24
```

### Risques

| Risque | Impact | Mitigation |
|--------|--------|------------|
| V2-S06 change TOUS les résultats cashflow | Élevé | Exécuter V2-S08 immédiatement après |
| V2-S22 (migration constantes) : refactoring massif | Élevé | Ne pas commencer avant Sprint 3 terminé |
| V2-S15 (déficit foncier majoré expiré) | Faible | Implémenter avec alerte d'expiration |

---

## Qualité des stories — Résultat de vérification

Toutes les 24 stories ont été vérifiées selon la story-draft-checklist :

| Critère | Status |
|---------|--------|
| Format As a / I want / so that | ✅ 24/24 |
| Acceptance Criteria clairs et testables | ✅ 24/24 |
| Tasks/Subtasks détaillées | ✅ 24/24 |
| Dev Notes avec fichiers impactés | ✅ 24/24 |
| Section Testing avec commande | ✅ 24/24 |
| Dépendances documentées | ✅ 24/24 |
| Effort estimé (S/M/L) | ✅ 24/24 |

**2 ambiguïtés mineures** à lever (voir tableau ci-dessus) — stories sinon prêtes pour implémentation.

---

*Sprint Planning V2 — Bob, Scrum Master 🏃*
