import { useState, useEffect, useRef } from "react";
import {
  Text,
  TextInput,
  View,
  Pressable,
  Platform,
  StyleSheet,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setUserList, activateNotif } from "../reducers/user";
import { showMessage, hideMessage } from "react-native-flash-message";
import { useIsFocused } from "@react-navigation/native";
import { colors } from "./colors";

export default function EventScreen() {
  const userList = useSelector((state) => state.user.userList);
  const isNotifActive = useSelector((state) => state.user.notifActivated);
  const [tempUserList, setTempUserList] = useState([]);
  const [tempTokenList, setTempTokenList] = useState([]);
  const [notifTitle, setNotifTitle] = useState(null);
  const [notifBody, setNotifBody] = useState(null);
  const isFocused = useIsFocused();
  const dispatch = useDispatch();

  const getAllUsers = async () => {
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
    }
  };

  useEffect(() => {
    getAllUsers();
    setTempUserList([]);
  }, []);

  const userListToDisplay = userList.map((user, index) => {
    return (
      <View style={styles.userContainer} key={index}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userSubscription}>
          {user.subscription ? "✅ Notifs activées" : "❌ Notifs désactivées"}
        </Text>
        {tempTokenList.includes(user.token) ? (
          <Pressable
            style={styles.addUserButton}
            onPress={() =>
              setTempTokenList(
                tempTokenList.filter((token) => token !== user.token),
              )
            }
          ></Pressable>
        ) : (
          <Pressable
            style={styles.addUserButton}
            onPress={() => setTempTokenList((prev) => [...prev, user.token])}
          ></Pressable>
        )}
      </View>
    );
  });

  const sendNotification = async () => {
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
            url: "/Surprises",
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
    }
  };

  const sendFilRougeNotification = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenList: tempTokenList,
            title: "FIL ROUGE",
            body: "Rejoins Clémence de suite !",
            url: "/Surprises",
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
    }
  };

  const canSend = tempTokenList.length > 0 && notifTitle && notifBody;
  const canSendFilRouge = tempTokenList.length > 0;

  return (
    <View style={styles.container}>
      <Text>EventScreen</Text>
      <View>
        <Pressable
          disabled={!canSendFilRouge}
          onPress={sendFilRougeNotification}
          style={{ opacity: canSendFilRouge ? 1 : 0.5 }}
        >
          <Text>Déclencher le FIL ROUGE</Text>
        </Pressable>
      </View>
      <View>
        <Text>Envoyer une notification personnalisée</Text>
        <View style={styles.listContainer}>{userListToDisplay}</View>
        <TextInput
          placeholder="Titre de la notif'"
          value={notifTitle}
          onChangeText={setNotifTitle}
          autoCapitalize="words"
          onFocus={() => setFocus("notifTitle")}
          onBlur={() => setFocus(null)}
        ></TextInput>
        <TextInput
          placeholder="Contenu de la notif'"
          value={notifBody}
          onChangeText={setNotifBody}
          autoCapitalize="words"
          onFocus={() => setFocus("notifBody")}
          onBlur={() => setFocus(null)}
        ></TextInput>
        <Pressable
          disabled={!canSend}
          onPress={sendNotification}
          style={{ opacity: canSend ? 1 : 0.5 }}
        >
          <Text>Envoyer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
