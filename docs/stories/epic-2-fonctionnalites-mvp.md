# Epic 2 : Fonctionnalités MVP

> **Version** : 1.0
> **Date** : 2026-01-26
> **Auteur** : John (PM)
> **Statut** : Ready for Development
> **Prérequis** : Epic 1 (Infrastructure Backend) complétée

---

## 1. Vue d'ensemble

### 1.1 Objectif de l'Epic

Livrer un simulateur de rentabilité immobilière complet et utilisable, avec toutes les fonctionnalités essentielles pour une analyse d'investissement locatif professionnelle.

### 1.2 Contexte

Avec le backend custom en place (Epic 1), cette epic ajoute les fonctionnalités métier qui font la valeur du simulateur : frais d'acquisition complets, régimes fiscaux détaillés, projections pluriannuelles, et outils de comparaison.

### 1.3 Valeur Business

| Bénéfice | Description |
|----------|-------------|
| **Complétude** | Analyse complète d'un investissement locatif |
| **Précision** | Tous les frais et régimes fiscaux pris en compte |
| **Projection** | Vision long terme de l'investissement |
| **Comparaison** | Aide à la décision multi-scénarios |

---

## 2. Scope

### 2.1 Inclus (In Scope)

**Frais d'acquisition** :
- Frais de notaire automatiques
- Frais d'agence
- Travaux initiaux

**Régimes fiscaux** :
- Location nue (micro-foncier / réel)
- LMNP (micro-BIC / réel)
- Calcul d'amortissement
- Comparaison régimes

**Projections** :
- Simulation pluriannuelle (5-25 ans)
- Évolution loyer (IRL)
- Évolution charges (inflation)
- Enrichissement patrimonial
- Calcul TRI

**Indicateurs** :
- Effort d'épargne
- Effet de levier
- Tableau amortissement crédit

