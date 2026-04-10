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
        style={{ position: "absolute", top: "12%", zIndex: 1 }}
        color={colors.secondary}
        size={30}
      />
      <Animated.View
        style={[styles.wheelContainer, { transform: [{ rotate: spin }] }]}
      >
        <WheelSvg guests={guests} size={300} />
      </Animated.View>

      <Pressable style={styles.button} onPress={() => spinWheel()}>
        <Text style={styles.buttonText}>Tourner la roue</Text>
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
