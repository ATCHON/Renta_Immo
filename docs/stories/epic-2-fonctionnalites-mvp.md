# Epic 2 : Fonctionnalités MVP

> **Version** : 2.0
> **Date** : 2026-01-27
> **Auteur** : John (PM)
> **Statut** : En cours - Sprints 1-4 Terminés
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

## 2. État d'avancement

### 2.1 Mise à jour du 2026-01-27

Suite à la validation des spécifications de calcul avec le métier (voir `docs/specification-calculs.md`), les formules ont été mises à jour et implémentées :

**Sprints terminés :**
- ✅ Sprint 1 : Frais d'acquisition
- ✅ Sprint 2 : Régimes fiscaux base
- ✅ Sprint 3 : Projections et Amortissement
- ✅ Sprint 4 : Indicateurs & Enrichissement
- ⏳ Sprint 5 : Charges & Fiscalité avancée (En cours)

**Implémentation réalisée :**
- Constantes fiscales 2025 (`src/config/constants.ts`)
- Module de calcul complet (`src/server/calculations/`)
- API `/api/calculate` fonctionnelle

---

## 3. Scope

### 3.1 Inclus (In Scope)

**Indicateurs** (✅ TERMINÉ - Sprint 4) :
- ✅ Effort d'épargne
- ✅ Effet de levier
- ✅ Tableau amortissement crédit

**Audit & Fiabilisation** (✅ TERMINÉ) :
- ✅ Correction formules Rentabilité et Notaire
- ✅ Déduction fiscale des intérêts (LMNP/IS)

