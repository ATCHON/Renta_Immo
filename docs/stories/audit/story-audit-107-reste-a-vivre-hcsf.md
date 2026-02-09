# Story AUDIT-107 : Calculer le reste a vivre dans l'analyse HCSF

> **Priorite** : P3 (Evolution)
> **Effort** : 0.5 jour
> **Statut** : Terminé
> **Source** : Audit methodologies calculs 2026-02-07, Section 6.3 / Proposition P7
> **Dependance** : Aucune

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** voir mon reste a vivre mensuel apres le nouvel investissement
**Afin de** savoir si mon confort de vie est preserve malgre les charges supplementaires

---

## 2. Contexte

### 2.1 Probleme

L'analyse HCSF actuelle (`hcsf.ts`) calcule le taux d'endettement et la capacite d'emprunt residuelle, mais ne presente pas le **reste a vivre**. Or les banques utilisent systematiquement cet indicateur en complement du taux d'endettement pour evaluer la faisabilite d'un pret.

Un investisseur peut etre sous le seuil de 35% d'endettement mais avoir un reste a vivre insuffisant (ex : revenus faibles + nombreuses charges), ce qui entrainerait un refus de pret.

### 2.2 Impact

Le reste a vivre est deja utilise dans le scoring (`synthese.ts:113` - `ajustementResteAVivre()`) mais il n'est pas affiche comme un indicateur propre dans l'analyse HCSF. L'investisseur ne voit pas cette information cle.

### 2.3 Regle bancaire

Le reste a vivre = revenus totaux mensuels - charges totales mensuelles (credits + charges fixes + nouveau credit).

Seuils bancaires usuels :
- **Celibataire** : minimum ~700 EUR/mois
- **Couple** : minimum ~1 000 EUR/mois
- **Par enfant a charge** : +300 EUR/mois
- **Confort** : > 1 500 EUR/mois (profil premium)

Note : ces seuils ne sont pas reglementaires mais correspondent aux pratiques bancaires courantes.

---

## 3. Criteres d'acceptation

### 3.1 Calcul du reste a vivre

- [x] `reste_a_vivre = revenus_totaux_mensuels - charges_totales_mensuelles`
- [x] Les revenus incluent : salaires + revenus locatifs ponderes a 70% (coherent HCSF)
- [x] Les charges incluent : credits existants + autres charges + nouveau credit
- [x] Le calcul est effectue en mode nom propre ET en mode SCI IS (par associe)

### 3.2 Seuils et alertes

- [x] Alerte si reste a vivre < 700 EUR (seuil minimum celibataire)
- [x] Information si reste a vivre entre 700 et 1 500 EUR (seuil correct mais pas confortable)
- [x] Indication positive si reste a vivre >= 1 500 EUR (profil confortable)
- [x] Les seuils sont parametres dans les constantes (evolutifs)

### 3.3 Affichage dans les resultats HCSF

- [x] Le reste a vivre mensuel est affiche dans la section HCSF
- [x] Un indicateur visuel (couleur/icone) indique le niveau de confort
- [x] En mode SCI IS, le reste a vivre est affiche pour chaque associe

### 3.4 Retrocompatibilite

- [x] Le calcul HCSF existant (taux endettement, capacite residuelle) reste inchange
- [x] Le type `HCSFCalculations` est enrichi avec le nouveau champ
- [x] Le scoring reste inchange (utilise deja `ajustementResteAVivre()` dans `synthese.ts`)

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/hcsf.ts` | Ajout calcul `reste_a_vivre` dans `calculerHcsfNomPropre()` et `calculerHcsfSciIs()` |
| `src/server/calculations/types.ts` | Ajout champ `reste_a_vivre` dans le type de retour HCSF |
| `src/config/constants.ts` | Ajout constantes `RESTE_A_VIVRE.SEUIL_MIN` et `RESTE_A_VIVRE.SEUIL_CONFORT` |
| `src/components/results/` | Affichage du reste a vivre dans la section HCSF |
| `src/lib/pdf/` | Ajout du reste a vivre dans le PDF |

### 4.2 Constantes

```typescript
RESTE_A_VIVRE: {
  SEUIL_MIN: 700,       // EUR/mois - seuil minimum bancaire
  SEUIL_CONFORT: 1500,  // EUR/mois - seuil confort
}
```

### 4.3 Code cible (mode nom propre)

```typescript
// Dans calculerHcsfNomPropre(), apres le calcul existant :
const resteAVivre = revenusPonderes.total - chargesTotalesMensuelles;

// Alertes reste a vivre
if (resteAVivre < CONSTANTS.RESTE_A_VIVRE.SEUIL_MIN) {
  alertes.push(
    `Reste à vivre (${Math.round(resteAVivre)} €/mois) inférieur au seuil bancaire minimum (${CONSTANTS.RESTE_A_VIVRE.SEUIL_MIN} €/mois)`
  );
}

// Ajout au retour
return {
  ...resultExistant,
  reste_a_vivre: arrondir(resteAVivre),
};
```

### 4.4 Points d'attention

- Les revenus utilises doivent etre les memes que ceux du calcul HCSF (avec ponderation 70% des locatifs)
- En mode SCI IS, le reste a vivre doit etre calcule par associe (quote-part des charges)
- Le reste a vivre utilise dans le scoring (`synthese.ts`) devrait a terme provenir du module HCSF plutot que d'etre recalcule

---

## 5. Cas de test

### 5.1 Reste a vivre confortable

| Revenus activite | Locatifs ponderes | Credits existants | Nouveau credit | Autres charges | RAV |
|-----------------|-------------------|-------------------|----------------|----------------|-----|
| 3 500 | 630 | 500 | 800 | 200 | 2 630 |

Verdict : confortable (>= 1 500 EUR). Pas d'alerte.

### 5.2 Reste a vivre insuffisant

| Revenus activite | Locatifs ponderes | Credits existants | Nouveau credit | Autres charges | RAV |
|-----------------|-------------------|-------------------|----------------|----------------|-----|
| 1 800 | 420 | 300 | 1 100 | 200 | 620 |

Verdict : insuffisant (< 700 EUR). Alerte emise.

### 5.3 Reste a vivre intermediaire

| Revenus activite | Locatifs ponderes | Credits existants | Nouveau credit | Autres charges | RAV |
|-----------------|-------------------|-------------------|----------------|----------------|-----|
| 2 500 | 560 | 400 | 900 | 100 | 1 660 |

Verdict : correct (entre 700 et 1 500 EUR). Information sans alerte.

### 5.4 Mode SCI IS (2 associes)

Verifier que le reste a vivre est calcule pour chaque associe au prorata de ses parts.

---

## 6. Definition of Done

- [x] Reste a vivre calcule dans `calculerHcsfNomPropre()` et `calculerHcsfSciIs()`
- [x] Constantes de seuils dans `constants.ts`
- [x] Alertes contextuelles emises selon les seuils
- [x] Affichage dans les resultats HCSF (section dediee)
- [x] Tests unitaires couvrant les 3 niveaux + mode SCI IS (4 tests)
- [x] TypeScript compile sans erreur
- [x] Non-regression sur les tests existants (136 tests)
