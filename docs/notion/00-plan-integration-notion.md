# Plan d'Intégration Notion — Renta_Immo

> **Date** : 2026-02-27
> **Objectif** : Migrer, organiser et orchestrer le suivi des sujets depuis `/docs` vers Notion via connexion MCP
> **Branche** : `claude/docs-notion-integration-WdUAB`

---

## 1. Problème actuel

| Limitation | Impact |
|-----------|--------|
| Documentation stockée en Markdown plat dans `/docs` | Aucun suivi de statut |
| Pas de vue centralisée | Impossible de voir l'état du projet d'un coup d'œil |
| Stories/épics déconnectés | Pas de relations entre bugs, audits, tests et stories |
| Pas de timeline | Difficile de planifier les sprints |
| Pas de filtres par type/priorité/statut | Recherche manuelle dans les fichiers |

**Volume actuel** : ~140 fichiers répartis en 10 catégories, 0 suivi dynamique.

---

## 2. Architecture Notion cible

```
🏠 Renta_Immo — HQ
│
├── 📌 Dashboard (vue d'ensemble)
├── 📋 PRD
├── 🗺️ Roadmap
├── 🏗️ Architecture & Décisions
│
├── [DB] 🎯 Épics
├── [DB] 📖 Stories
├── [DB] 🐛 Bugs
├── [DB] 🔍 Audits
├── [DB] 🧪 Tests
├── [DB] 📅 Sprints / Plans
│
└── 📚 Référentiel Technique
    ├── Core / Règles Métier
    ├── UX / Design System
    └── Dev Guide
```

---

## 3. Schéma des bases de données

### 3.1 [DB] Épics

| Propriété | Type | Valeurs |
|-----------|------|---------|
| ID | Text | `epic-1`, `V2-01`, `audit-sprint-1`… |
| Titre | Title | — |
| Phase | Select | `MVP` / `V1` / `V2` / `V3` / `Upgrade` / `Audit` |
| Statut | Status | `Backlog` / `En cours` / `Terminé` / `Annulé` |
| Priorité | Select | `Critique` / `Haute` / `Normale` / `Basse` |
| Sprint(s) | Multi-select | `Sprint 1`… `Sprint 4+` |
| Effort estimé | Text | `2 semaines`, `1 sprint`… |
| Stories | Relation → Stories DB | — |
| Fichiers docs | URL | Lien GitHub vers le fichier source |

**Épics à créer (18 total)** :

| ID Notion | Fichier source | Phase |
|-----------|---------------|-------|
| epic-1 | `epics/epic-1-infrastructure-backend.md` | MVP |
| epic-2 | `epics/epic-2-fonctionnalites-mvp.md` | MVP |
| upgrade-01 | `epics/epic-upgrade-01-dependances.md` | Upgrade |
| V2-01 | `epics/epic-v2-01-corrections-plus-value.md` | V2 |
| V2-02 | `epics/epic-v2-02-vacance-locative.md` | V2 |
| V2-03 | `epics/epic-v2-03-conformite-fiscale-lmnp.md` | V2 |
| V2-04 | `epics/epic-v2-04-dpe-projections.md` | V2 |
| V2-05 | `epics/epic-v2-05-deficit-foncier.md` | V2 |
| V2-06 | `epics/epic-v2-06-scoring-dual-profil.md` | V2 |
| V2-07 | `epics/epic-v2-07-hcsf-ajustable.md` | V2 |
| V2-08 | `epics/epic-v2-08-backoffice-config.md` | V2 |
| sprint-1 | `epics/sprint-planning.md` | MVP |
| sprint-post-1 | `epics/maintenance-sprint-1-post.md` | Maintenance |
| sprint-audit | `epics/sprint-planning-audit-calculs.md` | Audit |
| sprint-v2 | `epics/sprint-planning-v2.md` | V2 |
| sprint4-backoffice | `epics/sprint4-backoffice-architecture.md` | V2 |

---

### 3.2 [DB] Stories

