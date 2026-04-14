import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Provider, useDispatch, useSelector } from "react-redux";
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useEffect } from "react";

import {
  PartyPopper,
  Gift,
  SquareArrowRightExit,
  LoaderPinwheel,
} from "lucide-react-native";
import { colors } from "./screens/colors";

import user from "./reducers/user";
import surprises from "./reducers/surprises";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
const reducers = combineReducers({ user, surprises });

const persistConfig = { key: "ClemApp2", storage: AsyncStorage };

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);

import LoginScreen from "./screens/LoginScreen";
import WelcomeScreen from "./screens/WelcomeScreen";
import SurprisesScreen from "./screens/SurprisesScreen";
import LogOutScreen from "./screens/LogOutScreen";
import WheelScreen from "./screens/WheelScreen";
import WheelScreenSVG from "./screens/WheelScreenSVG";
import EventScreen from "./screens/EventScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeTabs = ({ onActivatePush }) => {
  const user = useSelector((state) => state.user);
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
          marginHorizontal: 30,
          borderRadius: 25,
          marginBottom: 10,
          backgroundColor: colors.secondary,
          padding: 10,
        },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={WelcomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <PartyPopper
              size={focused ? 30 : 20}
              color={focused ? colors.backgroundLight : colors.primaryLight}
            />
          ),
          tabBarActiveTintColor: colors.backgroundLight,
          tabBarInactiveTintColor: colors.primaryLight,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 5,
          },
        }}
      />
      <Tab.Screen
        name="Surprises"
        component={SurprisesScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <Gift
              size={focused ? 30 : 20}
              color={focused ? colors.backgroundLight : colors.primaryLight}
            />
          ),
          tabBarActiveTintColor: colors.backgroundLight,
          tabBarInactiveTintColor: colors.primaryLight,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 5,
          },
        }}
      />
      <Tab.Screen
        name="Roue"
        component={WheelScreenSVG}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <LoaderPinwheel
              size={focused ? 30 : 20}
              color={focused ? colors.backgroundLight : colors.primaryLight}
            />
          ),
          tabBarActiveTintColor: colors.backgroundLight,
          tabBarInactiveTintColor: colors.primaryLight,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 5,
          },
        }}
      />
      {user.status === "star" ||
        (user.status === "guest+" && (
          <Tab.Screen
            name="Fil Rouge"
            component={EventScreen}
            options={{
              tabBarIcon: ({ focused, color, size }) => (
                <PartyPopper
                  size={focused ? 30 : 20}
                  color={focused ? colors.backgroundLight : colors.primaryLight}
                />
              ),
              tabBarActiveTintColor: colors.backgroundLight,
              tabBarInactiveTintColor: colors.primaryLight,
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: "bold",
                marginBottom: 5,
              },
            }}
          />
        ))}
      <Tab.Screen
        name="Déconnexion"
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <SquareArrowRightExit
              size={focused ? 30 : 20}
              color={focused ? colors.backgroundLight : colors.primaryLight}
            />
          ),
          tabBarActiveTintColor: colors.backgroundLight,
          tabBarInactiveTintColor: colors.primaryLight,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 5,
          },
        }}
      >
        {(props) => <LogOutScreen {...props} onActivatePush={onActivatePush} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const AppNavigation = () => {
  const isConnected = useSelector((state) => state.user.isConnected);
  const userToken = useSelector((state) => state.user.token);

  const registerServiceWorker = async () => {
    console.log("SW présent dans navigator ?", "serviceWorker" in navigator);
    console.log("PushManager présent dans window ?", "PushManager" in window);
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration =
          await navigator.serviceWorker.register("/serviceWorker.js");
        console.log("Service Worker enregistré !", registration);
        return registration;
      } catch (error) {
        console.error("Erreur SW:", error);
      }
    }
  };

  const subscribeUser = async () => {
    console.log("1. Entrée dans subscribeUser");
    console.log("2. Token récupéré :", userToken);

    const registration = await navigator.serviceWorker.ready;

    // const existingSubscription =
    //   await registration.pushManager.getSubscription();
    // // if (existingSubscription) {
    // //   console.log("Déjà abonné :", existingSubscription);
    // //   // return;
    // // }
    // console.log("VAPID PUBLIC KEY: ", process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY);
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY,
      ),
    });

    console.log("3. Subscription obtenue, envoi au backend...");

    const subscriptionJSON = subscription.toJSON();

    const response = await fetch(
      `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/subscribe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: userToken,
          subscription: subscriptionJSON,
        }),
      },
    );
    const data = await response.json();
    console.log("4. Réponse Backend :", data);
  };

  const setupPush = async () => {
    const registration = await registerServiceWorker();

    if (registration) {
      console.log(
        "On peut maintenant demander la souscription !",
        registration,
      );
      await subscribeUser();
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isConnected ? (
        <Stack.Screen name="ClemApp | Bienvenue">
          {(props) => <HomeTabs {...props} onActivatePush={setupPush} />}
        </Stack.Screen>
      ) : (
        <Stack.Screen name="ClemApp | Connexion" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default function App({ navigation }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
          <StatusBar style="auto" />
          <FlashMessage position="center" />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
