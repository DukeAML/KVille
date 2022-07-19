import React, { useState, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
  useWindowDimensions,
  RefreshControl,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { Table, TableWrapper, Col, Cell } from 'react-native-table-component';
import * as SplashScreen from 'expo-splash-screen';
import Modal from 'react-native-modal';
import { Snackbar, Divider, Badge } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useFocusEffect } from '@react-navigation/native';
import Animated, { withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FAB, Portal, Provider } from 'react-native-paper';

import { createGroupSchedule } from '../backend/CreateGroupSchedule';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useRefreshOnFocus } from '../hooks/useRefreshOnFocus';
import { useWindowUnloadEffect } from '../hooks/useWindowUnloadEffect';
import { useTheme } from '../context/ThemeProvider';
import { useRefreshByUser } from '../hooks/useRefreshByUser';

import { ConfirmationModal } from '../component/ConfirmationModal';
import { BottomSheetModal } from '../component/BottomSheetModal';
import { ActionSheetModal } from '../component/ActionSheetModal';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

//prettier-ignore
const times = [ //Times for right column of the list of times of the day
  '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', 
  '11am', '12am', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm',
  '10pm', '11pm',
];

//Colors of each member, first is for 'empty'
//prettier-ignore
const colors = ['#D0342C','#dd7e6b','#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#a4c2f4','#fed9c9','#b4a7d6','#d5a6bd','#e69138','#6aa84f',];

// let colorCodes = [
//   //Array for color corresponding to each member
//   { id: 1, name: 'empty', color: '#D0342C', changedHrs: 0 },
// ];
let prevColorCodes;
let prevSchedule = new Array();

const win = Dimensions.get('window'); //Global Var for screen size

