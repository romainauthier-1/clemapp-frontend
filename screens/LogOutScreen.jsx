import {
  View,
  ScrollView,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Touchable,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../reducers/user";
import { colors } from "./colors";
import { activateNotif } from "../reducers/user";
import { SafeAreaView } from "react-native-safe-area-context";

const screenHeight = Dimensions.get("window").height;

export default function LogOutScreen({ navigation, onActivatePush }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isNotifActive = useSelector((state) => state.user.notifActivated);

  const checkName = () => {
    if (user.name.includes("-")) {
      let composedName = user.name.split("-");
      composedName =
        composedName[0][0].toUpperCase() +
        composedName[0].slice(1) +
        " " +
        composedName[1].toUpperCase();
      return composedName;
    } else {
      let regularName = user.name[0].toUpperCase() + user.name.slice(1);
      return regularName;
    }
  };

  const finalName = checkName();

  const sendAlertNotification = async (username) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenList: "sFiLnIqTBuUG8tYpMoxyq1nTjmMA8tDa",
            title: `${username} a activé les notifications !`,
            body: `${username} a activé les notifications !`,
            url: "/",
          }),
        },
      );
      await response.json();
    } catch (err) {
      console.error(err);
      showMessage({
        message: data.message || "Problème activation notification",
        type: "error",
        style: {
          borderRadius: 10,
          marginBottom: 15,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤙 Salut {finalName} !</Text>
      <Pressable onPress={() => dispatch(logout())} style={styles.logoutButton}>
        <Text style={styles.text}>Déconnexion</Text>
      </Pressable>
      {isNotifActive ? (
        <View style={styles.notif}>
          <Text style={styles.notifText}>Notifications activées</Text>
        </View>
      ) : (
        <Pressable
          onPress={async () => {
            try {
              await onActivatePush();
              dispatch(activateNotif(true));
              sendAlertNotification(finalName);
            } catch (err) {
              console.error("Erreur activation notifs :", err);
            }
          }}
          style={styles.logoutButton}
        >
          <Text style={styles.text}>🔔 Active les notifs !</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    flex: 1,
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    color: colors.white,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    opacity: 0.92,
    height: 120,
    width: 140,
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondaryLight,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  notif: {
    backgroundColor: colors.secondaryLight,
    justifyContent: "center",
    alignItems: "center",
    width: 140,
    height: 120,
    borderRadius: 16,
    padding: 12,
    opacity: 0.85,
    shadowColor: colors.secondaryLight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  notifText: {
    color: colors.white,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
