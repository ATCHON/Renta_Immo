# Guide de developpement

> **Version** : 2.0
> **Date** : 2026-03-04
> **Auteur** : Winston (Architecte)

---

Valider cette checklist avant chaque merge sur `master`.

## Checklist Nouvelle Feature — Renta_Immo

### Conception

- [ ] ADR rédigé si décision architecturale non triviale (ex: nouveau provider, nouveau pattern)
- [ ] Domaine bien isolé (`src/app|server|components|stores|types/[feature]/`)
- [ ] Zéro import circulaire inter-domaines (ESLint import/no-cycle)
- [ ] `organization_id` nullable ajouté si table avec données utilisateur B2B potentielles
- [ ] Feature flag défini si rollout progressif nécessaire

### Sécurité

- [ ] Validation Zod sur tous les inputs API (pas de type `any`)
- [ ] Rate limiting configuré si endpoint public ou coûteux
- [ ] Pas de données financières ou PII dans les logs Sentry
- [ ] RLS configuré si nouvelle table avec données sensibles

### RGPD

- [ ] Nouvelle donnée personnelle inventoriée (§4.1)
- [ ] Base légale identifiée et documentée
- [ ] Durée de conservation définie
- [ ] Droit à l'effacement implémenté si nouvelle donnée utilisateur

### Base de données

- [ ] Migration SQL dans `supabase/migrations/` avec timestamp YYYYMMDD
- [ ] Index créés sur les colonnes filtrées fréquemment
- [ ] `EXPLAIN ANALYZE` vérifié sur les nouvelles requêtes
- [ ] `organization_id UUID` nullable ajouté si table B2B future

### API

- [ ] Endpoint versionnés (`/api/v1/`)
- [ ] Format d'erreur standard respecté (`{ error: string, code?: string }`)
- [ ] OpenAPI spec mise à jour (`docs/openapi.json`)
- [ ] Pagination curseur si endpoint retournant une liste

### Accessibilité

- [ ] Labels explicites sur tous les champs de formulaire
- [ ] Contraste des couleurs vérifié (ratio ≥ 4.5:1)
- [ ] Navigation clavier fonctionnelle
- [ ] Alt text sur les graphiques Recharts

### Tests

- [ ] Tests unitaires sur la logique métier (≥ 80% coverage)
- [ ] Tests d'intégration sur les nouvelles API Routes
- [ ] Tests E2E Playwright si nouveau parcours UI critique
- [ ] Tests de régression si calculs financiers modifiés
- [ ] Aucune régression : `npm test` vert avant merge

### Déploiement

- [ ] Variables d'env documentées dans `.env.example`
- [ ] Feature flag désactivé par défaut en production
- [ ] Sentry alerts configurées pour les nouvelles erreurs métier
- [ ] Migration SQL testée sur Supabase local avant push
- [ ] Rollback plan : la feature peut-elle être désactivée sans migration inversée ?

## Changelog

| Date       | Version | Description          | Auteur               |
| ---------- | ------- | -------------------- | -------------------- |
| 2026-02-04 | 1.0     | Creation initiale    | Winston (Architecte) |
| 2026-03-04 | 2.0     | Mise à jour du guide | Winston (Architecte) |
