# Prompt Phase 5 — Dashboards & Vues de Suivi

> **Usage** : Exécuter en dernier, après toutes les migrations.
> **Objectif** : Créer les vues agrégées et le dashboard de suivi projet.

---

## PROMPT COMPLET

```
Tu vas créer le dashboard de suivi et toutes les vues utiles pour le projet Renta_Immo dans Notion.
Toutes les données ont été migrées dans les phases précédentes.

IDs des bases :
- DB Épics : {EPICS_DB_ID}
- DB Stories : {STORIES_DB_ID}
- DB Bugs : {BUGS_DB_ID}
- DB Audits : {AUDITS_DB_ID}
- DB Tests : {TESTS_DB_ID}
- DB Sprints : {SPRINTS_DB_ID}
- Page racine : {ROOT_PAGE_ID}

---

## ÉTAPE 1 : Dashboard Principal

Dans la page "📌 Dashboard — Vue d'ensemble", crée :

### Bloc 1 : Résumé Exécutif
Tableau récapitulatif avec callouts :
- 🟢 Stories Done : (compter stories avec statut Done)
- 🟡 Stories En cours : (compter stories avec statut En cours)
- 🔴 Bugs Ouverts : (compter bugs avec statut Ouvert)
- ⏳ Stories Backlog : (compter stories avec statut Backlog)

### Bloc 2 : Sprint en cours
Vue liée à DB Sprints filtrée sur Statut = "En cours"
Vue liée à DB Stories filtrée sur Sprint = "Sprint 4+" et Statut ≠ Done
(Afficher : ID, Titre, Épic, Statut, Priorité, Complexité)

### Bloc 3 : Épics actifs
Vue liée à DB Épics filtrée sur Statut = "En cours"
Afficher en vue Board par Phase

### Bloc 4 : Bugs critiques
Vue liée à DB Bugs filtrée sur Priorité = "Critique" et Statut ≠ Résolu

### Bloc 5 : Derniers audits
Vue liée à DB Audits triée par Date décroissante, limite 5

---

## ÉTAPE 2 : Vues additionnelles pour DB Stories

Crée ces vues dans la DB Stories :

### Vue "🗂️ Par Épic"
- Type : Table
- Regrouper par : Épic
- Colonnes : ID, Titre, Statut, Priorité, Complexité, Sprint
- Tri : Priorité croissante (P0 en premier)

### Vue "🏃 Sprint Actuel"
- Type : Board (Kanban)
- Filtrer : Sprint = "Sprint 4+" OU Sprint = "Sprint 2" (sprint actuel V2)
- Regrouper par : Statut
- Colonnes Kanban : Backlog | Todo | En cours | Review | Done | Bloqué

### Vue "📊 Par Type"
- Type : Table
- Filtrer : aucun
- Regrouper par : Type
- Colonnes : ID, Titre, Épic, Statut, Sprint

### Vue "🔴 Bloquées"
- Type : Table
- Filtrer : Statut = "Bloqué"
- Colonnes : ID, Titre, Épic, Priorité, Dépendances

### Vue "📈 V2 Progress"
- Type : Table
- Filtrer : ID commence par "V2-"
- Regrouper par : Épic
- Colonnes : ID, Titre, Statut, Complexité, Sprint

### Vue "🎯 Backlog Priorisation"
- Type : Table
- Filtrer : Statut = "Backlog" OU Statut = "Todo"
- Tri : Priorité croissante, puis Complexité croissante
- Colonnes : ID, Titre, Type, Épic, Priorité, Complexité, Sprint

---

## ÉTAPE 3 : Vues additionnelles pour DB Épics

### Vue "🗺️ Timeline"
- Type : Timeline
- Regrouper par : Sprint
- Afficher : Titre, Phase, Statut

### Vue "📊 Par Phase"
- Type : Board
- Regrouper par : Phase
- Colonnes Kanban : MVP | V1 | V2 | V3 | Upgrade | Audit

---

## ÉTAPE 4 : Pages de référence statique

### Page "📋 PRD"
Crée une page avec le contenu du PRD. Structure :
- h1 : PRD Brownfield — Renta_Immo
- Callout : "Source : docs/prd.md — Dernière mise à jour : 2026-01-25"
- Les sections principales du PRD (Contexte, Exigences FR, Exigences NF)
- Lien externe vers le fichier GitHub

### Page "🗺️ Roadmap"
- h1 : Roadmap Renta_Immo
- Callout : "Source : docs/roadmap.md"
- Tableau des phases (MVP → V3) avec nombre de features
- Vue embarquée de la DB Épics par phase

### Page "🏗️ Architecture"
- Callout : "Source : docs/architecte/"
- Liens vers les 3 fichiers d'architecture
- Résumé des décisions clés (stack : Next.js 14, Supabase, Better Auth)

### Page "📚 Référentiel Technique"
Sous-pages :
- "🔧 Règles Métier" → résumé de docs/core/
- "🎨 Design System" → résumé de docs/devs-guide/design-system-guide.md
- "👥 Dev Guide" → résumé de docs/devs-guide/

---

## ÉTAPE 5 : Relations finales à établir

Vérifie et complète les relations manquantes :

1. Stories → Dépendances : Lier les stories qui mentionnent des dépendances entre elles
   - V2-S05 → V2-S01
   - V2-S07 → V2-S06
   - V2-S08 → V2-S06
   - AUDIT-108 → AUDIT-105
   - story-tech-XXX qui se chaînent

2. Audits → Stories générées : Vérifier que chaque audit est lié à ses stories

3. Tests → Stories liées : Lier chaque batch de tests aux stories qu'ils couvrent

---

## RÉSULTAT ATTENDU

Dashboard opérationnel avec :
- ✅ Vue d'ensemble projet en temps réel
- ✅ 6 vues Stories pour différents usages
- ✅ 2 vues Épics (Timeline + Par Phase)
- ✅ 4 pages documentation statique
- ✅ Toutes les relations établies

Confirme que le workspace est prêt pour un suivi quotidien.
```

---

## Workflow quotidien après migration

```
Chaque jour / sprint :

1. Ouvrir Dashboard → Sprint actuel
2. Mettre à jour les statuts des stories en cours
3. Ajouter les bugs découverts dans DB Bugs
4. À la fin de sprint : créer entrée dans DB Sprints avec résultats
5. Pour chaque nouvelle story : créer d'abord dans Notion, puis créer le fichier .md correspondant
```
