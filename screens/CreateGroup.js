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
import { Picker } from "@react-native-picker/picker";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { generateGroupCode } from "../backend/GroupCode";
import { useStateValue } from "./State";
import {useSelector, useDispatch} from 'react-redux';
import {inGroup} from "../redux/actions/index"

require("firebase/firestore");

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

// function useForceUpdate() {
//   const [value, setValue] = useState(0); // integer state
//   return () => setValue((value) => value + 1); // update the state to force render
// }

export default function CreateGroup(props) {
  const [group, setGroup] = useState({
    name: "",
    tentType: "",
    groupCode: generateGroupCode(GROUP_CODE_LENGTH),
    groupRole: "",
  });

  const inGroup = useSelector(state => state.inGroup);
  const dispatch = useDispatch();

  // const [{ inGroup }, dispatch] = useStateValue();

  useEffect(() => {
    if ((group.groupRole = "Creator")) {
      setGroup({ ...group, groupRole: "Creator" });
    }
  }, [group.groupRole]);
  // const [name, setName] = useState("");
  // const [tentType, setTentType] = useState("");
  // const [groupCode, setGroupCode] = useState(
  //   generateGroupCode(GROUP_CODE_LENGTH)
  // );
  // const [groupRole, setGroupRole] = useState("Creator");

  //used to force update this function component
  // const [, updateState] = React.useState(0);
  // const forceUpdate = React.useCallback(() => updateState({}), []);
  // const [value, setValue] = useState(0);
  //Create group function
  const onCreateGroup = () => {
    // setGroupRole({
    //   ...groupRole,
    //   groupRole: "Creator",
    // });
    // setGroup({
    //   ...group,
    //   groupRole: "Creator",
    // });
    // props.parentCallback(true);

    //creates/adds to groups collection, adds doc with generated group code and sets name and tent type
    firebase.firestore().collection("groups").doc(group.groupCode).set({
      name: group.name,
      tentType: group.tentType,
    });
    //adds current user to collection of members in the group
    firebase
      .firestore()
      .collection("groups")
      .doc(group.groupCode)
      .collection("members")
      .doc(firebase.auth().currentUser.uid)
      .set({
        groupRole: group.groupRole,
      });
    //updates current user's inGroup and groupCode states
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .update({
        groupCode: group.groupCode,
        inGroup: true,
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
            onChangeText={(name) => setGroup({ ...group, name: name })}
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
          {/* <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnTxt}>Cancel</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => {
              dispatch(inGroup());
              setGroup({
                ...group,
                groupRole: "Creator",
              });
              // dispatch({
              //   type: "changeGroupStatus",
              //   newGroupState: true,
              // });
              onCreateGroup();
              console.log(group.groupCode);
              console.log(group.groupRole);
              //forceUpdate();
            }}
          >
            <Text style={styles.btnTxt}>Create</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}
