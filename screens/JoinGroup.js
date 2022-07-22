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
} from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';

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

let availability = new Array(336);
availability.fill(true);

const window = Dimensions.get('window');

export default function JoinGroup({ navigation }) {
  const [groupCode, setInputGroupCode] = useState('');
  const [name, setName] = useState('');
  const [dimensions, setDimensions] = useState({ window });
  const [isSnackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const { theme } = useTheme();

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  let groupName = '';

  const dispatch = useDispatch();

  const userName = useSelector((state) => state.user.currentUser.username);

  //on first render sets name to user's registered name
  //useEffect(() => {
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      if (mounted) {
        setName(userName);
      }
      return () => {
        setInputGroupCode('');
        mounted = false;
      };
    }, [])
  );

  async function onJoinGroup(navigation) {
    console.log('group code', groupCode);
    if (groupCode == '') {
      toggleSnackBar();
      setSnackMessage('Enter group code');
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
              toggleSnackBar();
              setSnackMessage('Group already full');
              return 'full';
            }
          });
        console.log(result);
        if (result == 'full') {
          return;
        }
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
        await userRef
          .get()
          .then((snapshot) => {
            dispatch(setCurrentUser(snapshot.data()));
            return snapshot;
          })
          .then((snapshot) => {
            navigation.navigate('GroupInfo', {
              groupCode: groupCode,
              groupName: groupName,
              groupRole: 'Member',
            });
          });
        // dispatch(inGroup());
        // dispatch(setGroupInfo({ groupCode: groupCode, userName: name }));
      } else {
        console.log('No group exists');
        toggleSnackBar();
        setSnackMessage("Invalid group code: group doesn't exist");
        return;
      }
    });
  }

  function toggleSnackBar() {
    setSnackVisible(!isSnackVisible);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
        <View style={styles(theme).container}>
          <TouchableOpacity
              style={{alignSelf:'flex-end', marginRight: '5%', alignItems: 'flex-end', marginVertical: 20}}
              onPress={() => {
                onJoinGroup(navigation);
              }}
            >
            <Text style={styles(theme).buttonText}>Join</Text>
          </TouchableOpacity>
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
            style={[styles(theme).textInput, styles(theme).shadowProp]}
            autoFocus={true}
            onChangeText={(code) => setInputGroupCode(code.trim())}
            value={groupCode}
            placeholder='Enter Group Code'
          />

          <View
            style={{
              flexDirection: 'row',
              width: '90%',
              marginBottom: 10,
              marginTop: 55,
            }}
          >
            <Text style={styles(theme).groupText}>Username</Text>
          </View>

          <TextInput
            style={[styles(theme).textInput, styles(theme).shadowProp]}
            value={name}
            placeholder={name}
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
          />

        </View>
      </KeyboardAvoidingView>
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
    container: {
      flexDirection: 'column',
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      marginTop: '0%',
    },
    textInput: {
      backgroundColor: theme.white2,
      padding: 10,
      width: '90%',
      fontSize: 20,
      fontWeight: '500',
      textAlign: 'center',
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
      color: theme.grey2,
    },
    button: {
      backgroundColor: theme.primary,
      padding: 15,
      borderRadius: 30,
      marginTop: 50,
      width: '50%',
    },
    buttonText: {
      fontSize: 24,
      color: theme.primary,
      fontWeight: '700',
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
