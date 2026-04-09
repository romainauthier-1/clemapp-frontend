import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Touchable,
} from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSurprises, unlockSurprise } from "../reducers/surprises";
import { colors } from "./colors";

const screenHeight = Dimensions.get("window").height;

export default function WelcomeScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🤙 Salut {user.name[0].toUpperCase() + user.name.slice(1)} !
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  title: {
    fontSize: 30,
    color: colors.primary,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
