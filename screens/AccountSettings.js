import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { useTheme } from '../context/ThemeProvider';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { reset } from '../redux/reducers/userSlice';
import { setSnackMessage, toggleSnackBar } from '../redux/reducers/snackbarSlice';

const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

export default function AccountSettings({ navigation }) {
  const groups = useSelector((state)=>state.user.currentUser.groupCode);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const { theme } = useTheme();
  const dispatch = useDispatch();

  async function deleteUser() {
    toggleConfirmation();
    if (groups.length == 0) {
      const user = firebase.auth().currentUser;
      const credentials = firebase.auth.EmailAuthProvider.credential(user.email, '123456');
      await user.reauthenticateWithCredential(credentials).catch((error) => console.error(error));

      await AsyncStorage.multiRemove(['USER_EMAIL', 'USER_PASSWORD', PERSISTENCE_KEY]);
      firebase
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
    } else {
      dispatch(setSnackMessage('Delete or leave all current groups before deleting account'));
      dispatch(toggleSnackBar());
    }
  }

  function toggleConfirmation() {
    setConfirmationVisible(!isConfirmationVisible);
  }

  return (
    <SafeAreaView style={styles(theme).settingsContainer}>
      <View style={styles(theme).topBanner}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primary }}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles(theme).headerText, { color: theme.text2, alignSelf: 'center', fontSize: 26 }]}>
          Settings
        </Text>

        {/* <TouchableOpacity onPress={handleSubmit}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primary }}>Save</Text>
        </TouchableOpacity> */}
      </View>
      <TouchableOpacity onPress={()=>navigation.navigate('AboutScreen')}>
        <Text>About</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles(theme).leaveButton} onPress={toggleConfirmation}>
        <Text style={{ color: theme.error, fontSize: 20, fontWeight: '500' }}>Delete Account</Text>
      </TouchableOpacity>

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
    settingsContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: theme.background,
      width: '100%',
      height: '100%',
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
    },
    topBanner: {
      //for the top container holding top 'settings' and save button
      flexDirection: 'row',
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
      width: '100%',
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderColor: theme.popOutBorder,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      paddingHorizontal: 20,
    },
    headerContainer: {
      flexDirection: 'row',
      width: '90%',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    headerText: {
      //text for different setting headers
      fontSize: 20,
      fontWeight: '700',
      color: theme.grey2,
    },
    modalText: {
      //text for diff modal texts
      fontSize: 18,
      fontWeight: '500',
    },
    textInput: {
      backgroundColor: '#fff',
      paddingVertical: 10,
      paddingHorizontal: 15,
      width: '90%',
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'left',
      borderRadius: 15,
      marginBottom: 23,
      // borderColor: theme.grey2,
      // borderWidth: 1,
    },
    tentChangeListItem: {
      //Style of an item in the member tentChange modal (for creator only)
      flexDirection: 'row',
      height: '33%',
      width: '95%',
      justifyContent: 'center',
      alignSelf: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: '#cfcfcf',
    },
    tentChangeBtn: {
      //remove button for removing member if the user is the Creator
      flexDirection: 'row',
      width: '90%',
      height: 45,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: 15,
      // borderColor: theme.grey2,
      // borderWidth: 1,
      paddingHorizontal: 15,
    },
    BottomModalView: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    leaveButton: {
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 15,
      position: 'absolute',
      bottom: '5%',
      width: '90%',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: theme.popOutBorder,
    },
  });
