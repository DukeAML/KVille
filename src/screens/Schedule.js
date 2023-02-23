import React, { useState, useCallback, useRef, memo } from 'react';
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
  SafeAreaView,
  Image,
} from 'react-native';
import { Table, TableWrapper, Col, Cell } from 'react-native-table-component';
import { Divider, Badge } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FAB, Portal, Provider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { createGroupSchedule } from '../backend/CreateGroupSchedule';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { BottomSheetModal } from '../components/BottomSheetModal';
import { ActionSheetModal } from '../components/ActionSheetModal';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorPage } from '../components/ErrorPage';
import { toggleSnackBar, setSnackMessage } from '../redux/reducers/snackbarSlice';
import tentemoji from '../assets/tentemoji.png';
import scheduleDates from '../data/scheduleDates.json';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

//prettier-ignore
// const times = [ //Times for right column of the list of times of the day
//   '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', 
//   '11am', '12am', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm',
//   '10pm', '11pm',
// ];
const times = scheduleDates["times"];

let prevColorCodes;
let prevSchedule = new Array();

const win = Dimensions.get('window'); //Global Var for screen size

export default function Schedule({ navigation }) {
  const groupCode = useSelector((state) => state.user.currGroupCode);
  const groupRole = useSelector((state) => state.user.currGroupRole);
  const tentType = useSelector((state) => state.user.currTentType);

  const [isReady, setIsReady] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false); //for the popup for editing a time cell
  const [isMemberModalVisible, setMemberModalVisible] = useState(false); //for the popup for choosing a member from list
  const [isConfirmationVisible, setConfirmationVisible] = useState(false); //for confirmation Popup
  const [fabState, setFabState] = useState({ open: false });
  const [weekDisplay, setWeekDisplay] = useState('Current Week');
  const [renderDay, setRenderDay] = useState('Sunday'); //stores the current day that is being rendered
  const [newMember, setNewMember] = useState('Select a Member'); //to set the new member to replace old one

  const oldMember = useRef('');
  const editIndex = useRef(0);
  const newSchedule = useRef([]);
  const editSuccessful = useRef(false); //tentative for when editing schedule and member already exists, then it shouldn't change, otherwise it will
  const scrollRef = useRef([]);
  const colorCodes = useRef([{ id: 1, name: 'empty', color: '#ececec', changedHrs: 0},
                              {id: '6789', name: 'Grace', color:'#3c78d8', changedHrs:0}]);

  const { theme } = useTheme();
  const dayHighlightOffset = useSharedValue(0);
  const isCurrentWeek = useSharedValue(1);
  const { open } = fabState;
  const dispatch = useDispatch();

  const { isLoading, isError, error, refetch, data } = useQuery(
    ['groupSchedule', firebase.auth().currentUser.uid, groupCode, weekDisplay],
    () => fetchGroupSchedule(groupCode, weekDisplay),
    {
      initialData: [],
      onSuccess: () => {
        setIsReady(true);
        setIsRefetching(false);
      },
    }
  );

  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);

  async function fetchGroupSchedule(groupCode, weekDisplay) {
    console.log('query initiated');

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

  const postEditCell = useEditCell(groupCode, weekDisplay);

  function useEditCell(groupCode, weekDisplay) {
    const queryClient = useQueryClient();
    return useMutation((options) => editCell(options), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        if (editSuccessful.current) {
          queryClient.setQueryData(
            ['groupSchedule', firebase.auth().currentUser.uid, groupCode, weekDisplay],
            newSchedule.current
          );
        } else return;
      },
    });
  }

  //function for editing the schedule based on old member and new member to replace
  async function editCell(options) {
    const { index, oldMember, newMember, groupCode } = options;
    const groupRef = firebase.firestore().collection('groups').doc(groupCode);

    let currSchedule = data;
    //Must check if the member already exists in the array
    if (newMember !== 'empty' && data[index].trim().split(' ').includes(newMember)) {
      dispatch(toggleSnackBar());
      dispatch(setSnackMessage('Member already in chosen timeslot'));
      editSuccessful.current = false;
    } else {
      currSchedule[index] = currSchedule[index].replace(oldMember, newMember);
      const indexofOld = colorCodes.current.findIndex((object) => object.name === oldMember);
      const indexofNew = colorCodes.current.findIndex((object) => object.name === newMember);

      let oldHours;
      let newHours;
      let oldShifts;
      let newShifts;
      await groupRef
        .collection('members')
        .doc(colorCodes.current[indexofOld].id)
        .get()
        .then((doc) => {
          oldHours = doc.data().scheduledHrs - 0.5;
          oldShifts = doc.data().shifts;
          oldShifts[index] = false;
        });
      await groupRef
        .collection('members')
        .doc(colorCodes.current[indexofNew].id)
        .get()
        .then((doc) => {
          newHours = doc.data().scheduledHrs + 0.5;
          newShifts = doc.data().shifts;
          newShifts[index] = true;
        });
      groupRef.collection('members').doc(colorCodes.current[indexofOld].id).update({
        scheduledHrs: oldHours,
        shifts: oldShifts,
      });
      groupRef.collection('members').doc(colorCodes.current[indexofNew].id).update({
        scheduledHrs: newHours,
        shifts: newShifts,
      });

      //colorCodes.current[indexofOld].changedHrs -= 0.5;
      //colorCodes.current[indexofNew].changedHrs += 0.5;

      groupRef.update({
        groupSchedule: currSchedule,
      });

      newSchedule.current = currSchedule;
      editSuccessful.current = true;
    }
  }

  const postSchedule = useUpdateSchedule(groupCode, tentType, weekDisplay);

  function useUpdateSchedule(groupCode, tentType, weekDisplay) {
    const queryClient = useQueryClient();
    return useMutation(() => createNewGroupSchedule(groupCode, tentType), {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.setQueryData(
          ['groupSchedule', firebase.auth().currentUser.uid, groupCode, weekDisplay],
          newSchedule.current
        );
        queryClient.invalidateQueries(['shifts', firebase.auth().currentUser.uid, groupCode]);
      },
    });
  }

  async function createNewGroupSchedule(groupCode, tentType) {
    //let newSchedule;
    await createGroupSchedule(groupCode, tentType, 'week2')
      .then((groupSchedule) => {
        //console.log('Group Schedule', groupSchedule);
        newSchedule.current = groupSchedule;

        //If current schedule is blank, no need to update
        if (data[0] !== undefined) prevSchedule = data;

        //Update previous colorCodes to current and update current schedule to the groupSchedule
        prevColorCodes = colorCodes.current;
        firebase
          .firestore()
          .collection('groups')
          .doc(groupCode)
          .update({
            groupSchedule: newSchedule.current,
            previousSchedule: prevSchedule,
            previousMemberArr: colorCodes.current,
          })
          .catch((error) => console.error(error));
        dispatch(setSnackMessage('New Schedule created'));
        dispatch(toggleSnackBar());
      })
      .catch((error) => {
        console.error(error);
        dispatch(setSnackMessage('Not enough members'));
        dispatch(toggleSnackBar());
      });
    //w schedule', newSchedule);
  }

  function toggleModal() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
    //to toggle the edit cell popup
    setModalVisible(!isModalVisible);
  }

  function toggleMemberModal() {
    //to toggle the popup for the member list
    setMemberModalVisible(!isMemberModalVisible);
  }

  function toggleConfirmation() {
    //to toggle the popup for the edit confirmation
    setConfirmationVisible(!isConfirmationVisible);
  }

  function onFabStateChange({ open }) {
    setFabState({ open });
  }

  function toggleWeek() {
    if (weekDisplay == 'Current Week') {
      console.log('showing previous week', weekDisplay);
      setWeekDisplay('Previous Week');
      isCurrentWeek.value = 0;
    } else {
      console.log('showing current week');
      setWeekDisplay('Current Week');
      isCurrentWeek.value = 1;
    }
    setIsRefetching(true);
    refetch();
  }

  const TimeColumn = memo(function () {
    //component for side table of 12am-12am time segments
    return (
      <Table style={{ width: '7%', marginTop: -31 }}>
        <Col
          data={times}
          heightArr={[62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62]}
          textStyle={StyleSheet.flatten(styles(theme).timesText)}
          //style={{  borderWidth: 1 }}
        />
      </Table>
    );
  });

  //to render flatList in member list popup
  const renderMember = ({ item }) => {
    let height = win.height * 0.45 * (1 / colorCodes.current.length) + 8;
    return (
      <View style={{ width: '100%' }}>
        <TouchableOpacity
          onPress={() => {
            setNewMember(item.name);
            toggleMemberModal();
            console.log('height', height);
          }}
          style={{ width: '100%' /* borderBottomWidth:1 */ }}
        >
          <View style={{ height: height, justifyContent: 'center' }}>
            <Text style={{ textAlign: 'center', color: 'black', fontSize: 18 }}>{item.name}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Component for each single cell timeslot
   * 
   * @param index : index of cell within the entire schedule array
   * @param person : string holding the person currently scheduled for the time cell
   */
  const OneCell = memo(({ index, person }) => {
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
    if (weekDisplay == 'Current Week' && (groupRole == 'Creator' || groupRole == 'Admin') && person != 'Grace') {
      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              editIndex.current = index;
              oldMember.current = person;
              console.log('index: ', index);
              toggleModal();
            }}
          >
            <View style={[styles(theme).timeSlotBtn, { backgroundColor: backgroundColor }]}>
              <Text
                style={
                  person == 'empty'
                    ? [styles(theme).btnText, { color: theme.error, fontWeight: '700' }]
                    : styles(theme).btnText
                }
                adjustsFontSizeToFit
                minimumFontScale={0.5}
                numberOfLines={1}
              >
                {person}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View style={{ flex: 1 }}>
          <View style={[styles(theme).timeSlotBtn, { backgroundColor: backgroundColor }]}>
            <Text
              style={
                person == 'empty'
                  ? [styles(theme).btnText, { color: theme.error, fontWeight: '700' }]
                  : person == 'Grace' ? 
                  [styles(theme).btnText, { color: theme.text1, fontWeight: '700' }]:
                  styles(theme).btnText
              }
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              numberOfLines={1}
            >
              {person}
            </Text>
          </View>
        </View>
      );
    }
  });

  /**
   * Component for each row to list the people in that time shift
   * # of people on the row is dependent on the tentType and time of day
   * @param {*} index index of cell within the day (range from 0-47) 
   * @param {*} arrayIndex index of cell in the entire schedule array (range from 0-337)
   * @param {*} members string of one time shift (ex. "member1 member2 member3 member4 ")
   * 
   */
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
  const DailyTable = memo(function ({ day }) {
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
      <View style={{ marginTop: 0, width: '90%' }}>
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
  });

  const customSpringStyles = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(dayHighlightOffset.value * (win.width / 7), {
            damping: 50,
            stiffness: 90,
          }),
        },
      ],
    };
  });
  const toggleWeekSpring = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(isCurrentWeek.value * (win.width * 0.3), {
            damping: 50,
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
          if (data.length != 0) {
            scrollRef.current.scrollTo({ x: 0, y: 0, animated: true });
          }
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

  if (isLoading || !isReady) {
    return <LoadingIndicator />;
  }

  if (isError) {
    return <ErrorPage navigation={navigation} />;
  }

  if (data.length == 0 && !isRefetching && weekDisplay != 'Previous Week') {
    return (
      <View style={styles(theme).emptyStateContainer}>
        <Text>Group Schedule has not been created</Text>
        <Image style={{ opacity: 0.5, height: '30%', width: '50%' }} resizeMode='contain' source={tentemoji} />
        {groupRole != 'Member' ? (
          <TouchableOpacity
            style={{
              width: '50%',
              height: 50,
              backgroundColor: theme.primary,
              borderRadius: 30,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 50,
            }}
            onPress={() => {
              postSchedule.mutate();
            }}
          >
            <Icon name='plus' color={theme.icon1} size={20} style={{ marginRight: 10 }} />
            <Text style={{ color: theme.text1, fontSize: 15, fontWeight: '500' }}>Create Schedule</Text>
          </TouchableOpacity>
        ) : (
          <Text>Ask the creator or an admin to create a new schedule</Text>
        )}
      </View>
    );
  }

  return (
    <Provider>
      <View style={styles(theme).bigContainer}>
        <ActionSheetModal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal}
          onSwipeComplete={toggleModal}
          toggleModal={toggleModal}
          userStyle={'light'}
          cancelButton={true}
          height={win.height * 0.15}
        >
          <TouchableOpacity onPress={toggleMemberModal} style={{ height: '50%', width: '100%' }}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                borderBottomWidth: 1,
                borderColor: '#cfcfcf',
                flexDirection: 'row',
              }}
            >
              <Text style={{ textAlign: 'center', fontSize: 24, color: 'black' }}>{newMember}</Text>
              <Icon name='chevron-down' color={theme.icon2} size={30} style={{ marginLeft: 10 }} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (newMember == 'Select a Member') {
                toggleModal();
              } else if (firebase.auth().currentUser.uid == 'LyenTwoXvUSGJvT14cpQUegAZXp1') {
                toggleModal();
                dispatch(setSnackMessage('This is a demo account'));
                dispatch(toggleSnackBar());
              } else {
                toggleModal();
                postEditCell.mutate({
                  index: editIndex.current,
                  oldMember: oldMember.current,
                  newMember: newMember,
                  groupCode: groupCode,
                });
              }
            }}
            style={{ height: '50%', width: '100%' }}
          >
            <View style={{ height: '100%', justifyContent: 'center' }}>
              <Text
                style={{
                  textAlign: 'center',
                  color: 'black',
                  fontSize: 20,
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
            userStyle={'light'}
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
            if (firebase.auth().currentUser.uid == 'LyenTwoXvUSGJvT14cpQUegAZXp1') {
              dispatch(setSnackMessage('This is a demo account'));
              dispatch(toggleSnackBar());
            } else {
              postSchedule.mutate();
            }
          }}
          isVisible={isConfirmationVisible}
          userStyle={'light'}
          onBackdropPress={() => setConfirmationVisible(false)}
          onSwipeComplete={toggleConfirmation}
        />

        <View style={{ zIndex: 1 }}>
          <View style={[styles(theme).buttonContainer, styles(theme).shadowProp]}>
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
        <View style={{ width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <View style={styles(theme).toggleWeekContainer}>
            <Animated.View style={[styles(theme).toggleWeekHighlight, toggleWeekSpring]} />
            <TouchableOpacity style={styles(theme).toggleWeekButton} onPress={toggleWeek}>
              <Text>Previous</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles(theme).toggleWeekButton} onPress={toggleWeek}>
              <Text>Current</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ backgroundColor: '#D2D5DC', marginTop: 0, flex: 1, zIndex: 0 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl enabled={true} refreshing={isRefetchingByUser} onRefresh={refetchByUser} />}
            ref={scrollRef}
            contentContainerStyle={{ paddingBottom: 30 }}
            style={{ width: '100%' }}
            removeClippedSubviews={true}
          >
            <View style={{ flexDirection: 'row', marginTop: 20, padding: 0, width: '100%' }}>
              <TimeColumn />
              <DailyTable day={renderDay} />
            </View>
          </ScrollView>
        </View>

        {groupRole != 'Member' ? (
          <Portal>
            <FAB.Group
              open={open}
              icon={'plus'}
              style={{ position: 'absolute' }}
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
        ) : null}
      </View>
    </Provider>
  );
}

