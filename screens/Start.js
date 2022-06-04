import React, { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  SafeAreaView,
  FlatList,
  Button,
} from "react-native";

import { useFonts, NovaCut_400Regular } from "@expo-google-fonts/nova-cut";
import AppLoading from "expo-app-loading";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

import { useDispatch } from "react-redux";
import { setGroupCode, setGroupName, setTentType } from "../redux/reducers/userSlice";
import { createGroupSchedule } from "../backend/CreateGroupSchedule";
import { createTestCases } from "../backend/firebaseAdd";
import coachk from "../assets/coachk.png";

require("firebase/firestore");

const window = Dimensions.get("window");

let GROUPS = new Array();

//const for list Items of Groups List
const Group = ({ groupName, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.listItem, styles.shadowProp]}>
    <Text style={[styles.listText, {textAlign: "left"}]}>Group Name: </Text>
    <Text style={styles.listText}>{groupName}</Text>
  </TouchableOpacity>
);

export default function Start({ navigation }) {
  let [fontsLoaded] = useFonts({
    NovaCut_400Regular,
  });

  const [loaded, setLoaded] = useState(false); // for checking if firebase is read before rendering
  console.log("Is Start loaded", loaded);

  const dispatch = useDispatch();
  //for rendering list items of Groups
  const renderGroup = ({ item }) => {
    return (
      <Group
        groupName={item.groupName}
        onPress={() => {
          firebase.firestore().collection("groups").doc(item.code).get().then((doc) => {
            console.log("tent type", doc.data().tentType);
            dispatch(setTentType(doc.data().tentType));
          })
          dispatch(setGroupCode(item.code));
          dispatch(setGroupName(item.groupName));
          navigation.navigate("GroupInfo", {
            //pass groupcode and group name parameters
            groupCode: item.code,
            groupName: item.groupName,
          });
        }}
      />
    );
  };

  //firebase reference to current user
  const userRef = firebase
    .firestore()
    .collection("users")
    .doc(firebase.auth().currentUser.uid);

  //useEffect(() => {
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      //Accesses Names of Members from firebase and adds them to the array
      if (mounted) {
      userRef
        .get()
        .then((doc) => {
          //setLoaded(false);
          let currGroup = doc.data().groupCode;
          console.log("Current user's groups", currGroup);

          if (currGroup.length !== 0) {
            currGroup.forEach((group) => {
              let current = {
                code: group.groupCode,
                groupName: group.groupName,
              };
              let codeExists;
              if (GROUPS.length === 0) codeExists = false;
              else {
                codeExists = GROUPS.some((e) => e.code === group.code);
              }

              if (mounted && !codeExists) {
                GROUPS.push(current);
              }
            });
          }

        // console.log ("current name:", currCode);
        // //add condition here:

        // let current = {
        //   code: currCode,
        //   name: 'stinkyalvintester'
        // };

        // let codeExists;
        // if (GROUPS.length === 0) codeExists = false;
        // else {
        //   codeExists = (GROUPS.some(e => e.code === currCode));
        // }
        // console.log(GROUPS);

        // if (mounted && !codeExists){
        //   GROUPS.push(current);
        // }
          return doc;
        })
        .then((doc) => {
          setLoaded(true);
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
      }
      
      return () => {
        mounted = false
        GROUPS = [];
        setLoaded(false);
      };
    }, [GROUPS])
  );

  if (!fontsLoaded || !loaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={styles.startContainer}>
        {/* <View style={styles.header}>
          <Text style={styles.banner}>Krzyzewskiville</Text>
        </View> */}
        {/* <Image source={coachk} style={styles.image} /> */}
        <SafeAreaView>
          <FlatList
            data={GROUPS}
            renderItem={renderGroup}
            keyExtractor={(item) => item.code}
          />
        </SafeAreaView>
        <View style={styles.textContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("JoinGroup")}
          >
            <Text style={styles.buttonText}>Join Group</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("CreateGroup")}
          >
            <Text style={styles.buttonText}>Create New Group</Text>
          </TouchableOpacity>
          <Button
            title="Create Group Schedule"
            onPress={() =>
              createGroupSchedule("BtycLIprkN3EmC9wmpaE", "blue").then((groupSchedule) => {
                console.log(groupSchedule);
              })
              
            }
          />
          {/* <Button
            title="Add test case"
            onPress={() => createTestCases()}
          /> */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  startContainer: {
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#C2C6D0",
    alignItems: "center",
    marginTop: "0%",
  },
  header: {
    left: "0%",
    width: "100%",
  },
  textContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
    justifyContent: "space-evenly",
    width: "100%",
  },
  banner: {
    color: "#fff",
    fontFamily: "NovaCut_400Regular",
    fontSize: 36,
    left: "0%",
  },
  image: {
    width: "100%",
    height: "80%",
    resizeMode: "cover",
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
  listItem: {
    backgroundColor: "#e5e5e5",
    padding: 8,
    marginVertical: 4,
    borderRadius: 7,
    width: window.width * .9,
    justifyContent: "flex-start",
    alignItems: "center",
  },
  listText: {
    fontSize: 16,
    //fontFamily: "sans-serif",
    fontWeight: "500",
    color: "black",
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});
