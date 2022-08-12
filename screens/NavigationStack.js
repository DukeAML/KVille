import 'react-native-gesture-handler'; //must be at top
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { IconButton } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as SplashScreen from 'expo-splash-screen';
import { useDispatch } from 'react-redux';
import { StatusBar } from 'expo-status-bar';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import HomeScreen from './Home';
import CreateGroupScreen from './CreateGroup';
import JoinGroupScreen from './JoinGroup';
import GroupInfoScreen from './GroupInfo';
import DrawerContent from './DrawerContent';
import AvailabilityScreen from './Availability';
import ScheduleScreen from './Schedule';
import MonitorScreen from './Monitor';
import InfoScreen from './Info';
import ShiftsScreen from './Shifts';
import AboutScreen from './About';
import AccountSettingsScreen from './AccountSettings';
import { setCurrentUser, reset } from '../redux/reducers/userSlice';
import { useTheme } from '../context/ThemeProvider';
import { ActionSheetModal } from '../components/ActionSheetModal';
import Snackbar from '../components/Snackbar';

const Drawer = createDrawerNavigator();
const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

export default function NavigationStack() {
  //uncomment this to reset redux states
  //const dispatch = useDispatch();
  //dispatch(reset());
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [isScheduleInfoVisible, setScheduleInfoVisible] = useState(false);
  const { theme } = useTheme();
  const dispatch = useDispatch();

  function toggleInfo() {
    setInfoVisible(!isInfoVisible);
  }

  function toggleScheduleInfo() {
    setScheduleInfoVisible(!isScheduleInfoVisible);
  }

  const AvailabilityText = () => (
    <View style={{ flex: 1, paddingBottom: 20 }}>
      <Text style={styles(theme).InfoText}>
        This page is for your availability throughout the week. You will input what times of the week you are not
        available for tenting.
      </Text>
      <Text style={styles(theme).InfoText}>
        To do so, click the add button on the bottom right to add a new busy time and input the day, start time, and
        end time.
      </Text>
      <Text style={styles(theme).InfoText}>
        Do this for your entire weekly schedule. You can delete blocks to edit your times.
      </Text>
      <Text style={styles(theme).InfoText}>
        This schedule remains saved from week to week, but you may edit every week if you have changes to your
        schedule.
      </Text>
      <Text style={styles(theme).InfoText}>
        Make sure to fill out your availability every week before you Create a New Group Schedule or your busy times
        will not be accounted for in the group schedule.
      </Text>
      <Text style={styles(theme).InfoText}>
        NOTE: If you mark yourself as available at 1am on a day, you will be marked availabile for the whole noght shift
        from 1am to 7am
      </Text>
    </View>
  );

  const ScheduleText = () => (
    <View style={{flex: 1, paddingBottom: 20}}>
      <Text style={styles(theme).InfoText}>
        This page is for your group schedule for the week (from Sunday to Saturday midnight).
      </Text>
      <Text style={styles(theme).InfoText}>
        Groups should aim to create a new weekly schedule every week after members fill out their availability for that week.
      </Text>
      <Text style={styles(theme).InfoText}>
        Once all members of the group have filled out their availability for the week, an admin should create a new group schedule.
      </Text>
      <Text style={styles(theme).InfoText}>
        After the schedule is made, admins can make edits by clicking on the time slot and changing the member for that time.
      </Text>
    </View>
  );

  //Navigation State persistence, saves user's location in app
  useEffect(() => {
    let mounted = true;

    firebase
      .firestore()
      .collection('users')
      .doc(firebase.auth().currentUser.uid)
      .get()
      .then((snapshot) => {
        if (mounted && snapshot.exists) {
          dispatch(setCurrentUser(snapshot.data()));
        } else {
          console.log('does not exist');
        }
      })
      .then(() => {
        console.log('cleared data and fetched user');
      })
      .catch((error) => {
        console.error(error);
      });
    const restoreState = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        console.log('initialUrl', initialUrl);

        if (Platform.OS !== 'web' /*&& initialUrl == null*/) {
          // Only restore state if there's no deep link and we're not on web
          const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
          const state = savedStateString ? JSON.parse(savedStateString) : undefined;
          //console.log('state', state);
          if (state !== undefined) {
            setInitialState(state);
          }
        }
      } finally {
        setIsReady(true);
      }
    };
    if (!isReady) {
      restoreState();
    }
    return () => (mounted = false);
  }, [isReady]);

  // useEffect(() => {
  //   // clearData(dispatch);
  //   // fetchUser(dispatch);
  //   let mounted = true;
  //   dispatch(reset());
  //   firebase
  //     .firestore()
  //     .collection('users')
  //     .doc(firebase.auth().currentUser.uid)
  //     .get()
  //     .then((snapshot) => {
  //       if (mounted && snapshot.exists) {
  //         dispatch(setCurrentUser(snapshot.data()));
  //       } else {
  //         console.log('does not exist');
  //       }
  //     })
  //     .then(() => {
  //       console.log('cleared data and fetched user');
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });

  //   return () => (mounted = false);
  // }, []);

  if (!isReady) {
    return null;
  }

  return (
    <View style={{ flex: 1, zIndex: 1 }}>
      <NavigationContainer
        initialState={initialState}
        //onReady={onLayoutRootView}
        onStateChange={(state) => {
          AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
        }}
      >
        <Drawer.Navigator
          initialRouteName='Start'
          drawerContent={(props) => <DrawerContent {...props} />}
          screenOptions={{ drawerType: 'front' }}
        >
          <Drawer.Screen
            name='Home'
            component={HomeScreen}
            options={{
              headerShown: false,
              swipeEnabled: false,
            }}
          />
          <Drawer.Screen
            name='CreateGroup'
            component={CreateGroupScreen}
            options={{
              headerShown: false,
              swipeEnabled: false,
            }}
          />
          <Drawer.Screen
            name='AboutScreen'
            component={AboutScreen}
            options={{
              headerShown: false,
              swipeEnabled: false,
            }}
          />
          <Drawer.Screen
            name='AccountSettingsScreen'
            component={AccountSettingsScreen}
            options={{
              headerShown: false,
              swipeEnabled: false,
            }}
          />
          <Drawer.Screen
            name='JoinGroup'
            component={JoinGroupScreen}
            options={{
              headerShown: false,
              swipeEnabled: false,
            }}
          />
          <Drawer.Screen
            name='GroupInfo'
            component={GroupInfoScreen}
            options={{
              headerShown: false,
              swipeEnabled: true,
            }}
          />
          <Drawer.Screen
            name='AvailabilityScreen'
            component={AvailabilityScreen}
            options={({ navigation }) => ({
              title: 'Availability',
              headerStyle: {
                backgroundColor: theme.primaryContainer,
                borderBottomWidth: 0,
                shadowColor: 'transparent',
              },
              headerLeft: () => <IconButton icon='menu' size={25} onPress={() => navigation.openDrawer()}></IconButton>,
              headerRight: () => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      toggleInfo();
                    }}
                    style={{ marginRight: 20 }}
                  >
                    <Icon name='help-circle-outline' color={'black'} size={25} />
                  </TouchableOpacity>

                  <ActionSheetModal
                    isVisible={isInfoVisible}
                    onBackdropPress={toggleInfo}
                    swipeDown={false}
                    height={350}
                    userStyle={'light'}
                  >
                    <View style={styles(theme).popUpHeaderView}>
                      <View style={{ flexDirection: 'row' }}>
                        <Icon name='lightbulb' color={theme.grey2} size={40} style={{ marginRight: 15 }} />
                        <View>
                          <Text style={{ fontWeight: '500' }}>Helpful Tips</Text>
                          <Text style={{ fontSize: 15, fontWeight: '700' }}>How to use the Availability Page</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={toggleInfo}>
                        <Icon name='close-circle' color={theme.grey2} size={32} style={{ marginTop: 4 }} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={styles(theme).textView}
                      scrollToOverflowEnabled={true}
                    >
                      <AvailabilityText />
                    </ScrollView>

                    <View style={{ height: '13%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                      <TouchableOpacity onPress={toggleInfo} style={styles(theme).closeBtn}>
                        <Text style={{ color: theme.text1, fontSize: 20, fontWeight: '600' }}>Ok</Text>
                      </TouchableOpacity>
                    </View>
                  </ActionSheetModal>
                </View>
              ),
            })}
          />
          <Drawer.Screen
            name='ShiftsScreen'
            component={ShiftsScreen}
            options={({ navigation }) => ({
              title: 'Shifts This Week',
              headerStyle: {
                backgroundColor: theme.primaryContainer,
                borderBottomWidth: 0,
                shadowColor: '#171717',
                shadowOffset: { width: -2, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 5,
                elevation: 20,
                //borderBottomLeftRadius: 10,
                //borderBottomRightRadius: 10,
              },
              headerLeft: () => <IconButton icon='menu' size={25} onPress={() => navigation.openDrawer()}></IconButton>,
            })}
          />
          <Drawer.Screen
            name='ScheduleScreen'
            component={ScheduleScreen}
            options={({ navigation }) => ({
              title: 'Group Schedule',
              headerStyle: {
                backgroundColor: theme.primaryContainer,
                borderBottomWidth: 0,
                shadowColor: 'transparent',
              },
              headerLeft: () => <IconButton icon='menu' size={25} onPress={() => navigation.openDrawer()}></IconButton>,
              headerRight: () => (
                <View>
                  <TouchableOpacity
                    onPress={() => {
                      toggleScheduleInfo();
                    }}
                    style={{ marginRight: 20 }}
                  >
                    <Icon name='help-circle-outline' color={'black'} size={25} />
                  </TouchableOpacity>

                  <ActionSheetModal
                    isVisible={isScheduleInfoVisible}
                    onBackdropPress={toggleScheduleInfo}
                    swipeDown={false}
                    height={350}
                    userStyle={'light'}
                  >
                    <View style={styles(theme).popUpHeaderView}>
                      <View style={{ flexDirection: 'row' }}>
                        <Icon name='lightbulb' color={theme.grey2} size={40} style={{ marginRight: 15 }} />
                        <View>
                          <Text style={{ fontWeight: '500' }}>Helpful Tips</Text>
                          <Text style={{ fontSize: 16, fontWeight: '700' }}>How to use the Schedule Page</Text>
                        </View>
                      </View>
                      <TouchableOpacity onPress={toggleScheduleInfo}>
                        <Icon name='close-circle' color={theme.grey2} size={32} style={{ marginTop: 4 }} />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      showsVerticalScrollIndicator={false}
                      style={styles(theme).textView}
                      scrollToOverflowEnabled={true}
                    >
                      <ScheduleText />
                    </ScrollView>

                    <View style={{ height: '13%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                      <TouchableOpacity onPress={toggleScheduleInfo} style={styles(theme).closeBtn}>
                        <Text style={{ color: theme.text1, fontSize: 20, fontWeight: '600' }}>Ok</Text>
                      </TouchableOpacity>
                    </View>
                  </ActionSheetModal>
                </View>
              ),
            })}
          />
          <Drawer.Screen
            name='MonitorScreen'
            component={MonitorScreen}
            options={({ navigation }) => ({
              title: '',
              headerStyle: {
                backgroundColor: theme.primaryContainer,
                borderBottomWidth: 0,
                shadowColor: 'transparent',
              },
              headerLeft: () => <IconButton icon='menu' size={25} onPress={() => navigation.openDrawer()}></IconButton>,
            })}
          />
          <Drawer.Screen
            name='InfoScreen'
            component={InfoScreen}
            options={({ navigation }) => ({
              title: 'Tenting Information',
              headerStyle: {
                backgroundColor: theme.primaryContainer,
                borderBottomWidth: 0,
                shadowColor: 'transparent',
              },
              headerLeft: () => <IconButton icon='menu' size={25} onPress={() => navigation.openDrawer()}></IconButton>,
            })}
          />
        </Drawer.Navigator>
        <StatusBar style='dark' />
        <Snackbar />
      </NavigationContainer>
    </View>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    popUpHeaderView: {
      //view of the header of the info popup modal
      flexDirection: 'row',
      height: '18%',
      width: '94%',
      marginTop: '2%',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    textView: {
      height: '80%',
      width: '94%',
      backgroundColor: '#f3f3f3',
      borderRadius: 18,
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    InfoText: {
      color: theme.text2,
      marginVertical: 5,
      textAlign: 'left',
      fontSize: 16,
    },
    closeBtn: {
      //remove button for removing member if the user is the Creator
      flexDirection: 'row',
      height: '70%',
      width: '70%',
      backgroundColor: '#3B65A2',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 15,
    },
    headerContainer: {
      flexDirection: 'row',
      width: '90%',
      justifyContent: 'space-between',
      marginBottom: 15,
    },
    headerText: {
      //text for different setting headers
      fontSize: 20,
      fontWeight: '700',
      color: theme.grey2,
    },
    textInput: {
      backgroundColor: theme.white2,
      paddingVertical: 10,
      paddingHorizontal: 15,
      width: '90%',
      fontSize: 18,
      fontWeight: '500',
      textAlign: 'left',
      borderRadius: 15,
      marginBottom: 23,
      borderColor: theme.grey2,
    },
  });
