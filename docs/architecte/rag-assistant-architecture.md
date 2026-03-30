# Architecture : Assistant RAG avec Pinecone pour Renta Immo

## Contexte

Renta Immo permet aux investisseurs immobiliers français de simuler la rentabilité d'un bien locatif. Chaque simulation produit un résultat riche : rendements brut/net/net-net, cashflow mensuel, analyse fiscale multi-régimes, conformité HCSF, score global (0-100), projections 20 ans, tableaux d'amortissement.

L'objectif est d'ajouter un assistant conversationnel (RAG) permettant à l'utilisateur de poser des questions en français sur ses simulations après avoir obtenu ses résultats, pour approfondir son analyse sans surcharger l'UI de chiffres bruts.

**Exemples de questions attendues :**
- « Pourquoi mon rendement est-il seulement 3% ? »
- « Quel régime fiscal est le plus avantageux pour moi ? »
- « Mon taux d'endettement est-il conforme aux normes bancaires ? »
- « Comment améliorer mon cashflow mensuel ? »

---

## Architecture Globale

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND                               │
│  Dashboard.tsx ──► AssistantPanel.tsx (chat flottant)       │
│                         │                                   │
│                    useAssistant.ts (hook TanStack)          │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/assistant
┌──────────────────────────▼──────────────────────────────────┐
│                    BACKEND (API Route)                      │
│  /api/assistant/route.ts                                    │
│    → Auth check (Better Auth session)                       │
│    → Rate limit (Upstash Redis, 20 req/min)                 │
│    → assistant-service.ts → Pinecone Assistant API          │
└──────────────────────────┬──────────────────────────────────┘
                           │ Chat API avec filtre metadata
┌──────────────────────────▼──────────────────────────────────┐
│               PINECONE ASSISTANT (géré par Pinecone)        │
│                                                             │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │  INDEX Pinecone │    │   LLM (GPT-4o, géré Pinecone)   │ │
│  │                 │    │   + System Prompt configuré     │ │
│  │  [doc_type=sim] │    │     → contrôle le périmètre     │ │
│  │  user_id=xxx    │◄───┤     des réponses autorisées     │ │
│  │  sim_id=yyy     │    └─────────────────────────────────┘ │
│  │                 │                                         │
│  │  [doc_type=kb]  │ ← Base de connaissance validée         │
│  │  category=...   │   (documents statiques, équipe Renta)  │
│  └─────────────────┘                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                 INDEXATION (side effects)                   │
│  /api/simulations POST/PATCH/DELETE                         │
│    → assistant-service.ts (fire-and-forget, non-bloquant)   │
│    → Pinecone : upload / update / delete document           │
│                                                             │
│  scripts/seed-knowledge-base.ts (one-shot admin)            │
│    → Indexation initiale des documents de connaissance      │
└─────────────────────────────────────────────────────────────┘
```

---

## LLM et Pipeline RAG

**Pinecone Assistant est un RAG-as-a-Service complet.** Il gère lui-même le chunking, l'embedding, la récupération ET la génération. On ne branche pas de LLM séparément.

| Composant | Responsable | Détail |
|-----------|-------------|--------|
| Embedding | Pinecone | Géré automatiquement |
| Récupération (retrieval) | Pinecone | Recherche sémantique sur les documents indexés |
| Génération | **GPT-4o** (via Pinecone) | LLM géré par Pinecone, non configurable côté code |
| Périmètre des réponses | **System prompt** | Configuré une seule fois dans Pinecone Console |
| Données de contexte | **Documents indexés** | Simulations utilisateur + base de connaissance |

Côté code : on upload des documents et on envoie des questions à l'API Pinecone. Elle retourne une réponse grounded.

> **Alternative possible (Phase 3)** : Pinecone Index (vector store seul) + appels directs à l'API Anthropic (Claude) pour contrôler le LLM. Plus flexible, mais bien plus de code à maintenir.

---

## 1. Deux Catégories de Documents

L'assistant accède à **deux types de documents** dans le même index Pinecone, distingués par la metadata `doc_type` :

| Catégorie | `doc_type` | Source | Mise à jour |
|-----------|-----------|--------|-------------|
| Simulations utilisateur | `simulation` | Créées dynamiquement à chaque sauvegarde | Automatique via hooks CRUD |
| Base de connaissance | `knowledge` | Rédigée et validée par l'équipe Renta | Manuelle via script admin |

La **base de connaissance** contient les règles et concepts sur lesquels le bot se base pour expliquer le "pourquoi" — pas seulement les chiffres bruts de la simulation.

---

## 2. Base de Connaissance Validée

### Documents à rédiger dans `/docs/knowledge-base/`

| Fichier | Contenu |
|---------|---------|
| `regimes-fiscaux.md` | Règles détaillées : Micro-foncier (plafond 15k€, abattement 30%), LMNP Micro-BIC (plafond 77k€, abattement 50%), LMNP Réel (déductions réelles + amortissements composants), SCI-IS (taux 15%/25%), conditions d'éligibilité |
| `hcsf-regles.md` | Norme des 35%, calcul du taux d'endettement, exceptions bancaires, impact sur capacité de financement |
| `dpe-reglementation.md` | Calendrier interdictions de location : G interdit 2025, F en 2028, E en 2034 — impact sur valeur et travaux |
| `methode-scoring.md` | Score Renta : base 40pts, ajustements cashflow/rendement/HCSF/DPE/ratio prix-loyer/RAV, différence profil Rentier vs Patrimonial |
| `glossaire-immobilier.md` | TRI, TAEG, rendement brut/net/net-net, effet de levier, cashflow, amortissement, plus-value, reste à vivre, CFE |
| `optimisation-investissement.md` | Leviers d'amélioration (loyer, charges, régime fiscal, apport), pièges courants |

### Indexation (script one-shot)

**`/scripts/seed-knowledge-base.ts`** — exécuté à la création de l'assistant, puis à chaque mise à jour de la KB :

```typescript
// Lit chaque .md dans /docs/knowledge-base/
// Upload dans Pinecone avec metadata : { doc_type: 'knowledge', category: string }
// Pas de user_id → visibles pour tous les utilisateurs
```

---

## 3. System Prompt — Périmètre des Réponses

Configuré **une seule fois dans Pinecone Console** lors de la création de l'assistant. Il définit ce que le bot peut et ne peut pas faire.

```
Tu es un assistant spécialisé en investissement immobilier locatif en France pour Renta Immo.

