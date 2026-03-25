---
stepsCompleted: []
inputDocuments:
  [
    'docs/ux/stitch/v1/plan-migration-ux.md',
    "C:\\Users\\alban\\.gemini\\antigravity\\brain\\e9e505dd-ce65-4d1a-b2dc-e62d589060b4\\plan-technique-migration-ux.md",
  ]
---

# Renta_Immo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Renta_Immo, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Le système doit calculer et fournir les KPIs partiels (Cashflow mensuel, Rendement Net, Rentabilité Nette) côté client sans sauvegarde en base de données pour alimenter la barre latérale "Results Anchor".
FR2: Le système doit calculer et exposer le TAEG dans les résultats financiers renvoyés par l'API existante (`FinancementResultat`).
FR3: Le système doit gérer l'affichage de la structure "Comment ça marche" sous forme de sous-pages de contenu (ex: `/comment-ca-marche/lmnp`).
FR4: L'utilisateur doit pouvoir naviguer entre les différents onglets de résultats (Synthèse, Fiscalité, Emprunt) via l'état local du composant sans recharger la page.
FR5: Le bouton "Save Draft" doit requérir une authentification et rediriger vers la page de connexion/inscription si l'utilisateur n'est pas authentifié.
FR6: L'application doit conserver la compatibilité des anciennes URL via une redirection 301 de `/en-savoir-plus` vers `/comment-ca-marche` et conserver le fichier pour éviter des erreurs 404 internes transitoires.

### NonFunctional Requirements

NFR1: Le moteur de calcul doit conserver sa précision absolue (régression 0 tolérée sur les 530+ tests unitaires, validation stricte requise).
NFR2: L'affichage sur mobile doit être responsive et respecter le viewport sans troncature des montants et variables financières.
NFR3: La performance initiale de la page de simulation doit être optimisée pour minimiser le Total Blocking Time (TBT).
NFR4: SEO : Aucune perte de trafic sur les pages de contenu pédagogique restructurées (implémentation stricte des redirections 301).

### Additional Requirements

- [Architecture] Implémenter les tokens design via le système `@theme` natif de Tailwind v4 dans `globals.css` (transposition depuis le CDN utilisé en maquette).
- [Architecture] Utiliser la bibliothèque `lucide-react` existante avec une configuration `strokeWidth={1.5}` pour se rapprocher visuellement des icônes Material Symbols du MVP.
- [Architecture] Étendre le state Zustand (`usePreviewKPIs`, `calculateur-preview.ts`) pour stocker virtuellement les résultats partiels en live pour le layout split-screen.
- [UX] Intégrer et configurer les polices Manrope (titres) et Inter (corps de texte) via `next/font`.
- [UX] La navbar de l'application doit afficher le nouveau nom validé du produit : "Petra Nova".
- [UX] Les éléments d'interface (cartes, formulaires) doivent intégrer les animations de focus et hover (micro-interactions requises par les maquettes "Nordic Minimalist").

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
