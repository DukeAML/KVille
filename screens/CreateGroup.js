import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ImageBackground,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { generateGroupCode } from "../backend/GroupCode";
import zion from "../assets/zion.png";
import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentUser,
  setGroupCode,
  setGroupName,
  setUserName,
  setTentType,
} from "../redux/reducers/userSlice";

//length of the group code
const GROUP_CODE_LENGTH = 8;

let availability = new Array(336);
availability.fill(true);


export default function CreateGroup({ navigation }) {
  const [group, setGroup] = useState({
    groupName: "",
    tentType: "",
    groupCode: "",
    userName: "",
    tentType: "",
  });

  const groupRole = "Creator";

  const dispatch = useDispatch();

  const userRef = firebase
    .firestore()
    .collection("users")
    .doc(firebase.auth().currentUser.uid);
  let groupRef;

  const userName = useSelector((state) => state.user.currentUser.name);

  //on first render sets name to user's registered name
  //useEffect(() => {
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (mounted) {
        //setGroup({ ...group, userName: userName });
        setGroup({
          ...group,
          groupCode: generateGroupCode(GROUP_CODE_LENGTH),
          userName: userName,
        });
      }
      return () => {
        setGroup({ ...group, groupName: "" });
        mounted = false;
      };
    }, [])
  );

  //Create group function
  const onCreateGroup = () => {
    groupRef = firebase.firestore().collection("groups").doc(group.groupCode);
    //creates/adds to groups collection, adds doc with generated group code and sets name and tent type
    groupRef.set({
      name: group.groupName,
      tentType: group.tentType,
      groupSchedule: [],
    });
    //adds current user to collection of members in the group
    groupRef.collection("members").doc(firebase.auth().currentUser.uid).set({
      groupRole: groupRole,
      name: group.userName,
      inTent: false,
      availability: availability,
    });
    //updates current user's inGroup and groupCode states
    userRef.update({
      groupCode: firebase.firestore.FieldValue.arrayUnion({
        groupCode: group.groupCode,
        groupName: group.groupName,
      }),
    });
    dispatch(setGroupCode(group.groupCode));
    dispatch(setGroupName(group.groupName));
    dispatch(setUserName(group.userName));
    dispatch(setTentType(group.tentType));
    userRef
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          dispatch(setCurrentUser(snapshot.data()));
        } else {
          console.log("does not exist");
        }
        return snapshot;
      })
      .then((snapshot) => {
        navigation.navigate("GroupInfo", {
          groupCode: group.groupCode,
          groupName: group.groupName,
        });
      });
  };

  return (
    <View style={styles.groupContainer}>

      <View style={styles.topBanner}>
        <TouchableOpacity
          onPress={() => {
            onCreateGroup();
            //navigation.navigate("GroupNavigator");
            console.log(group.groupCode);
            console.log(groupRole);
          }} 
        >
          <View>
            <Text
              style={[
                styles.groupText,
                {
                  fontSize: 24,
                  fontWeight: '700',
                  color: "#1F509A",
                  width: "100%"
                  //borderWidth: 2
                }
              ]}
            >
              Create
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{width: "90%"}}>
        <Text style={styles.headerText}>Group Name</Text>
      </View>
      <TextInput
            style={styles.textInput}
            autoFocus = {true}
            placeholder="Enter Group Name"
            value={group.groupName}
            onChangeText={(groupName) =>
              setGroup({ ...group, groupName: groupName })
            }
      />

      <Text style={[styles.headerText, {marginTop:20}]}>Group Code</Text>
      <View
        style={[styles.textInput, {
          backgroundColor: "#ededed",
          height: 50,
          width: "90%",
          alignItems: "center",
          flexDirection: "row"
          //flex: 0.2
        }]}
      >
        <Text
          style={{
            textAlign: "center",
            fontSize: 30,
            fontWeight: "bold",
            flex: 1
          }}
        >
          {group.groupCode}
        </Text>
      </View>

      <Text style={[styles.headerText, {marginTop:20}]}>Tent Type</Text>
      <Picker
        selectedValue={group.tentType}
        onValueChange={(itemValue, itemIndex) => {
          setGroup({ ...group, tentType: itemValue });
        }}
        style = {{width: "90%", height: 30}}
      >
        <Picker.Item label="" value="" />
        <Picker.Item label="Black" value="Black" />
        <Picker.Item label="Blue" value="Blue" />
        <Picker.Item label="White" value="White" />
        <Picker.Item label="Walk up line" value="Walk up line" />
      </Picker>

      <Text style={[styles.headerText, {marginTop:20}]}>Username</Text>
      
      <TextInput
            style={[styles.textInput, {borderWidth:2, borderColor: "#8e8e8e"}]}
            value={group.userName}
            placeholder={group.userName}
            onChangeText={(userName) =>
              setGroup({ ...group, userName: userName })
            }
        />
    </View>
  );
}

const styles = StyleSheet.create({
  groupContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    backgroundColor: "#C2C6D0"
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    resizeMode: "cover"
  },
  topBanner: { //for the top container holding "create" button
    alignItems: "center",
    justifyContent: "flex-end",
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 20,
    width: "90%"
    //borderWidth: 2
  },
  headerText: { //text for 'headers of each input'
    textAlign: "left",
    width: "90%",
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "700"
    //color: "#656565"
  },
  textContainer: {
    height: "70%",
    width: "80%",
    marginVertical: 50
    //justifyContent: "space-between"
  },
  text: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700"
  },
  centerText: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "700",
    textAlign: "center"
  },
  textInput: {
    //backgroundColor: "#FFFFFF",
    padding: 10,
    width: "90%",
    fontSize: 20,
    fontWeight: "400",
    textAlign: "left",
    borderRadius: 15,
    //borderColor: "",
    //borderWidth: 2
    //height: "7%",
  },
  btnContainer: {
    alignItems: "center",
    width: "90%"
  },
  cancelBtn: {
    borderRadius: 30,
    backgroundColor: "#000",
    padding: 15,
    width: "45%"
  },
  createBtn: {
    borderRadius: 30,
    backgroundColor: "#1F509A",
    padding: 15,
    width: "45%"
  },
  btnTxt: {
    fontWeight: "700",
    color: "#fff",
    fontSize: 36,
    textAlign: "center"
  }
});