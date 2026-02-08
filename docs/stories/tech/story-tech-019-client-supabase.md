# Story TECH-019 : Client Supabase

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : ✅ Terminé
> **Type** : Infrastructure
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 2

---

## 1. Description

**En tant que** développeur
**Je veux** des clients Supabase configurés (browser et server)
**Afin de** interagir avec la base de données de manière sécurisée

---

## 2. Contexte

Next.js App Router nécessite deux types de clients Supabase :
- **Client Browser** : Pour les composants client (hooks, interactions utilisateur)
- **Client Server** : Pour les Server Components et Route Handlers

---

## 3. Implémentation

### 3.1 Structure des fichiers

```
src/lib/supabase/
├── client.ts       # Client browser (singleton)
├── server.ts       # Client server (per-request)
├── middleware.ts   # Client pour middleware Next.js
└── index.ts        # Barrel export
```

### 3.2 Client Browser

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 3.3 Client Server

```typescript
// src/lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}
```

### 3.4 Dépendances additionnelles

```bash
npm install @supabase/ssr
```

---

## 4. Hook React

```typescript
// src/hooks/useSupabase.ts
import { useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useSupabase() {
  const supabase = useMemo(() => createClient(), []);
  return supabase;
}
```

---

## 5. Critères d'acceptation

- [x] Package `@supabase/ssr` installé
- [x] Client browser créé (`src/lib/supabase/client.ts`)
- [x] Client server créé (`src/lib/supabase/server.ts`)
- [x] Hook `useSupabase` créé
- [x] Types Database générés/définis
- [x] Test connexion depuis un composant client
- [x] Test connexion depuis une Route Handler

---

## 6. Dépendances

| Type | Dépendance |
|------|------------|
| Dépend de | TECH-017 (Setup), TECH-018 (Schéma) |
| Bloque | TECH-020 (API CRUD) |

---

## 7. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 2 |
| Priorité | P2 |
| Risque | Faible |

---

## 8. Ressources

- [Supabase Auth with Next.js App Router](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [@supabase/ssr documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
