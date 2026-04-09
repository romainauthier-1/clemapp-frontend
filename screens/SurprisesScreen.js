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
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSurprises, unlockSurprise } from "../reducers/surprises";
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
  const [isLoading, setIsLoading] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  const getSurprises = async () => {
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/surprises/all`,
      );
      const data = await response.json();

      if (data.result) {
        dispatch(setSurprises(data.allSurprises));
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    isFocused && getSurprises();
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
          },
        });
      } else {
        showMessage({
          message: data.message || "Eh non, mauvaise réponse !",
          type: "warning",
          style: {
            borderRadius: 10,
          },
        });
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const surprisesToDisplay = surprises
    ?.slice()
    .sort(
      (a, b) => new Date(a.revealAt).getTime() - new Date(b.revealAt).getTime(),
    )
    .map((surprise) => {
      return (
        <SurpriseCard
          key={surprise._id}
          surprise={surprise}
          handleRiddleAnswer={handleRiddleAnswer}
        />
      );
    });

  const unlockedSurprisesCount = surprises?.filter(
    (surprise) => surprise.isUnlocked,
  ).length;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollView}
      >
        <Text style={styles.title}>
          {unlockedSurprisesCount} / 30 surprises débloquées !
        </Text>
        {surprisesToDisplay}
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
  },
  scrollView: {
    display: "flex",
    alignItems: "center",
    marginBottom: 70,
  },
  title: {
    color: colors.primary,
    textAlign: "center",
    fontSize: 16,
    marginTop: 40,
  },
});
