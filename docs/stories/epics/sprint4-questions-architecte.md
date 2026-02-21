# Sprint 4 — Questions pour l'architecte

> **Généré le** : 2026-02-16 par Claude Code (analyse pré-implémentation)
> **Sprint** : Sprint 4+ — Back-Office Configuration (V2-S19 à V2-S24)
> **Contexte** : Questions issues de l'exploration du codebase avant conception de l'architecture.

---

## Questions critiques (bloquantes)

### 1. Système de rôles admin

`src/lib/auth.ts` — Better Auth est configuré sans plugin de rôles. La table `user` n'a pas de colonne `role`.

Pour protéger `/admin/*` et les routes `/api/admin/*`, deux options :

| Option                                   | Description                                                                                                                      | Avantages                                       | Inconvénients                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ |
| **A** — Migration SQL simple             | `ALTER TABLE "user" ADD COLUMN role TEXT DEFAULT 'user'` + check `session.user.role === 'admin'` dans un helper `requireAdmin()` | Minimal, cohérent avec l'archi existante        | Role non typé dans Better Auth SDK               |
| **B** — Plugin `adminPlugin` Better Auth | Plugin officiel Better Auth avec gestion des rôles intégrée                                                                      | Typage complet, fonctionnalités supplémentaires | Dépendance supplémentaire, migration plus lourde |

**Décision requise** : Option A ou B ?

---

### 2. Promotion du premier compte admin

Comment le premier utilisateur admin est-il créé ?

- **Option A** : Commande SQL manuelle `UPDATE "user" SET role = 'admin' WHERE email = 'admin@...'`
- **Option B** : Script `scripts/promote-admin.mjs` (similaire à `scripts/test-auth.mjs` existant)
- **Option C** : Variable d'environnement `ADMIN_EMAIL` → promotion automatique au premier login

**Décision requise** : laquelle ?

---

### 3. Scope V2-S22 — Quelles constantes migrer en BDD ?

`src/config/constants.ts` contient ~50 valeurs de natures très différentes. Tout migrer serait un refactoring massif.

**Proposition** : ne migrer que les constantes **réglementaires scalaires** (valeurs numériques simples susceptibles de changer par la loi, sans redéploiement) :

| Bloc            | Constantes candidates                                                                                                    | Constantes à exclure                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| A — Fiscalité   | `TAUX_PS_FONCIER`, `TAUX_PS_REVENUS_BIC_LMNP`, `MICRO_FONCIER.*`, `MICRO_BIC.*.{ABATTEMENT,PLAFOND}`, `IS.*`, `FLAT_TAX` | —                                          |
| B — Foncier     | `DEFICIT_FONCIER.*`                                                                                                      | —                                          |
| C — Plus-value  | `PLUS_VALUE.{TAUX_IR, TAUX_PS, FORFAIT_*}`, `PLUS_VALUE.SEUIL_SURTAXE`                                                   | `BAREME_SURTAXE` (tableau)                 |
| D — HCSF        | `HCSF.{TAUX_MAX, DUREE_MAX_ANNEES, PONDERATION_LOCATIFS}`                                                                | `HCSF.REVENUS_ESTIMES` (map TMI→revenu)    |
| E — DPE         | `PROJECTION.DECOTE_DPE.*`                                                                                                | —                                          |
| F — Scoring     | `LMP.*`, `RESTE_A_VIVRE.*`                                                                                               | `SCORING_PROFIL` (objet imbriqué complexe) |
| G — Charges     | `DEFAULTS.*`, `CFE.SEUIL_EXONERATION`, `FRAIS_REVENTE.*`                                                                 | —                                          |
| H — Projections | `PROJECTION.{INFLATION_LOYER, INFLATION_CHARGES, REVALORISATION_BIEN}`                                                   | `PROJECTION.HORIZONS` (tableau)            |

**Exclure définitivement** : `BAREME_EMOLUMENTS` (tableau barémique), `BAREME_SURTAXE` (tableau), `HORIZONS` (tableau), `SCORING_PROFIL` (objet imbriqué), `PART_TERRAIN_DEFAUT` (map), `AMORTISSEMENT.COMPOSANTS` (objet imbriqué), `NOTAIRE.DMTO` (groupe).

**Décision requise** : valider ou amender cette sélection.

---

## Questions importantes (impactent le design)

