# Renta_Immo

Application web de simulation de rentabilité immobilière (Calcul des rendements, Cashflow, Impôts LMNP/Foncier/SCI, et Scoring Profilé).

## Architecture & Métier
- **Techniques** : Architecture Fullstack, APIs, et BDD → `docs/architecte/architecture-fullstack.md`
- **Fonctionnel (Détaillé)** : Formules mathématiques (TRI, PMT), Taux (IS, Flat Tax, PS 18.6%), et Règles HCSF → `docs/architecte/architecture-fonctionnelle.md`
- **Audit de Conformité** : Rapports de validation métiers → `docs/audit/fonctionnel/`

## Principes de Développement Incontournables

1. **Paradigme de Branche** : Chaque développement s'effectue obligatoirement sur une **nouvelle branche** isolée (`feature/[nom]`, `fix/[nom]`).
2. **TypeScript Strict** : Il est **strictement interdit** d'utiliser le type `any` en TypeScript. Le typage doit être inféré explicitement ou déclaré via des interfaces partagées (`src/types`).
3. **Tests & TDD** :
   - Tester l'application via TU (Tests Unitaires via Vitest), TI (Intégration) ou E2E (via MCP Chrome / Playwright pour le frontend).
   - **Penser au TDD (Test Driven Development)** : Le code produit doit cibler le passage des tests. Ne jamais commit un code sans que les tests soient verts.
   - **Obligation de couverture :** Il est **strictement obligatoire** d'ajouter ou de mettre à jour des Tests Unitaires (TU) lors de **nouveaux développements, corrections de bugs (fix) ou suppressions de code/refactoring**.
   - Par conséquent, après chaque modification des tests ou du code lié, il faut **systématiquement relancer l'ensemble des suites de tests** pour s'assurer d'aucune régression fonctionnelle.
4. **Docs par scope** : Ne charger dans le contexte LLM que ce qui est strictement nécessaire pour la tâche en cours afin d'éviter la pollution cognitive de l'agent.

## Directives Spécifiques par Périmètre
Pour les instructions détaillées par stack, les erreurs récurrentes à éviter et les commandes de test spécifiques, consulte les fichiers dédiés :

- ➡️ [**Développement Backend (Base de Données, API, Moteur de Calcul)**](claude-backend.md)
- ➡️ [**Développement Frontend (UI, Next.js App Router, Zustand)**](claude-frontend.md)
