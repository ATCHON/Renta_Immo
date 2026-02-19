# Epic V2-08 : Page de Configuration Back-Office

> **Priorité** : IMPORTANT (long terme) | **Sprint** : Sprint 4+ | **Effort** : 2-4 semaines
> **Statut** : Draft
> **Source** : handoff-sm-regles-metier-v2.md

## Objectif

Transformer toutes les constantes en dur en paramètres configurables via une interface admin avec versioning par année fiscale.

## Attention

**Chantier le plus lourd.** A planifier APRES livraison des corrections critiques (sprints 1-3). Nécessite coordination avec l'architecte.

## Stories

| ID     | Titre                                                 | Effort | Statut |
| ------ | ----------------------------------------------------- | ------ | ------ |
| V2-S19 | Concevoir le schéma de données `ConfigParam`          | M      | Draft  |
| V2-S20 | Créer l'API CRUD pour les paramètres                  | L      | Draft  |
| V2-S21 | Créer l'interface admin des paramètres (8 blocs)      | L      | Draft  |
| V2-S22 | Migrer les constantes du code vers la base de données | L      | Draft  |
| V2-S23 | Système d'alertes pour dispositifs temporaires        | M      | Draft  |
| V2-S24 | Mode Dry Run (simulation impact changement)           | M      | Draft  |

## Fichiers principaux impactés

- Nouveau module `src/app/admin/`
- `src/server/` (nouveau service config)
- Migration Supabase
- `src/config/constants.ts` (refactoring majeur)

## Dépendances

- Dépend de tous les sprints précédents

## Definition of Done

- Interface admin avec les 8 blocs (A à H) du v2
- Versioning par année fiscale
- Fallback sur valeurs en dur si BDD indisponible
- Mode Dry Run opérationnel
