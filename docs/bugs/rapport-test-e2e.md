# Rapport de Test E2E - Renta Immo

**Date:** 2026-02-06  
**Testeur:** James (Agent Dev)  
**Environnement:** localhost:3000 (Next.js 14.2.35)

---

## 📊 Résumé Exécutif

| Catégorie | Statut |
|-----------|--------|
| Pages testées | 6/6 ✅ |
| Bugs critiques | 3 |
| Bugs majeurs | 2 |
| Bugs mineurs | 2 |
| Améliorations suggérées | 2 |

---

## ✅ Bugs Critiques (Corrigés)

### BUG-001 & BUG-001b: ~~Erreur 500 API Simulations~~ ✅ CORRIGÉ

> **Statut:** Corrigé le 2026-02-06
> **Vérification:** API `/api/simulations` retourne 200. Page `/simulations` charge correctement.

> [!CAUTION]
> **Bug critique bloquant** - Persistance des simulations impossible

#### Localisation
- **GET:** `/simulations` → Erreur lors du chargement
- **POST:** `/calculateur/resultats` → Bouton "Sauvegarder" échoue

#### Erreurs Console
```
Failed to load resource: the server responded with a status of 500 (Internal Server Error)
Failed to save simulation: JSHandle@error
```

---

### 🔍 ANALYSE TECHNIQUE

#### Cause Racine Identifiée

**`SUPABASE_SERVICE_ROLE_KEY` n'est pas défini dans `.env.local`**

```env
# Ligne 3 de .env.local (actuellement commentée)
# SUPABASE_SERVICE_ROLE_KEY= (Please add manually...)
```

#### Chaîne d'Impact

1. L'API `/api/simulations/route.ts` utilise `createAdminClient()` (L27, L92)
2. `createAdminClient()` dans `src/lib/supabase/server.ts` lit `SUPABASE_SERVICE_ROLE_KEY` (L40)
3. Sans cette clé → le client Supabase est invalide
4. La table `simulations` a **RLS activé** sans policies définies
5. Résultat: toutes les requêtes sont bloquées → erreur 500

#### Preuves BDD

| Vérification | Résultat |
|--------------|----------|
| Table `simulations` existe | ✅ |
| RLS activé | ✅ `rls_enabled: true` |
| Policies RLS | ❌ **Aucune policy** |
| FK vers `user.id` | ✅ Correcte |
| Utilisateur test existe | ✅ `nod966zPLJi...` |

---

### 🛠️ SOLUTION

#### Étape 1: Obtenir la clé Service Role

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard/project/utcgtvgaoffpksgstspx/settings/api)
2. Copier **Service Role Key** (⚠️ Garder secrète, ne jamais commit)

#### Étape 2: Configurer `.env.local`


#### Étape 3: Redémarrer le serveur dev

```bash
# Arrêter le serveur actuel (Ctrl+C)
npm run dev
```

---

### 📁 Fichiers Concernés

| Fichier | Rôle |
|---------|------|
| `.env.local` | Configuration à compléter |
| `src/app/api/simulations/route.ts` | API GET/POST |
| `src/lib/supabase/server.ts` | Client admin Supabase |


### BUG-002: ~~Indicateur d'étape incorrect~~ ✅ CORRIGÉ

> **Statut:** Corrigé le 2026-02-06
> **Vérification:** L'indicateur affiche correctement "Étape 5 sur 5" sur la page Options en mode Nom Propre.

#### Analyse Technique

