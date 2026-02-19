# Story AUDIT-203 : Tests unitaires — Routes API CRUD simulations

> **Priorite** : P4-3 (Tests & DevOps)
> **Effort** : 2 jours
> **Statut** : A faire
> **Source** : Audit technique 2026-02-07, Section 5.1
> **Dependance** : AUDIT-201 (configuration Vitest)

---

## 1. User Story

**En tant que** développeur
**Je veux** des tests unitaires couvrant toutes les routes CRUD des simulations
**Afin de** garantir que les opérations de création, lecture, mise à jour et suppression fonctionnent correctement et de détecter les régressions

---

## 2. Contexte

### 2.1 Périmètre actuel

Un seul fichier de test API existe : `tests/unit/api/calculate.test.ts` (7 tests pour `/api/calculate`). Les routes CRUD simulations ne sont pas testées :

- `GET /api/simulations` — listing avec filtres, pagination, tri
- `POST /api/simulations` — création
- `GET /api/simulations/[id]` — lecture
- `PUT /api/simulations/[id]` — mise à jour
- `DELETE /api/simulations/[id]` — suppression

Ces routes contiennent des logiques critiques : validation des entrées, injection SQL corrigée (sort/search), rate limiting, authentification obligatoire, pagination sécurisée.

### 2.2 Stratégie de test

Les routes API Next.js utilisent des fonctions exportées (`GET`, `POST`, etc.) qu'on peut tester directement en important le module. Les dépendances externes sont mockées :

- `src/lib/supabase/admin` → mock retournant des données simulées
- `src/lib/auth` → mock retournant une session authentifiée ou null
- `src/lib/rate-limit` → mock permissif (pas limité en test)

---

## 3. Critères d'acceptation

### 3.1 Tests pour `GET /api/simulations`

- [ ] Retourne 200 avec une liste de simulations pour un utilisateur authentifié
- [ ] Retourne 401 si la session est absente
- [ ] Filtre par `status=favorites` et retourne uniquement les favoris
- [ ] Filtre par `status=archived` et retourne uniquement les archivées
- [ ] Le paramètre `sort` accepte uniquement les colonnes autorisées (whitelist)
- [ ] Une valeur `sort` invalide est remplacée par `created_at` (pas d'erreur)
- [ ] La recherche avec `search=term` filtre les simulations par nom
- [ ] Les caractères spéciaux dans `search` (`%`, `_`) sont échappés sans erreur
- [ ] La pagination avec `limit` et `offset` valides retourne les bons items
- [ ] `limit` hors bornes ([1, 100]) est corrigé silencieusement
- [ ] `offset` négatif est corrigé à 0

### 3.2 Tests pour `POST /api/simulations`

- [ ] Retourne 201 avec la simulation créée pour un body valide
- [ ] Retourne 401 si non authentifié
- [ ] Retourne 400 si le body est vide ou malformé
- [ ] Retourne 400 si les champs obligatoires (`name`, `form_data`, `resultats`) sont absents
- [ ] Le champ `score_global` est arrondi à l'entier avant insertion (jamais de décimal en DB)

### 3.3 Tests pour `GET /api/simulations/[id]`

- [ ] Retourne 200 avec la simulation complète si elle appartient à l'utilisateur
- [ ] Retourne 404 si la simulation n'existe pas
- [ ] Retourne 403 (ou 404) si la simulation appartient à un autre utilisateur
- [ ] Retourne 401 si non authentifié

### 3.4 Tests pour `PUT /api/simulations/[id]`

- [ ] Retourne 200 après mise à jour avec un body valide
- [ ] Retourne 400 si le body est invalide
- [ ] Retourne 401 si non authentifié
- [ ] Retourne 404 si la simulation n'existe pas ou n'appartient pas à l'utilisateur
- [ ] Les champs de mise à jour partielle (`name`, `is_favorite`, `is_archived`) fonctionnent indépendamment

### 3.5 Tests pour `DELETE /api/simulations/[id]`

- [ ] Retourne 200 (ou 204) après suppression réussie
- [ ] Retourne 401 si non authentifié
- [ ] Retourne 404 si la simulation n'existe pas ou n'appartient pas à l'utilisateur

---

## 4. Spécifications techniques

### 4.1 Structure des fichiers de test

```
tests/unit/api/
├── calculate.test.ts        (existant)
├── simulations.test.ts      (nouveau — GET list + POST)
└── simulations-id.test.ts   (nouveau — GET/PUT/DELETE par id)
```

### 4.2 Pattern de mock Supabase

```typescript
// Mock du client Supabase admin
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: MOCK_SIMULATION, error: null }),
    })),
  })),
}));
```

### 4.3 Mock d'authentification

```typescript
// Session authentifiée
vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn().mockResolvedValue({
        session: { userId: 'user-123' },
      }),
    },
  },
}));

// Pour les tests non authentifiés, remplacer par :
// getSession: vi.fn().mockResolvedValue({ session: null })
```

### 4.4 Mock rate limiter

```typescript
vi.mock('@/lib/rate-limit', () => ({
  withRateLimit: vi.fn().mockImplementation((_req, _config, handler) => handler()),
}));
```

### 4.5 Données de mock

```typescript
const MOCK_SIMULATION = {
  id: 'sim-123',
  user_id: 'user-123',
  name: 'Simulation test',
  is_favorite: false,
  is_archived: false,
  rentabilite_nette: 5.2,
  score_global: 72,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const MOCK_SIMULATION_FULL = {
  ...MOCK_SIMULATION,
  form_data: { bien: {}, financement: {} },
  resultats: { rentabilite: {}, hcsf: {} },
};
```

### 4.6 Fichiers source à couvrir

| Fichier                                 | Couverture cible |
| --------------------------------------- | ---------------- |
| `src/app/api/simulations/route.ts`      | > 80%            |
| `src/app/api/simulations/[id]/route.ts` | > 80%            |

---

## 5. Cas de test critiques (sécurité)

### 5.1 Injection SQL via sort

```typescript
it('should reject invalid sort column', async () => {
  const req = new NextRequest(
    'http://localhost/api/simulations?sort=password; DROP TABLE simulations--'
  );
  const res = await GET(req);
  // Doit soit retourner 200 avec sort par défaut, soit 400
  expect([200, 400]).toContain(res.status);
  if (res.status === 200) {
    // Vérifier que la requête Supabase a utilisé 'created_at' comme sort
  }
});
```

### 5.2 Injection LIKE via search

```typescript
it('should escape LIKE wildcards in search', async () => {
  const req = new NextRequest('http://localhost/api/simulations?search=test%25admin');
  const res = await GET(req);
  expect(res.status).toBe(200);
  // Vérifier que le mock Supabase a été appelé avec le terme échappé
});
```

---

## 6. Définition of Done

- [ ] Tous les tests des 3.1 à 3.5 sont implémentés (minimum 30 tests)
- [ ] Couverture `src/app/api/simulations/` > 80%
- [ ] `npm run test` passe sans erreur
- [ ] Aucune dépendance réelle vers Supabase ou Better Auth (tout mocké)
- [ ] TypeScript compile sans erreur
- [ ] Non-régression sur les tests existants (169 tests + tests API calculate)
