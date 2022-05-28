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
// import { notInGroup, setGroupInfo } from "../redux/reducers/userSlice";

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

export default function Settings({navigation}) {
  const [isCreator, setCreator] = useState(false);
  //const dispatch = useDispatch();

  //gets current user's group code from redux store
  const groupCode = useSelector((state) => state.user.currentUser.groupCode);
  console.log("Current group code: ", groupCode);
  //gets current user's group role from redux store

  const userRef = firebase
    .firestore()
    .collection("users")
    .doc(firebase.auth().currentUser.uid);
  const groupRef = firebase.firestore().collection("groups").doc(groupCode);

  useEffect(() => {
    let mounted = true;
    groupRef
      .collection("members")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          if (mounted) {
            if (snapshot.data().groupRole === "Creator") {
              setCreator(true);
            }
          }
        } else {
          console.log("does not exist");
        }
      });
    console.log("fetched isCreator from firebase");
    return () => (mounted = false);
  }, []);

  const leaveGroup = () => {
    userRef.update({
      groupCode: "",
      inGroup: false,
    });
    if (isCreator) {
      groupRef
        .delete()
        .then(() => {
          console.log("Group successfully deleted!");
        })
        .catch((error) => {
          console.error("Error removing group: ", error);
        });
    } else {
      groupRef
        .collection("members")
        .doc(firebase.auth().currentUser.uid)
        .delete()
        .then(() => {
          console.log("Current user successfully removed from group!");
        })
        .catch((error) => {
          console.error("Error removing user: ", error);
        });
    }

    // dispatch(notInGroup());
    // dispatch(setGroupInfo({ groupCode: "", userName: "" }));
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
            navigation.getParent("Main").navigate("Start");
          }}
        >
          {isCreator ? (
            <Text style={{ color: "#fff" }}>Delete Group</Text>
          ) : (
            <Text style={{ color: "#fff" }}>Leave Group</Text>
          )}
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
}
