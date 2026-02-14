# Handoff Scrum Master — Regles Metier v2.0

> **Date** : 14 Fevrier 2026
> **Auteur** : John (PM)
> **Source** : `docs/core/regles_metier_explications_v2.md`
> **Objectif** : Structurer les corrections, nouveautes et evolutions v2.0 en Epics et Stories exploitables par l'equipe de developpement

---

## 1. Resume Executif

L'audit reglementaire de fevrier 2026 (LFI 2025, Loi Le Meur, LFSS 2026) a identifie **19 items** repartis comme suit :

| Type | Nombre | Critiques | Importants | Utiles |
|------|--------|-----------|------------|--------|
| Corrections (bugs) | 7 | 6 | 1 | - |
| Features | 8 | 2 | 3 | 3 |
| Config / Archi | 2 | - | 2 | - |
| Documentation | 2 | 1 | 1 | - |

**Effort total estime : 4-6 semaines (1 dev)**

---

## 2. Analyse de Gap — Ce qui existe deja vs ce qui est nouveau

### 2.1 Deja implemente (verifier conformite v2)

| Item v2 | Code existant | Statut | Action requise |
|---------|---------------|--------|----------------|
| CORR-02 (Bareme abattements PV) | `abattementIR()` / `abattementPS()` dans `fiscalite.ts:480-500` | Implemente (AUDIT-105) | **Verifier conformite exacte** avec les fonctions v2 |
| CORR-03 (Surtaxe PV) | `calculerSurtaxePV()` + `BAREME_SURTAXE` dans `constants.ts:142-151` | Implemente (AUDIT-105) | **Verifier conformite** — le bareme actuel inclut des tranches au-dela de 150k€ (0.06 et 0.07) qui ne sont pas dans v2 |
| CORR-04 (3 categories Micro-BIC) | `TypeLocation` a deja 4 valeurs : `nue`, `meublee_longue_duree`, `meublee_tourisme_classe`, `meublee_tourisme_non_classe` | Types OK | **Verifier la propagation** dans le calculateur fiscal et l'UI |
| CORR-05 (PS PV a 17.2%) | `PLUS_VALUE.TAUX_PS = 0.172` dans `constants.ts:137` | Constante OK | **Audit de code** : grep pour usage de `PRELEVEMENTS_SOCIAUX_LMNP` (18.6%) dans le module PV |
| CORR-06 (Vacance locative) | `tauxOccupation` present dans types et certains calculs | Partiellement implemente | **A completer** : verifier propagation dans cashflow, rentabilite, projections + UI |
| CORR-07 (DPE condition loyers) | `dpe-alertes.test.ts` existe | Partiellement implemente | **A completer** : logique de gel loyers F/G + conditionnelle E/2034 dans projections |
| FEAT-01 (CFE) | `CFE_MIN: 200` dans `constants.ts:163` | Constante existe | **A implementer** : logique d'exoneration < 5000€, 1ere annee, integration charges |
| FEAT-02 (Frais compta) | `COMPTABLE_LMNP: 400` dans `constants.ts:162` | Constante existe | **A verifier** : suppression reference OGA/CGA, deductibilite 100% |

### 2.2 Nouveau (a implementer)

| Item v2 | Description | Etat actuel |
|---------|-------------|-------------|
| CORR-01 (Ordre calcul PV) | Forfaits 7.5% frais + 15% travaux AVANT soustraire amortissements | **Absent** — formule actuelle : `prixVente - prixAchat + amortissements` |
| FEAT-03 (Deficit foncier majore 21 400€) | Travaux renovation energetique 2023-2025 | **Absent** — constante actuelle = 10 700€ seulement |
| FEAT-04 (Reintegration amort LMNP raffinee) | Exclusion mobilier, exemption residences services, date 15/02/2025 | **Partiellement** — reintegration basique OK, mais sans distinctions |
| FEAT-05 (Alerte seuil LMP) | Bandeau si recettes > 20 000€ | **Absent** |
| FEAT-06 (Scoring dual profil) | Mode Rentier + mode Patrimonial | **Absent** — scoring mono-profil actuel |
| FEAT-07 (Taux occupation configurable UI) | Slider 70-100% + suggestions par zone | **A verifier** si deja dans le formulaire |
| FEAT-08 (Ponderation HCSF ajustable) | Champ configurable + bouton GLI | **Absent** — PONDERATION_LOCATIFS fixe a 70% |
| CONFIG-01 (Page admin back-office) | Interface complete de gestion des parametres reglementaires | **Absent** — toutes les constantes sont en dur |
| ARCH-01 (Versioning parametres) | Historisation par annee fiscale | **Absent** |
| DOC-01 (Supprimer OGA/CGA) | Retirer toute reference a la reduction 915€ | **A auditer** |
| DOC-02 (Clarifier PS 18.6% vs 17.2%) | Documentation et nommage des constantes | **A clarifier** dans le code |

