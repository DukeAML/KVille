import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Picker } from "@react-native-picker/picker";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useSelector, useDispatch } from "react-redux";
import {
  setGroupName,
  setUserName,
  setTentType,
} from "../redux/reducers/userSlice";
import background from "../assets/Cameron-Crazies.jpg";

export default function Settings({ route, navigation }) {
  const [isCreator, setCreator] = useState(false);
  const dispatch = useDispatch();

  //gets current user's group code from redux store
  //const groupCode = useSelector((state) => state.user.currentUser.groupCode);

  const { groupCode, groupName, userName, tentType } = route.params;
  const [currGroupName, setCurrGroupName] = useState(groupName);
  const [name, setName] = useState(userName);
  const [tent, setTent] = useState(tentType);

  console.log("route params", route.params);
  //gets current user's group role from redux store

  const userRef = firebase
    .firestore()
    .collection("users")
    .doc(firebase.auth().currentUser.uid);
  const groupRef = firebase.firestore().collection("groups").doc(groupCode);

  //sets states to updated params after each time param is changed
  useEffect(() => {
    let mounted = true;
    //console.log("route params after change", route.params);
    setCurrGroupName(groupName);
    setName(userName);
    setTent(tentType);
    return () => (mounted = false);
  }, [userName]);

  //useEffect(() => {
  useFocusEffect(
    useCallback(() => {
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
      return () => {
        mounted = false;
        setCurrGroupName(groupName);
        setName(userName);
        setTent(tentType);
      };
    }, [])
  );

  const onSave = () => {
    let groupIndex;
    let groupCodeArr;
    userRef
      .get()
      .then((userDoc) => {
        groupCodeArr = userDoc.data().groupCode;
        groupIndex = groupCodeArr.findIndex(
          (element) => (element.groupCode == groupCode)
        );
        console.log("group index", groupIndex);
        groupCodeArr[groupIndex] = {
          groupCode: groupCode,
          groupName: currGroupName,
        };
        return userDoc;
      })
      .then((doc) => {
        userRef.update({
          groupCode: groupCodeArr,
        });
      });

    groupRef.update({
      name: currGroupName,
      tentType: tent,
    });
    groupRef.collection("members").doc(firebase.auth().currentUser.uid).update({
      name: name,
    });
    dispatch(setUserName(name));
    dispatch(setTentType(tent));
    dispatch(setGroupName(currGroupName));
  };

  const leaveGroup = () => {
    userRef.update({
      groupCode: firebase.firestore.FieldValue.arrayRemove({
        groupCode: groupCode,
        groupName: currGroupName,
      }),
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
  };

  return (
    <View style={styles.settingsContainer}>
      {/* <ImageBackground source={background} style={styles.backgroundImage}> */}
      <View style={styles.header}>
        <Icon name="cog-outline" color={"#fff"} size={50} />
        <Text style={{ color: "#fff" }}>Settings</Text>
      </View>
      <Text style={{ color: "#fff" }}>Name:</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        placeholder={name}
        onChangeText={(name) => setName(name)}
      />
      {isCreator ? <Text style={{ color: "#fff" }}>Group Name:</Text> : null}
      {isCreator ? (
        <TextInput
          style={styles.textInput}
          value={currGroupName}
          placeholder={currGroupName}
          onChangeText={(groupName) => setCurrGroupName(groupName)}
        />
      ) : null}
      <Text style={{ color: "#fff" }}>Tent Type: </Text>
      <Picker
        selectedValue={tent}
        onValueChange={(itemValue, itemIndex) => {
          setTent(itemValue);
        }}
      >
        <Picker.Item label="" value="" />
        <Picker.Item label="Black" value="Black" />
        <Picker.Item label="Blue" value="Blue" />
        <Picker.Item label="White" value="White" />
        <Picker.Item label="Walk up line" value="Walk up line" />
      </Picker>
      <TouchableOpacity
        style={{
          backgroundColor: "#1F509A",
          padding: 15,
          position: "absolute",
          bottom: 50,
          width: "100%",
          alignItems: "center",
        }}
        onPress={onSave}
      >
        <Text style={{ color: "#fff" }}>Save</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          leaveGroup();
          navigation.navigate("Start");
        }}
      >
        {isCreator ? (
          <Text style={{ color: "#fff" }}>Delete Group</Text>
        ) : (
          <Text style={{ color: "#fff" }}>Leave Group</Text>
        )}
      </TouchableOpacity>
      {/* </ImageBackground> */}
    </View>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    //backgroundColor: "#1f509a",
    backgroundColor: "#C2C6D0",
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    resizeMode: "cover",
    //opacity: 0.4,
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
