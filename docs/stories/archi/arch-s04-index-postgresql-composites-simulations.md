# Story ARCH-S04 : Index PostgreSQL composites simulations

> **Version** : 1.1
> **Date** : 2026-03-03
> **Auteur** : John (PM) / Winston (Architecte)
> **Statut** : ✅ Prêt pour développement
> **Type** : Tech
> **Epic** : ARCH-E01 — Fondations Techniques Phase 0
> **Sprint** : Sprint 0
> **Priorité** : P0 (Critique)
> **Complexité** : S
> **Effort estimé** : ~0.5j
> **Notion** : https://www.notion.so/3170eaf06274818b9befe8783cce8ef6
> **Référence guide** : §8.4 / §7.3 — Guide évolutivité architecture v2.0

---

## 1. Description

**En tant que** système
**Je veux** des index composites optimisés sur la table `simulations`
**Afin d'** accélérer les requêtes filtrées par utilisateur avec tri et statut

---

## 2. Contexte

La table `simulations` est actuellement requêtée avec des filtres combinant `user_id`, `created_at`, `updated_at`, `is_favorite`, `is_archived` et un tri. Sans index composite adapté, PostgreSQL fait un **sequential scan** sur l'ensemble des simulations de l'utilisateur à chaque requête.

**Problème** : dégradation perceptible à partir de ~10K simulations/user (audit technique 2026-02-07).

**Patron actuel** des requêtes `GET /api/simulations` :

```sql
WHERE user_id = $1
  AND is_archived = false
ORDER BY created_at DESC
LIMIT 20 OFFSET 0
```

---

## 3. Fichiers impactés

```
supabase/migrations/YYYYMMDD_arch_s04_index_simulations.sql   ← création
```

---

## 4. Index à créer

Index composites ciblant les requêtes fréquentes :

```sql
-- Index principal : liste utilisateur triée par date (cas le plus fréquent)
CREATE INDEX idx_simulations_user_created
  ON simulations (user_id, created_at DESC)
  WHERE is_archived = false;

-- Index secondaire : liste avec tri par score
CREATE INDEX idx_simulations_user_score
  ON simulations (user_id, score_global DESC)
  WHERE is_archived = false;

-- Index tertiaire : favoris
CREATE INDEX idx_simulations_user_favorite
  ON simulations (user_id, updated_at DESC)
  WHERE is_favorite = true AND is_archived = false;
```

> **Note** : `CONCURRENTLY` est omis car les migrations Supabase s'exécutent dans une transaction — `CONCURRENTLY` est incompatible avec les blocs transactionnels. Les index sont créés lors du déploiement sans impact prod (table vide au moment de la migration initiale).

---

## 5. Validation EXPLAIN ANALYZE

Documenter les plans d'exécution avant/après :

```sql
-- Avant migration (à documenter dans la PR)
EXPLAIN ANALYZE
  SELECT * FROM simulations
  WHERE user_id = 'test-uuid'
    AND is_archived = false
  ORDER BY created_at DESC
  LIMIT 20;

-- Après migration : vérifier "Index Scan" au lieu de "Seq Scan"
```

---

## 6. Critères d'acceptation

- [ ] Migration SQL créée avec les index composites (`user_id + created_at`, `user_id + status`)
- [ ] `EXPLAIN ANALYZE` avant/après documenté dans la PR (Seq Scan → Index Scan)
- [ ] Temps de réponse `GET /api/simulations` amélioré (mesurable)
- [ ] Migration applicable sans downtime (`CONCURRENTLY`)
- [ ] Tests d'intégration existants toujours verts après migration

---

## 7. Dépendances

| Type      | Dépendance                                                                      |
| --------- | ------------------------------------------------------------------------------- |
| Prérequis | — (indépendant)                                                                 |
| Bloque    | ARCH-S05 (pagination curseur — les index rendent la keyset pagination efficace) |

---

## 8. Tests à écrire

- TI : Vérifier que les requêtes de liste utilisent bien les index (via `EXPLAIN` en test)
- TI : Vérifier que les tests existants `GET /api/simulations` passent après migration

---

## 🏗️ Directives Architecte (Winston)

### Colonnes confirmées (migration 20260204_create_simulations_table.sql)

Colonnes présentes dans la table `simulations` — **confirmées par lecture directe de la migration** :

