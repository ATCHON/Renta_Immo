# PRD Brownfield - Renta_Immo

> **Version** : 1.0
> **Date** : 2026-01-25
> **Statut** : Draft
> **Type** : Brownfield Enhancement

---

## 1. Contexte et Analyse du Projet Existant

### 1.1 Vue d'ensemble

**Renta_Immo** est un simulateur de rentabilité immobilière permettant aux utilisateurs d'évaluer la viabilité financière d'un investissement locatif.

### 1.2 État actuel

| Aspect | Statut |
|--------|--------|
| Frontend | Next.js 14 (App Router) + TypeScript 5.7.3 |
| State Management | Zustand avec localStorage |
| Data Fetching | React Query |
| Validation | Zod |
| Styling | Tailwind CSS |
| Backend | n8n (à remplacer) |

### 1.3 Décision architecturale majeure

> **Changement clé** : La dépendance n8n pour le backend sera **remplacée par un backend custom** pour les calculs, la persistance et la génération PDF.

| Élément | Décision | Validation |
|---------|----------|------------|
| Stack backend | À définir | Architecte |
| Persistance données | À définir | Architecte |
| Génération PDF | MVP | Architecte |
| Comptes utilisateurs | V1 (pas MVP) | Confirmé |

---

## 2. Exigences

### 2.1 Exigences Fonctionnelles (FR)

#### Saisie des données
| ID | Exigence | Priorité |
|----|----------|----------|
| FR1 | Saisie informations bien (type, surface, localisation) | P1 |
| FR2 | Saisie paramètres acquisition (prix, frais notaire, travaux) | P1 |
| FR3 | Saisie paramètres financement (apport, taux, durée) | P1 |
| FR4 | Saisie paramètres fiscaux (régime, TMI) | P1 |
| FR5 | Saisie charges (copropriété, taxe foncière, assurance) | P1 |
| FR6 | Saisie revenus locatifs (loyer, vacance locative) | P1 |

#### Calculs
| ID | Exigence | Priorité |
|----|----------|----------|
| FR7 | Calcul rentabilité brute | P1 |
| FR8 | Calcul rentabilité nette | P1 |
| FR9 | Calcul cashflow mensuel | P1 |
| FR10 | Simulation fiscale (LMNP, LMP, foncier) | P2 |
| FR11 | Projection sur durée de détention | P2 |
| FR12 | Calcul TRI (taux de rendement interne) | P3 |

