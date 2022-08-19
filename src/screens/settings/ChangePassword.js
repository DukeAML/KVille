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

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { useTheme } from '../../context/ThemeProvider';
import Icon from 'react-native-vector-icons/Ionicons';
import coachKLogo from '../../assets/coachKLogo.png';
import { setSnackMessage, toggleSnackBar } from '../../redux/reducers/snackbarSlice';

export default function ChangePassword({ navigation }) {
  const username = useSelector((state) => state.user.currentUser.username);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [secureCurrEntry, setSecureCurrEntry] = useState(true);
  const [secureNewEntry, setSecureNewEntry] = useState(true);
  const [secureConfirmEntry, setSecureConfirmEntry] = useState(true);

  const { theme } = useTheme();
  const dispatch = useDispatch();

  const user = firebase.auth().currentUser;

  async function updatePassword() {
    if (newPassword == confirmPassword) {
      const credentials = firebase.auth.EmailAuthProvider.credential(user.email, currPassword);
      await user
        .reauthenticateWithCredential(credentials)
        .then(() => {
          firebase
            .auth()
            .currentUser.updatePassword(newPassword)
            .then(() => {
              dispatch(setSnackMessage('Saved New Password'));
              dispatch(toggleSnackBar());
              navigation.goBack();
            })
            .catch((error) => console.error(error));
        })
        .catch((error) => {
          dispatch(setSnackMessage('Incorrect Current Password Entered'));
          dispatch(toggleSnackBar());
          console.error(error);
          return;
        });
    } else {
      dispatch(setSnackMessage('Your Passwords Do Not Match'));
      dispatch(toggleSnackBar());
    }
  }

  return (
    <SafeAreaView style={styles(theme).container}>
      <View style={styles(theme).topBanner}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name='arrow-back' color={theme.primary} size={30} style={{ marginTop: 3 }} />
        </TouchableOpacity>
        <Text style={styles(theme).titleText}>Reset password</Text>
        <TouchableOpacity onPress={updatePassword}>
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
          <View style={[styles(theme).inputView, { marginBottom: 60 }]}>
            <TextInput
              style={styles(theme).textInput}
              placeholder='Current password'
              secureTextEntry={secureCurrEntry}
              value={currPassword}
              onChangeText={(currPassword) => setCurrPassword(currPassword)}
            />
            <TouchableOpacity
              style={{ marginLeft: -20 }}
              onPress={() => {
                setSecureCurrEntry(!secureCurrEntry);
                return false;
              }}
            >
              <Icon name={secureCurrEntry ? 'eye-off-outline' : 'eye-outline'} color={theme.icon2} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles(theme).inputView}>
            <TextInput
              style={styles(theme).textInput}
              placeholder='New password'
              secureTextEntry={secureConfirmEntry}
              value={newPassword}
              onChangeText={(newPassword) => setNewPassword(newPassword)}
            />
            <TouchableOpacity
              style={{ marginLeft: -20 }}
              onPress={() => {
                setSecureConfirmEntry(!secureConfirmEntry);
                return false;
              }}
            >
              <Icon name={secureConfirmEntry ? 'eye-off-outline' : 'eye-outline'} color={theme.icon2} size={20} />
            </TouchableOpacity>
          </View>

          <View style={styles(theme).inputView}>
            <TextInput
              style={styles(theme).textInput}
              placeholder='Confirm new password'
              secureTextEntry={secureNewEntry}
              value={confirmPassword}
              onChangeText={(confirmPassword) => setConfirmPassword(confirmPassword)}
            />
            <TouchableOpacity
              style={{ marginLeft: -20 }}
              onPress={() => {
                setSecureNewEntry(!secureNewEntry);
                return false;
              }}
            >
              <Icon name={secureNewEntry ? 'eye-off-outline' : 'eye-outline'} color={theme.icon2} size={20} />
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
      paddingHorizontal: 20,
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
