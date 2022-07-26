import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Text, View, StyleSheet, ImageBackground, TextInput, TouchableOpacity, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import * as SplashScreen from 'expo-splash-screen';
import { Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { setGroupName, setUserName, setTentType } from '../redux/reducers/userSlice';
import { useTheme } from '../context/ThemeProvider';
import { ConfirmationModal } from '../components/ConfirmationModal';

export default function Settings({ route, navigation }) {
  const { groupCode, groupName, userName, tentType } = route.params;
  const groupRole = useSelector((state) => state.user.currGroupRole);
  const [isReady, setIsReady] = useState(false);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [isSnackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [currGroupName, setCurrGroupName] = useState(groupName);
  const [name, setName] = useState(userName);
  const [tent, setTent] = useState(tentType);
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const userRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);
  const groupRef = firebase.firestore().collection('groups').doc(groupCode);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      async function prepare() {
        try {
          await SplashScreen.preventAutoHideAsync();

          if (mounted) {
            setCurrGroupName(groupName);
            setName(userName);
            setTent(tentType);
          }
          //console.log('fetched isCreator from firebase', isCreator);
        } catch (e) {
          console.warn(e);
        } finally {
          // Tell the application to render
          setIsReady(true);
        }
      }
      if (mounted) {
        prepare();
      }

      return () => {
        setCurrGroupName(groupName);
        setName(userName);
        setTent(tentType);
        //setIsReady(false);
        mounted = false;
      };
    }, [route.params])
  );

  function onSave() {
    let groupIndex;
    let groupCodeArr;
    userRef
      .get()
      .then((userDoc) => {
        groupCodeArr = userDoc.data().groupCode;
        groupIndex = groupCodeArr.findIndex((element) => element.groupCode == groupCode);
        console.log('group index', groupIndex);
        groupCodeArr[groupIndex] = {
          groupCode: groupCode,
          groupName: currGroupName,
        };
        return userDoc;
      })
      .then((doc) => {
        userRef
          .update({
            groupCode: groupCodeArr,
          })
          .then(() => {
            console.log('successfully saved groupName');
          })
          .catch((error) => {
            console.log(error);
            toggleSnackBar();
            setSnackMessage('Error saving group name');
            return;
          });
      });

    groupRef
      .update({
        name: currGroupName,
        tentType: tent,
      })
      .then(() => {
        console.log('successfully saved group settings');
      })
      .catch((error) => {
        console.log(error);
        toggleSnackBar();
        setSnackMessage('Error saving group settings');
        return;
      });

    groupRef
      .collection('members')
      .doc(firebase.auth().currentUser.uid)
      .update({
        name: name,
      })
      .then(() => {
        console.log('successfully updated name');
      })
      .catch((error) => {
        console.log(error);
        toggleSnackBar();
        setSnackMessage('Error saving user name');
        return;
      });
    dispatch(setUserName(name));
    dispatch(setTentType(tent));
    dispatch(setGroupName(currGroupName));
    toggleSnackBar();
    setSnackMessage('Saved');
  }

  function leaveGroup() {
    userRef.update({
      groupCode: firebase.firestore.FieldValue.arrayRemove({
        groupCode: groupCode,
        groupName: currGroupName,
      }),
    });
    if (groupRole === 'Creator') {
      groupRef
        .delete()
        .then(() => {
          console.log('Group successfully deleted!');
        })
        .catch((error) => {
          console.error('Error removing group: ', error);
        });
    } else {
      groupRef
        .collection('members')
        .doc(firebase.auth().currentUser.uid)
        .delete()
        .then(() => {
          console.log('Current user successfully removed from group!');
        })
        .catch((error) => {
          console.error('Error removing user: ', error);
        });
    }
  }

  function toggleConfirmation() {
    setConfirmationVisible(!isConfirmationVisible);
  };
  function toggleSnackBar() {
    setSnackVisible(!isSnackVisible);
  };

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <View style={styles(theme).settingsContainer} onLayout={onLayoutRootView}>
      <View style={styles(theme).topBanner}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name='cog-outline' color={theme.icon1} size={35} />

          <Text
            style={[
              styles(theme).headerText,
              { color: theme.text1, alignSelf: 'center', fontSize: 30, marginLeft: 10 },
            ]}
          >
            Settings
          </Text>
        </View>
        <TouchableOpacity onPress={onSave}>
          <Text
            style={[
              styles(theme).groupText,
              {
                fontSize: 18,
                fontWeight: '700',
                color: theme.primary,
              },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles(theme).headerContainer}>
        <Text style={styles(theme).headerText}>Name</Text>
        <Icon name='account-edit' color={theme.grey2} size={20} style={{ marginRight: 8 }} />
      </View>
      <TextInput
        style={styles(theme).textInput}
        value={name}
        placeholder={name}
        onChangeText={(name) =>
          setName(
            name
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/\s+/g, '')
              .replace(/[^a-z0-9]/gi, '')
          )
        }
      />
      {groupRole === 'Creator' ? (
        <View style={styles(theme).headerContainer}>
          <Text style={styles(theme).headerText}>Group Name</Text>
          <Icon name='circle-edit-outline' color={theme.grey2} size={20} style={{ marginRight: 8 }} />
        </View>
      ) : null}
      {groupRole === 'Creator' ? (
        <TextInput
          style={styles(theme).textInput}
          value={currGroupName}
          placeholder={currGroupName}
          onChangeText={(groupName) => setCurrGroupName(groupName)}
        />
      ) : null}
      {groupRole === 'Creator' ? (
        <View style={styles(theme).headerContainer}>
          <Text style={styles(theme).headerText}>Tent Type</Text>
          <Icon name='home-edit' color={theme.grey2} size={20} style={{ marginRight: 8 }} />
        </View>
      ) : null}
      {groupRole === 'Creator' ? (
        <Picker
          selectedValue={tent}
          onValueChange={(itemValue, itemIndex) => {
            setTent(itemValue);
          }}
          style={Platform.OS === 'ios' ? styles(theme).picker : { width: '90%', height: 30 }}
          itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
        >
          <Picker.Item label='Black' value='Black' />
          <Picker.Item label='Blue' value='Blue' />
          <Picker.Item label='White' value='White' />
          <Picker.Item label='Walk up line' value='Walk up line' />
        </Picker>
      ) : null}
      <TouchableOpacity style={styles(theme).button} onPress={toggleConfirmation}>
        {groupRole === 'Creator' ? (
          <Text style={{ color: theme.error, fontSize: 20, fontWeight: '500' }}>Delete Group</Text>
        ) : (
          <Text style={{ color: theme.error, fontSize: 20, fontWeight: '500' }}>Leave Group</Text>
        )}
      </TouchableOpacity>

      <ConfirmationModal
        body={
          groupRole === 'Creator'
            ? 'Are you sure you want to DELETE this group? This will delete it for everyone in this group and CANNOT be undone.'
            : 'Are you sure you want to LEAVE this group? This will delete all your information in this group and CANNOT be undone.'
        }
        buttonText={groupRole === 'Creator' ? 'Delete This Group' : 'Leave This Group'}
        buttonAction={() => {
          leaveGroup();
          navigation.navigate('Home');
        }}
        toggleModal={toggleConfirmation}
        isVisible={isConfirmationVisible}
        onBackdropPress={() => setConfirmationVisible(false)}
        onSwipeComplete={toggleConfirmation}
        userStyle='light'
      />
      <Snackbar
        visible={isSnackVisible}
        onDismiss={() => setSnackVisible(false)}
        wrapperStyle={{ top: 0 }}
        duration={2000}
      >
        <Text style={{ textAlign: 'center', color: theme.text1 }}>{snackMessage}</Text>
      </Snackbar>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    settingsContainer: {
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    topBanner: {
      //for the top container holding top 'settings' and save button
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 30,
      width: '90%',
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
    textInput: {
      backgroundColor: theme.white2,
      paddingVertical: 10,
      paddingHorizontal: 15,
      width: '90%',
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'left',
      borderRadius: 15,
      marginBottom: 23,
      borderColor: theme.grey2,
    },
    picker: {
      height: '25%',
      width: '90%',
    },
    pickerItem: {
      height: '100%',
    },
    BottomModalView: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    button: {
      backgroundColor: theme.white2,
      borderRadius: 15,
      padding: 15,
      position: 'absolute',
      bottom: 0,
      width: '90%',
      alignItems: 'center',
    },
    shadowProp: {
      //shadow for the text input and image
      shadowColor: '#171717',
      shadowOffset: { width: -2, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 20,
    },
  });
