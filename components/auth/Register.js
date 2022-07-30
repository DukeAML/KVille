import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../../context/ThemeProvider';
import { toggleSnackBar, setSnackMessage } from '../../redux/reducers/snackbarSlice';
import DukeBasketballLogo from '../../assets/DukeBasketballLogoSpace.png';

const window = Dimensions.get('window');

export default function Register(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [groupCode, setGroupCode] = useState([]);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [dimensions, setDimensions] = useState({ window });
  const { theme } = useTheme();
  const dispatch = useDispatch();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  function onRegister() {
    if (username.length == 0 || email.length == 0 || password.length == 0) {
      dispatch(setSnackMessage('Please fill out everything'));
      dispatch(toggleSnackBar());
      return;
    }
    if (password.length < 6) {
      dispatch(setSnackMessage('Passwords must be at least 6 characters'));
      dispatch(toggleSnackBar());
      return;
    }
    firebase
      .firestore()
      .collection('users')
      .where('username', '==', username)
      .get()
      .then((snapshot) => {
        if (snapshot.empty) {
          firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
              // firebase
              //   .auth()
              //   .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
              //   .then(() => console.log('persistence set'))
              //   .catch((error) => console.error(error));
              firebase
                .firestore()
                .collection('users')
                .doc(firebase.auth().currentUser.uid)
                .set({
                  email,
                  username,
                  groupCode,
                })
                .catch((error) => console.error(error));
            })
            .catch((error) => {
              console.error(error);
              dispatch(setSnackMessage('The email address is already in use by another account'));
              dispatch(toggleSnackBar());
            });
        } else {
          console.error(error);
          dispatch(setSnackMessage('Username Taken'));
          dispatch(toggleSnackBar());
        }
      })
      .catch((error) => {
        console.error(error);
        dispatch(setSnackMessage('Something went wrong'));
        dispatch(toggleSnackBar());
      });
  }

  return (
    <View style={styles(theme).container}>
      <KeyboardAvoidingView behavior='padding' style={styles(theme).container}>
        <View style={styles(theme).banner}>
          <Text style={{ color: theme.white2, fontSize: 35, marginTop: 50 }}>REGISTER</Text>
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
              placeholder='Username'
              value={username}
              //keyboardType='twitter'
              onChangeText={(username) =>
                setUsername(
                  username
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '')
                    .replace(/[^a-z0-9]/gi, '')
                )
              }
            />
          </View>

          <View style={styles(theme).section}>
            <View style={styles(theme).icon}>
              <Icon name='email-outline' color={theme.icon2} size={25} />
            </View>
            <TextInput
              style={styles(theme).textInput}
              placeholder='Email'
              value={email}
              keyboardType={'email-address'}
              onChangeText={(email) => setEmail(email)}
            />
          </View>

          <View style={styles(theme).section}>
            <View style={styles(theme).icon}>
              <Icon name='lock-outline' color={theme.icon2} size={25} />
            </View>
            <TextInput
              style={styles(theme).textInput}
              placeholder='Password'
              value={password}
              secureTextEntry={secureTextEntry}
              onChangeText={(password) => setPassword(password)}
            />
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={() => {
                setSecureTextEntry(!secureTextEntry);
                return false;
              }}
            >
              <Icon name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} color={theme.icon2} size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles(theme).button} onPress={onRegister}>
            <Text style={{ color: theme.text1 }}>Register</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <View style={styles(theme).bottomButton}>
        <Text>Already have an account? </Text>
        <Text
          style={{ textAlign: 'center', color: theme.quaternary }}
          onPress={() => props.navigation.navigate('Login')}
        >
          Sign In
        </Text>
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
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
      borderBottomColor: theme.white2,
      borderTopColor: 'transparent',
      //borderLeftColor: 'transparent',
    },
    formCenter: {
      justifyContent: 'start',
      alignContent: 'center',
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
      //marginTop: 10,
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
      flexDirection: 'row',
      alignContent: 'center',
      justifyContent: 'center',
      borderTopColor: 'gray',
      borderTopWidth: 1,
      padding: 10,
      textAlign: 'center',
      marginBottom: 60,
    },
  });
