# Story TECH-016 : Intégration UI PDF

> **Version** : 1.0
> **Date** : 2026-02-04
> **Auteur** : John (PM)
> **Statut** : 📋 Backlog
> **Type** : Feature
> **Epic** : Epic 1 - Infrastructure Backend (Phase 2)
> **Sprint** : Sprint 1

---

## 1. Description

**En tant qu'** utilisateur
**Je veux** un bouton pour télécharger le rapport PDF
**Afin de** sauvegarder ma simulation

---

## 2. Contexte

Après avoir effectué une simulation, l'utilisateur doit pouvoir télécharger un rapport PDF en un clic. Le bouton doit être visible sur la page de résultats.

---

## 3. Spécifications UI

### Emplacement

Page résultats (`/resultats`) - Section en-tête ou actions

### Composant

```typescript
// src/components/results/DownloadPdfButton.tsx

interface DownloadPdfButtonProps {
  formData: CalculateurFormData;
  resultats: CalculResultats;
  disabled?: boolean;
}
```

### États du bouton

| État | Apparence | Action |
|------|-----------|--------|
| **Idle** | "📄 Télécharger PDF" | Clic déclenche génération |
| **Loading** | "⏳ Génération..." + spinner | Désactivé |
| **Success** | "✅ Téléchargé !" (2s) | Retour à Idle |
| **Error** | "❌ Erreur" + toast | Retry possible |

### Design

- Style cohérent avec le design system existant
- Bouton secondaire (outline) ou icône
- Accessible (aria-label, focus visible)

---

## 4. Implémentation

### Hook personnalisé

```typescript
// src/hooks/useDownloadPdf.ts

export function useDownloadPdf() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const downloadPdf = async (formData, resultats) => {
    setStatus('loading');
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, resultats }),
      });

      if (!response.ok) throw new Error('Erreur génération');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Déclencher téléchargement
      const a = document.createElement('a');
      a.href = url;
      a.download = `simulation-renta-immo-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
      setStatus('success');
    } catch (error) {
      setStatus('error');
    }
  };

  return { downloadPdf, status };
}
```

### Intégration page résultats

Ajouter le bouton dans `src/app/resultats/page.tsx` ou le composant résultats approprié.

---

## 5. Critères d'acceptation

- [ ] Composant `DownloadPdfButton` créé
- [ ] Hook `useDownloadPdf` implémenté
- [ ] Bouton visible sur page résultats
- [ ] États loading/success/error gérés
- [ ] Téléchargement fonctionne (fichier .pdf valide)
- [ ] Nom fichier inclut la date
- [ ] Accessible (keyboard, screen reader)
- [ ] Mobile responsive

---

## 6. Dépendances

| Type | Dépendance |
|------|------------|
| Dépend de | TECH-015 (Route /api/pdf) |

---

## 7. Estimation

| Métrique | Valeur |
|----------|--------|
| Points | 2 |
| Priorité | P2 |
| Risque | Faible |

---

## 8. Tests manuels

1. Effectuer une simulation complète
2. Cliquer sur "Télécharger PDF"
3. Vérifier que le spinner apparaît
4. Vérifier que le fichier est téléchargé
5. Ouvrir le PDF et vérifier le contenu
6. Tester sur mobile

---

## Changelog

| Date | Version | Description | Auteur |
|------|---------|-------------|--------|
| 2026-02-04 | 1.0 | Création initiale | John (PM) |
