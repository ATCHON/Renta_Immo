# Story ARCH-S05 : Pagination curseur /api/simulations

> **Version** : 1.1
> **Date** : 2026-03-03
> **Auteur** : John (PM) / Winston (Architecte)
> **Statut** : ✅ Prêt pour développement
> **Type** : Tech
> **Epic** : ARCH-E01 — Fondations Techniques Phase 0
> **Sprint** : Sprint 0
> **Priorité** : P0 (Critique)
> **Complexité** : M
> **Effort estimé** : ~1j
> **Notion** : https://www.notion.so/3170eaf0627481a98087e6a473de6ee3
> **Référence guide** : §8.5 / §7.5 — Guide évolutivité architecture v2.0

---

## 1. Description

**En tant que** frontend
**Je veux** une pagination basée sur curseur pour la liste des simulations
**Afin d'** avoir des performances stables quelle que soit la taille du dataset

---

## 2. Contexte

La pagination actuelle (`GET /api/simulations`) utilise `limit/offset` (TECH-020). Ce pattern a un **problème de performance structurel** : `OFFSET N` oblige PostgreSQL à scanner et ignorer les N premières lignes, même avec des index. Plus l'offset est grand, plus c'est lent.

**Exemple :** Offset 1000 → PostgreSQL parcourt 1020 lignes pour en retourner 20.

**Solution** : Pagination keyset (cursor-based) — utilise la valeur du dernier élément comme point de départ de la page suivante, indépendamment de la position.

**Dépendance** : ARCH-S04 (les index composites rendent la keyset pagination performante).

---

## 3. Fichiers impactés

```
src/app/api/simulations/route.ts          ← modification GET handler (cursor logic)
src/types/simulations.ts                  ← nouveaux types CursorPaginationParams / CursorPaginationMeta
src/hooks/useSimulations.ts               ← adaptation React Query (useInfiniteQuery)
src/components/simulations/SimulationsList.tsx  ← bouton "Charger plus" ou infinite scroll
src/app/api/simulations/route.test.ts     ← TI pagination curseur
```

---

## 4. Contrat API

### Ancienne interface (à déprécier progressivement)

```
GET /api/simulations?limit=20&offset=0
```

### Nouvelle interface (cible)

```
GET /api/simulations?cursor=<opaque_string>&limit=20
```

**Request params :**

```typescript
{
  cursor?: string;   // Curseur opaque (base64 de la valeur de tri)
  limit?: number;    // Défaut: 20, Max: 100
  // Filtres maintenus
  favorite?: boolean;
  archived?: boolean;
  sort?: 'created_at' | 'updated_at' | 'score_global';  // défaut: created_at DESC
}
```

**Response :**

```typescript
{
  success: true,
  data: Simulation[],
  meta: {
    next_cursor: string | null,  // null si dernière page
    limit: number,
    has_more: boolean
  }
}
```

---

## 5. Implémentation backend (keyset)

```sql
-- Exemple : page suivante après cursor encodant (created_at = '2026-02-01', id = 'uuid-xxx')
SELECT * FROM simulations
WHERE user_id = $1
  AND is_archived = false
  AND (created_at, id) < ($cursor_created_at, $cursor_id)  -- keyset condition
ORDER BY created_at DESC, id DESC
LIMIT 21;  -- fetcher 1 de plus pour détecter has_more
```

Le curseur est encodé en base64 pour être opaque côté client.

---

## 6. Adaptation frontend

```typescript
// useSimulations.ts — migration vers useInfiniteQuery
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['simulations', filters],
  queryFn: ({ pageParam }) => fetchSimulations({ cursor: pageParam, ...filters }),
  getNextPageParam: (lastPage) => lastPage.meta.next_cursor ?? undefined,
});
```

---

## 7. Critères d'acceptation

- [ ] API supporte `cursor` + `limit` en query params
- [ ] Réponse inclut `next_cursor` si page suivante existe (null si dernière page)
- [ ] Frontend adapté (React Query `useInfiniteQuery` / cursor pagination)
- [ ] Tests d'intégration pagination (première page, page suivante, dernière page)
- [ ] Rétrocompatibilité : l'ancienne interface `offset` continue de fonctionner (dépréciation progressive)

---

## 8. Dépendances

| Type      | Dépendance                                          |
| --------- | --------------------------------------------------- |
| Prérequis | ARCH-S04 (index composites pour performance keyset) |
| Bloque    | —                                                   |

---

## 9. Tests à écrire

- TI : Premier appel sans cursor → retourne première page + `next_cursor`
- TI : Appel avec cursor → retourne page suivante correcte
- TI : Dernière page → `next_cursor: null`, `has_more: false`
- TI : Cursor invalide → 400 Bad Request
- TI : Filtres combinés avec cursor (`favorite=true&cursor=...`)

---

## 🏗️ Directives Architecte (Winston)

### Encodage du curseur : base64 JSON simple

