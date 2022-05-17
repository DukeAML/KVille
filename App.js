import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { IconButton, Colors } from "react-native-paper";
import * as Font from "expo-font";
import React, { Component } from "react";
import AppLoading from "expo-app-loading";
import { Text, Button } from "react-native";


// import { createStore, applyMiddleware } from "redux";
// import rootREducer from "./redux/reducers";
// import thunk from "redux-thunk";

// const store = createStore(rootReducer, applyMiddleware(thunk));

import firebase from "firebase/compat/app";

//Hide this with environmental variables before publishing
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBm5sT0wPr_j7iHl--g78b3oDc98GAqkmU",
  authDomain: "duke-tenting-app-rev2.firebaseapp.com",
  projectId: "duke-tenting-app-rev2",
  storageBucket: "duke-tenting-app-rev2.appspot.com",
  messagingSenderId: "232714285127",
  appId: "1:232714285127:web:73df8d490f7cfb7b28c162",
  measurementId: "G-N4GY1GQMD7",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

import RegisterScreen from "./component/auth/Register";
import LoginScreen from "./component/auth/Login";
import MainScreen from "./screens/Main";

import { StateProvider } from "./screens/State";

import { createStore } from "redux";
import Reducer from "./redux/reducers/index";
import {useSelector, useDispatch, Provider} from 'react-redux';

 
const store = createStore(
  Reducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

export class App extends Component {
  

  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      fontsLoaded: false,
      //used to track if current user is in a group
      inGroup:  false,
    };
  }

  // reducer = (state, action) => {
  //   switch (action.type) {
  //     case "changeGroupStatus":
  //       return {
  //         ...state,
  //         inGroup: action.newGroupState,
  //       };
  //     default:
  //       return state;
  //   }
  // };

  // updateGroupStatus = (bool) => {
  //   this.setState({ inGroup: bool });
  // };

  async LoadFonts() {
    await Font.loadAsync({
      NovaCut: require("./assets/fonts/NovaCut-Regular.ttf"),
    });
    this.setState({ fontsLoaded: true });
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        this.setState({
          loggedIn: false,
          loaded: true,
        });
      } else {
        // this.setState({
        //   loggedIn: true,
        //   loaded: true,
        // })

        //if user logged in, update loggedIn to true
        console.log("check");
        const docRef = firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid);
        docRef.get().then((doc) => {
          this.setState({
            loggedIn: true,
            loaded: true,
            inGroup: doc.data().inGroup,
          });
        });

        //set persistence so user stays logged in; currently(5/14) not working
        firebase
          .auth()
          .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
          .then(() => {
            console.log("persistence set");
          });
      }
    });
    this.LoadFonts();
  }

  componentDidUpdate(prevProps, prevState) {
    //checks if inGroup status is updated after each component update
    if (this.state.inGroup !== prevState.inGroup) {
      const user = firebase.auth().currentUser;
      if (user) {
        const docRef = firebase
          .firestore()
          .collection("users")
          .doc(firebase.auth().currentUser.uid);
        docRef.get().then((doc) => {
          this.setState({
            inGroup: doc.data().inGroup,
          });
        });
      }
    }
  }

  render() {
    const { loggedIn, loaded, inGroup } = this.state;
    if (!loaded) {
      return <AppLoading />;
    }
    if (!loggedIn) {
      return (
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              navigation={this.props.navigation}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              navigation={this.props.navigation}
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      );
    }

    //if curr user not in group display start and createGroup screens
    return (
      <Provider store = {store}>
        <MainScreen />
      </Provider>
    )
  }
}

export default App;
