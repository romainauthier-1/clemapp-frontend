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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>
        🤙 Salut {user.name[0].toUpperCase() + user.name.slice(1)} !
      </Text>
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
            } catch (err) {
              console.error("Erreur activation notifs :", err);
            }
          }}
          style={styles.logoutButton}
        >
          <Text style={styles.text}>🔔 Active les notifs !</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  title: {
    fontSize: 30,
    color: colors.primary,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: colors.secondary,
    height: 100,
    width: 210,
    padding: 10,
    borderRadius: 50,
  },
  text: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  notif: {
    backgroundColor: colors.secondaryLight,
    justifyContent: "center",
    alignItems: "center",
    width: 210,
    height: 100,
    borderRadius: 50,
    padding: 10,
    opacity: 0.5,
  },
  notifText: {
    color: colors.white,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "bold",
  },
});
