import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React, { useState, useEffect } from "react";
import { Text } from "react-native";
import { IconButton } from "react-native-paper";

import StartScreen from "./Start";
import CreateGroupScreen from "./CreateGroup";
import JoinGroupScreen from "./JoinGroup";
import GroupInfoScreen from "./GroupInfo";
import DrawerContent from "./DrawerContent";
import AvailabilityScreen from "./Availability";
import ScheduleScreen from "./Schedule";
import MonitorScreen from "./Monitor";
import InfoScreen from "./Info";
import SettingScreen from "./Settings";

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

//import {clearData, fetchUser } from "../redux/actions/index";

import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser, reset } from "../redux/reducers/userSlice";

export default function Main() {
  //uncomment this to reset redux states
  //const dispatch = useDispatch();
  //dispatch(clearData());

  // const [groupCode, setGroupCode] = useState("");
  // const [groupStatus, setGroupStatus] = useState(false);
  // const [userName, setName] = useState("");
  // const [isCreator, setCreator] = useState(false);

  // const dispatch = useDispatch();

  // const userRef = firebase
  //   .firestore()
  //   .collection("users")
  //   .doc(firebase.auth().currentUser.uid);

  // useEffect(() => {
  //   let mounted = true;
  //   userRef.get().then((doc) => {
  //     if (mounted) {
  //       if (doc.data().inGroup) {
  //         dispatch(inGroup());
  //         setGroupStatus(doc.data().inGroup);
  //       }
  //       dispatch(
  //         setGroupInfo({ groupCode: doc.data().groupCode, userName: userName })
  //       );
  //       // inGroupStatus = useSelector((state) => state.user.inGroup);

  //       // console.log("Current user is in group: ", inGroupStatus);
  //       // setGroupCode(doc.data().groupCode);
  //       // setGroupStatus(doc.data().inGroup);
  //       // console.log("group code: ", groupCode);
  //       // console.log("group status: ", groupStatus);
  //     }
  //   });
  //   return () => (mounted = false);
  // }, []);
  // useEffect(() => {
  //   let mounted = true;
  //   firebase
  //     .firestore()
  //     .collection("groups")
  //     .doc(groupCode)
  //     .collection("members")
  //     .doc(firebase.auth().currentUser.uid)
  //     .get()
  //     .then((doc) => {
  //       if (mounted) {
  //         setName(doc.data().name);
  //         if (doc.data().groupRole === "Creator") {
  //           setCreator(true);
  //         }
  //       }
  //     });
  //   return () => (mounted = false);
  // }, []);

  // if (isCreator) {
  //   dispatch(setCreatorRole());
  // }
  const dispatch = useDispatch();
  //let inGroup;
  useEffect(() => {
    // clearData(dispatch);
    // fetchUser(dispatch);
    dispatch(reset());
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          dispatch(setCurrentUser(snapshot.data()));
        } else {
          console.log("does not exist");
        }
      });
    console.log("cleared data and fetched user");
    //inGroup = true;
    //inGroup = useSelector((state) => state.user.currentUser.inGroup);
  }, []);

  //const inGroup = useSelector((state) => state.user.currentUser.inGroup);

  //console.log("Current user is in group: ", inGroup);
  //const inGroup = false;
  const [inGroup, setGroupStatus] = useState(false);
  //functions like componentDidMount, sets inGroup to true if current user is in group
  useEffect(() => {
    let mounted = true;
    firebase
      .firestore()
      .collection("users")
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((doc) => {
        if (doc.data().inGroup && mounted) {
          console.log(doc.data().inGroup);
          setGroupStatus(true);
        }
      })
      .catch((error) => {
        console.log("Error getting Document:", error);
      });
    //cleanup function, makes sure state not updated when component is unmounted
    return () => (mounted = false);
  }, []);

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator
        initialRouteName= "Start"
        screenOptions={{ headerShown: false }}
        id = "Main"
      >
        <Stack.Screen
          name="Start"
          component={StartScreen}
          options={{
            headerShown: true,
            title: "Krzyzewskiville",
            headerStyle: {
              backgroundColor: "#1f509a",
              borderBottomWidth: 0,
              shadowColor: "transparent",
            },
            headerTitleStyle: {
              fontFamily: "NovaCut",
              color: "#fff",
              fontSize: 30,
              left: "0%",
            },
          }}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroupScreen}
          options={({ navigation }) => ({
            headerShown: true,
            headerStyle: {
              backgroundColor: "#1f509a",
              borderBottomWidth: 0,
              shadowColor: "transparent",
            },
            headerLeft: () => (
              <Text
                style={{ color: "#fff", marginLeft: 10 }}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Text>
            ),
          })}
        />
        <Stack.Screen
          name="JoinGroup"
          component={JoinGroupScreen}
          options={({ navigation }) => ({
            headerShown: true,
            title: "Join Group",
            headerLeft: () => (
              <Text
                style={{ color: "#000", marginLeft: 10 }}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Text>
            ),
          })}
        />
        <Stack.Screen name="GroupNavigator" component={GroupNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function GroupNavigator({navigation}) {
  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator
        initialRouteName="GroupInfo"
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen
          name="GroupInfo"
          component={GroupInfoScreen}
          options={({ navigation }) => ({
            title: "Black Tent",
            headerStyle: {
              backgroundColor: "#C2C6D0",
              borderBottomWidth: 0,
              shadowColor: "transparent",
            },
            headerTitleStyle: {
              right: "0%",
              fontSize: 28,
            },
            headerLeft: () => (
              <IconButton
                icon="menu"
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name="Availability"
          component={AvailabilityScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: "#C2C6D0",
              borderBottomWidth: 0,
              shadowColor: "transparent",
            },
            headerLeft: () => (
              <IconButton
                icon="menu"
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name="ScheduleScreen"
          component={ScheduleScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: "#C2C6D0",
              borderBottomWidth: 0,
              shadowColor: "transparent",
            },
            headerLeft: () => (
              <IconButton
                icon="menu"
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name="MonitorScreen"
          component={MonitorScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: "#C2C6D0",
              borderBottomWidth: 0,
              shadowColor: "transparent",
            },
            headerLeft: () => (
              <IconButton
                icon="menu"
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name="InfoScreen"
          component={InfoScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: "#C2C6D0",
              borderBottomWidth: 0,
              shadowColor: "transparent",
            },
            headerLeft: () => (
              <IconButton
                icon="menu"
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name="SettingScreen"
          component={SettingScreen}
          initialParams = {{parentNavigation: navigation}}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: "#C2C6D0",
              borderBottomWidth: 0,
              shadowColor: "transparent",
            },
            headerLeft: () => (
              <IconButton
                icon="menu"
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
