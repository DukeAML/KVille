import 'react-native-gesture-handler'; //must be at top
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { Platform } from 'react-native';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

//Hide this with environmental variables before publishing
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDEFvAO5nl5XlW7WcGcDCrFGo4QEZFuWq0',
  authDomain: 'duke-tenting-app-cc15b.firebaseapp.com',
  databaseURL: 'https://duke-tenting-app-cc15b-default-rtdb.firebaseio.com',
  projectId: 'duke-tenting-app-cc15b',
  storageBucket: 'duke-tenting-app-cc15b.appspot.com',
  messagingSenderId: '391061238630',
  appId: '1:391061238630:web:85fbc00e4babf43cdc8ea7',
  measurementId: 'G-6QNGDGFLHZ',
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

import RegisterScreen from './components/auth/Register';
import LoginScreen from './components/auth/Login';
import NavigationStack from './screens/NavigationStack';
import ForgotPasswordScreen from './components/auth/ForgotPassword';
import { persistor, store } from './redux/store/index';
import ThemeProvider from './context/ThemeProvider';
import Snackbar from './components/Snackbar';

const Stack = createNativeStackNavigator();

const queryClient = new QueryClient();

export default function App() {
  const [state, setState] = useState({
    isReady: false,
  });

  TaskManager.defineTask('KVILLE', ({ data: { eventType, region }, error }) => {
    if (error) {
      console.error(error);
      return;
    }
    if (eventType === Location.GeofencingEventType.Enter) {
      console.log("You've entered region:", region);
      if (state.loggedIn) {
        updateTentStatus(true);
      }
    } else if (eventType === Location.GeofencingEventType.Exit) {
      console.log("You've left region:", region);
      if (state.loggedIn) {
        updateTentStatus(false);
      }
    }
  });

  async function updateTentStatus(status) {
    const currentUser = firebase.auth().currentUser.uid;
    if (currentUser != null) {
      let groupCodes;
      await firebase
        .firestore()
        .collection('users')
        .doc(currentUser)
        .get()
        .then((doc) => {
          groupCodes = doc.data().groupCode;
        })
        .catch((error) => console.error(error));
      for (let i = 0; i < groupCodes.length; i++) {
        firebase
          .firestore()
          .collection('groups')
          .doc(groupCodes[i].groupCode)
          .collection('members')
          .doc(currentUser)
          .update({
            inTent: status,
          })
          .catch((error) => console.error(error));
      }
    }
  }

  useEffect(() => {
    let mounted = true;
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();

        firebase.auth().onAuthStateChanged((user) => {
          if (!user) {
            setState({
              isReady: true,
              loggedIn: false,
            });
          } else {
            //AsyncStorage.setItem('USER', JSON.stringify(user));
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
    async function location() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      } else {
        let { status } = await Location.requestBackgroundPermissionsAsync();
        console.log(status);
        if (status !== 'granted') {
          console.log('Background permissions were denied');
          return;
        } else {
          console.log('geofencing started');
          Location.startGeofencingAsync('KVILLE', [{ latitude: 35.997435, longitude: -78.940823, radius: 150 }]);
        }
      }
    }
    if (Platform.OS !== 'web') {
      location();
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
          <ThemeProvider>
            <NavigationContainer onReady={onLayoutRootView}>
              <Stack.Navigator initialRouteName='Login'>
                <Stack.Screen name='Register' component={RegisterScreen} options={{ headerShown: false }} />
                <Stack.Screen name='Login' component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen
                  name='ForgotPassword'
                  component={ForgotPasswordScreen}
                  options={({ navigation }) => ({
                    title: '',
                    headerStyle: {
                      backgroundColor: '#f6f6f6',
                      borderBottomWidth: 0,
                      shadowColor: 'transparent',
                    },
                    headerTitleStyle: {
                      fontSize: 28,
                    },
                  })}
                />
              </Stack.Navigator>
              <StatusBar style='light' />
              <Snackbar />
            </NavigationContainer>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    );
  }

  //Main screen, after landing
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <ThemeProvider>
            <NavigationStack />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}
