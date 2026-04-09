import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Provider } from "react-redux";
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import FlashMessage from "react-native-flash-message";

import { PartyPopper, Gift, SquareArrowRightExit } from "lucide-react-native";
import { colors } from "./screens/colors";

import user from "./reducers/user";
import surprises from "./reducers/surprises";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
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

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
          marginHorizontal: 20,
          borderRadius: 25,
          marginBottom: 10,
          backgroundColor: colors.backgroundLight,
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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isConnected ? (
        <Stack.Screen name="Home" component={HomeTabs} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
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
          <FlashMessage position="bottom" />
        </SafeAreaProvider>
      </PersistGate>
    </Provider>
  );
}
