# 📋 Processus de Gestion de Projet : Renta_Immo

Ce document décrit les processus de suivi et d'organisation du projet **Renta_Immo**, basés sur la structure du Dashboard Notion de l'équipe. L'objectif est de garantir la clarté du suivi, l'alignement de l'équipe et la traçabilité des tâches (Stories, Bugs, Audits).

## 1️⃣ Le Workflow Quotidien (Routine de développement)

La rigueur commence par une mise à jour constante du Dashboard Notion pour refléter la réalité du code.

1.  **Démarrer sa journée** : Ouvrir Notion sur la page `Dashboard — Vue d'ensemble`. Consulter la section **🏃 Bloc 2 - Sprint/Epics/Stories en cours** ou la _DB Stories_ en filtrant sur le Sprint actuel.
2.  **Mise à jour des statuts** : Dès qu'une tâche (Story/Bug) est commencée, bloquée, en review ou terminée, mettre à jour son **Statut** immédiatement dans Notion.
3.  **Création d'une nouvelle Story** :
    - **Dans Notion d'abord** : Créer l'entrée dans la _DB Stories_ (attribuer un ID, la lier à une Epic, définir la priorité/complexité).
    - **Dans le code ensuite** : Créer le fichier Markdown (`.md`) d'implémentation correspondant (ex: `docs/stories/V2-S14.md`) pour détailler techniquement la tâche.
4.  **Découverte d'un Bug** :
    - Tout comportement anormal découvert doit être documenté dans la **🐞 DB Bugs**.
    - Penser à vérifier le prochain ID disponible (ex: `BUG-010`).
5.  **Clôture de Sprint** : À la fin de chaque période de sprint, créer une entrée de synthèse dans la **📅 DB Sprints & Plans** avec les résultats, ce qui a été achevé et ce qui est reporté.

## 2️⃣ Utilisation des Blocs du Dashboard

Le Dashboard est votre salle de contrôle :

- **🔢 Bloc 1 — Backlog** : Contient toutes les tâches et idées non encore planifiées dans un sprint. À consulter lors des phases de _Sprint Planning_.
- **🏃 Bloc 2 — Sprint en cours** : Votre espace de travail actuel. Ne contient que les éléments (Stories/Epics) assignés au sprint actif.
- **🟥 Bloc 3 — Bugs Critiques** : Correspond à un affichage filtré de la _DB Bugs_ (Priorité = Critique, Statut ≠ Résolu). **Ces anomalies bloquantes ou majeures en production/développement ont la priorité absolue sur les Stories de fonctionnalités.**
- **📝 Bloc 4 — Audits** : L'historique et les résolutions des audits techniques, de sécurité ou de qualité. Si un travail d'implémentation découle d'un audit (ex: mise à jour de dépendances suite à `AUDIT-105`), il doit lui être lié.

## 3️⃣ Écosystème des Bases de Données (DB)

Chaque donnée appartient à une base spécifique. Utilisez les liens rapides du Dashboard pour des recherches avancées :

- **📖 DB Épics** : Les grands chantiers fonctionnels ou techniques qui regroupent plusieurs Stories.
- **📝 DB Stories** : Les unités de travail concrètes, implémentées par les développeurs.
- **🐞 DB Bugs** : Le registre des corrections à apporter, avec leur criticité.
- **🔍 DB Audits** : Les rapports d'évaluation du code ou du produit (ex: Technique, Méthodologie, UX).
- **🧪 DB Tests** : Suivi des plans de tests et des validations d'assurance qualité.
- **📅 DB Sprints & Plans** : Vision macro du calendrier de livraison et des objectifs de chaque cycle.

## 4️⃣ Documentation et Architecture

Avant d'entamer une nouvelle tâche (Epics/Story), il est impératif de se référer à la documentation technique racine pour respecter les normes du projet :

- **Lieu de vérité architectural** : Dossier `docs/architecte/`
  - `architecture-fullstack.md` : Choix d'infrastructure, de déploiement et de pattern de code.
  - `architecture-fonctionnelle.md` : Règles de gestion métier (calculs fiscaux, DPE, OGA, etc.).
- **Stack Technique à respecter** : `Next.js 14`, `Supabase`, `Better Auth`, `Tailwind v3`, `Vitest`, `Playwright`.
