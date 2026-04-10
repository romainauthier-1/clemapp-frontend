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
} from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../reducers/user";
import { colors } from "./colors";

const screenHeight = Dimensions.get("window").height;

export default function LogOutScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🤙 Salut {user.name[0].toUpperCase() + user.name.slice(1)} !
      </Text>
      <Pressable onPress={() => dispatch(logout())} style={styles.logoutButton}>
        <Text style={styles.text}>Déconnexion</Text>
      </Pressable>
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
    width: 200,
    padding: 10,
    borderRadius: 50,
  },
  text: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
});
