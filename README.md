# 🎁 ClemApp — Frontend

PWA événementielle avec contenus programmés et notifications push : les organisateurs d'un événement préparent des surprises qui se dévoilent à une date donnée, en résolvant une énigme ou sur décision d'un organisateur, et les invités sont prévenus en temps réel sur leur téléphone.

**Démo :** [clemapp-frontend.vercel.app](https://clemapp-frontend.vercel.app) (l'écran de connexion est pré-rempli avec un compte de démonstration) · **API :** [clemapp-backend](https://github.com/romainauthier-1/clemapp-backend)

![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?logo=react&logoColor=black)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Web_Push-5A0FC8)

---

## Fonctionnalités

- **Surprises programmées**, avec trois modes de révélation :
  - **à date et heure** : déblocage automatique au moment prévu ;
  - **par énigme** : l'invité saisit une réponse, avec un indice disponible ;
  - **manuel** : un organisateur verrouille ou déverrouille la surprise.
- **Notifications push** (Web Push) : abonnement depuis l'app, notifications reçues même app fermée, envoyées lors des déblocages et des tirages au sort.
- **Roue de tirage au sort** (SVG animé) pour désigner un invité, qui est prévenu par notification.
- **« Fil rouge »** : envoi d'une notification à une sélection d'invités.
- **Accueil** : météo du lieu de l'événement (OpenWeatherMap, via l'API), citation aléatoire, état du fil rouge.
- **Rôles** (personne fêtée, invité, organisateur) : les onglets et actions disponibles dépendent du rôle.
- **Espace organisateur** : création, modification et suppression des surprises ; gestion des comptes invités.
- **Mode démo** : comptes et surprises dédiés, isolés des données réelles.

## Stack technique

| Domaine       | Choix                                                     |
| ------------- | --------------------------------------------------------- |
| Framework     | Expo 54, React Native 0.81, React 19, react-native-web    |
| État          | Redux Toolkit + redux-persist (AsyncStorage)              |
| Navigation    | React Navigation 6 (onglets conditionnels selon le rôle)  |
| UI            | react-native-svg (roue), Lucide icons, flash messages     |
| PWA           | Service worker + Push API (clés VAPID)                    |
| Déploiement   | Vercel (export web)                                       |

## Points techniques

- **Notifications push web** : enregistrement du service worker (`public/serviceWorker.js`), abonnement `PushManager` avec la clé publique VAPID, puis envoi de l'abonnement à l'API qui se charge de l'envoi via `web-push`.
- **Déblocage temporisé côté client** : à l'ouverture de l'écran, un minuteur est programmé pour chaque surprise à date ; les minuteurs sont nettoyés quand l'écran perd le focus.
- **Navigation pilotée par le rôle** : l'onglet « Fil rouge » et les réglages ne sont montés que pour les rôles autorisés.

## Installation

Prérequis : Node.js 18+, Yarn, et l'[API ClemApp](https://github.com/romainauthier-1/clemapp-backend) lancée en local (ou l'URL déployée).

```bash
git clone https://github.com/romainauthier-1/clemapp-frontend.git
cd clemapp-frontend
yarn install
cp .env.example .env    # renseigner les variables ci-dessous
yarn web                # ou : yarn start puis scanner le QR code avec Expo Go
```

| Variable                       | Rôle                                                    |
| ------------------------------ | ------------------------------------------------------- |
| `EXPO_PUBLIC_BACKEND_URL`      | URL de l'API (ex. `http://localhost:4000`)              |
| `EXPO_PUBLIC_VAPID_PUBLIC_KEY` | Clé publique VAPID, identique à celle configurée sur l'API |

Les notifications push nécessitent un contexte sécurisé (HTTPS ou `localhost`) et un navigateur compatible ; sur iPhone, l'app doit être ajoutée à l'écran d'accueil.

## Structure

```
App.js            store Redux, navigation, enregistrement du service worker
screens/          Accueil, Surprises, Roue, Fil rouge, Réglages, Connexion, Déconnexion
components/       SurpriseCard (modes de révélation), WheelSvg
reducers/         user, surprises
public/           index.html, service worker, icône PWA
```

---

Romain Authier — [GitHub](https://github.com/romainauthier-1)