**Stratégie retenue : base64 JSON, pas de signature.**

**Justification** : L'API est **exclusivement interne** — le CORS dans `/api/calculate/route.ts` restreint aux origines autorisées (`ALLOWED_ORIGINS`), aucun client tiers. La sécurité est garantie par le filtrage `WHERE user_id = $auth_user_id` côté serveur : même si un utilisateur malveillant manipule le cursor, il ne peut accéder qu'à ses propres simulations. Un cursor signé (HMAC) ajouterait de la complexité sans bénéfice de sécurité réel.

```typescript
// Encodage
interface CursorPayload {
  value: string | number; // valeur de la colonne de tri (created_at ISO ou score_global)
  id: string; // UUID pour départager les égalités
  sort: 'created_at' | 'updated_at' | 'score_global';
}

function encodeCursor(payload: CursorPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url');
}

function decodeCursor(cursor: string): CursorPayload {
  return JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8')) as CursorPayload;
}
```

**Validation** : Au décodage, valider avec Zod que le payload est bien formé. Retourner `400` si cursor invalide.

### Rétrocompatibilité : migration directe, pas de double mode

**Pas de conservation de `offset`** — migration directe dans cette story.

**Justification** : L'API est interne, le frontend (hooks + composants) est mis à jour **dans la même story** (les fichiers frontend sont listés dans §3). Il n'y a aucun client externe à protéger. Conserver un double mode alourdirait le code pour zéro bénéfice.

**Exception** : Les tests d'intégration existants (`route.test.ts`) utilisent peut-être `offset`. Les **mettre à jour dans cette même story** — ne pas laisser de tests cassés.

### Tri multi-colonnes : adapter le curseur au `sort` actif

Le curseur encode le champ de tri actif pour que la keyset condition soit correcte.

| Paramètre `sort`      | Colonnes keyset      | Index utilisé (ARCH-S04)       |
| --------------------- | -------------------- | ------------------------------ |
| `created_at` (défaut) | `(created_at, id)`   | `idx_simulations_user_created` |
| `updated_at`          | `(updated_at, id)`   | `idx_simulations_user_updated` |
| `score_global`        | `(score_global, id)` | `idx_simulations_user_score`   |

**Requêtes SQL keyset selon le sort :**

```sql
-- sort=created_at (cas fréquent)
WHERE user_id = $1 AND is_archived = false
  AND (created_at, id) < ($cursor_created_at::timestamptz, $cursor_id::uuid)
ORDER BY created_at DESC, id DESC

-- sort=score_global
WHERE user_id = $1 AND is_archived = false
  AND (score_global, id) < ($cursor_score::int, $cursor_id::uuid)
ORDER BY score_global DESC, id DESC
```

**Note** : Pour `score_global`, les valeurs NULL (simulations sans score) doivent être gérées — les placer en fin de liste (`NULLS LAST`).

### URLs partageables : le cursor n'est PAS dans l'URL

**Le cursor ne doit pas être dans les search params de l'URL.**

**Justification** : Le cursor est éphémère — il pointe vers un instant T dans la liste. Le partager dans l'URL crée une URL "périmée" qui pointera sur une mauvaise page si des simulations sont créées/supprimées entretemps. Les filtres (`favorite`, `archived`, `sort`) sont stables et restent dans l'URL.

**Implémentation frontend :**

- Filtres (`favorite`, `archived`, `sort`) → `useSearchParams()` / URL params (conservés)
- Pagination cursor → state React Query `useInfiniteQuery` (ephemeral, pas dans l'URL)
- UI : bouton **"Charger plus"** (pas d'infinite scroll automatique — meilleur pour l'accessibilité et la performance)

```typescript
// Pattern UX recommandé
<Button onClick={() => fetchNextPage()} disabled={!hasNextPage || isFetchingNextPage}>
  {isFetchingNextPage ? 'Chargement...' : 'Charger plus'}
</Button>
```

### Mise à jour du type de réponse (breaking change contrôlé)

L'ancienne réponse incluait `meta.total` et `meta.offset`. Ces champs disparaissent avec la pagination keyset (impossible de calculer le total sans un COUNT(\*) coûteux).

```typescript
// Nouveau meta — supprimer total et offset
meta: {
  next_cursor: string | null,
  limit: number,
  has_more: boolean
  // ❌ Supprimé: total, offset
}
```

---

> **Version** : 1.0 | **Architecte** : Winston | **Date** : 2026-03-03

---

## Changelog

| Date       | Version | Description                                                  | Auteur               |
| ---------- | ------- | ------------------------------------------------------------ | -------------------- |
| 2026-03-03 | 1.0     | Création depuis tâche Notion ARCH-S05                        | John (PM)            |
| 2026-03-03 | 1.1     | Directives architecturales complètes                         | Winston (Architecte) |
| 2026-03-03 | 1.2     | Validation SM — story prête pour développement (clarté 9/10) | Bob (SM)             |
