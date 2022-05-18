import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#1f509a",
    alignItems: "center",
    marginTop: "0%",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    width: "65%",
    textAlign: "center",
    borderRadius: 15,
    //height: "7%",
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
  },
});

export default function JoinGroup() {
  const [groupCode, setGroupCode] = useState("");

  const onJoinGroup = () => {};

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        onChangeText={(code) => setGroupCode(code)}
        value={groupCode}
        placeholder="Enter Group Code"
      />
      <TextInput
        style={styles.textInput}
        onChangeText={onChangeText}
        value={text}
        placeholder="Enter Group Code"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          navigation.navigate("GroupNavigator");
        }}
      >
        <Text style={styles.buttonText}>Create New Group</Text>
      </TouchableOpacity>
    </View>
  );
}
