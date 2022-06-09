import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { Component } from 'react';
import * as SplashScreen from 'expo-splash-screen';

import firebase from 'firebase/compat/app';

//Hide this with environmental variables before publishing
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDEFvAO5nl5XlW7WcGcDCrFGo4QEZFuWq0',
  authDomain: 'duke-tenting-app-cc15b.firebaseapp.com',
  databaseURL: 'https://duke-tenting-app-cc15b-default-rtdb.firebaseio.com',
  projectId: 'duke-tenting-app-cc15b',
  storageBucket: 'duke-tenting-app-cc15b.appspot.com',
  messagingSenderId: '391061238630',
  appId: '1:391061238630:web:40b3664d20c6a247dc8ea7',
  measurementId: 'G-54X8RY8NHT',
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

import RegisterScreen from './component/auth/Register';
import LoginScreen from './component/auth/Login';
import MainScreen from './screens/Main';

import store from './redux/store/index';
import { Provider } from 'react-redux';

const Stack = createNativeStackNavigator();

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
    };
  }
  componentDidMount() {
//    async function prepare() {
//       try {
//         await SplashScreen.preventAutoHideAsync();
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         setIsReady(true);
//       }
//     }
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
            console.log('persistence set');
          });
      }
    });
  }

  // async onLayoutRootView() {
  //   if (isReady) {
  //     await SplashScreen.hideAsync();
  //   }
  // };

  render() {
    const { loggedIn, loaded } = this.state;
    if (!loaded) {
      return null;
    }
    if (!loggedIn) {
      return (
        <Provider store={store}>
          <NavigationContainer>
            <Stack.Navigator initialRouteName='Login'>
              <Stack.Screen
                name='Register'
                component={RegisterScreen}
                navigation={this.props.navigation}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='Login'
                navigation={this.props.navigation}
                component={LoginScreen}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
      );
    }

    //Main screen, after landing
    return (
      <Provider store={store}>
        <MainScreen />
      </Provider>
    );
  }
}

export default App;

// import React, { useState, useEffect, useCallback } from 'react';
// import 'react-native-gesture-handler';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import * as SplashScreen from 'expo-splash-screen';
// //import * as Font from 'expo-font';

// import firebase from 'firebase/compat/app';

// //Hide this with environmental variables before publishing
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: 'AIzaSyDEFvAO5nl5XlW7WcGcDCrFGo4QEZFuWq0',
//   authDomain: 'duke-tenting-app-cc15b.firebaseapp.com',
//   databaseURL: 'https://duke-tenting-app-cc15b-default-rtdb.firebaseio.com',
//   projectId: 'duke-tenting-app-cc15b',
//   storageBucket: 'duke-tenting-app-cc15b.appspot.com',
//   messagingSenderId: '391061238630',
//   appId: '1:391061238630:web:40b3664d20c6a247dc8ea7',
//   measurementId: 'G-54X8RY8NHT',
// };

// if (firebase.apps.length === 0) {
//   firebase.initializeApp(firebaseConfig);
// }

// import RegisterScreen from './component/auth/Register';
// import LoginScreen from './component/auth/Login';
// import MainScreen from './screens/Main';

// import store from './redux/store/index';
// import { Provider } from 'react-redux';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   const [isReady, setIsReady] = useState(false);
//   const [loggedIn, setLoggedIn] = useState();

//   useEffect(() => {
//     async function prepare() {
//       try {
//         await SplashScreen.preventAutoHideAsync();

//         // await Font.loadAsync({
//         //   NovaCut: require('./assets/fonts/NovaCut-Regular.ttf'),
//         // });
//         firebase.auth().onAuthStateChanged((user) => {
//           if (!user) {
//             setLoggedIn(false);
//             setIsReady(true);
//           } else {
//             setLoggedIn(true);
//             setIsReady(true);
//           }
//         });
//       } catch (e) {
//         console.warn(e);
//       } finally {
//         setIsReady(true);
//       }
//     }

//     prepare();
//   }, []);

  // const onLayoutRootView = useCallback(async () => {
  //   if (isReady) {
  //     await SplashScreen.hideAsync();
  //   }
  // }, [isReady]);

//   //       //set persistence so user stays logged in; currently(5/14) not working
//   //       firebase
//   //         .auth()
//   //         .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
//   //         .then(() => {
//   //           console.log("persistence set");
//   //         });

//   if (!isReady) {
//     return null;
//   }
//   if (!loggedIn) {
//     return (
//       <Provider store={store}>
//         <NavigationContainer onReady={onLayoutRootView}>
//           <Stack.Navigator initialRouteName='Login'>
//             <Stack.Screen
//               name='Register'
//               component={RegisterScreen}
//               options={{ headerShown: false }}
//             />
//             <Stack.Screen
//               name='Login'
//               component={LoginScreen}
//               options={{ headerShown: false }}
//             />
//           </Stack.Navigator>
//         </NavigationContainer>
//       </Provider>
//     );
//   }

//   //Main screen, after landing
//   return (
//     <Provider store={store}>
//       <MainScreen />
//     </Provider>
//   );
// }
