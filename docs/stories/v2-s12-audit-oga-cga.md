# Story V2-S12 : Auditer et supprimer toute référence OGA/CGA dans le code et la documentation

> **Epic** : EPIC-V2-03 | **Sprint** : Sprint 1-2 | **Effort** : S
> **Statut** : Draft

## Story

**As a** équipe de développement,
**I want** qu'aucune référence à OGA, CGA, ou la réduction de 915€ ne subsiste dans le code ou la documentation,
**so that** l'application soit conforme à la LFI 2025 qui a supprimé ces dispositifs.

## Acceptance Criteria

1. Grep "OGA" → 0 résultat dans src/ et docs/
2. Grep "CGA" → 0 résultat dans src/ et docs/
3. Grep "915" → 0 résultat dans src/ et docs/ (sauf si autre contexte)
4. Rapport de toutes les suppressions effectuées
5. Aucune régression fonctionnelle après suppression

## Tasks / Subtasks

- [ ] Grep "OGA" dans tout le projet — lister les occurrences
- [ ] Grep "CGA" dans tout le projet — lister les occurrences
- [ ] Grep "915" dans tout le projet — lister les occurrences
- [ ] Supprimer/remplacer chaque occurrence (AC: 1, 2, 3)
- [ ] Produire un rapport des modifications (AC: 4)
- [ ] Lancer npm test (AC: 5)

## Dev Notes

**Commandes de vérification :**
grep -r "OGA|CGA|915" src/ docs/ --include="*.ts" --include="*.tsx" --include="*.md"

**Fichiers probablement impactés :**
- src/config/constants.ts
- src/server/calculations/fiscalite.ts
- Possiblement des commentaires dans les composants

### Testing

- Lancer npm test après suppressions
- Vérifier que 0 test échoue

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-14 | 1.0 | Création | John (PM) |
