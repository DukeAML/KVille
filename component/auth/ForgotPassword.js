import React, { Fragment, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  SafeAreaView,
} from 'react-native';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import FormInput from '../components/FormInput';
// import FormButton from '../components/FormButton';
// import ErrorMessage from '../ErrorMessage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

export default function ForgotPassword({ navigation }) {
  const [email, setEmail] = useState('');

  const passwordReset = async () => {
    await firebase
      .auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        console.log('Password reset email sent');
        navigation.navigate('Login');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formCenter}>
        <Text>Forgot Password?</Text>
        <View style={styles.section}>
          <View style={styles.icon}>
            <Icon name='email-outline' color={'#000'} size={25} />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder='Enter email'
            value={email}
            onChangeText={(email) => setEmail(email)}
            keyboardType='email-address'
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={passwordReset}>
          <Text style={{ color: '#fff' }}>Send Email</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
});
