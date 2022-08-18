import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';

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

  async function onLogout() {
    await AsyncStorage.multiRemove(['USER_EMAIL', 'USER_PASSWORD', PERSISTENCE_KEY]);
    await firebase.auth().signOut();
    dispatch(reset());
  }

  function toggleConfirmation() {
    setConfirmationVisible(!isConfirmationVisible);
  }

  return (
    <SafeAreaView style={styles(theme).settingsContainer}>
      <View style={styles(theme).topBanner}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name='arrow-back' color={theme.primary} size={30} style = {{marginTop:3}}/>
        </TouchableOpacity>
        <Text style={[styles(theme).titleText, { color: theme.text2, alignSelf: 'center', fontSize: 26 }]}>
          Settings
        </Text>
      </View>

      <Text style = {styles(theme).headerText}>User Settings</Text>
      <TouchableOpacity 
        style = {styles(theme).settingBtn}
        onPress={() => navigation.navigate('ChangeEmail')}>
        <View style = {styles(theme).rightOfBtn}>
          <Icon name='mail-outline' color={theme.grey2} size={22}/>
          <Text style={styles(theme).listText}>Update Email Address</Text>
        </View>
        <Icon name='arrow-forward' color={theme.grey2} size={25} style={{marginRight: 20}} />
      </TouchableOpacity>
      <TouchableOpacity 
        style = {styles(theme).settingBtn}
        onPress={() => navigation.navigate('ChangePassword')}>
        <View style = {styles(theme).rightOfBtn}>
          <Icon name='lock-closed-outline' color={theme.grey2} size={22}/>
          <Text style={styles(theme).listText}>Change Account Password</Text>
        </View>
        <Icon name='arrow-forward' color={theme.grey2} size={25} style={{marginRight: 20}} />
      </TouchableOpacity>
      
      {/* <TouchableOpacity 
        style = {styles(theme).settingBtn}
        onPress={onLogout}>
        <View style = {styles(theme).rightOfBtn}>
          <Icon name='log-out-outline' color={theme.grey2} size={22}/>
          <Text style={styles(theme).listText}>Logout</Text>
        </View>
        <Icon name='arrow-forward' color={theme.grey2} size={25} style={{marginRight: 20}} />
      </TouchableOpacity> */}


      <Text style = {[styles(theme).headerText, {marginTop: 15}]}>About</Text>
      <TouchableOpacity 
        style = {styles(theme).settingBtn}
        onPress={() => navigation.navigate('AboutScreen')}>
        <View style = {styles(theme).rightOfBtn}>
          <Icon name='apps-outline' color={theme.grey2} size={22}/>
          <Text style={styles(theme).listText}>About the App</Text>
        </View>
        <Icon name='arrow-forward' color={theme.grey2} size={25} style={{marginRight: 20}} />
      </TouchableOpacity>

      <Text style = {[styles(theme).headerText, {marginTop: 15}]}>Support</Text>
      <TouchableOpacity 
        style = {styles(theme).settingBtn}
        onPress={() => navigation.navigate('DeleteAccount')}>
        <View style = {styles(theme).rightOfBtn}>
          <Icon name='trash-outline' color={theme.error} size={22}/>
          <Text style={[styles(theme).listText, {color:theme.error}]}>Delete Account</Text>
        </View>
        <Icon name='arrow-forward' color={theme.grey2} size={25} style={{marginRight: 20}} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles(theme).leaveButton} onPress={onLogout}>
        <Icon name='log-out-outline' color={theme.grey2} size={22} style={{marginRight: 15}}/>
        <Text style={{ color: theme.grey2, fontSize: 20, fontWeight: '500' }}>Logout</Text>
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
      //alignItems: 'center',
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
      justifyContent: 'flex-start',
      marginBottom: 30,
      width: '100%',
      paddingVertical: 10,
      borderBottomWidth: 0.5,
      borderColor: theme.popOutBorder,
      borderTopRightRadius: 20,
      borderTopLeftRadius: 20,
      paddingHorizontal: 20,
    },

    titleText: {
      //text for different setting headers
      fontSize: 20,
      fontWeight: '600',
      color: theme.grey2,
      marginLeft: 25,
    },
    headerText: {
      fontSize: 17,
      color: theme.grey2,
      fontWeight: '600',
      marginLeft: 20,
      marginBottom: 7,
    },
    rightOfBtn: {
      flexDirection: 'row',
      marginLeft: 20,
    },
    listText:{
      fontSize: 16,
      fontWeight: '400',
      marginLeft: 20,
    },
/*     textInput: {
      backgroundColor: '#fff',
      paddingVertical: 10,
      paddingHorizontal: 15,
      width: '90%',
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'left',
      borderRadius: 15,
      marginBottom: 23,
    }, */
    settingBtn:{
      flexDirection: 'row',
      width: '100%',
      height: 50,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.white1,
    },
    leaveButton: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 15,
      position: 'absolute',
      bottom: '3%',
      width: '90%',
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'center',
      borderWidth: 0.5,
      borderColor: theme.popOutBorder,
    },
  });
