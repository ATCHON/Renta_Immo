# Petra Nova

## Graphify — Navigation par le graphe de connaissance

Ce projet dispose d'un graphe de connaissance dans `graphify-out/`.

**Règle par défaut :** Avant de lire des fichiers sources pour comprendre l'architecture ou les dépendances, lire `graphify-out/GRAPH_REPORT.md` et naviguer via `graph.json`. Ne lire les fichiers sources directement que si l'utilisateur le demande explicitement ou si une modification de code est nécessaire.

- Avant de répondre à une question d'architecture, lire `graphify-out/GRAPH_REPORT.md` (god nodes + communautés)
- Utiliser `/graphify query "<question>"` pour naviguer le graphe plutôt que Glob/Grep sur les fichiers bruts
- Si `graphify-out/wiki/index.md` existe, naviguer par là en priorité

**Mise à jour du graphe — actions obligatoires :**
- Après modification de fichiers `src/` : suggérer `/graphify src/ --update` (AST uniquement, gratuit — le git hook post-commit le fait aussi automatiquement)
- Après ajout ou modification de fichiers dans `docs/` : rappeler à l'utilisateur de lancer manuellement `/graphify docs/ --update` car `docs/` est gitignored et le git hook ne se déclenche pas

Application web de simulation de rentabilité immobilière (Calcul des rendements, Cashflow, Impôts LMNP/Foncier/SCI, et Scoring Profilé).

## Principes de Développement Incontournables

1. **Paradigme de Branche** : Chaque développement s'effectue obligatoirement sur une **nouvelle branche** isolée (`feature/[nom]`, `fix/[nom]`).
2. **TypeScript Strict** : Il est **strictement interdit** d'utiliser le type `any` en TypeScript. Le typage doit être inféré explicitement ou déclaré via des interfaces partagées (`src/types`).
3. **Tests & TDD** :
   - Tester l'application via TU (Tests Unitaires via Vitest), TI (Intégration) ou E2E (via MCP Chrome / Playwright pour le frontend).
   - **Penser au TDD (Test Driven Development)** : Le code produit doit cibler le passage des tests. Ne jamais commit un code sans que les tests soient verts.
   - **Obligation de couverture :** Il est **strictement obligatoire** d'ajouter ou de mettre à jour des Tests Unitaires (TU) lors de **nouveaux développements, corrections de bugs (fix) ou suppressions de code/refactoring**.
   - Par conséquent, après chaque modification des tests ou du code lié, il faut **systématiquement relancer l'ensemble des suites de tests** pour s'assurer d'aucune régression fonctionnelle.
4. **Docs par scope** : Ne charger dans le contexte LLM que ce qui est strictement nécessaire pour la tâche en cours afin d'éviter la pollution cognitive de l'agent.

## Directives Backend — Erreurs Courantes & Commandes de Test

**Commandes de test :**
- Tests unitaires : `npm run test` (Vitest, rapide — relancer après toute intervention)
- Tests d'intégration seuls : `npm run test:integration` (sans DB, config statique dans `tests/integration/config/`)
- Validation finale : `npm run test:e2e` (Playwright, inclut les API)
- Pour les tests d'intégration, ajouter `--coverage=false` (sinon exit code 1 sur seuil 50% non atteint)

**Gotchas critiques :**
- **`||` vs `??`** : Tout champ pouvant valoir `0` (ex: `tmi`) doit utiliser `??` (nullish), jamais `||` (falsy).
- **`abattement_ir` / `abattement_ps` en %** : Ces champs sont en pourcentage entier (0-100), pas décimal. Ex: exonération totale = `100`.
- **Cache paramétrage Redis** : Le `ConfigService` met en cache les paramètres BDD (taux fiscaux, HCSF) dans Redis avec un TTL de 5 min (défaut, configurable via `CONFIG_CACHE_TTL_SECONDS`). Après modification en base Supabase, invalider via l'API Admin ou attendre l'expiration.
- **Schéma Supabase évolue** : Après modification du schéma, régénérer `src/types/database.types.ts` et vérifier l'absence d'artefacts de corruption (voir KI `database_types_corruption`).
- **Vitest + Next** : Ne pas importer de code SSR/browser dans les tests Vitest (env `node`). Voir `vitest.config.mts`.

