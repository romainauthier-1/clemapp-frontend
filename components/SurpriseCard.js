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

const screenHeight = Dimensions.get("window").height;

export default function SurpriseCard({ surprise, handleRiddleAnswer }) {
  const dispatch = useDispatch();
  const [viewRiddle, setViewRiddle] = useState(false);
  const [viewHint, setViewHint] = useState(false);
  const [answerInput, setAnswerInput] = useState(null);
  const user = useSelector((state) => state.user);

  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const date = new Date(surprise.revealAt);

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
        alert(data.message || "Surprise débloquée !");
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
        <LockOpen size={40} color={colors.primary} />
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
          color={colors.muted}
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
              type="text"
              value={answerInput}
              onChangeText={setAnswerInput}
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
        <Lock size={40} color={colors.muted} />
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
        alert(data.message || "Surprise débloquée !");
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
        alert(data.message || "Surprise verrouilée !");
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
            color={colors.primary}
            onPress={() => handleManualLock(surprise._id)}
          />
        ) : (
          <Lock size={40} color={colors.primary} />
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
          {surprise.notes !== ""
            ? surprise.notes
            : "Pas de notes pour cette surprise"}
        </Text>
        {user.status === "guest+" &&
          surprise.revealMode === "manual" &&
          !surprise.isUnlocked && (
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
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: colors.primaryLight,
  },
  surpriseCard: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 15,
    padding: 10,
    width: "90%",
    height: screenHeight * 0.3,
    marginTop: 20,
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    backgroundColor: colors.backgroundLight,
  },
  input: {
    borderColor: colors.lightGray,
    borderWidth: 1,
    borderRadius: 15,
    padding: 10,
    width: "80%",
  },
  button: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 15,
  },
  text: {
    color: colors.white,
  },
  title: {
    color: colors.secondary,
    textAlign: "center",
    fontSize: 18,
  },
  description: {
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
  },
});
