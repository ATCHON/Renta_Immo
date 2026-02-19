# Story AUDIT-202 : Pre-commit hooks — Husky + lint-staged

> **Priorite** : P4-2 (Tests & DevOps)
> **Effort** : 0.5 jour
> **Statut** : A faire
> **Source** : Audit technique 2026-02-07, Sections 6.2 et 6.3
> **Dependance** : AUDIT-201 (script `prepare` dans package.json)

---

## 1. User Story

**En tant que** développeur
**Je veux** que le code soit automatiquement vérifié avant chaque commit
**Afin de** ne jamais pousser du code qui échoue au lint, au formatage ou aux types

---

## 2. Contexte

### 2.1 Problème

Actuellement, rien n'empêche de committer du code mal formaté ou avec des erreurs TypeScript. Les vérifications n'ont lieu qu'en CI (GitHub Actions), ce qui génère des allers-retours inutiles : commit → push → CI rouge → correction → nouveau commit.

Avec Husky + lint-staged, les erreurs sont détectées **localement avant le commit**, ce qui réduit le bruit dans l'historique git et accélère les revues de code.

### 2.2 État actuel

- Ni Husky ni lint-staged ne sont installés
- Le CI vérifie lint, types et formatage mais seulement après push
- `eslint-config-next` version `14.2.21` ne correspond pas à `next@14.2.35` (décalage mineur mais à corriger)

---

## 3. Critères d'acceptation

### 3.1 Husky installé et configuré

- [ ] `husky` est installé en devDependency
- [ ] `npm run prepare` installe automatiquement Husky (via `"prepare": "husky"` dans scripts)
- [ ] Le répertoire `.husky/` est créé avec les hooks nécessaires
- [ ] Le hook `.husky/pre-commit` exécute lint-staged

### 3.2 lint-staged configuré

- [ ] `lint-staged` est installé en devDependency
- [ ] La configuration dans `package.json` couvre :
  - `*.{ts,tsx}` → ESLint fix + Prettier write
  - `*.{json,md}` → Prettier write
- [ ] Seuls les fichiers **modifiés** (staged) sont vérifiés (pas tout le projet)

### 3.3 Hook pre-commit fonctionnel

- [ ] Un commit avec du code mal formaté déclenche une erreur et est bloqué
- [ ] Un commit avec une erreur ESLint déclenche une erreur et est bloqué
- [ ] Un commit valide passe le hook sans erreur
- [ ] `git commit --no-verify` est documenté dans le README pour les cas d'urgence

### 3.4 Alignement version eslint-config-next

- [ ] `eslint-config-next` est mis à jour pour correspondre à la version Next.js utilisée

---

## 4. Spécifications techniques

### 4.1 Commandes d'installation

```bash
npm install --save-dev husky lint-staged
npx husky init
```

### 4.2 Fichier `.husky/pre-commit`

```sh
npx lint-staged
```

### 4.3 Configuration lint-staged dans `package.json`

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write"
  ],
  "*.{json,md,css}": [
    "prettier --write"
  ]
}
```

### 4.4 Fichiers impactés

| Fichier              | Modification                                                |
| -------------------- | ----------------------------------------------------------- |
| `package.json`       | Ajout devDependencies + lint-staged config + script prepare |
| `.husky/pre-commit`  | Nouveau — exécute lint-staged                               |
| `.husky/_/husky.sh`  | Généré automatiquement par Husky                            |
| `eslint-config-next` | Mise à jour de la version                                   |

### 4.5 Note CI — pas de double vérification

Le CI (`ci.yml`) fait déjà tourner ESLint, TypeScript et Prettier sur toutes les branches. Husky est une sécurité locale **complémentaire**, pas un remplacement du CI.

Pour éviter que Husky s'exécute en CI (où git hooks peuvent interférer), ajouter dans le workflow :

```yaml
- name: Install dependencies
  run: npm ci --ignore-scripts
```

Le flag `--ignore-scripts` empêche l'exécution de `prepare` (et donc l'installation de Husky) en CI.

---

## 5. Points d'attention

- Sur Windows, s'assurer que les scripts shell `.husky/pre-commit` utilisent des fins de ligne LF (Git doit être configuré avec `core.autocrlf=false` sur le projet)
- Si un développeur tourne `git commit` et que Husky n'est pas installé (ex: clone sans `npm install`), le commit doit passer — Husky échoue silencieusement dans ce cas par défaut
- Ne pas ajouter `npm run type-check` dans le pre-commit — trop lent. Laisser la vérification TypeScript au CI

---

## 6. Définition of Done

- [ ] `npm install` installe Husky automatiquement via `prepare`
- [ ] Un commit avec `prettier` cassé est bloqué
- [ ] Un commit avec ESLint error est bloqué
- [ ] Un commit propre passe en moins de 30 secondes
- [ ] `npm ci --ignore-scripts` fonctionne en CI sans erreur
- [ ] TypeScript compile sans erreur (`npm run type-check`)
