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
  Animated,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSurprises,
  unlockSurprise,
  setSelectedSurprise,
} from "../reducers/surprises";
import { useIsFocused } from "@react-navigation/native";
import { Lock, LockOpen } from "lucide-react-native";
import { showMessage, hideMessage } from "react-native-flash-message";
import { colors } from "./colors";
import SurpriseCard from "../components/SurpriseCard";

const screenHeight = Dimensions.get("window").height;

export default function SurprisesScreen({ navigation }) {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const surprises = useSelector((state) => state.surprises.surprises);
  const selectedSurprise = useSelector(
    (state) => state.surprises.selectedSurprise,
  );
  const [isLoading, setIsLoading] = useState(false);

  const getSurprises = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/all`,
      );
      const data = await response.json();

      if (data.result) {
        dispatch(setSurprises(data.allSurprises));
      } else {
        dispatch(setSurprises([]));
      }
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isFocused && getSurprises();
    dispatch(setSelectedSurprise(null));
  }, [isFocused]);

  const handleRiddleAnswer = async (surpriseId, answer) => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/answer/${surpriseId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answer }),
        },
      );
      const data = await response.json();

      if (data.result) {
        dispatch(unlockSurprise(surpriseId));
        showMessage({
          message: data.message || "Bravo, bonne réponse !",
          type: "success",
          backgroundColor: colors.primary,
          color: colors.white,
          style: {
            borderRadius: 10,
            marginBottom: 15,
          },
        });
      } else {
        showMessage({
          message: data.message || "Eh non, mauvaise réponse !",
          type: "warning",
          style: {
            borderRadius: 10,
            marginBottom: 15,
          },
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const surpriseMiniCards = surprises
    ?.slice()
    .sort(
      (a, b) => new Date(a.revealAt).getTime() - new Date(b.revealAt).getTime(),
    )
    .map((surprise, index) => {
      return (
        <Pressable
          style={
            surprise.isUnlocked ? styles.unlockedMiniCards : styles.miniCards
          }
          key={surprise._id}
          surprise={surprise}
          onPress={() => dispatch(setSelectedSurprise(surprise))}
        >
          <Text style={styles.miniCardsText}>{index + 1}</Text>
          <View style={styles.iconContainer}>
            {surprise.isUnlocked ? (
              <LockOpen size={20} color={colors.white} />
            ) : (
              <Lock size={20} color={colors.white} />
            )}
          </View>
        </Pressable>
      );
    });

  const unlockedSurprisesCount = surprises?.filter(
    (surprise) => surprise.isUnlocked,
  ).length;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (selectedSurprise) {
      fadeAnim.setValue(0);
      translateY.setValue(100);

      Animated.parallel([
        Animated.spring(fadeAnim, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [selectedSurprise]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        <Text style={styles.title}>
          {unlockedSurprisesCount} / {surprises.length} surprises débloquées !
        </Text>

        {selectedSurprise ? (
          <Animated.View
            style={{ opacity: fadeAnim, transform: [{ translateY }] }}
          >
            <SurpriseCard
              key={selectedSurprise._id}
              surprise={selectedSurprise}
              handleRiddleAnswer={handleRiddleAnswer}
            />
            <Pressable
              style={styles.backBtn}
              onPress={() => dispatch(setSelectedSurprise(null))}
            >
              <Text style={styles.backBtnText}>← Retour</Text>
            </Pressable>
          </Animated.View>
        ) : (
          <View style={styles.miniCardsContainer}>{surpriseMiniCards}</View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  scrollView: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: colors.white,
    textAlign: "center",
    fontSize: 20,
    marginTop: 40,
  },
  miniCardsContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "space-evenly",
    width: "100%",
    marginTop: 20,
  },
  miniCards: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 15,
    padding: 10,
    width: 60,
    height: 60,
    backgroundColor: colors.primary,
  },
  unlockedMiniCards: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 15,
    padding: 10,
    width: 60,
    height: 60,
    backgroundColor: colors.primaryLight,
  },
  miniCardsText: {
    textAlign: "center",
    color: colors.white,
    fontSize: 15,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 5,
    marginBottom: 5,
  },
  backBtn: {
    marginBottom: 20,
    padding: 10,
  },
  backBtnText: {
    color: colors.white,
    fontWeight: "bold",
  },
});