**Comparaison** (⏳ À FAIRE - Sprint 6) :
- Multi-scénarios (jusqu'à 3)

### 3.2 Exclus (Out of Scope)

- Comptes utilisateurs (V1)
- Données de marché externes (V1)
- Dispositifs fiscaux (Pinel, Denormandie) (V2)
- Import annonces (V3)

---

## 4. Organisation des Sprints (Mise à jour)

### Vue d'ensemble

| Sprint | Focus | Stories | Statut |
|--------|-------|---------|--------|
| Sprint 1 | Frais d'acquisition | 4 stories | ✅ TERMINÉ |
| Sprint 2 | Régimes fiscaux base | 3 stories | ✅ TERMINÉ |
| Sprint 3 | Projections | 4 stories | ✅ TERMINÉ |
| Sprint 4 | Indicateurs & Enrichissement | 4 stories | ✅ TERMINÉ |
| Sprint 5 | Charges & Fiscalité avancée | 4 stories | ⏳ EN COURS |
| Sprint 6 | Comparaison & Finalisation | 4 stories | ⏳ À FAIRE |

---

## 5. Sprint 1 — Frais d'Acquisition ✅ TERMINÉ

### Stories (Toutes complétées)

| Story ID | Titre | Statut | Implémentation |
|----------|-------|--------|----------------|
| **S1.1** | Frais de notaire automatiques | ✅ | `rentabilite.ts:66-75` |
| **S1.2** | Frais d'agence | ⚠️ Partiel | Structure OK, UI à améliorer |
| **S1.3** | Travaux initiaux | ✅ | `rentabilite.ts:86` |
| **S1.4** | Synthèse coût acquisition | ✅ | `rentabilite.ts:89` |

### Détail d'implémentation

**S1.1 : Frais de notaire automatiques** ✅
- Taux ancien : 8% (`CONSTANTS.NOTAIRE.TAUX_ANCIEN`)
- Taux neuf : 2.5% (`CONSTANTS.NOTAIRE.TAUX_NEUF`)
- Barème émoluments détaillé disponible pour calcul précis
- Intégré dans le coût total d'acquisition

**S1.3 : Travaux initiaux** ✅
- Champ `bien.montant_travaux` pris en compte
- Intégré dans `coutTotalAcquisition`
- Pris en compte dans amortissement LMNP réel

**S1.4 : Synthèse coût acquisition** ✅
- `coutTotalAcquisition = prixAchat + fraisNotaire + montantTravaux + fraisBanque`

---

## 6. Sprint 2 — Régimes Fiscaux Base ✅ TERMINÉ

### Stories (Toutes complétées)

| Story ID | Titre | Statut | Implémentation |
|----------|-------|--------|----------------|
| **S2.1** | Choix régime location nue | ✅ | `fiscalite.ts:40-119` |
| **S2.2** | Calcul d'amortissement | ✅ | `fiscalite.ts:177-233` |
| **S2.3** | Choix régime LMNP | ✅ | `fiscalite.ts:129-233` |
| **AUDIT** | Corrections audit Notaire/Renta | ✅ | `story-audit-corrections.md` |

### Détail d'implémentation

**S2.1 : Choix régime location nue** ✅
- Micro-foncier : abattement 30%, plafond 15 000€ (`calculerMicroFoncier`)
- Foncier réel : charges réelles + déficit foncier (`calculerFoncierReel`)
- PS : 17.2% pour revenus fonciers

**S2.2 : Calcul d'amortissement** ✅
- Part terrain : 15% (non amortissable)
- Immobilier : durée 33 ans (~3%/an)
- Mobilier : durée 10 ans (10%/an)
- Travaux : durée 15 ans (~6.67%/an)
- Amortissement ne crée pas de déficit (excédent reportable)

**S2.3 : Choix régime LMNP** ✅
- Micro-BIC longue durée : 50% abattement, 77 700€ plafond
- Micro-BIC tourisme non classé : 30% abattement, 15 000€ plafond
- PS LMNP : **18.6%** (mise à jour 2025)
- LMNP Réel avec amortissement (`calculerLmnpReel`)

---

## 7. Sprint 3 — Projections ✅ TERMINÉ

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
- [x] Sélection de la durée de projection : 5 / 10 / 15 / 20 / 25 ans
- [x] Structure de données pour stocker les projections annuelles
- [x] Calcul année par année de tous les indicateurs
- [x] Prise en compte de l'évolution loyer et charges
- [x] Base pour les graphiques d'évolution (Sprint 6)

**Référence spécification** : Section 9 - Projections pluriannuelles

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
  impot: number;
  cashflowNetImpot: number;
}
```

**Paramètres de projection** (depuis spécification) :
- `INFLATION_LOYER` : 2%
- `INFLATION_CHARGES` : 2.5%
- `REVALORISATION_BIEN` : 1.5%

---

### S3.2 : Tableau amortissement crédit

**En tant qu'** investisseur
**Je veux** voir le détail de mon crédit
**Afin de** comprendre la répartition capital/intérêts

**Critères d'acceptation** :
- [x] Tableau année par année (et mois par mois en option)
- [x] Colonnes : échéance, capital, intérêts, assurance, reste dû
- [x] Total des intérêts payés
- [x] Total assurance payée
- [x] Export possible (inclus dans PDF)

**Note** : La formule PMT est déjà implémentée dans `calculerMensualite()`. Il faut générer le tableau complet.

---

### S3.3 : Évolution loyer (IRL)

**En tant qu'** investisseur
**Je veux** projeter l'évolution de mes loyers
**Afin d'** anticiper mes revenus futurs

**Critères d'acceptation** :
- [x] Taux IRL paramétrable (défaut : 2% - voir spécification)
- [x] Application annuelle automatique
- [x] Impact sur les projections pluriannuelles
- [x] Affichage du loyer projeté année par année

**Formule** : `Loyer(n+1) = Loyer(n) × (1 + INFLATION_LOYER)`

---

### S3.4 : Évolution charges

**En tant qu'** investisseur
**Je veux** projeter l'évolution de mes charges
**Afin d'** anticiper mes dépenses futures

**Critères d'acceptation** :
- [x] Taux d'inflation paramétrable (défaut : 2.5% - voir spécification)
- [x] Application sur toutes les charges (copro, taxe foncière, assurances...)
- [x] Impact sur les projections pluriannuelles
- [x] Mensualité crédit non impactée (fixe)

---

## 8. Sprint 4 — Indicateurs & Enrichissement ✅ TERMINÉ

### Stories

| **S4.1** | Enrichissement patrimonial | MVP-012 | 5 | P2 | ✅ |
| **S4.2** | Calcul TRI | MVP-013 | 5 | P2 | ✅ |
| **S4.3** | Effort d'épargne | MVP-016 | 3 | P2 | ✅ |
| **S4.4** | Effet de levier | MVP-017 | 3 | P2 | ✅ |

**Total** : 16 points

### S4.1 : Enrichissement patrimonial

**En tant qu'** investisseur
**Je veux** voir mon enrichissement total dans le temps
**Afin de** mesurer la création de valeur

**Critères d'acceptation** :
- [x] Capital remboursé cumulé (depuis tableau amortissement)
- [x] Plus-value potentielle (taux appréciation 1.5% - spécification)
- [x] Cashflow cumulé
- [x] Patrimoine net = Valeur bien - Capital restant dû
- [x] Données pour graphique d'évolution

**Formules (depuis spécification)** :
```
Enrichissement_Brut(n) = Capital_Rembourse_Annuel(n) + Cash-flow_Annuel(n)
Rendement_Fonds_Propres (%) = (Enrichissement_Brut / Apport) × 100
```

**Dépendances** : S3.1, S3.2

---

### S4.2 : Calcul TRI

**En tant qu'** investisseur
**Je veux** connaître le TRI de mon investissement
**Afin de** comparer avec d'autres placements

**Critères d'acceptation** :
- [x] Calcul TRI sur la durée de projection choisie
- [x] Prise en compte : apport initial, cashflows annuels, valeur revente
- [x] Affichage avec explication pédagogique
- [x] Comparaison avec benchmarks (Livret A ~3%, Assurance vie ~2%, Bourse ~7%)

**Formule (depuis spécification)** :
```
TRI = Résolution de : Apport = Somme(Flux_Net(n) / (1+TRI)^n) + Valeur_Sortie / (1+TRI)^Horizon
```

**Dépendances** : S3.1, S4.1

---

### S4.3 : Effort d'épargne

**En tant qu'** investisseur
**Je veux** savoir combien je dois sortir de ma poche
**Afin de** vérifier ma capacité d'investissement

**Critères d'acceptation** :
- [x] Si cashflow négatif : afficher comme "effort d'épargne"
- [x] Présentation positive ("investissement de X€/mois")
- [ ] Comparaison avec capacité d'épargne déclarée (optionnel)
- [ ] Alerte si effort > capacité déclarée

**Note** : Le cashflow est déjà calculé. Il s'agit principalement d'amélioration UX.

---

### S4.4 : Effet de levier

**En tant qu'** investisseur
**Je veux** comprendre l'effet de levier du crédit
**Afin de** optimiser mon financement

**Critères d'acceptation** :
- [x] Formule : Rentabilité Nette / Coût moyen dette
- [x] Explication pédagogique de l'effet de levier (tooltip)
- [ ] Comparaison achat cash vs achat crédit
- [x] Alerte si levier négatif (taux crédit > rentabilité)

**Formule** :
```
Effet de levier = (Rentabilité nette - Taux crédit) × (Emprunt / Fonds propres)
```

---

## 9. Sprint 5 — Charges & Fiscalité Avancée ⏳ À FAIRE

### Stories

| Story ID | Titre | Backlog | Points | Priorité | Statut |
|----------|-------|---------|--------|----------|--------|
| **S5.1** | Charges récupérables | MVP-014 | 3 | P2 | ✅ |
| **S5.2** | Honoraires comptable | ~~MVP-015~~ | ~~1~~ | ✅ FAIT | ✅ |
| **S5.3** | Comparaison régimes fiscaux | MVP-018 | 5 | P2 | ⏳ |
| **S5.4** | Amélioration SCI IS | MVP-019 | 5 | P3 | ⏳ |

**Total restant** : 13 points (S5.2 déjà fait)

### S5.1 : Charges récupérables

**En tant qu'** investisseur
**Je veux** distinguer charges propriétaire et charges récupérables
**Afin d'** avoir un cashflow précis

**Critères d'acceptation** :
- [x] Saisie des charges récupérables (provisions sur charges)
- [x] Distinction charges propriétaire vs charges récupérables
- [x] Impact sur le calcul du cashflow net
- [ ] Info : régularisation annuelle

**Note** : Structure existe déjà (`charges_copro_recuperables` dans spécification), mais pas exploité côté UI.

---

### ~~S5.2 : Honoraires comptable~~ ✅ FAIT

**Implémenté dans** : `rentabilite.ts:131-132`
- `cfe_estimee` : CFE obligatoire LMNP
- `comptable_annuel` : Frais comptable si régime réel

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

**Note** : Tous les régimes sont déjà calculés individuellement. Cette story ajoute la comparaison côte à côte.

**Dépendances** : S2.1, S2.2, S2.3 (✅ Terminés)

---

### S5.4 : Amélioration SCI IS

**En tant qu'** investisseur en SCI IS
**Je veux** simuler l'imposition société et la distribution
**Afin d'** optimiser ma stratégie

**Critères d'acceptation** :
- [ ] Calcul IS : 15% jusqu'à 42 500€, 25% au-delà ✅ FAIT
- [ ] Simulation distribution dividendes ⏳ À FAIRE
- [ ] Flat tax 30% sur dividendes ⏳ À FAIRE
- [ ] Comparaison : capitaliser vs distribuer
- [ ] Impact sur HCSF des associés ✅ FAIT

**Note** : Le calcul IS est fait. Reste la partie dividendes.

---

## 10. Sprint 6 — Comparaison & Finalisation ⏳ À FAIRE

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

## 11. Dépendances entre Stories

```
Sprint 1-2 (TERMINÉS)
    │
    ▼
