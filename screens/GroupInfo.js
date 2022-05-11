import "react-native-gesture-handler";
import React, { Component } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";

const Drawer = createDrawerNavigator();

const styles = StyleSheet.create({
  container: {},
});

export class GroupInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={{ backgroundColor: "#C2C6D0" }}>
        <Text>Group Name:</Text>
      </View>
    );
  }
}

export default GroupInfo;
