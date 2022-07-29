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
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSelector, useDispatch } from 'react-redux';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { generateGroupCode } from '../backend/GroupCode';
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
import { ActionSheetModal } from '../components/ActionSheetModal';
import { setSnackMessage, toggleSnackBar } from '../redux/reducers/snackbarSlice';

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
    tentType: 'Select Tent Type',
  });
  const [isTentChangeVisible, setTentChangeVisible] = useState(false);
  //const [selectedTent, setSelectedTent] = useState('Select Tent Type');
  const [dimensions, setDimensions] = useState({ window });
  const { theme } = useTheme();
  const dispatch = useDispatch();

  const groupRole = 'Creator';

  const userRef = firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid);
  let groupRef;

  const userName = useSelector((state) => state.user.currentUser.username);

  function toggleTentChange() {
    setTentChangeVisible(!isTentChangeVisible);
  }

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
      dispatch(toggleSnackBar());
      dispatch(setSnackMessage('Enter group name'));
      return;
    }
    if (group.tentType == 'Select Tent Type') {
      dispatch(toggleSnackBar());
      dispatch(setSnackMessage('Select tent type'));
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
      shifts: [],
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

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
          <View style={styles(theme).groupContainer}>
            <View style={styles(theme).groupHeader}>
              <Text style={styles(theme).btnTxt} onPress={() => navigation.goBack()}>
                Cancel
              </Text>
              <Text style={{ fontWeight: '500', fontSize: 20 }}>Create Group</Text>
              <TouchableOpacity
                onPress={() => {
                  onCreateGroup();
                  console.log(group.groupCode);
                  console.log(groupRole);
                }}
              >
                <Text style={styles(theme).btnTxt}>Create</Text>
              </TouchableOpacity>
            </View>

            <View style={{ width: '90%' }}>
              <Text style={styles(theme).headerText}>Group Name</Text>
            </View>
            <TextInput
              style={styles(theme).textInput}
              //autoFocus={true}
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
                },
              ]}
            >
              <Text selectable={true} style={{ textAlign: 'center', fontSize: 26, fontWeight: '700' }}>
                {group.groupCode}
              </Text>
            </View>

            <Text style={[styles(theme).headerText, { marginTop: 20 }]}>Tent Type</Text>
            <TouchableOpacity onPress={toggleTentChange} style={styles(theme).selectTent}>
              <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: '400' }}>{group.tentType}</Text>
              <Icon name='chevron-down' color={theme.icon2} size={30} style={{ marginLeft: 10 }} />
            </TouchableOpacity>

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
          </View>

          <ActionSheetModal
            isVisible={isTentChangeVisible}
            onBackdropPress={toggleTentChange}
            onSwipeComplete={toggleTentChange}
            toggleModal={toggleTentChange}
            cancelButton={true}
            height={180}
            userStyle={'light'}
          >
            <TouchableOpacity
              onPress={() => {
                setGroup({ ...group, tentType: 'Black' });
                toggleTentChange();
              }} //change to new tent type
              style={styles(theme).tentChangeListItem}
            >
              <Text style={styles(theme).modalText}>Black</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setGroup({ ...group, tentType: 'Blue' });
                toggleTentChange();
              }} //change to new tent type
              style={styles(theme).tentChangeListItem}
            >
              <Text style={styles(theme).modalText}>Blue</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setGroup({ ...group, tentType: 'White' });
                toggleTentChange();
              }} //change to new tent type
              style={[styles(theme).tentChangeListItem, { borderBottomWidth: 0 }]}
            >
              <Text style={styles(theme).modalText}>White</Text>
            </TouchableOpacity>
          </ActionSheetModal>
        </KeyboardAvoidingView>
      </SafeAreaView>

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
    groupHeader: {
      flexDirection: 'row',
      width: '94%',
      height: '10%',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
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
    selectTent: {
      width: '90%',
      height: 45,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.grey2,
      backgroundColor: '#ececec',
      justifyContent: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
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
    modalText: {
      //style of text within the modals (member info text and tentChange text)
      fontSize: 18,
      fontWeight: '500',
      color: theme.text2,
    },
    picker: {
      width: '90%',
      height: '20%',
      //borderWidth: 2,
    },
    pickerItem: {
      height: '100%',
    },
    btnTxt: {
      fontSize: 18,
      color: theme.primary,
      fontWeight: '600',
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
