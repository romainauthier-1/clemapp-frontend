import { useState, useEffect, useRef } from "react";
import {
  Text,
  TextInput,
  ScrollView,
  View,
  Pressable,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setUserList, activateNotif } from "../reducers/user";
import { showMessage, hideMessage } from "react-native-flash-message";
import { colors } from "./colors";

export default function EventScreen() {
  const originalGuestsList = useSelector((state) => state.user.userList);
  const guests1 = originalGuestsList?.toSorted((a, b) => a.name > b.name);
  const guests2 = guests1
    ?.filter((guest) => guest.name !== "maxime" && guest.name !== "alicia")
    .toSorted((a, b) => a.name > b.name);
  const isNotifActive = useSelector((state) => state.user.notifActivated);
  const [tempUserList, setTempUserList] = useState([]);
  const [tempTokenList, setTempTokenList] = useState([]);
  const [notifTitle, setNotifTitle] = useState(null);
  const [notifBody, setNotifBody] = useState(null);
  const tokenInRedux = useSelector((state) => state.user.token);
  const [isLoading, setIsLoading] = useState(false);
  const bodyRef = useRef(null);
  const dispatch = useDispatch();

  const getAllUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/all`,
      );
      const data = await response.json();
      dispatch(setUserList(data.allUsers));
      return data;
    } catch (err) {
      console.error(err);
      showMessage({
        message: "Problème de connexion BDD",
        type: "warning",
        style: {
          borderRadius: 10,
          marginBottom: 15,
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fullTokenList = guests1?.map((user) => user.token);

  useEffect(() => {
    getAllUsers();
    setTempUserList([]);
  }, []);

  const surprises = useSelector((state) => state.surprises.surprises);
  const maxAlicia = surprises?.find(
    (s) => s._id === "69f132071b177b619c841871",
  );

  const guestsList = maxAlicia?.isUnlocked ? guests1 : guests2;

  const userListToDisplay = guestsList?.map((user, index) => {
    const isSelected = tempTokenList.includes(user.token);
    if (tokenInRedux === user.token) {
      return;
    }

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

    return (
      <View style={styles.userContainer} key={index}>
        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>
            {user.name ? finalName : "Anonyme"}
          </Text>
          <Text style={styles.userSubscription}>
            {user.subscription ? "✅ Notifs activées" : "❌ Notifs désactivées"}
          </Text>
        </View>
        <Pressable
          style={[
            styles.addUserButton,
            isSelected ? styles.buttonSelected : styles.buttonUnselected,
          ]}
          onPress={() => {
            if (isSelected) {
              setTempTokenList(
                tempTokenList.filter((token) => token !== user.token),
              );
            } else {
              setTempTokenList((prev) => [...prev, user.token]);
            }
          }}
        >
          <Text
            style={{
              color: isSelected ? "#2E7D32" : "#666",
              fontWeight: "bold",
            }}
          >
            {isSelected ? "Retirer" : "Ajouter"}
          </Text>
        </Pressable>
      </View>
    );
  });

  const sendNotification = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenList: tempTokenList,
            title: notifTitle,
            body: notifBody,
            url: "/",
          }),
        },
      );
      const data = await response.json();
      showMessage({
        message: data.message,
        type: "success",
        backgroundColor: colors.primary,
        color: colors.white,
        style: {
          borderRadius: 10,
          marginBottom: 15,
        },
      });
    } catch (err) {
      console.error(err);
      showMessage({
        message: data.message || "Problème de connexion BDD",
        type: "error",
        style: {
          borderRadius: 10,
          marginBottom: 15,
        },
      });
    } finally {
      setNotifBody(null);
      setNotifTitle(null);
      setTempTokenList([]);
      setIsLoading(false);
    }
  };

  const sendFilRougeNotification = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenList: fullTokenList,
            title: "🚨 FIL ROUGE 🚨",
            body: "👯 Rejoins Clémence de suite !",
            url: "/",
          }),
        },
      );
      const data = await response.json();
      showMessage({
        message: data.message,
        type: "success",
        backgroundColor: colors.primary,
        color: colors.white,
        style: {
          borderRadius: 10,
          marginBottom: 15,
        },
      });
    } catch (err) {
      console.error(err);
      showMessage({
        message: data.message || "Problème de connexion BDD",
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

  const canSend = tempTokenList.length > 0 && notifTitle && notifBody;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerTitle}>Centre de Commande</Text>
      {isLoading ? (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Fil Rouge 🚨</Text>
            <Pressable
              onPress={sendFilRougeNotification}
              style={[styles.mainButton, styles.filRougeButton, { opacity: 1 }]}
            >
              <Text style={styles.buttonText}>Déclencher</Text>
            </Pressable>
          </View>

          <View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notif personnalisée</Text>
              <TextInput
                style={styles.input}
                placeholder="Titre de la notif'"
                placeholderTextColor={colors.lightGray}
                value={notifTitle}
                returnKeyType="next"
                onSubmitEditing={() => bodyRef.current?.focus()}
                onChangeText={setNotifTitle}
                autoCapitalize="sentences"
              ></TextInput>
              <TextInput
                style={styles.input}
                ref={bodyRef}
                placeholder="Contenu de la notif'"
                placeholderTextColor={colors.lightGray}
                onChangeText={setNotifBody}
                returnKeyType="done"
                onSubmitEditing={() => canSend && sendNotification()}
                autoCapitalize="sentences"
                multiline={true}
              ></TextInput>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Destinataires ({tempTokenList.length})
              </Text>
              <View style={styles.listContainer}>{userListToDisplay}</View>
              <Pressable
                disabled={!canSend}
                onPress={sendNotification}
                style={[
                  styles.mainButton,
                  styles.sendButton,
                  { opacity: canSend ? 1 : 0.5 },
                ]}
              >
                <Text style={styles.buttonText}>Envoyer</Text>
              </Pressable>
            </View>
            <View style={{ height: 50 }} />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: colors.primary,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.secondary,
    textAlign: "center",
  },
  // Style de la liste d'utilisateurs
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  userName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  userSubscription: {
    fontSize: 12,
    marginRight: 10,
  },
  // Boutons de sélection (Ajouter/Retirer)
  addUserButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  buttonSelected: {
    backgroundColor: "#E8F5E9", // Vert très clair
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  buttonUnselected: {
    backgroundColor: "#F0F0F0",
    borderWidth: 1,
    borderColor: "#CCC",
  },
  // Inputs
  input: {
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  // Boutons d'action principaux
  mainButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  filRougeButton: {
    backgroundColor: "#D32F2F", // Rouge vif
  },
  sendButton: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
