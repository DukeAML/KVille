import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { firestore, auth , EmailAuthProvider } from '../../../common/services/db/firebase_config';

import { useTheme } from '../../context/ThemeProvider';
import Icon from 'react-native-vector-icons/Ionicons';
import coachKLogo from '../../assets/coachKLogo.png';
import { setSnackMessage, toggleSnackBar } from '../../redux/reducers/snackbarSlice';

export default function ChangeEmail({ navigation }) {
  const username = useSelector((state) => state.user.currentUser.username);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const user = auth.currentUser;

  async function updateEmail() {
    if (auth.currentUser.uid == 'LyenTwoXvUSGJvT14cpQUegAZXp1') {
      dispatch(setSnackMessage('This is a demo account'));
      dispatch(toggleSnackBar());
      return;
    }
    const credentials = EmailAuthProvider.credential(user.email, password);
    await user
      .reauthenticateWithCredential(credentials)
      .then(() => {
        auth
          .currentUser.updateEmail(email)
          .then(()=>{
            firestore
              .collection('users')
              .doc(auth.currentUser.uid)
              .update({
                email: email,
              })
              .then(() => {
                dispatch(setSnackMessage('Saved New Email'));
                dispatch(toggleSnackBar());
                navigation.goBack();
              })
              .catch((error) => console.error(error));
          })
          .catch((error) => {
            dispatch(setSnackMessage('Email Already in Use'));
            dispatch(toggleSnackBar());
            console.error(error);
          });
      })
      .catch((error) => {
        dispatch(setSnackMessage('Incorrect Password Entered'));
        dispatch(toggleSnackBar());
        console.error(error);
        return;
      });
  }

  return (
    <SafeAreaView style={styles(theme).container}>
      <View style={styles(theme).topBanner}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name='arrow-back' color={theme.primary} size={30} style={{ marginTop: 3 }} />
        </TouchableOpacity>
        <Text style={styles(theme).titleText}>Update email address</Text>

        <TouchableOpacity onPress={updateEmail}>
          <Text style={{ fontSize: 18, fontWeight: '500', color: theme.primary }}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior='padding' style={[styles(theme).container, { width: '100%' }]}>
        <View style={{ flexDirection: 'row', width: '90%', alignItems: 'flex-end', marginBottom: 60, marginTop: 30 }}>
          <Image source={coachKLogo} style={styles(theme).kIcon} />
          <View style={{ marginLeft: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>{user.email}</Text>
            <Text style={{ fontSize: 16, fontWeight: '400' }}>Username: {username}</Text>
          </View>
        </View>

        <View style={{ height: '50%', width: '100%', alignItems: 'center' }}>
          <View style={styles(theme).inputView}>
            <TextInput
              style={styles(theme).textInput}
              placeholder='New email address'
              value={email}
              onChangeText={(email) => setEmail(email)}
              keyboardType='email-address'
            />
          </View>

          <View style={styles(theme).inputView}>
            <TextInput
              style={styles(theme).textInput}
              placeholder='Account Password'
              secureTextEntry={secureTextEntry}
              value={password}
              onChangeText={(password) => setPassword(password)}
            />
            <TouchableOpacity
              style={{ marginLeft: -20 }}
              onPress={() => {
                setSecureTextEntry(!secureTextEntry);
                return false;
              }}
            >
              <Icon name={secureTextEntry ? 'eye-off-outline' : 'eye-outline'} color={theme.icon2} size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, alignItems: 'center', backgroundColor: theme.background },

    topBanner: {
      //for the top container holding top 'settings' and save button
      flexDirection: 'row',
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
      width: '100%',
      height: 70,
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderColor: theme.popOutBorder,
      paddingHorizontal: 10,
    },

    titleText: {
      //text for different setting headers
      fontSize: 18,
      fontWeight: '600',
      color: theme.text2,
    },
    kIcon: {
      //for the duke basketball logos
      width: 40,
      height: 45,
      alignSelf: 'center',
      marginLeft: 10,
      marginRight: 20,
    },

    textInput: {
      width: '100%',
      fontSize: 18,
      paddingHorizontal: 5,
      paddingVertical: 5,
      //outlineWidth: 0.5,
      //justifyContent: "center",
    },
    inputView: {
      flexDirection: 'row',
      marginVertical: 18,
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '90%',
      borderBottomColor: theme.grey3,
      borderBottomWidth: 1,
    },
  });
