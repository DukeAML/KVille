import React, { useState, useCallback, useRef, memo, useEffect } from 'react';
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
  Picker
} from 'react-native';
import { Table, TableWrapper, Col, Cell } from 'react-native-table-component';
import { Divider, Badge } from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { withSpring, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FAB, Portal, Provider } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import { createGroupSchedule } from '../../common/CreateGroupSchedule';
import { fetchGroupSchedule } from '../../common/services/db_services';

import { firestore, auth } from '../../common/services/db/firebase_config';

import { useTheme } from '../context/ThemeProvider';
import { useRefreshByUser } from '../hooks/useRefreshByUser';
import { BottomSheetModal } from '../components/BottomSheetModal';
import { ActionSheetModal } from '../components/ActionSheetModal';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ErrorPage } from '../components/ErrorPage';
import { toggleSnackBar, setSnackMessage } from '../redux/reducers/snackbarSlice';
import scheduleDates from '../../common/data/scheduleDates.json';
import { DateRangeChanger } from '../components/DateRangeChanger/DateRangeChanger';
import { getNumSlotsBetweenDates, getNumDaysBetweenDates, getDatePlusNumShifts, getCurrentDate, getDayAbbreviation} from '../../common/services/dates_services';
import { DropdownHeaderBar } from '../components/DropdownHeaderBar/DropdownHeaderBar'

const Helpers = require ('../../common/Scheduling/helpers');



if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}


const times = scheduleDates["times"];

const win = Dimensions.get('window'); //Global Var for screen size

const getIndexAddElementIfNeeded = (objectArr, targetValue, searchField, newElement) => {
  for (let i = 0; i < objectArr.length; i += 1){
    if (objectArr[i][searchField] == targetValue){
      return i;
    }
  }
  objectArr.push(newElement);
  return objectArr.length -1 ;
  
}

