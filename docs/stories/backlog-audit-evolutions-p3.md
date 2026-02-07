# Backlog Evolutions - Audit Methodologies Calculs

> **Source** : Audit methodologies calculs 2026-02-07
> **Priorite** : P3 (Evolutions futures)
> **Statut** : Backlog - A planifier ulterieurement

---

## Resume

Ce document regroupe les evolutions identifiees lors de l'audit du 7 fevrier 2026 qui ne sont pas prioritaires mais enrichiraient le simulateur a terme. Ces items n'ont pas de tag "A faire" et seront planifies dans de futurs sprints.

---

## E1 - Reste a vivre dans l'analyse HCSF

**Effort** : 0.5 jour | **Source** : Audit section 6.3 / Proposition P7

Les banques utilisent systematiquement le reste a vivre en complement du taux d'endettement.

**Calcul** :
```
reste_a_vivre = revenus_totaux - charges_totales
seuil = 700 EUR (celibataire) / 1 000 EUR (couple) + 300 EUR par enfant
```

**Fichiers concernes** : `hcsf.ts`, types, composants resultats

**Notes** : Necessite de connaitre la situation familiale (celibataire/couple/enfants). Ajouter ces champs dans le formulaire structure ou HCSF.

---

## E2 - Frais de revente dans le TRI

**Effort** : 0.5 jour | **Source** : Audit section 7.3 / Proposition P10

Le TRI actuel ne deduit pas les frais de cession du dernier flux.

**A deduire** :
- Frais d'agence de revente : ~5% du prix de vente
- Impot de plus-value (couvert par AUDIT-105 si fait)
- Diagnostics obligatoires : ~500 EUR

**Fichiers concernes** : `projection.ts` (dernier flux TRI), constantes

**Dependance** : AUDIT-105 (plus-value) pour l'impot de PV

---

## E3 - Assurance sur capital restant du

**Effort** : 1 jour | **Source** : Audit section 4.1 / Proposition P9

Le code calcule l'assurance sur capital initial (mode le plus courant). Le mode "capital restant du" genere des economies de 30-40% sur le cout total de l'assurance.

**A implementer** :
- Option de choix du mode d'assurance dans le formulaire
- Calcul mois par mois : `assurance(m) = capital_restant(m) * taux_assurance / 12`
- Integration dans le tableau d'amortissement et les projections

**Fichiers concernes** : `projection.ts` (tableau amortissement), `rentabilite.ts`, types, formulaire

---

## E4 - DPE et alertes passoires energetiques

**Effort** : 1 jour | **Source** : Audit section 9 (tableau ecarts)

Le DPE n'est pas pris en compte dans le simulateur.

**A implementer** :
- Champ DPE (A a G) dans le formulaire (step Bien)
- Alertes pour les passoires energetiques (F-G) : interdiction progressive de location
  - 2025 : G interdit
  - 2028 : F interdit
  - 2034 : E interdit
- Integration dans le scoring (voir AUDIT-106 si fait)
- Alerte sur les travaux de renovation energetique necessaires

**Fichiers concernes** : types, validation, synthese, formulaire

**Note** : Partiellement couvert par AUDIT-106 (critere DPE dans le scoring). Ce backlog couvre les alertes reglementaires specifiques.

---

## E5 - Reintegration des amortissements LMNP a la revente (LF 2025)

**Effort** : 1 jour | **Source** : Audit section 5.4

Depuis fevrier 2025, les amortissements deduits en LMNP reel doivent etre reintegres dans la base de calcul de la plus-value a la revente.

**Impact** : Reduit significativement l'avantage reel du LMNP reel sur le long terme.

**A implementer** :
- Cumul des amortissements deduits sur la duree de detention
- Reintegration dans la plus-value : PV = prix_vente - (prix_achat - amortissements_cumules)
- Alertes informatives sur l'impact de la reintegration

