import React, { useState, useCallback, useRef } from 'react';
import { Animated, Text, View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Divider } from 'react-native-paper';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { ConfirmationModal } from '../component/ConfirmationModal';
import { ActionSheetModal } from '../component/ActionSheetModal';
import { LoadingIndicator } from '../component/LoadingIndicator';

export default function GroupInfo({ route }) {
  const { groupCode, groupName, groupRole } = route.params; // take in navigation parameters
  const [isModalVisible, setModalVisible] = useState(false);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);
  const [isRoleChangeVisible, setRoleChangeVisible] = useState(false);
  //These 2 hooks are used for identifying which member is clicked from the list
  const currMember = useRef({});
  const [userMember, setUserMember] = useState();

  const { theme } = useTheme();

  function toggleModal() {
    setModalVisible(!isModalVisible);
  }
  function toggleConfirmation() {
    setConfirmationVisible(!isConfirmationVisible);
  }
  function toggleRoleChange() {
    setRoleChangeVisible(!isRoleChangeVisible);
  }

  const { isLoading, isError, error, data, refetch } = useQuery(
    ['group', groupCode],
    () => fetchGroupMembers(groupCode),
    { initialData: [] }
  );
  useRefreshOnFocus(refetch);

  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

  //Function for gathering member information from database
  async function fetchGroupMembers(groupCode) {
    console.log('passed group code', groupCode);
    const memberRef = firebase.firestore().collection('groups').doc(groupCode).collection('members');
    let data = [];
    await SplashScreen.preventAutoHideAsync();
    await memberRef
      .where('inTent', '==', true)
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          let currName = doc.data().name; //gets current name in list
          let tentCondition = doc.data().inTent; //gets tent status as well
          let scheduledHours = doc.data().scheduledHrs;
          let groupRole = doc.data().groupRole;
          let memID = doc.id;
          if (doc.id == firebase.auth().currentUser.uid) {
            setUserMember({ id: memID, name: currName, inTent: tentCondition, hours: scheduledHours, role: groupRole });
          } else {
            data.push({
              id: memID,
              name: currName,
              inTent: tentCondition,
              hours: scheduledHours,
              role: groupRole,
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
          let groupRole = doc.data().groupRole;
          let memID = doc.id;
          if (doc.id == firebase.auth().currentUser.uid) {
            setUserMember({ id: memID, name: currName, inTent: tentCondition, hours: scheduledHours, role: groupRole });
          } else {
            data.push({
              id: memID,
              name: currName,
              inTent: tentCondition,
              hours: scheduledHours,
              role: groupRole,
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

  //Function for removing a member from group in firebase
  async function removeMember(groupCode) {
    console.log('current member being deleted', currMember.current.id);
    await firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(currMember.current.id)
      .delete()
      .then(() => {
        console.log(currMember.current.id + ' removed from group');
      })
      .catch((error) => {
        console.error('Error removing member: ', error);
      });
    let groups;
    await firebase
      .firestore()
      .collection('users')
      .doc(currMember.current.id)
      .get()
      .then((doc) => {
        if (doc.exists) {
          groups = doc.data().groupCode;
          for (let i = 0; i < groups.length; i++) {
            if (groups[i].groupCode == groupCode) {
              groups.splice(i, 1);
              break;
            }
          }
          console.log('groups', groups);
        }
      })
      .catch((error) => {
        console.error('Error removing member: ', error);
      });
    firebase
      .firestore()
      .collection('users')
      .doc(currMember.current.id)
      .update({
        groupCode: groups,
      })
      .catch((error) => console.error(error));
    toggleModal();
  }

  const postGroupRole = useGroupRole(groupCode);

  function useGroupRole(groupCode) {
    const queryClient = useQueryClient();
    return useMutation((options) => setGroupRole(options), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['group', groupCode]);
      },
    });
  }

  function setGroupRole(options) {
    const { groupRole, groupCode } = options;
    firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(currMember.current.id)
      .update({
        groupRole: groupRole,
      })
      .then(() => console.log(currMember.current.id + ' group Role updated to ' + groupRole))
      .catch((error) => console.error(error));
    toggleRoleChange();
    toggleModal();
  }

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  const RenderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-50, 0.5],
      outputRange: [1, 0.1],
      extrapolate: 'clamp',
    });

    return (
      <View
        style={{
          width: '20%',
          //backgroundColor: theme.error,
          alignItems: 'center',
          padding: 4,
          justifyContent: 'flex-end',
          marginVertical: 3,
        }}
      >
        <Animated.Text style={{ transform: [{ scale }], color: theme.error }} onPress={toggleConfirmation}>
          Remove
        </Animated.Text>
        {/* <Icon name='trash-can-outline' color={theme.icon1} size={20} style={{ right: 0 }} /> */}
      </View>
    );
  };

  const UserMember = ({ item }) => {
    const backgroundColor = item.inTent ? '#3eb489' : '#1f509a';
    return (
      <TouchableOpacity
        onPress={() => {
          toggleModal();
          currMember.current = { name: item.name, id: item.id, hours: item.hours, role: item.role };
        }}
      >
        {!isLoading ? (
          <View
            style={[
              styles(theme).listItem,
              styles(theme).shadowProp,
              { flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor, marginVertical: 15 },
            ]}
          >
            <Text style={styles(theme).listText}>{item.name}</Text>
            <Text style={{ color: theme.text1 }}>Scheduled Hrs: {item.hours} hrs</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  //Render Item for Each List Item of group members
  const Member = ({ name, id, hours, role, backgroundColor }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          toggleModal();
          currMember.current = { name: name, id: id, hours: hours, role: role };
        }}
      >
        {groupRole == 'Creator' ? (
          <Swipeable
            renderRightActions={RenderRightActions}
            onSwipeableRightOpen={() => (currMember.current = { name: name, id: id, hours: hours, role: role })}
            friction={2}
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
          </Swipeable>
        ) : (
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
        )}
      </TouchableOpacity>
    );
  };

  //variable for each name box, change color to green if status is inTent
  const renderMember = ({ item }) => {
    const backgroundColor = item.inTent ? '#3eb489' : '#1f509a';
    return (
      <Member name={item.name} id={item.id} hours={item.hours} role={item.role} backgroundColor={{ backgroundColor }} />
    );
  };

  if (isLoading) {
    return <LoadingIndicator />;
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

      {/* List of Members in Group*/}
      <FlatList
        data={data}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={userMember == null ? null : <UserMember item={userMember} />}
        refreshControl={<RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />}
        style={{ marginHorizontal: '4%', flexGrow: 1, height: '70%' /* , borderWidth:1 */ }}
      ></FlatList>

      {/*Member Information Modal Component*/}
      <ActionSheetModal
        isVisible={isModalVisible}
        onBackdropPress={() => setModalVisible(false)}
        onSwipeComplete={toggleModal}
        height={groupRole == 'Creator' && currMember.current.id != firebase.auth().currentUser.uid ? 250 : 190}
        userStyle={'light'}
      >
        <View style={styles(theme).popUpHeaderView}>
          <View style={{ flexDirection: 'row'}}>
            <Icon name='account' color={theme.grey2} size={28} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 22, fontWeight: '700' }}>{currMember.current.name} Information</Text>
          </View>
          <TouchableOpacity onPress={toggleModal}>
            <Icon name='close-circle' color={theme.grey2} size={26} style={{ marginRight: 0 }} />
          </TouchableOpacity>
        </View>

        <View style={{ height: '70%', width: '94%', justifyContent: 'space-between' }}>
          <View
            style={
              groupRole == 'Creator' && currMember.current.id != firebase.auth().currentUser.uid
                ? { height: '65%' }
                : { height: '100%' }
            }
          >
            <View style={styles(theme).popUpHalfBody}>
              <Icon name='timer-sand-empty' color={theme.grey2} size={25} style={{ marginRight: 15 }} />
              <Text style={styles(theme).modalText}>Scheduled Hours: {currMember.current.hours} hrs</Text>
            </View>
            <Divider />

            {groupRole == 'Creator' && currMember.current.id != firebase.auth().currentUser.uid ? (
              <TouchableOpacity
                style={styles(theme).popUpHalfBody}
                onPress={()=> {
                  toggleRoleChange();
                }} //change later to admin change
              >
                <Icon name='account-group' color={theme.grey2} size={25} style={{ marginRight: 15 }} />
                <Text style={styles(theme).modalText}>Group Role: {currMember.current.role}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles(theme).popUpHalfBody}>
                <Icon name='account-group' color={theme.grey2} size={25} style={{ marginRight: 15 }} />
                <Text style={styles(theme).modalText}>Group Role: {currMember.current.role}</Text>
              </View>
            )}
          </View>

          {groupRole === 'Creator' && currMember.current.id != firebase.auth().currentUser.uid ? (
            <View style={{ width: '100%', height: '35%', justifyContent: 'center' }}>
              <TouchableOpacity onPress={toggleConfirmation} style={styles(theme).removeBtn}>
                <Icon name='trash-can' color={theme.error} size={30} style={{ marginRight: 15 }} />
                <Text style={{ color: theme.error, fontSize: 22, fontWeight: '600' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ActionSheetModal>

      {groupRole == 'Creator' ? (
        <ActionSheetModal
          isVisible={isRoleChangeVisible}
          onBackdropPress={toggleRoleChange}
          onSwipeComplete={toggleRoleChange}
          toggleModal={toggleRoleChange}
          cancelButton={true}
          height={180}
          userStyle={'dark'}
        >
          <TouchableOpacity
            onPress={() => postGroupRole.mutate({ groupRole: 'Creator', groupCode })} //change to changing member role
            style={styles(theme).roleChangeListItem}
          >
            <Icon name='chess-king' color={theme.text1} size={25} style={{ marginRight: 15 }} />
            <Text style={[styles(theme).modalText, { color: theme.text1, marginRight: 15 }]}>Creator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => postGroupRole.mutate({ groupRole: 'Admin', groupCode })}
            style={styles(theme).roleChangeListItem}
          >
            <Icon name='badge-account-outline' color={theme.text1} size={25} style={{ marginRight: 15 }} />
            <Text style={[styles(theme).modalText, { color: theme.text1, marginRight: 15 }]}>Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => postGroupRole.mutate({ groupRole: 'Member', groupCode })}
            style={[styles(theme).roleChangeListItem, { borderBottomWidth: 0 }]}
          >
            <Icon name='account' color={theme.text1} size={25} style={{ marginRight: 15 }} />
            <Text style={[styles(theme).modalText, { color: theme.text1, marginRight: 15 }]}>Member</Text>
          </TouchableOpacity>
        </ActionSheetModal>
      ) : null}
      

      {/* Remove Member Confirmation Modal */}
      <ConfirmationModal
        body={
          'Are you sure you want to REMOVE ' +
          currMember.current.name +
          ' from the group? This action CANNOT be undone.'
        }
        buttonText={'Remove ' + currMember.current.name}
        buttonAction={() => {
          postRemoveMember.mutate();
        }}
        toggleModal={toggleConfirmation}
        isVisible={isConfirmationVisible}
        onBackdropPress={() => setConfirmationVisible(false)}
        onSwipeComplete={toggleConfirmation}
      />
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
      //view of top headers above boxText
      marginBottom: 10,
      marginTop: 4,
      alignSelf: 'center',
      color: theme.grey1,
      width: '90%',
      fontSize: 22,
      fontWeight: '700',
    },
    boxText: {
      //View of top 2 boxes of text (groupCode and groupName)
      marginBottom: 10,
      width: '90%',
      backgroundColor: theme.white1,
      borderRadius: 8,
      alignSelf: 'center',
    },
    contentText: {
      //style of text inside boxText
      fontSize: 24,
      fontWeight: '700',
      textAlign: 'center',
      marginHorizontal: 8,
    },
    listItem: {
      //style of a member list item
      backgroundColor: theme.primary,
      padding: 4,
      height: 35,
      marginVertical: 4,
      borderRadius: 12,
      width: '100%',
      alignSelf: 'center',
      alignItems: 'center',
    },
    listText: {
      //text of a member item
      fontSize: 15,
      //fontFamily: 'sans-serif',
      fontWeight: '500',
      color: theme.text1,
    },
    modalText: {
      //style of text within the modals (member info text and roleChange text)
      fontSize: 18,
      fontWeight: '500',
    },
    popUpHeaderView: {
      //view of the header of the info popup modal
      flexDirection: 'row',
      height: '20%',
      width: '94%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    popUpHalfBody: {
      //view of the half of the info in the info popup modal
      flexDirection: 'row',
      alignSelf: 'center',
      height: '50%',
      width: '90%',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
    },
    removeBtn: {
      //remove button for removing member if the user is the Creator
      flexDirection: 'row',
      width: '100%',
      height: '85%',
      backgroundColor: '#ececec',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
    },
    roleChangeListItem: {
      //Style of an item in the member roleChange modal (for creator only)
      flexDirection: 'row',
      height: '33%',
      width: '95%',
      justifyContent: 'center',
      alignSelf: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: '#cfcfcf',
    },
    shadowProp: {
      shadowColor: '#171717',
      shadowOffset: { width: -2, height: 3 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
  });
