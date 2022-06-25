import 'react-native-gesture-handler'; //must be at top
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Linking, Platform } from 'react-native';
//import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SplashScreen from 'expo-splash-screen';
/* import Modal from "../component/Modal.js";
import ModalHeader from "../component/Modal.js";
import ModalBody from "../component/Modal.js"; */
import Modal from 'react-native-modal';

import StartScreen from './Start';
import CreateGroupScreen from './CreateGroup';
import JoinGroupScreen from './JoinGroup';
import GroupInfoScreen from './GroupInfo';
import DrawerContent from './DrawerContent';
import AvailabilityScreen from './Availability';
import ScheduleScreen from './Schedule';
import MonitorScreen from './Monitor';
import InfoScreen from './Info';
import SettingScreen from './Settings';
import CountdownScreen from './Countdown';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useDispatch } from 'react-redux';
import { setCurrentUser, reset } from '../redux/reducers/userSlice';

const Drawer = createDrawerNavigator();
//const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

const AvailabilityText = () => (
  <View>
    <Text style={styles.InfoText}>
      This page is for your availability throughout the week. You will input
      what times of the week you are not available for tenting.
    </Text>
    <Text style={styles.InfoText}>
      To do so, click the add button on the bottom right to add a new busy time
      and input the date, start time, and end time.
    </Text>
    <Text style={styles.InfoText}>
      Do this for your entire weekly schedule. You can delete blocks to edit
      your times.
    </Text>
    <Text style={styles.InfoText}>
      This schedule should remain saved from week to week, but you may edit
      every week if you have changes to your schedule.
    </Text>
    <Text style={styles.InfoText}>
      Make sure to fill out your availability every week before you Create a New
      Group Schedule or your busy times will not be accounted for in the group
      schedule.
    </Text>
    <Text style={styles.InfoText}>
      NOTE: If you mark yourself as available at 1am on a day, you will be
      marked availabile for the whole noght shift from 1am to 7am
    </Text>
  </View>
);

const ScheduleText = () => (
  <View>
    <Text style={styles.InfoText}>
      This page is for your group schedule for the week (from Sunday to Saturday
      midnight).
    </Text>
    <Text style={styles.InfoText}>
      Groups should aim to create a new weekly schedule every week after every
      member fills out their availability for that week
    </Text>
    <Text style={styles.InfoText}>
      Once all members of the group have filled out their availability for the
      week, one member should tap the ‘Create New Schedule’ button to
      automatically generate a schedule that optimizes for equal distribution of
      time.
    </Text>
    <Text style={styles.InfoText}>
      After the schedule is made, edits can be made by clicking on the time slot
      and changing the member for that time. After making your edits, make sure
      to tap ‘Push Edits’ so that all other group members see the changes.
    </Text>
    <Text style={styles.InfoText}>
      Note: You can’t make edits to the schedule at the same time.
    </Text>
    <Text style={styles.InfoText}>
      The number of scheduled hours for each member should be displayed on the
      group information page to make sure hours are distributed evenly.
    </Text>
  </View>
);

