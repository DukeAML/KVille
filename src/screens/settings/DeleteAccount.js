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
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { useTheme } from '../../context/ThemeProvider';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import { reset } from '../../redux/reducers/userSlice';
import Icon from 'react-native-vector-icons/Ionicons';
import coachKLogo from '../../assets/coachKLogo.png';
import { setSnackMessage, toggleSnackBar } from '../../redux/reducers/snackbarSlice';

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

export default function DeleteAccount({ navigation }) {
  const groups = useSelector((state) => state.user.currentUser.groupCode);
  const username = useSelector((state) => state.user.currentUser.username);
  const [password, setPassword] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const { theme } = useTheme();
  const dispatch = useDispatch();

  function toggleConfirmation() {
    setConfirmationVisible(!isConfirmationVisible);
  }

  const user = firebase.auth().currentUser;

  async function deleteUser() {
     if (firebase.auth().currentUser.uid == 'LyenTwoXvUSGJvT14cpQUegAZXp1') {
       dispatch(setSnackMessage('This is a demo account'));
       dispatch(toggleSnackBar());
       return;
     }
    if (groups.length == 0) {
      console.log(password);
      const credentials = firebase.auth.EmailAuthProvider.credential(user.email, password);
      await user
        .reauthenticateWithCredential(credentials)
        .then(async () => {
          AsyncStorage.multiRemove(['USER_EMAIL', 'USER_PASSWORD', PERSISTENCE_KEY]);

          await firebase
            .firestore()
            .collection('users')
            .doc(firebase.auth().currentUser.uid)
            .delete()
            .catch((error) => console.error(error));
          await firebase
            .auth()
            .currentUser.delete()
            .catch((error) => console.error(error));

          dispatch(reset());
        })
        .catch((error) => {
          dispatch(setSnackMessage('Incorrect Password Entered'));
          dispatch(toggleSnackBar());
          console.error(error);
          return;
        });
    } else {
      dispatch(setSnackMessage('Delete or leave all current groups before deleting account'));
      dispatch(toggleSnackBar());
    }
  }

  return (
    <SafeAreaView style={styles(theme).container}>
      <View style={styles(theme).topBanner}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 10, alignContent: 'center', justifyContent: 'center' }}>
          <Icon name='arrow-back' color={theme.primary} size={30} />
        </TouchableOpacity>
        <Text style={styles(theme).titleText}>Delete User Account</Text>
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

        <TouchableOpacity style={styles(theme).leaveButton} onPress={toggleConfirmation}>
          <Text style={{ color: theme.error, fontSize: 20, fontWeight: '500' }}>Delete Account</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <ConfirmationModal
        body={
          'Are you sure you want to DELETE your account? This will delete any groups you have created and remove you from any groups you have joined.'
        }
        buttonText={'Delete account'}
        buttonAction={() => {
          deleteUser();
        }}
        toggleModal={toggleConfirmation}
        isVisible={isConfirmationVisible}
        onBackdropPress={() => setConfirmationVisible(false)}
        onSwipeComplete={toggleConfirmation}
        userStyle='light'
      />
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
      justifyContent: 'center',
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
      fontSize: 20,
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
      outlineWidth: 0.5,
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
    leaveButton: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 15,
      position: 'absolute',
      bottom: '3%',
      width: '90%',
      alignItems: 'center',
      alignSelf: 'center',
      borderWidth: 0.5,
      borderColor: theme.popOutBorder,
    },
  });
