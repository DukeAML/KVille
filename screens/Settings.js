import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import * as SplashScreen from 'expo-splash-screen';
import { Snackbar } from 'react-native-paper';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useSelector, useDispatch } from 'react-redux';
import {
  setGroupName,
  setUserName,
  setTentType,
} from '../redux/reducers/userSlice';
import { useTheme } from '../context/ThemeProvider';

import {ConfirmationModal} from '../component/ConfirmationModal'

let prevTentType;

export default function Settings({ route, navigation }) {
  const [isReady, setIsReady] = useState(false);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [isSnackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const dispatch = useDispatch();
  const { theme } = useTheme();
  const { groupCode, groupName, userName, tentType } = route.params;
  const [currGroupName, setCurrGroupName] = useState(groupName);
  const [name, setName] = useState(userName);
  const [tent, setTent] = useState(tentType);
  const groupRole = useSelector((state) => state.user.currGroupRole);

  const toggleConfirmation = () => {
    setConfirmationVisible(!isConfirmationVisible);
  };
  const toggleSnackBar = () => {
    setSnackVisible(!isSnackVisible);
  };

  console.log('Settings route params', route.params);
  //gets current user's group role from redux store

  const userRef = firebase
    .firestore()
    .collection('users')
    .doc(firebase.auth().currentUser.uid);
  const groupRef = firebase.firestore().collection('groups').doc(groupCode);

  //sets states to updated params after each time param is changed
  // useEffect(() => {
  //   let mounted = true;
  //   //console.log("route params after change", route.params);
  //   setCurrGroupName(groupName);
  //   setName(userName);
  //   setTent(tentType);
  //   return () => (mounted = false);
  // }, [userName]);

  //useEffect(() => {
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

  const onSave = () => {
    let groupIndex;
    let groupCodeArr;
    userRef
      .get()
      .then((userDoc) => {
        groupCodeArr = userDoc.data().groupCode;
        groupIndex = groupCodeArr.findIndex(
          (element) => element.groupCode == groupCode
        );
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

    console.log('prevTentType', prevTentType);
    console.log('currTentType', tent);
    // if (prevTentType) {
    //   groupRef
    //     .update({
    //       groupSchedule: [],
    //     })
    //     .then(() => {
    //       console.log('cleared group schedule');
    //     })
    //     .catch((error) => {
    //       console.log(error);
    //     });
    // }

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
  };

  const leaveGroup = () => {
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
  };

  // const ConfirmationModal = () => {
  //   return (
  //     <View>
  //       <View style={styles(theme).confirmationPop}>
  //         {/* <TouchableOpacity
  //           onPress={toggleConfirmation}
  //           style={{
  //             flexDirection: 'row',
  //             width: '100%',
  //             justifyContent: 'flex-end',
  //           }}
  //         >
  //           <Icon
  //             name='close'
  //             color={'white'}
  //             size={15}
  //             style={{ marginTop: 3, marginRight: 10 }}
  //           />
  //         </TouchableOpacity> */}
  //       {/*  {groupRole === 'Creator' ? (
  //           <Text style={styles(theme).confirmationHeader}>Delete Group</Text>
  //         ) : (
  //           <Text style={styles(theme).confirmationHeader}>Leave Group</Text>
  //         )} */}
  //         <View style = {{height: '60%', width: '100%', justifyContent:'center', borderBottomWidth: 1,
  //             borderBottomColor: 'white', padding: 10}}>
  //           {groupRole === 'Creator' ? (
  //             <Text style={styles(theme).confirmationText}>
  //               Are you sure you want to DELETE this group? This will delete it for
  //               everyone in this group and CANNOT be undone.
  //             </Text>
  //           ) : (
  //             <Text style={styles(theme).confirmationText}>
  //               Are you sure you want to LEAVE this group? This will delete all your
  //               information in this group and CANNOT be undone.
  //             </Text>
  //           )}
  //         </View>
          

  //         <TouchableOpacity
  //           onPress={() => {
  //             leaveGroup();
  //             navigation.navigate('Start');
  //             toggleConfirmation();
  //           }}
  //           //onPress= {toggleConfirmation}
  //           style = {{height: '40%', width: '100%'}}
  //           //style={styles(theme).confirmationBottomBtn}
  //         >
  //           <View style = {{height: '100%', width: '100%', justifyContent:'center'}}>
  //             {groupRole === 'Creator' ? (
  //               <Text 
  //                 style={[
  //                   styles(theme).confirmationHeader, 
  //                   { color: theme.error, }
  //                 ]}>
  //                 Delete This Group
  //               </Text>
  //             ) : (
  //               <Text 
  //                 style={[
  //                   styles(theme).confirmationHeader, 
  //                   { color: theme.error,  }
  //               ]}>
  //                 Leave This Group
  //               </Text>
  //             )}
  //           </View>
            
  //         </TouchableOpacity>
  //       </View>
  //       <TouchableOpacity
  //         onPress= {toggleConfirmation}
  //         style={styles(theme).confirmationBottomBtn}
  //       >
  //         <Text style= {[styles(theme).confirmationHeader, { color: theme.text1 }]}>Cancel</Text>
  //       </TouchableOpacity>
  //     </View>
      
  //   );
  // };

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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name='cog-outline' color={theme.icon1} size={35} />
          <Text
            style={[
              styles(theme).headerText,
              { color: theme.text1, width: '100%', marginLeft: 6 },
            ]}
          >
            Settings
          </Text>
        </View>
        <TouchableOpacity onPress={onSave}>
          <View>
            <Text
              style={[
                styles(theme).groupText,
                {
                  fontSize: 21,
                  fontWeight: '700',
                  color: theme.primary,
                },
              ]}
            >
              Save
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View
        style={{
          flexDirection: 'row',
          width: '90%',
          justifyContent: 'space-between',
        }}
      >
        <Text style={styles(theme).headerText}>Name</Text>
        <Icon
          name='account-edit'
          color={theme.grey2}
          size={20}
          style={{ marginRight: 8 }}
        />
      </View>
      <TextInput
        style={[styles(theme).textInput, styles(theme).shadowProp]}
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
        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            justifyContent: 'space-between',
          }}
        >
          <Text style={styles(theme).headerText}>Group Name</Text>
          <Icon
            name='circle-edit-outline'
            color={theme.grey2}
            size={20}
            style={{ marginRight: 8 }}
          />
        </View>
      ) : null}
      {groupRole === 'Creator' ? (
        <TextInput
          style={[styles(theme).textInput, styles(theme).shadowProp]}
          value={currGroupName}
          placeholder={currGroupName}
          onChangeText={(groupName) => setCurrGroupName(groupName)}
        />
      ) : null}
      {groupRole === 'Creator' ? (
        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            justifyContent: 'space-between',
          }}
        >
          <Text style={styles(theme).headerText}>Tent Type</Text>
          <Icon
            name='home-edit'
            color={theme.grey2}
            size={20}
            style={{ marginRight: 8 }}
          />
        </View>
      ) : null}
      {groupRole === 'Creator' ? (
        <Picker
          selectedValue={tent}
          onValueChange={(itemValue, itemIndex) => {
            prevTentType = tent;
            setTent(itemValue);
          }}
          style={
            Platform.OS === 'ios'
              ? styles(theme).picker
              : { width: '90%', height: 30 }
          }
          itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
        >
          <Picker.Item label='Black' value='Black' />
          <Picker.Item label='Blue' value='Blue' />
          <Picker.Item label='White' value='White' />
          <Picker.Item label='Walk up line' value='Walk up line' />
        </Picker>
      ) : null}
      <TouchableOpacity
        style={styles(theme).button}
        onPress={toggleConfirmation}
      >
        {groupRole === 'Creator' ? (
          <Text style={{ color: theme.error, fontSize: 20, fontWeight: '500' }}>
            Delete Group
          </Text>
        ) : (
          <Text style={{ color: theme.error, fontSize: 20, fontWeight: '500' }}>
            Leave Group
          </Text>
        )}
      </TouchableOpacity>

      <View>
        {/* <Modal
          isVisible={isConfirmationVisible}
          onBackdropPress={() => setConfirmationVisible(false)}
          style={styles(theme).BottomModalView}
          onSwipeComplete={toggleConfirmation}
          swipeDirection={['down']}
        >
          <ConfirmationModal />
        </Modal> */}
        {/* <Modal
          isVisible={isConfirmationVisible}
          onBackdropPress={() => setConfirmationVisible(false)}
          style={styles(theme).BottomModalView}
          onSwipeComplete={toggleConfirmation}
          swipeDirection={['down']}
        > */}
          <ConfirmationModal 
            body= {groupRole === 'Creator' ? 
                    'Are you sure you want to DELETE this group? This will delete it for everyone in this group and CANNOT be undone.'
                  : 'Are you sure you want to LEAVE this group? This will delete all your information in this group and CANNOT be undone.'}
            buttonText = {groupRole === 'Creator' ? 'Delete This Group' : 'Leave This Group'}
            buttonAction = {() => {
              leaveGroup();
              navigation.navigate('Start');
            }}
            toggleModal = {toggleConfirmation}

            isVisible={isConfirmationVisible}
            onBackdropPress={() => setConfirmationVisible(false)}
            onSwipeComplete={toggleConfirmation}

            userStyle = 'light'
          />
        {/* </Modal> */}
        
      </View>

      <Snackbar
        visible={isSnackVisible}
        onDismiss={() => setSnackVisible(false)}
        wrapperStyle={{ top: 0 }}
        duration={2000}
      >
        <Text style={{ textAlign: 'center', color: theme.text1 }}>
          {snackMessage}
        </Text>
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
      //backgroundColor: "#1f509a",
      backgroundColor: theme.background,
    },
    topBanner: {
      //for the top container holding top 'settings' and save button
      alignItems: 'center',
      justifyContent: 'space-between',
      flexDirection: 'row',
      marginTop: 25,
      marginBottom: 30,
      width: '90%',
      //borderWidth: 2
    },
    headerText: {
      //text for different setting headers
      textAlign: 'left',
      width: '90%',
      fontSize: 20,
      marginBottom: 10,
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
      borderWidth: 2,
    },
    picker: {
      height: '25%',
      width: '90%',
      //borderWidth: 2,
    },
    pickerItem: {
      height: '100%',
    },
    BottomModalView:{
      margin: 0,
      justifyContent: 'flex-end',
    },
    /* confirmationPop: {
      width: '90%',
      height: 130,
      backgroundColor: '#424242',//theme.primary,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'space-evenly',
      borderRadius: 20,
      margin: 15,
    },
    confirmationHeader: {
      //style for text at the top of the popup
      fontWeight: '700',
      //color: theme.text1,
      textAlign: 'center',
      fontSize: 20,
    },
    confirmationText: {
      //backgroundColor: '#424242',
      
      color: theme.text1,
      textAlign: 'center',
      justifyContent: 'center',
      //height: '50%',
      //width: '100%',
      padding: 5,
      //borderRadius: 15,
    },
    confirmationBottomBtn: {
      color: theme.text1,
      backgroundColor: '#424242',
      alignSelf: 'center',
      width: '90%',
      borderRadius: 15,
      justifyContent: 'center',
      alignItems: 'center',
      height: 65,
      marginBottom: 15,
    }, */
    button: {
      backgroundColor: theme.primary,
      padding: 15,
      position: 'absolute',
      bottom: 0,
      width: '100%',
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
