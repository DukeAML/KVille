import React, { useState, useCallback } from 'react';
import { Text, View, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';

import {BottomSheetModal} from '../component/BottomSheetModal'

/* let currentUserName;

firebase.firestore().collection("users").doc(firebase.auth().currentUser.uid)
.get().then((doc) => {
  if (doc.exists) currentUserName = doc.data().username;
}).catch((error) => {
  console.log("Error getting document:", error);
});*/

let members = new Array(); //members array for list

export default function GroupInfo({ route }) {
  const [isModalVisible, setModalVisible] = useState(false);

  //These 2 hooks are used for identifying which member is clicked from the list
  const [currMember, setCurrMember] = useState({});
  //const [currIndex, setCurrIndex] = useState(0);

  const { groupCode, groupName, groupRole } = route.params; // take in navigation parameters
  //console.log('route params: ', route.params);
  const { theme } = useTheme();

  //const GroupRef = firebase.firestore().collection('groups').doc(groupCode);
  //const GroupRef = firebase.firestore().collection('groupsTest').doc('BtycLIprkN3EmC9wmpaE');

  const { isLoading, isError, error, data, refetch } = useQuery(
    ['group', groupCode],
    () => fetchGroupMembers(groupCode),
    { initialData: [] }
  );
  useRefreshOnFocus(refetch)

  async function fetchGroupMembers(groupCode) {
    console.log('passed group code', groupCode);
    const memberRef = firebase.firestore().collection('groups').doc(groupCode).collection('members');
    let data = [{}];
    await SplashScreen.preventAutoHideAsync();
    await memberRef
      .where('inTent', '==', true)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let currName = doc.data().name; //gets current name in list
          let tentCondition = doc.data().inTent; //gets tent status as well
          let scheduledHours = doc.data().scheduledHrs;
          let memID = doc.id;
          if (doc.id == firebase.auth().currentUser.uid) {
            data[0] = {
              id: memID,
              name: currName,
              inTent: tentCondition,
              hours: scheduledHours,
            };
          } else {
            data.push({
              id: memID,
              name: currName,
              inTent: tentCondition,
              hours: scheduledHours,
            });
          }
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    await memberRef
      .where('inTent', '!=', true)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let currName = doc.data().name; //gets current name in list
          let tentCondition = doc.data().inTent; //gets tent status as well
          let scheduledHours = doc.data().scheduledHrs;
          let memID = doc.id;
          if (doc.id == firebase.auth().currentUser.uid) {
            data[0] = {
              id: memID,
              name: currName,
              inTent: tentCondition,
              hours: scheduledHours,
            };
          } else {
            data.push({
              id: memID,
              name: currName,
              inTent: tentCondition,
              hours: scheduledHours,
            });
          }
        });
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    console.log('groupInfo data', data);
    return data;
  }

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const postRemoveMember = useRemoveMember(groupCode);

  function useRemoveMember(groupCode) {
    const queryClient = useQueryClient();
    return useMutation(() => removeMember(groupCode), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['group', groupCode]);
      },
    });
  }

  const removeMember = async (groupCode) => {
    console.log('current member being deleted', currMember.id);
    firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(currMember.id)
      .delete()
      .then(() => {
        console.log(currMember.id + ' removed from group');
      })
      .catch((error) => {
        console.error('Error removing member: ', error);
      });
    let groups;
    await firebase
      .firestore()
      .collection('users')
      .doc(currMember.id)
      .get()
      .then((doc) => {
        groups = doc.data().groupCode;
        for (let i=0; i<groups.length; i++) {
          if (groups[i].groupCode == groupCode) {
            groups.splice(i, 1);
            break;
          }
        }
        console.log('groups', groups);
      })
      .catch((error) => {
        console.error('Error removing member: ', error);
      });
    firebase.firestore().collection('users').doc(currMember.id).update({
      groupCode: groups,
    });
    toggleModal();
  };

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  //Render Item for Each List Item of group members
  const Member = ({ name, id, hours, backgroundColor }) => {
    //const indexOfUser = data.findIndex((member) => member.id === id);
    //console.log(name, indexOfUser, members[indexOfUser].hours);
    return (
      <TouchableOpacity
        onPress={() => {
          toggleModal();
          setCurrMember({ name: name, id: id, hours: hours });
          //setCurrIndex(indexOfUser);
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
          <Text style={{ color: theme.text1 }}>Scheduled Hrs: {hours} hrs</Text>
        </View>
      </TouchableOpacity>
    );
  };

  //variable for each name box, change color to green if status is inTent
  const renderMember = ({ item }) => {
    const backgroundColor = item.inTent ? '#3eb489' : '#1f509a';
    return <Member name={item.name} id={item.id} hours={item.hours} backgroundColor={{ backgroundColor }} />;
  };

  if (isLoading) {
    return null;
  }
  if (isError) {
    console.error(error);
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
        <Text selectable={true} style={styles(theme).contentText}>
          {groupCode}
        </Text>
      </View>

      <View>
        <FlatList data={data} renderItem={renderMember} keyExtractor={(item) => item.id} />
      </View>

      <View>

        <BottomSheetModal
          isVisible={isModalVisible} 
          onBackdropPress={() => setModalVisible(false)}
          onSwipeComplete = {toggleModal}
          color = {theme.secondary}
          height = '15%'
          barSize='small'
        >
          <BottomSheetModal.Header verticalMargin={3} fontSize = {18}>
            {currMember.name} Information
          </BottomSheetModal.Header>
          <BottomSheetModal.SecondContainer color={theme.tertiary} size = 'small'>
            <View style ={{justifyContent:'center', height: '100%'}}>
              <Text style={styles(theme).popUpText}>Scheduled Hrs: {currMember.hours} hrs</Text>
            </View>
            
            {groupRole === 'Creator' && currMember.id != firebase.auth().currentUser.uid ? (
              <TouchableOpacity onPress={()=>postRemoveMember.mutate()}>
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
          </BottomSheetModal.SecondContainer>
        </BottomSheetModal>

        {/* <Modal isVisible={isModalVisible} onBackdropPress={() => setModalVisible(false)}>
          <View style={styles(theme).popUp}>
            <View
              style={{
                flexDirextion: 'row',
                width: '90%',
                alignItems: 'flex-end',
              }}
            >
              <TouchableOpacity onPress={toggleModal}>
                <Icon name='close' color={'white'} size={15} style={{ marginTop: 5 }} />
              </TouchableOpacity>
            </View>

            <Text style={styles(theme).popUpHeader}>{currMember.name} Information</Text>
            <Text style={styles(theme).popUpText}>Scheduled Hrs: {currMember.hours} hrs</Text>
            {groupRole === 'Creator' && currMember.id != firebase.auth().currentUser.uid ? (
              <TouchableOpacity onPress={()=>postRemoveMember.mutate()}>
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
        </Modal> */}
      </View>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.primaryContainer,
    },
    header: {
      marginBottom: 10,
      marginTop: 4,
      alignSelf: 'center',
      //borderWidth: 2,
      color: theme.grey1,
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
   /*  popUp: {
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
    }, */
    popUpText: {
      backgroundColor: theme.tertiary,
      color: theme.text1,
      textAlign: 'center',
      fontSize: 18,
      //width: '90%',
      /* marginVertical: 8,
      padding: 5,
      borderRadius: 15, */
    },
  });
