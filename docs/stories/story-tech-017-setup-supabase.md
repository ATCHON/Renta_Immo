# Story TECH-017 : Setup Supabase

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : Infrastructure
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 2

---

## 1. Description

**En tant que** développeur
**Je veux** configurer Supabase pour le projet
**Afin de** pouvoir persister les simulations des utilisateurs

---

## 2. Contexte

Pour permettre aux utilisateurs de sauvegarder et retrouver leurs simulations, nous avons besoin d'une base de données. Supabase offre une solution PostgreSQL managée avec une API REST/GraphQL intégrée et une authentification prête à l'emploi.

---

## 3. Tâches

### 3.1 Créer le projet Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com)
2. Configurer la région (EU - Paris recommandé)
3. Noter les credentials (URL, anon key, service role key)

### 3.2 Installer les dépendances

```bash
npm install @supabase/supabase-js
```

### 3.3 Configurer les variables d'environnement

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Server-side only
```

### 3.4 Mettre à jour .env.example

Ajouter les variables avec valeurs placeholder pour la documentation.

---

## 4. Critères d'acceptation

- [ ] Projet Supabase créé et accessible
- [ ] Package `@supabase/supabase-js` installé
- [ ] Variables d'environnement configurées dans `.env.local`
- [ ] `.env.example` mis à jour
- [ ] Connection testée (ping Supabase depuis l'app)

---

## 5. Dépendances

| Type | Dépendance |
|------|------------|
| Bloque | TECH-018, TECH-019, TECH-020, TECH-021 |

---

## 6. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 1 |
| Priorité | P2 |
| Risque | Faible |

---

## 7. Ressources

- [Supabase Getting Started](https://supabase.com/docs/guides/getting-started)
- [Next.js + Supabase](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
