# Story ARCH-S01 : Rate limiting distribué Upstash Redis

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
> **Notion** : https://www.notion.so/3170eaf0627481549bfbf4113d9fdee7
> **Référence guide** : §8.1 — Guide évolutivité architecture v2.0

---

## 1. Description

**En tant que** système
**Je veux** que le rate limiting soit distribué via Upstash Redis
**Afin de** garantir la cohérence des limites entre toutes les instances Vercel serverless

---

## 2. Contexte

Le rate limiting actuel est **in-memory** (`src/lib/rate-limit.ts`), ce qui signifie que chaque instance Vercel dispose de son propre compteur isolé. Sur un déploiement multi-instances (comportement normal en production Vercel), un utilisateur malveillant peut contourner trivialement le rate limiting en exploitant la distribution des requêtes entre instances.

**Risque identifié** : 🔴 Haut — contournement trivial sur multi-instances Vercel (audit technique 2026-02-07).

**Solution** : Migrer vers `@upstash/ratelimit` avec un store Redis distribué (Upstash), qui maintient les compteurs de manière centralisée.

---

## 3. Fichiers impactés

```
src/lib/rate-limit.ts          ← remplacement du store in-memory par Redis
```

**Variables d'environnement à ajouter :**

```
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
```

---

## 4. Comportement attendu

### Avant (actuel)

```
Instance A: 5 req → compteur A = 5
Instance B: 5 req → compteur B = 5  ← 10 req réelles, pas bloquées
```

### Après (cible)

```
Instance A: 5 req → Redis counter = 5
Instance B: 5 req → Redis counter = 10 → BLOQUÉ
```

---

## 5. Critères d'acceptation

- [ ] `@upstash/ratelimit` installé et configuré
- [ ] `src/lib/rate-limit.ts` utilise Redis distribué (plus aucun store in-memory)
- [ ] Tests unitaires mis à jour (mock Redis)
- [ ] Rate limiting cohérent entre instances Vercel (validé en CI)
- [ ] Variables d'environnement documentées dans `.env.example`

---

## 6. Dépendances

| Type      | Dépendance                                                         |
| --------- | ------------------------------------------------------------------ |
| Prérequis | Compte Upstash créé, ARCH-S03 peut partager le même compte Upstash |
| Bloque    | —                                                                  |

---

## 7. Tests à écrire

- TU : `src/lib/rate-limit.test.ts` — mock `@upstash/ratelimit`, vérifier que le sliding window est correct
- TU : Vérifier fallback si Redis indisponible (ne pas bloquer toutes les requêtes)

---

## 🏗️ Directives Architecte (Winston)

### Stratégie : `slidingWindow`

Utiliser **`slidingWindow`** (et non `fixedWindow` ni `tokenBucket`).

**Pourquoi ?** Le code actuel est un `fixedWindow` implicite (compteur + resetAt). `fixedWindow` autorise un "burst" de `2×limit` requêtes au moment du renouvellement de fenêtre (N req à T-1s + N req à T+1s). `slidingWindow` lisse le trafic dans le temps sans ce défaut. `tokenBucket` est pertinent pour les quotas journaliers, pas pour la protection anti-abus temps réel.

### Limites par endpoint

| Endpoint                                 | Clé Redis                   | Limite     | Fenêtre | Justification                          |
| ---------------------------------------- | --------------------------- | ---------- | ------- | -------------------------------------- |
| `POST /api/calculate`                    | `rl:calculate:{ip}`         | **10 req** | 60s     | CPU intensif — inchangé vs code actuel |
| `GET /api/simulations`                   | `rl:simulations:get:{ip}`   | **60 req** | 60s     | CRUD léger                             |
| `POST /api/simulations`                  | `rl:simulations:post:{ip}`  | **20 req** | 60s     | Écriture DB                            |
| `POST /api/pdf`                          | `rl:pdf:{ip}`               | **5 req**  | 60s     | Génération PDF coûteuse                |
| `POST /api/send-simulation`              | `rl:send:{ip}`              | **3 req**  | 60s     | Anti-spam email (Resend)               |
| `GET/PATCH/DELETE /api/simulations/[id]` | `rl:simulations:write:{ip}` | **30 req** | 60s     | Opérations individuelles               |
| `GET /api/admin/*`                       | Pas de rate limiting        | —          | —       | Routes admin — auth suffisante         |

### Fallback si Upstash indisponible : **fail-open**

Si `@upstash/ratelimit` lève une exception (timeout réseau, service down), **laisser passer la requête** et logger un warning.

**Justification** : L'application est un outil de simulation financière. Bloquer tous les utilisateurs pendant une panne Redis serait inacceptable (fail-closed = 0 service disponible). Le risque d'abus pendant une courte panne Redis est acceptable face à l'impact UX d'un fail-closed.

```typescript
// Pattern de fallback obligatoire dans chaque route
try {
  const result = await rateLimiter.limit(key);
  if (!result.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
} catch (err) {
  logger.warn('[RateLimit] Redis indisponible — fail-open', { err });
  // Laisser passer
}
```

### Client Redis partagé avec ARCH-S03

**Oui, un seul client** : créer `src/lib/redis.ts` exportant une instance `@upstash/redis`. ARCH-S01 et ARCH-S03 l'importent tous les deux. Upstash REST API est stateless côté client — pas de problème de connexions simultanées.

```typescript
// src/lib/redis.ts — client partagé
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### Refactoring `getClientIp`

La fonction `getClientIp` actuellement dans `rate-limit.ts` doit **rester dans ce fichier** — elle est co-localisée avec son usage. Pas de déplacement nécessaire.

### Headers de réponse 429

Conserver les headers `Retry-After` et ajouter `X-RateLimit-Limit` / `X-RateLimit-Remaining` / `X-RateLimit-Reset` pour la transparence côté client (standard de fait).

---

> **Version** : 1.0 | **Architecte** : Winston | **Date** : 2026-03-03

---

## Changelog

| Date       | Version | Description                                                  | Auteur               |
| ---------- | ------- | ------------------------------------------------------------ | -------------------- |
| 2026-03-03 | 1.0     | Création depuis tâche Notion ARCH-S01                        | John (PM)            |
| 2026-03-03 | 1.1     | Directives architecturales complètes                         | Winston (Architecte) |
| 2026-03-03 | 1.2     | Validation SM — story prête pour développement (clarté 9/10) | Bob (SM)             |