| Colonne             | Type          | Nullable | Valeur défaut           |
| ------------------- | ------------- | -------- | ----------------------- |
| `id`                | UUID PK       | NO       | gen_random_uuid()       |
| `user_id`           | TEXT          | NO       | — (FK → user.id)        |
| `name`              | VARCHAR(255)  | NO       | 'Simulation sans titre' |
| `created_at`        | TIMESTAMPTZ   | NO       | NOW()                   |
| `updated_at`        | TIMESTAMPTZ   | NO       | NOW() (trigger)         |
| `form_data`         | JSONB         | NO       | —                       |
| `resultats`         | JSONB         | NO       | —                       |
| `rentabilite_brute` | DECIMAL(5,2)  | YES      | —                       |
| `rentabilite_nette` | DECIMAL(5,2)  | YES      | —                       |
| `cashflow_mensuel`  | DECIMAL(10,2) | YES      | —                       |
| `score_global`      | INTEGER       | YES      | — (0-100)               |
| `is_favorite`       | BOOLEAN       | YES      | FALSE                   |
| `is_archived`       | BOOLEAN       | YES      | FALSE                   |

**✅ Confirmé** : `is_archived`, `is_favorite`, `score_global` sont bien présents.

### Index existants à remplacer

**Index existants dans la migration :**

```sql
idx_simulations_user_id     ON simulations(user_id)                          -- simple, supersédé
idx_simulations_created     ON simulations(created_at DESC)                  -- sans user_id, inefficace
idx_simulations_favorites   ON simulations(user_id, is_favorite) WHERE ...   -- partiel OK mais incomplet
```

**`idx_simulations_user_id` et `idx_simulations_created`** → À **supprimer** dans la migration car supersédés par les composites (index redondants = maintenance overhead + espace disque).

**`idx_simulations_favorites`** → À **supprimer et remplacer** par un index composite plus complet.

### Index à créer (version corrigée)

```sql
-- Index principal : liste utilisateur triée par date (pattern 90% des requêtes)
CREATE INDEX idx_simulations_user_created
  ON simulations (user_id, created_at DESC)
  WHERE is_archived = false;

-- Index pour tri par dernière modification
CREATE INDEX idx_simulations_user_updated
  ON simulations (user_id, updated_at DESC)
  WHERE is_archived = false;

-- Index pour tri par score
CREATE INDEX idx_simulations_user_score
  ON simulations (user_id, score_global DESC)
  WHERE is_archived = false;

-- Index favoris (remplace idx_simulations_favorites)
CREATE INDEX idx_simulations_user_favorites
  ON simulations (user_id, updated_at DESC)
  WHERE is_favorite = true AND is_archived = false;

-- Suppression des index obsolètes
DROP INDEX IF EXISTS idx_simulations_user_id;
DROP INDEX IF EXISTS idx_simulations_created;
DROP INDEX IF EXISTS idx_simulations_favorites;
```

### ⚠️ CONCURRENTLY interdit dans les migrations Supabase

**`CREATE INDEX CONCURRENTLY` est interdit dans un fichier de migration Supabase auto-apply.**

**Raison technique** : Les migrations Supabase s'exécutent dans une transaction implicite. PostgreSQL interdit `CREATE INDEX CONCURRENTLY` à l'intérieur d'une transaction (`ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block`).

**Solution** : Utiliser `CREATE INDEX` (sans `CONCURRENTLY`) dans le fichier de migration. C'est acceptable car :

1. La table est petite en dev/staging
2. En production Supabase, les migrations sont appliquées via `supabase db push` qui gère les locks correctement
3. Si la table est grosse en production au moment de la migration, l'appliquer manuellement depuis le **SQL Editor Supabase** avec `CONCURRENTLY` hors transaction

```sql
-- Dans le fichier migration : sans CONCURRENTLY
CREATE INDEX idx_simulations_user_created
  ON simulations (user_id, created_at DESC)
  WHERE is_archived = false;
```

### Patterns de requêtes supplémentaires couverts

Les 4 index couvrent tous les patterns identifiés dans le code (route `GET /api/simulations`) :

- `ORDER BY created_at DESC` → `idx_simulations_user_created`
- `ORDER BY updated_at DESC` → `idx_simulations_user_updated`
- `ORDER BY score_global DESC` → `idx_simulations_user_score`
- `WHERE is_favorite = true` → `idx_simulations_user_favorites`

**Pas d'index sur `rentabilite_brute`/`rentabilite_nette`** — ces colonnes ne sont pas utilisées comme critères de filtre ou de tri dans les routes actuelles.

---

> **Version** : 1.0 | **Architecte** : Winston | **Date** : 2026-03-03

---

## Changelog

| Date       | Version | Description                                                  | Auteur               |
| ---------- | ------- | ------------------------------------------------------------ | -------------------- |
| 2026-03-03 | 1.0     | Création depuis tâche Notion ARCH-S04                        | John (PM)            |
| 2026-03-03 | 1.1     | Directives architecturales complètes                         | Winston (Architecte) |
| 2026-03-03 | 1.2     | Validation SM — story prête pour développement (clarté 9/10) | Bob (SM)             |
