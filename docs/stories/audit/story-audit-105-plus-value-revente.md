# Story AUDIT-105 : Calcul de plus-value a la revente

> **Priorite** : P2 (Enrichissement metier)
> **Effort** : 2 jours
> **Statut** : Done (2026-02-07)
> **Source** : Audit methodologies calculs 2026-02-07, Section 7.3 / Proposition P4
> **Dependance** : AUDIT-100 (projections avec impots)

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** connaitre l'impot de plus-value a la revente pour chaque horizon de projection
**Afin d'** evaluer le rendement reel de mon investissement sur le long terme

---

## 2. Contexte

### 2.1 Probleme

Le TRI actuel suppose une revente au patrimoine net (`valeur_bien - capital_restant`) sans frais de cession ni impot de plus-value. En realite, la fiscalite de la plus-value peut representer un montant significatif, surtout en SCI IS.

### 2.2 Regles fiscales

#### Nom propre (IR) - Location nue et LMNP

Abattements pour duree de detention :
- **IR** : 6%/an de la 6e a la 21e annee, 4% la 22e annee (exoneration totale a 22 ans)
- **PS** : 1.65%/an de la 6e a la 21e annee, 1.6% la 22e annee, 9%/an de la 23e a la 30e annee (exoneration totale a 30 ans)

Taux : IR 19% + PS 17.2% = 36.2% (avant abattements)

#### LMNP - Reintegration des amortissements (LF 2025)

Depuis fevrier 2025, les amortissements deduits sont reintegres dans la plus-value imposable. La plus-value = prix_vente - (prix_achat - amortissements_cumules).

#### SCI IS

Plus-value = prix_vente - valeur_nette_comptable (prix_achat - amortissements_cumules). Imposee a l'IS (15%/25%), puis flat tax 30% si distribution aux associes.

---

## 3. Criteres d'acceptation

### 3.1 Calcul plus-value nom propre

- [ ] Plus-value brute = prix_vente (valeur revalorisee) - prix_achat
- [ ] Abattement IR selon duree de detention (bareme progressif)
- [ ] Abattement PS selon duree de detention (bareme progressif)
- [ ] Impot PV = (PV nette IR * 19%) + (PV nette PS * 17.2%)
- [ ] Surtaxe si PV > 50 000 EUR (bareme specifique)
- [ ] Exoneration totale IR apres 22 ans, PS apres 30 ans

### 3.2 Calcul plus-value LMNP (post LF 2025)

- [ ] Reintegration des amortissements deduits dans la plus-value
- [ ] PV brute = prix_vente - (prix_achat - amortissements_cumules)
- [ ] Abattements identiques au regime des particuliers

### 3.3 Calcul plus-value SCI IS

- [ ] PV = prix_vente - valeur_nette_comptable
- [ ] VNC = prix_achat - amortissements_cumules
- [ ] Imposition a l'IS (15%/25%)
- [ ] Si distribution : flat tax 30% additionnelle

### 3.4 Integration dans les projections

- [ ] L'impot de PV est calcule pour chaque horizon (5, 10, 15, 20, 25 ans)
- [ ] Le dernier flux du TRI integre la revente nette de PV
- [ ] L'enrichissement total tient compte de l'impot de PV

### 3.5 Affichage

- [ ] Montant de la plus-value brute
- [ ] Montant de l'impot de plus-value
- [ ] Montant net de revente
- [ ] Comparaison par regime (la PV SCI IS est generalement plus elevee)

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/fiscalite.ts` | Nouvelles fonctions `calculerPlusValueIR()`, `calculerPlusValueSciIs()` |
| `src/server/calculations/projection.ts` | Integration PV dans le dernier flux TRI et patrimoine net |
| `src/server/calculations/types.ts` | Type `PlusValueDetail` |
| `src/components/results/` | Affichage de la PV par horizon |

### 4.2 Bareme abattements IR

```typescript
function abattementIR(dureeDetention: number): number {
  if (dureeDetention <= 5) return 0;
  if (dureeDetention <= 21) return (dureeDetention - 5) * 0.06;
  if (dureeDetention === 22) return 0.96 + 0.04;  // = 100%
  return 1; // Exonere
}
```

### 4.3 Bareme abattements PS

```typescript
function abattementPS(dureeDetention: number): number {
  if (dureeDetention <= 5) return 0;
  if (dureeDetention <= 21) return (dureeDetention - 5) * 0.0165;
  if (dureeDetention === 22) return 0.264 + 0.016;  // = 28%
  if (dureeDetention <= 30) return 0.28 + (dureeDetention - 22) * 0.09;
  return 1; // Exonere
}
```

---

## 5. Cas de test

### 5.1 Plus-value nom propre apres 10 ans

Achat 200 000, revente 230 000 (revalorisation 1.5%/an) :
- PV brute : 30 000 EUR
- Abattement IR (10 ans) : 5 * 6% = 30%
- PV nette IR : 21 000 EUR -> IR : 3 990 EUR
- Abattement PS (10 ans) : 5 * 1.65% = 8.25%
- PV nette PS : 27 525 EUR -> PS : 4 734 EUR
- **Total impot PV : 8 724 EUR**

### 5.2 Plus-value SCI IS apres 10 ans

Meme bien, amortissements cumules 51 510 EUR (simplifie) :
- VNC : 200 000 - 51 510 = 148 490 EUR
- PV : 230 000 - 148 490 = 81 510 EUR
- IS : 42 500 * 15% + 39 010 * 25% = 6 375 + 9 752 = 16 127 EUR
- Si distribution : (81 510 - 16 127) * 30% = 19 615 EUR
- **Total : 35 742 EUR** (beaucoup plus eleve qu'en nom propre)

### 5.3 Exoneration totale IR

Apres 22 ans de detention : impot PV IR = 0, seuls les PS restent (jusqu'a 30 ans).

---

## 6. Definition of Done

- [ ] Plus-value calculee pour chaque horizon de projection
- [ ] Trois regimes couverts (nom propre, LMNP avec reintegration, SCI IS)
- [ ] Abattements pour duree de detention corrects
- [ ] Integration dans le TRI et l'enrichissement total
- [ ] Tests unitaires exhaustifs (abattements par duree)
- [ ] TypeScript compile sans erreur
