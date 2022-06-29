import 'react-native-gesture-handler'; //must be at top
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import ForgotPasswordScreen from './component/auth/ForgotPassword';

import { persistor, store } from './redux/store/index';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const Stack = createNativeStackNavigator();

export default function App() {
  const [state, setState] = useState({
    isReady: false,
  });

  useEffect(() => {
    let mounted = true;
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        // LogBox.ignoreLogs([
        //   'Warning: Failed prop type: Invalid prop `style` of type `array` supplied to',
        // ]);

        // await Font.loadAsync({
        //   NovaCut: require('./assets/fonts/NovaCut-Regular.ttf'),
        // });
        firebase.auth().onAuthStateChanged((user) => {
          if (!user) {
            setState({
              isReady: true,
              loggedIn: false,
            });
          } else {
            setState({
              isReady: true,
              loggedIn: true,
            });
          }
        });
      } catch (e) {
        console.warn(e);
      }
    }
    if (mounted) {
      prepare();
    }

    return () => (mounted = false);
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (state.isReady) {
      await SplashScreen.hideAsync();
    }
  }, [state.isReady]);

  //       //set persistence so user stays logged in; currently(5/14) not working
  //       firebase
  //         .auth()
  //         .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  //         .then(() => {
  //           console.log("persistence set");
  //         });

  if (!state.isReady) {
    return null;
  }

  if (!state.loggedIn) {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NavigationContainer onReady={onLayoutRootView}>
            <Stack.Navigator initialRouteName='Login'>
              <Stack.Screen
                name='Register'
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='Login'
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='ForgotPassword'
                component={ForgotPasswordScreen}
                options={({ navigation }) => ({
                  title: '',
                  headerStyle: {
                    backgroundColor: '#f5f5f5',
                    borderBottomWidth: 0,
                    shadowColor: 'transparent',
                  },
                  headerTitleStyle: {
                    fontSize: 28,
                  },
                  // headerLeft: () => (
                  //   <IconButton
                  //     icon='menu'
                  //     size={25}
                  //     onPress={() => navigation.openDrawer()}
                  //   ></IconButton>
                  // ),
                })}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PersistGate>
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
