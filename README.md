# Renta Immo

[![CI](https://github.com/ATCHON/Renta_Immo/actions/workflows/ci.yml/badge.svg)](https://github.com/ATCHON/Renta_Immo/actions/workflows/ci.yml)
[![Unit Tests](https://img.shields.io/badge/Unit_Tests-passed-brightgreen.svg)](https://github.com/ATCHON/Renta_Immo)
[![Integration Tests](https://img.shields.io/badge/Integration_Tests-passed-brightgreen.svg)](https://github.com/ATCHON/Renta_Immo)
[![E2E Tests](https://img.shields.io/badge/E2E_Tests-passed-brightgreen.svg)](https://github.com/ATCHON/Renta_Immo)
[![Coverage](https://img.shields.io/badge/Coverage-100%25-brightgreen.svg)](https://github.com/ATCHON/Renta_Immo)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.2-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-brown?logo=react&logoColor=white)](https://github.com/pmndrs/zustand)

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

| Couche         | Technologie                         | Version    |
| -------------- | ----------------------------------- | ---------- |
| Framework      | **Next.js** (App Router)            | **16.1.6** |
| Runtime UI     | **React** / React DOM               | **19.2.4** |
| Langage        | TypeScript                          | 5.7.3      |
| Styling        | **Tailwind CSS v4** (Lightning CSS) | **4.2.1**  |
| Linting        | **ESLint** (Flat Config)            | **9.x**    |
| Gestion d'état | Zustand                             | 5.0.x      |
| Validation     | Zod & React Hook Form               | 4.x / 7.x  |
| Data fetching  | TanStack Query                      | 5.x        |

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