**Comparaison** :
- Multi-scénarios (jusqu'à 3)

### 2.2 Exclus (Out of Scope)

- Comptes utilisateurs (V1)
- Données de marché externes (V1)
- Dispositifs fiscaux (Pinel, Denormandie) (V2)
- Import annonces (V3)

---

## 3. Organisation des Sprints

### Vue d'ensemble

| Sprint | Focus | Stories | Durée estimée |
|--------|-------|---------|---------------|
| Sprint 1 | Frais d'acquisition | 4 stories | 1 semaine |
| Sprint 2 | Régimes fiscaux base | 3 stories | 2 semaines |
| Sprint 3 | Projections | 4 stories | 1.5 semaines |
| Sprint 4 | Indicateurs & Enrichissement | 4 stories | 1.5 semaines |
| Sprint 5 | Charges & Fiscalité avancée | 4 stories | 1.5 semaines |
| Sprint 6 | Comparaison & Finalisation | 4 stories | 1.5 semaines |

**Total estimé** : 9-10 semaines

---

## 4. Sprint 1 — Frais d'Acquisition (1 semaine)

### Stories

| Story ID | Titre | Backlog | Points | Priorité |
|----------|-------|---------|--------|----------|
| **S1.1** | Frais de notaire automatiques | MVP-001 | 3 | P1 |
| **S1.2** | Frais d'agence | MVP-002 | 2 | P1 |
| **S1.3** | Travaux initiaux | MVP-003 | 1 | P1 |
| **S1.4** | Synthèse coût acquisition | MVP-022 | 3 | P3 |

**Total** : 9 points

### S1.1 : Frais de notaire automatiques

**En tant qu'** investisseur
**Je veux** connaître les frais de notaire estimés
**Afin de** calculer mon budget total d'acquisition

**Critères d'acceptation** :
- [ ] Choix type bien : ancien (7-8%) ou neuf (2-3%)
- [ ] Calcul automatique basé sur le prix d'achat
- [ ] Option de saisie manuelle pour override
- [ ] Affichage du détail (droits mutation, émoluments, débours)
- [ ] Intégration dans le coût total d'acquisition
- [ ] Mise à jour temps réel lors changement prix

**UI** : Nouveau champ dans étape "Bien" ou "Financement"

---

### S1.2 : Frais d'agence

**En tant qu'** investisseur
**Je veux** saisir les frais d'agence immobilière
**Afin de** avoir un coût d'acquisition précis

**Critères d'acceptation** :
- [ ] Saisie en montant fixe OU en pourcentage du prix
- [ ] Choix : à charge acquéreur ou vendeur (inclus dans prix)
- [ ] Si à charge vendeur : ne pas ajouter au coût d'acquisition
- [ ] Intégration dans le récapitulatif des frais
- [ ] Défaut : 0€ (pas de frais)

---

### S1.3 : Travaux initiaux

**En tant qu'** investisseur
**Je veux** inclure un budget travaux
**Afin de** calculer la rentabilité réelle

**Critères d'acceptation** :
- [ ] Champ montant travaux initiaux
- [ ] Optionnel (défaut : 0€)
- [ ] Intégration dans le coût total d'acquisition
- [ ] Pris en compte dans le calcul de rentabilité

---

### S1.4 : Synthèse coût acquisition

**En tant qu'** investisseur
**Je veux** voir un récapitulatif clair du coût total
**Afin de** comprendre la répartition des frais

**Critères d'acceptation** :
- [ ] Tableau récapitulatif : prix + frais notaire + agence + travaux
- [ ] Total "clé en main"
- [ ] Pourcentage de frais par rapport au prix
- [ ] Affiché dans les résultats
- [ ] Export dans le PDF

---

## 5. Sprint 2 — Régimes Fiscaux Base (2 semaines)

### Stories

| Story ID | Titre | Backlog | Points | Priorité |
|----------|-------|---------|--------|----------|
| **S2.1** | Choix régime location nue | MVP-004 | 5 | P1 |
| **S2.2** | Calcul d'amortissement | MVP-006 | 8 | P1 |
| **S2.3** | Choix régime LMNP | MVP-005 | 8 | P1 |

**Total** : 21 points

### S2.1 : Choix régime location nue

**En tant qu'** investisseur en location nue
**Je veux** choisir entre micro-foncier et régime réel
**Afin d'** optimiser ma fiscalité

**Critères d'acceptation** :
- [ ] Option micro-foncier : abattement 30%, plafond 15 000€/an
- [ ] Option régime réel : déduction des charges réelles
- [ ] Affichage comparatif des deux régimes
- [ ] Recommandation automatique du régime optimal
- [ ] Alerte si revenus > 15 000€ (micro impossible)
- [ ] Calcul déficit foncier si régime réel

**Formules** :
```
Micro-foncier : Revenu imposable = Loyers × 70%
Réel : Revenu imposable = Loyers - Charges déductibles
```

---

### S2.2 : Calcul d'amortissement

**En tant qu'** investisseur LMNP réel ou SCI IS
**Je veux** calculer l'amortissement comptable
**Afin de** réduire ma base imposable

**Critères d'acceptation** :
- [ ] Amortissement immobilier par composants :
  - Gros œuvre : 50 ans (2%)
  - Façade : 30 ans (3.33%)
  - Équipements : 15 ans (6.67%)
  - Agencements : 15 ans (6.67%)
- [ ] Répartition automatique : Terrain 15%, Bâti 85%
- [ ] Amortissement mobilier : 5-10 ans selon catégorie
- [ ] Tableau d'amortissement sur la durée
- [ ] Intégration dans le calcul fiscal LMNP réel et SCI IS

**Règles** :
- L'amortissement ne peut pas créer de déficit
- Report des amortissements non déduits

---

### S2.3 : Choix régime LMNP

**En tant qu'** investisseur LMNP
**Je veux** comparer micro-BIC et régime réel
**Afin d'** optimiser ma fiscalité meublée

**Critères d'acceptation** :
- [ ] Option micro-BIC : abattement 50%, plafond 77 700€/an
- [ ] Option régime réel : amortissement + déduction charges
- [ ] Type de location : meublé classique, tourisme, étudiant
- [ ] Affichage comparatif des deux régimes
- [ ] Recommandation automatique du régime optimal
- [ ] Intégration de l'amortissement (S2.2) pour le réel

**Dépendance** : S2.2 (Calcul d'amortissement)

---

## 6. Sprint 3 — Projections (1.5 semaines)

### Stories

| Story ID | Titre | Backlog | Points | Priorité |
|----------|-------|---------|--------|----------|
| **S3.1** | Simulation pluriannuelle (structure) | MVP-007 | 8 | P1 |
| **S3.2** | Tableau amortissement crédit | MVP-009 | 3 | P2 |
| **S3.3** | Évolution loyer (IRL) | MVP-010 | 3 | P2 |
| **S3.4** | Évolution charges | MVP-011 | 3 | P2 |

**Total** : 17 points

### S3.1 : Simulation pluriannuelle (structure)

**En tant qu'** investisseur
**Je veux** voir l'évolution de mon investissement dans le temps
**Afin de** planifier sur le long terme

**Critères d'acceptation** :
- [ ] Sélection de la durée de projection : 5 / 10 / 15 / 20 / 25 ans
- [ ] Structure de données pour stocker les projections annuelles
- [ ] Calcul année par année de tous les indicateurs
- [ ] Prise en compte de l'évolution loyer et charges
- [ ] Base pour les graphiques d'évolution (Sprint 6)

**Structure données** :
```typescript
interface ProjectionAnnuelle {
  annee: number;
  loyer: number;
  charges: number;
  mensualite: number;
  cashflow: number;
  capitalRembourse: number;
  capitalRestant: number;
  valeurBien: number;
  patrimoineNet: number;
}
```

---

### S3.2 : Tableau amortissement crédit

**En tant qu'** investisseur
**Je veux** voir le détail de mon crédit
**Afin de** comprendre la répartition capital/intérêts

**Critères d'acceptation** :
- [ ] Tableau année par année (et mois par mois en option)
- [ ] Colonnes : échéance, capital, intérêts, assurance, reste dû
- [ ] Total des intérêts payés
- [ ] Total assurance payée
- [ ] Export possible (inclus dans PDF)

---

### S3.3 : Évolution loyer (IRL)

**En tant qu'** investisseur
**Je veux** projeter l'évolution de mes loyers
**Afin d'** anticiper mes revenus futurs

**Critères d'acceptation** :
- [ ] Taux IRL paramétrable (défaut : 1.5%)
- [ ] Application annuelle automatique
- [ ] Impact sur les projections pluriannuelles
- [ ] Affichage du loyer projeté année par année

**Formule** : `Loyer(n+1) = Loyer(n) × (1 + IRL)`

---

### S3.4 : Évolution charges

**En tant qu'** investisseur
**Je veux** projeter l'évolution de mes charges
**Afin d'** anticiper mes dépenses futures

**Critères d'acceptation** :
- [ ] Taux d'inflation paramétrable (défaut : 2%)
- [ ] Application sur toutes les charges (copro, taxe foncière, assurances...)
- [ ] Impact sur les projections pluriannuelles
- [ ] Mensualité crédit non impactée (fixe)

---

## 7. Sprint 4 — Indicateurs & Enrichissement (1.5 semaines)

### Stories

| Story ID | Titre | Backlog | Points | Priorité |
|----------|-------|---------|--------|----------|
| **S4.1** | Enrichissement patrimonial | MVP-012 | 5 | P2 |
| **S4.2** | Calcul TRI | MVP-013 | 5 | P2 |
| **S4.3** | Effort d'épargne | MVP-016 | 3 | P2 |
| **S4.4** | Effet de levier | MVP-017 | 3 | P2 |

**Total** : 16 points

### S4.1 : Enrichissement patrimonial

**En tant qu'** investisseur
**Je veux** voir mon enrichissement total dans le temps
**Afin de** mesurer la création de valeur

**Critères d'acceptation** :
- [ ] Capital remboursé cumulé (depuis tableau amortissement)
- [ ] Plus-value potentielle (taux appréciation paramétrable, défaut 1%)
- [ ] Cashflow cumulé
- [ ] Patrimoine net = Valeur bien - Capital restant dû
- [ ] Données pour graphique d'évolution

**Dépendances** : S3.1, S3.2

---

### S4.2 : Calcul TRI

**En tant qu'** investisseur
**Je veux** connaître le TRI de mon investissement
**Afin de** comparer avec d'autres placements

**Critères d'acceptation** :
- [ ] Calcul TRI sur la durée de projection choisie
- [ ] Prise en compte : apport initial, cashflows annuels, valeur revente
- [ ] Affichage avec explication pédagogique
- [ ] Comparaison avec benchmarks (Livret A ~3%, Assurance vie ~2%, Bourse ~7%)

**Formule** : Résolution de NPV = 0 pour trouver le taux

**Dépendances** : S3.1, S4.1

---

### S4.3 : Effort d'épargne

**En tant qu'** investisseur
**Je veux** savoir combien je dois sortir de ma poche
**Afin de** vérifier ma capacité d'investissement

**Critères d'acceptation** :
- [ ] Si cashflow négatif : afficher comme "effort d'épargne"
- [ ] Présentation positive ("investissement de X€/mois")
- [ ] Comparaison avec capacité d'épargne déclarée (optionnel)
- [ ] Alerte si effort > capacité déclarée

---

### S4.4 : Effet de levier

**En tant qu'** investisseur
**Je veux** comprendre l'effet de levier du crédit
**Afin de** optimiser mon financement

**Critères d'acceptation** :
- [ ] Formule : Rentabilité fonds propres / Rentabilité sans crédit
- [ ] Explication pédagogique de l'effet de levier
- [ ] Comparaison achat cash vs achat crédit
- [ ] Alerte si levier négatif (taux crédit > rentabilité)

**Formule** :
```
Effet de levier = (Rentabilité nette - Taux crédit) × (Emprunt / Fonds propres)
```

---

## 8. Sprint 5 — Charges & Fiscalité Avancée (1.5 semaines)

### Stories

| Story ID | Titre | Backlog | Points | Priorité |
|----------|-------|---------|--------|----------|
| **S5.1** | Charges récupérables | MVP-014 | 3 | P2 |
| **S5.2** | Honoraires comptable | MVP-015 | 1 | P2 |
| **S5.3** | Comparaison régimes fiscaux | MVP-018 | 5 | P2 |
| **S5.4** | Amélioration SCI IS | MVP-019 | 5 | P3 |

**Total** : 14 points

### S5.1 : Charges récupérables

**En tant qu'** investisseur
**Je veux** distinguer charges propriétaire et charges récupérables
**Afin d'** avoir un cashflow précis

**Critères d'acceptation** :
- [ ] Saisie des charges récupérables (provisions sur charges)
- [ ] Distinction charges propriétaire vs charges récupérables
- [ ] Impact sur le calcul du cashflow net
- [ ] Info : régularisation annuelle

---

### S5.2 : Honoraires comptable

**En tant qu'** investisseur LMNP réel ou SCI
**Je veux** inclure mes frais de comptable
**Afin d'** avoir des projections réalistes

**Critères d'acceptation** :
- [ ] Champ honoraires annuels (défaut suggéré : 500-800€)
- [ ] Affiché uniquement si régime réel ou SCI
- [ ] Intégré dans les charges annuelles
- [ ] Info : déductible fiscalement

---

### S5.3 : Comparaison régimes fiscaux

**En tant qu'** investisseur
**Je veux** comparer tous les régimes sur un même bien
**Afin de** choisir le montage optimal

**Critères d'acceptation** :
- [ ] Tableau comparatif : Nu micro, Nu réel, LMNP micro, LMNP réel, SCI IS
- [ ] Pour chaque : imposition, cashflow net, rentabilité nette-nette
- [ ] Mise en évidence du régime optimal
- [ ] Explication des différences

**Dépendances** : S2.1, S2.2, S2.3

---

### S5.4 : Amélioration SCI IS

**En tant qu'** investisseur en SCI IS
**Je veux** simuler l'imposition société et la distribution
**Afin d'** optimiser ma stratégie

**Critères d'acceptation** :
- [ ] Calcul IS : 15% jusqu'à 42 500€, 25% au-delà
- [ ] Simulation distribution dividendes
- [ ] Flat tax 30% sur dividendes
- [ ] Comparaison : capitaliser vs distribuer
- [ ] Impact sur HCSF des associés

---

## 9. Sprint 6 — Comparaison & Finalisation (1.5 semaines)

### Stories

| Story ID | Titre | Backlog | Points | Priorité |
|----------|-------|---------|--------|----------|
| **S6.1** | Multi-scénarios (structure) | MVP-008 | 5 | P1 |
| **S6.2** | Persistance scénarios | MVP-023 | 3 | P3 |
| **S6.3** | Graphiques d'évolution | MVP-020 | 5 | P3 |
| **S6.4** | Amélioration formulaire régimes | MVP-021 | 5 | P3 |

**Total** : 18 points

### S6.1 : Multi-scénarios (structure)

**En tant qu'** investisseur
**Je veux** comparer différentes hypothèses
**Afin de** prendre la meilleure décision

**Critères d'acceptation** :
- [ ] Créer jusqu'à 3 scénarios
- [ ] Dupliquer un scénario existant
- [ ] Modifier indépendamment chaque scénario
- [ ] Nommer chaque scénario
- [ ] Affichage côte à côte des résultats clés

---

### S6.2 : Persistance scénarios

**En tant qu'** utilisateur
**Je veux** retrouver mes scénarios si je quitte la page
**Afin de** ne pas perdre mon travail

**Critères d'acceptation** :
- [ ] Sauvegarde automatique des scénarios en localStorage
- [ ] Restauration au rechargement
- [ ] Suppression d'un scénario
- [ ] Limite de 5 scénarios max

---

### S6.3 : Graphiques d'évolution

**En tant qu'** investisseur
**Je veux** visualiser graphiquement les projections
**Afin de** mieux comprendre l'évolution

**Critères d'acceptation** :
- [ ] Graphique cashflow annuel
- [ ] Graphique enrichissement patrimonial
- [ ] Graphique répartition capital/intérêts
- [ ] Graphique évolution loyer vs charges
- [ ] Interactif (survol pour détails)

**Dépendances** : S3.1, S4.1

---

### S6.4 : Amélioration formulaire régimes

**En tant qu'** utilisateur
**Je veux** un parcours clair pour choisir mon régime
**Afin de** ne pas me tromper

**Critères d'acceptation** :
- [ ] Choix type location : Nue / Meublée (LMNP)
- [ ] Si Nue : choix micro-foncier / réel
- [ ] Si Meublée : choix micro-BIC / réel
- [ ] Option SCI (IR ou IS)
- [ ] Workflow clair et guidé
- [ ] Tooltips explicatifs

---

## 10. Dépendances entre Stories

```
Sprint 1 (Acquisition)
    │
    ▼
Sprint 2 (Fiscalité) ◄── S2.3 dépend de S2.2
    │
    ▼
Sprint 3 (Projections)
    │
    ├── S4.1, S4.2 dépendent de S3.1, S3.2
    ▼
Sprint 4 (Indicateurs)
    │
    ├── S5.3 dépend de S2.1, S2.2, S2.3
    ▼
Sprint 5 (Fiscalité avancée)
    │
    ├── S6.3 dépend de S3.1, S4.1
    ▼
Sprint 6 (Comparaison)
```

---

## 11. Prérequis

### 11.1 Epic 1 complétée

Avant de démarrer l'Epic 2, l'Epic 1 doit être terminée :
- [ ] Backend custom fonctionnel
- [ ] API `/api/calculate` opérationnelle
- [ ] Tests de régression passés
- [ ] n8n décommissionné

### 11.2 Intégration backend

Les nouvelles fonctionnalités de l'Epic 2 nécessiteront des modifications du moteur de calcul :
- Nouveaux champs d'entrée (frais acquisition, régimes fiscaux détaillés)
- Nouvelles sorties (projections, TRI, comparaisons)
- Extension des schémas Zod

---

## 12. Risques et Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Complexité fiscale | Haut | Haute | Documentation officielle, validation expert |
| Calculs amortissement | Moyen | Moyenne | Tests avec cas réels |
| Performance projections | Moyen | Faible | Calcul lazy, pagination |
| UX formulaire complexe | Moyen | Moyenne | Tests utilisateurs, itérations |

---

## 13. Definition of Done (Epic)

### 13.1 Critères fonctionnels

- [ ] Tous les sprints complétés (S1 à S6)
- [ ] 27 items du backlog MVP implémentés
- [ ] Toutes les user stories validées
- [ ] Tests fonctionnels passés

### 13.2 Critères qualité

- [ ] TypeScript compile sans erreur
- [ ] ESLint passe sans erreur
- [ ] Tests unitaires > 80% couverture (modules calculs)
- [ ] Tests E2E principaux scénarios
- [ ] Performance < 1s pour projections 25 ans

### 13.3 Critères UX

- [ ] Responsive mobile fonctionnel
- [ ] Tooltips et aide contextuelle
- [ ] Messages d'erreur clairs
- [ ] PDF export complet

---

## 14. Métriques de Succès

| Métrique | Cible |
|----------|-------|
| Couverture régimes fiscaux | 100% cas courants |
| Précision calcul rentabilité | Écart < 5% vs expert |
| Projections disponibles | 5 à 25 ans |
| Temps simulation complète | < 5 min |
| Taux completion formulaire | > 80% |

---

## 15. Références

| Document | Lien |
|----------|------|
| PRD | [docs/prd.md](../prd.md) |
| Architecture | [docs/architecture.md](../architecture.md) |
| Backlog MVP | [docs/backlog-mvp.md](../backlog-mvp.md) |
| Epic 1 | [epic-1-infrastructure-backend.md](./epic-1-infrastructure-backend.md) |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
