import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../reducers/user";
import { colors } from "./colors";
import { Eye, EyeOff } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenHeight = Dimensions.get("window").height;

export default function LoginScreen({ navigation }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [focus, setFocus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const user = useSelector((state) => state.user);

  const dispatch = useDispatch();

  const validateInputs = () => {
    if (!name || !password) {
      setErrorMessage("Nom ou mot de passe invalide.");
      return false;
    }
    return true;
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const handleLogin = async () => {
    setErrorMessage("");
    if (!validateInputs()) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        },
      );

      const data = await response.json();
      if (data.result) {
        dispatch(
          login({
            name: data.foundUser.name,
            token: data.foundUser.token,
            status: data.foundUser.status,
            subscription: data.foundUser.subscription ? true : false,
          }),
        );
      } else {
        setErrorMessage(
          data.message || "Le nom ou le mot de passe est invalide.",
        );
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err.message);
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>👑 ClemApp 👑</Text>
        <Text style={styles.subtitle}>L'app du week-end !</Text>
      </View>
      {isLoading ? (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.contentHeader}>
            <Text style={styles.contentHeaderTitle}>Connecte toi</Text>
            <Text style={styles.contentHeaderSubtitle}>Pour tout savoir !</Text>
          </View>

          <View>
            {/*  sert à regrouper le formulaire */}
            <View>
              <Text style={styles.label}>Ton prénom</Text>

              <TextInput
                style={styles.input}
                placeholder="Alexandre"
                placeholderTextColor={colors.lightGray}
                value={name}
                onChangeText={setName}
                keyboardType="default"
                autoCapitalize="words"
                onFocus={() => setFocus("name")}
                onBlur={() => setFocus(null)}
              />
            </View>
            <View style={{ marginBottom: 24 }} />
            <View>
              <Text style={styles.label}>Mot de passe</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordText}
                  placeholder="************"
                  placeholderTextColor={colors.lightGray}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setFocus("password")}
                  onBlur={() => setFocus(null)}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable onPress={togglePasswordVisibility}>
                  {isPasswordVisible ? (
                    <EyeOff size={20} color={colors.lightGray} />
                  ) : (
                    <Eye size={20} color={colors.lightGray} />
                  )}
                </Pressable>
              </View>
            </View>
            {errorMessage !== "" && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
          </View>

          <View style={{ marginBottom: 24 }} />

          <Pressable style={styles.buttonPrimary} onPress={handleLogin}>
            <Text style={styles.buttonPrimaryText}>Se connecter</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
  },
  header: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
    color: colors.primary,
  },
  subtitle: {
    color: colors.primary,
    textAlign: "center",
  },
  content: {
    justifyContent: "space-between",
    backgroundColor: colors.primary,
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    width: "100%",
    padding: 40,
    minHeight: screenHeight * 0.6,
  },
  contentHeader: {
    marginBottom: 32,
  },
  contentHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.lightGray,
  },
  contentHeaderSubtitle: {
    color: colors.lightGray,
  },
  label: {
    color: colors.lightGray,
    marginBottom: 8,
    fontWeight: "bold",
  },
  input: {
    width: "100%",
    color: colors.white,
    backgroundColor: colors.primaryLight,
    borderColor: colors.lightGray,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  errorText: {
    color: colors.destructive,
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 10,
  },
  buttonPrimaryText: {
    color: colors.lightGray,
    fontWeight: "bold",
    textAlign: "center",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    color: colors.white,
    backgroundColor: colors.primaryLight,
    borderColor: colors.lightGray,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  passwordText: {
    color: colors.white,
    flex: 1,
  },
});
