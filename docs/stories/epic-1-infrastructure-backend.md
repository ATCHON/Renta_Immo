# Epic 1 : Infrastructure Backend + Migration

> **Version** : 1.0
> **Date** : 2026-01-26
> **Auteur** : John (PM)
> **Statut** : Ready for Development

---

## 1. Vue d'ensemble

### 1.1 Objectif de l'Epic

Remplacer la dépendance n8n par un backend custom autonome intégré à Next.js, garantissant l'autonomie, la performance et la maintenabilité du simulateur de rentabilité immobilière.

### 1.2 Contexte

Le projet Renta_Immo utilise actuellement n8n comme backend pour les calculs. Cette dépendance externe crée des risques de maintenance et de performance. L'Epic 1 vise à internaliser toute la logique métier dans l'application Next.js existante.

### 1.3 Valeur Business

| Bénéfice | Description |
|----------|-------------|
| **Autonomie** | Plus de dépendance externe pour les calculs |
| **Performance** | Temps de réponse < 500ms garanti |
| **Maintenabilité** | Code TypeScript typé, testable |
| **Coût** | Réduction des coûts d'infrastructure |

---

## 2. Scope

### 2.1 Inclus (In Scope)

- Moteur de calcul complet (rentabilité, cashflow, fiscalité, HCSF)
- API REST `/api/calculate`
- Validation des entrées avec Zod
- Scoring et recommandations
- Migration transparente du frontend

### 2.2 Exclus (Out of Scope)

- Génération PDF (Epic 1 - Phase 2)
- Persistance Supabase (Epic 1 - Phase 2)
- Nouvelles fonctionnalités MVP (Epic 2)
- Comptes utilisateurs (V1)

---

## 3. Stories

### 3.1 Sprint 0.1 — Fondations Backend (1 semaine)

| Story ID | Titre | Description | Points | Priorité |
|----------|-------|-------------|--------|----------|
| **TECH-001** | Structure calculs | Créer `src/server/calculations/` avec orchestrateur `index.ts` | 2 | P1 |
| **TECH-002** | Validation entrées | Implémenter `validation.ts` avec schémas Zod et normalisation | 3 | P1 |

**Objectif Sprint** : Structure et validation en place

**Critères d'acceptation Sprint** :
- [ ] `npm run type-check` passe sans erreur
- [ ] `performCalculations()` appelable (retourne erreur validation si input invalide)

---

### 3.2 Sprint 0.2 — Calculs Core (1.5 semaines)

| Story ID | Titre | Description | Points | Priorité |
|----------|-------|-------------|--------|----------|
| **TECH-003** | Calculs rentabilité | Implémenter `rentabilite.ts` (brute, nette, cashflow, mensualité) | 5 | P1 |
| **TECH-004** | Calculs fiscalité | Implémenter `fiscalite.ts` (IR, IS, régimes nu/LMNP) | 5 | P1 |
| **TECH-005** | Analyse HCSF | Implémenter `hcsf.ts` (taux endettement, conformité 35%) | 3 | P1 |

**Objectif Sprint** : Tous les calculs métier implémentés

**Critères d'acceptation Sprint** :
- [ ] Rentabilité brute/nette/nette-nette calculées correctement
- [ ] Cashflow mensuel/annuel corrects
- [ ] Fiscalité IR et IS fonctionnelles
- [ ] Taux HCSF correct selon mode (nom propre / SCI)

---

### 3.3 Sprint 0.3 — Intégration (1 semaine)

| Story ID | Titre | Description | Points | Priorité |
|----------|-------|-------------|--------|----------|
| **TECH-006** | Synthèse scoring | Implémenter `synthese.ts` (score /100, recommandations) | 3 | P1 |
| **TECH-007** | Tests régression | Comparer résultats avec n8n (dataset référence) | 5 | P1 |
| **TECH-008** | Route POST /api/calculate | Créer endpoint avec CORS et gestion erreurs | 3 | P1 |
| **TECH-009** | Intégration frontend | Modifier `src/lib/api.ts` vers API interne | 1 | P1 |

**Objectif Sprint** : API fonctionnelle, frontend connecté, n8n décommissionné

**Critères d'acceptation Sprint** :
- [ ] POST `/api/calculate` retourne résultats corrects
- [ ] Frontend utilise API interne (n8n décommissionné)
- [ ] Tests régression : écart < 0.01% vs n8n
- [ ] Performance < 500ms

---

## 4. Stories Détaillées

### TECH-001 : Structure calculs

**En tant que** développeur
**Je veux** une structure de code modulaire pour les calculs backend
**Afin de** faciliter la maintenance et les tests

