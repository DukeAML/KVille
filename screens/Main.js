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
import { useDispatch } from 'react-redux';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

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
import { setCurrentUser, reset } from '../redux/reducers/userSlice';
import {useTheme} from '../context/ThemeProvider';
import { BottomSheetModal } from '../component/BottomSheetModal';
import { ActionSheetModal } from '../component/ActionSheetModal';

const Drawer = createDrawerNavigator();
//const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

export default function Main() {
  //uncomment this to reset redux states
  //const dispatch = useDispatch();
  //dispatch(clearData());
  const [isReady, setIsReady] = useState(false);
  const [initialState, setInitialState] = useState();
  const [isInfoVisible, setInfoVisible] = useState(false);
  const [isScheduleInfoVisible, setScheduleInfoVisible] = useState(false);
  const { theme } = useTheme();

  function toggleInfo () {
    setInfoVisible(!isInfoVisible);
  };

  function toggleScheduleInfo () {
    setScheduleInfoVisible(!isScheduleInfoVisible);
  };
  
  const AvailabilityText = () => (
    <View>
      <Text style={styles(theme).InfoText}>
        This page is for your availability throughout the week. You will input
        what times of the week you are not available for tenting.
      </Text>
      <Text style={styles(theme).InfoText}>
        To do so, click the add button on the bottom right to add a new busy
        time and input the date, start time, and end time.
      </Text>
      <Text style={styles(theme).InfoText}>
        Do this for your entire weekly schedule. You can delete blocks to edit
        your times.
      </Text>
      <Text style={styles(theme).InfoText}>
        This schedule should remain saved from week to week, but you may edit
        every week if you have changes to your schedule.
      </Text>
      <Text style={styles(theme).InfoText}>
        Make sure to fill out your availability every week before you Create a
        New Group Schedule or your busy times will not be accounted for in the
        group schedule.
      </Text>
      <Text style={styles(theme).InfoText}>
        NOTE: If you mark yourself as available at 1am on a day, you will be
        marked availabile for the whole noght shift from 1am to 7am
      </Text>
    </View>
  );

  const ScheduleText = () => (
    <View>
      <Text style={styles(theme).InfoText}>
        This page is for your group schedule for the week (from Sunday to
        Saturday midnight).
      </Text>
      <Text style={styles(theme).InfoText}>
        Groups should aim to create a new weekly schedule every week after every
        member fills out their availability for that week
      </Text>
      <Text style={styles(theme).InfoText}>
        Once all members of the group have filled out their availability for the
        week, one member should tap the ‘Create New Schedule’ button to
        automatically generate a schedule that optimizes for equal distribution
        of time.
      </Text>
      <Text style={styles(theme).InfoText}>
        After the schedule is made, edits can be made by clicking on the time
        slot and changing the member for that time. After making your edits,
        make sure to tap ‘Push Edits’ so that all other group members see the
        changes.
      </Text>
      <Text style={styles(theme).InfoText}>
        Note: You can’t make edits to the schedule at the same time.
      </Text>
      <Text style={styles(theme).InfoText}>
        The number of scheduled hours for each member should be displayed on the
        group information page to make sure hours are distributed evenly.
      </Text>
    </View>
  );

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
    let mounted = true;
    dispatch(reset());
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
      }).then(()=>{
        console.log('cleared data and fetched user');
      }).catch((error)=> {
        console.error(error)
      });
    
      return () => (mounted=false);

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
              backgroundColor: theme.primaryContainer,
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerTitleStyle: {
              color: theme.text2,
            },
            headerTitleAlign: 'center',
            presentation: 'modal',
            headerLeft: () => (
              <Text
                style={{ color: theme.primary, marginLeft: 10, fontWeight: '600' }}
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
              backgroundColor: theme.primaryContainer,
              borderBottomWidth: 0,
              shadowColor: 'transparent',
            },
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Text
                style={{ color: theme.primary, marginLeft: 10, fontWeight: '600' }}
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
              backgroundColor: theme.primaryContainer,
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
              backgroundColor: theme.primaryContainer,
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
                <TouchableOpacity
                  onPress={() => {
                    toggleInfo();
                  }}
                  style={{ marginRight: 20 }}
                >
                  <Icon name='help-circle-outline' color={'black'} size={30} />
                </TouchableOpacity>

                <ActionSheetModal
                  isVisible = {isInfoVisible}
                  onBackdropPress={toggleInfo}
                  swipeDown = {false}
        
                  height = {350}
                  userStyle = {'light'}
                >
                  <View style = {styles(theme).popUpHeaderView}>
                    <View style={{flexDirection:'row', marginLeft:'2%'}}>
                      <Icon name='lightbulb' color={theme.grey2} size={40} style={{ marginRight: 20 }}/>
                      <View>
                        <Text style= {{fontWeight: '500'}}>Helpful Tips</Text>
                        <Text style={{fontSize:17, fontWeight: '700'}}>How to use the Availability Page</Text>
                      </View>
                      
                    </View>
                    <TouchableOpacity onPress={toggleInfo}>
                      <Icon name='close-circle' color={theme.grey2} size={32} style={{ marginTop: 4 }}/>
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    style={styles(theme).textView}
                  >
                    <AvailabilityText/>
                  </ScrollView>
                  
                  <View style ={{height: '13%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity 
                      onPress={toggleInfo} 
                      style = {styles(theme).closeBtn}
                    >
                      <Text style ={{color: theme.text1, fontSize: 20, fontWeight: '600'}}>Ok</Text>
                    </TouchableOpacity>
                  </View>
                </ActionSheetModal>
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
              backgroundColor: theme.primaryContainer,
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
                <TouchableOpacity
                  onPress={() => {
                    toggleScheduleInfo();
                  }}
                  style={{ marginRight: 20 }}
                >
                  <Icon name='help-circle-outline' color={'black'} size={30} />
                </TouchableOpacity>

                <ActionSheetModal
                  isVisible={isScheduleInfoVisible}
                  onBackdropPress={toggleScheduleInfo}
                  swipeDown = {false}
        
                  height = {350}
                  userStyle = {'light'}
                >
                  <View style = {styles(theme).popUpHeaderView}>
                    <View style={{flexDirection:'row', marginLeft:'2%'}}>
                      <Icon name='lightbulb' color={theme.grey2} size={40} style={{ marginRight: 20 }}/>
                      <View>
                        <Text style= {{fontWeight: '500'}}>Helpful Tips</Text>
                        <Text style={{fontSize:18, fontWeight: '700'}}>How to use the Schedule Page</Text>
                      </View>
                      
                    </View>
                    <TouchableOpacity onPress={toggleScheduleInfo}>
                      <Icon name='close-circle' color={theme.grey2} size={32} style={{ marginTop: 4 }}/>
                    </TouchableOpacity>
                  </View>

                  <ScrollView 
                    showsVerticalScrollIndicator={false}
                    style={styles(theme).textView}
                  >
                    <ScheduleText/>
                  </ScrollView>
                  
                  <View style ={{height: '13%', width: '100%', justifyContent: 'center', alignItems: 'center'}}>
                    <TouchableOpacity 
                      onPress={toggleScheduleInfo} 
                      style = {styles(theme).closeBtn}
                    >
                      <Text style ={{color: theme.text1, fontSize: 20, fontWeight: '600'}}>Ok</Text>
                    </TouchableOpacity>
                  </View>
                </ActionSheetModal>
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
              backgroundColor: theme.primaryContainer,
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
              backgroundColor: theme.primaryContainer,
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
              backgroundColor: theme.primaryContainer,
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
            title: 'Settings',
            headerStyle: {
              backgroundColor: theme.primaryContainer,
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

const styles = (theme) => StyleSheet.create({
  popUpHeaderView:{ //view of the header of the info popup modal
    flexDirection: 'row',
    height: '18%',
    width: '94%',
    marginTop: '2%',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  textView: {
    height:'67%', 
    width: '94%', 
    backgroundColor: '#f3f3f3',
    //borderWidth: 1, 
    borderRadius: 18, 
    paddingVertical: 10, 
    paddingHorizontal: 15
  },
  InfoText: {
    color: theme.text2,
    marginVertical: 5,
    textAlign: 'left',
    fontSize: 16,
  }, 
  closeBtn:{ //remove button for removing member if the user is the Creator
    flexDirection:'row', 
    height: '70%',
    width: '70%',
    backgroundColor: '#3B65A2', 
    alignItems:'center',
    justifyContent: 'center', 
    borderRadius: 15
  },
});

