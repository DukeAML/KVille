import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export default function Login({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const onSignUp = () => {
    //firebase.auth().signInWithEmailAndPassword(email, password);
    //firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebase
      .auth()
      .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      .then(() => {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        return firebase.auth().signInWithEmailAndPassword(email, password);
      })
      .catch((error) => {
        //Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
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
            placeholder='Email'
            value={email}
            onChangeText={(email) => setEmail(email)}
            keyboardType='email-address'
          />
        </View>

        <View style={styles.section}>
          <View style={styles.icon}>
            <Icon name='lock-outline' color='#000' size={25} />
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
              color='#000'
              size={20}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={onSignUp}>
          <Text style={{ color: '#fff' }}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomButton}>
        <Text>Don't have an account? </Text>
        <Text
          title='Register'
          onPress={() => navigation.navigate('Register')}
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