RÔLE : Tu aides les utilisateurs à comprendre et interpréter leurs simulations d'investissement immobilier.

CE QUE TU PEUX FAIRE :
- Expliquer les résultats d'une simulation (rendements, cashflow, fiscalité, HCSF, score)
- Comparer les régimes fiscaux et expliquer leurs différences selon la situation
- Interpréter le score global et les recommandations
- Répondre aux questions sur les règles fiscales et réglementaires françaises en immobilier locatif
- Suggérer des pistes d'amélioration basées uniquement sur les données disponibles

CE QUE TU NE DOIS PAS FAIRE :
- Donner des conseils financiers personnalisés ou des recommandations d'investissement au sens légal
- Répondre à des questions sans rapport avec l'immobilier locatif (actualité, cuisine, etc.)
- Affirmer des chiffres ou règles que tu ne trouves pas dans les documents fournis
- Faire des projections ou promesses sur les performances futures

CONTRAINTES IMPORTANTES :
- Base tes réponses UNIQUEMENT sur les documents fournis (simulations de l'utilisateur + base de connaissance Renta Immo)
- Si tu ne trouves pas l'information, dis-le explicitement : "Je ne trouve pas cette information dans votre simulation."
- Réponds toujours en français
- Termine chaque réponse contenant des chiffres ou conseils par : "Ces informations sont indicatives et ne constituent pas un conseil financier ou juridique."

TONE : Professionnel, pédagogique, accessible. Évite le jargon quand une formulation simple suffit.
```

---

## 4. Sérialisation des Simulations en Documents

Chaque simulation sauvegardée est convertie en **texte structuré français** et uploadée dans Pinecone.

### Format du document

```
SIMULATION : [nom] | ID: [uuid] | Date: [date]

## BIEN IMMOBILIER
- Prix d'acquisition : 285 000 €
- Surface : 65 m²
- Type : Appartement ancien
- DPE : D
- Travaux : 15 000 €

## FINANCEMENT
- Apport : 30 000 €
- Emprunt : 255 000 €
- Taux : 3,85% sur 20 ans
- Mensualité : 1 520 €/mois
- TAEG : 4,12%

## EXPLOITATION
- Loyer mensuel : 900 €
- Charges mensuelles nettes : 185 €
- Taux d'occupation : 92%

## RÉSULTATS CLÉS
- Rendement brut : 4,51%
- Rendement net : 2,83%
- Cashflow mensuel net : -135 € (effort d'épargne)
- Score global : 68/100 (Bon) — profil Patrimonial

## FISCALITÉ
- Régime appliqué : LMNP Micro-BIC
- Revenu imposable estimé : 5 400 €
- Impôt estimé : 1 620 €
- Régime optimal recommandé : LMNP Réel (économie estimée : 2 100 €/an)

## CONFORMITÉ HCSF
- Taux d'endettement : 31,4% → CONFORME (seuil 35%)
- Reste à vivre : 2 850 €/mois

## PROJECTIONS 20 ANS
- Valeur du bien à horizon : 398 000 €
- Capital remboursé : 145 000 €
- Cashflow cumulé : -32 400 €
- Patrimoine net : 188 000 €
- TRI : 6,2%

## ALERTES ET RECOMMANDATIONS
- ⚠ DPE D : risque réglementaire sur les locations nues après 2025
- ✓ Conformité HCSF respectée
- Recommandation haute priorité : Envisager le régime LMNP Réel
```

### Métadonnées Pinecone (documents simulation)

```typescript
{
  doc_type: 'simulation',   // Distingue simulation vs knowledge base
  user_id: string,          // Filtrage par utilisateur (sécurité)
  simulation_id: string,    // Pour ciblage précis et delete/update
  simulation_name: string,
  score_global: number,
  created_at: string,
  updated_at: string
}
```

---

## 5. Stratégie de Filtrage à la Query

Chaque requête récupère à la fois les docs de la simulation ET les docs de connaissance :

```typescript
// Question sur une simulation spécifique
filter = {
  $or: [
    { doc_type: { $eq: 'knowledge' } },
    {
      $and: [
        { doc_type: { $eq: 'simulation' } },
        { user_id: { $eq: userId } },
        { simulation_id: { $eq: simulationId } }
      ]
    }
  ]
}

// Question sur le portfolio (toutes les simulations de l'utilisateur)
filter = {
  $or: [
    { doc_type: { $eq: 'knowledge' } },
    {
      $and: [
        { doc_type: { $eq: 'simulation' } },
        { user_id: { $eq: userId } }
      ]
    }
  ]
}
```

---

## 6. Fichiers à Créer

| Fichier | Rôle |
|---------|------|
| `/docs/knowledge-base/regimes-fiscaux.md` | Règles fiscales validées |
| `/docs/knowledge-base/hcsf-regles.md` | Normes HCSF |
| `/docs/knowledge-base/dpe-reglementation.md` | Calendrier interdictions DPE |
| `/docs/knowledge-base/methode-scoring.md` | Méthode de calcul du score Renta |
| `/docs/knowledge-base/glossaire-immobilier.md` | Définitions des termes |
| `/docs/knowledge-base/optimisation-investissement.md` | Leviers d'amélioration |
| `/scripts/seed-knowledge-base.ts` | Script one-shot d'indexation de la KB |
| `/src/lib/pinecone/client.ts` | Singleton client Pinecone |
| `/src/lib/pinecone/simulation-serializer.ts` | Simulation → texte structuré |
| `/src/lib/pinecone/assistant-service.ts` | `indexSimulation`, `queryAssistant`, `deleteSimulationIndex` |
| `/src/app/api/assistant/route.ts` | Endpoint `POST /api/assistant` |
| `/src/types/assistant.ts` | Types `AssistantRequest` / `AssistantResponse` |
| `/src/components/assistant/AssistantPanel.tsx` | Panneau chat (slide-in) |
| `/src/components/assistant/ChatMessage.tsx` | Affichage d'un message |
| `/src/components/assistant/SuggestedQuestions.tsx` | Questions suggérées |
| `/src/lib/hooks/useAssistant.ts` | Hook TanStack Query |

## Fichiers Existants à Modifier

| Fichier | Modification |
|---------|-------------|
| `/src/app/api/simulations/route.ts` | Hook POST : `indexSimulation()` fire-and-forget |
| `/src/app/api/simulations/[id]/route.ts` | Hook PATCH/DELETE : update/delete dans Pinecone |
| `/src/components/results/Dashboard.tsx` | Bouton « Poser une question » → ouvre l'AssistantPanel |

---

## 7. Backend — API Route

**`/src/app/api/assistant/route.ts`**

```typescript
// POST uniquement
// - Auth obligatoire (Better Auth session)
// - user_id injecté depuis la session serveur (jamais du body client)
// - Rate limit : 20 req/min/IP via Upstash (pattern identique à /api/calculate)
// - Body : { question: string; simulation_id?: string }
// - Délègue à assistant-service.queryAssistant()
```

---

## 8. Frontend

### `AssistantPanel.tsx`
- Panneau slide-in depuis la droite (ou onglet dans les résultats)
- Props : `simulationId?: string`
- État local React : `{ role: 'user' | 'assistant', content: string }[]`
- Mutation TanStack Query vers `POST /api/assistant`

### `SuggestedQuestions.tsx`
Questions pré-remplies au démarrage, contextuelles à la simulation :
- « Quel est mon régime fiscal optimal ? »
- « Comment interpréter mon score de 68/100 ? »
- « Qu'est-ce que le DPE D implique pour ce bien ? »
- « Mon taux d'endettement est-il conforme ? »

---

## 9. Sécurité

| Risque | Mitigation |
|--------|-----------|
| Accès aux simulations d'un autre utilisateur | `user_id` injecté depuis la session serveur, filtre metadata Pinecone obligatoire |
| Abus coût (appels LLM) | Rate limit 20 req/min + auth obligatoire |
| Réponses hors-scope | System prompt avec contraintes explicites |
| Leak de données en logs | Pas de log du contenu des questions/réponses en production |

---

## 10. Variables d'Environnement

```env
PINECONE_API_KEY=pc-...
PINECONE_ASSISTANT_NAME=renta-immo-assistant
```

---

## 11. Plan d'Implémentation

### Phase 1 — MVP

1. Créer l'assistant dans **Pinecone Console** → configurer le system prompt (section 3)
2. Rédiger les 6 documents knowledge base dans `/docs/knowledge-base/`
3. Créer `scripts/seed-knowledge-base.ts` → exécuter pour indexer la KB
4. Installer `@pinecone-database/pinecone`
5. Créer `src/lib/pinecone/client.ts`, `simulation-serializer.ts`, `assistant-service.ts`
6. Créer `POST /api/assistant` avec auth + rate limit + filtre user_id
7. Hook `POST /api/simulations` pour indexer à la sauvegarde
8. `AssistantPanel` minimal + bouton dans `Dashboard.tsx` (visible si simulation sauvegardée)

### Phase 2 — Cycle de vie complet

9. Hook PATCH/DELETE dans `[id]/route.ts` (update/delete Pinecone)
10. Dégradation gracieuse si Pinecone indisponible (pas de blocage utilisateur)
11. Mode portfolio : query sans `simulation_id` (toutes les simulations de l'utilisateur)

### Phase 3 — UX enrichie

12. `SuggestedQuestions` contextuelles
13. Historique de conversation multi-turn
14. Affichage des citations sources
15. (Optionnel) Migration vers Pinecone Index + Claude API pour contrôle total du LLM

---

## 12. Tests

### Unit Tests (Vitest)
- `simulation-serializer.test.ts` : cas LMNP, SCI, cashflow positif/négatif, alertes
- `assistant-service.test.ts` : mock client Pinecone, vérifier que `user_id` est dans le filtre

### Integration Tests
- `POST /api/assistant` sans auth → 401
- `POST /api/assistant` avec auth → réponse structurée
- Vérifier que le filtre `user_id` est passé (pas d'accès cross-user)

### Test Manuel E2E
1. Créer et sauvegarder une simulation
2. Vérifier dans Pinecone Console que le document apparaît avec les bonnes métadonnées
3. Ouvrir l'assistant, poser « Quel est mon rendement net ? »
4. Vérifier que la réponse cite les chiffres de la simulation
5. Supprimer la simulation → vérifier que le document est supprimé de Pinecone

---

## Références

| Fichier | Utilité |
|---------|---------|
| `/src/types/calculateur.ts` | Types `CalculResultats`, `CalculateurFormData` pour la sérialisation |
| `/src/types/database.types.ts` | Type `Simulation` (form_data + resultats JSONB) |
| `/src/app/api/simulations/route.ts` | Point d'injection pour l'indexation |
| `/src/app/api/simulations/[id]/route.ts` | Points d'injection update/delete |
| `/src/lib/rate-limit.ts` | Pattern rate limit à réutiliser |
| `/src/lib/logger.ts` | Logger existant |
| `/src/components/results/Dashboard.tsx` | Intégration du bouton assistant |
| `/src/server/calculations/fiscalite.ts` | Source de vérité pour les règles fiscales de la KB |
| `/src/server/calculations/synthese.ts` | Source de vérité pour la méthode de scoring de la KB |