---

## 3. Proposition d'Epics

### EPIC-V2-01 : Corrections Critiques Plus-Value (CORR-01, CORR-02, CORR-03, CORR-05)
> **Priorite** : CRITIQUE | **Effort** : 3-5 jours | **Sprint** : Sprint 1

**Justification** : Ces 4 corrections touchent toutes le meme module (`fiscalite.ts` / plus-value) et sont interdependantes. Les traiter ensemble garantit la coherence.

**Stories :**

| ID | Titre | Effort | Criteres d'acceptation |
|----|-------|--------|------------------------|
| V2-S01 | Corriger la formule prix d'acquisition corrige (forfaits 7.5% + 15%) | M | La PV brute integre les forfaits AVANT soustraction des amortissements. Tests : PV correcte pour detentions > 5 ans avec/sans travaux. |
| V2-S02 | Verifier et consolider le bareme abattements PV progressif | S | Fonctions `abattementIR()` et `abattementPS()` strictement conformes au bareme v2. Tests parametriques pour annees 1 a 35. |
| V2-S03 | Verifier le bareme surtaxe PV vs specification v2 | S | Bareme aligne avec v2 (5 tranches). Verification des tranches > 150k€ actuelles. |
| V2-S04 | Audit taux PS PV (17.2%) vs PS revenus BIC LMNP (18.6%) | S | Grep exhaustif : aucun appel a `PRELEVEMENTS_SOCIAUX_LMNP` dans le calcul de plus-value. Constantes renommees pour clarte : `TAUX_PS_REVENUS_BIC_LMNP` et `TAUX_PS_PLUS_VALUES`. |
| V2-S05 | Ajouter parametres residence de services et mobilier dans reintegration PV LMNP | M | `typeResidence` dans le formulaire. Mobilier exclu de la reintegration. Residences de services exemptees. Date d'application 15/02/2025 respectee. |

**Fichiers principaux impactes :**
- `src/config/constants.ts` (ajout constantes forfaits PV, renommage PS)
- `src/server/calculations/fiscalite.ts` (refonte `calculerPlusValueIR`)
- `src/server/calculations/types.ts` (ajout `typeResidence`, champs PV)
- `src/server/calculations/plus-value.test.ts` (extension massive)

---

### EPIC-V2-02 : Vacance Locative et Revenus Corriges (CORR-06, FEAT-07)
> **Priorite** : CRITIQUE | **Effort** : 3-5 jours | **Sprint** : Sprint 1

**Justification** : CORR-06 (bug critique impactant TOUS les calculs de cashflow et rentabilite) est indissociable de FEAT-07 (composant UI pour le parametre).

**Stories :**

| ID | Titre | Effort | Criteres d'acceptation |
|----|-------|--------|------------------------|
| V2-S06 | Propager `tauxOccupation` dans calculs cashflow et rentabilite | M | `revenusBrutsAnnuels = loyerMensuel * 12 * tauxOccupation` dans tous les calculateurs. Valeur par defaut = 0.92. Tests de non-regression. |
| V2-S07 | Ajouter le slider taux d'occupation dans le formulaire | S | Slider 70%-100%, defaut 92%, tooltip avec suggestions par zone (tableau v2). Propagation dans le store Zustand. |
| V2-S08 | Mettre a jour les tests de regression | S | Tous les tests existants adaptés au nouveau parametre. Cashflow et rentabilite nette recalcules avec vacance. |

**Fichiers principaux impactes :**
- `src/server/calculations/rentabilite.ts`
- `src/server/calculations/projection.ts`
- `src/components/forms/StepExploitation.tsx`
- `src/stores/calculateur.store.ts`
- Tous les fichiers `*.test.ts`

---

### EPIC-V2-03 : Conformite Fiscale LMNP (CORR-04, FEAT-01, FEAT-02, DOC-01)
> **Priorite** : CRITIQUE | **Effort** : 4-6 jours | **Sprint** : Sprint 1-2

**Justification** : Les corrections LMNP (3 categories micro-BIC, CFE, frais compta, suppression OGA/CGA) forment un ensemble coherent pour la conformite fiscale LMNP.

