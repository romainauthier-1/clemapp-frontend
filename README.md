# 🎁 ClemApp — Frontend

> **Une application mobile pour découvrir des surprises** — Une interface React Native/Expo qui permet aux utilisateurs de se connecter, découvrir des surprises et recevoir des notifications en temps réel.

---

## ⭐ Badges

[![Expo](https://img.shields.io/badge/Expo-54.0.33-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![Redux](https://img.shields.io/badge/Redux-2.11.2-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux.js.org/)
[![React Navigation](https://img.shields.io/badge/React_Navigation-6-673AB7?style=for-the-badge)](https://reactnavigation.org/)
[![Lucide React Native](https://img.shields.io/badge/Lucide_React_Native-1.7.0-3B82F6?style=for-the-badge)](https://lucide.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 📜 À propos du projet

**ClemApp Frontend** est une **application mobile cross-platform** développée avec **Expo** et **React Native**. Elle offre une expérience utilisateur immersive pour :

- **Se connecter** de manière sécurisée
- **Découvrir des surprises** organisées par catégories
- **Utiliser une roue de la fortune** pour sélectionner aléatoirement une surprise
- **Recevoir des notifications push** en temps réel
- **Accéder à des fonctionnalités exclusives** selon le statut de l'utilisateur
- **Gérer son profil** et ses préférences

L'application est déployée comme **PWA (Progressive Web App)** et utilise les **Service Workers** pour les notifications push.

---

## 🔧 Stack Technique

| Catégorie            | Technologie                                                                                             | Version | Rôle                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------- |
| **Framework**        | [Expo](https://expo.dev/)                                                                               | 54.0.33 | Framework React Native                |
| **Librairie UI**     | [React Native](https://reactnative.dev/)                                                                | 0.81.5  | Construction de l'interface mobile    |
| **State Management** | [Redux Toolkit](https://redux-toolkit.js.org/)                                                          | 2.11.2  | Gestion centralisée de l'état         |
| **Persistance**      | [Redux Persist](https://github.com/rt2zz/redux-persist)                                                 | 6.0.0   | Sauvegarde du state dans AsyncStorage |
| **Navigation**       | [React Navigation](https://reactnavigation.org/)                                                        | 6       | Navigation entre écrans               |
| **Icons**            | [Lucide React Native](https://lucide.dev/)                                                              | 1.7.0   | Bibliothèque d'icônes                 |
| **Storage**          | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)                             | 2.2.0   | Stockage local                        |
| **DateTime Picker**  | [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) | 9.1.0   | Sélecteur de dates                    |
| **Flash Messages**   | [react-native-flash-message](https://github.com/luggit/react-native-flash-message)                      | 0.4.2   | Notifications toast                   |
| **PWA**              | [Service Worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)                   | -       | Notifications push                    |
| **Déploiement**      | [Expo EAS](https://docs.expo.dev/eas/)                                                                  | -       | Build et déploiement                  |

---

## ✨ Fonctionnalités

### 📱 **Interface Mobile**

- **Navigation par onglets** – Bottom Tab Navigator avec icônes personnalisées
- **Design moderne** – Interface fluide et intuitive
- **Responsive** – Adaptation à toutes les tailles d'écran
- **Thème personnalisé** – Couleurs et styles cohérents
- **Animations** – Transitions fluides entre les écrans

### 👤 **Authentification**

- **Connexion** – Formulaire de login avec validation
- **Gestion de token** – Stockage sécurisé dans AsyncStorage
- **Statuts utilisateurs** – Accès différenciés (guest+, star, demo-admin)
- **Déconnexion** – Suppression du token et retour à l'écran de login

### 🎁 **Surprises**

- **Liste des surprises** – Affichage des surprises disponibles
- **Détails** – Visualisation des informations d'une surprise
- **Fil Rouge** – Permet à certaines catégories d'utilisateur.ices d'envoyer des notifications
- **Verrouillage** – Indication visuelle des surprises verrouillées/déverrouillées

### 🎡 **Roue de la Fortune**

- **Sélection aléatoire** – La roue tourne et sélectionne un.e invité.e
- **Animation fluide** – Effet de rotation réaliste
- **Résultat instantané** – Pour des jeux de hasard

### 🔔 **Notifications Push**

- **Abonnement manuel** – Enregistrement du device au clic sur le bouton
- **Réception en temps réel** – Notifications même lorsque l'app est fermée
- **Gestion des permissions** – Demande d'autorisation transparente

### 📊 **Écrans**

- **WelcomeScreen** – Écran d'accueil avec présentation
- **LoginScreen** – Connexion à l'application
- **SurprisesScreen** – Liste de toutes les surprises
- **WheelScreenSVG** – Roue de la fortune interactive
- **EventScreen** – Écran spécial pour le Fil Rouge
- **OptionsScreen** – Réglages de l'application
- **LogOutScreen** – Déconnexion + abonnement notifications

---

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- [Yarn](https://yarnpkg.com/) ou [npm](https://www.npmjs.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (optionnel pour le développement)
- [ClemApp Backend](https://github.com/dankysten/ClemApp-backend) **en cours d'exécution**

### Étapes

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/dankysten/ClemApp-frontend.git
   cd ClemApp-frontend
   ```

2. **Installer les dépendances**

   ```bash
   yarn install
   # ou
   npm install
   ```

3. **Configurer l'environnement**
   Créer un fichier `.env` à la racine avec les variables suivantes :

   ```env
   EXPO_PUBLIC_BACKEND_URL=http://localhost:4000
   EXPO_PUBLIC_VAPID_PUBLIC_KEY=<ta_clé_publique>
   ```

4. **Lancer l'application**

   ```bash
   # Mode développement
   yarn start
   # ou
   npm start

   # Sur Android
   yarn android
   # ou
   npm run android

   # Sur iOS
   yarn ios
   # ou
   npm run ios

   # Sur Web
   yarn web
   # ou
   npm run web
   ```

5. **Accéder à l'application**
   - Scannez le QR code avec l'application **Expo Go** (mobile)
   - Ou ouvrez `http://localhost:19006` dans votre navigateur (web)

---

## 📁 Structure du Projet

```
ClemApp-frontend/
├── App.js                     # Point d'entrée principal
├── index.js                  # Registration Expo
├── package.json              # Dépendances et scripts
├── app.json                  # Configuration Expo
├── .env                      # Variables d'environnement
├── .gitignore                # Fichiers ignorés par Git
│
├── assets/                   # Ressources statiques
│   └── favicon.png           # Favicon de l'application
│
├── public/                   # Fichiers publics
│   └── apple-touch-icon.png  # Icône pour PWA
│
├── components/               # Composants réutilisables
│   ├── SurpriseCard.js       # Carte de surprise
│   └── WheelSvg.js           # Composant SVG de la roue
│
├── screens/                  # Écrans de l'application
│   ├── colors.js             # Palette de couleurs
│   ├── LoginScreen.jsx      # Écran de connexion
│   ├── WelcomeScreen.jsx    # Écran d'accueil
│   ├── SurprisesScreen.jsx  # Écran des surprises
│   ├── WheelScreenSVG.jsx   # Écran de la roue
│   ├── EventScreen.jsx       # Écran Fil Rouge
│   ├── OptionsScreen.jsx    # Écran des réglages
│   └── LogOutScreen.jsx      # Écran de déconnexion
│
├── reducers/                 # Store Redux
│   ├── user.js               # Reducer utilisateur
│   └── surprises.js          # Reducer surprises
│
└── node_modules/             # Dépendances installées
```

---

## 🔌 Configuration Backend

L'application nécessite un backend fonctionnel. Par défaut, elle se connecte à :

```
http://localhost:4000
```

**Pour utiliser un backend déployé :**

1. Lancer le [ClemApp Backend](../ClemApp-backend/README.md) ou utiliser l'URL déployée
2. Mettre à jour `.env` :
   ```env
   EXPO_PUBLIC_BACKEND_URL=https://clemapp-backend.vercel.app
   ```

---

## 📡 Notifications Push

L'application utilise l'API **Web Push** pour envoyer des notifications. Pour que cela fonctionne :

1. **Générer des clés VAPID** (si vous n'en avez pas) :

   ```bash
   npx web-push generate-vapid-keys
   ```

2. **Configurer le backend** avec ces clés dans `.env` :

   ```env
   EXPO_PUBLIC_VAPID_PUBLIC_KEY=<clé_publique>
   EXPO_PUBLIC_VAPID_PRIVATE_KEY=<clé_privée>
   ```

3. **Authoriser les notifications** dans le navigateur ou sur mobile

---

## 🎨 Personnalisation

### Thème

Le thème principal est défini dans `screens/colors.js` avec :

- **Couleur principale** : `#CAECE7` (vert clair)
- **Couleur secondaire** : `#B5A1C4` (violet clair)
- **Couleur d'accent** : `#7c3aed` (violet)

Tu peux modifier ces valeurs pour adapter le thème à ton style.

### Navigation

La configuration de la barre de navigation est dans `App.js`. Tu peux y modifier :

- Les onglets affichés
- Les icônes utilisées
- Les couleurs de la barre
- Les styles des labels

---

## 📱 Déploiement (PWA)

### Avec Expo EAS

1. Configurer `app.json` avec les bonnes informations
2. Lancer le build :
   ```bash
   eas build --platform all
   ```
3. Déployer sur les stores ou comme PWA

### En tant que PWA

1. Builder l'application web :
   ```bash
   yarn web
   ```
2. Déployer le dossier `dist/` sur un hébergement statique
3. Configurer le **Service Worker** pour les notifications push

---

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

- **Ouvrir une issue** pour signaler un bug ou proposer une amélioration
- **Forker le projet** et soumettre une Pull Request

---

## 📜 Licence

Ce projet est sous licence **[MIT](https://opensource.org/licenses/MIT)**.

---

## 👤 Auteur

📌 **Romain Authier**  
📧 [dankysten](https://github.com/dankysten)  
💼 Développeur Fullstack junior

---

> _"Parce que la vie mérite plus de surprises."_ 🎁✨
