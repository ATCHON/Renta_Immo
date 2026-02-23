# Tests d'Intégration — Guide

## Objectif

Valider que le moteur de calcul Renta_Immo produit des résultats conformes aux règles fiscales et réglementaires françaises en vigueur (2026).

## Lien avec l'Audit

Ces tests font suite à l'audit de conformité du 2026-02-18 et à la revue indépendante du 2026-02-23 (`docs/audit/fonctionnel/revue-audit.md`). Ils sécurisent les conformités vérifiées contre les régressions futures.

## Structure des Tests

```
tests/integration/
├── config/
│   └── integration-config.ts   # Snapshot config DB 2026 (sans connexion DB)
├── helpers.ts                  # createBaseInput(), helpers de test
├── scenarios/
│   ├── 01-revenus-fonciers.test.ts    # SC-01 à SC-04
│   ├── 02-lmnp.test.ts                # SC-05 à SC-10
│   ├── 03-sci-is.test.ts              # SC-11 à SC-13
│   ├── 04-hcsf.test.ts                # SC-14 à SC-17
│   ├── 05-plus-value-dpe.test.ts      # SC-18 à SC-21
│   └── 06-scoring-projections.test.ts # SC-22 à SC-25
└── fiscal-conformity.test.ts   # CF-01 à CF-08
```

## Exécution

```bash
# Tests d'intégration seuls
npm run test:integration

# Tous les tests (unit + intégration)
npm run test

# Avec couverture
npm run test:coverage
```

## Architecture : Pas de DB en CI

Les tests d'intégration utilisent une configuration **statique** (`tests/integration/config/integration-config.ts`) — snapshot des valeurs `config_params` DB pour `annee_fiscale = 2026`. Aucune connexion à Supabase n'est requise en CI/CD.

Chaque test appelle :

```typescript
performCalculations(input, integrationConfig);
```

Le paramètre `configOverride` de `performCalculations()` injecte la config statique et bypasse l'appel DB.

## Mise à jour de la Config

Si les paramètres fiscaux/réglementaires changent (nouvelle LF, nouvelle décision HCSF) :

1. Mettre à jour `tests/integration/config/integration-config.ts`
2. Mettre à jour `docs/tests/test-integration/01-config-reference.md`
3. Relancer `npm run test:integration` — les tests dont les valeurs changent doivent être revus
4. Mettre à jour les assertions si le changement est intentionnel et légalement correct

## Ajouter un Nouveau Scénario

1. Identifier le groupe applicable (revenus fonciers, LMNP, SCI IS, HCSF, PV/DPE, scoring)
2. Ajouter le test dans le fichier correspondant (`tests/integration/scenarios/0X-*.test.ts`)
3. Documenter dans `docs/tests/test-integration/02-scenarios-specification.md`
4. S'assurer que les valeurs attendues sont calculées manuellement et référencées légalement

## Références Légales

| Domaine              | Texte de loi                      |
| -------------------- | --------------------------------- |
| Micro-foncier        | CGI Art.32                        |
| Déficit foncier      | CGI Art.156                       |
| LMNP Micro-BIC       | CGI Art.50-0                      |
| LMNP Réel            | CGI Art.39C + PCG 214-9           |
| SCI IS               | CGI Art.219                       |
| Flat Tax (PFU)       | CGI Art.200A                      |
| Plus-values          | CGI Art.150VC / VD                |
| Surtaxe PV           | CGI Art.1609 nonies G             |
| HCSF                 | Décision HCSF 2024                |
| PS BIC LMNP 18,6%    | LFSS 2026                         |
| Réintégration amort. | LF 2025 (Loi Le Meur, 15/02/2025) |
| DPE alertes          | Loi Climat-Résilience L.2021-1104 |
