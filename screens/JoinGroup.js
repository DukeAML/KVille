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

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentUser,
  setGroupCode,
  setGroupName,
  setUserName,
  setTentType,
} from '../redux/reducers/userSlice';
// import { inGroup, setGroupInfo } from "../redux/reducers/userSlice";
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

  const toggleSnackBar = () => {
    setSnackVisible(!isSnackVisible);
  };

  const onJoinGroup = async (navigation) => {
    console.log('group code', groupCode);
    if (groupCode == '') {
      toggleSnackBar();
      setSnackMessage('Enter group code');
      return;
    }
    const groupRef = firebase.firestore().collection('groups').doc(groupCode);
    const userRef = firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid);

    //checks to make sure entered group code exists
    await groupRef.get().then(async (docSnapshot) => {
      console.log("Group exists: ", docSnapshot.exists);
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
        //updates current user's info
        await userRef
          .update({
            groupCode: firebase.firestore.FieldValue.arrayUnion({
              groupCode: groupCode,
              groupName: docSnapshot.data().name,
            }),
          });
        //adds current user to member list
        await groupRef
          .collection('members')
          .doc(firebase.auth().currentUser.uid)
          .set({
            groupRole: 'member',
            name: name,
            inTent: false,
            availability: availability,
            scheduledHrs: 0,
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
            });
          });
        // dispatch(inGroup());
        // dispatch(setGroupInfo({ groupCode: groupCode, userName: name }));
      } else {
        console.log('No group exists');
        toggleSnackBar();
        setSnackMessage('Invalid group code: group doesn\'t exist');
        return;
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#C2C6D0' }}>
      <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
        <View style={styles.container}>
          <View style={styles.topBanner}>
            <TouchableOpacity
              onPress={() => {
                onJoinGroup(navigation);
                //navigation.navigate("GroupNavigator");
              }}
            >
              <View>
                <Text
                  style={[
                    styles.groupText,
                    {
                      fontSize: 20,
                      fontWeight: '700',
                      color: '#1f509a',
                      width: '100%',
                      //borderWidth: 2
                    },
                  ]}
                >
                  Join Group
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <View
            style={{
              flexDirection: 'row',
              width: '90%',
              marginBottom: 10,
            }}
          >
            <Text style={styles.groupText}>Group Code</Text>
          </View>

          <TextInput
            style={[styles.textInput, styles.shadowProp]}
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
            <Text style={styles.groupText}>Username</Text>
          </View>

          <TextInput
            style={[styles.textInput, styles.shadowProp]}
            value={name}
            placeholder={name}
            onChangeText={(name) => setName(name)}
          />
          {/* <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onJoinGroup(navigation);
          //navigation.navigate("GroupNavigator");
        }}
          >
        <Text style={styles.buttonText}>Join Group</Text>
      </TouchableOpacity> */}
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
            styles.triangle,
            {
              borderRightWidth: dimensions.window.width,
              borderTopWidth: dimensions.window.height / 5,
            },
          ]}
        ></View>
        {/* <View style={{ position: 'absolute', backgroundColor: 'black', width: 100, height: 100}}></View> */}
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
            backgroundColor: '#1F509A',
          }}
        ></View>
      </View>
      <Snackbar
        visible={isSnackVisible}
        onDismiss={() => setSnackVisible(false)}
        wrapperStyle={{ top: 0 }}
        duration={2000}
      >
        <View style={{ width: '100%' }}>
          <Text style={{ textAlign: 'center' }}>{snackMessage}</Text>
        </View>
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
    backgroundColor: '#C2C6D0',
    alignItems: 'center',
    marginTop: '0%',
  },
  textInput: {
    backgroundColor: '#f6f6f6',
    padding: 10,
    width: '90%',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'left',
    borderRadius: 8,
    borderColor: '#656565',
    borderWidth: 2,
    //height: "7%",
  },
  groupText: {
    //text for 'Groups' and '+ Add Group'
    //fontFamily: "sans-serif",
    width: '90%',
    fontSize: 20,
    fontWeight: '700',
    color: '#656565',
  },
  topBanner: {
    //for the top container holding "join group button"
    //alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    marginBottom: 40,
    width: '90%',
    //borderWidth: 2
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
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
    //position: "relative",
    //zIndex: 1,
    height: 0,
    width: 0,
    borderTopWidth: 150,
    borderRightColor: '#1F509A',
    //borderRightColor: 'transparent',
    //borderBottomColor: "#f5f5f5",
    borderTopColor: 'transparent',
    transform: [{ scaleX: -1 }],
  },
});

/*


<View style={styles.container}>
      <TextInput
        style={styles.textInput}
        onChangeText={(code) => setInputGroupCode(code.trim())}
        value={groupCode}
        placeholder="Enter Group Code"
      />
      <TextInput
        style={styles.textInput}
        value={name}
        placeholder={name}
        onChangeText={(name) => setName(name)}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          onJoinGroup(navigation);
          //navigation.navigate("GroupNavigator");
        }}
      >
        <Text style={styles.buttonText}>Join Group</Text>
      </TouchableOpacity>
    </View>

*/
