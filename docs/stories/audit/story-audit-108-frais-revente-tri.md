# Story AUDIT-108 : Integrer les frais de revente dans le TRI

> **Priorite** : P3 (Evolution)
> **Effort** : 0.5 jour
> **Statut** : Terminé
> **Source** : Audit methodologies calculs 2026-02-07, Section 7.3 / Proposition P10
> **Dependance** : AUDIT-105 (plus-value a la revente)

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** que le TRI et l'enrichissement total integrent les frais reels de revente
**Afin d'** obtenir un rendement realiste et ne pas surestimer la rentabilite de mon investissement

---

## 2. Contexte

### 2.1 Probleme

Le calcul du TRI (`projection.ts:480-492`) integre deja l'impot de plus-value (AUDIT-105) mais ne deduit pas les frais de cession :
- **Frais d'agence de revente** : generalement 5% du prix de vente
- **Diagnostics obligatoires** : ~500 EUR (DPE, amiante, plomb, etc.)

Le dernier flux du TRI est actuellement :
```typescript
flux.push(cashflowNetImpot + patrimoineNet - impotPV);
```

Il devrait etre :
```typescript
flux.push(cashflowNetImpot + patrimoineNet - impotPV - fraisRevente);
```

### 2.2 Impact

Pour un bien revendu 230 000 EUR :
- Frais d'agence : 11 500 EUR (5%)
- Diagnostics : 500 EUR
- **Total frais de revente : 12 000 EUR**

Cet ecart peut faire baisser le TRI de 0.3 a 0.5 point selon le scenario. L'enrichissement total est egalement surestime du meme montant.

### 2.3 Parametrage

Les frais d'agence de revente varient selon le mode de vente :
- Vente via agence : 4-8% du prix (moyenne 5%)
- Vente de particulier a particulier : 0%
- Diagnostics : forfait ~500 EUR (obligatoire dans tous les cas)

Le simulateur devrait proposer un taux par defaut (5%) modifiable par l'utilisateur.

---

## 3. Criteres d'acceptation

### 3.1 Calcul des frais de revente

- [x] `frais_agence_revente = valeur_bien_finale * taux_agence_revente / 100`
- [x] `frais_diagnostics = forfait_diagnostics` (constante)
- [x] `frais_revente_total = frais_agence_revente + frais_diagnostics`
- [x] Taux agence par defaut : 5% (modifiable par l'utilisateur dans les options)

### 3.2 Integration dans le TRI

- [x] Le dernier flux du TRI = cashflowNet + patrimoineNet - impotPV - fraisRevente
- [x] Le TRI diminue par rapport a la version sans frais de revente
- [x] Les frais de revente sont appliques uniquement a l'horizon final (pas chaque annee)

### 3.3 Integration dans l'enrichissement total

- [x] `enrichissementTotal = capitalRembourse + cashflowCumule - impotPV - fraisRevente`
- [x] Le montant des frais de revente est visible dans les totaux

### 3.4 Affichage

- [x] Les frais de revente sont affiches dans le detail des projections
- [x] Le patrimoine net de revente = valeur_bien - capital_restant - impot_PV - frais_revente
- [x] Un champ optionnel dans les options permet de modifier le taux d'agence

### 3.5 Option utilisateur

- [x] Nouveau champ `taux_agence_revente` dans les options (defaut 5%)
- [x] Possibilite de mettre 0% (vente entre particuliers)
- [x] Le champ est accessible dans le formulaire (step Options)

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/projection.ts` | Deduire frais de revente du dernier flux TRI et de l'enrichissement total |
| `src/config/constants.ts` | Ajout `FRAIS_REVENTE.TAUX_AGENCE_DEFAUT` (5%) et `FRAIS_REVENTE.DIAGNOSTICS` (500) |
| `src/types/calculateur.ts` | Ajout champ `taux_agence_revente` dans `OptionsData` |
| `src/server/calculations/types.ts` | Ajout `frais_revente` dans `ProjectionData.totaux` |
| `src/components/forms/StepOptions.tsx` | Ajout champ taux agence revente |
| `src/components/results/` | Affichage des frais de revente |
| `src/lib/pdf/` | Inclusion frais de revente dans le PDF |

### 4.2 Constantes

```typescript
FRAIS_REVENTE: {
  TAUX_AGENCE_DEFAUT: 5,   // % du prix de vente
  DIAGNOSTICS: 500,         // EUR forfaitaire
}
```

### 4.3 Code cible (projection.ts)

```typescript
// Apres le calcul de la plus-value (ligne ~490)
const tauxAgenceRevente = (input.options.taux_agence_revente ?? CONSTANTS.FRAIS_REVENTE.TAUX_AGENCE_DEFAUT) / 100;
const fraisAgence = derniereProjection.valeurBien * tauxAgenceRevente;
const fraisDiagnostics = CONSTANTS.FRAIS_REVENTE.DIAGNOSTICS;
const fraisReventeTotal = Math.round(fraisAgence + fraisDiagnostics);

// Dernier flux TRI
flux.push(
  derniereProjection.cashflowNetImpot
  + derniereProjection.patrimoineNet
  - impotPV
  - fraisReventeTotal
);

// Enrichissement total
enrichissementTotal = capitalRembourseTotal + cashflowCumule - impotPV - fraisReventeTotal;
```

### 4.4 Points d'attention

- Les frais de revente ne s'appliquent qu'au flux final (horizon), pas aux annees intermediaires
- Le patrimoine net affiche annee par annee ne change pas (il ne tient pas compte des frais de revente potentiels)
- La plus-value (AUDIT-105) est calculee sur le prix de vente brut, pas sur le prix net de frais d'agence (coherent avec la fiscalite francaise : les frais d'agence sont deductibles de la plus-value uniquement s'ils sont a la charge du vendeur)

---

## 5. Cas de test

### 5.1 Revente avec agence (defaut 5%)

Bien revendu 230 000 EUR apres 20 ans :
- Frais agence : 230 000 * 5% = 11 500 EUR
- Diagnostics : 500 EUR
- **Total : 12 000 EUR**
- Impact TRI : reduction estimee de 0.3-0.5 point

### 5.2 Revente sans agence (0%)

Meme bien, vente entre particuliers :
- Frais agence : 0 EUR
- Diagnostics : 500 EUR
- **Total : 500 EUR**
- Impact TRI : negligeable

### 5.3 Verification enrichissement total

Comparer l'enrichissement total avec et sans frais de revente :
- Sans frais : `capitalRembourse + cashflowCumule - impotPV`
- Avec frais : `capitalRembourse + cashflowCumule - impotPV - fraisRevente`
- Ecart = fraisRevente exactement

### 5.4 Coherence avec les flux TRI

Verifier que la somme des flux TRI actualises a un taux zero correspond bien a l'enrichissement total.

---

## 6. Definition of Done

- [x] Frais de revente deduits du dernier flux TRI
- [x] Enrichissement total corrige
- [x] Constantes dans `constants.ts`
- [x] Champ optionnel `taux_agence_revente` dans les options utilisateur
- [x] Affichage du detail des frais de revente dans les resultats
- [x] Tests unitaires (frais defaut, frais custom, frais 0%) — 4 tests
- [x] TypeScript compile sans erreur
- [x] Non-regression sur les tests existants (136 tests)
