import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import { useFonts, NovaCut_400Regular } from "@expo-google-fonts/nova-cut";
import AppLoading from "expo-app-loading";
import coachk from "../assets/coachk.png";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const styles = StyleSheet.create({
  startContainer: {
    flexDirection: "column",
    flex: 1,
    backgroundColor: "#1f509a",
    alignItems: "center",
    marginTop: "0%"
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
});

export default function Start({navigation}) {
  let [fontsLoaded] = useFonts({
    NovaCut_400Regular,
  });

  const [text, onChangeText] = React.useState("");

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={styles.startContainer}>
        {/* <View style={styles.header}>
          <Text style={styles.banner}>Krzyzewskiville</Text>
        </View> */}
        <Image source={coachk} style={styles.image} />
        <View style={styles.textContainer}>
          <TextInput
            style={styles.textInput}
            onChangeText={onChangeText}
            value={text}
            placeholder="Enter Group Code"
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("CreateGroup")}
          >
            <Text style={styles.buttonText}>Create New Group</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
