import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Title, Drawer, Switch } from 'react-native-paper';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useMutation, useQueryClient } from 'react-query';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { ConfirmationModal } from '../components/ConfirmationModal';

// import { reset } from "../redux/reducers/userSlice";

export default function DrawerContent(props) {
  const [status, setStatus] = useState(false);
  const [isConfirmationVisible, setConfirmationVisible] = useState(false);

  const groupCode = useSelector((state) => state.user.currGroupCode);
  console.log('group code', groupCode);
  const groupName = useSelector((state) => state.user.currGroupName);
  const userName = useSelector((state) => state.user.currUserName);
  const tentType = useSelector((state) => state.user.currTentType);
  const groupRole = useSelector((state) => state.user.currGroupRole);
  
  const useUpdateTentStatus = (groupCode) => {
    const queryClient = useQueryClient();
    return useMutation((status) => updateTentStatus(groupCode, status), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.invalidateQueries(['group', groupCode]);
      },
    });
  };
  function updateTentStatus(groupCode, status) {
    return firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .collection('members')
      .doc(firebase.auth().currentUser.uid)
      .update({
        inTent: status,
      });
    // .then(() => {
    //   console.log('successfully updated tent status: ', status);
    // })
    // .catch((error) => {
    //   console.error(error);
    // });
  }

  const postTentStatus = useUpdateTentStatus(groupCode);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      console.log('useFocusEffect triggered');
      if (mounted && groupCode != '') {
        firebase
          .firestore()
          .collection('groups')
          .doc(groupCode)
          .collection('members')
          .doc(firebase.auth().currentUser.uid)
          .get()
          .then((doc) => {
            if (mounted && doc.exists) {
              console.log(doc.data().inTent);
              setStatus(doc.data().inTent);
              console.log('status: ', status);
            } else {
              console.log("doc doesn't exist");
            }
          })
          .catch((error) => {
            console.error(error);
          });
      }
      return () => (mounted = false);
    }, [groupCode])
  );

  const onToggleSwitch = async () => {
    setStatus(!status);
    postTentStatus.mutate(!status);
  };

  function toggleConfirmation() {
    setConfirmationVisible(!isConfirmationVisible);
  }

  async function onLogout() {
    await AsyncStorage.multiRemove(['USER_EMAIL', 'USER_PASSWORD']);
    firebase.auth().signOut();
  }

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerContent}>
          <View style={styles.userInfoSection}>
            <View style={{ flexDirection: 'row', marginTop: 15 }}>
              <Title style={styles.title}>Krzyzewskiville</Title>
            </View>
          </View>

          <Drawer.Section style={styles.drawerSection}>
            <DrawerItem
              icon={({ color, size }) => <Icon name='home-outline' color={color} size={size} />}
              label='Home'
              onPress={() => {
                props.navigation.navigate('Home');
              }}
            />
            <DrawerItem
              icon={({ color, size }) => <Icon name='account-group-outline' color={color} size={size} />}
              label='Group Overview'
              onPress={() => {
                props.navigation.navigate('GroupInfo');
              }}
            />
            <DrawerItem
              icon={({ color, size }) => <Icon name='calendar-text-outline' color={color} size={size} />}
              label='Your Availability'
              onPress={() => {
                props.navigation.navigate('AvailabilityScreen');
              }}
            />
            <DrawerItem
              icon={({ color, size }) => <Icon name='calendar-check-outline' color={color} size={size} />}
              label='Your Shifts'
              onPress={() => {
                props.navigation.navigate('ShiftsScreen');
              }}
            />
            <DrawerItem
              icon={({ color, size }) => <Icon name='calendar-outline' color={color} size={size} />}
              label='Schedule'
              onPress={() => {
                props.navigation.navigate('ScheduleScreen');
              }}
            />
            <DrawerItem
              icon={({ color, size }) => <Icon name='alert-outline' color={color} size={size} />}
              label='Line Monitoring'
              onPress={() => {
                props.navigation.navigate('MonitorScreen');
              }}
            />
            <DrawerItem
              icon={({ color, size }) => <Icon name='information-outline' color={color} size={size} />}
              label='Information'
              onPress={() => {
                props.navigation.navigate('InfoScreen');
              }}
            />
          </Drawer.Section>
          <Drawer.Section title='Status'>
            <View style={styles.status}>
              <Text style={{ color: '#000' }}>In Tent</Text>
              <Switch value={status} onValueChange={onToggleSwitch} color='#3eb489' />
            </View>
          </Drawer.Section>
        </View>
      </DrawerContentScrollView>
      <Drawer.Section style={styles.bottomDrawerSection}>
        <DrawerItem
          icon={({ color, size }) => <Icon name='logout' color={color} size={size} />}
          label='Log Out'
          onPress={toggleConfirmation}
        />
      </Drawer.Section>

      <ConfirmationModal
        body={'Are you sure you want to log out?'}
        buttonText={'Log out'}
        buttonAction={() => {
          onLogout();
        }}
        toggleModal={toggleConfirmation}
        isVisible={isConfirmationVisible}
        onBackdropPress={toggleConfirmation}
        onSwipeComplete={toggleConfirmation}
        userStyle='light'
      />
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  status: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
