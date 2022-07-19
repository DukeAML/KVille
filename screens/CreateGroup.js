import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Snackbar } from 'react-native-paper';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { generateGroupCode } from '../backend/GroupCode';
import { useSelector, useDispatch } from 'react-redux';
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

//length of the group code
const GROUP_CODE_LENGTH = 8;

let availability = new Array(336);
availability.fill(true);

const window = Dimensions.get('window');

export default function CreateGroup({ navigation }) {
  const [group, setGroup] = useState({
    groupName: '',
    tentType: '',
    groupCode: '',
    userName: '',
    tentType: '',
  });
  const [isSnackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [dimensions, setDimensions] = useState({ window });
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const groupRole = 'Creator';

  const userRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);
  let groupRef;

  const userName = useSelector((state) => state.user.currentUser.username);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ window });
    });
    return () => subscription?.remove();
  });

  //on first render sets name to user's registered name
  //useEffect(() => {
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      if (mounted) {
        //setGroup({ ...group, userName: userName });
        setGroup({
          ...group,
          groupCode: generateGroupCode(GROUP_CODE_LENGTH),
          userName: userName,
        });
      }
      return () => {
        setGroup({ ...group, groupName: '' });
        mounted = false;
      };
    }, [])
  );

  //Create group function
  function onCreateGroup() {
    if (group.groupName == '') {
      toggleSnackBar();
      setSnackMessage('Enter group name');
      return;
    }
    if (group.tentType == '') {
      toggleSnackBar();
      setSnackMessage('Select tent type');
      return;
    }
    groupRef = firebase.firestore().collection('groups').doc(group.groupCode);
    //creates/adds to groups collection, adds doc with generated group code and sets name and tent type
    groupRef.set({
      name: group.groupName,
      tentType: group.tentType,
      groupSchedule: [],
      memberArr: [],
      previousSchedule: [],
      previousMemberArr: [],
    });
    //adds current user to collection of members in the group
    groupRef.collection('members').doc(firebase.auth().currentUser.uid).set({
      groupRole: groupRole,
      name: group.userName,
      inTent: false,
      availability: availability,
      scheduledHrs: 0,
    });
    //updates current user's inGroup and groupCode states
    userRef.update({
      groupCode: firebase.firestore.FieldValue.arrayUnion({
        groupCode: group.groupCode,
        groupName: group.groupName,
      }),
    });
    dispatch(setGroupCode(group.groupCode));
    dispatch(setGroupName(group.groupName));
    dispatch(setUserName(group.userName));
    dispatch(setTentType(group.tentType));
    dispatch(setGroupRole('Creator'));
    userRef
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          dispatch(setCurrentUser(snapshot.data()));
        } else {
          console.log('does not exist');
        }
        return snapshot;
      })
      .then((snapshot) => {
        navigation.navigate('GroupInfo', {
          groupCode: group.groupCode,
          groupName: group.groupName,
          groupRole: 'Creator',
        });
      });
  }

  function toggleSnackBar() {
    setSnackVisible(!isSnackVisible);
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
        <View style={styles(theme).groupContainer}>
          {/* <View style={styles(theme).topBanner}>
            <TouchableOpacity
              onPress={() => {
                onCreateGroup();
                //navigation.navigate("GroupNavigator");
                console.log(group.groupCode);
                console.log(groupRole);
              }}
            >
              <View>
                <Text
                  style={[
                    styles(theme).groupText,
                    {
                      fontSize: 24,
                      fontWeight: '700',
                      color: theme.primary,
                      width: '100%',
                      //borderWidth: 2
                    },
                  ]}
                >
                  Create
                </Text>
              </View>
            </TouchableOpacity>
          </View> */}

          <View style={{ width: '90%' }}>
            <Text style={styles(theme).headerText}>Group Name</Text>
          </View>
          <TextInput
            style={styles(theme).textInput}
            autoFocus={true}
            placeholder='Enter Group Name'
            value={group.groupName}
            maxLength={28}
            onChangeText={(groupName) => setGroup({ ...group, groupName: groupName })}
          />

          <Text style={[styles(theme).headerText, { marginTop: 20 }]}>Group Code</Text>
          <View
            style={[
              styles(theme).textInput,
              {
                backgroundColor: theme.white1,
                height: 50,
                width: '90%',
                justifyContent: 'center',
                flexDirection: 'row',
                alignItems: 'center',
                //flex: 0.2
              },
            ]}
          >
            <Text
              selectable={true}
              style={{
                textAlign: 'center',
                fontSize: 26,
                fontWeight: '700',
                //flex: 1,
              }}
            >
              {group.groupCode}
            </Text>
          </View>

          <Text style={[styles(theme).headerText, { marginTop: 20 }]}>Tent Type</Text>
          <Picker
            selectedValue={group.tentType}
            onValueChange={(itemValue, itemIndex) => {
              setGroup({ ...group, tentType: itemValue });
            }}
            style={Platform.OS === 'ios' ? styles(theme).picker : { width: '90%', height: 30 }}
            itemStyle={Platform.OS === 'ios' ? styles(theme).pickerItem : {}}
          >
            <Picker.Item label='' value='' />
            <Picker.Item label='Black' value='Black' />
            <Picker.Item label='Blue' value='Blue' />
            <Picker.Item label='White' value='White' />
            <Picker.Item label='Walk up line' value='Walk up line' />
          </Picker>

          <Text style={[styles(theme).headerText, { marginTop: 20 }]}>Username</Text>

          <TextInput
            style={[styles(theme).textInput, { borderWidth: 2, borderColor: theme.grey5 }]}
            value={group.userName}
            placeholder={group.userName}
            maxLength={11}
            onChangeText={(userName) =>
              setGroup({
                ...group,
                userName: userName
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/\s+/g, '')
                  .replace(/[^a-z0-9]/gi, ''),
              })
            }
          />
          <TouchableOpacity
            onPress={() => {
              onCreateGroup();
              console.log(group.groupCode);
              console.log(groupRole);
            }}
            style={styles(theme).createBtn}
          >
            <Text style={styles(theme).btnTxt}>Create</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
      <View
        style={{
          /* position: "absolute",
          bottom: 0, */
          marginTop: 'auto',
          width: '100%',
        }}
      >
        <View
          style={[
            styles(theme).triangle,
            {
              borderRightWidth: dimensions.window.width,
              borderTopWidth: dimensions.window.height / 6,
            },
          ]}
        ></View>
        <Image
          source={coachKLogo}
          style={{
            position: 'absolute',
            marginVertical: 10,
            zIndex: 1,
            height: 129,
            width: 113,
            alignSelf: 'center',
          }}
        />
        <View
          style={{
            width: '100%',
            height: dimensions.window.height / 15,
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
    groupContainer: {
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    backgroundImage: {
      flex: 1,
      alignItems: 'center',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      resizeMode: 'cover',
    },
    topBanner: {
      //for the top container holding "create" button
      alignItems: 'center',
      justifyContent: 'flex-end',
      flexDirection: 'row',
      marginTop: 10,
      marginBottom: 12,
      width: '90%',
      //borderWidth: 2
    },
    headerText: {
      //text for 'headers of each input'
      textAlign: 'left',
      width: '90%',
      fontSize: 20,
      marginBottom: 10,
      fontWeight: '700',
      color: theme.grey2,
    },
    textContainer: {
      height: '70%',
      width: '80%',
      marginVertical: 50,
      //justifyContent: 'space-between'
    },
    text: {
      color: theme.text1,
      fontSize: 22,
      fontWeight: '700',
    },
    centerText: {
      color: theme.text1,
      fontSize: 36,
      fontWeight: '700',
      textAlign: 'center',
    },
    textInput: {
      backgroundColor: theme.white2,
      padding: 10,
      width: '90%',
      fontSize: 20,
      fontWeight: '400',
      textAlign: 'center',
      borderRadius: 15,
      borderColor: theme.grey2,
      borderWidth: 2,
    },
    picker: {
      width: '90%',
      height: '20%',
      //borderWidth: 2,
    },
    pickerItem: {
      height: '100%',
    },
    createBtn: {
      backgroundColor: theme.primary,
      padding: 15,
      borderRadius: 30,
      marginTop: 30,
      width: '50%',
    },
    btnTxt: {
      fontSize: 20,
      color: theme.text1,
      textAlign: 'center',
    },
    triangle: {
      //position: "relative",
      //zIndex: 1,
      height: 0,
      width: 0,
      borderTopWidth: 150,
      borderRightColor: theme.primary,
      borderTopColor: 'transparent',
      transform: [{ scaleX: -1 }],
    },
  });
