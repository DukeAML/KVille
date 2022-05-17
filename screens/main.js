import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { Text } from 'react-native';
import { IconButton, Colors } from "react-native-paper";

import StartScreen from "./Start";
import CreateGroupScreen from "./CreateGroup";
import GroupInfoScreen from "./GroupInfo";
import DrawerContent from "./DrawerContent";
import AvailabilityScreen from "./Availability";
import ScheduleScreen from "./Schedule";
import MonitorScreen from "./Monitor";
import InfoScreen from "./Info";
import SettingScreen from "./Settings";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export default function Main() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Start"
        screenOptions={{ headerShown: false }}
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
        <Stack.Screen name="GroupNavigator" component={GroupNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function GroupNavigator() {
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
        {/* <Drawer.Screen name="Availability" component={AvailabilityScreen} />
        <Drawer.Screen name="ScheduleScreen" component={ScheduleScreen} />
        <Drawer.Screen name="MonitorScreen" component={MonitorScreen} />
        <Drawer.Screen name="InfoScreen" component={InfoScreen} />
        <Drawer.Screen name="SettingScreen" component={SettingScreen} /> */}
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
