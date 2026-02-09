# Story AUDIT-110 : DPE et alertes passoires energetiques

> **Priorite** : P3 (Evolution)
> **Effort** : 1 jour
> **Statut** : Terminé
> **Source** : Audit methodologies calculs 2026-02-07, Section 9 / Phase 3 item 11
> **Dependance** : Aucune (le champ DPE et le scoring DPE existent deja via AUDIT-106)

---

## 1. User Story

**En tant qu'** investisseur
**Je veux** recevoir des alertes claires sur les contraintes reglementaires liees au DPE de mon bien
**Afin de** anticiper les risques d'interdiction de location et les couts de renovation energetique

---

## 2. Contexte

### 2.1 Probleme

Le champ DPE existe deja dans le formulaire (`StepBien.tsx`) et impacte le scoring (AUDIT-106), mais le simulateur ne genere pas d'**alertes specifiques** sur les consequences reglementaires du DPE :

1. **Interdictions de location** (Loi Climat et Resilience) :
   - Depuis 2023 : DPE G+ (> 450 kWh/m2/an) interdit a la location
   - Depuis 1er janvier 2025 : DPE G interdit a la location
   - 1er janvier 2028 : DPE F interdit a la location
   - 1er janvier 2034 : DPE E interdit a la location

2. **Gel des loyers** : Les logements classes F et G ne peuvent plus faire l'objet d'une augmentation de loyer (IRL inapplicable).

3. **Obligation d'audit energetique** : Depuis avril 2023, un audit energetique est obligatoire pour la vente des logements F et G (monopropriete).

### 2.2 Impact sur la simulation

Pour un bien DPE F ou G :
- Le loyer est potentiellement **gele** (pas d'inflation possible) => impact sur les projections
- La **location pourrait devenir illegale** avant la fin de l'horizon de projection => risque majeur
- Des **travaux de renovation energetique** sont probablement necessaires => cout supplementaire non pris en compte

### 2.3 Etat actuel

- Le champ `dpe` est de type `'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'` (optionnel)
- Le scoring DPE est deja implemente (`synthese.ts:84-108` - `ajustementDpe()`)
- La page "En savoir plus" mentionne deja les interdictions et le scoring DPE
- **Aucune alerte n'est emise dans les resultats de calcul**

---

## 3. Criteres d'acceptation

### 3.1 Alertes passoires energetiques

- [x] Si DPE = G : alerte critique "Bien interdit a la location depuis le 1er janvier 2025"
- [x] Si DPE = F : alerte importante "Bien interdit a la location a partir du 1er janvier 2028"
- [x] Si DPE = E : alerte informative "Bien interdit a la location a partir du 1er janvier 2034"
- [x] Si DPE = F ou G : alerte "Gel des loyers - L'IRL ne s'applique pas aux passoires energetiques"

### 3.2 Impact sur les projections (DPE F et G)

- [x] Si DPE = F ou G, l'inflation loyer est forcee a 0% dans les projections (gel des loyers)
- [x] Une alerte informe l'utilisateur que l'inflation loyer a ete desactivee
- [ ] L'utilisateur peut surcharger ce comportement dans les options (ex : s'il prevoit des travaux d'amelioration) — *hors scope, evolution future*

### 3.3 Alerte sur l'horizon de projection

- [x] Si DPE = F et horizon > 2 ans (2028) : alerte "L'interdiction de location interviendra avant la fin de votre horizon de projection"
- [x] Si DPE = E et horizon > 8 ans (2034) : alerte similaire
- [x] L'alerte mentionne la necessite de travaux de renovation energetique

### 3.4 Recommandations

- [x] Si DPE = F ou G : recommandation "Prevoir un budget de renovation energetique pour ameliorer le DPE"
- [x] Si DPE = F ou G : recommandation "Verifier l'eligibilite aux aides MaPrimeRenov'"
- [x] Les recommandations sont integrees dans la section recommandations existante (`synthese.ts`)

### 3.5 Affichage

- [x] Les alertes DPE sont visibles dans une section dediee ou dans les alertes generales
- [x] Le niveau de severite (critique/important/info) est visuellement distinct
- [ ] Le PDF integre les alertes DPE — *a faire dans une prochaine iteration*

---

## 4. Specifications techniques

### 4.1 Fichiers impactes

| Fichier | Modification |
|---------|-------------|
| `src/server/calculations/synthese.ts` | Nouvelles alertes DPE dans `genererAlertes()` et recommandations |
| `src/server/calculations/projection.ts` | Gel inflation loyer si DPE F/G |
| `src/config/constants.ts` | Constantes des echeances reglementaires DPE |
| `src/components/results/` | Affichage des alertes DPE avec niveaux de severite |
| `src/lib/pdf/` | Inclusion des alertes DPE dans le PDF |

### 4.2 Constantes

```typescript
DPE_INTERDICTIONS: {
  G: { annee: 2025, libelle: 'Interdit depuis le 1er janvier 2025' },
  F: { annee: 2028, libelle: 'Interdit à partir du 1er janvier 2028' },
  E: { annee: 2034, libelle: 'Interdit à partir du 1er janvier 2034' },
},
DPE_GEL_LOYER: ['F', 'G'],  // Classes soumises au gel des loyers
```

### 4.3 Alertes (synthese.ts)

```typescript
function genererAlertesDpe(dpe?: DPE, horizon?: number): Alerte[] {
  if (!dpe) return [];
  const alertes: Alerte[] = [];
  const anneeActuelle = new Date().getFullYear();

  const interdiction = DPE_INTERDICTIONS[dpe];
  if (interdiction) {
    const dejaInterdit = anneeActuelle >= interdiction.annee;
    alertes.push({
      type: dejaInterdit ? 'critique' : 'important',
      message: interdiction.libelle,
    });

    // Verifier si l'interdiction tombe pendant l'horizon
    if (!dejaInterdit && horizon) {
      const anneesRestantes = interdiction.annee - anneeActuelle;
      if (anneesRestantes < horizon) {
        alertes.push({
          type: 'important',
          message: `L'interdiction de location interviendra dans ${anneesRestantes} ans, avant la fin de votre horizon de projection (${horizon} ans)`,
        });
      }
    }
  }

  if (DPE_GEL_LOYER.includes(dpe)) {
    alertes.push({
      type: 'important',
      message: 'Gel des loyers : l\'IRL ne s\'applique pas aux logements classés F ou G',
    });
  }

  return alertes;
}
```

### 4.4 Gel des loyers (projection.ts)

```typescript
// Dans genererProjections(), avant la boucle :
const dpe = input.bien.dpe;
const gelLoyer = dpe && DPE_GEL_LOYER.includes(dpe);

