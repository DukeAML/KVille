import React, { useState, useEffect, useCallback } from "react";
import { Text } from "react-native";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { Linking, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IconButton } from "react-native-paper";
import * as SplashScreen from 'expo-splash-screen';

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

import { useDispatch } from "react-redux";
import { setCurrentUser, reset } from "../redux/reducers/userSlice";

const Drawer = createDrawerNavigator();
const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

export default function Main() {
  //uncomment this to reset redux states
  //const dispatch = useDispatch();
  //dispatch(clearData());
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();

  const dispatch = useDispatch();

  //Navigation State persistence, saves user's location in app
  useEffect(() => {
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();

        if (initialUrl == null) {
          // Only restore state if there's no deep link and we're not on web
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString
            ? JSON.parse(savedStateString)
            : undefined;

          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };
    if (!isReady) {
      restoreState();
    }
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }

    prepare();
  }, [isReady]);

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
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onReady ={onLayoutRootView}
      onStateChange={(state) =>
        AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))
      }
    >
      <Drawer.Navigator
        initialRouteName='Start'
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen
          name='Start'
          component={StartScreen}
          options={{
            headerShown: false,
            swipeEnabled: false,
            // headerStyle: {
            //   backgroundColor: "#1f509a",
            //   borderBottomWidth: 0,
            //   shadowColor: "transparent",
            // },
            // headerTitleStyle: {
            //   fontFamily: "NovaCut",
            //   color: "#fff",
            //   fontSize: 30,
            //   left: "0%",
            // },
          }}
        />
        <Drawer.Screen
          name='CreateGroup'
          component={CreateGroupScreen}
          options={({ navigation }) => ({
            title: 'Create Group',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerTitleStyle: {
              color: 'black',
            },
            headerTitleAlign: 'center',
            presentation: 'modal',
            headerLeft: () => (
              <Text
                style={{ color: '#1F509A', marginLeft: 10, fontWeight: '600' }}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Text>
            ),
          })}
        />
        <Drawer.Screen
          name='JoinGroup'
          component={JoinGroupScreen}
          options={({ navigation }) => ({
            title: 'Join Group',
            headerStyle:{
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Text
                style={{ color: '#1F509A', marginLeft: 10, fontWeight: '600' }}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Text>
            ),
          })}
        />
        <Drawer.Screen
          name='GroupInfo'
          component={GroupInfoScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerTitleStyle: {
              right: '0%',
              fontSize: 28,
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='AvailabilityScreen'
          component={AvailabilityScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='ScheduleScreen'
          component={ScheduleScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='MonitorScreen'
          component={MonitorScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='InfoScreen'
          component={InfoScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='SettingScreen'
          component={SettingScreen}
          options={({ navigation }) => ({
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
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
