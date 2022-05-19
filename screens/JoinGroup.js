import React, { useState, useEffect } from "react";
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
import { useGestureHandlerRef } from "@react-navigation/stack";

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

export default function JoinGroup({ navigation }) {
  const [groupCode, setGroupCode] = useState("");
  const [name, setName] = useState("");

  firebase
    .firestore()
    .collection("users")
    .doc(firebase.auth().currentUser.uid)
    .get()
    .then((doc) => {
      setName(doc.data().name);
      console.log(name, doc.data().name);
    });

  useEffect(() => {
    if (name != "") {
      setName(name);
    }
  }, [name]);

  const onJoinGroup = (navigation) => {
    console.log(groupCode);
    const groupRef = firebase.firestore().collection("groups").doc(groupCode);

    groupRef.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            groupCode: groupCode,
            inGroup: true,
          });
        groupRef.collection("members").doc(firebase.auth().currentUser.uid).set({
            groupRole: "member",
            //name: name
          });
        navigation.navigate("GroupNavigator");
      } else {
        console.log("No group exists");
        //maybe add snack bar for this
      }
    });
  };

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
        onChangeText={(name) => setName(name)}
        value={name}
        placeholder={name}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onJoinGroup(navigation);
          //navigation.navigate("GroupNavigator");
        }}
      >
        <Text style={styles.buttonText}>Join Group</Text>
      </TouchableOpacity>
    </View>
  );
}
