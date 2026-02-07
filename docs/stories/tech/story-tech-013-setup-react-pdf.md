# Story TECH-013 : Setup react-pdf

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : ✅ Ready for Review
> **Type** : Infrastructure
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 1

---

## 1. Description

**En tant que** développeur
**Je veux** installer et configurer @react-pdf/renderer
**Afin de** pouvoir générer des rapports PDF côté serveur

---

## 2. Contexte

Les utilisateurs souhaitent télécharger un rapport PDF de leur simulation. La librairie `@react-pdf/renderer` permet de créer des PDFs avec des composants React, facilitant la maintenance et la cohérence avec l'UI.

---

## 3. Tâches

### 3.1 Installer les dépendances

```bash
npm install @react-pdf/renderer
```

### 3.2 Configurer Next.js

Vérifier la compatibilité avec l'App Router et les Server Components.

```typescript
// next.config.js - si nécessaire
experimental: {
  serverComponentsExternalPackages: ['@react-pdf/renderer'],
}
```

### 3.3 Créer la structure de base

```
src/
├── lib/
│   └── pdf/
│       ├── index.ts        # Export principal
│       ├── styles.ts       # Styles partagés
│       └── components/     # Composants PDF réutilisables
│           ├── Header.tsx
│           ├── Footer.tsx
│           └── Table.tsx
```

### 3.4 Tester la génération

Créer un PDF de test simple pour valider l'installation.

---

## 4. Critères d'acceptation

- [x] Package `@react-pdf/renderer` installé
- [x] Configuration Next.js validée
- [x] Structure `src/lib/pdf/` créée
- [x] PDF de test généré avec succès
- [x] Pas d'erreur de build (`npm run build`)

---

## 5. Dépendances

| Type | Dépendance |
|------|------------|
| Bloque | TECH-014, TECH-015, TECH-016 |

---

## 6. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 2 |
| Priorité | P2 |
| Risque | Moyen (compatibilité App Router) |

---

## 7. Ressources

- [Documentation @react-pdf/renderer](https://react-pdf.org/)
- [Next.js App Router + PDF](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
| 2026-02-04 | 1.1 | Implémentation complète | James (Dev) |

---

## Dev Agent Record

### Agent Model Used
Gemini 2.5 Pro

### File List
- `next.config.mjs` - [MODIFIED] - Added serverComponentsExternalPackages and webpack canvas alias
- `src/lib/pdf/index.ts` - [NEW] - Barrel exports
- `src/lib/pdf/styles.ts` - [NEW] - Centralized PDF styles (Nordic Minimal design)
- `src/lib/pdf/components/Header.tsx` - [NEW] - Reusable header component
- `src/lib/pdf/components/Footer.tsx` - [NEW] - Reusable footer component  
- `src/lib/pdf/components/Table.tsx` - [NEW] - Generic table component
- `src/lib/pdf/__tests__/generate-test.tsx` - [NEW] - Test script for PDF validation

### Completion Notes
- Package installed successfully (53 packages added)
- Next.js configured with `experimental.serverComponentsExternalPackages`
- Webpack alias for `canvas` added to prevent build errors
- Full PDF structure created with shared styles following Nordic Minimal design
- Test PDF generated successfully to `test-output.pdf`
- Build passes without errors
