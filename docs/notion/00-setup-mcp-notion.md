# Setup MCP Notion — Instructions de configuration

> **Avant d'exécuter les prompts**, configure la connexion MCP Notion.

---

## Étape 1 : Créer l'intégration Notion

1. Va sur [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Clique **"+ New integration"**
3. Nomme-la : `Renta_Immo Claude Code`
4. Sélectionne le workspace Notion cible
5. Capacités requises :
   - ✅ Read content
   - ✅ Update content
   - ✅ Insert content
6. Clique **"Submit"** → copie le **Internal Integration Token** (commence par `ntn_...` ou `secret_...`)

---

## Étape 2 : Configurer `.mcp.json`

Ouvre le fichier `.mcp.json` à la racine du projet et remplace `YOUR_NOTION_TOKEN_HERE` par ton token :

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "OPENAPI_MCP_HEADERS": "{\"Authorization\": \"Bearer ntn_XXXXXXXXXXXXX\", \"Notion-Version\": \"2022-06-28\"}"
      }
    }
  }
}
```

> ⚠️ Ne commite **jamais** le vrai token dans le repo. Utilise `.gitignore` ou une variable d'environnement.

---

## Étape 3 : Partager la page Notion avec l'intégration

1. Dans Notion, ouvre (ou crée) la page racine où tu veux créer le workspace Renta_Immo
2. Clique **"..."** → **"Connections"** → Ajoute `Renta_Immo Claude Code`
3. L'intégration aura accès à cette page et toutes ses sous-pages

---

## Étape 4 : Vérifier la connexion

Dans Claude Code, avec le MCP Notion actif, teste :

```
Liste les pages Notion auxquelles j'ai accès.
```

Si tu vois tes pages, la connexion est opérationnelle.

---

## Étape 5 : Exécuter les prompts dans l'ordre

```
docs/notion/
├── 01-prompt-setup-workspace.md   → Phase 1 : Créer workspace + 6 DB
├── 02-prompt-migration-epics.md   → Phase 2 : Migrer 14 épics
├── 03-prompt-migration-stories.md → Phase 3 : Migrer ~109 stories
├── 04-prompt-migration-rest.md    → Phase 4 : Bugs, audits, tests, plans
└── 05-prompt-dashboards.md        → Phase 5 : Dashboard + vues
```

Chaque prompt te demandera de remplacer les `{XXXX_DB_ID}` par les IDs retournés à l'étape précédente.

---

## Sécurité du token

`.mcp.json` est déjà dans le `.gitignore` de ce projet — le vrai fichier avec ton token ne sera jamais commité.

Un fichier `.mcp.json.example` (versionné) sert de template. Copie-le et renseigne ton token :

```bash
cp .mcp.json.example .mcp.json
# puis édite .mcp.json et remplace YOUR_NOTION_TOKEN_HERE
```
