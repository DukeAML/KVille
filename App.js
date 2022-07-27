import 'react-native-gesture-handler'; //must be at top
import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from 'react-query';

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

const Stack = createNativeStackNavigator();

const queryClient = new QueryClient();

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
          <ThemeProvider>
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
        <ThemeProvider>
          <NavigationStack />
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
}
