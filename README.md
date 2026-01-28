# Renta Immo

Renta Immo est un simulateur complet de rentabilité immobilière conçu pour aider les investisseurs à analyser la viabilité financière de leurs projets locatifs.

L'application permet de calculer précisément la rentabilité (brute, nette, nette-nette), d'estimer le cashflow, de vérifier la conformité HCSF et de simuler l'impact fiscal selon différents régimes.

## Fonctionnalités Principales

- **Simulations Complètes** : Saisie guidée des informations du bien, du financement et des frais de gestion.
- **Analyse de Rentabilité** : Calcul automatique des taux de rentabilité brute, nette et nette-nette (après impôts).
- **Indicateurs de Cashflow** : Visualisation du flux de trésorerie mensuel et annuel (effort d'épargne ou excédent).
- **Vérification HCSF** : Calcul du taux d'endettement et vérification de la conformité avec les normes bancaires (35%).
- **Projections Pluriannuelles** : Simulation de l'évolution du patrimoine, du capital restant dû et du TRI sur 20 ans.
- **Export PDF** : Génération de rapports détaillés pour faciliter les échanges avec les partenaires bancaires.

## Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Gestion d'état** : Zustand
- **Validation** : Zod & React Hook Form
- **Analyse de données** : TanStack Query

## Installation

### Prérequis

- Node.js 18.x ou supérieur
- npm ou pnpm

### Procédure

1. Clonez le dépôt :
   ```bash
   git clone https://github.com/ATCHON/Renta_Immo.git
   cd Renta_Immo
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```

4. Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Déploiement

Le projet est configuré pour un déploiement optimisé sur Vercel.

```bash
npm run build
```

## Licence

Ce projet est sous licence privée.
