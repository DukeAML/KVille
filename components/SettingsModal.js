import React, { useState } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { Formik } from 'formik';
import { useMutation, useQueryClient } from 'react-query';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { setGroupName, setUserName, setTentType } from '../redux/reducers/userSlice';
import { useTheme } from '../context/ThemeProvider';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ActionSheetModal } from './ActionSheetModal';
import { setSnackMessage, toggleSnackBar } from '../redux/reducers/snackbarSlice';

export default function SettingsModal({ params, navigation, toggleModal }) {
  const { groupCode, groupName, userName, tentType, groupRole } = params;
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [isTentChangeVisible, setTentChangeVisible] = useState(false);
  const [isModalSnackVisible, setModalSnackVisible] = useState(false);
  const [modalSnackMessage, setModalSnackMessage] = useState('');
  const dispatch = useDispatch();
  const { theme } = useTheme();

  const userRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);
  const groupRef = firebase.firestore().collection('groups').doc(groupCode);

  const postSave = useOnSave(groupCode);

  function useOnSave(groupCode) {
    const queryClient = useQueryClient();
    return useMutation((options) => onSave(options), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['group', groupCode]);
      },
    });
  }

  function onSave(options) {
    const { newGroupName, newUserName, newTentType } = options;
    let groupIndex;
    let groupCodeArr;
    let valid = true;

    if (newGroupName != groupName || newTentType != tentType) {
      userRef
        .get()
        .then((userDoc) => {
          groupCodeArr = userDoc.data().groupCode;
          groupIndex = groupCodeArr.findIndex((element) => element.groupCode == groupCode);
          console.log('group index', groupIndex);
          groupCodeArr[groupIndex] = {
            groupCode: groupCode,
            groupName: newGroupName,
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
              setModalSnackMessage('Error saving group name');
              toggleModalSnackBar();
              return;
            });
        });
      groupRef
        .update({
          name: newGroupName,
          tentType: newTentType,
        })
        .then(() => {
          console.log('successfully saved group settings');
        })
        .catch((error) => {
          console.log(error);
          setModalSnackMessage('Error saving group settings');
          toggleModalSnackBar();
          return;
        });
      dispatch(setTentType(newTentType));
      dispatch(setGroupName(newGroupName));
    }

    if (newUserName != userName) {
      groupRef
        .collection('members')
        .where('name', '==', newUserName)
        .get()
        .then((snapshot) => {
          if (snapshot.empty) {
            groupRef
              .collection('members')
              .doc(firebase.auth().currentUser.uid)
              .update({
                name: newUserName,
              })
              .then(() => {
                console.log('successfully updated name');
              })
              .catch((error) => {
                console.log(error);
                setModalSnackMessage('Error saving user name');
                toggleModalSnackBar();
                return;
              });
            dispatch(setUserName(newUserName));
          } else {
            setModalSnackMessage('Nickname taken');
            toggleModalSnackBar();
            valid = false
            return;
          }
        })
        .then(() => {
          if (valid) {
            dispatch(toggleSnackBar());
            dispatch(setSnackMessage('Saved'));
            toggleModal();
          }
        });
    } else {
      if (valid) {
        dispatch(toggleSnackBar());
        dispatch(setSnackMessage('Saved'));
        toggleModal();
      }
    }
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
  }
  function toggleTentChange() {
    setTentChangeVisible(!isTentChangeVisible);
  }
  function toggleModalSnackBar() {
    setModalSnackVisible(!isModalSnackVisible);
  }

  return (
    <View style={styles(theme).settingsContainer}>
      <Formik
        initialValues={{ newUserName: userName, newGroupName: groupName, newTentType: tentType }}
        onSubmit={(values) => postSave.mutate(values)}
        style={{ borderWidth: 1 }}
      >
        {({ handleChange, handleBlur, handleSubmit, setFieldValue, setFieldTouched, values }) => (
          <>
            <View style={styles(theme).topBanner}>
              <TouchableOpacity onPress={toggleModal}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primary }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles(theme).headerText, { color: theme.text2, alignSelf: 'center', fontSize: 26 }]}>
                Settings
              </Text>

              <TouchableOpacity onPress={handleSubmit}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: theme.primary }}>Save</Text>
              </TouchableOpacity>
            </View>

            <View style={styles(theme).headerContainer}>
              <Text style={styles(theme).headerText}>Nickname</Text>
              <Icon name='account-edit' color={theme.grey2} size={20} style={{ marginRight: 8 }} />
            </View>
            <TextInput
              name='newUserName'
              placeholder='Nickname'
              style={styles(theme).textInput}
              onChangeText={handleChange('newUserName')}
              onBlur={handleBlur('newUserName')}
              value={values.newUserName}
            />

            {groupRole === 'Creator' || groupRole == 'Admin' ? (
              <View style={{ width: '100%', alignItems: 'center', height: '55%' }}>
                <View style={styles(theme).headerContainer}>
                  <Text style={styles(theme).headerText}>Group Name</Text>
                  <Icon name='circle-edit-outline' color={theme.grey2} size={20} style={{ marginRight: 8 }} />
                </View>
                <TextInput
                  name='newGroupName'
                  placeholder='Group Name'
                  style={styles(theme).textInput}
                  onChangeText={handleChange('newGroupName')}
                  onBlur={handleBlur('newGroupName')}
                  value={values.newGroupName}
                />

                <View style={styles(theme).headerContainer}>
                  <Text style={styles(theme).headerText}>Tent Type</Text>
                  <Icon name='home-edit' color={theme.grey2} size={20} style={{ marginRight: 8 }} />
                </View>
                <TouchableOpacity onPress={toggleTentChange} style={styles(theme).tentChangeBtn}>
                  <Text style={styles(theme).modalText}>{values.newTentType}</Text>
                  <Icon name='chevron-down' color={theme.grey2} size={20} />
                </TouchableOpacity>
              </View>
            ) : null}

            {groupRole == 'Creator' || groupRole == 'Admin' ? (
              <ActionSheetModal
                isVisible={isTentChangeVisible}
                onBackdropPress={toggleTentChange}
                onSwipeComplete={toggleTentChange}
                toggleModal={toggleTentChange}
                cancelButton={true}
                height={180}
                userStyle={'dark'}
              >
                <TouchableOpacity
                  onPress={() => {
                    setFieldValue('newTentType', 'Black');
                    setFieldTouched('newTentType');
                    toggleTentChange();
                  }} //change to changing tent type
                  style={styles(theme).tentChangeListItem}
                >
                  <Text style={[styles(theme).modalText, { color: theme.text1, marginRight: 15 }]}>Black</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setFieldValue('newTentType', 'Blue');
                    setFieldTouched('newTentType');
                    toggleTentChange();
                  }}
                  style={styles(theme).tentChangeListItem}
                >
                  <Text style={[styles(theme).modalText, { color: theme.text1, marginRight: 15 }]}>Blue</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setFieldValue('newTentType', 'White');
                    setFieldTouched('newTentType');
                    toggleTentChange();
                  }}
                  style={[styles(theme).tentChangeListItem, { borderBottomWidth: 0 }]}
                >
                  <Text style={[styles(theme).modalText, { color: theme.text1, marginRight: 15 }]}>White</Text>
                </TouchableOpacity>
              </ActionSheetModal>
            ) : null}
          </>
        )}
      </Formik>

      <TouchableOpacity style={styles(theme).leaveButton} onPress={toggleConfirmation}>
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
        visible={isModalSnackVisible}
        onDismiss={() => setModalSnackVisible(false)}
        wrapperStyle={{ top: 0 }}
        duration={2000}
      >
        <Text style={{ textAlign: 'center', color: theme.text1 }}>{modalSnackMessage}</Text>
      </Snackbar>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    settingsContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      backgroundColor: '#fff',
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
      backgroundColor: theme.background,
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
      backgroundColor: theme.background,
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
      backgroundColor: '#ececec',
      borderRadius: 15,
      padding: 15,
      position: 'absolute',
      bottom: 10,
      width: '90%',
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: theme.popOutBorder,
    },
  });