**Stories :**

| ID | Titre | Effort | Criteres d'acceptation |
|----|-------|--------|------------------------|
| V2-S09 | Propager les 3 categories Micro-BIC dans le calculateur fiscal | M | Les types existent deja. Verifier que `calculerMicroBIC()` applique le bon abattement/plafond selon `typeLocation`. UI : selector visible dans StepStructure. |
| V2-S10 | Integrer la CFE dans les charges LMNP avec logique d'exoneration | M | CFE ajoutee si recettes >= 5000€/an. Exoneree la 1ere annee. Deductible en reel seulement. Champ dans formulaire avec defaut 300€. Infobulle explicative. |
| V2-S11 | Frais de comptabilite LMNP reel (sans reduction OGA/CGA) | S | Champ "frais comptabilite" visible uniquement en regime reel. Deductible a 100% en charge. Valeur defaut 500€. AUCUNE mention de reduction 915€. |
| V2-S12 | Auditer et supprimer toute reference OGA/CGA dans le code et la documentation | S | Grep "OGA" / "CGA" / "915" dans tout le code source et les docs. Suppression complete. |

**Fichiers principaux impactes :**
- `src/server/calculations/fiscalite.ts` (calculerMicroBIC, calculerLMNPReel)
- `src/config/constants.ts` (CFE constantes enrichies)
- `src/components/forms/StepStructure.tsx` / `StepExploitation.tsx`
- `src/server/calculations/types.ts`

---

### EPIC-V2-04 : DPE et Conditionnels de Projection (CORR-07)
> **Priorite** : IMPORTANT | **Effort** : 1-2 jours | **Sprint** : Sprint 2

**Stories :**

| ID | Titre | Effort | Criteres d'acceptation |
|----|-------|--------|------------------------|
| V2-S13 | Conditionner l'inflation des loyers a la classe DPE | S | DPE F/G : 0% des la 1ere annee. DPE E : 0% a partir de 2034. DPE A-D : taux normal. Alerte forte si F/G. |
| V2-S14 | Conditionner la revalorisation du bien au DPE | S | Coherence avec le gel des loyers pour les passoires thermiques dans les projections long terme. |

**Fichiers principaux impactes :**
- `src/server/calculations/projection.ts`
- `src/server/calculations/synthese.ts` (alertes)

---

### EPIC-V2-05 : Deficit Foncier Majore et Location Nue (FEAT-03)
> **Priorite** : IMPORTANT | **Effort** : 1-2 jours | **Sprint** : Sprint 2

**Stories :**

| ID | Titre | Effort | Criteres d'acceptation |
|----|-------|--------|------------------------|
| V2-S15 | Implementer le plafond deficit foncier majore 21 400€ | S | Checkbox "Renovation energetique eligible (E/F/G vers A/B/C/D)". Si cochee ET annee <= 2025 : plafond = 21 400€. Alerte si dispositif expire. |

**Fichiers principaux impactes :**
- `src/config/constants.ts` (ajout `DEFICIT_FONCIER.PLAFOND_ENERGIE`)
- `src/server/calculations/fiscalite.ts` (deficit foncier)
- `src/components/forms/StepBien.tsx` ou `StepStructure.tsx`

---

### EPIC-V2-06 : Scoring et Recommandations v2 (FEAT-06, FEAT-05)
> **Priorite** : UTILE | **Effort** : 3-4 jours | **Sprint** : Sprint 3

**Stories :**

| ID | Titre | Effort | Criteres d'acceptation |
|----|-------|--------|------------------------|
| V2-S16 | Implementer le profil scoring "Patrimonial" | M | Toggle Rentier/Patrimonial dans l'UI. Profil Patrimonial : cashflow attenue, TRI 15 ans renforce. Scores differents selon profil. |
| V2-S17 | Ajouter l'alerte seuil LMP (23 000€) | S | Bandeau d'avertissement si recettes LMNP > 20 000€. Texte clair sur les consequences. |

**Fichiers principaux impactes :**
- `src/server/calculations/synthese.ts`
- `src/components/results/` (scoring UI)
- `src/server/calculations/validation.ts`

---

### EPIC-V2-07 : Parametres HCSF Ajustables (FEAT-08)
> **Priorite** : UTILE | **Effort** : 1 jour | **Sprint** : Sprint 3

**Stories :**