**Fichier:** [FormWizard.tsx](file:///D:/Devs/Renta_Immo/src/components/forms/FormWizard.tsx#L64-L67)

```typescript
// L64-67 - Problème de logique
const displayStep = structure.type === 'nom_propre' && currentStep >= 4
  ? currentStep - 1  // BUG: décrémente en trop
  : currentStep;
```

**Cause:** Quand `structure.type === 'nom_propre'` et `currentStep = 4` (Options), le calcul donne `displayStep = 3`, donc affiche "Étape 4 sur 5".

**Solution:**
```diff
- const displayStep = structure.type === 'nom_propre' && currentStep >= 4
-   ? currentStep - 1
-   : currentStep;
+ const displayStep = structure.type === 'nom_propre' && currentStep > 4
+   ? currentStep - 1
+   : currentStep;
```

---

## 🟠 Bugs Majeurs

### BUG-003: ~~CTA "Lancer l'analyse" non fonctionnel~~ ✅ CORRIGÉ

> **Statut:** Corrigé le 2026-02-06
> **Vérification:** Le bouton "Lancer l'analyse" est maintenant un lien direct vers `/calculateur` et fonctionne correctement.

#### Analyse Technique

**Fichier:** [page.tsx](file:///D:/Devs/Renta_Immo/src/app/page.tsx#L24-L29)

```tsx
// Structure actuelle
<Link href="/calculateur" passHref>
  <Button variant="primary">Lancer l'analyse</Button>  // BUG: <button> intercepte le clic
</Link>
```

**Cause:** Le composant `Button` rend un élément `<button>` HTML natif. Quand wrappé dans `<Link>`, le bouton intercepte le clic et empêche la navigation.

**Solutions possibles:**

1. **Utiliser `asChild` (Radix pattern):**
```tsx
<Link href="/calculateur">
  <Button asChild><span>Lancer l'analyse</span></Button>
</Link>
```

2. **Utiliser `legacyBehavior`:**
```tsx
<Link href="/calculateur" legacyBehavior passHref>
  <a><Button>Lancer l'analyse</Button></a>
</Link>
```

3. **Utiliser `onClick` avec router:**
```tsx
const router = useRouter();
<Button onClick={() => router.push('/calculateur')}>Lancer l'analyse</Button>
```

---

### BUG-004: Pourcentages de financement incohérents

#### Analyse Technique

**Fichier:** [InvestmentBreakdown.tsx](file:///D:/Devs/Renta_Immo/src/components/results/InvestmentBreakdown.tsx#L21-L25)

```typescript
// L21-25
const totalBesoin = prixAchat + montantTravaux + fraisDossier + fraisGarantie;
// MISSING: frais de notaire!

const apportPart = (apport / safeTotal) * 100;
const empruntPart = (resultats.montant_emprunt / safeTotal) * 100;
// BUG: apport + emprunt > totalBesoin si emprunt inclut frais notaire
```

**Cause:** `totalBesoin` n'inclut pas tous les frais (ex: frais de notaire), mais `montant_emprunt` peut les inclure → somme > 100%.

**Solution:**
```diff
- const totalBesoin = prixAchat + montantTravaux + fraisDossier + fraisGarantie;
+ const totalBesoin = apport + resultats.montant_emprunt;
// OU inclure tous les frais dans le calcul original
```

---

## 🟡 Bugs Mineurs

### BUG-005: Précision flottante sur le taux d'assurance
- **Localisation:** `/calculateur` - Étape 2 (Financement)
- **Comportement observé:** Le champ "Taux d'assurance prêt" affiche `0.30000001192092896` au lieu de `0.3`
- **Comportement attendu:** Affichage propre `0.3` ou `0,3%`
- **Impact:** Affichage inesthétique (mineur, la valeur est correcte)
- **Recommandation:** Appliquer `toFixed(2)` ou arrondi dans le spinbutton

### BUG-006: Boutons étapes désactivés après complétion
- **Localisation:** `/calculateur/resultats` et navigation Wizard
- **Comportement observé:** Les boutons "Étape 1" (au début), "Étape 4" et "Étape 5" restent désactivés (`disabled`) même après avoir été visités ou avoir complété la simulation.
- **Comportement attendu:** Tous les boutons d'étape devraient être actifs pour permettre la navigation libre.
- **Impact:** Empêche la navigation aisée entre les sections.
- **Consultation Spec:** Section 4 (Calculator Wizard).

---

### BUG-007: Liens erronés dans le Header
- **Localisation:** Header (toutes les pages)
- **Comportement observé:**
  - Le lien **"Calculateur"** dans le menu Header pointe vers `/` (Accueil).
  - Le bouton **"Nouveau calcul"** pointe également vers `/`.
- **Comportement attendu:** "Calculateur" doit pointer vers `/calculateur`. "Nouveau calcul" doit reset le store et aller au step 1 du `/calculateur`.
- **Impact:** Navigation circulaire déroutante.
- **Consultation Spec:** Section 2 (Navigation Structure).

---

## 💡 Améliorations Suggérées

### AMÉLIO-001: Valeurs calculées suspectes
- **Localisation:** `/calculateur/resultats`
- **Observation:** 
  - TRI (20 ans): 0,00% - Semble anormalement bas
  - Patrimoine NET: -387 286 € - Valeur très négative
- **Recommandation:** Vérifier les formules de calcul dans `calculateur.store.ts`

### AMÉLIO-002: Timeout menu mobile
- **Localisation:** Header mobile
- **Observation:** Le bouton menu devient non-interactif après navigation
- **Recommandation:** Vérifier le cycle de vie du composant menu

---

## ✅ Fonctionnalités Validées

| Fonctionnalité | Statut | Notes |
|----------------|--------|-------|
| Page d'accueil | ✅ | Affichage correct, design OK |
| Calculateur Étape 1 (Bien) | ✅ | Tous champs fonctionnels |
| Calculateur Étape 2 (Financement) | ✅ | Calcul mensualité OK |
| Calculateur Étape 3 (Exploitation) | ✅ | Tous types location disponibles |
| Calculateur Étape 4 (Structure) | ✅ | Régimes fiscaux OK |
| Calculateur Étape 5 (Options) | ✅ | PDF, email, horizon OK |
| Dashboard Résultats | ✅ | Toutes métriques affichées |
| Tableau d'amortissement | ✅ | 20 années détaillées |
| Comparatif fiscal | ✅ | 6 régimes comparés |
| Graphiques projection | ✅ | Cash-flow et patrimoine |
| Page Login | ✅ | Email + Google |
| Protection /simulations | ✅ | Redirection vers login |

---

## 📌 Prochaines Actions

1. **Priorité Haute:**
   - [x] ~~Corriger BUG-001~~ ✅ Corrigé (API retourne 200)
   - [x] ~~Corriger BUG-002~~ ✅ Corrigé (affiche 5/5)
   - [x] ~~Corriger BUG-003~~ ✅ Corrigé (lien fonctionne)
   - [x] ~~Corriger BUG-004~~ ✅ Déjà corrigé (totalBesoin = apport + emprunt)

2. **Priorité Moyenne:**
   - [x] ~~Corriger BUG-005~~ ✅ Partiellement corrigé (step=0.01, nouveau stockage OK - vider localStorage pour anciens bugs)
   - [x] ~~Corriger BUG-006~~ ✅ Corrigé (boutons étapes visitées maintenant actifs)
   - [x] ~~Corriger BUG-007~~ ✅ Déjà corrigé (bouton `Nouveau calcul` navigue vers /calculateur)

3. **Sécurité BDD:**
   - [x] ~~Créer policies RLS pour table `simulations`~~ ✅ Déjà implémentées dans migration `20260204_create_simulations_table.sql`
   - [x] ~~Investiguer AMÉLIO-001 (TRI/Patrimoine)~~ ✅ Corrigé: TRI gère l'apport nul (simule 1€ pour calcul), Patrimoine Net sécurisé.

---

## 🔒 Recommandations Sécurité RLS

> [!IMPORTANT]
> La table `simulations` a RLS activé **sans policies** définies

### Policies RLS Recommandées

Même si le `SUPABASE_SERVICE_ROLE_KEY` bypass les RLS, il est recommandé de définir des policies pour la défense en profondeur:

```sql
-- Policy SELECT: utilisateur ne voit que ses simulations
CREATE POLICY "Users can view own simulations"
ON public.simulations FOR SELECT
TO authenticated
USING (user_id = (SELECT id FROM "user" WHERE email = auth.jwt() ->> 'email'));

-- Policy INSERT: utilisateur ne peut créer que pour lui-même
CREATE POLICY "Users can create own simulations"
ON public.simulations FOR INSERT
TO authenticated
WITH CHECK (user_id = (SELECT id FROM "user" WHERE email = auth.jwt() ->> 'email'));

-- Policy UPDATE: utilisateur ne peut modifier que ses simulations
CREATE POLICY "Users can update own simulations"
ON public.simulations FOR UPDATE
TO authenticated
USING (user_id = (SELECT id FROM "user" WHERE email = auth.jwt() ->> 'email'));

-- Policy DELETE: utilisateur ne peut supprimer que ses simulations
CREATE POLICY "Users can delete own simulations"
ON public.simulations FOR DELETE
TO authenticated
USING (user_id = (SELECT id FROM "user" WHERE email = auth.jwt() ->> 'email'));
```

> **Note:** Ces policies sont adaptées pour better-auth qui utilise une table `user` séparée. La correspondance se fait via email dans le JWT.
