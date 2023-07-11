import { firestore } from './services/db/firebase_config';
import data from './data/gracePeriods.json';
import Person from './Scheduling/person';
import ScheduleAndStartDate from './Scheduling/scheduleAndStartDate';

import { getNumSlotsBetweenDates } from './services/dates_services';
import { fetchHoursPerPersonInDateRange } from './services/db_services';
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

  await firestore
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




