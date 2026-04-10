import { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform, StyleSheet } from "react-native";

export default function EventScreen() {
  return (
    <View style={styles.container}>
      <Text>EventScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
