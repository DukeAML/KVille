import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";

import GroupInfoTab from './screens/GroupInfo';

const Drawer = createDrawerNavigator();


export default function DrawerContainer() {
  return (
    <NavigationContainer>
      <Drawer.Navigator>
        <Drawer.Screen name = "Group Information" component={GroupInfoTab} />
        
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
