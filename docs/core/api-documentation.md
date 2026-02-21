# Documentation de l'API — Renta_Immo

Ce document détaille les points de terminaison (endpoints) de l'API de l'application Renta_Immo. L'API est développée avec Next.js App Router (`src/app/api`).

---

## 🏗️ Architecture et Principes Généraux

- **Authentification** : Requise pour la gestion des simulations (sauvegarde, modification, suppression). Utilisateur identifié via Supabase Auth (Session Server).
- **Rate Limiting** : Implémenté sur la plupart des endpoints utilisant l'IP de l'utilisateur pour prévenir les abus.
- **Format de Réponse Standard** :

  ```typescript
  // Succès
  {
    success: true,
    data?: any,          // Contenu de la réponse
    meta?: any          // Métadonnées (ex: pagination)
  }

  // Erreur
  {
    success: false,
    error: {
      code: string,     // Code erreur (ex: 'RATE_LIMIT', 'VALIDATION_ERROR', 'UNAUTHORIZED')
      message: string,  // Message lisible
      details?: any     // Détails techniques (ex: formatage Zod)
    }
  }
  ```

---

## 🧮 Calculs

### `POST /api/calculate`

Endpoint principal pour lancer une simulation de rentabilité. Il remplace l'ancien webhook n8n et effectue les calculs complets côté serveur.

- **Rate Limit** : 10 requêtes / minute / IP
- **Authentification** : Non requise
- **Payload attendu** : Options de simulation (données brutes du formulaire : bien, financement, exploitation, structure)
- **Réponse (Succès)** :
  ```json
  {
    "success": true,
    "resultats": { ... }, // Détails des calculs (rentabilité, cashflow, fiscalité, etc.)
    "pdf_url": null,
    "timestamp": "2024-...",
    "alertes": [],
    "meta": { "version": "1.0.0", "execution_time_ms": 150 }
  }
  ```
- **Réponse (Erreur)** : `400 Bad Request` (Validation error), `422 Unprocessable Entity` (Calculation error), `429 Too Many Requests` (Rate limit)

---

## 💾 Simulations Sauvegardées

Ces endpoints permettent de gérer les simulations sauvegardées par les utilisateurs connectés.

### `GET /api/simulations`

Lister et filtrer les simulations de l'utilisateur.

- **Rate Limit** : 30 requêtes / minute / IP (partagé avec POST)
- **Authentification** : Requise
- **Paramètres d'URL supportés** :
  - `limit` (défaut : 20, max : 100) : Pagination
  - `offset` (défaut : 0) : Pagination
  - `sort` (défaut : `created_at`) : Colonne de tri
  - `order` (`asc` ou `desc`) : Sens du tri
  - `favorite` (`true`) : N'afficher que les favoris
  - `archived` (`true`) : Afficher les simulations archivées (sinon les actives)
  - `search` (string) : Recherche textuelle dans le nom

### `POST /api/simulations`

Créer/Sauvegarder une nouvelle simulation.

- **Rate Limit** : 30 / minute / IP (partagé avec GET)
- **Authentification** : Requise
- **Payload attendu** :
  - `name` (string)
  - `description` (optional string)
  - `form_data` (JSON)
  - `resultats` (JSON)

### `GET /api/simulations/[id]`

Récupérer une simulation spécifique par son identifiant unique.

- **Rate Limit** : 30 requêtes / minute / IP
- **Authentification** : Requise
- **Réponse** : Données complètes de la simulation (`form_data` et `resultats` inclus).

### `PATCH /api/simulations/[id]`

Mettre à jour partiellement une simulation existante (ex: renommer, marquer comme favori, archiver).

- **Authentification** : Requise
- **Payload attendu (optionnels)** : `name`, `description`, `is_favorite`, `is_archived`, `form_data`, `resultats`.

### `DELETE /api/simulations/[id]`

Supprimer définitivement une simulation.

- **Authentification** : Requise
- **Réponse** : Code 200 (Succès) avec message de confirmation.

---

## 📄 Export et Partage

### `POST /api/pdf`

Générer et télécharger un rapport PDF complet de la simulation.

- **Rate Limit** : 5 requêtes / minute / IP
- **Authentification** : Non requise
- **Payload attendu** :
  - `formData` (JSON du formulaire complet)
  - `resultats` (JSON des calculs)
  - `options` (optionnel : `includeGraphs`, `language`)
- **Action** : Génère le PDF via `@react-pdf/renderer` en utilisant le template `RapportSimulation`.
- **Réponse** : Fichier binaire (application/pdf) en attachment.

### `POST /api/send-simulation`

Générer le rapport PDF de la simulation et l'envoyer directement par email.

- **Rate Limit** : 3 requêtes / minute / IP
- **Authentification** : Non requise
- **Payload attendu** :
  - `email` (string)
  - `formData` (JSON du formulaire complet)
  - `resultats` (JSON des calculs)
- **Action** : Génère le PDF en mémoire et l'envoie via Resend avec un template email HTML.
- **Réponse** : En cas de succès renvoie l'ID d'envoi de Resend.
