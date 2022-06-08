import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useSelector, useDispatch } from 'react-redux';
import {
  setCurrentUser,
  setGroupCode,
  setGroupName,
  setUserName,
} from '../redux/reducers/userSlice';
// import { inGroup, setGroupInfo } from "../redux/reducers/userSlice";

let availability = new Array(336);
availability.fill(true);

export default function JoinGroup({ navigation }) {
  const [groupCode, setInputGroupCode] = useState('');
  const [name, setName] = useState('');
  //const [groupName, setGroupName] = useState('');
  let groupName = '';

  const dispatch = useDispatch();

  const userName = useSelector((state) => state.user.currentUser.name);

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

  const onJoinGroup = (navigation) => {
    console.log('group code', groupCode);
    const groupRef = firebase.firestore().collection('groups').doc(groupCode);
    const userRef = firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid);

    //Max 12 people in a group
    groupRef
      .collection('members')
      .get()
      .then((collSnap) => {
        if (collSnap.size > 12) {
          console.log('Group is full');
          return;
        }
      });

    //checks to make sure user isn't already in group
    groupRef
      .collection('members')
      .doc()
      .get(firebase.auth().currentUser.uid)
      .then((docSnap) => {
        if (docSnap.exists) {
          console.log('User already in group');
          return;
        }
      });

    //checks to make sure entered group code exists
    groupRef.get().then((docSnapshot) => {
      if (docSnapshot.exists) {
        groupName = docSnapshot.data().name;
        dispatch(setGroupCode(groupCode));
        dispatch(setUserName(name));
        dispatch(setGroupName(groupName));
        //updates current user's info
        firebase
          .firestore()
          .collection('users')
          .doc(firebase.auth().currentUser.uid)
          .update({
            groupCode: firebase.firestore.FieldValue.arrayUnion({
              groupCode: groupCode,
              groupName: docSnapshot.data().name,
            }),
          });
        //adds current user to member list
        groupRef
          .collection('members')
          .doc(firebase.auth().currentUser.uid)
          .set({
            groupRole: 'member',
            name: name,
            inTent: false,
            availability: availability,
          });
        // dispatch(inGroup());
        // dispatch(setGroupInfo({ groupCode: groupCode, userName: name }));
      } else {
        console.log('No group exists');
        //maybe add snack bar for this
      }
    });

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
          groupCode: groupCode,
          groupName: groupName,
        });
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <TouchableOpacity
          onPress={() => {
            onJoinGroup(navigation);
            //navigation.navigate("GroupNavigator");
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
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
          marginTop: 60,
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
    textAlign: 'left',
    width: '90%',
    fontSize: 20,
    fontWeight: '700',
    color: '#656565',
  },
  topBanner: {
    //for the top container holding "join group button"
    alignItems: 'flex-end',
    marginTop: 25,
    marginBottom: 60,
    width: '90%',
    //borderWidth: 2
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
    //shadow for the group cards
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 20,
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