// Dans la boucle :
if (annee > 1 && !gelLoyer) {
  loyerMensuel *= (1 + inflationLoyer);
}
// Si gelLoyer, loyerMensuel reste constant
```

### 4.5 Points d'attention

- Le gel des loyers s'applique uniquement aux baux en cours et aux renouvellements, pas aux premieresmises en location. Le simulateur simplifie en gelant systematiquement.
- Les dates d'interdiction sont fixees par la loi mais pourraient etre repoussees. Les constantes doivent etre faciles a mettre a jour.
- Si l'utilisateur prevoit des travaux d'amelioration DPE, le gel ne devrait plus s'appliquer apres travaux. Hors scope de cette story (pourrait etre une evolution future).
- Le champ DPE est optionnel. Si non renseigne, aucune alerte n'est emise.

---

## 5. Cas de test

### 5.1 DPE G (passoire critique)

- Alerte critique : "Interdit depuis le 1er janvier 2025"
- Alerte gel des loyers
- Inflation loyer forcee a 0% dans les projections
- Recommandation renovation

### 5.2 DPE F avec horizon 5 ans

- Alerte importante : "Interdit a partir du 1er janvier 2028"
- Alerte : interdiction avant fin d'horizon (2028 < 2026 + 5 = 2031)
- Gel des loyers
- Inflation loyer forcee a 0%

### 5.3 DPE E avec horizon 10 ans

- Alerte informative : "Interdit a partir du 1er janvier 2034"
- Pas d'alerte sur l'horizon (2034 > 2026 + 10 = 2036) => en fait 2034 < 2036 donc alerte emise
- Pas de gel des loyers (E n'est pas soumis au gel)
- Inflation loyer normale

### 5.4 DPE C (bon)

- Aucune alerte
- Pas de gel des loyers
- Inflation loyer normale

### 5.5 DPE non renseigne

- Aucune alerte
- Inflation loyer normale
- Scoring DPE = 0 (neutre, deja gere par AUDIT-106)

### 5.6 Impact projection avec gel

Bien DPE F, loyer 900 EUR/mois, inflation defaut 2% :
- Sans gel (DPE C) : loyer An 10 = 900 * 1.02^9 = ~1 075 EUR/mois
- Avec gel (DPE F) : loyer An 10 = 900 EUR/mois (inchange)
- **Ecart sur 10 ans : ~175 EUR/mois soit ~2 100 EUR/an en An 10**

---

## 6. Definition of Done

- [x] Alertes DPE generees pour les classes E, F, G
- [x] Gel des loyers applique dans les projections pour DPE F et G
- [x] Alertes sur l'horizon de projection si interdiction imminente
- [x] Recommandations renovation integrees dans la synthese
- [x] Constantes des echeances reglementaires dans `synthese.ts`
- [x] Tests unitaires pour chaque classe DPE + impact projections (8 tests)
- [x] Affichage des alertes dans les resultats
- [x] TypeScript compile sans erreur
- [x] Non-regression sur les tests existants (136 tests)
