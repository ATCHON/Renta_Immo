# Story AUDIT-106 : Aligner le scoring avec la specification metier

> **Priorite** : P2 (Enrichissement metier)
> **Effort** : 1 jour
> **Statut** : A faire
> **Source** : Audit methodologies calculs 2026-02-07, Section 8.1 / Proposition P6
> **Dependance** : AUDIT-100 (pour utiliser la rentabilite nette-nette)

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** un score d'investissement rigoureux et conforme a la specification metier
**Afin d'** avoir une evaluation fiable de la qualite de mon investissement

---

## 2. Contexte

### 2.1 Probleme

Le scoring actuel (`synthese.ts:28-47`) diverge de la specification metier :

**Implementation actuelle** :
| Critere | Points max |
|---------|-----------|
| Autofinancement | 30 |
| Rentabilite | 30 |
| HCSF | 25 |
| Bonus rentabilite | 15 |
| **Total** | **100** |

**Specification metier** (specification-calculs.md section 7.3) :
| Critere | Methode |
|---------|---------|
| Score base | 40 points |
| Cashflow net impot | -20 a +20 |
| Rentabilite nette-nette | -15 a +20 |
| HCSF | -25 a +20 |
| DPE | -10 a +5 |
| Ratio prix/loyer | -5 a +10 |
| Reste a vivre | -10 a +5 |

### 2.2 Ecarts

1. Le scoring actuel n'utilise pas le systeme a "base 40 + ajustements"
2. Criteres manquants : DPE, ratio prix/loyer, reste a vivre
3. La spec utilise la rentabilite nette-nette (apres impots), le code utilise la nette (avant impots)
4. La spec peut donner des malus (score negatif par critere), le code ne descend jamais en dessous de 0

### 2.3 Impact

Le score actuel est plus "genereux" que la spec. Un investissement mediocre peut obtenir un score plus eleve que prevu.

---

## 3. Criteres d'acceptation

### 3.1 Systeme de scoring

- [ ] Score de base = 40 points
- [ ] Chaque critere apporte un ajustement (bonus ou malus)
- [ ] Score final = base + somme des ajustements, borne entre 0 et 100
- [ ] Le score peut descendre en dessous de 40 (malus)

### 3.2 Critere cashflow net impot (-20 / +20)

- [ ] Cashflow net mensuel >= +200 EUR : +20
- [ ] Cashflow net mensuel entre 0 et +200 : interpolation lineaire 0 a +20
- [ ] Cashflow net mensuel entre -200 et 0 : interpolation lineaire -10 a 0
- [ ] Cashflow net mensuel <= -200 : -20

### 3.3 Critere rentabilite nette-nette (-15 / +20)

- [ ] Utilise la rentabilite nette-nette (apres impots, issue de AUDIT-100)
- [ ] Renta >= 7% : +20
- [ ] Renta entre 3% et 7% : interpolation lineaire 0 a +20
- [ ] Renta entre 0% et 3% : interpolation lineaire -15 a 0
- [ ] Renta <= 0% : -15

### 3.4 Critere HCSF (-25 / +20)

- [ ] Taux endettement <= 25% : +20
- [ ] Taux entre 25% et 35% : interpolation lineaire 0 a +20
- [ ] Taux entre 35% et 50% : interpolation lineaire -15 a 0
- [ ] Taux > 50% ou non conforme : -25

### 3.5 Critere DPE (-10 / +5)

- [ ] DPE A-B : +5
- [ ] DPE C-D : 0
- [ ] DPE E : -3
- [ ] DPE F-G (passoire) : -10
- [ ] Si DPE non renseigne : 0 (neutre)

### 3.6 Critere ratio prix/loyer (-5 / +10)

- [ ] Ratio = prix_achat / loyer_annuel
- [ ] Ratio <= 15 : +10 (excellent rapport)
- [ ] Ratio 15-20 : interpolation 0 a +10
- [ ] Ratio 20-25 : interpolation -5 a 0
- [ ] Ratio > 25 : -5

### 3.7 Critere reste a vivre (-10 / +5)

- [ ] Si reste a vivre non calculable (pas de revenus saisis) : 0
- [ ] Reste a vivre > seuil confort : +5
- [ ] Reste a vivre entre seuil min et confort : 0
- [ ] Reste a vivre < seuil min : -10

### 3.8 Retrocompatibilite

- [ ] Le score interne 0-4 (`synthese.ts:428-462`) reste inchange (indicateur rapide)
- [ ] Les recommandations textuelles restent inchangees
- [ ] Les labels qualitatifs (Excellent/Bon/Moyen/Insuffisant) s'appliquent au nouveau score

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/synthese.ts` | Refonte du calcul de score (lignes 28-100+) |
| `src/server/calculations/types.ts` | Type `ScoreDetail` enrichi |
| `src/types/calculateur.ts` | Ajout champ `dpe` dans `BienData` (si non existant) |
| Composants formulaire | Ajout selecteur DPE dans step Bien |
| `src/components/results/` | Affichage du detail du score par critere |

### 4.2 Structure du nouveau score

```typescript
interface ScoreDetail {
  base: 40;
  ajustements: {
    cashflow: number;        // -20 a +20
    rentabilite: number;     // -15 a +20
    hcsf: number;            // -25 a +20
    dpe: number;             // -10 a +5
    ratio_prix_loyer: number; // -5 a +10
    reste_a_vivre: number;    // -10 a +5
  };
  score_total: number;        // 0 a 100
  label: string;              // Excellent, Bon, etc.
}
```

---

## 5. Cas de test

### 5.1 Investissement excellent

Cashflow +300/mois, renta nette-nette 8%, HCSF 20%, DPE B, ratio 12, RAV confortable :
- Base : 40
- Cashflow : +20, Renta : +20, HCSF : +20, DPE : +5, Ratio : +10, RAV : +5
- **Score : 100** (plafonne)

### 5.2 Investissement mediocre

Cashflow -150/mois, renta nette-nette 1%, HCSF 38%, DPE F, ratio 23, RAV faible :
- Base : 40
- Cashflow : -7.5, Renta : -10, HCSF : -6.8, DPE : -10, Ratio : -3.75, RAV : -10
- **Score : ~-8 -> borne a 0** (minimum)

### 5.3 Investissement moyen

Cashflow +50/mois, renta nette-nette 4%, HCSF 30%, DPE D, ratio 18 :
- Base : 40
- Cashflow : +5, Renta : +5.7, HCSF : +10, DPE : 0, Ratio : +4
- **Score : ~65** (Bon)

---

## 6. Definition of Done

- [ ] Nouveau systeme de scoring base 40 + ajustements implemente
- [ ] 6 criteres de scoring conformes a la specification
- [ ] Selecteur DPE dans le formulaire
- [ ] Detail du score visible dans les resultats
- [ ] Score interne 0-4 preserve (retrocompatibilite)
- [ ] Tests unitaires pour chaque critere et cas limites
- [ ] TypeScript compile sans erreur
