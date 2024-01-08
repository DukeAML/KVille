import { firestore } from "../../db/firebase_config";
import {Person} from '@/lib/schedulingAlgo/person';

import { ScheduleData } from "../../db/schedule/scheduleAndStartDate";
import { getNumSlotsBetweenDates } from "../../calendarAndDatesUtils/datesUtils";
import {scheduleAlgorithm} from "@/lib/schedulingAlgo/algorithm";
import { EMPTY, GRACE } from "../slots/tenterSlot";
import { TENTING_COLORS } from "../rules/phaseData";

import {availabilitiesToSlots, dayNightFree} from "./algoInputCleansing";
import { scheduledSlotsArrToStringArrArr } from "./algoOutputCleansing";


export async function createGroupSchedule(groupCode : string, tentType : string, startDate : Date, endDate : Date, oldSchedule : ScheduleData) : Promise<string[][]>{

	if ((tentType != TENTING_COLORS.BLUE) && (tentType != TENTING_COLORS.BLACK)){
		tentType = TENTING_COLORS.WHITE; 
	}

	var people = new Array();
	var tenterSlotsGrid = new Array();

	let inRangeHours = oldSchedule.getHoursPerPersonInDateRange(startDate, endDate);
	let fullScheduleHours = oldSchedule.getHoursPerPersonWholeSchedule();
	let dayHoursPerPersonInRange = inRangeHours.dayHoursPerPerson;
	let nightHoursPerPersonInRange = inRangeHours.nightHoursPerPerson;
	let dayHoursPerPersonEntire = fullScheduleHours.dayHoursPerPerson;
	let nightHoursPerPersonEntire = fullScheduleHours.nightHoursPerPerson;
	await firestore
		.collection('groups') 
		.doc(groupCode)
		.collection('members')
		.get()
		.then((groupMembers) => {
			groupMembers.forEach((tenterInGroup) => {
				var id = tenterInGroup.id;
				if (oldSchedule.IDToNameMap.has(id)){
					var name = oldSchedule.IDToNameMap.get(id);
					var fullAvailability = tenterInGroup.data().availability;
					var fullAvailabilityStartDate = tenterInGroup.data().availabilityStartDate.toDate();
					var numSlotsInRange = getNumSlotsBetweenDates(startDate, endDate);
					var rangeStartOffset = getNumSlotsBetweenDates(fullAvailabilityStartDate, startDate);
					var availabilityInRange = fullAvailability.slice(rangeStartOffset, rangeStartOffset+numSlotsInRange);
					var availabilityInRangeStartDate = startDate;

					var user_slots = availabilitiesToSlots(id, availabilityInRange, availabilityInRangeStartDate, tentType, people.length)
					tenterSlotsGrid.push(user_slots); 

					var {numFreeDaySlots, numFreeNightSlots} = dayNightFree(availabilityInRange, availabilityInRangeStartDate);
					var person = new Person(id, name, numFreeDaySlots, numFreeNightSlots, 
						dayHoursPerPersonEntire[name] - dayHoursPerPersonInRange[name], nightHoursPerPersonEntire[name] - nightHoursPerPersonInRange[name]);
					people.push(person);
				}
			});
		});
	var newScheduleInRange = scheduleAlgorithm(people, tenterSlotsGrid);
	return scheduledSlotsArrToStringArrArr(newScheduleInRange);
}


/**
 * 
 * @param {string} groupCode 
 * @param {string} tentType 
 * @param {Date} dateRangeStart 
 * @param {Date} dateRangeEnd 
 * @param {ScheduleData} oldSchedule
 * @returns {Promise<string[][]>}
 */
export async function assignTentersAndGetNewFullSchedule(groupCode : string, tentType : string, dateRangeStart : Date , dateRangeEnd : Date, oldSchedule : ScheduleData ) : Promise<string[][]>{
    let newScheduleInRange = await createGroupSchedule(groupCode, tentType, dateRangeStart, dateRangeEnd, oldSchedule);
    let startIndex = getNumSlotsBetweenDates(oldSchedule.startDate, dateRangeStart);
    let newFullSchedule = [...oldSchedule.schedule];
    for (let i = 0; i < newScheduleInRange.length; i+= 1){
      newFullSchedule[i + startIndex] = newScheduleInRange[i];
    }
    return newFullSchedule;
}



