# Story AUDIT-109 : Assurance sur capital restant du

> **Priorite** : P3 (Evolution)
> **Effort** : 1 jour
> **Statut** : Terminé
> **Source** : Audit methodologies calculs 2026-02-07, Section 4.1 / Proposition P9
> **Dependance** : Aucune

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** pouvoir choisir entre une assurance sur capital initial et une assurance sur capital restant du
**Afin de** comparer le cout reel de l'assurance et son impact sur la rentabilite de mon investissement

---

## 2. Contexte

### 2.1 Probleme

L'assurance emprunteur est actuellement calculee sur le capital initial (`rentabilite.ts:55`) :

```typescript
const mensualiteAssurance = (montant * (tauxAssurance / 100)) / 12;
```

Cette mensualite est **constante** sur toute la duree du credit. Or de nombreux contrats d'assurance (notamment les delegations d'assurance et les contrats groupe recents) sont calcules sur le **capital restant du**, ce qui donne une mensualite **decroissante** au fil du temps.

### 2.2 Impact financier

Pour un emprunt de 200 000 EUR a 0.3% d'assurance sur 20 ans :
- **Capital initial** : 50 EUR/mois fixe = 12 000 EUR sur 20 ans
- **Capital restant du** : ~50 EUR/mois au debut, ~2.5 EUR/mois a la fin = ~7 200 EUR sur 20 ans
- **Economie** : ~4 800 EUR (soit ~40% d'economie)

Cette difference impacte :
- Le cout total du credit
- Le cashflow mensuel (surtout en fin de credit)
- Le TRI (les flux sont meilleurs en fin de periode)
- L'analyse HCSF (les charges mensuelles evoluent)

### 2.3 Prevalence

Le mode "capital restant du" est de plus en plus courant avec la delegation d'assurance (loi Lemoine 2022). C'est le mode generalement propose par les courtiers en assurance.

---

## 3. Criteres d'acceptation

### 3.1 Choix du mode d'assurance

- [x] Nouveau champ dans le formulaire : `mode_assurance` = `capital_initial` (defaut) ou `capital_restant_du`
- [x] Le mode par defaut reste `capital_initial` (pas de rupture)
- [x] Le taux d'assurance reste saisi en pourcentage annuel

### 3.2 Calcul sur capital initial (inchange)

- [x] `mensualite_assurance = montant_emprunt * taux_assurance / 12`
- [x] Constante sur toute la duree
- [x] Comportement identique a l'existant

### 3.3 Calcul sur capital restant du

- [x] `assurance_mois_n = capital_restant(n) * taux_assurance / 12`
- [x] La mensualite diminue chaque mois avec le capital rembourse
- [x] Le calcul utilise le tableau d'amortissement existant
- [x] Le cout total de l'assurance est inferieur au mode capital initial

### 3.4 Impact sur le tableau d'amortissement

- [x] Chaque ligne du tableau d'amortissement mensuel indique l'assurance du mois
- [x] La mensualite totale (credit + assurance) varie chaque mois en mode CRD
- [x] Le total annuel d'assurance est correctement calcule dans le tableau annuel

### 3.5 Impact sur les autres modules

- [x] **Fiscalite** : l'assurance annuelle (deductible en LMNP reel/SCI IS) est correctement calculee chaque annee
- [x] **Projections** : le cout financier annuel (interets + assurance) diminue plus vite en mode CRD
- [x] **HCSF** : la mensualite totale An 1 est identique (HCSF evalue sur la premiere annee)

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/rentabilite.ts` | Modifier `calculerMensualite()` pour supporter le mode CRD, retourner l'assurance An 1 |
| `src/server/calculations/projection.ts` | `genererTableauAmortissement()` : calculer l'assurance mois par mois en mode CRD |
| `src/server/calculations/types.ts` | Ajout type `ModeAssurance = 'capital_initial' \| 'capital_restant_du'` |
| `src/types/calculateur.ts` | Ajout champ `mode_assurance` dans `FinancementData` |
| `src/components/forms/StepFinancement.tsx` | Selecteur du mode d'assurance |
| `src/lib/validators.ts` | Validation du nouveau champ |
| `src/stores/calculateur.store.ts` | Valeur par defaut du mode assurance |

### 4.2 Type

```typescript
type ModeAssurance = 'capital_initial' | 'capital_restant_du';
```

### 4.3 Modification du tableau d'amortissement

```typescript
// Dans genererTableauAmortissement()
for (let mois = 1; mois <= dureeMois; mois++) {
  const capitalRestantDebut = /* capital restant avant echeance */;

  const assuranceMois = modeAssurance === 'capital_restant_du'
    ? capitalRestantDebut * tauxAssuranceAnnuel / 12
    : montantInitial * tauxAssuranceAnnuel / 12;

  // ... reste du calcul inchange
}
```

### 4.4 Impact sur calculerMensualite()

La fonction `calculerMensualite()` retourne actuellement une mensualite fixe. En mode CRD, l'assurance An 1 (mensualite la plus haute) est retournee pour l'affichage initial et l'analyse HCSF. La mensualite totale exacte de chaque mois est disponible dans le tableau d'amortissement.

### 4.5 Points d'attention

- Le HCSF doit utiliser la mensualite maximale (An 1) pour etre conservateur
- Le cout total du credit change (somme des assurances sur toute la duree)
- Le `cout_total_interets` dans `FinancementCalculations` doit etre recalcule en tenant compte de l'assurance variable
- Les projections fiscales utilisent le cout financier annuel (interets + assurance) qui varie chaque annee en mode CRD

---

## 5. Cas de test

### 5.1 Mode capital initial (non-regression)

Emprunt 200 000 EUR, taux 3.5%, duree 20 ans, assurance 0.3% :
- Mensualite assurance : 50 EUR/mois (fixe)
- Cout total assurance : 12 000 EUR
- Comportement identique a l'existant

### 5.2 Mode capital restant du

Meme emprunt :
- Mensualite assurance mois 1 : ~50 EUR
- Mensualite assurance mois 120 (an 10) : ~27 EUR
- Mensualite assurance mois 240 (an 20) : ~2.5 EUR
- Cout total assurance : ~7 200 EUR
- **Economie vs capital initial : ~4 800 EUR**

### 5.3 Impact sur le cashflow

Comparer le cashflow An 10 et An 20 entre les deux modes :
- An 10 : le mode CRD donne un meilleur cashflow de ~23 EUR/mois
- An 20 : le mode CRD donne un meilleur cashflow de ~47 EUR/mois

### 5.4 Impact sur le TRI

Le TRI en mode CRD devrait etre superieur de 0.1-0.2 point (les flux nets sont meilleurs en fin de periode).

### 5.5 Impact sur la fiscalite

En LMNP reel / SCI IS, l'assurance deductible diminue chaque annee en mode CRD, ce qui augmente legerement la base imposable en fin de credit.

---

## 6. Definition of Done

- [x] Mode `capital_initial` et `capital_restant_du` implementes
- [x] Tableau d'amortissement calcule l'assurance mois par mois en mode CRD
- [x] Cout total de l'assurance correct dans les deux modes
- [x] Projections et TRI utilisent l'assurance reelle de chaque annee
- [x] Selecteur dans le formulaire avec valeur par defaut `capital_initial`
- [x] Tests unitaires couvrant les deux modes + comparaison des couts totaux (6 tests)
- [x] TypeScript compile sans erreur
- [x] Non-regression sur les tests existants (136 tests)