export default function Main() {
  //uncomment this to reset redux states
  //const dispatch = useDispatch();
  //dispatch(clearData());
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [isScheduleInfoVisible, setScheduleInfoVisible] = useState(false);

  const [typeOfHelp, setTypeOfHelp] = useState('Availability');

  const toggleInfo = () => {
    setInfoVisible(!isInfoVisible);
  };

  const toggleScheduleInfo = () => {
    setScheduleInfoVisible(!isScheduleInfoVisible);
  };

  const InformationModal = ({ page }) => {
    console.log('infoModal rendered:', typeOfHelp);
    return (
      <View>
        <Modal
          //isVisible = {(typeOfHelp== 'Availability') ? isInfoVisible: isScheduleInfoVisible}
          isVisible={isInfoVisible}
          onBackdropPress={() => setInfoVisible(false)}
          /* onBackdropPress={() => {
            if (typeOfHelp == 'Availability') setInfoVisible(false);
            else setScheduleInfoVisible(false);
          }} */
        >
          <View style={styles.InfoPop}>
            {typeOfHelp == 'Availability' ? (
              <Text style={styles.InfoHeader}>
                How to Use the Availability Page
              </Text>
            ) : (
              <Text style={styles.InfoHeader}>
                How to Use the Schedule Page
              </Text>
            )}
            <ScrollView
              style={styles.InfoTextView}
              showsVerticalScrollIndicator={false}
            >
              {typeOfHelp == 'Availability' ? (
                <AvailabilityText />
              ) : (
                <ScheduleText />
              )}
            </ScrollView>
          </View>
        </Modal>
      </View>
    );
  };

  const dispatch = useDispatch();

  //Navigation State persistence, saves user's location in app
  useEffect(() => {
    //   const restoreState = async () => {
    //     try {
    //       const initialUrl = await Linking.getInitialURL();

    //       if (initialUrl == null) {
    //         // Only restore state if there's no deep link and we're not on web
    //         const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
    //         const state = savedStateString
    //           ? JSON.parse(savedStateString)
    //           : undefined;

    //         if (state !== undefined) {
    //           setInitialState(state);
    //         }
    //       }
    //     } finally {
    //       setIsReady(true);
    //     }
    //   };
    // if (!isReady) {
    //   restoreState();
    // }
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setIsReady(true);
      }
    }

    prepare();
  }, [isReady]);

  useEffect(() => {
    // clearData(dispatch);
    // fetchUser(dispatch);
    dispatch(reset());
    firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (snapshot.exists) {
          dispatch(setCurrentUser(snapshot.data()));
        } else {
          console.log('does not exist');
        }
      });
    console.log('cleared data and fetched user');
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onReady={onLayoutRootView}
      // onStateChange={(state) =>
      //   AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state))
      // }
    >
      <Drawer.Navigator
        initialRouteName='Start'
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen
          name='Start'
          component={StartScreen}
          options={{
            headerShown: false,
            swipeEnabled: false,
            // headerStyle: {
            //   backgroundColor: "#1f509a",
            //   borderBottomWidth: 0,
            //   shadowColor: "transparent",
            // },
            // headerTitleStyle: {
            //   fontFamily: "NovaCut",
            //   color: "#fff",
            //   fontSize: 30,
            //   left: "0%",
            // },
          }}
        />
        <Drawer.Screen
          name='CreateGroup'
          component={CreateGroupScreen}
          options={({ navigation }) => ({
            title: 'Create Group',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerTitleStyle: {
              color: 'black',
            },
            headerTitleAlign: 'center',
            presentation: 'modal',
            headerLeft: () => (
              <Text
                style={{ color: '#1F509A', marginLeft: 10, fontWeight: '600' }}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Text>
            ),
          })}
        />
        <Drawer.Screen
          name='JoinGroup'
          component={JoinGroupScreen}
          options={({ navigation }) => ({
            title: 'Join Group',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Text
                style={{ color: '#1F509A', marginLeft: 10, fontWeight: '600' }}
                onPress={() => navigation.goBack()}
              >
                Cancel
              </Text>
            ),
          })}
        />
        <Drawer.Screen
          name='GroupInfo'
          component={GroupInfoScreen}
          options={({ navigation }) => ({
            title: 'Group Overview',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerTitleStyle: {
              fontSize: 28,
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='AvailabilityScreen'
          component={AvailabilityScreen}
          options={({ navigation }) => ({
            title: 'Availability',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
            headerRight: () => (
              <View>
                {/* <InformationModal header = 'How to use the Availability Page' children={<AvailabilityText/>}/> */}

                <TouchableOpacity
                  onPress={() => {
                    setTypeOfHelp('Availability');
                    toggleInfo();
                  }}
                  style={{ marginRight: 20 }}
                >
                  <Icon name='help-circle-outline' color={'black'} size={30} />
                </TouchableOpacity>
                {/* <InformationModal page = 'Availability'/> */}
                <InformationModal />
                {/*  <Modal
                  isVisible = {isInfoVisible}
                  onBackdropPress={() => setInfoVisible(false)}
                >
                  <View style={styles.InfoPop}>
                    <Text style={styles.InfoHeader}>How to use the Availability Page</Text>
                    <ScrollView 
                      style = {styles.InfoTextView}
                      showsVerticalScrollIndicator={false}
                    >
                      <AvailabilityText/>
                    </ScrollView>
                  </View>
                </Modal> */}
              </View>
            ),
          })}
        />
        <Drawer.Screen
          name='ScheduleScreen'
          component={ScheduleScreen}
          options={({ navigation }) => ({
            title: 'Group Schedule',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
            headerRight: () => (
              <View>
                {/* <InformationModal header = 'How to use the Schedule Page' children={<ScheduleText/>}/> */}
                <TouchableOpacity
                  onPress={() => {
                    //toggleScheduleInfo();
                    setTypeOfHelp('Schedule');
                    toggleInfo();
                  }}
                  style={{ marginRight: 20 }}
                >
                  <Icon name='help-circle-outline' color={'black'} size={30} />
                </TouchableOpacity>
                {/* <InformationModal page = 'Schedule'/> */}
                {/* <Modal
                  isVisible = {isScheduleInfoVisible}
                  onBackdropPress={() => setScheduleInfoVisible(false)}
                >
                  <View style={styles.InfoPop}>
                    <Text style={styles.InfoHeader}>How to use the Schedule Page</Text>
                    <ScrollView 
                      style = {styles.InfoTextView}
                      showsVerticalScrollIndicator={false}
                    >
                      <ScheduleText/>
                    </ScrollView>
                  </View>
                </Modal> */}
              </View>
            ),
          })}
        />
        <Drawer.Screen
          name='CountdownScreen'
          component={CountdownScreen}
          options={({ navigation }) => ({
            title: 'Countdown to UNC',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='MonitorScreen'
          component={MonitorScreen}
          options={({ navigation }) => ({
            title: '',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='InfoScreen'
          component={InfoScreen}
          options={({ navigation }) => ({
            title: 'Tent Details',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
        <Drawer.Screen
          name='SettingScreen'
          component={SettingScreen}
          options={({ navigation }) => ({
            title: '',
            headerStyle: {
              backgroundColor: '#C2C6D0',
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerLeft: () => (
              <IconButton
                icon='menu'
                size={25}
                onPress={() => navigation.openDrawer()}
              ></IconButton>
            ),
          })}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  InfoPop: {
    width: '80%',
    height: 350,
    backgroundColor: '#6a6a6a',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRadius: 20,
    margin: 15,
    paddingVertical: 15,
  },
  InfoHeader: {
    //style for text at the top of the popup
    fontWeight: '700',
    color: 'white',
    //marginTop: 15,
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  InfoTextView: {
    backgroundColor: '#bebebe',
    width: '90%',
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
  },
  InfoText: {
    //backgroundColor: '#2E5984',
    color: 'black',
    marginVertical: 5,
    textAlign: 'left',
    //width: '90%',
    //padding: 5,
    borderRadius: 15,
  },
});

{
  /*  <Modal
        isVisible = {isAvailInfoVisible}
        onBackdropPress={() => setAvailInfoVisible(false)}
      >
        <View style={styles.InfoPop}>
          <Text style={styles.InfoHeader}>How to use the Availability page</Text>
          <ScrollView style = {styles.InfoTextView}>
            <Text style={styles.InfoText}>
              This page is for your availability throughout the week. You will input what times of the week you are not
              available for tenting.
            </Text>
            <Text style={styles.InfoText}>
              To do so, click the add button on the bottom right to add a new busy time and input the date, start time, and
              end time.
            </Text>
            <Text style={styles.InfoText}>
              Do this for your entire weekly schedule. You can delete blocks to edit your times.
            </Text>
            <Text style={styles.InfoText}>
              This schedule should remain saved from week to week, but you may edit every week if you have changes 
              to your schedule.
            </Text>
            <Text style={styles.InfoText}>
              Make sure to fill out your availability every week before you Create a New Group Schedule or your 
              busy times will not be accounted for in the group schedule.
            </Text>
          </ScrollView>
        </View>
      </Modal> */
}
