import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  SafeAreaView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Snackbar } from 'react-native-paper';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import DukeBasketballLogo from '../../assets/DukeBasketballLogoSpace.png';
import {useTheme} from '../../context/ThemeProvider'

const window = Dimensions.get('window');

export default function Login(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [dimensions, setDimensions] = useState({ window });
  const [isSnackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const {theme} = useTheme();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  const toggleSnackBar = () => {
    setSnackVisible(!isSnackVisible);
  };

  const onSignUp = () => {
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        console.log('login successful');
      })
      .catch((error) => {
        console.log(error);
        let message = 'Login unsuccessful';
        if (error.message.includes('The email address is badly formatted')) {
          message = 'Not a valid email';
        }
        if (error.message.includes('There is no user record')) {
          message = 'Account does not exist';
        }
        if (error.message.includes('The password is invalid')) {
          message = 'Incorrect password';
        }
        toggleSnackBar();
        setSnackMessage(message);
        return;
      });
    //firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    // firebase
    //   .auth()
    //   .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    //   .then(() => {
    //     // Existing and future Auth states are now persisted in the current
    //     // session only. Closing the window would clear any existing state even
    //     // if a user forgets to sign out.
    //     // ...
    //     // New sign-in will be persisted with session persistence.
    //     return firebase.auth().signInWithEmailAndPassword(email, password);
    //   })
    //   .catch((error) => {
    //     // Handle Errors here.
    //     const errorCode = error.code;
    //     const errorMessage = error.message;
    //     console.log(errorCode, errorMessage);
    //   });
  };

  return (
    <View style={styles(theme).container}>
      <KeyboardAvoidingView behavior='padding' style={styles(theme).container}>
        <View style={styles(theme).banner}>
          <Text style={{ color: theme.white2, fontSize: 35, marginTop: 50 }}>
            LOGIN
          </Text>
          <View style={styles(theme).imageContainer}>
            <Image
              style={[
                styles(theme).logo,
                {
                  flex: 1,
                  tintColor: '#D9D9D9',
                  opacity: 0.2,
                  aspectRatio: 0.84,
                  width: 50,
                  top: -30,
                  resizeMode: 'repeat',
                },
              ]}
              resizeMode={'repeat'}
              source={DukeBasketballLogo}
            />
            <View style={styles(theme).boldImage}>
              <Image style={styles(theme).logo} source={DukeBasketballLogo} />
            </View>
          </View>
          <View
            style={[
              styles(theme).slant,
              {
                borderRightWidth: dimensions.window.width,
                borderTopWidth: dimensions.window.height / 5,
              },
            ]}
          ></View>
        </View>
        <View style={styles(theme).formCenter}>
          <View style={styles(theme).section}>
            <View style={styles(theme).icon}>
              <Icon name='account-circle-outline' color={theme.icon2} size={25} />
            </View>
            <TextInput
              style={styles(theme).textInput}
              placeholder='Email'
              value={email}
              onChangeText={(email) => setEmail(email)}
              keyboardType='email-address'
            />
          </View>

          <View style={styles(theme).section}>
            <View style={styles(theme).icon}>
              <Icon name='lock-outline' color={theme.icon2} size={25} />
            </View>
            <TextInput
              style={styles(theme).textInput}
              placeholder='Password'
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={(password) => setPassword(password)}
            />
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={() => {
                setSecureTextEntry(!secureTextEntry);
                return false;
              }}
            >
              <Icon
                name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
                color={theme.icon2}
                size={20}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles(theme).button} onPress={onSignUp}>
            <Text style={{ color: theme.text1 }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <View style={styles(theme).bottomButton}>
        <View
          style={{
            flexDirection: 'row',
            alignContent: 'center',
            justifyContent: 'center',
          }}
        >
          <Text>Don't have an account? </Text>
          <Text
            title='Register'
            onPress={() => props.navigation.navigate('Register')}
            style={{ textAlign: 'center', color: theme.quaternary }}
          >
            Sign Up
          </Text>
        </View>
        <Text
          style={{ margin: 10, color: theme.quaternary, textAlign: 'center' }}
          onPress={() => props.navigation.navigate('ForgotPassword')}
        >
          Forgot Password?
        </Text>
      </View>
      <Snackbar
        visible={isSnackVisible}
        onDismiss={() => setSnackVisible(false)}
        wrapperStyle={{ top: 0 }}
        duration={2000}
      >
        <View style={{ width: '100%' }}>
          <Text style={{ textAlign: 'center' }}>{snackMessage}</Text>
        </View>
      </Snackbar>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.white2,
  },
  banner: {
    //position: 'absolute',
    backgroundColor: theme.primary,
    width: '100%',
    height: '50%',
    //justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 30,
    backgroundColor: 'transparent',
    width: 90,
    height: '100%',
    //justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    margin: 0,
  },
  // dimImage: {
  //   borderWidth: 1,
  //   height: '100%',
  //   width: 90,
  //   alignItems: 'center',
  // },
  boldImage: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: theme.white2,
    borderRadius: 15,
    width: 90,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  logo: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
  },
  slant: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
    marginLeft: 0,
    //backgroundColor: '#fff',
    height: 0,
    width: 0,
    borderStyle: 'solid',
    borderTopWidth: 150,
    borderRightColor: theme.white2,
    borderBottomColor: theme.whit2,
    borderTopColor: 'transparent',
    //borderLeftColor: 'transparent',
  },
  formCenter: {
    justifyContent: 'center',
    flex: 1,
    margin: 25,
  },
  section: {
    flexDirection: 'row',
    //justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white2,
    height: 40,
    borderRadius: 20,
    margin: 10,
    shadowColor: theme.primary,
    elevation: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  icon: {
    position: 'absolute',
    left: -10,
    height: 50,
    width: 50,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.white2,
    shadowColor: theme.primary,
    elevation: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  textInput: {
    marginLeft: 50,
    flexDirection: 'row',
    flex: 1,
    backgroundColor: theme.white2,
    padding: 10,
    borderRadius: 20,
    height: '100%',
    //outlineWidth: 0,
    //justifyContent: "center",
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: '100%',
    backgroundColor: theme.primary,
    height: 30,
    marginTop: 40,
    borderRadius: 50,
  },
  bottomButton: {
    //flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    borderTopColor: 'gray',
    borderTopWidth: 1,
    padding: 10,
    textAlign: 'center',
    marginBottom: 30,
  },
});