## Directives Frontend — Erreurs Courantes

**Gotchas critiques :**
- **Recharts SSR** : Importer `PatrimoineChart`, `CashflowChart` et tout graphique Recharts via `next/dynamic` avec `ssr: false` — sinon hydration mismatch. Pattern en place dans `Dashboard.tsx` à maintenir absolument.
- **Middleware Edge Runtime** : Le module `pg` (Better Auth) ne doit pas être importé dans le middleware global (Edge Runtime). Il est isolé dans `src/instrumentation.node.ts` — ne pas y importer de code browser/SSR.
- **État UI en store Zustand** : L'état de navigation et de saisie est dans le store `useCalculateurStore` (`src/stores/`), pas en React State local ni en Search Params URL.

**Compromis :** Ces directives privilégient la prudence sur la vitesse. Pour les tâches triviales, exercez votre jugement.

## 1. Penser Avant de Coder

**Ne pas supposer. Ne pas masquer la confusion. Exposer les compromis.**

Avant d'implémenter :
- Énoncer explicitement vos hypothèses. En cas de doute, demander.
- Si plusieurs interprétations existent, les présenter — ne pas choisir en silence.
- Si une approche plus simple existe, la signaler. Argumenter quand c'est justifié.
- Si quelque chose est flou, s'arrêter. Nommer ce qui prête à confusion. Demander.

## 2. La Simplicité d'Abord

**Le minimum de code qui résout le problème. Rien de spéculatif.**

- Aucune fonctionnalité au-delà de ce qui a été demandé.
- Aucune abstraction pour du code à usage unique.
- Aucune « flexibilité » ou « configurabilité » non demandée.
- Aucune gestion d'erreur pour des scénarios impossibles.
- Si vous écrivez 200 lignes alors que 50 suffisent, réécrivez.

Se demander : « Un ingénieur senior dirait-il que c'est trop compliqué ? » Si oui, simplifier.

## 3. Modifications Chirurgicales

**Ne toucher qu'à ce qui est nécessaire. Ne nettoyer que ce que vous avez sali.**

Lors de la modification de code existant :
- Ne pas « améliorer » le code adjacent, les commentaires ou le formatage.
- Ne pas refactorer ce qui ne pose pas de problème.
- Respecter le style existant, même si vous feriez autrement.
- Si du code mort non lié est repéré, le signaler — ne pas le supprimer.

Lorsque vos modifications créent des orphelins :
- Supprimer les imports/variables/fonctions rendus inutilisés par VOS modifications.
- Ne pas supprimer le code mort préexistant sauf si cela est demandé.

Le critère : chaque ligne modifiée doit se tracer directement à la demande de l'utilisateur.

## 4. Exécution Orientée Objectif

**Définir des critères de succès. Itérer jusqu'à validation.**

Transformer les tâches en objectifs vérifiables :
- « Ajouter une validation » → « Écrire des tests pour les entrées invalides, puis les faire passer »
- « Corriger le bug » → « Écrire un test qui le reproduit, puis le faire passer »
- « Refactorer X » → « S'assurer que les tests passent avant et après »

Pour les tâches en plusieurs étapes, énoncer un bref plan :
```
1. [Étape] → vérification : [contrôle]
2. [Étape] → vérification : [contrôle]
3. [Étape] → vérification : [contrôle]
```

Des critères de succès solides permettent d'itérer de façon autonome. Des critères faibles (« faire en sorte que ça marche ») nécessitent des clarifications constantes.

---

**Ces directives fonctionnent si :** moins de modifications inutiles dans les diffs, moins de réécritures dues à la sur-ingénierie, et les questions de clarification arrivent avant l'implémentation plutôt qu'après les erreurs.