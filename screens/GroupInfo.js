import React, { useState } from "react";
import { Text, View, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#C2C6D0",
  },
  header: {
    height: "20%",
    width: "100%",
    fontSize: 28,
    fontWeight: "bold",
  },
});

export default function GroupInfo() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.header}>Black Tent</Text>
      </View>
    </View>
  );
}