**Fichiers concernes** : `fiscalite.ts`, `projection.ts`, types

**Dependance** : AUDIT-105 (plus-value a la revente). Peut etre integre directement dans AUDIT-105.

---

## E6 - DMTO parametre par departement

**Effort** : 0.5 jour | **Source** : Audit section 3.5

Le code utilise systematiquement le DMTO majore a 5%. Tous les departements n'ont pas adopte cette hausse (certains sont a 4.5%).

**Options** :
- Ajouter un booleen `dmto_majore` (simple)
- Ajouter un selecteur de departement avec les taux corrects (complet)
- Garder 5% par defaut (conservateur, pas de changement)

**Impact** : Faible (~0.5% du prix d'achat, soit ~1 000 EUR sur un bien a 200 000 EUR)

**Fichiers concernes** : `rentabilite.ts`, constants, formulaire

---

## E7 - Indicateurs supplementaires (VAN, Multiple, Rendement fonds propres)

**Effort** : 0.5 jour | **Source** : Audit section 9 (tableau ecarts)

La specification prevoit des indicateurs non implementes :
- **VAN** (Valeur Actuelle Nette) : `VAN = Somme(Flux_Net(n) / (1+r)^n) + Valeur_Sortie / (1+r)^H - Apport`
- **Multiple sur capital investi** : `Multiple = (Valeur_Sortie + Somme(Flux_Net)) / Apport`
- **Rendement sur fonds propres** : `RSF = Cashflow_Net / Apport * 100`

**Fichiers concernes** : `projection.ts`, types, composants resultats

---

## E8 - Comparaison des regimes sur l'horizon de projection

**Effort** : 1 jour | **Source** : Audit section 5.6

La comparaison des regimes est faite sur l'annee 1 uniquement. Or certains regimes sont plus avantageux au debut (LMNP reel grace a l'amortissement) et moins sur le long terme.

**A implementer** :
- Comparaison sur l'horizon choisi (5, 10, 15, 20, 25 ans)
- Impot cumule par regime
- Graphique d'evolution comparative

**Dependance** : AUDIT-100 (fiscalite dans les projections)

---

## E9 - Frais d'agence dans le cout d'acquisition

**Effort** : 0.5 jour | **Source** : Audit section 4.3

La specification prevoit un champ `frais_agence` dans le cout total d'acquisition. Les frais d'agence sont souvent inclus dans le prix affiche (FAI - Frais d'Agence Inclus) mais pas toujours.

**A implementer** :
- Champ optionnel `frais_agence` dans le formulaire
- Integration dans `cout_total_acquisition`

---

## E10 - Capacite d'emprunt residuelle parametree

**Effort** : 0.5 jour | **Source** : Audit section 6.5

L'hypothese de calcul de la capacite d'emprunt residuelle est fixee a 20 ans / 3.5%. Ces parametres devraient etre alignes sur les conditions saisies par l'utilisateur.

**Fichiers concernes** : `hcsf.ts:99-118`

---

## Matrice de priorisation

| Item | Impact | Effort | Priorite suggeree |
|------|--------|--------|-------------------|
| E1 - Reste a vivre | Moyen | 0.5j | Sprint prochain |
| E2 - Frais revente TRI | Moyen | 0.5j | Sprint prochain |
| E3 - Assurance CRD | Faible | 1j | Backlog |
| E4 - DPE alertes | Moyen | 1j | Sprint prochain |
| E5 - Reintegration LMNP | Eleve | 1j | Avec AUDIT-105 |
| E6 - DMTO departement | Faible | 0.5j | Backlog |
| E7 - VAN/Multiple/RSF | Faible | 0.5j | Backlog |
| E8 - Comparaison pluriannuelle | Moyen | 1j | Avec AUDIT-100 |
| E9 - Frais agence | Faible | 0.5j | Backlog |
| E10 - Capacite emprunt | Faible | 0.5j | Backlog |
