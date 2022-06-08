import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DukeBasketballLogo from '../../assets/DukeBasketballLogoSpace.png';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const window = Dimensions.get('window');

export default function Register(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [groupCode, setGroupCode] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [dimensions, setDimensions] = useState({ window });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  const onRegister = () => {
    if (username.length == 0 || email.length == 0 || password.length == 0) {
      setIsValid({
        bool: true,
        boolSnack: true,
        message: 'Please fill out everything',
      });
      return;
    }
    if (password.length < 6) {
      setIsValid({
        bool: true,
        boolSnack: true,
        message: 'passwords must be at least 6 characters',
      });
      return;
    }
    if (password.length < 6) {
      setIsValid({
        bool: true,
        boolSnack: true,
        message: 'passwords must be at least 6 characters',
      });
      return;
    }
    firebase
      .firestore()
      .collection('users')
      .where('username', '==', username)
      .get()
      .then((snapshot) => {
        if (!snapshot.exist) {
          firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then(() => {
              if (snapshot.exist) {
                return;
              }
              firebase
                .auth()
                .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
                .then(function () {});
              firebase
                .firestore()
                .collection('users')
                .doc(firebase.auth().currentUser.uid)
                .set({
                  email,
                  username,
                  groupCode,
                });
            })
            .catch(() => {
              setIsValid({
                bool: true,
                boolSnack: true,
                message: 'Something went wrong',
              });
            });
        }
      })
      .catch(() => {
        setIsValid({
          bool: true,
          boolSnack: true,
          message: 'Something went wrong',
        });
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={{ color: '#f5f5f5', fontSize: 35, marginTop: 50 }}>
          REGISTER
        </Text>
        <View style={styles.imageContainer}>
          <Image
            style={[
              styles.logo,
              {
                tintColor: '#D9D9D9',
                opacity: 0.2,
                height: '100%',
                top: -45,
                resizeMode: 'repeat',
                justifyContent: 'space-between',
              },
            ]}
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
            <Icon name='account-circle-outline' color='#000' size={25} />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder='Username'
            value={username}
            keyboardType='twitter'
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

        <View style={styles.section}>
          <View style={styles.icon}>
            <Icon name='email-outline' color='#000' size={25} />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder='Email'
            value={email}
            keyboardType={'email-address'}
            onChangeText={(email) => setEmail(email)}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.icon}>
            <Icon name='lock-outline' color='#000' size={25} />
          </View>
          <TextInput
            style={styles.textInput}
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
            <Icon
              name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'}
              color='#000'
              size={20}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={onRegister}>
          <Text style={{ color: '#fff' }}>Register</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomButton}>
        <Text>Already have an account? </Text>
        <Text
          style={{ textAlign: 'center', color: '#0FA4DC' }}
          onPress={() => props.navigation.navigate('Login')}
        >
          Sign In
        </Text>
      </View>

      <Snackbar
        visible={isValid.boolSnack}
        duration={2000}
        onDismiss={() => {
          setIsValid({ boolSnack: false });
        }}
      >
        {isValid.message}
      </Snackbar>
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
    height: 20,
    flexDirection: 'row',
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 20,
    height: '100%',
    outlineWidth: 0,
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
