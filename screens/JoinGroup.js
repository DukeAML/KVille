import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useQueryClient } from 'react-query';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import {
  setCurrentUser,
  setGroupCode,
  setGroupName,
  setUserName,
  setTentType,
  setGroupRole,
} from '../redux/reducers/userSlice';
import { useTheme } from '../context/ThemeProvider';
import coachKLogo from '../assets/coachKLogo.png';
import { setSnackMessage, toggleSnackBar } from '../redux/reducers/snackbarSlice';

let availability = new Array(336);
availability.fill(true);

const window = Dimensions.get('window');

export default function JoinGroup({ navigation }) {
  const [groupCode, setInputGroupCode] = useState('');
  const [name, setName] = useState('');
  const [dimensions, setDimensions] = useState({ window });
  const { theme } = useTheme();
  let groupName = '';

  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const userName = useSelector((state) => state.user.currentUser.username);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      if (mounted) {
        console.log('reset username ' + userName);
        setName(userName);
        setInputGroupCode('');
      }
      return () => {
        mounted = false;
      };
    }, [])
  );

  async function onJoinGroup(navigation) {
    console.log('group code', groupCode);
    if (groupCode == '') {
      dispatch(setSnackMessage('Enter group code'));
      dispatch(toggleSnackBar());
      return;
    }
    if (name == '') {
      dispatch(setSnackMessage('Enter a nickname'));
      dispatch(toggleSnackBar());
      return;
    }
    const groupRef = firebase.firestore().collection('groups').doc(groupCode);
    const userRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);

    //checks to make sure entered group code exists
    await groupRef.get().then(async (docSnapshot) => {
      console.log('Group exists: ', docSnapshot.exists);
      if (docSnapshot.exists) {
        //Max 12 people in a group
        let result = await groupRef
          .collection('members')
          .get()
          .then((collSnap) => {
            console.log(collSnap.size);
            if (collSnap.size == 12) {
              console.log('Group is full');
              dispatch(toggleSnackBar());
              dispatch(setSnackMessage('Group already full'));
              return 'full';
            }
          });
        console.log(result);
        if (result == 'full') {
          return;
        }
        result = await groupRef
          .collection('members')
          .doc(firebase.auth().currentUser.uid)
          .get()
          .then((doc) => {
            if (doc.exists) {
              dispatch(setSnackMessage('Already joined this group'));
              dispatch(toggleSnackBar());
              return 'exists';
            }
          });
        if (result == 'exists') {
          return;
        }

        groupRef
          .collection('members')
          .where('name', '==', name)
          .get()
          .then(async (snapshot) => {
            if (snapshot.empty) {
              groupName = docSnapshot.data().name;
              dispatch(setGroupCode(groupCode));
              dispatch(setUserName(name));
              dispatch(setGroupName(groupName));
              dispatch(setTentType(docSnapshot.data().tentType));
              dispatch(setGroupRole('Member'));
              //updates current user's info
              await userRef.update({
                groupCode: firebase.firestore.FieldValue.arrayUnion({
                  groupCode: groupCode,
                  groupName: docSnapshot.data().name,
                }),
              });
              //adds current user to member list
              await groupRef.collection('members').doc(firebase.auth().currentUser.uid).set({
                groupRole: 'Member',
                name: name,
                inTent: false,
                availability: availability,
                scheduledHrs: 0,
                shifts: [],
              });
              await userRef.get().then((snapshot) => {
                dispatch(setCurrentUser(snapshot.data()));
              });

              queryClient.invalidateQueries(['groups', firebase.auth().currentUser.uid]);
              navigation.navigate('GroupInfo', {
                groupCode: groupCode,
                groupName: groupName,
                groupRole: 'Member',
              });
            } else {
              dispatch(toggleSnackBar());
              dispatch(setSnackMessage('Name already taken'));
            }
          });
        return;
      } else {
        console.log('No group exists');
        dispatch(toggleSnackBar());
        dispatch(setSnackMessage("Invalid group code: group doesn't exist"));
        return;
      }
    });
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
          <View style={styles(theme).container}>
            <View style={styles(theme).header}>
              <Text style={styles(theme).buttonText} onPress={() => navigation.goBack()}>
                Cancel
              </Text>
              <Text style={{ fontWeight: '500', fontSize: 20 }}>Join Group</Text>
              <TouchableOpacity
                onPress={() => {
                  onJoinGroup(navigation);
                }}
              >
                <Text style={styles(theme).buttonText}>Join</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                marginBottom: 10,
              }}
            >
              <Text style={styles(theme).groupText}>Group Code</Text>
            </View>

            <TextInput
              style={styles(theme).textInput}
              //autoFocus={true}
              onChangeText={(code) => setInputGroupCode(code.trim())}
              value={groupCode}
              placeholder='Enter Group Code'
              autoCorrect={false}
            />

            <View
              style={{
                flexDirection: 'row',
                width: '90%',
                marginBottom: 10,
                marginTop: 55,
              }}
            >
              <Text style={styles(theme).groupText}>Nickname</Text>
            </View>
            <TextInput
              style={styles(theme).textInput}
              value={name}
              placeholder='Enter Nickname'
              maxLength={11} //Maximize username length to 11 characters
              onChangeText={(name) =>
                setName(
                  name
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/\s+/g, '')
                    .replace(/[^a-z0-9]/gi, '')
                )
              }
              clearTextOnFocus={true}
              autoCorrect={false}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <View
        style={{
          marginTop: 'auto',
          width: '100%',
          backgroundColor: theme.background,
        }}
      >
        <View
          style={[
            styles(theme).triangle,
            {
              borderRightWidth: dimensions.window.width,
              borderTopWidth: dimensions.window.height / 5,
            },
          ]}
        ></View>
        <Image
          source={coachKLogo}
          style={{
            position: 'absolute',
            marginVertical: 20,
            zIndex: 1,
            height: 161,
            width: 140,
            alignSelf: 'center',
          }}
        />
        <View
          style={{
            width: '100%',
            height: dimensions.window.height / 10,
            backgroundColor: theme.primary,
          }}
        ></View>
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      marginTop: '0%',
    },
    header: {
      flexDirection: 'row',
      width: '94%',
      height: '10%',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    textInput: {
      backgroundColor: theme.background,
      padding: 10,
      width: '90%',
      fontSize: 20,
      fontWeight: '500',
      //textAlign: 'center',
      borderRadius: 8,
      borderColor: theme.grey2,
      borderWidth: 2,
    },
    groupText: {
      //text for 'Groups' and '+ Add Group'
      //fontFamily: "sans-serif",
      width: '90%',
      fontSize: 20,
      fontWeight: '700',
      color: theme.grey1,
    },
    buttonText: {
      fontSize: 18,
      color: theme.primary,
      fontWeight: '600',
      //textAlign: 'center',
    },
    shadowProp: {
      //shadow for the text input and image
      shadowColor: '#171717',
      shadowOffset: { width: -2, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 20,
    },
    triangle: {
      height: 0,
      width: 0,
      borderTopWidth: 150,
      borderRightColor: theme.primary,
      borderTopColor: 'transparent',
      transform: [{ scaleX: -1 }],
    },
  });
