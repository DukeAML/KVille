import { firestore } from '../../db/firebase_config.js';
import {Person} from '../person.js';


import { getNumSlotsBetweenDates } from '../../calendarAndDates/datesUtils.js';
import { fetchHoursPerPersonInDateRange } from "../../db/hours.js";
import {scheduleAlgorithm} from '../algorithm.js';
import { EMPTY, GRACE } from '../slots/tenterSlot.js';
import { TENTING_COLORS } from '../../../data/phaseData.js';

import {availabilitiesToSlots, dayNightFree} from "./algoInputCleansing.js";
import { slotsArrToStringArr } from './algoOutputCleansing.js';

/**
 * Keith's new scheduling method with the Olson algo
 * @param {String} groupCode 
 * @param {String} tentType a string like TENTING_COLORS.BLUE, TENTING_COLORS.BLACK, or TENTING_COLORS.WHITE. I set it to TENTING_COLORS.WHITE if it is not TENTING_COLORS.BLACK or TENTING_COLORS.BLUE
 * @param {Date} startDate 30 minute granularity
 * @param {Date} endDate this method will assign tenters from the startDate to the endDate - both should have 30 minute granularity
 * @returns {String[]} groupScheduleArr, an array of strings representing the tenters assigned to EACH SLOT IN THE RANGE, NOT THE FULL SCHEDULE
 */
export async function createGroupSchedule(groupCode, tentType, startDate, endDate){

	if ((tentType != TENTING_COLORS.BLUE) && (tentType != TENTING_COLORS.BLACK)){
		tentType = TENTING_COLORS.WHITE; 
	}

	var people = new Array();
	var tenterSlotsGrid = new Array();
	var idToName = {};
	idToName[EMPTY] = EMPTY;
	idToName[GRACE] = GRACE;



	let {dayHoursPerPersonInRange, nightHoursPerPersonInRange, dayHoursPerPersonEntire, nightHoursPerPersonEntire} = await fetchHoursPerPersonInDateRange(groupCode, startDate, endDate);

	await firestore
		.collection('groups') 
		.doc(groupCode)
		.collection('members')
		.get()
		.then((groupMembers) => {
			groupMembers.forEach((tenterInGroup) => {
				var name = tenterInGroup.data().name;
				var id = tenterInGroup.id;
				idToName[id] = name;
				var fullAvailability = tenterInGroup.data().availability; //array of boolean values indicating availability
				var fullAvailabilityStartDate = tenterInGroup.data().availabilityStartDate.toDate();
				var numSlotsInRange = getNumSlotsBetweenDates(startDate, endDate);
				var rangeStartOffset = getNumSlotsBetweenDates(fullAvailabilityStartDate, startDate);
				var availabilityInRange = fullAvailability.slice(rangeStartOffset, rangeStartOffset+numSlotsInRange);
				var availabilityInRangeStartDate = startDate;


				var user_slots = availabilitiesToSlots(id, availabilityInRange, availabilityInRangeStartDate, tentType, people.length)
				tenterSlotsGrid.push(user_slots); 


				var [numFreeDaySlots, numFreeNightSlots] = dayNightFree(availabilityInRange, availabilityInRangeStartDate);
				var person = new Person(id, name, numFreeDaySlots, numFreeNightSlots, 
					dayHoursPerPersonEntire[name] - dayHoursPerPersonInRange[name], nightHoursPerPersonEntire[name] - nightHoursPerPersonInRange[name]);
				people.push(person);
			});
		});


	var newScheduleInRange = scheduleAlgorithm(people, tenterSlotsGrid);

	return slotsArrToStringArr(newScheduleInRange, idToName);
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



