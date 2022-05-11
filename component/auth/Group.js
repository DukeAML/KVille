import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { ImageBackground } from "react-native-web";
import zion from "../../assets/zion.png";

const styles = StyleSheet.create({
  groupContainer: {
    flexDirection: "column",
    flex: 1,
    alignItems: "center",
  },
  backgroundImage: {
    flex: 1,
    alignItems: "center",
    flexDirection: "column",
    height: "100%",
    width: "100%",
    resizeMode: "contain"
  },
});

export class Group extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      tentType: "",
    };
  }
  render() {
    return (
      <View style={styles.groupContainer}>
        <ImageBackground source={zion} style={styles.backgroundImage}>
          <Text>Hello</Text>
        </ImageBackground>
      </View>
    );
  }
}

export default Group;
