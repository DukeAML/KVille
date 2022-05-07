// In App.js in a new project
import * as React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Dropdown,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import coachk from "./assets/coachk.png";
import zion from "./assets/zion.png";

const StartScreen = ({ navigation }) => {
  const [text, onChangeText] = React.useState(null);
  return (
    <View style={styles.background0}>
      <Image source={coachk} style={{ width: "100%", height: "70%" }} />
      <View style={{ flex: 0.2, backgroundColor: "#0000" }}></View>
      <TextInput
        style={styles.textInput}
        onChangeText={onChangeText}
        value={text}
        placeholder="Enter Group Code"
      />
      <View style={{ flex: 0.2, backgroundColor: "#0000" }}></View>
      <TouchableOpacity
        onPress={() => navigation.navigate("NewGroup")}
        style={styles.createGroupButton}
      >
        <Text style={styles.createGroupButtonText}>Create New Group</Text>
      </TouchableOpacity>
    </View>
  );
};
function NewGroupScreen({ navigation }) {
  return (
    <View style={styles.background1}>
      <Image source={zion} style={{ width: "100%", height: "100%" }} />

      <Dropdown label="Select Tent Type" style={styles.dropDown} data={data} />
      <TouchableOpacity
        onPress={() => navigation.navigate("Start")}
        style={styles.cancelButton}
      >
        <Text style={styles.createButtonText}>Cancel</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("GroupInfo")}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}
function GroupInfoScreen({ navigation }) {
  return <View style={styles.background2}></View>;
}
const Stack = createNativeStackNavigator();
function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Start"
          component={StartScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="NewGroup"
          component={NewGroupScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="GroupInfo"
          component={GroupInfoScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  background0: {
    flex: 1,
    backgroundColor: "#1f509a",
    alignItems: "center",
  },
  background1: {
    flex: 1,
    backgroundColor: "#1f509a",
    alignItems: "center",
    flexDirection: "row",
  },
  background2: {
    flex: 1,
    backgroundColor: "#C2C6D0",
    alignItems: "center",
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    width: "65%",
    textAlign: "center",
    borderRadius: 15,
  },
  container: {
    padding: 20,
    backgroundColor: "#0000",
  },
  createGroupButton: {
    backgroundColor: "black",
    padding: 15,
    borderRadius: 30,
  },
  createButton: {
    backgroundColor: "#1f509a",
    padding: 20,
    width: "50%",
    borderRadius: 30,
    position: "absolute",
    top: "80%",
    marginLeft: "52%",
    marginRight: "10%",
  },
  cancelButton: {
    backgroundColor: "black",
    padding: 20,
    width: "50%",
    borderRadius: 30,
    position: "absolute",
    top: "80%",
    marginLeft: "10%",
    marginRight: "52%",
  },
  enterButtonText: {
    fontSize: 15,
    color: "#716E6E",
    textAlign: "center",
  },
  createGroupButtonText: {
    fontSize: 15,
    color: "#fff",
    textAlign: "center",
  },
  createButtonText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  dropDown: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    width: "80%",
    textAlign: "center",
    borderRadius: 15,
    top: "30%",
  },
});
export default App;

// import { StatusBar } from 'expo-status-bar';
// import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
// });
