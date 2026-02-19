# Story V2-S07 : Ajouter le slider taux d'occupation dans le formulaire

> **Epic** : EPIC-V2-02 | **Sprint** : Sprint 1 | **Effort** : S
> **Statut** : Completed

## Story

**As a** utilisateur de la plateforme,
**I want** pouvoir régler le taux d'occupation via un slider dans le formulaire,
**so that** je puisse personnaliser la simulation selon la zone géographique de mon bien.

## Acceptance Criteria

1. Slider de 70% à 100% dans StepExploitation.tsx (section "Revenus locatifs")
2. Valeur par défaut : 92%
3. Tooltip avec suggestions par zone : Paris/IDF 95%, Grandes villes 92%, Zones tendues 88%, Zones rurales 80%
4. La valeur est propagée dans le store Zustand (calculateur.store.ts)
5. La valeur est envoyée à l'API de calcul

## Tasks / Subtasks

- [x] Ajouter le champ tauxOccupation dans le store Zustand (AC: 4)
- [x] Créer le composant Slider dans StepExploitation.tsx (AC: 1, 2)
- [x] Ajouter le tooltip avec tableau de suggestions (AC: 3)
- [x] Connecter au store (AC: 4)
- [x] Vérifier la transmission à l'API (AC: 5)

## Dev Notes

**Fichiers à modifier :**

- src/stores/calculateur.store.ts — ajouter tauxOccupation: number (défaut 0.92)
- src/components/forms/StepExploitation.tsx — ajouter le slider
- src/app/api/calculate/route.ts — vérifier que tauxOccupation est transmis

**UI** : Utiliser le composant Slider existant de Shadcn/Radix si disponible dans le projet. Sinon, input type="range" min=70 max=100 step=1.

### Testing

- Test visuel : vérifier l'affichage du slider et du tooltip
- Test fonctionnel : changer la valeur → vérifier que le calcul se met à jour

## Change Log

| Date       | Version | Description | Author    |
| ---------- | ------- | ----------- | --------- |
| 2026-02-14 | 1.0     | Création    | John (PM) |