Sprint 3 (Projections) ◄── Base pour tout ce qui suit
    │
    ├── S4.1, S4.2 dépendent de S3.1, S3.2
    ▼
Sprint 4 (Indicateurs)
    │
    ├── S5.3 peut utiliser S2.1, S2.2, S2.3 (déjà faits)
    ▼
Sprint 5 (Fiscalité avancée)
    │
    ├── S6.3 dépend de S3.1, S4.1
    ▼
Sprint 6 (Comparaison)
```

---

## 12. Prérequis

### 12.1 Epic 1 complétée ✅

- [x] Backend custom fonctionnel
- [x] API `/api/calculate` opérationnelle
- [x] Tests de régression passés
- [x] n8n décommissionné

### 12.2 Sprints 1-2 complétés ✅

- [x] Frais de notaire automatiques
- [x] Tous régimes fiscaux implémentés
- [x] Constantes 2025 à jour (PS 18.6%, micro-BIC différencié)
- [x] CFE et comptable dans les charges

---

## 13. Risques et Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Complexité fiscale | Haut | ~~Haute~~ Mitigé | ✅ Documentation officielle utilisée |
| Calculs amortissement | Moyen | ~~Moyenne~~ Mitigé | ✅ Implémentation validée |
| Performance projections | Moyen | Faible | Calcul lazy, pagination |
| UX formulaire complexe | Moyen | Moyenne | Tests utilisateurs, itérations |

---

## 14. Definition of Done (Epic)

### 14.1 Critères fonctionnels

- [x] Sprints 1-2 complétés
- [ ] Sprints 3-6 à compléter
- [ ] 27 items du backlog MVP implémentés
- [ ] Toutes les user stories validées
- [ ] Tests fonctionnels passés

### 14.2 Critères qualité

- [ ] TypeScript compile sans erreur
- [ ] ESLint passe sans erreur
- [ ] Tests unitaires > 80% couverture (modules calculs)
- [ ] Tests E2E principaux scénarios
- [ ] Performance < 1s pour projections 25 ans

### 14.3 Critères UX

- [ ] Responsive mobile fonctionnel
- [ ] Tooltips et aide contextuelle
- [ ] Messages d'erreur clairs
- [ ] PDF export complet

---

## 15. Métriques de Succès

| Métrique | Cible | Statut |
|----------|-------|--------|
| Couverture régimes fiscaux | 100% cas courants | ✅ Fait |
| Précision calcul rentabilité | Écart < 5% vs expert | ✅ Validé |
| Projections disponibles | 5 à 25 ans | ⏳ Sprint 3 |
| Temps simulation complète | < 5 min | ⏳ À vérifier |
| Taux completion formulaire | > 80% | ⏳ À mesurer |

---

## 16. Références

| Document | Lien |
|----------|------|
| Spécification Calculs | [docs/specification-calculs.md](../specification-calculs.md) |
| PRD | [docs/prd.md](../prd.md) |
| Architecture | [docs/architecture.md](../architecture.md) |
| Backlog MVP | [docs/backlog-mvp.md](../backlog-mvp.md) |
| Epic 1 | [epic-1-infrastructure-backend.md](./epic-1-infrastructure-backend.md) |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
| 2026-01-27 | 2.0 | Mise à jour post-implémentation Sprints 1-2. Intégration spécifications calculs 2025. | John (PM) |
| 2026-01-28 | 2.1 | Mise à jour Sprints 3-4 Terminés et Audit validé. | John (PM) |
