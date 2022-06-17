import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';
import * as SplashScreen from 'expo-splash-screen';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useSelector, useDispatch } from 'react-redux';
import {
  setGroupName,
  setUserName,
  setTentType,
} from '../redux/reducers/userSlice';

export default function Settings({ route, navigation }) {
  //let isCreator;
  const [isCreator, setCreator] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const dispatch = useDispatch();

  const toggleConfirmation = () => {
    setConfirmationVisible(!isConfirmationVisible);
  };

  //gets current user's group code from redux store
  //const groupCode = useSelector((state) => state.user.currGroupCode);

  const { groupCode, groupName, userName, tentType } = route.params;
  const [currGroupName, setCurrGroupName] = useState(groupName);
  const [name, setName] = useState(userName);
  const [tent, setTent] = useState(tentType);

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
          //console.log('groupCode used', groupCode);
          await groupRef
            .collection('members')
            .doc(firebase.auth().currentUser.uid)
            .get()
            .then((snapshot) => {
              if (mounted) {
                //console.log('GroupRole', snapshot.data().groupRole);
                if (snapshot.data().groupRole == 'Creator') {
                  //isCreator = true;
                  setCreator(true);
                  //console.log('set isCreator true');
                } else {
                  //isCreator = false;
                  setCreator(false);
                  //console.log('set isCreator false');
                }
              }
            });

          setCurrGroupName(groupName);
          setName(userName);
          setTent(tentType);
          //console.log('fetched isCreator from firebase', isCreator);
        } catch (e) {
          console.warn(e);
        } finally {
          // Tell the application to render
          setIsReady(true);
        }
      }

      prepare();

      return () => {
        mounted = false;
        setCurrGroupName(groupName);
        setName(userName);
        setTent(tentType);
        setIsReady(false);
        setCreator(false);
      };
    }, [route])
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
        userRef.update({
          groupCode: groupCodeArr,
        });
      });

    groupRef.update({
      name: currGroupName,
      tentType: tent,
    });
    groupRef.collection('members').doc(firebase.auth().currentUser.uid).update({
      name: name,
    });
    dispatch(setUserName(name));
    dispatch(setTentType(tent));
    dispatch(setGroupName(currGroupName));
  };

  const leaveGroup = () => {
    userRef.update({
      groupCode: firebase.firestore.FieldValue.arrayRemove({
        groupCode: groupCode,
        groupName: currGroupName,
      }),
    });
    if (isCreator) {
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

  const ConfirmationModal = () => {
    return (
      <View style={styles.confirmationPop}>
        <TouchableOpacity
          onPress={toggleConfirmation}
          style={{
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'flex-end',
          }}
        >
          <Icon
            name='close'
            color={'white'}
            size={15}
            style={{ marginTop: 3, marginRight: 10 }}
          />
        </TouchableOpacity>
        {isCreator ? (
          <Text style={styles.confirmationHeader}>Delete Group</Text>
        ) : (
          <Text style={styles.confirmationHeader}>Leave Group</Text>
        )}
        {isCreator ? (
          <Text style={styles.confirmationText}>
            Are you sure you want to DELETE this group? This will delete it for
            everyone in this group and CANNOT be undone.
          </Text>
        ) : (
          <Text style={styles.confirmationText}>
            Are you sure you want to LEAVE this group? This will delete all your
            information in this group and CANNOT be undone.
          </Text>
        )}

        <TouchableOpacity
          onPress={() => {
            leaveGroup();
            navigation.navigate('Start');
            toggleConfirmation();
          }}
          //onPress= {toggleConfirmation}
          style={styles.confirmationBottomBtn}
        >
          {isCreator ? (
            <Text style={[styles.buttonText, { color: 'white' }]}>
              Yes, Delete This Group
            </Text>
          ) : (
            <Text style={[styles.buttonText, { color: 'white' }]}>
              Yes, Leave This Group
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
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
    <View style={styles.settingsContainer}>
      <View style={styles.topBanner}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon name='cog-outline' color={'#fff'} size={35} />
          <Text
            style={[
              styles.headerText,
              { color: '#fff', width: '100%', marginLeft: 6 },
            ]}
          >
            Settings
          </Text>
        </View>
        <TouchableOpacity onPress={onSave}>
          <View>
            <Text
              style={[
                styles.groupText,
                {
                  fontSize: 21,
                  fontWeight: 700,
                  color: '#1F509A',
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
        <Text style={styles.headerText}>Name</Text>
        <Icon
          name='account-edit'
          color={'#656565'}
          size={20}
          style={{ marginRight: 8 }}
        />
      </View>
      <TextInput
        style={[styles.textInput, styles.shadowProp]}
        value={name}
        placeholder={name}
        onChangeText={(name) => setName(name)}
      />

      {/* <View style={styles.header}>
        <Icon name='cog-outline' color={'#fff'} size={50} />
        <Text style={{ color: '#fff' }}>Settings</Text>
      </View>
      <Text style={{ color: '#fff' }}>Name:</Text>
      <TextInput
        style={styles.textInput}
        value={name}
        placeholder={name}
        onChangeText={(name) => setName(name)}
      />
      {isCreator ? <Text style={{ color: '#fff' }}>Group Name:</Text> : null}
      {isCreator ? (
        <TextInput
          style={styles.textInput}
          value={currGroupName}
          placeholder={currGroupName}
          onChangeText={(groupName) => setCurrGroupName(groupName)}
        />
      ) : null}
      <Text style={{ color: '#fff' }}>Tent Type: </Text> */}
      {isCreator ? (
        <View
          style={{
            flexDirection: 'row',
            width: '90%',
            justifyContent: 'space-between',
          }}
        >
          <Text style={styles.headerText}>Group Name</Text>
          <Icon
            name='circle-edit-outline'
            color={'#656565'}
            size={20}
            style={{ marginRight: 8 }}
          />
        </View>
      ) : null}
      {isCreator ? (
        <TextInput
          style={[styles.textInput, styles.shadowProp]}
          value={currGroupName}
          placeholder={currGroupName}
          onChangeText={(groupName) => setCurrGroupName(groupName)}
        />
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          width: '90%',
          justifyContent: 'space-between',
        }}
      >
        <Text style={styles.headerText}>Tent Type</Text>
        <Icon
          name='home-edit'
          color={'#656565'}
          size={20}
          style={{ marginRight: 8 }}
        />
      </View>
      <Picker
        selectedValue={tent}
        onValueChange={(itemValue, itemIndex) => {
          setTent(itemValue);
        }}
        style={
          Platform.OS === 'ios' ? styles.picker : { width: '90%', height: 30 }
        }
        itemStyle={Platform.OS === 'ios' ? styles.pickerItem : {}}
      >
        <Picker.Item label='' value='' />
        <Picker.Item label='Black' value='Black' />
        <Picker.Item label='Blue' value='Blue' />
        <Picker.Item label='White' value='White' />
        <Picker.Item label='Walk up line' value='Walk up line' />
      </Picker>
      {/* <TouchableOpacity
        style={{
          backgroundColor: '#1F509A',
          padding: 15,
          position: 'absolute',
          bottom: 50,
          width: '100%',
          alignItems: 'center',
        }}
        onPress={onSave}
      >
        <Text style={{ color: '#fff' }}>Save</Text>
      </TouchableOpacity> */}
      <TouchableOpacity
        style={styles.button}
        /* onPress={() => {
          leaveGroup();
          navigation.navigate('Start');
        }} */
        onPress={toggleConfirmation}
      >
        {isCreator ? (
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
            Delete Group
          </Text>
        ) : (
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '500' }}>
            Leave Group
          </Text>
        )}
      </TouchableOpacity>

      <View>
        <Modal
          isVisible={isConfirmationVisible}
          onBackdropPress={() => setConfirmationVisible(false)}
        >
          <ConfirmationModal />
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsContainer: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    //backgroundColor: "#1f509a",
    backgroundColor: '#C2C6D0',
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
    color: '#656565',
  },
  textInput: {
    backgroundColor: '#f6f6f6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    width: '90%',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'left',
    borderRadius: 15,
    marginBottom: 23,
    borderColor: '#656565',
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
  confirmationPop: {
    width: '90%',
    height: 173,
    backgroundColor: '#1E3F66',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRadius: 20,
    margin: 15,
  },
  confirmationHeader: {
    //style for text at the top of the popup
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
  confirmationText: {
    backgroundColor: '#2E5984',
    color: 'white',
    textAlign: 'center',
    width: '90%',
    padding: 5,
    borderRadius: 15,
  },
  confirmationBottomBtn: {
    color: 'white',
    backgroundColor: 'black',
    width: '50%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 26,
  },
  button: {
    backgroundColor: '#1F509A',
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

/* const styles = StyleSheet.create({
  settingsContainer: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'center',
    //backgroundColor: "#1f509a",
    backgroundColor: '#C2C6D0',
  },
  backgroundImage: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
    //opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    left: 0,
  },
  button: {
    backgroundColor: '#1F509A',
    padding: 15,
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
});
 */
