import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formCenter: {
    justifyContent: 'center',
    flex: 1,
    margin: 25,
  },
  textInput: {
    marginBottom: 10,
    borderColor: 'gray',
    backgroundColor: 'whitesmoke',
    padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    height: 20,
    alignItem: 'center',
    //justifyContent: "center",
    flexDirection: 'row',
  },
  bottomButton: {
    alignContent: 'center',
    borderTopColor: 'gray',
    borderTopWidth: 1,
    padding: 10,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default function Login(props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //   });
  };

  return (
    <View style={styles.container}>
      <View style={styles.formCenter}>
        <TextInput
          style={styles.textInput}
          placeholder='email'
          value={email}
          onChangeText={(email) => setEmail(email)}
          keyboardType="email-address"
          right={<TextInput.Icon name='account-circle-outline' />}
          activeUnderlineColor='#00f'
        />
        <TextInput
          style={styles.textInput}
          placeholder='password'
          secureTextEntry={true}
          value={password}
          onChangeText={(password) => setPassword(password)}
          right={
            <TextInput.Icon
              name='lock-outline'
              style={{ margin: 10, padding: 20, color: '#f00' }}
            />
          }
        />
        <Button
          style={styles.button}
          onPress={() => onSignUp()}
          title='Sign In'
        />
      </View>

      <View style={styles.bottomButton}>
        <Text
          title='Register'
          onPress={() => props.navigation.navigate('Register')}
          style={{ textAlign: 'center' }}
        >
          Don't have an account? SignUp.
        </Text>
      </View>
    </View>
  );
}