| ID | Titre | Effort | Criteres d'acceptation |
|----|-------|--------|------------------------|
| V2-S18 | Rendre la ponderation loyers HCSF configurable | S | Champ dans formulaire HCSF (defaut 70%). Bouton "Avec GLI" passe a 80%. Note explicative. |

**Fichiers principaux impactes :**
- `src/server/calculations/hcsf.ts`
- `src/components/forms/StepFinancement.tsx`

---

### EPIC-V2-08 : Page de Configuration Back-Office (CONFIG-01, ARCH-01, ARCH-02)
> **Priorite** : IMPORTANT (long terme) | **Effort** : 2-4 semaines | **Sprint** : Sprint 4+

**Justification** : C'est le chantier le plus lourd. Il transforme toutes les constantes en dur en parametres configurables via une interface admin. A planifier apres la livraison des corrections critiques.

**Stories :**

| ID | Titre | Effort | Criteres d'acceptation |
|----|-------|--------|------------------------|
| V2-S19 | Concevoir le schema de donnees `ConfigParam` | M | Interface TypeScript + schema BDD Supabase. Versioning par annee fiscale. |
| V2-S20 | Creer l'API CRUD pour les parametres | L | Endpoints GET/PUT/POST avec validation de coherence. Audit log. Authentification admin. |
| V2-S21 | Creer l'interface admin des parametres (8 blocs) | L | Page admin avec les 8 blocs (A a H) du v2. Edition inline. Validation temps reel. |
| V2-S22 | Migrer les constantes du code vers la base de donnees | L | Toutes les valeurs de `constants.ts` servies depuis la BDD. Fallback sur valeurs en dur si BDD indisponible. |
| V2-S23 | Systeme d'alertes pour dispositifs temporaires | M | Email/notification 90 jours avant expiration d'un dispositif. Dashboard admin avec statut des dispositifs. |
| V2-S24 | Mode Dry Run (simulation impact changement) | M | Tester l'impact d'un changement de parametre sur un jeu de cas tests avant activation. |

**Fichiers principaux impactes :**
- Nouveau module `src/app/admin/` (pages, API)
- `src/server/` (nouveau service config)
- Migration Supabase
- `src/config/constants.ts` (refactoring majeur)

---

## 4. Proposition de Sprint Planning

### Sprint 1 — Corrections critiques (Semaines 1-2)
> **Objectif** : Eliminer tous les bugs de calcul impactant la fiabilite

| Epic | Stories | Effort |
|------|---------|--------|
| EPIC-V2-01 (PV) | V2-S01, V2-S02, V2-S03, V2-S04, V2-S05 | 3-5j |
| EPIC-V2-02 (Vacance) | V2-S06, V2-S07, V2-S08 | 3-5j |

**Definition of Done Sprint 1 :**
- Formule PV conforme a la v2 (forfaits, abattements, surtaxe, taux PS)
- Vacance locative integree dans tous les calculs
- Tests de non-regression passes
- Aucune regression fonctionnelle

---

### Sprint 2 — Conformite fiscale (Semaines 3-4)
> **Objectif** : Completer la couverture fiscale LMNP et location nue

| Epic | Stories | Effort |
|------|---------|--------|
| EPIC-V2-03 (LMNP) | V2-S09, V2-S10, V2-S11, V2-S12 | 4-6j |
| EPIC-V2-04 (DPE) | V2-S13, V2-S14 | 1-2j |
| EPIC-V2-05 (Deficit) | V2-S15 | 1j |

**Definition of Done Sprint 2 :**
- 3 categories Micro-BIC operationnelles
- CFE et frais compta integres dans les calculs LMNP
- Aucune reference OGA/CGA dans le code
- DPE conditionne les projections correctement
- Deficit foncier majore 21 400€ disponible

---

### Sprint 3 — Ameliorations UX et scoring (Semaines 5-6)
> **Objectif** : Enrichir l'experience utilisateur et la pertinence des recommandations

| Epic | Stories | Effort |
|------|---------|--------|
| EPIC-V2-06 (Scoring) | V2-S16, V2-S17 | 3-4j |
| EPIC-V2-07 (HCSF) | V2-S18 | 1j |
| DOC-02 | Clarification documentation PS | 0.5j |

**Definition of Done Sprint 3 :**
- Scoring dual profil operationnel (Rentier / Patrimonial)
- Alerte LMP visible quand applicable
- HCSF ponderation ajustable
- Documentation code clarifiee

---

### Sprint 4+ — Back-office (Semaines 7+)
> **Objectif** : Industrialiser la gestion des parametres reglementaires

