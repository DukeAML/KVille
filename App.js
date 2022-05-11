import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
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
import StartScreen from "./component/auth/Start";
import GroupScreen from "./component/auth/Group";

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
          </Stack.Navigator>
        </NavigationContainer>
      );
    }
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Start">
          <Stack.Screen
            name="Start"
            component={StartScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Group"
            component={GroupScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;

// const StartScreen = ({ navigation }) => {
//   const [text, onChangeText] = React.useState(null);
//   return (
//     <View style={styles.background0}>
//       <Image source={coachk} style={{ width: "100%", height: "70%" }} />
//       <View style={{ flex: 0.2, backgroundColor: "#0000" }}></View>
//       <TextInput
//         style={styles.textInput}
//         onChangeText={onChangeText}
//         value={text}
//         placeholder="Enter Group Code"
//       />
//       <View style={{ flex: 0.2, backgroundColor: "#0000" }}></View>
//       <TouchableOpacity
//         onPress={() => navigation.navigate("NewGroup")}
//         style={styles.createGroupButton}
//       >
//         <Text style={styles.createGroupButtonText}>Create New Group</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };
// function NewGroupScreen({ navigation }) {
//   return (
//     <View style={styles.background1}>
//       <Image source={zion} style={{ width: "100%", height: "100%" }} />

//       <Dropdown label="Select Tent Type" style={styles.dropDown} data={data} />
//       <TouchableOpacity
//         onPress={() => navigation.navigate("Start")}
//         style={styles.cancelButton}
//       >
//         <Text style={styles.createButtonText}>Cancel</Text>
//       </TouchableOpacity>
//       <TouchableOpacity
//         onPress={() => navigation.navigate("GroupInfo")}
//         style={styles.createButton}
//       >
//         <Text style={styles.createButtonText}>Create</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }
// function GroupInfoScreen({ navigation }) {
//   return <View style={styles.background2}></View>;
// }
// const Stack = createNativeStackNavigator();
// function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator>
//         <Stack.Screen
//           name="Start"
//           component={StartScreen}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen
//           name="NewGroup"
//           component={NewGroupScreen}
//           options={{ headerShown: false }}
//         />
//         <Stack.Screen
//           name="GroupInfo"
//           component={GroupInfoScreen}
//           options={{ headerShown: false }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }
// const styles = StyleSheet.create({
//   background0: {
//     flex: 1,
//     backgroundColor: "#1f509a",
//     alignItems: "center",
//   },
//   background1: {
//     flex: 1,
//     backgroundColor: "#1f509a",
//     alignItems: "center",
//     flexDirection: "row",
//   },
//   background2: {
//     flex: 1,
//     backgroundColor: "#C2C6D0",
//     alignItems: "center",
//   },
//   textInput: {
//     backgroundColor: "#FFFFFF",
//     padding: 15,
//     width: "65%",
//     textAlign: "center",
//     borderRadius: 15,
//   },
//   container: {
//     padding: 20,
//     backgroundColor: "#0000",
//   },
//   createGroupButton: {
//     backgroundColor: "black",
//     padding: 15,
//     borderRadius: 30,
//   },
//   createButton: {
//     backgroundColor: "#1f509a",
//     padding: 20,
//     width: "50%",
//     borderRadius: 30,
//     position: "absolute",
//     top: "80%",
//     marginLeft: "52%",
//     marginRight: "10%",
//   },
//   cancelButton: {
//     backgroundColor: "black",
//     padding: 20,
//     width: "50%",
//     borderRadius: 30,
//     position: "absolute",
//     top: "80%",
//     marginLeft: "10%",
//     marginRight: "52%",
//   },
//   enterButtonText: {
//     fontSize: 15,
//     color: "#716E6E",
//     textAlign: "center",
//   },
//   createGroupButtonText: {
//     fontSize: 15,
//     color: "#fff",
//     textAlign: "center",
//   },
//   createButtonText: {
//     fontSize: 15,
//     fontWeight: "bold",
//     color: "#fff",
//     textAlign: "center",
//   },
//   dropDown: {
//     backgroundColor: "#FFFFFF",
//     padding: 15,
//     width: "80%",
//     textAlign: "center",
//     borderRadius: 15,
//     top: "30%",
//   },
// });
// export default App;