| Propriété | Type | Valeurs |
|-----------|------|---------|
| ID | Text | `V2-S01`, `AUDIT-100`, `story-tech-001`… |
| Titre | Title | — |
| Type | Select | `Métier` / `Tech` / `Audit` / `Upgrade` |
| Épic | Relation → Épics | — |
| Statut | Status | `Backlog` / `Todo` / `En cours` / `Review` / `Done` / `Bloqué` |
| Priorité | Select | `P0` / `P1` / `P2` / `P3` |
| Complexité | Select | `XS` / `S` / `M` / `L` / `XL` |
| Sprint | Select | `Sprint 1`…`Sprint 4+` / `Backlog` |
| Dépendances | Relation → Stories | — |
| Fichiers impactés | Text | Liste des fichiers `src/` |
| Critères d'acceptation | Checkbox (via contenu page) | — |
| Fichier doc | URL | Lien GitHub vers le fichier source |
| Date création | Date | — |
| Date màj | Date | — |

**Volume de stories à migrer (109 total)** :

| Catégorie | Nb | Préfixe |
|-----------|-----|---------|
| Métier V2 | 26 | `v2-s01` à `v2-s26` |
| Métier Sprint | 12 | `2.3.x`, `2.5.x`, `2.6.x`, `S4.x`, `S5.x`, `S6.x` |
| Tech | 25 | `story-tech-001` à `025` |
| Audit Fonctionnel | 11 | `story-audit-100` à `110` |
| Audit Tech | 6 | `story-audit-201` à `206` |
| Audit Corrections | 1 | `story-audit-corrections` |
| Upgrade | 3 | `story-upgrade-001` à `003` |
| Backlog P3 | ~25 | `backlog-audit-evolutions-p3` |
| **Total** | **~109** | — |

---

### 3.3 [DB] Bugs

| Propriété | Type | Valeurs |
|-----------|------|---------|
| ID | Text | `BUG-001`… |
| Titre | Title | — |
| Statut | Status | `Ouvert` / `En cours` / `Résolu` / `Fermé` |
| Priorité | Select | `Critique` / `Haute` / `Normale` |
| Story liée | Relation → Stories | — |
| Sprint découverte | Select | — |
| Sprint correction | Select | — |
| Fichier doc | URL | — |

**Sources** : `docs/bugs/fix-bugs.md`, `docs/bugs/rapport-test-e2e.md`

---

### 3.4 [DB] Audits

| Propriété | Type | Valeurs |
|-----------|------|---------|
| Titre | Title | — |
| Date | Date | — |
| Type | Select | `Fonctionnel` / `Technique` / `UX` / `Tests` |
| Statut | Status | `Planifié` / `En cours` / `Terminé` |
| Stories générées | Relation → Stories | — |
| Épic lié | Relation → Épics | — |
| Fichier doc | URL | — |

**Audits à créer** :

| Titre | Date | Type | Fichier |
|-------|------|------|---------|
| Audit Méthodes Calculs | 2026-02-07 | Fonctionnel | `audit/audit-methodologies-calculs-2026-02-07.md` |
| Audit Technique | 2026-02-07 | Technique | `audit/technique/audit-technique-2026-02-07.md` |
| Audit UX | 2026-02-06 | UX | `ux/audit-ux-2026-02-06.md` |
| Rapport Audit Simulateur | 2026-02-18 | Fonctionnel | `audit/fonctionnel/rapport-audit-simulateur-2026-02-18.md` |
| Revue Audit | — | Fonctionnel | `audit/fonctionnel/revue-audit.md` |
| Étude Impact Dépendances | — | Technique | `audit/technique/etude-impact-dependances.md` |

---

### 3.5 [DB] Tests

| Propriété | Type | Valeurs |
|-----------|------|---------|
| Titre | Title | — |
| Sprint | Select | `Sprint 1`…`Sprint 4` |
| Type | Multi-select | `Unit` / `Integration` / `E2E` / `Régression` |
| Statut | Status | `Planifié` / `En cours` / `Passé` / `Échoué` |
| Nb tests | Number | — |
| Nb passés | Number | — |
| Nb échoués | Number | — |
| Story liée | Relation → Stories | — |
| Fichier doc | URL | — |

---

### 3.6 [DB] Sprints / Plans

