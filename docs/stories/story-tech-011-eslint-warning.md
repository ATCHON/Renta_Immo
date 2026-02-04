# Story TECH-011 : Corriger le warning ESLint StepAssocies

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : Dette Technique
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)

---

## 1. Description

**En tant que** développeur
**Je veux** corriger le warning ESLint dans StepAssocies.tsx
**Afin de** avoir un build sans warnings

---

## 2. Contexte

Warning détecté lors de la validation DoD Epic 1 :

```
./src/components/forms/StepAssocies.tsx
69:6  Warning: React Hook useEffect has a missing dependency: 'structure.associes'.
Either include it or remove the dependency array.  react-hooks/exhaustive-deps
```

---

## 3. Fichier concerné

`src/components/forms/StepAssocies.tsx` ligne 69

---

## 4. Solutions possibles

### Option A : Ajouter la dépendance
```typescript
useEffect(() => {
  // ...
}, [structure.associes, /* autres deps */]);
```

### Option B : Utiliser useCallback/useMemo
Extraire la logique dans un hook mémoïsé.

### Option C : Désactiver le warning (non recommandé)
```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
```

---

## 5. Critères d'acceptation

- [ ] `npm run lint` passe sans warning
- [ ] Le comportement du composant reste identique
- [ ] Pas de re-renders inutiles introduits

---

## 6. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 1 |
| Priorité | P3 |
| Risque | Faible |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création (dette technique DoD Epic 1) | John (PM) |