**Critères d'acceptation** :
- [ ] Dossier `src/server/calculations/` créé
- [ ] Fichier `index.ts` avec fonction `performCalculations(input: unknown)`
- [ ] Fichier `types.ts` avec types et constantes internes
- [ ] Barrel export configuré
- [ ] TypeScript compile sans erreur

**Fichiers à créer** :
```
src/server/calculations/
├── index.ts          # Orchestrateur principal
├── types.ts          # Types et constantes
└── (autres modules)
```

---

### TECH-002 : Validation entrées

**En tant que** développeur
**Je veux** valider toutes les entrées utilisateur
**Afin de** garantir la fiabilité des calculs

**Critères d'acceptation** :
- [ ] Schémas Zod pour toutes les entrées (bien, financement, exploitation, structure)
- [ ] Fonction `validateFormData(input)` avec messages d'erreur clairs
- [ ] Fonction `applyDefaults(data)` pour valeurs par défaut
- [ ] Fonction `normalizeData(data)` pour normalisation (%, décimales)
- [ ] Types d'erreur `ValidationError` avec code, champ, détails

**Fichier** : `src/server/calculations/validation.ts`

---

### TECH-003 : Calculs rentabilité

**En tant qu'** utilisateur
**Je veux** obtenir les calculs de rentabilité
**Afin de** évaluer la viabilité de mon investissement

**Critères d'acceptation** :
- [ ] `calculerMensualite(capital, taux, duree, assurance)` — Formule PMT
- [ ] `calculerChargesAnnuelles(exploitation, loyer)` — Somme des charges
- [ ] `calculerRentabilite(bien, financement, exploitation)` — Orchestration
- [ ] Rentabilité brute = (Loyer × 12) / Prix × 100
- [ ] Rentabilité nette = (Loyer × 12 - Charges) / Prix × 100
- [ ] Cashflow = Loyer - (Charges/12) - Mensualité

**Fichier** : `src/server/calculations/rentabilite.ts`

---

### TECH-004 : Calculs fiscalité

**En tant qu'** utilisateur
**Je veux** connaître l'impact fiscal de mon investissement
**Afin d'** optimiser ma stratégie

**Critères d'acceptation** :
- [ ] Régime Nom Propre (IR) : Base × TMI + Base × 17.2% (PS)
- [ ] Régime SCI à l'IS : 15% jusqu'à 42 500€, 25% au-delà
- [ ] Amortissement 2% pour SCI IS
- [ ] Calcul `rentabilite_nette_nette` (après impôts)
- [ ] Support des régimes : nu micro, nu réel, LMNP micro, LMNP réel

**Fichier** : `src/server/calculations/fiscalite.ts`

---

### TECH-005 : Analyse HCSF

**En tant qu'** utilisateur
**Je veux** vérifier ma conformité aux règles HCSF
**Afin de** savoir si ma banque acceptera le financement

**Critères d'acceptation** :
- [ ] Taux d'endettement calculé (seuil 35%)
- [ ] Revenus locatifs pondérés à 70%
- [ ] Mode nom propre : calcul sur investisseur principal
- [ ] Mode SCI IS : calcul par associé (quote-part)
- [ ] Alertes si non-conformité

**Fichier** : `src/server/calculations/hcsf.ts`

---

### TECH-006 : Synthèse scoring

**En tant qu'** utilisateur
**Je veux** un score global et des recommandations
**Afin de** prendre une décision éclairée

**Critères d'acceptation** :
- [ ] Score global 0-100 points avec pondération
- [ ] Critères : autofinancement, rentabilité ≥7%, conformité HCSF, bonus ≥10%
- [ ] Évaluations : Excellent / Bon / Moyen / Faible
- [ ] Liste des points d'attention
- [ ] Recommandations personnalisées

**Fichier** : `src/server/calculations/synthese.ts`

---

### TECH-007 : Tests régression

**En tant que** équipe QA
**Je veux** valider que les résultats sont identiques à n8n
**Afin de** garantir une migration sans régression

**Critères d'acceptation** :
- [ ] Dataset de référence : 10-20 cas types documentés
- [ ] Script de comparaison automatisé
- [ ] Tolérance : écart < 0.01%
- [ ] Rapport de test avec détails des écarts
- [ ] Tous les cas passent avant mise en production

---

### TECH-008 : Route POST /api/calculate

**En tant que** frontend
**Je veux** un endpoint API pour soumettre les calculs
**Afin de** remplacer l'appel n8n

**Critères d'acceptation** :
- [ ] Endpoint `POST /api/calculate` créé
- [ ] Headers CORS configurés
- [ ] Preflight OPTIONS supporté
- [ ] Response format identique à n8n
- [ ] Gestion erreurs avec codes explicites (VALIDATION_ERROR, CALCULATION_ERROR, SERVER_ERROR)
- [ ] Timeout configuré (30s max)

