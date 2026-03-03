# Story ARCH-S06 : Next.js output: standalone (portabilité infra)

> **Version** : 1.1
> **Date** : 2026-03-03
> **Auteur** : John (PM) / Winston (Architecte)
> **Statut** : ✅ Prêt pour développement
> **Type** : Tech
> **Epic** : ARCH-E01 — Fondations Techniques Phase 0
> **Sprint** : Sprint 0
> **Priorité** : P0 (Critique)
> **Complexité** : XS
> **Effort estimé** : ~0.25j
> **Notion** : https://www.notion.so/3170eaf0627481c9abeacda3e2356696
> **Référence guide** : §9.2 — Guide évolutivité architecture v2.0

---

## 1. Description

**En tant que** équipe DevOps/infra
**Je veux** que l'application Next.js soit buildée en mode `standalone`
**Afin de** pouvoir la contenariser dans Docker sans dépendances `node_modules` complètes

---

## 2. Contexte

Actuellement, `next.config.js` ne spécifie pas de `output`. En mode par défaut, le build Next.js produit un dossier `.next/` qui nécessite l'intégralité de `node_modules` pour s'exécuter.

Le mode `output: 'standalone'` génère un dossier `.next/standalone/` contenant uniquement les fichiers nécessaires à l'exécution (trace des dépendances utilisées). Cela réduit la taille de l'image Docker de **60-80%** et prépare la migration vers un hébergement self-hosted (§9 du guide).

**Prérequis de la migration Docker** (ARCH-S10) : ce mode doit être activé en premier.

---

## 3. Fichiers impactés

```
next.config.js    ← ajout output: 'standalone'
```

---

## 4. Modification à effectuer

```javascript
// next.config.js — ajout unique
const nextConfig = {
  // ... config existante ...
  output: 'standalone',
};
```

**Structure du build après modification :**

```
.next/
├── standalone/
│   ├── server.js          ← point d'entrée Node.js
│   ├── .next/             ← assets compilés
│   └── node_modules/      ← dépendances minimales uniquement
└── static/                ← assets statiques (à copier séparément)
```

---

## 5. Impact sur le CI/CD

Le pipeline GitHub Actions existant doit rester fonctionnel. Vérifier que :

- Le job `build` dans CI produit bien le dossier `.next/standalone/`
- Les tests E2E Playwright restent verts sur le build standalone
- Vercel supporte nativement `output: 'standalone'` (transparent pour Vercel, changement uniquement pour Docker)

---

## 6. Critères d'acceptation

- [ ] `next.config.js` : `output: 'standalone'` ajouté
- [ ] Build de production vérifié (`npm run build` sans erreur)
- [ ] Dossier `.next/standalone/` produit après build
- [ ] Compatibilité CI/CD vérifiée (tous les jobs verts)
- [ ] Tests E2E Playwright toujours verts

---

## 7. Dépendances

| Type      | Dépendance                                                               |
| --------- | ------------------------------------------------------------------------ |
| Prérequis | — (indépendant, le plus simple du sprint)                                |
| Bloque    | ARCH-S10 (Dockerfile production multi-stage — nécessite standalone mode) |

---

## 8. Tests à écrire

- CI : Vérifier que `ls .next/standalone/server.js` existe après build
- E2E : Relancer `npm run test:e2e` après modification pour non-régression

---

## 🏗️ Directives Architecte (Winston)

### Compatibilité Edge Runtime : ✅ Aucun problème

Le `middleware.ts` existant (`src/middleware.ts`) utilise uniquement `NextRequest/NextResponse` et l'API cookies — **compatible Edge Runtime et mode standalone**.

Le seul point à vérifier : `runtime = 'nodejs'` est déclaré dans `/api/calculate/route.ts`. Ce runtime explicite est **ignoré** en mode standalone pour le bundling (standalone embarque Node.js runtime de toute façon). Aucun problème.

**Vérification à faire** : S'assurer qu'aucun `import` dans `middleware.ts` ne référence un package Node.js natif (fs, path, crypto). **Résultat de l'audit** : le middleware actuel n'importe que `next/server` — ✅ compatible.

### Fichiers statiques `public/` : copie manuelle dans le Dockerfile

Le dossier `.next/standalone/` **n'inclut pas** `public/`. C'est le comportement standard de Next.js standalone.

Dans le Dockerfile (ARCH-S10, story suivante), le dev devra ajouter :

```dockerfile
# À documenter dans ARCH-S10 — copie obligatoire en standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
```

**Attention également** : `outputFileTracingIncludes` dans `next.config.mjs` inclut `supabase/migrations/**`. Ce dossier doit aussi être copié dans le Dockerfile si les migrations sont lancées depuis l'image.

### Vercel : `output: 'standalone'` est ignoré

**Vercel ignore complètement `output: 'standalone'`** et utilise son propre pipeline de build optimisé.

→ **Aucun impact sur le déploiement Vercel existant** — transparent.

**Preuve** : La [documentation Vercel](https://vercel.com/docs/frameworks/nextjs) précise que Vercel détecte Next.js et utilise son propre output handler, indépendamment de la config `output`.

### `.gitignore` : aucun changement

`.next/` est déjà dans `.gitignore`. Le dossier `.next/standalone/` est inclus dans ce glob.

**Ne rien modifier dans `.gitignore`.**

### `serverExternalPackages` : attention au Dockerfile

`next.config.mjs` déclare `serverExternalPackages: ['@react-pdf/renderer', 'pg', ...]`. Ces packages ne sont **pas bundlés** dans le build Next.js — ils sont résolus à l'exécution depuis `node_modules`.

En mode standalone, Next.js trace automatiquement les dépendances utilisées et les copie dans `.next/standalone/node_modules/`. Les `serverExternalPackages` sont **tracés et copiés** correctement.

**Point de vigilance** : `@react-pdf/renderer` est un package lourd (~15MB). Vérifier après le build que `.next/standalone/node_modules/@react-pdf/` est présent et que la génération PDF fonctionne depuis le standalone.

### Ordre d'implémentation recommandé

Cette story (ARCH-S06) est **prérequis d'ARCH-S10** (Dockerfile). La démarche est :

1. Ajouter `output: 'standalone'` ← cette story
2. Vérifier `npm run build` et que `.next/standalone/server.js` existe
3. Tester `node .next/standalone/server.js` en local (smoke test)
4. Committer → ARCH-S10 peut démarrer

---

> **Version** : 1.0 | **Architecte** : Winston | **Date** : 2026-03-03

---

## Changelog

| Date       | Version | Description                                                  | Auteur               |
| ---------- | ------- | ------------------------------------------------------------ | -------------------- |
| 2026-03-03 | 1.0     | Création depuis tâche Notion ARCH-S06                        | John (PM)            |
| 2026-03-03 | 1.1     | Directives architecturales complètes                         | Winston (Architecte) |
| 2026-03-03 | 1.2     | Validation SM — story prête pour développement (clarté 9/10) | Bob (SM)             |