| Epic | Stories | Effort |
|------|---------|--------|
| EPIC-V2-08 (Config) | V2-S19 a V2-S24 | 2-4 semaines |

**A planifier avec l'architecte apres livraison des sprints 1-3.**

---

## 5. Graphe de Dependances

```
EPIC-V2-01 (PV Critiques)    ──► Independant — Sprint 1
    │
    └── V2-S05 depend de V2-S01 (forfaits avant reintegration)

EPIC-V2-02 (Vacance)         ──► Independant — Sprint 1
    │
    └── V2-S08 depend de V2-S06 (tests apres refactoring)

EPIC-V2-03 (LMNP Fiscal)     ──► Peut demarrer Sprint 1 en parallele
    │
    ├── V2-S10 (CFE) depend de V2-S09 (categories LMNP)
    └── V2-S12 (audit OGA) independant

EPIC-V2-04 (DPE)             ──► Depend de EPIC-V2-02 (vacance dans projections)

EPIC-V2-05 (Deficit)         ──► Independant

EPIC-V2-06 (Scoring)         ──► Depend de EPIC-V2-01 et EPIC-V2-02 (calculs corriges)

EPIC-V2-08 (Config)          ──► Depend de tous les sprints precedents
```

---

## 6. Risques et Points d'Attention

| Risque | Impact | Mitigation |
|--------|--------|------------|
| **Regression tests** : Les corrections PV et vacance changent TOUS les resultats | Eleve | Executer la suite de tests complete a chaque merge. Mettre a jour les snapshots de test. |
| **UX disruption** : Les scores et cashflows seront differents apres correction | Moyen | Communiquer le changement aux utilisateurs. Optionnel : ajouter un bandeau "Calculs mis a jour". |
| **CORR-01 complexite** : Le refactoring de `calculerPlusValueIR()` est structurel | Moyen | Ecrire les tests d'abord (TDD), valider avec les cas du v2 section 5.1/5.2. |
| **Scope creep CONFIG-01** : Le back-office est un chantier enorme | Eleve | Le reporter apres les corrections critiques. Livrer d'abord la valeur (calculs justes). |
| **Deficit foncier majore** : Dispositif expire au 31/12/2025 | Faible | Implementer quand meme (valeur pour simulations retrospectives) mais avec alerte d'expiration. |
| **Coordination backlog P3 existant** : E1 (reste a vivre), E2 (frais revente), E4 (DPE alertes) recouvrent partiellement des items v2 | Moyen | Fermer/fusionner les items P3 en doublon avec les stories v2. Voir section 7. |

---

## 7. Reconciliation avec le Backlog Existant

Les items suivants du `backlog-audit-evolutions-p3.md` sont impactes par le v2 :

| Item P3 | Statut | Action |
|---------|--------|--------|
| E1 — Reste a vivre HCSF | Non impacte par v2 | Conserver tel quel, planifiable independamment |
| E2 — Frais revente TRI | Non impacte par v2 | Conserver tel quel |
| E3 — Assurance CRD | Non impacte par v2 | Conserver tel quel |
| **E4 — DPE alertes** | **Couvert par EPIC-V2-04** | **Fusionner avec V2-S13/S14** |
| **E5 — Reintegration amort LMNP** | **Couvert par EPIC-V2-01 (V2-S05)** | **Fermer, remplace par V2-S05** |
| E6 — DMTO parametre | Non impacte par v2 | Conserver tel quel |
| E7 — VAN/Multiple/RSF | Non impacte par v2 | Conserver tel quel |
| E8 — Comparaison pluriannuelle | Non impacte par v2 | Conserver tel quel |
| E9 — Frais agence | Non impacte par v2 | Conserver tel quel |
| E10 — Capacite emprunt | Non impacte par v2 | Conserver tel quel |

---

## 8. Metriques de Succes

| Metrique | Objectif | Mesure |
|----------|----------|--------|
| Corrections critiques livrees | 7/7 | Nombre de CORR-xx deployes |
| Couverture tests module PV | > 95% | `jest --coverage` |
| Ecart calcul PV vs calcul expert | < 1% | Jeu de cas tests valide par le metier |
| Satisfaction scoring | Pas de faux negatif sur profil patrimonial | Test qualitatif 5 scenarios |
| Temps mise a jour parametres (post-CONFIG-01) | < 5 min pour un changement LFI | Chrono admin |

---

*Document genere le 14 Fevrier 2026 — PM John*
*Source de verite metier : `docs/core/regles_metier_explications_v2.md`*
