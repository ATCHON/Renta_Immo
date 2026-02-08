# Story AUDIT-102 : Corriger l'effet de levier quand apport = 0

> **Priorite** : P1 (Important)
> **Effort** : 0.5 heure
> **Statut** : Terminé (2026-02-07)
> **Source** : Audit methodologies calculs 2026-02-07, Section 4.8 / Proposition P8
> **Dependance** : Aucune

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** un indicateur d'effet de levier significatif meme sans apport
**Afin de** ne pas voir une valeur aberrante dans mes resultats

---

## 2. Contexte

### 2.1 Probleme

Le code (`rentabilite.ts:221`) utilise `apport || 1` comme denominateur :

```typescript
const apport = financement.apport || 1;
const effet_levier = (rentabilite_nette - tauxCredit) * (financementCalc.montant_emprunt / apport);
```

Quand `apport = 0`, le calcul donne un levier astronomique (ex: `(3.2 - 3.5) * (200000 / 1) = -60 000`) ce qui n'a aucun sens economique.

### 2.2 Solution

Retourner `null` quand l'apport est 0, avec un label explicatif cote frontend.

---

## 3. Criteres d'acceptation

- [x] Si `apport = 0`, `effet_levier` retourne `null` au lieu d'un nombre
- [x] Le type de `effet_levier` dans les types passe a `number | null`
- [x] Le frontend affiche "Max (sans apport)" quand `null`
- [x] Si `apport > 0`, le calcul reste inchange
- [x] Le PDF ne reference pas l'effet de levier (non impacte)

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/rentabilite.ts:220-223` | Retourner `null` si apport = 0 |
| `src/server/calculations/types.ts` | Type `effet_levier: number \| null` |
| `src/components/results/` | Affichage conditionnel |
| `src/lib/pdf/` | Gestion du cas null |

### 4.2 Code cible

```typescript
const effet_levier = financement.apport > 0
  ? (rentabilite_nette - tauxCredit) * (financementCalc.montant_emprunt / financement.apport)
  : null;
```

---

## 5. Cas de test

| Apport | Emprunt | Renta nette | Taux credit | Effet levier |
|--------|---------|-------------|-------------|-------------|
| 0 | 200 000 | 3.2% | 3.5% | null |
| 30 000 | 170 000 | 3.2% | 3.5% | -1.70 |
| 50 000 | 150 000 | 5.0% | 3.5% | 4.50 |

---

## 6. Definition of Done

- [x] `effet_levier` retourne `null` quand apport = 0
- [x] Affichage frontend adapte
- [x] PDF non impacte (n'affiche pas l'effet de levier)
- [x] TypeScript compile sans erreur
- [x] 32 tests passent sans regression
