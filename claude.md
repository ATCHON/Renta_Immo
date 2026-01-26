# Renta_Immo

Application web générée à partir d'un workflow n8n.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Langage**: TypeScript
- **Styling**: Tailwind CSS
- **État**: Zustand
- **API/Cache**: React Query

## Outils disponibles

- **MCP n8n**: Accès aux workflows, configs de nœuds, templates
- **MCP GitHub**: Push des modifications vers le repo
- **Skills**: n8n, front-end designer

## Workflow de développement

### 1. Optimisation n8n
- Vérifier les entrées (webhook/trigger)
- Vérifier les sorties (format JSON pour le front-end)
- Tester le workflow isolément

### 2. Développement front-end
- Créer les composants React
- Connecter l'API n8n via React Query
- Tester localement (`npm run dev`)

### 3. GitHub
- Commit et push des modifications
- Le repo doit être lié à Vercel

### 4. Déploiement
- Vercel déploie automatiquement à chaque push
- Vérifier le déploiement en production

## Structure

```
src/
├── app/           # Pages et routes Next.js
├── components/    # Composants React réutilisables
├── hooks/         # Custom hooks (useQuery, etc.)
├── stores/        # Stores Zustand
├── lib/           # Client API n8n, utilitaires
└── types/         # Types TypeScript
```

## Configuration n8n

- **Webhook URL**: À définir après création du workflow
- **Variables d'environnement**:
  - `NEXT_PUBLIC_N8N_WEBHOOK_URL`: URL du webhook n8n
