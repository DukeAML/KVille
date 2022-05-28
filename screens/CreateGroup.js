import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ImageBackground,
} from "react-native";
import zion from "../assets/zion.png";
//import { Picker } from "@react-native-picker/picker";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { generateGroupCode } from "../backend/GroupCode";

require("firebase/firestore");

//length of the group code
const GROUP_CODE_LENGTH = 8;

const styles = StyleSheet.create({
  groupContainer: {
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
  },
  textContainer: {
    height: "70%",
    width: "80%",
    marginVertical: 50,
    //justifyContent: "space-between"
  },
  text: {
    color: "#fff",
    //fontFamily: "Open Sans",
    fontSize: 22,
    fontWeight: "700",
  },
  centerText: {
    color: "#fff",
    //fontFamily: "Open Sans",
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center",
  },
  textInput: {
    height: "5%",
    textAlign: "center",
    backgroundColor: "#FFFAFACC",
    borderRadius: 15,
    //placeholderTextColor: "#897F7FCC",
  },
  btnContainer: {
    alignItems: "center",
    width: "90%",
  },
  cancelBtn: {
    borderRadius: 30,
    backgroundColor: "#000",
    padding: 15,
    width: "45%",
  },
  createBtn: {
    borderRadius: 30,
    backgroundColor: "#1F509A",
    padding: 15,
    width: "45%",
  },
  btnTxt: {
    fontWeight: "700",
    color: "#fff",
    fontSize: 36,
    textAlign: "center",
  },
});

import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser } from "../redux/reducers/userSlice";
// import {
//   inGroup,
//   setGroupInfo,
//   setCreatorRole,
// } from "../redux/reducers/userSlice";

export default function CreateGroup({ navigation }) {
  const [group, setGroup] = useState({
    groupName: "",
    tentType: "",
    groupCode: generateGroupCode(GROUP_CODE_LENGTH),
    groupRole: "Creator",
    userName: "",
  });

  const dispatch = useDispatch();

  const userRef = firebase
    .firestore()
    .collection("users")
    .doc(firebase.auth().currentUser.uid);
  const groupRef = firebase
    .firestore()
    .collection("groups")
    .doc(group.groupCode);

  const userName = useSelector((state) => state.user.currentUser.name);

  //on first render sets name to user's registered name
  useEffect(() => {
    let mounted = true;
    if (mounted) {
      setGroup({ ...group, userName: userName });
    }
    return () => (mounted = false);
  }, []);

  //Create group function
  const onCreateGroup = () => {
    //creates/adds to groups collection, adds doc with generated group code and sets name and tent type
    groupRef.set({
      name: group.groupName,
      tentType: group.tentType,
    });
    //adds current user to collection of members in the group
    groupRef.collection("members").doc(firebase.auth().currentUser.uid).set({
      groupRole: group.groupRole,
      name: group.userName,
      inTent: false,
    });
    //updates current user's inGroup and groupCode states
    userRef.update({
      groupCode: group.groupCode,
      inGroup: true,
    });
    userRef.get().then((snapshot) => {
      if (snapshot.exists) {
        dispatch(setCurrentUser(snapshot.data()));
      } else {
        console.log("does not exist");
      }
      return snapshot;
    }).then((snapshot) => {
      navigation.navigate("GroupInfo");
    });

  };

  return (
    <View style={styles.groupContainer}>
      <ImageBackground source={zion} style={styles.backgroundImage}>
        <View style={styles.textContainer}>
          <Text style={styles.text}>Group Name:</Text>

          <TextInput
            style={styles.textInput}
            placeholder="Enter Group Name"
            onChangeText={(groupName) =>
              setGroup({ ...group, groupName: groupName })
            }
          />
          <TextInput
            style={styles.textInput}
            value={group.userName}
            placeholder={group.userName}
            onChangeText={(userName) =>
              setGroup({ ...group, userName: userName })
            }
          />

          <Text style={styles.centerText}>Group Code</Text>
          <View
            style={{
              backgroundColor: "#FFFAFA90",
              //height: "15%",
              alignContent: "center",
              flexDirection: "row",
              flex: 0.2,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontSize: 30,
                fontWeight: "bold",
                flex: 1,
              }}
            >
              {group.groupCode}
            </Text>
          </View>
        </View>
        <View style={styles.btnContainer}>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              onCreateGroup();
              //navigation.navigate("GroupNavigator");
              console.log(group.groupCode);
              console.log(group.groupRole);
            }}
          >
            <Text style={styles.btnTxt}>Create</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
