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
import { ArrowBigDown, Martini, LoaderPinwheel } from "lucide-react-native";
import { colors, wheelColors } from "./colors";
import WheelSvg from "../components/WheelSvg";
import { useSelector, useDispatch } from "react-redux";
import { setUserList } from "../reducers/user";
import { showMessage, hideMessage } from "react-native-flash-message";

export default function WheelScreen() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [selectingLinus, setSelectingLinus] = useState(false);
  const [isLinus, setIsLinus] = useState(null);
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

  const spinWheel = (linus = false) => {
    setWinner(null);
    setIsLinus(null);
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
      linus
        ? setIsLinus(guestsList[winnerIndex])
        : setWinner(guestsList[winnerIndex]);
    });
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.pointer} /> */}

      <ArrowBigDown
        style={{ position: "absolute", top: "9%", zIndex: 1 }}
        color={colors.secondary}
        size={30}
      />
      <Animated.View
        style={[styles.wheelContainer, { transform: [{ rotate: spin }] }]}
      >
        <WheelSvg guests={guestsList} size={300} />
      </Animated.View>
      <View style={styles.btnContainer}>
        <Pressable
          style={styles.button}
          onPress={() => {
            spinWheel(false);
          }}
        >
          <Text style={styles.buttonText}>Tourner la roue</Text>
          <LoaderPinwheel color={colors.white} size={40} />
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            spinWheel(true);
          }}
        >
          <Text style={styles.buttonText}>Choisir Linus</Text>
          <Martini color={colors.white} size={40} />
        </Pressable>
      </View>
      {winner && (
        <Text style={styles.winnerText}>
          {" "}
          Bravo {winner.name[0].toUpperCase() + winner.name.slice(1)} ! 🎉
        </Text>
      )}
      {isLinus && (
        <Text style={styles.winnerText}>
          {" "}
          {isLinus.name[0].toUpperCase() + isLinus.name.slice(1)} est Linus ! 🍹
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
    marginTop: 10,
    padding: 15,
    backgroundColor: colors.secondary,
    borderRadius: 50,
    height: 200,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
  },
  winnerText: {
    fontSize: 35,
    fontWeight: "bold",
    color: colors.white,
    backgroundColor: colors.primary,
    textAlign: "center",
    position: "absolute",
    top: "40%",
    height: 100,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 20,
    borderColor: colors.lightGray,
    borderWidth: 1,
    zIndex: 2,
  },
  btnContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
  },
});
