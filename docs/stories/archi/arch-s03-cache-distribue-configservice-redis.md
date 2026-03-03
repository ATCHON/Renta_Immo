# Story ARCH-S03 : Cache distribué ConfigService Upstash Redis

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
> **Notion** : https://www.notion.so/3170eaf06274818bbc30cb71561a6161
> **Référence guide** : §8.3 — Guide évolutivité architecture v2.0

---

## 1. Description

**En tant que** système
**Je veux** que la configuration fiscale soit mise en cache dans Redis
**Afin d'** éviter les requêtes DB répétées à chaque calcul et garantir la cohérence en multi-instances

---

## 2. Contexte

Le `ConfigService` charge actuellement la configuration fiscale (taux IS, prélèvements sociaux, tranches d'imposition, etc.) depuis la base de données Supabase à chaque requête de calcul. Sur un déploiement multi-instances Vercel :

1. Chaque instance fait ses propres requêtes DB → **latence accumulée**
2. Si la config change en BDD, certaines instances peuvent avoir des valeurs différentes → **incohérence**

**Risque identifié** : 🔴 Haut — config non cohérente si scale horizontal (audit technique 2026-02-07).

**Solution** : Cache distribué dans Upstash Redis avec TTL configurable. Invalidation explicite lors des mises à jour de config (via Back-Office, futur Sprint 4).

---

## 3. Fichiers impactés

```
src/server/config/config.service.ts    ← ajout couche de cache Redis
src/lib/redis.ts                       ← création client Redis partagé (avec ARCH-S01)
src/server/config/config.service.test.ts ← TU mise à jour
```

**Variables d'environnement :**

```
UPSTASH_REDIS_REST_URL       ← partagé avec ARCH-S01
UPSTASH_REDIS_REST_TOKEN     ← partagé avec ARCH-S01
CONFIG_CACHE_TTL_SECONDS     ← TTL configurable (défaut: 300s = 5min)
```

---

## 4. Comportement attendu

### Flux de lecture avec cache

```
Request calcul
    ↓
ConfigService.get()
    ↓
Redis cache HIT? → retourner config (< 1ms)
    ↓ MISS
Supabase DB query → stocker dans Redis (TTL: 5min)
    ↓
retourner config
```

### Invalidation du cache

Lors d'une mise à jour de configuration (Back-Office Sprint 4) :

```
Admin modifie config
    ↓
Supabase UPDATE
    ↓
Redis DEL config:* (invalidation)
    ↓
Prochain calcul rechargera depuis DB
```

---

## 5. Critères d'acceptation

- [ ] `ConfigService` utilise Redis avec TTL configurable via `CONFIG_CACHE_TTL_SECONDS`
- [ ] Invalidation du cache lors des mises à jour de configuration
- [ ] Tests unitaires du cache (mock Redis — cache hit, cache miss, invalidation)
- [ ] Latence calcul réduite (mesurable — ajouter un log de temps en dev)
- [ ] Client Redis partagé avec ARCH-S01 (un seul `src/lib/redis.ts`)

---

## 6. Dépendances

| Type      | Dépendance                                                       |
| --------- | ---------------------------------------------------------------- |
| Prérequis | ARCH-S01 (partage du client Upstash Redis)                       |
| Bloque    | V2-S19 à S24 (Back-Office Config — Sprint 4, invalidation cache) |

---

## 7. Tests à écrire

- TU : `config.service.test.ts` — mock Redis
  - Cache miss → appel DB → stockage Redis
  - Cache hit → pas d'appel DB
  - Invalidation → cache vidé → prochain appel recharge DB
- TU : Vérifier que le TTL est bien appliqué
- TU : Vérifier comportement si Redis indisponible (fallback DB sans planter)

---

## 🏗️ Directives Architecte (Winston)

### Clé de cache Redis

**Format :** `config:fiscal:{year}` — granulaire par année fiscale.

**Justification :** Le `ConfigService` existant est déjà structuré par année (`getConfig(anneeFiscale?: number)`). La clé par année est cohérente avec ce modèle et permet une invalidation chirurgicale (ex: mise à jour de la config 2026 sans toucher à 2025).

```typescript
const CACHE_KEY = (year: number) => `config:fiscal:${year}`;
// Exemples : "config:fiscal:2026", "config:fiscal:2025"
```

**Pas** de `config:all` (trop grossier) ni de clé par paramètre individuel (trop granulaire, complexifie sans bénéfice).

### TTL recommandé

**TTL : 300 secondes (5 minutes)** — confirmé et inchangé vs l'implémentation in-memory actuelle.

La config fiscale change au maximum 1 fois/an (LFSS, décrets). Le TTL de 5 min est ultra-conservateur (bien). Rendre configurable via `CONFIG_CACHE_TTL_SECONDS` est bien prévu — valeur par défaut `300`.

### Comportement si Redis est down : **fail-open confirmé**

Si Redis est indisponible, tomber sur la requête Supabase DB directement. Si Supabase est aussi indisponible, utiliser `getFallbackConfig()` (déjà implémenté dans le code actuel).

Le pattern de cascaded fallback est déjà dans le code existant (`getFallbackConfig()`). L'étendre :

```
Redis HIT → retourner
Redis MISS ou DOWN → Supabase DB
Supabase DOWN → getFallbackConfig() (valeurs hardcodées)
```

**Important** : En cas de Redis down, **ne pas logger en error** (trop bruité) mais en **warn** avec le contexte. Logger uniquement 1 fois / 60s pour éviter le log flooding (utiliser un debounce sur le warning).

### Interface du cache : directement dans `ConfigService`

**Pas d'abstraction `CacheService` générique** pour Sprint 0.

**Justification YAGNI** : Il n'y a pas d'autre service à cacher à ce stade. Le `ConfigService` est déjà un Singleton avec sa propre logique de cache (Map in-memory). Remplacer ce Map par Redis directement dans `ConfigService` est la modification minimale. Une abstraction `CacheService` ne sera justifiée qu'à partir du moment où ≥ 3 services différents ont besoin de cache (principe DRY réel vs anticipé).

**Conservation du pattern Singleton** : Le Singleton `ConfigService` garde tout son sens — il centralise la logique de cache, même si le store sous-jacent est désormais Redis (distribué).

### Stratégie d'invalidation : DEL ciblé par clé

**`redis.del(CACHE_KEY(year))`** — invalidation ciblée, pas de pattern matching.

**Raison :** `KEYS config:*` est une opération O(N) bloquante en production Redis — formellement déconseillée. Upstash Redis supporte `SCAN` pour le pattern matching, mais c'est inutile ici car on sait exactement quelle année est modifiée lors d'une update de config.

```typescript
// Dans ConfigService.invalidateCache()
async invalidateCache(year?: number): Promise<void> {
  if (year) {
    await redis.del(CACHE_KEY(year));
  } else {
    // Invalidation globale : itérer sur les années connues (2024, 2025, 2026, 2027)
    const years = [2024, 2025, 2026, 2027];
    await Promise.all(years.map(y => redis.del(CACHE_KEY(y))));
  }
}
```

Pour l'invalidation globale, utiliser une liste d'années connues (±2 ans autour de l'année courante). Pas de KEYS/SCAN.

### Sérialisation JSON

Upstash Redis stocke les valeurs comme des strings. `ResolvedConfig` (objet plat de ~50 nombres) doit être sérialisé en JSON avant stockage et désérialisé à la lecture. Taille estimée : ~2-3KB — parfaitement adapté à Redis.

```typescript
// Stocker
await redis.set(CACHE_KEY(year), JSON.stringify(resolved), { ex: ttlSeconds });

// Lire
const cached = await redis.get<string>(CACHE_KEY(year));
if (cached) return JSON.parse(cached) as ResolvedConfig;
```

---

> **Version** : 1.0 | **Architecte** : Winston | **Date** : 2026-03-03

---

## Changelog

| Date       | Version | Description                                                  | Auteur               |
| ---------- | ------- | ------------------------------------------------------------ | -------------------- |
| 2026-03-03 | 1.0     | Création depuis tâche Notion ARCH-S03                        | John (PM)            |
| 2026-03-03 | 1.1     | Directives architecturales complètes                         | Winston (Architecte) |
| 2026-03-03 | 1.2     | Validation SM — story prête pour développement (clarté 9/10) | Bob (SM)             |
