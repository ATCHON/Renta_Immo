# Story TECH-015 : Route /api/pdf

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : ✅ Ready for Review
> **Type** : API
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 1

---

## 1. Description

**En tant que** frontend
**Je veux** un endpoint API pour générer le PDF
**Afin de** permettre le téléchargement du rapport

---

## 2. Contexte

L'endpoint `/api/pdf` recevra les résultats de simulation et retournera un fichier PDF généré à la volée. La génération doit être performante (< 2s).

---

## 3. Spécification API

### Endpoint

```
POST /api/pdf
Content-Type: application/json
```

### Request Body

```typescript
interface PdfRequest {
  // Données du formulaire
  formData: CalculateurFormData;
  // Résultats calculés
  resultats: CalculResultats;
  // Options PDF (optionnel)
  options?: {
    includeGraphs?: boolean;  // Inclure graphiques (défaut: true)
    language?: 'fr' | 'en';   // Langue (défaut: 'fr')
  };
}
```

### Response (Succès)

```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="simulation-renta-immo-2026-02-04.pdf"

<binary PDF data>
```

### Response (Erreur)

```typescript
// HTTP 400 - Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données de simulation invalides"
  }
}

// HTTP 500 - Generation Error
{
  "success": false,
  "error": {
    "code": "PDF_GENERATION_ERROR",
    "message": "Erreur lors de la génération du PDF"
  }
}
```

---

## 4. Implémentation

### Fichier

`src/app/api/pdf/route.ts`

### Structure

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { RapportSimulation } from '@/lib/pdf/templates/RapportSimulation';

export async function POST(request: NextRequest) {
  try {
    // 1. Valider le body
    const body = await request.json();

    // 2. Générer le PDF
    const pdfBuffer = await renderToBuffer(
      <RapportSimulation
        formData={body.formData}
        resultats={body.resultats}
      />
    );

    // 3. Retourner le PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="simulation-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    // Gestion erreurs
  }
}
```

---

## 5. Critères d'acceptation

- [x] Endpoint `POST /api/pdf` créé
- [x] Validation du body avec Zod
- [x] PDF généré correctement
- [x] Headers Content-Type et Content-Disposition corrects
- [x] Gestion des erreurs (400, 500)
- [x] Performance < 2 secondes
- [ ] Tests unitaires

---

## 6. Dépendances

| Type | Dépendance |
|------|------------|
| Dépend de | TECH-013 (Setup), TECH-014 (Template) |
| Bloque | TECH-016 (Intégration UI) |

---

## 7. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 3 |
| Priorité | P2 |
| Risque | Moyen |

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
