# Audit Module HCSF — Renta_Immo
**Date :** 2026-02-18  
**Référence source :** `src/server/calculations/hcsf.ts`  
**Référence réglementaire :** Décision HCSF n°1 du 29 septembre 2021 (modifiée 2024)

---

## 1. Paramètres réglementaires HCSF

### Valeurs en base (config_params 2026)
| Paramètre | Valeur DB | Valeur HCSF 2024 | Statut |
|-----------|-----------|-----------------|--------|
| HCSF_TAUX_MAX | 35 % | 35 % | ✅ Conforme |
| HCSF_DUREE_MAX_ANNEES | 25 ans | 25 ans (27 VEFA) | ⚠️ Note |
| HCSF_PONDERATION_LOCATIFS | 70 % | 70 % | ✅ Conforme |
| RESTE_A_VIVRE_SEUIL_MIN | 1 000 € | Interne simulateur | ✅ Note |

**Note durée VEFA :** Le simulateur vérifie `duree_emprunt > 25 ans` et génère une alerte. La dérogation à 27 ans pour les VEFA n'est pas différenciée selon le type de bien — à améliorer si VEFA sera supporté.

---

## 2. Taux d'endettement (L.56–64)

### Formule
```
tauxEndettement = chargesMensuelles / revenusMensuels
```
- Cas revenus = 0 : si charges > 0 → taux = 1 (100 %), sinon 0.

✅ **Conforme** — Formule standard HCSF. Le ratio est affiché en % (×100) dans les résultats.

---

## 3. Revenus pondérés (L.70–83)

### Formule (V2-S18)
```
projetPonderes = loyerMensuelBrut × ponderation (défaut 70 %)
actuelsPonderes = loyersActuelsMensuels × ponderation
total = revenusActivite + projetPonderes + actuelsPonderes
```

### Conformité HCSF 2024
La règle HCSF prévoit que les revenus locatifs soient pris en compte à **70 %** maximum dans le calcul du taux d'endettement. Le simulateur implémente cette pondération correctement avec un paramètre configurable (V2-S18).

✅ **Conforme** — Pondération 70 % appliquée sur loyers projet ET loyers actuels.

**Note V2-S18 :** Le bouton GLI permet de configurer la pondération. Pour la GLI (Garantie Loyers Impayés), certaines banques acceptent 80 % — cela reste en zone dérogatoire HCSF (flexibilité autorisée pour 20 % des dossiers conformément à la décision HCSF 2021). Le simulateur le gère correctement en laissant l'utilisateur ajuster.

---

## 4. Capacité d'emprunt résiduelle (L.89–108)

### Formule
```
chargeMaxAutorisee = revenusTotaux × 35 %
margeDisponible = max(0, chargeMax − chargesActuelles − nouvelleCharge)
facteurActualisation = (1 − (1 + tauxMensuel)^−240) / tauxMensuel
capaciteResiduelle = margeDisponible × facteurActualisation
```

Hypothèses : durée 20 ans, taux 3,5 % fixés en dur (L.100).

⚠️ **Écart mineur** — Les hypothèses de durée (20 ans) et taux (3,5 %) sont codées en dur pour le calcul de la capacité résiduelle. Ces valeurs ne reflètent pas le marché courant. **Recommandation :** Rendre ces paramètres configurables en base (CAPACITE_RESIDUELLE_DUREE et CAPACITE_RESIDUELLE_TAUX).

---

## 5. Mode nom propre — Calcul HCSF (L.121–209)

### Flux de calcul
1. Récupérer revenus d'activité (saisis ou estimés depuis TMI)
2. Appliquer pondération sur loyers projet + actuels
3. Sommer les charges : crédits existants + autres charges + nouvelle mensualité
4. Calculer taux = charges / revenus pondérés totaux
5. Générer alertes si > 35 % ou > 33,25 % (proche du seuil)

### Estimation revenus depuis TMI (L.446–453)
| TMI | Revenus estimés/mois |
|-----|---------------------|
| 0 % | 800 € |
| ≤ 11 % | 1 800 € |
| ≤ 30 % | 3 500 € |
| ≤ 41 % | 7 000 € |
| > 41 % | 15 000 € |

⚠️ **Note** — Cette estimation heuristique est nécessaire si l'utilisateur ne renseigne pas ses revenus réels. Les valeurs sont cohérentes avec les tranches IR 2025 mais restent des approximations. L'interface doit encourager la saisie des revenus réels.

---

## 6. Mode SCI IS — Calcul par associé (L.221–354)

### Méthode
- Calcul individuel pour chaque associé (quote-part de la mensualité selon % de parts)
- Taux global = taux le plus élevé parmi les associés (conservateur)
- Reste à vivre global = revenus consolidés − charges consolidées

✅ **Conforme** — Le calcul par associé est la pratique bancaire pour les SCI. La méthode de retenir le taux le plus élevé est prudente et conservatrice.

---

## 7. Reste à vivre (AUDIT-107)

### Formule
```
resteAVivre = revenusTotauxPonderes − chargesTotalesMensuelles
```
Seuil d'alerte : 1 000 €/mois (config `RESTE_A_VIVRE_SEUIL_MIN`)

✅ **Conforme** — Le seuil de 1 000 € est un critère interne au simulateur (pas une règle HCSF officielle). C'est une valeur prudente utilisée par certains établissements bancaires. Elle doit être présentée comme un indicateur de prudence, non comme une règle réglementaire.

---

## 8. Alertes HCSF

| Condition | Type alerte | Implémentation |
|-----------|-------------|----------------|
| Durée > 25 ans | warning | ✅ L.133–136 |
| Taux > 35 % | alerte non-conformité | ✅ L.162–165 |
| Taux entre 33,25 % et 35 % | avertissement | ✅ L.166–169 |
| Reste à vivre < 1 000 € | warning | ✅ L.182–186 |

---

## 9. Synthèse Module HCSF

| Critère | Statut | Référence |
|---------|--------|-----------|
| Taux max 35 % | ✅ Conforme | Décision HCSF 2024 |
| Durée max 25 ans | ✅ Conforme (VEFA non différencié) | Décision HCSF 2024 |
| Pondération loyers 70 % | ✅ Conforme | Décision HCSF 2024 |
| Pondération configurable (GLI) | ✅ Conforme | V2-S18 |
| Calcul par associé SCI | ✅ Conforme | Pratique bancaire |
| Capacité résiduelle | ⚠️ Hypothèses fixes | — |
| Reste à vivre 1 000 € | ✅ Indicateur prudent | Interne |
| Estimation revenus/TMI | ⚠️ Approximation | — |
