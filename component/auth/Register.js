import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

export default function Register(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [groupCode, setGroupCode] = useState([]);
  const [isValid, setIsValid] = useState(true);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

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
    backgroundColor: 'whitesmoke',
    height: 40,
    borderRadius: 20,
    margin: 10,
    shadowColor: '#0FA4DC',
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
    backgroundColor: 'whitesmoke',
    shadowColor: '#0FA4DC',
    elevation: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  textInput: {
    marginLeft: 40,
    height: 20,
    flexDirection: 'row',
    flex: 1,
    backgroundColor: 'whitesmoke',
    padding: 10,
    borderRadius: 20,
    height: '100%',
    alignItem: 'center',
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
