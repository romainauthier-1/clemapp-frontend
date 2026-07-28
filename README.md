# ClemApp — Frontend

## Résumé

Frontend de l'application ClemApp : interface utilisateur légère servant les pages statiques et les appels aux endpoints du backend. Le projet utilise un framework JS moderne (React Native).
Application déployée en PWA via Vercel.

## Stack

- HTML / CSS / JavaScript
- React Native/ Next.js

## Prérequis

- Node.js 16+ ou 18+
- npm ou yarn

## Installation

1. Se placer dans le dossier du frontend :

   cd ClemApp-frontend

2. Installer les dépendances :

   npm install
   yarn install

## Lancer en développement

- Si le projet contient un script `dev` dans `package.json` :

  npm run dev
  yarn dev

## Build & production

- Pour démarrer en production :

  npm start
  yarn start

## Structure du projet

- `public/` — fichiers statiques (icônes, service worker)
- `assets/` — icônes
- `components/` — composants réutilisables
- `screens/` — code source pour chaque écran
- `reducers/` — store Redux
- `package.json` — scripts et dépendances

## Configuration

- Vérifiez `package.json` pour les scripts disponibles et les dépendances.
- Configurez l'URL de l'API via une variable d'environnement `.env`.

## Contribuer

1. Fork puis clone
2. Créez une branche descriptive
3. Ouvrez une PR avec une description claire

## Licence

À définir.

## Contact

Pour des questions sur le frontend, ouvrez une issue.
