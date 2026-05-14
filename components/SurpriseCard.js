import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  TextInput,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSurprises,
  unlockSurprise,
  lockSurprise,
} from "../reducers/surprises";
import { useIsFocused } from "@react-navigation/native";
import { Lock, LockOpen } from "lucide-react-native";
import { colors } from "../screens/colors";
import { showMessage, hideMessage } from "react-native-flash-message";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function SurpriseCard({
  surprise,
  handleRiddleAnswer,
  sendNotification,
}) {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const [viewRiddle, setViewRiddle] = useState(false);
  const [viewHint, setViewHint] = useState(false);
  const [answerInput, setAnswerInput] = useState(null);
  const user = useSelector((state) => state.user);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: userTimeZone,
  };

  const date = new Date(surprise.revealAt);

  const unlockedSurpriseCard = () => {
    return (
      <View style={styles.surpriseCard}>
        <LockOpen size={40} color={colors.primaryLight} />
        <Text style={styles.title}>{surprise.title}</Text>
        <Text style={styles.description}>{surprise.description}</Text>
        <Text style={styles.description}>
          Aura lieu le {date.toLocaleDateString("fr-FR", dateOptions)} à{" "}
          {date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );
  };

  const riddleSurpriseCard = () => {
    if (!surprise.riddle || !surprise.hint || !surprise.answer) {
      return lockedSurpriseCard();
    }

    return (
      <View style={styles.surpriseCard}>
        <Lock
          size={40}
          color={colors.primaryLight}
          onPress={() => {
            (setViewRiddle(false), setViewHint(false));
          }}
        />
        {!viewRiddle && (
          <TouchableOpacity onPress={() => setViewRiddle(true)}>
            <Text style={styles.title}>Découvrir l'énigme</Text>
          </TouchableOpacity>
        )}

        {viewRiddle && (
          <>
            <Text style={styles.description}>{surprise.riddle}</Text>
            <TextInput
              style={styles.input}
              placeholder="Réponse"
              placeholderTextColor={colors.lightGray}
              KeyboardType="default"
              returnKeyType="done"
              value={answerInput}
              onChangeText={setAnswerInput}
              onSubmitEditing={() =>
                handleRiddleAnswer(surprise._id, answerInput)
              }
            ></TextInput>
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleRiddleAnswer(surprise._id, answerInput)}
            >
              <Text style={styles.text}>Valider</Text>
            </TouchableOpacity>
          </>
        )}
        {!viewHint && (
          <TouchableOpacity onPress={() => setViewHint(true)}>
            <Text style={styles.description}>Découvrir l'indice</Text>
          </TouchableOpacity>
        )}
        {viewHint && <Text style={styles.description}>{surprise.hint}</Text>}
      </View>
    );
  };

  const lockedSurpriseCard = () => {
    return (
      <View style={styles.surpriseCard}>
        <Lock size={40} color={colors.primaryLight} />
        <Text style={styles.title}>
          Cette surprise se débloquera en temps voulu !
        </Text>
      </View>
    );
  };

  const handleConfirmation = (surpriseId) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Débloquer la surprise ? On est sûr.e de la manip ?",
      );
      if (confirmed) {
        handleManualUnlock(surpriseId);
      } else {
        Alert.alert("Débloquer la surprise ?", "On est sûr.e de la manip ?", [
          {
            text: "Annuler",
            style: "cancel",
          },
          {
            text: "Confirmer",
            style: "destructive",
            onPress: async () => handleManualUnlock(surpriseId),
          },
        ]);
      }
    }
  };

  const handleManualUnlock = async (surpriseId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/unlockManually/${surpriseId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (data.result) {
        sendNotification(
          "🎁 Surprise débloquée !",
          data.unlockedSurprise.title,
        );
        dispatch(unlockSurprise(surpriseId));
        showMessage({
          message: data.message || "Surprise débloquée !",
          type: "success",
          backgroundColor: colors.background,
          color: colors.white,
          style: {
            borderRadius: 10,
            width: screenWidth,
          },
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleManualLock = async (surpriseId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/lockManually/${surpriseId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (data.result) {
        dispatch(lockSurprise(surpriseId));
        showMessage({
          message: data.message || "Surprise verrouillée !",
          type: "info",
          backgroundColor: colors.background,
          color: colors.white,
          style: {
            borderRadius: 10,
            width: screenWidth,
          },
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const guestSurpriseCard = () => {
    return (
      <View style={styles.surpriseCard}>
        {surprise.isUnlocked ? (
          <LockOpen
            size={40}
            color={colors.primaryLight}
            onPress={() => handleManualLock(surprise._id)}
          />
        ) : (
          <Lock size={40} color={colors.primaryLight} />
        )}
        <Text style={styles.title}>{surprise.title}</Text>
        <Text style={styles.description}>{surprise.description}</Text>
        <Text style={styles.description}>
          Aura lieu le {date.toLocaleDateString("fr-FR", dateOptions)} à{" "}
          {date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text style={styles.description}>
          Organisé par :{" "}
          {surprise.organizedBy
            ? surprise.organizedBy?.name[0].toUpperCase() +
              surprise.organizedBy?.name.slice(1)
            : "---"}
        </Text>
        <Text style={styles.description2}>
          {surprise.notes ? surprise.notes : "---"}
        </Text>
        {user.status === "guest+" && !surprise.isUnlocked && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleConfirmation(surprise._id)}
          >
            <Text style={styles.text}>Débloquer la surprise</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View key={surprise._id}>
      {user.status === "guest" || user.status === "guest+" ? (
        surprise.title === "Mais qui est cette personne ?" &&
        user.status !== "guest+" &&
        !surprise.isUnlocked ? (
          lockedSurpriseCard()
        ) : (
          guestSurpriseCard()
        )
      ) : (
        <>
          {surprise.isUnlocked
            ? unlockedSurpriseCard()
            : surprise.revealMode === "riddle"
              ? riddleSurpriseCard()
              : lockedSurpriseCard()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  surpriseCard: {
    borderWidth: 0,
    borderRadius: 20,
    padding: 24,
    width: screenWidth * 0.85,
    height: screenHeight * 0.65,
    marginTop: 20,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: colors.primary,
    opacity: 0.92,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
    borderTopWidth: 3,
    borderTopColor: colors.secondaryLight,
  },
  input: {
    borderColor: colors.secondaryLight,
    borderWidth: 2,
    borderRadius: 14,
    padding: 14,
    width: "85%",
    color: colors.white,
    fontSize: 16,
    fontWeight: "500",
    backgroundColor: colors.primaryLight,
    opacity: 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: colors.secondaryLight,
    padding: 14,
    borderRadius: 14,
    shadowColor: colors.secondaryLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 160,
    alignItems: "center",
  },
  text: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  title: {
    color: colors.white,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: 0.4,
  },
  description: {
    color: colors.secondaryLight,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  description2: {
    color: colors.secondaryLight,
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 20,
    opacity: 0.85,
  },
});
