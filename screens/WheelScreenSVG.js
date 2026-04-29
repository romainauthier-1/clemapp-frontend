import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  Pressable,
} from "react-native";
import { ArrowBigDown } from "lucide-react-native";
import { colors, wheelColors } from "./colors";
import WheelSvg from "../components/WheelSvg";
import { useSelector, useDispatch } from "react-redux";
import { setUserList } from "../reducers/user";
import { showMessage, hideMessage } from "react-native-flash-message";

export default function WheelScreen() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const guests1 = useSelector((state) => state.user.userList);
  const guests2 =
    guests1?.filter(
      (guest) => guest.name !== "maxime" && guest.name !== "alicia",
    ) || [];

  const surprises = useSelector((state) => state.surprises.surprises);
  const maxAlicia = surprises?.find(
    (s) => s._id === "69f132071b177b619c841871",
  );

  const guestsList = (maxAlicia?.isUnlocked ? guests1 : guests2) || [];

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

  useEffect(() => {
    if (guests1.length === 0) {
      getAllUsers();
    }
  }, []);

  const rotation = useRef(new Animated.Value(0)).current;

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const [winner, setWinner] = useState(null);

  const spinWheel = () => {
    setWinner(null);
    rotation.setValue(0);

    const wheelSpin = 5 + Math.random();

    Animated.timing(rotation, {
      toValue: wheelSpin,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      //   const progress = wheelSpin % 1;
      //   const tempIndex = Math.floor(progress * guests.length);
      //   const winnerIndex = guests.length - 1 - tempIndex;

      const progress = wheelSpin % 1;
      const angleFinal = progress * 360 + 90;
      const segmentSize = 360 / guestsList.length;
      const adjustedAngle = (360 - angleFinal + 360) % 360;
      const winnerIndex = Math.floor(adjustedAngle / segmentSize);

      setWinner(guestsList[winnerIndex]);
    });
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.pointer} /> */}

      <ArrowBigDown
        style={{ position: "absolute", top: "12%", zIndex: 1 }}
        color={colors.secondary}
        size={30}
      />
      <Animated.View
        style={[styles.wheelContainer, { transform: [{ rotate: spin }] }]}
      >
        <WheelSvg guests={guestsList} size={300} />
      </Animated.View>

      <Pressable style={styles.button} onPress={() => spinWheel()}>
        <Text style={styles.buttonText}>Tourner la roue</Text>
      </Pressable>
      {winner && (
        <Text style={styles.winnerText}>
          {" "}
          Bravo {winner.name[0].toUpperCase() + winner.name.slice(1)} ! 🎉
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingBottom: 15,
    backgroundColor: colors.backgroundLight,
  },
  wheelContainer: {
    height: 300,
    width: 300,
    borderRadius: 150,
    backgroundColor: colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: 40,
    padding: 15,
    backgroundColor: colors.secondary,
    borderRadius: 50,
    height: 100,
    width: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: 25,
    fontWeight: "bold",
  },
  winnerText: {
    fontSize: 50,
    fontWeight: "bold",
    color: colors.white,
    textAlign: "center",
    position: "absolute",
    top: "57%",
    zIndex: 2,
  },
});
