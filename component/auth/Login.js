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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DukeBasketballLogo from '../../assets/DukeBasketballLogoSpace.png';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const window = Dimensions.get('window');

export default function Login(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [dimensions, setDimensions] = useState({ window });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  const onSignUp = () => {
    firebase.auth().signInWithEmailAndPassword(email, password);
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
    <View style={styles.container}>
      <KeyboardAvoidingView behavior='padding' style={styles.container}>
        <View style={styles.banner}>
          <Text style={{ color: '#f5f5f5', fontSize: 35, marginTop: 50 }}>
            LOGIN
          </Text>
          <View style={styles.imageContainer}>
            <Image
              style={[
                styles.logo,
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
            <View style={styles.boldImage}>
              <Image style={styles.logo} source={DukeBasketballLogo} />
            </View>
          </View>
          <View
            style={[
              styles.slant,
              {
                borderRightWidth: dimensions.window.width,
                borderTopWidth: dimensions.window.height / 5,
              },
            ]}
          ></View>
        </View>
        <View style={styles.formCenter}>
          <View style={styles.section}>
            <View style={styles.icon}>
              <Icon name='account-circle-outline' color={'#000'} size={25} />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder='Email'
              value={email}
              onChangeText={(email) => setEmail(email)}
              keyboardType='email-address'
            />
          </View>

          <View style={styles.section}>
            <View style={styles.icon}>
              <Icon name='lock-outline' color={'#000'} size={25} />
            </View>
            <TextInput
              style={styles.textInput}
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
                color={'#000'}
                size={20}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={onSignUp}>
            <Text style={{ color: '#fff' }}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <View style={styles.bottomButton}>
        <Text>Don't have an account? </Text>
        <Text
          title='Register'
          onPress={() => props.navigation.navigate('Register')}
          style={{ textAlign: 'center', color: '#0FA4DC' }}
        >
          Sign Up
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  banner: {
    //position: 'absolute',
    backgroundColor: '#1F509A',
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
    backgroundColor: '#f5f5f5',
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
    borderRightColor: '#f5f5f5',
    borderBottomColor: '#f5f5f5',
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
    backgroundColor: '#f5f5f5',
    height: 40,
    borderRadius: 20,
    margin: 10,
    shadowColor: '#1F509A',
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
    backgroundColor: '#f5f5f5',
    shadowColor: '#1F509A',
    elevation: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  textInput: {
    marginLeft: 50,
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#1F509A',
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
    marginBottom: 30,
  },
});
