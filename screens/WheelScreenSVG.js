import React, { useRef, useState } from "react";
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

export default function WheelScreen() {
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
      const segmentSize = 360 / guests.length;
      const adjustedAngle = (360 - angleFinal + 360) % 360;
      const winnerIndex = Math.floor(adjustedAngle / segmentSize);
      console.log("wheelSpin: ", wheelSpin);
      console.log("progress: ", progress);
      console.log("angleFinal: ", angleFinal);
      console.log("segmentSize: ", segmentSize);
      console.log("adjustedAngle: ", adjustedAngle);
      console.log("WinnerIndex: ", winnerIndex);

      setWinner(guests[winnerIndex]);
    });
  };

  const guests = [
    "Clémence",
    "Kévin <3",
    "Manon",
    "Baptiste",
    "Romain",
    "Kévin",
    "Élise",
    "Tim",
    "Valentin",
    "Johanna",
    "Julien",
    "Cédric",
    "Loriana",
  ];

  return (
    <View style={styles.container}>
      {/* <View style={styles.pointer} /> */}

      <ArrowBigDown
        style={{ position: "absolute", top: "14%", zIndex: 1 }}
        color={colors.primary}
        size={30}
      />
      <Animated.View
        style={[styles.wheelContainer, { transform: [{ rotate: spin }] }]}
      >
        <WheelSvg guests={guests} size={300} />
      </Animated.View>

      <Pressable style={styles.button} onPress={() => spinWheel()}>
        <Text>Tourner la roue</Text>
      </Pressable>
      {winner && <Text style={styles.winnerText}> Bravo {winner} ! 🎉</Text>}
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
    backgroundColor: colors.primaryLight,
  },
  wheelContainer: {
    height: 300,
    width: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    marginTop: 40,
    padding: 15,
    backgroundColor: colors.background,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderTopWidth: 30,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.backgroundLight, // La couleur de la flèche
    position: "absolute",
    top: "7%",
    zIndex: 1,
  },
  winnerText: {
    fontSize: 30,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    position: "absolute",
    top: "60%",
    zIndex: 2,
  },
});
