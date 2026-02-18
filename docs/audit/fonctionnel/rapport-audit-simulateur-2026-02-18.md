# Rapport d'Audit — Simulateur Renta_Immo
**Version :** 1.0
**Date :** 2026-02-18
**Périmètre :** Audit de conformité des formules mathématiques, fiscales et réglementaires
**Référence légale principale :** Code Général des Impôts (CGI), Décision HCSF 2024, Loi Climat-Résilience, LF 2025 (Loi Le Meur)

---

## Résumé Exécutif

Le simulateur Renta_Immo est une application web de simulation d'investissement immobilier locatif. Ce rapport présente les résultats d'un audit complet de ses formules de calcul, couvrant 55 points de vérification répartis sur 9 domaines.

### Verdict Global

| Résultat | Quantité | Pourcentage |
|---------|---------|-------------|
| ✅ Conformes | 53/55 | 96,4 % |
| ⚠️ Approximations mineures acceptables | 2/55 | 3,6 % |
| ❌ Non-conformités à corriger | 0/55 | 0 % |

**Le simulateur est pleinement conforme à la législation française 2025-2026.** Toutes les non-conformités et approximations corrigeables ont été résolues (NC-02, REC-01 à REC-05 — voir corrections du 2026-02-18).

---

## Partie A — Synthèse Exécutive

### Domaines audités

1. **Formules de financement** — PMT, frais de notaire, coût total d'acquisition, rentabilités, cashflow, effet de levier
2. **Fiscalité** — 6 régimes fiscaux (micro-foncier, foncier réel, LMNP micro, LMNP réel, SCI IS, SCI IS avec distribution), déficit foncier, amortissements, plus-values
3. **Conformité HCSF** — Taux d'endettement, pondération loyers, durée crédit, calcul par associé
4. **Scoring investisseur** — Système propriétaire, profils Rentier/Patrimonial
5. **Projections pluriannuelles** — TRI, tableau d'amortissement, DPE, inflation

### Non-conformités identifiées

#### ~~❌ NC-01~~ — ✅ Prélèvements sociaux LMNP — CONFORME (mise à jour LFSS 2026)
- **Valeur DB :** 18,6 % (`TAUX_PS_REVENUS_BIC_LMNP`)
- **Contexte initial :** L'audit avait identifié un écart avec le taux de 17,2 % applicable aux revenus du patrimoine.
- **Mise à jour :** La **LFSS 2026** a relevé la CSG de 9,20 % à 10,60 %, portant les prélèvements sociaux sur les revenus BIC LMNP non-professionnels à **18,60 %**. S'applique rétroactivement aux revenus 2025.
- **Distinction :** Les plus-values immobilières restent à 17,20 % ; les revenus fonciers (location nue) ne sont pas impactés.
- **Aucune correction requise.**

#### ~~❌ NC-02~~ — ✅ Barème surtaxe plus-value — RÉSOLU (correction code 2026-02-18)
- **Localisation :** `src/server/calculations/fiscalite.ts` ligne 557–561
- **Problème initial :** La tranche 200 001–250 000 € appliquait 6 % au lieu de 5 % (CGI Art. 1609 nonies G)
- **Correction appliquée :** `TAUX: 0.06` → `TAUX: 0.05` pour cette tranche
- **Tests ajoutés :** `tests/unit/calculations/plus-value.test.ts` — 4 cas couvrant PV nette 175k, 230k, 260k et 300k €
- **Aucune action requise.**

### Points forts du simulateur

- ✅ **6 régimes fiscaux** tous conformes dans leurs paramètres principaux
- ✅ **Déficit foncier** : séparation intérêts/hors-intérêts, plafonds 10 700 €/21 400 €, report 10 ans FIFO
- ✅ **Amortissement par composants** (PCG Art. 214-9) : répartition et durées conformes
- ✅ **Loi Le Meur** (15/02/2025) : réintégration amortissements LMNP correctement implémentée avec exemption résidences de services
- ✅ **HCSF 2024** : taux 35 %, durée 25 ans, pondération 70 % tous conformes
- ✅ **DPE** : interdictions 2025/2028/2034, gel des loyers F/G conformes à la Loi Climat-Résilience
- ✅ **SCI IS** : taux IS 15 %/25 % (seuil 42 500 €), flat tax 30 % conformes

### Recommandations prioritaires

| Priorité | Action | Statut |
|---------|--------|--------|
| ~~🔴 Haute~~ | ~~Corriger PS LMNP : 18,6 % → 17,2 %~~ — LFSS 2026 confirme 18,6 % | ✅ N/A (conforme) |
| ~~🟠 Moyenne~~ | ~~Corriger surtaxe PV tranche 200k-250k~~ — NC-02 | ✅ **Résolu** (2026-02-18) |
| ~~🟡 Faible~~ | ~~Calculer frais notaire par tranches réelles~~ — REC-01 | ✅ **Résolu** (2026-02-18) |
| ~~🟡 Faible~~ | ~~Rendre paramètres capacité résiduelle HCSF configurables~~ — REC-02 | ✅ **Résolu** (2026-02-18) |
| ~~🟢 Info~~ | ~~Documenter hypothèses inflation projections dans l'interface~~ — REC-03 | ✅ **Résolu** (2026-02-18) |
| ~~🟡 Faible~~ | ~~Différencier VEFA (dérogation 27 ans HCSF)~~ — REC-04 | ✅ **Résolu** (2026-02-18) |
| ~~🟡 Faible~~ | ~~Alerte TRI non significatif quand apport = 0~~ — REC-05 | ✅ **Résolu** (2026-02-18) |

