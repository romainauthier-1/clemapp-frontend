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
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { setPushToken } from "./reducers/user";
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

const HomeTabs = () => {
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
          backgroundColor: colors.backgroundLight,
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
              color={focused ? colors.primary : colors.secondary}
            />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
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
              color={focused ? colors.primary : colors.secondary}
            />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
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
              color={focused ? colors.primary : colors.secondary}
            />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 5,
          },
        }}
      />
      {user.status === "star" && (
        <Tab.Screen
          name="Event"
          component={EventScreen}
          options={{
            tabBarIcon: ({ focused, color, size }) => (
              <PartyPopper
                size={focused ? 30 : 20}
                color={focused ? colors.primary : colors.secondary}
              />
            ),
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.secondary,
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: "bold",
              marginBottom: 5,
            },
          }}
        />
      )}
      <Tab.Screen
        name="Déconnexion"
        component={LogOutScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <SquareArrowRightExit
              size={focused ? 30 : 20}
              color={focused ? colors.primary : colors.secondary}
            />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.secondary,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
            marginBottom: 5,
          },
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigation = () => {
  const isConnected = useSelector((state) => state.user.isConnected);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isConnected) {
      registerForPushNotificationsAsync().then((token) => {
        token && console.log("PushToken récupéré :", token);
      });
    }
  }, [isConnected]);

  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        showMessage({
          message: "Permission de notifications refusée",
          type: "warning",
          style: {
            borderRadius: 10,
            marginBottom: 15,
          },
        });
        return;
      }
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      if (!projectId) {
        handleRegistrationError("Project ID not found");
      }
      try {
        const pushTokenString = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log(pushTokenString);
        dispatch(setPushToken(pushTokenString));
        return pushTokenString;
      } catch (e) {
        handleRegistrationError(`${e}`);
      }
    } else {
      handleRegistrationError(
        "Must use physical device for push notifications",
      );
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isConnected ? (
        <Stack.Screen name="ClemApp | Bienvenue" component={HomeTabs} />
      ) : (
        <Stack.Screen name="ClemApp | Connexion" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App({ navigation }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <SafeAreaProvider>
          <NavigationContainer>
            <AppNavigation />
          </NavigationContainer>
          <StatusBar style="auto" />
          <FlashMessage position="bottom" />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
