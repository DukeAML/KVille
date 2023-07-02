import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import data from '../data/gracePeriods.json';
import Person from './Scheduling/person';
import ScheduleAndStartDate from './Scheduling/scheduleAndStartDate';
import { getNumSlotsBetweenDates } from '../services/dates_services';
import { fetchHoursPerPersonInDateRange } from '../services/db_services';
const Helpers = require("./Scheduling/helpers");
const Algorithm = require("./Scheduling/algorithm");

let GRACE;
const MAXBLOCK = 8; //max half hours minus one (not including current time block) person can be scheduled for

//Colors of each member, first is for 'empty'
// prettier-ignore
const colors = ['#ececec', '#3c78d8', '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9',
  '#a4c2f4' , '#fed9c9', '#b4a7d6', '#d5a6bd', '#e69138', '#6aa84f'];


/**
 * Keith's new scheduling method with the Olson algo
 * @param {String} groupCode 
 * @param {String} tentType a string like "Blue", "Black", or "White". I set it to "White" if it is not "Black" or "Blue"
 * @param {Date} startDate 30 minute granularity
 * @param {Date} endDate this method will assign tenters from the startDate to the endDate - both should have 30 minute granularity
 * @returns groupScheduleArr, an array of strings representing the tenters assigned to EACH SLOT IN THE RANGE, NOT THE FULL SCHEDULE
 */
export async function createGroupSchedule(groupCode, tentType, startDate, endDate){
  console.log("creating group schedule from " + startDate.getTime() + " to " + endDate.getTime());

  if ((tentType != "Blue") && (tentType != "Black")){
    tentType = "White"; 
  }

  var people = new Array();
  var scheduleGrid = new Array();
  var idToName = {};
  idToName['empty'] = 'empty';
  idToName['Grace'] = 'Grace';



  let {dayHoursPerPersonInRange, nightHoursPerPersonInRange, dayHoursPerPersonEntire, nightHoursPerPersonEntire} = await fetchHoursPerPersonInDateRange(groupCode, startDate, endDate);

  console.log("got past reading from fb");

  await firebase
    .firestore()
    .collection('groups') 
    .doc(groupCode)
    .collection('members')
    .get()
    .then((collSnap) => {
      collSnap.forEach((doc) => {
        var name = doc.data().name;
        var id = doc.id;
        idToName[id] = name;
        var fullAvailability = doc.data().availability; //array of boolean values indicating availability
        var fullAvailabilityStartDate = doc.data().availabilityStartDate.toDate();
        var numSlotsInRange = getNumSlotsBetweenDates(startDate, endDate);
        var rangeStartOffset = getNumSlotsBetweenDates(fullAvailabilityStartDate, startDate);
        var availabilityInRange = fullAvailability.slice(rangeStartOffset, rangeStartOffset+numSlotsInRange);
        var availabilityInRangeStartDate = startDate;


        var user_slots = Helpers.availabilitiesToSlots(id, availabilityInRange, availabilityInRangeStartDate, tentType, people.length)
        scheduleGrid.push(user_slots); 


        var [numFreeDaySlots, numFreeNightSlots] = Helpers.dayNightFree(availabilityInRange, availabilityInRangeStartDate);
        //Keith: For now, can just say dayScheduled and nightScheduled = 0
        var person = new Person(id, name, numFreeDaySlots, numFreeNightSlots, 
          dayHoursPerPersonEntire[name] - dayHoursPerPersonInRange[name], nightHoursPerPersonEntire[name] - nightHoursPerPersonInRange[name]);
        people.push(person);
      });
    });
  console.log(people);
  console.log("read members");

  var newScheduleInRange = Algorithm.schedule(people, scheduleGrid);
  console.log("created the schedule");

  //TODO 6/22: figure out how to return the right thing and what not
  
  //Keith: now need to return the array of strings
  var groupScheduleArr = [];
  for (var i = 0; i < newScheduleInRange.length; i++){
    var ids = newScheduleInRange[i].ids;
    var names = "";
    for (var j = 0; j < ids.length; j++){
      names = names + idToName[ids[j]] + " ";
    }
    if (names.endsWith(" ")){
      names = names.substring(0, names.length -1);
    }
    groupScheduleArr.push(names);
  }


  return groupScheduleArr;

}



