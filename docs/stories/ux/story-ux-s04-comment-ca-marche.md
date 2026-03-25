# Story UX-S04 : Page « Comment ça marche » — Restructuration en sous-pages

> **Priorité** : P1
> **Effort** : L (3–4 jours)
> **Statut** : Ready for Dev
> **Type** : Feature / Content + Routing
> **Epic** : UX Migration — Phase 4 : Comment ça marche
> **Branche** : `feature/verdant-how-it-works`
> **Dépendances** : UX-S00 ✅ (Design tokens)

---

## 1. User Story

**En tant que** utilisateur souhaitant comprendre les mécaniques de calcul
**Je veux** naviguer dans une section pédagogique structurée par thèmes
**Afin d'** accéder facilement aux concepts qui m'intéressent (fiscalité, financement, projections, scoring) sans être submergé par une page monolithique de 2093 lignes.

---

## 2. Contexte

### 2.1 Situation actuelle et risque critique

> [!CAUTION]
> **Phase la plus critique en termes de conservation de contenu.** La page actuelle `src/app/en-savoir-plus/page.tsx` fait **2093 lignes** et couvre **13 sections** de contenu pédagogique. Les maquettes Stitch ne couvrent que ~40% de ce contenu.
>
> **RÈGLE ABSOLUE : aucune section ne doit être supprimée.**

Section **manquantes dans les maquettes** mais **OBLIGATOIRES dans les sous-pages** :

- Cash-flow (3 niveaux : brut, net, net-net) avec formules
- Effort d'épargne (concept + formule)
- Assurance emprunteur CRD (capital initial vs CRD, impact TRI)
- Déficit foncier (mécanisme complet, 2 composantes)
- Amortissement LMNP/SCI (tableaux, durées, composants)
- Plus-value (nom propre vs SCI IS, abattements par durée)
- Profils Investisseur (Rentier vs Patrimonial, pondérations scoring)
- HCSF détaillé (seuils 2025, reste à vivre)

### 2.2 Maquettes de référence

- **Hub** : `comment_a_marche/` → [screen.png](docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche/screen.png) | [code.html](docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche/code.html)
- **Scoring & Rendement** : `comment_a_marche_scoring_rendement/` → [screen.png](docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_scoring_rendement/screen.png) | [code.html](docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_scoring_rendement/code.html)
- **Financement & Levier** : `comment_a_marche_financement_levier/` → [screen.png](docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_financement_levier/screen.png) | [code.html](docs/ux/stitch/v1/stitch_nordic_minimalist/comment_a_marche_financement_levier/code.html)
- **Fiscalité & Normes** : `comment_a_marche_fiscalit_normes/` → [screen.png + code.html]
- **Projections & DPE** : `comment_a_marche_projections_dpe/` → [screen.png + code.html]

### 2.3 Stratégie de migration de route (⚠️ SEO)

La route actuelle est `/en-savoir-plus`. La nouvelle est `/comment-ca-marche`.

> [!CAUTION]
> **Redirection 301 obligatoire pour éviter une perte de trafic SEO.** Les redirections 301 sont mises en cache agressivement par les CDN (Vercel). Tester en preview avant déploiement production.

**Solution** : Ajouter dans `next.config.ts` :

```typescript
async redirects() {
  return [
    {
      source: '/en-savoir-plus',
      destination: '/comment-ca-marche',
      permanent: true,  // HTTP 301
    },
  ];
},
```

> [!NOTE]
> **Décision validée** : Conserver le fichier `src/app/en-savoir-plus/page.tsx` vide (redirect ou page minimale) après la mise en place de la 301, pour éviter des erreurs 404 internes Next.js transitoires avant suppression définitive.

### 2.4 Architecture de distribution du contenu

Passer de 1 page monolithique (2093 lignes) à **5 sous-pages thématiques** :

