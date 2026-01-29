# Guide du Design System & UX (Developer Handbook)

Ce document est destiné aux développeurs travaillant sur **Renta Immo**. Il complète la spécification UX abstraite par des exemples concrets de code et des règles de mise en œuvre pour maintenir la cohérence de l'identité **Nordic Minimal**.

---

## 1. Identité Visuelle (Tailwind)

Tout le design repose sur les tokens configurés dans `tailwind.config.ts`. Utilisez **exclusivement** ces classes pour les couleurs et espacements.

### Palette de Couleurs
- **Background** : `bg-background` (#FAFAF8) - Fond principal.
- **Surface** : `bg-surface` (#F5F3EF) - Fonds de cartes, inputs.
- **Bordures** : `border-border` (#E8E4DD) - Séparateurs, bordures d'inputs.
- **Accents** : `text-forest` / `bg-forest` (#2D5A45) - Actions principales.
- **Alertes** : `text-sage` (Success), `text-amber` (Warning), `text-terracotta` (Error).

---

## 2. Utilisation des Composants

### Boutons (`Button.tsx`)
Utilisez le variant approprié selon la hiérarchie de l'action :
```tsx
<Button variant="primary">Action Principale</Button>
<Button variant="secondary">Action Secondaire</Button>
<Button variant="ghost">Navigation / Lien</Button>
<Button variant="danger">Action Destructive</Button>
```

### Formulaires (`Input.tsx`, `CurrencyInput.tsx`)
Les formulaires doivent rester aérés.
- **2 colonnes** sur Desktop (`md:grid-cols-2`), **1 colonne** sur mobile.
- Utilisez systématiquement les labels et les messages d'erreur.
- **Validation** : Les messages d'erreur numériques doivent être explicites ("Veuillez saisir un nombre valide").

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <Input label="Nom" {...register('nom')} />
  <CurrencyInput label="Prix" {...register('prix')} />
</div>
```

---

## 3. Règles d'Accessibilité (WCAG)

Tout nouvel élément doit respecter ces deux règles critiques :
1. **Focus Rings** : Toujours utiliser les classes de focus harmonisées :
   `focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1`
2. **Contrastes** : Sur fond Vert Forêt (ex: Dashboard Score), utilisez `text-white/70` (ou plus clair) pour les textes secondaires, et `text-white` pour les titres. Évitez les couleurs sombres sur fond sombre.

---

## 4. Logique de Navigation & État

### Redirections Formulaire → Résultats
Le `FormWizard` redirige automatiquement vers `/resultats` si `status === 'success'`.
**Règle d'or** : Pour revenir à la modification des données depuis les résultats, vous **devez** appeler `setStatus('idle')` avant de rediriger vers le calculateur, sinon l'utilisateur sera immédiatement re-redirigé vers les résultats.

```tsx
// Exemple dans Dashboard.tsx
const handleEdit = () => {
  setStatus('idle'); // Crucial pour casser la boucle de redirection
  router.push('/calculateur');
};
```

### Persistance
L'état du calculateur est persisté dans le `localStorage`. Pour repartir de zéro, utilisez toujours l'action `reset()` du store.

---

## 5. Maintenance des Étapes (Wizard)
Pour ajouter une nouvelle étape :
1. Ajouter l'ID dans `CalculateurFormData` (`types/calculateur.ts`).
2. Mettre à jour `FORM_STEPS` dans `types/calculateur.ts`.
3. Créer le composant `StepX.tsx` dans `components/forms/`.
4. L'insérer dans le `switch` de `FormWizard.tsx`.
5. Vérifier la gestion de l'index dans le `ProgressStepper`.

---

## 6. Checklist de Validation UX
Avant de commit une nouvelle fonctionnalité, posez-vous ces questions :
- [ ] Est-ce que le contraste est suffisant (WebAIM) ?
- [ ] Est-ce que la navigation au clavier (`Tab`) suit l'ordre visuel ?
- [ ] Est-ce que les animations sont désactivées via `prefers-reduced-motion` ?
- [ ] Est-ce que le layout s'adapte sans scroll horizontal sur iPhone SE ?
