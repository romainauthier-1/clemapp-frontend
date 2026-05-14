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
              color: colors.primary,
              fontWeight: "700",
              letterSpacing: 0.3,
              fontSize: 14,
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
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: colors.white,
    textAlign: "center",
    letterSpacing: 0.4,
  },
  section: {
    backgroundColor: colors.primary,
    opacity: 0.9,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    borderTopWidth: 3,
    borderTopColor: colors.secondaryLight,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: colors.white,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
    backgroundColor: colors.primaryLight,
    opacity: 0.85,
    borderRadius: 10,
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    color: colors.white,
  },
  userSubscription: {
    fontSize: 13,
    marginRight: 12,
    color: colors.secondaryLight,
    fontWeight: "500",
  },
  addUserButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 90,
    alignItems: "center",
    fontWeight: "700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonSelected: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 0,
  },
  buttonUnselected: {
    backgroundColor: colors.secondaryLight,
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  input: {
    backgroundColor: colors.primaryLight,
    opacity: 0.85,
    borderWidth: 1.5,
    borderColor: colors.secondaryLight,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
    color: colors.white,
    fontWeight: "500",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mainButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  filRougeButton: {
    backgroundColor: colors.destructive,
    borderBottomWidth: 3,
    borderBottomColor: "#8B0000",
  },
  sendButton: {
    backgroundColor: colors.secondaryLight,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondary,
  },
  buttonText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  listContainer: {
    marginBottom: 12,
  },
});