export default function Schedule({ route }) {
  const { code, tentType } = route.params; //parameters needed: groupCode and tentType
  //console.log('Schedule screen params', route.params);

  const { theme } = useTheme();

  const [isModalVisible, setModalVisible] = useState(false); //for the popup for editing a time cell
  const [isMemberModalVisible, setMemberModalVisible] = useState(false); //for the popup for choosing a member from list
  const [isConfirmationVisible, setConfirmationVisible] = useState(false); //for confirmation Popup
  const [isSnackVisible, setSnackVisible] = useState(false); // for temporary popup
  const [snackMessage, setSnackMessage] = useState(''); //message for the temporary popup
  const [fabState, setFabState] = React.useState({ open: false });

  const onFabStateChange = ({ open }) => setFabState({ open });

  const { open } = fabState;

  //Hooks and data for changing between the current weeks schedule and the previous one
  const [weekDisplay, setWeekDisplay] = useState('Current Week');
  let myBtnColor = weekDisplay == 'Current Week' ? '#bfd4db' : '#96b9d0';
  const [renderDay, setRenderDay] = useState('Sunday'); //stores the current day that is being rendered

  //These Hooks are for editing the group schedule
  const [newMember, setNewMember] = useState('Select a Member'); //to set the new member to replace old one
  //const [oldMember, setOldMember] = useState(''); //to store which member is being replaced
  const oldMember = useRef('');
  const editIndex = useRef(0);

  const dayHighlightOffset = useSharedValue(0);

  const newSchedule = useRef([]);

  const scrollRef = useRef([]);
  const colorCodes = useRef([{ id: 1, name: 'empty', color: '#D0342C', changedHrs: 0 }]);
  /* const window = useWindowDimensions();
  const styles= makeStyles(window.fontScale); */

  const { isLoading, isError, error, refetch, data } = useQuery(
    ['groupSchedule', firebase.auth().currentUser.uid, code, weekDisplay],
    () => fetchGroupSchedule(code, weekDisplay),
    { initialData: [] }
  );
  //useRefreshOnFocus(refetch);

  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'web') {
        window.addEventListener('beforeunload', (event) => {
          event.preventDefault();
          updateHours(code);
        });
      }
      return () => {
        updateHours(code);
        if (Platform.OS === 'web') {
          window.removeEventListener('beforeunload', (event) => {
            event.preventDefault();
            updateHours(code);
          });
        }
      };
    }, [])
  );

  //useWindowUnloadEffect(()=> updateHours(code), true);

  async function fetchGroupSchedule(groupCode, weekDisplay) {
    console.log('query initiated');
    await SplashScreen.preventAutoHideAsync();

    let currSchedule;
    await firebase
      .firestore()
      .collection('groups')
      .doc(groupCode)
      .get()
      .then((doc) => {
        currSchedule = doc.data().groupSchedule;
        prevSchedule = doc.data().previousSchedule;
        colorCodes.current = doc.data().memberArr;
        prevColorCodes = doc.data().previousMemberArr;
      })
      .catch((error) => {
        console.error(error);
        throw error;
      });
    if (weekDisplay == 'Current Week') {
      //console.log('current week returned', currSchedule);
      return currSchedule;
    }
    //console.log('previous week returned', prevSchedule);
    return prevSchedule;
  }

  function updateHours(groupCode) {
    const groupRef = firebase.firestore().collection('groups').doc(groupCode);
    for (let i = 0; i < colorCodes.current.length; i++) {
      if (colorCodes.current[i].changedHrs == 0) continue;
      groupRef
        .collection('members')
        .doc(colorCodes.current[i].id)
        .get()
        .then((doc) => {
          const newHours = doc.data().scheduledHrs + colorCodes.current[i].changedHrs;
          console.log(colorCodes.current[i].changedHrs + ' new hours: ' + newHours);
          colorCodes.current[i].changedHrs = 0;
          return newHours;
        })
        .then((hours) => {
          groupRef.collection('members').doc(colorCodes.current[i].id).update({ scheduledHrs: hours });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  const postEditCell = useEditCell(code, weekDisplay);

  function useEditCell(groupCode, weekDisplay) {
    const queryClient = useQueryClient();
    return useMutation((options) => editCell(options), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.setQueryData(
          ['groupSchedule', firebase.auth().currentUser.uid, groupCode, weekDisplay],
          newSchedule.current
        );
      },
    });
  }

  //function for editing the schedule based on old member and new member to replace
  async function editCell(options) {
    const { index, oldMember, newMember, groupCode } = options;
    const groupRef = firebase.firestore().collection('groups').doc(groupCode);
    let currSchedule = data;
    currSchedule[index] = currSchedule[index].replace(oldMember, newMember);
    const indexofOld = colorCodes.current.findIndex((object) => object.name === oldMember);
    const indexofNew = colorCodes.current.findIndex((object) => object.name === newMember);

    // let oldHours;
    // let newHours;
    // await groupRef.collection('members').doc(colorCodes.current[indexofOld].id).get().then((doc) => {
    //   oldHours = doc.data().scheduledHrs - 0.5;
    // });
    // await groupRef.collection('members').doc(colorCodes.current[indexofNew].id).get().then((doc) => {
    //   newHours = doc.data().scheduledHrs + 0.5;
    // });
    // groupRef.collection('members').doc(colorCodes.current[indexofOld].id).update({
    //   scheduledHrs: oldHours
    // })
    // groupRef.collection('members').doc(colorCodes.current[indexofNew].id).update({
    //   scheduledHrs: newHours,
    // });

    colorCodes.current[indexofOld].changedHrs -= 0.5;
    colorCodes.current[indexofNew].changedHrs += 0.5;

    groupRef.update({
      groupSchedule: currSchedule,
    });

    newSchedule.current = currSchedule;
  }

  const postSchedule = useUpdateSchedule(code, tentType, weekDisplay);

  function useUpdateSchedule(groupCode, tentType, weekDisplay) {
    const queryClient = useQueryClient();
    return useMutation(() => createNewGroupSchedule(groupCode, tentType), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        //console.log('newSchedule', newSchedule);
        queryClient.setQueryData(
          ['groupSchedule', firebase.auth().currentUser.uid, groupCode, weekDisplay],
          newSchedule.current
        );
      },
    });
  }

  async function createNewGroupSchedule(code, tentType) {
    //let newSchedule;
    await createGroupSchedule(code, tentType)
      .then((groupSchedule) => {
        console.log('Group Schedule', groupSchedule);
        newSchedule.current = groupSchedule;

        //If current schedule is blank, no need to update
        if (data[0] !== undefined) prevSchedule = data;

        //Update previous colorCodes to current and update current schedule to the groupSchedule
        prevColorCodes = colorCodes.current;
      })
      .catch((error) => {
        console.error(error);
        setSnackMessage('Not enough members');
        toggleSnackBar();
      });
    console.log('create new schedule', newSchedule);
    return firebase.firestore().collection('groups').doc(code).update({
      groupSchedule: newSchedule.current,
      previousSchedule: prevSchedule,
      previousMemberArr: colorCodes.current,
    });
  }

  const toggleModal = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    //to toggle the edit cell popup
    setModalVisible(!isModalVisible);
  };

  const toggleMemberModal = () => {
    //to toggle the popup for the member list
    setMemberModalVisible(!isMemberModalVisible);
  };

  const toggleConfirmation = () => {
    //to toggle the popup for the edit confirmation
    setConfirmationVisible(!isConfirmationVisible);
  };

  const toggleSnackBar = () => {
    setSnackVisible(!isSnackVisible);
  };

  const TimeColumn = () => {
    //component for side table of 12am-12am time segments
    return (
      <Table style = {{width:'7%'}}>
        <Col
          data={times}
          heightArr={[62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62]}
          textStyle={StyleSheet.flatten(styles(theme).timesText)}
          //style={{  borderWidth: 1 }}
        />
      </Table>
    );
  };

  //Component for the popup list of members for each member
  const Member = ({ name }) => {
    /* function formatAsPercent(num) {
      return `${parseFloat(num).toFixed(2)}%`;
    } 
    let height = formatAsPercent(100 * (1 / colorCodes.length));*/
    let height = win.height * 0.45 * (1 / colorCodes.current.length) + 8;
    return (
      <View style={{ width: '100%' }}>
        <TouchableOpacity
          onPress={() => {
            setNewMember(name);
            toggleMemberModal();
            console.log('height', height);
          }}
          style={{ width: '100%' /* borderBottomWidth:1 */ }}
        >
          <View
            style={{
              //backgroundColor: '#656565',
              height: height,
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                //marginLeft: 25,
                fontSize: 18,
              }}
            >
              {name}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  //to render flatList in member list popup
  const renderMember = ({ item }) => {
    return <Member name={item.name} />;
  };

  // Component for each single cell timeslot
  //    Parameters:
  //      index: index of cell within the entire schedule array
  //      person: string holding the person currently scheduled for the time cell
  const OneCell = ({ index, person }) => {
    //changes background based on who the member is
    const indexofUser =
      weekDisplay == 'Current Week'
        ? colorCodes.current.findIndex((object) => object.name == person)
        : prevColorCodes.findIndex((object) => object.name == person);
    //console.log(colorCodes.current);
    //console.log('indexOfUser', indexofUser);
    const backgroundColor =
      indexofUser != -1
        ? weekDisplay == 'Current Week'
          ? colorCodes.current[indexofUser].color
          : prevColorCodes[indexofUser].color
        : '#fff'; //gets background color from the colorCodes Array
    if (weekDisplay == 'Current Week') {
      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              editIndex.current = index;
              oldMember.current = person;
              //setOldMember(person);
              console.log('index: ', index);
              toggleModal();
            }}
          >
            <View style={[styles(theme).timeSlotBtn, { backgroundColor: backgroundColor }]}>
              <Text style={styles(theme).btnText} adjustsFontSizeToFit minimumFontScale={0.5}>
                {person}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (weekDisplay == 'Previous Week') {
      return (
        <View style={{ flex: 1 }}>
          <View style={[styles(theme).timeSlotBtn, { backgroundColor: backgroundColor }]}>
            <Text style={styles(theme).btnText} adjustsFontSizeToFit={true} minimumFontScale={0.5}>
              {person}
            </Text>
          </View>
        </View>
      );
    }
  };

  /*Component for each row to list the people in that time shift
    # of people on the row is dependent on the tentType and time of day
      Parameters: 
        index: index of cell within the day (range from 0-47) 
        arrayIndex: index of cell in the entire schedule array (range from 0-337)
        members: string of one time shift (ex. "member1 member2 member3 member4 ") */

  const RenderCell = (index, arrayIndex, members) => {
    const people = members.trim().split(' '); //stores the string as an array of single members
    //console.log('people: ', people);

    return (
      <View style={styles(theme).row}>
        <OneCell index={arrayIndex} person={people[0]} />
        {people.length > 1 ? <OneCell index={arrayIndex} person={people[1]} /> : null}
        {people.length > 2 ? <OneCell index={arrayIndex} person={people[2]} /> : null}
        {people.length > 2 ? <OneCell index={arrayIndex} person={people[3]} /> : null}
        {people.length > 2 ? <OneCell index={arrayIndex} person={people[4]} /> : null}
        {people.length > 2 ? <OneCell index={arrayIndex} person={people[5]} /> : null}
        {people.length > 6 ? <OneCell index={arrayIndex} person={people[6]} /> : null}
        {people.length > 6 ? <OneCell index={arrayIndex} person={people[7]} /> : null}
        {people.length > 6 ? <OneCell index={arrayIndex} person={people[8]} /> : null}
        {people.length > 6 ? <OneCell index={arrayIndex} person={people[9]} /> : null}
      </View>
    );
  };

  //Component for the table for one day's schedule
  const DailyTable = ({ day }) => {
    //if (schedule == undefined) return null;
    let indexAdder = 0;
    //depending on day parameter, change index in GLOBAL schedule array
    switch (day) {
      case 'Monday':
        indexAdder = 48;
        break;
      case 'Tuesday':
        indexAdder = 96;
        break;
      case 'Wednesday':
        indexAdder = 144;
        break;
      case 'Thursday':
        indexAdder = 192;
        break;
      case 'Friday':
        indexAdder = 240;
        break;
      case 'Saturday':
        indexAdder = 288;
        break;
      default:
        indexAdder = 0;
    }
    let dayArr = data.slice(indexAdder, indexAdder + 48);
    //console.log(day,"||", dayArr);
    return (
      <View style={{ marginTop: 31, width:'93%' }}>
        <Table borderStyle={{ borderColor: 'transparent' }}>
          {dayArr.map((rowData, index) => (
            <TableWrapper key={index} style={StyleSheet.flatten(styles(theme).row)}>
              <Cell
                data={RenderCell(index, index + indexAdder, dayArr[index])}
                textStyle={StyleSheet.flatten(styles(theme).text)}
              />
            </TableWrapper>
          ))}
        </Table>
      </View>
    );
  };

  const customSpringStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(dayHighlightOffset.value * (win.width / 7), {
            damping: 20,
            stiffness: 90,
          }),
        },
      ],
    };
  });

  //Component for the top day buttons
  const DayButton = ({ day, abbrev, value }) => {
    return (
      <TouchableOpacity
        style={[styles(theme).button, { backgroundColor: 'transparent', zIndex: 2 }]}
        onPress={() => {
          setRenderDay(day);
          dayHighlightOffset.value = value;
          scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
        }}
      >
        <Text
          style={
            renderDay == day
              ? [styles(theme).buttonText, { color: 'white' }]
              : [styles(theme).buttonText, { color: 'black' }]
          }
        >
          {abbrev}
        </Text>
        {renderDay == day ? (
          <Badge size={8} style={{ alignSelf: 'center', backgroundColor: theme.text1 }}></Badge>
        ) : null}
      </TouchableOpacity>
    );
  };

  const onLayoutRootView = useCallback(async () => {
    if (!isLoading) {
      await SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return null;
  }

  if (isError) {
    console.error(error);
    return null;
  }

  return (
    <Provider>
      <View style={styles(theme).bigContainer} onLayout={onLayoutRootView}>
        <ActionSheetModal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal}
          onSwipeComplete={toggleModal}
          toggleModal={toggleModal}
          cancelButton={true}
          height={win.height * 0.15}
        >
          <TouchableOpacity onPress={toggleMemberModal} style={{ height: '50%', width: '100%' }}>
            <View
              style={{
                height: '100%',
                width: '100%',
                justifyContent: 'center',
                borderBottomWidth: 1,
                borderColor: '#cfcfcf',
              }}
            >
              <Text style={{ textAlign: 'center', fontSize: 20, color: 'white' }}>{newMember}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (newMember == 'Select a Member') {
                toggleModal();
              } else {
                toggleModal();
                //editCell(editIndex.current, oldMember, newMember);
                postEditCell.mutate({
                  index: editIndex.current,
                  oldMember: oldMember,
                  newMember: newMember,
                  groupCode: code,
                });
              }
            }}
            style={{ height: '50%', width: '100%' }}
          >
            <View style={{ height: '100%', justifyContent: 'center' }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'white',
                  fontSize: 24,
                  fontWeight: '500',
                }}
              >
                Edit
              </Text>
            </View>
          </TouchableOpacity>
          <BottomSheetModal
            isVisible={isMemberModalVisible}
            onBackdropPress={() => setMemberModalVisible(false)}
            onSwipeComplete={toggleMemberModal}
          >
            <View
              style={{
                marginTop: 10,
                width: '90%',
                //borderWidth: 1,
                alignItems: 'center',
                height: '92%',
              }}
            >
              <View style={{ height: '100%', width: '100%' }}>
                <FlatList
                  data={colorCodes.current}
                  renderItem={renderMember}
                  ItemSeparatorComponent={() => <Divider />}
                  keyExtractor={(item) => item.id}
                />
              </View>
            </View>
          </BottomSheetModal>
        </ActionSheetModal>

        <ConfirmationModal
          toggleModal={toggleConfirmation}
          body='Are you sure you want to create a new schedule? This will change the current schedule for all members and cannot be undone.'
          buttonText='Create New Schedule'
          buttonAction={() => {
            //toggleConfirmation();
            postSchedule.mutate();
            setSnackMessage('New Schedule Created');
            toggleSnackBar();
          }}
          isVisible={isConfirmationVisible}
          onBackdropPress={() => setConfirmationVisible(false)}
          onSwipeComplete={toggleConfirmation}
        />
        {/* </Modal> */}

        <View>
          <TouchableOpacity
            onPress={() => {
              if (weekDisplay == 'Current Week') {
                console.log('showing previous week', weekDisplay);
                setWeekDisplay('Previous Week');
                console.log(weekDisplay);
                refetch();
              } else {
                console.log('showing current week');
                setWeekDisplay('Current Week');
                refetch();
              }
            }}
          >
            <View
              style={{
                height: 28,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: myBtnColor,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '500' }}>{weekDisplay}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles(theme).buttonContainer}>
            <Animated.View style={[styles(theme).dayHighlight, customSpringStyles]} />
            <DayButton day='Sunday' abbrev='Sun' value={0} />
            <DayButton day='Monday' abbrev='Mon' value={1} />
            <DayButton day='Tuesday' abbrev='Tue' value={2} />
            <DayButton day='Wednesday' abbrev='Wed' value={3} />
            <DayButton day='Thursday' abbrev='Thur' value={4} />
            <DayButton day='Friday' abbrev='Fri' value={5} />
            <DayButton day='Saturday' abbrev='Sat' value={6} />
          </View>
        </View>
        <View
          style={[
            styles(theme).shadowProp,
            { backgroundColor: '#D2D5DC', borderTopLeftRadius: 20, marginTop: 10, shadowRadius: 10 },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />}
            ref={scrollRef}
            style = {{width: '100%'/* , borderWidth:1 */}}
          >
            {/* <Text style={styles(theme).dayHeader}>{renderDay}</Text> */}
            <View style={{ flexDirection: 'row', marginTop: 20, width: '100%', marginRight: 0 }}>
              <TimeColumn/>
              <DailyTable day={renderDay} />
            </View>
          </ScrollView>
        </View>
        <Portal>
          <FAB.Group
            open={open}
            icon={'plus'}
            fabStyle={{ backgroundColor: '#9FA6B7' }}
            actions={[
              {
                icon: 'calendar',
                label: 'Create New Schedule',
                onPress: () => toggleConfirmation(),
              },
            ]}
            onStateChange={onFabStateChange}
            onPress={() => {
              if (open) {
                // do something if the speed dial is open
              }
            }}
          />
        </Portal>
        <Snackbar
          visible={isSnackVisible}
          onDismiss={() => setSnackVisible(false)}
          wrapperStyle={{ top: 0 }}
          duration={1300}
        >
          <View style={{ width: '100%' }}>
            <Text style={{ textAlign: 'center' }}>{snackMessage}</Text>
          </View>
        </Snackbar>
      </View>
    </Provider>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    bigContainer: { flex: 1, backgroundColor: theme.background, flexGrow: 1 }, //for the entire page's container
    text: { margin: 3 }, //text within cells
    timesText: {
      //text style for the side text of the list of times
      fontWeight: '800',
      fontSize: 9,
      width: '100%',
      textAlign: 'center',
    },
    dayHighlight: {
      position: 'absolute',
      backgroundColor: '#1F509Ad0',
      width: win.width / 7,
      height: 38,
      borderRadius: 100,
    },
    buttonContainer: {
      //container for the top buttons
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#00000000',
    },
    button: {
      //for the day buttons at top of screen
      backgroundColor: theme.grey3,
      width: win.width / 7,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      //text for day buttons
      fontSize: 'auto',
      fontWeight: '500',
      textAlign: 'center',
      color: 'black',
    },
    topEditBtn: {
      //for top edit buttons below daybuttons
      width: '100%',
      backgroundColor: 'white',
      justifyContent: 'center',
      height: 32,
    },
    topEditBtnText: {
      //text for the edit buttons
      textAlign: 'center',
      fontSize: 16,
      fontWeight: '500',
    },
    dayHeader: {
      //text for the header for the day
      marginTop: 20,
      fontSize: 28,
      fontWeight: '700',
      textAlign: 'center',
    },
    row: {
      //style for one row of the table
      flexDirection: 'row',
      backgroundColor: 'lavender',
      //width: win.width * 0.9,
      width: '100%',
      height: 31,
      alignItems: 'center',
      borderBottomColor: 'black',
      borderBottomWidth: 1,
    },
    timeSlotBtn: {
      //Button for oneCell of the Table
      //width: 58,
      height: 30,
      backgroundColor: '#78B7BB',
      //borderRadius: 2,
      //alignSelf: 'stretch',
      justifyContent: 'center',
    },
    btnText: {
      //Text within one cell button
      textAlign: 'center',
      color: theme.text2,
      fontWeight: '400',
      fontSize: 11,
    },
    shadowProp: {
      //shadows to apply
      shadowColor: '#171717',
      shadowOffset: { width: -3, height: 5 },
      shadowOpacity: 0.4,
      shadowRadius: 3,
    },
/*     deletePopup: {
      //style for the bottom screen popup for editing a cell
      alignSelf: 'center',
      flexDirection: 'column',
      justifyContent: 'space-between',
      marginTop: win.height * 0.83,
      width: win.width,
      height: win.height * 0.17,
      backgroundColor: theme.background,
    }, */
    fabStyle: {
      bottom: 16,
      right: win.width * 0.02,
      position: 'absolute',
    },
  });