| Propriété | Type | Valeurs |
|-----------|------|---------|
| Titre | Title | — |
| Date début | Date | — |
| Date fin | Date | — |
| Type | Select | `Sprint` / `Plan` / `Release` |
| Statut | Status | `Planifié` / `En cours` / `Terminé` |
| Épics inclus | Relation → Épics | — |
| Stories incluses | Relation → Stories | — |
| Effort total | Text | — |

---

## 4. Vues à créer dans Notion

### Dashboard principal (vue d'ensemble)

- **Compteur stories** par statut (Done / En cours / Backlog / Bloqué)
- **Compteur bugs** ouverts
- **Sprint en cours** avec stories liées
- **Dernier audit** effectué
- **Avancement par phase** (MVP → V2 → V3)

### Vues par DB

**Épics** :
- Vue Kanban par statut
- Vue Timeline par sprint
- Vue Table filtrée par phase

**Stories** :
- Vue Kanban par statut (principale)
- Vue Table avec filtre par épic
- Vue Table avec filtre par type (Métier / Tech / Audit)
- Vue Table avec filtre par sprint
- Vue Gallery des stories "En cours"

**Bugs** :
- Vue Table triée par priorité
- Vue Kanban par statut

**Audits** :
- Vue Timeline par date
- Vue Table par type

---

## 5. Plan de migration en 5 phases

### Phase 1 — Setup MCP + Workspace (30 min)

1. Configurer le serveur Notion MCP (`.mcp.json`)
2. Créer l'intégration Notion (token API)
3. Créer la page racine "Renta_Immo — HQ"
4. Créer les 6 bases de données avec leurs propriétés

### Phase 2 — Migration des Épics (1h)

1. Lire chaque fichier `docs/stories/epics/*.md`
2. Créer l'entrée Notion correspondante
3. Associer au bon sprint et phase

### Phase 3 — Migration des Stories (3-4h)

Ordre de migration :
1. Stories tech (`story-tech-001` à `025`) → Épics MVP
2. Stories métier V2 (`v2-s01` à `v2-s26`) → Épics V2
3. Stories audit fonctionnel (`story-audit-100` à `110`) → Épic Audit
4. Stories audit tech (`story-audit-201` à `206`) → Épic Audit
5. Stories upgrade (`story-upgrade-001` à `003`) → Épic Upgrade
6. Stories métier sprint (`2.3.x`, `S4.x`…) → Épics MVP/V1
7. Stories backlog P3 → Backlog Notion

### Phase 4 — Migration Bugs, Audits, Tests (1h)

1. Extraire les bugs de `docs/bugs/` → DB Bugs
2. Créer les entrées d'audit → DB Audits
3. Créer les entrées de tests → DB Tests

### Phase 5 — Documentation de référence (1h)

1. Copier le PRD en page Notion (avec titre et blocs)
2. Copier la Roadmap
3. Lier les docs architecture
4. Créer les pages UX / Dev Guide
5. Créer le Dashboard avec les vues agrégées

---

## 6. Règles de synchronisation Git ↔ Notion

| Événement | Action |
|-----------|--------|
| Nouvelle story créée dans `/docs` | Créer entrée dans DB Stories |
| Story passée à "Done" | Mettre à jour statut Notion |
| Nouveau bug dans `/docs/bugs/` | Créer entrée dans DB Bugs |
| Nouveau sprint planning | Créer entrée dans DB Sprints |
| Nouveau audit | Créer entrée dans DB Audits |
| Mise à jour PRD/Roadmap | Mettre à jour la page Notion correspondante |

> **Convention** : Le fichier Markdown reste la source de vérité pour le contenu détaillé. Notion est la source de vérité pour le **statut** et les **relations**.

---

## 7. Fichiers créés dans ce repo

```
docs/notion/
├── 00-plan-integration-notion.md    ← Ce fichier
├── 01-prompt-setup-workspace.md     ← Prompt Phase 1 : créer le workspace
├── 02-prompt-migration-epics.md     ← Prompt Phase 2 : migrer les épics
├── 03-prompt-migration-stories.md   ← Prompt Phase 3 : migrer les stories
├── 04-prompt-migration-rest.md      ← Prompt Phase 4 : bugs/audits/tests
└── 05-prompt-dashboards.md          ← Prompt Phase 5 : dashboards
.mcp.json                            ← Config MCP Notion (token à renseigner)
```
