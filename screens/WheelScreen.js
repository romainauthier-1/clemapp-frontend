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
import { colors, wheelColors } from "./colors";

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

      // 1. On récupère la fraction du tour final (entre 0 et 1)
      const progress = wheelSpin % 1;
      const angleFinal = progress * 360;
      const segmentSize = 360 / guests.length;
      const adjustedAngle = (360 - angleFinal + segmentSize / 2) % 360;
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

  const guestsOnWheel = guests.map((name, index) => {
    const angle = 360 / guests.length;

    return (
      <View
        key={index}
        style={[
          styles.segment,
          { transform: [{ rotate: `${index * angle}deg` }] },
        ]}
      >
        <Text style={styles.segmentText}>{name}</Text>
      </View>
    );
  });

  return (
    <View style={styles.container}>
      <View style={styles.pointer} />
      <Animated.View
        style={[styles.wheelContainer, { transform: [{ rotate: spin }] }]}
      >
        {guestsOnWheel}
      </Animated.View>
      <Pressable style={styles.button} onPress={() => spinWheel()}>
        <Text>Tourner la roue</Text>
      </Pressable>
      {winner && <Text> Bravo {winner} ! 🎉</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    paddingBottom: 30,
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
  segment: {
    position: "absolute",
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 15,
  },
  segmentText: {
    fontWeight: "bold",
    color: "white",
    width: 100,
    textAlign: "right",
    transform: [{ rotate: "90deg" }],
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
});