export async function createGroupScheduleOriginal(groupCode, tentType, weekNum) {
  let numDay;
  let numNight;
  GRACE = data[weekNum];
  let graceTrue = false;
  let currGraceVal;

  //based on the current tentType, adjust # of people needed in tent for day and night hours
  //correspondingly
  switch (tentType) {
    case 'Black':
      numDay = 2;
      numNight = 10;
      break;
    case 'Blue':
      numDay = 1;
      numNight = 6;
      break;
    default:
      numDay = 1;
      numNight = 2;
  }

  //Initialize array of objects (memberArr), group schedule array, and previous members
  //(members who had the last iteration of shifts)
  let memberArr = new Array();
  let groupScheduleArr = new Array(336);
  let prevMember1 = null;
  let prevMember2 = null;

  //initialize member IDs array for updating hrs and colors
  let memberIDs = [{ id: '12345', name: 'empty', color: '#ececec', changedHrs: 0 },
                   {id: '6789', name: 'Grace', color:'#3c78d8', changedHrs:0}];

  //****input grace periods in groupScheduleArr, "GRACE" at each index****

  //adds each member as an object to the memberArr
  await firebase
    .firestore()
    .collection('groups') //UPDATE THIS TO 'groups' in real cases ******!!!
    //.collection('groupsTest')
    .doc(groupCode)
    .collection('members')
    .get()
    .then((collSnap) => {
      collSnap.forEach((doc) => {
        //array of boolean values indicating availability
        let availability = doc.data().availability;
        let name = doc.data().name;
        let hours = 0;
        let consecutive = 0;
        let id = doc.id;
        let shifts = new Array(336);
        shifts.fill(false);

        //member name and id object (used to update hrs in schedule page)
        let member = {
          id,
          name,
          color: '',
          changedHrs: 0,
        };

        memberIDs.push(member);

        //member object
        let current = {
          name,
          hours, //normalized by the half hour
          availability, //array of 336 booleans
          consecutive,
          id,
          shifts, //# of 30min shifts done consecutively
        };
        ////console.log("Current member object", current);
        memberArr.push(current); //add member to array
      });
    });
  
  if (memberArr.length == 1) {
    throw 'Not enough members';
  }

  //promise to make sure all members are added before trying to read them

  //console.log("tent type", tentType, numDay, numNight);

  //** FOR LOOP TO CREATE GROUP SCHEDULE
  //total of 336 half hours in a weekNum (48*7)
  for (let time = 0; time < 336; time++) {
    //iterate each half hour index of group schedule

    //Check if the given index is a grace shift
    if (time.toString() in GRACE){
      graceTrue = true;
      groupScheduleArr[time] = 'Grace';
      currGraceVal = GRACE[time.toString()];
      console.log('current grace value', currGraceVal);
      continue;
    } 
    else if (currGraceVal == time) {
      graceTrue = false;
    }
    else if (graceTrue){
      groupScheduleArr[time] = 'Grace';
      console.log('current grace value', currGraceVal);
      continue;
    }
    
    

    //**FOR NIGHT TIME SHIFTS ONLY
    //night time (starts at 1am-7am), so index 2 to 13
    if (time % 48 == 2) {
      //if night time, add the entire section as a block

      sortMembers(time, memberArr); //sorts so lowest hours and available members go first
      console.log('memberArr', memberArr);

      //checks if the previous shift is still available
      //If they are, shift their positions in the array to the beginning
      if (prevMember1.availability[time]) {
        let idxOfUsr = memberArr.findIndex((element) => element == prevMember1);

        memberArr.splice(idxOfUsr, 1);
        memberArr.unshift(prevMember1);
        //console.log('member array at night', memberArr);
      }
      if (numDay == 2) {
        if (prevMember2.availability[time]) {
          let idxOfUsr = memberArr.findIndex((element) => element == prevMember2);

          memberArr.splice(idxOfUsr, 1);
          memberArr.unshift(prevMember2);
          //console.log('member array at night', memberArr);
        }
      }

      //indexes for all 12 half hours of night shift (from index 2 to index 13)
      for (let nightHour = 0; nightHour < 12; nightHour++) {
        //depending on how many are needed for each night (10 for 'black', 6 for 'blue', etc), index through each
        for (let memberIdx = 0; memberIdx < numNight; memberIdx++) {
          //if first member in sorted array and is available, set index of group array to that member
          if (memberIdx == 0 && memberArr[0].availability[time]) {
            groupScheduleArr[nightHour + time] = memberArr[0].name;
            memberArr[0].shifts[nightHour + time] = true;
            memberArr[0].hours++;
          } else if (memberIdx < memberArr.length && memberArr[memberIdx].availability[time]) {
            //for each next member, if available add to group schedule array
            groupScheduleArr[nightHour + time] += ' ' + memberArr[memberIdx].name;
            memberArr[memberIdx].shifts[nightHour + time] = true;
            memberArr[memberIdx].hours++;
          } else {
            //otherwise, input empty to that empty spot
            groupScheduleArr[nightHour + time] += ' empty';
          }
        }
      }
      time += 11; //adjust index to move forward to 7am (index 14)
      continue;
    }

    //***ALL REMAINING CODE DEALS WITH DAYTIME SHIFTS ONLY***

    //deals with blocking so members have consecutive shifts of 30 min
    if (prevMember1 && prevMember2) {
      //if previous shifts were not 'empty' continue
      //switches prev1 and prev2 if first person is not available and second person is for the new time so that only have to consider one case

      //console.log(time + ': ' + prevMember1.name + ' consecutive hours '  + prevMember1.consecutive + ' with ' + prevMember1.hours + ' scheduled');
      //console.log(time + ': ' + prevMember2.name + ' consecutive hours '  + prevMember2.consecutive + ' with ' + prevMember2.hours + ' scheduled');
      if (prevMember1.availability[time] && prevMember1.consecutive < MAXBLOCK) {
        //If prev1 is available, add them in. Otherwise, resort and add next available person
        groupScheduleArr[time] = prevMember1.name;
        prevMember1.shifts[time] = true;
        prevMember1.hours++;
        prevMember1.consecutive++;
      } else {
        prevMember1.consecutive = 0;
        sortMembers(time, memberArr); //sort array by total hours and availability

        if (numDay == 2 && memberArr[0] == prevMember2) {
          if (memberArr[1].availability[time]) {
            //if index 1 is available add that instead
            groupScheduleArr[time] = memberArr[1].name;
            memberArr[1].shifts[time] = true;
            memberArr[1].hours++;
            //memberArr[1].consecutive++;
            prevMember1 = memberArr[1];
          } else {
            //otherwise no one is available and add empty
            groupScheduleArr[time] = 'empty';
          }
        } else {
          //If the first index does not equal the previous1 member
          if (memberArr[0].availability[time]) {
            //then add the first index instead
            groupScheduleArr[time] = memberArr[0].name;
            memberArr[0].shifts[time] = true;
            memberArr[0].hours++;
            //memberArr[0].consecutive++;
            prevMember1 = memberArr[0];
          } else {
            //if not available, no one is available so add empty
            groupScheduleArr[time] = 'empty';
          }
        }
      }

      //if(numDay==1) continue;

      if (numDay == 2) {
        if (prevMember2.availability[time] && prevMember2.consecutive < MAXBLOCK) {
          //If prev2 is available, add them in. Otherwise, resort and add next available person
          groupScheduleArr[time] += ' ' + prevMember2.name;
          prevMember2.shifts[time] = true;
          prevMember2.hours++;
          prevMember2.consecutive++;
        } else {
          prevMember2.consecutive = 0;
          sortMembers(time, memberArr); //sort array by total hours and availability
          ////console.log("members array", memberArr);
          if (memberArr[0] == prevMember1) {
            if (memberArr[1].availability[time]) {
              //if index 1 is available add that instead
              groupScheduleArr[time] += ' ' + memberArr[1].name;
              memberArr[1].shifts[time] = true;
              memberArr[1].hours++;
              prevMember2 = memberArr[1];
            } else {
              //otherwise no one is available and add empty
              groupScheduleArr[time] += ' empty';
            }
          } else {
            //If the first index does not equal the previous1 member
            if (memberArr[0].availability[time]) {
              //then add the first index instead
              groupScheduleArr[time] += ' ' + memberArr[0].name;
              memberArr[0].shifts[time] = true;
              memberArr[0].hours++;
              prevMember2 = memberArr[0];
            } else {
              //if not available, no one is available so add empty
              groupScheduleArr[time] += ' empty';
            }
          }
        }
      }

      continue;
      //might need to set prevMember2.consecutive, if tenttype is black
    }

    sortMembers(time, memberArr); //sort array by total hours and availability
    ////console.log("members array", memberArr);
    if (memberArr[0].availability[time]) {
      //if first index is available, add to current block in group schedule
      groupScheduleArr[time] = memberArr[0].name;
      memberArr[0].shifts[time] = true;
      memberArr[0].hours++;
    } else {
      //otherwise, add empty
      groupScheduleArr[time] = 'empty';
    }
    if (numDay == 2) {
      if (memberArr[1].availability[time]) {
        //if black tent, add next available person
        groupScheduleArr[time] += ' ' + memberArr[1].name;
        memberArr[1].shifts[time] = true;
        memberArr[1].hours++;
      } else if (!memberArr[1].availability[time]) {
        groupScheduleArr[time] += ' ' + 'empty';
      }
    }
    prevMember1 = memberArr[0]; //set previous variables to current block holders before iterating again
    prevMember2 = memberArr[1];
  } //end of large for loop

  let equalHours;
  for (let i = 0; i < memberArr.length; i++) {
    //print hours to check for equal hours
    if (i == 0) equalHours = memberArr[0].name + ' ' + memberArr[0].hours + ' | ';
    else equalHours += memberArr[i].name + ' ' + memberArr[i].hours + ' | ';
    ////console.log(memberArr[i].name, memberArr[i].hours);
  }
  //console.log(equalHours);
  //});
  
  //to update the number of scheduled hours and shifts for each member
  for (let i = 0; i < memberArr.length; i++) {
    firebase
      .firestore()
      .collection('groups') //UPDATE THIS TO 'groups' in real cases ******!!!
      //.collection('groupsTest')
      .doc(groupCode)
      .collection('members')
      .doc(memberArr[i].id)
      .update({
        scheduledHrs: memberArr[i].hours / 2,
        shifts: memberArr[i].shifts,
      });
  }

  //To update memberArr in group with their unique id and name that corresponds with the schedule
  for (let index = 1; index < memberIDs.length; index++) {
    memberIDs[index].color = colors[index];
  }
  //console.log(memberIDs);
  firebase.firestore().collection('groups').doc(groupCode).update({
    memberArr: memberIDs,
  });
  
  // firebase
  //   .firestore()
  //   .collection('groups') //UPDATE THIS TO 'groups' in real cases ******!!!
  //   //.collection('groupsTest')
  //   .doc(groupCode)
  //   .collection('members')
  //   .get()
  //   .then((collSnap) => {
  //     collSnap.forEach((doc) => {
  //       let currId = doc.id;
  //       let indexOfUser;
  //       if (memberArr.some((e) => e.id === currId)) {
  //         //if Name is in member array
  //         indexOfUser = memberArr.findIndex((member) => member.id === currId);
  //       }

  //       //console.log( 'hours of ',currId,' is ', memberArr[indexOfUser].hours);

  //       doc.ref.update({
  //         scheduledHrs: memberArr[indexOfUser].hours / 2,
  //       });
  //     });
  //     return collSnap;
  //   });

  // .then((collSnap) => {
  //

  // });

  return groupScheduleArr; //return group schedule array

  //FINAL ARRAY TAKES THE FORMAT OF:

  //   ['member1 member2', 'member1 member2',  'member1 member2 member3 member4 member5 member6 member7 ...'] for black tent
  //   ['member1 ', 'member1 ',  'member1 member2 member3 member4 member5 member6 '] for blue tent, etc
  // index of array indicates the half hour block of the weekNum
  /* (ex.) Index 0 is sunday 12:00 - 12:30am
              Index 165 is Wednesday 10:30-11:am
                  Must do 165%48 = 3, so 4th day and 165%48 = 21 so 21st half hour (10:30am) */

  //Helper Methods

  //sorts member array by total hours in ascending order
  //then sorts by availibility, people who are availible go first
  function sortMembers(idx, array) {
    array.sort((a, b) => a.hours - b.hours);
    array.sort((a, b) => Number(b.availability[idx]) - Number(a.availability[idx]));
  }
}