### 4. V2-S24 Mode Dry Run — source des cas tests

La story mentionne "5 cas tests prédéfinis (profils investisseurs représentatifs)".

| Option                           | Description                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **A — Fixtures hardcodées**      | 5 jeux de données `FormData` définis dans le code (`src/server/admin/dry-run-fixtures.ts`)             |
| **B — Simulations sauvegardées** | L'admin désigne 5 simulations existantes en BDD comme "cas de référence" (flag `is_dry_run_reference`) |
| **C — Hybride**                  | Fixtures hardcodées par défaut, remplaçables par des simulations réelles via l'UI                      |

**Décision requise** : option A, B ou C ?

---

### 5. V2-S23 — Destinataire des emails d'alerte

L'email 90j avant expiration d'un dispositif temporaire part à qui ?

- **Option A** : Email fixe défini dans `.env` (`ADMIN_ALERT_EMAIL`)
- **Option B** : Tous les utilisateurs avec `role = 'admin'` en BDD
- **Option C** : Pas d'email pour l'instant — uniquement l'affichage dans le dashboard admin (AC1 + AC2 suffisent pour le MVP)

---

### 6. Versioning par année fiscale — lecture dans les calculs

`config_params` est versionné par `anneeFiscale`. Lors de la lecture dans le moteur de calcul (V2-S22) :

- **Option A** : Toujours lire l'année en cours `new Date().getFullYear()`
- **Option B** : Lire l'année passée en paramètre du formulaire (le formulaire n'a pas ce champ actuellement)
- **Option C** : Paramètre `anneeFiscale` optionnel, défaut = année en cours

**Implication** : les simulations historiques (sauvegardées en 2025 avec les taux 2025) recalculées en 2026 utiliseraient les taux 2026. Est-ce le comportement attendu ?

---

### 7. URL du back-office admin

`/admin/params` ou `/backoffice/params` ?

- `/admin` est la convention Next.js standard
- `/backoffice` est plus explicite pour les utilisateurs métier

---

## Questions mineures (recommandation disponible)

### 8. Cache ConfigService

Redis vs cache mémoire Node.js pour `ConfigService` (V2-S22) :

| Solution                            | TTL suggéré | Avantages                           | Inconvénients                                                |
| ----------------------------------- | ----------- | ----------------------------------- | ------------------------------------------------------------ |
| **Cache mémoire** (Map + timestamp) | 5 min       | Zéro dépendance, simple             | Perdu à chaque cold start Vercel, incohérent entre instances |
| **Redis / Upstash**                 | 5 min       | Partagé entre instances, persistant | Service supplémentaire (~5€/mois Upstash)                    |

**Recommandation** : cache mémoire suffisant pour un back-office admin à faible trafic. La valeur est recalculée au prochain cold start (fréquent sur Vercel free tier). À revoir si le trafic augmente.

---

### 9. Table `config_params_audit` — visibilité UI

La story V2-S20 demande d'enregistrer chaque modification dans `config_params_audit`. Faut-il :

- **Option A** : Créer la table + alimenter via l'API uniquement (pas d'UI dans ce sprint)
- **Option B** : Créer la table + afficher l'historique dans l'interface V2-S21 (AC6 de la story le demande explicitement)

Note : l'AC6 de V2-S21 dit "Historique des modifications visible par paramètre" — semble confirmer Option B.

---

## Fichiers clés identifiés

| Fichier                                                     | Rôle dans Sprint 4                                            |
| ----------------------------------------------------------- | ------------------------------------------------------------- |
| `src/config/constants.ts`                                   | Source de vérité — valeurs à migrer en BDD                    |
| `src/lib/auth.ts`                                           | À étendre pour le système de rôles                            |
| `src/middleware.ts`                                         | À étendre : matcher `/admin/:path*` + check rôle              |
| `src/lib/supabase/server.ts`                                | `createAdminClient()` — accès DB pour toutes les routes admin |
| `src/app/api/simulations/route.ts`                          | Pattern de référence pour les nouvelles routes admin          |
| `supabase/migrations/20260204_create_simulations_table.sql` | Format de référence pour les migrations                       |
| `src/lib/email.ts`                                          | Client Resend — réutilisable pour les alertes V2-S23          |

---

_Document généré automatiquement — Claude Code, 2026-02-16_
