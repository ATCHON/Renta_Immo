# Story ARCH-S02 : Sentry error tracking + PII scrubbing

> **Version** : 1.3
> **Date** : 2026-03-03
> **Auteur** : John (PM) / Winston (Architecte)
> **Statut** : ✅ Implémentée
> **Type** : Tech
> **Epic** : ARCH-E01 — Fondations Techniques Phase 0
> **Sprint** : Sprint 0
> **Priorité** : P0 (Critique)
> **Complexité** : S
> **Effort estimé** : ~0.5j
> **Notion** : https://www.notion.so/3170eaf06274811bb883c3ec701090f8
> **Référence guide** : §8.2 / §6.1 — Guide évolutivité architecture v2.0

---

## 1. Description

**En tant que** équipe de développement
**Je veux** avoir une observabilité complète des erreurs en production
**Afin de** détecter et corriger les anomalies avant qu'elles impactent les utilisateurs

---

## 2. Contexte

Actuellement, aucune solution de monitoring d'erreurs n'est en place. En cas d'erreur production (exception non gérée, timeout API, bug calcul), l'équipe est aveugle jusqu'à ce qu'un utilisateur remonte le problème manuellement.

**Risque identifié** : 🔴 Haut — aucune visibilité erreurs prod, SLO impossibles (audit technique 2026-02-07).

**Contrainte RGPD** : Les données financières personnelles (revenus, patrimoine) ne doivent **jamais** être envoyées à Sentry. Un mécanisme de scrubbing (masquage) des PII doit être actif avant tout envoi.

---

## 3. Fichiers impactés

```
sentry.client.config.ts        ← créé (config Sentry côté browser)
sentry.server.config.ts        ← créé (config Sentry côté Node.js)
sentry.edge.config.ts          ← créé (config Sentry Edge Runtime)
next.config.mjs                ← withSentryConfig wrapper ajouté
src/lib/pii-scrubber.ts        ← créé (PII_FIELDS / FINANCIAL_FIELDS + beforeSend hook)
.env.example                   ← SENTRY_DSN, SENTRY_ORG, SENTRY_PROJECT, SENTRY_ENABLED
tests/lib/pii-scrubber.test.ts ← créé (7 TU — scrubPii, PII_FIELDS, FINANCIAL_FIELDS)
```

---

## 4. Configuration PII scrubbing (obligatoire)

Les champs suivants doivent être masqués avant envoi à Sentry :

**PII à scrubber :**

- `email` → masqué en `u***@***.***`
- `ip` → masqué / supprimé
- Champs financiers sensibles : `revenuAnnuel`, `patrimoineNet`, `apport`, montants bruts

**Mécanisme :** `beforeSend` hook dans la configuration Sentry :

```typescript
// Schéma attendu — à affiner par l'architecte
beforeSend(event) {
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
  }
  // Supprimer les breadcrumbs contenant des données financières
  return event;
}
```

---

## 5. Critères d'acceptation

