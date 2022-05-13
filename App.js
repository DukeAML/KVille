import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { IconButton, Colors } from "react-native-paper";

import React, { Component } from "react";
import AppLoading from "expo-app-loading";

import firebase from "firebase/compat/app";

//Hide this with environmental variables before publishing
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEFvAO5nl5XlW7WcGcDCrFGo4QEZFuWq0",
  authDomain: "duke-tenting-app-cc15b.firebaseapp.com",
  projectId: "duke-tenting-app-cc15b",
  storageBucket: "duke-tenting-app-cc15b.appspot.com",
  messagingSenderId: "391061238630",
  appId: "1:391061238630:web:40b3664d20c6a247dc8ea7",
  measurementId: "G-54X8RY8NHT",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

import LandingScreen from "./component/auth/Landing";
import RegisterScreen from "./component/auth/Register";
import LoginScreen from "./component/auth/Login";
import StartScreen from "./screens/Start";
import CreateGroupScreen from "./screens/CreateGroup";
import GroupInfoScreen from "./screens/GroupInfo";
import DrawerContent from "./screens/DrawerContent";
import AvailabilityScreen from "./screens/Availability";
import ScheduleScreen from "./screens/Schedule";
import MonitorScreen from "./screens/Monitor";
import InfoScreen from "./screens/Info";
import SettingScreen from "./screens/Settings";

const Stack = createNativeStackNavigator();

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
          loaded: true,
        });
      } else {
        this.setState({
          loggedIn: true,
          loaded: true,
        });
      }
    });
  }
  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return <AppLoading />;
    }
    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Landing">
            <Stack.Screen
              name="Landing"
              component={LandingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return (
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Start"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
          <Stack.Screen name="GroupNavigator" component={GroupNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;

const Drawer = createDrawerNavigator();

function GroupNavigator() {
  return (
    <NavigationContainer independent={true}>
      <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
        <Drawer.Screen
          name="GroupInfo"
          component={GroupInfoScreen}
          options={({navigation})=> ({
            title: "Overview",
            headerLeft: () => (
              <IconButton
                icon="menu"
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        {/* <Drawer.Screen name="Availability" component={AvailabilityScreen} />
        <Drawer.Screen name="ScheduleScreen" component={ScheduleScreen} />
        <Drawer.Screen name="MonitorScreen" component={MonitorScreen} />
        <Drawer.Screen name="InfoScreen" component={InfoScreen} />
        <Drawer.Screen name="SettingScreen" component={SettingScreen} /> */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}