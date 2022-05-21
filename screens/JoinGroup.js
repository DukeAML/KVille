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

  useEffect(() => {
    let mounted = true;
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        if (mounted) {
          setName(doc.data().name);
          console.log(doc.data().name);
        }
      });
    return () => (mounted = false);
  }, []);

  const onJoinGroup = (navigation) => {
    console.log(groupCode);
    const groupRef = firebase.firestore().collection("groups").doc(groupCode);

    //Max 12 people in a group
    groupRef
      .collection("members")
      .get()
      .then((collSnap) => {
        if (collSnap.size > 12) {
          console.log("Group is full");
          return;
        }
      });

    //checks to make sure entered group code exists
    groupRef.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        //updates current user's info
        firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid)
          .update({
            groupCode: groupCode,
            inGroup: true,
          });
        //adds current user to member list
        groupRef
          .collection("members")
          .doc(firebase.auth().currentUser.uid)
          .set({
            groupRole: "member",
            name: name,
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
        value={name}
        placeholder={name}
        onChangeText={(name) => setName(name)}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onJoinGroup(navigation);
          navigation.navigate("GroupNavigator");
        }}
      >
        <Text style={styles.buttonText}>Join Group</Text>
      </TouchableOpacity>
    </View>
  );
}
