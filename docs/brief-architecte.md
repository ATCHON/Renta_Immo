# Brief Architecte - Renta_Immo

> **Date** : 2026-01-25
> **De** : PM (John)
> **Pour** : Architecte
> **Objet** : Décisions techniques requises pour le MVP

---

## 1. Contexte

**Renta_Immo** est un simulateur de rentabilité immobilière. Le frontend existe déjà (Next.js 14 + TypeScript).

**Décision majeure** : La dépendance n8n pour le backend sera **remplacée par un backend custom**.

---

## 2. Stack Frontend (Validée)

```
- Next.js 14 (App Router)
- TypeScript 5.7.3 (strict mode)
- Tailwind CSS
- Zustand (state management + localStorage)
- React Query (data fetching)
- Zod (validation)
```

---

## 3. Décisions Techniques Requises

### 3.1 Stack Backend

| Question | Options possibles | Critères de choix |
|----------|-------------------|-------------------|
| **Runtime** | Node.js / Deno / Bun | Performance, écosystème, déploiement |
| **Framework** | Express / Fastify / Hono / tRPC | Type-safety, performance, DX |
| **Monorepo ?** | Oui / Non | Partage types, maintenance |

**Contrainte** : Doit s'intégrer facilement avec Next.js et le déploiement Vercel.

---

### 3.2 Persistance des Données

| Question | Options possibles | Critères de choix |
|----------|-------------------|-------------------|
| **Base de données** | PostgreSQL / SQLite / MongoDB / Supabase | Coût, scalabilité, hébergement |
| **ORM** | Prisma / Drizzle / TypeORM | Type-safety, migrations, performance |
| **Hébergement DB** | Vercel Postgres / Supabase / PlanetScale / Self-hosted | Coût, latence, maintenance |

**Données à persister** (MVP) :
- Simulations (inputs + résultats)
- Métadonnées (date, nom simulation)

**Volume estimé** : Faible en MVP (pas de comptes utilisateurs)

---

### 3.3 Génération PDF

| Question | Options possibles | Critères de choix |
|----------|-------------------|-------------------|
| **Approche** | Serveur / Client / Hybride | Qualité, performance, complexité |
| **Librairie** | Puppeteer / PDFKit / react-pdf / jsPDF | Qualité rendu, taille bundle, serverless-compatible |

**Contenu du PDF** :
- Synthèse de la simulation
- Tableaux de données (cashflow, amortissement)
- Graphiques (optionnel MVP)

**Contrainte** : Doit fonctionner en environnement serverless (Vercel).

---

### 3.4 Architecture API

| Question | Recommandation PM | À valider |
|----------|-------------------|-----------|
| **Style** | REST | Ou tRPC/GraphQL ? |
| **Endpoints MVP** | POST /simulate, GET /simulations, GET /simulation/:id | Structure ? |
| **Validation** | Zod (partagé front/back) | Approach ? |

---

## 4. Contraintes Projet

| Contrainte | Impact |
|------------|--------|
| **Pas de comptes utilisateurs en MVP** | Pas d'auth, simulations anonymes ou par session |
| **Déploiement Vercel** | Serverless, limites d'exécution |
| **Timeline MVP** | 14-19 semaines |
| **Maintenabilité** | Code propre, testé, documenté |

---

## 5. Questions Ouvertes

### Priorité Haute (bloquant Sprint 0)

1. **Quelle stack backend recommandes-tu ?**
   - Runtime + Framework + justification

2. **Quelle solution de persistance ?**
   - DB + ORM + hébergement + justification

3. **Quelle approche pour la génération PDF ?**
   - Librairie + approche (serveur/client) + justification

### Priorité Moyenne

4. **Architecture monorepo ou séparée ?**
   - Impact sur le partage de types et la CI/CD

5. **Stratégie de calcul : front-only, back-only, ou hybride ?**
   - Calculs en temps réel côté front + validation côté back ?

6. **Gestion des erreurs et logging ?**
   - Approche recommandée pour le monitoring

---

## 6. Livrables Attendus

| Livrable | Description |
|----------|-------------|
| **Architecture Decision Records (ADR)** | Décisions techniques documentées |
| **Schéma d'architecture** | Diagramme des composants |
| **Structure projet** | Organisation des dossiers/fichiers |
| **Spécifications API** | Endpoints, payloads, réponses |

---

## 7. Documents de Référence

| Document | Chemin |
|----------|--------|
| PRD | [docs/prd.md](./prd.md) |
| Roadmap | [docs/roadmap.md](./roadmap.md) |
| Backlog MVP | [docs/backlog-mvp.md](./backlog-mvp.md) |

---

## 8. Timeline Souhaitée

| Étape | Délai |
|-------|-------|
| Réponse aux questions | ASAP |
| ADR + Architecture | Avant Sprint 0 |
| Validation PM | Après réception des specs |

---

**Contact** : Revenir vers le PM après validation pour :
- Adapter le backlog si nécessaire
- Créer les user stories détaillées
- Planifier Sprint 0
