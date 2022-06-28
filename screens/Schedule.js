import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import { Table, TableWrapper, Col, Cell } from 'react-native-table-component';

import { useFocusEffect } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import Modal from 'react-native-modal';
import { Snackbar } from 'react-native-paper';

import { createGroupSchedule } from '../backend/CreateGroupSchedule';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// prettier-ignore
const times = [ //Times for right column of the list of times of the day
  '12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', 
  '11am', '12am', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm',
  '10pm', '11pm',
];

//Colors of each member, first is for 'empty'
// prettier-ignore
const colors = ['#D0342C', '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9',
  '#a4c2f4' , '#fed9c9', '#b4a7d6', '#d5a6bd', '#e69138', '#6aa84f'];

let colorCodes = [
  //Array for color corresponding to each member
  { id: 1, name: 'empty', color: '#D0342C', changedHrs: 0},
];

let prevColorCodes;

//let schedule = new Array(); //GLOBAL VARIABLE for the entire group schedule
let memberIDArray = new Array(); //GLOBAL Variable to store the members, their id and name in schedule

let currSchedule = new Array();
let prevSchedule = new Array();





const win = Dimensions.get('window'); //Global Var for screen size

export default function Schedule({ route }) {
  const { code, tentType } = route.params; //parameters needed: groupCode and tentType
  console.log('Schedule screen params', route.params);
  const [isReady, setIsReady] = useState(false); // for checking if firebase is read before rendering
  const [isModalVisible, setModalVisible] = useState(false); //for the popup for editing a time cell
  const [isMemberModalVisible, setMemberModalVisible] = useState(false); //for the popup for choosing a member from list
  const [isConfirmationVisible, setConfirmationVisible] = useState(false); //for confirmation Popup

  const [typeOfEdit, setTypeOfEdit] = useState('Push'); //either 'Push' (for edits) or 'Create' (for making a new schedule)

  const [weekDisplay, setWeekDisplay] = useState('Current Week');
  const [schedule,setSchedule] = useState(currSchedule);
  let myBtnColor = weekDisplay == 'Current Week' ? '#bfd4db' : '#96b9d0';
  

  //These Hooks are for editing the group schedule
  const [newMember, setNewMember] = useState('Select a Member'); //to set the new member to replace old one
  const [oldMember, setOldMember] = useState(''); //to store which member is being replaced
  const [editIndex, setEditIndex] = useState(0); //to store which index is being edited

  const [renderDay, setRenderDay] = useState('Sunday'); //stores the current day that is being rendered

  const [isSnackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState(''); // for temporary popup 


  /* const window = useWindowDimensions();
  const styles= makeStyles(window.fontScale); */

  //FIREBASE REFERENCE for group
  /* const groupRef = firebase.firestore().collection('groupsTest').doc('BtycLIprkN3EmC9wmpaE'); */
  const groupRef = firebase.firestore().collection("groups").doc(code);


  const toggleModal = () => {
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

  //variables to store the # of people needed for the day and night shifts
  let numberForDay, numberForNight;

  //based on tent type, sets the number of people needed for day and night shifts
  switch (tentType) {
    case 'Black':
      numberForDay = 2;
      numberForNight = 10;
      break;
    case 'Blue':
      numberForDay = 1;
      numberForNight = 6;
      break;
    default:
      numberForDay = 1;
      numberForNight = 2;
  }


  //function for editing the schedule based on old member and new member to replace
  const editCell = (index, oldMember, newMember) => {
    //must delete from 'schedule' and update the string within
    //schedule[index] = schedule[index].replace(oldMember, newMember);
    currSchedule[index] = currSchedule[index].replace(oldMember, newMember);
    const indexofOld = colorCodes.findIndex((object) => object.name === oldMember);
    const indexofNew = colorCodes.findIndex((object) => object.name === newMember);
    colorCodes[indexofOld].changedHrs -= 0.5;
    colorCodes[indexofNew].changedHrs += 0.5;
    console.log('indexOfOld: ', indexofOld, '|', 'indexOfNew', '|', indexofNew);
    console.log('index: ', index, '|| old: ', oldMember, '|| new: ', newMember);
  };

  const TimeColumn = () => {
    //component for side table of 12am-12am time segments
    return (
      <Table>
        <Col
          data={times}
          heightArr={[
            62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62, 62,
            62, 62, 62, 62, 62, 62, 62,
          ]}
          textStyle={StyleSheet.flatten(styles.timesText)}
        />
      </Table>
    );
  };

  //Component for the popup list of members for each member
  const Member = ({ name }) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => {
            setNewMember(name);
            toggleMemberModal();
          }}
        >
          <View style={{ backgroundColor: '#656565' }}>
            <Text
              style={{
                textAlign: 'left',
                color: 'white',
                marginLeft: 15,
                height: 25,
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
    const indexofUser = (weekDisplay == 'Current Week') ? colorCodes.findIndex((object) => object.name === person):
      prevColorCodes.findIndex((object) => object.name === person);
    const backgroundColor = (weekDisplay == 'Current Week') ? colorCodes[indexofUser].color : prevColorCodes[indexofUser].color; //gets background color from the colorCodes Array
    if (weekDisplay == 'Current Week'){
      return (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            onPress={() => {
              setEditIndex(index);
              setOldMember(person);
              console.log('index: ', index);
              toggleModal();
            }}
          >
            <View
              style={[styles.timeSlotBtn, { backgroundColor: backgroundColor }]}
            >
              <Text style={styles.btnText} adjustsFontSizeToFit minimumFontScale={.5}>{person}</Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (weekDisplay == 'Previous Week'){
      return (
        <View style={{ flex: 1 }}>
            <View
              style={[styles.timeSlotBtn, { backgroundColor: backgroundColor }]}
            >
              <Text style={styles.btnText} adjustsFontSizeToFit minimumFontScale={.5}>{person}</Text>
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
        members: string of one time shift (ex. "member1 member2 member3 member4 ")
        numDay: the number of people required for a day shift
        numNight: the number of people required for a night shift  */
  const RenderCell = (data, index, arrayIndex, members, numDay, numNight) => {
    const people = members.split(' '); //stores the string as an array of single members
    //console.log('people: ', people);
    const isNight = index >= 2 && index <= 13;

    if (!isNight && numDay === 1) {
      return (
        <View style={styles.row}>
          <OneCell index={arrayIndex} person={people[0]} />
        </View>
      );
    } else if ((isNight && numNight === 2) || (!isNight && numDay === 2)) {
      return (
        <View style={styles.row}>
          <OneCell index={arrayIndex} person={people[0]} />
          <OneCell index={arrayIndex} person={people[1]} />
        </View>
      );
    } else if (isNight && numNight === 6) {
      return (
        <View style={styles.row}>
          <OneCell index={arrayIndex} person={people[0]} />
          <OneCell index={arrayIndex} person={people[1]} />
          <OneCell index={arrayIndex} person={people[2]} />
          <OneCell index={arrayIndex} person={people[3]} />
          <OneCell index={arrayIndex} person={people[4]} />
          <OneCell index={arrayIndex} person={people[5]} />
        </View>
      );
    } else {
      return (
        <View style={styles.row}>
          <OneCell index={arrayIndex} person={people[0]} />
          <OneCell index={arrayIndex} person={people[1]} />
          <OneCell index={arrayIndex} person={people[2]} />
          <OneCell index={arrayIndex} person={people[3]} />
          <OneCell index={arrayIndex} person={people[4]} />
          <OneCell index={arrayIndex} person={people[5]} />
          <OneCell index={arrayIndex} person={people[6]} />
          <OneCell index={arrayIndex} person={people[7]} />
          <OneCell index={arrayIndex} person={people[8]} />
          <OneCell index={arrayIndex} person={people[9]} />
        </View>
      );
    }
  };

  //Component for the table for one day's schedule
  const DailyTable = ({ numberDay, numberNight, day }) => {
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
    let dayArr = schedule.slice(indexAdder, indexAdder + 48);
    //console.log(day,"||", dayArr);
    return (
      <View style={{ marginTop: 30 }}>
        <Table borderStyle={{ borderColor: 'transparent' }}>
          {dayArr.map((rowData, index) => (
            <TableWrapper key={index} style={StyleSheet.flatten(styles.row)}>
              <Cell
                data={RenderCell(
                  1,
                  index,
                  index + indexAdder,
                  dayArr[index],
                  numberDay,
                  numberNight
                )}
                textStyle={StyleSheet.flatten(styles.text)}
              />
            </TableWrapper>
          ))}
        </Table>
      </View>
    );
  };

  //Component for the top day buttons
  const DayButton = ({ day, abbrev }) => {
    return (
      <TouchableOpacity style={styles.button} onPress={() => setRenderDay(day)}>
        <Text style={styles.buttonText}>{abbrev}</Text>
      </TouchableOpacity>
    );
  };

  //Modal component for confirming if the user wants to push edits or create a new schedule
  const ConfirmationModal = ({ type }) => {
    if (type == 'Push') {
      return (
        <View style={styles.confirmationPop}>
          <Text style={styles.confirmationHeader}>Push Changes</Text>
          <Text style={styles.confirmationText}>
            Are you sure you want to push changes? This will change the schedule
            for everyone in your group.
          </Text>

          <TouchableOpacity
            onPress={() => {
              pushEdits(); //if confirmed, push edits and dismiss popUp
              toggleConfirmation();
            }}
          >
            <View style={styles.confirmationBottomBtn}>
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Yes I'm Sure
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    } else if (type == 'Create') {
      return (
        <View style={styles.confirmationPop}>
          <Text style={styles.confirmationHeader}>Create New Schedule</Text>
          <Text style={styles.confirmationText}>
            Are you sure you want to create a new schedule? This will erase the
            current schedule for all group members and cannot be undone.
          </Text>
          <TouchableOpacity
            onPress={() => {
              toggleConfirmation();
              createGroupSchedule(code, tentType).then(
              //createGroupSchedule('BtycLIprkN3EmC9wmpaE', 'Black').then(
                (groupSchedule) => {
                  console.log('Group Schedule', groupSchedule);

                  if (currSchedule !== undefined) prevSchedule = currSchedule; //If current schedule is blank, no need to update
                  //else ;
                  prevColorCodes = colorCodes;
                  currSchedule = groupSchedule;
                  //schedule = groupSchedule; //change **

                  groupRef.update({
                    groupSchedule: groupSchedule,
                    previousSchedule: prevSchedule,
                    previousMemberArr: colorCodes,
                  });
                  setSnackMessage('New Schedule Created');
                  toggleSnackBar();
                }
              ).catch ((error) => {
                console.error(error);
                setSnackMessage('Not enough members');
                toggleSnackBar();
              });  
            }}
          >
            <View style={styles.confirmationBottomBtn}>
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Yes I'm Sure
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      );
    }
  };

  //to push changes made to schedule to firebase
  //updates the scheduled hours for each user
  const pushEdits = () => {
    groupRef
    .collection('members')
    .get()
    .then((collSnap) => {
      collSnap.forEach((doc) => {
        let currName = doc.data().name;
        let currID = doc.id;    //chose to acces by ID instead just in case member name changes
        let hours = doc.data().scheduledHrs;
        let indexOfUser;
        if ( colorCodes.some((e) => e.id === currID) ) { //if Name is in member array
          indexOfUser = colorCodes.findIndex( (member) => member.id === currID );
        }
        let hoursAdded = colorCodes[indexOfUser].changedHrs;
        console.log( 'hrs of ',currName,' will be ', hours , '+',hoursAdded);
        
        if (hoursAdded !== 0){    //avoids unnecessary writes if the changes hours are 0
          console.log('changed hrs of', currName);
          doc.ref.update({
            scheduledHrs: hours + hoursAdded
          });
        }
      });
      return collSnap;
    }).then((collSnap)=>{   //To update memberArr in group with their unique id and name that corresponds with the schedule
      groupRef.update({
        //groupSchedule: schedule, //change**
        groupSchedule: currSchedule
      });
      
      for (let i = 0; i<colorCodes.length; i++){ //reinitializes the changed hrs to 0
        colorCodes[i].changedHrs = 0;
      }
    });
    setSnackMessage('Changes Saved');
    toggleSnackBar();
  };

  //to read the current schedule from firebase
  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      async function prepare() {
        try {
          await SplashScreen.preventAutoHideAsync();

          //colorCodes = [{ id: 1, name: 'empty', color: '#D0342C', changedHrs: 0}]; //reintialize colors
          prevColorCodes = new Array();

          //stores group schedule in global variable
          await groupRef.get().then((doc) => {
            //schedule = doc.data().groupSchedule; //change**
            currSchedule = doc.data().groupSchedule;
            prevSchedule = doc.data().previousSchedule;
            //memberIDArray = doc.data().memberArr;
            colorCodes = doc.data().memberArr;
            prevColorCodes = doc.data().previousMemberArr;
          })

          setSchedule(currSchedule); //force refresh 
          console.log('member id array:' , memberIDArray);

          //if (weekDisplay == 'Current Week'){
          //For setting up the color codes as well as the updating scheduled hrs
          /* for (let index = 0; index < memberIDArray.length; index++){
            if (colorCodes.length >=13 || colorCodes.length - 1 == memberIDArray.length) break;
            colorCodes.push(
              {
              id: memberIDArray[index].id,
              name: memberIDArray[index].name,
              color: colors[index+1],
              changedHrs: 0,
            });
          } */

          //prevColorCodes = [...colorCodes];
          /* let counterIndex = new Array();
          for (let i = 0; i < prevSchedule.length; i++) {
            //if (prevColorCodes.length >= 13) break; //CHANGE THIS TO 13 FOR REAL GROUP
            if (counterIndex.length >= prevColorCodes.length) break; //CHANGE THIS TO 13 FOR REAL GROUP
            if (prevSchedule[i] === prevSchedule[i - 1]) continue; //if the past line is the same, skip as members will not be new
            const people = prevSchedule[i].split(' ');
            for (let j = 0; j < people.length; j++) {
              let currentPerson = people[j];
              let added = (counterIndex.some((e) => e === currentPerson));
              
              if (prevColorCodes.some((e) => e.name === currentPerson)) {
                continue;
              } else {
                for (let k = 0; k < prevColorCodes.length; k++){
                  if (!(counterIndex.some((e) => e === prevColorCodes[k]))
                    && prevColorCodes[k].name != currentPerson && currentPerson!='') prevColorCodes[k].name = currentPerson;
                }
              }
              if (!added && currentPerson !== '') counterIndex.push(currentPerson);
            } 
          }
          console.log('counter index: ', counterIndex); */
          


        } catch (e) {
          console.warn(e);
        } finally {
          // Tell the application to render
          setIsReady(true);
        }
      }

      if (mounted) {
        prepare();
      }
      return () => {
        mounted = false;
        setIsReady(false);
      };
    }, [route.params])
  );

  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    //if firebase reading is done, then can render
    return null;
  }
  //console.log('Full Schedule: ', schedule);

  if (weekDisplay == 'Previous Week'){
    const arrayLength = prevSchedule[3].split(' ').length;
    switch (arrayLength) {
      case 10:
        numberForDay = 2;
        numberForNight = 10;
        break;
      case 6:
        numberForDay = 1;
        numberForNight = 6;
        break;
      default:
        numberForDay = 1;
        numberForNight = 2;
    }
    console.log('new number parameters',numberForDay, numberForNight);
  }

  //Possible Ideas:
  //Make a prevMemberArr in firebase, so its not so janky
  //Make ColorCodes a state like the schedule
  //Before updating prevSchedule, check if the current one is blank, if it is don't update

/*   if (weekDisplay == 'Previous Week'){
    //colorCodes = [{ id: 1, name: 'empty', color: '#D0342C', changedHrs: 0}]; //reintialize colors
    for (let k = 1; k<colorCodes.length;k++){colorCodes[k].name = ''} //reset names to empty
    let index = 1;
    for (let i = 0; i < schedule.length; i++) { //sets up the color assignment for each user
      if (index >= colorCodes.length) break; //CHANGE THIS TO 13 FOR REAL GROUP
      if (schedule[i] === schedule[i - 1]) continue; //if the past line is the same, skip as members will not be new
      const people = schedule[i].split(' ');
      for (let j = 0; j < people.length; j++) {
        if (!colorCodes.some((e) => e.name === people[j])) {
          colorCodes[index].name=people[j];
          index++;
        }
      }
    } //initializes the colorCodes so each member has a unique color background
    for (let index = 0; index < colorCodes.length; index++) {
      colorCodes[index].color = colors[index];
    }
  } else if (weekDisplay == 'Current Week'){
    colorCodes = [{ id: 1, name: 'empty', color: '#D0342C', changedHrs: 0}]; //reintialize colors
    for (let index = 0; index < memberIDArray.length; index++){
      if (colorCodes.length >=13 || colorCodes.length - 1 == memberIDArray.length) break;
      colorCodes.push(
        {
        id: memberIDArray[index].id,
        name: memberIDArray[index].name,
        color: colors[index+1],
        changedHrs: 0,
      });
    }
  } */

/*   console.log('member id array:' , memberIDArray);

  //For setting up the color codes as well as the updating scheduled hrs
  if (memberIDArray !== undefined){
    for (let index = 0; index < memberIDArray.length; index++){
      if (colorCodes.length >=13 || colorCodes.length - 1 == memberIDArray.length) break;
      colorCodes.push(
        {
        id: memberIDArray[index].id,
        name: memberIDArray[index].name,
        color: colors[index+1],
        changedHrs: 0,
      });
      //if (colorCodes.length >=13) break;
    }
  } */
  

  

  console.log('colors: ', colorCodes);
  console.log('previous colors: ', prevColorCodes);

  return (
    <View style={styles.bigContainer} onLayout={onLayoutRootView}>
      <View>
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={() => setModalVisible(false)}
        >
          <View style={styles.deletePopup}>
            <Text
              style={{
                fontSize: 26,
                fontWeight: '500',
                textAlign: 'center',
                borderBottomWidth: 1,
                height: win.height * 0.05,
                width: '100%',
              }}
            >
              Edit Timeslot
            </Text>

            <TouchableOpacity onPress={toggleMemberModal}>
              <View
                style={{
                  height: win.height * 0.06,
                  width: '100%',
                  alignSelf: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ textAlign: 'center', fontSize: 20 }}>
                  {newMember}
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                if (newMember == 'Select a Member') {
                  toggleModal();
                } else {
                  toggleModal();
                  editCell(editIndex, oldMember, newMember);
                }
              }}
            >
              <View
                style={{
                  backgroundColor: '#636363',
                  height: win.height * 0.06,
                  justifyContent: 'center',
                }}
              >
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
          </View>
        </Modal>
      </View>

      <View>
        <Modal
          isVisible={isMemberModalVisible}
          onBackdropPress={() => setMemberModalVisible(false)}
        >
          <View
            style={{
              width: '50%',
              borderWidth: 1,
              marginTop: win.height * 0.3,
            }}
          >
            <View>
              <FlatList
                data={colorCodes}
                renderItem={renderMember}
                keyExtractor={(item) => item.id}
              />
            </View>
          </View>
        </Modal>
      </View>

      <View>
        <Modal
          isVisible={isConfirmationVisible}
          onBackdropPress={() => setConfirmationVisible(false)}
        >
          <ConfirmationModal type={typeOfEdit} />
        </Modal>
      </View>

      <View>
        <TouchableOpacity
          onPress={() => {
            if (weekDisplay == "Current Week") {
              setWeekDisplay("Previous Week");
              setSchedule(prevSchedule);
            } else {
              setWeekDisplay("Current Week");
              setSchedule(currSchedule);
            }
          }}
        >
          <View
            style={{
              height: 30,
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: myBtnColor
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: '500' }}>{weekDisplay}</Text>
          </View>
        </TouchableOpacity> 

        <View style={styles.buttonContainer}>
          <DayButton day='Sunday' abbrev='Sun' />
          <DayButton day='Monday' abbrev='Mon' />
          <DayButton day='Tuesday' abbrev='Tue' />
          <DayButton day='Wednesday' abbrev='Wed' />
          <DayButton day='Thursday' abbrev='Thur' />
          <DayButton day='Friday' abbrev='Fri' />
          <DayButton day='Saturday' abbrev='Sat' />
        </View>

        {weekDisplay == 'Current Week' ? (
        <View style={[styles.buttonContainer, styles.shadowProp]}>
          <TouchableOpacity
            onPress={() => {
              setTypeOfEdit('Push');
              toggleConfirmation();
            }}
          >
            <View style={[styles.topEditBtn, { backgroundColor: '#5d5d5d' }]}>
              <Text style={[styles.topEditBtnText, { color: 'white' }]}>
                Push Changes
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setTypeOfEdit('Create');
              toggleConfirmation();
            }}
          >
            <View style={[styles.topEditBtn, { backgroundColor: '#c9c9c9' }]}>
              <Text style={styles.topEditBtnText}>Create New Schedule</Text>
            </View>
          </TouchableOpacity>
        </View>
        ) : null}
      </View>
      

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.dayHeader}>{renderDay}</Text>
        <View style={{ flexDirection: 'row' }}>
          <TimeColumn />
          <DailyTable
            numberDay={numberForDay}
            numberNight={numberForNight}
            day={renderDay}
          />
        </View>
      </ScrollView>
      
      <Snackbar
        visible={isSnackVisible}
        onDismiss={() => setSnackVisible(false)}
        wrapperStyle={{ top: 0 }}
        duration={2000}
      >
        <View style={{ width: '100%' }}>
          <Text style={{ textAlign: 'center' }}>{snackMessage}</Text>
        </View>
      </Snackbar>
    </View>
  );
}

