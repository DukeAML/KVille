import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from "react-native";
import background from "../assets/Cameron-Crazies.jpg";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useSelector, useDispatch } from "react-redux";
import { notInGroup, setGroupInfo } from "../redux/reducers/userSlice";

const styles = StyleSheet.create({
  settingsContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    backgroundColor: "#1f509a",
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    resizeMode: "cover",
    opacity: 0.4,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
  },
  button: {
    backgroundColor: "#1F509A",
    padding: 15,
    position: "absolute",
    bottom: 0,
    width: "100%",
    alignItems: "center",
  },
});

export default function Settings() {
  const dispatch = useDispatch();

  const groupCode = useSelector((state) => state.user.groupInfo.groupCode);
  console.log("Current group code: ", groupCode);

  const userRef = firebase
    .firestore()
    .collection("users")
    .doc(firebase.auth().currentUser.uid);
  const groupRef = firebase
    .firestore()
    .collection("groups")
    .doc(groupCode);

  const leaveGroup = () => {
    userRef.update({
      groupCode: "",
      inGroup: false,
    });
    groupRef
      .collection("members")
      .doc(firebase.auth().currentUser.uid)
      .delete()
      .then(() => {
        console.log("Document successfully deleted!");
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });

    dispatch(notInGroup());
    dispatch(setGroupInfo({groupCode: ""}));
  };

  return (
    <View style={styles.settingsContainer}>
      <ImageBackground source={background} style={styles.backgroundImage}>
        <View style={styles.header}>
          <Icon name="cog-outline" color={"#fff"} size={50} />
          <Text style={{ color: "#fff" }}>Settings</Text>
        </View>
        <Text style={{ color: "#fff" }}>Name:</Text>
        <TextInput style={styles.textInput} />
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            leaveGroup();
          }}
        >
          <Text style={{ color: "#fff" }}>Leave Group</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}
