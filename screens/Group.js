import React, { Component } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ImageBackground
} from "react-native";
import zion from "../assets/zion.png";

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
    height: "75%",
    width: "80%",
    marginVertical: 50,
    //justifyContent: "space-between"
  },
  text: {
    color: "#fff",
    fontFamily: "Open Sans",
    fontSize: "22px",
    fontWeight: "700",
  },
  centerText: {
    color: "#fff",
    fontFamily: "Open Sans",
    fontSize: "36px",
    fontWeight: "700",
    textAlign: "center",
  },
  textInput: {
    height: "5%",
    textAlign: "center",
    backgroundColor: "#FFFAFA80",
    borderRadius: 15,
    placeholderTextColor: "#897F7F80",
  },
  btnContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: "36px",
    textAlign: "center",
  },
});

export class Group extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      tentType: "",
      groupCode: "",
    };
  }
  render() {
    return (
      <View style={styles.groupContainer}>
        <ImageBackground source={zion} style={styles.backgroundImage}>
          <View style={styles.textContainer}>
            <Text style={styles.text}>Group Name:</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Enter Group Name"
              onChangeText={(name) => this.setState({ name })}
            />

            <Text style={styles.centerText}>Group Code</Text>
            <View style= {{backgroundColor: "#FFFAFA90", height: "10%"}}>
              <Text style = {{textAlign: "center", fontSize: "48px", fontWeight: "bold"}}>FKD31F</Text>
            </View>
          </View>
          <View style={styles.btnContainer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => navigation.navigate("Start")}
            >
              <Text style={styles.btnTxt}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => navigation.navigate("GroupInfo")}
            >
              <Text style={styles.btnTxt}>Create</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

export default Group;
