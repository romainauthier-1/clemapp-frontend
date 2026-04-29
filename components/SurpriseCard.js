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
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSurprises,
  unlockSurprise,
  lockSurprise,
} from "../reducers/surprises";
import { Lock, LockOpen } from "lucide-react-native";
import { colors } from "../screens/colors";
import { showMessage, hideMessage } from "react-native-flash-message";

const screenHeight = Dimensions.get("window").height;
const screenWidth = Dimensions.get("window").width;

export default function SurpriseCard({ surprise, handleRiddleAnswer }) {
  const dispatch = useDispatch();
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

  //   const sendUnlockNotification = async () => {
  //   setIsLoading(true);

  //   try {
  //     const response = await fetch(
  //       `${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({
  //           tokenList: tempTokenList,
  //           title: "🎁 NOUVELLE SURPRISE DÉBLOQUÉE 🎁",
  //           body: "Il va se passer quelque chose...",
  //           url: "/",
  //         }),
  //       },
  //     );
  //     const data = await response.json();
  //     showMessage({
  //       message: data.message,
  //       type: "success",
  //       backgroundColor: colors.primary,
  //       color: colors.white,
  //       style: {
  //         borderRadius: 10,
  //         marginBottom: 15,
  //       },
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     showMessage({
  //       message: data.message || "Problème de connexion BDD",
  //       type: "error",
  //       style: {
  //         borderRadius: 10,
  //         marginBottom: 15,
  //       },
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const unlockTimeSurprise = async (surpriseId) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/unlock/${surpriseId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await response.json();

      if (data.result) {
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
        setAnswerInput(null);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    if (surprise.revealMode === "time" && !surprise.isUnlocked) {
      const now = new Date().getTime();
      const surpriseTime = new Date(surprise.revealAt).getTime();
      const timeUntilReveal = surpriseTime - now;

      if (timeUntilReveal < 0) {
        unlockTimeSurprise(surprise._id);
      } else {
        const timer = setTimeout(() => {
          unlockTimeSurprise(surprise._id);
        }, timeUntilReveal);
        return () => clearTimeout(timer);
      }
    }
  }, [surprise.revealAt, surprise.isUnlocked]);

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
          {surprise.organizedBy.name[0].toUpperCase() +
            surprise.organizedBy.name.slice(1)}
        </Text>
        <Text style={styles.description2}>
          {surprise.notes ? surprise.notes : "---"}
        </Text>
        {user.status === "guest+" && !surprise.isUnlocked && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleManualUnlock(surprise._id)}
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
        guestSurpriseCard()
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
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 15,
    padding: 10,
    width: screenWidth * 0.8,
    height: screenHeight * 0.7,
    marginTop: 20,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: colors.secondary,
    alignSelf: "center",
  },
  input: {
    borderColor: colors.lightGray,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    width: "80%",
    color: colors.muted,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 15,
  },
  text: {
    color: colors.white,
  },
  title: {
    color: colors.lightGray,
    textAlign: "center",
    fontSize: 18,
  },
  description: {
    color: colors.white,
    fontSize: 16,
    textAlign: "center",
  },
  description2: {
    color: colors.white,
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
});
