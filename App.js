import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Font from "expo-font";
import React, { Component } from "react";
import AppLoading from "expo-app-loading";

import firebase from "firebase/compat/app";

//Hide this with environmental variables before publishing
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDEFvAO5nl5XlW7WcGcDCrFGo4QEZFuWq0",
  authDomain: "duke-tenting-app-cc15b.firebaseapp.com",
  databaseURL: "https://duke-tenting-app-cc15b-default-rtdb.firebaseio.com",
  projectId: "duke-tenting-app-cc15b",
  storageBucket: "duke-tenting-app-cc15b.appspot.com",
  messagingSenderId: "391061238630",
  appId: "1:391061238630:web:40b3664d20c6a247dc8ea7",
  measurementId: "G-54X8RY8NHT",
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

import RegisterScreen from "./component/auth/Register";
import LoginScreen from "./component/auth/Login";
import MainScreen from "./screens/Main";

import store from "./redux/store/index";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

let persistor = persistStore(store);

// import { createStore } from "redux";
// import Reducer from "./redux/reducers/index";

// import { createStore, applyMiddleware } from "redux";
// import rootREducer from "./redux/reducers";
// import thunk from "redux-thunk";

// const store = createStore(rootReducer, applyMiddleware(thunk));

// const store = createStore(
//   Reducer,
//   window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
// );

const Stack = createNativeStackNavigator();

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      fontsLoaded: false,
    };
  }

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
        //if user logged in, update loggedIn to true
        this.setState({
          loggedIn: true,
          loaded: true,
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

  // componentDidUpdate(prevProps, prevState) {
  //   //checks if inGroup status is updated after each component update
  //   if (this.state.inGroup !== prevState.inGroup) {
  //     const user = firebase.auth().currentUser;
  //     if (user) {
  //       const docRef = firebase
  //         .firestore()
  //         .collection("users")
  //         .doc(firebase.auth().currentUser.uid);
  //       docRef.get().then((doc) => {
  //         this.setState({
  //           inGroup: doc.data().inGroup,
  //         });
  //       });
  //     }
  //   }
  // }

  render() {
    const { loggedIn, loaded } = this.state;
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

    //Main screen, after landing
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <MainScreen />
        </PersistGate>
      </Provider>
    );
  }
}

export default App;