//const makeStyles = (fontScale) => StyleSheet.create({
const styles = StyleSheet.create({
  bigContainer: { flex: 1, backgroundColor: '#C2C6D0' }, //for the entire page's container
  text: { margin: 3 }, //text within cells
  timesText: {
    //text style for the side text of the list of times
    fontWeight: '800',
    fontSize: 9,
    //marginRight:6,
    width: win.width * 0.1,
    textAlign: 'center',
  },
  buttonContainer: {
    //container for the top buttons
    //flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    //for the day buttons at top of screen
    backgroundColor: '#e5e5e5',
    width: win.width / 7,
    height: 42,
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
    width: win.width * 0.5,
    backgroundColor: 'white',
    justifyContent: 'center',
    height: 40,
  },
  topEditBtnText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  confirmationPop: {
    width: '90%',
    height: 175,
    backgroundColor: '#1E3F66',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    borderRadius: 20,
    margin: 15,
  },
  confirmationHeader: {
    //style for text at the top of the popup
    fontWeight: '600',
    color: 'white',
    //height: 30,
    //borderWidth:2,
    textAlign: 'center',
    fontSize: 18,
  },
  confirmationText: {
    backgroundColor: '#2E5984',
    color: 'white',
    textAlign: 'center',
    width: '90%',
    padding: 5,
    borderRadius: 15,
  },
  confirmationBottomBtn: {
    color: 'white',
    backgroundColor: 'black',
    width: win.width * 0.5,
    borderRadius: 8,
    justifyContent: 'center',
    height: 26,
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
    width: win.width * 0.88,
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
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  btnText: {
    //Text within one cell button
    textAlign: 'center',
    color: 'black',
    fontWeight: '400',
    fontSize: 'auto',
  },
  shadowProp: {
    //shadows to apply
    shadowColor: '#171717',
    shadowOffset: { width: -3, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  deletePopup: {
    //style for the bottom screen popup for editing a cell
    alignSelf: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginTop: win.height * 0.83,
    width: win.width,
    height: win.height * 0.17,
    backgroundColor: '#C2C6D0',
  },
});

/* const [dimensions, setDimensions] = useState({ win });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ win }) => {
      setDimensions({ win });
    });
    return () => subscription?.remove();
  });

  console.log ('Dimensions: ', dimensions.win.width, 'x', dimensions.win.height); */

/* //TEST GROUP
let group = [
  "poop1", "poop2", "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ", 
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "poop0 poop5 poop2 poop11 poop1 TrueAlways ", "poop0 poop5 poop2 poop11 poop1 TrueAlways ",
  "null",
];  *


/* Old code for accessing firebase to assign color blocks to each member
  await groupRef
  .collection('members')
  .get()
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      //stores each member in colorCodes array

      let currName = doc.data().name; //gets current name in list
      let current = {
        //create new object for the current list item
        name: currName,
        color: '',
      };
      let nameExists;
      if (colorCodes.length === 0) nameExists = false;
      else {
        nameExists = colorCodes.some((e) => e.name === currName);
      }

      if (!nameExists) {
        // if not already in the colorCodes array, add to the array
        colorCodes.push(current);
      }
    });
  }); */




//const groupRef = firebase.firestore().collection("groups").doc(code);

