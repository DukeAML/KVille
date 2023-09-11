import { firestore } from '../db/firebase_config.js';
import {Person} from './person.js';


import { getNumDaysBetweenDates, getNumSlotsBetweenDates } from '../calendarAndDates/datesUtils.js';
import { fetchHoursPerPersonInDateRange } from "../db/hours.js";
import { ScheduleAndStartDate } from './scheduleAndStartDate.js';

import {Helpers} from "./helpers.js";
import {Algorithm} from './algorithm.js';
import { EMPTY, GRACE } from './tenterSlot.js';
import { TENTING_COLORS } from '../../data/phaseData.js';


/**
 * Keith's new scheduling method with the Olson algo
 * @param {String} groupCode 
 * @param {String} tentType a string like TENTING_COLORS.BLUE, TENTING_COLORS.BLACK, or TENTING_COLORS.WHITE. I set it to TENTING_COLORS.WHITE if it is not TENTING_COLORS.BLACK or TENTING_COLORS.BLUE
 * @param {Date} startDate 30 minute granularity
 * @param {Date} endDate this method will assign tenters from the startDate to the endDate - both should have 30 minute granularity
 * @returns {String[]} groupScheduleArr, an array of strings representing the tenters assigned to EACH SLOT IN THE RANGE, NOT THE FULL SCHEDULE
 */
export async function createGroupSchedule(groupCode, tentType, startDate, endDate){
  console.log("creating group schedule from " + startDate.getTime() + " to " + endDate.getTime());

  if ((tentType != TENTING_COLORS.BLUE) && (tentType != TENTING_COLORS.BLACK)){
    tentType = TENTING_COLORS.WHITE; 
  }

  var people = new Array();
  var scheduleGrid = new Array();
  var idToName = {};
  idToName[EMPTY] = EMPTY;
  idToName[GRACE] = GRACE;



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


/**
 * 
 * @param {string} groupCode 
 * @param {string} tentType 
 * @param {Date} dateRangeStart 
 * @param {Date} dateRangeEnd 
 * @param {ScheduleAndStartDate} oldSchedule
 */
export async function assignTentersAndGetNewFullSchedule(groupCode, tentType, dateRangeStart , dateRangeEnd, oldSchedule ){
  let newScheduleInRange = await createGroupSchedule(groupCode, tentType, dateRangeStart, dateRangeEnd);
  console.log("new schedule in range is " );
  console.log(newScheduleInRange);
  let startIndex = getNumSlotsBetweenDates(oldSchedule.startDate, dateRangeStart);
  console.log("start index is " + startIndex);
  let newFullSchedule = [...oldSchedule.schedule];
  for (let i = 0; i < newScheduleInRange.length; i+= 1){
    newFullSchedule[i + startIndex] = newScheduleInRange[i];
  }
  return newFullSchedule;
}



