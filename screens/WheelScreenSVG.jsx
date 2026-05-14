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
import { useIsFocused } from "@react-navigation/native";
import WheelSvg from "../components/WheelSvg";
import { useSelector, useDispatch } from "react-redux";
import { setUserList, changeLinusStore } from "../reducers/user";
import { showMessage, hideMessage } from "react-native-flash-message";

export default function WheelScreen() {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const user = useSelector((state) => state.user);
  const isClem = user.token === "nMfy7Fe8hQ5iE6LXY8RPJ_Okl9VKUaL0";
  const linus = useSelector((state) => state.user.linus);
  const [isLoading, setIsLoading] = useState(false);
  const [isLinus, setIsLinus] = useState(null);
  const originalGuestsList = useSelector((state) => state.user.userList);
  const guests1 =
    originalGuestsList?.filter((guest) => guest.status !== "guest-") || [];
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
  }, [isFocused]);

  const rotation = useRef(new Animated.Value(0)).current;

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const [winner, setWinner] = useState(null);
  const sendLinusNotification = async (newLinus, exLinus) => {
    setIsLoading(true);
    try {
      // Envoi notif new Linus
      const responseNew = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenList: newLinus.token,
            title: "🛎 NEW LINUS ",
            body: "Tu as été désigné.e ! À ton tour de prendre soin de Clémence ❤️",
            url: "/",
          }),
        },
      );
      const dataNew = await responseNew.json();

      // Envoi notif ancien Linus
      const responseEx = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/notifications/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tokenList: exLinus.token,
            title: "🔕 REPOS SOLDAT ",
            body: "Tu as passé le relais, tu n'es plus Linus ❤️",
            url: "/",
          }),
        },
      );
      const dataEx = await responseEx.json();

      if (dataNew.result && dataEx.result) {
        showMessage({
          message: "Passage de relais effectué !",
          type: "success",
          backgroundColor: colors.primary,
          color: colors.white,
          style: {
            borderRadius: 10,
            marginBottom: 15,
          },
        });
      }
    } catch (err) {
      console.error(err);
      showMessage({
        message: "Problème de connexion BDD",
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

  const changeLinus = async (token) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BACKEND_URL}/users/changeLinus`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        },
      );
      const data = await response.json();

      if (data.result) {
        dispatch(changeLinusStore(data.newLinus));
        sendLinusNotification(data.newLinus, data.exLinus);
      }
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

      if (linus) {
        if (
          guestsList[winnerIndex].name === "clémence" ||
          guestsList[winnerIndex].name === "clemlaqueen"
        ) {
          spinWheel(true);
        } else {
          changeLinus(guestsList[winnerIndex].token);
          setIsLinus(guestsList[winnerIndex]);
        }
        return;
      } else {
        setWinner(guestsList[winnerIndex]);
      }
    });
  };

  const [canAccessLinus, setCanAccessLinus] = useState(false);

  useEffect(() => {
    const linusSurprise = surprises?.find(
      (s) => s._id === "69f10cf39507471203ed993a",
    );
    setCanAccessLinus(linusSurprise?.isUnlocked);
  }, [isFocused]);

  const checkName = (user) => {
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

  return (
    <View style={styles.container}>
      {/* <View style={styles.pointer} /> */}

      <ArrowBigDown
        style={{ position: "absolute", top: "10%", zIndex: 1 }}
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
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => {
            spinWheel(false);
          }}
        >
          <Text style={styles.buttonText}>Tourner la roue</Text>
          <LoaderPinwheel color={colors.white} size={40} />
        </Pressable>
        {canAccessLinus && isClem && (
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => {
              spinWheel(true);
            }}
          >
            <Text style={styles.buttonText}>Choisir Linus</Text>
            <Martini color={colors.white} size={40} />
          </Pressable>
        )}
      </View>
      {winner && (
        <Text style={styles.winnerText}> Bravo {checkName(winner)} ! 🎉</Text>
      )}
      {isLinus && (
        <Text style={styles.winnerText}>
          {" "}
          {checkName(isLinus)} est Linus ! 🍹
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
    paddingBottom: 20,
    backgroundColor: colors.backgroundLight,
  },
  wheelContainer: {
    height: 300,
    width: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.92,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: colors.secondaryLight,
  },
  button: {
    marginTop: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    opacity: 0.7,
    borderRadius: 16,
    height: 160,
    width: 130,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderBottomWidth: 3,
    borderBottomColor: colors.secondaryLight,
  },
  buttonPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.96 }],
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  winnerText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.white,
    backgroundColor: colors.primary,
    opacity: 0.95,
    textAlign: "center",
    position: "absolute",
    top: "40%",
    height: 100,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderColor: colors.secondaryLight,
    borderWidth: 3,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 7,
  },
  btnContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    paddingHorizontal: 12,
    gap: 12,
  },
});