| Sous-page            | URL                                     | Sections incluses                                                             | Maquette                              |
| -------------------- | --------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------- |
| Hub                  | `/comment-ca-marche`                    | Présentation, pipeline, liens vers sous-pages                                 | `comment_a_marche`                    |
| Scoring & Rendement  | `/comment-ca-marche/scoring-rendement`  | Rentabilité (brute, nette, nette-nette), Scoring, Profils Rentier/Patrimonial | `comment_a_marche_scoring_rendement`  |
| Financement & Levier | `/comment-ca-marche/financement-levier` | PMT/Crédit, Assurance CRD, Cash-flow 3 niveaux, Effort d'épargne              | `comment_a_marche_financement_levier` |
| Fiscalité & Normes   | `/comment-ca-marche/fiscalite-normes`   | 6 régimes fiscaux, Déficit foncier, Amortissement LMNP, HCSF                  | `comment_a_marche_fiscalit_normes`    |
| Projections & DPE    | `/comment-ca-marche/projections-dpe`    | Plus-value, Projections 20 ans, DPE                                           | `comment_a_marche_projections_dpe`    |

---

## 3. Critères d'acceptation

### 3.1 Structure de routes Next.js

```
src/app/
├── comment-ca-marche/
│   ├── layout.tsx          [NEW] — Sidebar navigation + wrapper
│   ├── page.tsx            [NEW] — Hub principal (cards vers sous-pages)
│   ├── scoring-rendement/
│   │   └── page.tsx        [NEW]
│   ├── financement-levier/
│   │   └── page.tsx        [NEW]
│   ├── fiscalite-normes/
│   │   └── page.tsx        [NEW]
│   └── projections-dpe/
│       └── page.tsx        [NEW]
└── en-savoir-plus/
    └── page.tsx             [KEEP — vider le contenu, mettre une redirect côté client ou stub]
```

- [ ] Les 6 fichiers `page.tsx` et le `layout.tsx` sont créés
- [ ] Le fichier `en-savoir-plus/page.tsx` est conservé (pas supprimé)

### 3.2 Redirection SEO

- [ ] `next.config.ts` modifié avec la redirection 301 `/en-savoir-plus` → `/comment-ca-marche`
- [ ] Test : `curl -I http://localhost:3000/en-savoir-plus` retourne `301 Moved Permanently`

### 3.3 Layout de la section (`layout.tsx`)

- [ ] Sidebar de navigation latérale avec 4 liens (Scoring & Rendement, Financement & Levier, Fiscalité & Normes, Projections & DPE)
- [ ] Le lien actif est mis en évidence (fond `--color-primary`, texte blanc)
- [ ] Sur mobile : tabs horizontaux défilables en haut de page
- [ ] Layout implémentation :