**Fichier** : `src/app/api/calculate/route.ts`

**Format Response (Succès)** :
```typescript
{
  success: true,
  resultats: CalculResultats,
  pdf_url: string | null,
  timestamp: string,
  alertes: string[]
}
```

---

### TECH-009 : Intégration frontend

**En tant que** utilisateur
**Je veux** que l'application fonctionne de manière transparente
**Afin de** ne pas percevoir le changement de backend

**Critères d'acceptation** :
- [ ] Modifier `src/lib/api.ts` : URL n8n → `/api/calculate`
- [ ] Aucun changement visible côté utilisateur
- [ ] Store Zustand inchangé
- [ ] Composants résultats inchangés
- [ ] Variable `NEXT_PUBLIC_N8N_WEBHOOK_URL` dépréciée

**Fichier** : `src/lib/api.ts`

---

## 5. Dépendances

### 5.1 Graphe de dépendances

```
TECH-001 (Structure)
    │
    ▼
TECH-002 (Validation)
    │
    ├─────────────┬─────────────┐
    ▼             ▼             ▼
TECH-003      TECH-004      TECH-005
(Rentabilité) (Fiscalité)   (HCSF)
    │             │             │
    └─────────────┼─────────────┘
                  ▼
            TECH-006 (Synthèse)
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
TECH-007      TECH-008      (Phase 2)
(Tests)       (API Route)
                  │
                  ▼
            TECH-009 (Frontend)
```

### 5.2 Dépendances externes

| Dépendance | Type | Impact |
|------------|------|--------|
| Schémas Zod existants | Interne | Réutiliser `src/lib/validators.ts` |
| Types existants | Interne | Réutiliser `src/types/` |
| n8n (actuel) | Externe | À décommissionner après TECH-009 |

---

## 6. Risques et Mitigations

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Écarts calculs vs n8n | Haut | Moyenne | Dataset référence + tests régression (TECH-007) |
| Complexité fiscale | Moyen | Moyenne | Validation expert-comptable si nécessaire |
| Performance dégradée | Moyen | Faible | Benchmark avant/après, optimisation lazy |
| Régression frontend | Haut | Faible | Tests E2E manuels complets |

---

## 7. Definition of Done (Epic)

### 7.1 Critères techniques

- [ ] Tous les modules implémentés (`validation`, `rentabilite`, `fiscalite`, `hcsf`, `synthese`)
- [ ] API Route `/api/calculate` fonctionnelle
- [ ] TypeScript compile sans erreur (`npm run type-check`)
- [ ] ESLint passe sans erreur (`npm run lint`)
- [ ] Pas de `any` explicite dans le code

### 7.2 Critères fonctionnels

- [ ] Résultats identiques à n8n (tolérance 0.01%)
- [ ] Performance < 500ms
- [ ] Frontend connecté à l'API interne
- [ ] n8n décommissionné

### 7.3 Critères qualité

- [ ] Tests régression passent (10-20 cas)
- [ ] Documentation JSDoc fonctions publiques
- [ ] Code review approuvée pour chaque PR

---

## 8. Métriques de Succès

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Temps de réponse API | < 500ms | Vercel Analytics |
| Précision calculs | Identique n8n (±0.01%) | Tests régression |
| Erreurs API | < 0.1% | Logs |
| Couverture tests | > 80% (Phase 2) | Vitest |

---

## 9. Phase 2 (Post-MVP Core)

Ces stories seront développées après la validation du backend core :

| Story ID | Titre | Description | Sprint |
|----------|-------|-------------|--------|
| TECH-011 | Setup react-pdf | Installation @react-pdf/renderer | Sprint 1 |
| TECH-012 | Template rapport | Créer template PDF React | Sprint 1 |
| TECH-013 | Route /api/pdf | Endpoint génération PDF | Sprint 1 |
| TECH-014 | Intégration UI PDF | Bouton téléchargement | Sprint 1 |
| TECH-015 | Setup Supabase | Configuration projet et clés | Sprint 2 |
| TECH-016 | Schéma BDD | Table `simulations` | Sprint 2 |
| TECH-017 | Client Supabase | Clients browser et server | Sprint 2 |
| TECH-018 | API CRUD simulations | Routes `/api/simulations` | Sprint 2 |
| TECH-019 | Intégration UI | Liste et sauvegarde simulations | Sprint 2 |

---

## 10. Références

| Document | Lien |
|----------|------|
| PRD | [docs/prd.md](../prd.md) |
| Architecture | [docs/architecture.md](../architecture.md) |
| Backlog MVP | [docs/backlog-mvp.md](../backlog-mvp.md) |
| Items liés | MVP-024, MVP-025 |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-01-26 | 1.0 | Création initiale | John (PM) |
