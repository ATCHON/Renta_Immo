# Orientations Techniques & Bonnes Pratiques - 29/01/2026

## 1. Excellence Technique : Moteur de Calcul

La migration du moteur de calcul vers le backend Next.js est un succès. Pour maintenir ce niveau de qualité, voici les recommandations pour les prochaines étapes.

### 1.1 Tests Unitaires & Couverture
Le module `projection.ts` est désormais le cœur de la valeur métier (TRI, projections sur 25 ans).
- **Action** : Augmenter la couverture de tests sur ce fichier.
- **Focus** : Tester les cas limites (apport nul, taux d'intérêt à 0, durée courte vs longue).
- **Stabilité Numérique** : Le calcul du TRI via Newton-Raphson peut diverger dans des cas extrêmes. Il est recommandé d'ajouter des tests de stress sur ce composant.

### 1.2 Gestion des Types
Nous observons une duplication entre `src/types/calculateur.ts` et `src/server/calculations/types.ts`.
- **Recommandation** : À terme, consolider les types "métier" dans un dossier `common` ou garder `src/types/` comme source de vérité unique pour éviter les désynchronisations lors des évolutions de schémas Zod.

---

## 2. Fiscalité Avancée (Sprint 5)

Les prochains développements concernent la SCI IS et la comparaison des régimes.

### 2.1 SCI IS : Distribution des Dividendes
Le calcul de l'IS est en place. La prochaine étape est la simulation de la distribution.
- **Formule recommandée** : `Dividende Brut = Resultat_Comptable - IS`.
- **Flat Tax** : Appliquer les 30% (ou option barème IR si avantageux, mais rester sur Flat Tax par défaut).
- **Impact Cash-flow** : Bien distinguer le cash-flow au niveau de la société (capitalisation) du cash-flow net dans la poche de l'associé (après dividendes et Flat Tax).

### 2.2 Comparateur Fiscal
Le comparateur doit être un outil d'aide à la décision.
- **UI** : Utiliser un tableau croisé montrant l'impôt cumulé sur 10 ans pour chaque régime.
- **Pédagogie** : Expliquer pourquoi le LMNP réel est souvent supérieur au début (amortissement) et quand la SCI IS devient pertinente (fortes TMI, volonté de capitaliser).

---

## 3. Infrastructure & PDF (Phase 2)

Le setup de `@react-pdf/renderer` est la priorité suivante.
- **Performance** : Les PDF doivent être générés côté serveur. Attention à la taille des polices de caractères qui peuvent alourdir le bundle serverless de Vercel.
- **Design** : Maintenir la cohérence avec le design "Nordic Minimal" actuel.

---
*Winston, Architecte Système*