#### Affichage résultats
| ID | Exigence | Priorité |
|----|----------|----------|
| FR13 | Affichage synthèse rentabilité | P1 |
| FR14 | Graphiques de projection (cashflow, patrimoine) | P2 |
| FR15 | Tableau d'amortissement | P2 |
| FR16 | Indicateurs clés (rendement, effort d'épargne) | P1 |

#### Export et sauvegarde
| ID | Exigence | Priorité |
|----|----------|----------|
| FR17 | Export PDF du rapport | P2 |
| FR18 | Sauvegarde locale (localStorage) | P2 |
| FR19 | Sauvegarde serveur | P2 |
| FR20 | Comparaison de scénarios | P3 |

#### Backend (Nouveau)
| ID | Exigence | Priorité |
|----|----------|----------|
| FR21 | Moteur de calcul autonome (sans n8n) | P1 |
| FR22 | API REST de simulation | P1 |
| FR23 | Génération PDF côté serveur | P2 |
| FR24 | Persistance des simulations | P2 |

### 2.2 Exigences Non-Fonctionnelles (NFR)

| ID | Exigence | Critère |
|----|----------|---------|
| NFR1 | Performance | Calculs < 500ms |
| NFR2 | Responsive | Mobile-first, breakpoints 640/768/1024px |
| NFR3 | Accessibilité | WCAG 2.1 AA |
| NFR4 | Sécurité | Validation inputs, sanitization |
| NFR5 | Maintenabilité | TypeScript strict, tests unitaires |
| NFR6 | Disponibilité | 99.5% uptime |
| NFR7 | SEO | Meta tags, SSR pour pages publiques |

### 2.3 Contraintes (CR)

| ID | Contrainte | Impact |
|----|------------|--------|
| CR1 | Pas de comptes utilisateurs en MVP | Sauvegarde locale uniquement |
| CR2 | Backend custom requis | Développement supplémentaire |
| CR3 | Stack backend à valider | Dépendance architecte |
| CR4 | Budget/Timeline MVP | 14-19 semaines estimées |

---

## 3. Objectifs d'amélioration UI/UX

| Objectif | Description | Priorité |
|----------|-------------|----------|
| Clarté | Formulaire guidé étape par étape | P1 |
| Feedback | Résultats en temps réel | P1 |
| Visualisation | Graphiques interactifs | P2 |
| Mobile | Expérience responsive complète | P2 |
| Aide contextuelle | Tooltips et explications | P2 |

---

## 4. Contraintes Techniques et Intégration

### 4.1 Stack technique confirmée (Frontend)

```
- Next.js 14 (App Router)
- TypeScript 5.7.3 (strict mode)
- Tailwind CSS
- Zustand (state management)
- React Query (data fetching)
- Zod (validation)
```

### 4.2 Stack technique à valider (Backend)

| Élément | Options possibles | Décision |
|---------|-------------------|----------|
| Runtime | Node.js / Deno / Bun | Architecte |
| Framework | Express / Fastify / Hono | Architecte |
| Database | PostgreSQL / SQLite / MongoDB | Architecte |
| PDF | Puppeteer / PDFKit / react-pdf | Architecte |

### 4.3 Points d'intégration

| Point | Description |
|-------|-------------|
| API Frontend ↔ Backend | REST endpoints pour calculs |
| Calculs | Logique dupliquée ou API-only |
| Persistance | localStorage (MVP) + serveur (optionnel MVP) |
| PDF | Génération serveur, téléchargement client |

---

## 5. Structure Epic et Story

### 5.1 Vue d'ensemble

| Epic | Focus | Sprints | Durée estimée |
|------|-------|---------|---------------|
| **Epic 1** | Infrastructure Backend + Migration | Sprint 0 | 3-4 semaines |
| **Epic 2** | Fonctionnalités MVP | Sprints 1-6 | 11-15 semaines |

---

## 6. Détails des Epics

### Epic 1 : Infrastructure Backend + Migration

> **Objectif** : Remplacer la dépendance n8n par un backend custom autonome.

| Story ID | Story | Priorité | Complexité | Critères d'acceptation |
|----------|-------|----------|------------|------------------------|
| S1.1 | Moteur de calcul autonome | P1 | L | Tous les calculs (rentabilité, cashflow, fiscalité) fonctionnent sans dépendance externe |
| S1.2 | API de simulation | P1 | M | Endpoints REST POST/GET pour soumettre et récupérer les calculs |
| S1.3 | Génération PDF autonome | P2 | M | Rapport PDF généré côté serveur sans service externe |
| S1.4 | Sauvegarde simulations serveur | P2 | M | Persistance des simulations côté serveur (tech à valider avec architecte) |

**Dépendances** :
- S1.2 dépend de S1.1
- S1.3 dépend de S1.1
- S1.4 dépend de S1.2

---

### Epic 2 : Fonctionnalités MVP

> **Objectif** : Livrer un simulateur de rentabilité immobilière complet et utilisable.

#### Sprint 1-2 : Formulaire de saisie

| Story ID | Story | Priorité | Critères d'acceptation |
|----------|-------|----------|------------------------|
| S2.1 | Informations bien immobilier | P1 | Type, surface, localisation saisis et validés |
| S2.2 | Paramètres acquisition | P1 | Prix, frais notaire, travaux saisis et validés |
| S2.3 | Paramètres financement | P1 | Apport, taux, durée saisis avec calcul mensualité |
| S2.4 | Paramètres fiscaux | P1 | Régime fiscal et TMI sélectionnables |
| S2.5 | Charges et revenus locatifs | P1 | Toutes charges et loyer saisis |

#### Sprint 3-4 : Calculs et résultats

| Story ID | Story | Priorité | Critères d'acceptation |
|----------|-------|----------|------------------------|
| S2.6 | Calcul rentabilité brute/nette | P1 | Formules correctes, résultats affichés |
| S2.7 | Calcul cashflow mensuel | P1 | Cashflow = Loyer - Charges - Mensualité |
| S2.8 | Simulation fiscale | P2 | Calcul impôt selon régime choisi |
| S2.9 | Affichage résultats synthétiques | P1 | Dashboard avec KPIs clairs |
| S2.10 | Graphiques de projection | P2 | Graphiques cashflow et patrimoine sur durée |

#### Sprint 5-6 : Export et finalisation

| Story ID | Story | Priorité | Critères d'acceptation |
|----------|-------|----------|------------------------|
| S2.11 | Export PDF rapport | P2 | PDF téléchargeable avec toutes les données |
| S2.12 | Sauvegarde locale (localStorage) | P2 | Simulations persistées entre sessions |
| S2.13 | Comparaison scénarios | P3 | Jusqu'à 3 scénarios comparables |
| S2.14 | Responsive mobile | P2 | Utilisable sur écrans < 640px |

---

## 7. Vérification d'intégration

| Checkpoint | Critère de validation |
|------------|----------------------|
| Epic 1 → Epic 2 | L'API backend doit être fonctionnelle avant l'intégration front |
| Calculs front ↔ back | Les résultats doivent être identiques entre calculs locaux et API |
| PDF | Le rapport doit contenir toutes les données de la simulation |
| Persistance | Les données sauvegardées doivent être récupérables intégralement |

---

## 8. Hors scope MVP

| Fonctionnalité | Version cible |
|----------------|---------------|
| Comptes utilisateurs | V1 |
| Authentification | V1 |
| Multi-utilisateurs | V1 |
| Partage de simulations | V1 |
| Historique des simulations (cloud) | V1 |

---

## 9. Métriques de succès

| Métrique | Cible MVP |
|----------|-----------|
| Temps de calcul | < 500ms |
| Couverture tests | > 80% |
| Score Lighthouse | > 90 |
| Taux d'erreur API | < 0.1% |

---

## Annexes

### A. Documents liés

- [Roadmap](./roadmap.md)
- [Backlog MVP](./backlog-mvp.md)

### B. Glossaire

| Terme | Définition |
|-------|------------|
| Rentabilité brute | Loyer annuel / Prix acquisition × 100 |
| Rentabilité nette | (Loyer - Charges) / Prix acquisition × 100 |
| Cashflow | Loyer - Charges - Mensualité crédit |
| TMI | Tranche Marginale d'Imposition |
| LMNP | Loueur Meublé Non Professionnel |
| LMP | Loueur Meublé Professionnel |
| TRI | Taux de Rendement Interne |