---

## Partie B — Structure du Rapport Technique

Ce rapport principal est accompagné de 6 annexes techniques :

| Fichier | Contenu |
|---------|---------|
| [01-module-rentabilite.md](./01-module-rentabilite.md) | PMT, frais notaire, rendements, cashflow, financement |
| [02-module-fiscalite.md](./02-module-fiscalite.md) | 6 régimes fiscaux, déficit, amortissements, plus-value |
| [03-module-hcsf.md](./03-module-hcsf.md) | Taux d'endettement, pondération, reste à vivre |
| [04-module-scoring-projections.md](./04-module-scoring-projections.md) | Scoring, TRI, projections 20 ans, DPE |
| [05-tests-reels.md](./05-tests-reels.md) | 5 cas de test avec calculs manuels vérifiés |
| [06-synthese-conformite.md](./06-synthese-conformite.md) | Tableau de conformité complet (55 points) + corrections |

---

## Méthode d'Audit

### Étape 1 — Lecture du code source
Lecture ligne par ligne des fichiers :
- `src/server/calculations/rentabilite.ts` (239 lignes)
- `src/server/calculations/fiscalite.ts` (1 001 lignes)
- `src/server/calculations/hcsf.ts` (468 lignes)
- `src/server/calculations/synthese.ts` (672 lignes)
- `src/server/calculations/projection.ts` (704 lignes)
- `src/server/calculations/constants.ts` (111 lignes)

### Étape 2 — Vérification des paramètres de configuration
Requête directe sur la base de données Supabase (table `config_params`, `annee_fiscale = 2026`) : 47 paramètres vérifiés.

### Étape 3 — Vérification contre les textes légaux
Cross-check systématique contre :
- Code Général des Impôts (Légifrance)
- Décision HCSF n°1 du 29/09/2021 (modifiée 2024)
- Plan Comptable Général Art. 214-9
- BOFiP (Base Officielle des Finances Publiques)
- Loi Climat-Résilience (L.2021-1104)
- Loi de Finances 2025 (Loi Le Meur)

### Étape 4 — Vérification par calcul manuel
5 cas de test complets réalisés par calcul manuel et comparés aux résultats attendus du moteur.

---

## Périmètre et Limites

### Ce qui est couvert
- Formules mathématiques et fiscales du moteur de calcul
- Paramètres réglementaires en base de données (config_params)
- Logique de gestion des régimes, déficits et amortissements
- Conformité HCSF et DPE

### Ce qui n'est pas couvert
- Tests d'intégration via API (infrastructure locale non disponible lors de l'audit)
- Interface utilisateur et validation des saisies
- Sécurité applicative (couverte par l'Audit Technique 2026-02-07)
- Performance et scalabilité (couverte par l'Audit Technique 2026-02-07)
- Critère LMP double (50 % des revenus) — non vérifiable sans données complètes du foyer

---

## Conclusion

Le simulateur Renta_Immo implémente correctement l'intégralité des règles fiscales et réglementaires françaises en vigueur pour 2025-2026. Suite aux corrections du 2026-02-18 :

- **NC-02 résolu :** Barème surtaxe PV tranche 200k–250k corrigé à 5 % (CGI Art. 1609 nonies G)
- **REC-01 résolu :** Frais de notaire calculés par tranches réelles (émoluments + DMTO + CSI + débours)
- **REC-02 résolu :** Paramètres capacité résiduelle HCSF (taux, durée) rendus configurables en base
- **REC-03 résolu :** Hypothèses d'inflation affichées dans l'interface (section Projections)
- **REC-04 résolu :** Dérogation VEFA 27 ans implémentée (champ `is_vefa` dans `BienData`)
- **REC-05 résolu :** Alerte TRI non significatif ajoutée quand l'apport est nul (`alerteApportZero`)

La conformité à la Loi Le Meur (réintégration LMNP), aux règles HCSF 2024, aux interdictions DPE et aux 6 régimes fiscaux principaux est confirmée. Le moteur de calcul peut être utilisé comme outil d'aide à la décision d'investissement immobilier, avec les réserves habituelles d'un simulateur (résultats indicatifs, à valider par un professionnel).

---

*Rapport produit dans le cadre de l'audit de conformité interne — Renta_Immo v2.0*
*Les informations fiscales citées sont à jour au 18 février 2026 selon la législation française en vigueur.*
