import {Person} from '@/lib/schedulingAlgo/person';

import { ScheduleData } from "@/lib/controllers/scheduleData";
import { getNumSlotsBetweenDates } from "../../calendarAndDatesUtils/datesUtils";
import {scheduleAlgorithm} from "@/lib/schedulingAlgo/algorithm";
import { TenterSlot } from "../slots/tenterSlot";
import { TENTING_COLORS } from "../rules/phaseData";

import { scheduledSlotsArrToStringArrArr } from "./algoOutputCleansing";
import { scheduleDataToJson } from "@/lib/controllers/scheduleController";


export async function createGroupSchedule(groupCode : string, tentType : string, startDate : Date, endDate : Date, oldSchedule : ScheduleData) : Promise<string[][]>{

	if ((tentType != TENTING_COLORS.BLUE) && (tentType != TENTING_COLORS.BLACK)){
		tentType = TENTING_COLORS.WHITE; 
	}

	const apiResponse = await fetch("/api/availability/" + groupCode + "/fetchSchedulingAlgoInputs", {
        method: "POST",
        body : JSON.stringify({
			oldSchedule : scheduleDataToJson(oldSchedule),
			startDate : startDate.getTime(),
			endDate : endDate.getTime(),
			tentType : tentType
		}),
        headers: {
            "Content-Type": "application/json",
        },
    });
    let resJson = await apiResponse.json();
    if (apiResponse.status > 300){
		throw new Error("An error occurred");
    } 
	let people = resJson.people.map((person : JSONPerson) => JSONToPerson(person));
	let tenterSlotsGrid = resJson.tenterSlotsGrid.map((slotsForTenter : JSONTenterSlot[]) => slotsForTenter.map((slot) => JSONToTenterSlot(slot)));
	var newScheduleInRange = scheduleAlgorithm(people, tenterSlotsGrid);
	return scheduledSlotsArrToStringArrArr(newScheduleInRange);
}

interface JSONPerson {
	dayFree : number;
	nightFree : number;
	dayScheduled : number;
	nightScheduled : number;
	name : string;
	id : string;
}
export const personToJSON = (person : Person) : JSONPerson => {
	return {
		dayFree : person.dayFree,
		nightFree : person.nightFree,
		dayScheduled : person.dayScheduled,
		nightScheduled : person.nightScheduled,
		name : person.name,
		id : person.id,
	}
}

export const JSONToPerson = (person : JSONPerson) : Person => {
	return new Person(person.id, person.name, person.dayFree, person.nightFree, person.dayScheduled, person.nightScheduled);
}

interface JSONTenterSlot{
	personID : string;
	startDate : number;
	tentType : string;
	status : string;
	timeIndex : number;
	personIndex : number;
}

export const tenterSlotToJSON = (slot : TenterSlot) : JSONTenterSlot => {
	return {
		personID : slot.personID,
		startDate : slot.startDate.getTime(),
		tentType : slot.tentType,
		status : slot.status,
		timeIndex : slot.timeIndex,
		personIndex : slot.personIndex
	}
}

export const JSONToTenterSlot = (slot : JSONTenterSlot) : TenterSlot => {
	return new TenterSlot(slot.personID, new Date(slot.startDate), slot.tentType, slot.status, slot.timeIndex, slot.personIndex);
}

export async function assignTentersAndGetNewFullSchedule(groupCode : string, tentType : string, dateRangeStart : Date , dateRangeEnd : Date, oldSchedule : ScheduleData ) : Promise<string[][]>{
    let newScheduleInRange = await createGroupSchedule(groupCode, tentType, dateRangeStart, dateRangeEnd, oldSchedule);
    let startIndex = getNumSlotsBetweenDates(oldSchedule.startDate, dateRangeStart);
    let newFullSchedule = [...oldSchedule.schedule];
    for (let i = 0; i < newScheduleInRange.length; i+= 1){
      newFullSchedule[i + startIndex] = newScheduleInRange[i];
    }
    return newFullSchedule;
}



