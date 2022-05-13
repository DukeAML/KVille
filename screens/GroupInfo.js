import React, { Component } from "react";
import {
  Text,
  View,
  StyleSheet,
} from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: "20%",
    width: "100%",
    fontSize: 28,
    fontWeight: "bold"
  }
});

export class GroupInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style = {styles.header}>Black Tent</Text>
        </View>
      </View>
    );
  }
}

export default GroupInfo;