export default function Schedule({ navigation }) {
  console.log("rendering Schedule screen");
  const groupCode = useSelector((state) => state.user.currGroupCode);
  const groupRole = useSelector((state) => state.user.currGroupRole);
  const tentType = useSelector((state) => state.user.currTentType);

  const [isReady, setIsReady] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false); //for the popup for editing a time cell
  const [isMemberModalVisible, setMemberModalVisible] = useState(false); //for the popup for choosing a member from list
  const [fabState, setFabState] = useState({ open: false });
  const [weekDisplay, setWeekDisplay] = useState('Current Week');
  console.log("my current tent type is " + tentType);
  console.log("default start date is " + Helpers.getTentingStartDate(tentType));
  const [displayStartDate, setDisplayStartDate] = useState(Helpers.getTentingStartDate(tentType));
  const [displayEndDate, setDisplayEndDate] = useState(getDatePlusNumShifts(Helpers.getTentingStartDate(tentType), 48));
  const [renderDay, setRenderDay] = useState(0); //stores the current day that is being rendered
  const [newMember, setNewMember] = useState('Select a Member'); //to set the new member to replace old one

  const oldMember = useRef('');
  const editIndex = useRef(0);
  const newSchedule = useRef([]);
  const editSuccessful = useRef(false); //tentative for when editing schedule and member already exists, then it shouldn't change, otherwise it will
  const scrollRef = useRef([]);
  const colors = ['#ececec', '#3c78d8', '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9',
  '#a4c2f4' , '#fed9c9', '#b4a7d6', '#d5a6bd', '#e69138', '#6aa84f'];
  const colorCodes = useRef([{ id: 1, name: 'empty', color: '#ececec', changedHrs: 0},
                              {id: '6789', name: 'Grace', color:'#3c78d8', changedHrs:0}]);

  const getIndexInColorCodes = (name) => {
    return getIndexAddElementIfNeeded(colorCodes.current, name, "name", 
      {id: "id??", name: name, color: colors[colorCodes.current.length % colors.length], changedHrs: 0})

  }

  const { theme } = useTheme();
  const dayHighlightOffset = useSharedValue(0);
  const isCurrentWeek = useSharedValue(1);
  const { open } = fabState;
  const dispatch = useDispatch();



  const { isLoading, isError, error, refetch, data: {groupSchedule, groupScheduleStartDate} } = useQuery(
    ['groupSchedule', auth.currentUser.uid, groupCode],
    () => fetchGroupSchedule(groupCode),
    {
        initialData: {groupSchedule: [], groupScheduleStartDate: Helpers.getTentingStartDate(tentType)},
        onSuccess: () => {
        setIsReady(true);
        setIsRefetching(false);
        setDisplayStartDate(getDefaultDisplayDateRangeStartDate());
        setDisplayEndDate(getDefaultDisplayDateRangeEndDate());
      },
    }
  );
  
  const { isRefetchingByUser, refetchByUser } = useRefreshByUser(refetch);


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
            ['groupSchedule', auth.currentUser.uid, groupCode],
            {groupSchedule: newSchedule.current, groupScheduleStartDate}
          );
          queryClient.invalidateQueries(['group', groupCode]);

        } else return;
      },
    });
  }

  const getSlotStringWithReplacedMember = (originalSlot, oldMember, newMember) => {
    let originalMembers = originalSlot.split(" ");
    let newMembers = [];
    for (let i =0; i < originalMembers.length; i+= 1){
      if (originalMembers[i] == oldMember){
        newMembers.push(newMember);
      } else {
        newMembers.push(originalMembers[i]);
      }
    }
    return newMembers.join(" ");
  }
  //function for editing the schedule based on old member and new member to replace
  async function editCell(options) {
    const { index, oldMember, newMember, groupCode } = options;
    const groupRef = firestore.collection('groups').doc(groupCode);

    let currSchedule = groupSchedule;
    //Must check if the member already exists in the array
    if (newMember !== 'empty' && groupSchedule[index].trim().split(' ').includes(newMember)) {
      dispatch(toggleSnackBar());
      dispatch(setSnackMessage('Member already in chosen timeslot'));
      editSuccessful.current = false;
    } else {
      currSchedule[index] = getSlotStringWithReplacedMember(currSchedule[index], oldMember, newMember);

      groupRef.update({
        groupSchedule: currSchedule,
      });

      newSchedule.current = currSchedule;
      editSuccessful.current = true;
    }
    setNewMember('Select a Member')
  }

  const postSchedule = useUpdateSchedule(groupCode, tentType);

  function useUpdateSchedule(groupCode, tentType) {
    const queryClient = useQueryClient();
    return useMutation(async ({dateRangeStart, dateRangeEnd}) => {
      await assignTentersAndUpdateDB(groupCode, tentType, dateRangeStart, dateRangeEnd);
    }, {
      onError: (error) => {
        console.error(error);
      },
      onSuccess: () => {
        queryClient.setQueryData(
          ['groupSchedule', auth.currentUser.uid, groupCode],
          {groupSchedule: newSchedule.current, groupScheduleStartDate}
        );
        queryClient.invalidateQueries(['groupSchedule', auth.currentUser.uid, groupCode]);
        queryClient.invalidateQueries(['group', groupCode]);
      },
    });
  }

  /**
   * 
   * @param {String} groupCode 
   * @param {String} tentType 
   * @param {Date} dateRangeStart 
   * @param {Date} dateRangeEnd 
   */
  async function assignTentersAndUpdateDB(groupCode, tentType, dateRangeStart, dateRangeEnd) {
    await createGroupSchedule(groupCode, tentType, dateRangeStart, dateRangeEnd)
      .then((newScheduleInRange) => {
        let startIndex = getNumSlotsBetweenDates(groupScheduleStartDate, dateRangeStart);

        let newFullSchedule = [...groupSchedule];
        for (let i = 0; i < newScheduleInRange.length; i+= 1){
          newFullSchedule[i + startIndex] = newScheduleInRange[i];
        }
        newSchedule.current = newFullSchedule; //sussy code from the original
        firestore
          .collection('groups')
          .doc(groupCode)
          .update({
            groupSchedule: newFullSchedule,
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


  function onFabStateChange({ open }) {
    setFabState({ open });
  }

  //TODO: refactor out to common folder
  const getDefaultDisplayDateRangeStartDate = () => {
    let currentDate = getCurrentDate();
    if (currentDate < groupScheduleStartDate){
      return groupScheduleStartDate;
    } else if (currentDate >= getDatePlusNumShifts(groupScheduleStartDate, groupSchedule.length)){
      return groupScheduleStartDate;
    } else {
      return currentDate;
    }
  }

  //TODO: refactor out to common folder
  const getDefaultDisplayDateRangeEndDate = () => {
    let correspondingStartDate = getDefaultDisplayDateRangeStartDate();
    let startDatePlusWeek = getDatePlusNumShifts(correspondingStartDate, 336);
    let endOfTenting = Helpers.getTentingEndDate();
    
  
    if (startDatePlusWeek <= endOfTenting) {
      return startDatePlusWeek;
    } else {
      return endOfTenting;
    }
  }

  const getDefaultAssignDateRangeStartDate = () => {
    for (let i = 0; i < groupSchedule.length; i += 1){
      let names = groupSchedule[i].split(' ');
      for (let j = 0; j < names.length; j+= 1){
        if (names[j] == "empty")
          return getDatePlusNumShifts(groupScheduleStartDate, i);
      }
    }

    let currentDate = getCurrentDate();
    if (currentDate < groupScheduleStartDate){
      return groupScheduleStartDate;
    } else if (currentDate >= getDatePlusNumShifts(groupScheduleStartDate, groupSchedule.length)){
      return groupScheduleStartDate;
    } else {
      return currentDate;
    }

  }

  const getDefaultAssignDateRangeEndDate = () => {
    let correspondingStartDate = getDefaultAssignDateRangeStartDate();
    let startDatePlusWeek = getDatePlusNumShifts(correspondingStartDate, 336);
    let endOfTenting = Helpers.getTentingEndDate();
    
  
    if (startDatePlusWeek <= endOfTenting) {
      return startDatePlusWeek;
    } else {
      return endOfTenting;
    }
  }

  const validateAssignTentersDateRange = (newStartDate, newEndDate) => {
    if (newStartDate < groupScheduleStartDate){
      return {successful: false, message: "Start date of " + newStartDate.getTime() + " must be at least " + groupScheduleStartDate.getTime()};
    } else if (newEndDate > Helpers.getTentingEndDate()){
      return {succesful: false, message: "End date cannot occur after the end of tenting"};
    } else if (newEndDate <= newStartDate){
      return {succesful: false, message: "End date must be later than the start date"};
    } else {
      return {successful: true, message: "Date Range is valid"}
    }
  }


  const ScheduleDropdownHeaderBar = () => {
    return (
      <DropdownHeaderBar labels={["Dates Visible", "Assign Tenters"]} components={[
        <DateRangeChanger startDate={displayStartDate} endDate={displayEndDate} key={"DateRangeChanger1"} includeHours={false}
          onSuccess={(dateRangeStart, dateRangeEnd) => {
            setDisplayStartDate(dateRangeStart);
            setDisplayEndDate(dateRangeEnd);
          }}/>,
        <DateRangeChanger 

          startDate={getDefaultAssignDateRangeStartDate()} endDate={getDefaultAssignDateRangeEndDate()} 
          title={"Assign Tenters for the following Time Span:"}
          validateDateRange={validateAssignTentersDateRange}
          onSuccess={(dateRangeStart, dateRangeEnd) => {
            console.log("calling the mutate with " + dateRangeStart + " to " + dateRangeEnd);
            postSchedule.mutate({dateRangeStart, dateRangeEnd});
          }}
          key={"DateRangeChanger2"}/>
      ]}/>
    );
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
   * Component for each single cell timeslot - this cell displays the name of a person in it
   * 
   * @param index : index of cell within the entire schedule array
   * @param person : string holding the person currently scheduled for the time cell
   */
  const OneCell = memo(({ index, person }) => {
    //changes background based on who the member is
    const indexofUser =  getIndexInColorCodes(person); 
    const backgroundColor = colorCodes.current[indexofUser].color;

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
   * @param {*} arrayIndex index of cell in the entire groupSchedule
   * @param {*} members string of one time shift (ex. "member1 member2 member3 member4 ")
   * @param {boolean} inBounds should be set to false only when this row is not within the bounds of the schedule
   */
  const RenderCell = (index, arrayIndex, members, inBounds=true) => {
    if (!inBounds){
      return (
        <View style={{ flex: 1 }}>
          <View style={[styles(theme).timeSlotBtn, { backgroundColor: 'gray' }]}>
            <Text
              style={[styles(theme).btnText, { color: 'black', fontWeight: '700' }]}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              numberOfLines={1}
            >
              {"Not Included in Schedule"}
            </Text>
          </View>
        </View>
      );
    }
    const people = members.trim().split(' '); //stores the string as an array of single members
    return (
      <View style={styles(theme).row}>
        {people.map((person, personIndex) => {
          return (
            <OneCell index={arrayIndex} person={person} key={"OneCellRowIndex"+arrayIndex.toString()+"personIndex"+personIndex.toString()}/>
          );
        })}
      </View>
    );
  };

  
  /**
   * Component for the table for one day's schedule
   * @param {int} day should be an int: 0 for the first calendar day in the schedule, 1 for the second day, etc...
   */
  const DailyTable = memo(function ({ day }) {
    //if (schedule == undefined) return null;
    let indexAdder = getNumSlotsBetweenDates(groupScheduleStartDate, displayStartDate) + (day * 48);
    console.log("indexAdder is " + indexAdder);
  

    let OUT_OF_BOUNDS_STR = "!@#$!#$asc9a7"; //random string no user could possibly put as their name
    let dayArr = [];
    for (let i = 0; i < 48; i+= 1){
      let dataIndex = indexAdder + i;
      if ((dataIndex >= groupSchedule.length) || (dataIndex < 0)){
        dayArr.push(OUT_OF_BOUNDS_STR);
      } else {
        dayArr.push(groupSchedule[indexAdder + i]);
      }
    }

    return (
      <View style={{ marginTop: 0, width: '90%' }}>
        <Table borderStyle={{ borderColor: 'transparent' }}>
          {dayArr.map((rowData, index) => {
            return(
            <TableWrapper key={index} style={StyleSheet.flatten(styles(theme).row)}>
              <Cell
                data={RenderCell(index, index + indexAdder, dayArr[index], dayArr[index] == OUT_OF_BOUNDS_STR ? false : true)}
                textStyle={StyleSheet.flatten(styles(theme).text)}
              />
            </TableWrapper>
          );})}
        </Table>
      </View>
    );
  });


  /**
   * //Component for the top day buttons
   * @param {*} day should be an int
   * @returns 
   */
  const DayButton = ({ day }) => {
    let abbrev = getDayAbbreviation(new Date(displayStartDate.getTime() + day * 24 * 60 * 60000));
    
    return (
      <TouchableOpacity
        style={[styles(theme).button, { backgroundColor: (day == renderDay ? theme.primary: 'transparent'), zIndex: 2, width: (100 / (getNumDaysBetweenDates(displayStartDate, displayEndDate)).toString()+"%") }]}
        onPress={() => {
          setRenderDay(day);
          dayHighlightOffset.value = day;
          if (groupSchedule.length != 0) {
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
              } else if (auth.currentUser.uid == 'LyenTwoXvUSGJvT14cpQUegAZXp1') {
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

        

        <ScheduleDropdownHeaderBar/>
        
        <View style={{ zIndex: 1 }}>
          <View style={[styles(theme).buttonContainer, styles(theme).shadowProp]}>
            
            {new Array(getNumDaysBetweenDates(displayStartDate, displayEndDate)).fill(0).map((_, dayIndex) => {
              return (
                <DayButton day={dayIndex} key={dayIndex.toString()}/>
              );
              
            })}
     
          
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