```typescript
// src/app/comment-ca-marche/layout.tsx
export default function CommentCaMarcheLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <CommentCaMarcheNav />  {/* Sidebar catégories */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

### 3.4 Contenu — Vérification de l'exhaustivité

> [!IMPORTANT]
> Cette vérification est **obligatoire avant de considérer la story terminée**.

- [ ] Chaque section des 13 sections originales de `en-savoir-plus` est présente dans une sous-page
- [ ] Les formules clés sont toutes présentes. Grep de vérification :
  ```bash
  # Vérifier la présence des formules clés dans les nouvelles pages
  grep -r "PMT\|Cash-flow\|Déficit foncier\|HCSF\|TRI\|TAEG" src/app/comment-ca-marche/
  ```
- [ ] La section « Profils Investisseur » (Rentier vs Patrimonial) est dans `/scoring-rendement`
- [ ] La section « Cash-flow brut/net/net-net » est dans `/financement-levier`
- [ ] La section « Déficit foncier » est dans `/fiscalite-normes`
- [ ] La section « Plus-value » est dans `/projections-dpe`

### 3.5 SEO par sous-page

- [ ] Chaque sous-page a un `<title>` et une `<meta description>` uniques
- [ ] Un seul `<h1>` par page (titre de la sous-thématique)
- [ ] Les URLs sont en français avec kebab-case (déjà le cas dans l'architecture proposée)

### 3.6 Navigation interne

- [ ] Les liens entre sous-pages fonctionnent
- [ ] Le hub (`/comment-ca-marche`) affiche 4 cartes visuelles pointant vers les sous-pages
- [ ] Bouton « Retour au hub » dans chaque sous-page

---

## 4. Spécifications techniques

### 4.1 Fichiers impactés

| Fichier                                                 | Action | Détail                                 |
| ------------------------------------------------------- | ------ | -------------------------------------- |
| `next.config.ts`                                        | MODIFY | Ajouter redirection 301                |
| `src/app/comment-ca-marche/layout.tsx`                  | NEW    | Layout sidebar nav                     |
| `src/app/comment-ca-marche/page.tsx`                    | NEW    | Hub avec 4 cartes                      |
| `src/app/comment-ca-marche/scoring-rendement/page.tsx`  | NEW    | Contenu scoring + profils              |
| `src/app/comment-ca-marche/financement-levier/page.tsx` | NEW    | Contenu crédit + cashflow              |
| `src/app/comment-ca-marche/fiscalite-normes/page.tsx`   | NEW    | Contenu 6 régimes + HCSF               |
| `src/app/comment-ca-marche/projections-dpe/page.tsx`    | NEW    | Contenu plus-value + DPE               |
| `src/app/en-savoir-plus/page.tsx`                       | MODIFY | Vider le contenu, conserver le fichier |

### 4.2 Approche pour le contenu long

La page `en-savoir-plus/page.tsx` fait 2093 lignes. L'approche recommandée :

1. **Identifier les sections** dans la page actuelle (chercher les balises `<section id="...">` ou les commentaires de séparation)
2. **Découper** le contenu en 4 blocs correspondant aux sous-pages
3. **Copier/coller** le contenu dans les sous-pages respectives
4. **Adapter** le style avec les tokens Verdant (Phase 0) et les classes `.glass-card`

Si le contenu est en format JSX complexe, envisager de créer des composants partagés dans `src/components/education/` pour les formules mathématiques et les tableaux.

---

## 5. Tests

### 5.1 Tests E2E à créer

Fichier : `tests/e2e/comment-ca-marche/navigation.spec.ts`

```typescript
// Tester la navigation entre les 4 sous-pages
test('Navigation hub → sous-pages', async ({ page }) => {
  await page.goto('/comment-ca-marche');
  await page.click('text=Scoring & Rendement');
  await expect(page).toHaveURL('/comment-ca-marche/scoring-rendement');
});

// Tester la redirection 301
test('Redirection /en-savoir-plus → /comment-ca-marche', async ({ page }) => {
  await page.goto('/en-savoir-plus');
  await expect(page).toHaveURL('/comment-ca-marche');
});
```

### 5.2 Commandes

```bash
# TU existants (aucun test sur /en-savoir-plus, zéro risque de régression moteur)
npm run test

# Vérifier que les nouvelles routes compilent sans erreur
npm run build

# Test de redirection
curl -I http://localhost:3000/en-savoir-plus

# E2E navigation
npm run test:e2e
```

---

## 6. Definition of Done

- [ ] 6 nouvelles pages/layout créées dans `src/app/comment-ca-marche/`
- [ ] Redirection 301 configurée et testée
- [ ] Grep de vérification des formules clés passé (PMT, Cash-flow, Déficit foncier, HCSF, TRI)
- [ ] Les 13 sections originales sont toutes présentes dans les sous-pages
- [ ] Tests E2E navigation créés et verts
- [ ] `npm run test` : 530+ TU verts
- [ ] `npm run build` : compilation sans erreur
- [ ] Aucun `any` TypeScript
- [ ] PR mergée depuis `feature/verdant-how-it-works`

---

## Changelog

| Date       | Version | Description                                       | Auteur    |
| ---------- | ------- | ------------------------------------------------- | --------- |
| 2026-03-25 | 1.0     | Création — Plan UX Sally + Plan technique Winston | John (PM) |
