import React, { useState, useCallback } from 'react';
import {
  Text,
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import {useTheme} from '../context/ThemeProvider';
/* let currentUserName;

firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid)
.get().then((doc) => {
  if (doc.exists) currentUserName = doc.data().username;
}).catch((error) => {
  console.log("Error getting document:", error);
});*/

let members = new Array(); //members array for list

export default function GroupInfo({ route }) {
  const [isReady, setIsReady] = useState(false); // for checking if firebase is read before rendering
  const [isModalVisible, setModalVisible] = useState(false);

  //These 2 hooks are used for identifying which member is clicked from the list
  const [currMember, setCurrMember] = useState('');
  const [currIndex, setCurrIndex] = useState(0);

  const { groupCode, groupName, groupRole } = route.params; // take in navigation parameters
  console.log('route params: ', route.params);
  const { theme } = useTheme();

  const GroupRef = firebase.firestore().collection('groups').doc(groupCode);
  //const GroupRef = firebase.firestore().collection('groupsTest').doc('BtycLIprkN3EmC9wmpaE');

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      console.log('GroupRef', route.params.groupCode);
      //const GroupRef = firebase.firestore().collection('groups').doc(route.params.groupCode);
      if (mounted) {
        members = [];
        setCurrIndex(0);
        //setIsReady(false);
      }
      async function prepare() {
        console.log('Group info screen is ready: ', isReady);
        try {
          await SplashScreen.preventAutoHideAsync();

          //Accesses Names of Members from firebase and adds them to the array
          await GroupRef.collection('members')
            .get()
            .then((querySnapshot) => {
              if (mounted) {
                //setIsReady(false);
                querySnapshot.forEach((doc) => {
                  let currName = doc.data().name; //gets current name in list
                  let tentCondition = doc.data().inTent; //gets tent status as well
                  let scheduledHours = doc.data().scheduledHrs;
                  //let scheduledHours = 0;
                  let memID = doc.id;

                  let current = {
                    //create new object for the current list item
                    id: memID,
                    name: currName,
                    inTent: tentCondition,
                    hours: scheduledHours,
                  };

                  let nameExists, tentStatusChanged; //checks if member is already in list array
                  if (members.length === 0) nameExists = false;
                  else {
                    nameExists = members.some((e) => e.name === currName);
                  }

                  if (mounted && !nameExists) {
                    // if not already in, add to the array
                    members.push(current);
                  }

                  let indexOfUser = members.findIndex(
                    (member) => member.id === memID
                  );
                  tentStatusChanged = !(
                    members[indexOfUser].inTent == tentCondition
                  );
                  // console.log('status1: ', members[indexOfUser].inTent);

                  // checks if tent status changed after refresh and updates list
                  if (nameExists && tentStatusChanged) {
                    members.splice(indexOfUser, 1);
                    members.insert(indexOfUser, current);
                  }

                  // doc.data() is never undefined for query doc snapshots
                });
                console.log('done reading members', members);
                //console.log('ARRAY: ', members);
              }
            })
            .catch((error) => {
              console.error(error);
            });
          //setCurrIndex(0);
        } catch (e) {
          console.warn(e);
        } finally {
          // Tell the application to render
          console.log('Group Info screen is now ready', members);
          setIsReady(true);
        }
      }
      if (mounted) {
        prepare();
      }

      return () => {
        //setCurrIndex(0);
        setIsReady(false);
        mounted = false;
      };
    }, [route.params])
  );

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const removeMember = () => {
    console.log('current member being deleted', members[currIndex].id);
    GroupRef.collection('members')
      .doc(members[currIndex].id)
      .delete()
      .then(() => {
        console.log(members[currIndex].id + ' removed from group');
      })
      .catch((error) => {
        console.error('Error removing member: ', error);
      });
    toggleModal();
  };

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  //Render Item for Each List Item of group members
  const Member = ({ name, id, backgroundColor }) => {
    const indexOfUser = members.findIndex((member) => member.id === id);
    //console.log(name, indexOfUser, members[indexOfUser].hours);
    return (
      <TouchableOpacity
        onPress={() => {
          toggleModal();
          setCurrMember(name);
          setCurrIndex(indexOfUser);
        }}
      >
        <View
          style={[
            styles(theme).listItem,
            backgroundColor,
            styles(theme).shadowProp,
            { flexDirection: 'row', justifyContent: 'space-evenly' },
          ]}
        >
          <Text style={styles(theme).listText}>{name}</Text>
          <Text style={{ color: theme.text1}}>
            Scheduled Hrs: {members[indexOfUser].hours} hrs
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  //variable for each name box, change color to green if status is inTent
  const renderMember = ({ item }) => {
    const backgroundColor = item.inTent ? '#3eb489' : '#1f509a';
    return (
      <Member
        name={item.name}
        id={item.id}
        backgroundColor={{ backgroundColor }}
      />
    );
  };

  if (!isReady) {
    //if firebase reading done, then render
    return null;
  }
  return (
    <View
      style={styles(theme).container}
      onLayout={onLayoutRootView}
      //showsVerticalScrollIndicator={false}
    >
      <Text style={styles(theme).header}>Group Name</Text>

      <View style={styles(theme).boxText}>
        <Text style={styles(theme).contentText}>{groupName}</Text>
      </View>

      <Text style={styles(theme).header}>Group Code</Text>
      <View style={styles(theme).boxText}>
        <Text selectable={true} style={styles(theme).contentText}>{groupCode}</Text>
      </View>

      <View>
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={(item) => item.id}
        />
      </View>

      <View>
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setModalVisible(false)}
        >
          <View style={styles(theme).popUp}>
            <View
              style={{
                flexDirextion: 'row',
                width: '90%',
                alignItems: 'flex-end',
              }}
            >
              <TouchableOpacity onPress={toggleModal}>
                <Icon
                  name='close'
                  color={'white'}
                  size={15}
                  style={{ marginTop: 5 }}
                />
              </TouchableOpacity>
            </View>

            <Text style={styles(theme).popUpHeader}>{currMember} Information</Text>
            <Text style={styles(theme).popUpText}>
              Scheduled Hrs: {members[currIndex].hours} hrs
            </Text>
            {groupRole === 'Creator' &&
            members[currIndex].id != firebase.auth().currentUser.uid ? (
              <TouchableOpacity onPress={removeMember}>
                <Text
                  style={{
                    textAlign: 'center',
                    color: theme.error,
                    fontSize: 15,
                  }}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.primaryContainer,
  },
  header: {
    marginBottom: 10,
    marginTop: 4,
    alignSelf: 'center',
    //borderWidth: 2,
    color: theme.greyPrimary,
    width: '90%',
    fontSize: 22,
    fontWeight: '700',
  },
  contentText: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  listItem: {
    backgroundColor: theme.primary,
    padding: 4,
    marginVertical: 3,
    borderRadius: 15,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  listText: {
    fontSize: 15,
    //fontFamily: 'sans-serif',
    fontWeight: '500',
    color: theme.text1,
  },
  boxText: {
    marginBottom: 10,
    width: '90%',
    backgroundColor: theme.white1,
    borderRadius: 8,
    alignSelf: 'center',
  },
  shadowProp: {
    shadowColor: '#171717',
    shadowOffset: { width: -2, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  popUp: {
    width: '90%',
    height: '15%',
    backgroundColor: theme.secondary,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 20,
    margin: 15,
  },
  popUpHeader: {
    fontWeight: '600',
    color: theme.text1,
    marginBottom: 5,
    textAlign: 'center',
    fontSize: 16,
    //borderWidth: 1
  },
  popUpText: {
    backgroundColor: theme.tertiary,
    color: theme.text1,
    textAlign: 'center',
    width: '90%',
    marginVertical: 8,
    padding: 5,
    borderRadius: 15,
  },
});
