# Prompt Phase 1 — Setup Workspace Notion

> **Usage** : Coller ce prompt dans Claude Code avec le serveur MCP Notion actif.
> **Prérequis** : Token Notion configuré dans `.mcp.json`, intégration Notion créée avec accès à la page cible.

---

## PROMPT COMPLET — À copier et exécuter avec MCP Notion actif

```
Tu es en charge de créer le workspace Notion pour le projet Renta_Immo, un simulateur de rentabilité immobilière Next.js.

Voici ce que tu dois faire, étape par étape, en utilisant les outils MCP Notion disponibles :

---

## ÉTAPE 1 : Créer la page racine

Crée une page Notion nommée "🏠 Renta_Immo — HQ" avec l'icône 🏠.
Elle contiendra tout le workspace du projet.

Dans cette page, ajoute une en-tête de bienvenue :
- Titre h1 : "Renta_Immo — Simulateur de Rentabilité Immobilière"
- Paragraphe : "Workspace central de suivi du projet. Source de vérité pour les statuts, relations et avancement."
- Date de création : 2026-02-27

---

## ÉTAPE 2 : Créer les 6 bases de données

### 2.1 Base "🎯 Épics"

Crée une base de données "🎯 Épics" avec ces propriétés :
- "ID" (type: rich_text)
- "Titre" (type: title) — propriété principale
- "Phase" (type: select) avec options : MVP, V1, V2, V3, Upgrade, Audit, Maintenance
- "Statut" (type: status) avec options : Backlog, Todo, En cours, Review, Terminé, Annulé
- "Priorité" (type: select) avec options : Critique, Haute, Normale, Basse
- "Sprint" (type: multi_select) avec options : Sprint 1, Sprint 2, Sprint 3, Sprint 4, Sprint 4+, Backlog
- "Effort estimé" (type: rich_text)
- "Fichier doc" (type: url)
- "Date création" (type: date)

### 2.2 Base "📖 Stories"

Crée une base de données "📖 Stories" avec ces propriétés :
- "ID" (type: rich_text)
- "Titre" (type: title) — propriété principale
- "Type" (type: select) avec options : Métier, Tech, Audit, Upgrade, Backlog
- "Épic" (type: relation vers la DB Épics)
- "Statut" (type: status) avec options : Backlog, Todo, En cours, Review, Done, Bloqué
- "Priorité" (type: select) avec options : P0, P1, P2, P3
- "Complexité" (type: select) avec options : XS, S, M, L, XL
- "Sprint" (type: select) avec options : Sprint 1, Sprint 2, Sprint 3, Sprint 4, Sprint 4+, Backlog
- "Dépendances" (type: relation vers la DB Stories elle-même)
- "Fichiers impactés" (type: rich_text)
- "Fichier doc" (type: url)
- "Date création" (type: date)
- "Date màj" (type: date)

### 2.3 Base "🐛 Bugs"

Crée une base de données "🐛 Bugs" avec ces propriétés :
- "ID" (type: rich_text)
- "Titre" (type: title) — propriété principale
- "Statut" (type: status) avec options : Ouvert, En cours, Résolu, Fermé
- "Priorité" (type: select) avec options : Critique, Haute, Normale, Basse
- "Sévérité" (type: select) avec options : Bloquant, Majeur, Mineur
- "Story liée" (type: relation vers DB Stories)
- "Sprint découverte" (type: select) avec options : Sprint 1, Sprint 2, Sprint 3, Sprint 4
- "Sprint correction" (type: select) avec options : Sprint 1, Sprint 2, Sprint 3, Sprint 4, Non planifié
- "Fichier doc" (type: url)

### 2.4 Base "🔍 Audits"

Crée une base de données "🔍 Audits" avec ces propriétés :
- "Titre" (type: title) — propriété principale
- "Date" (type: date)
- "Type" (type: select) avec options : Fonctionnel, Technique, UX, Tests, Performance
- "Statut" (type: status) avec options : Planifié, En cours, Terminé
- "Stories générées" (type: relation vers DB Stories)
- "Épic lié" (type: relation vers DB Épics)
- "Résumé" (type: rich_text)
- "Fichier doc" (type: url)

### 2.5 Base "🧪 Tests"

Crée une base de données "🧪 Tests" avec ces propriétés :
- "Titre" (type: title) — propriété principale
- "Sprint" (type: select) avec options : Sprint 1, Sprint 2, Sprint 3, Sprint 4
- "Type" (type: multi_select) avec options : Unit, Integration, E2E, Régression, Performance
- "Statut" (type: status) avec options : Planifié, En cours, Passé, Échoué, Partiel
- "Nb tests" (type: number)
- "Nb passés" (type: number)
- "Nb échoués" (type: number)
- "Story liée" (type: relation vers DB Stories)
- "Fichier doc" (type: url)

### 2.6 Base "📅 Sprints & Plans"

Crée une base de données "📅 Sprints & Plans" avec ces propriétés :
- "Titre" (type: title) — propriété principale
- "Date début" (type: date)
- "Date fin" (type: date)
- "Type" (type: select) avec options : Sprint, Plan, Release, Maintenance
- "Statut" (type: status) avec options : Planifié, En cours, Terminé
- "Épics inclus" (type: relation vers DB Épics)
- "Stories incluses" (type: relation vers DB Stories)
- "Effort total" (type: rich_text)
- "Fichier doc" (type: url)

---

## ÉTAPE 3 : Créer les pages de documentation statique

Dans la page racine "🏠 Renta_Immo — HQ", crée ces sous-pages :
1. "📋 PRD" — avec mention "Voir fichier : docs/prd.md"
2. "🗺️ Roadmap" — avec mention "Voir fichier : docs/roadmap.md"
3. "🏗️ Architecture & Décisions" — avec mention "Voir dossier : docs/architecte/"
4. "📚 Référentiel Technique" — sous-page contenant :
   - "🔧 Core / Règles Métier" → docs/core/
   - "🎨 UX / Design System" → docs/ux/
   - "👥 Dev Guide" → docs/devs-guide/

---

## ÉTAPE 4 : Créer le Dashboard

Crée une page "📌 Dashboard — Vue d'ensemble" en première position dans la page racine.

Contenu du dashboard :
- h2 "🎯 Épics en cours" + vue liée à la DB Épics filtrée sur Statut = "En cours"
- h2 "📖 Stories sprint actuel" + vue liée à la DB Stories filtrée sur Sprint = "Sprint 4+" et Statut ≠ Done
- h2 "🐛 Bugs ouverts" + vue liée à la DB Bugs filtrée sur Statut = "Ouvert"
- h2 "🔍 Derniers audits" + vue liée à la DB Audits triée par Date décroissante

---

## RÉSULTAT ATTENDU

Confirme la création de :
- ✅ 1 page racine "🏠 Renta_Immo — HQ"
- ✅ 6 bases de données avec toutes leurs propriétés
- ✅ 4 pages de documentation statique
- ✅ 1 page Dashboard

Retourne les IDs Notion de chaque base de données créée (nécessaires pour les phases suivantes).
```

---

## Notes d'utilisation

- Ce prompt doit être exécuté **en premier**, avant les migrations
- Conserver les **IDs des DB** retournés — ils seront nécessaires pour les prompts phases 2 à 5
- Si une DB existe déjà, la réutiliser sans écraser
