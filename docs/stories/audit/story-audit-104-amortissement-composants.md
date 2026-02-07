# Story AUDIT-104 : Amortissement par composants

> **Priorite** : P2 (Enrichissement metier)
> **Effort** : 1 jour
> **Statut** : Done (2026-02-07)
> **Source** : Audit methodologies calculs 2026-02-07, Section 4.4 / Proposition P5
> **Dependance** : AUDIT-101 (part terrain parametree)

---

## 1. User Story

**En tant qu'** investisseur en LMNP reel ou SCI IS
**Je veux** pouvoir choisir entre amortissement simplifie et par composants
**Afin d'** avoir un calcul d'amortissement plus proche de la realite comptable

---

## 2. Contexte

### 2.1 Probleme

Le code actuel utilise un amortissement simplifie sur une seule duree de 33 ans pour le bati (`fiscalite.ts:200-201`). En realite, un expert-comptable decompose le bien en composants avec des durees differentes.

### 2.2 Impact

| Methode | Amortissement annuel (bien 200 000 EUR, terrain 15%) |
|---------|------------------------------------------------------|
| Simplifie 33 ans | 5 151 EUR/an |
| Par composants | ~6 800 EUR/an (estime) |

L'amortissement simplifie sous-estime l'amortissement de ~25%, ce qui surestime l'impot.

### 2.3 Donnees existantes

Les constantes pour le calcul par composants sont deja dans `constants.ts:108-113` :

```typescript
COMPOSANTS: {
    GROS_OEUVRE: { PART: 0.40, DUREE: 50 },
    FACADE_TOITURE: { PART: 0.20, DUREE: 25 },
    INSTALLATIONS: { PART: 0.20, DUREE: 15 },
    AGENCEMENTS: { PART: 0.20, DUREE: 10 },
}
```

La specification metier (`specification-calculs.md:964-976`) prevoit une decomposition plus fine.

---

## 3. Criteres d'acceptation

### 3.1 Option de calcul

- [ ] Ajouter une option "Mode d'amortissement" dans le formulaire (visible pour LMNP reel et SCI IS)
- [ ] Deux choix : "Simplifie" (defaut) et "Par composants"
- [ ] Le mode simplifie reste identique au fonctionnement actuel

### 3.2 Calcul par composants

- [ ] Utiliser la ventilation definie dans `constants.ts` COMPOSANTS
- [ ] Pour chaque composant : `amort_composant = part * valeur_amortissable / duree`
- [ ] `amort_total = somme(amort_composant)`
- [ ] La valeur amortissable = `prix_achat * (1 - part_terrain)` (utilise la part terrain de AUDIT-101)

### 3.3 Durees differenciees

- [ ] Chaque composant a sa propre duree (10, 15, 25, 50 ans)
- [ ] Dans les projections, l'amortissement d'un composant s'arrete quand sa duree est ecoulee
- [ ] L'amortissement total diminue au fil du temps a mesure que les composants arrivent a terme

### 3.4 Coherence

- [ ] L'amortissement par composants ne peut toujours pas creer de deficit BIC
- [ ] Le report d'amortissement excedentaire fonctionne de la meme maniere
- [ ] Le mobilier et les travaux gardent leurs durees propres (10 et 15 ans)

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/fiscalite.ts` | Nouvelle fonction `calculerAmortissementComposants()`, modifier `calculerLmnpReel()` et `calculerFiscaliteSciIs()` |
| `src/server/calculations/types.ts` | Type `ModeAmortissement`, type `DetailAmortissement` |
| `src/types/calculateur.ts` | Champ `mode_amortissement` dans les options |
| `src/config/constants.ts` | Les composants existent deja, eventuellement enrichir |
| `src/stores/calculateur.store.ts` | Nouveau champ |
| Composants formulaire | Selecteur mode amortissement |

### 4.2 Calcul de verification

Bien 200 000 EUR, terrain 15%, valeur amortissable = 170 000 EUR :

| Composant | Part | Valeur | Duree | Amort annuel |
|-----------|------|--------|-------|-------------|
| Gros oeuvre | 40% | 68 000 | 50 ans | 1 360 |
| Facade/toiture | 20% | 34 000 | 25 ans | 1 360 |
| Installations | 20% | 34 000 | 15 ans | 2 267 |
| Agencements | 20% | 34 000 | 10 ans | 3 400 |
| **Total** | | | | **8 387** |

vs simplifie : 170 000 / 33 = **5 151 EUR** (+63% avec composants)

---

## 5. Cas de test

### 5.1 Mode simplifie (non-regression)

Identique au comportement actuel.

### 5.2 Mode composants

| Prix | Terrain | Mobilier | Travaux | Amort total An 1 |
|------|---------|----------|---------|-----------------|
| 200 000 | 15% | 5 000 | 10 000 | 8 387 + 500 + 667 = 9 554 |
| 200 000 | 10% | 0 | 0 | 9 035 |
| 300 000 | 20% | 10 000 | 0 | 12 960 + 1 000 = 13 960 |

### 5.3 Arret progressif

An 11 : l'amortissement des agencements (10 ans) s'arrete. Total reduit.
An 16 : l'amortissement des installations (15 ans) s'arrete. Total encore reduit.

---

## 6. Definition of Done

- [ ] Selecteur mode amortissement dans le formulaire
- [ ] Calcul par composants correct
- [ ] Arret progressif des composants dans les projections
- [ ] Non-regression du mode simplifie
- [ ] Tests unitaires pour les deux modes
- [ ] TypeScript compile sans erreur
