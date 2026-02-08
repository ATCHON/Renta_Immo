# Story AUDIT-101 : Part terrain parametree par type de bien

> **Priorite** : P1 (Important)
> **Effort** : 0.5 jour
> **Statut** : Terminé (2026-02-07)
> **Source** : Audit methodologies calculs 2026-02-07, Section 4.4 / Proposition P2
> **Dependance** : Aucune

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** que la part terrain soit adaptee au type de bien ou saisie manuellement
**Afin d'** avoir un calcul d'amortissement plus precis pour les regimes reels

---

## 2. Contexte

### 2.1 Probleme

Le code applique une part terrain fixe de 15% (`constants.ts:99`) quel que soit le type de bien.

**Realite** :
| Type de bien | Part terrain reelle |
|-------------|---------------------|
| Appartement centre-ville | 5-15% |
| Maison individuelle | 15-30% |
| Immeuble de rapport | 10-20% |

### 2.2 Impact

Pour un bien a 200 000 EUR, amortissement sur 33 ans :
- Part terrain 10% : amortissement = 5 454 EUR/an
- Part terrain 15% : amortissement = 5 151 EUR/an
- **Ecart : 303 EUR/an** d'amortissement
- A TMI 30% + PS 18.6% : ecart d'impot de ~147 EUR/an

### 2.3 Solution retenue

Ajouter un champ `part_terrain` dans le formulaire avec valeur par defaut selon le type de bien, modifiable par l'utilisateur.

---

## 3. Criteres d'acceptation

### 3.1 Valeurs par defaut

- [x] Appartement : 10% par defaut
- [x] Maison : 20% par defaut
- [x] Immeuble : 10% par defaut
- [x] La valeur par defaut s'adapte via `validation.ts` selon `type_bien`

### 3.2 Saisie utilisateur

- [x] L'utilisateur peut modifier la part terrain manuellement (champ numerique dans StepBien)
- [x] Plage autorisee : 0% a 40% (validation Zod)
- [x] Le champ est toujours visible (info utile quel que soit le regime, hint explicatif)

### 3.3 Calculs impactes

- [x] `fiscalite.ts` : `calculerLmnpReel()` accepte `partTerrain` en parametre
- [x] `fiscalite.ts` : `calculerFiscaliteSciIs()` accepte `partTerrain` en parametre
- [x] `calculerToutesFiscalites()` passe `partTerrain` aux 4 regimes concernes
- [x] Les projections utilisent la meme part terrain
- [x] La constante `CONSTANTS.AMORTISSEMENT.PART_TERRAIN` reste en fallback si non fournie

### 3.4 Non-regression

- [x] 32 tests passent sans regression
- [x] Les regimes micro (micro-foncier, micro-BIC) ne sont pas affectes

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/types/calculateur.ts` | Ajout du champ `part_terrain` dans `BienData` |
| `src/server/calculations/validation.ts` | Valeur par defaut selon type de bien, validation plage 0-40% |
| `src/server/calculations/fiscalite.ts` | Utiliser `input.bien.part_terrain` au lieu de la constante |
| `src/config/constants.ts` | Ajout des valeurs par defaut par type de bien |
| `src/stores/calculateur.store.ts` | Gestion du nouveau champ dans le store |
| `src/components/` (formulaire) | Ajout du champ dans le step Bien |

### 4.2 Valeurs par defaut dans constants.ts

```typescript
PART_TERRAIN_DEFAUT: {
  APPARTEMENT: 0.10,
  MAISON: 0.20,
  IMMEUBLE: 0.10,
}
```

---

## 5. Cas de test

| Type bien | Part terrain | Prix | Amort annuel bati (33 ans) |
|-----------|-------------|------|---------------------------|
| Appartement | 10% | 200 000 | 5 454 EUR |
| Maison | 20% | 200 000 | 4 848 EUR |
| Immeuble | 10% | 200 000 | 5 454 EUR |
| Custom | 25% | 200 000 | 4 545 EUR |

---

## 6. Definition of Done

- [x] Champ `part_terrain` dans le formulaire StepBien
- [x] Valeur par defaut selon type de bien (via normalisation)
- [x] Calcul d'amortissement utilise la valeur saisie
- [x] TypeScript compile sans erreur
- [x] 32 tests passent sans regression