- [x] `@sentry/nextjs` installé et configuré (v10.42.0)
- [x] PII scrubbing actif (emails, IPs, données financières masquées avant envoi)
- [x] Datacenter EU sélectionné (DSN `ingest.de.sentry.io` — Frankfurt, RGPD conforme)
- [x] Interrupteur `SENTRY_ENABLED=false` pour désactiver sans supprimer le DSN
- [x] `autoSessionTracking` retiré (supprimé dans Sentry v10 — CNIL §4.9 géré via consentement futur ARCH-S23)
- [x] API Sentry v10 : breadcrumbs `Breadcrumb[]` (plus de wrapper `.values`) — pii-scrubber mis à jour
- [ ] Source maps uploadées en CI (GitHub Actions) — à configurer en déploiement
- [ ] Alertes Sentry configurées pour erreurs critiques (ex: taux d'erreur > 1%)
- [ ] `SENTRY_DSN` ajouté dans les variables d'environnement Vercel

---

## 6. Dépendances

| Type      | Dépendance                                                 |
| --------- | ---------------------------------------------------------- |
| Prérequis | Compte Sentry créé (plan Team minimum pour source maps CI) |
| Bloque    | —                                                          |

---

## 7. Tests à écrire

- TU : Vérifier que `beforeSend` masque bien les PII (snapshot test sur l'event transformé)
- TU : Vérifier que les erreurs métier attendues ne sont pas remontées comme des erreurs Sentry (ex: validation Zod côté user)

---

## 🏗️ Directives Architecte (Winston)

### Plan Sentry retenu

**Plan Team** ($26/mois) — minimum requis pour :

- Upload des source maps en CI (indispensable pour débugguer les erreurs minifiées)
- Alerting configurable avec seuils
- Data retention 90 jours (conforme §4.2 du guide : durée légale logs d'erreurs = 90 jours)

**Datacenter EU** : Utiliser l'ingest EU de Sentry.
DSN format : `https://<key>@o<org>.ingest.de.sentry.io/<project>`
→ Le `.de.` dans l'URL garantit le routage vers les datacenters Frankfurt/EU.

### Mise à jour CSP obligatoire (next.config.mjs)

Le `connect-src` actuel dans `next.config.mjs` ne couvre pas Sentry. À ajouter **impérativement** :

```javascript
// next.config.mjs — connect-src mis à jour
"connect-src 'self' https://*.supabase.co https://accounts.google.com https://*.sentry.io https://o*.ingest.de.sentry.io;";
```

**Alternative recommandée** : Utiliser le [Sentry tunnel](https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option) via une route Next.js `/api/sentry-tunnel`. Avantage : pas de modification CSP, contourne les bloqueurs de pubs qui bloquent `sentry.io`. Décision : **implémenter le tunnel** si les bloqueurs de pubs sont un problème mesuré, sinon CSP suffit pour le Sprint 0.

### Liste exhaustive des PII à scrubber

Basée sur l'inventaire §4.1 du guide d'évolutivité :

```typescript
// src/lib/pii-scrubber.ts — à créer (pattern défini §4.7 du guide)
const PII_FIELDS = ['email', 'nom', 'prenom', 'telephone', 'adresse'] as const;

// Champs financiers à supprimer des breadcrumbs et request bodies Sentry
const FINANCIAL_FIELDS = [
  'revenuAnnuel',
  'revenuImposable',
  'patrimoineNet',
  'apport',
  'montantCredit',
  'capaciteEmprunt',
  'chargesAnnuelles',
  'donnees_entree', // JSONB simulationscolumn — contient TOUT le formulaire
  'form_data', // alias frontend
  'resultats', // JSONB — peut contenir des données inférées sensibles
] as const;
```

**Implémentation `beforeSend` complète :**

```typescript
beforeSend(event) {
  // 1. Supprimer les données utilisateur PII
  if (event.user) {
    delete event.user.email;
    delete event.user.ip_address;
    delete event.user.username; // si présent
  }

  // 2. Scrubber les request bodies (form_data, donnees_entree)
  if (event.request?.data) {
    event.request.data = '[REDACTED — financial data]';
  }

  // 3. Supprimer les breadcrumbs contenant des données financières
  // ⚠️ Sentry v10 : event.breadcrumbs est Breadcrumb[] (plus de wrapper .values)
  if (event.breadcrumbs && event.breadcrumbs.length > 0) {
    event.breadcrumbs = event.breadcrumbs.map(bc => {
      if (bc.data && FINANCIAL_FIELDS.some(f => f in (bc.data ?? {}))) {
        return { ...bc, data: { redacted: true } };
      }
      return bc;
    });
  }

  return event;
},
```

### Erreurs à ignorer côté client

```typescript
// sentry.client.config.ts
ignoreErrors: [
  // Erreurs browser sans impact utilisateur
  'ResizeObserver loop limit exceeded',
  'ResizeObserver loop completed with undelivered notifications',
  // Erreurs de chargement de chunks (réseau flaky) — retry automatique par Next.js
  /Loading chunk \d+ failed/,
  /ChunkLoadError/,
  // Erreurs réseau génériques
  'NetworkError',
  'Failed to fetch',
  // Erreurs d'hydratation Next.js en dev (ne pas polluer Sentry prod)
  // En prod, les erreurs d'hydratation sont légitimes → ne pas ignorer en prod
],
// Transactions de navigation standard — à ne pas tracker comme erreurs
denyUrls: [
  // Extensions Chrome
  /extensions\//i,
  /^chrome:\/\//i,
],
```

### Règles d'alerting

Configurer dans le dashboard Sentry :

| Règle                         | Seuil                         | Canal          | Priorité |
| ----------------------------- | ----------------------------- | -------------- | -------- |
| Taux d'erreur global          | > 1% sur 5 min                | Email (oncall) | P1       |
| Nouvelle issue inconnue       | Toute nouvelle issue          | Email          | P2       |
| Erreur sur `/api/calculate`   | ≥ 5 occurrences/5min          | Email          | P1       |
| Performance dégradée          | P75 > 3s sur `/api/calculate` | Email          | P2       |
| Erreur de type `SERVER_ERROR` | ≥ 1 occurrence                | Email immédiat | P0       |

**Canal** : Email uniquement pour Sprint 0. Intégration Slack à ajouter quand l'équipe grandira (Sprint 4+).

### Consentement CNIL (§4.9 du guide)

Sentry utilise des cookies non essentiels côté client. Initialiser Sentry **conditionnellement** :

```typescript
// src/lib/consent.ts — pattern §4.9 du guide
if (consent?.errorTracking) {
  initSentry(); // Sentry actif uniquement si consentement
}
```

Pour Sprint 0, en l'absence de banner de consentement (ARCH-S23 en phase ultérieure) : `autoSessionTracking` a été retiré (option supprimée dans Sentry v10). Le mode minimal sans session replay est actif provisoirement.

---

> **Version** : 1.0 | **Architecte** : Winston | **Date** : 2026-03-03

---

## Changelog

| Date       | Version | Description                                                                                                                              | Auteur               |
| ---------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 2026-03-03 | 1.0     | Création depuis tâche Notion ARCH-S02                                                                                                    | John (PM)            |
| 2026-03-03 | 1.1     | Directives architecturales complètes                                                                                                     | Winston (Architecte) |
| 2026-03-03 | 1.2     | Validation SM — ajout src/lib/pii-scrubber.ts dans §3 fichiers impactés, story prête                                                     | Bob (SM)             |
| 2026-03-03 | 1.3     | Implémentation — ajout `SENTRY_ENABLED`, fix API Sentry v10 (breadcrumbs, `autoSessionTracking` supprimé, cast `ErrorEvent`), 7 TU verts | Dev                  |