const styles = (theme) =>
  StyleSheet.create({
    bigContainer: {
      flex: 1,
      backgroundColor: '#D2D5DC',
      flexGrow: 1,
      overflow: 'hidden',
    }, //for the entire page's container
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: '30%',
      backgroundColor: theme.background,
    },
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
    toggleWeekContainer: {
      borderRadius: 10,
      width: '60%',
      height: 30,
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      borderWidth: 1,
      marginTop: 20,
      backgroundColor: '#FAFAFA',
      padding: 1,
      borderColor: '#fff',
    },
    toggleWeekHighlight: {
      position: 'absolute',
      width: '50%',
      height: '100%',
      left: 0,
      borderRadius: 10,
      backgroundColor: '#FCFCFC',
      shadowColor: '#171717',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
    },
    toggleWeekButton: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    buttonContainer: {
      //container for the top buttons
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderBottomRightRadius: 20,
      borderBottomLeftRadius: 20,
      backgroundColor: theme.primaryContainer,
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
      width: '100%',
      height: 31,
      alignItems: 'center',
      borderBottomColor: 'black',
      borderBottomWidth: 1,
    },
    timeSlotBtn: {
      //Button for oneCell of the Table
      height: 30,
      backgroundColor: '#78B7BB',
      paddingHorizontal: 1,
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
    fabStyle: {
      bottom: 16,
      right: win.width * 0.02,
      position: 'absolute',
    },
  });
